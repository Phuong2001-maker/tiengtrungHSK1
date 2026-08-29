/* ==========================================================================
   S-10 Bảng điều khiển giáo viên
   ========================================================================== */

function pendingList(u) {
  var ks = Store.classesOfTeacher(u.id);
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
  roles: ["gv"],
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
    var lesson = todayCls ? Store.lessonsOf(todayCls.courseId).slice(-1)[0] : null;

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
        '<div class="todo"><i>3</i><div><b>Bài 4 · 现在几点</b> chưa có từ mới nào — học viên vào sẽ thấy bài trống. ' +
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
      UI.secT("Hoạt động gần đây") + '<div class="card pad">' +
        SEED.activity.map(function (a) {
          return '<div class="todo"><i style="background:transparent;font-size:13px">' + a.ic + '</i>' +
            '<div><b>' + UI.h(a.who) + '</b> ' + a.what + '<div class="xs muted">' + a.when + '</div></div></div>';
        }).join('') + '</div>' +
    '</div></div>';

    return UI.shell({
      active: "#/gv", title: "Chào " + u.name.split(" ").pop() + " 👋",
      crumb: "Bảng điều khiển giáo viên",
      actions: '<a href="#/admin/bai-tap/moi" class="btn red sm">＋ Tạo bài tập</a>', body: body
    });
  }
};
