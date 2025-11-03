# Render.com Deploy Qo'llanmasi

## ✅ To'g'ri yondashuv

**To'liq projectni deploy qilish to'g'ri!** Next.js full-stack framework bo'lgani uchun:
- Frontend (React pages)
- Backend (API routes `/pages/api/`)
- Bir xil serverda ishlaydi

## 📋 Qadamlar

### 1. Git Repository'ni tayyorlash

```bash
# Git repository mavjudligini tekshiring
git remote -v

# Agar yo'q bo'lsa, yarating
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/username/repo-name.git
git push -u origin main
```

### 2. Render.com'da yangi Web Service yaratish

1. **Render Dashboard** → **New** → **Web Service**
2. **Connect Repository** → GitHub repository'ni tanlang
3. **Service Details:**
   - **Name:** `code-editor` (yoki istalgan nom)
   - **Region:** Yaqin region tanlang
   - **Branch:** `main` (yoki `master`)
   - **Root Directory:** (bo'sh qoldiring, agar root'da bo'lsa)

### 3. Build & Start Commands

**Build Command:**
```bash
npm install && npm run build
```

**Start Command:**
```bash
npm start
```

### 4. Environment Variables (MUHIM!)

Render Dashboard → **Environment** tab → Quyidagilarni qo'shing:

```
MONGODB_URI=mongodb+srv://texnikum:texnikum123@cluster0.74inf1r.mongodb.net/code-editor?appName=Cluster0
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
NODE_ENV=production
```

**⚠️ Muhim:** `JWT_SECRET` ni kuchli random string bilan almashtiring (masalan: `openssl rand -base64 32`)

### 5. Advanced Settings

**Node Version:**
- `18.x` yoki `20.x` tanlang

**Auto-Deploy:**
- ✅ `Yes` - Har bir push'dan keyin avtomatik deploy

**Health Check Path:**
- `/api/auth/login` (yoki bo'sh qoldiring)

### 6. Deploy

1. **Create Web Service** tugmasini bosing
2. Deploy jarayoni boshlanadi (5-10 daqiqa)
3. Logs'da build va start jarayonini kuzating

## ✅ Tekshirish

### 1. API Endpoints

Deploy'dan keyin quyidagilarni tekshiring:

```bash
# Register endpoint
curl -X POST https://yourdomain.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","phone":"+998-93-123-45-67","password":"test123"}'

# Login endpoint
curl -X POST https://yourdomain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test123"}'
```

### 2. Frontend

```bash
# Browser'da oching
https://yourdomain.com
```

### 3. MongoDB Connection

Logs'da MongoDB connection xatolari bo'lishi mumkin:
- ✅ `Mongoose connected` - To'g'ri ulangan
- ❌ Connection error - `MONGODB_URI` ni tekshiring

## 🔧 Muammolarni hal qilish

### Build xatosi

**Muammo:** `Cannot find module` yoki TypeScript xatolari
**Yechim:** 
```bash
# Local'da build qilib tekshiring
npm run build
```

### Runtime xatosi

**Muammo:** `MONGODB_URI is not defined`
**Yechim:** Environment variables Render Dashboard'da to'g'ri qo'shilganini tekshiring

### API 404 xatosi

**Muammo:** `/api/auth/login` 404 qaytaradi
**Yechim:** 
- Root directory to'g'ri sozlanganini tekshiring
- `src/pages/api/` papkasi mavjudligini tekshiring

## 📝 Muhim eslatmalar

1. ✅ **To'liq project deploy qilish to'g'ri** - Next.js full-stack
2. ✅ **Environment variables** Render Dashboard'da qo'shish kerak
3. ✅ **JWT_SECRET** kuchli bo'lishi kerak (production'da)
4. ✅ **MongoDB connection string** xavfsiz bo'lishi kerak
5. ✅ **Git repository** public yoki Render'ga access berilgan bo'lishi kerak

## 🚀 Production optimizatsiyalar

1. **Custom Domain:** Render Dashboard → Settings → Custom Domain
2. **SSL:** Render avtomatik SSL beradi
3. **Monitoring:** Logs va Metrics tab'larida monitoring
4. **Scaling:** Kerak bo'lsa, scaling sozlang

