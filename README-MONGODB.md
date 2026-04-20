# 🗄️ دليل ربط MongoDB Atlas خطوة بخطوة

## الخطوة 1 — إنشاء حساب Atlas مجاني

1. اذهب إلى: **https://cloud.mongodb.com**
2. سجّل حساب مجاني (أو سجّل دخول بـ Google)
3. اختر الـ **Free Tier (M0)** — مجاني للأبد، 512MB

---

## الخطوة 2 — إنشاء Cluster

1. اضغط **"Build a Database"**
2. اختر **M0 Free**
3. اختر أي Region قريب منك (مثلاً Europe أو AWS us-east)
4. اضغط **Create**

---

## الخطوة 3 — إنشاء مستخدم للقاعدة

1. في قسم **Database Access** → **Add New Database User**
2. اختر **Password Authentication**
3. ضع اسم مستخدم مثل: `mahmoud`
4. ضع كلمة مرور قوية واحفظها
5. اضغط **Add User**

---

## الخطوة 4 — السماح للسيرفر بالاتصال (Network Access)

1. اذهب إلى **Network Access** → **Add IP Address**
2. اضغط **Allow Access from Anywhere** (يضع `0.0.0.0/0`)
3. هذا ضروري عشان Render يقدر يتصل
4. اضغط **Confirm**

---

## الخطوة 5 — الحصول على رابط الاتصال (Connection String)

1. اذهب لصفحة **Database** → اضغط **Connect**
2. اختر **"Drivers"**
3. اختر Driver: **Node.js** والإصدار **5.5 or later**
4. انسخ الرابط — سيبدو هكذا:

```
mongodb+srv://mahmoud:<password>@cluster0.xxxxx.mongodb.net/
```

5. **استبدل** `<password>` بكلمة المرور التي أنشأتها
6. **أضف** اسم قاعدة البيانات في النهاية:

```
mongodb+srv://mahmoud:كلمة_مرورك@cluster0.xxxxx.mongodb.net/wa3yna
```

---

## الخطوة 6 — تشغيل الـ Seed (مرة واحدة فقط)

```bash
# في جهازك المحلي أولاً
MONGODB_URI="mongodb+srv://mahmoud:<db_password>@cluster0.j0wnszm.mongodb.net/?appName=Cluster0" node backend/seed.js
```

سيظهر:
```
✅ متصل بـ MongoDB Atlas
✅ blog: 3 مقالات
✅ community: 1 مقال
✅ testimonials: 2 شهادة
🎉 Seed اكتمل!
```

---

## الخطوة 7 — رفع الموقع على Render

1. اذهب إلى **https://render.com** وسجّل بـ GitHub
2. اضغط **New Web Service**
3. اربط الـ Repository
4. الإعدادات:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. في قسم **Environment Variables** أضف:

| Key | Value |
|-----|-------|
| `MONGODB_URI` | `mongodb+srv://mahmoud:PASSWORD@cluster0.xxxxx.mongodb.net/wa3yna` |
| `PORT` | `3000` |

6. اضغط **Deploy** ✅

---

## الخطوة 8 — اختبار الـ API

بعد الـ deploy، اختبر:
```
https://your-app.onrender.com/api/posts?type=admin
```

يجب أن يرجع مقالات البلوج من MongoDB ✅

---

## 🔒 أمان مهم

- **لا تضع** رابط MongoDB في أي ملف يُرفع على GitHub
- استخدم دائماً **Environment Variables** في Render
- الـ `MONGODB_URI` يحتوي على كلمة المرور — احتفظ بها سرية

---

## 📊 هيكل قاعدة البيانات

```
wa3yna (Database)
├── blog          ← مقالات محمود
├── community     ← مقالات الجمهور (تحتاج موافقة)
├── testimonials  ← الشهادات (تحتاج موافقة)
└── contacts      ← رسائل التواصل
```
