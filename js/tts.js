/* ==========================================================================
   tts.js — đọc tiếng Trung bằng Web Speech API có sẵn trong trình duyệt
   ========================================================================== */
var TTS = (function () {
  var voices = [], tok = 0, ready = false, slow = false;

  function pick() {
    if (!window.speechSynthesis) return;
    voices = (speechSynthesis.getVoices() || []).filter(function (v) { return /^zh/i.test(v.lang); });
    ready = true;
  }
  if (window.speechSynthesis) {
    pick();
    speechSynthesis.onvoiceschanged = pick;
    setTimeout(pick, 400);
  }

  function has() { return !!window.speechSynthesis && voices.length > 0; }
  function list() { return voices; }
  function setSlow(v) { slow = !!v; }
  function isSlow() { return slow; }

  /* cắt câu dài để Chrome không nuốt */
  function cut(s) {
    var out = [], cur = "";
    String(s).split(/([，,。！？!?；;])/).forEach(function (p) {
      if ((cur + p).length > 160) { if (cur) out.push(cur); cur = p; }
      else cur += p;
    });
    if (cur.trim()) out.push(cur);
    return out.length ? out : [String(s)];
  }

  function stop() { tok++; if (window.speechSynthesis) speechSynthesis.cancel(); }

  function say(text, btn) {
    if (!window.speechSynthesis) { UI.toast("Trình duyệt này không hỗ trợ đọc tiếng Trung.", "no"); return; }
    stop();
    var my = ++tok;
    var parts = cut(text), i = 0;
    if (btn) { UI.qsa(".spk.playing").forEach(function (b) { b.classList.remove("playing"); }); btn.classList.add("playing"); }

    function next() {
      if (my !== tok || i >= parts.length) {
        if (btn) btn.classList.remove("playing");
        return;
      }
      var u = new SpeechSynthesisUtterance(parts[i++]);
      u.lang = "zh-CN";
      u.rate = slow ? 0.6 : 0.92;
      if (voices.length) {
        var ms = voices.filter(function (v) { return /microsoft/i.test(v.name); })[0];
        u.voice = ms || voices[0];
      }
      u.onend = next;
      u.onerror = next;
      speechSynthesis.speak(u);
    }
    next();
  }

  /* đọc lần lượt một danh sách, dừng được giữa chừng */
  function queue(list, onEach) {
    stop();
    var my = ++tok, i = 0;
    function step() {
      if (my !== tok || i >= list.length) return;
      var item = list[i];
      if (onEach) onEach(i);
      i++;
      var u = new SpeechSynthesisUtterance(item);
      u.lang = "zh-CN";
      u.rate = slow ? 0.6 : 0.92;
      if (voices.length) {
        var ms = voices.filter(function (v) { return /microsoft/i.test(v.name); })[0];
        u.voice = ms || voices[0];
      }
      u.onend = function () { setTimeout(step, 260); };
      u.onerror = function () { setTimeout(step, 260); };
      speechSynthesis.speak(u);
    }
    step();
  }

  return { say: say, stop: stop, queue: queue, has: has, list: list, setSlow: setSlow, isSlow: isSlow, ready: function () { return ready; } };
})();
