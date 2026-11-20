"""Builds referenzen.html, leistungen.html, ueber-uns.html and the certificate gallery on index.html.

Content comes from the old maler-berg.de (crawled 2026-11-20). Project data: tools/projects.json.
Run from the repo root:  python tools/build_pages.py
"""
import html, json, re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = json.loads((ROOT / 'tools/projects.json').read_text(encoding='utf-8'))
e = html.escape

def ext(url, label):
    return f'<a href="{e(url)}" target="_blank" rel="noopener">{label}</a>'

SVG = '''<svg width="0" height="0" style="position:absolute" aria-hidden="true">
  <symbol id="mark" viewBox="0 0 48 48"><circle cx="24" cy="24" r="24" fill="#e5007a"/><path d="M11 35c6-2 9-9 13.5-14.5 3.6-4.4 8-8 12.5-8-1.8 4.5-5.4 8-9.8 11.6-4.6 3.8-9.2 8.6-16.2 10.9z" fill="#fff"/><rect x="32" y="8.5" width="8" height="4.5" rx="1" transform="rotate(-38 36 10.7)" fill="#32c9c9"/></symbol>
  <symbol id="arrow" viewBox="0 0 24 24"><path d="M7 17 17 7M9 7h8v8" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></symbol>
</svg>'''

NAV = [('leistungen.html', 'Leistungen'), ('referenzen.html', 'Referenzen'), ('ueber-uns.html', 'Über uns'),
       ('index.html#zertifikate', 'Zertifikate'), ('index.html#kontakt', 'Kontakt')]

def header(active):
    cur = ' aria-current="page"'
    links = '\n    '.join('<a href="' + h + '"' + (cur if h == active else '') + '>' + t + '</a>' for h, t in NAV)
    return f'''<header class="top">
  <a class="logo" href="index.html"><svg><use href="#mark"/></svg><span>MALER<br>BERG</span></a>
  <nav class="top__nav" id="menu" aria-label="Hauptmenü">
    {links}
  </nav>
  <a class="btn btn--sm" href="tel:+49221361451">0221 36 14 51</a>
  <button class="burger" type="button" aria-expanded="false" aria-controls="menu" aria-label="Menü öffnen"><span></span><span></span></button>
</header>'''

FOOTER = '''<footer class="foot">
  <div class="foot__cols">
    <nav aria-label="Seiten"><h3>Seite</h3><a href="leistungen.html">Leistungen</a><a href="referenzen.html">Referenzen</a><a href="ueber-uns.html">Über uns</a><a href="ueber-uns.html#jobs">Jobs</a><a href="ueber-uns.html#presse">Presse</a><a href="index.html#zertifikate">Zertifikate</a></nav>
    <nav aria-label="Rechtliches"><h3>Rechtliches</h3><a href="impressum.html">Impressum</a><a href="datenschutz.html">Datenschutz</a><a href="assets/docs/maler-berg-broschuere.pdf">Broschüre (PDF)</a></nav>
    <div><h3>Kontakt</h3><a href="tel:+49221361451">0221 – 36 14 51</a><span>Fax 0221 – 93 62 51 2</span><a href="mailto:info@maler-berg.de">info@maler-berg.de</a><span>Breniger Straße 5<br>50969 Köln-Zollstock</span></div>
  </div>
  <a class="foot__logo" href="index.html"><svg><use href="#mark"/></svg><span>MALER<br>BERG</span></a>
  <p class="foot__copy">© 2026 Maler Berg GmbH · Ralf Berg · Meisterbetrieb der Maler- und Lackierer-Innung Köln</p>
</footer>'''

CTA = '''<section class="cta cta--page" aria-labelledby="cta-h">
    <svg class="cta__mark"><use href="#mark"/></svg>
    <div>
      <h2 id="cta-h">Jetzt Malerarbeiten anfragen</h2>
      <p>Rufen Sie an oder schreiben Sie an <a href="mailto:info@maler-berg.de">info@maler-berg.de</a>. Wir kommen vorbei und machen Ihnen ein Angebot.</p>
    </div>
    <a class="btn" href="tel:+49221361451">0221 – 36 14 51</a>
  </section>'''

def page(fname, title, desc, active, body):
    doc = f'''<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{e(title)}</title>
<meta name="description" content="{e(desc)}">
<link rel="preload" href="assets/fonts/dmsans-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="assets/css/site.css">
<link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
</head>
<body>

{SVG}

{header(active)}

<main id="top">
{body}

  {CTA}
</main>

{FOOTER}

<dialog class="lb" id="lb" aria-label="Bildergalerie"><figure><img alt=""><figcaption></figcaption></figure><button class="lb__x" aria-label="Schließen">×</button><button class="lb__prev" aria-label="Vorheriges Bild">‹</button><button class="lb__next" aria-label="Nächstes Bild">›</button></dialog>
<script src="assets/js/site.js"></script>
</body>
</html>
'''
    (ROOT / fname).write_text(doc, encoding='utf-8', newline='\n')
    print('wrote', fname)

def thumb(src):
    return src.replace('.jpg', '-t.jpg')

