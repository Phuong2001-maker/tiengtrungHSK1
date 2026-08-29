/* ==========================================================================
   S-01 Đăng nhập · S-02 Quên mật khẩu
   ========================================================================== */

ROUTES["login"] = {
  full: true, guest: true, title: "Đăng nhập",
  view: function () {
    return '' +
    '<div class="auth">' +
      '<div class="auth-brand">' +
        '<div class="auth-logo"><span class="mark zh">汉</span><span>HanZi LMS</span></div>' +
        '<h2>Học tiếng Trung theo giáo trình, có thầy cô đồng hành.</h2>' +
        '<p class="lead">Bài học tương tác, bài tập giao tận nơi, nhận xét riêng cho từng học viên — tất cả trong một chỗ.</p>' +
        '<div class="auth-feats">' +
          '<div class="auth-feat"><i>🔊</i>Nghe phát âm chuẩn từng chữ, từng câu</div>' +
          '<div class="auth-feat"><i>🎮</i>Ôn tập bằng trò chơi ghép từ, sắp xếp câu</div>' +
          '<div class="auth-feat"><i>💬</i>Giáo viên ghi chú riêng phần bạn chưa vững</div>' +
        '</div>' +
        '<div class="auth-note">© 2026 HanZi LMS · Dữ liệu từ điển: CC-CEDICT (CC BY-SA 4.0) · pinyin-data (MIT) · Unicode CLDR</div>' +
      '</div>' +
      '<div class="auth-form"><div class="auth-box">' +
        '<h1>Chào mừng trở lại 👋</h1>' +
        '<div class="auth-err hide" id="lgErr"><span>⚠️</span><span id="lgErrTxt"></span></div>' +
        '<form id="lgForm">' +
        '<div class="fld" id="fEmail"><label for="lgEmail">Email hoặc số điện thoại</label>' +
          '<div class="inp-ico"><span class="ic">✉️</span>' +
          '<input class="inp big" id="lgEmail" autocomplete="username" placeholder="vd: hv@hanzi.vn"></div>' +
          '<div class="hint">Không phân biệt chữ hoa — thừa dấu cách cũng vẫn vào được.</div>' +
          '<div class="err">Bạn chưa nhập email hoặc số điện thoại.</div></div>' +
        '<div class="fld" id="fPass"><label for="lgPass">Mật khẩu</label>' +
          '<div class="inp-ico"><span class="ic">🔒</span>' +
          '<input class="inp big" id="lgPass" type="password" autocomplete="current-password" placeholder="••••••">' +
          '<button class="eye" type="button" id="lgEye" title="Hiện mật khẩu">👁</button></div>' +
          '<div class="err">Bạn chưa nhập mật khẩu.</div></div>' +
        '<div class="auth-opts">' +
          '<label class="chk"><input type="checkbox" id="lgRemember" checked> Ghi nhớ tôi trong 30 ngày</label>' +
          '<a href="#/quen-mat-khau">Quên mật khẩu?</a></div>' +
        '<button class="btn red lg block" type="submit" id="lgBtn">Đăng nhập →</button>' +
        '</form>' +
        '<div class="auth-div">hoặc</div>' +
        '<button class="btn ghost block" style="padding:13px" data-act="google">🟦 Đăng nhập bằng Google</button>' +
        '<div class="auth-foot">Chưa có tài khoản? Học viên được giáo viên tạo sẵn — hãy hỏi lớp của bạn để lấy <b>mã lớp</b>.</div>' +
      '</div></div>' +
    '</div>';
  },
  init: function (root) {
    var email = UI.qs("#lgEmail"), pass = UI.qs("#lgPass");

    UI.qs("#lgEye").onclick = function () {
      pass.type = pass.type === "password" ? "text" : "password";
      this.textContent = pass.type === "password" ? "👁" : "🙈";
    };

    UI.qs("[data-act=google]").onclick = function () {
      UI.toast("Bản demo chưa nối Google. Hãy đăng nhập bằng email và mật khẩu.", "info");
    };

    UI.qs("#lgForm").onsubmit = function (e) { e.preventDefault(); submit(); };

    function bad(id, msg) {
      var f = UI.qs(id); f.classList.add("bad");
      if (msg) UI.qs(".err", f).textContent = msg;
      UI.qs(".inp", f).focus();
    }
    function clean() {
      UI.qsa(".fld", root).forEach(function (f) { f.classList.remove("bad"); });
      UI.qs("#lgErr").classList.add("hide");
    }

    function submit() {
      clean();
      if (!email.value.trim()) return bad("#fEmail");
      if (!pass.value) return bad("#fPass");
      var btn = UI.qs("#lgBtn");
      btn.classList.add("loading"); btn.textContent = "Đang đăng nhập…";
      setTimeout(function () {
        var r = Store.login(email.value, pass.value);
        btn.classList.remove("loading"); btn.textContent = "Đăng nhập →";
        if (!r.ok) {
          UI.qs("#lgErrTxt").textContent = r.msg;
          UI.qs("#lgErr").classList.remove("hide");
          if (/Mật khẩu/.test(r.msg)) bad("#fPass", r.msg); else bad("#fEmail", r.msg);
          return;
        }
        UI.toast("Xin chào " + r.user.name + "!", "ok");
        UI.go(r.user.role === "hv" ? "#/hv" : "#/gv");
      }, 260);
    }
    email.focus();
  }
};

