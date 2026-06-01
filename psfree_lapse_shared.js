// PSFree & Lapse Shared Variables & Subroutines

var off_js_butterfly = 0x8;
var off_js_inline_prop = 0x10;
var off_view_m_vector = 0x10;
var off_view_m_length = 0x18;
var off_view_m_mode = 0x1c;
var off_vector = 0x04;
var off_vector2 = 0x05;
var off_strimpl_strlen = 4;
var off_strimpl_m_data = 8;
var off_strimpl_inline_str = 0x14;
var off_size_strimpl = 0x18;
var KB = 0x400;
var MB = 0x100000;
var page_size = 0x4000;
var is_ps4 = 1;

var mem;

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
    throw TypeError('low not a 32-bit integer');
  }
  return [low >>> 0, low < 0 ? -1 >>> 0 : 0];
}

class DieError extends Error {
  constructor(msg) {
    super(msg);
    this.name = this.constructor.name;
  }
}

function die(msg) {
  var message = msg || '';
  throw new DieError(message);
}

class Int {
  constructor(low, high) {
    if (high === undefined) {
      this._u32 = new Uint32Array(lohi_from_one(low));
      return;
    }
    if (check_not_in_range(low)) {
      throw TypeError('low not a 32-bit integer');
    }
    if (check_not_in_range(high)) {
      throw TypeError('high not a 32-bit integer');
    }
    this._u32 = new Uint32Array([low, high]);
  }
  get lo() {
    return this._u32[0];
  }
  get hi() {
    return this._u32[1];
  }
  get bot() {
    return this._u32[0] | 0;
  }
  get top() {
    return this._u32[1] | 0;
  }
  neg() {
    var u32 = this._u32;
    var low = (~u32[0] >>> 0) + 1;
    return new this.constructor(
      low >>> 0,
      ((~u32[1] >>> 0) + (low > 0xffffffff)) >>> 0
    );
  }
  eq(b) {
    var values = lohi_from_one(b);
    var u32 = this._u32;
    return (
      u32[0] === values[0] &&
      u32[1] === values[1]
    );
  }
  ne(b) {
    return !this.eq(b);
  }
  add(b) {
    var values = lohi_from_one(b);
    var u32 = this._u32;
    var low = u32[0] + values[0];
    return new this.constructor(
        low >>> 0,
        (u32[1] + values[1] + (low > 0xffffffff)) >>> 0
    );
  }
  sub(b) {
    var values = lohi_from_one(b);
    var u32 = this._u32;
    var low = u32[0] + (~values[0] >>> 0) + 1;
    return new this.constructor(
      low >>> 0,
      (u32[1] + (~values[1] >>> 0) + (low > 0xffffffff)) >>> 0
    );
  }
  toString(is_pretty) {
    var low, high;
    var pretty = is_pretty || false;
    if (!pretty) {
      low = this.lo.toString(16).padStart(8, '0');
      high = this.hi.toString(16).padStart(8, '0');
      return '0x' + high + low;
    }
    high = this.hi.toString(16).padStart(8, '0');
    high = high.substring(0, 4) + '_' + high.substring(4);
    low = this.lo.toString(16).padStart(8, '0');
    low = low.substring(0, 4) + '_' + low.substring(4);
    return '0x' + high + '_' + low;
  }
}

function align(a, alignment) {
  if (!(a instanceof Int)) {
    a = new Int(a);
  }
  var mask = -alignment & 0xffffffff;
  var type = a.constructor;
  var low = a.lo & mask;
  return new type(low, a.hi);
}

function hex(number) {
  return '0x' + number.toString(16);
}

function hex_np(number) {
  return number.toString(16);
}