# ---------------------------------------------------------------- certificates
CERTS = [
    ('cert/qih-zertifikat.jpg', 'qih-Qualitätssiegel „sehr gut“', 'qih Qualität im Handwerk · seit 9. Juli 2007'),
    ('cert/qih-500.jpg', '500 sehr gute Kundenbewertungen', 'qih Qualität im Handwerk · 19.11.2024'),
    ('cert/qih-250.jpg', '250 sehr gute Kundenbewertungen', 'qih Qualität im Handwerk · überreicht auf der FAF Köln'),
    ('cert/nationalteam-2025.jpg', 'Offizieller Unterstützer des Maler-Nationalteams 2025', 'Hellmut Fricke Stiftung · auch 2024'),
    ('cert/tuev-feuchtesanierung-2016.jpg', 'Sachkunde Abdichtung und Feuchtesanierung erdberührter Bauteile', 'TÜV SÜD Akademie · Februar 2016'),
    ('cert/tuev-innendaemmung-2014.jpg', 'Sachkunde für Innendämmung', 'TÜV SÜD Akademie · Februar 2014'),
    ('cert/gsu-umweltschutz-2015.jpg', 'Im Umweltschutz geprüfter Innungsbetrieb', 'GSU Gemeinschaft Saubere Umwelt · 30. Juni 2015'),
    ('cert/schimmel-tuev-2013.jpg', 'Fachseminar „Schimmelpilze in Innenräumen“', 'TÜV Rheinland · 2013'),
    ('cert/schimmel-innung-2007.jpg', 'Sachkundenachweis Schimmelpilzsanierung', 'Landesinnungsverband Nordrhein, anerkannt von der BG Bau · Februar 2007'),
    ('cert/sika-brandschutz-2009.jpg', 'Sika Unitherm Brandschutzseminar', 'Sika Deutschland · 24. November 2009'),
    ('cert/heylo-bautrocknung-2008.jpg', 'Bautrocknung & Wasserschadensanierung', 'Hauptverband Farbe Gestaltung Bautenschutz / HEYLO · 4. März 2008'),
    ('cert/gruendorf-boden-2007.jpg', 'Urkunde Boden-Fachverleger', 'GRÜNDORF · 4. Mai 2007'),
]

def cert_gallery():
    items = []
    for i, (src, title, meta) in enumerate(CERTS):
        w, h = DATA['sizes'][src]
        items.append(f'''      <li><button class="doc" data-gallery="certs" data-src="assets/img/{src}" data-caption="{e(title)} · {e(meta)}" aria-label="{e(title)} groß ansehen"><img src="assets/img/{thumb(src)}" width="{w}" height="{h}" loading="lazy" alt="{e(title)}"></button><h3>{e(title)}</h3><p>{e(meta)}</p></li>''')
    return '''  <!-- CERTS:start -->
  <section class="certs" id="zertifikate" aria-labelledby="cert-h">
    <div class="certs__head">
      <h2 id="cert-h">Zertifikate &amp; <em>Auszeichnungen</em></h2>
      <p>Nicht nur versprochen, sondern geprüft: von der Innung, vom TÜV, von Herstellern und von unseren Kunden. Tippen Sie auf eine Urkunde, um sie groß zu sehen.</p>
    </div>
    <ul class="docs docs--all">
''' + '\n'.join(items) + '''
    </ul>
    <ul class="badges">
      <li><img src="assets/img/badge-qih.png" width="120" height="135" loading="lazy" alt="qih-Siegel: sehr gut, Innungsfachbetrieb"><span>Meisterbetrieb der Maler- und Lackierer-Innung Köln</span></li>
      <li><img src="assets/img/badge-nationalteam.png" width="180" height="180" loading="lazy" alt="Logo Maler-Nationalteam"><span>Unterstützer des Maler-Nationalteams 2024 &amp; 2025 <a href="assets/docs/urkunde-nationalteam-2024.pdf">Urkunde 2024 (PDF)</a></span></li>
      <li><img src="assets/img/press/haie-supporter-t.jpg" width="180" height="180" loading="lazy" alt="Kölner Haie Supporter Club 2022/23"><span>Kölner Haie Supporter Club 2022/23</span></li>
      <li><img src="assets/img/badge-stilpunkte.jpg" width="180" height="180" loading="lazy" alt="Stilpunkte Lifestyle Guide 2020/2021"><span>Ausgezeichnet von Stilpunkte 2020/2021</span></li>
    </ul>
  </section>
  <!-- CERTS:end -->'''

idx = (ROOT / 'index.html').read_text(encoding='utf-8')
if '<!-- CERTS:start -->' in idx:
    idx = re.sub(r'  <!-- CERTS:start -->.*?<!-- CERTS:end -->', lambda m: cert_gallery(), idx, flags=re.S)
else:
    idx = re.sub(r'  <!-- Certificates and awards: the real documents -->\n  <section class="certs".*?</section>', lambda m: cert_gallery(), idx, flags=re.S)
(ROOT / 'index.html').write_text(idx, encoding='utf-8', newline='\n')
print('index certs updated')

