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
const PHONE = '631-800-4691';
const TEL = '6318004691';
const SOURCE = path.join(__dirname, 'addiction-rehab-center.html');
const OUT = __dirname;

/* ---- Per-page SEO metadata for the SPA split -------------------- */
const PAGES = [
  { id: 'p-home', slug: '', title: 'NYSHIP Rehab in New York | Empire Plan Alcohol & Drug Detox',
    desc: 'NYSHIP and Empire Plan rehab for NY State employees: alcohol and drug detox, rehab and outpatient care. Free, confidential benefits check: ' + PHONE + '.' },

  { id: 'p-albany', slug: 'nyship-rehab-albany', title: 'NYSHIP Rehab in Albany, NY | Empire Plan Detox & Addiction Treatment',
    desc: 'NYSHIP & Empire Plan addiction treatment for Albany & Capital Region state employees — alcohol detox, opioid, cocaine & dual-diagnosis care. Confidential. Call ' + PHONE + '.' },
  { id: 'p-buffalo', slug: 'nyship-rehab-buffalo', title: 'NYSHIP Rehab in Buffalo, NY | Empire Plan Detox &amp; Treatment',
    desc: 'NYSHIP-covered detox and rehab for Buffalo and Erie County employees. Alcohol, opioid, cocaine and kratom treatment. Call ' + PHONE + ' to verify.' },
  { id: 'p-syracuse', slug: 'nyship-rehab-syracuse', title: 'NYSHIP Rehab in Syracuse, NY | Empire Plan Detox &amp; Treatment',
    desc: 'NYSHIP and Empire Plan addiction treatment for Syracuse-area public employees. Confidential detox, inpatient and outpatient rehab. Call ' + PHONE + '.' },
  { id: 'p-rochester', slug: 'nyship-rehab-rochester', title: 'NYSHIP Rehab in Rochester, NY | Empire Plan Treatment',
    desc: 'NYSHIP-covered detox and rehab for Rochester and Monroe County public employees. Confidential alcohol, opioid and cocaine treatment. Call ' + PHONE + '.' },
  { id: 'p-poughkeepsie', slug: 'nyship-rehab-poughkeepsie', title: 'NYSHIP Rehab in Poughkeepsie, NY | Empire Plan Treatment',
    desc: 'NYSHIP and Empire Plan addiction treatment for Poughkeepsie and Dutchess County employees. Detox, rehab and dual-diagnosis care. Call ' + PHONE + '.' },
  { id: 'p-binghamton', slug: 'nyship-rehab-binghamton', title: 'NYSHIP Rehab in Binghamton, NY | Empire Plan Treatment',
    desc: 'NYSHIP-covered detox and rehab for Binghamton and Broome County government workers. Confidential alcohol, opioid and cocaine treatment. Call ' + PHONE + '.' },
  { id: 'p-schenectady', slug: 'nyship-rehab-schenectady', title: 'NYSHIP Rehab in Schenectady, NY | Empire Plan Treatment',
    desc: 'NYSHIP and Empire Plan addiction treatment for Schenectady County employees. Detox, residential and outpatient rehab, confidential. Call ' + PHONE + '.' },
  { id: 'p-troy', slug: 'nyship-rehab-troy', title: 'NYSHIP Rehab in Troy, NY | Empire Plan Detox &amp; Treatment',
    desc: 'NYSHIP-covered detox and addiction treatment for Troy and Rensselaer County employees. Confidential, job-protected care. Call ' + PHONE + ' to verify.' },
  { id: 'p-utica', slug: 'nyship-rehab-utica', title: 'NYSHIP Rehab in Utica, NY | Empire Plan Detox &amp; Treatment',
    desc: 'NYSHIP & Empire Plan addiction treatment for Utica and Oneida County government employees. Alcohol, opioid and cocaine detox & rehab. Call ' + PHONE + '.' },
  { id: 'p-newburgh', slug: 'nyship-rehab-newburgh', title: 'NYSHIP Rehab in Newburgh, NY | Empire Plan Detox & Treatment',
    desc: 'NYSHIP-covered detox and rehab for Newburgh and Orange County employees. Confidential alcohol, opioid and dual-diagnosis treatment. Call ' + PHONE + '.' },
  { id: 'p-saratoga', slug: 'nyship-rehab-saratoga-springs', title: 'NYSHIP Rehab in Saratoga Springs, NY | Empire Plan Treatment',
    desc: 'NYSHIP and Empire Plan addiction treatment for Saratoga County state employees. Confidential detox, rehab and dual-diagnosis care. Call ' + PHONE + '.' },
  { id: 'p-kingston', slug: 'nyship-rehab-kingston', title: 'NYSHIP Rehab in Kingston, NY | Empire Plan Treatment',
    desc: 'NYSHIP-covered detox and rehab for Kingston and Ulster County government workers. Confidential, job-protected addiction treatment. Call ' + PHONE + '.' },
  { id: 'p-plattsburgh', slug: 'nyship-rehab-plattsburgh', title: 'NYSHIP Rehab in Plattsburgh, NY | Empire Plan Treatment',
    desc: 'NYSHIP and Empire Plan addiction treatment for Plattsburgh and North Country employees. Confidential detox and rehab. Call ' + PHONE + ' to verify.' },
  { id: 'p-watertown', slug: 'nyship-rehab-watertown', title: 'NYSHIP Rehab in Watertown, NY | Empire Plan Treatment',
    desc: 'NYSHIP-covered detox and rehab for Watertown and Jefferson County government employees. Confidential addiction treatment. Call ' + PHONE + '.' },
  { id: 'p-rome', slug: 'nyship-rehab-rome', title: 'NYSHIP Rehab in Rome, NY | Empire Plan Detox &amp; Treatment',
    desc: 'NYSHIP and Empire Plan addiction treatment for Rome and Mohawk Valley public employees. Confidential alcohol, opioid and cocaine care. Call ' + PHONE + '.' },

  { id: 'p-alcohol', slug: 'alcohol-detox-treatment', title: 'NYSHIP Alcohol Detox | Empire Plan Rehab for NY Employees',
    desc: 'Medically supervised alcohol detox and rehab covered by NYSHIP and the Empire Plan for NY State employees. Confidential care. Call ' + PHONE + ' to verify.' },
  { id: 'p-cocaine', slug: 'cocaine-addiction-treatment', title: 'Cocaine Addiction Treatment | NYSHIP &amp; Empire Plan Covered',
    desc: 'Cocaine addiction treatment covered by NYSHIP and the Empire Plan for NY employees. Confidential inpatient and outpatient care. Call ' + PHONE + '.' },
  { id: 'p-kratom', slug: 'kratom-addiction-treatment', title: 'Kratom Addiction Treatment | NYSHIP &amp; Empire Plan Coverage',
    desc: 'Kratom dependency and withdrawal treatment covered under NYSHIP behavioral health benefits for NY State employees. Confidential care. Call ' + PHONE + '.' },
  { id: 'p-painkillers', slug: 'prescription-painkiller-addiction-treatment', title: 'Prescription Painkiller Rehab | NYSHIP &amp; Empire Plan Covered',
    desc: 'Percocet, Vicodin and OxyContin dependence treatment covered by NYSHIP and the Empire Plan for NY State employees. Confidential care. Call ' + PHONE + '.' },
  { id: 'p-opioids', slug: 'opioid-addiction-treatment', title: 'NYSHIP Opioid Addiction Treatment | Empire Plan MAT &amp; Detox',
    desc: 'Opioid and heroin addiction treatment with MAT, covered by NYSHIP and the Empire Plan for NY employees. Confidential, job-protected. Call ' + PHONE + '.' },
  { id: 'p-benzos', slug: 'benzodiazepine-detox-treatment', title: 'Benzodiazepine Detox | NYSHIP & Empire Plan Covered Care',
    desc: 'Medically supervised benzodiazepine detox (Xanax, Klonopin, Valium) covered by NYSHIP and the Empire Plan for NY State employees. Call ' + PHONE + '.' },
  { id: 'p-dual', slug: 'dual-diagnosis-treatment', title: 'NYSHIP Dual Diagnosis Treatment | Empire Plan Covered Care',
    desc: 'Integrated treatment for addiction plus anxiety, depression or PTSD, covered by NYSHIP and the Empire Plan for NY government employees. Call ' + PHONE + '.' },
  { id: 'p-mat', slug: 'medication-assisted-treatment', title: 'Medication-Assisted Treatment (MAT) | NYSHIP &amp; Empire Plan',
    desc: 'Suboxone, Vivitrol & methadone-based MAT covered by NYSHIP & the Empire Plan for NY State employees. Confidential, evidence-based care. Call ' + PHONE + '.' },

  { id: 'p-nyship', slug: 'does-nyship-cover-rehab', title: 'Does NYSHIP Cover Rehab? | Empire Plan Coverage Explained',
    desc: 'Yes. NYSHIP and the Empire Plan cover detox, inpatient rehab, PHP, IOP and MAT for NY State employees. See what is covered and costs. Call ' + PHONE + '.' },
  { id: 'p-empire', slug: 'empire-plan-rehab-coverage', title: 'Empire Plan Rehab Coverage | NYSHIP Addiction Treatment NY',
    desc: 'Empire Plan rehab coverage: detox, inpatient, outpatient and MAT for NY State employees, plus copays and prior authorization. Call ' + PHONE + ' to verify.' },
  { id: 'p-cdphp', slug: 'does-cdphp-cover-rehab', title: 'Does CDPHP Cover Rehab? NYSHIP HMO Addiction Treatment Guide',
    desc: 'CDPHP NYSHIP HMO addiction treatment coverage for Capital Region NY State employees: detox, rehab and outpatient care explained. Call ' + PHONE + '.' },
  { id: 'p-mvp', slug: 'does-mvp-cover-rehab', title: 'Does MVP Health Care Cover Rehab? NYSHIP Addiction Treatment',
    desc: 'MVP Health Care NYSHIP HMO addiction treatment coverage for NY State employees: detox, inpatient and outpatient rehab explained. Call ' + PHONE + '.' },
  { id: 'p-emblem', slug: 'does-emblemhealth-cover-rehab', title: 'Does EmblemHealth (GHI) Cover Rehab? NYSHIP Coverage Guide',
    desc: 'EmblemHealth NYSHIP HMO addiction treatment coverage for NY State employees: detox, rehab and MAT explained. Confidential benefits check: ' + PHONE + '.' },
  { id: 'p-excellus', slug: 'does-excellus-cover-rehab', title: 'Does Excellus BCBS Cover Rehab? NYSHIP HMO Coverage Guide',
    desc: 'Excellus BCBS NYSHIP HMO addiction treatment coverage for Western and Central NY State employees: detox and rehab explained. Call ' + PHONE + ' to verify.' },

  { id: 'p-state', slug: 'nys-agency-employee-rehab', title: 'NYSHIP Rehab for NY State Agency Employees | Empire Plan',
    desc: 'Confidential NYSHIP and Empire Plan addiction treatment for NY State agency employees: detox, rehab, PHP and IOP. FMLA job protection. Call ' + PHONE + '.' },
  { id: 'p-schools', slug: 'teacher-school-employee-rehab', title: 'NYSHIP Rehab for NY Teachers & School Staff | Empire Plan',
    desc: 'Confidential NYSHIP-covered addiction treatment for NY public school teachers and staff. Job-protected, private benefits verification. Call ' + PHONE + '.' },
  { id: 'p-suny', slug: 'suny-cuny-employee-rehab', title: 'NYSHIP Rehab for SUNY & CUNY Employees | Empire Plan Covered',
    desc: 'NYSHIP and Empire Plan addiction treatment for SUNY and CUNY faculty and staff. Confidential, job-protected detox and rehab. Call ' + PHONE + ' to verify.' },
  { id: 'p-county', slug: 'county-city-employee-rehab', title: 'NYSHIP Rehab for County & City Employees in NY | Empire Plan',
    desc: 'NYSHIP-covered addiction treatment for NY county and municipal government employees. Confidential, job-protected detox and rehab. Call ' + PHONE + '.' },
  { id: 'p-fire', slug: 'firefighter-ems-rehab', title: 'NYSHIP Rehab for NY Firefighters & EMS | Empire Plan Covered',
    desc: 'Confidential, FMLA-protected addiction treatment for NY firefighters and EMS covered by NYSHIP. Alcohol, opioid and dual-diagnosis care. Call ' + PHONE + '.' },
  { id: 'p-doccs', slug: 'corrections-officer-rehab', title: 'Rehab for NY Corrections Officers | NYSHIP &amp; Empire Plan',
    desc: 'Confidential Empire Plan-covered addiction treatment for NY corrections officers (DOCCS). Detox, rehab and PTSD dual-diagnosis care. Call ' + PHONE + '.' },
  { id: 'p-retirees', slug: 'nyship-retiree-rehab', title: 'NYSHIP Rehab for NY State Retirees | Empire Plan Coverage',
    desc: 'NYSHIP addiction treatment coverage continues into retirement. Confidential detox and rehab for NY State and government retirees. Call ' + PHONE + '.' },
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
const BLOG = CONTENT.filter(p => p.category === 'blog');
const BLOG_HUB = { id: 'p-blog', slug: 'blog', navLabel: 'Blog',
  title: 'NYSHIP Addiction & Recovery Blog | Empire Plan Rehab',
  desc: 'Expert, sourced articles on addiction, recovery and NYSHIP / Empire Plan coverage for NY State employees — citing NIDA, SAMHSA and other authorities.' };
const GUIDES_HUB = { id: 'p-guides', slug: 'nyship-rehab-guides', navLabel: 'Guides',
  title: 'NYSHIP Rehab Guides & Resources | Empire Plan Coverage Help',
  desc: 'In-depth guides on NYSHIP and Empire Plan addiction-treatment coverage, costs, job protection and choosing care for NY State and government employees.' };
const SITEMAP_PAGE = { id: 'p-sitemap', slug: 'site-map',
  title: 'Site Map — All Pages | NYSHIP & Empire Plan Rehab',
  desc: 'Browse every page on nyshipdetox.com — NYSHIP and Empire Plan rehab coverage, locations, treatments and guides for NY State and government employees.' };

/* ---- Slug map (id -> path) -------------------------------------- */
const slugMap = {};
PAGES.forEach(p => { slugMap[p.id] = p.slug === '' ? '/' : '/' + p.slug; });
EEAT.forEach(p => { slugMap[p.id] = '/' + p.slug; });
CONTENT.forEach(p => { slugMap[p.id] = '/' + p.slug; });
if (ARTICLES.length) slugMap[GUIDES_HUB.id] = '/' + GUIDES_HUB.slug;
slugMap[SITEMAP_PAGE.id] = '/' + SITEMAP_PAGE.slug;

/* =================================================================== */
const raw = fs.readFileSync(SOURCE, 'utf8');
const $ = cheerio.load(raw, { decodeEntities: false });
const styleBlock = $('style').first().toString();

/* ---- Enhanced Organization / MedicalBusiness schema ------------- */
const ORG_LD = '<script type="application/ld+json">\n' + JSON.stringify({
  '@context': 'https://schema.org',
  '@type': ['MedicalBusiness', 'MedicalOrganization'],
  '@id': ORIGIN + '/#organization',
  name: 'Addiction Rehab Center',
  url: ORIGIN + '/',
  telephone: '+1' + TEL,
  // schema.org expects a MedicalSpecialty enumeration member, not free text
  // ("Addiction Medicine" failed validation on every page). Addiction medicine
  // sits under Psychiatric in the schema.org vocabulary.
  medicalSpecialty: 'https://schema.org/Psychiatric',
  logo: ORIGIN + '/favicon-256.png',
  image: ORIGIN + '/og-image.png',
  description: 'NYSHIP and Empire Plan addiction treatment — detox, rehab and outpatient care for New York State and government employees.',
  areaServed: { '@type': 'State', name: 'New York' },
  availableService: ['Medical Detox', 'Residential Treatment', 'Partial Hospitalization', 'Intensive Outpatient', 'Medication-Assisted Treatment', 'Dual Diagnosis Treatment']
    .map(s => ({ '@type': 'MedicalProcedure', name: s })),
  contactPoint: [{ '@type': 'ContactPoint', telephone: '+1' + TEL, contactType: 'admissions', areaServed: 'US', availableLanguage: 'English' }]
}, null, 2) + '\n</script>';

/* ---- Reviewer / physician entity (referenced by @id everywhere) - */
const REVIEWER_ID = ORIGIN + '/#dr-tourtlotte';
const REVIEWER_LD = '<script type="application/ld+json">\n' + JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'Person',
  '@id': REVIEWER_ID,
  name: 'Bradley Tourtlotte, MD',
  honorificSuffix: 'MD',
  jobTitle: 'Medical Director',
  url: ORIGIN + '/medical-director',
  alumniOf: { '@type': 'CollegeOrUniversity', name: 'Eastern Virginia Medical School' },
  identifier: { '@type': 'PropertyValue', propertyID: 'NPI', value: '1902955859' },
  worksFor: { '@id': ORIGIN + '/#organization' }
}, null, 2) + '\n</script>';

