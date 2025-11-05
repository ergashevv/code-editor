// Standalone seed script - Run with: node scripts/seed.js

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import models
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
}, { _id: false });

const TrainSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  task: { type: String, required: true },
  initialHtml: { type: String, required: true },
  initialCss: { type: String, default: '' },
  checks: { type: [CheckSchema], default: [] },
}, { _id: false });

const RubricItemSchema = new mongoose.Schema({
  id: { type: String, required: true },
  description: { type: String, required: true },
  points: { type: Number, required: true, min: 0 },
}, { _id: false });

const HomeworkSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  brief: { type: String, required: true },
  rubric: { type: [RubricItemSchema], default: [] },
  checks: { type: [CheckSchema], default: [] },
}, { _id: false });

const LessonSchema = new mongoose.Schema({
  slug: { type: String, unique: true, required: true, trim: true },
  title: { type: String, required: true, trim: true },
  summary: { type: String, required: true },
  contentMD: { type: String, required: true },
  examples: { type: [ExampleSchema], default: [] },
  trains: { type: [TrainSchema], default: [] },
  homework: { type: HomeworkSchema },
  unlockAt: { type: Date, required: true },
  order: { type: Number, required: true, default: 0 },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Lesson = mongoose.models.Lesson || mongoose.model('Lesson', LessonSchema);

async function seed() {
  try {
    // Connect to MongoDB
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

    // Create sample lessons
    const now = new Date();
    const sampleLessons = [
      {
        slug: 'html-basics',
        title: 'HTML Basics',
        summary: 'Learn the fundamentals of HTML including tags, attributes, and document structure.',
        contentMD: `# HTML Basics

HTML (HyperText Markup Language) is the foundation of web development. Let's start with the basics.

## What is HTML?

HTML is a markup language used to structure content on the web. It uses tags to define elements.

## Basic Structure

Every HTML document needs a basic structure:

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

## Common Tags

- \`<h1>\` to \`<h6>\` - Headings
- \`<p>\` - Paragraphs
- \`<a>\` - Links
- \`<img>\` - Images
- \`<div>\` - Container

Practice these tags in the exercises below!`,
        examples: [
          {
            id: 'ex1',
            title: 'Simple HTML Page',
            html: '<!DOCTYPE html>\n<html>\n<head>\n    <title>My Page</title>\n</head>\n<body>\n    <h1>Welcome</h1>\n    <p>This is my first HTML page!</p>\n</body>\n</html>',
            css: '',
            js: '',
          },
        ],
        trains: [
          {
            id: 'train1',
            title: 'Create a Heading',
            task: 'Create an HTML page with an <h1> heading that says "Hello World"',
            initialHtml: '<!DOCTYPE html>\n<html>\n<head>\n    <title>Exercise</title>\n</head>\n<body>\n    <!-- Write your code here -->\n</body>\n</html>',
            initialCss: '',
            checks: [
              {
                id: 'check1',
                type: 'html',
                rule: 'exists:h1',
                hint: 'You need to add an <h1> tag',
              },
              {
                id: 'check2',
                type: 'html',
                rule: 'text:h1=Hello World',
                hint: 'The h1 should contain the text "Hello World"',
              },
            ],
          },
        ],
        homework: {
          id: 'hw1',
          title: 'Build a Personal Page',
          brief: 'Create a complete HTML page with:\n- A title in the <head>\n- An <h1> heading with your name\n- A <p> paragraph introducing yourself\n- An <img> tag (you can use a placeholder URL like https://via.placeholder.com/150)',
          rubric: [
            {
              id: 'r1',
              description: 'Has proper HTML structure (DOCTYPE, html, head, body)',
              points: 25,
            },
            {
              id: 'r2',
              description: 'Has an h1 heading with name',
              points: 25,
            },
            {
              id: 'r3',
              description: 'Has a paragraph with introduction',
              points: 25,
            },
            {
              id: 'r4',
              description: 'Has an img tag',
              points: 25,
            },
          ],
          checks: [
            {
              id: 'hw1',
              type: 'html',
              rule: 'exists:html',
              hint: 'HTML structure is required',
            },
            {
              id: 'hw2',
              type: 'html',
              rule: 'exists:h1',
              hint: 'You need an h1 heading',
            },
            {
              id: 'hw3',
              type: 'html',
              rule: 'exists:p',
              hint: 'You need a paragraph',
            },
            {
              id: 'hw4',
              type: 'html',
              rule: 'exists:img',
              hint: 'You need an img tag',
            },
          ],
        },
        unlockAt: new Date(now.getTime() - 24 * 60 * 60 * 1000), // 1 day ago
        order: 1,
      },
      {
        slug: 'css-introduction',
        title: 'CSS Introduction',
        summary: 'Learn how to style your HTML with CSS including colors, fonts, and layout.',
        contentMD: `# CSS Introduction

CSS (Cascading Style Sheets) allows you to style your HTML pages.

## What is CSS?

CSS controls the visual appearance of HTML elements.

## Basic Syntax

\`\`\`css
selector {
    property: value;
}
\`\`\`

## Example

\`\`\`css
h1 {
    color: blue;
    font-size: 24px;
}
\`\`\`

This makes all h1 headings blue and 24px in size.`,
        examples: [
          {
            id: 'ex1',
            title: 'Styled Heading',
            html: '<h1>Hello CSS</h1>',
            css: 'h1 {\n    color: blue;\n    font-size: 32px;\n}',
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
          brief: 'Create a styled HTML page:\n- HTML with h1 and p elements\n- CSS to make h1 blue and p gray',
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
        unlockAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        order: 2,
      },
    ];

    console.log('📚 Creating sample lessons...');
    for (const lessonData of sampleLessons) {
      const existing = await Lesson.findOne({ slug: lessonData.slug });
      if (!existing) {
        await Lesson.create(lessonData);
        console.log(`✅ Lesson created: ${lessonData.slug}`);
      } else {
        console.log(`⏭️  Lesson already exists: ${lessonData.slug}`);
      }
    }

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📝 Admin credentials:');
    console.log(`   Username: ${adminLogin}`);
    console.log(`   Password: ${adminPassword}`);
    console.log('\n✅ You can now login and start using the platform!');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seed();


