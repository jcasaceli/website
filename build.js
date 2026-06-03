/* ===================================================================
   build.js — Static site generator for nyshipdetox.com
   -------------------------------------------------------------------
   Splits the single-file SPA (addiction-rehab-center.html) into one
   real, indexable HTML page per section, and also generates:
     • authored E-E-A-T pages           (eeat-content.js)
     • coverage / city / guide pages    (content/*.json)
     • a guides hub                     (/nyship-rehab-guides)
     • sitemap.xml
   Each page gets its own URL, <title>, meta description, canonical,
   Organization + WebPage (+ FAQPage where applicable) JSON-LD.

   Run:  node build.js
   =================================================================== */

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const ORIGIN = 'https://nyshipdetox.com';
const PHONE = '213-321-6518';
const TEL = '2133216518';
const SOURCE = path.join(__dirname, 'addiction-rehab-center.html');
const OUT = __dirname;

/* ---- Per-page SEO metadata for the SPA split -------------------- */
const PAGES = [
  { id: 'p-home', slug: '', title: 'NYSHIP & Empire Plan Drug Rehab | Alcohol & Drug Detox NY | Addiction Rehab Center',
    desc: 'NY State employees: your NYSHIP / Empire Plan covers alcohol detox, cocaine, kratom, opioid and painkiller addiction treatment across New York. Free, confidential benefits check — call ' + PHONE + '.' },

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

/* ---- E-E-A-T pages (authored) ----------------------------------- */
const EEAT = require('./eeat-content.js');

/* ---- Content pages (coverage / city / guides) from content/*.json */
const CONTENT = [];
const contentDir = path.join(__dirname, 'content');
if (fs.existsSync(contentDir)) {
  fs.readdirSync(contentDir).filter(f => f.endsWith('.json')).sort().forEach(f => {
    try {
      const arr = JSON.parse(fs.readFileSync(path.join(contentDir, f), 'utf8'));
      arr.forEach(p => { p.id = p.id || ('c-' + p.slug); CONTENT.push(p); });
    } catch (e) { console.warn('!! could not parse', f, '-', e.message); }
  });
}
const COVERAGE = CONTENT.filter(p => p.category === 'coverage');
const CITIES   = CONTENT.filter(p => p.category === 'location');
const ARTICLES = CONTENT.filter(p => p.category === 'article');
const GUIDES_HUB = { id: 'p-guides', slug: 'nyship-rehab-guides', navLabel: 'Guides',
  title: 'NYSHIP Rehab Guides & Resources | Addiction Treatment for NY Employees',
  desc: 'In-depth guides on NYSHIP and Empire Plan addiction-treatment coverage, costs, job protection, and how to choose care for NY State and government employees.' };

/* ---- Slug map (id -> path) -------------------------------------- */
const slugMap = {};
PAGES.forEach(p => { slugMap[p.id] = p.slug === '' ? '/' : '/' + p.slug; });
EEAT.forEach(p => { slugMap[p.id] = '/' + p.slug; });
CONTENT.forEach(p => { slugMap[p.id] = '/' + p.slug; });
if (ARTICLES.length) slugMap[GUIDES_HUB.id] = '/' + GUIDES_HUB.slug;

/* =================================================================== */
const raw = fs.readFileSync(SOURCE, 'utf8');
const $ = cheerio.load(raw, { decodeEntities: false });
const styleBlock = $('style').first().toString();

/* ---- Enhanced Organization / MedicalBusiness schema ------------- */
const ORG_LD = '<script type="application/ld+json">\n' + JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'MedicalBusiness',
  '@id': ORIGIN + '/#organization',
  name: 'Addiction Rehab Center',
  url: ORIGIN + '/',
  telephone: '+1' + TEL,
  medicalSpecialty: 'Addiction Medicine',
  description: 'NYSHIP and Empire Plan addiction treatment — detox, rehab and outpatient care for New York State and government employees.',
  areaServed: { '@type': 'State', name: 'New York' },
  availableService: ['Medical Detox', 'Residential Treatment', 'Partial Hospitalization', 'Intensive Outpatient', 'Medication-Assisted Treatment', 'Dual Diagnosis Treatment']
    .map(s => ({ '@type': 'MedicalProcedure', name: s })),
  contactPoint: [{ '@type': 'ContactPoint', telephone: '+1' + TEL, contactType: 'admissions', areaServed: 'US', availableLanguage: 'English' }]
}, null, 2) + '\n</script>';

