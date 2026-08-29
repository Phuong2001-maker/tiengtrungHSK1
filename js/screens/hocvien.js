/* ==========================================================================
   S-03 Trang chủ học viên · S-04 Giáo trình · S-07 Bài tập · S-09 Kết quả
   ========================================================================== */

/* "hôm nay" của bản demo — để các mốc hạn nộp luôn khớp với dữ liệu mẫu */
var TODAY = new Date(2026, 8, 3);

function parseDue(s) {
  var m = String(s).match(/(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{2}):(\d{2}))?/);
  if (!m) return null;
  return new Date(+m[3], +m[2] - 1, +m[1], m[4] ? +m[4] : 23, m[5] ? +m[5] : 59);
}
function dueInfo(s) {
  var d = parseDue(s); if (!d) return { text: "—", cls: "grey", days: 99 };
  var days = Math.ceil((d - TODAY) / 86400000);
  if (days < 0) return { text: "Đã quá hạn " + (-days) + " ngày", cls: "red", days: days };
  if (days === 0) return { text: "Hạn hôm nay", cls: "red", days: 0 };
  if (days <= 2) return { text: "⏰ Còn " + days + " ngày", cls: "red", days: days };
  if (days <= 7) return { text: "Còn " + days + " ngày", cls: "gold", days: days };
  return { text: "Còn " + days + " ngày", cls: "grey", days: days };
}

/* trạng thái bài tập với một học viên */
function subState(a, uid) {
  var s = Store.subOf(a.id, uid);
  if (!s) return { key: "none", sub: null };
  if (s.finalScore !== null) return { key: "graded", sub: s };
  return { key: s.status === "draft" ? "draftS" : s.status, sub: s };
}

