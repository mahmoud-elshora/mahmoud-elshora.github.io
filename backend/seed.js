/* ================================================================
   SEED.JS — Add sample data for testing
   Run: node backend/seed.js
   ================================================================ */

const fs   = require('fs');
const path = require('path');
const crypto = require('crypto');

const DB_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });

const write = (file, data) => fs.writeFileSync(path.join(DB_DIR, file), JSON.stringify(data, null, 2), 'utf8');

/* ── Sample Testimonials ── */
write('testimonials.json', [
  {
    id: crypto.randomUUID(),
    name: 'الأستاذة أميرة',
    role: 'مشرفة اتحاد الطلاب',
    message: 'محمود طالب استثنائي بكل معنى الكلمة. يتميز بإحساسه المرهف بالمسؤولية وقدرته الفائقة على القيادة وتحفيز زملائه.',
    rating: 5,
    approved: true,
    createdAt: new Date(Date.now() - 7 * 864e5).toISOString(),
    approvedAt: new Date(Date.now() - 6 * 864e5).toISOString(),
  },
  {
    id: crypto.randomUUID(),
    name: 'عمر',
    role: 'زميل في اتحاد الطلاب',
    message: 'شرف لي أن أكون زميلاً لمحمود. إنسان يعمل بجدية واجتهاد ويضع مصلحة الجميع فوق كل اعتبار.',
    rating: 5,
    approved: true,
    createdAt: new Date(Date.now() - 5 * 864e5).toISOString(),
    approvedAt: new Date(Date.now() - 4 * 864e5).toISOString(),
  },
  {
    id: crypto.randomUUID(),
    name: 'مسؤول مؤسسة YLF',
    role: 'عميل وشريك',
    message: 'أنجز محمود موقع مؤسستنا بمستوى احترافي مذهل لشاب في سنه. يتعلم بسرعة مدهشة ويطبق ما تعلمه بإبداع حقيقي.',
    rating: 5,
    approved: true,
    createdAt: new Date(Date.now() - 3 * 864e5).toISOString(),
    approvedAt: new Date(Date.now() - 2 * 864e5).toISOString(),
  },
  {
    id: crypto.randomUUID(),
    name: 'طالبة من المدرسة',
    role: 'مستفيدة من أنشطة المبادرة',
    message: 'مبادرة وعينا أحدثت فرقاً حقيقياً في مدرستنا. البرامج التوعوية رفعت من مستوى الوعي بشكل ملحوظ.',
    rating: 5,
    approved: true,
    createdAt: new Date(Date.now() - 2 * 864e5).toISOString(),
    approvedAt: new Date(Date.now() - 864e5).toISOString(),
  },
  {
    id: crypto.randomUUID(),
    name: 'زائر',
    role: 'زائر للموقع',
    message: 'شهادة في انتظار الموافقة — مثال للبيانات التجريبية',
    rating: 4,
    approved: false,
    createdAt: new Date().toISOString(),
  },
]);

/* ── Sample Blog Posts ── */
write('posts.json', [
  {
    id: crypto.randomUUID(),
    slug: 'our-voice-decides-2025',
    title: 'بصوتنا نقرر — كيف أثّرت في مجتمعي وأنا في السادسة عشرة؟',
    titleEn: 'With Our Voice We Decide — How I Made Change at 16',
    body: `كثيراً ما يُقال إن التغيير يحتاج إلى موارد ضخمة ومناصب رفيعة وسنوات طويلة من الخبرة. لكنني أثبتُ لنفسي أن التغيير الحقيقي يبدأ من قرار صادق أن تُحدث فارقاً.

عندما أطلقت مبادرة "وعينا"، لم أكن أملك سوى الحماس والإيمان بأن الطلاب يستحقون بيئة تعليمية أفضل.

## ما الذي حققناه؟

- إذاعات مدرسية متنوعة أحدثت أثراً ملموساً
- محاضرات تثقيفية حضرها العشرات من الطلاب
- مجلات حائطية إبداعية حوّلت جدران المدرسة

## رسالتي لك

إذا كنت طالباً يقرأ هذا وفي قلبه فكرة — ابدأ الآن. لا تنتظر الظروف المثالية.

**بصوتنا نقرر. بأيدينا نغير.**`,
    category: 'قيادة',
    coverEmoji: '🎤',
    published: true,
    views: 47,
    createdAt: new Date(Date.now() - 10 * 864e5).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 864e5).toISOString(),
  },
  {
    id: crypto.randomUUID(),
    slug: 'electric-generator-story',
    title: 'كيف صنعت مولداً كهربائياً في غرفتي؟',
    titleEn: 'How I Built an Electric Generator in My Room',
    body: `قصة اختراعي العلمي الأول — بين الفشل والمحاولة والنجاح في النهاية.

## البداية

كان الأمر بسيطاً في البداية: كنت أدرس الفيزياء وانبهرت بمبدأ الحثّ الكهرومغناطيسي. تساءلت: هل يمكنني بناء مولد حقيقي؟

## التحديات

فشلت في المحاولة الأولى والثانية والثالثة. لكن كل فشل علّمني شيئاً جديداً عن الدوائر الكهربائية والمغانط.

## النجاح

في المحاولة الخامسة، أضاء مصباح LED صغير بالكهرباء التي ولّدتها بنفسي. كان شعوراً لا يُوصف!`,
    category: 'ابتكار',
    coverEmoji: '💡',
    published: true,
    views: 33,
    createdAt: new Date(Date.now() - 8 * 864e5).toISOString(),
    updatedAt: new Date(Date.now() - 8 * 864e5).toISOString(),
  },
  {
    id: crypto.randomUUID(),
    slug: 'national-first-place',
    title: 'يوم فزت بالمركز الأول جمهورياً',
    titleEn: 'The Day I Won First Place Nationally',
    body: `ذكريات يوم لا يُنسى — كيف استعددت لمسابقة دوري المكاتب التنفيذية.

كانت المنافسة شديدة من طلاب مميزين من محافظات مصر. لكن الاستعداد الجيد والثقة بالنفس كانا سلاحي الأقوى.`,
    category: 'قيادة',
    coverEmoji: '🏆',
    published: true,
    views: 58,
    createdAt: new Date(Date.now() - 6 * 864e5).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 864e5).toISOString(),
  },
]);

/* ── Empty collections ── */
write('contacts.json', []);
write('comments.json', []);

console.log('✅ Seed data created successfully!');
console.log('📁 Data files in:', DB_DIR);
