/* ==========================================================================
   S-20 Quản lý người dùng (chỉ quản trị viên)
   ========================================================================== */
ROUTES["admin/nguoi-dung"] = {
  roles: ["admin"],
  view: function () {
    var us = Store.s.users;
    var nHv = us.filter(function (u) { return u.role === "hv"; }).length;
    var nGv = us.filter(function (u) { return u.role === "gv"; }).length;
    var nAd = us.filter(function (u) { return u.role === "admin"; }).length;
    var nOff = us.filter(function (u) { return !u.active; }).length;

    function classesOf(u) {
      var ks = u.role === "hv" ? Store.classesOfStudent(u.id) : Store.classesOfTeacher(u.id);
      return ks.map(function (k) { return k.code; }).join(", ") || "—";
    }
    var rows = us.map(function (u) {
      return '<tr data-f="' + u.role + (u.active ? "" : " off") + '">' +
        '<td style="width:44px">' + UI.av(u) + '</td>' +
        '<td class="b">' + UI.h(u.name) + '</td>' +
        '<td class="sm muted">' + UI.h(u.email) + '</td>' +
        '<td>' + UI.chip(UI.roleName(u.role), u.role === "admin" ? "purple" : u.role === "gv" ? "red" : "blue") + '</td>' +
        '<td class="sm">' + UI.h(classesOf(u)) + '</td>' +
        '<td>' + UI.chip(u.active ? "Hoạt động" : "Chưa kích hoạt", u.active ? "jade" : "gold") + '</td>' +
        '<td class="sm muted">' + UI.h(u.last) + '</td>' +
        '<td style="text-align:right;white-space:nowrap">' +
          '<button class="btn ghost sm" data-edit="' + u.id + '">Sửa</button> ' +
          '<button class="btn ghost sm" data-more="' + u.id + '">⋯</button></td></tr>';
    });

    var body = '<div class="grid g4 mb">' +
      UI.stat("🎒", "var(--blue-soft)", nHv, "Học viên", us.filter(function (u) { return u.role === "hv" && u.active; }).length + " đã kích hoạt") +
      UI.stat("👩‍🏫", "var(--red-soft)", nGv, "Giáo viên", "Tất cả đang hoạt động") +
      UI.stat("🛡️", "var(--purple-soft)", nAd, "Quản trị viên", us.filter(function (u) { return u.role === "admin"; })[0].name) +
      UI.stat("⏳", "var(--gold-soft)", nOff, "Chờ kích hoạt", nOff ? "Gửi lại lời mời?" : "Không có", nOff ? "var(--gold)" : "var(--muted)") +
    '</div>' +
    '<div class="row wrap mb" id="fBar">' +
      '<span class="chip btn-like on" data-f="all">Tất cả (' + us.length + ')</span>' +
      '<span class="chip btn-like" data-f="hv">Học viên (' + nHv + ')</span>' +
      '<span class="chip btn-like" data-f="gv">Giáo viên (' + nGv + ')</span>' +
      '<span class="chip btn-like" data-f="admin">Quản trị (' + nAd + ')</span>' +
      '<span class="right row"><input class="inp sm" id="uSearch" placeholder="🔍 Tìm theo tên hoặc email…" style="width:230px">' +
      '<button class="btn ghost sm" data-act="excel">⤒ Nhập Excel</button>' +
      '<button class="btn ghost sm" data-act="excel">⤓ Xuất Excel</button></span></div>' +
    UI.table(["", "Họ tên", "Email đăng nhập", "Vai trò", "Lớp", "Trạng thái", "Đăng nhập gần nhất", ""], rows, 1000) +
    '<div class="mt2">' + UI.alert("gold", "🛡️",
      '<b>Chỉ quản trị viên</b> mới tạo, đổi vai trò và khoá tài khoản. ' +
      'Giáo viên được đặt lại mật khẩu cho học viên trong lớp mình, nhưng không đổi được vai trò của ai.') + '</div>';

    return UI.shell({ active: "#/admin/nguoi-dung", title: "Người dùng", crumb: "Quản trị",
      actions: '<button class="btn red sm" id="newUser">＋ Thêm người dùng</button>', body: body });
  },

  init: function (root) {
    filterBar(root);
    UI.qs("#uSearch", root).oninput = function () {
      var q = this.value.toLowerCase();
      UI.qsa("tbody tr", root).forEach(function (tr) {
        tr.style.display = tr.textContent.toLowerCase().indexOf(q) >= 0 ? "" : "none";
      });
    };

    function userForm(u) {
      return '<div class="grid g2" style="gap:0 14px">' +
        '<div class="fld"><label>Họ và tên *</label><input class="inp" id="uName" value="' + UI.h(u ? u.name : "") + '"></div>' +
        '<div class="fld"><label>Số điện thoại</label><input class="inp" id="uPhone" value="' + UI.h(u ? u.phone : "") + '"></div></div>' +
        '<div class="fld"><label>Email đăng nhập *</label><input class="inp" id="uMail" value="' + UI.h(u ? u.email : "") + '"></div>' +
        '<div class="grid g2" style="gap:0 14px">' +
        '<div class="fld"><label>Vai trò *</label><select class="inp" id="uRole">' +
          ["hv", "gv", "admin"].map(function (r) {
            return '<option value="' + r + '"' + (u && u.role === r ? " selected" : "") + '>' + UI.roleName(r) + '</option>';
          }).join('') + '</select></div>' +
        '<div class="fld"><label>Trạng thái</label><select class="inp" id="uAct">' +
          '<option value="1"' + (!u || u.active ? " selected" : "") + '>Hoạt động</option>' +
          '<option value="0"' + (u && !u.active ? " selected" : "") + '>Khoá / chưa kích hoạt</option></select></div></div>' +
        '<div class="fld"><label>Mật khẩu ' + (u ? "mới (bỏ trống nếu không đổi)" : "*") + '</label>' +
          '<input class="inp" id="uPass" placeholder="' + (u ? "••••••" : "vd: 123456") + '"></div>';
    }
    function saveUser(m, u) {
      var name = UI.qs("#uName", m).value.trim(), mail = UI.qs("#uMail", m).value.trim();
      if (!name || !mail) { UI.toast("Cần nhập họ tên và email.", "no"); return false; }
      var dup = Store.s.users.filter(function (x) {
        return x.email.toLowerCase() === mail.toLowerCase() && (!u || x.id !== u.id); })[0];
      if (dup) { UI.toast("Email này đã có người dùng.", "no"); return false; }
      var pass = UI.qs("#uPass", m).value.trim();
      if (!u && !pass) { UI.toast("Cần đặt mật khẩu ban đầu.", "no"); return false; }
      var parts = name.split(" ");
      var ini = (parts[parts.length - 2] || parts[0] || "?").charAt(0) + (parts[parts.length - 1] || "").charAt(0);
      var t = u || { id: Store.id("u"), color: SEED.colorPool[Store.s.users.length % SEED.colorPool.length], last: "Chưa đăng nhập" };
      t.name = name; t.email = mail; t.phone = UI.qs("#uPhone", m).value.trim();
      t.role = UI.qs("#uRole", m).value;
      t.active = UI.qs("#uAct", m).value === "1";
      t.ini = ini.toUpperCase();
      if (pass) t.pass = pass;
      if (!u) Store.s.users.push(t);
      Store.save();
      return true;
    }

    UI.qs("#newUser", root).onclick = function () {
      UI.modal({
        title: "Thêm người dùng", body: userForm(null),
        footer: '<button class="btn ghost" data-close>Huỷ</button><button class="btn red" id="uOk">Tạo tài khoản</button>',
        onReady: function (m) {
          UI.qs("#uOk", m).onclick = function () {
            if (saveUser(m, null)) { UI.closeModal(); UI.toast("Đã tạo tài khoản.", "ok"); App.render(); }
          };
        }
      });
    };

    UI.qsa("[data-edit]", root).forEach(function (b) {
      b.onclick = function () {
        var u = Store.user(b.getAttribute("data-edit"));
        UI.modal({
          title: "Sửa người dùng — " + u.name, body: userForm(u),
          footer: '<button class="btn ghost" data-close>Huỷ</button><button class="btn red" id="uOk">Lưu thay đổi</button>',
          onReady: function (m) {
            UI.qs("#uOk", m).onclick = function () {
              if (saveUser(m, u)) { UI.closeModal(); UI.toast("Đã lưu thay đổi.", "ok"); App.render(); }
            };
          }
        });
      };
    });

    UI.qsa("[data-more]", root).forEach(function (b) {
      b.onclick = function () {
        var u = Store.user(b.getAttribute("data-more"));
        UI.modal({
          title: u.name,
          body: '<div class="row mb">' + UI.av(u, 48) + '<div><div class="bb">' + UI.h(u.name) + '</div>' +
            '<div class="sm muted">' + UI.h(u.email) + ' · ' + UI.roleName(u.role) + '</div></div></div>' +
            '<button class="btn ghost block mb" id="mReset">🔑 Đặt lại mật khẩu về 123456</button>' +
            '<button class="btn ghost block mb" id="mLock">' + (u.active ? "🔒 Khoá tài khoản" : "🔓 Mở khoá tài khoản") + '</button>' +
            '<button class="btn ghost block mb" id="mAs">👤 Đăng nhập với vai trò này</button>' +
            (u.id === Store.me().id ? "" : '<button class="btn ghost block" id="mDel" style="color:var(--red)">🗑️ Xoá tài khoản</button>'),
          footer: '<button class="btn ghost" data-close>Đóng</button>',
          onReady: function (m) {
            UI.qs("#mReset", m).onclick = function () {
              u.pass = "123456"; Store.save(); UI.closeModal(); UI.toast("Đã đặt lại mật khẩu về 123456.", "ok");
            };
            UI.qs("#mLock", m).onclick = function () {
              u.active = !u.active; Store.save(); UI.closeModal();
              UI.toast(u.active ? "Đã mở khoá." : "Đã khoá tài khoản.", "ok"); App.render();
            };
            UI.qs("#mAs", m).onclick = function () {
              Store.loginAs(u.id); UI.closeModal();
              UI.go(u.role === "hv" ? "#/hv" : u.role === "gv" ? "#/gv" : "#/admin");
              UI.toast("Đang xem với vai trò " + u.name, "info");
            };
            var d = UI.qs("#mDel", m);
            if (d) d.onclick = function () {
              Store.s.users = Store.s.users.filter(function (x) { return x.id !== u.id; });
              Store.s.classes.forEach(function (k) {
                k.students = k.students.filter(function (x) { return x !== u.id; });
              });
              Store.save(); UI.closeModal(); UI.toast("Đã xoá tài khoản.", "ok"); App.render();
            };
          }
        });
      };
    });
  }
};