function hexdump(view) {
  var len = view.length;
  var num_16 = len & ~15;
  var residue = len - num_16;
  
  function chr(i) {
    return (0x20 <= i && i <= 0x7e) ? String.fromCharCode(i) : '.';
  }
  
  function to_hex(view, offset, length) {
    var out = [];
    for (var i = 0; i < length; i++) {
      var v = view[offset + i];
      var h = v.toString(16);
      if (h.length < 2) h = "0" + h;
      out.push(h);
    }
    return out.join(" ");
  }
  
  var bytes = [];
  for (var i = 0; i < num_16; i += 16) {
    var long1 = to_hex(view, i, 8);
    var long2 = to_hex(view, i + 8, 8);
    var print = "";
    for (var j = 0; j < 16; j++) {
      print += chr(view[i + j]);
    }
    bytes.push([long1 + "  " + long2, print]);
  }
  
  if (residue) {
    var small = residue <= 8;
    var long1_len = small ? residue : 8;
    var long1 = to_hex(view, num_16, long1_len);
    if (small) {
      for (var k = residue; k < 8; k++) {
        long1 += " xx";
      }
    }
    var long2;
    if (small) {
      var arr = [];
      for (var k = 0; k < 8; k++) arr.push("xx");
      long2 = arr.join(" ");
    } else {
      long2 = to_hex(view, num_16 + 8, residue - 8);
      for (var k = residue; k < 16; k++) {
        long2 += " xx";
      }
    }
    var printRem = "";
    for (var k = 0; k < residue; k++) {
      printRem += chr(view[num_16 + k]);
    }
    while (printRem.length < 16) printRem += " ";
    bytes.push([long1 + "  " + long2, printRem]);
  }
  
  for (var pos = 0; pos < bytes.length; pos++) {
    var off = (pos * 16).toString(16);
    while (off.length < 8) off = "0" + off;
    var row = bytes[pos];
    log(off + " | " + row + " |" + row + "|");
  }
}

function gc() {
  new Uint8Array(4 * MB);
}

function add_and_set_addr(mem_obj, offset, base_lo, base_hi) {
  var values = lohi_from_one(offset);
  var main = mem_obj._main;
  var low = base_lo + values[0];
  main[off_vector] = low;
  main[off_vector2] = base_hi + values[1] + (low > 0xffffffff);
}

class Addr extends Int {
  read8(offset) {
    var m = mem;
    if (isIntegerFix(offset) && 0 <= offset && offset <= 0xffffffff) {
      m._set_addr_direct(this);
    } else {
      add_and_set_addr(m, offset, this.lo, this.hi);
      offset = 0;
    }
    return m.read8_at(offset);
  }
  read16(offset) {
    var m = mem;
    if (isIntegerFix(offset) && 0 <= offset && offset <= 0xffffffff) {
      m._set_addr_direct(this);
    } else {
      add_and_set_addr(m, offset, this.lo, this.hi);
      offset = 0;
    }
    return m.read16_at(offset);
  }
  read32(offset) {
    var m = mem;
    if (isIntegerFix(offset) && 0 <= offset && offset <= 0xffffffff) {
      m._set_addr_direct(this);
    } else {
      add_and_set_addr(m, offset, this.lo, this.hi);
      offset = 0;
    }
    return m.read32_at(offset);
  }
  read64(offset) {
    var m = mem;
    if (isIntegerFix(offset) && 0 <= offset && offset <= 0xffffffff) {
      m._set_addr_direct(this);
    } else {
      add_and_set_addr(m, offset, this.lo, this.hi);
      offset = 0;
    }
    return m.read64_at(offset);
  }
  readp(offset) {
    var m = mem;
    if (isIntegerFix(offset) && 0 <= offset && offset <= 0xffffffff) {
      m._set_addr_direct(this);
    } else {
      add_and_set_addr(m, offset, this.lo, this.hi);
      offset = 0;
    }
    return m.readp_at(offset);
  }
  write8(offset, value) {
    var m = mem;
    if (isIntegerFix(offset) && 0 <= offset && offset <= 0xffffffff) {
      m._set_addr_direct(this);
    } else {
      add_and_set_addr(m, offset, this.lo, this.hi);
      offset = 0;
    }
    m.write8_at(offset, value);
  }
  write16(offset, value) {
    var m = mem;
    if (isIntegerFix(offset) && 0 <= offset && offset <= 0xffffffff) {
      m._set_addr_direct(this);
    } else {
      add_and_set_addr(m, offset, this.lo, this.hi);
      offset = 0;
    }
    m.write16_at(offset, value);
  }
  write32(offset, value) {
    var m = mem;
    if (isIntegerFix(offset) && 0 <= offset && offset <= 0xffffffff) {
      m._set_addr_direct(this);
    } else {
      add_and_set_addr(m, offset, this.lo, this.hi);
      offset = 0;
    }
    m.write32_at(offset, value);
  }
}