// Visible E-E-A-T byline — the single biggest lever for getting YMYL addiction
// pages indexed. Surfaces the medical reviewer + a fresh "last updated" date on
// every content page (rebuilt weekly, so the date stays current).
const UPDATED = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
const REVIEW_BYLINE = `<div class="review-byline" style="font-size:.85rem;color:#4a5b6b;margin:.3rem 0 1.5rem;padding:.7rem 1rem;background:#f1f6fb;border-left:3px solid #1a5fa8;border-radius:6px;line-height:1.5">🩺 Medically reviewed by <a href="/medical-director" style="color:#1a5fa8;font-weight:600">Bradley Tourtlotte, MD</a>, Medical Director · Last updated ${UPDATED} · <a href="/editorial-policy" style="color:#1a5fa8">Editorial policy</a></div>`;
function injectByline(html) {
  if (/review-byline/.test(html)) return html;               // never double-inject
  if (/<\/h1>/.test(html)) return html.replace('</h1>', '</h1>\n' + REVIEW_BYLINE);
  return REVIEW_BYLINE + html;
}

/* Extract FAQ pairs from a cheerio page node (.faq-item > .faq-q/.faq-a) */
function extractFaq(node) {
  const out = [];
  node.find('.faq-item').each((_, el) => {
    const q = $(el).find('.faq-q').first().clone();
    q.find('.faq-arrow').remove();
    const question = q.text().trim();
    const answer = $(el).find('.faq-a').first().text().trim();
    if (question && answer) out.push({ q: question, a: answer });
  });
  return out;
}

