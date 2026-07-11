// Daily autonomous blog post generator for nyshipdetox.com.
// Picks the next unused topic, uses Claude to write an honest, sourced, E-E-A-T
// post in the site's content schema, appends it to content/blog-auto.json, and
// rebuilds the site (build.js). Run by blog-daily.sh (loads the key + deploys).
const fs = require('fs');
const path = require('path');

const SITE_DIR = path.resolve(__dirname, '..');
const CONTENT_DIR = path.join(SITE_DIR, 'content');
const AUTO_FILE = path.join(CONTENT_DIR, 'blog-auto.json');
const MODEL = 'claude-opus-4-8';

// Evergreen NYSHIP / addiction-treatment topics. The generator publishes the
// first one whose slug isn't already used, so it never duplicates a post.
const TOPICS = [
  'What Is the Empire Plan and How Does It Cover Addiction Treatment',
  'NYSHIP Copays and Deductibles for Rehab Explained',
  'How Prior Authorization Works for NYSHIP Addiction Treatment',
  'Inpatient vs Outpatient Rehab: What NYSHIP Covers',
  'Understanding the ASAM Levels of Addiction Care',
  'How Much Does Rehab Cost With NYSHIP',
  'Returning to Work After Rehab as a New York State Employee',
  'Is Rehab Confidential for New York State Employees',
  'Choosing the Right Rehab: Questions Every NYSHIP Member Should Ask',
  'Aftercare and Sober Living After Rehab in New York',
  'Telehealth Addiction Treatment and NYSHIP Coverage',
  'Recognizing the Signs of Alcohol Use Disorder',
  'Understanding the Mental Health Parity Law and Your NYSHIP Benefits',
  'NYSHIP Coverage for Retirees Seeking Addiction Treatment',
  'How Family Therapy Supports Long-Term Recovery',
  'Why Medical Supervision Matters During Detox',
  'What to Expect During Your First Week in Rehab',
  'Supporting a Coworker Who Is Struggling With Addiction',
  'How to Prepare Financially for Addiction Treatment With NYSHIP',
  'The Difference Between Detox and Rehab',
  'Understanding Suboxone and Vivitrol for Opioid Recovery',
  'Managing Anxiety and Depression in Early Recovery',
  'How NYSHIP HMO Plans Differ From the Empire Plan for Rehab',
  'Warning Signs of Prescription Painkiller Dependence',
  'Building a Relapse Prevention Plan That Lasts',
  'How to Support a Teen or Young Adult Entering Treatment',
  'What Happens After You Verify Your NYSHIP Benefits',
  'Sober Living Homes vs Halfway Houses: What to Know',
  'How Long Does Addiction Treatment Take',
  'Understanding Co-Occurring Disorders and Integrated Treatment',
];

const key = (() => {
  if (process.env.ANTHROPIC_API_KEY) return process.env.ANTHROPIC_API_KEY;
  try { const k = fs.readFileSync(path.resolve(process.env.HOME, '.anthropic-blog-key'), 'utf8').trim(); if (k.startsWith('sk-ant-')) return k; } catch {}
  return null;
})();
if (!key) { console.error('[auto-post] No ANTHROPIC_API_KEY / ~/.anthropic-blog-key — aborting.'); process.exit(1); }

const kebab = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const todayISO = () => new Date().toISOString().slice(0, 10);

// Collect every slug already used across all content JSON so we never duplicate.
function existingSlugs() {
  const slugs = new Set();
  for (const f of fs.readdirSync(CONTENT_DIR).filter((x) => x.endsWith('.json'))) {
    try { JSON.parse(fs.readFileSync(path.join(CONTENT_DIR, f), 'utf8')).forEach((p) => p.slug && slugs.add(p.slug)); } catch {}
  }
  return slugs;
}

