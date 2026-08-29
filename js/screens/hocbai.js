/* ==========================================================================
   S-05 Màn học bài (5 phần) · S-06 Trình chiếu
   ========================================================================== */
function shuffle(a) {
  a = a.slice();
  for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
  return a;
}

var TABS = [
  ["warmup", "🔥", "Khởi động", "一", "Khởi động — 热身 Rèshēn",
    "Lật thẻ làm quen với toàn bộ từ mới trước khi học chi tiết. Bấm thẻ để lật · bấm 🔊 để nghe."],
  ["vocab", "📚", "Từ mới", "二", "Từ mới — 生词 Shēngcí",
    "Mỗi thẻ gồm: chữ Hán · phiên âm · âm Hán Việt · từ loại · nghĩa · câu ví dụ."],
  ["practice", "🎮", "Ôn tập từ mới", "三", "Ôn tập từ mới — 练习 Liànxí",
    "Hai hoạt động tương tác giúp ghi nhớ từ vựng vừa học."],
  ["grammar", "📖", "Ngữ pháp", "四", "Ngữ pháp — 语法 Yǔfǎ",
    "Trọng tâm của bài, kèm bài luyện tập ngay bên dưới."],
  ["dialogue", "💬", "Hội thoại", "五", "Hội thoại — 会话 Huìhuà",
    "Bấm 🔊 nghe từng câu, bật đóng vai để tự đọc phần A hoặc B."]
];

function lessonView(p) {
  var l = Store.lesson(p.lid);
  if (!l) return '<div class="empty" style="padding:80px">Không tìm thấy bài học. <a href="#/hv" class="red b">Về trang chủ</a></div>';
  var tab = p.tab || "warmup";
  var ti = 0; TABS.forEach(function (t, i) { if (t[0] === tab) ti = i; });
  var u = Store.me(), teacher = u.role !== "hv";
  var c = Store.course(l.courseId);
  var pr = Store.prog(u.id, l.id);
  Store.markPart(l.id, ti + 1);

  var head = '<header class="lesson-head" data-bg="' + UI.h(l.zh) + '"><div class="in">' +
    '<div class="row wrap" style="font-size:13px;opacity:.92">' +
      '<a href="' + (teacher ? "#/admin/giao-trinh/" + c.id : "#/hv/giao-trinh/" + c.id) + '">← ' + UI.h(c.vi) + '</a>' +
      '<span>·</span><span>Bài ' + l.no + ' / ' + Store.lessonsOf(c.id).length + '</span>' +
      '<span class="right row">' + (teacher
        ? '<a href="#/trinh-chieu/' + l.id + '" class="btn ghost sm">🖥️ Trình chiếu</a>' +
          '<a href="#/admin/soan-bai/' + l.id + '" class="btn ghost sm">✏️ Sửa bài</a>'
        : UI.chip("Đã xong " + pr + "/5 phần", "chip-w")) + '</span></div>' +
    '<h1>' + UI.h(l.zh) + '</h1>' +
    '<div style="font-size:20px;font-weight:600;opacity:.95">' + UI.h(l.py) + '</div>' +
    '<div style="font-size:15px;margin-top:6px;opacity:.9">' + UI.h(l.vi) + '</div>' +
    '<div class="row wrap" style="gap:9px;margin-top:14px;font-size:12.5px">' +
      '<span style="background:rgba(0,0,0,.17);padding:5px 12px;border-radius:99px;font-weight:700">🎯 ' + l.vocab.length + ' từ mới</span>' +
      '<span style="background:rgba(0,0,0,.17);padding:5px 12px;border-radius:99px;font-weight:700">📖 ' + l.dialogues.length + ' hội thoại</span>' +
      '<span style="background:rgba(0,0,0,.17);padding:5px 12px;border-radius:99px;font-weight:700">✏️ ' + l.grammar.length + ' điểm ngữ pháp</span>' +
    '</div></div></header>';

  var nav = '<nav class="lnav"><div class="ltabs">' + TABS.map(function (t) {
    return '<a class="ltab ' + (t[0] === tab ? "on" : "") + '" href="#/hoc/' + l.id + '/' + t[0] + '">' +
      '<span>' + t[1] + '</span>' + t[2] + '</a>';
  }).join('') + '</div></nav>';

  var T = TABS[ti];
  var inner = '<div class="sec-head"><div class="sec-num zh">' + T[3] + '</div>' +
    '<div><h2>' + T[4] + '</h2><div class="sub">' + T[5] + '</div></div></div>';

  if (!l.vocab.length) {
    inner += '<div class="card pad empty">Bài học này chưa có nội dung. ' +
      (teacher ? '<a href="#/admin/soan-bai/' + l.id + '" class="red b">Soạn bài ngay →</a>' : 'Giáo viên đang soạn.') + '</div>';
  } else if (tab === "warmup") inner += viewWarmup(l);
  else if (tab === "vocab") inner += viewVocab(l);
  else if (tab === "practice") inner += viewPractice(l);
  else if (tab === "grammar") inner += viewGrammar(l);
  else inner += viewDialogue(l);

  var prev = TABS[ti - 1], next = TABS[ti + 1];
  inner += '<div class="row mt2" style="border-top:1.5px solid var(--line);padding-top:18px">' +
    (prev ? '<a class="btn ghost" href="#/hoc/' + l.id + '/' + prev[0] + '">← ' + prev[2] + '</a>' : '<span></span>') +
    '<span class="right row"><span class="sm muted">Phần ' + (ti + 1) + '/5</span>' +
    (next ? '<a class="btn red" href="#/hoc/' + l.id + '/' + next[0] + '">' + next[2] + ' →</a>'
          : '<a class="btn jade" href="' + (teacher ? "#/gv" : "#/hv") + '">✔ Hoàn thành bài học</a>') + '</span></div>';

  return head + nav + '<div class="lwrap fade">' + inner + '</div>';
}