/* ---- Rewrite every goTo() link to a real href ------------------- */
$('a[onclick]').each((_, el) => {
  const a = $(el), onclick = a.attr('onclick') || '';
  const m = onclick.match(/goTo\(['"]([^'"]+)['"]\)/);
  if (m) { a.attr('href', slugMap[m[1]] || '/'); a.removeAttr('onclick'); }
});

/* ---- Inject new nav menus (Coverage, Guides, Downstate cities) --- */
const navMenu = $('.nav-menu').first();
if (COVERAGE.length) {
  const links = COVERAGE.map(p => `      <a href="/${p.slug}">${p.navLabel || p.title}</a>`).join('\n');
  navMenu.children('li').first().after(
    `<li>\n  <span>Coverage <span class="arrow">&#9660;</span></span>\n  <div class="dropdown">\n${links}\n  </div>\n</li>`);
}
if (CITIES.length) {
  const col = `<div class="dropdown-col">\n  <div class="dropdown-col-title">Downstate &amp; NYC</div>\n` +
    CITIES.map(p => `  <a href="/${p.slug}">${p.navLabel || p.title}</a>`).join('\n') + `\n</div>`;
  const locWide = navMenu.find('li').filter((_, li) => $(li).find('span').first().text().trim().startsWith('Locations')).find('.dropdown.wide');
  if (locWide.length) locWide.append(col);
}
if (ARTICLES.length) {
  navMenu.find('li').last().before(`<li><a href="/${GUIDES_HUB.slug}">Guides</a></li>`);
}

/* ---- Mobile menu: append new sections --------------------------- */
const mob = $('#mobileMenu');
function mobSection(title, items) {
  return `<div class="mob-section-title">${title}</div>\n` +
    items.map(p => `<a href="/${p.slug}">${p.navLabel || p.title}</a>`).join('\n') + '\n';
}
const mobCta = mob.find('.mobile-cta');
if (ARTICLES.length) mobCta.before(`<div class="mob-section-title">Guides</div>\n<a href="/${GUIDES_HUB.slug}">All NYSHIP Rehab Guides</a>\n`);
if (CITIES.length) mobCta.before(mobSection('Downstate &amp; NYC', CITIES));
if (COVERAGE.length) mobCta.before(mobSection('Coverage', COVERAGE));

/* ---- Extract shared chrome (links now rewritten) ---------------- */
const crisisBar = $('.crisis-bar').first().toString();
const navHTML = $('nav').first().toString();
const mobileMenu = $('#mobileMenu').toString();
const footerHTML = $('footer').first().toString();

