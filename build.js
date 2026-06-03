/* ===================================================================
   build.js — Static site generator for nyshipdetox.com
   -------------------------------------------------------------------
   Splits the single-file SPA (addiction-rehab-center.html) into one
   real, indexable HTML page per section, each with its own URL,
   <title>, meta description, canonical tag and JSON-LD. Also emits the
   E-E-A-T pages, the homepage (index.html) and sitemap.xml.

   Run:  node build.js
   =================================================================== */

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const ORIGIN = 'https://nyshipdetox.com';
const PHONE = '213-321-6518';
const SOURCE = path.join(__dirname, 'addiction-rehab-center.html');
const OUT = __dirname;

/* ---- Per-page SEO metadata -------------------------------------- */
/* id, slug ('' = homepage/index.html), title, description            */
const PAGES = [
  { id: 'p-home', slug: '', title: 'NYSHIP & Empire Plan Drug Rehab | Alcohol & Drug Detox NY | Addiction Rehab Center',
    desc: 'NY State employees: your NYSHIP / Empire Plan covers alcohol detox, cocaine, kratom, opioid and painkiller addiction treatment across New York. Free, confidential benefits check — call ' + PHONE + '.' },

  // ---- Locations ----
  { id: 'p-albany', slug: 'nyship-rehab-albany', title: 'NYSHIP Rehab in Albany, NY | Empire Plan Detox & Addiction Treatment',
    desc: 'NYSHIP & Empire Plan addiction treatment for Albany & Capital Region state employees — alcohol detox, opioid, cocaine & dual-diagnosis care. Confidential. Call ' + PHONE + '.' },
  { id: 'p-buffalo', slug: 'nyship-rehab-buffalo', title: 'NYSHIP Rehab in Buffalo, NY | Erie County Empire Plan Addiction Treatment',
    desc: 'NYSHIP-covered detox & rehab for Buffalo and Erie County government employees. Alcohol, opioid, cocaine and kratom treatment. Free benefits verification — call ' + PHONE + '.' },
  { id: 'p-syracuse', slug: 'nyship-rehab-syracuse', title: 'NYSHIP Rehab in Syracuse, NY | Onondaga County Empire Plan Treatment',
    desc: 'NYSHIP & Empire Plan addiction treatment for Syracuse and Onondaga County employees. Confidential detox, inpatient and outpatient rehab. Verify benefits free — ' + PHONE + '.' },
  { id: 'p-rochester', slug: 'nyship-rehab-rochester', title: 'NYSHIP Rehab in Rochester, NY | Monroe County Empire Plan Treatment',
    desc: 'NYSHIP-covered detox and rehab for Rochester and Monroe County public employees. Alcohol, opioid and cocaine addiction treatment. Confidential. Call ' + PHONE + '.' },
  { id: 'p-poughkeepsie', slug: 'nyship-rehab-poughkeepsie', title: 'NYSHIP Rehab in Poughkeepsie, NY | Dutchess County Empire Plan Treatment',
    desc: 'NYSHIP & Empire Plan addiction treatment for Poughkeepsie and Dutchess County employees. Detox, rehab and dual-diagnosis care. Free benefits check — ' + PHONE + '.' },
  { id: 'p-binghamton', slug: 'nyship-rehab-binghamton', title: 'NYSHIP Rehab in Binghamton, NY | Broome County Empire Plan Treatment',
    desc: 'NYSHIP-covered detox and rehab for Binghamton and Broome County government workers. Confidential alcohol, opioid and cocaine treatment. Call ' + PHONE + '.' },
  { id: 'p-schenectady', slug: 'nyship-rehab-schenectady', title: 'NYSHIP Rehab in Schenectady, NY | Capital Region Empire Plan Treatment',
    desc: 'NYSHIP & Empire Plan addiction treatment for Schenectady County employees. Detox, residential and outpatient rehab, fully confidential. Verify free — ' + PHONE + '.' },
  { id: 'p-troy', slug: 'nyship-rehab-troy', title: 'NYSHIP Rehab in Troy, NY | Rensselaer County Empire Plan Treatment',
    desc: 'NYSHIP-covered detox and addiction treatment for Troy and Rensselaer County public employees. Confidential, job-protected care. Free benefits check — ' + PHONE + '.' },
  { id: 'p-utica', slug: 'nyship-rehab-utica', title: 'NYSHIP Rehab in Utica, NY | Oneida County Empire Plan Treatment',
    desc: 'NYSHIP & Empire Plan addiction treatment for Utica and Oneida County government employees. Alcohol, opioid and cocaine detox & rehab. Call ' + PHONE + '.' },
  { id: 'p-newburgh', slug: 'nyship-rehab-newburgh', title: 'NYSHIP Rehab in Newburgh, NY | Orange County Empire Plan Treatment',
    desc: 'NYSHIP-covered detox and rehab for Newburgh and Orange County employees. Confidential alcohol, opioid and dual-diagnosis treatment. Verify free — ' + PHONE + '.' },
  { id: 'p-saratoga', slug: 'nyship-rehab-saratoga-springs', title: 'NYSHIP Rehab in Saratoga Springs, NY | Empire Plan Addiction Treatment',
    desc: 'NYSHIP & Empire Plan addiction treatment for Saratoga County state employees. Confidential detox, rehab and dual-diagnosis care. Free benefits check — ' + PHONE + '.' },
  { id: 'p-kingston', slug: 'nyship-rehab-kingston', title: 'NYSHIP Rehab in Kingston, NY | Ulster County Empire Plan Treatment',
    desc: 'NYSHIP-covered detox and rehab for Kingston and Ulster County government workers. Confidential, job-protected addiction treatment. Call ' + PHONE + '.' },
  { id: 'p-plattsburgh', slug: 'nyship-rehab-plattsburgh', title: 'NYSHIP Rehab in Plattsburgh, NY | Clinton County Empire Plan Treatment',
    desc: 'NYSHIP & Empire Plan addiction treatment for Plattsburgh and North Country employees. Confidential detox and rehab. Free benefits verification — ' + PHONE + '.' },
  { id: 'p-watertown', slug: 'nyship-rehab-watertown', title: 'NYSHIP Rehab in Watertown, NY | Jefferson County Empire Plan Treatment',
    desc: 'NYSHIP-covered detox and rehab for Watertown and Jefferson County government employees. Confidential addiction treatment. Call ' + PHONE + '.' },
  { id: 'p-rome', slug: 'nyship-rehab-rome', title: 'NYSHIP Rehab in Rome, NY | Oneida County Empire Plan Treatment',
    desc: 'NYSHIP & Empire Plan addiction treatment for Rome and Mohawk Valley public employees. Confidential alcohol, opioid and cocaine care. Verify free — ' + PHONE + '.' },

  // ---- What we treat ----
  { id: 'p-alcohol', slug: 'alcohol-detox-treatment', title: 'Alcohol Detox & Rehab for NY State Employees | NYSHIP Covered',
    desc: 'Medically supervised alcohol detox and rehab covered by NYSHIP & the Empire Plan for NY State and government employees. Confidential, job-protected. Call ' + PHONE + '.' },
  { id: 'p-cocaine', slug: 'cocaine-addiction-treatment', title: 'Cocaine Addiction Treatment for NY State Employees | NYSHIP Covered',
    desc: 'Cocaine and stimulant addiction treatment covered by NYSHIP & Empire Plan for NY government employees. Confidential inpatient & outpatient care. Call ' + PHONE + '.' },
  { id: 'p-kratom', slug: 'kratom-addiction-treatment', title: 'Kratom Dependency Treatment | NYSHIP Behavioral Health Coverage',
    desc: 'Kratom dependency and withdrawal treatment covered under NYSHIP behavioral health benefits for NY State employees. Confidential, medically supervised. Call ' + PHONE + '.' },
  { id: 'p-painkillers', slug: 'prescription-painkiller-addiction-treatment', title: 'Prescription Painkiller Addiction Treatment | NYSHIP / Empire Plan',
    desc: 'Treatment for Percocet, Vicodin & OxyContin dependence covered by NYSHIP & Empire Plan for NY State employees. Confidential detox and rehab. Call ' + PHONE + '.' },
  { id: 'p-opioids', slug: 'opioid-addiction-treatment', title: 'Opioid Addiction Treatment for NY State Employees | NYSHIP Covered',
    desc: 'Opioid and heroin addiction treatment with MAT, covered by NYSHIP & the Empire Plan for NY government employees. Confidential, job-protected. Call ' + PHONE + '.' },
  { id: 'p-benzos', slug: 'benzodiazepine-detox-treatment', title: 'Benzodiazepine Detox | NYSHIP Covers Xanax, Klonopin & Valium Treatment',
    desc: 'Medically supervised benzodiazepine (Xanax, Klonopin, Valium) detox covered by NYSHIP & Empire Plan for NY State employees. Confidential care. Call ' + PHONE + '.' },
  { id: 'p-dual', slug: 'dual-diagnosis-treatment', title: 'Dual Diagnosis Treatment for NY State Employees | NYSHIP Covered',
    desc: 'Integrated treatment for addiction plus anxiety, depression or PTSD, covered by NYSHIP & Empire Plan for NY government employees. Confidential. Call ' + PHONE + '.' },
  { id: 'p-mat', slug: 'medication-assisted-treatment', title: 'Medication-Assisted Treatment (MAT) | NYSHIP / Empire Plan Coverage',
    desc: 'Suboxone, Vivitrol & methadone-based MAT covered by NYSHIP & the Empire Plan for NY State employees. Confidential, evidence-based care. Call ' + PHONE + '.' },

  // ---- Insurance ----
  { id: 'p-nyship', slug: 'does-nyship-cover-rehab', title: 'Does NYSHIP Cover Rehab? Complete Coverage Guide for NY State Employees',
    desc: 'Yes — NYSHIP covers detox, inpatient rehab, PHP, IOP and MAT for NY State and government employees. Learn what is covered, costs and how to verify. Call ' + PHONE + '.' },
  { id: 'p-empire', slug: 'empire-plan-rehab-coverage', title: 'Empire Plan Rehab Coverage | NY State Employee Addiction Treatment',
    desc: 'What the Empire Plan covers for addiction treatment — detox, inpatient, outpatient and MAT — for NY State employees. Copays, authorization and verification. Call ' + PHONE + '.' },
  { id: 'p-cdphp', slug: 'does-cdphp-cover-rehab', title: 'Does CDPHP Cover Rehab? Addiction Treatment for Capital Region Employees',
    desc: 'CDPHP NYSHIP HMO addiction treatment coverage for Capital Region NY State employees — detox, rehab and outpatient care explained. Free verification. Call ' + PHONE + '.' },
  { id: 'p-mvp', slug: 'does-mvp-cover-rehab', title: 'Does MVP Health Care Cover Rehab? NYSHIP Addiction Treatment',
    desc: 'MVP Health Care NYSHIP HMO addiction treatment coverage for NY State employees — detox, inpatient and outpatient rehab explained. Free benefits check. Call ' + PHONE + '.' },
  { id: 'p-emblem', slug: 'does-emblemhealth-cover-rehab', title: 'Does EmblemHealth Cover Rehab? NYSHIP Addiction Treatment Coverage',
    desc: 'EmblemHealth NYSHIP HMO addiction treatment coverage for NY State employees — detox, rehab and MAT explained. Confidential benefits verification. Call ' + PHONE + '.' },
  { id: 'p-excellus', slug: 'does-excellus-cover-rehab', title: 'Does Excellus BlueCross BlueShield Cover Rehab? NYSHIP Coverage',
    desc: 'Excellus BCBS NYSHIP HMO addiction treatment coverage for Western & Central NY State employees — detox and rehab explained. Free verification. Call ' + PHONE + '.' },

  // ---- Who we serve ----
  { id: 'p-state', slug: 'nys-agency-employee-rehab', title: 'Addiction Treatment for NY State Agency Employees | Empire Plan Covered',
    desc: 'Confidential, Empire Plan–covered addiction treatment for NY State agency employees. Job-protected under FMLA. Free, private benefits verification. Call ' + PHONE + '.' },
  { id: 'p-schools', slug: 'teacher-school-employee-rehab', title: 'Addiction Treatment for NY Teachers & School Staff | NYSHIP Covered',
    desc: 'Confidential NYSHIP-covered addiction treatment for NY public school teachers and staff. Job-protected, private benefits verification. Call ' + PHONE + '.' },
  { id: 'p-suny', slug: 'suny-cuny-employee-rehab', title: 'Addiction Treatment for SUNY & CUNY Employees | NYSHIP Empire Plan',
    desc: 'NYSHIP & Empire Plan addiction treatment for SUNY and CUNY faculty and staff. Confidential, job-protected detox and rehab. Free verification. Call ' + PHONE + '.' },
  { id: 'p-county', slug: 'county-city-employee-rehab', title: 'Addiction Treatment for NY County & City Government Employees | NYSHIP',
    desc: 'NYSHIP-covered addiction treatment for NY county and municipal government employees. Confidential, job-protected detox and rehab. Free verification. Call ' + PHONE + '.' },
  { id: 'p-fire', slug: 'firefighter-ems-rehab', title: 'Addiction Treatment for NY Firefighters & EMS | NYSHIP Covered, FMLA',
    desc: 'Confidential, FMLA-protected addiction treatment for NY firefighters and EMS workers, covered by NYSHIP. Alcohol, opioid and PTSD dual-diagnosis care. Call ' + PHONE + '.' },
  { id: 'p-doccs', slug: 'corrections-officer-rehab', title: 'Addiction Treatment for NY Corrections Officers | DOCCS Empire Plan',
    desc: 'Confidential, Empire Plan–covered addiction treatment for NY corrections officers (DOCCS). Job-protected detox, rehab and PTSD dual-diagnosis care. Call ' + PHONE + '.' },
  { id: 'p-retirees', slug: 'nyship-retiree-rehab', title: 'Addiction Treatment for NY State Retirees | NYSHIP Coverage Continues',
    desc: 'NYSHIP addiction treatment coverage continues into retirement. Confidential detox and rehab for NY State and government retirees. Free verification. Call ' + PHONE + '.' },
];

