/* ==========================================================================
   Bài tập: danh sách · S-17 Tạo & giao · S-18 Bài đã nộp · S-19 Chấm bài
   ========================================================================== */

/* Lọc bảng theo chip — nay chỉ còn màn S-18 dùng, nên để ngay tại đây. */
function filterBar(root) {
  var bar = UI.qs("#fBar", root); if (!bar) return;
  UI.qsa(".chip", bar).forEach(function (c) {
    c.onclick = function () {
      UI.qsa(".chip", bar).forEach(function (x) { x.classList.remove("on"); });
      c.classList.add("on");
      var f = c.getAttribute("data-f");
      UI.qsa("tbody tr", root).forEach(function (tr) {
        tr.style.display = (f === "all" || tr.getAttribute("data-f") === f) ? "" : "none";
      });
    };
  });
}

/* ---------------------------------------------- danh sách bài tập (điều hướng) */
ROUTES["admin/bai-tap"] = {
  roles: ["gv"],
  view: function () {
    var u = Store.me();
    var ks = Store.classesOfTeacher(u.id);
    var kid = {}; ks.forEach(function (k) { kid[k.id] = 1; });
    var list = Store.s.assignments.filter(function (a) { return kid[a.classId]; });

    var rows = list.map(function (a) {
      var k = Store.cls(a.classId), subs = Store.subsOf(a.id);
      var graded = subs.filter(function (s) { return s.finalScore !== null; }).length;
      var d = dueInfo(a.due);
      return '<tr><td><div class="b">' + UI.h(a.title) + '</div>' +
        '<div class="xs muted">' + a.questions.length + ' câu · thang ' + a.maxScore + ' · ' + UI.h(a.kind) + '</div></td>' +
        '<td>' + UI.chip(k.code, "blue") + '</td>' +
        '<td class="sm">' + UI.h(a.due) + '<div class="xs ' + (d.cls === "red" ? "red b" : "muted") + '">' + d.text + '</div></td>' +
        '<td class="b">' + subs.length + '/' + k.students.length + '</td>' +
        '<td class="b">' + graded + '</td>' +
        '<td>' + UI.st(a.status) + '</td>' +
        '<td style="text-align:right"><a class="btn ' + (subs.length > graded ? "red" : "ghost") +
          ' sm" href="#/admin/bai-tap/' + a.id + '/nop">' + (subs.length > graded ? "Chấm bài" : "Xem bài nộp") + '</a></td></tr>';
    });

    var body = UI.table(["Bài tập", "Lớp", "Hạn nộp", "Đã nộp", "Đã chấm", "Trạng thái", ""], rows, 880);

    return UI.shell({ active: "#/admin/bai-tap", title: "Bài tập", crumb: "Quản lý",
      actions: '<a href="#/admin/bai-tap/moi" class="btn red sm">＋ Tạo bài tập</a>', body: body });
  }
};

/* ---------------------------------------------- danh sách bài cần chấm */
ROUTES["admin/cham"] = {
  roles: ["gv"],
  view: function () {
    var pend = pendingList(Store.me());
    var rows = pend.map(function (x) {
      var u = Store.user(x.s.studentId), k = Store.cls(x.a.classId);
      return '<tr><td style="width:44px">' + UI.av(u) + '</td>' +
        '<td><div class="b">' + UI.h(u.name) + '</div><div class="xs muted">' + UI.h(u.email) + '</div></td>' +
        '<td><div class="b sm">' + UI.h(x.a.title) + '</div><div class="xs muted">' + UI.h(k.code) + '</div></td>' +
        '<td class="sm">' + UI.h(x.s.at) + '</td>' +
        '<td>' + UI.st(x.s.status) + '</td>' +
        '<td class="b">' + UI.num(Store.autoScore(x.a, x.s)) + '/' + x.a.maxScore + '</td>' +
        '<td style="text-align:right"><a class="btn red sm" href="#/admin/cham/' + x.a.id + '/' + u.id + '">Chấm bài</a></td></tr>';
    });
    var body = (pend.length ? "" : '<div class="mb">' + UI.alert("jade", "🎉", "Bạn đã chấm hết bài. Không còn gì chờ xử lý.") + '</div>') +
      UI.table(["", "Học viên", "Bài tập", "Nộp lúc", "Trạng thái", "Điểm tự động", ""], rows, 820);
    return UI.shell({ active: "#/admin/cham", title: "Bài cần chấm", crumb: "Quản lý", body: body });
  }
};

/* ====================================================== S-17 TẠO BÀI TẬP */
var NEW_Q = [];      /* câu hỏi đang soạn */
var NEW_K = null;    /* lớp được chọn */
var NEW_SKIP = {};   /* học viên bị bỏ chọn */

