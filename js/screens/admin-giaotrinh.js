/* ==========================================================================
   S-12 Danh sách giáo trình · S-13 Thông tin giáo trình · S-14 Soạn bài học
   ========================================================================== */

/* Từ điển rút gọn cho tính năng tự điền.
   Kho biểu tượng thì đã nhúng đủ 1.898 cái ở js/emoji.js.
   Còn phiên âm và Hán Việt vẫn là bảng rút gọn: bản chạy thật cần pinyin-data
   (44.435 chữ) + CC-CEDICT (121.175 từ) — xem tài liệu thiết kế. */
var MINI_DICT = {
  "银行": ["yínháng", "ngân hàng", "🏦 🏛️ 💰"],
  "行李": ["xíngli", "hành lý", "🧳 🎒"],
  "音乐": ["yīnyuè", "âm nhạc", "🎵 🎶 🎼"],
  "快乐": ["kuàilè", "khoái lạc", "😀 🎉"],
  "睡觉": ["shuìjiào", "thuỵ giác", "😴 🛏️"],
  "觉得": ["juéde", "giác đắc", "🤔"],
  "冰箱": ["bīngxiāng", "băng sương", "🧊 ❄️"],
  "便宜": ["piányi", "tiện nghi", "💰 🏷️"],
  "苹果": ["píngguǒ", "bình quả", "🍎 🍏"],
  "雨伞": ["yǔsǎn", "vũ tán", "☂️ ☔ ⛱️"],
  "厨师": ["chúshī", "trù sư", "👨‍🍳 🍳"],
  "农民": ["nóngmín", "nông dân", "🧑‍🌾 🌾"],
  "演员": ["yǎnyuán", "diễn viên", "🎭 🎬"],
  "歌手": ["gēshǒu", "ca thủ", "🎙️ 🎤"],
  "翻译": ["fānyì", "phiên dịch", "🗣️ 📖"],
  "程序员": ["chéngxùyuán", "trình tự viên", "💻 👨‍💻"],
  "老板": ["lǎobǎn", "lão bản", "🤵 💼"],
  "售货员": ["shòuhuòyuán", "thụ hoá viên", "🛒 🏪"],
  "学生": ["xuésheng", "học sinh", "🧑‍🎓 📚"],
  "商店": ["shāngdiàn", "thương điếm", "🏪 🛍️"],
  "邮局": ["yóujú", "bưu cục", "📮 ✉️"],
  "饭馆": ["fànguǎn", "phạn quán", "🍽️ 🏮"]
};
/* nạp thêm mọi từ đã có trong các bài học */
(function () {
  SEED.lessons.forEach(function (l) {
    (l.vocab || []).forEach(function (v) { MINI_DICT[v.hz] = MINI_DICT[v.hz] || [v.py, v.hv, v.emo]; });
    (l.extra || []).forEach(function (v) { MINI_DICT[v.hz] = MINI_DICT[v.hz] || [v.py, v.hv, v.flag]; });
  });
})();
function tra(w) {
  w = String(w || "").trim();
  if (!w) return null;
  if (MINI_DICT[w]) return { py: MINI_DICT[w][0], hv: MINI_DICT[w][1], emo: MINI_DICT[w][2] };
  return null;
}

/* Bảng chọn biểu tượng — dùng chung cho mọi nơi cần chọn icon.
   xong(e) nhận biểu tượng vừa chọn; chuỗi rỗng nghĩa là bỏ biểu tượng. */
/* Bỏ dấu tiếng Việt để gõ "nha" hay "nhà" đều tìm ra như nhau. */
function boDau(s) {
  return String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase();
}
/* Khớp theo TỪ chứ không phải chuỗi con. Tiếng Việt bỏ dấu làm "nhà · nhân · nháy"
   đều thành "nha…", nên mặc định đòi trùng TRỌN từ; chỉ khi cả kho không ra gì
   mới nới sang khớp phần đầu để người dùng gõ dở vẫn tìm được. */
function khopTu(kho, q, noiLong) {
  var tu = q.split(/\s+/).filter(Boolean);
  for (var i = 0; i < tu.length; i++) {
    var thay = noiLong ? kho.indexOf(" " + tu[i]) >= 0
                       : kho.indexOf(" " + tu[i] + " ") >= 0;
    if (!thay) return false;
  }
  return true;
}
function moBangBieuTuong(xong) {
  UI.modal({
    wide: true,
    title: "Chọn biểu tượng — " + EMOJI_TONG + " biểu tượng",
    body: '<input class="inp" id="emoQ" placeholder="🔍 Gõ tiếng Việt để tìm — vd: nhà, mèo, sao, xe, cờ việt nam…">' +
      '<div class="sm muted" style="margin:8px 0 4px">Không cần bỏ dấu cho đúng — gõ <b>nha</b> hay <b>nhà</b> đều ra. ' +
      'Gõ tên tiếng Anh cũng được. Bỏ trống ô tìm để xem đủ 9 nhóm.</div>' +
      '<div class="emoall" id="emoAll"></div>',
    footer: '<button class="btn ghost" data-close>Đóng</button>' +
      '<button class="btn ghost" id="emoClear">Bỏ biểu tượng</button>',
    onReady: function (m) {
      var hop = UI.qs("#emoAll", m), o = UI.qs("#emoQ", m);
      function loc(q, noiLong) {
        return EMOJI_GROUPS.map(function (g) {
          return { g: g.g, items: q ? g.items.filter(function (x) {
            return khopTu(" " + boDau(x[1]) + " " + boDau(x[2]) + " ", q, noiLong);
          }) : g.items };
        });
      }
      function ve(q) {
        q = boDau(q).trim();
        var nhom = loc(q, false);
        var dem = nhom.reduce(function (n, g) { return n + g.items.length; }, 0);
        if (q && !dem) { nhom = loc(q, true); dem = nhom.reduce(function (n, g) { return n + g.items.length; }, 0); }
        var html = "", thay = 0;
        nhom.forEach(function (g) {
          var ds = g.items;
          if (!ds.length) return;
          thay += ds.length;
          html += '<div class="eg">' + UI.h(g.g) + ' <span>(' + ds.length + ')</span></div><div class="eq">' +
            ds.map(function (x) {
              return '<button type="button" data-e="' + UI.h(x[0]) + '" title="' +
                UI.h(x[2] ? x[2] + " — " + x[1] : x[1]) + '">' + x[0] + '</button>';
            }).join('') + '</div>';
        });
        hop.innerHTML = thay ? html : '<div class="empty">Không có biểu tượng nào khớp.</div>';
        UI.qsa("button[data-e]", hop).forEach(function (b) {
          b.onclick = function () { UI.closeModal(); xong(b.getAttribute("data-e")); };
        });
      }
      ve("");
      o.oninput = function () { ve(this.value); };
      o.focus();
      UI.qs("#emoClear", m).onclick = function () { UI.closeModal(); xong(""); };
    }
  });
}