/* cấu hình hệ thống — lối vào phụ, giữ để menu quản trị đủ nghĩa */
ROUTES["admin/caidat"] = {
  roles: ["admin"],
  view: function () {
    var body = '<div class="grid g2" style="align-items:start">' +
      '<div class="card pad"><div class="bb mb" style="font-size:16px">Cấu hình chung</div>' +
        '<div class="fld"><label>Tên trung tâm</label><input class="inp" value="Trung tâm Hán ngữ HanZi"></div>' +
        '<div class="fld"><label>Thang điểm mặc định</label><input class="inp" value="10"></div>' +
        '<div class="fld"><label>Sĩ số tối đa mỗi lớp</label><input class="inp" value="20"></div>' +
        '<div class="fld"><label>Kênh thông báo</label>' +
          '<label class="chk mb"><input type="checkbox" checked> Thông báo trong ứng dụng</label><br>' +
          '<label class="chk mb"><input type="checkbox" checked> Email</label><br>' +
          '<label class="chk"><input type="checkbox"> Zalo OA</label></div>' +
        '<button class="btn red">✔ Lưu cấu hình</button></div>' +
      '<div class="card pad"><div class="bb mb" style="font-size:16px">Dữ liệu bản demo</div>' +
        '<p class="sm muted mb">Toàn bộ dữ liệu được lưu trong trình duyệt của bạn (localStorage). ' +
        'Bấm nút dưới để xoá và nạp lại dữ liệu mẫu ban đầu.</p>' +
        '<button class="btn ghost block" data-act="reset">🔄 Nạp lại dữ liệu mẫu</button>' +
        '<div class="mt">' + UI.alert("blue", "💾", 'Trạng thái lưu: <b>' +
          (Store.canLS() ? "localStorage — giữ được sau khi đóng trình duyệt" :
           "bộ nhớ tạm — mất khi tải lại trang") + '</b>') + '</div></div></div>';
    return UI.shell({ active: "#/admin/nguoi-dung", title: "Cấu hình hệ thống", crumb: "Quản trị", body: body });
  }
};
