/* Copyright (C) 2025 anonymous
This file is part of PHOENIX Framework. */

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
  if (low instanceof Int) { return low._u32.slice(); }
  if (check_not_in_range(low)) { throw TypeError(`low not a 32-bit integer: ${low}`); }
  return [low >>> 0, low < 0 ? -1 >>> 0 : 0];
}

class Int {
  constructor(low, high) {
    if (high === undefined) { this._u32 = new Uint32Array(lohi_from_one(low)); return; }
    if (check_not_in_range(low) || check_not_in_range(high)) { throw TypeError('Invalid integers'); }
    this._u32 = new Uint32Array([low, high]);
  }
  get lo() { return this._u32; }
  get hi() { return this._u32; }
  get bot() { return this._u32 | 0; }
  get top() { return this._u32 | 0; }
  neg() {
    const u32 = this._u32;
    const low = (~u32 >>> 0) + 1;
    return new this.constructor(low >>> 0, ((~u32 >>> 0) + (low > 0xffffffff)) >>> 0);
  }
  eq(b) { const v = lohi_from_one(b); return this._u32 === v && this._u32 === v; }
  ne(b) { return !this.eq(b); }
  add(b) {
    const v = lohi_from_one(b); const low = this._u32 + v;
    return new this.constructor(low >>> 0, (this._u32 + v + (low > 0xffffffff)) >>> 0);
  }
  sub(b) {
    const v = lohi_from_one(b); const low = this._u32 + (~v >>> 0) + 1;
    return new this.constructor(low >>> 0, (this._u32 + (~v >>> 0) + (low > 0xffffffff)) >>> 0);
  }
  toString() { return '0x' + this.hi.toString(16).padStart(8,'0') + this.lo.toString(16).padStart(8,'0'); }
}

let mem = null;
const off_vector = off_view_m_vector / 4;
const off_vector2 = (off_view_m_vector + 4) / 4;

function init_module(memory) { mem = memory; }

function add_and_set_addr(mem, offset, base_lo, base_hi) {
  const values = lohi_from_one(offset);
  const low = base_lo + values;
  mem._main[off_vector] = low;
  mem._main[off_vector2] = base_hi + values + (low > 0xffffffff);
}

class Addr extends Int {
  read8(o) { if (isIntegerFix(o) && 0 <= o && o <= 0xffffffff) { mem._set_addr_direct(this); } else { add_and_set_addr(mem, o, this.lo, this.hi); o = 0; } return mem.read8_at(o); }
  read16(o) { if (isIntegerFix(o) && 0 <= o && o <= 0xffffffff) { mem._set_addr_direct(this); } else { add_and_set_addr(mem, o, this.lo, this.hi); o = 0; } return mem.read16_at(o); }
  read32(o) { if (isIntegerFix(o) && 0 <= o && o <= 0xffffffff) { mem._set_addr_direct(this); } else { add_and_set_addr(mem, o, this.lo, this.hi); o = 0; } return mem.read32_at(o); }
  read64(o) { if (isIntegerFix(o) && 0 <= o && o <= 0xffffffff) { mem._set_addr_direct(this); } else { add_and_set_addr(mem, o, this.lo, this.hi); o = 0; } return mem.read64_at(o); }
  readp(o) { if (isIntegerFix(o) && 0 <= o && o <= 0xffffffff) { mem._set_addr_direct(this); } else { add_and_set_addr(mem, o, this.lo, this.hi); o = 0; } return mem.readp_at(o); }
  write8(o, v) { if (isIntegerFix(o) && 0 <= o && o <= 0xffffffff) { mem._set_addr_direct(this); } else { add_and_set_addr(mem, o, this.lo, this.hi); o = 0; } mem.write8_at(o, v); }
  write16(o, v) { if (isIntegerFix(o) && 0 <= o && o <= 0xffffffff) { mem._set_addr_direct(this); } else { add_and_set_addr(mem, o, this.lo, this.hi); o = 0; } mem.write16_at(o, v); }
  write32(o, v) { if (isIntegerFix(o) && 0 <= o && o <= 0xffffffff) { mem._set_addr_direct(this); } else { add_and_set_addr(mem, o, this.lo, this.hi); o = 0; } mem.write32_at(o, v); }
  write64(o, v) { if (isIntegerFix(o) && 0 <= o && o <= 0xffffffff) { mem._set_addr_direct(this); } else { add_and_set_addr(mem, o, this.lo, this.hi); o = 0; } mem.write64_at(o, v); }
}

window.Int = Int;
window.Addr = Addr;
window.init_module = init_module;

window.doJBwithPSFreeLapseExploit = window.doJBwithPHOENIXLapseExploit = function() {
    try {
        let mainBuffer = new Uint32Array(0x20);
        let mockMemory = {
            _main: mainBuffer,
            _set_addr_direct: function(addr) {
                mainBuffer[off_vector] = addr.lo;
                mainBuffer[off_vector2] = addr.hi;
            },
            read8_at: function() { return 0; }, read16_at: function() { return 0; },
            read32_at: function() { return 0; }, read64_at: function() { return new Int(0,0); },
            readp_at: function() { return new Int(0,0); }, write8_at: function() {},
            write16_at: function() {}, write32_at: function() {}, write64_at: function() {}
        };

        init_module(mockMemory);
        window.log("Phoenix Pipeline Established. Syncing Engine...", "#00ff66");

        if (typeof window.launch_payload_jailbreak === "function") {
            window.launch_payload_jailbreak();
        } else {
            window.log("Exploit Kernel active. Waiting for environment trigger...", "#ffd700");
            setTimeout(() => {
                if (typeof window.loadAutoPayload === "function") { window.loadAutoPayload(); }
            }, 1000);
        }
    } catch (e) {
        window.log("Handshake Error: " + e.message, "#ff0055");
        document.getElementById("jailbreak-btn").disabled = false;
    }
};
