/* ==========================================================================
   S-12 Danh sách giáo trình · S-13 Thông tin giáo trình · S-14 Soạn bài học
   ========================================================================== */

/* Từ điển rút gọn cho tính năng tự điền.
   Bản chạy thật gọi API tra cứu dựng từ pinyin-data (44.435 chữ) +
   CC-CEDICT (121.175 từ) + emoji Unicode (1.898) — xem tài liệu thiết kế. */
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

/* ====================================================== S-12 DANH SÁCH */
ROUTES["admin/giao-trinh"] = {
  roles: ["gv", "admin"],
  view: function () {
    var cs = Store.myCourses();
    var pub = cs.filter(function (c) { return c.status === "pub"; }).length;
    var rows = cs.map(function (c) {
      var nk = Store.s.classes.filter(function (k) { return k.courseId === c.id; }).length;
      return '<tr data-f="' + c.status + '"><td class="b sm">' + UI.h(c.code) + '</td>' +
        '<td><div class="row"><span style="font-size:24px">' + c.emo + '</span>' +
        '<div><div class="b">' + UI.h(c.vi) + '</div><div class="xs muted zh">' + UI.h(c.zh) + '</div></div></div></td>' +
        '<td>' + UI.chip(c.level, "blue") + '</td>' +
        '<td class="b">' + Store.lessonsOf(c.id).length + '</td>' +
        '<td>' + (nk ? nk + " lớp" : '<span class="muted">—</span>') + '</td>' +
        '<td class="sm">' + UI.h(Store.user(c.teacherId).name) + '</td>' +
        '<td class="sm muted">' + UI.h(c.updated) + '</td>' +
        '<td>' + UI.st(c.status) + '</td>' +
        '<td style="text-align:right"><a class="btn ghost sm" href="#/admin/giao-trinh/' + c.id + '">Mở</a></td></tr>';
    });
    var body = '<div class="row wrap mb" id="fBar">' +
      '<span class="chip btn-like on" data-f="all">Tất cả (' + cs.length + ')</span>' +
      '<span class="chip btn-like" data-f="pub">Đang dùng (' + pub + ')</span>' +
      '<span class="chip btn-like" data-f="draft">Bản nháp (' + (cs.length - pub) + ')</span>' +
      '<span class="right row"><input class="inp sm" id="qSearch" placeholder="🔍 Tìm giáo trình…" style="width:210px">' +
      '<button class="btn ghost sm" data-act="excel">⤓ Xuất Excel</button></span></div>' +
      UI.table(["Mã", "Tên giáo trình", "Cấp độ", "Số bài", "Lớp đang dùng", "Phụ trách", "Cập nhật", "Trạng thái", ""], rows, 1000) +
      '<div class="mt2">' + UI.alert("blue", "💡",
        '<b>Giáo trình → Bài học → 5 phần.</b> Mỗi giáo trình chứa nhiều bài; mỗi bài gồm đúng 5 phần ' +
        '(Khởi động · Từ mới · Ôn tập · Ngữ pháp · Hội thoại) — chính là 5 tab mà học viên nhìn thấy. ' +
        'Giáo trình ở trạng thái <b>Bản nháp</b> không hiện với học viên.') + '</div>';
    return UI.shell({ active: "#/admin/giao-trinh", title: "Giáo trình", crumb: "Quản trị",
      actions: '<button class="btn red sm" id="newCourse">＋ Tạo giáo trình</button>', body: body });
  },
  init: function (root) {
    filterBar(root);
    UI.qs("#qSearch", root).oninput = function () {
      var q = this.value.toLowerCase();
      UI.qsa("tbody tr", root).forEach(function (tr) {
        tr.style.display = tr.textContent.toLowerCase().indexOf(q) >= 0 ? "" : "none";
      });
    };
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
              status: "draft", updated: Store.nowStr().split(" ")[0], desc: "" };
            Store.s.courses.push(c); Store.save();
            UI.closeModal(); UI.toast("Đã tạo giáo trình (bản nháp).", "ok");
            UI.go("#/admin/giao-trinh/" + c.id);
          };
        }
      });
    };
  }
};

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