ROUTES["admin/bai-tap/moi"] = {
  roles: ["gv"],
  view: function (p) {
    var u = Store.me();
    var ks = Store.classesOfTeacher(u.id);
    if (!NEW_K) NEW_K = (p.k && Store.cls(p.k)) ? p.k : (ks[0] ? ks[0].id : null);
    var k = NEW_K ? Store.cls(NEW_K) : null;
    var cs = Store.myCourses();
    var lessons = k ? Store.lessonsOf(k.courseId) : [];
    var total = NEW_Q.reduce(function (t, q) { return t + q.score; }, 0);
    var autoN = NEW_Q.filter(function (q) { return Store.isAuto(q); }).length;
    var recv = k ? k.students.filter(function (s) { return !NEW_SKIP[s]; }) : [];

    var types = [["mcq", "⭕ Trắc nghiệm"], ["fill", "✏️ Điền từ"], ["order", "🔀 Sắp xếp câu"],
                 ["write", "📝 Viết đoạn"], ["audio", "🎙️ Ghi âm"], ["photo", "🖼️ Nộp ảnh bài viết tay"]];

    var body = '<div class="grid" style="grid-template-columns:1fr 340px;gap:18px;align-items:start"><div>' +
      '<div class="card pad mb"><div class="bb mb" style="font-size:16px">1 · Thông tin bài tập</div>' +
        '<div class="fld"><label>Tiêu đề *</label><input class="inp big" id="atTitle" placeholder="vd: Bài tập Bài 3 — 你做什么工作"></div>' +
        '<div class="grid g3" style="gap:0 14px">' +
          '<div class="fld"><label>Gắn với giáo trình</label><select class="inp" id="atCourse">' +
            cs.map(function (c) { return '<option value="' + c.id + '"' + (k && k.courseId === c.id ? ' selected' : '') + '>' + UI.h(c.vi) + '</option>'; }).join('') + '</select></div>' +
          '<div class="fld"><label>Gắn với bài học</label><select class="inp" id="atLesson">' +
            lessons.map(function (l) { return '<option value="' + l.id + '">Bài ' + l.no + ' — ' + UI.h(l.zh) + '</option>'; }).join('') + '</select></div>' +
          '<div class="fld"><label>Hình thức</label><select class="inp" id="atKind">' +
            ['Bài tập về nhà', 'Kiểm tra trên lớp', 'Kiểm tra giữa kỳ', 'Kiểm tra cuối kỳ'].map(function (x) {
              return '<option>' + x + '</option>'; }).join('') + '</select></div></div>' +
        '<div class="fld"><label>Lời dặn cho học viên</label><textarea class="inp" id="atNote" placeholder="vd: Các em xem lại phần Ngữ pháp mục 3 và 4 trước khi làm."></textarea></div>' +
        '<div class="grid g4" style="gap:0 14px">' +
          '<div class="fld"><label>Hạn nộp *</label><input class="inp" id="atDue" value="10/09/2026 23:59"></div>' +
          '<div class="fld"><label>Thời gian làm</label><input class="inp" id="atMin" value="20"></div>' +
          '<div class="fld"><label>Số lần làm</label><select class="inp" id="atTries"><option value="1">1 lần</option>' +
            '<option value="2">2 lần — lấy điểm cao nhất</option></select></div>' +
          '<div class="fld"><label>Thang điểm</label><input class="inp" id="atMax" value="10"></div></div>' +
        '<div class="row wrap" style="gap:16px">' +
          '<label class="chk"><input type="checkbox" id="atLate" checked> Cho nộp muộn (trừ 10% điểm)</label>' +
          '<label class="chk"><input type="checkbox" id="atShow" checked> Hiện đáp án sau khi chấm xong</label>' +
          '<label class="chk"><input type="checkbox" id="atShuf"> Đảo thứ tự câu hỏi</label></div></div>' +

      '<div class="card pad mb"><div class="row mb wrap"><b class="grow" style="font-size:16px">2 · Câu hỏi (' +
          NEW_Q.length + ' câu · ' + total + ' điểm)</b>' +
        '<button class="btn ghost sm" id="qBank">🎲 Lấy từ ngân hàng</button>' +
        '<button class="btn ghost sm" id="qAuto">🤖 Sinh tự động từ từ vựng</button></div>' +
        '<div class="row wrap mb" style="gap:7px">' + types.map(function (t) {
          return '<button class="btn ghost sm" data-add="' + t[0] + '">＋ ' + t[1] + '</button>'; }).join('') + '</div>' +
        '<div id="qList">' + (NEW_Q.length ? NEW_Q.map(function (q, i) {
          return '<div class="row" style="padding:11px 0;border-bottom:1px solid var(--line)">' +
            '<span class="muted">⠿</span><span class="chip">' + (i + 1) + '</span>' +
            UI.chip(qTypeName(q.type), Store.isAuto(q) ? "blue" : "purple") +
            '<div class="grow" style="min-width:0"><div class="b sm zh" style="font-size:14.5px">' + q.q + '</div>' +
            '<div class="xs muted">' + (Store.isAuto(q) ? "Tự động chấm" : "Giáo viên chấm tay") +
              (q.tag ? ' · ' + UI.h(q.tag) : '') + '</div></div>' +
            '<span class="chip">' + q.score + ' đ</span>' +
            '<button class="btn ghost sm" data-qdel="' + i + '">✕</button></div>';
        }).join('') : '<div class="empty">Chưa có câu hỏi nào. Bấm một nút ở trên để thêm.</div>') + '</div></div>' +

      '<div class="card pad"><div class="bb mb" style="font-size:16px">3 · Giao cho ai</div>' +
        '<div class="fld"><label>Chọn lớp *</label><div class="row wrap" id="kPick" style="gap:8px">' +
          ks.map(function (x) {
            return '<span class="chip btn-like ' + (x.id === NEW_K ? "jade" : "") + '" data-k="' + x.id + '" style="padding:8px 14px;font-size:13px">' +
              (x.id === NEW_K ? "✔ " : "＋ ") + UI.h(x.code) + ' (' + x.students.length + ' HV)</span>';
          }).join('') + '</div></div>' +
        (k ? '<div style="background:var(--jade-soft);border:1.5px solid #BFE5D6;border-radius:13px;padding:14px 16px">' +
          '<div class="row mb"><b class="sm grow" style="color:#1B7A58">Bài sẽ được gửi tới ' + recv.length +
            ' / ' + k.students.length + ' học viên của lớp ' + UI.h(k.code) + '</b>' +
          '<span class="sm b" style="color:#1B7A58">Bấm để bỏ chọn từng người</span></div>' +
          '<div class="row wrap" id="stuPick" style="gap:6px">' + k.students.map(function (sid) {
            var su = Store.user(sid);
            return '<span class="chip btn-like ' + (NEW_SKIP[sid] ? "grey" : "") + '" data-s="' + sid + '" ' +
              'style="background:' + (NEW_SKIP[sid] ? "var(--paper)" : "#fff") +
              ';padding:3px 10px 3px 3px;opacity:' + (NEW_SKIP[sid] ? ".45" : "1") + '">' +
              UI.av(su, 22) + UI.h(su.name) + '</span>';
          }).join('') + '</div></div>' : UI.alert("red", "⚠️", "Bạn chưa phụ trách lớp nào.")) +
        '<div class="row wrap mt" style="gap:16px">' +
          '<label class="chk"><input type="checkbox" checked> 🔔 Thông báo trong ứng dụng</label>' +
          '<label class="chk"><input type="checkbox" checked> ✉️ Gửi email</label>' +
          '<label class="chk"><input type="checkbox"> 💬 Gửi Zalo OA</label></div>' +
        '<div class="fld mt"><label>Thời điểm giao</label><div class="row" style="gap:9px">' +
          '<span class="chip jade" style="padding:8px 14px;font-size:13px">✔ Giao ngay</span>' +
          '<span class="chip btn-like" style="padding:8px 14px;font-size:13px">🕐 Hẹn giờ giao</span></div></div></div>' +

      '<div class="row mt2 wrap"><a class="btn ghost" href="#/admin/bai-tap">Huỷ</a>' +
        '<span class="right row wrap"><button class="btn ghost" id="atPreview">👁 Xem thử như học viên</button>' +
        '<button class="btn red lg" id="atSend">🚀 Giao bài cho ' + recv.length + ' học viên</button></span></div>' +
    '</div>' +
    '<div><div class="card pad" style="position:sticky;top:80px"><b style="font-size:15px">Tóm tắt</b>' +
      [["Lớp", k ? k.code : "—"], ["Học viên nhận", recv.length + " người"], ["Số câu", NEW_Q.length + " câu"],
       ["Tổng điểm", total + " điểm"], ["Tự động chấm", autoN + " câu"],
       ["Chấm tay", (NEW_Q.length - autoN) + " câu"]].map(function (r) {
        return '<div class="row" style="padding:7px 0;border-bottom:1px dashed var(--line)">' +
          '<span class="sm muted grow">' + r[0] + '</span><span class="sm b">' + UI.h(r[1]) + '</span></div>';
      }).join('') +
      '<div class="mt">' + UI.alert("gold", "🔔", '<span class="sm">Ngay khi bấm "Giao bài", học viên nhận thông báo và bài xuất hiện ở mục <b>Bài tập</b> của các em.</span>') + '</div>' +
      '<div class="mt">' + UI.alert("blue", "🤖", '<span class="sm">' + autoN + ' câu tự động chấm sẽ có điểm ngay khi học viên nộp. Bạn chỉ cần chấm tay ' + (NEW_Q.length - autoN) + ' câu.</span>') + '</div>' +
    '</div></div></div>';

    return UI.shell({ active: "#/admin/bai-tap", title: "Tạo bài tập mới", crumb: "Quản lý · Bài tập", body: body });
  },

  init: function (root) {
    UI.qsa("[data-k]", root).forEach(function (c) {
      c.onclick = function () { NEW_K = c.getAttribute("data-k"); NEW_SKIP = {}; App.render(); };
    });
    UI.qsa("#stuPick .chip", root).forEach(function (c) {
      c.onclick = function () {
        var s = c.getAttribute("data-s");
        NEW_SKIP[s] = !NEW_SKIP[s];
        App.render();
      };
    });
    UI.qsa("[data-qdel]", root).forEach(function (b) {
      b.onclick = function () { NEW_Q.splice(+b.getAttribute("data-qdel"), 1); App.render(); };
    });

    UI.qsa("[data-add]", root).forEach(function (b) {
      b.onclick = function () { addQuestion(b.getAttribute("data-add")); };
    });

    UI.qs("#qAuto", root).onclick = function () {
      var k = Store.cls(NEW_K); if (!k) return;
      var lid = UI.qs("#atLesson", root).value;
      var l = Store.lesson(lid) || Store.lessonsOf(k.courseId).filter(function (x) { return x.vocab.length; })[0];
      if (!l || !l.vocab.length) { UI.toast("Bài học chưa có từ vựng để sinh câu hỏi.", "no"); return; }
      var pool = shuffle(l.vocab).slice(0, 5);
      pool.forEach(function (v) {
        var wrong = shuffle(l.vocab.filter(function (x) { return x.hz !== v.hz; })).slice(0, 2);
        var opts = shuffle([v.vi, wrong[0].vi, wrong[1].vi]);
        NEW_Q.push({ id: Store.id("q"), type: "mcq", score: 1,
          q: '<span class="zh">' + UI.h(v.hz) + '</span> (' + v.py + ') nghĩa là gì?',
          opts: opts, ans: opts.indexOf(v.vi), tag: "Từ vựng nghề nghiệp" });
      });
      UI.toast("Đã sinh 5 câu trắc nghiệm từ từ vựng của bài.", "ok");
      App.render();
    };

    UI.qs("#qBank", root).onclick = function () {
      var src = Store.s.assignments.filter(function (a) { return a.questions.length; });
      UI.modal({
        title: "Lấy câu hỏi từ ngân hàng", wide: true,
        body: '<div id="bankQ">' + src.map(function (a) {
          return '<div class="bb sm mb" style="margin-top:10px">' + UI.h(a.title) + '</div>' +
            a.questions.map(function (q) {
              return '<label class="row" style="padding:8px 0;border-bottom:1px solid var(--line);cursor:pointer">' +
                '<input type="checkbox" data-q="' + a.id + '|' + q.id + '" style="width:16px;height:16px;accent-color:var(--red)">' +
                UI.chip(qTypeName(q.type), Store.isAuto(q) ? "blue" : "purple") +
                '<span class="grow sm">' + q.q + '</span><span class="chip">' + q.score + ' đ</span></label>';
            }).join('');
        }).join('') + '</div>',
        footer: '<button class="btn ghost" data-close>Huỷ</button><button class="btn red" id="bqOk">Thêm câu đã chọn</button>',
        onReady: function (m) {
          UI.qs("#bqOk", m).onclick = function () {
            var n = 0;
            UI.qsa("[data-q]:checked", m).forEach(function (c) {
              var ids = c.getAttribute("data-q").split("|");
              var a = Store.asg(ids[0]);
              var q = a.questions.filter(function (x) { return x.id === ids[1]; })[0];
              var copy = JSON.parse(JSON.stringify(q)); copy.id = Store.id("q");
              NEW_Q.push(copy); n++;
            });
            UI.closeModal(); UI.toast("Đã thêm " + n + " câu hỏi.", "ok"); App.render();
          };
        }
      });
    };

    UI.qs("#atPreview", root).onclick = function () {
      if (!NEW_Q.length) { UI.toast("Chưa có câu hỏi nào để xem thử.", "no"); return; }
      UI.modal({ title: "Xem thử — học viên sẽ thấy", wide: true,
        body: NEW_Q.map(function (q, i) { return qCard(q, i, undefined); }).join(''),
        footer: '<button class="btn ghost" data-close>Đóng</button>' });
    };


    UI.qs("#atSend", root).onclick = function () {
      var k = Store.cls(NEW_K);
      var title = UI.qs("#atTitle", root).value.trim();
      if (!k) { UI.toast("Bạn chưa chọn lớp.", "no"); return; }
      if (!title) { UI.toast("Bạn chưa nhập tiêu đề bài tập.", "no"); UI.qs("#atTitle", root).focus(); return; }
      if (!NEW_Q.length) { UI.toast("Bài tập chưa có câu hỏi nào.", "no"); return; }
      var recv = k.students.filter(function (s) { return !NEW_SKIP[s]; });
      if (!recv.length) { UI.toast("Không còn học viên nào được chọn.", "no"); return; }

      UI.modal({
        title: "Giao bài cho lớp " + k.code + "?",
        body: '<div class="row wrap mb">' + UI.chip(NEW_Q.length + " câu") +
          UI.chip(NEW_Q.reduce(function (t, q) { return t + q.score; }, 0) + " điểm", "blue") +
          UI.chip(recv.length + " học viên", "jade") + '</div>' +
          '<p><b>' + UI.h(title) + '</b><br>Hạn nộp: <b>' + UI.h(UI.qs("#atDue", root).value) + '</b></p>' +
          '<div class="mt">' + UI.alert("gold", "🔔", 'Sau khi giao, ' + recv.length +
            ' học viên nhận thông báo ngay và không thể thu hồi đề.') + '</div>',
        footer: '<button class="btn ghost" data-close>Xem lại</button><button class="btn red" id="sendOk">🚀 Giao bài</button>',
        onReady: function (m) {
          UI.qs("#sendOk", m).onclick = function () {
            var a = {
              id: Store.id("a"), classId: k.id, courseId: k.courseId,
              lessonId: UI.qs("#atLesson", root).value,
              title: title, kind: UI.qs("#atKind", root).value,
              note: UI.qs("#atNote", root).value.trim(),
              due: UI.qs("#atDue", root).value.trim(),
              minutes: parseInt(UI.qs("#atMin", root).value, 10) || 0,
              tries: parseInt(UI.qs("#atTries", root).value, 10) || 1,
              maxScore: parseInt(UI.qs("#atMax", root).value, 10) || 10,
              allowLate: UI.qs("#atLate", root).checked,
              showAnswer: UI.qs("#atShow", root).checked,
              shuffle: UI.qs("#atShuf", root).checked,
              status: "open", assignedAt: Store.nowStr(),
              questions: JSON.parse(JSON.stringify(NEW_Q))
            };
            Store.s.assignments.push(a);
            recv.forEach(function (sid) {
              Store.notify(sid, "Bài tập mới", title + " — hạn " + a.due, "#/hv/lam-bai/" + a.id);
            });
            Store.save();
            NEW_Q = []; NEW_SKIP = {};
            UI.closeModal();
            UI.toast("Đã giao bài cho " + recv.length + " học viên.", "ok");
            UI.go("#/admin/bai-tap/" + a.id + "/nop");
          };
        }
      });
    };
  }
};