/* ========================================================== S-03 TRANG CHỦ */
ROUTES["hv"] = {
  roles: ["hv"],
  view: function () {
    var u = Store.me();
    var ks = Store.classesOfStudent(u.id);
    var k = ks[0];
    var course = k ? Store.course(k.courseId) : null;
    var lessons = course ? Store.lessonsOf(course.id).filter(function (l) { return l.status === "pub"; }) : [];
    var doneN = lessons.filter(function (l) { return Store.prog(u.id, l.id) >= 5; }).length;
    var cur = lessons.filter(function (l) { return Store.prog(u.id, l.id) < 5; })[0] || lessons[0];
    var todo = Store.asgOfStudent(u.id).filter(function (a) {
      var st = subState(a, u.id).key; return st === "none" || st === "draftS";
    }).sort(function (x, y) { return parseDue(x.due) - parseDue(y.due); });
    var avg = Store.avgScore(u.id);
    var fbs = Store.fbOfStudent(u.id);
    var lastFb = fbs[fbs.length - 1];

    var body = '<div class="grid g4">' +
      UI.stat("📝", "var(--red-soft)", todo.length, "Bài tập cần nộp",
        todo.length ? dueInfo(todo[0].due).text + " — gần nhất" : "Bạn đã nộp hết 👏",
        todo.length ? "var(--red)" : "var(--jade)") +
      UI.stat("📚", "var(--jade-soft)", doneN + '<span class="muted" style="font-size:19px">/' + lessons.length + '</span>',
        "Bài đã hoàn thành", "▲ Tiến độ " + Store.courseProg(u.id, course ? course.id : "") + "%", "var(--jade)") +
      UI.stat("🎯", "var(--blue-soft)", avg === null ? "—" : UI.num(avg), "Điểm trung bình",
        avg === null ? "Chưa có bài nào được chấm" : "Trên thang 10", "var(--muted)") +
      UI.stat("🔥", "var(--gold-soft)", 12, "Ngày học liên tiếp", "Giữ chuỗi nhé!") +
    '</div>';

    if (lastFb) {
      var la = Store.asg(lastFb.assignmentId), ls = la ? Store.subOf(la.id, u.id) : null;
      body += '<div class="mt2">' + UI.alert("gold", "💬",
        '<b>' + UI.h(Store.user(lastFb.teacherId).name) + ' vừa gửi ghi chú cho bạn</b> — ' +
        UI.h(la ? la.title : "") + (ls && ls.finalScore !== null ? ' đã được chấm: <b>' + UI.num(ls.finalScore) + '/10</b>.' : '.') +
        (lastFb.weak.length ? ' Cô có ghi <b>' + lastFb.weak.length + ' phần</b> cần luyện thêm.' : '') +
        ' <a href="#/hv/ket-qua/' + lastFb.assignmentId + '" class="red b">Xem ngay →</a>') + '</div>';
    }

    if (cur) {
      var pr = Store.prog(u.id, cur.id);
      body += UI.secT("Tiếp tục học", '<a href="#/hv/giao-trinh" class="sm b red">Xem cả giáo trình →</a>') +
      '<div class="hero" data-bg="' + UI.h(cur.zh) + '">' +
        '<div class="row">' + UI.chip("BÀI " + cur.no + " · " + (pr >= 5 ? "ĐÃ HỌC XONG" : "ĐANG HỌC"), "chip-w") + '</div>' +
        '<div class="zh-b" style="margin-top:10px">' + UI.h(cur.zh) + '</div>' +
        '<div style="font-size:17px;font-weight:600;opacity:.95">' + UI.h(cur.py) + ' — ' + UI.h(cur.vi) + '</div>' +
        '<div class="mrow"><span>🎯 ' + cur.vocab.length + ' từ mới</span><span>📖 ' + cur.dialogues.length + ' hội thoại</span>' +
          '<span>✏️ ' + cur.grammar.length + ' điểm ngữ pháp</span><span>✅ Đã xong ' + pr + '/5 phần</span></div>' +
        '<div style="margin-top:18px"><a href="#/hoc/' + cur.id + '" class="btn ghost">▶ ' +
          (pr >= 5 ? "Học lại từ đầu" : "Học tiếp") + '</a></div>' +
      '</div>';
    }

    body += '<div class="grid g2 mt2" style="align-items:start"><div>' +
      UI.secT("Bài tập sắp đến hạn") +
      (todo.length ? todo.slice(0, 3).map(function (a) {
        var d = dueInfo(a.due);
        return '<div class="card pad mb"><div class="row wrap"><div class="grow">' +
          '<div class="b">' + UI.h(a.title) + '</div>' +
          '<div class="sm muted">' + UI.h(Store.cls(a.classId).code) + ' · ' + a.questions.length + ' câu' +
          (a.minutes ? ' · ' + a.minutes + ' phút' : '') + '</div></div>' +
          UI.chip(d.text, d.cls) + '</div>' +
          '<div class="row mt"><span class="sm muted">Hạn: ' + UI.h(a.due) + '</span>' +
          '<a href="#/hv/lam-bai/' + a.id + '" class="btn red sm right">Làm bài</a></div></div>';
      }).join('') : '<div class="card pad empty">🎉 Bạn không còn bài tập nào chưa nộp.</div>') +
    '</div><div>' + UI.secT("Lớp của tôi") +
      (k ? '<div class="card pad">' +
        '<div class="row">' + UI.chip(k.code, "blue") + UI.chip("Tuần " + k.week + "/" + k.weeks, "grey") + '</div>' +
        '<div class="bb mt" style="font-size:17px">' + UI.h(k.name) + '</div>' +
        '<div class="sm muted">Giáo trình: ' + UI.h(course.vi) + '</div>' +
        '<div class="row mt">' + UI.av(Store.user(k.teacherId), 38) +
          '<div><div class="b sm">' + UI.h(Store.user(k.teacherId).name) + '</div>' +
          '<div class="xs muted">Giáo viên chủ nhiệm</div></div></div>' +
        '<div class="row mt"><span class="sm muted grow">Tiến độ của bạn</span><span class="sm b">' +
          Store.courseProg(u.id, course.id) + '%</span></div>' + UI.bar(Store.courseProg(u.id, course.id)) +
        '<div class="row mt sm muted">🗓️ ' + UI.h(k.schedule) + ' · Phòng ' + UI.h(k.room) + '</div>' +
        '<a href="#/hv/giao-trinh/' + course.id + '" class="btn ghost block mt">📚 Mở giáo trình</a>' +
      '</div>' : '<div class="card pad empty">Bạn chưa được xếp vào lớp nào.</div>') +
    '</div></div>';

    return UI.shell({ active: "#/hv", title: "Chào " + u.name.split(" ").pop() + " 👋", crumb: "Trang chủ", body: body });
  }
};

