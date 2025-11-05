// Seed script for Competitions with example challenges

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const CheckSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: { type: String, enum: ['html', 'css'], required: true },
  rule: { type: String, required: true },
  hint: { type: String, required: true },
  hint_uz: String,
  hint_ru: String,
  hint_en: String,
}, { _id: false });

const ChallengeSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  title_uz: String,
  title_ru: String,
  title_en: String,
  description: { type: String, required: true },
  description_uz: String,
  description_ru: String,
  description_en: String,
  html: { type: String, default: '' },
  css: { type: String, default: '' },
  js: { type: String, default: '' },
  reward: { type: Number, default: 0 },
  checks: { type: [CheckSchema], default: [] },
}, { _id: false });

const CompetitionSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  title_uz: String,
  title_ru: String,
  title_en: String,
  description: { type: String, required: true },
  description_uz: String,
  description_ru: String,
  description_en: String,
  challenges: { type: [ChallengeSchema], default: [] },
  unlockAt: { type: Date, required: true },
  active: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
}, { timestamps: true });

const Competition = mongoose.models.Competition || mongoose.model('Competition', CompetitionSchema);

const exampleCompetitions = [
  {
    title: 'HTML Basics Challenge',
    title_uz: 'HTML Asoslari Challenge',
    title_ru: 'Основы HTML Challenge',
    title_en: 'HTML Basics Challenge',
    description: 'Test your HTML knowledge with basic structure and elements!',
    description_uz: 'HTML bilimingizni asosiy struktura va elementlar bilan sinab ko\'ring!',
    description_ru: 'Проверьте свои знания HTML с помощью базовой структуры и элементов!',
    description_en: 'Test your HTML knowledge with basic structure and elements!',
    challenges: [
      {
        id: 'challenge-1',
        title: 'Create a Simple Page',
        title_uz: 'Oddiy Sahifa Yaratish',
        title_ru: 'Создать Простую Страницу',
        title_en: 'Create a Simple Page',
        description: 'Create a simple HTML page with a heading and a paragraph. Use h1 for the heading and p for the paragraph.',
        description_uz: 'Sarlavha va paragraf bilan oddiy HTML sahifa yarating. Sarlavha uchun h1, paragraf uchun p teglaridan foydalaning.',
        description_ru: 'Создайте простую HTML страницу с заголовком и абзацем. Используйте h1 для заголовка и p для абзаца.',
        description_en: 'Create a simple HTML page with a heading and a paragraph. Use h1 for the heading and p for the paragraph.',
        html: `<!DOCTYPE html>
<html>
<head>
  <title>My Page</title>
</head>
<body>
  <!-- Write your code here -->
</body>
</html>`,
        css: '',
        js: '',
        reward: 50,
        checks: [
          {
            id: 'check-1',
            type: 'html',
            rule: 'exists:!DOCTYPE',
            hint: 'Don\'t forget the DOCTYPE declaration',
            hint_uz: 'DOCTYPE deklaratsiyasini unutmang',
            hint_ru: 'Не забудьте объявление DOCTYPE',
            hint_en: 'Don\'t forget the DOCTYPE declaration',
          },
          {
            id: 'check-2',
            type: 'html',
            rule: 'count:h1>=1',
            hint: 'Add at least one h1 heading',
            hint_uz: 'Kamida bitta h1 sarlavha qo\'shing',
            hint_ru: 'Добавьте хотя бы один заголовок h1',
            hint_en: 'Add at least one h1 heading',
          },
          {
            id: 'check-3',
            type: 'html',
            rule: 'count:p>=1',
            hint: 'Add at least one paragraph',
            hint_uz: 'Kamida bitta paragraf qo\'shing',
            hint_ru: 'Добавьте хотя бы один абзац',
            hint_en: 'Add at least one paragraph',
          },
        ],
      },
      {
        id: 'challenge-2',
        title: 'Add Links and Images',
        title_uz: 'Linklar va Rasmlar Qo\'shish',
        title_ru: 'Добавить Ссылки и Изображения',
        title_en: 'Add Links and Images',
        description: 'Create a page with at least one link (a tag) and one image (img tag).',
        description_uz: 'Kamida bitta link (a tegi) va bitta rasm (img tegi) bilan sahifa yarating.',
        description_ru: 'Создайте страницу хотя бы с одной ссылкой (тег a) и одним изображением (тег img).',
        description_en: 'Create a page with at least one link (a tag) and one image (img tag).',
        html: `<!DOCTYPE html>
<html>
<head>
  <title>Links and Images</title>
</head>
<body>
  <!-- Add a link and an image here -->
</body>
</html>`,
        css: '',
        js: '',
        reward: 75,
        checks: [
          {
            id: 'check-1',
            type: 'html',
            rule: 'exists:!DOCTYPE',
            hint: 'Don\'t forget the DOCTYPE declaration',
            hint_uz: 'DOCTYPE deklaratsiyasini unutmang',
            hint_ru: 'Не забудьте объявление DOCTYPE',
            hint_en: 'Don\'t forget the DOCTYPE declaration',
          },
          {
            id: 'check-2',
            type: 'html',
            rule: 'count:a>=1',
            hint: 'Add at least one link using the a tag',
            hint_uz: 'Kamida bitta a tegidan foydalanib link qo\'shing',
            hint_ru: 'Добавьте хотя бы одну ссылку используя тег a',
            hint_en: 'Add at least one link using the a tag',
          },
          {
            id: 'check-3',
            type: 'html',
            rule: 'count:img>=1',
            hint: 'Add at least one image using the img tag',
            hint_uz: 'Kamida bitta img tegidan foydalanib rasm qo\'shing',
            hint_ru: 'Добавьте хотя бы одно изображение используя тег img',
            hint_en: 'Add at least one image using the img tag',
          },
        ],
      },
    ],
    unlockAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 1 month from now
    active: true,
    order: 1,
  },
  {
    title: 'CSS Styling Challenge',
    title_uz: 'CSS Stil Challenge',
    title_ru: 'CSS Стилизация Challenge',
    title_en: 'CSS Styling Challenge',
    description: 'Show off your CSS skills by styling a beautiful page!',
    description_uz: 'Chiroyli sahifani stil qilish orqali CSS ko\'nikmalaringizni namoyish eting!',
    description_ru: 'Продемонстрируйте свои навыки CSS, стилизуя красивую страницу!',
    description_en: 'Show off your CSS skills by styling a beautiful page!',
    challenges: [
      {
        id: 'challenge-1',
        title: 'Color and Font Styling',
        title_uz: 'Rang va Font Stil',
        title_ru: 'Цвет и Стиль Шрифта',
        title_en: 'Color and Font Styling',
        description: 'Style the body with a background color and set the font family for all paragraphs.',
        description_uz: 'Body\'ni background color bilan stil qiling va barcha paragraflar uchun font family belgilang.',
        description_ru: 'Стилизуйте body с фоновым цветом и установите семейство шрифтов для всех абзацев.',
        description_en: 'Style the body with a background color and set the font family for all paragraphs.',
        html: `<!DOCTYPE html>
<html>
<head>
  <title>Styled Page</title>
</head>
<body>
  <h1>Welcome</h1>
  <p>This is a paragraph.</p>
  <p>Another paragraph here.</p>
</body>
</html>`,
        css: `/* Write your CSS here */`,
        js: '',
        reward: 100,
        checks: [
          {
            id: 'check-1',
            type: 'css',
            rule: 'rule:body background-color=*',
            hint: 'Add a background-color property to the body selector',
            hint_uz: 'Body selector\'ga background-color property qo\'shing',
            hint_ru: 'Добавьте свойство background-color к селектору body',
            hint_en: 'Add a background-color property to the body selector',
          },
          {
            id: 'check-2',
            type: 'css',
            rule: 'rule:p font-family=*',
            hint: 'Add a font-family property to the p selector',
            hint_uz: 'p selector\'ga font-family property qo\'shing',
            hint_ru: 'Добавьте свойство font-family к селектору p',
            hint_en: 'Add a font-family property to the p selector',
          },
        ],
      },
      {
        id: 'challenge-2',
        title: 'Layout with Flexbox',
        title_uz: 'Flexbox bilan Layout',
        title_ru: 'Макет с Flexbox',
        title_en: 'Layout with Flexbox',
        description: 'Create a flexbox layout with a container and items. Use display: flex on a container.',
        description_uz: 'Container va itemlar bilan flexbox layout yarating. Container\'ga display: flex ishlating.',
        description_ru: 'Создайте макет flexbox с контейнером и элементами. Используйте display: flex на контейнере.',
        description_en: 'Create a flexbox layout with a container and items. Use display: flex on a container.',
        html: `<!DOCTYPE html>
<html>
<head>
  <title>Flexbox Layout</title>
</head>
<body>
  <div class="container">
    <div class="item">Item 1</div>
    <div class="item">Item 2</div>
    <div class="item">Item 3</div>
  </div>
</body>
</html>`,
        css: `/* Style the container with flexbox */`,
        js: '',
        reward: 150,
        checks: [
          {
            id: 'check-1',
            type: 'css',
            rule: 'rule:.container display=flex',
            hint: 'Add display: flex to the .container selector',
            hint_uz: '.container selector\'ga display: flex qo\'shing',
            hint_ru: 'Добавьте display: flex к селектору .container',
            hint_en: 'Add display: flex to the .container selector',
          },
        ],
      },
    ],
    unlockAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 1 month from now
    active: true,
    order: 2,
  },
  {
    title: 'Advanced HTML/CSS Challenge',
    title_uz: 'Ilg\'or HTML/CSS Challenge',
    title_ru: 'Продвинутый HTML/CSS Challenge',
    title_en: 'Advanced HTML/CSS Challenge',
    description: 'Combine HTML and CSS to create a beautiful, responsive card component!',
    description_uz: 'Chiroyli, responsive card komponent yaratish uchun HTML va CSS\'ni birlashtiring!',
    description_ru: 'Объедините HTML и CSS для создания красивого, адаптивного компонента карточки!',
    description_en: 'Combine HTML and CSS to create a beautiful, responsive card component!',
    challenges: [
      {
        id: 'challenge-1',
        title: 'Create a Card Component',
        title_uz: 'Card Komponent Yaratish',
        title_ru: 'Создать Компонент Карточки',
        title_en: 'Create a Card Component',
        description: 'Create a card with a title, description, and a button. Style it with CSS to make it look modern.',
        description_uz: 'Sarlavha, tavsif va tugma bilan card yarating. Uni zamonaviy ko\'rinishga ega qilish uchun CSS bilan stil qiling.',
        description_ru: 'Создайте карточку с заголовком, описанием и кнопкой. Стилизуйте её с помощью CSS, чтобы она выглядела современно.',
        description_en: 'Create a card with a title, description, and a button. Style it with CSS to make it look modern.',
        html: `<!DOCTYPE html>
<html>
<head>
  <title>Card Component</title>
</head>
<body>
  <!-- Create your card here -->
</body>
</html>`,
        css: `/* Style your card here */`,
        js: '',
        reward: 200,
        checks: [
          {
            id: 'check-1',
            type: 'html',
            rule: 'exists:!DOCTYPE',
            hint: 'Don\'t forget the DOCTYPE declaration',
            hint_uz: 'DOCTYPE deklaratsiyasini unutmang',
            hint_ru: 'Не забудьте объявление DOCTYPE',
            hint_en: 'Don\'t forget the DOCTYPE declaration',
          },
          {
            id: 'check-2',
            type: 'html',
            rule: 'count:h2>=1',
            hint: 'Add at least one h2 heading for the card title',
            hint_uz: 'Card sarlavhasi uchun kamida bitta h2 qo\'shing',
            hint_ru: 'Добавьте хотя бы один заголовок h2 для названия карточки',
            hint_en: 'Add at least one h2 heading for the card title',
          },
          {
            id: 'check-3',
            type: 'html',
            rule: 'count:button>=1',
            hint: 'Add at least one button element',
            hint_uz: 'Kamida bitta button element qo\'shing',
            hint_ru: 'Добавьте хотя бы один элемент button',
            hint_en: 'Add at least one button element',
          },
          {
            id: 'check-4',
            type: 'css',
            rule: 'rule:* border-radius=*',
            hint: 'Add border-radius to style your card corners',
            hint_uz: 'Card burchaklarini stil qilish uchun border-radius qo\'shing',
            hint_ru: 'Добавьте border-radius для стилизации углов карточки',
            hint_en: 'Add border-radius to style your card corners',
          },
        ],
      },
    ],
    unlockAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 1 month from now
    active: true,
    order: 3,
  },
];

async function seedCompetitions() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('MONGODB_URI is not defined in .env.local');
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Delete existing competitions
    await Competition.deleteMany({});
    console.log('Deleted existing competitions');

    // Insert example competitions
    const inserted = await Competition.insertMany(exampleCompetitions);
    console.log(`Successfully seeded ${inserted.length} competitions`);

    // Log competition details
    inserted.forEach((comp, idx) => {
      console.log(`\n${idx + 1}. ${comp.title}`);
      console.log(`   Challenges: ${comp.challenges.length}`);
      comp.challenges.forEach((challenge, chIdx) => {
        console.log(`   - Challenge ${chIdx + 1}: ${challenge.title} (${challenge.reward} XP, ${challenge.checks.length} checks)`);
      });
    });

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding competitions:', error);
    process.exit(1);
  }
}

seedCompetitions();