function addQuestion(type) {
  var forms = {
    mcq: '<div class="fld"><label>Câu hỏi *</label><input class="inp" id="nqQ" placeholder="vd: A: 你做什么工作？　B: ______。"></div>' +
      '<div class="fld"><label>Các phương án — mỗi dòng một phương án *</label>' +
      '<textarea class="inp" id="nqOpts" style="min-height:90px" placeholder="我是老师&#10;我很累&#10;他是经理"></textarea></div>' +
      '<div class="fld"><label>Phương án đúng (số thứ tự, bắt đầu từ 1) *</label><input class="inp" id="nqAns" value="1"></div>',
    fill: '<div class="fld"><label>Câu hỏi *</label><input class="inp" id="nqQ" value="Điền từ đúng vào chỗ trống:"></div>' +
      '<div class="fld"><label>Câu có chỗ trống — dùng ___ *</label><input class="inp zh" id="nqStem" placeholder="她 ___ 是医生。"></div>' +
      '<div class="fld"><label>Các phương án — mỗi dòng một phương án *</label><textarea class="inp" id="nqOpts" style="min-height:70px" placeholder="bù&#10;bú"></textarea></div>' +
      '<div class="fld"><label>Phương án đúng (số thứ tự) *</label><input class="inp" id="nqAns" value="1"></div>',
    order: '<div class="fld"><label>Yêu cầu *</label><input class="inp" id="nqQ" placeholder="Sắp xếp thành câu: &quot;Mình làm việc ở bệnh viện.&quot;"></div>' +
      '<div class="fld"><label>Các thẻ từ — ngăn bằng dấu cách *</label><input class="inp zh" id="nqWords" placeholder="我 在 医院 工作 。"></div>' +
      '<div class="fld"><label>Câu đúng *</label><input class="inp zh" id="nqAnsStr" placeholder="我在医院工作。"></div>',
    write: '<div class="fld"><label>Đề bài *</label><textarea class="inp" id="nqQ" placeholder="Viết 3–5 câu giới thiệu nghề nghiệp của bố mẹ em."></textarea></div>',
    audio: '<div class="fld"><label>Đề bài *</label><textarea class="inp" id="nqQ" placeholder="Đọc to và ghi âm đoạn sau…"></textarea></div>' +
      '<div class="fld"><label>Câu mẫu để nghe</label><input class="inp zh" id="nqSay" placeholder="我是记者，在报社工作。"></div>',
    photo: '<div class="fld"><label>Đề bài *</label><textarea class="inp" id="nqQ" placeholder="Chụp ảnh trang vở viết 10 chữ…"></textarea></div>'
  };
  UI.modal({
    title: "Thêm câu " + qTypeName(type).toLowerCase(),
    body: forms[type] +
      '<div class="grid g2" style="gap:0 14px"><div class="fld"><label>Điểm</label><input class="inp" id="nqScore" value="' +
      (type === "write" || type === "audio" ? 2 : type === "photo" ? 10 : 1) + '"></div>' +
      '<div class="fld"><label>Gắn mảng kiến thức</label><select class="inp" id="nqTag">' +
      SEED.weakTags.map(function (t) { return '<option>' + t + '</option>'; }).join('') + '</select></div></div>',
    footer: '<button class="btn ghost" data-close>Huỷ</button><button class="btn red" id="nqOk">Thêm câu hỏi</button>',
    onReady: function (m) {
      UI.qs("#nqOk", m).onclick = function () {
        var q = { id: Store.id("q"), type: type,
          score: parseFloat(UI.qs("#nqScore", m).value) || 1,
          q: UI.qs("#nqQ", m).value.trim(), tag: UI.qs("#nqTag", m).value };
        if (!q.q) { UI.toast("Bạn chưa nhập đề bài.", "no"); return; }
        if (type === "mcq" || type === "fill") {
          q.opts = UI.qs("#nqOpts", m).value.split("\n").map(function (x) { return x.trim(); }).filter(Boolean);
          if (q.opts.length < 2) { UI.toast("Cần ít nhất 2 phương án.", "no"); return; }
          q.ans = (parseInt(UI.qs("#nqAns", m).value, 10) || 1) - 1;
          if (type === "fill") {
            q.stem = UI.qs("#nqStem", m).value.trim();
            if (!q.stem) { UI.toast("Bạn chưa nhập câu có chỗ trống.", "no"); return; }
          }
        }
        if (type === "order") {
          q.words = UI.qs("#nqWords", m).value.trim().split(/\s+/).filter(Boolean);
          q.ans = UI.qs("#nqAnsStr", m).value.trim();
          if (!q.words.length || !q.ans) { UI.toast("Cần nhập thẻ từ và câu đúng.", "no"); return; }
        }
        if (type === "audio") q.say = UI.qs("#nqSay", m).value.trim();
        NEW_Q.push(q); UI.closeModal(); App.render();
      };
    }
  });
}

