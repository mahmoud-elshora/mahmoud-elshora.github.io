// 1. إعدادات Tailwind
if (typeof tailwind !== 'undefined') {
    tailwind.config = {
        theme: {
            extend: {
                colors: {
                    'navy-primary': '#001F3F',
                    'gold-primary': '#D4AF37',
                    'brown-dark': '#3E2723',
                    'sky-blue': '#0288D1',
                    'cream-light': '#FAF9F6',
                }
            }
        }
    }
}

// 2. دالة التوست الموحدة (الرئيسية)
function showToast(msg, type) {
    const toast = document.getElementById('toast-container');
    if (!toast) return;

    const toastBox = toast.querySelector('div');
    const toastIcon = toast.querySelector('i');
    const toastTitle = toast.querySelector('h4');
    const toastText = document.getElementById('toast-msg');

    toastText.innerText = msg;

    if (type === "green") {
        toastTitle.innerText = "تم الإرسال بنجاح!";
        toastBox.style.backgroundColor = "#16a34a"; // أخضر
        toastBox.style.borderColor = "#14532d";
        if (toastIcon) toastIcon.className = "bi bi-check-circle-fill text-2xl";
    } else {
        toastTitle.innerText = "خطأ في البيانات!";
        toastBox.style.backgroundColor = "#dc2626"; // أحمر
        toastBox.style.borderColor = "#991b1b";
        if (toastIcon) toastIcon.className = "bi bi-exclamation-octagon-fill text-2xl";
    }

    toast.classList.remove('translate-x-[150%]');
    
    // يختفي لوحده بعد 4 ثواني في حالة النجاح فقط
    if (type === "green") {
        setTimeout(closeToast, 4000);
    }
}

function closeToast() {
    const toast = document.getElementById('toast-container');
    if (toast) toast.classList.add('translate-x-[150%]');
}

// 3. انتظر تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    
    // قائمة الموبايل
    const menuBtn = document.getElementById('menu-btn');
    const menu = document.getElementById('menu');
    if (menuBtn && menu) {
        menuBtn.addEventListener('click', () => {
            menu.classList.toggle('hidden');
            menu.classList.toggle('flex');
            menuBtn.classList.toggle('open');
        });
    }

    // منع الحروف في خانة التليفون
    const phoneInput = document.getElementById('phoneInput');
    if (phoneInput) {
        phoneInput.addEventListener('keypress', (e) => {
            if (e.which < 48 || e.which > 57) e.preventDefault();
        });
        phoneInput.addEventListener('paste', (e) => {
            const pasteData = e.clipboardData.getData('text');
            if (/[^0-9]/.test(pasteData)) {
                e.preventDefault();
                showToast("عفواً يا محمود! مسموح بالأرقام فقط.", "red");
            }
        });
    }

    // التحقق عند الإرسال
    const contactForm = document.getElementById('mainContactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
    
            const inputs = this.querySelectorAll('.form-input');
            const phoneError = document.getElementById('phoneError');
            let hasError = false;
    
            inputs.forEach(input => {
                if (input.hasAttribute('required') && !input.value.trim()) {
                    input.style.borderColor = "#dc2626";
                    hasError = true;
                } else {
                    input.style.borderColor = "#E2E8F0";
                }
            });
    
            // فحص الـ 11 رقم
            if (phoneInput && phoneInput.value.trim().length !== 11) {
                phoneInput.style.borderColor = "#dc2626";
                if (phoneError) phoneError.classList.remove('hidden');
                hasError = true;
            } else {
                if (phoneError) phoneError.classList.add('hidden');
            }
    
            if (hasError) {
                showToast("يرجى تصحيح الأخطاء المطلوبة.", "red");
            } else {
                showToast("عاش يا بطل! تم إرسال طلبك بنجاح.", "green");
                this.reset();
            }
        });
    }

    // السكرول الانسيابي
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                if (menu) menu.classList.add('hidden');
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // أنميشين Reveal
    const reveal = () => {
        const reveals = document.querySelectorAll(".reveal");
        reveals.forEach(el => {
            if (el.getBoundingClientRect().top < window.innerHeight - 100) {
                el.classList.add("active");
            }
        });
    };
    window.addEventListener("scroll", reveal);
    reveal();
});
function updateClock() {
    const clockEl = document.getElementById('clock');
    const now = new Date();

    // ساعات ودقائق وثواني
    let hours = now.getHours().toString().padStart(2, '0');
    let minutes = now.getMinutes().toString().padStart(2, '0');
    let seconds = now.getSeconds().toString().padStart(2, '0');

    clockEl.innerText = `${hours}:${minutes}:${seconds}`;
}

// تحديث كل ثانية
setInterval(updateClock, 1000);

// أول مرة نعرض الوقت بدون انتظار ثانية
updateClock();
const langToggle = document.getElementById("langSwitch");

let lang = localStorage.getItem("lang") || "ar";

function applyLang() {
    if(lang === "en"){
        document.documentElement.dir = "ltr";
        document.documentElement.lang = "en";
        document.body.classList.add("lang-active");
    } else {
        document.documentElement.dir = "rtl";
        document.documentElement.lang = "ar";
        document.body.classList.remove("lang-active");
    }

    localStorage.setItem("lang", lang);
}

// أول تحميل
applyLang();

// عند الضغط
if(langToggle){
    langToggle.addEventListener("click", () => {
        lang = (lang === "ar") ? "en" : "ar";
        applyLang();
    });
}
const panel = document.getElementById("panel");
const openBtn = document.getElementById("openPanel");
const closeBtn = document.getElementById("closePanel");

openBtn.addEventListener("click", () => {
    panel.classList.add("active");
});

closeBtn.addEventListener("click", () => {
    panel.classList.remove("active");
});