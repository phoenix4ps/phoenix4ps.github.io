/* Copyright (C) 2023-2025 anonymous

This file is part of PSFree.

PSFree is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

PSFree is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.  */

import { Int, lohi_from_one } from './int64.js';
import { get_view_vector } from './memtools.js';
import { Addr } from './mem.js';
import * as config from '../js/config.js';

// put the sycall names that you want to use here
export const syscall_map = new Map(Object.entries({
    'read' : 3,
    'write' : 4,
    'open' : 5,
    'close' : 6,
    'getpid' : 20,
    'setuid' : 23,
    'getuid' : 24,
    'accept' : 30,
    'pipe' : 42,
    'ioctl' : 54,
    'munmap' : 73,
    'mprotect' : 74,
    'fcntl' : 92,
    'socket' : 97,
    'connect' : 98,
    'bind' : 104,
    'setsockopt' : 105,
    'listen' : 106,
    'getsockopt' : 118,
    'fchmod' : 124,
    'socketpair' : 135,
    'fstat' : 189,
    'getdirentries' : 196,
    '__sysctl' : 202,
    'mlock' : 203,
    'clock_gettime' : 232,
    'nanosleep' : 240,
    'sched_yield' : 331,
    'kqueue' : 362,
    'kevent' : 363,
    'rtprio_thread' : 466,
    'mmap' : 477,
    'ftruncate' : 480,
    'shm_open' : 482,
    'cpuset_getaffinity' : 487,
    'cpuset_setaffinity' : 488,
    'jitshm_create' : 533,
    'jitshm_alias' : 534,
    'evf_create' : 538,
    'evf_delete' : 539,
    'evf_set' : 544,
    'evf_clear' : 545,
    'set_vm_container' : 559,
    'dmem_container' : 586,
    'dynlib_dlsym' : 591,
    'dynlib_get_list' : 592,
    'dynlib_get_info' : 593,
    'dynlib_load_prx' : 594,
    'randomized_path' : 602,
    'budget_get_ptype' : 610,
    'thr_suspend_ucontext' : 632,
    'thr_resume_ucontext' : 633,
    'blockpool_open' : 653,
    'blockpool_map' : 654,
    'blockpool_unmap' : 655,
    'blockpool_batch' : 657,
    // syscall 661 is unimplemented so free for use. a kernel exploit will
    // install "kexec" here
    'aio_submit' : 661,
    'kexec' : 661,
    'aio_multi_delete' : 662,
    'aio_multi_wait' : 663,
    'aio_multi_poll' : 664,
    'aio_multi_cancel' : 666,
    'aio_submit_cmd' : 669,
    'blockpool_move' : 673,
}));

const argument_pops = [
    'pop rdi; ret',
    'pop rsi; ret',
    'pop rdx; ret',
    'pop rcx; ret',
    'pop r8; ret',
    'pop r9; ret',
];

