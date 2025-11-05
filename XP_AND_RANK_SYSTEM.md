# 📊 XP, Rank va Level Tizimi - Soddalashtirilgan Tushuntirish

## 🎯 XP (Experience Points) - Tajriba Ballari

### XP nima?

**XP** - bu sizning bilim va ko'nikmalaringizni ko'rsatadigan ball tizimi.

### XP qanday olinadi?

✅ **Faqat Homework'dan olinadi!**

- Homework'ni to'g'ri bajarsangiz → XP olasiz
- Homework'ning barcha check'lari o'tgan bo'lishi kerak
- XP = Homework rubric'idagi barcha ballar yig'indisi

**Misol:**
- Homework rubric: 10 + 10 + 10 = 30 ball
- To'g'ri bajarilsa: **+30 XP** olasiz

### ❌ XP olinmaydi:

- Train exercises'dan XP olinmaydi
- Train faqat mashq qilish uchun
- Progress saqlanadi, lekin XP olinmaydi

---

## 🏆 Level (Daraja)

### Level nima?

**Level** - bu sizning darajangiz. Level oshgani sayin ranglar chiroyli bo'ladi!

### Level qanday hisoblanadi?

**Formula:** `Level = Math.floor(XP / 100) + 1`

**Qisqacha:**
- **0-99 XP** → Level 1 (Gray)
- **100-199 XP** → Level 2 (Blue)
- **200-299 XP** → Level 3 (Blue)
- **300-399 XP** → Level 4 (Green)
- va hokazo...

**Har 100 XP = 1 Level**

### Level o'zgarishi:

```
XP oshsa → Level avtomatik oshadi
Level oshsa → Ranglar o'zgaradi (chiroyliroq bo'ladi!)
```

**Misol:**
- Hozirgi: 95 XP, Level 1 (Gray)
- Yangi homework: +30 XP
- Yangi: 125 XP, Level 2 (Blue) ✅

---

## 🥇 Rank (O'rin)

### Rank nima?

**Rank** - bu leaderboard'da sizning o'rningiz (1, 2, 3, ...)

- **Rank 1** = Eng ko'p XP'ga ega user (Champion)
- **Rank 2** = Ikkinchi eng ko'p XP
- **Rank 3** = Uchinchi eng ko'p XP
- va hokazo...

### Rank qanday belgilanadi?

**Global Leaderboard:**

1. **XP bo'yicha tartiblash** (yuqoridan pastga)
2. XP teng bo'lsa, **Level bo'yicha**

**Misol:**
```
1. User A: 500 XP, Level 6 → Rank 1 🥇
2. User B: 450 XP, Level 5 → Rank 2 🥈
3. User C: 450 XP, Level 4 → Rank 3 🥉 (XP teng, lekin Level past)
4. User D: 300 XP, Level 4 → Rank 4
```

### Rank o'zgarishi:

- XP oshsa → Rank o'zgarishi mumkin
- Boshqa user'lar XP oshsa → Rank pastga tushishi mumkin
- Leaderboard'da tez-tez ko'rib turishingiz mumkin

---

## 🎮 Train vs Homework

### Train Exercise (Mashq Vazifasi):

✅ **Progress saqlanadi** - Qaysi train'ni bajarganingiz ko'rinadi
✅ **Cheksiz sinab ko'rish** - Xohlagancha marta sinab ko'rishingiz mumkin
❌ **XP olinmaydi** - Faqat mashq qilish uchun
❌ **Level oshmaydi** - XP olinmaydi, shuning uchun
❌ **Rank o'zgarmaydi** - XP o'zgarmaydi, shuning uchun

### Homework (Uyga Vazifa):

✅ **XP olinadi** - To'g'ri bajarsangiz XP olasiz
✅ **Level oshadi** - XP oshsa, Level ham oshadi
✅ **Rank o'zgaradi** - XP oshsa, Rank ham o'zgarishi mumkin
❌ **Faqat 1 marta** - Bir marta submit qilish mumkin
❌ **Qayta o'zgartirib bo'lmaydi** - Final submission

---

## 📈 Misollar

### Yangi User (Registration):

```
XP: 0
Level: 1 (Gray - Beginner)
Rank: Eng past (oxirgi o'rin)
```

### Birinchi Homework (30 ball):

```
XP: 0 + 30 = 30
Level: 1 (hali oshmadi, chunki 100 ga yetmadi)
Rank: O'zgaradi (boshqa user'lar bilan solishtiriladi)
```

### Ikkinchi Homework (40 ball):

```
XP: 30 + 40 = 70
Level: 1 (hali oshmadi)
Rank: O'zgaradi
```

### Uchinchi Homework (35 ball):

```
XP: 70 + 35 = 105
Level: 2 ✅ (100 ga yetdi, Level oshdi!)
Ranglar: Gray → Blue (chiroyli!)
Rank: O'zgaradi
```

---

## 🎨 Ranglar

### Level ga qarab ranglar:

- **Level 1-5**: Gray → Blue (Beginner)
- **Level 6-10**: Blue (Intermediate)
- **Level 11-15**: Green (Advanced)
- **Level 16-20**: Yellow → Orange (Expert)
- **Level 21-30**: Orange → Red (Master)
- **Level 31+**: Red → Purple (Legendary)

**Yuqori Level = Chiroyli ranglar!** 🎨

---

## 💡 Xulosa

### XP:
- ✅ Faqat homework'dan olinadi
- ✅ Homework score = XP miqdori
- ✅ Train exercises'dan olinmaydi

### Level:
- ✅ XP / 100 + 1
- ✅ Avtomatik yangilanadi
- ✅ Har 100 XP = 1 Level
- ✅ Level oshgani sayin ranglar chiroyli bo'ladi

### Rank:
- ✅ Global leaderboard'da o'rningiz
- ✅ XP bo'yicha tartiblanadi
- ✅ XP teng bo'lsa, Level bo'yicha
- ✅ XP oshsa, Rank o'zgarishi mumkin

---

## 🎯 Qanday XP oshirish?

1. ✅ **Darslarni o'qing** - Bilim oling
2. ✅ **Train exercises bajaring** - Mashq qiling
3. ✅ **Homework bajaring** - XP oling!
4. ✅ **Ko'proq homework bajaring** - Ko'proq XP!
5. ✅ **Level oshing** - Chiroyli ranglar!

**Muvaffaqiyatlar!** 🚀
