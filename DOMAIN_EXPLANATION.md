# Domain va Backend/Frontend Tuzilishi

## ✅ To'g'ri yondashuv (hozirgi holat)

**Sizning yondashuvingiz to'g'ri!** Next.js full-stack framework bo'lgani uchun:

### Hozirgi struktura:
```
Frontend:  texnikum.xyz
Backend:   texnikum.xyz/api/auth/login
```

**Bu to'g'ri va normal yondashuv!**

## 📊 Next.js Full-Stack Model

### Bir xil domain'da (Sizning holatingiz):

```
✅ texnikum.xyz              → Frontend (React pages)
✅ texnikum.xyz/api/auth/login   → Backend API (Next.js API routes)
✅ texnikum.xyz/api/auth/register → Backend API
```

**Afzalliklari:**
- ✅ Oddiy sozlash (bir domain)
- ✅ CORS muammosi yo'q (bir xil origin)
- ✅ SSL sertifikati bir xil
- ✅ Cookie'lar oson sozlanadi
- ✅ Next.js'ning standart yondashuvi

## 🤔 Alohida subdomain'da (Kerak emas, lekin mumkin)

Agar kerak bo'lsa, backend'ni alohida subdomain'ga o'tkazish mumkin:

```
Frontend:  texnikum.xyz
Backend:   api.texnikum.xyz
```

**Qachon kerak:**
- Agar backend'ni alohida server'ga deploy qilmoqchi bo'lsangiz
- Agar microservices architecture ishlatmoqchi bo'lsangiz
- Agar backend'ni boshqa framework'da yozgan bo'lsangiz (masalan, Express.js)

**Sizning holatingizda:** **Kerak emas!** Chunki:
- Next.js API routes bir xil serverda ishlaydi
- Bir xil domain'da ishlash to'g'ri
- Qo'shimcha sozlash kerak emas

## 🔧 Hozirgi sozlash

### API Endpoints (Bir xil domain'da):

```javascript
// src/lib/api.ts
const API_BASE = '/api/auth';  // ✅ To'g'ri!

// Bu quyidagilarga translate qilinadi:
// texnikum.xyz/api/auth/login
// texnikum.xyz/api/auth/register
```

### Frontend Pages:

```
texnikum.xyz/          → Index (redirect to /auth or /home)
texnikum.xyz/auth      → Auth page
texnikum.xyz/home      → Editor page
```

## 📝 Domain sozlash

### Render.com yoki Vercel'da:

1. **Custom Domain** sozlang:
   - Render Dashboard → Settings → Custom Domain
   - Yoki Vercel Dashboard → Settings → Domains
   - `texnikum.xyz` ni qo'shing

2. **DNS sozlash:**
   - A record yoki CNAME record
   - Render/Vercel'ning DNS sozlamalariga ko'ra

3. **SSL sertifikati:**
   - Render/Vercel avtomatik SSL beradi
   - HTTPS ishlaydi

## ✅ Xulosa

**Sizning yondashuvingiz to'liq to'g'ri:**
- ✅ Full project deploy qilish to'g'ri
- ✅ Bir xil domain'da backend va frontend to'g'ri
- ✅ `api.texnikum.xyz` kerak emas
- ✅ `texnikum.xyz/api/...` to'g'ri struktura

**Kerak emas:**
- ❌ Alohida backend subdomain
- ❌ Alohida backend server
- ❌ CORS sozlash (bir xil domain)
- ❌ Qo'shimcha reverse proxy

## 🎯 Production Best Practices

Sizning yondashuvingiz production'da ham to'g'ri va:
- ✅ SEO-friendly (bir xil domain)
- ✅ Performance (bir xil server)
- ✅ Simplicity (oddiy sozlash)
- ✅ Security (bir xil SSL)

## 📚 Qo'shimcha ma'lumot

Next.js'ning rasmiy hujjatlarida ham API routes bir xil domain'da ishlatiladi:
- `/api/` - API routes uchun standart path
- Bir xil server'da ishlaydi
- Alohida subdomain kerak emas