/* ---------------------------------------------------------------- Khởi động */
function viewWarmup(l) {
  return '<div class="row wrap mb"><button class="btn ghost" id="flipAll">🔄 Lật tất cả</button>' +
    '<label class="chk"><input type="checkbox" data-slow> 🐢 Đọc chậm</label>' +
    '<span class="right chip jade" id="flipCount">Đã lật 0/' + l.vocab.length + '</span></div>' +
    '<div class="flip-grid" id="flipGrid">' + l.vocab.map(function (v, i) {
      return '<div class="flip" data-i="' + i + '"><div class="flip-in">' +
        '<div class="face front"><div class="emo">' + (v.emo || "📝") + '</div>' +
        '<div class="hz zh">' + UI.h(v.hz) + '</div><div class="hint">bấm để lật</div></div>' +
        '<div class="face back"><div class="py">' + UI.h(v.py) + '</div>' +
        '<div class="hv">' + UI.h(v.hv) + '</div><div class="vi">' + UI.h(v.vi) + '</div>' +
        '<button class="spk" data-say="' + UI.h(v.hz) + '">🔊</button></div>' +
      '</div></div>';
    }).join('') + '</div>';
}

/* ---------------------------------------------------------------- Từ mới */
function viewVocab(l) {
  return '<div class="row wrap mb"><button class="btn red" id="playAll">🔊 Nghe lần lượt cả bài</button>' +
    '<button class="btn ghost" id="stopAll">⏹ Dừng</button>' +
    '<label class="chk"><input type="checkbox" data-slow> 🐢 Đọc chậm</label>' +
    '<label class="chk"><input type="checkbox" id="hideVi"> 👁 Ẩn nghĩa tiếng Việt</label></div>' +
    '<div class="vocab-grid" id="vocabGrid">' + l.vocab.map(function (v, i) {
      return '<div class="vcard" data-i="' + i + '"><button class="spk" data-say="' + UI.h(v.hz) + '">🔊</button>' +
        '<div class="vtop"><div class="vemo">' + (v.emo || "📝") + '</div>' +
        '<div><div class="vhz zh">' + UI.h(v.hz) + '</div><div class="vpy">' + UI.h(v.py) + '</div></div></div>' +
        '<div class="vtags">' + UI.chip(v.pos, "blue") + UI.chip("HV: " + v.hv, "purple") + '</div>' +
        '<div class="vmean">' + UI.h(v.vi) + '</div>' +
        '<div class="vex"><div class="zh">' + UI.h(v.ex.zh) + '</div>' +
        '<div class="expy">' + UI.h(v.ex.py) + '</div><div class="exvi">' + UI.h(v.ex.vi) + '</div></div></div>';
    }).join('') + '</div>' +
    (l.extra.length ? '<div class="card pad mt2"><h3 style="font-size:16px">💼 Mở rộng — Các nghề nghiệp khác 其他职业</h3>' +
      '<p class="sm muted mb">Không bắt buộc thuộc, nhưng rất hay dùng khi giới thiệu bản thân và gia đình.</p>' +
      '<div class="lang-grid">' + l.extra.map(function (e) {
        return '<div class="lang"><span class="flag">' + e.flag + '</span>' +
          '<div class="grow"><div class="zh b" style="font-size:17px">' + UI.h(e.hz) + '</div>' +
          '<div class="xs red b">' + UI.h(e.py) + '</div><div class="xs muted">' + UI.h(e.vi) + '</div></div>' +
          '<button class="spk" data-say="' + UI.h(e.hz) + '" style="width:28px;height:28px;font-size:12px">🔊</button></div>';
      }).join('') + '</div></div>' : '');
}

