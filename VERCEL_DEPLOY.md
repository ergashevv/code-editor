# Vercel Deploy Qo'llanmasi

## ✅ Vercel - Next.js uchun eng yaxshi platforma

Vercel Next.js'ni yaratgan kompaniya, shuning uchun avtomatik optimizatsiyalar mavjud.

## 🚀 Deploy Qadamlar

### 1. Vercel Account

1. [vercel.com](https://vercel.com) ga kiring
2. GitHub account bilan ulaning
3. **New Project** tugmasini bosing

### 2. Repository'ni ulash

1. **Import Git Repository** → GitHub repository'ni tanlang
2. **Configure Project:**
   - **Framework Preset:** Next.js (avtomatik aniqlanadi)
   - **Root Directory:** `./` (agar root'da bo'lsa)
   - **Build Command:** (avtomatik) `npm run build`
   - **Output Directory:** `.next` (avtomatik)
   - **Install Command:** `npm install`

### 3. Environment Variables (MUHIM!)

**Settings** → **Environment Variables** bo'limida quyidagilarni qo'shing:

```
MONGODB_URI=mongodb+srv://texnikum:texnikum123@cluster0.74inf1r.mongodb.net/code-editor?appName=Cluster0
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
NODE_ENV=production
```

**⚠️ Muhim:** 
- `JWT_SECRET` ni kuchli random string bilan almashtiring
- Production, Preview, Development uchun ham qo'shing (yoki faqat Production)

### 4. Deploy

1. **Deploy** tugmasini bosing
2. Vercel avtomatik build va deploy qiladi (2-5 daqiqa)

## 🔧 Vercel'da Sozlamalar

### API Routes

Vercel Next.js API routes'ni avtomatik taniydi:
- `/pages/api/auth/register` → `https://yourdomain.vercel.app/api/auth/register`
- `/pages/api/auth/login` → `https://yourdomain.vercel.app/api/auth/login`

### Edge Functions vs Serverless Functions

- **API Routes** default Serverless Functions sifatida ishlaydi
- MongoDB connection caching ishlashi kerak (`lib/mongodb.ts`)

### Build Settings

Vercel avtomatik aniqlaydi:
- **Node.js Version:** 18.x yoki 20.x (avtomatik)
- **Build Command:** `npm run build`
- **Output Directory:** `.next`

## ✅ Tekshirish

### 1. API Endpoints

Deploy'dan keyin browser'da yoki curl bilan test qiling:

```bash
# Register
curl -X POST https://yourdomain.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","phone":"+998-93-123-45-67","password":"test123"}'

# Login
curl -X POST https://yourdomain.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"test123"}'
```

### 2. Frontend

Browser'da:
- `https://yourdomain.vercel.app/` - redirect to `/auth` or `/home`
- `https://yourdomain.vercel.app/auth` - Auth page
- `https://yourdomain.vercel.app/home` - Editor page (protected)

## 🐛 Muammo hal qilish

### API Routes 405 yoki 404

**Muammo:** API routes ishlamayapti

**Yechim:**
1. Environment variables tekshiring
2. Vercel Dashboard → **Functions** tab → Logs'ni ko'ring
3. MongoDB connection string to'g'rimi?

### Build xatosi

**Muammo:** Build muvaffaqiyatsiz

**Yechim:**
1. **Logs** tab'da build log'larni ko'ring
2. Local'da `npm run build` qilib tekshiring
3. Environment variables to'g'ri qo'shilganini tekshiring

### MongoDB Connection Error

**Muammo:** MongoDB'ga ulanib bo'lmayapti

**Yechim:**
1. MongoDB Atlas → **Network Access** → IP whitelist'ga `0.0.0.0/0` qo'shing (yoki Vercel IP'larni)
2. `MONGODB_URI` to'g'ri formatda ekanligini tekshiring
3. Database name to'g'ri ekanligini tekshiring (`code-editor`)

## 📊 Vercel vs Render.com

| Xususiyat | Vercel | Render.com |
|-----------|--------|------------|
| Next.js Optimizatsiya | ✅ Avtomatik | ⚠️ Manual |
| Edge Functions | ✅ | ❌ |
| Build Time | 2-5 daqiqa | 5-10 daqiqa |
| Free Tier | ✅ Generous | ✅ Generous |
| Auto Deploy | ✅ | ✅ |
| Environment Variables | ✅ Easy | ✅ Easy |

## 🎯 Tavsiya

**Vercel** Next.js uchun eng yaxshi variant:
- Avtomatik optimizatsiya
- Tez deploy
- Edge Functions
- Automatic HTTPS
- CDN

## 🔗 Foydali Linklar

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js on Vercel](https://vercel.com/docs/frameworks/nextjs)
- [Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