/* ====================================================== S-04 GIÁO TRÌNH */
ROUTES["hv/giao-trinh"] = {
  roles: ["hv"],
  view: function () {
    var cs = Store.myCourses();
    if (cs.length === 1) { setTimeout(function () { UI.go("#/hv/giao-trinh/" + cs[0].id); }, 0); }
    var body = UI.secT("Giáo trình bạn đang học") + '<div class="grid g2">' +
      cs.map(function (c) {
        var p = Store.courseProg(Store.me().id, c.id);
        return '<a class="card pad" href="#/hv/giao-trinh/' + c.id + '">' +
          '<div class="row"><span style="font-size:34px">' + c.emo + '</span>' +
          '<div class="grow"><div class="bb" style="font-size:17px">' + UI.h(c.vi) + '</div>' +
          '<div class="sm muted zh">' + UI.h(c.zh) + '</div></div>' + UI.chip(c.level, "blue") + '</div>' +
          '<div class="row mt"><span class="sm muted grow">Tiến độ</span><span class="sm b">' + p + '%</span></div>' +
          UI.bar(p) + '</a>';
      }).join('') + '</div>';
    return UI.shell({ active: "#/hv/giao-trinh", title: "Giáo trình của tôi", crumb: "Học tập", body: body });
  }
};

ROUTES["hv/giao-trinh/:cid"] = {
  roles: ["hv"],
  view: function (p) {
    var u = Store.me(), c = Store.course(p.cid);
    if (!c) return UI.shell({ active: "#/hv/giao-trinh", title: "Không tìm thấy", crumb: "", body: '<div class="empty">Giáo trình không tồn tại.</div>' });
    var ls = Store.lessonsOf(c.id);
    var pub = ls.filter(function (l) { return l.status === "pub"; });
    var doneN = pub.filter(function (l) { return Store.prog(u.id, l.id) >= 5; }).length;
    var nums = ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十", "十一", "十二"];
    var totalW = pub.reduce(function (s, l) { return s + l.vocab.length; }, 0);

    var body = '<div class="hero" data-bg="' + UI.h(c.zh.split(" ")[0]) + '">' +
      '<div class="row">' + UI.chip(c.level + " · " + ls.length + " BÀI", "chip-w") + '</div>' +
      '<div class="zh-b" style="margin-top:10px">' + UI.h(c.zh) + '</div>' +
      '<h2 style="font-size:19px;font-weight:600">' + UI.h(c.vi) + '</h2>' +
      '<p>' + UI.h(c.desc) + '</p>' +
      '<div class="mrow"><span>' + c.emo + ' ' + ls.length + ' bài học</span><span>🎯 ' + totalW + ' từ vựng</span>' +
        '<span>👩‍🏫 ' + UI.h(Store.user(c.teacherId).name) + '</span><span>✅ Bạn đã xong ' + doneN + '/' + pub.length + '</span></div></div>' +

    '<div class="row mt2 wrap"><span class="chip jade">Tất cả (' + ls.length + ')</span>' +
      '<span class="chip">Đã học (' + doneN + ')</span>' +
      '<span class="chip">Chưa mở (' + (ls.length - pub.length) + ')</span>' +
      '<span class="right sm muted">Tiến độ giáo trình</span><b class="sm">' + Store.courseProg(u.id, c.id) + '%</b>' +
      '<span style="width:120px">' + UI.bar(Store.courseProg(u.id, c.id)) + '</span></div>' +

    '<div class="grid mt" style="gap:12px">' + ls.map(function (l) {
      var pr = Store.prog(u.id, l.id), pct = Math.round(pr / 5 * 100);
      var locked = l.status !== "pub";
      var cls = locked ? "lock" : (pr >= 5 ? "done" : "");
      var stc = locked ? ["grey", "🔒 Chưa mở"] : pr >= 5 ? ["jade", "✓ Đã học"] : pr > 0 ? ["red", "● Đang học"] : ["", "Chưa bắt đầu"];
      return '<div class="lcard ' + cls + '">' +
        '<div class="no zh">' + (nums[l.no - 1] || l.no) + '</div>' +
        '<div class="grow"><div class="zh-t">' + UI.h(l.zh) + '</div>' +
        '<div class="py">' + UI.h(l.py) + '</div><div class="vi">' + UI.h(l.vi) + '</div>' +
        '<div class="meta">' + UI.chip("🎯 " + l.vocab.length + " từ") +
          UI.chip("💬 " + l.dialogues.length + " hội thoại") + UI.chip(stc[1], stc[0]) + '</div></div>' +
        '<div style="width:130px;text-align:right"><div class="sm b" style="margin-bottom:5px">' + pct + '%</div>' +
          UI.bar(pct, pr > 0 && pr < 5 ? "gold" : "") + '</div>' +
        (locked ? '<button class="btn ghost sm" disabled>Chưa mở</button>'
                : '<a href="#/hoc/' + l.id + '" class="btn ' + (pr > 0 && pr < 5 ? "red" : "ghost") + ' sm">' +
                  (pr >= 5 ? "Xem lại" : pr > 0 ? "▶ Học tiếp" : "▶ Bắt đầu") + '</a>') +
      '</div>';
    }).join('') + '</div>';

    return UI.shell({ active: "#/hv/giao-trinh", title: c.vi, crumb: "Giáo trình của tôi", body: body });
  }
};