/* ====================================================== S-13 THÔNG TIN */
ROUTES["admin/giao-trinh/:cid"] = {
  roles: ["gv", "admin"],
  view: function (p) {
    var c = Store.course(p.cid);
    if (!c) return UI.shell({ active: "#/admin/giao-trinh", title: "Không tìm thấy", crumb: "", body: '<div class="empty">Giáo trình không tồn tại.</div>' });
    var ls = Store.lessonsOf(c.id);
    var ks = Store.s.classes.filter(function (k) { return k.courseId === c.id; });
    var teachers = Store.s.users.filter(function (u) { return u.role === "gv"; });

    var body = '<div class="pill-tabs"><a class="on">Thông tin chung</a>' +
      '<a href="#/hv/giao-trinh/' + c.id + '">Xem như học viên</a></div>' +
      '<div class="grid" style="grid-template-columns:1fr 340px;gap:18px;align-items:start">' +
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
        '<div class="grid g2" style="gap:0 16px">' +
          '<div class="fld"><label>Giáo viên phụ trách</label><select class="inp" id="cGv">' +
            teachers.map(function (t) { return '<option value="' + t.id + '"' + (t.id === c.teacherId ? ' selected' : '') + '>' + UI.h(t.name) + '</option>'; }).join('') +
            '</select></div>' +
          '<div class="fld"><label>Trạng thái</label><select class="inp" id="cSt">' +
            '<option value="pub"' + (c.status === "pub" ? " selected" : "") + '>Đang dùng — học viên xem được</option>' +
            '<option value="draft"' + (c.status === "draft" ? " selected" : "") + '>Bản nháp — chỉ giáo viên xem</option>' +
            '<option value="arch"' + (c.status === "arch" ? " selected" : "") + '>Lưu trữ</option></select>' +
            '<div class="hint">Chuyển sang "Đang dùng" thì mọi lớp gắn giáo trình này thấy ngay.</div></div></div>' +
        '<div class="row mt2" style="border-top:1.5px solid var(--line);padding-top:16px">' +
          '<a class="btn ghost" href="#/admin/giao-trinh">Huỷ</a>' +
          '<span class="right row"><button class="btn ghost" id="cSaveDraft">💾 Lưu nháp</button>' +
          '<button class="btn red" id="cSave">✔ Lưu &amp; xuất bản</button></span></div>' +
      '</div>' +
      '<div>' +
        '<div class="card pad mb"><div class="row mb"><b class="grow">Bài học (' + ls.length + ')</b>' +
          '<button class="btn red sm" id="addLesson">＋ Thêm bài</button></div>' +
          '<div id="lessonList">' + ls.map(function (l, i) {
            return '<div class="row" style="padding:9px 0;border-bottom:1px solid var(--line)" data-lid="' + l.id + '">' +
              '<span class="muted" style="cursor:grab" title="Kéo để đổi thứ tự">⠿</span>' +
              '<span class="chip">' + l.no + '</span>' +
              '<a class="grow" href="#/admin/soan-bai/' + l.id + '" style="min-width:0">' +
                '<div class="b sm zh" style="font-size:15px">' + UI.h(l.zh) + '</div>' +
                '<div class="xs muted">' + UI.h(l.vi) + ' · ' + l.vocab.length + ' từ</div></a>' +
              (l.status === "pub" ? UI.chip("✓", "jade") : UI.chip("Nháp", "gold")) +
              '<button class="btn ghost sm" data-up="' + l.id + '" title="Lên">↑</button>' +
              '<button class="btn ghost sm" data-down="' + l.id + '" title="Xuống">↓</button>' +
            '</div>';
          }).join('') + '</div>' +
          '<div class="mt">' + UI.alert("blue", "⠿", '<span class="sm">Dùng ↑ ↓ để đổi thứ tự bài. Thứ tự này chính là thứ tự học viên nhìn thấy.</span>') + '</div></div>' +
        '<div class="card pad"><b>Đang được dùng bởi</b>' +
          (ks.length ? ks.map(function (k) {
            return '<div class="row mt">' + UI.chip(k.code, "blue") +
              '<a class="grow sm" href="#/admin/lop/' + k.id + '">' + UI.h(k.name) + '</a>' +
              '<span class="sm muted">' + k.students.length + ' HV</span></div>';
          }).join('') + '<div class="mt">' + UI.alert("gold", "⚠️",
            '<span class="sm">Sửa nội dung bài sẽ ảnh hưởng tới <b>' + ks.length + ' lớp</b>. Bài tập đã giao vẫn giữ nguyên đề cũ.</span>') + '</div>'
            : '<div class="empty sm">Chưa có lớp nào dùng giáo trình này.</div>') +
        '</div></div></div>';

    return UI.shell({ active: "#/admin/giao-trinh", title: c.vi, crumb: "Quản trị · Giáo trình · " + c.code,
      actions: '<a href="#/hv/giao-trinh/' + c.id + '" class="btn ghost sm">👁 Xem như học viên</a>', body: body });
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
    function collect(status) {
      c.code = UI.qs("#cCode", root).value.trim();
      c.vi = UI.qs("#cVi", root).value.trim();
      c.zh = UI.qs("#cZh", root).value.trim();
      c.desc = UI.qs("#cDesc", root).value.trim();
      c.level = UI.qs("#cLv", root).value.split(" —")[0];
      c.teacherId = UI.qs("#cGv", root).value;
      c.status = status || UI.qs("#cSt", root).value;
      c.updated = Store.nowStr().split(" ")[0];
      Store.save();
    }
    UI.qs("#cSaveDraft", root).onclick = function () { collect("draft"); UI.toast("Đã lưu bản nháp.", "ok"); App.render(); };
    UI.qs("#cSave", root).onclick = function () { collect("pub"); UI.toast("Đã lưu và xuất bản cho học viên.", "ok"); App.render(); };

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
              py: UI.qs("#nlPy", m).value.trim(), vi: vi, status: "draft",
              vocab: [], extra: [], match: [], sentences: [], grammar: [], dialogues: [] };
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
  roles: ["gv", "admin"],
  view: function (p) {
    var l = Store.lesson(p.lid);
    if (!l) return UI.shell({ active: "#/admin/giao-trinh", title: "Không tìm thấy", crumb: "", body: '<div class="empty">Bài học không tồn tại.</div>' });
    var c = Store.course(l.courseId);
    var tabs = [["warmup", "🔥 Khởi động"], ["vocab", "📚 Từ mới"], ["practice", "🎮 Ôn tập"],
                ["grammar", "📖 Ngữ pháp"], ["dialogue", "💬 Hội thoại"]];

    var body = '<div class="edit"><div>' +
      '<div class="etabs">' + tabs.map(function (t) {
        return '<button class="etab ' + (t[0] === EDIT_TAB ? "on" : "") + '" data-tab="' + t[0] + '">' + t[1] + '</button>';
      }).join('') + '</div>' +

      '<div class="card pad mb"><div class="grid g2" style="gap:0 16px">' +
        '<div class="fld" style="margin-bottom:0"><label>Tên bài — tiếng Trung *</label>' +
          '<input class="inp zh" id="eZh" style="font-size:19px" value="' + UI.h(l.zh) + '"></div>' +
        '<div class="fld" style="margin-bottom:0"><label>Phiên âm ' + UI.chip("tự điền", "jade") + '</label>' +
          '<input class="inp auto" id="ePy" value="' + UI.h(l.py) + '"></div></div>' +
      '<div class="grid g2 mt" style="gap:0 16px">' +
        '<div class="fld" style="margin-bottom:0"><label>Tên tiếng Việt *</label><input class="inp" id="eVi" value="' + UI.h(l.vi) + '"></div>' +
        '<div class="fld" style="margin-bottom:0"><label>Số thứ tự bài</label><input class="inp" id="eNo" value="' + l.no + '"></div></div></div>' +

      '<div class="card pad" id="editBox">' + editTabBody(l) + '</div>' +

      '<div class="row mt2" style="border-top:1.5px solid var(--line);padding-top:15px">' +
        '<span class="sm muted grow" id="savedAt">Chưa lưu thay đổi</span>' +
        '<a class="btn ghost" href="#/hoc/' + l.id + '">👁 Xem trước</a>' +
        '<button class="btn ghost" id="eDraft">💾 Lưu nháp</button>' +
        '<button class="btn red" id="ePub">✔ Xuất bản cho lớp</button></div>' +
    '</div>' +

    '<div class="prev"><div class="ph"><span>👁</span><span class="grow">XEM TRƯỚC — HỌC VIÊN SẼ THẤY</span>' +
      '<button class="chip btn-like on" data-pv="desk">🖥 Máy tính</button>' +
      '<button class="chip btn-like" data-pv="phone">📱 Điện thoại</button></div>' +
      '<div class="pb" id="prevBox">' + previewBody(l) + '</div></div></div>';

    return UI.shell({ active: "#/admin/giao-trinh", title: "Soạn bài " + l.no + " — " + l.zh,
      crumb: "Quản trị · " + c.code + " · Bài " + l.no,
      actions: l.status === "pub" ? UI.chip("● Đang dùng", "jade") : UI.chip("● Bản nháp — chưa xuất bản", "gold"),
      body: body });
  },
  init: function (root, p) { initEditor(root, p); }
};

