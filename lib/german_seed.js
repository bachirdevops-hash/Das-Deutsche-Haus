// Default seed data for the /german-visitors page
// All German content. Editable by Admin via /admin → German Visitors panel.
import { v4 as uuidv4 } from 'uuid'

export const HERO_IMG = 'https://images.unsplash.com/photo-1752744925120-a5e434cfea24'
export const GALLERY_IMGS = [
  { url: 'https://images.unsplash.com/photo-1622301254919-93fcfbc82ea6', caption: 'Palmyra — antike Säulen' },
  { url: 'https://images.unsplash.com/photo-1735313678998-09b6aa980431', caption: 'Palmyra im goldenen Licht' },
  { url: 'https://images.pexels.com/photos/34642750/pexels-photo-34642750.jpeg', caption: 'Zitadelle von Aleppo' },
  { url: 'https://images.pexels.com/photos/34632854/pexels-photo-34632854.jpeg', caption: 'Umayyaden-Moschee, Damaskus' },
  { url: 'https://images.unsplash.com/photo-1752396787222-30f814c02eeb', caption: 'Traditionelle syrische Architektur' },
  { url: 'https://images.pexels.com/photos/36756060/pexels-photo-36756060.jpeg', caption: 'Aleppo — historische Sicht' },
]

export const DEFAULT_PAGE_SETTINGS = {
  id: 'german_page_settings',
  hero_title: 'Willkommen in Syrien 🇸🇾',
  hero_subtitle: 'Entdecken Sie 10.000 Jahre Geschichte, authentische Küche und herzliche Gastfreundschaft. Ihre Reise beginnt hier.',
  hero_image: HERO_IMG,
  cta1_text: 'Reisepakete entdecken',
  cta1_link: '#packages',
  cta2_text: 'Kostenlose Beratung',
  cta2_link: '#booking',
  whatsapp_number: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '963111234567',
  show_packages: true, show_experiences: true, show_faq: true,
  show_flashcards: true, show_testimonials: true, show_gallery: true,
  show_booking: true, show_service_request: true, show_emergency: true,
}

export const DEFAULT_WHY_CARDS = [
  { id: uuidv4(), icon: '🏛️', title: '10.000 Jahre Geschichte', description: 'Damaskus, Palmyra, Aleppo — älteste Städte der Welt', sortOrder: 1 },
  { id: uuidv4(), icon: '🍽️', title: 'Authentische Küche', description: 'Echtes syrisches Essen bei lokalen Familien erleben', sortOrder: 2 },
  { id: uuidv4(), icon: '💰', title: 'Unschlagbare Preise', description: 'Luxuriöse Erfahrungen zu einem Bruchteil europäischer Preise', sortOrder: 3 },
  { id: uuidv4(), icon: '🤝', title: 'Herzliche Gastfreundschaft', description: 'Syrische Gastfreundschaft — einzigartig auf der Welt', sortOrder: 4 },
]

export const DEFAULT_PACKAGES = [
  {
    id: uuidv4(),
    name: 'Damascus Classic',
    duration_days: 4,
    price_eur: 299,
    cover_image: 'https://images.unsplash.com/photo-1737275848383-77b3a089dab2',
    cities: ['Damaskus'],
    included: [
      'Damaskus Altstadt geführte Tour',
      'Umayyaden-Moschee Besichtigung',
      'Souq Al-Hamidiyya Erkundung',
      'Lokales Abendessen mit syrischer Familie',
      'Bab Touma Christliches Viertel',
      '3 Übernachtungen in Boutique-Hotel',
      'Deutschsprachiger Reiseleiter',
      'Alle Eintrittsgebühren',
    ],
    not_included: [
      'Internationale Flüge',
      'Visum',
      'Persönliche Ausgaben',
      'Trinkgelder',
    ],
    max_group: 8,
    difficulty: 'Easy',
    status: 'Available',
    sortOrder: 1,
  },
  {
    id: uuidv4(),
    name: 'Grand Syria Tour',
    duration_days: 10,
    price_eur: 799,
    cover_image: 'https://images.unsplash.com/photo-1602674471917-2f5fbd54535e',
    cities: ['Damaskus', 'Palmyra', 'Aleppo', 'Krak des Chevaliers', 'Bosra', 'Latakia'],
    included: [
      'Alle Transfers im klimatisierten Bus',
      '9 Übernachtungen (Boutique & 4★ Hotels)',
      'Tägliches Frühstück + 5 Abendessen',
      'Deutschsprachiger Guide während der gesamten Reise',
      'Alle Eintrittsgebühren (UNESCO-Stätten)',
      'Mittelmeer-Tag in Latakia',
      'Bosra Römisches Theater',
      'Krak des Chevaliers Kreuzritterburg',
      'Aleppo Zitadelle und Souq',
    ],
    not_included: [
      'Internationale Flüge',
      'Visum',
      'Persönliche Ausgaben',
      'Mittagessen (außer angegeben)',
      'Trinkgelder',
    ],
    max_group: 12,
    difficulty: 'Medium',
    status: 'Available',
    sortOrder: 2,
  },
  {
    id: uuidv4(),
    name: 'Syria Adventure',
    duration_days: 7,
    price_eur: 549,
    cover_image: 'https://images.unsplash.com/photo-1681400739651-db98efd447c5',
    cities: ['Damaskus', 'Wüste', 'Berge', 'Antike Dörfer'],
    included: [
      'Off-the-beaten-path Erkundungen',
      'Wüstencamping in Palmyra (1 Nacht)',
      'Bergwanderung in Anti-Libanon',
      'Begegnungen mit Beduinen-Familien',
      '4×4 Geländewagen-Transfers',
      'Lokaler Adventure-Guide',
      'Komplette Camping-Ausrüstung',
      '6 Übernachtungen (Mix aus Camp & Lodge)',
    ],
    not_included: [
      'Internationale Flüge',
      'Visum',
      'Reiseversicherung (empfohlen)',
      'Persönliche Wanderausrüstung',
    ],
    max_group: 6,
    difficulty: 'Adventure',
    status: 'Available',
    sortOrder: 3,
  },
]