/* ====================================================== S-07 BÀI TẬP CỦA TÔI */
ROUTES["hv/bai-tap"] = {
  roles: ["hv"],
  view: function () {
    var u = Store.me();
    var list = Store.asgOfStudent(u.id).sort(function (a, b) { return parseDue(b.due) - parseDue(a.due); });
    var cnt = { todo: 0, wait: 0, done: 0 };
    list.forEach(function (a) {
      var k = subState(a, u.id).key;
      if (k === "none" || k === "draftS") cnt.todo++;
      else if (k === "graded") cnt.done++; else cnt.wait++;
    });
    var scored = list.map(function (a) { return subState(a, u.id).sub; })
      .filter(function (s) { return s && s.finalScore !== null; });
    var avg = scored.length ? scored.reduce(function (t, s) { return t + s.finalScore; }, 0) / scored.length : null;

    var rows = list.map(function (a) {
      var s = subState(a, u.id), k = Store.cls(a.classId), d = dueInfo(a.due);
      var done = s.key === "graded";
      var doing = s.key === "none" || s.key === "draftS";
      return '<tr data-f="' + (doing ? "todo" : done ? "done" : "wait") + '">' +
        '<td><div class="b">' + UI.h(a.title) + '</div><div class="xs muted">' + a.questions.length + ' câu' +
          (a.minutes ? ' · ' + a.minutes + ' phút' : '') + ' · ' + a.tries + ' lần làm</div></td>' +
        '<td>' + UI.chip(k.code, "blue") + '</td>' +
        '<td>' + UI.h(a.due) + '<div class="xs ' + (d.cls === "red" ? "red b" : "muted") + '">' + d.text + '</div></td>' +
        '<td>' + UI.st(s.key) + '</td>' +
        '<td class="bb">' + (done ? UI.num(s.sub.finalScore) + "/10" : "—") + '</td>' +
        '<td style="text-align:right">' + (doing
          ? '<a class="btn red sm" href="#/hv/lam-bai/' + a.id + '">' + (s.key === "draftS" ? "Làm tiếp" : "Làm bài") + '</a>'
          : '<a class="btn ghost sm" href="#/hv/ket-qua/' + a.id + '">' + (done ? "Xem kết quả" : "Xem bài đã nộp") + '</a>') +
        '</td></tr>';
    });

    var body = '<div class="row wrap mb" id="fBar">' +
      '<span class="chip btn-like on" data-f="all">Tất cả (' + list.length + ')</span>' +
      '<span class="chip btn-like red" data-f="todo">Cần làm (' + cnt.todo + ')</span>' +
      '<span class="chip btn-like" data-f="wait">Đã nộp, chờ chấm (' + cnt.wait + ')</span>' +
      '<span class="chip btn-like" data-f="done">Đã chấm (' + cnt.done + ')</span>' +
      '<span class="right sm muted">Điểm trung bình <b class="b" style="color:var(--ink)">' +
        (avg === null ? "—" : UI.num(avg)) + '</b></span></div>' +
      UI.table(["Bài tập", "Lớp", "Hạn nộp", "Trạng thái", "Điểm", ""], rows, 780) +
      '<div class="mt2">' + UI.alert("blue", "📌",
        'Bài tập được <b>giáo viên giao cho lớp</b> — bạn tự động nhận được ngay khi giáo viên bấm "Giao bài". ' +
        'Hệ thống gửi kèm thông báo trong ứng dụng và email.') + '</div>';

    return UI.shell({ active: "#/hv/bai-tap", title: "Bài tập của tôi", crumb: "Học tập", body: body });
  },
  init: function (root) {
    UI.qsa("#fBar .chip", root).forEach(function (c) {
      c.onclick = function () {
        UI.qsa("#fBar .chip", root).forEach(function (x) { x.classList.remove("on"); });
        c.classList.add("on");
        var f = c.getAttribute("data-f");
        UI.qsa("tbody tr", root).forEach(function (tr) {
          tr.style.display = (f === "all" || tr.getAttribute("data-f") === f) ? "" : "none";
        });
      };
    });
  }
};

