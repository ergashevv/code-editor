w# Google Search Console Verification - Qo'llanma

## ✅ Meta Tag Verification (Qo'shildi)

Google Search Console meta tag verification code qo'shildi:

```html
<meta name="google-site-verification" content="yid7tXNMQqDTjVHTUVhc99F-a4HFUEsURW_NwBpjCQc" />
```

**Fayl:** `src/pages/_document.tsx`

## 🔍 Tekshirish

### 1. Sahifa source'ini tekshiring

Browser'da:
1. `https://texnikum.xyz` yoki `https://texnikum.xyz/home` ni oching
2. **Right Click** → **View Page Source** (yoki Ctrl+U / Cmd+U)
3. `<head>` bo'limida quyidagini qidiring:
```html
<meta name="google-site-verification" content="yid7tXNMQqDTjVHTUVhc99F-a4HFUEsURW_NwBpjCQc" />
```

### 2. Agar meta tag ko'rinmasa

**Muammolar:**
- Cache muammosi - Browser cache'ni tozalang
- Build muammosi - Qayta deploy qiling
- CDN cache - 10-15 daqiqa kutib turing

### 3. Browser cache'ni tozalash

```bash
# Chrome:
Ctrl+Shift+Delete (Windows/Linux)
Cmd+Shift+Delete (Mac)

# Yoki:
Ctrl+F5 (Hard refresh)
Cmd+Shift+R (Mac)
```

## 🌐 Domain-Level Verification (TXT Record)

Agar meta tag verification ishlamasa, DNS TXT record qo'shing:

### 1. Google Search Console'da

1. **Settings** → **Ownership verification**
2. **HTML tag** o'rniga **Domain name provider** ni tanlang
3. TXT record ko'rsatiladi

### 2. DNS Provider'da (masalan, Cloudflare, Namecheap, etc.)

1. DNS management'ga kiring
2. **TXT Record** qo'shing:
   - **Name/Host:** `@` yoki bo'sh
   - **Value:** Google bergan TXT record (masalan: `google-site-verification=...`)
   - **TTL:** 3600 (yoki default)

### 3. Kutish vaqti

- DNS propagation: **10 daqiqa - 48 soat**
- Odatda: **15-30 daqiqa**

### 4. Tekshirish

```bash
# Terminal'da:
nslookup -type=TXT texnikum.xyz

# Yoki online:
https://mxtoolbox.com/TXTLookup.aspx
```

## 🔧 Ikki xil Verification Usuli

### Usul 1: Meta Tag (HTML tag) ✅ Qo'shildi

**Qayerda:** `src/pages/_document.tsx`

**Qanday ishlaydi:**
- Google bot sahifani yuklaydi
- `<head>` bo'limida meta tag'ni qidiradi
- Agar topilsa, verification muvaffaqiyatli

**Tekshirish:**
- Browser'da source'ni oching
- Meta tag mavjudligini tekshiring

### Usul 2: DNS TXT Record

**Qayerda:** DNS provider (Cloudflare, Namecheap, etc.)

**Qanday ishlaydi:**
- Google DNS'ni tekshiradi
- TXT record'ni qidiradi
- Agar topilsa, verification muvaffaqiyatli

**Qachon ishlatiladi:**
- Meta tag verification ishlamasa
- Domain-level verification kerak bo'lsa

## 📝 Qadamlar

### 1. Meta Tag Verification tekshirish

1. ✅ Deploy qiling (qo'shildi)
2. ✅ Browser'da source'ni tekshiring
3. ✅ Meta tag borligini tekshiring
4. ✅ Google Search Console'da "Verify" tugmasini bosing

### 2. Agar ishlamasa - DNS TXT Record

1. Google Search Console → **Settings** → **Ownership verification**
2. **Domain name provider** ni tanlang
3. TXT record'ni DNS provider'ga qo'shing
4. 15-30 daqiqa kutib turing
5. Qayta verify qiling

## 🚨 Ko'p uchraydigan muammolar

### 1. Meta tag ko'rinmayapti

**Yechim:**
- Browser cache'ni tozalang
- Hard refresh qiling (Ctrl+F5)
- CDN cache'ni kutib turing (10-15 daqiqa)

### 2. Verification ishlamayapti

**Yechim:**
- DNS TXT record usulini sinab ko'ring
- DNS propagation'ni kutib turing (15-30 daqiqa)
- TXT record to'g'ri qo'shilganini tekshiring

### 3. Cache muammosi

**Yechim:**
- Incognito/Private mode'da ochib ko'ring
- CDN cache'ni invalidate qiling (agar mavjud bo'lsa)
- Bir necha soatdan keyin qayta sinab ko'ring

## ✅ Tekshirish ro'yxati

- [ ] Deploy qilingan
- [ ] Browser'da source ochilgan
- [ ] Meta tag ko'rinadi
- [ ] Google Search Console'da "Verify" bosilgan
- [ ] Agar ishlamasa, DNS TXT record qo'shilgan

