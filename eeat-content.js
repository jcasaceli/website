/* ===================================================================
   eeat-content.js — Authored E-E-A-T pages (trust / authority)
   -------------------------------------------------------------------
   Only PUBLISHABLE, factually-defensible pages are exported here:
     • editorial-policy  — how content is written & reviewed
     • references        — real authoritative sources

   Medical Director and Clinical Team pages are intentionally NOT
   exported. They require real, verifiable staff names and credentials;
   fabricating them would be deceptive and would HURT E-E-A-T. Their
   ready-to-fill templates live in eeat-templates.js — fill them with
   real people, then move them into the array below to publish.
   =================================================================== */

const PHONE = '631-800-4691';

/* Reusable conversion CTA (matches site styling; nav CTA lands here) */
const ctaBlock = `
<section class="verify-section" id="verify-section" style="background:var(--sky)">
  <div class="container" style="text-align:center">
    <div class="section-label">Free &amp; Confidential</div>
    <h2>Verify Your NYSHIP Benefits — No Cost, No Obligation</h2>
    <p class="section-sub" style="margin:0 auto 2rem">We confirm your exact NYSHIP / Empire Plan coverage and report back, usually within a few hours. HIPAA &amp; 42 CFR Part 2 protected.</p>
    <a href="tel:6318004691" class="btn-primary">Call ${PHONE}</a>
  </div>
</section>`;

