/* ===================================================================
   eeat-templates.js — DRAFT E-E-A-T pages (NOT published)
   -------------------------------------------------------------------
   These two pages are the single biggest E-E-A-T signal Google looks
   for on an addiction-treatment site — but they only help if they
   describe REAL, verifiable people. Fabricated clinicians/credentials
   violate Google's policies and can expose a treatment business to
   liability, so they are deliberately left UNPUBLISHED.

   To publish: replace every [BRACKETED] placeholder with real staff
   details, then move the object into the module.exports array in
   eeat-content.js and re-run `node build.js`.
   =================================================================== */

const PHONE = '213-321-6518';

module.exports = [

  {
    id: 'p-medical-director',
    slug: 'medical-director',
    navLabel: 'Medical Director',
    title: 'Medical Director | Addiction Rehab Center',
    desc: '[Replace with a 150-char description naming your medical director, their credentials and specialty.]',
    html: `
<section>
  <div class="container">
    <div class="section-label">Clinical Leadership</div>
    <h1>Meet Our Medical Director</h1>
    <p class="section-sub">[One-sentence summary of who leads clinical care and why patients can trust them.]</p>

    <h2>[Full Name, Credentials — e.g., Jane Smith, MD, FASAM]</h2>
    <p><strong>Role:</strong> Medical Director</p>
    <p><strong>Specialty:</strong> [e.g., Addiction Medicine, Psychiatry]</p>
    <p><strong>License:</strong> [State medical license / board certification — e.g., NY License #000000; ABPM Addiction Medicine]</p>
    <p><strong>Education:</strong> [Medical school, residency, fellowship]</p>

    <h3>Biography</h3>
    <p>[2–4 sentences: experience, approach to addiction treatment, years in the field, what they oversee at the center.]</p>

    <h3>Areas of focus</h3>
    <ul>
      <li>[e.g., Medication-Assisted Treatment]</li>
      <li>[e.g., Co-occurring disorders / dual diagnosis]</li>
      <li>[e.g., Medically supervised detox]</li>
    </ul>
  </div>
</section>`
  },

  {
    id: 'p-clinical-team',
    slug: 'clinical-team',
    navLabel: 'Clinical Team',
    title: 'Our Clinical Team | Addiction Rehab Center',
    desc: '[Replace with a 150-char description of your licensed clinical team — counselors, nurses, therapists.]',
    html: `
<section>
  <div class="container">
    <div class="section-label">Our People</div>
    <h1>Our Clinical Team</h1>
    <p class="section-sub">[One sentence on the licensed professionals who provide care.]</p>

    <div class="card-grid-4">
      <div class="card">
        <h3>[Name, Credentials — e.g., John Doe, LCSW, CASAC]</h3>
        <p><strong>[Title]</strong></p>
        <p>[1–2 sentence bio and specialty.]</p>
      </div>
      <div class="card">
        <h3>[Name, Credentials]</h3>
        <p><strong>[Title]</strong></p>
        <p>[1–2 sentence bio and specialty.]</p>
      </div>
      <div class="card">
        <h3>[Name, Credentials]</h3>
        <p><strong>[Title]</strong></p>
        <p>[1–2 sentence bio and specialty.]</p>
      </div>
      <div class="card">
        <h3>[Name, Credentials]</h3>
        <p><strong>[Title]</strong></p>
        <p>[1–2 sentence bio and specialty.]</p>
      </div>
    </div>

    <p style="margin-top:2rem;color:var(--muted)">Common NY addiction-treatment credentials: <strong>MD/DO</strong> (physician), <strong>NP/PMHNP</strong> (nurse practitioner), <strong>LCSW</strong> (clinical social worker), <strong>LMHC</strong> (mental health counselor), <strong>CASAC</strong> (Credentialed Alcoholism &amp; Substance Abuse Counselor), <strong>RN</strong> (registered nurse).</p>
  </div>
</section>`
  }

];
