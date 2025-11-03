# Deploy Qo'llanmasi

## ✅ To'g'ri yondashuv

**To'liq projectni deploy qilish to'g'ri!** Next.js full-stack framework bo'lgani uchun:
- Frontend (React pages)
- Backend (API routes `/pages/api/`)
- Bir xil serverda ishlaydi

**Qo'shimcha ma'lumot:** `RENDER_DEPLOY.md` faylida to'liq yo'riqnoma mavjud.

## 🔧 Render.com sozlamalari

### 1. Environment Variables

Render.com Dashboard'da quyidagi environment variables qo'shing:

```
MONGODB_URI=mongodb+srv://texnikum:texnikum123@cluster0.74inf1r.mongodb.net/code-editor?appName=Cluster0
JWT_SECRET=your-super-secret-jwt-key-change-this
NODE_ENV=production
```

### 2. Build Command

```
npm install && npm run build
```

### 3. Start Command

```
npm start
```

### 4. Root Directory

Agar project subdirectory'da bo'lsa, root directory'ni belgilang.

## ⚠️ Muhim xavfsizlik eslatmalari

1. **MongoDB connection string** kodda hardcoded bo'lmasligi kerak - `.env` faylida bo'lishi kerak
2. **JWT_SECRET** kuchli random string bo'lishi kerak (production'da)
3. **.env** fayllari Git'ga commit qilinmasligi kerak (`.gitignore` da)

## 📝 Tekshirish

Deploy'dan keyin quyidagilarni tekshiring:

1. ✅ API routes ishlayaptimi: `https://yourdomain.com/api/auth/login`
2. ✅ MongoDB ulanishi to'g'rimi
3. ✅ Environment variables to'g'ri sozlanganmi