/* ---------------------------------------------------------------- Ôn tập */
function viewPractice(l) {
  var pairs = l.match.slice(0, 8);
  var cards = shuffle(pairs.map(function (p, i) { return { t: p.zh, k: i, zh: 1 }; })
    .concat(pairs.map(function (p, i) { return { t: p.vi, k: i, zh: 0 }; })));
  return '<div class="game-card">' +
    '<div class="row wrap"><span class="game-badge" style="background:var(--blue)">🧩</span>' +
    '<div class="grow"><div class="bb" style="font-size:17px">Hoạt động 1 · Ghép từ — Nối tên nghề với nghĩa</div>' +
    '<div class="sm muted">Bấm 1 thẻ chữ Hán rồi bấm thẻ nghĩa tiếng Việt tương ứng.</div></div>' +
    '<span class="chip jade">✅ <b id="mPairs">0</b>/' + pairs.length + ' cặp</span>' +
    '<span class="chip">👆 <b id="mMoves">0</b> lượt</span>' +
    '<button class="btn ghost sm" id="mReset">🔄 Chơi lại</button></div>' +
    '<div class="match-grid mt" id="matchGrid">' + cards.map(function (c) {
      return '<div class="mcard" data-k="' + c.k + '" data-zh="' + c.zh + '">' +
        (c.zh ? '<span class="zh">' + UI.h(c.t) + '</span>' : UI.h(c.t)) + '</div>';
    }).join('') + '</div>' +
    '<div class="winbox hide" id="mWin">🎉 太好了 Tài hǎo le! Bạn đã ghép đúng tất cả!</div></div>' +

    '<div class="game-card">' +
    '<div class="row wrap"><span class="game-badge" style="background:var(--jade)">🔀</span>' +
    '<div class="grow"><div class="bb" style="font-size:17px">Hoạt động 2 · Sắp xếp câu — 组句 Zǔjù</div>' +
    '<div class="sm muted">Bấm các thẻ từ theo đúng thứ tự. Bấm từ ở dòng trả lời nếu muốn bỏ ra.</div></div>' +
    '<span class="chip gold">Câu <b id="sbNo">1</b>/' + l.sentences.length + '</span></div>' +
    '<div class="mt" style="background:var(--paper);border-radius:12px;padding:13px 16px">' +
      '<div class="sm muted">Dịch câu sau sang tiếng Trung:</div>' +
      '<div class="b" style="font-size:15.5px" id="sbTarget"></div></div>' +
    '<div class="sb-line" id="sbLine"></div>' +
    '<div class="mt" id="sbPool"></div>' +
    '<div class="row mt"><button class="btn jade" id="sbCheck">✔ Kiểm tra</button>' +
      '<button class="btn ghost" id="sbSkip">⏭ Câu tiếp</button>' +
      '<button class="btn ghost" id="sbSay">🔊 Nghe đáp án</button></div>' +
    '<div class="feedback" id="sbFb"></div>' +
    '<div class="winbox hide" id="sbWin">🎉 Hoàn thành! Bạn đã sắp xếp đúng tất cả các câu.</div></div>';
}