/* ---- E-E-A-T pages (authored content) --------------------------- */
const EEAT = require('./eeat-content.js');

/* ---- Build slug map (id -> path) -------------------------------- */
const slugMap = {};
PAGES.forEach(p => { slugMap[p.id] = p.slug === '' ? '/' : '/' + p.slug; });
EEAT.forEach(p => { slugMap[p.id] = '/' + p.slug; });

/* =================================================================== */
const raw = fs.readFileSync(SOURCE, 'utf8');
const $ = cheerio.load(raw, { decodeEntities: false });

/* Pull reusable head pieces */
const styleBlock = $('style').first().toString();          // <style>…</style>
const orgLd = $('script[type="application/ld+json"]').first().toString();

/* ---- Rewrite every goTo() link across the whole document -------- */
$('a[onclick]').each((_, el) => {
  const a = $(el);
  const onclick = a.attr('onclick') || '';
  const m = onclick.match(/goTo\(['"]([^'"]+)['"]\)/);
  if (m) {
    const target = slugMap[m[1]] || '/';
    a.attr('href', target);
    a.removeAttr('onclick');
  }
  // scrollSec(...) links are left intact (in-page smooth scroll)
});

/* ---- Add an "About / Our Team" dropdown for the E-E-A-T pages ---- */
const aboutLi =
  '<li>\n  <span>About <span class="arrow">&#9660;</span></span>\n  <div class="dropdown">\n' +
  EEAT.map(p => `    <a href="/${p.slug}">${p.navLabel}</a>\n`).join('') +
  '  </div>\n</li>\n';