# ---------------------------------------------------------------- Referenzen
CLIENTS = ['Actor AG', 'Airport Business Hotel Köln-Deutz', 'Alfred Talke GmbH & Co. KG', 'Arbeiter-Samariter-Bund e.V.', 'Aqualand Köln',
    ('Baardse GmbH Immobilien', 'https://www.baardse-immobilien.de/'), 'Böhm & Hollmann Immobilienmanagement GmbH',
    'Deka Immobilien GmbH (WestInvest, Sparkassen-Finanzgruppe)', 'Deutsches Rotes Kreuz e.V.', 'Dombauhütte Köln (Wohnung Kardinal Meisner)',
    ('Elektroanlagen Uwe Czubak', 'http://www.uwe-czubak.de'), ('Gaffel', 'https://www.gaffel.de/'), 'GAG Immobilien AG',
    'Gebrüder Talke Immobilien- und Verwaltungsgesellschaft mbH & Co. KG', ('H. J. Lohmar GmbH Sanitär & Heizung', 'http://www.h-j-lohmar.de/'),
    'HAUSGRUND Verwaltungen Immobilien GmbH', 'Hotel Eden, Cölner Hofbräu Früh', 'Kassenzahnärztliche Bundesvereinigung (KZBV)',
    'Katholische Kirche St. Pius / St. Mauritius', ('KEC Kölner Eishockey-Gesellschaft „Die Haie“ mbH', 'https://www.haie.de/'),
    'KEC Kölner Eishockey-Club „Die Haie“ e.V.', ('KKM Haustechnik', 'https://kkm-kreuser.com/'), 'Köster GmbH', 'Lucas-Nülle GmbH',
    ('Lux Immobilienverwaltung', 'https://www.slux-immobilien.de/'), 'Moneymeets', 'mymuesli GmbH', 'Paul’s Fish & Chips', 'Peter Kaiser GmbH',
    'Privatkunden in Köln und Bonn', 'R&S Mobile GmbH & Co. KG', ('Starcar', 'https://www.starcar.de/'), 'The New Yorker Hotel GmbH',
    ('Thomas Sabo', 'https://www.thomassabo.com/'), ('VDV eTicket Service GmbH & Co. KG', 'https://www.eticket-deutschland.de/'),
    ('VOLIMEA GmbH & Co. KG', 'http://www.volimea.de/'), 'Wohnbau Service Bonn GmbH', 'Wohnungsgenossenschaft am Vorgebirgspark eG']

FILTERS = [('alle', 'Alle'), ('fassade', 'Fassaden'), ('innen', 'Innenräume'), ('denkmal', 'Denkmal'), ('logo', 'Logos'), ('technik', 'Spachtel & Lasur')]
def tags(p):
    t = (p['title'] + ' ' + ' '.join(p['text'])).lower()
    out = set()
    if 'fassade' in t or 'sockel' in t or 'beton' in t or 'bautenschutz' in t or 'brüstung' in t: out.add('fassade')
    if 'wohnung' in t or 'büro' in t or 'treppenhaus' in t or 'frühstück' in t or 'deckenputz' in t or 'kabine' in t or 'hotel und restaurant' in t or 'innen' in t: out.add('innen')
    if 'denkmal' in t: out.add('denkmal')
    if 'logo' in t: out.add('logo')
    if 'lasur' in t or 'spachtel' in t or 'volimea' in t or 'wischtechnik' in t or 'glättetechnik' in t: out.add('technik')
    if p['client'] in ('Hotel Eden · Cölner Hofbräu Früh', 'Elektroanlagen Uwe Czubak', 'The New Yorker Hotel'): out.add('innen')
    return out or {'fassade'}

def project_card(p, i):
    pics = p['pics']
    cover = pics[0]
    gid = 'p-' + p['slug']
    meta = ' · '.join(x for x in (p['year'], p['place']) if x)
    hidden = ''.join(f'<button class="ref__more" data-gallery="{gid}" data-src="{q["src"]}" data-caption="{e(p["title"])} ({k + 1}/{len(pics)})" hidden></button>' for k, q in enumerate(pics) if k > 0)
    text = ''.join(f'<p>{e(l)}</p>' for l in p['text'] if p['slug'] != 'aqualand-koeln')
    return f'''      <li class="ref" data-tags="{' '.join(sorted(tags(p)))}" id="{p['slug']}">
        <button class="ref__pic" data-gallery="{gid}" data-src="{cover['src']}" data-caption="{e(p['title'])} (1/{len(pics)})" aria-label="Fotos: {e(p['title'])}"><img src="{thumb(cover['src'])}" width="{cover['w']}" height="{cover['h']}" loading="lazy" alt="{e(p['client'])}: {e(p['title'])}"><span class="ref__n">{len(pics)} Foto{'s' if len(pics) != 1 else ''}</span></button>{hidden}
        <p class="ref__client">{e(p['client'])}</p>
        <h3>{e(p['title'])}</h3>
        <p class="ref__meta">{e(meta)}</p>
        <div class="ref__text">{text}</div>
      </li>'''

aq = next(p for p in DATA['projects'] if p['slug'] == 'aqualand-koeln')
aq_pics = ''.join(f'<button class="aq__pic" data-gallery="aqualand" data-src="{q["src"]}" data-caption="Aqualand Köln, Fassade 2006 ({k + 1}/{len(aq["pics"])})"><img src="{thumb(q["src"])}" width="{q["w"]}" height="{q["h"]}" loading="lazy" alt="Bemalte Fassade des Aqualand Köln"></button>' for k, q in enumerate(aq['pics']))
clients_html = '\n'.join(f'        <li>{ext(c[1], e(c[0])) if isinstance(c, tuple) else e(c)}</li>' for c in CLIENTS)
cards = '\n'.join(project_card(p, i) for i, p in enumerate(DATA['projects']) if p['slug'] != 'aqualand-koeln')
filters = ''.join(f'<button data-f="{k}" aria-pressed="{"true" if k == "alle" else "false"}">{t}</button>' for k, t in FILTERS)