/* ====================================================== S-18 BÀI ĐÃ NỘP */
ROUTES["admin/bai-tap/:aid/nop"] = {
  roles: ["gv"],
  view: function (p) {
    var a = Store.asg(p.aid);
    if (!a) return UI.shell({ active: "#/admin/bai-tap", title: "Không tìm thấy", crumb: "", body: '<div class="empty">Bài tập không tồn tại.</div>' });
    var k = Store.cls(a.classId);
    var subs = Store.subsOf(a.id);
    var byId = {}; subs.forEach(function (s) { byId[s.studentId] = s; });
    var nSub = subs.filter(function (s) { return s.status !== "draft"; }).length;
    var nLate = subs.filter(function (s) { return s.status === "late"; }).length;
    var nGraded = subs.filter(function (s) { return s.finalScore !== null; }).length;
    var nNo = k.students.length - nSub;
    var pend = nSub - nGraded;

    /* câu sai nhiều nhất */
    var wrongCnt = a.questions.map(function (q) {
      var n = 0;
      subs.forEach(function (s) { if (Store.correct(q, s.answers[q.id]) === false) n++; });
      return { q: q, n: n };
    }).filter(function (x) { return x.n > 0; }).sort(function (x, y) { return y.n - x.n; }).slice(0, 2);

    var rows = k.students.map(function (sid) {
      var u = Store.user(sid), s = byId[sid];
      var stKey = !s || s.status === "draft" ? "none" : (s.finalScore !== null ? "graded" : s.status);
      var fb = Store.fbOf(a.id, sid);
      var needGrade = s && s.status !== "draft" && s.finalScore === null;
      return '<tr data-f="' + (needGrade ? "pend" : stKey === "graded" ? "graded" : stKey === "none" ? "none" : "pend") + '">' +
        '<td style="width:44px">' + UI.av(u) + '</td>' +
        '<td><div class="b">' + UI.h(u.name) + '</div><div class="xs muted">' + UI.h(u.email) + '</div></td>' +
        '<td class="sm">' + (s && s.status !== "draft" ? UI.h(s.at) : '<span class="muted">—</span>') + '</td>' +
        '<td>' + UI.st(stKey) + '</td>' +
        '<td class="b">' + (s && s.status !== "draft" ? UI.num(Store.autoScore(a, s)) : "—") + '</td>' +
        '<td class="bb" style="color:' + (s && s.finalScore !== null ? "var(--jade)" : "var(--muted)") + '">' +
          (s && s.finalScore !== null ? UI.num(s.finalScore) : "—") + '</td>' +
        '<td>' + (fb ? UI.chip("✓ Đã gửi", "jade") : (s && s.status !== "draft" ? UI.chip("Chưa", "gold") : '<span class="muted">—</span>')) + '</td>' +
        '<td style="text-align:right">' + (s && s.status !== "draft"
          ? '<a class="btn ' + (needGrade ? "red" : "ghost") + ' sm" href="#/admin/cham/' + a.id + '/' + sid + '">' +
            (needGrade ? "Chấm bài" : "Xem lại") + '</a>'
          : '<button class="btn ghost sm" data-remind="' + sid + '">🔔 Nhắc</button>') + '</td></tr>';
    });

    var body = UI.backLink("#/admin/bai-tap", "Danh sách bài tập") +
      '<div class="grid g4 mt mb">' +
      UI.stat("✅", "var(--jade-soft)", nSub + '<span class="muted" style="font-size:19px">/' + k.students.length + '</span>',
        "Đã nộp", Math.round(nSub / Math.max(1, k.students.length) * 100) + "% sĩ số", "var(--jade)") +
      UI.stat("⏰", "var(--gold-soft)", nLate, "Nộp muộn", a.allowLate ? "Bị trừ 10% điểm" : "Không nhận") +
      UI.stat("✕", "var(--red-soft)", nNo, "Chưa nộp", dueInfo(a.due).text, "var(--red)") +
      UI.stat("📥", "var(--blue-soft)", pend, "Chờ chấm", pend ? "Câu ghi âm & viết đoạn" : "Đã chấm hết") +
      '</div>' +
      '<div class="row wrap mb" id="fBar">' +
        '<span class="chip btn-like on" data-f="all">Tất cả (' + k.students.length + ')</span>' +
        '<span class="chip btn-like red" data-f="pend">Chờ chấm (' + pend + ')</span>' +
        '<span class="chip btn-like" data-f="graded">Đã chấm (' + nGraded + ')</span>' +
        '<span class="chip btn-like" data-f="none">Chưa nộp (' + nNo + ')</span>' +
        '<span class="right row"><button class="btn ghost sm" id="remindAll">🔔 Nhắc ' + nNo + ' người chưa nộp</button>' +
        '<button class="btn ghost sm" data-act="excel">⤓ Xuất điểm Excel</button></span></div>' +
      UI.table(["", "Học viên", "Nộp lúc", "Trạng thái", "Điểm tự động", "Điểm cuối", "Ghi chú đã gửi", ""], rows, 940) +
      (wrongCnt.length ? '<div class="mt2">' + UI.alert("blue", "📊", '<b>Câu sai nhiều nhất:</b> ' +
        wrongCnt.map(function (x) {
          var i = a.questions.indexOf(x.q) + 1;
          return 'Câu ' + i + ' — ' + x.q.q + ' <b>(' + x.n + '/' + nSub + ' em sai)</b>';
        }).join(' · ') + '. Nên nhắc lại ở buổi tới.') + '</div>' : '');

    return UI.shell({ active: "#/admin/bai-tap", title: a.title, crumb: "Quản lý · Bài tập · Lớp " + k.code,
      actions: '<a class="btn ghost sm" href="#/admin/bai-tap/moi">✏️ Tạo bài mới</a>', body: body });
  },
  init: function (root, p) {
    filterBar(root);
    var a = Store.asg(p.aid), k = Store.cls(a.classId);
    UI.qsa("[data-remind]", root).forEach(function (b) {
      b.onclick = function () {
        var sid = b.getAttribute("data-remind");
        Store.notify(sid, "Nhắc nộp bài", a.title + " — hạn " + a.due, "#/hv/lam-bai/" + a.id);
        UI.toast("Đã gửi nhắc nhở tới " + Store.user(sid).name + ".", "ok");
      };
    });
    UI.qs("#remindAll", root).onclick = function () {
      var n = 0;
      k.students.forEach(function (sid) {
        var s = Store.subOf(a.id, sid);
        if (!s || s.status === "draft") { Store.notify(sid, "Nhắc nộp bài", a.title, "#/hv/lam-bai/" + a.id); n++; }
      });
      UI.toast(n ? "Đã nhắc " + n + " học viên." : "Mọi học viên đều đã nộp.", n ? "ok" : "info");
    };
  }
};