module.exports = [

  /* ---------------------------------------------------------------- */
  {
    id: 'p-editorial',
    slug: 'editorial-policy',
    navLabel: 'Editorial &amp; Review Policy',
    title: 'Editorial & Medical Review Policy | Addiction Rehab Center',
    desc: 'How Addiction Rehab Center researches, writes, sources and reviews its NYSHIP and addiction-treatment content for accuracy. Our standards and update process.',
    html: `
<section>
  <div class="container">
    <div class="section-label">Our Standards</div>
    <h1>Editorial &amp; Medical Review Policy</h1>
    <p class="section-sub">Addiction and insurance information affects real decisions. This page explains how we research, write, source and review everything we publish so you can trust what you read here.</p>

    <h2>Our commitment to accuracy</h2>
    <p>Every page on this site is written to be accurate, current and genuinely useful to New York State and government employees and their families. We aim to explain NYSHIP and Empire Plan addiction-treatment coverage in plain language, without exaggeration or scare tactics.</p>

    <h2>How our content is created</h2>
    <ul>
      <li><strong>Researched from primary sources.</strong> Coverage and clinical information is based on official sources — the NYS Department of Civil Service, the Empire Plan, federal parity law, and recognized clinical authorities such as SAMHSA, NIDA and ASAM (see our <a href="/references">References &amp; Sources</a>).</li>
      <li><strong>Written for clarity.</strong> We avoid jargon and explain insurance and treatment terms as we use them.</li>
      <li><strong>Reviewed before publishing.</strong> Content is reviewed by our clinical and admissions team for accuracy before it goes live, and re-checked when plans or laws change.</li>
      <li><strong>Updated regularly.</strong> Insurance benefits change. When we learn of a change to NYSHIP, the Empire Plan or relevant law, we update the affected pages.</li>
    </ul>

    <h2>What this content is — and isn't</h2>
    <p>The information here is for general education. It is <strong>not medical advice</strong> and is not a substitute for a professional clinical assessment, diagnosis or treatment. It is also not a guarantee of insurance coverage — your specific benefits depend on your exact plan. The only way to confirm your coverage is a benefits verification, which we provide at no cost.</p>

    <h2>Corrections</h2>
    <p>If you believe anything on this site is inaccurate or out of date, please tell us so we can review and correct it. Call <a href="tel:6318004691">${PHONE}</a> or email <a href="mailto:support@alumniaidservices.com">support@alumniaidservices.com</a>.</p>

    <p style="color:var(--muted);font-size:.92rem;margin-top:2rem">Last reviewed: June 2026.</p>
  </div>
</section>
${ctaBlock}`
  },

  /* ---------------------------------------------------------------- */
  {
    id: 'p-references',
    slug: 'references',
    navLabel: 'References &amp; Sources',
    title: 'References & Sources | NYSHIP & Addiction Treatment Information',
    desc: 'Authoritative sources behind our NYSHIP and addiction-treatment content — SAMHSA, NIDA, NIAAA, ASAM, the NYS Department of Civil Service and federal parity law.',
    html: `
<section>
  <div class="container">
    <div class="section-label">Authority &amp; Sources</div>
    <h1>References &amp; Sources</h1>
    <p class="section-sub">The coverage and clinical information on this site is grounded in official government and recognized clinical sources. Below are the primary references we rely on. You can consult any of them directly.</p>

    <h2>Insurance &amp; NYSHIP coverage</h2>
    <ul>
      <li><strong>NYS Department of Civil Service — Employee Benefits (NYSHIP / The Empire Plan):</strong> official plan documents, benefits and contacts. <a href="https://www.cs.ny.gov/employee-benefits/" target="_blank" rel="noopener">cs.ny.gov/employee-benefits</a></li>
      <li><strong>Mental Health Parity and Addiction Equity Act (MHPAEA):</strong> federal law requiring parity between behavioral-health and medical coverage. <a href="https://www.cms.gov/marketplace/private-health-insurance/mental-health-parity" target="_blank" rel="noopener">CMS — Mental Health Parity</a></li>
      <li><strong>NY State Office of Addiction Services and Supports (OASAS):</strong> state addiction services, standards and resources. <a href="https://oasas.ny.gov/" target="_blank" rel="noopener">oasas.ny.gov</a></li>
    </ul>

    <h2>Clinical &amp; treatment information</h2>
    <ul>
      <li><strong>SAMHSA (Substance Abuse and Mental Health Services Administration):</strong> national authority on substance use treatment; National Helpline 1-800-662-HELP (4357). <a href="https://www.samhsa.gov/" target="_blank" rel="noopener">samhsa.gov</a></li>
      <li><strong>NIDA (National Institute on Drug Abuse):</strong> research on addiction and evidence-based treatment. <a href="https://nida.nih.gov/" target="_blank" rel="noopener">nida.nih.gov</a></li>
      <li><strong>NIAAA (National Institute on Alcohol Abuse and Alcoholism):</strong> research on alcohol use and treatment. <a href="https://www.niaaa.nih.gov/" target="_blank" rel="noopener">niaaa.nih.gov</a></li>
      <li><strong>ASAM (American Society of Addiction Medicine):</strong> the ASAM Criteria for levels of care (detox, residential, PHP, IOP). <a href="https://www.asam.org/" target="_blank" rel="noopener">asam.org</a></li>
    </ul>

    <h2>Privacy &amp; legal protections</h2>
    <ul>
      <li><strong>42 CFR Part 2:</strong> federal confidentiality rules for substance use disorder records. <a href="https://www.samhsa.gov/about-us/who-we-are/laws-regulations/confidentiality-regulations-faqs" target="_blank" rel="noopener">SAMHSA — 42 CFR Part 2</a></li>
      <li><strong>HIPAA:</strong> federal privacy protections for health information. <a href="https://www.hhs.gov/hipaa/" target="_blank" rel="noopener">hhs.gov/hipaa</a></li>
      <li><strong>FMLA (Family and Medical Leave Act):</strong> job-protected medical leave. <a href="https://www.dol.gov/agencies/whd/fmla" target="_blank" rel="noopener">dol.gov — FMLA</a></li>
    </ul>

    <h2>Crisis support</h2>
    <ul>
      <li><strong>988 Suicide &amp; Crisis Lifeline:</strong> free, confidential, 24/7 — call or text 988. <a href="https://988lifeline.org/" target="_blank" rel="noopener">988lifeline.org</a></li>
    </ul>
  </div>
</section>
${ctaBlock}`
  },

  /* ---------------------------------------------------------------- */
  {
    id: 'p-medical-director',
    slug: 'medical-director',
    navLabel: 'Medical Director',
    title: 'Medical Director — Bradley Tourtlotte, MD | Addiction Rehab Center',
    desc: 'Meet our Medical Director, Bradley Tourtlotte, MD — a physician with 35+ years of experience providing medical oversight of detox and addiction treatment.',
    html: `
<section>
  <div class="container">
    <div class="section-label">Clinical Leadership</div>
    <h1>Meet Our Medical Director</h1>
    <p class="section-sub">Medical care is led by a licensed physician, so every detox and treatment plan is overseen with safety and clinical rigor.</p>

    <h2>Bradley Tourtlotte, MD</h2>
    <p><strong>Role:</strong> Medical Director</p>
    <p><strong>Degree:</strong> Doctor of Medicine (MD), Eastern Virginia Medical School</p>
    <p><strong>Experience:</strong> 35+ years in clinical medicine</p>

    <h3>About Dr. Tourtlotte</h3>
    <p>Dr. Bradley Tourtlotte is a licensed physician with more than 35 years of clinical experience. As Medical Director, he provides medical oversight of care — helping ensure that medically supervised detox and addiction treatment are delivered safely and in line with established clinical standards. His role includes guiding medical protocols for withdrawal management and supporting the integration of medication-assisted treatment where clinically appropriate.</p>

    <p style="color:var(--muted);font-size:.92rem;margin-top:1.5rem">Provider record: National Provider Identifier (NPI) 1902955859.</p>
  </div>
</section>
${ctaBlock}`
  },

  /* ---------------------------------------------------------------- */
  {
    id: 'p-clinical-team',
    slug: 'clinical-team',
    navLabel: 'Our Team',
    title: 'Our Clinical & Leadership Team | Addiction Rehab Center',
    desc: 'Meet the leadership and clinical team behind our addiction treatment programs — experienced behavioral-health professionals committed to evidence-based, compassionate care.',
    html: `
<section>
  <div class="container">
    <div class="section-label">Our People</div>
    <h1>Our Clinical &amp; Leadership Team</h1>
    <p class="section-sub">Our programs are led by experienced behavioral-health professionals dedicated to evidence-based, compassionate, whole-person care.</p>

    <div class="card-grid-4">
      <div class="card">
        <h3>Joseph Casaceli</h3>
        <p><strong>Founder &amp; Director</strong></p>
        <p>Joseph leads the center with a deep commitment to integrity and healing. He brings several years of experience across substance-use and mental-health treatment settings, and emphasizes evidence-based practices, holistic care, and a culture of respect and empowerment for every client.</p>
      </div>
      <div class="card">
        <h3>Alexandra Hicks</h3>
        <p><strong>Clinical Director</strong></p>
        <p>Alexandra is a dedicated behavioral-health professional who leads the center's integrated clinical programming. She has extensive experience working with teens, young adults, couples, and families, with clinical strengths in dialectical behavior therapy (DBT), trauma-focused CBT, and person-centered approaches.</p>
      </div>
      <div class="card">
        <h3>Devon Thomas</h3>
        <p><strong>Team Member</strong></p>
        <p>Devon is committed to expanding access to care, improving client outcomes, and fostering a supportive community where every person has the opportunity to reclaim their life and hope.</p>
      </div>
    </div>
  </div>
</section>
${ctaBlock}`
  }

];