async function main() {
  const used = existingSlugs();
  const topic = TOPICS.find((t) => !used.has(kebab(t)));
  if (!topic) { console.log('[auto-post] All topics published — add more to TOPICS. Nothing to do.'); return; }
  const slug = kebab(topic);

  const prompt = `You are the editorial team for NYSHIP Detox (nyshipdetox.com), an educational resource that helps New York State employees and retirees covered by NYSHIP / The Empire Plan understand and access addiction treatment. Write today's blog post on this topic:

"${topic}"

Return ONLY a single JSON object (no markdown, no commentary) with these exact keys:
{
  "title": "SEO title, <= 60 chars, specific and clickable",
  "desc": "meta description ~150 chars, ends with: Call 213-321-6518.",
  "h1": "the on-page H1 headline",
  "bodyHtml": "the full article as clean HTML using <p>, <h2>, <h3>, <ul><li>. 800-1300 words.",
  "sources": [ {"name":"Source name","url":"real authoritative URL"}, ... 4-5 items ],
  "faq": [ {"q":"question","a":"answer"}, ... 3-4 items ]
}

REQUIREMENTS (critical):
- HONEST & ACCURATE: This is health content. State only facts you are confident are true. Do NOT invent statistics, laws, or specifics. Frame coverage as general ("NYSHIP plans generally cover…", "depends on your specific plan"). Include a short sentence noting the article is educational, not medical/insurance/legal advice.
- CITE authoritative sources with REAL URLs only: SAMHSA, NIDA, CDC, NIH, NY State Dept. of Civil Service, ASAM, or similar. Every source URL must be one you are confident exists. Reference them inline in bodyHtml as <a href="URL" target="_blank" rel="noopener">Name</a>.
- INTERNAL LINKS: naturally link 2-4 of these existing pages in bodyHtml (use the exact hrefs): /does-nyship-cover-rehab, /empire-plan-rehab-coverage, /nyship-coverage-verification, /alcohol-detox-treatment, /medication-assisted-treatment, /nyship-outpatient-treatment, /dual-diagnosis-treatment, /levels-of-addiction-care.
- Include the phone number 213-321-6518 once, naturally, as a way to verify benefits or get help.
- Mention the 988 Suicide & Crisis Lifeline and SAMHSA National Helpline (1-800-662-4357) near the end for anyone in crisis.
- Tone: warm, clear, professional, non-judgmental. No fabricated testimonials or first-person clinical claims.`;

  console.log(`[auto-post] Topic: "${topic}" -> /blog/${slug}`);
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({ model: MODEL, max_tokens: 6000, messages: [{ role: 'user', content: prompt }] }),
  });
  if (!res.ok) { console.error('[auto-post] API error', res.status, (await res.text()).slice(0, 300)); process.exit(1); }
  const data = await res.json();
  const text = (data.content || []).map((c) => c.text || '').join('');
  let post;
  try { post = JSON.parse(text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1)); }
  catch (e) { console.error('[auto-post] Could not parse model JSON:', text.slice(0, 400)); process.exit(1); }

  if (!post.title || !post.desc || !post.h1 || !post.bodyHtml || !Array.isArray(post.sources) || post.sources.length < 3) {
    console.error('[auto-post] Post failed validation — not publishing.'); process.exit(1);
  }

  const item = {
    slug, category: 'blog', title: post.title, desc: post.desc, h1: post.h1,
    author: 'NYSHIP Detox Editorial Team', date: todayISO(),
    bodyHtml: post.bodyHtml, sources: post.sources, faq: post.faq || [],
  };
  const list = fs.existsSync(AUTO_FILE) ? JSON.parse(fs.readFileSync(AUTO_FILE, 'utf8')) : [];
  list.push(item);
  fs.writeFileSync(AUTO_FILE, JSON.stringify(list, null, 1) + '\n');
  console.log(`[auto-post] Wrote "${post.title}" (${item.date}). Total auto posts: ${list.length}. Now run build.js.`);
}

main().catch((e) => { console.error('[auto-post] failed:', e); process.exit(1); });