/* ---------------------------------------------------------------- Ngữ pháp */
function viewGrammar(l) {
  return l.grammar.map(function (g, i) {
    return '<div class="gp"><h3><span class="gnum">' + (i + 1) + '</span>' +
      '<span class="grow">' + g.t + '</span>' +
      '<button class="spk" data-say="' + UI.h(g.say) + '">🔊</button></h3>' +
      '<p>' + g.p + '</p>' +
      (g.formula ? '<div class="formula">' + g.formula + '</div>' : '') +
      (g.cells ? '<div class="grid g2 mb">' + g.cells.map(function (c, j) {
        return '<div class="tone-cell ' + (j === 0 ? "a" : "b") + '"><b>' + c.t + '</b><br>' + c.body + '</div>';
      }).join('') + '</div>' : '') +
      (g.ex || []).map(function (e) {
        return '<div class="gpex"><button class="spk" data-say="' + UI.h(e.zh) + '">🔊</button>' +
          '<div><div class="zh">' + UI.h(e.zh) + '</div><div class="py">' + UI.h(e.py) + '</div>' +
          '<div class="vi">' + UI.h(e.vi) + '</div></div></div>';
      }).join('') +
      (g.quiz === "A" && l.quizA ? grammarQuiz(l) : '') +
    '</div>';
  }).join('');
}
function grammarQuiz(l) {
  return '<div class="mt" style="border-top:1.5px dashed var(--line);padding-top:15px">' +
    '<div class="row mb"><b class="grow">🎧 Luyện nhanh — chọn <span class="zh">bù</span> hay <span class="zh">bú</span></b>' +
    '<span class="chip jade">Đúng <b id="qzOk">0</b>/<b id="qzN">0</b></span></div>' +
    '<div id="qzBox">' + l.quizA.map(function (q, i) {
      return '<div class="qz" data-i="' + i + '">' +
        '<span class="zh" style="font-size:19px;font-weight:700;min-width:96px">' + q.q + '</span>' +
        '<span class="sm muted" style="min-width:110px">' + q.sub + '</span>' +
        q.opts.map(function (o, j) {
          return '<button class="btn ghost sm qzo" data-j="' + j + '">' + o + '</button>';
        }).join('') +
        '<span class="sm b qzfb"></span></div>';
    }).join('') + '</div></div>';
}

/* ---------------------------------------------------------------- Hội thoại */
function viewDialogue(l) {
  return '<div class="row wrap mb"><button class="btn red" id="dlgAll">🔊 Nghe cả đoạn</button>' +
    '<button class="btn ghost" id="stopAll">⏹ Dừng</button>' +
    '<label class="chk"><input type="checkbox" id="hidePy"> 👁 Ẩn phiên âm</label>' +
    '<label class="chk"><input type="checkbox" data-slow> 🐢 Đọc chậm</label>' +
    '<span class="right row"><span class="sm muted">Đóng vai:</span>' +
    '<span class="chip btn-like on" data-role="">Không</span>' +
    '<span class="chip btn-like" data-role="A">A</span>' +
    '<span class="chip btn-like" data-role="B">B</span></span></div>' +
    '<div id="dlgWrap">' + l.dialogues.map(function (d, i) {
      return '<div class="dlg"><div class="row mb">' + UI.chip("Hội thoại " + (i + 1), i ? "blue" : "red") +
        '<span class="sm muted">' + UI.h(d.title || "") + '</span>' +
        '<button class="btn ghost sm right" data-say-all="' + i + '">🔊 Nghe đoạn này</button></div>' +
        d.lines.map(function (ln) {
          return '<div class="dline" data-sp="' + ln.sp + '">' +
            '<span class="dsp ' + ln.sp.toLowerCase() + '">' + ln.sp + '</span>' +
            '<div class="dbub"><div class="zh">' + UI.h(ln.zh) + '</div>' +
            '<div class="py">' + UI.h(ln.py) + '</div><div class="vi">' + UI.h(ln.vi) + '</div></div>' +
            '<button class="spk" data-say="' + UI.h(ln.zh) + '">🔊</button></div>';
        }).join('') + '</div>';
    }).join('') + '</div>';
}