// implementations are expected to have these gadgets:
// * libSceLibcInternal:
//   * __errno - FreeBSD's function to get the location of errno
//   * setcontext - what we call Sony's own version of _Ux86_64_setcontext
//   * getcontext - what we call Sony's own version of _Ux86_64_getcontext
// * anywhere:
//   * the gadgets at argument_pops
//   * ret
//
// setcontext/getcontext naming came from this project:
// https://github.com/libunwind/libunwind
//
// setcontext(context *ctx):
//     mov     rax, qword [rdi + 0x38]
//     sub     rax, 0x10 ; 16
//     mov     qword [rdi + 0x38], rax
//     mov     rbx, qword [rdi + 0x20]
//     mov     qword [rax], rbx
//     mov     rbx, qword [rdi + 0x80]
//     mov     qword [rax + 8], rbx
//     mov     rax, qword [rdi]
//     mov     rbx, qword [rdi + 8]
//     mov     rcx, qword [rdi + 0x10]
//     mov     rdx, qword [rdi + 0x18]
//     mov     rsi, qword [rdi + 0x28]
//     mov     rbp, qword [rdi + 0x30]
//     mov     r8, qword [rdi + 0x40]
//     mov     r9, qword [rdi + 0x48]
//     mov     r10, qword [rdi + 0x50]
//     mov     r11, qword [rdi + 0x58]
//     mov     r12, qword [rdi + 0x60]
//     mov     r13, qword [rdi + 0x68]
//     mov     r14, qword [rdi + 0x70]
//     mov     r15, qword [rdi + 0x78]
//     cmp     qword [rdi + 0xb0], 0x20001
//     jne     done
//     cmp     qword [rdi + 0xb8], 0x10002
//     jne     done
//     fxrstor [rdi + 0xc0]
// done:
//     mov     rsp, qword [rdi + 0x38]
//     pop     rdi
//     ret
//
//  getcontext(context *ctx):
//     mov     qword [rdi], rax
//     mov     qword [rdi + 8], rbx
//     mov     qword [rdi + 0x10], rcx
//     mov     qword [rdi + 0x18], rdx
//     mov     qword [rdi + 0x20], rdi
//     mov     qword [rdi + 0x28], rsi
//     mov     qword [rdi + 0x30], rbp
//     mov     qword [rdi + 0x38], rsp
//     add     qword [rdi + 0x38], 8
//     mov     qword [rdi + 0x40], r8
//     mov     qword [rdi + 0x48], r9
//     mov     qword [rdi + 0x50], r10
//     mov     qword [rdi + 0x58], r11
//     mov     qword [rdi + 0x60], r12
//     mov     qword [rdi + 0x68], r13
//     mov     qword [rdi + 0x70], r14
//     mov     qword [rdi + 0x78], r15
//     mov     rsi, qword [rsp]
//     mov     qword [rdi + 0x80], rsi
//     fxsave  [rdi + 0xc0]
//     mov     qword [rdi + 0xb0], 0x20001
//     mov     qword [rdi + 0xb8], 0x10002
//     xor     eax, eax
//     ret

// ROP chain manager base class
//
// Args:
//   stack_size: the size of the stack
//   upper_pad: the amount of extra space above stack
export class ChainBase {
    constructor(stack_size=0x1000, upper_pad=0x10000) {
        this._is_dirty = false;
        this.position = 0;

        const return_value = new Uint32Array(4);
        this._return_value = return_value;
        this.retval_addr = get_view_vector(return_value);

        const errno = new Uint32Array(1);
        this._errno = errno;
        this.errno_addr = get_view_vector(errno);

        const full_stack_size = upper_pad + stack_size;
        const stack_buffer = new ArrayBuffer(full_stack_size);
        const stack = new DataView(stack_buffer, upper_pad);
        this.stack = stack;
        this.stack_addr = get_view_vector(stack);
        this.stack_size = stack_size;
        this.full_stack_size = full_stack_size;
    }

    empty() {
        this.position = 0;
    }

    get is_dirty() {
        return this._is_dirty;
    }

    clean() {
        this._is_dirty = false;
    }

    dirty() {
        this._is_dirty = true;
    }

    check_allow_run() {
        if (this.position === 0) {
            throw Error('chain is empty');
        }
        if (this.is_dirty) {
            throw Error('chain already ran, clean it first');
        }
    }

    reset() {
        this.empty();
        this.clean();
    }

    get retval_int() {
        return this._return_value[0] | 0;
    }

    get retval() {
        return new Int(this._return_value[0], this._return_value[1]);
    }

    get retval_ptr() {
        return new Addr(this._return_value[0], this._return_value[1]);
    }

    set retval(value) {
        const values = lohi_from_one(value);
        const retval = this._return_value;
        retval[0] = values[0];
        retval[1] = values[1];
    }

    get retval_all() {
        const retval = this._return_value;
        return [new Int(retval[0], retval[1]), new Int(retval[2], retval[3])];
    }

    set retval_all(values) {
        const [a, b] = [lohi_from_one(values[0]), lohi_from_one(values[1])];
        const retval = this._return_value;
        retval[0] = a[0];
        retval[1] = a[1];
        retval[2] = b[0];
        retval[3] = b[1];
    }

    get errno() {
        return this._errno[0];
    }

    set errno(value) {
        this._errno[0] = value;
    }

    push_value(value) {
        const position = this.position;
        if (position >= this.stack_size) {
            throw Error(`no more space on the stack, pushed value: ${value}`);
        }

        const values = lohi_from_one(value);
        const stack = this.stack;
        stack.setUint32(position, values[0], true);
        stack.setUint32(position + 4, values[1], true);

        this.position += 8;
    }

    get_gadget(name) {
        const addr = this.gadget_map.get(name);
        if (addr === undefined) {
            throw Error(`gadget not found: ${name}`);
        }
        return addr;
    }
}
