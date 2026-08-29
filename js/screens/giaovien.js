/* ==========================================================================
   S-10 Bảng điều khiển giáo viên · S-11 Tổng quan quản trị
   ========================================================================== */

function pendingList(u) {
  var ks = u.role === "admin" ? Store.s.classes : Store.classesOfTeacher(u.id);
  var kid = {}; ks.forEach(function (k) { kid[k.id] = 1; });
  var out = [];
  Store.s.assignments.forEach(function (a) {
    if (!kid[a.classId]) return;
    Store.subsOf(a.id).forEach(function (s) { if (s.finalScore === null) out.push({ a: a, s: s }); });
  });
  return out;
}

/* ====================================================== S-10 GIÁO VIÊN */
ROUTES["gv"] = {
  roles: ["gv", "admin"],
  view: function () {
    var u = Store.me();
    var ks = Store.classesOfTeacher(u.id);
    if (!ks.length) ks = Store.s.classes.slice(0, 2);
    var pend = pendingList(u);
    var nStu = ks.reduce(function (t, k) { return t + k.students.length; }, 0);
    var cs = Store.myCourses();
    var nLes = cs.reduce(function (t, c) { return t + Store.lessonsOf(c.id).length; }, 0);
    var late = pend.filter(function (x) { return x.s.status === "late"; }).length;

    /* học viên cần chú ý */
    var weak = [];
    ks.forEach(function (k) {
      k.students.forEach(function (sid) {
        var p = Store.courseProg(sid, k.courseId);
        if (p < 60) weak.push({ u: Store.user(sid), k: k, p: p });
      });
    });
    weak.sort(function (x, y) { return x.p - y.p; });

    var todayCls = ks[0], nextCls = ks[1];
    var lesson = todayCls ? Store.lessonsOf(todayCls.courseId).filter(function (l) { return l.status === "pub"; }).slice(-1)[0] : null;

    var body = '<div class="grid g4">' +
      UI.stat("📥", "var(--red-soft)", pend.length, "Bài chờ chấm",
        late ? late + " bài nộp muộn" : "Không có bài muộn", late ? "var(--red)" : "var(--muted)") +
      UI.stat("🏫", "var(--blue-soft)", ks.length, "Lớp đang dạy", nStu + " học viên") +
      UI.stat("📚", "var(--jade-soft)", cs.length, "Giáo trình phụ trách", nLes + " bài học") +
      UI.stat("📊", "var(--gold-soft)", "86%", "Tỉ lệ nộp bài đúng hạn", "▲ +4% so với tuần trước", "var(--jade)") +
    '</div>' +

    '<div class="grid g2 mt2" style="align-items:start"><div>' +
      UI.secT("Lịch dạy hôm nay — Thứ Năm 03/09/2026") +
      (todayCls ? '<div class="card pad mb"><div class="row wrap">' + UI.chip("19:30 – 21:00", "red") +
        '<div class="grow"><div class="bb">' + UI.h(todayCls.name) + ' · Phòng ' + UI.h(todayCls.room) + '</div>' +
        '<div class="sm muted">' + (lesson ? "Bài " + lesson.no + " · " + UI.h(lesson.zh) + " — phần Ngữ pháp + Hội thoại" : "Chưa xếp bài") + '</div></div>' +
        (lesson ? '<a href="#/trinh-chieu/' + lesson.id + '" class="btn red sm">🖥️ Mở trình chiếu</a>' : '') + '</div>' +
        '<div class="row mt sm muted">👥 ' + todayCls.students.length + ' học viên · tiến độ lớp ' +
        Math.round(todayCls.students.reduce(function (t, s) { return t + Store.courseProg(s, todayCls.courseId); }, 0) / todayCls.students.length) + '%</div></div>' : '') +
      (nextCls ? '<div class="card pad"><div class="row wrap">' + UI.chip("Ngày mai · 09:00") +
        '<div class="grow"><div class="bb">' + UI.h(nextCls.name) + ' · Phòng ' + UI.h(nextCls.room) + '</div>' +
        '<div class="sm muted">Ôn tập + Kiểm tra 15 phút</div></div>' +
        '<a href="#/admin/lop/' + nextCls.id + '" class="btn ghost sm">Xem lớp</a></div></div>' : '') +

      UI.secT("Việc cần làm") + '<div class="card pad">' +
        (pend.length ? '<div class="todo"><i>!</i><div><b>Chấm ' + pend.length + ' bài</b> — ' +
          UI.h(pend[0].a.title) + '. <a href="#/admin/cham" class="red b">Chấm ngay →</a></div></div>' : '') +
        '<div class="todo"><i>2</i><div><b>' + (ks[0] ? ks[0].students.filter(function (sid) {
          return !Store.subOf("a1", sid); }).length : 0) +
          ' học viên chưa nộp</b> bài tập Bài 3 — gửi nhắc nhở?</div></div>' +
        '<div class="todo"><i>3</i><div><b>Bài 4 · 现在几点</b> vẫn là bản nháp, chưa xuất bản cho lớp. ' +
          '<a href="#/admin/soan-bai/l4" class="red b">Soạn tiếp →</a></div></div>' +
      '</div>' +
    '</div><div>' +
      UI.secT("Tỉ lệ nộp bài 7 ngày qua") +
      '<div class="card pad" style="padding-bottom:34px"><div class="mini-bars">' +
        [["T2", 78], ["T3", 84], ["T4", 71], ["T5", 90], ["T6", 86], ["T7", 64], ["CN", 58]].map(function (d) {
          return '<div style="height:' + d[1] + '%"><b>' + d[1] + '%</b><span>' + d[0] + '</span></div>';
        }).join('') + '</div></div>' +

      UI.secT("Học viên cần chú ý") +
      UI.table(["", "Học viên", "Tiến độ", "Điểm TB", ""], weak.slice(0, 5).map(function (w) {
        var av = Store.avgScore(w.u.id);
        return '<tr><td style="width:44px">' + UI.av(w.u) + '</td>' +
          '<td><div class="b">' + UI.h(w.u.name) + '</div><div class="xs muted">' + UI.h(w.k.code) + '</div></td>' +
          '<td style="width:130px"><div class="xs muted">' + w.p + '%</div>' + UI.bar(w.p, "red") + '</td>' +
          '<td class="b">' + (av === null ? "—" : UI.num(av)) + '</td>' +
          '<td style="text-align:right">' + UI.chip("Cần nhắc", "red") + '</td></tr>';
      }), 520) +
      '<a href="#/admin" class="btn ghost block mt">🛡️ Vào khu quản trị →</a>' +
    '</div></div>';

    return UI.shell({
      active: "#/gv", title: "Chào " + (u.role === "gv" ? "cô " : "") + u.name.split(" ").pop() + " 👋",
      crumb: "Bảng điều khiển giáo viên",
      actions: '<a href="#/admin/bai-tap/moi" class="btn red sm">＋ Tạo bài tập</a>', body: body
    });
  }
};

