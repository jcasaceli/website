#!/usr/bin/env python3
"""Sync shared chrome (nav, mobile menu, footer, org schema, sticky CTA, dropdown
CSS) from the freshly generated index.html into the hand-authored standalone
pages that build.js does not emit. Run after `node build.js`."""
import re, glob, os, time
def block(s, pat):
    m = re.search(pat, s, re.S); return m.group(0) if m else None
src = open("index.html", encoding="utf-8").read()
NAV = block(src, r'<nav aria-label="Main navigation">.*?</nav>')
FOOT = block(src, r"<footer.*?</footer>")
def mob_span(s):
    m = re.search(r'<[a-z]+[^>]*id="mobileMenu"', s)
    return (m.start(), s.find('<div id="spa-container">')) if m else (-1, -1)
MOB = src[mob_span(src)[0]:mob_span(src)[1]]
ORG = block(src, r'<script type="application/ld\+json">\s*\{\s*"@context": "https://schema.org",\s*"@type": \[\s*"MedicalBusiness",\s*"MedicalOrganization"\s*\].*?</script>')
STICKY = block(src, r'<div id="sl-sticky".*?</div>')
STICKY_CSS = block(src, r"<style>\s*#sl-sticky\{.*?</style>")
CSS = block(src, r"/\* Wide \(mega\) menus anchor.*?max-width: 100%; \}")
assert all([NAV, FOOT, MOB, ORG, STICKY, STICKY_CSS, CSS]), "index.html chrome blocks not found"
# Explicit list (file age is unreliable: other scripts rewrite these files too).
# Keep in sync with STANDALONE in build.js plus the coverage/legal one-offs.
hand = ['detox-that-accepts-nyship.html','does-ghi-cover-rehab.html','new-york-good-samaritan-law.html',
        'nyship-adhd-coverage.html','nyship-alcohol-rehab.html','nyship-cocaine-rehab.html','nyship-depression-coverage.html',
        'nyship-drug-rehab.html','nyship-fentanyl-rehab.html','nyship-heroin-rehab.html','nyship-meth-rehab.html',
        'nyship-rehab-morris-county-nj.html','nyship-rehab-new-jersey.html','nyship-rehab-orange-county.html',
        'nyship-substance-abuse-providers.html','rehab-that-accepts-nyship.html']
hand = [f for f in hand if os.path.exists(f)]
for f in sorted(hand):
    s = open(f, encoding="utf-8").read(); o = s
    s = re.sub(r'<nav aria-label="Main navigation">.*?</nav>', lambda m: NAV, s, count=1, flags=re.S)
    s = re.sub(r"<footer.*?</footer>", lambda m: FOOT, s, count=1, flags=re.S)
    i, j = mob_span(s)
    if i > 0 and j > i: s = s[:i] + MOB + s[j:]
    s = re.sub(r'<script type="application/ld\+json">\s*\{\s*"@context": "https://schema.org",\s*"@type": \[\s*"MedicalBusiness",\s*"MedicalOrganization"\s*\].*?</script>', lambda m: ORG, s, count=1, flags=re.S)
    s = re.sub(r'<div id="sl-sticky".*?</div>', lambda m: STICKY, s, count=1, flags=re.S)
    s = s.replace(".dropdown.wide { left: auto; right: 0; min-width: min(700px, 95vw); }", CSS)
    s = re.sub(r"/\* Wide \(mega\) menus anchor.*?max-width: 100%; \}", lambda m: CSS, s, count=1, flags=re.S)
    s = re.sub(r"<style>\s*#sl-sticky\{.*?</style>", lambda m: STICKY_CSS, s, count=1, flags=re.S)
    if s != o: open(f, "w", encoding="utf-8").write(s)
    print(f"{'synced ' if s != o else 'nochange'} {f}")