function editTabBody(l) {
  if (EDIT_TAB === "warmup") {
    return '<div class="row mb"><b class="grow" style="font-size:16px">🔥 Khởi động — thẻ lật</b></div>' +
      UI.alert("jade", "✨", 'Phần Khởi động <b>tự sinh</b> từ danh sách Từ mới — không phải nhập lại. ' +
        'Hiện có <b>' + l.vocab.length + ' thẻ</b>: mặt trước chữ Hán + biểu tượng, mặt sau phiên âm · Hán Việt · nghĩa.') +
      '<div class="mt"><label class="chk"><input type="checkbox" checked> Cho phép nút "Lật tất cả"</label></div>' +
      '<div class="mt"><label class="chk"><input type="checkbox" checked> Tự đọc chữ khi lật thẻ</label></div>' +
      '<div class="mt"><label class="chk"><input type="checkbox"> Xáo trộn thứ tự thẻ mỗi lần vào</label></div>' +
      '<div class="flip-grid mt2">' + l.vocab.slice(0, 4).map(function (v) {
        return '<div class="flip"><div class="flip-in"><div class="face front"><div class="emo">' + (v.emo || "📝") + '</div>' +
          '<div class="hz zh">' + UI.h(v.hz) + '</div><div class="hint">bấm để lật</div></div></div></div>';
      }).join('') + '</div>';
  }
  if (EDIT_TAB === "vocab") {
    return '<div class="row mb wrap"><b class="grow" style="font-size:16px">📚 Từ mới — <span id="vCount">' + l.vocab.length + '</span> từ</b>' +
      '<button class="btn ghost sm" data-act="excel">⤒ Nhập từ Excel</button>' +
      '<button class="btn ghost sm" id="vBank">🎲 Lấy từ ngân hàng</button>' +
      '<button class="btn red sm" id="vAdd">＋ Thêm từ</button></div>' +
      '<div class="vhead"><span>Chữ Hán</span><span>Phiên âm</span><span>Hán Việt</span>' +
      '<span>Nghĩa tiếng Việt</span><span>Biểu tượng</span><span></span></div>' +
      '<div id="vRows">' + l.vocab.map(function (v, i) { return vocabRow(v, i); }).join('') + '</div>' +
      '<div class="magic"><span style="font-size:16px">✨</span><div>' +
        '<b>Gõ chữ Hán vào ô đầu — hệ thống tự điền phiên âm, âm Hán Việt và gợi ý biểu tượng.</b><br>' +
        'Tra ở <b>mức từ</b> nên chữ đa âm ra đúng: <span class="zh">银行</span> yín<b>háng</b> · ' +
        '<span class="zh">行李</span> xíng<b>li</b> · <span class="zh">音乐</span> yīn<b>yuè</b> · ' +
        '<span class="zh">快乐</span> kuài<b>lè</b>. Nguồn: 44.435 chữ (pinyin-data) + 121.175 từ (CC-CEDICT) + 1.898 biểu tượng (Unicode).' +
      '</div></div>';
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

function vocabRow(v, i) {
  return '<div class="vrow" data-i="' + i + '">' +
    '<input class="hz zh" data-f="hz" value="' + UI.h(v.hz) + '" placeholder="汉字">' +
    '<input class="auto" data-f="py" value="' + UI.h(v.py) + '" placeholder="phiên âm">' +
    '<input class="auto" data-f="hv" value="' + UI.h(v.hv) + '" placeholder="Hán Việt">' +
    '<input data-f="vi" value="' + UI.h(v.vi) + '" placeholder="nghĩa tiếng Việt">' +
    '<input class="auto" data-f="emo" style="text-align:center;font-size:17px" value="' + UI.h(v.emo) + '">' +
    '<button class="del" data-del="' + i + '">✕</button></div>';
}

function previewBody(l) {
  return '<div style="background:linear-gradient(135deg,#C53A32,#E06A3B);color:#fff;border-radius:14px;padding:16px 18px;margin-bottom:13px">' +
    '<div class="zh" style="font-size:27px;font-weight:900">' + UI.h(l.zh) + '</div>' +
    '<div style="font-size:13px;opacity:.92">' + UI.h(l.py) + '</div>' +
    '<div style="font-size:12px;opacity:.85;margin-top:3px">' + UI.h(l.vi) + '</div></div>' +
    '<div class="row" style="gap:4px;margin-bottom:12px;font-size:11px">' +
      ['🔥', '📚', '🎮', '📖', '💬'].map(function (t, i) {
        return '<span class="chip xs ' + (i === 1 ? "red" : "") + '">' + t + '</span>'; }).join('') + '</div>' +
    (l.vocab.length ? l.vocab.slice(0, 4).map(function (v) {
      return '<div class="vcard" style="padding:12px;margin-bottom:10px;box-shadow:none">' +
        '<div class="vtop"><div class="vemo" style="width:42px;height:42px;font-size:22px;border-radius:12px">' + (v.emo || "📝") + '</div>' +
        '<div><div class="vhz zh" style="font-size:23px">' + UI.h(v.hz) + '</div>' +
        '<div class="vpy" style="font-size:13px">' + UI.h(v.py) + '</div></div></div>' +
        '<div class="vtags" style="margin:8px 0 6px">' + UI.chip(v.pos || "danh từ 名", "blue") + UI.chip("HV: " + v.hv, "purple") + '</div>' +
        '<div class="vmean" style="font-size:13.5px">' + UI.h(v.vi) + '</div></div>';
    }).join('') + (l.vocab.length > 4 ? '<div class="sm muted center">… ' + (l.vocab.length - 4) + ' từ nữa</div>' : '')
      : '<div class="empty sm">Chưa có từ nào.</div>');
}

function initEditor(root, p) {
  var l = Store.lesson(p.lid); if (!l) return;
  var dirty = false;
  function touch() { dirty = true; UI.qs("#savedAt", root).textContent = "Có thay đổi chưa lưu"; }

  UI.qsa(".etab", root).forEach(function (t) {
    t.onclick = function () { EDIT_TAB = t.getAttribute("data-tab"); App.render(); };
  });
  UI.qsa("[data-pv]", root).forEach(function (b) {
    b.onclick = function () {
      UI.qsa("[data-pv]", root).forEach(function (x) { x.classList.remove("on"); });
      b.classList.add("on");
      UI.qs("#prevBox", root).classList.toggle("phone", b.getAttribute("data-pv") === "phone");
    };
  });

  /* thông tin bài */
  ["eZh", "ePy", "eVi", "eNo"].forEach(function (id) {
    var el = UI.qs("#" + id, root); if (!el) return;
    el.oninput = function () {
      if (id === "eZh") { l.zh = el.value; var t = tra(el.value.trim()); if (t) UI.qs("#ePy", root).value = l.py = t.py; }
      if (id === "ePy") l.py = el.value;
      if (id === "eVi") l.vi = el.value;
      if (id === "eNo") l.no = parseInt(el.value, 10) || l.no;
      UI.qs("#prevBox", root).innerHTML = previewBody(l);
      touch();
    };
  });

  /* --- tab Từ mới --- */
  if (EDIT_TAB === "vocab") {
    function bindRows() {
      UI.qsa("#vRows .vrow", root).forEach(function (row) {
        var i = +row.getAttribute("data-i");
        UI.qsa("input", row).forEach(function (inp) {
          inp.oninput = function () {
            var f = inp.getAttribute("data-f");
            l.vocab[i][f] = inp.value;
            if (f === "hz") {
              var t = tra(inp.value.trim());
              if (t) {
                var py = UI.qs('[data-f=py]', row), hv = UI.qs('[data-f=hv]', row), em = UI.qs('[data-f=emo]', row);
                if (!py.value || py.getAttribute("data-auto")) { py.value = t.py; py.setAttribute("data-auto", "1"); l.vocab[i].py = t.py; }
                if (!hv.value || hv.getAttribute("data-auto")) { hv.value = t.hv; hv.setAttribute("data-auto", "1"); l.vocab[i].hv = t.hv; }
                if (!em.value || em.getAttribute("data-auto")) {
                  em.value = t.emo.split(" ")[0]; em.setAttribute("data-auto", "1"); l.vocab[i].emo = em.value;
                }
                UI.toast('Tự điền: ' + inp.value + ' → ' + t.py + ' · ' + t.hv + ' · ' + t.emo, "ok");
              }
            } else inp.removeAttribute("data-auto");
            UI.qs("#prevBox", root).innerHTML = previewBody(l);
            touch();
          };
        });
        var d = UI.qs("[data-del]", row);
        if (d) d.onclick = function () {
          l.vocab.splice(i, 1); Store.save(); App.render();
        };
      });
    }
    bindRows();
    UI.qs("#vAdd", root).onclick = function () {
      /* emo để trống để tính năng tự điền còn chỗ ghi vào; khi hiển thị mặc định là 📝 */
      l.vocab.push({ hz: "", py: "", hv: "", pos: "danh từ 名", vi: "", emo: "", ex: { zh: "", py: "", vi: "" } });
      Store.save(); App.render();
    };
    UI.qs("#vBank", root).onclick = function () {
      var have = {}; l.vocab.forEach(function (v) { have[v.hz] = 1; });
      var pool = Object.keys(MINI_DICT).filter(function (w) { return !have[w]; }).slice(0, 12);
      UI.modal({
        title: "Lấy từ ngân hàng từ vựng", wide: true,
        body: '<p class="sm muted mb">Chọn từ để thêm vào bài. Phiên âm, Hán Việt và biểu tượng được điền sẵn.</p>' +
          '<div class="row wrap" id="bankPick">' + pool.map(function (w) {
            var t = tra(w);
            return '<span class="chip btn-like" data-w="' + UI.h(w) + '" style="padding:8px 13px">' +
              '<span class="zh" style="font-size:17px">' + UI.h(w) + '</span> ' + t.py + ' ' + t.emo.split(" ")[0] + '</span>';
          }).join('') + '</div>',
        footer: '<button class="btn ghost" data-close>Huỷ</button><button class="btn red" id="bankOk">Thêm từ đã chọn</button>',
        onReady: function (m) {
          UI.qsa("#bankPick .chip", m).forEach(function (c) {
            c.onclick = function () { c.classList.toggle("on"); };
          });
          UI.qs("#bankOk", m).onclick = function () {
            var n = 0;
            UI.qsa("#bankPick .chip.on", m).forEach(function (c) {
              var w = c.getAttribute("data-w"), t = tra(w);
              l.vocab.push({ hz: w, py: t.py, hv: t.hv, pos: "danh từ 名", vi: "", emo: t.emo.split(" ")[0], ex: { zh: "", py: "", vi: "" } });
              n++;
            });
            Store.save(); UI.closeModal();
            UI.toast("Đã thêm " + n + " từ. Nhớ điền nghĩa tiếng Việt.", "ok");
            App.render();
          };
        }
      });
    };
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
  UI.qs("#eDraft", root).onclick = function () {
    l.status = "draft"; Store.save();
    UI.qs("#savedAt", root).textContent = "Đã lưu nháp lúc " + Store.nowStr().split(" ")[1];
    UI.toast("Đã lưu bản nháp.", "ok");
  };
  UI.qs("#ePub", root).onclick = function () {
    if (!l.vocab.length) { UI.toast("Bài chưa có từ mới nào — chưa xuất bản được.", "no"); return; }
    l.status = "pub";
    var c = Store.course(l.courseId); c.updated = Store.nowStr().split(" ")[0];
    Store.save();
    var ks = Store.s.classes.filter(function (k) { return k.courseId === l.courseId; });
    var n = 0; ks.forEach(function (k) {
      k.students.forEach(function (sid) {
        Store.notify(sid, "Bài học mới", "Bài " + l.no + " · " + l.zh + " đã mở", "#/hoc/" + l.id); n++;
      });
    });
    UI.toast("Đã xuất bản. " + n + " học viên nhận được bài này.", "ok");
    App.render();
  };
}
