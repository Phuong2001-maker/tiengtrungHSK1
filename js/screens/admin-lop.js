/* ==========================================================================
   S-15 Danh sách lớp học · S-16 Chi tiết lớp và thêm học viên
   ========================================================================== */

function classProg(k) {
  if (!k.students.length) return 0;
  return Math.round(k.students.reduce(function (t, s) { return t + Store.courseProg(s, k.courseId); }, 0) / k.students.length);
}

/* ====================================================== S-15 DANH SÁCH LỚP */
ROUTES["admin/lop"] = {
  roles: ["gv"],
  view: function () {
    var u = Store.me();
    var ks = Store.classesOfTeacher(u.id);

    var rows = ks.map(function (k) {
      var p = classProg(k);
      return '<tr><td class="b sm">' + UI.h(k.code) + '</td>' +
        '<td class="b">' + UI.h(k.name) + '</td>' +
        '<td class="sm">' + UI.h(Store.course(k.courseId).vi) + '</td>' +
        '<td class="sm">' + UI.h(Store.user(k.teacherId).name) + '</td>' +
        '<td class="b">' + k.students.length + '</td>' +
        '<td class="sm muted">' + UI.h(k.schedule) + '</td>' +
        '<td style="width:120px"><div class="xs muted">' + p + '%</div>' +
          UI.bar(p, p < 40 ? "gold" : (p === 100 ? "blue" : "")) + '</td>' +
        '<td>' + UI.st(k.status) + '</td>' +
        '<td style="text-align:right"><a class="btn ghost sm" href="#/admin/lop/' + k.id + '">Mở</a></td></tr>';
    });

    var body = UI.table(["Mã lớp", "Tên lớp", "Giáo trình", "Giáo viên", "Sĩ số", "Lịch học", "Tiến độ", "Trạng thái", ""], rows, 1080);

    return UI.shell({ active: "#/admin/lop", title: "Lớp học", crumb: "Quản lý",
      actions: '<button class="btn red sm" id="newClass">＋ Tạo lớp</button>', body: body });
  },
  init: function (root) {
    UI.qs("#newClass", root).onclick = function () {
      var cs = Store.myCourses(), gvs = Store.s.users.filter(function (u) { return u.role === "gv"; });
      UI.modal({
        title: "Tạo lớp học mới",
        body: '<div class="fld"><label>Mã lớp *</label><input class="inp" id="nkCode" placeholder="vd: HSK1-C03"></div>' +
          '<div class="fld"><label>Tên lớp *</label><input class="inp" id="nkName" placeholder="vd: HSK 1 — Ca tối C03"></div>' +
          '<div class="fld"><label>Giáo trình *</label><select class="inp" id="nkCourse">' +
            cs.map(function (c) { return '<option value="' + c.id + '">' + UI.h(c.vi) + '</option>'; }).join('') + '</select></div>' +
          '<div class="fld"><label>Giáo viên phụ trách</label><select class="inp" id="nkGv">' +
            gvs.map(function (g) { return '<option value="' + g.id + '"' + (g.id === Store.me().id ? ' selected' : '') + '>' + UI.h(g.name) + '</option>'; }).join('') + '</select></div>' +
          '<div class="grid g2" style="gap:0 14px">' +
          '<div class="fld"><label>Lịch học</label><input class="inp" id="nkSch" placeholder="Tối 2 · 4 · 6 — 19h30"></div>' +
          '<div class="fld"><label>Phòng</label><input class="inp" id="nkRoom" placeholder="204"></div></div>',
        footer: '<button class="btn ghost" data-close>Huỷ</button><button class="btn red" id="nkOk">Tạo lớp</button>',
        onReady: function (m) {
          UI.qs("#nkOk", m).onclick = function () {
            var code = UI.qs("#nkCode", m).value.trim(), name = UI.qs("#nkName", m).value.trim();
            if (!code || !name) { UI.toast("Cần nhập mã lớp và tên lớp.", "no"); return; }
            var k = { id: Store.id("k"), code: code, name: name,
              courseId: UI.qs("#nkCourse", m).value, teacherId: UI.qs("#nkGv", m).value,
              schedule: UI.qs("#nkSch", m).value.trim() || "Chưa xếp lịch",
              room: UI.qs("#nkRoom", m).value.trim() || "—",
              start: Store.nowStr().split(" ")[0], end: "—", status: "soon", week: 0, weeks: 16, students: [] };
            Store.s.classes.push(k); Store.save();
            UI.closeModal(); UI.toast("Đã tạo lớp " + code + ".", "ok");
            UI.go("#/admin/lop/" + k.id);
          };
        }
      });
    };
  }
};

