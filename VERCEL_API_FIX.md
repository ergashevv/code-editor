# Vercel API Routes 404 Xatosi - Yechim

## 🔍 Muammo

`/api/auth/login` va `/api/auth/register` endpoint'lari Vercel'da `404 Not Found` qaytarayapti.

## ✅ Yechimlar

### 1. Vercel Dashboard'da tekshirish

**Vercel Dashboard** → **Functions** tab → API route'lar build qilinganini tekshiring:
- `/api/auth/login`
- `/api/auth/register`

Agar `Functions` tab'da ular ko'rinmasa, build xatosi bo'lishi mumkin.

### 2. Build Log'larni tekshirish

**Vercel Dashboard** → **Deployments** → Eng oxirgi deployment → **Build Logs**:

Qidiruv so'zi: `api/auth`
- API routes build qilinganini ko'rsatishi kerak
- Agar xatolar bo'lsa, ularni ko'ring

### 3. Environment Variables tekshirish

**Vercel Dashboard** → **Settings** → **Environment Variables**:

Quyidagilar **Production** uchun qo'shilgan bo'lishi kerak:
```
MONGODB_URI=mongodb+srv://texnikum:texnikum123@cluster0.74inf1r.mongodb.net/code-editor?appName=Cluster0
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
NODE_ENV=production
```

### 4. Qayta Deploy

1. **Redeploy** tugmasini bosing
2. Yoki Git'ga yangi commit qiling:
```bash
git commit --allow-empty -m "Trigger rebuild"
git push
```

### 5. API Route Structure tekshirish

Fayl struktura:
```
src/pages/api/auth/
  ├── login.ts
  └── register.ts
```

Bu to'g'ri struktura. Next.js avtomatik taniydi.

### 6. Local'da test qiling

Local'da build qilib tekshiring:

```bash
npm run build
npm start
```

Keyin:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test123"}'
```

Agar local'da ishlasa, Vercel'da ham ishlashi kerak.

### 7. Vercel'da Functions tekshirish

**Vercel Dashboard** → **Functions** tab → Quyidagilar ko'rinishi kerak:
- `api/auth/login` (Serverless Function)
- `api/auth/register` (Serverless Function)

Agar ko'rinmasa, build xatosi yoki path muammosi bo'lishi mumkin.

## 🚨 Ko'p uchraydigan muammolar

### 1. Build xatosi

**Yechim:** Build log'larni tekshiring va xatolarni tuzating.

### 2. Environment Variables yo'q

**Yechim:** Vercel Dashboard'da qo'shing.

### 3. API route path noto'g'ri

**Yechim:** `src/pages/api/auth/login.ts` struktura to'g'ri ekanligini tekshiring.

### 4. Vercel cache muammosi

**Yechim:** 
- **Redeploy** qiling
- Yoki **Clear Build Cache** tugmasini bosing

## 📝 Test qilish

Deploy'dan keyin browser console'da yoki curl bilan:

```bash
curl -X POST https://texnikum.xyz/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test123"}'
```

Agar hali ham 404 bo'lsa, Vercel support'ga yozing yoki build log'larni batafsil tekshiring.

