# 405 Method Not Allowed - Muammo hal qilish

## 🔍 Muammo

API endpoint'larda `405 Method Not Allowed` xatosi.

## ✅ Yechimlar

### 1. Render.com'da tekshirish

**Render Dashboard → Logs** bo'limida quyidagilarni tekshiring:

```bash
# Build log'larida API routes build qilinganini tekshiring
# Start log'larida server ishga tushganini tekshiring
```

### 2. Environment Variables

Render Dashboard → **Environment** tab'da quyidagilar bo'lishi kerak:

```
MONGODB_URI=mongodb+srv://texnikum:texnikum123@cluster0.74inf1r.mongodb.net/code-editor?appName=Cluster0
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
NODE_ENV=production
```

### 3. Build Command tekshirish

Render Dashboard → **Settings** → **Build & Deploy**:

**Build Command:**
```bash
npm install && npm run build
```

**Start Command:**
```bash
npm start
```

### 4. API Route tekshirish

Browser'da to'g'ridan-to'g'ri test qiling:

```bash
# Register
curl -X POST https://texnikum.xyz/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","phone":"+998-93-123-45-67","password":"test123"}'

# Login
curl -X POST https://texnikum.xyz/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test123"}'
```

### 5. Next.js Build tekshirish

Local'da build qilib tekshiring:

```bash
npm run build
npm start
# Keyin http://localhost:3000/api/auth/register ni test qiling
```

### 6. Render.com'da qayta deploy

1. Render Dashboard → **Manual Deploy** → **Deploy latest commit**
2. Yoki Git'ga yangi commit qiling va avtomatik deploy bo'ladi

### 7. Server log'larni tekshirish

Render Dashboard → **Logs** bo'limida:
- MongoDB connection xatolari
- API route call'lari
- Error messages

## 🚨 Ko'p uchraydigan muammolar

1. **Environment variables yo'q** → Render Dashboard'da qo'shing
2. **Build xatosi** → Build command'ni tekshiring
3. **API routes build qilinmagan** → `.next/server/pages/api/` papkasi mavjudligini tekshiring
4. **Server ishlamayapti** → Start command'ni tekshiring