/* ---- Static per-page script ------------------------------------- */
function staticScript(currentId) {
  return `<script>
var NAV_MAP = ${JSON.stringify(slugMap)};
var currentPage = ${JSON.stringify(currentId)};
function goTo(pid){ window.location.href = NAV_MAP[pid] || '/'; }
function scrollSec(cls){
  var page = document.getElementById(currentPage) || document.body;
  var el = page.querySelector('#'+cls) || page.querySelector('.'+cls) || document.querySelector('.'+cls);
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

/* ---- Schema helpers --------------------------------------------- */
function esc(s){ return String(s)
  .replace(/&(?!(amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);)/g,'&amp;')
  .replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function stripTags(s){ return String(s).replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim(); }

function pageLd(meta, url) {
  return '<script type="application/ld+json">\n' + JSON.stringify({
    '@context': 'https://schema.org', '@type': 'MedicalWebPage',
    name: meta.title, description: meta.desc, url, inLanguage: 'en-US',
    isPartOf: { '@type': 'WebSite', name: 'Addiction Rehab Center', url: ORIGIN + '/' },
    about: { '@type': 'MedicalCondition', name: 'Substance Use Disorder' },
    publisher: { '@id': ORIGIN + '/#organization' },
    lastReviewed: '2026-06-03',
    reviewedBy: { '@type': 'Person', name: 'Bradley Tourtlotte, MD', url: ORIGIN + '/medical-director' }
  }, null, 2) + '\n</script>';
}
function faqLd(faq) {
  if (!faq || !faq.length) return '';
  return '<script type="application/ld+json">\n' + JSON.stringify({
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: faq.map(f => ({ '@type': 'Question', name: stripTags(f.q),
      acceptedAnswer: { '@type': 'Answer', text: stripTags(f.a) } }))
  }, null, 2) + '\n</script>';
}

/* ---- Reusable HTML blocks --------------------------------------- */
const reviewByline =
  `<p class="review-byline" style="color:var(--muted);font-size:.9rem;border-left:3px solid var(--blue);padding-left:.8rem;margin:.2rem 0 1.5rem">` +
  `Medically reviewed by <a href="/medical-director" style="color:var(--blue);font-weight:600">Bradley Tourtlotte, MD</a> · ` +
  `Written by the <a href="/clinical-team" style="color:var(--blue);font-weight:600">Addiction Rehab Center clinical team</a> · Last reviewed June 2026</p>`;

const contentCta = `
<section class="verify-section" id="verify-section" style="background:var(--sky)">
  <div class="container" style="text-align:center">
    <div class="section-label">Free &amp; Confidential</div>
    <h2>Verify Your NYSHIP Benefits — No Cost, No Obligation</h2>
    <p class="section-sub" style="margin:0 auto 2rem">We confirm your exact NYSHIP / Empire Plan coverage and report back, usually within a few hours. HIPAA &amp; 42 CFR Part 2 protected.</p>
    <a href="tel:${TEL}" class="btn-primary">Call ${PHONE}</a>
  </div>
</section>`;

function faqSection(faq) {
  if (!faq || !faq.length) return '';
  const items = faq.map(f =>
    `      <div class="faq-item">\n        <div class="faq-q" aria-expanded="false">${f.q} <span class="faq-arrow">▾</span></div>\n        <div class="faq-a">${f.a}</div>\n      </div>`
  ).join('\n');
  return `\n<section class="faq-bg" id="faq-section">\n  <div class="container">\n    <div class="section-label">Frequently Asked Questions</div>\n    <h2>Frequently Asked Questions</h2>\n    <div class="faq-list">\n${items}\n    </div>\n  </div>\n</section>`;
}

/* ---- Full-page renderer ----------------------------------------- */
function renderPage(meta, innerHTML, currentId, extraSchema) {
  const url = meta.slug === '' ? ORIGIN + '/' : ORIGIN + '/' + meta.slug;
  const schemas = [ORG_LD, pageLd(meta, url)].concat(extraSchema || []).filter(Boolean).join('\n');
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<meta name="google-site-verification" content="qZbu_Qsif1jDyAgSy0oFs1TDKkePCp5eoQiOBupLWXs" />
<title>${esc(meta.title)}</title>
<meta name="description" content="${esc(meta.desc)}"/>
<meta name="robots" content="index,follow,max-snippet:-1,max-image-preview:large"/>
<link rel="canonical" href="${url}"/>
<meta property="og:type" content="website"/>
<meta property="og:url" content="${url}"/>
<meta property="og:title" content="${esc(meta.title)}"/>
<meta property="og:description" content="${esc(meta.desc)}"/>
<meta property="og:site_name" content="Addiction Rehab Center"/>
<meta property="og:locale" content="en_US"/>
<meta property="og:image" content="${ORIGIN}/logo.png"/>
<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:title" content="${esc(meta.title)}"/>
<meta name="twitter:description" content="${esc(meta.desc)}"/>
${schemas}
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

/* =================================================================== */
let count = 0;
function write(file, html){ fs.writeFileSync(path.join(OUT, file), html); count++; }

/* ---- SPA split pages -------------------------------------------- */
PAGES.forEach(meta => {
  const node = $('#' + meta.id);
  if (!node.length) { console.warn('!! missing page', meta.id); return; }
  const html = renderPage(meta, node.html(), meta.id);
  write(meta.slug === '' ? 'index.html' : meta.slug + '.html', html);
});

/* ---- E-E-A-T pages ---------------------------------------------- */
EEAT.forEach(meta => write(meta.slug + '.html', renderPage(meta, meta.html, meta.id)));

/* ---- Content pages (coverage / city / article) ------------------ */
CONTENT.forEach(meta => {
  const isArticle = meta.category === 'article' || meta.category === 'coverage';
  const inner =
    `<section>\n  <div class="container">\n` +
    (meta.eyebrow ? `    <div class="section-label">${meta.eyebrow}</div>\n` : '') +
    `    <h1>${meta.h1 || meta.title}</h1>\n` +
    (isArticle ? '    ' + reviewByline + '\n' : '') +
    `  </div>\n</section>\n` +
    `<section style="padding-top:0">\n  <div class="container">\n${meta.bodyHtml}\n  </div>\n</section>` +
    faqSection(meta.faq) + contentCta;
  write(meta.slug + '.html', renderPage(meta, inner, meta.id, [faqLd(meta.faq)]));
});

/* ---- Guides hub page -------------------------------------------- */
if (ARTICLES.length) {
  const cards = ARTICLES.map(p =>
    `      <a class="card" href="/${p.slug}" style="display:block">\n        <h3 style="color:var(--blue)">${p.navLabel || p.h1 || p.title}</h3>\n        <p style="color:var(--muted);font-size:.92rem">${esc(p.desc)}</p>\n      </a>`
  ).join('\n');
  const inner =
    `<section>\n  <div class="container">\n    <div class="section-label">Resources</div>\n    <h1>NYSHIP Rehab Guides &amp; Resources</h1>\n` +
    `    <p class="section-sub">In-depth, plain-language guides to NYSHIP and Empire Plan addiction-treatment coverage for New York State and government employees.</p>\n` +
    `    <div class="card-grid-4">\n${cards}\n    </div>\n  </div>\n</section>` + contentCta;
  write(GUIDES_HUB.slug + '.html', renderPage(GUIDES_HUB, inner, GUIDES_HUB.id));
}

/* ---- sitemap.xml ------------------------------------------------- */
const today = process.env.BUILD_DATE || '2026-06-03';
const urls = [];
PAGES.forEach(p => urls.push({ loc: p.slug === '' ? ORIGIN + '/' : ORIGIN + '/' + p.slug, pr: p.slug === '' ? '1.0' : '0.8' }));
COVERAGE.forEach(p => urls.push({ loc: ORIGIN + '/' + p.slug, pr: '0.8' }));
CITIES.forEach(p => urls.push({ loc: ORIGIN + '/' + p.slug, pr: '0.8' }));
if (ARTICLES.length) urls.push({ loc: ORIGIN + '/' + GUIDES_HUB.slug, pr: '0.7' });
ARTICLES.forEach(p => urls.push({ loc: ORIGIN + '/' + p.slug, pr: '0.6' }));
EEAT.forEach(p => urls.push({ loc: ORIGIN + '/' + p.slug, pr: '0.5' }));
const sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  urls.map(u => `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>${u.pr}</priority>\n  </url>`).join('\n') +
  '\n</urlset>\n';
fs.writeFileSync(path.join(OUT, 'sitemap.xml'), sitemap);

console.log(`✓ Generated ${count} pages + sitemap.xml (${urls.length} URLs)`);
console.log(`  SPA:${PAGES.length}  EEAT:${EEAT.length}  coverage:${COVERAGE.length}  cities:${CITIES.length}  articles:${ARTICLES.length}`);
