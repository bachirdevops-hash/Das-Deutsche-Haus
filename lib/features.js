// 🎛️ Feature Flags — Page toggles managed via admin panel.
// Only "toggleable" pages appear in the admin UI. Core pages (home, about, contact, legal)
// are never disable-able and are not included here.

export const FEATURE_KEYS = ['telc', 'german_visitors']

export const FEATURE_META = {
  telc: {
    label_ar: 'صفحة telc والامتحانات',
    label_de: 'telc-Prüfungen',
    hint_ar: 'تعطيل هذه الصفحة سيُخفي كل روابط telc من الموقع (Navbar، Footer، الصفحة الرئيسية).',
    default_enabled: true,
  },
  german_visitors: {
    label_ar: 'صفحة الزوار الألمان (Für deutsche Besucher)',
    label_de: 'Für deutsche Besucher',
    hint_ar: 'تعطيل هذه الصفحة سيُخفي رابطها من الـ Navbar وسيعرض "قريباً" لمن يزور /german-visitors مباشرة.',
    default_enabled: true,
  },
}

export async function seedFeaturesIfEmpty(db) {
  const col = db.collection('site_features')
  for (const key of FEATURE_KEYS) {
    const exists = await col.findOne({ key })
    if (!exists) {
      await col.insertOne({
        key,
        enabled: FEATURE_META[key].default_enabled,
        updatedAt: new Date().toISOString(),
      })
    }
  }
}