/* ====================================================== S-16 CHI TIẾT LỚP */
var CLASS_TAB = "hv";
ROUTES["admin/lop/:kid"] = {
  roles: ["gv"],
  view: function (p) {
    var k = Store.cls(p.kid);
    if (!k) return UI.shell({ active: "#/admin/lop", title: "Không tìm thấy", crumb: "", body: '<div class="empty">Lớp không tồn tại.</div>' });
    var c = Store.course(k.courseId);
    var asgs = Store.asgOfClass(k.id);
    var scores = [];
    k.students.forEach(function (sid) { var a = Store.avgScore(sid); if (a !== null) scores.push(a); });
    var avg = scores.length ? scores.reduce(function (t, x) { return t + x; }, 0) / scores.length : null;
    var openN = asgs.filter(function (a) { return a.status === "open"; }).length;

    var tabs = [["hv", "Học viên (" + k.students.length + ")"], ["bt", "Bài tập (" + asgs.length + ")"],
                ["td", "Tiến độ theo bài"], ["dd", "Điểm danh"], ["cf", "Cấu hình lớp"]];

    var body = '<div class="grid g4 mb">' +
      UI.stat("👥", "var(--blue-soft)", k.students.length, "Học viên", "Tối đa 20") +
      UI.stat("📈", "var(--jade-soft)", classProg(k) + "%", "Tiến độ trung bình", "Tuần " + k.week + " / " + k.weeks) +
      UI.stat("📝", "var(--gold-soft)", asgs.length, "Bài tập đã giao", openN + " đang mở", openN ? "var(--red)" : "var(--muted)") +
      UI.stat("🎯", "var(--purple-soft)", avg === null ? "—" : UI.num(avg), "Điểm trung bình lớp", "Trên thang 10") +
    '</div>' +
    '<div class="pill-tabs">' + tabs.map(function (t) {
      return '<a class="' + (t[0] === CLASS_TAB ? "on" : "") + '" data-ktab="' + t[0] + '">' + t[1] + '</a>';
    }).join('') + '</div>' +
    '<div class="grid" style="grid-template-columns:1fr 330px;gap:18px;align-items:start">' +
      '<div id="ktabBox">' + classTabBody(k, c, asgs) + '</div>' +
      '<div>' +
        '<div class="card pad mb"><b style="font-size:15px">＋ Thêm học viên vào lớp</b>' +
          '<div class="fld mt"><label>Tìm trong hệ thống</label>' +
            '<div class="inp-ico"><span class="ic">🔍</span><input class="inp" id="findStu" placeholder="Gõ tên hoặc email…"></div></div>' +
          '<div id="findRes" style="border:1.5px solid var(--line);border-radius:12px;overflow:hidden"></div>' +
          '<div class="auth-div" style="margin:16px 0">hoặc</div>' +
          '<button class="btn ghost block mb" id="inviteMail">✉️ Mời bằng email — nhiều người cùng lúc</button>' +
          '<button class="btn ghost block mb" data-act="excel">⤒ Nhập danh sách từ Excel / CSV</button>' +
          '<div style="background:var(--gold-soft);border:1.5px dashed #EBCE97;border-radius:13px;padding:13px 15px">' +
            '<div class="xs bb" style="color:#9A6A12">HỌC VIÊN TỰ THAM GIA BẰNG MÃ LỚP</div>' +
            '<div class="row mt"><span class="zh" style="font-size:24px;font-weight:900;letter-spacing:2px">' + UI.h(k.code) + '</span>' +
            '<button class="btn ghost sm right" id="copyCode">📋 Chép</button></div>' +
            '<div class="xs muted mt">Học viên nhập mã này khi đăng nhập lần đầu · <b>Cần giáo viên duyệt</b> ✔</div></div>' +
        '</div>' +
        '<div class="card pad"><b style="font-size:15px">Thông tin lớp</b>' +
          [["Mã lớp", k.code], ["Giáo trình", c.vi], ["Giáo viên", Store.user(k.teacherId).name],
           ["Khai giảng", k.start], ["Dự kiến kết thúc", k.end], ["Lịch học", k.schedule], ["Phòng", k.room]].map(function (r) {
            return '<div class="row" style="padding:7px 0;border-bottom:1px dashed var(--line)">' +
              '<span class="sm muted grow">' + r[0] + '</span>' +
              '<span class="sm b" style="text-align:right">' + UI.h(r[1]) + '</span></div>';
          }).join('') +
          '<a class="btn ghost block mt" href="#/admin/giao-trinh/' + c.id + '">📚 Mở giáo trình</a></div>' +
      '</div></div>';

    return UI.shell({ active: "#/admin/lop", title: k.name, crumb: "Quản lý · Lớp học · " + k.code,
      actions: '<a href="#/admin/bai-tap/moi?k=' + k.id + '" class="btn red sm">＋ Giao bài tập cho lớp</a>', body: body });
  },

  init: function (root, p) {
    var k = Store.cls(p.kid); if (!k) return;

    UI.qsa("[data-ktab]", root).forEach(function (t) {
      t.onclick = function () { CLASS_TAB = t.getAttribute("data-ktab"); App.render(); };
    });

    /* tìm & thêm học viên */
    var box = UI.qs("#findRes", root);
    function search(q) {
      q = q.trim().toLowerCase();
      if (!q) { box.innerHTML = '<div class="empty sm">Gõ tên hoặc email để tìm học viên.</div>'; return; }
      var hits = Store.s.users.filter(function (u) {
        return u.role === "hv" && (u.name.toLowerCase().indexOf(q) >= 0 || u.email.toLowerCase().indexOf(q) >= 0);
      }).slice(0, 6);
      box.innerHTML = hits.length ? hits.map(function (u) {
        var inCls = k.students.indexOf(u.id) >= 0;
        return '<div class="row" style="padding:9px 12px;border-bottom:1px solid var(--line)">' + UI.av(u, 30) +
          '<div class="grow" style="min-width:0"><div class="b sm">' + UI.h(u.name) + '</div>' +
          '<div class="xs muted">' + UI.h(u.email) + '</div></div>' +
          (inCls ? UI.chip("Đã trong lớp", "jade")
                 : '<button class="btn red sm" data-add="' + u.id + '">＋</button>') + '</div>';
      }).join('') : '<div class="empty sm">Không tìm thấy ai. Thử mời bằng email.</div>';
      UI.qsa("[data-add]", box).forEach(function (b) {
        b.onclick = function () {
          var uid = b.getAttribute("data-add");
          k.students.push(uid); Store.save();
          Store.notify(uid, "Bạn đã được thêm vào lớp", k.name + " — " + Store.course(k.courseId).vi, "#/hv");
          UI.toast("Đã thêm " + Store.user(uid).name + " vào lớp.", "ok");
          App.render();
        };
      });
    }
    var fi = UI.qs("#findStu", root);
    fi.oninput = function () { search(this.value); };
    search("");

    UI.qs("#copyCode", root).onclick = function () {
      var t = document.createElement("textarea"); t.value = k.code; document.body.appendChild(t);
      t.select(); try { document.execCommand("copy"); UI.toast("Đã chép mã lớp " + k.code, "ok"); }
      catch (e) { UI.toast("Mã lớp: " + k.code, "info"); }
      document.body.removeChild(t);
    };
    UI.qs("#inviteMail", root).onclick = function () {
      UI.modal({
        title: "Mời học viên bằng email",
        body: '<div class="fld"><label>Danh sách email — mỗi dòng một địa chỉ</label>' +
          '<textarea class="inp" id="invList" style="min-height:120px" placeholder="an.nguyen@gmail.com&#10;binh.tran@gmail.com"></textarea></div>' +
          UI.alert("blue", "✉️", 'Học viên nhận email kèm mã lớp <b>' + UI.h(k.code) + '</b> và mật khẩu tạm.'),
        footer: '<button class="btn ghost" data-close>Huỷ</button><button class="btn red" id="invOk">Gửi lời mời</button>',
        onReady: function (m) {
          UI.qs("#invOk", m).onclick = function () {
            var n = UI.qs("#invList", m).value.split("\n").filter(function (x) { return x.trim(); }).length;
            UI.closeModal();
            UI.toast(n ? "Đã gửi lời mời tới " + n + " địa chỉ." : "Bạn chưa nhập email nào.", n ? "ok" : "no");
          };
        }
      });
    };

    /* xoá học viên khỏi lớp */
    UI.qsa("[data-rm]", root).forEach(function (b) {
      b.onclick = function () {
        var uid = b.getAttribute("data-rm");
        UI.modal({
          title: "Đưa ra khỏi lớp?",
          body: '<p>Bạn chắc chắn muốn đưa <b>' + UI.h(Store.user(uid).name) + '</b> ra khỏi lớp ' + UI.h(k.code) + '? ' +
                'Bài đã nộp vẫn được giữ lại.</p>',
          footer: '<button class="btn ghost" data-close>Huỷ</button><button class="btn red" id="rmOk">Đưa ra khỏi lớp</button>',
          onReady: function (m) {
            UI.qs("#rmOk", m).onclick = function () {
              k.students = k.students.filter(function (x) { return x !== uid; });
              Store.save(); UI.closeModal(); UI.toast("Đã cập nhật danh sách lớp.", "ok"); App.render();
            };
          }
        });
      };
    });
  }
};