/* ---------------------------------------------------------------- gắn sự kiện */
function lessonInit(root, p) {
  var l = Store.lesson(p.lid); if (!l || !l.vocab.length) return;
  var tab = p.tab || "warmup";

  UI.qsa("[data-slow]", root).forEach(function (c) {
    c.checked = TTS.isSlow();
    c.onchange = function () { TTS.setSlow(c.checked); };
  });
  var stopBtn = UI.qs("#stopAll", root); if (stopBtn) stopBtn.onclick = function () { TTS.stop(); };

  /* ---- Khởi động */
  if (tab === "warmup") {
    var flipped = {};
    UI.qsa(".flip", root).forEach(function (f) {
      f.onclick = function (e) {
        if (e.target.closest(".spk")) return;
        f.classList.toggle("on");
        flipped[f.getAttribute("data-i")] = f.classList.contains("on");
        var n = Object.keys(flipped).filter(function (k) { return flipped[k]; }).length;
        UI.qs("#flipCount", root).textContent = "Đã lật " + n + "/" + l.vocab.length;
        if (f.classList.contains("on")) TTS.say(l.vocab[+f.getAttribute("data-i")].hz);
      };
    });
    UI.qs("#flipAll", root).onclick = function () {
      var all = UI.qsa(".flip", root), any = all.some(function (f) { return !f.classList.contains("on"); });
      all.forEach(function (f, i) { f.classList.toggle("on", any); flipped[i] = any; });
      UI.qs("#flipCount", root).textContent = "Đã lật " + (any ? l.vocab.length : 0) + "/" + l.vocab.length;
    };
  }

  /* ---- Từ mới */
  if (tab === "vocab") {
    UI.qs("#hideVi", root).onchange = function () {
      UI.qs("#vocabGrid", root).classList.toggle("hide-vi", this.checked);
    };
    UI.qs("#playAll", root).onclick = function () {
      var cards = UI.qsa(".vcard", root);
      TTS.queue(l.vocab.map(function (v) { return v.hz + "。" + v.ex.zh; }), function (i) {
        cards.forEach(function (c) { c.classList.remove("speaking"); });
        if (cards[i]) { cards[i].classList.add("speaking"); cards[i].scrollIntoView({ block: "center", behavior: "smooth" }); }
      });
    };
  }

  /* ---- Ôn tập */
  if (tab === "practice") {
    initMatch(root, l);
    initBuilder(root, l);
  }

  /* ---- Ngữ pháp */
  if (tab === "grammar" && l.quizA) {
    var ok = 0, done = 0;
    UI.qsa("#qzBox .qz", root).forEach(function (row) {
      var q = l.quizA[+row.getAttribute("data-i")];
      UI.qsa(".qzo", row).forEach(function (b) {
        b.onclick = function () {
          if (row.getAttribute("data-done")) return;
          row.setAttribute("data-done", "1"); done++;
          var good = +b.getAttribute("data-j") === q.ans;
          if (good) ok++;
          b.className = "btn " + (good ? "jade" : "red") + " sm qzo";
          UI.qsa(".qzo", row).forEach(function (x) {
            if (+x.getAttribute("data-j") === q.ans) x.className = "btn jade sm qzo";
          });
          UI.qs(".qzfb", row).innerHTML = (good ? '<span class="jade">✔ </span>' : '<span class="red">✕ </span>') + q.note;
          UI.qs("#qzOk", root).textContent = ok;
          UI.qs("#qzN", root).textContent = done;
          TTS.say(q.say);
        };
      });
    });
  }

  /* ---- Hội thoại */
  if (tab === "dialogue") {
    UI.qs("#hidePy", root).onchange = function () {
      UI.qs("#dlgWrap", root).classList.toggle("hide-py", this.checked);
    };
    UI.qsa("[data-role]", root).forEach(function (c) {
      c.onclick = function () {
        UI.qsa("[data-role]", root).forEach(function (x) { x.classList.remove("on"); });
        c.classList.add("on");
        var r = c.getAttribute("data-role");
        UI.qsa(".dline", root).forEach(function (d) {
          d.classList.toggle("mine", !!r && d.getAttribute("data-sp") === r);
          var bub = UI.qs(".dbub", d);
          bub.style.filter = (r && d.getAttribute("data-sp") === r) ? "blur(4px)" : "";
          bub.title = (r && d.getAttribute("data-sp") === r) ? "Lượt của bạn — thử đọc trước rồi rê chuột để xem" : "";
          bub.onmouseenter = function () { this.style.filter = ""; };
          bub.onmouseleave = function () {
            if (r && d.getAttribute("data-sp") === r) this.style.filter = "blur(4px)";
          };
        });
      };
    });
    UI.qsa("[data-say-all]", root).forEach(function (b) {
      b.onclick = function () {
        var d = l.dialogues[+b.getAttribute("data-say-all")];
        TTS.queue(d.lines.map(function (x) { return x.zh; }));
      };
    });
    var all = UI.qs("#dlgAll", root);
    if (all) all.onclick = function () {
      var lines = [];
      l.dialogues.forEach(function (d) { d.lines.forEach(function (x) { lines.push(x.zh); }); });
      TTS.queue(lines);
    };
  }
}