/* Sửa tên bài — chỉ đụng tới phần định danh, không chạm nội dung 5 phần.
   `tam` giữ những gì đang gõ dở khi người dùng rẽ sang bảng biểu tượng rồi quay lại. */
function moSuaTenBai(l, tam) {
  var v = tam || { zh: l.zh, py: l.py, vi: l.vi, hv: l.hv || "", emo: l.emo || "" };
  UI.modal({
    title: "Sửa tên bài " + l.no,
    body: '<div class="grid g2" style="gap:0 14px">' +
        '<div class="fld"><label>Tên bài — tiếng Trung *</label>' +
          '<input class="inp zh" id="rZh" style="font-size:19px" value="' + UI.h(v.zh) + '"></div>' +
        '<div class="fld"><label>Phiên âm</label>' +
          '<input class="inp" id="rPy" value="' + UI.h(v.py) + '"></div></div>' +
      '<div class="grid g2" style="gap:0 14px">' +
        '<div class="fld"><label>Tên tiếng Việt *</label><input class="inp" id="rVi" value="' + UI.h(v.vi) + '"></div>' +
        '<div class="fld"><label>Hán Việt</label><input class="inp" id="rHv" value="' + UI.h(v.hv) + '"></div></div>' +
      '<div class="fld" style="margin-bottom:0"><label>Biểu tượng bài</label>' +
        '<div class="row"><button class="btn ghost emo-btn" id="rEmo">' + (v.emo || "➕") + '</button>' +
        '<span class="sm muted">Bấm để chọn trong ' + EMOJI_TONG + ' biểu tượng.</span></div></div>' +
      '<div class="mt">' + UI.alert("blue", "📝",
        '<span class="sm">Nội dung 5 phần không nằm ở đây — bấm <b>📝</b> ngoài danh sách để soạn.</span>') + '</div>',
    footer: '<button class="btn ghost" data-close>Huỷ</button><button class="btn red" id="rOk">✔ Lưu tên bài</button>',
    onReady: function (m) {
      var zh = UI.qs("#rZh", m), py = UI.qs("#rPy", m), hv = UI.qs("#rHv", m), vi = UI.qs("#rVi", m);
      function docForm() {
        return { zh: zh.value, py: py.value, vi: vi.value, hv: hv.value, emo: v.emo };
      }
      /* bảng biểu tượng thay chỗ hộp thoại này, nên giữ lại phần đang gõ rồi mở lại */
      UI.qs("#rEmo", m).onclick = function () {
        var giu = docForm();
        moBangBieuTuong(function (e) { giu.emo = e; moSuaTenBai(l, giu); });
      };
      UI.qs("#rOk", m).onclick = function () {
        var a = zh.value.trim(), b = vi.value.trim();
        if (!a || !b) { UI.toast("Cần nhập tên tiếng Trung và tên tiếng Việt.", "no"); return; }
        l.zh = a; l.py = py.value.trim(); l.vi = b; l.hv = hv.value.trim(); l.emo = v.emo;
        Store.save(); UI.closeModal(); UI.toast("Đã lưu tên bài.", "ok"); App.render();
      };
    }
  });
}

/* ====================================================== S-12 DANH SÁCH */
ROUTES["admin/giao-trinh"] = {
  roles: ["gv"],
  view: function () {
    var cs = Store.myCourses();
    var rows = cs.map(function (c) {
      var nk = Store.s.classes.filter(function (k) { return k.courseId === c.id; }).length;
      return '<tr><td class="b sm">' + UI.h(c.code) + '</td>' +
        '<td><div class="row"><span style="font-size:24px">' + c.emo + '</span>' +
        '<div><div class="b">' + UI.h(c.vi) + '</div><div class="xs muted zh">' + UI.h(c.zh) + '</div></div></div></td>' +
        '<td>' + UI.chip(c.level, "blue") + '</td>' +
        '<td class="b">' + Store.lessonsOf(c.id).length + '</td>' +
        '<td>' + (nk ? nk + " lớp" : '<span class="muted">—</span>') + '</td>' +
        '<td style="text-align:right"><a class="btn ghost sm" href="#/admin/giao-trinh/' + c.id + '">Mở</a></td></tr>';
    });
    var body = UI.table(["Mã", "Tên giáo trình", "Cấp độ", "Số bài", "Lớp đang dùng", ""], rows, 760);
    return UI.shell({ active: "#/admin/giao-trinh", title: "Giáo trình", crumb: "Quản lý",
      actions: '<button class="btn red sm" id="newCourse">＋ Tạo giáo trình</button>', body: body });
  },
  init: function (root) {
    UI.qs("#newCourse", root).onclick = function () {
      UI.modal({
        title: "Tạo giáo trình mới",
        body: '<div class="fld"><label>Mã giáo trình *</label><input class="inp" id="ncCode" placeholder="vd: HSK2-GT"></div>' +
          '<div class="fld"><label>Tên tiếng Việt *</label><input class="inp" id="ncVi" placeholder="vd: Hán ngữ giao tiếp — Tập 2"></div>' +
          '<div class="fld"><label>Tên tiếng Trung</label><input class="inp zh" id="ncZh" placeholder="汉语教程 · 第二册"></div>' +
          '<div class="fld"><label>Cấp độ</label><select class="inp" id="ncLv">' +
          ['HSK 1', 'HSK 2', 'HSK 3', 'HSK 4'].map(function (x) { return '<option>' + x + '</option>'; }).join('') + '</select></div>',
        footer: '<button class="btn ghost" data-close>Huỷ</button><button class="btn red" id="ncOk">Tạo giáo trình</button>',
        onReady: function (m) {
          UI.qs("#ncOk", m).onclick = function () {
            var code = UI.qs("#ncCode", m).value.trim(), vi = UI.qs("#ncVi", m).value.trim();
            if (!code || !vi) { UI.toast("Cần nhập mã và tên tiếng Việt.", "no"); return; }
            var c = { id: Store.id("c"), code: code, vi: vi, zh: UI.qs("#ncZh", m).value.trim() || vi,
              level: UI.qs("#ncLv", m).value, emo: "📗", color: "#D6453D", teacherId: Store.me().id,
              updated: Store.nowStr().split(" ")[0], desc: "" };
            Store.s.courses.push(c); Store.save();
            UI.closeModal(); UI.toast("Đã tạo giáo trình.", "ok");
            UI.go("#/admin/giao-trinh/" + c.id);
          };
        }
      });
    };
  }
};

