/* ==========================================================================
   store.js — trạng thái ứng dụng, đăng nhập, lưu vào localStorage
   ========================================================================== */
var Store = (function () {
  var KEY = "hanzi_lms_v1";
  var MEM = null;             // dự phòng khi localStorage bị chặn
  var canLS = true;

  function raw(get, val) {
    try {
      if (get) return localStorage.getItem(KEY);
      localStorage.setItem(KEY, val); return null;
    } catch (e) { canLS = false; return null; }
  }

  var S = null;

  function fresh() {
    return {
      users:       JSON.parse(JSON.stringify(SEED.users)),
      courses:     JSON.parse(JSON.stringify(SEED.courses)),
      lessons:     JSON.parse(JSON.stringify(SEED.lessons)),
      classes:     JSON.parse(JSON.stringify(SEED.classes)),
      assignments: JSON.parse(JSON.stringify(SEED.assignments)),
      submissions: JSON.parse(JSON.stringify(SEED.submissions)),
      feedbacks:   JSON.parse(JSON.stringify(SEED.feedbacks)),
      progress:    { u3: { l1:5, l2:5, l3:3 }, u5:{ l1:5,l2:5,l3:5 }, u6:{ l1:5,l2:4,l3:2 } },
      notifs:      [],
      session:     null,
      seq:         100
    };
  }

  function load() {
    var t = canLS ? raw(true) : MEM;
    if (t) { try { S = JSON.parse(t); } catch (e) { S = null; } }
    if (!S || !S.users) S = fresh();
    return S;
  }

  function save() {
    var t = JSON.stringify(S);
    MEM = t;
    if (canLS) raw(false, t);
  }

  function reset() { S = fresh(); save(); }

  function id(p) { S.seq++; return (p || "x") + S.seq; }

  /* ---------------------------------------------------------- đăng nhập */
  function login(email, pass) {
    var e = String(email || "").trim().toLowerCase();
    var u = S.users.filter(function (x) { return x.email.toLowerCase() === e; })[0];
    if (!u) return { ok: false, msg: "Không tìm thấy tài khoản với email này." };
    if (u.pass !== pass) return { ok: false, msg: "Mật khẩu chưa đúng. Bạn thử lại nhé." };
    if (!u.active) return { ok: false, msg: "Tài khoản chưa được kích hoạt. Hãy liên hệ giáo viên." };
    S.session = u.id; save();
    return { ok: true, user: u };
  }
  function loginAs(uid) { S.session = uid; save(); }
  function logout() { S.session = null; save(); }
  function me() { return S.session ? user(S.session) : null; }

  /* ---------------------------------------------------------- truy vấn */
  function user(uid) { return S.users.filter(function (x) { return x.id === uid; })[0] || null; }
  function course(cid) { return S.courses.filter(function (x) { return x.id === cid; })[0] || null; }
  function lesson(lid) { return S.lessons.filter(function (x) { return x.id === lid; })[0] || null; }
  function cls(kid) { return S.classes.filter(function (x) { return x.id === kid; })[0] || null; }
  function asg(aid) { return S.assignments.filter(function (x) { return x.id === aid; })[0] || null; }

  function lessonsOf(cid) {
    return S.lessons.filter(function (x) { return x.courseId === cid; })
      .sort(function (a, b) { return a.no - b.no; });
  }
  function classesOfStudent(uid) {
    return S.classes.filter(function (k) { return k.students.indexOf(uid) >= 0; });
  }
  function classesOfTeacher(uid) {
    return S.classes.filter(function (k) { return k.teacherId === uid; });
  }
  /* lớp mà người dùng hiện tại được phép thấy */
  function myClasses() {
    var u = me(); if (!u) return [];
    if (u.role === "admin") return S.classes.slice();
    if (u.role === "gv") return classesOfTeacher(u.id);
    return classesOfStudent(u.id);
  }
  function myCourses() {
    var u = me(); if (!u) return [];
    if (u.role === "admin") return S.courses.slice();
    if (u.role === "gv") {
      var own = {};
      S.courses.forEach(function (c) { if (c.teacherId === u.id) own[c.id] = 1; });
      classesOfTeacher(u.id).forEach(function (k) { own[k.courseId] = 1; });
      return S.courses.filter(function (c) { return own[c.id]; });
    }
    var ids = {};
    classesOfStudent(u.id).forEach(function (k) { ids[k.courseId] = 1; });
    return S.courses.filter(function (c) { return ids[c.id] && c.status === "pub"; });
  }

  function asgOfClass(kid) { return S.assignments.filter(function (a) { return a.classId === kid; }); }
  function asgOfStudent(uid) {
    var ks = classesOfStudent(uid).map(function (k) { return k.id; });
    return S.assignments.filter(function (a) { return ks.indexOf(a.classId) >= 0; });
  }
  function subOf(aid, uid) {
    return S.submissions.filter(function (s) { return s.assignmentId === aid && s.studentId === uid; })[0] || null;
  }
  function subsOf(aid) { return S.submissions.filter(function (s) { return s.assignmentId === aid; }); }
  function fbOf(aid, uid) {
    return S.feedbacks.filter(function (f) { return f.assignmentId === aid && f.studentId === uid; })[0] || null;
  }
  function fbOfStudent(uid) { return S.feedbacks.filter(function (f) { return f.studentId === uid; }); }

  /* ---------------------------------------------------------- chấm tự động */
  function autoScore(a, sub) {
    var pts = 0;
    a.questions.forEach(function (q) {
      var v = sub.answers ? sub.answers[q.id] : undefined;
      if (v === undefined || v === null) return;
      if (q.type === "mcq" || q.type === "fill") { if (v === q.ans) pts += q.score; }
      else if (q.type === "order") { if (String(v).replace(/\s/g, "") === q.ans.replace(/\s/g, "")) pts += q.score; }
    });
    return pts;
  }
  function manualMax(a) {
    return a.questions.filter(function (q) { return q.type === "audio" || q.type === "write" || q.type === "photo"; })
      .reduce(function (s, q) { return s + q.score; }, 0);
  }
  function manualScore(a, sub) {
    var m = sub.manual || {}, t = 0;
    a.questions.forEach(function (q) { if (m[q.id] !== undefined && m[q.id] !== null) t += Number(m[q.id]); });
    return t;
  }
  function isAuto(q) { return q.type === "mcq" || q.type === "fill" || q.type === "order"; }
  function correct(q, v) {
    if (v === undefined || v === null || v === "") return null;
    if (q.type === "mcq" || q.type === "fill") return v === q.ans;
    if (q.type === "order") return String(v).replace(/\s/g, "") === q.ans.replace(/\s/g, "");
    return null;
  }

  /* ---------------------------------------------------------- tiến độ học */
  function prog(uid, lid) {
    var p = S.progress[uid]; return (p && p[lid]) || 0;   /* số phần đã xong 0..5 */
  }
  function markPart(lid, n) {
    var u = me(); if (!u || u.role !== "hv") return;
    if (!S.progress[u.id]) S.progress[u.id] = {};
    var cur = S.progress[u.id][lid] || 0;
    if (n > cur) { S.progress[u.id][lid] = n; save(); }
  }
  function courseProg(uid, cid) {
    var ls = lessonsOf(cid).filter(function (l) { return l.status === "pub"; });
    if (!ls.length) return 0;
    var t = ls.reduce(function (s, l) { return s + prog(uid, l.id); }, 0);
    return Math.round(t / (ls.length * 5) * 100);
  }
  function studentProg(uid) {
    var ks = classesOfStudent(uid);
    if (!ks.length) return 0;
    return courseProg(uid, ks[0].courseId);
  }
  function avgScore(uid) {
    var ss = S.submissions.filter(function (s) { return s.studentId === uid && s.finalScore !== null; });
    if (!ss.length) return null;
    return Math.round(ss.reduce(function (t, s) { return t + s.finalScore; }, 0) / ss.length * 10) / 10;
  }

  /* ---------------------------------------------------------- thông báo */
  function notify(uid, title, body, link) {
    S.notifs.unshift({ id: id("n"), uid: uid, title: title, body: body, link: link, read: false, at: nowStr() });
    save();
  }
  function myNotifs() {
    var u = me(); if (!u) return [];
    return S.notifs.filter(function (n) { return n.uid === u.id; });
  }
  function readNotifs() {
    var u = me(); if (!u) return;
    S.notifs.forEach(function (n) { if (n.uid === u.id) n.read = true; });
    save();
  }

  function nowStr() {
    var d = new Date(), p = function (x) { return x < 10 ? "0" + x : "" + x; };
    return p(d.getDate()) + "/" + p(d.getMonth() + 1) + "/" + d.getFullYear() + " " + p(d.getHours()) + ":" + p(d.getMinutes());
  }

  load();

  return {
    get s() { return S; },
    load: load, save: save, reset: reset, id: id, nowStr: nowStr, canLS: function () { return canLS; },
    login: login, loginAs: loginAs, logout: logout, me: me,
    user: user, course: course, lesson: lesson, cls: cls, asg: asg,
    lessonsOf: lessonsOf, classesOfStudent: classesOfStudent, classesOfTeacher: classesOfTeacher,
    myClasses: myClasses, myCourses: myCourses,
    asgOfClass: asgOfClass, asgOfStudent: asgOfStudent,
    subOf: subOf, subsOf: subsOf, fbOf: fbOf, fbOfStudent: fbOfStudent,
    autoScore: autoScore, manualMax: manualMax, manualScore: manualScore, isAuto: isAuto, correct: correct,
    prog: prog, markPart: markPart, courseProg: courseProg, studentProg: studentProg, avgScore: avgScore,
    notify: notify, myNotifs: myNotifs, readNotifs: readNotifs
  };
})();