page('referenzen.html', 'Referenzen – Maler Berg GmbH Köln', 'Projekte und Kunden der Maler Berg GmbH: Aqualand Köln, Kölner Haie, GAG Immobilien, Hotels, Denkmäler und Privatkunden in Köln und Bonn.', 'referenzen.html', f'''
  <section class="sub-hero">
    <p class="kicker">Referenzen</p>
    <h1>Hier haben wir <em>gearbeitet</em></h1>
    <p class="sub-hero__lead">Eine Auswahl unserer Projekte seit 2006: vom Freizeitbad über die Kabine der Kölner Haie bis zur denkmalgeschützten Fassade. Tippen Sie auf ein Foto, um alle Bilder zu sehen.</p>
  </section>

  <section class="aq" id="aqualand" aria-labelledby="aq-h">
    <div class="aq__pics">{aq_pics}</div>
    <div class="aq__copy">
      <p class="kicker kicker--light">Aqualand Köln · Herbst 2006</p>
      <h2 id="aq-h">Von 0 auf 1000 m² in 6 Wochen</h2>
      <p>Für die Neugestaltung der Fassade suchte das Aqualand einen Malerfachbetrieb in der Nähe, der schnell, fachgerecht und im Team mit dem Künstler Carsten Kruse arbeitet. Vier Mitarbeiter von Maler Berg haben die rund 1000 m² in sechs Wochen mit ihm bemalt, bei bis zu 10 m Fassadenhöhe, ohne Raster und Schablonen.</p>
      <blockquote>„Die Leute von der Firma Maler-Berg waren so gut drauf und beachteten meine Wünsche, dass ich das Ausmalen größerer Teilstücke bedenkenlos in ihre Hände legen konnte. Soviel Vertrauen zu einem Verarbeiterbetrieb hatte ich bisher noch nie!“<cite>Carsten Kruse, Künstler · Quelle: Achim Zielke M.A.</cite></blockquote>
    </div>
  </section>

  <section class="refs" aria-labelledby="refs-h">
    <div class="refs__head">
      <h2 id="refs-h">Projekte mit <em>Fotos</em></h2>
      <div class="chips" role="group" aria-label="Projekte filtern">{filters}</div>
    </div>
    <ul class="refs__grid" id="refs">
{cards}
    </ul>
  </section>

  <section class="clients" aria-labelledby="cl-h">
    <h2 id="cl-h">Für diese <em>Kunden</em> haben wir gearbeitet</h2>
    <p>Eine Auswahl unserer Auftraggeber, für die wir erfolgreich gearbeitet haben oder deren Projekte noch laufen.</p>
    <ul class="clients__list">
{clients_html}
    </ul>
  </section>''')