/* --- trò ghép từ --- */
function initMatch(root, l) {
  var pairs = l.match.slice(0, 8);
  var sel = null, ok = 0, moves = 0;
  function reset() {
    UI.qsa("#matchGrid .mcard", root).forEach(function (c) { c.className = "mcard"; });
    sel = null; ok = 0; moves = 0;
    UI.qs("#mPairs", root).textContent = 0;
    UI.qs("#mMoves", root).textContent = 0;
    UI.qs("#mWin", root).classList.add("hide");
  }
  UI.qs("#mReset", root).onclick = reset;
  UI.qsa("#matchGrid .mcard", root).forEach(function (c) {
    c.onclick = function () {
      if (c.classList.contains("ok")) return;
      if (c.classList.contains("on")) { c.classList.remove("on"); sel = null; return; }
      if (!sel) {
        c.classList.add("on"); sel = c; return;
      }
      moves++; UI.qs("#mMoves", root).textContent = moves;
      var same = sel.getAttribute("data-k") === c.getAttribute("data-k");
      var diffSide = sel.getAttribute("data-zh") !== c.getAttribute("data-zh");
      if (same && diffSide) {
        sel.className = "mcard ok"; c.className = "mcard ok";
        ok++; UI.qs("#mPairs", root).textContent = ok;
        TTS.say(pairs[+c.getAttribute("data-k")].zh);
        if (ok === pairs.length) UI.qs("#mWin", root).classList.remove("hide");
      } else {
        var a = sel, b = c;
        a.classList.add("bad"); b.classList.add("bad");
        setTimeout(function () { a.className = "mcard"; b.className = "mcard"; }, 420);
      }
      sel = null;
    };
  });
}