/* ---- Rewrite every goTo() link to a real href ------------------- */
$('a[onclick]').each((_, el) => {
  const a = $(el), onclick = a.attr('onclick') || '';
  const m = onclick.match(/goTo\(['"]([^'"]+)['"]\)/);
  if (m) { a.attr('href', slugMap[m[1]] || '/'); a.removeAttr('onclick'); }
});

/* ---- Netlify Forms: make every form detectable + submittable ----- */
$('form').each((_, f) => {
  const $f = $(f);
  $f.attr('name', 'benefits-verification');
  $f.attr('method', 'POST');
  $f.attr('data-netlify', 'true');
  $f.attr('netlify-honeypot', 'bot-field');
  $f.removeAttr('onsubmit');
  $f.prepend('<input type="hidden" name="form-name" value="benefits-verification"/><p hidden><label>Leave this blank: <input name="bot-field"/></label></p>');
  // every field needs a name or its value won't be submitted
  $f.find('input, select, textarea').each((j, el) => {
    const $el = $(el), type = ($el.attr('type') || el.tagName.toLowerCase());
    if (type === 'hidden' || type === 'submit' || type === 'button') return;
    if (!$el.attr('name')) {
      // Derive a clean, meaningful name from the field's label (so Netlify leads
      // read "first_name", not "jane"). Falls back to id/placeholder/type.
      const labelTxt = $el.closest('.form-group').find('label').first().text().replace(/\*/g, '').trim();
      let nm = labelTxt || $el.attr('id') || $el.attr('placeholder') || (type + '-' + j);
      nm = String(nm).toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '') || ('field_' + j);
      $el.attr('name', nm);
    }
  });
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
/* Hand-authored standalone pages (not in any content array). They were only
   reachable from each other's copied nav, so generated pages never linked to
   them — including the two statewide head-term pages (alcohol/drug rehab). */
const STANDALONE = [
  { slug: 'nyship-alcohol-rehab',            navLabel: 'NYSHIP Alcohol Rehab' },
  { slug: 'nyship-drug-rehab',               navLabel: 'NYSHIP Drug Rehab' },
  { slug: 'nyship-heroin-rehab',             navLabel: 'Heroin Rehab' },
  { slug: 'nyship-fentanyl-rehab',           navLabel: 'Fentanyl Rehab' },
  { slug: 'nyship-cocaine-rehab',            navLabel: 'Cocaine Rehab' },
  { slug: 'nyship-meth-rehab',               navLabel: 'Meth Rehab' },
  { slug: 'rehab-that-accepts-nyship',       navLabel: 'Rehab That Accepts NYSHIP' },
  { slug: 'detox-that-accepts-nyship',       navLabel: 'Detox That Accepts NYSHIP' },
  { slug: 'nyship-substance-abuse-providers', navLabel: 'NYSHIP Substance Abuse Providers' },
  { slug: 'nyship-rehab-orange-county',      navLabel: 'Orange County, NY' },
  { slug: 'nyship-rehab-new-jersey',         navLabel: 'New Jersey (NYSHIP members)' },
];
{
  const links = STANDALONE.map(p => `      <a href="/${p.slug}">${p.navLabel}</a>`).join('\n');
  navMenu.children('li').eq(1).after(
    `<li>\n  <span>Alcohol &amp; Drugs <span class="arrow">&#9660;</span></span>\n  <div class="dropdown">\n${links}\n  </div>\n</li>`);
}
if (ARTICLES.length) {
  navMenu.find('li').last().before(`<li><a href="/${GUIDES_HUB.slug}">Guides</a></li>`);
}
if (BLOG.length) {
  navMenu.find('li').last().before(`<li><a href="/blog/">Blog</a></li>`);
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
mobCta.before(mobSection('Alcohol &amp; Drug Rehab', STANDALONE));
if (BLOG.length) mobCta.before(`<div class="mob-section-title">Blog</div>\n<a href="/blog/">Recovery Blog</a>\n`);

/* ---- Extract shared chrome (links now rewritten) ---------------- */
const crisisBar = $('.crisis-bar').first().toString();
const navHTML = $('nav').first().toString();
const mobileMenu = $('#mobileMenu').toString();
// site-wide footer: link every guide + blog post (deep pages -> 1 click from every page, aids discovery)
$('footer').append(`<div style="padding:1.4rem 5% 0;border-top:1px solid rgba(255,255,255,.12);margin-top:1rem"><h4 style="color:#fff;font-size:.92rem;margin-bottom:.6rem">Guides &amp; Recovery Blog</h4><div style="columns:4;-webkit-columns:4;column-gap:1.4rem">${ARTICLES.map(p=>`<a href="/${p.slug}" style="display:block;color:rgba(255,255,255,.6);font-size:.8rem;padding:.15rem 0;break-inside:avoid">${esc(stripTags(p.navLabel||p.h1||p.title).slice(0,42))}</a>`).join('')}${BLOG.map(p=>`<a href="/blog/${p.slug}" style="display:block;color:rgba(255,255,255,.6);font-size:.8rem;padding:.15rem 0;break-inside:avoid">${esc(stripTags(p.title).slice(0,42))}</a>`).join('')}<a href="/blog/" style="display:block;color:#cca967;font-size:.8rem;padding:.15rem 0;font-weight:700;break-inside:avoid">All Posts &rarr;</a></div></div>`);
// site-wide footer link to the HTML sitemap (aids crawl/discovery of every page)
$('footer').append('<div style="text-align:center;padding:1.1rem 5%;border-top:1px solid rgba(255,255,255,.12)"><a href="/blog/" style="color:rgba(255,255,255,.6);font-size:.82rem;letter-spacing:.3px;margin-right:1.2rem">Blog</a><a href="/site-map" style="color:rgba(255,255,255,.6);font-size:.82rem;letter-spacing:.3px">Site Map &middot; Browse All Pages</a></div>');
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
    if(e.target.tagName!=='FORM') return;
    e.preventDefault();
    var form=e.target, btn=form.querySelector('.submit-btn');
    try{
      var body=new URLSearchParams(new FormData(form));
      if(!body.has('form-name')) body.append('form-name', form.getAttribute('name')||'benefits-verification');
      fetch('/',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:body.toString()}).catch(function(){});
    }catch(err){}
    if(btn){ btn.textContent='Submitted! We will call you within a few hours.';
      btn.style.background='var(--green)'; btn.disabled=true; }
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
    reviewedBy: { '@id': REVIEWER_ID }
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
  <div class="container">
    <div class="verify-grid">
      <div class="verify-info">
        <div class="section-label">Free &amp; Confidential</div>
        <h2>Verify Your NYSHIP Benefits — No Cost, No Obligation</h2>
        <p>Submit your info and our admissions team will confirm your exact NYSHIP / Empire Plan coverage and report back — usually within a few hours. HIPAA &amp; 42 CFR Part 2 protected; your employer is never notified.</p>
        <div class="info-row"><div class="info-icon">🔒</div><div><h4>100% Confidential</h4><p>Protected under HIPAA and 42 CFR Part 2. Employer, union, and HR are never notified.</p></div></div>
        <div class="info-row"><div class="info-icon">⚡</div><div><h4>Results Same Day</h4><p>Most verifications finish within 2–4 hours during business hours.</p></div></div>
        <div class="info-row"><div class="info-icon">📞</div><div><h4>Prefer to Call?</h4><p>24/7 admissions line: <a href="tel:${TEL}" style="color:var(--blue);font-weight:700;">${PHONE}</a></p></div></div>
      </div>
      <div class="form-card">
        <h3>Verify My NYSHIP Benefits — Free</h3>
        <form>
          <div class="form-row">
            <div class="form-group"><label>First Name *</label><input type="text" placeholder="Jane" required name="first_name"></div>
            <div class="form-group"><label>Last Name *</label><input type="text" placeholder="Smith" required name="last_name"></div>
          </div>
          <div class="form-group"><label>Phone Number *</label><input type="tel" placeholder="(555) 000-0000" required name="phone"></div>
          <div class="form-group"><label>Email Address</label><input type="email" placeholder="jane@example.com" name="email"></div>
          <div class="form-group"><label>NYSHIP Plan Type</label><select name="nyship_plan"><option value="">— Select your plan (if known) —</option><option>Empire Plan</option><option>CDPHP</option><option>MVP Health Care</option><option>EmblemHealth / GHI</option><option>Excellus BlueCross BlueShield</option><option>HealthNow / BCBS WNY</option><option>Not sure</option></select></div>
          <div class="form-group"><label>Primary Concern</label><select name="primary_concern"><option value="">— What are you seeking help for? —</option><option>Alcohol use</option><option>Cocaine or stimulants</option><option>Kratom dependency</option><option>Prescription painkillers</option><option>Other opioids</option><option>Benzodiazepines</option><option>Multiple substances</option><option>Mental health</option><option>Not sure</option></select></div>
          <button type="submit" class="submit-btn">Submit — Verify My Benefits →</button>
          <p class="form-disclaimer">🔒 HIPAA &amp; 42 CFR Part 2 compliant. Never sold or shared. Employer will not be contacted.</p>
        </form>
      </div>
    </div>
  </div>
</section>`;

// Sticky Call / Verify / Text bar on every page. Desktop: floats bottom-LEFT so
// it never collides with the bottom-right chat widget. Mobile: full-width but
// leaves room on the right for the chat bubble.
const stickyCta = `<style>
#sl-sticky{position:fixed;bottom:0;left:0;right:0;z-index:9999;display:flex;gap:8px;padding:8px 10px;background:#0a2540;box-shadow:0 -4px 22px rgba(0,0,0,.28)}
#sl-sticky a{flex:1;text-align:center;color:#fff;padding:13px 6px;border-radius:9px;font-weight:800;text-decoration:none;font-size:15px;line-height:1.15;font-family:inherit}
#sl-sticky .c{background:#1a9e5c}#sl-sticky .v{background:#d4a017}#sl-sticky .t{background:#2b7fd4}
#sl-sticky a:hover{filter:brightness(1.07)}
@media(max-width:899px){body{padding-bottom:74px}#sl-sticky{right:78px}}
@media(min-width:900px){#sl-sticky{left:22px;right:auto;bottom:22px;max-width:640px;border-radius:15px;padding:9px}#sl-sticky a{white-space:nowrap}}
@media(max-width:899px){#sl-sticky a{font-size:14px;padding:12px 4px}}
</style>
<div id="sl-sticky" role="navigation" aria-label="Contact actions">
  <a class="c" href="tel:${TEL}" aria-label="Call 631-800-4691 now, free and confidential">📞 Call Now, Free</a>
  <a class="v" href="/nyship-coverage-verification" aria-label="Check your NYSHIP or Empire Plan coverage">✅ Check Coverage</a>
  <a class="t" href="sms:${TEL}" aria-label="Text us">💬 Text Us</a>
</div>`;

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
<link rel="icon" href="/favicon.ico" sizes="32x32"/>
<link rel="icon" href="/favicon.svg" type="image/svg+xml"/>
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png"/>
<link rel="icon" type="image/png" sizes="256x256" href="/favicon-256.png"/>
<link rel="apple-touch-icon" href="/apple-touch-icon.png"/>
<meta property="og:type" content="website"/>
<meta property="og:url" content="${url}"/>
<meta property="og:title" content="${esc(meta.title)}"/>
<meta property="og:description" content="${esc(meta.desc)}"/>
<meta property="og:site_name" content="Addiction Rehab Center"/>
<meta property="og:locale" content="en_US"/>
<meta property="og:image" content="${ORIGIN}/og-image.png"/>
<meta property="og:image:width" content="1200"/>
<meta property="og:image:height" content="630"/>
<meta property="og:image:alt" content="${esc(meta.title)}"/>
<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:title" content="${esc(meta.title)}"/>
<meta name="twitter:description" content="${esc(meta.desc)}"/>
<meta name="twitter:image" content="${ORIGIN}/og-image.png"/>
${schemas}
${styleBlock}
</head>
<body>
${crisisBar}
${navHTML}
${mobileMenu}
<div id="spa-container">
<div class="spa-page" id="${currentId}" style="display:block">
${currentId === 'p-home' ? innerHTML : injectByline(innerHTML)}
</div>
</div>
${footerHTML}
${stickyCta}
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
  const faq = extractFaq(node);
  const html = renderPage(meta, node.html(), meta.id, [faqLd(faq)]);
  write(meta.slug === '' ? 'index.html' : meta.slug + '.html', html);
});

/* ---- E-E-A-T pages (physician schema on the medical-director page) */
EEAT.forEach(meta => {
  const extra = meta.id === 'p-medical-director' ? [REVIEWER_LD] : [];
  write(meta.slug + '.html', renderPage(meta, meta.html, meta.id, extra));
});

/* ---- Content pages (coverage / city / article) ------------------ */
const NY_CAT_IMG = {
  location: 'images/nyship-rehab-new-york.svg',
  article: 'images/nyship-addiction-treatment-guide.svg',
  coverage: 'images/nyship-empire-plan-rehab.svg'
};
function nyHeroImg(meta){
  const src = NY_CAT_IMG[meta.category] || 'images/nyship-empire-plan-rehab.svg';
  const kw = meta.h1 || meta.title;                 // keyword-rich, per-page
  const alt = (kw + ' | NYSHIP & Empire Plan Rehab').replace(/<[^>]+>/g,'');
  return `<img src="/${src}" alt="${esc(alt)}" title="${esc(kw.replace(/<[^>]+>/g,''))}" width="1200" height="420" loading="eager" style="width:100%;height:auto;border-radius:14px;margin:1.2rem 0 1.6rem"/>`;
}
CONTENT.filter(meta=>meta.category!=='blog').forEach(meta => {
  const isArticle = meta.category === 'article' || meta.category === 'coverage';
  const inner =
    `<section>\n  <div class="container">\n` +
    (meta.eyebrow ? `    <div class="section-label">${meta.eyebrow}</div>\n` : '') +
    `    <h1>${meta.h1 || meta.title}</h1>\n` +
    (isArticle ? '    ' + reviewByline + '\n' : '') +
    `    ${nyHeroImg(meta)}\n` +
    `  </div>\n</section>\n` +
    `<section style="padding-top:0">\n  <div class="container">\n${meta.bodyHtml}\n  </div>\n</section>` +
    faqSection(meta.faq) + contentCta;
  const crumb = '<script type="application/ld+json">\n' + JSON.stringify({
    '@context':'https://schema.org','@type':'BreadcrumbList','itemListElement':[
      {'@type':'ListItem',position:1,name:'Home',item:ORIGIN+'/'},
      {'@type':'ListItem',position:2,name:stripTags(meta.h1||meta.title).split('|')[0].trim(),item:ORIGIN+'/'+meta.slug}
    ]}, null, 2) + '\n</script>';
  write(meta.slug + '.html', renderPage(meta, inner, meta.id, [faqLd(meta.faq), crumb]));
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

/* ---- Blog — dated, sourced posts with Article schema, at /blog/<slug> */
if (BLOG.length) {
  fs.mkdirSync(path.join(OUT,'blog'), { recursive: true });
  const D = ['2026-06-01','2026-06-02','2026-06-03','2026-06-04','2026-06-05','2026-06-06','2026-06-07','2026-06-08','2026-06-09','2026-06-10','2026-06-11','2026-06-12'];
  BLOG.forEach((p,i)=>{ p.date = p.date || D[Math.min(D.length-1, Math.round(i*(D.length-1)/Math.max(1,BLOG.length-1)))]; });
  const sorted = BLOG.slice().sort((a,b)=> a.date<b.date?1:-1);
  BLOG.forEach(p=>{
    const url = ORIGIN + '/blog/' + p.slug;
    const author = p.author || 'NYSHIP Detox Editorial Team';
    const byline = `<p class="review-byline" style="color:var(--muted);font-size:.9rem;border-left:3px solid var(--blue);padding-left:.8rem;margin:.2rem 0 1.5rem">By ${esc(author)} &middot; Published ${p.date} &middot; Medically reviewed by <a href="/medical-director" style="color:var(--blue);font-weight:600">Bradley Tourtlotte, MD</a></p>`;
    const sources = (p.sources&&p.sources.length) ? `<section style="padding-top:0"><div class="container" style="max-width:780px"><h2>Sources &amp; References</h2><ul>${p.sources.map(s=>`<li style="margin:.3rem 0"><a href="${s.url}" target="_blank" rel="noopener">${esc(s.name)}</a></li>`).join('')}</ul></div></section>` : '';
    const inner = `<section>\n  <div class="container" style="max-width:820px">\n    <div class="section-label">Blog</div>\n    <h1>${esc(p.h1||p.title)}</h1>${byline}\n  </div>\n</section>` +
      `<section style="padding-top:0">\n  <div class="container" style="max-width:820px">\n${p.bodyHtml}\n  </div>\n</section>` +
      faqSection(p.faq) + sources + contentCta;
    const articleLd = '<script type="application/ld+json">\n' + JSON.stringify({
      '@context':'https://schema.org','@type':'BlogPosting', headline:p.title, description:p.desc,
      datePublished:p.date, dateModified:p.date, inLanguage:'en-US',
      author:{'@type':'Organization', name:author}, publisher:{'@id':ORIGIN+'/#organization'},
      image:ORIGIN+'/og-image.png', mainEntityOfPage:url, reviewedBy:{'@id':REVIEWER_ID}
    }, null, 2) + '\n</script>';
    write('blog/'+p.slug+'.html', renderPage({slug:'blog/'+p.slug, title:p.title, desc:p.desc}, inner, 'p-blog-'+p.slug, [articleLd, faqLd(p.faq)]));
  });
  const items = sorted.map(p=>`<a class="card" href="/blog/${p.slug}" style="display:block"><p style="color:var(--muted);font-size:.78rem;margin-bottom:.3rem">${p.date}</p><h3 style="color:var(--blue)">${esc(p.title)}</h3><p style="color:var(--muted);font-size:.9rem">${esc(p.desc)}</p></a>`).join('\n');
  const hubInner = `<section>\n  <div class="container">\n    <div class="section-label">Blog</div>\n    <h1>NYSHIP Addiction &amp; Recovery Blog</h1>\n    <p class="section-sub">Expert, sourced articles on addiction, recovery and NYSHIP coverage — reviewed by our medical director.</p>\n    <div class="card-grid-4">\n${items}\n    </div>\n  </div>\n</section>` + contentCta;
  write('blog/index.html', renderPage({slug:'blog/', title:BLOG_HUB.title, desc:BLOG_HUB.desc}, hubInner, 'p-blog'));
}

/* ---- HTML site map (internal-linking hub to aid crawl/discovery) - */
{
  const li = items => '<ul style="columns:2;-webkit-columns:2;list-style:none;padding:0;margin:.5rem 0 2.2rem">' +
    items.map(p => `<li style="padding:.32rem 0;break-inside:avoid"><a href="${p.href}" style="color:var(--blue);font-weight:500">${esc(p.label)}</a></li>`).join('') + '</ul>';
  const clean = s => String(s).replace(/<[^>]+>/g, '').split('|')[0].trim();
  const mainLinks = PAGES.filter(p => p.slug !== '').map(p => ({ href: '/' + p.slug, label: clean(p.title) }));
  const covLinks = COVERAGE.map(p => ({ href: '/' + p.slug, label: clean(p.h1 || p.title) }));
  const cityLinks = CITIES.map(p => ({ href: '/' + p.slug, label: clean(p.navLabel || p.h1 || p.title) }));
  const artLinks = ARTICLES.map(p => ({ href: '/' + p.slug, label: clean(p.navLabel || p.h1 || p.title) }));
  const eeatLinks = EEAT.map(p => ({ href: '/' + p.slug, label: clean(p.navLabel) }));
  if (ARTICLES.length) artLinks.push({ href: '/' + GUIDES_HUB.slug, label: 'All NYSHIP Rehab Guides' });
  const inner = `<section>\n<div class="container">\n<div class="section-label">Site Map</div>\n<h1>Browse All Pages</h1>\n` +
    `<p class="section-sub">Every page on nyshipdetox.com, in one place — so you (and search engines) can find it all.</p>\n` +
    `<h2>Main Pages</h2>${li(mainLinks)}` +
    (covLinks.length ? `<h2>Coverage</h2>${li(covLinks)}` : '') +
    (cityLinks.length ? `<h2>Downstate Locations</h2>${li(cityLinks)}` : '') +
    (artLinks.length ? `<h2>Guides</h2>${li(artLinks)}` : '') +
    (BLOG.length ? `<h2>Blog</h2>${li(BLOG.map(p=>({href:'/blog/'+p.slug,label:clean(p.title)})).concat([{href:'/blog/',label:'Blog Home'}]))}` : '') +
    `<h2>About</h2>${li(eeatLinks)}` +
    `</div>\n</section>`;
  write(SITEMAP_PAGE.slug + '.html', renderPage(SITEMAP_PAGE, inner, SITEMAP_PAGE.id));
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
if (BLOG.length) urls.push({ loc: ORIGIN + '/blog/', pr: '0.7' });
BLOG.forEach(p => urls.push({ loc: ORIGIN + '/blog/' + p.slug, pr: '0.6' }));
urls.push({ loc: ORIGIN + '/' + SITEMAP_PAGE.slug, pr: '0.3' });

/* Hand-authored pages that live outside the generator arrays above.
   They are linked in the nav but build.js does not emit them, so without this
   sweep every rebuild silently dropped them from sitemap.xml. Auto-discovering
   keeps future standalone pages indexed instead of relying on a manual list. */
const SITEMAP_EXCLUDE = new Set([
  'index',                       // emitted above as "/"
  'addiction-rehab-center',      // legacy SPA source, 301s to "/"
]);
const known = new Set(urls.map(u => u.loc));
fs.readdirSync(OUT)
  .filter(f => f.endsWith('.html') && !f.startsWith('.'))   // skip editor backups like .index-prev-backup.html
  .map(f => f.replace(/\.html$/, ''))
  .filter(slug => !SITEMAP_EXCLUDE.has(slug) && !slug.startsWith('google-site-verification'))
  .sort()
  .forEach(slug => {
    const loc = ORIGIN + '/' + slug;
    if (!known.has(loc)) { known.add(loc); urls.push({ loc, pr: '0.7' }); }
  });
/* nyship-rehab-albany is defined in both PAGES and content/cities.json, so it
   would otherwise emit twice. Keep the first (highest-priority) entry per URL. */
const seenLoc = new Set();
const dedupedUrls = urls.filter(u => !seenLoc.has(u.loc) && seenLoc.add(u.loc));
urls.length = 0; urls.push(...dedupedUrls);

const sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  urls.map(u => `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>${u.pr}</priority>\n  </url>`).join('\n') +
  '\n</urlset>\n';
fs.writeFileSync(path.join(OUT, 'sitemap.xml'), sitemap);

console.log(`✓ Generated ${count} pages + sitemap.xml (${urls.length} URLs)`);
console.log(`  SPA:${PAGES.length}  EEAT:${EEAT.length}  coverage:${COVERAGE.length}  cities:${CITIES.length}  articles:${ARTICLES.length}`);