/* -------------------------------------------------------------------------- */
ROUTES["quen-mat-khau"] = {
  full: true, guest: true, title: "Quên mật khẩu",
  view: function () {
    return '' +
    '<div class="auth">' +
      '<div class="auth-brand">' +
        '<div class="auth-logo"><span class="mark zh">汉</span><span>HanZi LMS</span></div>' +
        '<h2>别担心 — Đừng lo, lấy lại mật khẩu chỉ mất 1 phút.</h2>' +
        '<p class="lead">Chúng tôi gửi mã 6 số về email hoặc Zalo của bạn. Không cần nhớ câu hỏi bí mật.</p>' +
      '</div>' +
      '<div class="auth-form"><div class="auth-box">' +
        '<a href="#/login" class="sm b muted">← Quay lại đăng nhập</a>' +
        '<h1 style="margin-top:14px">Quên mật khẩu</h1>' +
        '<div class="sub">Nhập email hoặc số điện thoại đã đăng ký, chúng tôi gửi mã xác nhận.</div>' +
        '<div id="qmStep1">' +
          '<div class="fld"><label>Email hoặc số điện thoại</label>' +
            '<div class="inp-ico"><span class="ic">✉️</span>' +
            '<input class="inp big" id="qmEmail" placeholder="vd: hv@hanzi.vn hoặc 0903 456 789"></div></div>' +
          '<button class="btn red lg block" id="qmSend">Gửi mã xác nhận</button>' +
        '</div>' +
        '<div id="qmStep2" class="hide">' +
          '<div class="alert jade mb"><span class="ai">✅</span><div>Đã gửi mã 6 số tới <b id="qmTo"></b>. Mã có hiệu lực 10 phút.</div></div>' +
          '<div class="fld"><label>Mã xác nhận</label>' +
            '<input class="inp big center" id="qmCode" placeholder="• • • • • •" maxlength="6" style="letter-spacing:8px;font-weight:800"></div>' +
          '<div class="fld"><label>Mật khẩu mới</label><input class="inp big" type="password" placeholder="Ít nhất 6 ký tự"></div>' +
          '<button class="btn red lg block" id="qmDone">Đặt lại mật khẩu</button>' +
          '<div class="center sm muted" style="margin-top:12px">Không nhận được mã? <a href="#" class="red b" id="qmAgain">Gửi lại</a></div>' +
        '</div>' +
        '<div class="alert blue mt2"><span class="ai">💡</span><div>Nếu bạn là học viên và không nhớ email đã đăng ký, hãy nhắn cho <b>giáo viên chủ nhiệm lớp</b> — thầy cô đặt lại mật khẩu giúp bạn ngay trong màn hình quản lý lớp.</div></div>' +
      '</div></div>' +
    '</div>';
  },
  init: function () {
    UI.qs("#qmSend").onclick = function () {
      var v = UI.qs("#qmEmail").value.trim();
      if (!v) { UI.toast("Bạn chưa nhập email hoặc số điện thoại.", "no"); return; }
      UI.qs("#qmTo").textContent = v;
      UI.qs("#qmStep1").classList.add("hide");
      UI.qs("#qmStep2").classList.remove("hide");
      UI.toast("Đã gửi mã xác nhận (bản demo — nhập 6 số bất kỳ).", "ok");
    };
    UI.qs("#qmDone").onclick = function () {
      UI.toast("Đặt lại mật khẩu thành công. Mời bạn đăng nhập.", "ok");
      UI.go("#/login");
    };
    UI.qs("#qmAgain").onclick = function (e) { e.preventDefault(); UI.toast("Đã gửi lại mã.", "info"); };
  }
};