/* ====================================================== S-13 THÔNG TIN */
ROUTES["admin/giao-trinh/:cid"] = {
  roles: ["gv"],
  view: function (p) {
    var c = Store.course(p.cid);
    if (!c) return UI.shell({ active: "#/admin/giao-trinh", title: "Không tìm thấy", crumb: "", body: '<div class="empty">Giáo trình không tồn tại.</div>' });
    var ls = Store.lessonsOf(c.id);

    var body = '<div class="pill-tabs"><a class="on">Thông tin chung</a></div>' +
      '<div class="grid" style="grid-template-columns:1fr 380px;gap:18px;align-items:start">' +
      '<div class="card pad"><div class="bb mb" style="font-size:16px">Thông tin giáo trình</div>' +
        '<div class="grid g2" style="gap:0 16px">' +
          '<div class="fld"><label>Mã giáo trình *</label><input class="inp" id="cCode" value="' + UI.h(c.code) + '">' +
            '<div class="hint">Dùng trong mã lớp và báo cáo.</div></div>' +
          '<div class="fld"><label>Cấp độ *</label><select class="inp" id="cLv">' +
            ['HSK 1 — Sơ cấp', 'HSK 2', 'HSK 3', 'HSK 4'].map(function (x) {
              return '<option' + (x.indexOf(c.level) === 0 ? ' selected' : '') + '>' + x + '</option>'; }).join('') +
            '</select></div></div>' +
        '<div class="fld"><label>Tên tiếng Việt *</label><input class="inp" id="cVi" value="' + UI.h(c.vi) + '"></div>' +
        '<div class="fld"><label>Tên tiếng Trung</label><input class="inp zh" id="cZh" style="font-size:18px" value="' + UI.h(c.zh) + '">' +
          '<div class="hint">Hiện to ở đầu trang học viên. Bỏ trống cũng được.</div></div>' +
        '<div class="fld"><label>Mô tả ngắn</label><textarea class="inp" id="cDesc">' + UI.h(c.desc) + '</textarea></div>' +
        '<div class="grid g2" style="gap:0 16px">' +
          '<div class="fld"><label>Ảnh bìa (biểu tượng)</label><div class="emopick" id="cEmo">' +
            SEED.emojiPool.map(function (e) { return '<span class="' + (e === c.emo ? "on" : "") + '" data-e="' + e + '">' + e + '</span>'; }).join('') +
            '</div><div class="hint">Giao diện không dùng file ảnh — dùng biểu tượng + màu để nhẹ và luôn sắc nét.</div></div>' +
          '<div class="fld"><label>Màu chủ đề</label><div class="colorpick" id="cColor">' +
            SEED.colorPool.map(function (x) { return '<span class="' + (x === c.color ? "on" : "") + '" data-c="' + x + '" style="background:' + x + '"></span>'; }).join('') +
            '</div></div></div>' +
        '<div class="row mt2" style="border-top:1.5px solid var(--line);padding-top:16px">' +
          '<a class="btn ghost" href="#/admin/giao-trinh">Huỷ</a>' +
          '<span class="right row"><button class="btn red" id="cSave">✔ Lưu thay đổi</button></span></div>' +
      '</div>' +
      '<div>' +
        '<div class="card pad mb"><div class="row mb"><b class="grow">Bài học (' + ls.length + ')</b>' +
          '<button class="btn red sm" id="addLesson">＋ Thêm bài</button></div>' +
          '<div id="lessonList">' + ls.map(function (l, i) {
            return '<div style="padding:10px 0;border-bottom:1px solid var(--line)">' +
              '<div class="row">' +
                '<span class="chip">' + l.no + '</span>' +
                '<span style="font-size:19px">' + (l.emo || "📄") + '</span>' +
                '<a class="grow" href="#/admin/soan-bai/' + l.id + '" style="min-width:0">' +
                  '<div class="b sm zh" style="font-size:15px">' + UI.h(l.zh) + '</div>' +
                  '<div class="xs muted">' + (l.hv ? UI.h(l.hv) + ' · ' : '') + UI.h(l.vi) + '</div></a>' +
              '</div>' +
              '<div class="row mt" style="gap:6px">' +
                '<span class="xs muted grow">' + (l.warmup || []).length + ' thẻ · ' +
                  l.vocab.length + ' từ · ' + l.dialogues.length + ' hội thoại</span>' +
                '<button class="btn ghost sm" data-ren="' + l.id + '" title="Sửa tên bài">✏️ Tên</button>' +
                '<a class="btn ghost sm" href="#/admin/soan-bai/' + l.id + '" title="Soạn nội dung 5 phần">📝 Soạn</a>' +
                '<button class="btn ghost sm" data-up="' + l.id + '" title="Đưa lên trên">↑</button>' +
                '<button class="btn ghost sm" data-down="' + l.id + '" title="Đưa xuống dưới">↓</button>' +
              '</div>' +
            '</div>';
          }).join('') + '</div>' +
          '<div class="mt">' + UI.alert("blue", "↕", '<span class="sm">Tên bài sửa ở đây bằng nút <b>✏️</b>. ' +
            'Nút <b>📝</b> mở màn soạn nội dung 5 phần — sửa trong đó không đụng tới tên bài. ' +
            'Dùng ↑ ↓ để đổi thứ tự, đó chính là thứ tự học viên nhìn thấy.</span>') + '</div></div>' +
      '</div></div>';

    return UI.shell({ active: "#/admin/giao-trinh", title: c.vi, crumb: "Quản lý · Giáo trình · " + c.code, body: body });
  },
  init: function (root, p) {
    var c = Store.course(p.cid); if (!c) return;
    UI.qsa("#cEmo span", root).forEach(function (s) {
      s.onclick = function () {
        UI.qsa("#cEmo span", root).forEach(function (x) { x.classList.remove("on"); });
        s.classList.add("on"); c.emo = s.getAttribute("data-e");
      };
    });
    UI.qsa("#cColor span", root).forEach(function (s) {
      s.onclick = function () {
        UI.qsa("#cColor span", root).forEach(function (x) { x.classList.remove("on"); });
        s.classList.add("on"); c.color = s.getAttribute("data-c");
      };
    });
    function collect() {
      c.code = UI.qs("#cCode", root).value.trim();
      c.vi = UI.qs("#cVi", root).value.trim();
      c.zh = UI.qs("#cZh", root).value.trim();
      c.desc = UI.qs("#cDesc", root).value.trim();
      c.level = UI.qs("#cLv", root).value.split(" —")[0];
      c.updated = Store.nowStr().split(" ")[0];
      Store.save();
    }
    UI.qs("#cSave", root).onclick = function () { collect(); UI.toast("Đã lưu — học viên thấy ngay.", "ok"); App.render(); };

    UI.qsa("[data-ren]", root).forEach(function (b) {
      b.onclick = function () { moSuaTenBai(Store.lesson(b.getAttribute("data-ren")), null); };
    });

    UI.qsa("[data-up],[data-down]", root).forEach(function (b) {
      b.onclick = function () {
        var lid = b.getAttribute("data-up") || b.getAttribute("data-down");
        var dir = b.hasAttribute("data-up") ? -1 : 1;
        var ls = Store.lessonsOf(c.id);
        var i = ls.map(function (x) { return x.id; }).indexOf(lid);
        var j = i + dir;
        if (j < 0 || j >= ls.length) return;
        var t = ls[i].no; ls[i].no = ls[j].no; ls[j].no = t;
        Store.save(); App.render();
      };
    });
    UI.qs("#addLesson", root).onclick = function () {
      UI.modal({
        title: "Thêm bài học",
        body: '<div class="fld"><label>Tên bài — tiếng Trung *</label><input class="inp zh" id="nlZh" style="font-size:19px" placeholder="现在几点"></div>' +
          '<div class="fld"><label>Phiên âm</label><input class="inp" id="nlPy" placeholder="Xiànzài jǐ diǎn"></div>' +
          '<div class="fld"><label>Tên tiếng Việt *</label><input class="inp" id="nlVi" placeholder="Bây giờ là mấy giờ?"></div>',
        footer: '<button class="btn ghost" data-close>Huỷ</button><button class="btn red" id="nlOk">Tạo bài &amp; soạn ngay</button>',
        onReady: function (m) {
          UI.qs("#nlOk", m).onclick = function () {
            var zh = UI.qs("#nlZh", m).value.trim(), vi = UI.qs("#nlVi", m).value.trim();
            if (!zh || !vi) { UI.toast("Cần nhập tên tiếng Trung và tiếng Việt.", "no"); return; }
            var ls = Store.lessonsOf(c.id);
            var l = { id: Store.id("l"), courseId: c.id, no: ls.length + 1, zh: zh,
              py: UI.qs("#nlPy", m).value.trim(), vi: vi, hv: "", emo: "",
              warmup: [], vocab: [], extra: [], match: [], sentences: [], grammar: [], dialogues: [] };
            Store.s.lessons.push(l); Store.save();
            UI.closeModal(); UI.go("#/admin/soan-bai/" + l.id);
          };
        }
      });
    };
  }
};