export const DEFAULT_EXPERIENCES = [
  { id: uuidv4(), icon: '🍳', title: 'Syrischer Kochkurs', description: 'Lerne Kibbeh, Hummus und Baklava von einer syrischen Mutter — authentisches Familienrezept', duration: '3 Stunden', price_eur: 25, cover_image: 'https://images.unsplash.com/photo-1507048331197-7d4ac70811cf', max_participants: 8, status: 'Available', sortOrder: 1 },
  { id: uuidv4(), icon: '🕌', title: 'Altstadt Nacht-Tour', description: 'Damaskus bei Nacht — magische Atmosphäre in den Gassen mit Laternen und Musik', duration: '2 Stunden', price_eur: 15, cover_image: 'https://images.unsplash.com/photo-1589200537104-23b804cc1dee', max_participants: 12, status: 'Available', sortOrder: 2 },
  { id: uuidv4(), icon: '📸', title: 'Fotografie-Tour', description: 'Professioneller Guide führt dich zu den schönsten Spots Syriens — perfekt für Instagram', duration: 'Ganztags', price_eur: 45, cover_image: 'https://images.unsplash.com/photo-1752396787222-30f814c02eeb', max_participants: 6, status: 'Available', sortOrder: 3 },
  { id: uuidv4(), icon: '🎨', title: 'Mosaik-Workshop', description: 'Lerne die jahrtausendealte Kunst des syrischen Mosaiks — nimm dein Werk mit nach Hause', duration: '4 Stunden', price_eur: 35, cover_image: 'https://images.unsplash.com/photo-1752745573673-cdae5e7b0f77', max_participants: 6, status: 'Available', sortOrder: 4 },
  { id: uuidv4(), icon: '🐪', title: 'Wüsten-Erlebnis', description: 'Übernachtung in der Wüste bei Palmyra unter dem Sternenhimmel — unvergesslich', duration: '2 Tage', price_eur: 120, cover_image: 'https://images.unsplash.com/photo-1613169620329-6785c004d900', max_participants: 10, status: 'Available', sortOrder: 5 },
  { id: uuidv4(), icon: '🏺', title: 'Handwerk-Atelier', description: 'Besuche syrische Kunsthandwerker: Damaszener Stahl, Aleppo-Seife, exotische Gewürze', duration: 'Halbtags', price_eur: 20, cover_image: 'https://images.unsplash.com/photo-1737275848383-77b3a089dab2', max_participants: 8, status: 'Available', sortOrder: 6 },
]