/* ====================================================== S-09 KẾT QUẢ (danh sách) */
ROUTES["hv/ket-qua"] = {
  roles: ["hv"],
  view: function () {
    var u = Store.me();
    var list = Store.asgOfStudent(u.id).filter(function (a) {
      var s = Store.subOf(a.id, u.id); return s && s.finalScore !== null;
    });
    var body = list.length ? '<div class="grid g2">' + list.map(function (a) {
      var s = Store.subOf(a.id, u.id), fb = Store.fbOf(a.id, u.id);
      var cls = s.finalScore >= 8 ? "" : s.finalScore >= 6.5 ? "mid" : "low";
      return '<a class="card pad" href="#/hv/ket-qua/' + a.id + '">' +
        '<div class="row"><div class="grow"><div class="bb">' + UI.h(a.title) + '</div>' +
        '<div class="sm muted">' + UI.h(Store.cls(a.classId).code) + ' · nộp ' + UI.h(s.at) + '</div></div>' +
        '<div class="score ' + cls + '" style="padding:10px 18px;border-radius:14px"><div class="num" style="font-size:28px">' +
          UI.num(s.finalScore) + '<small>/10</small></div></div></div>' +
        (fb ? '<div class="mt sm">' + UI.chip("💬 Có ghi chú của giáo viên", "gold") +
          (fb.weak.length ? ' ' + UI.chip(fb.weak.length + " phần chưa đạt", "red") : '') + '</div>' : '') +
        '</a>';
    }).join('') + '</div>' : '<div class="card pad empty">Chưa có bài nào được chấm.</div>';
    return UI.shell({ active: "#/hv/ket-qua", title: "Kết quả & ghi chú", crumb: "Học tập", body: body });
  }
};

