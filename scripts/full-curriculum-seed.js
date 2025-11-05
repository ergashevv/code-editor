// Comprehensive HTML/CSS Curriculum Seed Script
// Run with: node scripts/full-curriculum-seed.js

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import models (same as before)
const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['USER', 'ADMIN'], default: 'USER' },
  level: { type: Number, default: 1 },
  xp: { type: Number, default: 0 },
  lastSeenAt: { type: Date },
}, { timestamps: true });

const ExampleSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  html: { type: String, required: true },
  css: { type: String, default: '' },
  js: { type: String, default: '' },
}, { _id: false });

const CheckSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: { type: String, enum: ['html', 'css'], required: true },
  rule: { type: String, required: true },
  hint: { type: String, required: true },
  hint_uz: String,
  hint_ru: String,
  hint_en: String,
}, { _id: false });

const TrainSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  title_uz: String,
  title_ru: String,
  title_en: String,
  task: { type: String, required: true },
  task_uz: String,
  task_ru: String,
  task_en: String,
  initialHtml: { type: String, required: true },
  initialCss: { type: String, default: '' },
  checks: { type: [CheckSchema], default: [] },
}, { _id: false });

const RubricItemSchema = new mongoose.Schema({
  id: { type: String, required: true },
  description: { type: String, required: true },
  description_uz: String,
  description_ru: String,
  description_en: String,
  points: { type: Number, required: true, min: 0 },
}, { _id: false });

const HomeworkSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  title_uz: String,
  title_ru: String,
  title_en: String,
  brief: { type: String, required: true },
  brief_uz: String,
  brief_ru: String,
  brief_en: String,
  rubric: { type: [RubricItemSchema], default: [] },
  checks: { type: [CheckSchema], default: [] },
}, { _id: false });