/* ====================================================== S-14 SOẠN BÀI */
var EDIT_TAB = "vocab";
ROUTES["admin/soan-bai/:lid"] = {
  roles: ["gv"],
  view: function (p) {
    var l = Store.lesson(p.lid);
    if (!l) return UI.shell({ active: "#/admin/giao-trinh", title: "Không tìm thấy", crumb: "", body: '<div class="empty">Bài học không tồn tại.</div>' });
    var c = Store.course(l.courseId);
    var tabs = [["warmup", "🔥 Khởi động"], ["vocab", "📚 Từ mới"], ["practice", "🎮 Ôn tập"],
                ["grammar", "📖 Ngữ pháp"], ["dialogue", "💬 Hội thoại"]];

    var body = '<div class="edit"><div>' +
      '<div class="row mb wrap" style="gap:10px">' +
        '<span style="font-size:22px">' + (l.emo || "📄") + '</span>' +
        '<div class="grow" style="min-width:0"><div class="bb zh" style="font-size:17px">' + UI.h(l.zh) + '</div>' +
          '<div class="xs muted">' + UI.h(l.py) + (l.hv ? ' · ' + UI.h(l.hv) : '') + ' · ' + UI.h(l.vi) + '</div></div>' +
        '<a class="btn ghost sm" href="#/admin/giao-trinh/' + c.id + '">✏️ Sửa tên bài</a>' +
      '</div>' +
      '<div class="etabs">' + tabs.map(function (t) {
        return '<button class="etab ' + (t[0] === EDIT_TAB ? "on" : "") + '" data-tab="' + t[0] + '">' + t[1] + '</button>';
      }).join('') + '</div>' +

      '<div class="card pad" id="editBox">' + editTabBody(l) + '</div>' +

      '<div class="row mt2" style="border-top:1.5px solid var(--line);padding-top:15px">' +
        '<span class="grow"></span>' +
        '<button class="btn red" id="ePub">✔ Lưu bài</button></div>' +
    '</div></div>';

    return UI.shell({ active: "#/admin/giao-trinh", title: "Soạn bài " + l.no + " — " + l.zh,
      crumb: "Quản lý · " + c.code + " · Bài " + l.no, body: body });
  },
  init: function (root, p) { initEditor(root, p); }
};

