# Website Thẩm mỹ DONA

Trang tĩnh thuần HTML/CSS/JS, không cần thư viện ngoài. Chạy được trên Vercel, Hostinger hoặc bất kỳ hosting nào.

## Cấu trúc
- `src/pages/` – nội dung từng trang
- `src/partials/` – header, footer, khung trang dùng chung
- `src/data/site.json` – hotline, địa chỉ, **số giấy phép, CCHN, giờ làm việc** (điền vào đây khi có)
- `src/data/bang-gia.json` – bảng giá (đơn vị nghìn đồng); nhóm có `"hidden": true` không hiển thị
- `src/data/academy.json` – khóa học DONA Academy
- `src/assets/` – CSS, JS, ảnh

## Build
- `node build.mjs` → thư mục `dist/` (bản demo, có thẻ noindex)
- `DEMO=false node build.mjs` → bản chính thức, cho phép Google lập chỉ mục

## Triển khai
- **Vercel**: import repo, Vercel tự đọc `vercel.json` (build `node build.mjs`, output `dist`).
- **Hostinger**: chạy `DEMO=false node build.mjs`, upload toàn bộ nội dung `dist/` vào `public_html`.

## Form đặt lịch
Điền URL nhận dữ liệu (Google Apps Script hoặc Formspree) vào `formEndpoint` trong `src/data/site.json`. Khi để trống, form báo rõ là chưa gửi và hướng khách gọi hotline.

## Logo và ảnh
- Logo chính trên web: **bản teal** (`src/assets/img/logo-mark-teal.png`, `logo-dona-teal.png`, bản trắng `logo-dona-white.png` cho nền tối) — xuất từ file Canva "LOGO DONA".
- Bản vàng và hồng lưu ở `brand/`, chỉ dùng cho tình huống riêng (voucher, sự kiện, thiệp).
- Ảnh BS Nga lấy từ file gốc 4000×6000 trên Drive, thu về 1000–1600px, có cả bản WebP.

## Bản v2 (giao diện mới)
- Xem tại `/v2/` — v1 vẫn giữ nguyên ở trang gốc.
- v2 dùng chung dữ liệu (`src/data/`) và nội dung trang con với v1; chỉ khác khung giao diện (`src/v2/partials/`), trang chủ riêng (`src/v2/pages/index.html`) và `src/assets/css/v2.css`.
- Muốn trang con nào có nội dung riêng cho v2: tạo file cùng tên trong `src/v2/pages/`.

## Bản v3 (/v3/)

Bố cục theo bản phác Claude Design "DONA – Trang chủ v3" (tham khảo alchemy43.com): hero tối toàn chiều ngang, chữ Playfair Display, nút vuông, các dải màu xen kẽ. Trang chủ riêng ở `src/v3/pages/index.html`, giao diện ở `src/assets/css/v3.css`; các trang con dùng lại nội dung v1. Màu nằm trong biến CSS đầu file `v3.css`, đổi sang tông khác (ví dụ đỏ rượu của bản phác) chỉ cần sửa vài biến.