/* ====================================================== S-09 KẾT QUẢ (chi tiết) */
ROUTES["hv/ket-qua/:aid"] = {
  roles: ["hv"],
  view: function (p) {
    var u = Store.me(), a = Store.asg(p.aid);
    if (!a) return UI.shell({ active: "#/hv/ket-qua", title: "Không tìm thấy", crumb: "", body: '<div class="empty">Bài tập không tồn tại.</div>' });
    var s = Store.subOf(a.id, u.id), fb = Store.fbOf(a.id, u.id);
    if (!s) return UI.shell({ active: "#/hv/ket-qua", title: a.title, crumb: "", body: '<div class="empty">Bạn chưa nộp bài này.</div>' });
    var graded = s.finalScore !== null;
    var teacher = Store.user(Store.cls(a.classId).teacherId);

    /* điểm theo mảng kiến thức */
    var byTag = {};
    a.questions.forEach(function (q) {
      var t = q.tag || "Khác";
      byTag[t] = byTag[t] || { got: 0, max: 0, n: 0, ok: 0 };
      byTag[t].max += q.score; byTag[t].n++;
      var c = Store.correct(q, s.answers[q.id]);
      if (c === true) { byTag[t].got += q.score; byTag[t].ok++; }
      else if (c === null && s.manual && s.manual[q.id] !== undefined) {
        byTag[t].got += Number(s.manual[q.id]);
        if (s.manual[q.id] >= q.score * 0.7) byTag[t].ok++;
      }
    });
    var okN = a.questions.filter(function (q) { return Store.correct(q, s.answers[q.id]) === true; }).length;
    var autoN = a.questions.filter(function (q) { return Store.isAuto(q); }).length;
    var cls = !graded ? "mid" : s.finalScore >= 8 ? "" : s.finalScore >= 6.5 ? "mid" : "low";

    var body = UI.backLink("#/hv/bai-tap", "Bài tập của tôi") +
    '<div class="score ' + cls + ' mt">' +
      '<div><div class="num">' + (graded ? UI.num(s.finalScore) : "…") + '<small>/10</small></div>' +
      '<div class="b" style="opacity:.9;margin-top:4px">' +
        (graded ? (s.finalScore >= 8 ? "Tốt — giữ phong độ nhé!" : s.finalScore >= 6.5 ? "Khá — cần luyện thêm ngữ pháp" : "Cần cố gắng thêm") : "Đang chờ giáo viên chấm") +
      '</div></div>' +
      '<div style="border-left:1px solid rgba(255,255,255,.28);padding-left:26px;flex:1">' +
      '<div class="row wrap" style="gap:22px">' +
        '<div><div class="xs" style="opacity:.75">Bài tập</div><div class="b">' + UI.h(a.title) + '</div></div>' +
        '<div><div class="xs" style="opacity:.75">Nộp lúc</div><div class="b">' + UI.h(s.at) + '</div></div>' +
        '<div><div class="xs" style="opacity:.75">Chấm bởi</div><div class="b">' + UI.h(teacher.name) + '</div></div>' +
        '<div><div class="xs" style="opacity:.75">Đúng</div><div class="b">' + okN + '/' + autoN + ' câu tự chấm</div></div>' +
      '</div></div></div>' +

    '<div class="grid g2 mt2" style="align-items:start"><div>' +
      UI.secT("Điểm theo từng phần") + '<div class="card pad">' +
      Object.keys(byTag).map(function (t) {
        var b = byTag[t], pct = b.max ? Math.round(b.got / b.max * 100) : 0;
        return '<div style="margin-bottom:13px"><div class="row"><span class="sm b grow">' + UI.h(t) + '</span>' +
          '<span class="sm muted">' + UI.num(b.got) + '/' + b.max + ' điểm</span></div>' +
          UI.bar(pct, pct >= 80 ? "" : pct >= 50 ? "gold" : "red") + '</div>';
      }).join('') + '</div>' +

      UI.secT("Xem lại từng câu") +
      a.questions.map(function (q, i) {
        var v = s.answers[q.id], c = Store.correct(q, v);
        var cm = (s.comments || {})[q.id];
        var pts = c === true ? q.score : (s.manual && s.manual[q.id] !== undefined ? Number(s.manual[q.id]) : 0);
        return '<div class="qcard"><div class="qno">CÂU ' + (i + 1) + ' · ' + qTypeName(q.type) + ' ' +
          UI.chip((c === true ? "+" : "") + UI.num(pts) + "/" + q.score + " điểm", c === true ? "jade" : (pts > 0 ? "gold" : "red")) + '</div>' +
          '<div class="qq">' + q.q + '</div>' + reviewAnswer(q, v, c) +
          (cm ? '<div class="mt">' + UI.alert("gold", "✍️", '<b>' + UI.h(teacher.name) + ' ghi ở câu này:</b> ' + UI.h(cm)) + '</div>' : '') +
        '</div>';
      }).join('') +
    '</div><div>' +
      UI.secT("Ghi chú của giáo viên", '<span class="priv">🔒 Chỉ mình bạn thấy</span>') +
      (fb ? '<div class="note-box">' +
        '<div class="row mb">' + UI.av(teacher, 42) + '<div><div class="bb">' + UI.h(teacher.name) + '</div>' +
        '<div class="xs muted">Gửi lúc ' + UI.h(fb.sentAt) + ' · Lớp ' + UI.h(Store.cls(a.classId).code) + '</div></div></div>' +
        '<p style="font-size:14.5px">' + UI.h(fb.body) + '</p>' +
        (fb.weak.length ? '<div class="weak"><div class="b sm" style="color:var(--red-dark);margin-bottom:9px">⚠️ PHẦN CHƯA ĐẠT — CẦN HỌC LẠI</div>' +
          '<div class="row wrap" style="gap:7px">' + fb.weak.map(function (w) {
            return '<a class="chip red" href="#/hoc/' + a.lessonId + '/' + tagToTab(w) + '">' + UI.h(w) + ' →</a>';
          }).join('') + '</div>' +
          '<div class="sm" style="margin-top:11px">Bấm vào thẻ để mở thẳng mục cần học lại trong bài.</div></div>' : '') +
        (fb.todos.length ? '<div class="bb sm" style="margin:17px 0 5px">📋 VIỆC CẦN LÀM TRƯỚC BUỔI SAU</div>' +
          fb.todos.map(function (t, i) {
            return '<div class="todo"><i>' + (i + 1) + '</i><div>' + UI.h(t) + '</div></div>';
          }).join('') : '') +
        (fb.allowReply ? '<div class="divider"></div>' +
          '<div class="sm muted mb">Em có thắc mắc gì không?</div>' +
          '<input class="inp" id="fbReply" placeholder="Trả lời ' + UI.h(teacher.name) + '…">' +
          '<button class="btn red sm mt" id="fbSend">Gửi phản hồi</button>' : '') +
      '</div>' : '<div class="card pad empty">Giáo viên chưa gửi ghi chú cho bài này.</div>') +
      '<div class="mt">' + UI.alert("blue", "🔐",
        'Ghi chú này là <b>riêng tư</b>. Các bạn khác trong lớp không nhìn thấy nhận xét dành cho bạn, và bạn cũng không thấy của họ.') + '</div>' +
    '</div></div>';

    return UI.shell({ active: "#/hv/ket-qua", title: "Kết quả & ghi chú", crumb: "Bài tập · " + a.title, body: body });
  },
  init: function (root) {
    var b = UI.qs("#fbSend", root);
    if (b) b.onclick = function () {
      var v = UI.qs("#fbReply").value.trim();
      if (!v) { UI.toast("Bạn chưa viết gì cả.", "no"); return; }
      UI.qs("#fbReply").value = "";
      UI.toast("Đã gửi phản hồi cho giáo viên.", "ok");
    };
  }
};