function editTabBody(l) {
  if (EDIT_TAB === "warmup") {
    function mo(x, nhac) {
      return x ? UI.h(x) : '<span style="opacity:.55">' + nhac + '</span>';
    }
    var w = l.warmup || [];
    return '<div class="row mb wrap"><b class="grow" style="font-size:16px">🔥 Khởi động — thẻ lật</b>' +
        UI.chip(w.length + ' thẻ', w.length ? "jade" : "grey") +
        '<button class="btn red sm" id="wAdd">＋ Thêm thẻ</button></div>' +
      (w.length
        ? '<div class="vhead"><span>Chữ Hán</span><span>Phiên âm</span><span>Hán Việt</span>' +
          '<span>Nghĩa tiếng Việt</span><span>Biểu tượng</span><span></span></div>' +
          '<div id="wRows">' + w.map(function (v, i) {
            return '<div class="vrow" data-w="' + i + '">' +
              '<input class="hz zh" data-f="hz" value="' + UI.h(v.hz || "") + '" placeholder="汉字">' +
              '<input data-f="py" value="' + UI.h(v.py || "") + '" placeholder="phiên âm">' +
              '<input data-f="hv" value="' + UI.h(v.hv || "") + '" placeholder="Hán Việt">' +
              '<input data-f="vi" value="' + UI.h(v.vi || "") + '" placeholder="nghĩa tiếng Việt">' +
              '<button class="btn ghost sm" data-wemo="' + i + '" title="Chọn biểu tượng">' +
                (v.emo || "➕") + '</button>' +
              '<button class="del" data-wdel="' + i + '" title="Xoá thẻ">✕</button>' +
            '</div>';
          }).join('') + '</div>' +

          '<div class="bb sm" style="margin:18px 0 10px">Học viên sẽ thấy như thế này — bấm thẻ để lật thử</div>' +
          '<div class="flip-grid" id="edFlip">' + w.map(function (v, i) {
            return '<div class="flip" data-i="' + i + '"><div class="flip-in">' +
              '<div class="face front"><div class="emo">' + (v.emo || "📝") + '</div>' +
              '<div class="hz zh">' + mo(v.hz, "?") + '</div><div class="hint">bấm để lật</div></div>' +
              '<div class="face back"><div class="py">' + mo(v.py, "chưa có phiên âm") + '</div>' +
              '<div class="hv">' + mo(v.hv, "chưa có Hán Việt") + '</div>' +
              '<div class="vi">' + mo(v.vi, "chưa có nghĩa") + '</div>' +
              (v.hz ? '<button class="spk" data-say="' + UI.h(v.hz) + '">🔊</button>' : '') +
              '</div></div></div>';
          }).join('') + '</div>'
        : '<div class="empty">Chưa có thẻ nào. Bấm <b>＋ Thêm thẻ</b> để thêm ngay tại đây.</div>');
  }
  if (EDIT_TAB === "vocab") {
    return '<div class="row mb wrap"><b class="grow" style="font-size:16px">📚 Từ mới — <span id="vCount">' + l.vocab.length + '</span> từ</b></div>' +
      '<div class="vebox" id="vForm">' + formTu(tuDangSoan(l.id)) + '</div>' +
      '<div class="sm muted mt">Điền xong bấm <b>✔ Lưu bài</b> ở cuối trang — từ sẽ xuống danh sách bên dưới ' +
        'và ô nhập trắng lại để bạn gõ từ tiếp theo.</div>' +
      '<div class="bb sm" style="margin:22px 0 10px">Học viên sẽ thấy như thế này — ' + l.vocab.length + ' từ</div>' +
      (l.vocab.length
        ? '<div class="vocab-grid" id="vPrev">' + l.vocab.map(function (v, i) { return theTuHocVien(v, i); }).join('') + '</div>'
        : '<div class="empty">Chưa có từ nào. Điền ô bên trên rồi bấm <b>✔ Lưu bài</b>.</div>');
  }
  if (EDIT_TAB === "practice") {
    return '<div class="row mb"><b class="grow" style="font-size:16px">🎮 Ôn tập — chọn nội dung cho 2 trò chơi</b></div>' +
      '<div class="bb sm mb">🧩 Trò 1 · Ghép từ — chọn các từ đưa vào trò chơi (' + l.match.length + ' cặp)</div>' +
      '<div class="row wrap mb" id="mPick">' + l.vocab.map(function (v) {
        var on = l.match.some(function (m) { return m.zh === v.hz; });
        return '<span class="chip btn-like ' + (on ? "on" : "") + '" data-hz="' + UI.h(v.hz) + '" data-vi="' + UI.h(v.vi) + '">' +
          '<span class="zh">' + UI.h(v.hz) + '</span> ' + UI.h(v.vi) + '</span>';
      }).join('') + '</div>' +
      '<div class="divider"></div>' +
      '<div class="row mb"><b class="grow sm">🔀 Trò 2 · Sắp xếp câu (' + l.sentences.length + ' câu)</b>' +
        '<button class="btn ghost sm" id="sAdd">＋ Thêm câu</button></div>' +
      '<div id="sRows">' + l.sentences.map(function (s, i) {
        return '<div class="row" style="padding:9px 0;border-bottom:1px solid var(--line)" data-si="' + i + '">' +
          '<span class="chip">' + (i + 1) + '</span>' +
          '<div class="grow"><div class="zh b">' + UI.h(s.zh) + '</div>' +
          '<div class="xs muted">' + UI.h(s.vi) + ' · ' + s.words.length + ' thẻ từ</div></div>' +
          '<button class="btn ghost sm" data-sdel="' + i + '">✕</button></div>';
      }).join('') + '</div>';
  }
  if (EDIT_TAB === "grammar") {
    return '<div class="row mb"><b class="grow" style="font-size:16px">📖 Ngữ pháp — ' + l.grammar.length + ' điểm</b>' +
      '<button class="btn red sm" id="gAdd">＋ Thêm điểm ngữ pháp</button></div>' +
      '<div id="gRows">' + l.grammar.map(function (g, i) {
        return '<div class="card pad mb" data-gi="' + i + '">' +
          '<div class="row mb"><span class="gnum">' + (i + 1) + '</span>' +
          '<input class="inp grow" data-gt="' + i + '" value="' + UI.h(g.t) + '">' +
          '<button class="btn ghost sm" data-gdel="' + i + '">✕</button></div>' +
          '<div class="fld"><label>Giải thích</label><textarea class="inp" data-gp="' + i + '" style="min-height:70px">' + UI.h(g.p) + '</textarea></div>' +
          '<div class="grid g2" style="gap:0 14px">' +
            '<div class="fld" style="margin-bottom:0"><label>Công thức</label><input class="inp zh" data-gf="' + i + '" value="' + UI.h(g.formula || "") + '"></div>' +
            '<div class="fld" style="margin-bottom:0"><label>Câu đọc mẫu</label><input class="inp zh" data-gs="' + i + '" value="' + UI.h(g.say || "") + '"></div></div>' +
          '<div class="sm muted mt">' + (g.ex || []).length + ' câu ví dụ' + (g.quiz ? ' · có bài luyện nhanh' : '') + '</div>' +
        '</div>';
      }).join('') + '</div>';
  }
  return '<div class="row mb"><b class="grow" style="font-size:16px">💬 Hội thoại — ' + l.dialogues.length + ' đoạn</b>' +
    '<button class="btn red sm" id="dAdd">＋ Thêm đoạn</button></div>' +
    '<div id="dRows">' + l.dialogues.map(function (d, i) {
      return '<div class="card pad mb"><div class="row mb">' + UI.chip("Hội thoại " + (i + 1), "red") +
        '<input class="inp grow" data-dt="' + i + '" value="' + UI.h(d.title || "") + '" placeholder="Mô tả ngắn">' +
        '<button class="btn ghost sm" data-ddel="' + i + '">✕</button></div>' +
        d.lines.map(function (ln, j) {
          return '<div class="row" style="padding:6px 0"><span class="dsp ' + ln.sp.toLowerCase() + '">' + ln.sp + '</span>' +
            '<input class="inp zh grow" data-dl="' + i + '.' + j + '" value="' + UI.h(ln.zh) + '">' +
            '<input class="inp auto" style="width:200px" value="' + UI.h(ln.py) + '"></div>';
        }).join('') +
        '<button class="btn ghost sm mt" data-dline="' + i + '">＋ Thêm câu thoại</button></div>';
    }).join('') + '</div>';
}