function classTabBody(k, c, asgs) {
  if (CLASS_TAB === "hv") {
    var rows = k.students.map(function (sid) {
      var u = Store.user(sid), pr = Store.courseProg(sid, k.courseId), av = Store.avgScore(sid);
      var last = asgs.length ? Store.subOf(asgs[0].id, sid) : null;
      var stKey = !last ? "none" : (last.finalScore !== null ? "graded" : last.status);
      return '<tr><td style="width:44px">' + UI.av(u) + '</td>' +
        '<td><div class="b">' + UI.h(u.name) + '</div><div class="xs muted">' + UI.h(u.email) + '</div></td>' +
        '<td style="width:130px"><div class="xs muted">' + pr + '%</div>' +
          UI.bar(pr, pr < 50 ? "red" : pr < 70 ? "gold" : "") + '</td>' +
        '<td class="bb">' + (av === null ? "—" : UI.num(av)) + '</td>' +
        '<td>' + UI.st(stKey) + '</td>' +
        '<td style="text-align:right;white-space:nowrap">' +
          (asgs.length ? '<a class="btn ghost sm" href="#/admin/cham/' + asgs[0].id + '/' + sid + '">Xem bài</a> ' : '') +
          '<button class="btn ghost sm" data-rm="' + sid + '" title="Đưa ra khỏi lớp">✕</button></td></tr>';
    });
    return UI.table(["", "Học viên", "Tiến độ", "Điểm TB", "Bài tập gần nhất", ""], rows, 700);
  }
  if (CLASS_TAB === "bt") {
    var rows2 = asgs.map(function (a) {
      var subs = Store.subsOf(a.id);
      var graded = subs.filter(function (s) { return s.finalScore !== null; }).length;
      var d = dueInfo(a.due);
      return '<tr><td><div class="b">' + UI.h(a.title) + '</div>' +
        '<div class="xs muted">' + a.questions.length + ' câu · thang ' + a.maxScore + '</div></td>' +
        '<td class="sm">' + UI.h(a.due) + '<div class="xs ' + (d.cls === "red" ? "red b" : "muted") + '">' + d.text + '</div></td>' +
        '<td class="b">' + subs.length + '/' + k.students.length + '</td>' +
        '<td class="b">' + graded + '</td>' +
        '<td>' + UI.st(a.status) + '</td>' +
        '<td style="text-align:right"><a class="btn ghost sm" href="#/admin/bai-tap/' + a.id + '/nop">Xem bài nộp</a></td></tr>';
    });
    return UI.table(["Bài tập", "Hạn nộp", "Đã nộp", "Đã chấm", "Trạng thái", ""], rows2, 720);
  }
  if (CLASS_TAB === "td") {
    var ls = Store.lessonsOf(k.courseId);
    var rows3 = k.students.map(function (sid) {
      var u = Store.user(sid);
      return '<tr><td style="width:44px">' + UI.av(u) + '</td><td class="b">' + UI.h(u.name) + '</td>' +
        ls.map(function (l) {
          var pr = Store.prog(sid, l.id);
          var col = pr >= 5 ? "var(--jade)" : pr > 0 ? "var(--gold)" : "var(--line)";
          return '<td class="center" title="Bài ' + l.no + ': ' + pr + '/5 phần">' +
            '<span style="display:inline-block;width:26px;height:26px;border-radius:8px;background:' + col + ';' +
            'color:#fff;font-size:11px;font-weight:800;line-height:26px">' + (pr || "") + '</span></td>';
        }).join('') + '</tr>';
    });
    return UI.table(["", "Học viên"].concat(ls.map(function (l) { return "B" + l.no; })), rows3, 600) +
      '<div class="mt">' + UI.alert("blue", "📊", 'Mỗi ô là số phần đã học của bài đó (tối đa 5). ' +
        '<span style="color:var(--jade)">Xanh</span> = xong · <span style="color:var(--gold)">Vàng</span> = đang học · Xám = chưa mở.') + '</div>';
  }
  if (CLASS_TAB === "dd") {
    var days = ["02/09", "30/08", "28/08", "26/08", "23/08"];
    var rows4 = k.students.map(function (sid, i) {
      var u = Store.user(sid);
      return '<tr><td style="width:44px">' + UI.av(u) + '</td><td class="b">' + UI.h(u.name) + '</td>' +
        days.map(function (d, j) {
          var ok = (i + j) % 7 !== 3;
          return '<td class="center">' + (ok ? '<span class="jade b">✓</span>' : '<span class="red b">✕</span>') + '</td>';
        }).join('') +
        '<td class="b">' + (days.length - (days.filter(function (d, j) { return (i + j) % 7 === 3; }).length)) + '/' + days.length + '</td></tr>';
    });
    return UI.table(["", "Học viên"].concat(days).concat(["Có mặt"]), rows4, 620);
  }
  /* cấu hình lớp */
  return '<div class="card pad">' +
    '<div class="bb mb" style="font-size:16px">Cấu hình lớp</div>' +
    '<div class="grid g2" style="gap:0 16px">' +
      '<div class="fld"><label>Mã lớp</label><input class="inp" value="' + UI.h(k.code) + '"></div>' +
      '<div class="fld"><label>Tên lớp</label><input class="inp" value="' + UI.h(k.name) + '"></div>' +
      '<div class="fld"><label>Lịch học</label><input class="inp" value="' + UI.h(k.schedule) + '"></div>' +
      '<div class="fld"><label>Phòng</label><input class="inp" value="' + UI.h(k.room) + '"></div>' +
      '<div class="fld"><label>Khai giảng</label><input class="inp" value="' + UI.h(k.start) + '"></div>' +
      '<div class="fld"><label>Kết thúc dự kiến</label><input class="inp" value="' + UI.h(k.end) + '"></div>' +
    '</div>' +
    '<div class="fld"><label>Trạng thái</label><select class="inp">' +
      '<option' + (k.status === "run" ? " selected" : "") + '>Đang học</option>' +
      '<option' + (k.status === "soon" ? " selected" : "") + '>Sắp khai giảng</option>' +
      '<option' + (k.status === "done" ? " selected" : "") + '>Đã kết thúc</option></select></div>' +
    '<div class="row mt2" style="border-top:1.5px solid var(--line);padding-top:16px">' +
      '<button class="btn ghost">Huỷ</button>' +
      '<span class="right"><button class="btn red" data-act="saveNote">✔ Lưu cấu hình</button></span></div></div>';
}
