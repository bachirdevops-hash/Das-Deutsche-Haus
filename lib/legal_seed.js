// Default content for 3 legal pages (AR + DE)
export const LEGAL_PAGES = ['privacy', 'terms', 'impressum']

export const LEGAL_DEFAULTS = {
  privacy: {
    slug: 'privacy',
    title_ar: 'سياسة الخصوصية',
    title_de: 'Datenschutzerklärung',
    metaDescription_ar: 'سياسة الخصوصية وحماية البيانات في معهد Das Deutsche Haus.',
    metaDescription_de: 'Datenschutzerklärung von Das Deutsche Haus.',
    published: true,
    content_ar: `<h2>1. مقدّمة</h2>
<p>نحن في <strong>Das Deutsche Haus</strong> نُولي خصوصيتك أولوية قصوى. توضّح هذه السياسة كيفية جمع بياناتك الشخصية ومعالجتها وحمايتها عند استخدامك لموقعنا أو خدماتنا.</p>

<h2>2. البيانات التي نجمعها</h2>
<ul>
<li><strong>بيانات الحساب:</strong> الاسم، البريد الإلكتروني، رقم الجوال</li>
<li><strong>بيانات أكاديمية:</strong> الكورسات، الدرجات، الحضور</li>
<li><strong>بيانات الدفع:</strong> تتم معالجتها عبر مزوّدين معتمدين (Stripe) ولا نحتفظ ببيانات البطاقات</li>
<li><strong>بيانات تقنية:</strong> عنوان IP، نوع المتصفح، صفحات الزيارة</li>
</ul>

<h2>3. كيف نستخدم بياناتك</h2>
<ul>
<li>تقديم الخدمات التعليمية وإدارة حسابك</li>
<li>التواصل بشأن الكورسات والامتحانات</li>
<li>تحسين تجربة الموقع</li>
<li>الامتثال للالتزامات القانونية</li>
</ul>

<h2>4. مشاركة البيانات</h2>
<p>لا نبيع بياناتك لأي طرف ثالث. قد نشاركها فقط مع:</p>
<ul>
<li>المعلّمين والإداريين العاملين معنا</li>
<li>الشركاء الألمان في برامج Ausbildung (بإذنك الصريح)</li>
<li>الجهات القانونية عند الطلب الرسمي</li>
</ul>

<h2>5. حقوقك</h2>
<p>يحقّ لك الوصول إلى بياناتك، تعديلها، أو طلب حذفها بالتواصل معنا عبر <a href="mailto:info@dasdeutschehaus.sy">info@dasdeutschehaus.sy</a>.</p>

<h2>6. ملفات تعريف الارتباط (Cookies)</h2>
<p>نستخدم Cookies تقنية ضرورية لعمل الموقع، وأخرى تحليلية لفهم زوارنا. يمكنك إدارتها من إعدادات متصفّحك.</p>

<h2>7. الأمان</h2>
<p>نطبّق إجراءات أمنية صارمة (تشفير، نسخ احتياطية، صلاحيات محدودة) لحماية بياناتك.</p>

<h2>8. التحديثات</h2>
<p>قد نحدّث هذه السياسة دورياً. سيتم إشعارك بأي تغييرات جوهرية.</p>

<h2>9. تواصل معنا</h2>
<p>للاستفسارات حول الخصوصية: <a href="mailto:info@dasdeutschehaus.sy">info@dasdeutschehaus.sy</a></p>`,
    content_de: `<h2>1. Einleitung</h2>
<p>Bei <strong>Das Deutsche Haus</strong> hat der Schutz Ihrer Privatsphäre höchste Priorität. Diese Erklärung beschreibt, wie wir Ihre personenbezogenen Daten erheben, verarbeiten und schützen.</p>

<h2>2. Erhobene Daten</h2>
<ul>
<li><strong>Kontodaten:</strong> Name, E-Mail, Telefonnummer</li>
<li><strong>Akademische Daten:</strong> Kurse, Noten, Anwesenheit</li>
<li><strong>Zahlungsdaten:</strong> verarbeitet durch zertifizierte Anbieter (Stripe); wir speichern keine Kartendaten</li>
<li><strong>Technische Daten:</strong> IP-Adresse, Browser-Typ, besuchte Seiten</li>
</ul>

<h2>3. Verwendung Ihrer Daten</h2>
<ul>
<li>Erbringung unserer Bildungsdienstleistungen</li>
<li>Kommunikation bezüglich Kursen und Prüfungen</li>
<li>Verbesserung der Website-Erfahrung</li>
<li>Erfüllung gesetzlicher Verpflichtungen</li>
</ul>

<h2>4. Datenweitergabe</h2>
<p>Wir verkaufen Ihre Daten nicht. Eine Weitergabe erfolgt nur an:</p>
<ul>
<li>Lehrkräfte und Verwaltungsmitarbeiter</li>
<li>Deutsche Partner bei Ausbildungsprogrammen (mit Ihrer Zustimmung)</li>
<li>Behörden auf rechtmäßige Anfrage</li>
</ul>

<h2>5. Ihre Rechte</h2>
<p>Sie haben das Recht auf Auskunft, Berichtigung oder Löschung Ihrer Daten. Kontakt: <a href="mailto:info@dasdeutschehaus.sy">info@dasdeutschehaus.sy</a></p>

<h2>6. Cookies</h2>
<p>Wir verwenden technisch notwendige sowie analytische Cookies. Die Verwaltung erfolgt über Ihre Browser-Einstellungen.</p>

<h2>7. Sicherheit</h2>
<p>Wir setzen strenge Sicherheitsmaßnahmen (Verschlüsselung, Backups, beschränkte Zugriffe) ein.</p>

<h2>8. Änderungen</h2>
<p>Wir behalten uns Aktualisierungen vor. Wesentliche Änderungen werden mitgeteilt.</p>

<h2>9. Kontakt</h2>
<p>Datenschutzanfragen: <a href="mailto:info@dasdeutschehaus.sy">info@dasdeutschehaus.sy</a></p>`,
  },

  terms: {
    slug: 'terms',
    title_ar: 'الشروط والأحكام',
    title_de: 'Allgemeine Geschäftsbedingungen',
    metaDescription_ar: 'الشروط والأحكام لاستخدام موقع وخدمات Das Deutsche Haus.',
    metaDescription_de: 'AGB von Das Deutsche Haus.',
    published: true,
    content_ar: `<h2>1. مقدّمة</h2>
<p>تحكم هذه الشروط استخدامك لموقع <strong>Das Deutsche Haus</strong> وخدماته. باستخدامك للموقع أو التسجيل في خدماتنا فإنك توافق على هذه الشروط.</p>

<h2>2. الخدمات</h2>
<p>نقدّم:</p>
<ul>
<li>كورسات اللغة الألمانية (A1 - C2)</li>
<li>امتحانات telc الرسمية المعتمدة</li>
<li>برامج التدريب المهني (Ausbildung)</li>
<li>استشارات تأشيرات الدراسة والعمل</li>
</ul>

<h2>3. التسجيل والحسابات</h2>
<ul>
<li>يجب تقديم بيانات صحيحة ومحدّثة عند التسجيل</li>
<li>أنت مسؤول عن سرية كلمة المرور وأي نشاط يتم من حسابك</li>
<li>يحقّ لنا إيقاف أي حساب يخالف الشروط</li>
</ul>

<h2>4. الدفع والاسترداد</h2>
<ul>
<li>الأسعار معروضة بوضوح على الموقع وقد تتغيّر بإشعار مسبق</li>
<li>الدفع مُسبق قبل بدء الكورس أو الامتحان</li>
<li>سياسة الاسترداد:
<ul>
<li>قبل بدء الكورس بـ7 أيام: استرداد كامل</li>
<li>قبل البدء بأقلّ من 7 أيام: استرداد 50%</li>
<li>بعد بدء الكورس: لا استرداد، لكن يمكن تأجيل التسجيل لدورة لاحقة</li>
<li>امتحانات telc: لا استرداد (إلا في حالات استثنائية موثّقة)</li>
</ul>
</li>
</ul>

<h2>5. الالتزامات الأكاديمية</h2>
<ul>
<li>الالتزام بمواعيد الحصص ومواد الكورس</li>
<li>احترام المعلمين والزملاء</li>
<li>عدم تسجيل الحصص أو نشر مواد المعهد بدون إذن</li>
</ul>

<h2>6. الملكية الفكرية</h2>
<p>كلّ المحتوى (دروس، فيديوهات، مواد، شعار) ملك حصري لـDas Deutsche Haus ولا يجوز نسخه أو إعادة نشره.</p>

<h2>7. حدود المسؤولية</h2>
<p>نسعى لتقديم أعلى جودة، لكن لا نضمن نتائج محدّدة في الامتحانات أو القبول الجامعي. النجاح يعتمد على جهد الطالب.</p>

<h2>8. تعديل الشروط</h2>
<p>يحقّ لنا تعديل هذه الشروط في أي وقت. الاستمرار في استخدام الموقع يعني قبول التعديلات.</p>

<h2>9. القانون المعمول به</h2>
<p>تخضع هذه الشروط للقوانين المعمول بها في الجمهورية العربية السورية.</p>

<h2>10. التواصل</h2>
<p>للأسئلة: <a href="mailto:info@dasdeutschehaus.sy">info@dasdeutschehaus.sy</a></p>`,
    content_de: `<h2>1. Geltungsbereich</h2>
<p>Diese AGB regeln die Nutzung der Website und Dienstleistungen von <strong>Das Deutsche Haus</strong>. Mit der Nutzung erkennen Sie diese Bedingungen an.</p>

<h2>2. Dienstleistungen</h2>
<ul>
<li>Deutschkurse (A1 – C2)</li>
<li>Offizielle telc-Prüfungen</li>
<li>Ausbildungsprogramme</li>
<li>Visa- und Studienberatung</li>
</ul>

<h2>3. Registrierung</h2>
<ul>
<li>Korrekte und aktuelle Angaben sind erforderlich</li>
<li>Sie sind für die Sicherheit Ihres Passworts verantwortlich</li>
<li>Wir behalten uns vor, Konten bei Verstößen zu sperren</li>
</ul>

<h2>4. Zahlung und Erstattung</h2>
<ul>
<li>Preise werden transparent angezeigt</li>
<li>Zahlung im Voraus vor Kurs- oder Prüfungsbeginn</li>
<li>Stornierung:
<ul>
<li>Bis 7 Tage vor Beginn: 100% Erstattung</li>
<li>Weniger als 7 Tage: 50% Erstattung</li>
<li>Nach Kursbeginn: keine Erstattung, aber Verschiebung möglich</li>
<li>telc-Prüfungen: keine Erstattung (außer in dokumentierten Ausnahmefällen)</li>
</ul>
</li>
</ul>

<h2>5. Akademische Pflichten</h2>
<ul>
<li>Einhalten der Kurszeiten und Materialien</li>
<li>Respektvoller Umgang mit Lehrkräften und Mitschülern</li>
<li>Keine Aufnahmen oder Veröffentlichung ohne Genehmigung</li>
</ul>

<h2>6. Geistiges Eigentum</h2>
<p>Alle Inhalte (Unterricht, Videos, Materialien, Logo) sind Eigentum von Das Deutsche Haus.</p>

<h2>7. Haftung</h2>
<p>Wir streben höchste Qualität an, garantieren jedoch keine spezifischen Prüfungsergebnisse oder Studienzulassungen.</p>

<h2>8. Änderungen</h2>
<p>Wir behalten uns Änderungen der AGB vor. Die fortgesetzte Nutzung gilt als Zustimmung.</p>

<h2>9. Anwendbares Recht</h2>
<p>Es gilt das Recht der Arabischen Republik Syrien.</p>

<h2>10. Kontakt</h2>
<p>Fragen: <a href="mailto:info@dasdeutschehaus.sy">info@dasdeutschehaus.sy</a></p>`,
  },

  impressum: {
    slug: 'impressum',
    title_ar: 'بيانات النشر (Impressum)',
    title_de: 'Impressum',
    metaDescription_ar: 'بيانات النشر القانونية لمعهد Das Deutsche Haus.',
    metaDescription_de: 'Impressum von Das Deutsche Haus gemäß § 5 TMG.',
    published: true,
    content_ar: `<h2>المعلومات وفق § 5 من قانون TMG الألماني</h2>

<h3>اسم الجهة</h3>
<p><strong>Das Deutsche Haus</strong><br>
المعهد الألماني للغة والتدريب المهني</p>

<h3>العنوان</h3>
<p>دمشق — المزة<br>
الجمهورية العربية السورية</p>

<h3>التواصل</h3>
<p>📞 الهاتف: <a href="tel:+963111234567" dir="ltr">+963 11 123 4567</a><br>
📧 البريد: <a href="mailto:info@dasdeutschehaus.sy">info@dasdeutschehaus.sy</a><br>
🌐 الموقع: <a href="https://dasdeutschehaus.sy">dasdeutschehaus.sy</a></p>

<h3>المسؤول عن المحتوى</h3>
<p>وفق § 55 الفقرة 2 من RStV:<br>
<strong>إدارة Das Deutsche Haus</strong><br>
دمشق، سوريا</p>

<h3>إخلاء المسؤولية</h3>
<p><strong>المحتوى:</strong> نُولي عناية فائقة لدقة معلومات موقعنا، لكن لا نتحمّل مسؤولية أي أخطاء أو معلومات غير محدّثة.</p>
<p><strong>الروابط الخارجية:</strong> لا نتحمّل مسؤولية محتوى المواقع المرتبطة من موقعنا.</p>
<p><strong>حقوق النشر:</strong> جميع المحتويات على الموقع محمية بحقوق النشر. أي إعادة استخدام تتطلّب إذناً مسبقاً.</p>

<h3>حلّ النزاعات</h3>
<p>للزوار من الاتحاد الأوروبي: منصّة الاتحاد الأوروبي لحلّ النزاعات عبر الإنترنت متاحة على <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noreferrer">ec.europa.eu/consumers/odr</a>.</p>
<p>لسنا ملزمين أو مستعدّين للمشاركة في إجراءات حلّ النزاعات أمام مجلس استهلاكي.</p>`,
    content_de: `<h2>Angaben gemäß § 5 TMG</h2>

<h3>Anbieter</h3>
<p><strong>Das Deutsche Haus</strong><br>
Institut für Deutsche Sprache und Berufsausbildung</p>

<h3>Anschrift</h3>
<p>Damaskus — Mazzeh<br>
Arabische Republik Syrien</p>

<h3>Kontakt</h3>
<p>📞 Telefon: <a href="tel:+963111234567" dir="ltr">+963 11 123 4567</a><br>
📧 E-Mail: <a href="mailto:info@dasdeutschehaus.sy">info@dasdeutschehaus.sy</a><br>
🌐 Website: <a href="https://dasdeutschehaus.sy">dasdeutschehaus.sy</a></p>

<h3>Verantwortlich für den Inhalt</h3>
<p>nach § 55 Abs. 2 RStV:<br>
<strong>Geschäftsleitung Das Deutsche Haus</strong><br>
Damaskus, Syrien</p>

<h3>Haftungsausschluss</h3>
<p><strong>Inhalt:</strong> Wir bemühen uns um aktuelle und korrekte Informationen, übernehmen jedoch keine Gewähr für Vollständigkeit oder Richtigkeit.</p>
<p><strong>Externe Links:</strong> Für Inhalte externer verlinkter Websites sind ausschließlich deren Betreiber verantwortlich.</p>
<p><strong>Urheberrecht:</strong> Alle Inhalte unterliegen dem Urheberrecht. Jede Vervielfältigung erfordert vorherige Zustimmung.</p>

<h3>Streitschlichtung</h3>
<p>Die EU-Kommission stellt eine Plattform zur Online-Streitbeilegung bereit: <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noreferrer">ec.europa.eu/consumers/odr</a>.</p>
<p>Wir sind weder bereit noch verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</p>`,
  },
}

export async function seedLegalPagesIfEmpty(db) {
  for (const slug of LEGAL_PAGES) {
    const existing = await db.collection('legal_pages').findOne({ slug })
    if (!existing) {
      const data = LEGAL_DEFAULTS[slug]
      await db.collection('legal_pages').insertOne({
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    }
  }
}