/* Thẻ từ dựng y hệt bên học viên (xem viewVocab trong hocbai.js) — soạn tới đâu
   thấy ngay tới đó, khỏi phải mở màn học viên ra kiểm. */
/* Danh sách từ loại — mỗi thứ là MỘT loại, không ghép chuỗi.
   Một từ có thể mang nhiều loại, lưu thành mảng. */
var TU_LOAI = ["danh từ 名", "động từ 动", "tính từ 形", "đại từ 代", "số từ 数",
               "lượng từ 量", "phó từ 副", "giới từ 介", "liên từ 连", "trợ từ 助",
               "thán từ 叹", "từ tượng thanh 拟声"];

function tuRong() {
  return { hz: "", py: "", hv: "", pos: [], vi: "", emo: "", ex: { zh: "", py: "", vi: "" } };
}

/* Từ đang gõ dở ở tab Từ mới, giữ qua các lần vẽ lại màn. Đổi bài thì bỏ. */
var TU_TAM = null;
function tuDangSoan(lid) {
  if (!TU_TAM || TU_TAM.lid !== lid) TU_TAM = { lid: lid, v: tuRong() };
  return TU_TAM.v;
}
function xoaTrangONhap(lid) { TU_TAM = { lid: lid, v: tuRong() }; }

/* Thẻ từ dựng y hệt bên học viên (xem viewVocab trong hocbai.js) — soạn tới đâu
   thấy ngay tới đó, khỏi phải mở màn học viên ra kiểm. */
function theTuHocVien(v, i) {
  var ex = v.ex || { zh: "", py: "", vi: "" };
  function mo(x, nhac) { return x ? UI.h(x) : '<span style="opacity:.45">' + nhac + '</span>'; }
  var loai = loaiTu(v);
  return '<div class="vcard" data-p="' + i + '">' +
    (v.hz ? '<button class="spk" data-say="' + UI.h(v.hz) + '">🔊</button>' : '') +
    '<div class="vtop"><div class="vemo">' + (v.emo || "📝") + '</div>' +
    '<div style="min-width:0"><div class="vhz zh">' + mo(v.hz, "汉字") + '</div>' +
    '<div class="vpy">' + mo(v.py, "chưa có phiên âm") + '</div>' +
    '<div class="vhv">Hán Việt: <b>' + mo(v.hv, "chưa có") + '</b></div></div></div>' +
    '<div class="vtags">' +
      (loai.length ? loai.map(function (t) { return UI.chip(t, "blue"); }).join('')
                   : UI.chip("chưa chọn từ loại", "grey")) + '</div>' +
    '<div class="vmean">' + mo(v.vi, "chưa có nghĩa") + '</div>' +
    '<div class="vex"><div class="zh">' + mo(ex.zh, "chưa có câu ví dụ") + '</div>' +
    '<div class="expy">' + UI.h(ex.py) + '</div><div class="exvi">' + UI.h(ex.vi) + '</div></div>' +
    '<div class="row mt" style="gap:6px">' +
      '<button class="btn ghost sm grow" data-sua="' + i + '">✏️ Sửa từ này</button>' +
      '<button class="btn ghost sm" data-xoa="' + i + '" title="Xoá từ này">✕</button></div>' +
  '</div>';
}

/* Bộ ô nhập một từ — dùng chung cho ô nhập từ mới và hộp thoại sửa từ. */
function formTu(v) {
  var ex = v.ex || { zh: "", py: "", vi: "" };
  var dangChon = loaiTu(v);
  return '<div class="row">' +
      '<button class="btn ghost emo-btn" data-vemo title="Chọn biểu tượng">' +
        (v.emo || "➕") + '</button>' +
      '<input class="inp zh grow" data-f="hz" style="font-size:20px;font-weight:800" ' +
        'value="' + UI.h(v.hz) + '" placeholder="汉字"></div>' +
    '<div class="grid g2 mt" style="gap:0 10px">' +
      '<div class="fld" style="margin-bottom:0"><label>Phiên âm</label>' +
        '<input class="inp sm" data-f="py" value="' + UI.h(v.py) + '" placeholder="gōngzuò"></div>' +
      '<div class="fld" style="margin-bottom:0"><label>Hán Việt</label>' +
        '<input class="inp sm" data-f="hv" value="' + UI.h(v.hv) + '" placeholder="công tác"></div></div>' +
    '<div class="fld mt" style="margin-bottom:0"><label>Từ loại ' +
      '<span class="xs muted" style="font-weight:500">— bấm chọn, chọn được nhiều</span></label>' +
      '<div class="row wrap posbar" style="gap:5px">' + TU_LOAI.map(function (t) {
        var on = dangChon.indexOf(t) >= 0;
        return '<span class="chip btn-like ' + (on ? "on" : "") + '" data-pos="' + UI.h(t) + '">' +
          UI.h(t) + '</span>';
      }).join('') + '</div></div>' +
    '<div class="fld mt" style="margin-bottom:0"><label>Nghĩa tiếng Việt</label>' +
      '<input class="inp sm" data-f="vi" value="' + UI.h(v.vi) + '" placeholder="công việc; làm việc"></div>' +
    '<div class="vex-edit">' +
      '<div class="lb sm">Câu ví dụ</div>' +
      '<input class="inp sm zh mb" data-x="zh" value="' + UI.h(ex.zh) + '" placeholder="你做什么工作？">' +
      '<input class="inp sm mb" data-x="py" value="' + UI.h(ex.py) + '" placeholder="Nǐ zuò shénme gōngzuò?">' +
      '<input class="inp sm" data-x="vi" value="' + UI.h(ex.vi) + '" placeholder="Bạn làm nghề gì?"></div>';
}