export const DEFAULT_FAQ = [
  { id: uuidv4(), question: 'Ist Syrien sicher für deutsche Touristen?', answer: 'Die touristischen Hauptstädte (Damaskus, Aleppo, Palmyra, Latakia) sind seit 2024 wieder sicher zugänglich. Wir arbeiten ausschließlich mit lizenzierten lokalen Guides und überwachen die Sicherheitslage täglich. Sie erhalten 24/7 deutschsprachige Notfallunterstützung während Ihrer gesamten Reise.', sortOrder: 1 },
  { id: uuidv4(), question: 'Brauche ich ein Visum?', answer: 'Ja. Deutsche Staatsbürger benötigen ein Touristenvisum, das wir für Sie vorab beantragen. Bearbeitungszeit: 5–10 Werktage. Wir kümmern uns um den gesamten Antragsprozess, Sie erhalten eine Einladung von uns als lizensiertem Reiseveranstalter.', sortOrder: 2 },
  { id: uuidv4(), question: 'Welche Währung wird verwendet?', answer: 'Die offizielle Währung ist das Syrische Pfund (SYP). US-Dollar (USD) und Euro (EUR) werden in Hotels, Restaurants und Souvenirläden weitgehend akzeptiert. Wir empfehlen, Bargeld in kleinen Stückelungen mitzubringen.', sortOrder: 3 },
  { id: uuidv4(), question: 'Wie ist die beste Reisezeit?', answer: 'März–Mai (Frühling) und September–November (Herbst) sind ideal. Angenehme Temperaturen (18–28°C), wenig Regen, perfekt für Outdoor-Aktivitäten. Sommer (Juni–August) ist heiß (bis 40°C), Winter (Dezember–Februar) kühl aber sehr atmosphärisch.', sortOrder: 4 },
  { id: uuidv4(), question: 'Gibt es Internet und SIM-Karten?', answer: 'Ja. Lokale SIM-Karten von Syriatel und MTN sind günstig (ca. 5–10 EUR für eine Woche mit Daten). Wir können Ihnen am Flughafen direkt eine SIM organisieren. WLAN ist in allen Hotels und vielen Cafés verfügbar.', sortOrder: 5 },
  { id: uuidv4(), question: 'Wie kommuniziere ich ohne Arabischkenntnisse?', answer: 'Kein Problem! Alle unsere Guides sprechen fließend Deutsch. In Hotels und Touristengebieten wird Englisch verstanden. Wir empfehlen unseren kostenlosen Mini-Arabischkurs (10 Wörter) auf dieser Seite — die Einheimischen freuen sich über jedes arabische Wort!', sortOrder: 6 },
  { id: uuidv4(), question: 'Kann ich mit Kreditkarte bezahlen?', answer: 'Aufgrund internationaler Sanktionen funktionieren westliche Kreditkarten in Syrien nur eingeschränkt. Wir empfehlen, Bargeld (USD/EUR) mitzubringen. Sie können auch im Voraus an uns überweisen — wir akzeptieren SEPA, PayPal und Wise.', sortOrder: 7 },
  { id: uuidv4(), question: 'Was soll ich einpacken?', answer: 'Bequeme Wanderschuhe, Sonnenhut, Sonnencreme, leichte Kleidung mit langen Ärmeln (Respekt vor lokalen Gepflogenheiten), Fotoausrüstung, Reiseapotheke. Frauen: Kopftuch beim Besuch von Moscheen (wird oft am Eingang gestellt). Detaillierte Packliste senden wir nach Buchung.', sortOrder: 8 },
]

export const DEFAULT_FLASHCARDS = [
  { id: uuidv4(), de: 'Hallo', ar: 'مرحبا', pronunciation: 'Marhaba', sortOrder: 1 },
  { id: uuidv4(), de: 'Danke', ar: 'شكراً', pronunciation: 'Shukran', sortOrder: 2 },
  { id: uuidv4(), de: 'Bitte', ar: 'من فضلك', pronunciation: 'Min Fadlak', sortOrder: 3 },
  { id: uuidv4(), de: 'Ja', ar: 'نعم', pronunciation: "Na'am", sortOrder: 4 },
  { id: uuidv4(), de: 'Nein', ar: 'لا', pronunciation: 'La', sortOrder: 5 },
  { id: uuidv4(), de: 'Wasser', ar: 'ماء', pronunciation: "Ma'", sortOrder: 6 },
  { id: uuidv4(), de: 'Essen', ar: 'طعام', pronunciation: "Ta'am", sortOrder: 7 },
  { id: uuidv4(), de: 'Schön', ar: 'جميل', pronunciation: 'Jamil', sortOrder: 8 },
  { id: uuidv4(), de: 'Willkommen', ar: 'أهلاً', pronunciation: 'Ahlan', sortOrder: 9 },
  { id: uuidv4(), de: 'Auf Wiedersehen', ar: 'مع السلامة', pronunciation: "Ma'a Salama", sortOrder: 10 },
]

