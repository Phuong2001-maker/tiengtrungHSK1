# HanZi LMS — phần mềm dạy và học tiếng Trung

Bản dựng **giao diện** theo tài liệu `thiet-ke/HanZi-LMS-Thiet-ke-giao-dien.docx`.
Đủ 19 màn hình, 2 vai trò đăng nhập, dữ liệu mẫu có sẵn.

Chỉ có phần chạy trong trình duyệt — **không có máy chủ, không có cơ sở dữ liệu**.
Mọi thay đổi được lưu vào `localStorage` của chính trình duyệt bạn đang dùng.

---

## Chạy thế nào

Mở thẳng `index.html` bằng Chrome / Edge là chạy. Không cần cài gì, không cần build.

Nếu muốn chạy qua `http://` (khuyên dùng — `localStorage` ổn định hơn):

```bash
python -m http.server 8137
```

rồi mở <http://127.0.0.1:8137/phan-mem/>

---

## Hai tài khoản đăng nhập

Mật khẩu chung: **123456**

| Vai trò | Email | Vào được những gì |
|---|---|---|
| Học viên | `hv@hanzi.vn` | Học 5 phần của bài · làm và nộp bài tập · xem điểm và ghi chú riêng của mình |
| Giáo viên | `gv@hanzi.vn` | Mọi quyền học viên + trình chiếu slide + khu quản lý: giáo trình, lớp, bài tập, chấm bài **trong phạm vi lớp mình phụ trách**, cùng danh sách người dùng và cấu hình dùng chung cả trung tâm |

Không có vai trò quản trị riêng — giáo viên tự tạo và khoá tài khoản học viên.
Dữ liệu mẫu có sẵn hai giáo viên: `gv@hanzi.vn` (cô Lan, 3 lớp) và
`dat.pham@hanzi.vn` (thầy Đạt, 2 lớp) — đăng nhập chéo để thấy mỗi người
chỉ nhìn được lớp của mình.

**Không có trạng thái bản nháp.** Giáo trình và bài học vừa tạo là dùng được ngay,
học viên nhìn thấy luôn. Không có bước "xuất bản", không khoá bài nào lại.
Riêng bài làm của học viên và phần chấm dở của giáo viên thì vẫn lưu nháp được —
đó là lưu dở dang công việc, không phải trạng thái xuất bản.

Màn đăng nhập không còn nút bấm nhanh — gõ email và mật khẩu như bình thường.
Các tài khoản học viên khác (`ha.pham@gmail.com`, `minh.vu@gmail.com`, …) cũng dùng mật khẩu `123456`.

---

## 19 màn hình

| Mã | Màn hình | Địa chỉ |
|---|---|---|
| S-01 | Đăng nhập | `#/login` |
| S-02 | Quên mật khẩu | `#/quen-mat-khau` |
| S-03 | Trang chủ học viên | `#/hv` |
| S-04 | Giáo trình — danh sách bài học | `#/hv/giao-trinh/c1` |
| S-05a…e | Học bài — 5 phần | `#/hoc/l3/warmup` · `vocab` · `practice` · `grammar` · `dialogue` |
| S-06 | Trình chiếu bài giảng | `#/trinh-chieu/l3` |
| S-07 | Bài tập của tôi | `#/hv/bai-tap` |
| S-08 | Làm bài và nộp bài | `#/hv/lam-bai/a1` |
| S-09 | Kết quả và ghi chú của giáo viên | `#/hv/ket-qua/a1` |
| S-10 | Bảng điều khiển giáo viên | `#/gv` |
| S-12 | Danh sách giáo trình | `#/admin/giao-trinh` |
| S-13 | Thông tin giáo trình | `#/admin/giao-trinh/c1` |
| S-14 | Soạn bài học | `#/admin/soan-bai/l3` |
| S-15 | Danh sách lớp học | `#/admin/lop` |
| S-16 | Chi tiết lớp và thêm học viên | `#/admin/lop/k1` |
| S-17 | Tạo bài tập và giao cho lớp | `#/admin/bai-tap/moi` |
| S-18 | Danh sách bài đã nộp | `#/admin/bai-tap/a1/nop` |
| S-19 | Chấm bài và ghi chú riêng | `#/admin/cham/a1/u3` |
| S-20 | Quản lý người dùng | `#/admin/nguoi-dung` |