/* ====================================================== S-11 QUẢN TRỊ */
ROUTES["admin"] = {
  roles: ["admin"],
  view: function () {
    var s = Store.s;
    var nHv = s.users.filter(function (u) { return u.role === "hv"; }).length;
    var nGv = s.users.filter(function (u) { return u.role === "gv"; }).length;
    var nAd = s.users.filter(function (u) { return u.role === "admin"; }).length;
    var pend = pendingList(Store.me());
    var pub = s.courses.filter(function (c) { return c.status === "pub"; }).length;
    var run = s.classes.filter(function (c) { return c.status === "run"; }).length;
    var soon = s.classes.filter(function (c) { return c.status === "soon"; }).length;

    var body = '<div class="grid g4">' +
      UI.stat("📚", "var(--jade-soft)", s.courses.length, "Giáo trình", pub + " đang dùng · " + (s.courses.length - pub) + " nháp") +
      UI.stat("🏫", "var(--blue-soft)", s.classes.length, "Lớp học", run + " đang học · " + soon + " sắp mở") +
      UI.stat("👥", "var(--purple-soft)", s.users.length, "Người dùng", nHv + " học viên · " + nGv + " GV · " + nAd + " QT") +
      UI.stat("📥", "var(--red-soft)", pend.length, "Bài chờ chấm toàn hệ thống",
        pend.length ? "Cần xử lý sớm" : "Đã chấm hết", pend.length ? "var(--red)" : "var(--jade)") +
    '</div>' +

    '<div class="grid g2 mt2" style="align-items:start"><div>' +
      UI.secT("Giáo trình", '<a href="#/admin/giao-trinh" class="sm b red">Quản lý →</a>') +
      UI.table(["Giáo trình", "Cấp độ", "Bài", "Lớp", "Trạng thái"], s.courses.map(function (c) {
        var nk = s.classes.filter(function (k) { return k.courseId === c.id; }).length;
        return '<tr><td><div class="row"><span style="font-size:22px">' + c.emo + '</span>' +
          '<div><div class="b">' + UI.h(c.vi) + '</div><div class="xs muted zh">' + UI.h(c.zh) + '</div></div></div></td>' +
          '<td>' + UI.chip(c.level, "blue") + '</td><td class="b">' + Store.lessonsOf(c.id).length + '</td>' +
          '<td>' + nk + '</td><td>' + UI.st(c.status) + '</td></tr>';
      }), 560) +
      UI.secT("Hoạt động gần đây") + '<div class="card pad">' +
        SEED.activity.map(function (a) {
          return '<div class="todo"><i style="background:transparent;font-size:13px">' + a.ic + '</i>' +
            '<div><b>' + UI.h(a.who) + '</b> ' + a.what + '<div class="xs muted">' + a.when + '</div></div></div>';
        }).join('') + '</div>' +
    '</div><div>' +
      UI.secT("Lớp học", '<a href="#/admin/lop" class="sm b red">Quản lý →</a>') +
      UI.table(["Lớp", "Giáo viên", "Sĩ số", "Tiến độ"], s.classes.map(function (k) {
        var p = k.students.length ? Math.round(k.students.reduce(function (t, x) {
          return t + Store.courseProg(x, k.courseId); }, 0) / k.students.length) : 0;
        return '<tr><td><div class="b">' + UI.h(k.code) + '</div><div class="xs muted">' + UI.h(k.schedule) + '</div></td>' +
          '<td class="sm">' + UI.h(Store.user(k.teacherId).name) + '</td><td class="b">' + k.students.length + '</td>' +
          '<td style="width:120px"><div class="xs muted">' + p + '%</div>' + UI.bar(p, p < 40 ? "gold" : "") + '</td></tr>';
      }), 480) +
      UI.secT("Tỉ lệ nộp bài theo lớp — tuần này") +
      '<div class="card pad" style="padding-bottom:34px"><div class="mini-bars">' +
        [["A01", 89], ["B02", 76], ["C01", 94], ["D01", 52], ["A00", 100]].map(function (d) {
          return '<div style="height:' + d[1] + '%"><b>' + d[1] + '%</b><span>' + d[0] + '</span></div>';
        }).join('') + '</div></div>' +
      '<div class="mt2">' + UI.alert("gold", "🛡️",
        '<b>Quyền hạn.</b> Giáo viên chỉ thấy giáo trình và lớp mình phụ trách. ' +
        'Quản trị viên thấy toàn hệ thống và là người duy nhất tạo, đổi vai trò, khoá tài khoản.') + '</div>' +
    '</div></div>';

    return UI.shell({ active: "#/admin", title: "Tổng quan hệ thống", crumb: "Quản trị",
      actions: '<a href="#/admin/bai-tap/moi" class="btn red sm">＋ Tạo bài tập</a>', body: body });
  }
};
