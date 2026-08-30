/* ==========================================================================
   ui.js — hàm dựng giao diện dùng chung
   ========================================================================== */
/* Từ loại của một từ vựng. Dữ liệu cũ lưu thành chuỗi ghép ("danh từ 名 · động từ 动"),
   bản mới lưu thành mảng — hàm này đọc được cả hai và luôn trả về mảng.
   Để ở đây vì cả màn soạn bài lẫn màn học của học viên đều cần. */
function loaiTu(v) {
  if (Array.isArray(v.pos)) return v.pos.slice();
  return String(v.pos || "").split("·").map(function (x) { return x.trim(); })
    .filter(function (x) { return x; });
}

var UI = (function () {

  /* ------------------------------------------------------------ tiện ích */
  function h(s) {
    return String(s === undefined || s === null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function qs(sel, root) { return (root || document).querySelector(sel); }
  function qsa(sel, root) { return [].slice.call((root || document).querySelectorAll(sel)); }
  function go(hash) { location.hash = hash; }
  function num(n) { return String(Math.round(n * 10) / 10).replace(".", ","); }

  function av(u, size) {
    size = size || 32;
    if (!u) return "";
    return '<span class="av-s" style="background:' + u.color + ';width:' + size + 'px;height:' + size +
      'px;font-size:' + Math.round(size * 0.38) + 'px">' + h(u.ini) + '</span>';
  }
  function bar(p, cl) {
    return '<span class="bar ' + (cl || "") + '"><i style="width:' + Math.max(0, Math.min(100, p)) + '%"></i></span>';
  }
  function chip(t, cl) { return '<span class="chip ' + (cl || "") + '">' + t + '</span>'; }

  var STATUS = {
    run: ["Đang học", "jade"], soon: ["Sắp khai giảng", "blue"], done: ["Đã kết thúc", "grey"],
    open: ["Đang mở", "jade"], closed: ["Đã đóng", "grey"],
    none: ["Chưa nộp", "grey"], draftS: ["Đang làm dở", "gold"],
    submitted: ["Đã nộp", "jade"], late: ["Nộp muộn", "gold"], graded: ["Đã chấm", "blue"]
  };
  function st(k) { var s = STATUS[k] || [k, ""]; return chip(s[0], s[1]); }
  function stText(k) { return (STATUS[k] || [k])[0]; }

  /* ------------------------------------------------------------ thông báo nổi */
  function toast(msg, type) {
    var box = qs(".toasts");
    if (!box) { box = document.createElement("div"); box.className = "toasts"; document.body.appendChild(box); }
    var el = document.createElement("div");
    el.className = "toast " + (type || "");
    el.innerHTML = (type === "ok" ? "✅ " : type === "no" ? "⚠️ " : "💬 ") + msg;
    box.appendChild(el);
    setTimeout(function () { el.style.opacity = "0"; el.style.transform = "translateY(8px)"; }, 2600);
    setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 3100);
  }

  /* ------------------------------------------------------------ hộp thoại */
  function modal(o) {
    closeModal();
    var m = document.createElement("div");
    m.className = "mask";
    m.innerHTML =
      '<div class="modal' + (o.wide ? " wide" : "") + '">' +
      '<div class="mh"><h3>' + o.title + '</h3><button class="x" data-close>✕</button></div>' +
      '<div class="mb">' + o.body + '</div>' +
      (o.footer ? '<div class="mf">' + o.footer + '</div>' : '') +
      '</div>';
    document.body.appendChild(m);
    m.addEventListener("click", function (e) {
      if (e.target === m || e.target.hasAttribute("data-close")) closeModal();
    });
    if (o.onReady) o.onReady(m);
    return m;
  }
  function closeModal() { var m = qs(".mask"); if (m) m.parentNode.removeChild(m); }

  /* ------------------------------------------------------------ khung ứng dụng */
  function menuFor(u) {
    var pending = pendingGrade(u);
    var hvTodo = todoCount(u);
    if (u.role === "hv") return [
      ["#/hv", "🏠", "Trang chủ", ""],
      ["#/hv/giao-trinh", "📚", "Giáo trình của tôi", ""],
      ["#/hv/bai-tap", "📝", "Bài tập", hvTodo ? String(hvTodo) : ""],
      ["#/hv/ket-qua", "🎯", "Kết quả & ghi chú", ""]
    ];
    return [
      ["#/gv", "🏠", "Bảng điều khiển", ""],
      ["#/admin/giao-trinh", "📚", "Giáo trình", ""],
      ["#/admin/lop", "🏫", "Lớp học", ""],
      ["#/admin/bai-tap", "📝", "Bài tập", ""],
      ["#/admin/cham", "📥", "Bài cần chấm", pending ? String(pending) : ""],
      ["#/admin/nguoi-dung", "👥", "Người dùng", ""]
    ];
  }

  function pendingGrade(u) {
    if (!u || u.role === "hv") return 0;
    var ks = Store.classesOfTeacher(u.id);
    var kid = {}; ks.forEach(function (k) { kid[k.id] = 1; });
    var n = 0;
    Store.s.assignments.forEach(function (a) {
      if (!kid[a.classId]) return;
      Store.subsOf(a.id).forEach(function (s) { if (s.finalScore === null) n++; });
    });
    return n;
  }
  function todoCount(u) {
    if (!u || u.role !== "hv") return 0;
    var n = 0;
    Store.asgOfStudent(u.id).forEach(function (a) {
      var s = Store.subOf(a.id, u.id);
      if (!s || s.status === "draft") n++;
    });
    return n;
  }

  /* opts: {active, title, crumb, actions, body} */
  function shell(o) {
    var u = Store.me();
    var menu = menuFor(u);
    var unread = Store.myNotifs().filter(function (n) { return !n.read; }).length;
    var extra = u.role !== "hv"
      ? '<div class="grp">Xem như học viên</div>' +
        '<a href="#/hoc/l3"><span class="ic">▶</span>Vào bài học</a>' +
        '<a href="#/trinh-chieu/l3"><span class="ic">🖥️</span>Trình chiếu</a>' : '';

    return '' +
      '<div class="app">' +
      '<aside class="side" id="side">' +
        '<div class="brand"><span class="mark zh">汉</span><span>HanZi<span style="opacity:.5">LMS</span></span></div>' +
        '<div class="grp">' + (u.role === "hv" ? "Học tập" : "Giảng dạy &amp; quản lý") + '</div>' +
        menu.map(function (m) {
          return '<a href="' + m[0] + '" class="' + (m[0] === o.active ? "on" : "") + '">' +
            '<span class="ic">' + m[1] + '</span>' + m[2] +
            (m[3] ? '<span class="bdg">' + m[3] + '</span>' : '') + '</a>';
        }).join('') + extra +
        '<div class="who">' + av(u, 36) +
          '<div><div class="n">' + h(u.name) + '</div><div class="r">' + roleName(u.role) + '</div></div>' +
          '<button class="out" data-act="logout" title="Đăng xuất">⎋</button>' +
        '</div>' +
      '</aside>' +
      '<div class="main">' +
        '<div class="top">' +
          '<button class="burger" data-act="burger">☰</button>' +
          '<div><div class="crumb">' + (o.crumb || "") + '</div><h1>' + o.title + '</h1></div>' +
          '<div class="right row">' + (o.actions || "") +
            '<button class="btn ghost sm" data-act="notif" style="position:relative">🔔' +
              (unread ? '<span class="bdg" style="position:absolute;top:-6px;right:-6px;background:var(--red);color:#fff;font-size:10px;font-weight:800;padding:1px 6px;border-radius:99px">' + unread + '</span>' : '') +
            '</button>' +
            '<button class="acct" data-act="acct" title="Tài khoản">' + av(u, 36) + '</button>' +
          '</div>' +
        '</div>' +
        '<div class="body fade">' + o.body + '</div>' +
      '</div></div>';
  }

  function roleName(r) {
    return r === "gv" ? "Giáo viên" : "Học viên";
  }

  /* ------------------------------------------------------------ khối hay dùng */
  function stat(ic, bg, n, label, note, noteColor) {
    return '<div class="stat"><div class="ic" style="background:' + bg + '">' + ic + '</div>' +
      '<div class="n">' + n + '</div><div class="l">' + label + '</div>' +
      (note ? '<div class="d" style="color:' + (noteColor || "var(--muted)") + '">' + note + '</div>' : '') + '</div>';
  }
  function secT(title, right) {
    return '<div class="sec-t"><h2>' + title + '</h2><span class="ln"></span>' + (right || "") + '</div>';
  }
  function table(cols, rows, minw) {
    return '<div class="tbl"><div class="scroll"><table' + (minw ? ' style="min-width:' + minw + 'px"' : '') + '>' +
      '<thead><tr>' + cols.map(function (c) { return '<th>' + c + '</th>'; }).join('') + '</tr></thead>' +
      '<tbody>' + (rows.length ? rows.join('') :
        '<tr><td colspan="' + cols.length + '" class="empty">Chưa có dữ liệu</td></tr>') + '</tbody></table></div></div>';
  }
  function alert(kind, ic, html) {
    return '<div class="alert ' + kind + '"><span class="ai">' + ic + '</span><div>' + html + '</div></div>';
  }
  function backLink(hash, text) {
    return '<a href="' + hash + '" class="btn ghost sm">← ' + text + '</a>';
  }

  return {
    h: h, qs: qs, qsa: qsa, go: go, num: num, av: av, bar: bar, chip: chip,
    st: st, stText: stText, toast: toast, modal: modal, closeModal: closeModal,
    shell: shell, roleName: roleName, stat: stat, secT: secT, table: table,
    alert: alert, backLink: backLink, pendingGrade: pendingGrade, todoCount: todoCount
  };
})();