export const DEFAULT_TESTIMONIALS = [
  { id: uuidv4(), name: 'Klaus Müller', city: 'München', photo: '', text: 'Eine unvergessliche Reise! Damaskus ist atemberaubend, das Essen göttlich, und die Menschen unglaublich herzlich. Das Deutsche Haus hat alles perfekt organisiert.', rating: 5, package_name: 'Grand Syria Tour', visible: true, sortOrder: 1 },
  { id: uuidv4(), name: 'Anna Schmidt', city: 'Berlin', photo: '', text: 'Ich war skeptisch, aber Syrien hat mich verzaubert. Palmyra bei Sonnenaufgang werde ich nie vergessen. Sicher, gut organisiert, sehr empfehlenswert!', rating: 5, package_name: 'Damascus Classic', visible: true, sortOrder: 2 },
  { id: uuidv4(), name: 'Stefan Hoffmann', city: 'Hamburg', photo: '', text: 'Als Fotograf war ich im Paradies. Die Vielfalt der Landschaften und Architekturen ist überwältigend. Mein deutscher Guide war exzellent.', rating: 5, package_name: 'Syria Adventure', visible: true, sortOrder: 3 },
  { id: uuidv4(), name: 'Petra Weber', city: 'Köln', photo: '', text: 'Der Kochkurs mit der syrischen Familie war das Highlight! Wir wurden wie Familie aufgenommen. Ich koche jetzt jede Woche Kibbeh in Köln.', rating: 5, package_name: 'Damascus Classic', visible: true, sortOrder: 4 },
]

export const DEFAULT_GALLERY = GALLERY_IMGS.map((g, i) => ({
  id: uuidv4(), url: g.url, caption: g.caption, sortOrder: i + 1, visible: true,
}))

export const DEFAULT_EMERGENCY_CONTACTS = [
  // German Embassies
  { id: uuidv4(), category: 'embassy', icon: '🇩🇪', name: 'Deutsche Botschaft Damaskus', phone: '+963 11 332 3800', website: 'https://damaskus.diplo.de', address: 'Mezzeh, Damaskus, Syrien', country: 'Syria', visible: true, sortOrder: 1 },
  { id: uuidv4(), category: 'embassy', icon: '🇩🇪', name: 'Deutsche Botschaft Amman (für Syrien zuständig)', phone: '+962 6 590 1170', website: 'https://amman.diplo.de', address: 'Amman, Jordanien', country: 'Jordan', visible: true, sortOrder: 2 },
  { id: uuidv4(), category: 'embassy', icon: '🇩🇪', name: 'Deutsche Botschaft Beirut', phone: '+961 1 953 600', website: 'https://beirut.diplo.de', address: 'Beirut, Libanon', country: 'Lebanon', visible: true, sortOrder: 3 },
  // Syrian Emergency
  { id: uuidv4(), category: 'syria_emergency', icon: '🚔', name: 'Polizei Syrien', phone: '112', website: '', address: '', country: 'Syria', visible: true, sortOrder: 1 },
  { id: uuidv4(), category: 'syria_emergency', icon: '🚑', name: 'Krankenwagen', phone: '110', website: '', address: '', country: 'Syria', visible: true, sortOrder: 2 },
  { id: uuidv4(), category: 'syria_emergency', icon: '🚒', name: 'Feuerwehr', phone: '113', website: '', address: '', country: 'Syria', visible: true, sortOrder: 3 },
  { id: uuidv4(), category: 'syria_emergency', icon: '🆘', name: 'Allgemeiner Notruf', phone: '114', website: '', address: '', country: 'Syria', visible: true, sortOrder: 4 },
  // DDH Support
  { id: uuidv4(), category: 'ddh_support', icon: '💬', name: 'Das Deutsche Haus — WhatsApp Support 24/7', phone: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+963 11 1234567', website: '', address: 'Deutsch & Englisch · 7 Tage / 24 Stunden', country: 'Syria', visible: true, sortOrder: 1 },
]

export async function seedGermanVisitorsIfEmpty(db) {
  const existing = await db.collection('german_packages').countDocuments().catch(() => 0)
  if (existing > 0) return

  await db.collection('german_page_settings').insertOne(DEFAULT_PAGE_SETTINGS)
  await db.collection('german_why_cards').insertMany(DEFAULT_WHY_CARDS)
  await db.collection('german_packages').insertMany(DEFAULT_PACKAGES)
  await db.collection('german_experiences').insertMany(DEFAULT_EXPERIENCES)
  await db.collection('german_faq').insertMany(DEFAULT_FAQ)
  await db.collection('german_flashcards').insertMany(DEFAULT_FLASHCARDS)
  await db.collection('german_testimonials').insertMany(DEFAULT_TESTIMONIALS)
  await db.collection('german_gallery').insertMany(DEFAULT_GALLERY)
  await db.collection('emergency_contacts').insertMany(DEFAULT_EMERGENCY_CONTACTS)
}
