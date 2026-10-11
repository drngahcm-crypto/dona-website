// Build tĩnh cho website DONA — không cần thư viện ngoài.
// Chạy: node build.mjs  →  xuất ra thư mục dist/ (upload được lên Vercel, Hostinger hoặc bất kỳ hosting nào).
import { readFileSync, writeFileSync, mkdirSync, readdirSync, cpSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const site = JSON.parse(readFileSync('src/data/site.json', 'utf8'));
const prices = JSON.parse(readFileSync('src/data/bang-gia.json', 'utf8'));
const courses = JSON.parse(readFileSync('src/data/academy.json', 'utf8'));
const promo = JSON.parse(readFileSync('src/data/chuong-trinh.json', 'utf8'));

// DEMO=true: chặn Google lập chỉ mục. Đặt DEMO=false khi chạy website thật trên thammydona.com.
const DEMO = (process.env.DEMO ?? 'true') !== 'false';

const partial = (name) => readFileSync(join('src/partials', name), 'utf8');
const vnd = (k) => (typeof k === 'number' ? (k * 1000).toLocaleString('vi-VN') + ' đ' : k);

const navItems = [
  ['index.html', 'Trang chủ'],
  ['ve-dona.html', 'Về DONA'],
  ['bac-si.html', 'Bác sĩ'],
  ['dich-vu.html', 'Dịch vụ'],
  ['case-lam-sang.html', 'Case lâm sàng'],
  ['bang-gia.html', 'Bảng giá'],
  ['academy.html', 'DONA Academy'],
  ['lien-he.html', 'Liên hệ'],
];

// ---- Chương trình bán hàng (v3) ----
const dong = (n) => n.toLocaleString('vi-VN') + ' đ';
const priceOf = (name) => {
  for (const g of prices.groups) {
    if (g.hidden) continue;
    const r = g.rows.find((x) => x[0] === name);
    if (r && typeof r[1] === 'number') return r[1] * 1000;
  }
  throw new Error('Không tìm thấy giá cho: ' + name);
};
function renderNewClientRows() {
  const d = promo.newClient.discount;
  return promo.newClient.examples
    .map((n) => {
      const p = priceOf(n);
      return `<tr><td>${n}</td><td>${dong(p)}</td><td><b>${dong(Math.round((p * (100 - d)) / 100 / 1000) * 1000)}</b></td></tr>`;
    })
    .join('');
}
function renderLightMenu() {
  return promo.light.items
    .map(([n, t, desc]) => {
      const p = priceOf(n);
      if (p > promo.light.maxPrice * 1000) throw new Error('Liệu trình nhẹ vượt giá trần: ' + n);
      return `<li class="v3-light"><div><h3>${n}</h3><p>${desc}</p></div><span class="v3-light-time">${t}</span><b>${dong(p)}</b></li>`;
    })
    .join('');
}
function renderTetSteps() {
  return promo.tet.steps.map(([w, t]) => `<li><b>${w}</b><span>${t}</span></li>`).join('');
}
function renderInstallPackages() {
  const min = promo.installment.minPackage;
  const items = (prices.combos || [])
    .filter((c) => !c.hidden)
    .map((c) => [`Combo ${c.name}`, Number(c.price.replace(/\D/g, ''))]);
  items.push(['Nâng cơ RF toàn mặt', priceOf('Nâng cơ RF toàn mặt')]);
  return items
    .filter(([, p]) => p >= min)
    .map(([n, p]) => `<li><span>${n}</span><b>${dong(p)}</b></li>`)
    .join('');
}
const offerNote = promo.approved
  ? ''
  : '<p class="v3-draft">Bản đề xuất, chưa áp dụng: mức ưu đãi và thể lệ đang chờ DONA duyệt.</p>';
const legalBlock = `<aside class="v3-legal" aria-label="Thông tin cơ sở khám chữa bệnh">
  <p><b>${site.clinic.name}</b> · ${site.clinic.address}</p>
  <p>Giấy phép hoạt động số: ${site.clinic.license} · Phạm vi hoạt động chuyên môn: ${site.clinic.scope} · Thời gian hoạt động: ${site.clinic.hours}</p>
  <p>Kết quả phụ thuộc cơ địa từng người. Bác sĩ chỉ định liệu trình sau khi thăm khám.</p>
</aside>`;

// Menu v3 xếp theo thang khách hàng: thử, quay lại, thành viên
const navV3 = [
  ['index.html', 'Trang chủ'],
  ['uu-dai-khach-moi.html', 'Ưu đãi khách mới'],
  ['lieu-trinh-nhe.html', 'Liệu trình nhẹ'],
  ['dich-vu.html', 'Dịch vụ'],
  ['bang-gia.html', 'Bảng giá'],
  ['thanh-vien.html', 'Thành viên'],
  ['bac-si.html', 'Bác sĩ'],
  ['lien-he.html', 'Liên hệ'],
];

function renderPriceTables() {
  return prices.groups
    .filter((g) => !g.hidden)
    .map((g) => {
      const head = g.columns.map((c) => `<th scope="col">${c}</th>`).join('');
      const rows = g.rows
        .map((r) => `<tr><th scope="row">${r[0]}</th>${r.slice(1).map((v) => `<td>${v === null ? '–' : vnd(v)}</td>`).join('')}</tr>`)
        .join('');
      const note = g.note ? `<p class="table-note">${g.note}</p>` : '';
      return `<section class="price-group" id="${g.id}">
  <h2>${g.name}</h2>
  <div class="table-wrap"><table><thead><tr><th scope="col">Dịch vụ</th>${head}</tr></thead><tbody>${rows}</tbody></table></div>${note}
</section>`;
    })
    .join('\n');
}

function renderLocations(compact = false) {
  return site.locations
    .map(
      (l) => `<article class="place">
  <p class="place-no">${l.no}</p>
  <h3>${l.name}</h3>
  <p>${l.address}</p>
  ${compact ? '' : `<p>${l.services}</p>`}
  <p class="place-hours">Thời gian hoạt động: ${l.hours}</p>
  <a href="${l.maps}" target="_blank" rel="noopener">Xem đường đi trên Google Maps</a>
</article>`
    )
    .join('\n');
}

function renderSocial(cls = '') {
  const s = site.social;
  const items = [
    ['zalo', s.zaloOA, 'Zalo OA Thẩm mỹ DONA'],
    ['facebook', s.facebookClinic, 'Facebook Thẩm mỹ DONA'],
    ['facebook', s.facebookDoctor, 'Facebook BS Đỗ Thị Nga'],
    ['tiktok', s.tiktok, 'TikTok @bacsidona'],
  ];
  return `<ul class="social-links ${cls}">${items
    .map(([k, href, label]) => `<li><a class="soc soc-${k}" href="${href}" target="_blank" rel="noopener"><span class="soc-dot" aria-hidden="true"></span>${label}</a></li>`)
    .join('')}</ul>`;
}

function renderPriceFrom() {
  const items = prices.groups
    .filter((g) => !g.hidden)
    .map((g) => {
      const vals = g.rows.map((r) => r[1]).filter((v) => typeof v === 'number');
      return `<li><a href="bang-gia.html#${g.id}">${g.name}</a><span class="lead-dots"></span><b><small>từ</small> ${vnd(g.priceFrom ?? Math.min(...vals))}</b></li>`;
    })
    .join('');
  return `<ul class="v2-price-list">${items}</ul>`;
}

function renderCombos() {
  return (prices.combos || [])
    .filter((c) => !c.hidden)
    .map(
      (c) => `<article class="combo">
  <p class="combo-kicker">COMBO</p>
  <h3>${c.name.toUpperCase()}</h3>
  <p class="combo-price">${c.price}</p>
  <ul class="bubbles">${c.items.map(([n, t]) => `<li><span>${t}<b>${n}</b></span></li>`).join('')}</ul>
  <p class="combo-gift"><span>Ưu đãi:</span> ${c.gift}</p>
</article>`
    )
    .join('\n');
}

function renderComboFeature() {
  const c = (prices.combos || []).find((x) => !x.hidden);
  if (!c) return '';
  return `<p class="v3-kicker">Combo liệu trình</p>
      <h2>Combo ${c.name} <span>${c.price.replace(' VNĐ', ' đ')}</span></h2>
      <p>${c.items.map(([n, t]) => `${n} ${t.toLowerCase()}`).join(' · ')}. ${c.gift}.</p>`;
}

function renderCourses() {
  return courses
    .map(
      (c) => `<article class="course">
  <h3>${c.name}</h3>
  <dl>
    <div><dt>Thời lượng</dt><dd>${c.duration}</dd></div>
    <div><dt>Hình thức</dt><dd>${c.format}</dd></div>
    <div><dt>Giảng viên</dt><dd>${c.teacher}</dd></div>
    <div><dt>Học phí</dt><dd>${c.fee}</dd></div>
  </dl>
  <p>${c.summary}</p>
  ${c.requirement ? `<p class="course-req">${c.requirement}</p>` : ''}
  <a class="btn btn-ghost" href="lien-he.html?chu-de=${encodeURIComponent('Đăng ký khóa ' + c.name)}#dat-lich">Đăng ký tư vấn khóa học</a>
</article>`
    )
    .join('\n');
}

const tokens = {
  '{{HOTLINE}}': site.hotline,
  '{{HOTLINE_TEL}}': site.hotline.replace(/\s/g, ''),
  '{{ZALO_URL}}': site.zalo,
  '{{MAPS_URL}}': site.maps,
  '{{EMAIL}}': site.email,
  '{{FB_CLINIC}}': site.social.facebookClinic,
  '{{FB_DOCTOR}}': site.social.facebookDoctor,
  '{{CLINIC_NAME}}': site.clinic.name,
  '{{CLINIC_ADDRESS}}': site.clinic.address,
  '{{CLINIC_LICENSE}}': site.clinic.license,
  '{{CLINIC_SCOPE}}': site.clinic.scope,
  '{{CLINIC_HOURS}}': site.clinic.hours,
  '{{SPA_NAME}}': site.spa.name,
  '{{SPA_ADDRESS}}': site.spa.address,
  '{{SPA_HOURS}}': site.spa.hours,
  '{{SPA_MAPS}}': site.locations[0].maps,
  '{{DOCTOR_LICENSE}}': site.doctor.license,
  '{{PRICE_TABLES}}': renderPriceTables(),
  '{{PRICE_UPDATED}}': prices.updated,
  '{{COURSES}}': renderCourses(),
  '{{COMBOS}}': renderCombos(),
  '{{COMBO_FEATURE}}': renderComboFeature(),
  '{{PRICE_FROM}}': renderPriceFrom(),
  '{{SOCIAL}}': renderSocial(),
  '{{SOCIAL_DARK}}': renderSocial('on-dark'),
  '{{ZALO_OA}}': site.social.zaloOA,
  '{{LOCATIONS}}': renderLocations(),
  '{{LOCATIONS_COMPACT}}': renderLocations(true),
  '{{LOC1}}': site.locations[0].name + ', ' + site.locations[0].address,
  '{{LOC2}}': site.locations[1].name + ', ' + site.locations[1].address,
  '{{FORM_ENDPOINT}}': site.formEndpoint,
  '{{YEAR}}': String(new Date().getFullYear()),
  '{{OFFER_NOTE}}': offerNote,
  '{{OFFER_TAG}}': promo.approved ? '' : ' <em class="v3-tag">(đề xuất)</em>',
  '{{LEGAL_BLOCK}}': legalBlock,
  '{{NC_DISCOUNT}}': promo.newClient.discount + '%',
  '{{NC_ROWS}}': renderNewClientRows(),
  '{{LIGHT_MAX}}': dong(promo.light.maxPrice * 1000),
  '{{LIGHT_MENU}}': renderLightMenu(),
  '{{MEMBER_MONTHLY}}': dong(promo.membership.monthly),
  '{{MEMBER_QUARTERLY}}': dong(promo.membership.quarterly),
  '{{MEMBER_DISCOUNT}}': promo.membership.discount + '%',
  '{{MEMBER_SEATS}}': String(promo.membership.pilotSeats),
  '{{MEMBER_QBONUS}}': promo.membership.quarterBonus,
  '{{MEMBER_ANNIV}}': promo.membership.anniversary,
  '{{MEMBER_CANCEL}}': promo.membership.cancel,
  '{{REF_REWARD}}': dong(promo.referral.reward),
  '{{TET_NAME}}': promo.tet.name,
  '{{TET_OPEN}}': promo.tet.openFrom,
  '{{TET_STEPS}}': renderTetSteps(),
  '{{INST_MIN}}': dong(promo.installment.minPackage),
  '{{INST_PARTS}}': promo.installment.parts,
  '{{INST_PACKAGES}}': renderInstallPackages(),
  '{{GIFT_CARDS}}': promo.giftCards.map(dong).join(' · '),
};
const fill = (html) => Object.entries(tokens).reduce((s, [k, v]) => s.split(k).join(v), html);

rmSync('dist', { recursive: true, force: true });
mkdirSync('dist', { recursive: true });
cpSync('src/assets', 'dist/assets', { recursive: true });

for (const file of readdirSync('src/pages').filter((f) => f.endsWith('.html'))) {
  const raw = readFileSync(join('src/pages', file), 'utf8');
  const meta = JSON.parse(raw.match(/<!--meta(.*?)-->/s)[1]);
  const body = raw.replace(/<!--meta.*?-->/s, '');
  const nav = navItems
    .map(([href, label]) => `<li><a href="${href}"${href === file ? ' aria-current="page"' : ''}>${label}</a></li>`)
    .join('');
  const html = fill(
    partial('layout.html')
      .replace('{{HEADER}}', partial('header.html').replace('{{NAV}}', nav))
      .replace('{{FOOTER}}', partial('footer.html'))
      .replace('{{BODY}}', body)
      .replace('{{TITLE}}', meta.title)
      .replace('{{DESCRIPTION}}', meta.description)
      .replace('{{ROBOTS}}', DEMO ? '<meta name="robots" content="noindex, nofollow">' : '')
  );
  writeFileSync(join('dist', file), html);
}

// ---- Bản v2 (/v2/) và v3 (/v3/): giao diện khác, dùng chung dữ liệu; trang con nào chưa có bản riêng thì dùng nội dung v1 ----
for (const v of ['v2', 'v3']) {
  const vPartial = (name) => readFileSync(join(`src/${v}/partials`, name), 'utf8');
  mkdirSync(`dist/${v}`, { recursive: true });
  const ownDir = `src/${v}/pages`;
  const files = new Set([...readdirSync('src/pages'), ...(existsSync(ownDir) ? readdirSync(ownDir) : [])].filter((f) => f.endsWith('.html')));
  const items = v === 'v3' ? navV3 : navItems;
  for (const file of files) {
    const own = join(ownDir, file);
    const raw = readFileSync(existsSync(own) ? own : join('src/pages', file), 'utf8');
    const meta = JSON.parse(raw.match(/<!--meta(.*?)-->/s)[1]);
    const body = raw.replace(/<!--meta.*?-->/s, '');
    const nav = items
      .map(([href, label]) => `<li><a href="${href}"${href === file ? ' aria-current="page"' : ''}>${label}</a></li>`)
      .join('');
    const html = fill(
      vPartial('layout.html')
        .replace('{{HEADER}}', vPartial('header.html').replace('{{NAV}}', nav))
        .replace('{{FOOTER}}', vPartial('footer.html'))
        .replace('{{BODY}}', body)
        .replace('{{TITLE}}', meta.title)
        .replace('{{DESCRIPTION}}', meta.description)
        // bản thử nghiệm luôn noindex
        .replace('{{ROBOTS}}', '<meta name="robots" content="noindex, nofollow">')
    ).replace(/(src|href|srcset)="assets\//g, '$1="../assets/');
    writeFileSync(join(`dist/${v}`, file), html);
  }
}

writeFileSync('dist/robots.txt', DEMO ? 'User-agent: *\nDisallow: /\n' : `User-agent: *\nAllow: /\nSitemap: ${site.domain}/sitemap.xml\n`);
writeFileSync(
  'dist/sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${navItems
    .map(([href]) => `  <url><loc>${site.domain}/${href === 'index.html' ? '' : href}</loc></url>`)
    .join('\n')}\n</urlset>\n`
);
if (!existsSync('dist/index.html')) throw new Error('Thiếu trang chủ');
console.log(`Đã build ${navItems.length} trang vào dist/ (DEMO=${DEMO})`);
