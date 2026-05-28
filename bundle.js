/* Copyright (C) 2025 anonymous

This file is part of PHOENIX Framework.

PHOENIX is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

PHOENIX is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://gnu.org>.  */

const off_js_cell = 0;
const off_js_butterfly = 0x8;
const off_js_inline_prop = 0x10;
const off_size_jsobj = 0x10;
const off_view_m_vector = 0x10;
const off_view_m_length = 0x18;
const off_view_m_mode = 0x1c;
const off_size_view = 0x20;
const off_strimpl_strlen = 4;
const off_strimpl_m_data = 8;
const off_strimpl_inline_str = 0x14;
const off_size_strimpl = 0x18;
const off_jsta_impl = 0x18;
const off_size_jsta = 0x20;
const off_context_size = 0xc8;

function isIntegerFix(x) {
  if (typeof x !== 'number') return 0;
  if (!isFinite(x)) return 0;
  if (Math.floor(x) !== x) return 0;
  return 1;
}

function check_not_in_range(x) {
  if (typeof x !== 'number') return 1;
  if (!isFinite(x)) return 1;
  if (Math.floor(x) !== x) return 1;
  if (x < (-0x80000000)) return 1;
  if (x > 0xffffffff) return 1;
  return 0;
}

function lohi_from_one(low) {
  if (low instanceof Int) {
    return low._u32.slice();
  }
  if (check_not_in_range(low)) {
    throw TypeError(`low not a 32-bit integer: ${low}`);
  }
  return [low >>> 0, low < 0 ? -1 >>> 0 : 0];
}

class Int {
  constructor(low, high) {
    if (high === undefined) {
      this._u32 = new Uint32Array(lohi_from_one(low));
      return;
    }
    if (check_not_in_range(low)) {
      throw TypeError(`low not a 32-bit integer: ${low}`);
    }
    if (check_not_in_range(high)) {
      throw TypeError(`high not a 32-bit integer: ${high}`);
    }
    this._u32 = new Uint32Array([low, high]);
  }
  get lo() {
    return this._u32;
  }
  get hi() {
    return this._u32;
  }
  get bot() {
    return this._u32 | 0;
  }
  get top() {
    return this._u32 | 0;
  }
  neg() {
    const u32 = this._u32;
    const low = (~u32 >>> 0) + 1;
    return new this.constructor(
      low >>> 0,
      ((~u32 >>> 0) + (low > 0xffffffff)) >>> 0
    );
  }
  eq(b) {
    const values = lohi_from_one(b);
    const u32 = this._u32;
    return (
      u32 === values
      && u32 === values
    );
  }
  ne(b) {
    return !this.eq(b);
  }
  add(b) {
    const values = lohi_from_one(b);
    const u32 = this._u32;
    const low = u32 + values;
    return new this.constructor(
        low >>> 0,
        (u32 + values + (low > 0xffffffff)) >>> 0
    );
  }
  sub(b) {
    const values = lohi_from_one(b);
    const u32 = this._u32;
    const low = u32 + (~values >>> 0) + 1;
    return new this.constructor(
      low >>> 0,
      (u32 + (~values >>> 0) + (low > 0xffffffff)) >>> 0
    );
  }
  toString(is_pretty=false) {
    const low = this.lo.toString(16).padStart(8, '0');
    const high = this.hi.toString(16).padStart(8, '0');
    return '0x' + high + low;
  }
}

let mem = null;
const off_vector = off_view_m_vector / 4;
const off_vector2 = (off_view_m_vector + 4) / 4;

function init_module(memory) {
  mem = memory;
}

function add_and_set_addr(mem, offset, base_lo, base_hi) {
  const values = lohi_from_one(offset);
  const main = mem._main;
  const low = base_lo + values;
  main[off_vector] = low;
  main[off_vector2] = base_hi + values + (low > 0xffffffff);
}

class Addr extends Int {
  read8(offset) { const m = mem; if (isIntegerFix(offset) && 0 <= offset && offset <= 0xffffffff) { m._set_addr_direct(this); } else { add_and_set_addr(m, offset, this.lo, this.hi); offset = 0; } return m.read8_at(offset); }
  read16(offset) { const m = mem; if (isIntegerFix(offset) && 0 <= offset && offset <= 0xffffffff) { m._set_addr_direct(this); } else { add_and_set_addr(m, offset, this.lo, this.hi); offset = 0; } return m.read16_at(offset); }
  read32(offset) { const m = mem; if (isIntegerFix(offset) && 0 <= offset && offset <= 0xffffffff) { m._set_addr_direct(this); } else { add_and_set_addr(m, offset, this.lo, this.hi); offset = 0; } return m.read32_at(offset); }
  read64(offset) { const m = mem; if (isIntegerFix(offset) && 0 <= offset && offset <= 0xffffffff) { m._set_addr_direct(this); } else { add_and_set_addr(m, offset, this.lo, this.hi); offset = 0; } return m.read64_at(offset); }
  readp(offset) { const m = mem; if (isIntegerFix(offset) && 0 <= offset && offset <= 0xffffffff) { m._set_addr_direct(this); } else { add_and_set_addr(m, offset, this.lo, this.hi); offset = 0; } return m.readp_at(offset); }
  write8(offset, value) { const m = mem; if (isIntegerFix(offset) && 0 <= offset && offset <= 0xffffffff) { m._set_addr_direct(this); } else { add_and_set_addr(m, offset, this.lo, this.hi); offset = 0; } m.write8_at(offset, value); }
  write16(offset, value) { const m = mem; if (isIntegerFix(offset) && 0 <= offset && offset <= 0xffffffff) { m._set_addr_direct(this); } else { add_and_set_addr(m, offset, this.lo, this.hi); offset = 0; } m.write16_at(offset, value); }
  write32(offset, value) { const m = mem; if (isIntegerFix(offset) && 0 <= offset && offset <= 0xffffffff) { m._set_addr_direct(this); } else { add_and_set_addr(m, offset, this.lo, this.hi); offset = 0; } m.write32_at(offset, value); }
  write64(offset, value) { const m = mem; if (isIntegerFix(offset) && 0 <= offset && offset <= 0xffffffff) { m._set_addr_direct(this); } else { add_and_set_addr(m, offset, this.lo, this.hi); offset = 0; } m.write64_at(offset, value); }
}