/* Gắn sự kiện cho một bộ ô nhập. Mọi thay đổi ghi thẳng vào `v`. */
function noiFormTu(box, v, sauKhiDoi) {
  function bao() { if (sauKhiDoi) sauKhiDoi(); }
  UI.qsa("[data-f]", box).forEach(function (inp) {
    inp.oninput = function () {
      var f = inp.getAttribute("data-f");
      v[f] = inp.value;
      if (f === "hz") {
        var t = tra(inp.value.trim());
        if (t) {
          var py = UI.qs("[data-f=py]", box), hv = UI.qs("[data-f=hv]", box);
          if (!py.value) { py.value = v.py = t.py; }
          if (!hv.value) { hv.value = v.hv = t.hv; }
          if (!v.emo) {
            v.emo = t.emo.split(" ")[0];
            UI.qs("[data-vemo]", box).textContent = v.emo;
          }
        }
      }
      bao();
    };
  });
  UI.qsa("[data-x]", box).forEach(function (inp) {
    inp.oninput = function () {
      v.ex = v.ex || { zh: "", py: "", vi: "" };
      v.ex[inp.getAttribute("data-x")] = inp.value;
      bao();
    };
  });
  UI.qsa("[data-pos]", box).forEach(function (c) {
    c.onclick = function () {
      var t = c.getAttribute("data-pos"), ds = loaiTu(v);
      var k = ds.indexOf(t);
      if (k >= 0) ds.splice(k, 1); else ds.push(t);
      v.pos = ds;
      c.classList.toggle("on", k < 0);
      bao();
    };
  });
  var be = UI.qs("[data-vemo]", box);
  if (be) be.onclick = function () {
    moBangBieuTuong(function (e) { v.emo = e; be.textContent = e || "➕"; bao(); });
  };
}

