// Menu trên điện thoại
const toggle = document.querySelector('.nav-toggle');
const nav = document.getElementById('menu-chinh');
if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.textContent = open ? 'Đóng' : 'Menu';
  });
}

// Mặt cắt tầng da ở trang chủ
const SKIN = {
  'tan-nhang': {
    layers: [1],
    title: 'Tàn nhang nằm ở thượng bì',
    text: 'Hắc sắc tố tập trung ở lớp đáy của thượng bì, tạo thành các đốm nâu nhỏ, rõ hơn sau khi ra nắng.',
    how: 'Tại DONA: laser phân giải tàn nhang theo số lượng nốt, kết hợp hướng dẫn chống nắng tại nhà.',
    href: 'dich-vu.html#nam-sac-to',
  },
  nam: {
    layers: [1, 2],
    title: 'Nám có thể nằm ở thượng bì, trung bì hoặc cả hai',
    text: 'Nám càng sâu càng khó mờ và dễ tái phát. Vì vậy bác sĩ cần xác định độ sâu trước khi chọn phương pháp.',
    how: 'Tại DONA: peel nám, toning và phân giải sắc tố đa tầng, phối hợp theo độ sâu của nám.',
    href: 'dich-vu.html#nam-sac-to',
  },
  mun: {
    layers: [2],
    title: 'Mụn bắt đầu từ nang lông và tuyến bã ở trung bì',
    text: 'Bã nhờn, sừng hóa cổ nang lông và vi khuẩn gây viêm. Mụn viêm sâu dễ để lại thâm và sẹo.',
    how: 'Tại DONA: lấy nhân mụn chuẩn y khoa, peel trị mụn, ánh sáng IPL và laser xung dài giảm viêm, kê đơn thuốc bôi khi cần.',
    href: 'dich-vu.html#mun',
  },
  seo: {
    layers: [2, 3],
    title: 'Sẹo rỗ là tổn thương collagen ở trung bì',
    text: 'Mô sẹo kéo bề mặt da xuống tạo hố lõm. Cần tác động vào trung bì để kích thích tái tạo collagen mới.',
    how: 'Tại DONA: Micro Fractional, tách sẹo, chấm sẹo đáy nhọn và peel sẹo, lên phác đồ theo loại sẹo.',
    href: 'dich-vu.html#seo',
  },
  'lao-hoa': {
    layers: [3, 4],
    title: 'Lão hóa bắt nguồn từ trung bì sâu và mô nâng đỡ',
    text: 'Collagen, elastin suy giảm và mô mỡ dưới da thay đổi theo tuổi khiến da mỏng, nhăn và chảy xệ.',
    how: 'Tại DONA: nâng cơ RF, Cryo căng bóng và chăm sóc da nâng cơ chống lão hóa.',
    href: 'dich-vu.html#tre-hoa',
  },
};
const layersEl = document.querySelector('.layers');
const answer = document.querySelector('.skin-answer');
document.querySelectorAll('.concern').forEach((btn) => {
  btn.addEventListener('click', () => {
    const item = SKIN[btn.dataset.concern];
    document.querySelectorAll('.concern').forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
    layersEl.classList.add('is-focused');
    layersEl.querySelectorAll('.layer').forEach((l) => l.classList.toggle('is-on', item.layers.includes(Number(l.dataset.layer))));
    answer.innerHTML = `<h3>${item.title}</h3><p>${item.text}</p><p>${item.how}</p><a href="${item.href}">Xem chi tiết dịch vụ</a>`;
  });
});

// Lọc case lâm sàng
document.querySelectorAll('[data-filter]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const f = btn.dataset.filter;
    document.querySelectorAll('[data-filter]').forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
    document.querySelectorAll('.case').forEach((c) => { c.hidden = f !== 'all' && c.dataset.group !== f; });
  });
});

// Form đặt lịch
const form = document.getElementById('form-dat-lich');
if (form) {
  const params = new URLSearchParams(location.search);
  if (params.get('chu-de')) form.elements.van_de.value = params.get('chu-de');

  const status = form.querySelector('.form-status');
  const setError = (name, msg) => {
    const input = form.elements[name];
    const err = form.querySelector(`[data-error-for="${name}"]`);
    input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    err.textContent = msg || '';
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = form.elements.ho_ten.value.trim();
    const phone = form.elements.so_dien_thoai.value.replace(/\s/g, '');
    let ok = true;
    setError('ho_ten', name ? '' : 'Nhập họ tên để phòng khám xưng hô khi gọi lại.');
    if (!name) ok = false;
    const phoneOk = /^(0|\+84)\d{9,10}$/.test(phone);
    setError('so_dien_thoai', phoneOk ? '' : 'Số điện thoại cần 10 chữ số, ví dụ 0901 234 567.');
    if (!phoneOk) ok = false;
    const consent = form.elements.dong_y.checked;
    setError('dong_y', consent ? '' : 'Cần đồng ý để phòng khám liên hệ lại với bạn.');
    if (!consent) ok = false;
    if (!ok) { form.querySelector('[aria-invalid="true"]').focus(); return; }

    const endpoint = form.dataset.endpoint;
    status.hidden = false;
    if (!endpoint) {
      // Bản demo chưa nối nơi nhận lịch hẹn: nói rõ, không giả vờ đã gửi.
      status.className = 'form-status info';
      status.innerHTML = 'Bản demo chưa kết nối nơi nhận lịch hẹn nên thông tin này <strong>chưa được gửi</strong>. Vui lòng gọi <a href="tel:0367661115">0367 661 115</a> hoặc nhắn Zalo để đặt lịch.';
      return;
    }
    try {
      const res = await fetch(endpoint, { method: 'POST', body: new FormData(form) });
      if (!res.ok) throw new Error(res.status);
      form.reset();
      status.className = 'form-status ok';
      status.textContent = 'Đã gửi yêu cầu đặt lịch. Phòng khám sẽ gọi lại để xác nhận giờ hẹn.';
    } catch {
      status.className = 'form-status info';
      status.innerHTML = 'Chưa gửi được yêu cầu do lỗi kết nối. Vui lòng thử lại hoặc gọi <a href="tel:0367661115">0367 661 115</a>.';
    }
  });
}