/* ====================================================== S-19 CHẤM BÀI */
ROUTES["admin/cham/:aid/:uid"] = {
  roles: ["gv"],
  view: function (p) {
    var a = Store.asg(p.aid), stu = Store.user(p.uid);
    if (!a || !stu) return UI.shell({ active: "#/admin/cham", title: "Không tìm thấy", crumb: "", body: '<div class="empty">Không có dữ liệu.</div>' });
    var k = Store.cls(a.classId), s = Store.subOf(a.id, stu.id);
    if (!s) return UI.shell({ active: "#/admin/cham", title: a.title, crumb: "",
      body: '<div class="empty">' + UI.h(stu.name) + ' chưa nộp bài này.</div>' });
    var fb = Store.fbOf(a.id, stu.id);

    var subs = k.students.filter(function (sid) {
      var x = Store.subOf(a.id, sid); return x && x.status !== "draft";
    });
    var idx = subs.indexOf(stu.id);
    var pend = subs.filter(function (sid) { var x = Store.subOf(a.id, sid); return x.finalScore === null; }).length;

    var auto = Store.autoScore(a, s);
    var manMax = Store.manualMax(a);
    var ok = 0, bad = 0, wait = 0;
    a.questions.forEach(function (q) {
      var c = Store.correct(q, s.answers[q.id]);
      if (c === true) ok++; else if (c === false) bad++;
      else if (!Store.isAuto(q)) { if (s.manual && s.manual[q.id] !== undefined) ok++; else wait++; }
    });

    var body = '<div class="row wrap mb">' +
      (idx > 0 ? '<a class="btn ghost sm" href="#/admin/cham/' + a.id + '/' + subs[idx - 1] + '">← Học viên trước</a>'
               : '<button class="btn ghost sm" disabled>← Học viên trước</button>') +
      '<div class="row" style="background:#fff;border:1.5px solid var(--line);border-radius:13px;padding:7px 14px">' +
        UI.av(stu, 34) + '<div><div class="bb">' + UI.h(stu.name) + '</div>' +
        '<div class="xs muted">' + UI.h(stu.email) + ' · nộp ' + UI.h(s.at) + ' · ' +
        (s.status === "late" ? '<span class="red b">nộp muộn</span>' : 'đúng hạn') + '</div></div></div>' +
      UI.chip("Bài " + (idx + 1) + " / " + subs.length, "blue") +
      '<span class="right row"><span class="sm muted">Còn ' + pend + ' bài chờ chấm</span>' +
      (idx < subs.length - 1 ? '<a class="btn ghost sm" href="#/admin/cham/' + a.id + '/' + subs[idx + 1] + '">Học viên sau →</a>'
                             : '<button class="btn ghost sm" disabled>Học viên sau →</button>') + '</span></div>' +

    '<div class="grade"><div class="card pad">' +
      '<div class="row mb wrap"><b class="grow" style="font-size:16px">Bài làm — ' + a.questions.length + ' câu</b>' +
        UI.chip(ok + " đúng", "jade") + UI.chip(bad + " sai", "red") +
        (wait ? UI.chip(wait + " chờ chấm tay", "gold") : "") + '</div>' +
      a.questions.map(function (q, i) {
        var v = s.answers[q.id], c = Store.correct(q, v);
        var manual = !Store.isAuto(q);
        var cur = s.manual && s.manual[q.id] !== undefined ? Number(s.manual[q.id]) : null;
        var cls = c === true ? "ok" : c === false ? "no" : (cur !== null ? "ok" : "pend");
        var pts = c === true ? q.score : (cur !== null ? cur : 0);
        return '<div class="ansrow"><span class="n ' + cls + '">' + (i + 1) + '</span><div class="grow">' +
          '<div class="sm muted">' + qTypeName(q.type) + ' · ' + q.q + '</div>' +
          gradeAnswer(q, v, c) +
          (manual ? '<div class="row mt wrap" style="gap:8px"><span class="sm muted">Điểm:</span>' +
            '<span class="ptsel">' + ptOptions(q.score).map(function (x) {
              return '<span class="chip btn-like ' + (cur === x ? "jade" : "") + '" data-pt="' + q.id + '|' + x + '">' + UI.num(x) + '</span>';
            }).join('') + '</span></div>' : '') +
          '<input class="inp sm mt" data-cm="' + q.id + '" placeholder="Nhận xét riêng cho câu này (học viên sẽ thấy)…" value="' +
            UI.h((s.comments || {})[q.id] || "") + '">' +
        '</div><b class="sm" style="white-space:nowrap">' + UI.num(pts) + '/' + q.score + ' đ</b></div>';
      }).join('') +
    '</div>' +

    '<div class="gpanel"><div class="gh"><div class="row">' +
      '<span style="font-size:17px">✍️</span><b class="grow">Ghi chú gửi riêng cho ' + UI.h(stu.name.split(" ").pop()) + '</b>' +
      '<span class="priv">🔒 Riêng tư</span></div>' +
      '<div class="xs" style="color:#7A5310;margin-top:5px">Chỉ ' + UI.h(stu.name) +
        ' nhìn thấy nội dung này. Các bạn khác trong lớp không thấy.</div></div>' +
      '<div class="gb">' +
        '<div class="fld"><label>Điểm cuối cùng</label><div class="row wrap" style="gap:9px">' +
          '<input class="inp big center" id="gFinal" value="' +
            (s.finalScore !== null ? UI.num(s.finalScore) : UI.num(auto + Store.manualScore(a, s))) +
            '" style="width:90px;font-weight:800;font-size:20px">' +
          '<span class="muted">/ ' + a.maxScore + '</span>' +
          UI.chip("Tự động: " + UI.num(auto), "jade") +
          '<span id="gMan">' + UI.chip("Chấm tay: +" + UI.num(Store.manualScore(a, s)) + " / " + manMax, "gold") + '</span></div></div>' +

        '<div class="fld"><label>⚠️ Phần chưa đạt — chọn để gắn vào ghi chú</label>' +
          '<div class="tagpick" id="gTags">' + SEED.weakTags.map(function (w) {
            var on = fb && fb.weak.indexOf(w) >= 0;
            return '<span class="' + (on ? "on" : "") + '" data-w="' + UI.h(w) + '">' + UI.h(w) + '</span>';
          }).join('') + '</div>' +
          '<div class="hint">Mỗi thẻ ứng với một mục trong bài học. Học viên bấm vào thẻ là mở thẳng mục đó để học lại.</div>' +
          '<div class="mt sm"><button class="btn ghost sm" id="gSuggest">💡 Gợi ý theo câu sai</button></div></div>' +

        '<div class="fld"><label>Nhận xét</label>' +
          '<textarea class="inp" id="gBody" style="min-height:110px" placeholder="Viết nhận xét cho học viên…">' +
            UI.h(fb ? fb.body : "") + '</textarea>' +
          '<div class="tmpl" id="gTmpl">💬 <b>Mẫu có sẵn</b> — bấm để chèn:<br>' +
            '<span class="chip btn-like mt" data-t="Em nắm chắc phần từ vựng, nhưng cần luyện thêm phần ngữ pháp.">Khen + nhắc</span> ' +
            '<span class="chip btn-like mt" data-t="Lỗi này lặp lại ở nhiều câu, em xem kỹ lại mục ngữ pháp nhé.">Lỗi lặp lại</span> ' +
            '<span class="chip btn-like mt" data-t="Trước buổi sau em hãy làm lại phần Ôn tập của bài này.">Việc cần làm</span></div></div>' +

        '<div class="fld"><label>📋 Việc cần làm trước buổi sau</label>' +
          '<div id="gTodos">' + ((fb && fb.todos.length ? fb.todos : ["", "", ""]).map(function (t, i) {
            return '<div class="row mb" style="gap:8px"><span class="chip">' + (i + 1) + '</span>' +
              '<input class="inp sm grow" data-todo="' + i + '" value="' + UI.h(t) + '" placeholder="vd: Học lại mục 在 + địa điểm + 工作"></div>';
          }).join('')) + '</div>' +
          '<button class="btn ghost sm" id="gAddTodo">＋ Thêm việc</button></div>' +

        '<div class="row wrap" style="gap:14px;margin:6px 0 16px">' +
          '<label class="chk"><input type="checkbox" id="gReply" checked> Cho phép em trả lời lại</label>' +
          '<label class="chk"><input type="checkbox" id="gNotify" checked> Gửi thông báo ngay</label></div>' +

        '<button class="btn red block lg" id="gSend">📨 ' + (fb ? "Cập nhật &amp; gửi lại" : "Gửi ghi chú cho " + UI.h(stu.name.split(" ").pop())) + '</button>' +
        '<div class="row wrap mt" style="gap:9px"><button class="btn ghost sm" id="gDraft">💾 Lưu nháp</button>' +
        '<button class="btn ghost sm" id="gApply">📋 Áp dụng cho HV cùng lỗi</button></div>' +
        (fb ? '<div class="mt">' + UI.alert("jade", "✅", '<span class="sm">Đã gửi ghi chú lúc ' + UI.h(fb.sentAt) + '.</span>') + '</div>' : '') +
      '</div></div></div>';

    return UI.shell({ active: "#/admin/cham", title: "Chấm bài — " + stu.name,
      crumb: "Quản lý · " + a.title + " · Lớp " + k.code, body: body });
  },

  init: function (root, p) {
    var a = Store.asg(p.aid), stu = Store.user(p.uid), s = Store.subOf(a.id, stu.id);
    if (!s) return;
    s.manual = s.manual || {}; s.comments = s.comments || {};

    /* điểm chấm tay */
    UI.qsa("[data-pt]", root).forEach(function (b) {
      b.onclick = function () {
        var d = b.getAttribute("data-pt").split("|");
        s.manual[d[0]] = parseFloat(d[1]);
        Store.save();
        var man = Store.manualScore(a, s);
        UI.qs("#gFinal", root).value = UI.num(Store.autoScore(a, s) + man);
        UI.qs("#gMan", root).innerHTML = UI.chip("Chấm tay: +" + UI.num(man) + " / " + Store.manualMax(a), "gold");
        UI.qsa('[data-pt^="' + d[0] + '|"]', root).forEach(function (x) { x.classList.remove("jade"); });
        b.classList.add("jade");
      };
    });

    /* nhận xét từng câu */
    UI.qsa("[data-cm]", root).forEach(function (i) {
      i.oninput = function () { s.comments[i.getAttribute("data-cm")] = i.value; Store.save(); };
    });

    /* thẻ phần chưa đạt */
    UI.qsa("#gTags span", root).forEach(function (t) {
      t.onclick = function () { t.classList.toggle("on"); };
    });
    UI.qs("#gSuggest", root).onclick = function () {
      var tags = {};
      a.questions.forEach(function (q) {
        if (Store.correct(q, s.answers[q.id]) === false && q.tag) tags[q.tag] = 1;
      });
      var n = 0;
      UI.qsa("#gTags span", root).forEach(function (t) {
        if (tags[t.getAttribute("data-w")]) { t.classList.add("on"); n++; }
      });
      UI.toast(n ? "Đã chọn " + n + " phần dựa trên câu sai." : "Học viên không sai câu tự chấm nào.", n ? "ok" : "info");
    };

    /* mẫu câu */
    UI.qsa("#gTmpl [data-t]", root).forEach(function (c) {
      c.onclick = function () {
        var ta = UI.qs("#gBody", root);
        ta.value = (ta.value ? ta.value.replace(/\s*$/, " ") : "") + c.getAttribute("data-t");
        ta.focus();
      };
    });

    UI.qs("#gAddTodo", root).onclick = function () {
      var box = UI.qs("#gTodos", root), n = UI.qsa("[data-todo]", box).length;
      var d = document.createElement("div");
      d.className = "row mb"; d.style.gap = "8px";
      d.innerHTML = '<span class="chip">' + (n + 1) + '</span><input class="inp sm grow" data-todo="' + n + '" placeholder="Việc cần làm…">';
      box.appendChild(d);
    };

    function collect() {
      return {
        weak: UI.qsa("#gTags span.on", root).map(function (t) { return t.getAttribute("data-w"); }),
        body: UI.qs("#gBody", root).value.trim(),
        todos: UI.qsa("[data-todo]", root).map(function (i) { return i.value.trim(); }).filter(Boolean),
        allowReply: UI.qs("#gReply", root).checked
      };
    }

    UI.qs("#gDraft", root).onclick = function () {
      s.finalScore = null; Store.save(); UI.toast("Đã lưu nháp phần chấm.", "ok");
    };

    UI.qs("#gSend", root).onclick = function () {
      var d = collect();
      if (!d.body) { UI.toast("Bạn chưa viết nhận xét cho học viên.", "no"); UI.qs("#gBody", root).focus(); return; }
      var score = parseFloat(String(UI.qs("#gFinal", root).value).replace(",", "."));
      if (isNaN(score)) { UI.toast("Điểm cuối chưa hợp lệ.", "no"); return; }

      UI.modal({
        title: "Gửi ghi chú cho " + stu.name + "?",
        body: '<div class="row wrap mb">' + UI.chip("Điểm " + UI.num(score) + "/" + a.maxScore, "jade") +
          (d.weak.length ? UI.chip(d.weak.length + " phần chưa đạt", "red") : "") +
          (d.todos.length ? UI.chip(d.todos.length + " việc cần làm", "gold") : "") + '</div>' +
          '<p class="sm">' + UI.h(d.body) + '</p>' +
          '<div class="mt">' + UI.alert("blue", "🔒",
            'Chỉ <b>' + UI.h(stu.name) + '</b> nhìn thấy ghi chú này. Các học viên khác trong lớp không thấy.') + '</div>',
        footer: '<button class="btn ghost" data-close>Xem lại</button><button class="btn red" id="fbOk">📨 Gửi ngay</button>',
        onReady: function (m) {
          UI.qs("#fbOk", m).onclick = function () {
            s.finalScore = score;
            s.status = s.status === "late" ? "late" : "submitted";
            var old = Store.fbOf(a.id, stu.id);
            if (old) {
              old.weak = d.weak; old.body = d.body; old.todos = d.todos;
              old.allowReply = d.allowReply; old.sentAt = Store.nowStr();
            } else {
              Store.s.feedbacks.push({ id: Store.id("f"), assignmentId: a.id, studentId: stu.id,
                teacherId: Store.me().id, sentAt: Store.nowStr(), weak: d.weak, body: d.body,
                todos: d.todos, allowReply: d.allowReply });
            }
            if (UI.qs("#gNotify", root).checked) {
              Store.notify(stu.id, "Bài tập đã được chấm",
                a.title + " — " + UI.num(score) + "/" + a.maxScore + (d.weak.length ? " · có ghi chú" : ""),
                "#/hv/ket-qua/" + a.id);
            }
            Store.save();
            UI.closeModal();
            UI.toast("Đã gửi ghi chú cho " + stu.name + ".", "ok");
            /* sang học viên kế tiếp còn chờ chấm */
            var next = Store.cls(a.classId).students.filter(function (sid) {
              var x = Store.subOf(a.id, sid);
              return x && x.status !== "draft" && x.finalScore === null;
            })[0];
            UI.go(next ? "#/admin/cham/" + a.id + "/" + next : "#/admin/bai-tap/" + a.id + "/nop");
          };
        }
      });
    };

    UI.qs("#gApply", root).onclick = function () {
      var d = collect();
      if (!d.body) { UI.toast("Chưa có nhận xét để áp dụng.", "no"); return; }
      var same = Store.cls(a.classId).students.filter(function (sid) {
        if (sid === stu.id) return false;
        var x = Store.subOf(a.id, sid); if (!x || x.status === "draft") return false;
        return a.questions.some(function (q) {
          return d.weak.indexOf(q.tag) >= 0 && Store.correct(q, x.answers[q.id]) === false;
        });
      });
      UI.modal({
        title: "Áp dụng ghi chú cho học viên cùng lỗi",
        body: same.length
          ? '<p class="sm mb">' + same.length + ' học viên khác cũng sai ở ' + d.weak.join(", ") + ':</p>' +
            '<div class="row wrap">' + same.map(function (sid) {
              var su = Store.user(sid);
              return '<span class="chip" style="padding:3px 10px 3px 3px">' + UI.av(su, 22) + UI.h(su.name) + '</span>';
            }).join('') + '</div>' +
            '<div class="mt">' + UI.alert("gold", "⚠️", 'Ghi chú sẽ gửi cho từng em <b>riêng biệt</b>, không ai thấy của ai. Điểm số không bị thay đổi.') + '</div>'
          : '<div class="empty">Không có học viên nào cùng lỗi.</div>',
        footer: '<button class="btn ghost" data-close>Huỷ</button>' +
          (same.length ? '<button class="btn red" id="apOk">Gửi cho ' + same.length + ' học viên</button>' : ''),
        onReady: function (m) {
          var b = UI.qs("#apOk", m); if (!b) return;
          b.onclick = function () {
            same.forEach(function (sid) {
              var old = Store.fbOf(a.id, sid);
              if (old) { old.weak = d.weak; old.body = d.body; old.todos = d.todos; old.sentAt = Store.nowStr(); }
              else Store.s.feedbacks.push({ id: Store.id("f"), assignmentId: a.id, studentId: sid,
                teacherId: Store.me().id, sentAt: Store.nowStr(), weak: d.weak, body: d.body,
                todos: d.todos, allowReply: true });
              Store.notify(sid, "Giáo viên gửi ghi chú", a.title, "#/hv/ket-qua/" + a.id);
            });
            Store.save(); UI.closeModal();
            UI.toast("Đã gửi ghi chú cho " + same.length + " học viên.", "ok");
          };
        }
      });
    };
  }
};