# ---------------------------------------------------------------- Leistungen
def li(items): return '<ul class="ticks">' + ''.join(f'<li>{x}</li>' for x in items) + '</ul>'
SERVICES = [
  ('malerarbeiten', 'Malerarbeiten', 'assets/img/malen.jpg', 'Wand wird mit der Rolle gestrichen',
   '<p>Wir bieten Ihnen professionellen Service bei sämtlichen Malerarbeiten. Wir übernehmen den Schutz von Objekten, führen Arbeiten zum Erhalt von Oberflächen durch und sind selbstverständlich auch für den dekorativen Teil, die Flächenverschönerung, zuständig.</p><p>Bei Bedarf sind wir Ihr zuverlässiger Partner für komplette Renovierungen und nehmen Ihnen alle anfallenden Arbeiten ab. Zu unseren besonderen Fähigkeiten gehört die professionelle Anwendung moderner Wisch- und Spachteltechniken.</p>'),
  ('lackierarbeiten', 'Lackier- und Holzschutzarbeiten', 'assets/img/lack.jpg', 'Tür wird lackiert',
   '<p>Lackier- und Holzschutzarbeiten mit deckenden und lasierenden Beschichtungen, zum Beispiel an:</p>' + li(['Türen und Fenstern', 'Holzdecken und Wintergärten', 'Sichtschutzzäunen und -elementen', 'Dachüberständen', 'Gartenzäunen und Gartenhäusern'])),
  ('tapezierarbeiten', 'Tapezierarbeiten', 'assets/img/d-rolle.jpg', 'Farbrolle auf frisch gestrichener Wand',
   '<p>Wir bieten Ihnen hochwertige</p>' + li(['Wandbeläge und Tapeten', 'Vliestapeten', 'Glasgewebetapeten', 'textile Wandbeläge', 'Foto- und Isoliertapeten'])),
  ('fassadenarbeiten', 'Fassadenarbeiten', 'assets/img/ref/fassadengestaltung-wesseling-01.jpg', 'Gestaltete Fassade in Wesseling',
   li(['Fassadenbeschichtungen', 'Betonbeschichtungen', 'Balkonbeschichtungen', 'mineralische und Silikonharz-Beschichtungen', 'hydrophobierende Anstriche', 'Buntstein-, Reibe-, Kratz-, Scheibe- und Glattputze', 'Wärmedämm-Verbundsysteme (WDVS)']) +
   f'<p>Dazu bieten wir eine Kooperation mit dem Berliner Fassadenkünstler {ext("http://www.oliverkray.com/", "Oliver Kray")} an. Das Ergebnis der ersten Zusammenarbeit sehen Sie <a href="referenzen.html#fassadengestaltung-wesseling">in Wesseling</a>. Mit der Designerin Jenny Lalvani ({ext("http://www.jela-design-illustration.de", "Jela Design &amp; Illustration")}) entwickeln wir individuelle Illustrationen und Wandmalereien.</p>'),
  ('wohnungsrenovierungen', 'Wohnungsrenovierungen', 'assets/img/ref/schwalbacher-str-01.jpg', 'Wand mit Volimea-Spachteltechnik',
   '<p>Wir decken das gesamte Spektrum einer Wohnungsrenovierung oder -sanierung gemeinsam mit unseren Kooperationspartnern ab, zum Beispiel:</p>' + li(['Michael Weiß – Handwerkerservice', ext('http://www.uwe-czubak.de', 'Elektroanlagen Uwe Czubak'), ext('http://www.h-j-lohmar.de/', 'H. J. Lohmar GmbH – Sanitär und Heizung'), ext('http://www.marcus-valder.de/index.html', 'Marcus Valder Schreinerei GmbH'), 'Schreinerei Wolpert GmbH &amp; Co. KG', 'Peter Kaiser GmbH']) + '<p>Fordern Sie uns heraus!</p>'),
  ('boden', 'Bodenbelagsarbeiten &amp; Bodenbeschichtungen', 'assets/img/boden.jpg', 'Neu verlegter Boden',
   '<p>Wir übernehmen gerne das Verlegen von:</p>' + li(['elastischen Belägen (CV, PVC, Linoleum und Kautschuk)', 'textilen Belägen aller Art', 'Parkett', 'Laminat']) + '<p>Wir nehmen auch Bodenbeschichtungen in Garage, Keller, (Heizöl-)Lager oder auf dem Balkon für Sie vor.</p>'),
  ('graffiti', 'Graffiti-Entfernung', 'assets/img/graffiti.jpg', 'Mit Graffiti besprühte Wand',
   f'<p>Graffitis verschwinden leider nicht so schnell, wie sie kommen. Und die bislang angewendeten Gegenmaßnahmen sind meist teuer, zeitraubend und können sogar die Bausubstanz gefährden.</p><p>Wir entfernen Graffitis entweder schonend mit Reinigern oder mit Strahlgut. Ist eine Überarbeitung sinnvoller, kommt unsere mobile Farbmessung zum Einsatz ({ext("http://www.brillux.de/anwendungen-und-loesungen/farbmischtechnologie/farbanalyse-system/das-mess-system/", "das Brillux Mess-System")}). Im Anschluss empfiehlt sich ein Schutzanstrich, den wir selbstverständlich auch anbieten.</p>'),
  ('logos', 'Logos &amp; Schriftzüge', 'assets/img/ref/kec-koelner-eishockey-gesellschaft-die-haie-mbh-01.jpg', 'Logo der Kölner Haie an der Wand',
   f'<p>Sie möchten Ihr Unternehmenslogo oder einen Schriftzug auf die Firmenwände bringen lassen? Oder ein Motiv, das Sie unbedingt an Ihren vier Wänden haben möchten?</p><p>Zusammen mit unserem Partner, der {ext("https://www.b-cf.de/", "BCF GmbH | Werbeagentur")}, setzen wir das perfekt um. Mit einer Negativfolie bringen wir schnell und preisgünstig nahezu jedes Motiv auf Ihre Wände. Mit den Kölner Haien haben wir dafür bereits einen prominenten Kunden gewonnen (<a href="referenzen.html#kec-koelner-eishockey-gesellschaft-die-haie-mbh">siehe Referenz</a>). Alle Rechte am Logo liegen bei der KEC Kölner Eishockey-Gesellschaft „Die Haie“ mbH.</p>'),
  ('farbmessung', 'Mobile Farbmessung', 'assets/img/messen.jpg', 'Farbmessgerät an der Wand',
   f'<p>Mit dem Farbmessgerät {ext("http://www.brillux.de/anwendungen-und-loesungen/farbmischtechnologie/farbmessgeraete/farbmessgeraet-mf-100/", "Brillux MF 100")} lesen wir den gewünschten Farbton für Sie ein. Die Messergebnisse gehen direkt an Brillux, wo die Farbe individuell hergestellt und in 1–2 Werktagen an uns geliefert wird. Das spart viel Zeit und garantiert eine 98 % genaue Farbtonskalierung.</p><p>Die Vorteile: schnell, präzise, kostengünstig, zeitsparend, universell einsetzbar und qualitätssichernd.</p>'),
  ('schimmel', 'Schimmelpilzsanierung', 'assets/img/schimmel.jpg', 'Feuchtemessung an einer Wand',
   '<p>Die meisten Schimmelpilze sind gesundheitlich unbedenklich, manche werden sogar für Antibiotika oder als Nahrungsmittel-Veredler verwendet. Es gibt aber auch stark gesundheitsgefährdende Arten, die nach bestimmten Richtlinien beseitigt werden müssen. In Ihrem Auftrag führen wir eine professionelle Schimmelpilzsanierung durch.</p><p>Unsere Fachkenntnis hat der Maler- und Lackierer-Landesinnungsverband Nordrhein durch eine Prüfung bestätigt (2007, anerkannt von der BG Bau), zusätzlich der TÜV Rheinland in einem weiteren Lehrgang (2013).</p><p>Für die Angebotserstellung erheben wir eine Gebühr, die je nach Aufwand variiert. Sie enthält An- und Abfahrt, eine Feuchtemessung, die Protokollierung des Schadensbildes und das Angebot. Bei Beauftragung wird die Gebühr der Rechnung gutgeschrieben.</p>'),
  ('wisch-spachtel', 'Wisch- und Spachteltechniken', 'assets/img/ref/schwalbacher-str-03.jpg', 'Wand in Spachteltechnik mit Goldlasur',
   f'<p><b>Wischtechnik:</b> Bei dieser alten Malertechnik für Wände und Decken wird meist eine Lasur aufgetragen. Sie kann zart wie ein durchsichtiger Schleier wirken oder so intensiv, dass der Untergrund gerade noch hindurchschimmert, zum Beispiel mit der Antik-Lasur oder Arte-Lasur von Caparol.</p><p><b>Spachteltechnik:</b> Mit Spachteln werden feine Massen aufgetragen und geglättet. Die Spachtelschläge bleiben sichtbar; mit der Transparenz der Masse ergibt sich ein individuelles, sehr elegantes Bild. Wir verwenden unter anderem {ext("http://www.volimea.de/", "VOLIMEA und Percamo")}. Ein Ergebnis sehen Sie <a href="referenzen.html#schwalbacher-str">in dieser Wohnung</a>.</p>'),
  ('rundum', 'Rundum-Service', 'assets/img/d-altbau.jpg', 'Fertig renovierter Altbauraum',
   '<p>Wir verstehen uns vor allem als Dienstleister und übernehmen gerne die komplette Renovierung für Sie. Dabei kooperieren wir mit allen notwendigen Gewerken, wie Trockenbauern, Sanitär- und Heizungsinstallateuren, Fliesenlegern, Elektrikern und Gerüstbauern, um Ihnen einen reibungslosen Ablauf zu garantieren.</p>'),
]
toc = ''.join(f'<a href="#{k}">{t}</a>' for k, t, *_ in SERVICES)
blocks = '\n'.join(f'''    <article class="svc" id="{k}">
      <img src="{img}" loading="lazy" alt="{alt}">
      <div class="svc__copy"><h2>{t}</h2>{body}<a class="svc__ask" href="index.html#kontakt">Anfragen<svg><use href="#arrow"/></svg></a></div>
    </article>''' for k, t, img, alt, body in SERVICES)