Bảng nhảy từ S-10 sang S-12: màn **S-11 Tổng quan quản trị** đã bị xoá cùng vai trò
quản trị, phần thống kê và dòng hoạt động của nó gộp vào bảng điều khiển giáo viên (S-10).
Mã số các màn còn lại giữ nguyên để khớp với tài liệu thiết kế trong `thiet-ke/`.

Địa chỉ vẫn giữ tiền tố `#/admin/…` cho khỏi phải sửa mọi liên kết; đó chỉ là
tên đường dẫn, không còn vai trò quản trị nào đứng sau.

---

## Đường đi thử cho nhanh

1. Vào bằng **Học viên** → *Bài tập* → làm *Bài tập Bài 3* → **Nộp bài**.
2. Đăng xuất, vào bằng **Giáo viên** → *Bài cần chấm* → chọn học viên vừa nộp.
   Cho điểm câu ghi âm, bấm **💡 Gợi ý theo câu sai** để hệ thống tự chọn phần chưa đạt,
   viết nhận xét rồi **📨 Gửi ghi chú**.
3. Quay lại **Học viên** → *Kết quả & ghi chú* — thấy đúng điểm, phần chưa đạt và việc cần làm.
   Học viên khác vào cùng bài tập đó **không** thấy ghi chú này.

Thử thêm ở màn **Soạn bài** (giáo viên): gõ `银行` vào ô Chữ Hán —
phiên âm, âm Hán Việt và biểu tượng tự điền. Gõ tiếp `音乐`, `快乐`, `睡觉` để thấy
chữ đa âm ra đúng. Ô nào bạn đã tự sửa thì hệ thống giữ nguyên, không ghi đè.

---

## Cấu trúc thư mục

```
phan-mem/
  index.html            nạp các file theo đúng thứ tự
  css/app.css           toàn bộ bảng kiểu
  js/
    data.js             dữ liệu mẫu: người dùng, giáo trình, bài học, lớp, bài tập, bài nộp, ghi chú
    emoji.js            1.898 biểu tượng Unicode 15.1, chia 9 nhóm — dùng cho bộ chọn biểu tượng
    store.js            trạng thái + đăng nhập + lưu localStorage + tính điểm, tiến độ
    ui.js               hàm dựng giao diện dùng chung (khung app, bảng, thẻ, hộp thoại, thông báo)
    tts.js              đọc tiếng Trung bằng Web Speech API của trình duyệt
    app.js              bộ định tuyến theo `#/…`, kiểm tra quyền, sự kiện chung
    screens/
      auth.js             S-01, S-02
      hocvien.js          S-03, S-04, S-07, S-09
      hocbai.js           S-05 (5 phần), S-06
      lambai.js           S-08
      giaovien.js         S-10
      admin-giaotrinh.js  S-12, S-13, S-14
      admin-lop.js        S-15, S-16
      admin-baitap.js     S-17, S-18, S-19
      admin-nguoidung.js  S-20
```

Dùng script cổ điển (không phải ES module) để mở bằng `file://` vẫn chạy.
Thêm màn hình mới: tạo file trong `js/screens/`, khai báo `ROUTES["duong/dan"] = {…}`,
rồi thêm một thẻ `<script>` vào `index.html`.

Một tuyến có dạng:

```js
ROUTES["admin/lop/:kid"] = {
  roles: ["gv"],                       // bỏ trống = ai đăng nhập cũng vào được
  view: function (p) { return UI.shell({ … }); },   // p.kid là tham số trên địa chỉ
  init: function (root, p) { … }       // gắn sự kiện sau khi vẽ xong
};
```

---

## Những gì đã chạy thật

- Đăng nhập, phân quyền theo vai trò, đăng xuất; vào nhầm màn bị chặn và đưa về trang chủ.
- Thẻ lật, nghe phát âm (giọng tiếng Trung của Windows), đọc chậm, nghe lần lượt cả bài.
- Trò ghép từ và sắp xếp câu chấm điểm ngay; bài luyện biến điệu `不`.
- Làm bài 7 dạng câu, tự lưu nháp 20 giây/lần, đếm ngược, nộp bài, chấm tự động.
- Giáo viên chấm tay, nhận xét từng câu, chọn phần chưa đạt, gửi ghi chú riêng —
  học viên nhận thông báo và chỉ thấy ghi chú của chính mình.
- Tạo giáo trình, soạn bài (5 tab, có xem trước trực tiếp), sửa lại bài đã thêm,
  đổi thứ tự bài, tạo lớp, thêm học viên, tạo và giao bài tập cho lớp, quản lý học viên.
  Mọi thứ vừa tạo là học viên thấy ngay, không qua bước duyệt hay xuất bản.
