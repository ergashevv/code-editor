# Render.com 404 API Routes - Yechim

## 🔍 Muammo

Render.com'da `/api/auth/login` va `/api/auth/register` endpoint'lari `404 Not Found` qaytarayapti.

## ✅ Yechimlar

### 1. Environment Variables (MUHIM!)

Render Dashboard → **Environment** tab → Quyidagilar **barchasi** qo'shilgan bo'lishi kerak:

```
MONGODB_URI=mongodb+srv://texnikum:texnikum123@cluster0.74inf1r.mongodb.net/code-editor?appName=Cluster0
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
NODE_ENV=production
```

**⚠️ Muhim:** Har bir variable qo'shilganini tekshiring!

### 2. Build Command tekshirish

Render Dashboard → **Settings** → **Build & Deploy**:

**Build Command:**
```bash
npm install && npm run build
```

**Start Command:**
```bash
npm start
```

### 3. Build Log'larini tekshirish

Render Dashboard → **Logs** tab → **Build Logs**:

Qidiruv so'zi: `api/auth` yoki `pages/api`
- API routes build qilinganini ko'rsatishi kerak
- Agar xatolar bo'lsa, ularni ko'ring

**Muhim xatolar:**
- `Cannot find module` → Dependencies muammosi
- `JWT_SECRET is not defined` → Environment variable yo'q
- `MONGODB_URI is not defined` → Environment variable yo'q

### 4. Root Directory tekshirish

Render Dashboard → **Settings** → **Build & Deploy**:

**Root Directory:**
- Agar project root'da bo'lsa: **bo'sh qoldiring**
- Agar subdirectory'da bo'lsa: papka nomini kiriting

### 5. API Route Structure tekshirish

Fayl struktura **to'g'ri** bo'lishi kerak:
```
src/pages/api/auth/
  ├── login.ts
  └── register.ts
```

### 6. Qayta Deploy

1. **Manual Deploy** → **Deploy latest commit**
2. Yoki Git'ga yangi commit qiling:
```bash
git add .
git commit -m "Fix API routes for Render"
git push
```

### 7. Runtime Log'larini tekshirish

Render Dashboard → **Logs** tab → **Runtime Logs**:

API so'rov yuborilganda quyidagilar ko'rinishi kerak:
- MongoDB connection log'lari
- API route handler log'lari
- Error messages

## 🚨 Ko'p uchraydigan muammolar

### 1. Environment Variables yo'q

**Belgi:** Build muvaffaqiyatli, lekin API 404 yoki 500 qaytaradi

**Yechim:** 
- Render Dashboard → **Environment** → Barcha variable'lar qo'shilganini tekshiring
- **Save Changes** tugmasini bosing

### 2. Build xatosi

**Belgi:** Build log'larda xatolar

**Yechim:**
- Build log'larni to'liq o'qing
- Xatolarni tuzating
- Qayta deploy qiling

### 3. API routes build qilinmagan

**Belgi:** Build muvaffaqiyatli, lekin Functions tab'da API route'lar yo'q

**Yechim:**
- `src/pages/api/` papkasi mavjudligini tekshiring
- Build log'larda `api/auth` qidiring
- Qayta build qiling

### 4. Root Directory noto'g'ri

**Belgi:** Build muvaffaqiyatli, lekin path'lar noto'g'ri

**Yechim:**
- Root Directory'ni to'g'ri sozlang
- Qayta deploy qiling

## 📝 Test qilish

Deploy'dan keyin browser console'da yoki curl bilan:

```bash
# Register
curl -X POST https://yourdomain.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","phone":"+998-93-123-45-67","password":"test123"}'

# Login
curl -X POST https://yourdomain.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"test123"}'
```

## ✅ Tekshirish ro'yxati

- [ ] Environment variables qo'shilgan
- [ ] Build command to'g'ri
- [ ] Start command to'g'ri
- [ ] Root directory to'g'ri
- [ ] Build muvaffaqiyatli
- [ ] API routes build qilingan
- [ ] Runtime log'larda xatolar yo'q

## 🔧 Qo'shimcha yordam

Agar hali ham muammo bo'lsa:
1. **Build Logs** ni to'liq ko'ring
2. **Runtime Logs** ni tekshiring
3. **Environment Variables** ni qayta tekshiring
4. Render support'ga yozing

