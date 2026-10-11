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