/* --- trò sắp xếp câu --- */
function initBuilder(root, l) {
  var idx = 0, picked = [];
  var line = UI.qs("#sbLine", root), pool = UI.qs("#sbPool", root), fb = UI.qs("#sbFb", root);

  function draw() {
    var s = l.sentences[idx];
    UI.qs("#sbNo", root).textContent = idx + 1;
    UI.qs("#sbTarget", root).textContent = s.vi;
    line.className = "sb-line"; fb.textContent = ""; fb.className = "feedback";
    picked = [];
    line.innerHTML = '<span class="sm muted">Bấm các thẻ từ bên dưới…</span>';
    pool.innerHTML = shuffle(s.words).map(function (w, i) {
      return '<button class="word zh" data-w="' + UI.h(w) + '">' + UI.h(w) + '</button>';
    }).join('');
    UI.qsa(".word", pool).forEach(function (b) {
      b.onclick = function () {
        if (b.classList.contains("picked")) return;
        b.classList.add("picked"); b.style.opacity = ".35";
        picked.push({ w: b.getAttribute("data-w"), src: b });
        paint();
      };
    });
  }
  function paint() {
    line.innerHTML = picked.length ? picked.map(function (p, i) {
      return '<button class="word zh picked" data-i="' + i + '">' + UI.h(p.w) + '</button>';
    }).join('') : '<span class="sm muted">Bấm các thẻ từ bên dưới…</span>';
    UI.qsa(".word", line).forEach(function (b) {
      b.onclick = function () {
        var i = +b.getAttribute("data-i");
        picked[i].src.classList.remove("picked"); picked[i].src.style.opacity = "";
        picked.splice(i, 1); paint();
      };
    });
  }
  UI.qs("#sbCheck", root).onclick = function () {
    var s = l.sentences[idx];
    var got = picked.map(function (p) { return p.w; }).join("");
    if (!got) { fb.textContent = "Bạn chưa chọn từ nào."; fb.className = "feedback no"; return; }
    if (got === s.zh.replace(/\s/g, "")) {
      line.className = "sb-line ok";
      fb.innerHTML = '✔ Chính xác! <span class="zh">' + UI.h(s.zh) + '</span> — ' + UI.h(s.py);
      fb.className = "feedback ok";
      TTS.say(s.zh);
      if (idx === l.sentences.length - 1) UI.qs("#sbWin", root).classList.remove("hide");
    } else {
      line.className = "sb-line no"; line.classList.add("shake");
      setTimeout(function () { line.classList.remove("shake"); }, 400);
      fb.textContent = "✕ Chưa đúng — thử đổi lại trật tự từ nhé.";
      fb.className = "feedback no";
    }
  };
  UI.qs("#sbSkip", root).onclick = function () { idx = (idx + 1) % l.sentences.length; draw(); };
  UI.qs("#sbSay", root).onclick = function () { TTS.say(l.sentences[idx].zh); };
  draw();
}

ROUTES["hoc/:lid"] = { full: true, view: lessonView, init: lessonInit };
ROUTES["hoc/:lid/:tab"] = { full: true, view: lessonView, init: lessonInit };

