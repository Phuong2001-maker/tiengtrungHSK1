/* ==========================================================================
   S-08 Làm bài và nộp bài
   ========================================================================== */
ROUTES["hv/lam-bai/:aid"] = {
  roles: ["hv"],
  view: function (p) {
    var u = Store.me(), a = Store.asg(p.aid);
    if (!a) return UI.shell({ active: "#/hv/bai-tap", title: "Không tìm thấy", crumb: "", body: '<div class="empty">Bài tập không tồn tại.</div>' });
    var k = Store.cls(a.classId), sub = Store.subOf(a.id, u.id);
    var ans = (sub && sub.status === "draft") ? (sub.answers || {}) : {};
    var d = dueInfo(a.due);
    var manualN = a.questions.filter(function (q) { return !Store.isAuto(q); }).length;

    if (sub && sub.status !== "draft") {
      return UI.shell({ active: "#/hv/bai-tap", title: a.title, crumb: "Bài tập",
        body: UI.backLink("#/hv/bai-tap", "Bài tập của tôi") + '<div class="mt2">' +
          UI.alert("jade", "✅", '<b>Bạn đã nộp bài này lúc ' + UI.h(sub.at) + '.</b> ' +
            (sub.finalScore !== null ? 'Bài đã được chấm — ' : 'Đang chờ giáo viên chấm. ') +
            '<a href="#/hv/ket-qua/' + a.id + '" class="b" style="color:inherit;text-decoration:underline">Xem bài đã nộp →</a>') + '</div>' });
    }

    var body = UI.backLink("#/hv/bai-tap", "Bài tập của tôi") +
    '<div class="grid mt" style="grid-template-columns:1fr 290px;gap:18px;align-items:start"><div>' +
      '<div class="card pad mb"><div class="row wrap"><div class="grow">' +
        '<div class="bb" style="font-size:18px">' + UI.h(a.title) + '</div>' +
        '<div class="sm muted">Lớp ' + UI.h(k.code) + ' · ' + UI.h(Store.user(k.teacherId).name) +
          ' giao ngày ' + UI.h(a.assignedAt.split(" ")[0]) + '</div></div>' +
        (a.minutes ? '<span class="chip red" id="clock">⏱ ' + a.minutes + ':00</span>' : '') +
        UI.chip(a.questions.length + " câu · thang " + a.maxScore) + '</div>' +
        (a.note ? '<div class="mt">' + UI.alert("gold", "📌", UI.h(a.note)) + '</div>' : '') +
        '<div class="row mt"><span class="sm muted grow">Đã làm <b id="doneN">0</b>/' + a.questions.length + ' câu</span>' +
        '<span class="sm b" id="donePct">0%</span></div>' + UI.bar(0, "blue") + '</div>' +

      a.questions.map(function (q, i) { return qCard(q, i, ans[q.id]); }).join('') +

      '<div class="row mt2"><button class="btn ghost" id="saveDraft">💾 Lưu nháp</button>' +
      '<span class="right row"><span class="sm muted" id="leftTxt"></span>' +
      '<button class="btn jade lg" id="submitBtn">✔ Nộp bài</button></span></div>' +
    '</div><div><div class="card pad" style="position:sticky;top:80px">' +
      '<div class="bb mb">Bảng câu hỏi</div>' +
      '<div class="qmap" id="qmap">' + a.questions.map(function (q, i) {
        return '<b data-go="' + i + '">' + (i + 1) + '</b>';
      }).join('') + '</div>' +
      '<div class="row mt sm wrap" style="gap:14px">' +
        '<span class="row" style="gap:5px"><b style="width:11px;height:11px;border-radius:3px;background:var(--jade);display:inline-block"></b>Đã làm</span>' +
        '<span class="row" style="gap:5px"><b style="width:11px;height:11px;border-radius:3px;background:var(--line);display:inline-block"></b>Chưa làm</span></div>' +
      '<div class="divider"></div>' +
      '<div class="sm"><div class="row wrap mb" style="gap:6px">' +
        UI.chip(a.questions.filter(function (q) { return q.type === "mcq"; }).length + " trắc nghiệm", "blue") +
        UI.chip(a.questions.filter(function (q) { return q.type === "fill"; }).length + " điền từ", "gold") +
        UI.chip(a.questions.filter(function (q) { return q.type === "order"; }).length + " sắp xếp", "jade") +
        UI.chip(manualN + " viết/ghi âm", "purple") + '</div></div>' +
      UI.alert("gold", "💾", '<span style="font-size:12.5px">Bài tự lưu nháp mỗi 20 giây. Mất mạng hay đóng nhầm tab vẫn không mất bài.</span>') +
      '<div class="mt sm muted">Hạn nộp: <b>' + UI.h(a.due) + '</b><br>' + d.text +
        (a.allowLate ? '<br>Cho nộp muộn (trừ 10% điểm)' : '<br>Không nhận bài muộn') + '</div>' +
    '</div></div></div>';

    return UI.shell({ active: "#/hv/bai-tap", title: "Làm bài tập", crumb: "Bài tập · " + a.title, body: body });
  },

  init: function (root, p) {
    var u = Store.me(), a = Store.asg(p.aid);
    if (!a) return;
    var sub = Store.subOf(a.id, u.id);
    var ans = (sub && sub.status === "draft") ? JSON.parse(JSON.stringify(sub.answers || {})) : {};

    function refresh() {
      var n = 0;
      a.questions.forEach(function (q, i) {
        var has = ans[q.id] !== undefined && ans[q.id] !== null && ans[q.id] !== "";
        if (has) n++;
        var cell = UI.qs('#qmap b[data-go="' + i + '"]', root);
        if (cell) cell.classList.toggle("done", has);
      });
      UI.qs("#doneN", root).textContent = n;
      var pct = Math.round(n / a.questions.length * 100);
      UI.qs("#donePct", root).textContent = pct + "%";
      UI.qs(".bar i", root).style.width = pct + "%";
      UI.qs("#leftTxt", root).textContent = n < a.questions.length ? "Còn " + (a.questions.length - n) + " câu chưa làm" : "Đã làm hết";
      return n;
    }

    /* trắc nghiệm / điền từ */
    UI.qsa("[data-opt]", root).forEach(function (o) {
      o.onclick = function () {
        var qid = o.getAttribute("data-q"), j = +o.getAttribute("data-opt");
        UI.qsa('[data-opt][data-q="' + qid + '"]', root).forEach(function (x) { x.classList.remove("on"); });
        o.classList.add("on");
        ans[qid] = j;
        var bl = UI.qs('[data-blank="' + qid + '"]', root);
        if (bl) bl.textContent = o.getAttribute("data-text");
        refresh();
      };
    });

    /* sắp xếp câu */
    a.questions.forEach(function (q) {
      if (q.type !== "order") return;
      var line = UI.qs('[data-line="' + q.id + '"]', root);
      var pool = UI.qs('[data-pool="' + q.id + '"]', root);
      var picked = [];
      if (typeof ans[q.id] === "string" && ans[q.id]) {
        /* khôi phục từ nháp */
        var rest = ans[q.id];
        q.words.forEach(function () {});
      }
      function paint() {
        line.innerHTML = picked.length ? picked.map(function (w, i) {
          return '<button class="word zh picked" data-i="' + i + '">' + UI.h(w.t) + '</button>';
        }).join('') : '<span class="sm muted">Bấm các thẻ từ bên dưới để xếp câu…</span>';
        UI.qsa(".word", line).forEach(function (b) {
          b.onclick = function () {
            var i = +b.getAttribute("data-i");
            picked[i].el.style.opacity = ""; picked[i].el.disabled = false;
            picked.splice(i, 1); sync();
          };
        });
      }
      function sync() { ans[q.id] = picked.map(function (w) { return w.t; }).join(""); paint(); refresh(); }
      UI.qsa(".word", pool).forEach(function (b) {
        b.onclick = function () {
          if (b.disabled) return;
          b.style.opacity = ".35"; b.disabled = true;
          picked.push({ t: b.getAttribute("data-w"), el: b });
          sync();
        };
      });
      paint();
    });

    /* viết đoạn */
    UI.qsa("[data-write]", root).forEach(function (t) {
      t.oninput = function () { ans[t.getAttribute("data-write")] = t.value.trim(); refresh(); };
    });

    /* ghi âm / nộp ảnh (mô phỏng) */
    UI.qsa("[data-audio]", root).forEach(function (b) {
      b.onclick = function () {
        var qid = b.getAttribute("data-audio");
        if (ans[qid]) { ans[qid] = null; b.className = "btn red"; b.innerHTML = "🎙️ Bắt đầu ghi âm"; refresh(); return; }
        b.className = "btn ghost"; b.innerHTML = "⏺ Đang ghi… bấm để dừng";
        setTimeout(function () {
          ans[qid] = "__audio__";
          b.className = "btn jade"; b.innerHTML = "✅ Đã ghi 0:47 — ghi lại";
          UI.qs('[data-audiobox="' + qid + '"]', root).classList.remove("hide");
          refresh();
        }, 900);
      };
    });
    UI.qsa("[data-photo]", root).forEach(function (b) {
      b.onclick = function () {
        var qid = b.getAttribute("data-photo");
        ans[qid] = "__photo__";
        b.className = "btn jade"; b.innerHTML = "✅ Đã chọn 1 ảnh — đổi ảnh";
        refresh();
      };
    });

    /* bảng câu hỏi */
    UI.qsa("#qmap b", root).forEach(function (c) {
      c.onclick = function () {
        var card = UI.qsa(".qcard", root)[+c.getAttribute("data-go")];
        if (card) card.scrollIntoView({ block: "center", behavior: "smooth" });
      };
    });

    /* lưu nháp */
    function saveDraft(quiet) {
      var s = Store.subOf(a.id, u.id);
      if (!s) {
        s = { id: Store.id("s"), assignmentId: a.id, studentId: u.id, status: "draft",
              at: Store.nowStr(), answers: {}, manual: {}, comments: {}, autoScore: 0, finalScore: null };
        Store.s.submissions.push(s);
      }
      s.answers = JSON.parse(JSON.stringify(ans));
      s.status = "draft";
      Store.save();
      if (!quiet) UI.toast("Đã lưu nháp.", "ok");
    }
    UI.qs("#saveDraft", root).onclick = function () { saveDraft(); };
    var auto = setInterval(function () {
      if (!document.body.contains(root)) { clearInterval(auto); return; }
      saveDraft(true);
    }, 20000);

    /* nộp bài */
    UI.qs("#submitBtn", root).onclick = function () {
      var n = refresh();
      var miss = a.questions.length - n;
      UI.modal({
        title: "Nộp bài?",
        body: '<div class="row mb">' + UI.chip(a.questions.length + " câu") + UI.chip("Đã làm " + n, "jade") +
          (miss ? UI.chip("Bỏ trống " + miss, "red") : "") + '</div>' +
          '<p>' + (miss ? '<b>Bạn còn ' + miss + ' câu chưa làm.</b> Câu bỏ trống sẽ tính 0 điểm. ' : 'Bạn đã làm hết các câu. ') +
          'Bài tập này chỉ cho nộp <b>' + a.tries + ' lần</b> — sau khi nộp sẽ không sửa lại được.</p>' +
          '<div class="mt">' + UI.alert("blue", "🤖",
            a.questions.filter(function (q) { return Store.isAuto(q); }).length +
            ' câu sẽ được chấm tự động ngay. Các câu viết/ghi âm do giáo viên chấm tay.') + '</div>',
        footer: '<button class="btn ghost" data-close>Quay lại làm tiếp</button>' +
                '<button class="btn jade" id="okSubmit">✔ Nộp bài</button>',
        onReady: function (m) {
          UI.qs("#okSubmit", m).onclick = function () {
            var s = Store.subOf(a.id, u.id);
            if (!s) {
              s = { id: Store.id("s"), assignmentId: a.id, studentId: u.id, answers: {}, manual: {}, comments: {} };
              Store.s.submissions.push(s);
            }
            s.answers = JSON.parse(JSON.stringify(ans));
            s.at = Store.nowStr();
            s.status = dueInfo(a.due).days < 0 ? "late" : "submitted";
            s.autoScore = Store.autoScore(a, s);
            s.finalScore = null;
            Store.save();
            Store.notify(Store.cls(a.classId).teacherId, "Có bài mới cần chấm",
              u.name + " vừa nộp " + a.title, "#/admin/cham");
            UI.closeModal();
            UI.toast("Đã nộp bài! Điểm tự động: " + UI.num(s.autoScore) + "/" + a.maxScore, "ok");
            UI.go("#/hv/ket-qua/" + a.id);
          };
        }
      });
    };

    /* đồng hồ đếm ngược */
    if (a.minutes) {
      var left = a.minutes * 60;
      var t = setInterval(function () {
        var c = UI.qs("#clock", root);
        if (!c || !document.body.contains(root)) { clearInterval(t); return; }
        left--;
        c.textContent = "⏱ " + Math.floor(left / 60) + ":" + ("0" + (left % 60)).slice(-2);
        if (left <= 0) { clearInterval(t); UI.toast("Hết giờ! Bài được nộp tự động.", "no"); }
      }, 1000);
    }

    refresh();
  }
};