page('leistungen.html', 'Leistungen – Maler Berg GmbH Köln', 'Malerarbeiten, Lack, Tapete, Fassade, Wohnungsrenovierung, Böden, Graffiti-Entfernung, Logos, mobile Farbmessung, Schimmelpilzsanierung, Wisch- und Spachteltechniken in Köln.', 'leistungen.html', f'''
  <section class="sub-hero">
    <p class="kicker">Leistungen</p>
    <h1>Unser <em>Leistungs&shy;angebot</em></h1>
    <p class="sub-hero__lead">Neben sämtlichen Malerarbeiten gehören auch Spezialarbeiten wie die mobile Farbmessung, Graffiti-Entfernung und Schimmelpilzsanierung zu unserem Angebot. Zusammen mit unseren Kooperationspartnern übernehmen wir alle Arbeiten rund um Ihre Renovierung.</p>
    <a class="btn btn--ghost" href="assets/docs/maler-berg-broschuere.pdf">Broschüre herunterladen (PDF, 6,6 MB)</a>
    <nav class="toc" aria-label="Leistungen">{toc}</nav>
  </section>

  <section class="svcs">
{blocks}
  </section>''')

# ---------------------------------------------------------------- Über uns
S = DATA['sizes']
page('ueber-uns.html', 'Über uns – Maler Berg GmbH Köln', 'Die Maler Berg GmbH aus Köln-Zollstock: seit 1996, ein Meister und sechs Fachkräfte. Einsatzgebiet, Ausbildung, Jobs, Presse und Partner.', 'ueber-uns.html', f'''
  <section class="sub-hero sub-hero--split">
    <div>
      <p class="kicker">Über uns</p>
      <h1>„Gemeinsam bringen wir <em>Farbe ins Leben.</em>“</h1>
      <p class="sub-hero__lead">Gegründet wurde unser Handwerksbetrieb 1996, anfangs als Ein-Mann-Unternehmen. Heute besteht unser Team aus einem Meister und sechs Fachkräften. Unser Ziel: die Vorstellungen unserer Kunden in die Tat umsetzen, zuverlässig, sauber und gewissenhaft.</p>
    </div>
    <figure class="boss"><img src="assets/img/press/ralf-berg.png" width="{S['press/ralf-berg.png'][0]}" height="{S['press/ralf-berg.png'][1]}" alt="Ralf Berg, Malermeister und Geschäftsführer"><figcaption><b>Ralf Berg</b>Malermeister und Geschäftsführer</figcaption></figure>
  </section>

  <section class="about">
    <article><h2>Alles aus <em>einer Hand</em></h2><p>Unser Service geht bis zur Organisation und Vermittlung anderer Dienstleistungen. Wir kümmern uns nicht nur um alle Malerarbeiten, sondern auch um Bodenbelags- und Trockenbauarbeiten. Bei Bedarf vermitteln und koordinieren wir alle am Bau beteiligten Gewerke, wie Sanitär- und Heizungsinstallation, Fliesenleger, Elektriker oder Gerüstbauer. So bekommen Sie einen reibungslosen und professionellen Ablauf aus einer Hand.</p></article>
    <article><h2>Unser <em>Einsatzgebiet</em></h2><p>Hauptsächlich arbeiten wir im Großraum Köln/Bonn, im Rhein-Erft-Kreis und im Bergischen Kreis. Besonders häufig sind wir in der Kölner Südstadt tätig: Zollstock, Sülz, Raderthal, Lindenthal, Klettenberg, Bayenthal. Unser Kundenkreis verteilt sich aber über das ganze Stadtgebiet, von Ossendorf bis Kalk, von Buchheim bis Marsdorf. Bei größeren Aufträgen arbeiten wir auch im erweiterten Einsatzgebiet.</p></article>
  </section>

  <section class="dark jobs" id="jobs" aria-labelledby="jobs-h">
    <img src="assets/img/press/wir-bilden-aus.jpg" width="{S['press/wir-bilden-aus.jpg'][0]}" height="{S['press/wir-bilden-aus.jpg'][1]}" loading="lazy" alt="Wir bilden aus: Handwerkskammer zu Köln, 2017">
    <div>
      <h2 id="jobs-h">Jobs &amp; <em>Ausbildung</em></h2>
      <p>Die Maler Berg GmbH mit Sitz im Kölner Süden wurde 1996 als Ein-Mann-Unternehmen gegründet und besteht heute aus einem Malermeister und sechs weiteren Fachkräften. Als Mitglied der Handwerkskammer und der Maler-Innung Köln bieten wir neben Tapezier-, Lackier- und Fassadenarbeiten auch Bodenbelagsarbeiten, Graffiti-Entfernung, Schimmelpilzsanierung und hochwertige Wisch- und Spachteltechniken an.</p>
      <p>Wir bilden aus. Sie möchten bei uns anfangen oder eine Ausbildung zum Maler und Lackierer machen? Melden Sie sich gerne.</p>
      <a class="btn" href="mailto:info@maler-berg.de?subject=Bewerbung">Jetzt bewerben</a>
    </div>
  </section>

  <section class="press" id="presse" aria-labelledby="press-h">
    <h2 id="press-h">Maler Berg in der <em>Presse</em></h2>
    <div class="press__grid">
      <article class="pr pr--wide">
        <button class="pr__pic" data-gallery="press" data-src="assets/img/press/uebergabe-faf.jpg" data-caption="Übergabe der qih-Ehrenurkunde auf der FAF in Köln"><img src="assets/img/press/uebergabe-faf-t.jpg" width="{S['press/uebergabe-faf.jpg'][0]}" height="{S['press/uebergabe-faf.jpg'][1]}" loading="lazy" alt="Ralf Berg erhält die qih-Ehrenurkunde auf der FAF"></button>
        <div>
          <p class="kicker">Pressemitteilung</p>
          <h3>Qualität setzt sich durch</h3>
          <p>Auf der FAF (Farbe, Ausbau &amp; Fassade) in Köln, der europäischen Leitmesse des Maler- und Lackiererhandwerks, wurde die Maler Berg GmbH mit der „Qualität im Handwerk“-Ehrenurkunde für die 250. Kundenbewertung „sehr gut“ ausgezeichnet. Die Urkunde überreichten Jan Bauer, Präsident des Bundesverbandes Farbe Gestaltung Bautenschutz, und Henning Cronemeyer, Geschäftsführer der qih.</p>
          <details><summary>Ganze Pressemitteilung lesen</summary>
            <p>„Ein toller Erfolg“, betonte qih-Geschäftsführer Henning Cronemeyer. Er unterstrich, dass das Unternehmen die Kundenzufriedenheit stets in den Vordergrund stelle. Dies sei im Handwerk nicht immer selbstverständlich.</p>
            <p>Qualitätssiegel stehen für gute Arbeit und reibungslose Abläufe. Nachhaltig sind sie aber erst, wenn die Leistungen dauerhaft erbracht werden. Dafür bürgt das Siegel „Malertest“ von „Qualität im Handwerk“ (qih), das seit 2007 eine Bewertung durch die Kunden ermöglicht. Nur Innungsbetriebe, die dauerhaft positive Kundenbewertungen vorweisen, dürfen es führen.</p>
            <p>Bewertet werden der Gesamteindruck eines Betriebes und Aspekte wie Termintreue, Kompetenz, Kundenorientierung, Sauberkeit und die Wertigkeit der Arbeit. Bewertungen können nur Kunden mit Rechnungs- und Transaktionsnummer abgeben, ein Missbrauch ist damit nahezu ausgeschlossen. Ausgezeichnete Betriebe findet man auf {ext("https://www.qih.de/", "www.qih.de")}.</p>
          </details>
        </div>
      </article>
      <article class="pr">
        <button class="pr__pic" data-gallery="press2" data-src="assets/img/cert/qih-250.jpg" data-caption="qih gratuliert zur 250. sehr guten Kundenbewertung"><img src="assets/img/cert/qih-250-t.jpg" width="{S['cert/qih-250.jpg'][0]}" height="{S['cert/qih-250.jpg'][1]}" loading="lazy" alt="qih-Urkunde zur 250. Kundenbewertung"></button>
        <h3>Gratulation zur 250. und 500. sehr guten Kundenbewertung</h3>
        <p>Die qih Qualität im Handwerk Fördergesellschaft gratulierte uns erst zur 250., im November 2024 dann zur 500. sehr guten Kundenbewertung. Danke an unsere treuen Kunden für das Vertrauen!</p>
      </article>
      <article class="pr">
        <button class="pr__pic" data-gallery="press3" data-src="assets/img/press/skoda-test.jpg" data-caption="Ralf Berg testet den Skoda Octavia (Bildquelle: Rudolf Wichert)"><img src="assets/img/press/skoda-test-t.jpg" width="{S['press/skoda-test.jpg'][0]}" height="{S['press/skoda-test.jpg'][1]}" loading="lazy" alt="Ralf Berg mit Firmenwagen"></button>
        <h3>Firmenwagen-Test</h3>
        <p>Für das handwerk magazin testete Ralf Berg den Skoda Octavia. {ext("http://www.handwerk-magazin.de/skoda-octavia-combi-solides-familienauto/150/517/212982/1", "Zum Bericht")} <small>(Bildquelle: Rudolf Wichert)</small></p>
      </article>
      <article class="pr">
        <button class="pr__pic" data-gallery="press4" data-src="assets/img/ref/kec-koelner-eishockey-gesellschaft-die-haie-mbh-01.jpg" data-caption="Logoarbeiten bei den Kölner Haien"><img src="assets/img/ref/kec-koelner-eishockey-gesellschaft-die-haie-mbh-01-t.jpg" width="612" height="816" loading="lazy" alt="Logo der Kölner Haie an der Kabinenwand"></button>
        <h3>Logoarbeiten beim KEC</h3>
        <p>Unsere Arbeit bei den Kölner Haien sorgte für mediale Aufmerksamkeit, der Express berichtete mit Artikel und Video. Auch die Eishockeyspieler selbst nahmen den Pinsel in die Hand. <a href="referenzen.html#kec-koelner-eishockey-gesellschaft-die-haie-mbh">Zur Referenz</a></p>
      </article>
      <article class="pr pr--quote">
        <h3>„Mappe“ empfiehlt unsere Webseite</h3>
        <blockquote>„Auf der Webseite von Ralf Berg sind alle Angaben klar ersichtlich auf der Startseite zu finden. Sie wirkt nicht überladen, verweist auf die Kontaktadresse und präsentiert die angebotenen Leistungen samt Zertifikaten.“</blockquote>
        <p><small>Mappe – Die Malerzeitschrift, Ausgabe 08/2011, S. 23</small></p>
      </article>
      <article class="pr">
        <a class="pr__pic" href="referenzen.html#aqualand"><img src="assets/img/ref/aqualand-koeln-01-t.jpg" width="532" height="713" loading="lazy" alt="Bemalte Fassade des Aqualand Köln"></a>
        <h3>Aqualand Köln</h3>
        <p>Im Herbst 2006 gestalteten wir mit dem Künstler Carsten Kruse die komplette Fassade des Aqualands nach seinem Entwurf. <a href="referenzen.html#aqualand">Den ganzen Bericht lesen</a></p>
      </article>
    </div>
  </section>

  <section class="partners" aria-labelledby="partner-h">
    <h2 id="partner-h">Unsere <em>Partner</em></h2>
    <p>Für alles, was über Farbe hinausgeht, arbeiten wir mit festen Partnern. Viele davon kennen wir aus {ext("https://bni-rheinland.de/chapter-koelnwest-koeln/de/memberlist", "BNI Rheinland, Chapter Köln West")}.</p>
    <ul class="clients__list">
      <li>{ext("http://www.uwe-czubak.de", "Elektroanlagen Uwe Czubak")}</li>
      <li>{ext("http://www.h-j-lohmar.de/", "H. J. Lohmar GmbH – Sanitär und Heizung")}</li>
      <li>{ext("http://www.marcus-valder.de/index.html", "Marcus Valder Schreinerei GmbH")}</li>
      <li>Schreinerei Wolpert GmbH &amp; Co. KG</li>
      <li>Peter Kaiser GmbH</li>
      <li>Michael Weiß – Handwerkerservice</li>
      <li>{ext("https://www.b-cf.de/", "BCF GmbH | Werbeagentur")}</li>
      <li>{ext("http://www.jela-design-illustration.de", "Jela Design &amp; Illustration")}</li>
      <li>{ext("http://www.oliverkray.com/", "Oliver Kray, Fassadenkünstler")}</li>
      <li>{ext("http://www.deine-wandtattoos.de/", "deine-wandtattoos.de")}</li>
    </ul>
  </section>''')