/* ====================================================== S-06 TRÌNH CHIẾU */
ROUTES["trinh-chieu/:lid"] = {
  full: true, roles: ["gv"],
  view: function (p) {
    var l = Store.lesson(p.lid);
    if (!l || !l.vocab.length) return '<div class="empty" style="padding:80px">Bài học chưa có nội dung. <a href="#/gv" class="red b">Quay lại</a></div>';
    var i = Math.max(0, Math.min(l.vocab.length - 1, parseInt(p.i || sessionStorage.getItem("slide_" + l.id) || "0", 10)));
    var v = l.vocab[i];
    var k = Store.classesOfTeacher(Store.me().id)[0];
    return '<div class="slide" id="slideRoot" data-i="' + i + '" data-lid="' + l.id + '">' +
      '<div class="slide-top">' + UI.chip("🖥️ CHẾ ĐỘ TRÌNH CHIẾU") +
        '<span>Bài ' + l.no + ' · ' + UI.h(l.zh) + '</span><span>·</span><span>Phần: Từ mới 生词</span>' +
        '<span class="right row" style="gap:14px"><span>Slide ' + (i + 1) + ' / ' + l.vocab.length + '</span>' +
        '<span id="slClock">⏱ 00:00</span>' +
        (k ? UI.chip(k.code + " · " + k.students.length + " học viên") : "") +
        '<button class="chip btn-like" id="slFull">⛶ Toàn màn hình</button>' +
        '<a href="#/hoc/' + l.id + '/vocab" style="opacity:.7">✕ Thoát</a></span></div>' +
      '<div class="slide-mid" id="slMid"><div>' +
        '<div style="font-size:15px;letter-spacing:3px;opacity:.5;font-weight:700">TỪ MỚI ' +
          (i + 1 < 10 ? "0" : "") + (i + 1) + ' / ' + l.vocab.length + '</div>' +
        '<div class="big zh">' + UI.h(v.hz) + '</div>' +
        '<div class="py2">' + UI.h(v.py) + '</div>' +
        '<div class="vi2">' + UI.h(v.vi) + ' &nbsp;·&nbsp; <i style="opacity:.6">Hán Việt: ' + UI.h(v.hv) + '</i></div>' +
        '<div class="ex2"><div class="zh" style="font-size:32px;font-weight:700">' + UI.h(v.ex.zh) + '</div>' +
          '<div style="color:var(--gold);font-size:18px;margin-top:8px;font-weight:600">' + UI.h(v.ex.py) + '</div>' +
          '<div style="opacity:.75;font-size:16px;margin-top:4px">' + UI.h(v.ex.vi) + '</div></div>' +
        '<div style="margin-top:30px;display:flex;gap:12px;justify-content:center;flex-wrap:wrap">' +
          '<button class="chip btn-like" data-say="' + UI.h(v.hz) + '">🔊 Đọc chữ</button>' +
          '<button class="chip btn-like" data-say="' + UI.h(v.ex.zh) + '">🔊 Đọc câu ví dụ</button>' +
          '<button class="chip btn-like" id="slHide">👁 Ẩn nghĩa · hỏi lớp</button>' +
          '<button class="chip btn-like" id="slStroke">✍️ Nét bút</button></div>' +
      '</div></div>' +
      '<div class="slide-bot"><span class="sm" style="opacity:.5;margin-right:6px">Slide:</span>' +
        l.vocab.map(function (x, j) {
          return '<div class="thumb zh' + (j === i ? " on" : "") + '" data-go="' + j + '">' + UI.h(x.hz) + '</div>';
        }).join('') +
        '<span class="right sm" style="opacity:.5;white-space:nowrap">← → chuyển slide · Space đọc</span></div>' +
    '</div>';
  },
  init: function (root, p) {
    var el = UI.qs("#slideRoot", root);
    var lid = el.getAttribute("data-lid"), i = +el.getAttribute("data-i");
    var l = Store.lesson(lid);
    function goTo(n) {
      n = (n + l.vocab.length) % l.vocab.length;
      sessionStorage.setItem("slide_" + lid, n);
      location.hash = "#/trinh-chieu/" + lid + "?i=" + n;
    }
    UI.qsa(".thumb", root).forEach(function (t) {
      t.onclick = function () { goTo(+t.getAttribute("data-go")); };
    });
    UI.qs("#slHide", root).onclick = function () {
      UI.qs("#slMid", root).classList.toggle("hide-mean");
      this.classList.toggle("on");
    };
    UI.qs("#slStroke", root).onclick = function () {
      UI.toast("Bản demo chưa có hoạt hình nét bút.", "info");
    };
    UI.qs("#slFull", root).onclick = function () {
      if (document.fullscreenElement) document.exitFullscreen();
      else document.documentElement.requestFullscreen && document.documentElement.requestFullscreen();
    };
    var t0 = Date.now();
    var timer = setInterval(function () {
      var c = UI.qs("#slClock"); if (!c) { clearInterval(timer); return; }
      var s = Math.floor((Date.now() - t0) / 1000);
      c.textContent = "⏱ " + ("0" + Math.floor(s / 60)).slice(-2) + ":" + ("0" + (s % 60)).slice(-2);
    }, 1000);
    window.__slideKeys = function (e) {
      if (e.key === "ArrowRight") goTo(i + 1);
      else if (e.key === "ArrowLeft") goTo(i - 1);
      else if (e.key === " ") { e.preventDefault(); TTS.say(l.vocab[i].hz); }
    };
    document.addEventListener("keydown", window.__slideKeys);
  }
};
