# 🌟 موقع مبادرة وعينا — محمود أحمد الشوري

> **بصوتنا نقرر • بأيدينا نغير**

---

## 📁 هيكل المشروع

```
perfect claude v9/
│
├── index.html                 ← الصفحة الرئيسية
├── styles.css                 ← تنسيق الصفحة الرئيسية
├── script.js                  ← منطق الصفحة الرئيسية
│
├── pages/                     ← الصفحات الفرعية (15 صفحة)
│   ├── initiative.html        ← مبادرة وعينا
│   ├── activities.html        ← الأنشطة
│   ├── projects.html          ← المشاريع والابتكارات
│   ├── cv.html                ← السيرة الذاتية
│   ├── skills.html            ← المهارات
│   ├── achivements.html       ← الأرقام والإحصائيات
│   ├── stats.html             ← الإحصائيات التفصيلية
│   ├── blog.html              ← المدونة
│   ├── blog-post.html         ← قالب مقال
│   └── community.html         ← المجتمع
│   └── community-post.html    ← منشوارات المجتمع
│   ├── testimonials.html      ← الشهادات والآراء
│   └── contact.html           ← تواصل معنا
│   └── login.html             ← للوصول لملف الادمين
│   └── admin.html             ← للتحكم بالمقالات والشهادات 
│ 
├── assets/                     ← كل الملفات والصور المساعدة
│   ├── images        ← لكل الصور
│   ├── other       ← احتياطا
│ 
├── node_modules/                     ← يحتوي علي كم كبير من المجلدات
│ 
│
├── styles/                    ← ملفات CSS
│   ├── main.css               ← 🎨 CSS المشترك (variables + base)
│   ├── initiative.css         ← تيل + أخضر زمردي
│   ├── activities.css         ← برتقالي نيون + ذهبي
│   ├── projects.css           ← بنفسجي + وردي
│   └── pages.css              ← CSS بقية الصفحات (cv/blog/contact...)
│   └── pages-common.css       ← ملف مساعد لكل صفحة
│
├── scripts/                   ← ملفات JavaScript
│   ├── components.js          ← ⚡ JS المشترك (nav + particles + theme...)
│   └── page-scripts.js        ← JS خاص بكل صفحة
│
├── backend/                   ← 🖥️ الخادم (Backend)
│   ├── server.js              ← Express API server
│   └── seed.js                ← بيانات تجريبية
│   
├──── data/                      ← 📦 تم الاستغناء عنه لاستخدام مونجو وهو موجدو في مجلد الباك اند احتياطا
│   ├── 
│
├── package-lock.json
├── package.json
├── README-MONGODB.md
└── README.md
└── robots.txt
└── sitemap.xml
└── .gitignore
└── .env
```

---

## 🎨 لوحة ألوان كل صفحة

| الصفحة | اللون الرئيسي | الثانوي | المزاج |
|--------|--------------|---------|--------|
| الرئيسية | `#00e5ff` سماوي | `#00e676` أخضر | احترافي |
| المبادرة | `#00e5d4` تيل | `#00c853` زمردي | نمو · ثقة |
| الأنشطة | `#ff6d00` برتقالي | `#ffd600` ذهبي | طاقة · حماس |
| المشاريع | `#d500f9` بنفسجي | `#f50057` وردي | ابتكار · تقنية |
| السيرة الذاتية | `#2979ff` أزرق | `#82b1ff` فضي | مهني · موثوق |
| المهارات | `#00b8d4` سماوي جليدي | `#80deea` أيس | دقة · برود |
| الأرقام | `#ffd600` ذهبي | `#ffab00` عنبري | إنجاز · بهجة |
| الإحصائيات | `#7c4dff` بنفسجي غامق | `#b388ff` لافندر | تحليل · عمق |
| المدونة | `#f50057` ماجنتا | `#ff4081` وردي ساخن | إبداع · تعبير |
| الشهادات | `#ff1744` قرمزي | `#ff6090` وردي دافئ | عاطفة · ثقة |
| تواصل | `#76ff03` ليموني | `#00e5d4` تيل | حيوية · انفتاح |

---

## ⚡ تشغيل الموقع بدون Backend

```bash
# فقط افتح index.html في المتصفح
# جميع الصفحات تعمل offline بلا خادم
# النماذج ستفتح تطبيق البريد كبديل تلقائي
```

## 🖥️ تشغيل الموقع مع Backend

```bash
# 1. تثبيت الحزم
npm install

# 2. إضافة البيانات التجريبية
node backend/seed.js

# 3. تشغيل الخادم
npm start           # Production
npm run dev         # Development (auto-restart)
```

## 🔐 إعدادات البيئة (.env)

```env
PORT=3000
ADMIN_TOKEN=ضع_هنا_كلمة_سر_قوية
ALLOWED_ORIGIN=https://yoursite.com
```

---

## 🌐 API Endpoints

### Contact
| Method | URL | وصف |
|--------|-----|-----|
| `POST` | `/api/contact` | إرسال رسالة |
| `GET`  | `/api/contact` | 🔒 استعراض الرسائل |
| `PUT`  | `/api/contact/:id/read` | 🔒 تحديد كمقروء |
| `DELETE` | `/api/contact/:id` | 🔒 حذف رسالة |

### Testimonials
| Method | URL | وصف |
|--------|-----|-----|
| `GET`  | `/api/testimonials` | عرض الشهادات المعتمدة |
| `POST` | `/api/testimonials` | إرسال شهادة جديدة |
| `PUT`  | `/api/testimonials/:id/approve` | 🔒 اعتماد شهادة |
| `DELETE` | `/api/testimonials/:id` | 🔒 حذف شهادة |

### Blog
| Method | URL | وصف |
|--------|-----|-----|
| `GET`  | `/api/posts` | قائمة المقالات |
| `GET`  | `/api/posts/:slug` | مقال واحد |
| `POST` | `/api/posts` | 🔒 إضافة مقال |
| `PUT`  | `/api/posts/:id` | 🔒 تعديل مقال |
| `DELETE` | `/api/posts/:id` | 🔒 حذف مقال |

### Comments
| Method | URL | وصف |
|--------|-----|-----|
| `GET`  | `/api/comments?postSlug=xxx` | تعليقات مقال |
| `POST` | `/api/comments` | إضافة تعليق |
| `PUT`  | `/api/comments/:id/approve` | 🔒 اعتماد تعليق |

> 🔒 = يتطلب Header: `Authorization: Bearer [ADMIN_TOKEN]`

---

## 📱 المميزات التقنية

- ✅ **Offline First** — يعمل بلا خادم
- ✅ **Dark/Light Mode** — وضعان مع حفظ الاختيار
- ✅ **Arabic/English** — لغتان مع حفظ الاختيار
- ✅ **Particles Canvas** — جسيمات متحركة
- ✅ **Custom Cursor** — مؤشر مخصص
- ✅ **Scroll Reveal** — ظهور العناصر عند التمرير
- ✅ **Animated Counters** — عدادات متحركة
- ✅ **Skill Bars** — أشرطة مهارات متحركة
- ✅ **Rate Limiting** — حماية من الإساءة
- ✅ **Input Sanitization** — تنظيف المدخلات
- ✅ **Admin Panel** — لوحة تحكم عبر API

---

**صُنع بـ ❤️ لمحمود أحمد الشوري | محافظة كفر الشيخ، مصر**