$('.nav-menu li').first().before(aboutLi); // place "About" first
// mobile menu: append an About section
const aboutMob =
  '<div class="mob-section-title">About</div>\n' +
  EEAT.map(p => `<a href="/${p.slug}">${p.navLabel}</a>`).join('\n') + '\n';
$('#mobileMenu .mobile-cta').before(aboutMob);

/* ---- Extract shared chrome (now with rewritten links) ----------- */
const crisisBar = $('.crisis-bar').first().toString();
const navHTML = $('nav').first().toString();
const mobileMenu = $('#mobileMenu').toString();
const footerHTML = $('footer').first().toString();

/* ---- Static per-page script (replaces SPA router) --------------- */
function staticScript(currentId) {
  return `<script>
var NAV_MAP = ${JSON.stringify(slugMap)};
var currentPage = ${JSON.stringify(currentId)};
function goTo(pid){ window.location.href = NAV_MAP[pid] || '/'; }
function scrollSec(cls){
  var page = document.getElementById(currentPage) || document.body;
  var el = page.querySelector('#'+cls) || page.querySelector('.'+cls)
        || document.querySelector('.'+cls);
  if(el){ var top = el.getBoundingClientRect().top + window.pageYOffset - 80;
    window.scrollTo({top:top, behavior:'smooth'}); }
}
function closeMob(){
  var mm=document.getElementById('mobileMenu'), hb=document.getElementById('hamburger');
  if(mm) mm.classList.remove('open');
  if(hb){ hb.classList.remove('open'); hb.setAttribute('aria-expanded','false'); }
  document.body.style.overflow='';
}
function hSubmit(e){ e.preventDefault();
  var btn=e.target.querySelector('.submit-btn');
  if(btn){ btn.textContent='Submitted! We will call you within a few hours.';
    btn.style.background='var(--green)'; btn.disabled=true; } }
function handleSubmit(e){ hSubmit(e); }
function toggleFaq(){} function tFaq(){}
document.addEventListener('DOMContentLoaded', function(){
  var hb=document.getElementById('hamburger'), mm=document.getElementById('mobileMenu');
  if(hb&&mm){ hb.addEventListener('click', function(){
    var o=mm.classList.toggle('open'); hb.classList.toggle('open',o);
    hb.setAttribute('aria-expanded',String(o));
    document.body.style.overflow=o?'hidden':''; }); }
  window.addEventListener('resize', function(){ if(window.innerWidth>768) closeMob(); });
  document.addEventListener('click', function(e){
    var q=e.target.closest('.faq-q'); if(!q) return;
    var item=q.parentElement, isOpen=item.classList.contains('open');
    var page=item.closest('.spa-page')||document;
    var opens=page.querySelectorAll('.faq-item.open');
    for(var i=0;i<opens.length;i++) opens[i].classList.remove('open');
    if(!isOpen) item.classList.add('open');
  });
  document.addEventListener('submit', function(e){
    if(e.target.tagName==='FORM'){ e.preventDefault();
      var btn=e.target.querySelector('.submit-btn');
      if(btn){ btn.textContent='Submitted! We will call you within a few hours.';
        btn.style.background='var(--green)'; btn.disabled=true; } }
  });
});
</script>
<!-- Start of Tawk.to Script -->
<script type="text/javascript">
var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
(function(){
var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
s1.async=true;
s1.src='https://embed.tawk.to/6a1de5415ce10b1c305094a2/default';
s1.charset='UTF-8';
s1.setAttribute('crossorigin','*');
s0.parentNode.insertBefore(s1,s0);
})();
</script>
<!-- End of Tawk.to Script -->`;
}