/* -------------------------------------------------------------- phụ trợ */
function qTypeName(t) {
  return { mcq: "TRẮC NGHIỆM", fill: "ĐIỀN TỪ", order: "SẮP XẾP CÂU", match: "NỐI TỪ",
           write: "VIẾT ĐOẠN", audio: "GHI ÂM", photo: "NỘP ẢNH" }[t] || t.toUpperCase();
}
function tagToTab(tag) {
  if (/Từ vựng/.test(tag)) return "vocab";
  if (/Ngữ pháp|Biến điệu|Trật tự/.test(tag)) return "grammar";
  if (/Hội thoại/.test(tag)) return "dialogue";
  if (/Phát âm/.test(tag)) return "vocab";
  return "practice";
}
function reviewAnswer(q, v, c) {
  if (q.type === "mcq" || q.type === "fill") {
    var opts = q.opts || [];
    return opts.map(function (o, i) {
      var cl = i === q.ans ? "ok" : (i === v ? "no" : "");
      var tag = i === v && i === q.ans ? '<span class="right sm b jade">✔ Bạn chọn — Đúng</span>'
        : i === v ? '<span class="right sm b red">✕ Bạn chọn</span>'
        : i === q.ans ? '<span class="right sm b jade">Đáp án đúng</span>' : '';
      if (!cl && i !== v) return '';
      return '<div class="opt ' + cl + '"><span class="k">' + String.fromCharCode(65 + i) + '</span>' +
        '<span class="zh" style="font-size:17px">' + o + '</span>' + tag + '</div>';
    }).join('');
  }
  if (q.type === "order") {
    return (v ? '<div class="opt ' + (c ? "ok" : "no") + '"><span class="k">' + (c ? "✓" : "✕") + '</span>' +
      '<div><div class="xs muted">Bạn viết</div><span class="zh" style="font-size:17px">' + UI.h(v) + '</span></div></div>' : '') +
      (c ? '' : '<div class="opt ok"><span class="k">✓</span><div><div class="xs muted">Đáp án đúng</div>' +
        '<span class="zh" style="font-size:17px">' + UI.h(q.ans) + '</span></div></div>');
  }
  if (q.type === "write") {
    return '<div class="zh" style="font-size:16px;background:var(--paper);border-radius:11px;padding:11px 14px">' + UI.h(v || "(chưa làm)") + '</div>';
  }
  if (q.type === "audio") {
    return '<div class="row" style="background:var(--paper);border-radius:11px;padding:9px 13px">' +
      '<span style="font-size:17px">▶️</span><div class="grow bar"><i style="width:38%"></i></div>' +
      '<span class="xs muted">0:47</span></div>';
  }
  if (q.type === "photo") {
    return '<div class="alert blue"><span class="ai">🖼️</span><div>Ảnh bài viết tay đã nộp — giáo viên chấm tay.</div></div>';
  }
  return "";
}