function initEditor(root, p) {
  var l = Store.lesson(p.lid); if (!l) return;
  /* Mọi thay đổi trong màn soạn bài ghi thẳng vào localStorage, không cần bấm Lưu.
     Nút "Lưu bài" chỉ để xác nhận và cập nhật ngày sửa của giáo trình. */
  function touch() { Store.save(); }

  UI.qsa(".etab", root).forEach(function (t) {
    t.onclick = function () { EDIT_TAB = t.getAttribute("data-tab"); App.render(); };
  });

  /* --- tab Khởi động: kho thẻ riêng, không dùng chung với Từ mới --- */
  if (!l.warmup) l.warmup = [];
  var wAdd = UI.qs("#wAdd", root);
  if (wAdd) wAdd.onclick = function () {
    l.warmup.push({ hz: "", py: "", hv: "", vi: "", emo: "" });
    Store.save(); App.render();
  };
  UI.qsa("#wRows .vrow", root).forEach(function (row) {
    var i = +row.getAttribute("data-w");
    UI.qsa("input", row).forEach(function (inp) {
      inp.oninput = function () {
        l.warmup[i][inp.getAttribute("data-f")] = inp.value;
        veLaiTheLat();
        touch();
      };
    });
  });
  UI.qsa("[data-wemo]", root).forEach(function (b) {
    b.onclick = function () {
      var i = +b.getAttribute("data-wemo");
      moBangBieuTuong(function (e) {
        l.warmup[i].emo = e;
        b.textContent = e || "➕";
        veLaiTheLat();
        touch();
      });
    };
  });
  UI.qsa("[data-wdel]", root).forEach(function (b) {
    b.onclick = function () {
      l.warmup.splice(+b.getAttribute("data-wdel"), 1);
      Store.save(); App.render();
    };
  });

  /* Vẽ lại lưới thẻ lật cho khớp bảng vừa gõ, khỏi phải tải lại cả màn. */
  function veLaiTheLat() {
    var luoi = UI.qs("#edFlip", root); if (!luoi) return;
    UI.qsa(".flip", luoi).forEach(function (f) {
      var v = l.warmup[+f.getAttribute("data-i")]; if (!v) return;
      UI.qs(".face.front .emo", f).textContent = v.emo || "📝";
      UI.qs(".face.front .hz", f).textContent = v.hz || "?";
      UI.qs(".face.back .py", f).textContent = v.py || "chưa có phiên âm";
      UI.qs(".face.back .hv", f).textContent = v.hv || "chưa có Hán Việt";
      UI.qs(".face.back .vi", f).textContent = v.vi || "chưa có nghĩa";
    });
  }

  UI.qsa("#edFlip .flip", root).forEach(function (f) {
    f.onclick = function (e) {
      if (e.target.closest(".spk")) return;   /* bấm loa thì nghe, không lật */
      f.classList.toggle("on");
    };
  });
  /* --- tab Từ mới --- */
  if (EDIT_TAB === "vocab") {
    /* --- ô nhập từ mới: gõ vào biến tạm, chưa vào bài cho tới khi bấm Lưu bài --- */
    var oForm = UI.qs("#vForm", root);
    if (oForm) noiFormTu(oForm, tuDangSoan(l.id), null);

    /* --- sửa lại một từ đã thêm, ngay tại từ đó --- */
    UI.qsa("[data-sua]", root).forEach(function (b) {
      b.onclick = function () {
        var k = +b.getAttribute("data-sua");
        var ban = JSON.parse(JSON.stringify(l.vocab[k]));
        ban.pos = loaiTu(ban);
        UI.modal({
          title: "Sửa từ — " + (l.vocab[k].hz || "(chưa có chữ Hán)"),
          body: '<div class="vebox" id="vSua">' + formTu(ban) + '</div>',
          footer: '<button class="btn ghost" data-close>Huỷ</button>' +
            '<button class="btn red" id="vSuaOk">✔ Lưu từ này</button>',
          onReady: function (m) {
            noiFormTu(UI.qs("#vSua", m), ban, null);
            UI.qs("#vSuaOk", m).onclick = function () {
              if (!ban.hz.trim()) { UI.toast("Cần nhập chữ Hán.", "no"); return; }
              l.vocab[k] = ban;
              Store.save(); UI.closeModal();
              UI.toast("Đã lưu từ " + ban.hz + ".", "ok");
              App.render();
            };
          }
        });
      };
    });

    /* --- xoá một từ --- */
    UI.qsa("[data-xoa]", root).forEach(function (b) {
      b.onclick = function () {
        var k = +b.getAttribute("data-xoa");
        var hz = l.vocab[k].hz || "từ này";
        l.vocab.splice(k, 1); Store.save();
        UI.toast("Đã xoá " + hz + ".", "ok"); App.render();
      };
    });
  }

  /* --- tab Ôn tập --- */
  if (EDIT_TAB === "practice") {
    UI.qsa("#mPick .chip", root).forEach(function (c) {
      c.onclick = function () {
        c.classList.toggle("on");
        var hz = c.getAttribute("data-hz"), vi = c.getAttribute("data-vi");
        if (c.classList.contains("on")) l.match.push({ zh: hz, vi: vi });
        else l.match = l.match.filter(function (m) { return m.zh !== hz; });
        Store.save(); touch();
      };
    });
    UI.qsa("[data-sdel]", root).forEach(function (b) {
      b.onclick = function () { l.sentences.splice(+b.getAttribute("data-sdel"), 1); Store.save(); App.render(); };
    });
    var sa = UI.qs("#sAdd", root);
    if (sa) sa.onclick = function () {
      UI.modal({
        title: "Thêm câu sắp xếp",
        body: '<div class="fld"><label>Câu tiếng Trung hoàn chỉnh *</label><input class="inp zh" id="ssZh" placeholder="我在医院工作。"></div>' +
          '<div class="fld"><label>Phiên âm</label><input class="inp" id="ssPy" placeholder="Wǒ zài yīyuàn gōngzuò."></div>' +
          '<div class="fld"><label>Nghĩa tiếng Việt *</label><input class="inp" id="ssVi" placeholder="Mình làm việc ở bệnh viện."></div>' +
          '<div class="fld"><label>Các thẻ từ — ngăn bằng dấu cách *</label><input class="inp zh" id="ssW" placeholder="我 在 医院 工作 。"></div>',
        footer: '<button class="btn ghost" data-close>Huỷ</button><button class="btn red" id="ssOk">Thêm câu</button>',
        onReady: function (m) {
          UI.qs("#ssOk", m).onclick = function () {
            var zh = UI.qs("#ssZh", m).value.trim(), vi = UI.qs("#ssVi", m).value.trim(),
                w = UI.qs("#ssW", m).value.trim().split(/\s+/).filter(Boolean);
            if (!zh || !vi || !w.length) { UI.toast("Cần nhập câu, nghĩa và các thẻ từ.", "no"); return; }
            l.sentences.push({ words: w, zh: zh, py: UI.qs("#ssPy", m).value.trim(), vi: vi });
            Store.save(); UI.closeModal(); App.render();
          };
        }
      });
    };
  }

  /* --- tab Ngữ pháp --- */
  if (EDIT_TAB === "grammar") {
    UI.qsa("[data-gt],[data-gp],[data-gf],[data-gs]", root).forEach(function (el) {
      el.oninput = function () {
        var key = el.hasAttribute("data-gt") ? "t" : el.hasAttribute("data-gp") ? "p" : el.hasAttribute("data-gf") ? "formula" : "say";
        var i = +(el.getAttribute("data-gt") || el.getAttribute("data-gp") || el.getAttribute("data-gf") || el.getAttribute("data-gs"));
        l.grammar[i][key] = el.value; touch();
      };
    });
    UI.qsa("[data-gdel]", root).forEach(function (b) {
      b.onclick = function () { l.grammar.splice(+b.getAttribute("data-gdel"), 1); Store.save(); App.render(); };
    });
    UI.qs("#gAdd", root).onclick = function () {
      l.grammar.push({ t: "Điểm ngữ pháp mới", p: "", formula: "", say: "", ex: [] });
      Store.save(); App.render();
    };
  }

  /* --- tab Hội thoại --- */
  if (EDIT_TAB === "dialogue") {
    UI.qsa("[data-dt]", root).forEach(function (el) {
      el.oninput = function () { l.dialogues[+el.getAttribute("data-dt")].title = el.value; touch(); };
    });
    UI.qsa("[data-dl]", root).forEach(function (el) {
      el.oninput = function () {
        var ij = el.getAttribute("data-dl").split(".");
        l.dialogues[+ij[0]].lines[+ij[1]].zh = el.value; touch();
      };
    });
    UI.qsa("[data-ddel]", root).forEach(function (b) {
      b.onclick = function () { l.dialogues.splice(+b.getAttribute("data-ddel"), 1); Store.save(); App.render(); };
    });
    UI.qsa("[data-dline]", root).forEach(function (b) {
      b.onclick = function () {
        var d = l.dialogues[+b.getAttribute("data-dline")];
        d.lines.push({ sp: d.lines.length % 2 ? "A" : "B", zh: "", py: "", vi: "" });
        Store.save(); App.render();
      };
    });
    var da = UI.qs("#dAdd", root);
    if (da) da.onclick = function () {
      l.dialogues.push({ title: "Đoạn hội thoại mới", lines: [{ sp: "A", zh: "", py: "", vi: "" }, { sp: "B", zh: "", py: "", vi: "" }] });
      Store.save(); App.render();
    };
  }

  /* lưu */
  UI.qs("#ePub", root).onclick = function () {
    var c = Store.course(l.courseId); c.updated = Store.nowStr().split(" ")[0];
    /* Ở tab Từ mới, Lưu bài còn có nghĩa: đưa từ đang gõ xuống danh sách
       rồi trả ô nhập về trắng để gõ từ tiếp theo. */
    if (EDIT_TAB === "vocab") {
      var moi = tuDangSoan(l.id);
      if (moi.hz.trim()) {
        moi.pos = loaiTu(moi);
        l.vocab.push(JSON.parse(JSON.stringify(moi)));
        xoaTrangONhap(l.id);
        Store.save();
        UI.toast("Đã thêm " + moi.hz + ". Ô nhập đã trắng, gõ từ tiếp theo được rồi.", "ok");
        App.render();
        return;
      }
    }
    Store.save();
    UI.toast("Đã lưu — học viên thấy ngay.", "ok");
    App.render();
  };
}