- **Năm phần của bài có kho dữ liệu riêng, không phần nào sinh ra từ phần nào.**
  Khởi động có bảng thẻ riêng ngay trong tab của nó (`l.warmup`), Từ mới có `l.vocab`,
  Ôn tập có `l.match` + `l.sentences`, Ngữ pháp có `l.grammar`, Hội thoại có `l.dialogues`.
  Sửa phần nào chỉ đổi phần đó. Dữ liệu mẫu chép Khởi động từ Từ mới cho khỏi gõ lại,
  nhưng từ đó hai bên đi đường riêng.
- **Tab Từ mới nhập từng từ một**: một ô nhập luôn để trắng ở trên (biểu tượng, chữ Hán,
  phiên âm, Hán Việt, từ loại, nghĩa, câu ví dụ). Bấm **✔ Lưu bài** thì từ xuống danh sách
  bên dưới và ô nhập trắng lại để gõ từ tiếp theo. Mỗi từ trong danh sách có nút
  **✏️ Sửa từ này** và **✕** xoá.
- **Từ loại chọn bằng chip, mỗi loại một chip riêng, chọn được nhiều.** Lưu thành mảng
  (`pos: ["danh từ 名", "động từ 动"]`) chứ không ghép chuỗi như trước. Hàm `loaiTu()` trong
  `ui.js` đọc được cả kiểu cũ lẫn kiểu mới nên dữ liệu cũ không cần chuyển đổi.
- **Âm Hán Việt** ghi đủ chữ và nằm ngay dưới phiên âm — cùng là cách đọc thì để cạnh nhau;
  hàng chip bên dưới chỉ còn từ loại.
- **Soạn tới đâu thấy tới đó.** Cả tab Khởi động lẫn tab Từ mới đều có mục
  *Học viên sẽ thấy như thế này* ngay dưới phần nhập, dựng đúng thẻ của học viên và
  cập nhật ngay từng phím gõ — không phải bấm lưu rồi mở màn học viên ra kiểm.
- **Tên bài và nội dung bài tách hẳn nhau.** Tên bài (chữ Hán · phiên âm · tiếng Việt ·
  Hán Việt · biểu tượng) sửa ở panel *Bài học* trong màn giáo trình, nút **✏️ Tên**.
  Màn soạn bài (nút **📝 Soạn**) chỉ có 5 tab nội dung — sửa trong đó không đụng tới tên.
- Màn soạn bài **tự lưu vào `localStorage` ngay khi gõ**, không cần bấm nút. Tab Khởi động
  dựng đúng thẻ lật mà học viên sẽ thấy: lật được, nghe được.
- **Bộ chọn biểu tượng 1.898 cái** (`js/emoji.js`), chia 9 nhóm, **tìm bằng tiếng Việt**:
  gõ `nha`, `mèo`, `cờ việt nam`, `bác sĩ` đều ra. Không cần bỏ dấu cho đúng.
  Khớp trọn từ để "nha" không lôi cả "nháy mắt" về; chỉ khi không ra gì mới nới sang
  khớp phần đầu. 1.441/1.898 mục (76%) có từ khoá tiếng Việt, còn lại tìm bằng tên tiếng Anh.

## Những gì chỉ là giao diện

- **Ghi âm và nộp ảnh**: bấm là hiện trạng thái đã ghi/đã chọn, chưa gọi micro hay máy ảnh thật.
- **Nhập / xuất Excel** (còn ở màn Bài đã nộp và Chi tiết lớp), **đăng nhập Google**,
  **gửi email / Zalo**: hiện thông báo, chưa nối.
- **Từ điển tự điền phiên âm và Hán Việt**: dùng bảng rút gọn ~40 từ trong
  `admin-giaotrinh.js`. Gõ 医生 thì tự điền được, gõ 你 thì không. Bản chạy thật cần
  pinyin-data (44.435 chữ) + CC-CEDICT (121.175 từ) — hai kho này hiện nằm trong
  `../index.html`, chưa nối sang đây.
  **Kho biểu tượng thì ngược lại — đã nhúng đủ**: xem `js/emoji.js`.
- **Điểm danh** ở màn chi tiết lớp là số liệu minh hoạ.

---

## Nạp lại dữ liệu mẫu

Đăng nhập bằng tài khoản giáo viên → `#/admin/caidat` → **🔄 Nạp lại dữ liệu mẫu**.
Hoặc mở Console của trình duyệt và chạy `Store.reset(); location.reload()`.