const LessonSchema = new mongoose.Schema({
  slug: { type: String, unique: true, required: true, trim: true },
  title: { type: String, required: true, trim: true },
  title_uz: String,
  title_ru: String,
  title_en: String,
  summary: { type: String, required: true },
  summary_uz: String,
  summary_ru: String,
  summary_en: String,
  contentMD: { type: String, required: true },
  contentMD_uz: String,
  contentMD_ru: String,
  contentMD_en: String,
  examples: { type: [ExampleSchema], default: [] },
  trains: { type: [TrainSchema], default: [] },
  homework: { type: HomeworkSchema },
  unlockAt: { type: Date, required: true },
  order: { type: Number, required: true, default: 0 },
  active: { type: Boolean, default: true },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Lesson = mongoose.models.Lesson || mongoose.model('Lesson', LessonSchema);

async function seed() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      console.error('❌ MONGODB_URI is not set in .env file');
      process.exit(1);
    }

    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Create admin user
    const adminLogin = process.env.ADMIN_SEED_LOGIN || 'edevzi';
    const adminPassword = process.env.ADMIN_SEED_PASSWORD || 'edevzi123!';

    console.log('👤 Creating admin user...');
    const existingAdmin = await User.findOne({ username: adminLogin });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      await User.create({
        username: adminLogin,
        phone: '+998-90-000-00-00',
        password: hashedPassword,
        role: 'ADMIN',
        level: 1,
        xp: 0,
      });
      console.log(`✅ Admin user created: ${adminLogin}`);
    } else {
      existingAdmin.role = 'ADMIN';
      await existingAdmin.save();
      console.log(`✅ Admin user updated: ${adminLogin}`);
    }

    // Full HTML/CSS Curriculum
    const now = new Date();
    const lessons = [
      // HTML BASICS
      {
        slug: 'html-introduction',
        title: 'HTML Introduction',
        title_uz: 'HTML Kirish',
        title_ru: 'Введение в HTML',
        title_en: 'HTML Introduction',
        summary: 'Learn what HTML is and how to create your first webpage',
        summary_uz: 'HTML nima ekanligini va birinchi veb-sahifangizni qanday yaratishni o\'rganing',
        summary_ru: 'Узнайте, что такое HTML и как создать свою первую веб-страницу',
        summary_en: 'Learn what HTML is and how to create your first webpage',
        contentMD: `# HTML Introduction

HTML (HyperText Markup Language) is the standard markup language for creating web pages.

## What is HTML?

HTML describes the structure of a web page using **elements** (also called tags). Each element tells the browser how to display the content.

## Basic HTML Structure

Every HTML document needs this basic structure:

\`\`\`html
<!DOCTYPE html>
<html>
<head>
    <title>My First Page</title>
</head>
<body>
    <h1>Hello World!</h1>
</body>
</html>
\`\`\`

## Key Elements

- **<!DOCTYPE html>** - Declares this is an HTML5 document
- **<html>** - The root element of the page
- **<head>** - Contains meta information (not visible on page)
- **<title>** - The page title (shown in browser tab)
- **<body>** - Contains all visible content

## Next Steps

In the next lessons, you'll learn about text tags, links, images, and more!`,
        contentMD_uz: `# HTML Kirish

HTML (HyperText Markup Language) - bu veb-sahifalar yaratish uchun standart markup tili.

## HTML nima?

HTML veb-sahifa strukturasini **elementlar** (yoki taglar) yordamida tasvirlaydi. Har bir element brauzerga kontentni qanday ko'rsatishni aytadi.

## Asosiy HTML Strukturasi

Har bir HTML hujjatiga quyidagi asosiy struktura kerak:

\`\`\`html
<!DOCTYPE html>
<html>
<head>
    <title>Mening Birinchi Sahifam</title>
</head>
<body>
    <h1>Salom Dunyo!</h1>
</body>
</html>
\`\`\`

## Asosiy Elementlar

- **<!DOCTYPE html>** - Bu HTML5 hujjat ekanligini bildiradi
- **<html>** - Sahifaning root elementi
- **<head>** - Meta ma'lumotlarni o'z ichiga oladi (sahifada ko'rinmaydi)
- **<title>** - Sahifa sarlavhasi (brauzer tabida ko'rinadi)
- **<body>** - Barcha ko'rinadigan kontentni o'z ichiga oladi

## Keyingi Qadamlar

Keyingi darslarda siz matn taglari, havolalar, rasmlar va boshqalar haqida o'rganasiz!`,
        contentMD_ru: `# Введение в HTML

HTML (HyperText Markup Language) - это стандартный язык разметки для создания веб-страниц.

## Что такое HTML?

HTML описывает структуру веб-страницы с помощью **элементов** (также называемых тегами). Каждый элемент говорит браузеру, как отображать содержимое.

## Базовая структура HTML

Каждый HTML-документ нуждается в этой базовой структуре:

\`\`\`html
<!DOCTYPE html>
<html>
<head>
    <title>Моя первая страница</title>
</head>
<body>
    <h1>Привет, мир!</h1>
</body>
</html>
\`\`\`

## Ключевые элементы

- **<!DOCTYPE html>** - Объявляет, что это HTML5 документ
- **<html>** - Корневой элемент страницы
- **<head>** - Содержит метаинформацию (не видна на странице)
- **<title>** - Заголовок страницы (отображается на вкладке браузера)
- **<body>** - Содержит весь видимый контент

## Следующие шаги

В следующих уроках вы узнаете о текстовых тегах, ссылках, изображениях и многом другом!`,
        contentMD_en: `# HTML Introduction

HTML (HyperText Markup Language) is the standard markup language for creating web pages.

## What is HTML?

HTML describes the structure of a web page using **elements** (also called tags). Each element tells the browser how to display the content.

## Basic HTML Structure

Every HTML document needs this basic structure:

\`\`\`html
<!DOCTYPE html>
<html>
<head>
    <title>My First Page</title>
</head>
<body>
    <h1>Hello World!</h1>
</body>
</html>
\`\`\`

## Key Elements

- **<!DOCTYPE html>** - Declares this is an HTML5 document
- **<html>** - The root element of the page
- **<head>** - Contains meta information (not visible on page)
- **<title>** - The page title (shown in browser tab)
- **<body>** - Contains all visible content

## Next Steps

In the next lessons, you'll learn about text tags, links, images, and more!`,
        examples: [
          {
            id: 'ex1',
            title: 'Basic HTML Page',
            html: '<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>My First Page</title>\n</head>\n<body>\n    <h1>Welcome to HTML!</h1>\n    <p>This is my first webpage.</p>\n</body>\n</html>',
            css: '',
            js: '',
          },
        ],
        trains: [
          {
            id: 'train1',
            title: 'Create Basic Structure',
            title_uz: 'Asosiy Strukturani Yaratish',
            title_ru: 'Создание базовой структуры',
            title_en: 'Create Basic Structure',
            task: 'Create a complete HTML page with DOCTYPE, html, head, title, and body elements',
            task_uz: 'DOCTYPE, html, head, title va body elementlariga ega bo\'lgan to\'liq HTML sahifani yarating',
            task_ru: 'Создайте полную HTML-страницу с элементами DOCTYPE, html, head, title и body',
            task_en: 'Create a complete HTML page with DOCTYPE, html, head, title, and body elements',
            initialHtml: '<!-- Write your HTML here -->',
            initialCss: '',
            checks: [
              {
                id: 'check1',
                type: 'html',
                rule: 'exists:!DOCTYPE',
                hint: 'You need DOCTYPE declaration',
                hint_uz: 'Sizga DOCTYPE deklaratsiyasi kerak',
                hint_ru: 'Вам нужна декларация DOCTYPE',
                hint_en: 'You need DOCTYPE declaration',
              },
              {
                id: 'check2',
                type: 'html',
                rule: 'exists:html',
                hint: 'You need html element',
                hint_uz: 'Sizga html elementi kerak',
                hint_ru: 'Вам нужен элемент html',
                hint_en: 'You need html element',
              },
              {
                id: 'check3',
                type: 'html',
                rule: 'exists:head',
                hint: 'You need head element',
                hint_uz: 'Sizga head elementi kerak',
                hint_ru: 'Вам нужен элемент head',
                hint_en: 'You need head element',
              },
              {
                id: 'check4',
                type: 'html',
                rule: 'exists:title',
                hint: 'You need title element',
                hint_uz: 'Sizga title elementi kerak',
                hint_ru: 'Вам нужен элемент title',
                hint_en: 'You need title element',
              },
              {
                id: 'check5',
                type: 'html',
                rule: 'exists:body',
                hint: 'You need body element',
                hint_uz: 'Sizga body elementi kerak',
                hint_ru: 'Вам нужен элемент body',
                hint_en: 'You need body element',
              },
            ],
          },
        ],
        homework: {
          id: 'hw1',
          title: 'My First Webpage',
          title_uz: 'Mening Birinchi Veb-sahifam',
          title_ru: 'Моя первая веб-страница',
          title_en: 'My First Webpage',
          brief: 'Create a complete HTML webpage with:\n- Proper HTML5 structure (<!DOCTYPE html>, <html>, <head>, <body>)\n- A <title> element in the <head>\n- An <h1> heading in the <body>\n- A <p> paragraph introducing yourself',
          brief_uz: 'Quyidagilarga ega bo\'lgan to\'liq HTML veb-sahifani yarating:\n- To\'g\'ri HTML5 struktura (<!DOCTYPE html>, <html>, <head>, <body>)\n- <head> ichida <title> elementi\n- <body> ichida <h1> heading\n- O\'zingiz haqingizda <p> paragraf',
          brief_ru: 'Создайте полную HTML веб-страницу с:\n- Правильной структурой HTML5 (<!DOCTYPE html>, <html>, <head>, <body>)\n- Элементом <title> в <head>\n- Заголовком <h1> в <body>\n- Параграфом <p> о себе',
          brief_en: 'Create a complete HTML webpage with:\n- Proper HTML5 structure (<!DOCTYPE html>, <html>, <head>, <body>)\n- A <title> element in the <head>\n- An <h1> heading in the <body>\n- A <p> paragraph introducing yourself',
          rubric: [
            {
              id: 'r1',
              description: 'Has proper HTML5 structure (<!DOCTYPE html>, <html>, <head>, <body>)',
              description_uz: 'To\'g\'ri HTML5 strukturaga ega (<!DOCTYPE html>, <html>, <head>, <body>)',
              description_ru: 'Имеет правильную структуру HTML5 (<!DOCTYPE html>, <html>, <head>, <body>)',
              description_en: 'Has proper HTML5 structure (<!DOCTYPE html>, <html>, <head>, <body>)',
              points: 40,
            },
            {
              id: 'r2',
              description: 'Has a <title> element in <head>',
              description_uz: '<head> ichida <title> elementi mavjud',
              description_ru: 'Имеет элемент <title> в <head>',
              description_en: 'Has a <title> element in <head>',
              points: 20,
            },
            {
              id: 'r3',
              description: 'Has an <h1> heading in <body>',
              description_uz: '<body> ichida <h1> heading mavjud',
              description_ru: 'Имеет заголовок <h1> в <body>',
              description_en: 'Has an <h1> heading in <body>',
              points: 20,
            },
            {
              id: 'r4',
              description: 'Has a <p> paragraph',
              description_uz: '<p> paragraf mavjud',
              description_ru: 'Имеет параграф <p>',
              description_en: 'Has a <p> paragraph',
              points: 20,
            },
          ],
          checks: [
            {
              id: 'r1',
              type: 'html',
              rule: 'exists:!DOCTYPE',
              hint: 'You need <!DOCTYPE html> declaration',
              hint_uz: 'Sizga <!DOCTYPE html> deklaratsiyasi kerak',
              hint_ru: 'Вам нужна декларация <!DOCTYPE html>',
              hint_en: 'You need <!DOCTYPE html> declaration',
            },
            {
              id: 'r1',
              type: 'html',
              rule: 'exists:html',
              hint: 'You need <html> tag',
              hint_uz: 'Sizga <html> teg kerak',
              hint_ru: 'Вам нужен тег <html>',
              hint_en: 'You need <html> tag',
            },
            {
              id: 'r1',
              type: 'html',
              rule: 'exists:head',
              hint: 'You need <head> tag',
              hint_uz: 'Sizga <head> teg kerak',
              hint_ru: 'Вам нужен тег <head>',
              hint_en: 'You need <head> tag',
            },
            {
              id: 'r1',
              type: 'html',
              rule: 'exists:body',
              hint: 'You need <body> tag',
              hint_uz: 'Sizga <body> teg kerak',
              hint_ru: 'Вам нужен тег <body>',
              hint_en: 'You need <body> tag',
            },
            {
              id: 'r2',
              type: 'html',
              rule: 'exists:title',
              hint: 'You need a <title> element in <head>',
              hint_uz: 'Sizga <head> ichida <title> elementi kerak',
              hint_ru: 'Вам нужен элемент <title> в <head>',
              hint_en: 'You need a <title> element in <head>',
            },
            {
              id: 'r3',
              type: 'html',
              rule: 'exists:h1',
              hint: 'You need an <h1> heading in <body>',
              hint_uz: 'Sizga <body> ichida <h1> heading kerak',
              hint_ru: 'Вам нужен заголовок <h1> в <body>',
              hint_en: 'You need an <h1> heading in <body>',
            },
            {
              id: 'r4',
              type: 'html',
              rule: 'exists:p',
              hint: 'You need a <p> paragraph',
              hint_uz: 'Sizga <p> paragraf kerak',
              hint_ru: 'Вам нужен параграф <p>',
              hint_en: 'You need a <p> paragraph',
            },
          ],
        },
        unlockAt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
        order: 1,
      },
      {
        slug: 'html-text-tags',
        title: 'HTML Text Tags',
        title_uz: 'HTML Matn Taglari',
        title_ru: 'HTML Текстовые теги',
        title_en: 'HTML Text Tags',
        summary: 'Learn about headings, paragraphs, and text formatting tags',
        summary_uz: 'Heading, paragraf va matn formatlash taglari haqida o\'rganing',
        summary_ru: 'Узнайте о заголовках, параграфах и тегах форматирования текста',
        summary_en: 'Learn about headings, paragraphs, and text formatting tags',
        contentMD: `# HTML Text Tags

HTML provides many tags for displaying text with different styles and meanings.

## Headings (h1-h6)

Headings create hierarchy in your content. Use **h1** for the main title, **h2** for sections, etc.

\`\`\`html
<h1>Main Heading</h1>
<h2>Section Heading</h2>
<h3>Subsection Heading</h3>
\`\`\`

**Best Practice:** Use only one **h1** per page for the main title.

## Paragraphs

Use **<p>** for regular text paragraphs:

\`\`\`html
<p>This is a paragraph of text.</p>
<p>This is another paragraph.</p>
\`\`\`

## Text Formatting

- **<b>** or **<strong>** - Makes text bold (strong indicates importance)
- **<i>** or **<em>** - Makes text italic (em indicates emphasis)
- **<br>** - Line break (self-closing tag)

\`\`\`html
<p>This is <b>bold</b> and this is <i>italic</i>.</p>
<p>First line<br>Second line</p>
\`\`\`

## Lists

### Unordered List (ul)
\`\`\`html
<ul>
    <li>Item 1</li>
    <li>Item 2</li>
</ul>
\`\`\`

### Ordered List (ol)
\`\`\`html
<ol>
    <li>First item</li>
    <li>Second item</li>
</ol>
\`\`\``,
        contentMD_uz: `# HTML Matn Taglari

HTML turli uslub va ma'nolarda matn ko'rsatish uchun ko'plab taglar taqdim etadi.

## Headinglar (h1-h6)

Headinglar kontentingizda ierarxiya yaratadi. Asosiy sarlavha uchun **h1**, bo'limlar uchun **h2** va hokazo ishlating.

\`\`\`html
<h1>Asosiy Heading</h1>
<h2>Bo'lim Heading</h2>
<h3>Kichik Bo'lim Heading</h3>
\`\`\`

**Eng Yaxshi Amaliyot:** Asosiy sarlavha uchun sahifada faqat bitta **h1** ishlating.

## Paragraflar

Oddiy matn paragraflari uchun **<p>** ishlating:

\`\`\`html
<p>Bu matn paragrafi.</p>
<p>Bu yana bir paragraf.</p>
\`\`\`

## Matn Formatlashi

- **<b>** yoki **<strong>** - Matnni qalin qiladi (strong muhimlikni bildiradi)
- **<i>** yoki **<em>** - Matnni kursiv qiladi (em urg'u beradi)
- **<br>** - Qator uzilishi (o'z-o'zidan yopiladigan tag)

\`\`\`html
<p>Bu <b>qalin</b> va bu <i>kursiv</i>.</p>
<p>Birinchi qator<br>Ikkinchi qator</p>
\`\`\`

## Ro'yxatlar

### Tartibsiz Ro'yxat (ul)
\`\`\`html
<ul>
    <li>Element 1</li>
    <li>Element 2</li>
</ul>
\`\`\`

### Tartibli Ro'yxat (ol)
\`\`\`html
<ol>
    <li>Birinchi element</li>
    <li>Ikkinchi element</li>
</ol>
\`\`\``,
        contentMD_ru: `# HTML Текстовые теги

HTML предоставляет множество тегов для отображения текста с различными стилями и значениями.

## Заголовки (h1-h6)

Заголовки создают иерархию в вашем контенте. Используйте **h1** для главного заголовка, **h2** для разделов и т.д.

\`\`\`html
<h1>Главный заголовок</h1>
<h2>Заголовок раздела</h2>
<h3>Заголовок подраздела</h3>
\`\`\`

**Лучшая практика:** Используйте только один **h1** на странице для главного заголовка.

## Параграфы

Используйте **<p>** для обычных текстовых параграфов:

\`\`\`html
<p>Это параграф текста.</p>
<p>Это еще один параграф.</p>
\`\`\`

## Форматирование текста

- **<b>** или **<strong>** - Делает текст жирным (strong указывает на важность)
- **<i>** или **<em>** - Делает текст курсивом (em указывает на акцент)
- **<br>** - Разрыв строки (самозакрывающийся тег)

\`\`\`html
<p>Это <b>жирный</b> и это <i>курсив</i>.</p>
<p>Первая строка<br>Вторая строка</p>
\`\`\`

## Списки

### Неупорядоченный список (ul)
\`\`\`html
<ul>
    <li>Элемент 1</li>
    <li>Элемент 2</li>
</ul>
\`\`\`

### Упорядоченный список (ol)
\`\`\`html
<ol>
    <li>Первый элемент</li>
    <li>Второй элемент</li>
</ol>
\`\`\``,
        contentMD_en: `# HTML Text Tags

HTML provides many tags for displaying text with different styles and meanings.

## Headings (h1-h6)

Headings create hierarchy in your content. Use **h1** for the main title, **h2** for sections, etc.

\`\`\`html
<h1>Main Heading</h1>
<h2>Section Heading</h2>
<h3>Subsection Heading</h3>
\`\`\`

**Best Practice:** Use only one **h1** per page for the main title.

## Paragraphs

Use **<p>** for regular text paragraphs:

\`\`\`html
<p>This is a paragraph of text.</p>
<p>This is another paragraph.</p>
\`\`\`

## Text Formatting

- **<b>** or **<strong>** - Makes text bold (strong indicates importance)
- **<i>** or **<em>** - Makes text italic (em indicates emphasis)
- **<br>** - Line break (self-closing tag)

\`\`\`html
<p>This is <b>bold</b> and this is <i>italic</i>.</p>
<p>First line<br>Second line</p>
\`\`\`

## Lists

### Unordered List (ul)
\`\`\`html
<ul>
    <li>Item 1</li>
    <li>Item 2</li>
</ul>
\`\`\`

### Ordered List (ol)
\`\`\`html
<ol>
    <li>First item</li>
    <li>Second item</li>
</ol>
\`\`\``,
        examples: [
          {
            id: 'ex1',
            title: 'Headings Example',
            html: '<h1>Main Title</h1>\n<h2>Section 1</h2>\n<p>Content here</p>\n<h2>Section 2</h2>\n<p>More content</p>',
            css: '',
            js: '',
          },
          {
            id: 'ex2',
            title: 'Text Formatting',
            html: '<p>This is <b>bold</b> and <i>italic</i> text.</p>\n<p>This is <strong>important</strong> and <em>emphasized</em>.</p>',
            css: '',
            js: '',
          },
          {
            id: 'ex3',
            title: 'Lists',
            html: '<ul>\n    <li>Apple</li>\n    <li>Banana</li>\n    <li>Orange</li>\n</ul>\n\n<ol>\n    <li>First step</li>\n    <li>Second step</li>\n    <li>Third step</li>\n</ol>',
            css: '',
            js: '',
          },
        ],
        trains: [
          {
            id: 'train1',
            title: 'Create Headings',
            title_uz: 'Headinglar Yaratish',
            title_ru: 'Создание заголовков',
            title_en: 'Create Headings',
            task: 'Create an HTML page with h1, h2, and h3 headings',
            task_uz: 'H1, h2 va h3 headinglarga ega bo\'lgan HTML sahifani yarating',
            task_ru: 'Создайте HTML-страницу с заголовками h1, h2 и h3',
            task_en: 'Create an HTML page with h1, h2, and h3 headings',
            initialHtml: '<!DOCTYPE html>\n<html>\n<head>\n    <title>Exercise</title>\n</head>\n<body>\n    <!-- Add your headings here -->\n</body>\n</html>',
            initialCss: '',
            checks: [
              {
                id: 'check1',
                type: 'html',
                rule: 'exists:h1',
                hint: 'You need an h1 heading',
                hint_uz: 'Sizga h1 heading kerak',
                hint_ru: 'Вам нужен заголовок h1',
                hint_en: 'You need an h1 heading',
              },
              {
                id: 'check2',
                type: 'html',
                rule: 'exists:h2',
                hint: 'You need an h2 heading',
                hint_uz: 'Sizga h2 heading kerak',
                hint_ru: 'Вам нужен заголовок h2',
                hint_en: 'You need an h2 heading',
              },
              {
                id: 'check3',
                type: 'html',
                rule: 'exists:h3',
                hint: 'You need an h3 heading',
                hint_uz: 'Sizga h3 heading kerak',
                hint_ru: 'Вам нужен заголовок h3',
                hint_en: 'You need an h3 heading',
              },
            ],
          },
          {
            id: 'train2',
            title: 'Create Lists',
            title_uz: 'Ro\'yxatlar Yaratish',
            title_ru: 'Создание списков',
            title_en: 'Create Lists',
            task: 'Create both an unordered list (ul) and an ordered list (ol) with at least 3 items each',
            task_uz: 'Har birida kamida 3 ta element bo\'lgan tartibsiz ro\'yxat (ul) va tartibli ro\'yxat (ol) yarating',
            task_ru: 'Создайте неупорядоченный список (ul) и упорядоченный список (ol) с минимум 3 элементами в каждом',
            task_en: 'Create both an unordered list (ul) and an ordered list (ol) with at least 3 items each',
            initialHtml: '<!DOCTYPE html>\n<html>\n<head>\n    <title>Exercise</title>\n</head>\n<body>\n    <!-- Add your lists here -->\n</body>\n</html>',
            initialCss: '',
            checks: [
              {
                id: 'check1',
                type: 'html',
                rule: 'exists:ul',
                hint: 'You need an unordered list (ul)',
                hint_uz: 'Sizga tartibsiz ro\'yxat (ul) kerak',
                hint_ru: 'Вам нужен неупорядоченный список (ul)',
                hint_en: 'You need an unordered list (ul)',
              },
              {
                id: 'check2',
                type: 'html',
                rule: 'exists:ol',
                hint: 'You need an ordered list (ol)',
                hint_uz: 'Sizga tartibli ro\'yxat (ol) kerak',
                hint_ru: 'Вам нужен упорядоченный список (ol)',
                hint_en: 'You need an ordered list (ol)',
              },
              {
                id: 'check3',
                type: 'html',
                rule: 'count:li>=3',
                hint: 'You need at least 3 list items',
                hint_uz: 'Sizga kamida 3 ta ro\'yxat elementi kerak',
                hint_ru: 'Вам нужно минимум 3 элемента списка',
                hint_en: 'You need at least 3 list items',
              },
            ],
          },
        ],
        homework: {
          id: 'hw1',
          title: 'Personal Information Page',
          title_uz: 'Shaxsiy Ma\'lumotlar Sahifasi',
          title_ru: 'Страница личной информации',
          title_en: 'Personal Information Page',
          brief: 'Create a webpage about yourself with:\n- An <h1> heading with your name\n- An <h2> heading for "About Me"\n- At least 2 <p> paragraphs describing yourself\n- An <ul> unordered list of your hobbies\n- Use <b> or <strong> for bold text and <i> or <em> for italic text',
          brief_uz: 'O\'zingiz haqingizda veb-sahifa yarating:\n- Ismingiz bilan <h1> heading\n- "Men Haqimda" uchun <h2> heading\n- O\'zingizni tasvirlovchi kamida 2 ta <p> paragraf\n- Hobbiylaringizning <ul> tartibsiz ro\'yxati\n- Qalin matn uchun <b> yoki <strong>, kursiv matn uchun <i> yoki <em> teglaridan foydalaning',
          brief_ru: 'Создайте веб-страницу о себе с:\n- Заголовок <h1> с вашим именем\n- Заголовок <h2> для "О себе"\n- Минимум 2 параграфа <p>, описывающие вас\n- Неупорядоченный список <ul> ваших хобби\n- Используйте <b> или <strong> для жирного текста и <i> или <em> для курсивного',
          brief_en: 'Create a webpage about yourself with:\n- An <h1> heading with your name\n- An <h2> heading for "About Me"\n- At least 2 <p> paragraphs describing yourself\n- An <ul> unordered list of your hobbies\n- Use <b> or <strong> for bold text and <i> or <em> for italic text',
          rubric: [
            {
              id: 'r1',
              description: 'Has <h1> and <h2> headings',
              description_uz: '<h1> va <h2> headinglar mavjud',
              description_ru: 'Имеет заголовки <h1> и <h2>',
              description_en: 'Has <h1> and <h2> headings',
              points: 25,
            },
            {
              id: 'r2',
              description: 'Has at least 2 <p> paragraphs',
              description_uz: 'Kamida 2 ta <p> paragraf mavjud',
              description_ru: 'Имеет минимум 2 параграфа <p>',
              description_en: 'Has at least 2 <p> paragraphs',
              points: 25,
            },
            {
              id: 'r3',
              description: 'Has an <ul> unordered list',
              description_uz: '<ul> tartibsiz ro\'yxat mavjud',
              description_ru: 'Имеет неупорядоченный список <ul>',
              description_en: 'Has an <ul> unordered list',
              points: 25,
            },
            {
              id: 'r4',
              description: 'Uses <b>/<strong> and <i>/<em> tags',
              description_uz: '<b>/<strong> va <i>/<em> teglari ishlatilgan',
              description_ru: 'Использует теги <b>/<strong> и <i>/<em>',
              description_en: 'Uses <b>/<strong> and <i>/<em> tags',
              points: 25,
            },
          ],
          checks: [
            {
              id: 'r1',
              type: 'html',
              rule: 'exists:h1',
              hint: 'You need an <h1> heading',
              hint_uz: 'Sizga <h1> heading kerak',
              hint_ru: 'Вам нужен заголовок <h1>',
              hint_en: 'You need an <h1> heading',
            },
            {
              id: 'r1',
              type: 'html',
              rule: 'exists:h2',
              hint: 'You need an <h2> heading',
              hint_uz: 'Sizga <h2> heading kerak',
              hint_ru: 'Вам нужен заголовок <h2>',
              hint_en: 'You need an <h2> heading',
            },
            {
              id: 'r2',
              type: 'html',
              rule: 'count:p>=2',
              hint: 'You need at least 2 <p> paragraphs',
              hint_uz: 'Sizga kamida 2 ta <p> paragraf kerak',
              hint_ru: 'Вам нужно минимум 2 параграфа <p>',
              hint_en: 'You need at least 2 <p> paragraphs',
            },
            {
              id: 'r3',
              type: 'html',
              rule: 'exists:ul',
              hint: 'You need an <ul> unordered list',
              hint_uz: 'Sizga <ul> tartibsiz ro\'yxat kerak',
              hint_ru: 'Вам нужен неупорядоченный список <ul>',
              hint_en: 'You need an <ul> unordered list',
            },
            {
              id: 'r4',
              type: 'html',
              rule: 'exists:b',
              hint: 'You need to use <b> or <strong> for bold text',
              hint_uz: 'Qalin matn uchun <b> yoki <strong> tegidan foydalanish kerak',
              hint_ru: 'Для жирного текста используйте <b> или <strong>',
              hint_en: 'You need to use <b> or <strong> for bold text',
            },
            {
              id: 'r4',
              type: 'html',
              rule: 'exists:i',
              hint: 'You need to use <i> or <em> for italic text',
              hint_uz: 'Kursiv matn uchun <i> yoki <em> tegidan foydalanish kerak',
              hint_ru: 'Для курсивного текста используйте <i> или <em>',
              hint_en: 'You need to use <i> or <em> for italic text',
            },
          ],
        },
        unlockAt: new Date(now.getTime() - 23 * 60 * 60 * 1000),
        order: 2,
      },
      {
        slug: 'html-links-images',
        title: 'Links and Images',
        title_uz: 'Havolalar va Rasmlar',
        title_ru: 'Ссылки и изображения',
        title_en: 'Links and Images',
        summary: 'Learn how to add links and images to your webpages',
        summary_uz: 'Veb-sahifalaringizga havolalar va rasmlar qo\'shishni o\'rganing',
        summary_ru: 'Узнайте, как добавлять ссылки и изображения на ваши веб-страницы',
        summary_en: 'Learn how to add links and images to your webpages',
        contentMD: `# Links and Images

## Links (Anchor Tag)

Use **<a>** tag to create links. The **href** attribute specifies the URL.

\`\`\`html
<a href="https://example.com">Visit Example</a>
<a href="page.html">Internal Link</a>
\`\`\`

### Link Attributes

- **href** - The URL to link to
- **target** - Where to open the link (_blank opens in new tab)

\`\`\`html
<a href="https://example.com" target="_blank">Open in new tab</a>
\`\`\`

## Images

Use **<img>** tag to display images. The **src** attribute is the image path.

\`\`\`html
<img src="image.jpg" alt="Description">
\`\`\`

### Image Attributes

- **src** - Path to the image (required)
- **alt** - Alternative text (required for accessibility)
- **width** and **height** - Size in pixels

\`\`\`html
<img src="photo.jpg" alt="A beautiful sunset" width="500" height="300">
\`\`\`

**Important:** Always include **alt** text for accessibility!`,
        contentMD_uz: `# Havolalar va Rasmlar

## Havolalar (Anchor Tag)

Havolalar yaratish uchun **<a>** tagini ishlating. **href** atributi URL ni belgilaydi.

\`\`\`html
<a href="https://example.com">Misolga Tashrif</a>
<a href="page.html">Ichki Havola</a>
\`\`\`

### Havola Atributlari

- **href** - Havola qilish uchun URL
- **target** - Havolani qayerda ochish (_blank yangi tabda ochadi)

\`\`\`html
<a href="https://example.com" target="_blank">Yangi tabda ochish</a>
\`\`\`

## Rasmlar

Rasmlarni ko'rsatish uchun **<img>** tagini ishlating. **src** atributi rasm yo'lidir.

\`\`\`html
<img src="image.jpg" alt="Tavsif">
\`\`\`

### Rasm Atributlari

- **src** - Rasm yo'li (majburiy)
- **alt** - Alternativ matn (kirish uchun majburiy)
- **width** va **height** - Pikseldagi o'lcham

\`\`\`html
<img src="photo.jpg" alt="Chiroyli quyosh botishi" width="500" height="300">
\`\`\`

**Muhim:** Kirish uchun har doim **alt** matnini qo'shing!`,
        contentMD_ru: `# Ссылки и изображения

## Ссылки (Anchor Tag)

Используйте тег **<a>** для создания ссылок. Атрибут **href** указывает URL.

\`\`\`html
<a href="https://example.com">Посетить пример</a>
<a href="page.html">Внутренняя ссылка</a>
\`\`\`

### Атрибуты ссылки

- **href** - URL для ссылки
- **target** - Где открыть ссылку (_blank открывает в новой вкладке)

\`\`\`html
<a href="https://example.com" target="_blank">Открыть в новой вкладке</a>
\`\`\`

## Изображения

Используйте тег **<img>** для отображения изображений. Атрибут **src** - это путь к изображению.

\`\`\`html
<img src="image.jpg" alt="Описание">
\`\`\`

### Атрибуты изображения

- **src** - Путь к изображению (обязательно)
- **alt** - Альтернативный текст (обязательно для доступности)
- **width** и **height** - Размер в пикселях

\`\`\`html
<img src="photo.jpg" alt="Красивый закат" width="500" height="300">
\`\`\`

**Важно:** Всегда включайте текст **alt** для доступности!`,
        contentMD_en: `# Links and Images

## Links (Anchor Tag)

Use **<a>** tag to create links. The **href** attribute specifies the URL.

\`\`\`html
<a href="https://example.com">Visit Example</a>
<a href="page.html">Internal Link</a>
\`\`\`

### Link Attributes

- **href** - The URL to link to
- **target** - Where to open the link (_blank opens in new tab)

\`\`\`html
<a href="https://example.com" target="_blank">Open in new tab</a>
\`\`\`

## Images

Use **<img>** tag to display images. The **src** attribute is the image path.

\`\`\`html
<img src="image.jpg" alt="Description">
\`\`\`

### Image Attributes

- **src** - Path to the image (required)
- **alt** - Alternative text (required for accessibility)
- **width** and **height** - Size in pixels

\`\`\`html
<img src="photo.jpg" alt="A beautiful sunset" width="500" height="300">
\`\`\`

**Important:** Always include **alt** text for accessibility!`,
        examples: [
          {
            id: 'ex1',
            title: 'Links Example',
            html: '<a href="https://www.google.com">Visit Google</a><br>\n<a href="https://www.github.com" target="_blank">GitHub (new tab)</a>',
            css: '',
            js: '',
          },
          {
            id: 'ex2',
            title: 'Images Example',
            html: '<img src="https://via.placeholder.com/300" alt="Placeholder image" width="300">\n<p>This is an example image</p>',
            css: '',
            js: '',
          },
        ],
        trains: [
          {
            id: 'train1',
            title: 'Create Links',
            title_uz: 'Havolalar Yaratish',
            title_ru: 'Создание ссылок',
            title_en: 'Create Links',
            task: 'Create a link to https://www.example.com with the text "Click here"',
            task_uz: '"Bu yerga bosing" matni bilan https://www.example.com ga havola yarating',
            task_ru: 'Создайте ссылку на https://www.example.com с текстом "Нажмите здесь"',
            task_en: 'Create a link to https://www.example.com with the text "Click here"',
            initialHtml: '<!DOCTYPE html>\n<html>\n<head>\n    <title>Exercise</title>\n</head>\n<body>\n    <!-- Add your link here -->\n</body>\n</html>',
            initialCss: '',
            checks: [
              {
                id: 'check1',
                type: 'html',
                rule: 'exists:a',
                hint: 'You need an anchor (a) tag',
                hint_uz: 'Sizga anchor (a) tag kerak',
                hint_ru: 'Вам нужен тег anchor (a)',
                hint_en: 'You need an anchor (a) tag',
              },
              {
                id: 'check2',
                type: 'html',
                rule: 'attr:a.href',
                hint: 'Your link needs an href attribute',
                hint_uz: 'Havolangizga href atributi kerak',
                hint_ru: 'Вашей ссылке нужен атрибут href',
                hint_en: 'Your link needs an href attribute',
              },
            ],
          },
          {
            id: 'train2',
            title: 'Add Images',
            title_uz: 'Rasmlar Qo\'shish',
            title_ru: 'Добавление изображений',
            title_en: 'Add Images',
            task: 'Add an image with src="https://via.placeholder.com/200" and alt="Placeholder"',
            task_uz: 'Src="https://via.placeholder.com/200" va alt="Placeholder" bilan rasm qo\'shing',
            task_ru: 'Добавьте изображение с src="https://via.placeholder.com/200" и alt="Placeholder"',
            task_en: 'Add an image with src="https://via.placeholder.com/200" and alt="Placeholder"',
            initialHtml: '<!DOCTYPE html>\n<html>\n<head>\n    <title>Exercise</title>\n</head>\n<body>\n    <!-- Add your image here -->\n</body>\n</html>',
            initialCss: '',
            checks: [
              {
                id: 'check1',
                type: 'html',
                rule: 'exists:img',
                hint: 'You need an img tag',
                hint_uz: 'Sizga img tag kerak',
                hint_ru: 'Вам нужен тег img',
                hint_en: 'You need an img tag',
              },
              {
                id: 'check2',
                type: 'html',
                rule: 'attr:img.alt',
                hint: 'Your image needs an alt attribute',
                hint_uz: 'Rasmingizga alt atributi kerak',
                hint_ru: 'Вашему изображению нужен атрибут alt',
                hint_en: 'Your image needs an alt attribute',
              },
            ],
          },
        ],
        homework: {
          id: 'hw1',
          title: 'Links and Images Page',
          title_uz: 'Havolalar va Rasmlar Sahifasi',
          title_ru: 'Страница ссылок и изображений',
          title_en: 'Links and Images Page',
          brief: 'Create a webpage with:\n- An <h1> heading\n- At least 2 <a> links to different websites (use href attribute)\n- At least 2 <img> images with alt text (use src and alt attributes)\n- A <p> paragraph describing the links',
          brief_uz: 'Quyidagilarga ega bo\'lgan veb-sahifa yarating:\n- <h1> heading\n- Turli saytlarga kamida 2 ta <a> havola (href atributidan foydalaning)\n- Alt matn bilan kamida 2 ta <img> rasm (src va alt atributlaridan foydalaning)\n- Havolalarni tavsiflovchi <p> paragraf',
          brief_ru: 'Создайте веб-страницу с:\n- Заголовок <h1>\n- Минимум 2 ссылки <a> на разные сайты (используйте атрибут href)\n- Минимум 2 изображения <img> с текстом alt (используйте атрибуты src и alt)\n- Параграф <p>, описывающий ссылки',
          brief_en: 'Create a webpage with:\n- An <h1> heading\n- At least 2 <a> links to different websites (use href attribute)\n- At least 2 <img> images with alt text (use src and alt attributes)\n- A <p> paragraph describing the links',
          rubric: [
            {
              id: 'r1',
              description: 'Has an <h1> heading',
              description_uz: '<h1> heading mavjud',
              description_ru: 'Имеет заголовок <h1>',
              description_en: 'Has an <h1> heading',
              points: 20,
            },
            {
              id: 'r2',
              description: 'Has at least 2 <a> links with href',
              description_uz: 'Href bilan kamida 2 ta <a> havola mavjud',
              description_ru: 'Имеет минимум 2 ссылки <a> с href',
              description_en: 'Has at least 2 <a> links with href',
              points: 30,
            },
            {
              id: 'r3',
              description: 'Has at least 2 <img> images with src and alt',
              description_uz: 'Src va alt bilan kamida 2 ta <img> rasm mavjud',
              description_ru: 'Имеет минимум 2 изображения <img> с src и alt',
              description_en: 'Has at least 2 <img> images with src and alt',
              points: 30,
            },
            {
              id: 'r4',
              description: 'Has a <p> descriptive paragraph',
              description_uz: '<p> tavsiflovchi paragraf mavjud',
              description_ru: 'Имеет описательный параграф <p>',
              description_en: 'Has a <p> descriptive paragraph',
              points: 20,
            },
          ],
          checks: [
            {
              id: 'r1',
              type: 'html',
              rule: 'exists:h1',
              hint: 'You need an <h1> heading',
              hint_uz: 'Sizga <h1> heading kerak',
              hint_ru: 'Вам нужен заголовок <h1>',
              hint_en: 'You need an <h1> heading',
            },
            {
              id: 'r2',
              type: 'html',
              rule: 'count:a>=2',
              hint: 'You need at least 2 <a> links with href attribute',
              hint_uz: 'Href atributi bilan kamida 2 ta <a> havola kerak',
              hint_ru: 'Вам нужно минимум 2 ссылки <a> с атрибутом href',
              hint_en: 'You need at least 2 <a> links with href attribute',
            },
            {
              id: 'r3',
              type: 'html',
              rule: 'count:img>=2',
              hint: 'You need at least 2 <img> images with src and alt attributes',
              hint_uz: 'Src va alt atributlari bilan kamida 2 ta <img> rasm kerak',
              hint_ru: 'Вам нужно минимум 2 изображения <img> с атрибутами src и alt',
              hint_en: 'You need at least 2 <img> images with src and alt attributes',
            },
            {
              id: 'r3',
              type: 'html',
              rule: 'attr:img.alt',
              hint: 'All images need alt attributes',
              hint_uz: 'Barcha rasmlar alt atributlariga ega bo\'lishi kerak',
              hint_ru: 'Все изображения должны иметь атрибуты alt',
              hint_en: 'All images need alt attributes',
            },
            {
              id: 'r4',
              type: 'html',
              rule: 'exists:p',
              hint: 'You need a <p> paragraph describing the links',
              hint_uz: 'Havolalarni tavsiflovchi <p> paragraf kerak',
              hint_ru: 'Вам нужен параграф <p>, описывающий ссылки',
              hint_en: 'You need a <p> paragraph describing the links',
            },
          ],
        },
        unlockAt: new Date(now.getTime() - 22 * 60 * 60 * 1000),
        order: 3,
      },
      {
        slug: 'html-attributes-classes',
        title: 'HTML Attributes and Classes',
        title_uz: 'HTML Atributlar va Classlar',
        title_ru: 'HTML Атрибуты и классы',
        title_en: 'HTML Attributes and Classes',
        summary: 'Learn about attributes, classes, and IDs for styling and organization',
        summary_uz: 'Stil va tashkilot uchun atributlar, classlar va IDlar haqida o\'rganing',
        summary_ru: 'Узнайте об атрибутах, классах и ID для стилизации и организации',
        summary_en: 'Learn about attributes, classes, and IDs for styling and organization',
        contentMD: `# HTML Attributes and Classes

Attributes provide additional information about HTML elements.

## Common Attributes

### class Attribute

The **class** attribute is used to group elements for styling with CSS:

\`\`\`html
<p class="intro">Introduction paragraph</p>
<p class="intro">Another intro paragraph</p>
<h1 class="title">Main Title</h1>
\`\`\`

You can use multiple classes:
\`\`\`html
<p class="text large blue">Large blue text</p>
\`\`\`

### id Attribute

The **id** attribute gives a unique identifier to an element:

\`\`\`html
<div id="header">Header content</div>
<div id="main-content">Main content</div>
\`\`\`

**Important:** Each id should be unique on the page!

### Other Common Attributes

- **title** - Tooltip text (shown on hover)
- **lang** - Language of the element
- **data-\*** - Custom data attributes

\`\`\`html
<p title="This is a tooltip">Hover over me</p>
<div lang="en">English content</div>
<div data-user="123">User info</div>
\`\`\``,
        contentMD_uz: `# HTML Atributlar va Classlar

Atributlar HTML elementlar haqida qo'shimcha ma'lumot beradi.

## Umumiy Atributlar

### class Atributi

**class** atributi CSS bilan stil uchun elementlarni guruhlash uchun ishlatiladi:

\`\`\`html
<p class="intro">Kirish paragrafi</p>
<p class="intro">Yana bir kirish paragrafi</p>
<h1 class="title">Asosiy Sarlavha</h1>
\`\`\`

Bir nechta classlardan foydalanishingiz mumkin:
\`\`\`html
<p class="text large blue">Katta ko'k matn</p>
\`\`\`

### id Atributi

**id** atributi elementga noyob identifikator beradi:

\`\`\`html
<div id="header">Header kontenti</div>
<div id="main-content">Asosiy kontent</div>
\`\`\`

**Muhim:** Har bir id sahifada noyob bo'lishi kerak!

### Boshqa Umumiy Atributlar

- **title** - Tooltip matni (hover qilganda ko'rsatiladi)
- **lang** - Element tili
- **data-*** - Maxsus ma'lumot atributlari

\`\`\`html
<p title="Bu tooltip">Ustimdan o'ting</p>
<div lang="en">Ingliz kontenti</div>
<div data-user="123">Foydalanuvchi ma'lumoti</div>
\`\`\``,
        contentMD_ru: `# HTML Атрибуты и классы

Атрибуты предоставляют дополнительную информацию об HTML элементах.

## Общие атрибуты

### Атрибут class

Атрибут **class** используется для группировки элементов для стилизации с CSS:

\`\`\`html
<p class="intro">Вводный параграф</p>
<p class="intro">Еще один вводный параграф</p>
<h1 class="title">Главный заголовок</h1>
\`\`\`

Вы можете использовать несколько классов:
\`\`\`html
<p class="text large blue">Большой синий текст</p>
\`\`\`

### Атрибут id

Атрибут **id** дает уникальный идентификатор элементу:

\`\`\`html
<div id="header">Содержимое заголовка</div>
<div id="main-content">Основное содержимое</div>
\`\`\`

**Важно:** Каждый id должен быть уникальным на странице!

### Другие общие атрибуты

- **title** - Текст подсказки (показывается при наведении)
- **lang** - Язык элемента
- **data-*** - Пользовательские атрибуты данных

\`\`\`html
<p title="Это подсказка">Наведите на меня</p>
<div lang="en">Английский контент</div>
<div data-user="123">Информация о пользователе</div>
\`\`\``,
        contentMD_en: `# HTML Attributes and Classes

Attributes provide additional information about HTML elements.

## Common Attributes

### class Attribute

The **class** attribute is used to group elements for styling with CSS:

\`\`\`html
<p class="intro">Introduction paragraph</p>
<p class="intro">Another intro paragraph</p>
<h1 class="title">Main Title</h1>
\`\`\`

You can use multiple classes:
\`\`\`html
<p class="text large blue">Large blue text</p>
\`\`\`

### id Attribute

The **id** attribute gives a unique identifier to an element:

\`\`\`html
<div id="header">Header content</div>
<div id="main-content">Main content</div>
\`\`\`

**Important:** Each id should be unique on the page!

### Other Common Attributes

- **title** - Tooltip text (shown on hover)
- **lang** - Language of the element
- **data-\*** - Custom data attributes

\`\`\`html
<p title="This is a tooltip">Hover over me</p>
<div lang="en">English content</div>
<div data-user="123">User info</div>
\`\`\``,
        examples: [
          {
            id: 'ex1',
            title: 'Classes Example',
            html: '<p class="intro">This is an introduction</p>\n<p class="intro">This is also an introduction</p>\n<p class="conclusion">This is a conclusion</p>',
            css: '',
            js: '',
          },
          {
            id: 'ex2',
            title: 'IDs Example',
            html: '<div id="header">Header</div>\n<div id="content">Content</div>\n<div id="footer">Footer</div>',
            css: '',
            js: '',
          },
        ],
        trains: [
          {
            id: 'train1',
            title: 'Use Classes',
            title_uz: 'Classlardan Foydalanish',
            title_ru: 'Использование классов',
            title_en: 'Use Classes',
            task: 'Create 3 paragraphs, each with class="text"',
            task_uz: 'Har biri class="text" ga ega bo\'lgan 3 ta paragraf yarating',
            task_ru: 'Создайте 3 параграфа, каждый с class="text"',
            task_en: 'Create 3 paragraphs, each with class="text"',
            initialHtml: '<!DOCTYPE html>\n<html>\n<head>\n    <title>Exercise</title>\n</head>\n<body>\n    <!-- Add your paragraphs with class="text" here -->\n</body>\n</html>',
            initialCss: '',
            checks: [
              {
                id: 'check1',
                type: 'html',
                rule: 'count:.text>=3',
                hint: 'You need at least 3 elements with class="text"',
                hint_uz: 'Sizga class="text" ga ega kamida 3 ta element kerak',
                hint_ru: 'Вам нужно минимум 3 элемента с class="text"',
                hint_en: 'You need at least 3 elements with class="text"',
              },
            ],
          },
          {
            id: 'train2',
            title: 'Use IDs',
            title_uz: 'IDlardan Foydalanish',
            title_ru: 'Использование ID',
            title_en: 'Use IDs',
            task: 'Create a div with id="container"',
            task_uz: 'Id="container" ga ega bo\'lgan div yarating',
            task_ru: 'Создайте div с id="container"',
            task_en: 'Create a div with id="container"',
            initialHtml: '<!DOCTYPE html>\n<html>\n<head>\n    <title>Exercise</title>\n</head>\n<body>\n    <!-- Add your div with id="container" here -->\n</body>\n</html>',
            initialCss: '',
            checks: [
              {
                id: 'check1',
                type: 'html',
                rule: 'exists:#container',
                hint: 'You need a div with id="container"',
                hint_uz: 'Sizga id="container" ga ega div kerak',
                hint_ru: 'Вам нужен div с id="container"',
                hint_en: 'You need a div with id="container"',
              },
            ],
          },
        ],
        homework: {
          id: 'hw1',
          title: 'Structured Page with Classes and IDs',
          title_uz: 'Classlar va IDlar bilan Tuzilgan Sahifa',
          title_ru: 'Структурированная страница с классами и ID',
          title_en: 'Structured Page with Classes and IDs',
          brief: 'Create a webpage with:\n- A div with id="header" containing an h1\n- A div with id="content" containing paragraphs with class="text"\n- A div with id="footer"',
          brief_uz: 'Quyidagilarga ega bo\'lgan veb-sahifa yarating:\n- H1 ni o\'z ichiga olgan id="header" ga ega div\n- Class="text" ga ega paragraflarni o\'z ichiga olgan id="content" ga ega div\n- Id="footer" ga ega div',
          brief_ru: 'Создайте веб-страницу с:\n- Div с id="header", содержащий h1\n- Div с id="content", содержащий параграфы с class="text"\n- Div с id="footer"',
          brief_en: 'Create a webpage with:\n- A div with id="header" containing an h1\n- A div with id="content" containing paragraphs with class="text"\n- A div with id="footer"',
          rubric: [
            {
              id: 'r1',
              description: 'Has div with id="header"',
              description_uz: 'Id="header" ga ega div mavjud',
              description_ru: 'Имеет div с id="header"',
              description_en: 'Has div with id="header"',
              points: 25,
            },
            {
              id: 'r2',
              description: 'Has div with id="content"',
              description_uz: 'Id="content" ga ega div mavjud',
              description_ru: 'Имеет div с id="content"',
              description_en: 'Has div with id="content"',
              points: 25,
            },
            {
              id: 'r3',
              description: 'Has paragraphs with class="text"',
              description_uz: 'Class="text" ga ega paragraflar mavjud',
              description_ru: 'Имеет параграфы с class="text"',
              description_en: 'Has paragraphs with class="text"',
              points: 25,
            },
            {
              id: 'r4',
              description: 'Has div with id="footer"',
              description_uz: 'Id="footer" ga ega div mavjud',
              description_ru: 'Имеет div с id="footer"',
              description_en: 'Has div with id="footer"',
              points: 25,
            },
          ],
          checks: [
            {
              id: 'hw1',
              type: 'html',
              rule: 'exists:#header',
              hint: 'You need a div with id="header"',
              hint_uz: 'Sizga id="header" ga ega div kerak',
              hint_ru: 'Вам нужен div с id="header"',
              hint_en: 'You need a div with id="header"',
            },
            {
              id: 'hw2',
              type: 'html',
              rule: 'exists:#content',
              hint: 'You need a div with id="content"',
              hint_uz: 'Sizga id="content" ga ega div kerak',
              hint_ru: 'Вам нужен div с id="content"',
              hint_en: 'You need a div with id="content"',
            },
            {
              id: 'hw3',
              type: 'html',
              rule: 'exists:.text',
              hint: 'You need elements with class="text"',
              hint_uz: 'Sizga class="text" ga ega elementlar kerak',
              hint_ru: 'Вам нужны элементы с class="text"',
              hint_en: 'You need elements with class="text"',
            },
            {
              id: 'hw4',
              type: 'html',
              rule: 'exists:#footer',
              hint: 'You need a div with id="footer"',
              hint_uz: 'Sizga id="footer" ga ega div kerak',
              hint_ru: 'Вам нужен div с id="footer"',
              hint_en: 'You need a div with id="footer"',
            },
          ],
        },
        unlockAt: new Date(now.getTime() - 21 * 60 * 60 * 1000),
        order: 4,
      },
      // CSS BASICS
      {
        slug: 'css-introduction',
        title: 'CSS Introduction',
        title_uz: 'CSS Kirish',
        title_ru: 'Введение в CSS',
        title_en: 'CSS Introduction',
        summary: 'Learn how to style your HTML with CSS',
        summary_uz: 'CSS bilan HTMLingizga stil berishni o\'rganing',
        summary_ru: 'Узнайте, как стилизовать ваш HTML с помощью CSS',
        summary_en: 'Learn how to style your HTML with CSS',
        contentMD: `# CSS Introduction

CSS (Cascading Style Sheets) controls how HTML elements look on the page.

## What is CSS?

CSS allows you to:
- Change colors, fonts, sizes
- Control layout and spacing
- Add animations and effects
- Make your pages responsive

## CSS Syntax

\`\`\`css
selector {
    property: value;
}
\`\`\`

**Example:**
\`\`\`css
h1 {
    color: blue;
    font-size: 24px;
}
\`\`\`

This makes all **h1** headings blue and 24px in size.

## Three Ways to Add CSS

### 1. Inline CSS (in HTML)
\`\`\`html
<h1 style="color: blue;">Heading</h1>
\`\`\`

### 2. Internal CSS (in <style> tag)
\`\`\`html
<style>
    h1 {
        color: blue;
    }
</style>
\`\`\`

### 3. External CSS (separate file)
\`\`\`html
<link rel="stylesheet" href="styles.css">
\`\`\`

**Best Practice:** Use external CSS for better organization!`,
        examples: [
          {
            id: 'ex1',
            title: 'Basic CSS',
            html: '<h1>Styled Heading</h1>\n<p>This is a paragraph</p>',
            css: 'h1 {\n    color: blue;\n    font-size: 32px;\n}\n\np {\n    color: gray;\n    font-size: 16px;\n}',
            js: '',
          },
        ],
        trains: [
          {
            id: 'train1',
            title: 'Style a Heading',
            task: 'Make the h1 heading red and 24px in size',
            initialHtml: '<h1>Styled Heading</h1>',
            initialCss: '/* Write your CSS here */',
            checks: [
              {
                id: 'check1',
                type: 'css',
                rule: 'rule:h1 color=red',
                hint: 'Set the color property to red',
              },
              {
                id: 'check2',
                type: 'css',
                rule: 'rule:h1 font-size=24px',
                hint: 'Set the font-size to 24px',
              },
            ],
          },
        ],
        homework: {
          id: 'hw1',
          title: 'Style Your Page',
          brief: 'Create HTML with h1 and p elements, then style them:\n- Make h1 blue\n- Make p gray',
          rubric: [
            {
              id: 'r1',
              description: 'Has h1 and p elements in HTML',
              points: 30,
            },
            {
              id: 'r2',
              description: 'h1 is styled blue',
              points: 35,
            },
            {
              id: 'r3',
              description: 'p is styled gray',
              points: 35,
            },
          ],
          checks: [
            {
              id: 'hw1',
              type: 'html',
              rule: 'exists:h1',
              hint: 'You need an h1 element',
            },
            {
              id: 'hw2',
              type: 'html',
              rule: 'exists:p',
              hint: 'You need a p element',
            },
            {
              id: 'hw3',
              type: 'css',
              rule: 'rule:h1 color=blue',
              hint: 'h1 should be blue',
            },
            {
              id: 'hw4',
              type: 'css',
              rule: 'rule:p color=gray',
              hint: 'p should be gray',
            },
          ],
        },
        unlockAt: new Date(now.getTime() - 20 * 60 * 60 * 1000),
        order: 5,
      },
      {
        slug: 'css-selectors',
        title: 'CSS Selectors',
        title_uz: 'CSS Selectorlar',
        title_ru: 'CSS Селекторы',
        title_en: 'CSS Selectors',
        summary: 'Learn how to select elements with CSS selectors',
        summary_uz: 'CSS selectorlar bilan elementlarni tanlashni o\'rganing',
        summary_ru: 'Узнайте, как выбирать элементы с помощью CSS селекторов',
        summary_en: 'Learn how to select elements with CSS selectors',
        contentMD: `# CSS Selectors

Selectors determine which elements get styled.

## Basic Selectors

### Element Selector
Selects all elements of that type:
\`\`\`css
p {
    color: blue;
}
\`\`\`

### Class Selector
Selects elements with a specific class (use **.**):
\`\`\`css
.intro {
    font-weight: bold;
}
\`\`\`

### ID Selector
Selects element with specific ID (use **#**):
\`\`\`css
#header {
    background-color: gray;
}
\`\`\`

## Combining Selectors

### Multiple Elements
\`\`\`css
h1, h2, h3 {
    color: blue;
}
\`\`\`

### Descendant Selector
\`\`\`css
div p {
    color: red;
}
\`\`\`
Selects all **p** elements inside **div** elements.

### Child Selector
\`\`\`css
div > p {
    color: blue;
}
\`\`\`
Selects **p** elements that are direct children of **div**`,
        examples: [
          {
            id: 'ex1',
            title: 'Class Selector',
            html: '<p class="intro">Introduction</p>\n<p>Regular text</p>\n<p class="intro">Another intro</p>',
            css: '.intro {\n    color: blue;\n    font-weight: bold;\n}',
            js: '',
          },
          {
            id: 'ex2',
            title: 'ID Selector',
            html: '<div id="header">Header</div>\n<div id="content">Content</div>',
            css: '#header {\n    background-color: lightblue;\n    padding: 20px;\n}',
            js: '',
          },
        ],
        trains: [
          {
            id: 'train1',
            title: 'Use Class Selector',
            task: 'Style elements with class="highlight" to have yellow background',
            initialHtml: '<p class="highlight">Important text</p>\n<p>Regular text</p>',
            initialCss: '/* Write your CSS here */',
            checks: [
              {
                id: 'check1',
                type: 'css',
                rule: 'rule:.highlight background-color=yellow',
                hint: 'Use .highlight selector with background-color: yellow',
              },
            ],
          },
        ],
        homework: {
          id: 'hw1',
          title: 'Multiple Selectors',
          brief: 'Create HTML with:\n- A div with id="container"\n- Paragraphs with class="text"\n- Style the container with gray background\n- Style .text with blue color',
          rubric: [
            {
              id: 'r1',
              description: 'Has div with id="container"',
              points: 25,
            },
            {
              id: 'r2',
              description: 'Has paragraphs with class="text"',
              points: 25,
            },
            {
              id: 'r3',
              description: 'Container has gray background',
              points: 25,
            },
            {
              id: 'r4',
              description: '.text has blue color',
              points: 25,
            },
          ],
          checks: [
            {
              id: 'hw1',
              type: 'html',
              rule: 'exists:#container',
              hint: 'You need a div with id="container"',
            },
            {
              id: 'hw2',
              type: 'html',
              rule: 'exists:.text',
              hint: 'You need elements with class="text"',
            },
            {
              id: 'hw3',
              type: 'css',
              rule: 'rule:#container background-color=gray',
              hint: 'Style #container with gray background',
            },
            {
              id: 'hw4',
              type: 'css',
              rule: 'rule:.text color=blue',
              hint: 'Style .text with blue color',
            },
          ],
        },
        unlockAt: new Date(now.getTime() - 19 * 60 * 60 * 1000),
        order: 6,
      },
      {
        slug: 'css-colors-fonts',
        title: 'CSS Colors and Fonts',
        title_uz: 'CSS Ranglar va Fontlar',
        title_ru: 'CSS Цвета и шрифты',
        title_en: 'CSS Colors and Fonts',
        summary: 'Learn about colors, fonts, and text styling in CSS',
        summary_uz: 'CSS da ranglar, fontlar va matn stilini o\'rganing',
        summary_ru: 'Узнайте о цветах, шрифтах и стилизации текста в CSS',
        summary_en: 'Learn about colors, fonts, and text styling in CSS',
        contentMD: `# CSS Colors and Fonts

## Colors

CSS supports many ways to specify colors:

### Named Colors
\`\`\`css
p {
    color: blue;
    background-color: yellow;
}
\`\`\`

### RGB
\`\`\`css
p {
    color: rgb(255, 0, 0); /* Red */
}
\`\`\`

### HEX
\`\`\`css
p {
    color: #ff0000; /* Red */
    background-color: #00ff00; /* Green */
}
\`\`\`

## Fonts

### font-family
\`\`\`css
p {
    font-family: Arial, sans-serif;
}
\`\`\`

### font-size
\`\`\`css
h1 {
    font-size: 32px;
}
\`\`\`

### font-weight
\`\`\`css
.bold {
    font-weight: bold;
}
\`\`\`

### font-style
\`\`\`css
.italic {
    font-style: italic;
}
\`\`\`

## Text Properties

\`\`\`css
p {
    text-align: center; /* left, right, center, justify */
    text-decoration: underline; /* none, underline, line-through */
    line-height: 1.5; /* Space between lines */
}
\`\`\``,
        examples: [
          {
            id: 'ex1',
            title: 'Colors Example',
            html: '<p class="red-text">Red text</p>\n<p class="blue-bg">Blue background</p>',
            css: '.red-text {\n    color: red;\n}\n\n.blue-bg {\n    background-color: blue;\n    color: white;\n}',
            js: '',
          },
          {
            id: 'ex2',
            title: 'Fonts Example',
            html: '<h1>Large Heading</h1>\n<p class="bold">Bold text</p>\n<p class="italic">Italic text</p>',
            css: 'h1 {\n    font-size: 48px;\n    font-family: Arial, sans-serif;\n}\n\n.bold {\n    font-weight: bold;\n}\n\n.italic {\n    font-style: italic;\n}',
            js: '',
          },
        ],
        trains: [
          {
            id: 'train1',
            title: 'Set Colors',
            task: 'Make the paragraph red with white background',
            initialHtml: '<p>Styled text</p>',
            initialCss: '/* Write your CSS here */',
            checks: [
              {
                id: 'check1',
                type: 'css',
                rule: 'rule:p color=red',
                hint: 'Set color to red',
              },
              {
                id: 'check2',
                type: 'css',
                rule: 'rule:p background-color=white',
                hint: 'Set background-color to white',
              },
            ],
          },
        ],
        homework: {
          id: 'hw1',
          title: 'Styled Text Page',
          brief: 'Create a page with:\n- An h1 with large font size (48px)\n- A paragraph with blue color\n- A paragraph with bold text\n- Use different font families',
          rubric: [
            {
              id: 'r1',
              description: 'Has h1 with 48px font size',
              points: 25,
            },
            {
              id: 'r2',
              description: 'Has paragraph with blue color',
              points: 25,
            },
            {
              id: 'r3',
              description: 'Has bold text',
              points: 25,
            },
            {
              id: 'r4',
              description: 'Uses font-family',
              points: 25,
            },
          ],
          checks: [
            {
              id: 'hw1',
              type: 'html',
              rule: 'exists:h1',
              hint: 'You need an h1',
            },
            {
              id: 'hw2',
              type: 'css',
              rule: 'rule:h1 font-size=48px',
              hint: 'h1 should be 48px',
            },
            {
              id: 'hw3',
              type: 'css',
              rule: 'rule:p color=blue',
              hint: 'Paragraph should be blue',
            },
          ],
        },
        unlockAt: new Date(now.getTime() - 18 * 60 * 60 * 1000),
        order: 7,
      },
      {
        slug: 'css-box-model',
        title: 'CSS Box Model',
        summary: 'Understand margin, padding, border, and the box model',
        contentMD: `# CSS Box Model

Every HTML element is a box with four parts:
1. **Content** - The actual content
2. **Padding** - Space inside the element
3. **Border** - Border around the element
4. **Margin** - Space outside the element

## Padding

Space inside the element:
\`\`\`css
div {
    padding: 20px; /* All sides */
    padding: 10px 20px; /* Top/bottom, left/right */
    padding: 10px 20px 30px 40px; /* Top, right, bottom, left */
}
\`\`\`

## Margin

Space outside the element:
\`\`\`css
div {
    margin: 20px;
    margin: 10px 20px;
    margin: 10px 20px 30px 40px;
}
\`\`\`

## Border

Border around the element:
\`\`\`css
div {
    border: 2px solid black;
    border-width: 2px;
    border-style: solid;
    border-color: black;
}
\`\`\`

**Border styles:** solid, dashed, dotted, double`,
        examples: [
          {
            id: 'ex1',
            title: 'Box Model Example',
            html: '<div class="box">Content here</div>',
            css: '.box {\n    padding: 20px;\n    margin: 20px;\n    border: 2px solid black;\n    background-color: lightblue;\n}',
            js: '',
          },
        ],
        trains: [
          {
            id: 'train1',
            title: 'Add Padding and Margin',
            task: 'Add 20px padding and 10px margin to the div',
            initialHtml: '<div class="box">Content</div>',
            initialCss: '/* Write your CSS here */',
            checks: [
              {
                id: 'check1',
                type: 'css',
                rule: 'exists:.box',
                hint: 'You need a .box selector',
              },
            ],
          },
        ],
        homework: {
          id: 'hw1',
          title: 'Box Model Practice',
          brief: 'Create a div with:\n- 30px padding\n- 20px margin\n- 3px solid black border\n- Light blue background',
          rubric: [
            {
              id: 'r1',
              description: 'Has padding',
              points: 25,
            },
            {
              id: 'r2',
              description: 'Has margin',
              points: 25,
            },
            {
              id: 'r3',
              description: 'Has border',
              points: 25,
            },
            {
              id: 'r4',
              description: 'Has background color',
              points: 25,
            },
          ],
          checks: [
            {
              id: 'hw1',
              type: 'html',
              rule: 'exists:div',
              hint: 'You need a div',
            },
            {
              id: 'hw2',
              type: 'css',
              rule: 'exists:div',
              hint: 'Style the div',
            },
          ],
        },
        unlockAt: new Date(now.getTime() - 17 * 60 * 60 * 1000),
        order: 8,
      },
      {
        slug: 'html-tables',
        title: 'HTML Tables',
        summary: 'Learn how to create and structure tables in HTML',
        contentMD: `# HTML Tables

Tables are used to display data in rows and columns.

## Basic Table Structure

\`\`\`html
<table>
    <tr>
        <th>Header 1</th>
        <th>Header 2</th>
    </tr>
    <tr>
        <td>Data 1</td>
        <td>Data 2</td>
    </tr>
</table>
\`\`\`

## Table Elements

- **<table>** - The table container
- **<tr>** - Table row
- **<th>** - Table header cell (bold by default)
- **<td>** - Table data cell

## Table Example

\`\`\`html
<table>
    <tr>
        <th>Name</th>
        <th>Age</th>
        <th>City</th>
    </tr>
    <tr>
        <td>John</td>
        <td>25</td>
        <td>New York</td>
    </tr>
    <tr>
        <td>Jane</td>
        <td>30</td>
        <td>London</td>
    </tr>
</table>
\`\`\``,
        examples: [
          {
            id: 'ex1',
            title: 'Simple Table',
            html: '<table border="1">\n    <tr>\n        <th>Name</th>\n        <th>Age</th>\n    </tr>\n    <tr>\n        <td>John</td>\n        <td>25</td>\n    </tr>\n</table>',
            css: '',
            js: '',
          },
        ],
        trains: [
          {
            id: 'train1',
            title: 'Create a Table',
            task: 'Create a table with 2 columns (Name and City) and at least 2 rows of data',
            initialHtml: '<!DOCTYPE html>\n<html>\n<head>\n    <title>Exercise</title>\n</head>\n<body>\n    <!-- Create your table here -->\n</body>\n</html>',
            initialCss: '',
            checks: [
              {
                id: 'check1',
                type: 'html',
                rule: 'exists:table',
                hint: 'You need a table element',
              },
              {
                id: 'check2',
                type: 'html',
                rule: 'exists:th',
                hint: 'You need table header cells (th)',
              },
              {
                id: 'check3',
                type: 'html',
                rule: 'exists:td',
                hint: 'You need table data cells (td)',
              },
            ],
          },
        ],
        homework: {
          id: 'hw1',
          title: 'Student Grade Table',
          brief: 'Create a table showing student grades:\n- Headers: Name, Subject, Grade\n- At least 3 rows of student data',
          rubric: [
            {
              id: 'r1',
              description: 'Has table structure',
              points: 30,
            },
            {
              id: 'r2',
              description: 'Has th elements for headers',
              points: 30,
            },
            {
              id: 'r3',
              description: 'Has at least 3 rows with data',
              points: 40,
            },
          ],
          checks: [
            {
              id: 'hw1',
              type: 'html',
              rule: 'exists:table',
              hint: 'You need a table',
            },
            {
              id: 'hw2',
              type: 'html',
              rule: 'count:th>=3',
              hint: 'You need at least 3 header cells',
            },
            {
              id: 'hw3',
              type: 'html',
              rule: 'count:tr>=4',
              hint: 'You need at least 4 rows (1 header + 3 data)',
            },
          ],
        },
        unlockAt: new Date(now.getTime() - 16 * 60 * 60 * 1000),
        order: 9,
      },
      {
        slug: 'html-forms',
        title: 'HTML Forms',
        summary: 'Learn how to create forms for user input',
        contentMD: `# HTML Forms

Forms collect user input. They're essential for interactive websites.

## Basic Form Structure

\`\`\`html
<form>
    <input type="text" name="username">
    <button type="submit">Submit</button>
</form>
\`\`\`

## Input Types

- **text** - Text input
- **email** - Email input
- **password** - Password input (hidden)
- **number** - Number input
- **checkbox** - Checkbox
- **radio** - Radio button
- **submit** - Submit button

## Form Elements

\`\`\`html
<form>
    <label for="name">Name:</label>
    <input type="text" id="name" name="name">
    
    <label for="email">Email:</label>
    <input type="email" id="email" name="email">
    
    <button type="submit">Submit</button>
</form>
\`\`\`

**Note:** Use **label** with **for** attribute to connect labels to inputs!`,
        examples: [
          {
            id: 'ex1',
            title: 'Contact Form',
            html: '<form>\n    <label for="name">Name:</label>\n    <input type="text" id="name" name="name">\n    <br><br>\n    <label for="email">Email:</label>\n    <input type="email" id="email" name="email">\n    <br><br>\n    <button type="submit">Send</button>\n</form>',
            css: '',
            js: '',
          },
        ],
        trains: [
          {
            id: 'train1',
            title: 'Create a Form',
            task: 'Create a form with a text input for "name" and a submit button',
            initialHtml: '<!DOCTYPE html>\n<html>\n<head>\n    <title>Exercise</title>\n</head>\n<body>\n    <!-- Create your form here -->\n</body>\n</html>',
            initialCss: '',
            checks: [
              {
                id: 'check1',
                type: 'html',
                rule: 'exists:form',
                hint: 'You need a form element',
              },
              {
                id: 'check2',
                type: 'html',
                rule: 'exists:input',
                hint: 'You need an input element',
              },
              {
                id: 'check3',
                type: 'html',
                rule: 'exists:button',
                hint: 'You need a button element',
              },
            ],
          },
        ],
        homework: {
          id: 'hw1',
          title: 'Registration Form',
          brief: 'Create a registration form with:\n- Name input (text)\n- Email input (email)\n- Password input (password)\n- Submit button\n- Use labels for each input',
          rubric: [
            {
              id: 'r1',
              description: 'Has form element',
              points: 20,
            },
            {
              id: 'r2',
              description: 'Has name, email, and password inputs',
              points: 40,
            },
            {
              id: 'r3',
              description: 'Has labels for inputs',
              points: 20,
            },
            {
              id: 'r4',
              description: 'Has submit button',
              points: 20,
            },
          ],
          checks: [
            {
              id: 'hw1',
              type: 'html',
              rule: 'exists:form',
              hint: 'You need a form',
            },
            {
              id: 'hw2',
              type: 'html',
              rule: 'count:input>=3',
              hint: 'You need at least 3 input fields',
            },
            {
              id: 'hw3',
              type: 'html',
              rule: 'exists:label',
              hint: 'You need labels',
            },
            {
              id: 'hw4',
              type: 'html',
              rule: 'exists:button',
              hint: 'You need a submit button',
            },
          ],
        },
        unlockAt: new Date(now.getTime() - 15 * 60 * 60 * 1000),
        order: 10,
      },
      {
        slug: 'html-div-span',
        title: 'HTML div and span',
        summary: 'Learn about container elements div and span',
        contentMD: `# HTML div and span

**div** and **span** are container elements used to group and organize content.

## div Element

**div** is a block-level container (takes full width):

\`\`\`html
<div>
    <h1>Heading</h1>
    <p>Paragraph</p>
</div>
\`\`\`

## span Element

**span** is an inline container (takes only needed width):

\`\`\`html
<p>This is <span>inline</span> text.</p>
\`\`\`

## When to Use

- Use **div** for grouping block-level content
- Use **span** for styling parts of text inline
- Both are commonly used with **class** and **id** attributes

\`\`\`html
<div class="container">
    <div class="header">Header</div>
    <div class="content">
        <p>Content with <span class="highlight">highlighted</span> text</p>
    </div>
</div>
\`\`\``,
        examples: [
          {
            id: 'ex1',
            title: 'div Container',
            html: '<div class="container">\n    <h1>Title</h1>\n    <p>Content here</p>\n</div>',
            css: '',
            js: '',
          },
          {
            id: 'ex2',
            title: 'span for Inline',
            html: '<p>This is <span class="highlight">important</span> text.</p>',
            css: '',
            js: '',
          },
        ],
        trains: [
          {
            id: 'train1',
            title: 'Use div and span',
            task: 'Create a div with class="box" containing a paragraph with a span inside',
            initialHtml: '<!DOCTYPE html>\n<html>\n<head>\n    <title>Exercise</title>\n</head>\n<body>\n    <!-- Create your div and span here -->\n</body>\n</html>',
            initialCss: '',
            checks: [
              {
                id: 'check1',
                type: 'html',
                rule: 'exists:.box',
                hint: 'You need a div with class="box"',
              },
              {
                id: 'check2',
                type: 'html',
                rule: 'exists:span',
                hint: 'You need a span element',
              },
            ],
          },
        ],
        homework: {
          id: 'hw1',
          title: 'Structured Page',
          brief: 'Create a page with:\n- A div with id="header" containing an h1\n- A div with id="content" containing paragraphs\n- Use span to highlight important words in the text',
          rubric: [
            {
              id: 'r1',
              description: 'Has div with id="header"',
              points: 30,
            },
            {
              id: 'r2',
              description: 'Has div with id="content"',
              points: 30,
            },
            {
              id: 'r3',
              description: 'Uses span elements',
              points: 40,
            },
          ],
          checks: [
            {
              id: 'hw1',
              type: 'html',
              rule: 'exists:#header',
              hint: 'You need a div with id="header"',
            },
            {
              id: 'hw2',
              type: 'html',
              rule: 'exists:#content',
              hint: 'You need a div with id="content"',
            },
            {
              id: 'hw3',
              type: 'html',
              rule: 'exists:span',
              hint: 'You need span elements',
            },
          ],
        },
        unlockAt: new Date(now.getTime() - 14 * 60 * 60 * 1000),
        order: 11,
      },
      {
        slug: 'css-layout',
        title: 'CSS Layout',
        summary: 'Learn about width, height, and basic layout properties',
        contentMD: `# CSS Layout

Control the size and position of elements with layout properties.

## Width and Height

\`\`\`css
div {
    width: 500px;
    height: 300px;
}
\`\`\`

## Max and Min Width/Height

\`\`\`css
div {
    max-width: 800px;
    min-height: 200px;
}
\`\`\`

## Display Property

- **block** - Takes full width (default for div, h1, p)
- **inline** - Takes only needed width (default for span, a)
- **inline-block** - Mix of both

\`\`\`css
.inline {
    display: inline;
}

.block {
    display: block;
}
\`\`\`

## Text Alignment

\`\`\`css
p {
    text-align: center; /* left, right, center, justify */
}
\`\`\``,
        examples: [
          {
            id: 'ex1',
            title: 'Width and Height',
            html: '<div class="box">Content</div>',
            css: '.box {\n    width: 300px;\n    height: 200px;\n    background-color: lightblue;\n}',
            js: '',
          },
        ],
        trains: [
          {
            id: 'train1',
            title: 'Set Size',
            task: 'Create a div with width 400px and height 200px',
            initialHtml: '<div class="box">Content</div>',
            initialCss: '/* Write your CSS here */',
            checks: [
              {
                id: 'check1',
                type: 'css',
                rule: 'rule:.box width=400px',
                hint: 'Set width to 400px',
              },
              {
                id: 'check2',
                type: 'css',
                rule: 'rule:.box height=200px',
                hint: 'Set height to 200px',
              },
            ],
          },
        ],
        homework: {
          id: 'hw1',
          title: 'Styled Container',
          brief: 'Create a div with:\n- Width 500px\n- Height 300px\n- Center-aligned text\n- Gray background',
          rubric: [
            {
              id: 'r1',
              description: 'Has width and height',
              points: 40,
            },
            {
              id: 'r2',
              description: 'Has text-align center',
              points: 30,
            },
            {
              id: 'r3',
              description: 'Has background color',
              points: 30,
            },
          ],
          checks: [
            {
              id: 'hw1',
              type: 'html',
              rule: 'exists:div',
              hint: 'You need a div',
            },
            {
              id: 'hw2',
              type: 'css',
              rule: 'rule:div width=500px',
              hint: 'Set width to 500px',
            },
            {
              id: 'hw3',
              type: 'css',
              rule: 'rule:div text-align=center',
              hint: 'Set text-align to center',
            },
          ],
        },
        unlockAt: new Date(now.getTime() - 13 * 60 * 60 * 1000),
        order: 12,
      },
      {
        slug: 'css-flexbox',
        title: 'CSS Flexbox',
        summary: 'Learn Flexbox for modern layout design',
        contentMD: `# CSS Flexbox

Flexbox makes it easy to create flexible and responsive layouts.

## Flexbox Basics

\`\`\`css
.container {
    display: flex;
}
\`\`\`

## Flex Direction

\`\`\`css
.container {
    display: flex;
    flex-direction: row; /* or column */
}
\`\`\`

## Justify Content

Align items horizontally:
\`\`\`css
.container {
    display: flex;
    justify-content: center; /* flex-start, center, flex-end, space-between */
}
\`\`\`

## Align Items

Align items vertically:
\`\`\`css
.container {
    display: flex;
    align-items: center; /* flex-start, center, flex-end */
}
\`\`\`

## Flex Properties

\`\`\`css
.item {
    flex: 1; /* Grow to fill space */
}
\`\`\``,
        examples: [
          {
            id: 'ex1',
            title: 'Flexbox Layout',
            html: '<div class="container">\n    <div class="item">Item 1</div>\n    <div class="item">Item 2</div>\n    <div class="item">Item 3</div>\n</div>',
            css: '.container {\n    display: flex;\n    justify-content: space-between;\n}\n\n.item {\n    padding: 10px;\n    background-color: lightblue;\n}',
            js: '',
          },
        ],
        trains: [
          {
            id: 'train1',
            title: 'Use Flexbox',
            task: 'Make the container use flexbox with items centered',
            initialHtml: '<div class="container">\n    <div>Item 1</div>\n    <div>Item 2</div>\n</div>',
            initialCss: '/* Write your CSS here */',
            checks: [
              {
                id: 'check1',
                type: 'css',
                rule: 'rule:.container display=flex',
                hint: 'Set display to flex',
              },
              {
                id: 'check2',
                type: 'css',
                rule: 'rule:.container justify-content=center',
                hint: 'Center items with justify-content',
              },
            ],
          },
        ],
        homework: {
          id: 'hw1',
          title: 'Flexbox Navigation',
          brief: 'Create a navigation bar using flexbox:\n- Container with display: flex\n- Items spaced evenly\n- Center-aligned vertically',
          rubric: [
            {
              id: 'r1',
              description: 'Uses display: flex',
              points: 40,
            },
            {
              id: 'r2',
              description: 'Has justify-content',
              points: 30,
            },
            {
              id: 'r3',
              description: 'Has align-items',
              points: 30,
            },
          ],
          checks: [
            {
              id: 'hw1',
              type: 'html',
              rule: 'exists:div',
              hint: 'You need a container div',
            },
            {
              id: 'hw2',
              type: 'css',
              rule: 'rule:div display=flex',
              hint: 'Use display: flex',
            },
          ],
        },
        unlockAt: new Date(now.getTime() - 12 * 60 * 60 * 1000),
        order: 13,
      },
    ];

    console.log('📚 Creating comprehensive curriculum...');
    
    // Delete all existing lessons first
    console.log('🗑️  Deleting existing lessons...');
    const deleteResult = await Lesson.deleteMany({});
    console.log(`✅ Deleted ${deleteResult.deletedCount} existing lessons`);
    
    // Create all lessons fresh
    for (const lessonData of lessons) {
      await Lesson.create(lessonData);
      console.log(`✅ Lesson created: ${lessonData.slug}`);
    }

    console.log('\n🎉 Full curriculum seeded successfully!');
    console.log(`📝 Created ${lessons.length} lessons`);
    console.log('\n✅ You can now start learning!');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seed();

