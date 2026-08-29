/* ==========================================================================
   app.js — bộ định tuyến và các sự kiện chung
   ========================================================================== */
var App = (function () {
  var root = null;

  /* ------------------------------------------------------- phân tích địa chỉ */
  function parse() {
    var h = (location.hash || "#/login").replace(/^#\/?/, "");
    var qi = h.indexOf("?");
    var q = {};
    if (qi >= 0) {
      h.slice(qi + 1).split("&").forEach(function (kv) {
        var a = kv.split("="); if (a[0]) q[decodeURIComponent(a[0])] = decodeURIComponent(a[1] || "");
      });
      h = h.slice(0, qi);
    }
    h = h.replace(/\/+$/, "");
    return { path: h || "login", query: q };
  }

  function match(path) {
    if (ROUTES[path]) return { route: ROUTES[path], params: {} };
    var segs = path.split("/");
    var best = null;
    Object.keys(ROUTES).forEach(function (key) {
      var ks = key.split("/");
      if (ks.length !== segs.length) return;
      var params = {}, ok = true, score = 0;
      for (var i = 0; i < ks.length; i++) {
        if (ks[i].charAt(0) === ":") params[ks[i].slice(1)] = segs[i];
        else if (ks[i] === segs[i]) score++;
        else { ok = false; break; }
      }
      if (ok && (!best || score > best.score)) best = { route: ROUTES[key], params: params, score: score };
    });
    return best;
  }

  /* ------------------------------------------------------- vẽ màn hình */
  function render() {
    if (!root) root = document.getElementById("app");
    if (window.__slideKeys) { document.removeEventListener("keydown", window.__slideKeys); window.__slideKeys = null; }
    TTS.stop();
    UI.closeModal();

    var p = parse();
    var m = match(p.path);
    var me = Store.me();

    /* chưa đăng nhập → về màn đăng nhập */
    if (!m) { location.hash = me ? homeOf(me) : "#/login"; return; }
    var r = m.route;
    if (!r.guest && !me) { location.hash = "#/login"; return; }
    if (r.guest && me && (p.path === "login")) { location.hash = homeOf(me); return; }

    /* kiểm tra quyền */
    if (r.roles && me && r.roles.indexOf(me.role) < 0) {
      UI.toast("Bạn không có quyền vào mục này.", "no");
      location.hash = homeOf(me);
      return;
    }

    var params = m.params;
    Object.keys(p.query).forEach(function (k) { params[k] = p.query[k]; });

    root.innerHTML = r.view(params) || "";
    document.title = "HanZi LMS" + (r.title ? " · " + r.title : "");
    window.scrollTo(0, 0);
    if (r.init) { try { r.init(root, params); } catch (e) { console.error("init lỗi:", e); } }
    bindCommon(root);
  }

  function homeOf(u) { return u.role === "hv" ? "#/hv" : "#/gv"; }

  /* ------------------------------------------------------- sự kiện dùng chung */
  function bindCommon(root) {
    /* nút loa */
    UI.qsa("[data-say]", root).forEach(function (b) {
      b.onclick = function (e) {
        e.stopPropagation();
        TTS.say(b.getAttribute("data-say"), b.classList.contains("spk") ? b : null);
      };
    });

    /* đăng xuất */
    var out = UI.qs("[data-act=logout]", root);
    if (out) out.onclick = function () {
      UI.modal({
        title: "Đăng xuất?",
        body: '<p>Bạn sẽ quay về màn hình đăng nhập. Dữ liệu bài làm đã lưu vẫn được giữ.</p>',
        footer: '<button class="btn ghost" data-close>Ở lại</button><button class="btn red" id="outOk">Đăng xuất</button>',
        onReady: function (m) {
          UI.qs("#outOk", m).onclick = function () {
            Store.logout(); UI.closeModal(); UI.go("#/login");
          };
        }
      });
    };

    /* thẻ tài khoản ở góc phải */
    var ac = UI.qs("[data-act=acct]", root);
    if (ac) ac.onclick = function () {
      var u = Store.me();
      UI.modal({
        title: "Tài khoản",
        body: '<div class="row mb">' + UI.av(u, 48) + '<div><div class="bb">' + UI.h(u.name) + '</div>' +
          '<div class="sm muted">' + UI.h(u.email) + ' · ' + UI.roleName(u.role) + '</div></div></div>' +
          '<p class="sm muted">Bạn sẽ quay về màn hình đăng nhập. Dữ liệu bài làm đã lưu vẫn được giữ.</p>',
        footer: '<button class="btn ghost" data-close>Đóng</button>' +
          '<button class="btn red" id="acOut">⎋ Đăng xuất</button>',
        onReady: function (m) {
          UI.qs("#acOut", m).onclick = function () {
            Store.logout(); UI.closeModal(); UI.go("#/login");
          };
        }
      });
    };

    /* mở thanh bên trên màn nhỏ */
    var bg = UI.qs("[data-act=burger]", root);
    if (bg) bg.onclick = function () { UI.qs("#side", root).classList.toggle("open"); };
    UI.qsa(".side a", root).forEach(function (a) {
      a.addEventListener("click", function () { UI.qs("#side", root).classList.remove("open"); });
    });

    /* chuông thông báo */
    var nb = UI.qs("[data-act=notif]", root);
    if (nb) nb.onclick = function () {
      var list = Store.myNotifs();
      UI.modal({
        title: "Thông báo",
        body: list.length ? list.slice(0, 12).map(function (n) {
          return '<a class="row top" href="' + (n.link || "#") + '" data-close style="padding:11px 0;border-bottom:1px solid var(--line)">' +
            '<span style="font-size:17px">' + (n.read ? "📭" : "📬") + '</span>' +
            '<div class="grow"><div class="b sm">' + UI.h(n.title) + '</div>' +
            '<div class="sm muted">' + UI.h(n.body) + '</div>' +
            '<div class="xs muted">' + UI.h(n.at) + '</div></div></a>';
        }).join('') : '<div class="empty">Chưa có thông báo nào.</div>',
        footer: '<button class="btn ghost" data-close>Đóng</button>' +
          (list.length ? '<button class="btn red" id="nRead">Đánh dấu đã đọc</button>' : ''),
        onReady: function (m) {
          var b = UI.qs("#nRead", m);
          if (b) b.onclick = function () { Store.readNotifs(); UI.closeModal(); render(); };
        }
      });
    };

    /* các nút minh hoạ chưa nối chức năng */
    UI.qsa("[data-act=excel]", root).forEach(function (b) {
      b.onclick = function () { UI.toast("Bản demo giao diện — chưa nối chức năng Excel.", "info"); };
    });
    UI.qsa("[data-act=saveNote]", root).forEach(function (b) {
      b.onclick = function () { UI.toast("Đã lưu.", "ok"); };
    });
    UI.qsa("[data-act=reset]", root).forEach(function (b) {
      b.onclick = function () {
        UI.modal({
          title: "Nạp lại dữ liệu mẫu?",
          body: '<p>Mọi thay đổi bạn đã tạo (giáo trình, lớp, bài tập, bài nộp, ghi chú) sẽ bị xoá ' +
                'và thay bằng dữ liệu mẫu ban đầu.</p>',
          footer: '<button class="btn ghost" data-close>Huỷ</button><button class="btn red" id="rsOk">Xoá và nạp lại</button>',
          onReady: function (m) {
            UI.qs("#rsOk", m).onclick = function () {
              Store.reset(); UI.closeModal(); UI.go("#/login");
              setTimeout(function () { location.reload(); }, 60);
            };
          }
        });
      };
    });
  }

  /* ------------------------------------------------------- khởi động */
  function boot() {
    root = document.getElementById("app");
    window.addEventListener("hashchange", render);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") UI.closeModal();
    });
    if (!location.hash) location.hash = Store.me() ? homeOf(Store.me()) : "#/login";
    render();
    if (!Store.canLS()) {
      setTimeout(function () {
        UI.toast("Trình duyệt chặn lưu trữ — dữ liệu chỉ giữ trong phiên này.", "no");
      }, 800);
    }
  }

  return { render: render, boot: boot, homeOf: homeOf };
})();

document.addEventListener("DOMContentLoaded", App.boot);