/* -------------------------------------------------------- thẻ từng câu hỏi */
function qCard(q, i, val) {
  var head = '<div class="qno">CÂU ' + (i + 1) + ' · ' + qTypeName(q.type) + ' · ' + q.score + ' điểm' +
    (Store.isAuto(q) ? '' : ' · <span style="color:var(--gold)">giáo viên chấm tay</span>') + '</div>' +
    '<div class="qq">' + q.q + '</div>';
  var body = "";

  if (q.type === "mcq") {
    body = q.opts.map(function (o, j) {
      return '<div class="opt' + (val === j ? " on" : "") + '" data-opt="' + j + '" data-q="' + q.id + '" data-text="' + UI.h(o) + '">' +
        '<span class="k">' + String.fromCharCode(65 + j) + '</span>' +
        '<span class="zh" style="font-size:17px">' + o + '</span></div>';
    }).join('');
  } else if (q.type === "fill") {
    body = '<div style="background:var(--paper);border-radius:13px;padding:16px 18px;font-size:19px" class="zh">' +
      q.stem.replace("___", '<span class="blank" data-blank="' + q.id + '">' +
        (val !== undefined && val !== null ? UI.h(q.opts[val]) : "?") + '</span>') + '</div>' +
      '<div class="row mt wrap" style="gap:9px">' + q.opts.map(function (o, j) {
        return '<button class="word' + (val === j ? " picked" : "") + '" data-opt="' + j + '" data-q="' + q.id + '" data-text="' + UI.h(o) + '">' + UI.h(o) + '</button>';
      }).join('') + '</div>' +
      '<div class="sm muted mt">💡 Gợi ý: xem lại mục "Biến điệu của 不" ở phần Ngữ pháp.</div>';
  } else if (q.type === "order") {
    body = '<div class="sb-line" data-line="' + q.id + '"></div>' +
      '<div class="mt" data-pool="' + q.id + '">' + shuffle(q.words).map(function (w) {
        return '<button class="word zh" data-w="' + UI.h(w) + '">' + UI.h(w) + '</button>';
      }).join('') + '</div>';
  } else if (q.type === "write") {
    body = '<textarea class="inp" data-write="' + q.id + '" placeholder="Viết câu trả lời bằng chữ Hán…" ' +
      'style="font-family:var(--hanzi);font-size:16px">' + UI.h(val || "") + '</textarea>' +
      '<div class="sm muted mt">Gõ chữ Hán bằng bộ gõ Microsoft Pinyin của Windows.</div>';
  } else if (q.type === "audio") {
    body = '<div class="row wrap" style="background:var(--paper);border-radius:13px;padding:14px 17px">' +
      '<button class="btn red" data-audio="' + q.id + '">🎙️ Bắt đầu ghi âm</button>' +
      '<span class="sm muted">Tối đa 60 giây · ghi lại được nhiều lần</span>' +
      (q.say ? '<button class="spk right" data-say="' + UI.h(q.say) + '" title="Nghe mẫu">🔊</button>' : '') + '</div>' +
      '<div class="row mt hide" data-audiobox="' + q.id + '" style="background:var(--jade-soft);border-radius:11px;padding:9px 13px">' +
      '<span style="font-size:17px">▶️</span><div class="grow bar"><i style="width:100%"></i></div><span class="xs muted">0:47</span></div>';
  } else if (q.type === "photo") {
    body = '<div class="row wrap" style="background:var(--paper);border-radius:13px;padding:14px 17px">' +
      '<button class="btn blue" data-photo="' + q.id + '">🖼️ Chọn ảnh bài viết tay</button>' +
      '<span class="sm muted">JPG hoặc PNG, tối đa 5 ảnh</span></div>';
  }
  return '<div class="qcard">' + head + body + '</div>';
}
