// Build tĩnh cho website DONA — không cần thư viện ngoài.
// Chạy: node build.mjs  →  xuất ra thư mục dist/ (upload được lên Vercel, Hostinger hoặc bất kỳ hosting nào).
import { readFileSync, writeFileSync, mkdirSync, readdirSync, cpSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const site = JSON.parse(readFileSync('src/data/site.json', 'utf8'));
const prices = JSON.parse(readFileSync('src/data/bang-gia.json', 'utf8'));
const courses = JSON.parse(readFileSync('src/data/academy.json', 'utf8'));

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
  '{{LOCATIONS}}': renderLocations(),
  '{{LOCATIONS_COMPACT}}': renderLocations(true),
  '{{LOC1}}': site.locations[0].name + ', ' + site.locations[0].address,
  '{{LOC2}}': site.locations[1].name + ', ' + site.locations[1].address,
  '{{FORM_ENDPOINT}}': site.formEndpoint,
  '{{YEAR}}': String(new Date().getFullYear()),
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

writeFileSync('dist/robots.txt', DEMO ? 'User-agent: *\nDisallow: /\n' : `User-agent: *\nAllow: /\nSitemap: ${site.domain}/sitemap.xml\n`);
writeFileSync(
  'dist/sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${navItems
    .map(([href]) => `  <url><loc>${site.domain}/${href === 'index.html' ? '' : href}</loc></url>`)
    .join('\n')}\n</urlset>\n`
);
if (!existsSync('dist/index.html')) throw new Error('Thiếu trang chủ');
console.log(`Đã build ${navItems.length} trang vào dist/ (DEMO=${DEMO})`);