function ptOptions(max) {
  var out = [], x = 0;
  while (x <= max + 0.001) { out.push(Math.round(x * 10) / 10); x += max <= 2 ? 0.5 : 1; }
  return out;
}

function gradeAnswer(q, v, c) {
  if (q.type === "mcq" || q.type === "fill") {
    if (v === undefined || v === null) return '<div class="sm muted">Chưa trả lời</div>';
    return '<div class="b" style="font-size:15px">' +
      (c ? '<span class="zh">' + q.opts[v] + '</span> ' + UI.chip("Đúng", "jade")
         : 'Em chọn <b class="red zh">' + q.opts[v] + '</b> · Đáp án <b class="jade zh">' + q.opts[q.ans] + '</b> ' + UI.chip("Sai", "red")) + '</div>';
  }
  if (q.type === "order") {
    return '<div class="zh" style="font-size:15px;color:' + (c ? "var(--jade)" : "var(--red)") + '">' + UI.h(v || "(chưa làm)") + '</div>' +
      (c ? '' : '<div class="zh sm" style="color:var(--jade)">Đáp án: ' + UI.h(q.ans) + '</div>');
  }
  if (q.type === "write") {
    return '<div class="zh" style="font-size:15px;background:var(--paper);border-radius:11px;padding:10px 13px;margin-top:6px">' +
      UI.h(v || "(chưa làm)") + '</div>';
  }
  if (q.type === "audio") {
    return v ? '<div class="row mt" style="background:var(--paper);border-radius:11px;padding:9px 13px">' +
      '<span style="font-size:17px">▶️</span><div class="grow bar"><i style="width:38%"></i></div>' +
      '<span class="xs muted">0:18 / 0:47</span></div>' : '<div class="sm muted">Chưa ghi âm</div>';
  }
  if (q.type === "photo") {
    return v ? '<div class="alert blue mt"><span class="ai">🖼️</span><div class="sm">Học viên đã nộp 1 ảnh bài viết tay.</div></div>'
             : '<div class="sm muted">Chưa nộp ảnh</div>';
  }
  return "";
}