/* ---- Per-page JSON-LD (WebPage + Breadcrumb) -------------------- */
function pageLd(meta, url) {
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    name: meta.title,
    description: meta.desc,
    url: url,
    inLanguage: 'en-US',
    isPartOf: { '@type': 'WebSite', name: 'Addiction Rehab Center', url: ORIGIN + '/' },
    publisher: { '@type': 'Organization', name: 'Addiction Rehab Center', url: ORIGIN + '/' },
    audience: { '@type': 'Audience', audienceType: 'NY State & government employees with NYSHIP / Empire Plan coverage' }
  };
  return '<script type="application/ld+json">\n' + JSON.stringify(ld, null, 2) + '\n</script>';
}

/* ---- Full-page renderer ----------------------------------------- */
function renderPage(meta, innerHTML, currentId) {
  const url = meta.slug === '' ? ORIGIN + '/' : ORIGIN + '/' + meta.slug;
  const ogImg = ORIGIN + '/logo.png';
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<meta name="google-site-verification" content="qZbu_Qsif1jDyAgSy0oFs1TDKkePCp5eoQiOBupLWXs" />
<title>${meta.title}</title>
<meta name="description" content="${meta.desc}"/>
<meta name="robots" content="index,follow,max-snippet:-1,max-image-preview:large"/>
<link rel="canonical" href="${url}"/>
<meta property="og:type" content="website"/>
<meta property="og:url" content="${url}"/>
<meta property="og:title" content="${meta.title}"/>
<meta property="og:description" content="${meta.desc}"/>
<meta property="og:site_name" content="Addiction Rehab Center"/>
<meta property="og:locale" content="en_US"/>
<meta property="og:image" content="${ogImg}"/>
<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:title" content="${meta.title}"/>
<meta name="twitter:description" content="${meta.desc}"/>
${orgLd}
${pageLd(meta, url)}
${styleBlock}
</head>
<body>
${crisisBar}
${navHTML}
${mobileMenu}
<div id="spa-container">
<div class="spa-page" id="${currentId}" style="display:block">
${innerHTML}
</div>
</div>
${footerHTML}
${staticScript(currentId)}
</body>
</html>
`;
}

/* ---- Generate the 37 split pages -------------------------------- */
let count = 0;
PAGES.forEach(meta => {
  const node = $('#' + meta.id);
  if (!node.length) { console.warn('!! missing page', meta.id); return; }
  const inner = node.html();
  const html = renderPage(meta, inner, meta.id);
  const file = meta.slug === '' ? 'index.html' : meta.slug + '.html';
  fs.writeFileSync(path.join(OUT, file), html);
  count++;
});

/* ---- Generate E-E-A-T pages ------------------------------------- */
EEAT.forEach(meta => {
  const html = renderPage(meta, meta.html, meta.id);
  fs.writeFileSync(path.join(OUT, meta.slug + '.html'), html);
  count++;
});

/* ---- Generate sitemap.xml --------------------------------------- */
const today = process.env.BUILD_DATE || '2026-06-03';
const urls = [];
PAGES.forEach(p => {
  const loc = p.slug === '' ? ORIGIN + '/' : ORIGIN + '/' + p.slug;
  const pr = p.slug === '' ? '1.0' : '0.8';
  urls.push({ loc, pr });
});
EEAT.forEach(p => urls.push({ loc: ORIGIN + '/' + p.slug, pr: '0.5' }));
const sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  urls.map(u =>
    `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${today}</lastmod>\n` +
    `    <changefreq>weekly</changefreq>\n    <priority>${u.pr}</priority>\n  </url>`
  ).join('\n') + '\n</urlset>\n';
fs.writeFileSync(path.join(OUT, 'sitemap.xml'), sitemap);

console.log(`✓ Generated ${count} pages + sitemap.xml (${urls.length} URLs)`);
