# HanZi LMS — phần mềm dạy và học tiếng Trung

Bản dựng **giao diện** theo tài liệu `thiet-ke/HanZi-LMS-Thiet-ke-giao-dien.docx`.
Đủ 20 màn hình, 3 vai trò đăng nhập, dữ liệu mẫu có sẵn.

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

## Ba tài khoản đăng nhập

Mật khẩu chung: **123456**

| Vai trò | Email | Vào được những gì |
|---|---|---|
| Học viên | `hv@hanzi.vn` | Học 5 phần của bài · làm và nộp bài tập · xem điểm và ghi chú riêng của mình |
| Giáo viên | `gv@hanzi.vn` | Mọi quyền học viên + trình chiếu slide + khu quản trị (giáo trình, lớp, bài tập, chấm bài) trong phạm vi lớp mình phụ trách |
| Quản trị | `admin@hanzi.vn` | Toàn quyền giáo viên trên mọi lớp + quản lý người dùng, phân vai trò, cấu hình |

Ở màn đăng nhập có 3 nút bấm là vào thẳng, không cần gõ.
Các tài khoản học viên khác (`ha.pham@gmail.com`, `minh.vu@gmail.com`, …) cũng dùng mật khẩu `123456`.

---

## 20 màn hình

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
| S-11 | Tổng quan quản trị | `#/admin` |
| S-12 | Danh sách giáo trình | `#/admin/giao-trinh` |
| S-13 | Thông tin giáo trình | `#/admin/giao-trinh/c1` |
| S-14 | Soạn bài học | `#/admin/soan-bai/l3` |
| S-15 | Danh sách lớp học | `#/admin/lop` |
| S-16 | Chi tiết lớp và thêm học viên | `#/admin/lop/k1` |
| S-17 | Tạo bài tập và giao cho lớp | `#/admin/bai-tap/moi` |
| S-18 | Danh sách bài đã nộp | `#/admin/bai-tap/a1/nop` |
| S-19 | Chấm bài và ghi chú riêng | `#/admin/cham/a1/u3` |
| S-20 | Quản lý người dùng | `#/admin/nguoi-dung` |

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
    store.js            trạng thái + đăng nhập + lưu localStorage + tính điểm, tiến độ
    ui.js               hàm dựng giao diện dùng chung (khung app, bảng, thẻ, hộp thoại, thông báo)
    tts.js              đọc tiếng Trung bằng Web Speech API của trình duyệt
    app.js              bộ định tuyến theo `#/…`, kiểm tra quyền, sự kiện chung
    screens/
      auth.js             S-01, S-02
      hocvien.js          S-03, S-04, S-07, S-09
      hocbai.js           S-05 (5 phần), S-06
      lambai.js           S-08
      giaovien.js         S-10, S-11
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
  roles: ["gv", "admin"],              // bỏ trống = ai đăng nhập cũng vào được
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
- Tạo giáo trình, soạn bài (5 tab, có xem trước trực tiếp), tạo lớp, thêm học viên,
  tạo và giao bài tập cho lớp, quản lý người dùng.

## Những gì chỉ là giao diện

- **Ghi âm và nộp ảnh**: bấm là hiện trạng thái đã ghi/đã chọn, chưa gọi micro hay máy ảnh thật.
- **Nhập / xuất Excel**, **đăng nhập Google**, **gửi email / Zalo**: hiện thông báo, chưa nối.
- **Từ điển tự điền**: dùng bảng rút gọn ~40 từ trong `admin-giaotrinh.js`.
  Bản chạy thật gọi API tra cứu dựng từ pinyin-data (44.435 chữ), CC-CEDICT (121.175 từ)
  và emoji Unicode (1.898) — xem mục S-14 trong tài liệu thiết kế.
- **Điểm danh** ở màn chi tiết lớp là số liệu minh hoạ.

---

## Nạp lại dữ liệu mẫu

Đăng nhập bằng tài khoản quản trị → `#/admin/caidat` → **🔄 Nạp lại dữ liệu mẫu**.
Hoặc mở Console của trình duyệt và chạy `Store.reset(); location.reload()`.
