# Interactive Games System - Tag va CSS O'qitish

## 🎮 O'yinlar Tizimi

### 1. **HTML TAG O'YINLARI**

#### A. **Tag Matching Game**
**Maqsad**: Tag'larni ularning ma'nosi bilan bog'lash

**O'yin mexanikasi**:
- Ekranda tag'lar va ma'nolar ko'rsatiladi
- Drag & drop bilan tag'larni to'g'ri ma'noga bog'lash
- Time limit: 60 sekund
- Points: +10 to'g'ri, -5 noto'g'ri

**Misol**:
```
Tags:          Meanings:
<h1>           - Heading 1
<p>            - Paragraph
<img>          - Image
<a>            - Link
<div>          - Division container
```

#### B. **Tag Opening/Closing Game**
**Maqsad**: Tag ochilish-yopilish qoidalarini o'rgatish

**O'yin mexanikasi**:
- Kod ko'rsatiladi, tag'larni to'g'ri yopish kerak
- Self-closing tag'larni aniqlash
- Nested tag'lar uchun to'g'ri tartib
- Auto-check: instant feedback

**Misol Challenge**:
```
Given: <div><h1>Hello<p>World
Fix:   <div><h1>Hello</h1><p>World</p></div>
```

#### C. **Tag Usage Game**
**Maqsad**: Har bir tagning to'g'ri ishlatilishini o'rgatish

**O'yin mexanikasi**:
- Scenario beriladi (masalan: "Create a navigation menu")
- To'g'ri tag'larni tanlash kerak
- Multiple choice yoki drag & drop
- Explanation ko'rsatiladi

**Misol Challenge**:
```
Scenario: "Create a list of items"
Options:
- <ul><li>Item</li></ul> ✅
- <div>Item</div> ❌
- <p>Item</p> ❌
```

#### D. **Tag Builder Game**
**Maqsad**: Visual qurilish orqali tag'larni o'rgatish

**O'yin mexanikasi**:
- Visual builder
- Drag elements to build structure
- Auto-generate HTML code
- Real-time preview

**Misol**:
```
1. Drag "Heading" element
2. Drag "Paragraph" element
3. Auto-generates: <h1>Title</h1><p>Text</p>
```

#### E. **Tag Memory Game**
**Maqsad**: Tag'larni yodlash

**O'yin mexanikasi**:
- Memory card game
- Tag nomi va ma'nosi
- Match pairs
- Time-based scoring

**Misol**:
```
Card 1: <h1>        Card 2: Heading 1
Card 3: <img>      Card 4: Image
Match them!
```

#### F. **Tag Puzzle Game**
**Maqsad**: Tag'larni to'g'ri tartibda joylashtirish

**O'yin mexanikasi**:
- Code blocks ko'rsatiladi
- To'g'ri tartibda joylashtirish
- Drag & drop
- Auto-check structure

**Misol**:
```
Puzzle pieces:
</div>  <body>  <html>  </body>  </html>
Correct order: <html><body></body></html>
```

#### G. **Tag Quiz Game**
**Maqsad**: Tag bilimini test qilish

**O'yin mexanikasi**:
- Multiple choice questions
- True/False questions
- Fill in the blank
- Time challenge

**Misol Questions**:
```
1. Which tag is used for heading?
   a) <p>  b) <h1>  c) <div>  d) <span>

2. <img> tag is self-closing: True/False

3. Complete: <a href="___">Link</a>
```

---

### 2. **CSS O'YINLARI**

#### A. **CSS Property Matching**
**Maqsad**: CSS property'larni ularning ta'siri bilan bog'lash

**O'yin mexanikasi**:
- Property'lar va visual effects
- Drag & drop matching
- Preview ko'rsatish

**Misol**:
```
Properties:          Effects:
display: flex        - Horizontal layout
display: block       - Full width
display: inline      - Inline element
position: absolute   - Absolute positioning
```

#### B. **Flexbox Game**
**Maqsad**: Flexbox'ni o'rgatish

**O'yin mexanikasi**:
- Visual flex container
- Drag items to positions
- Adjust justify-content, align-items
- Real-time preview

**Misol Challenge**:
```
Task: "Center items horizontally and vertically"
Properties to set:
- display: flex
- justify-content: center
- align-items: center
```

#### C. **CSS Selector Game**
**Maqsad**: Selector'lar va ularning ishlatilishini o'rgatish

**O'yin mexanikasi**:
- HTML structure ko'rsatiladi
- To'g'ri selector yozish kerak
- Auto-highlight matching elements
- Multiple selector types

**Misol Challenge**:
```
HTML:
<div class="container">
  <p>Text</p>
  <p class="highlight">Highlight</p>
</div>

Task: "Select all paragraphs"
Answer: p { }

Task: "Select highlighted paragraph"
Answer: .highlight { }
```

#### D. **Box Model Game**
**Maqsad**: Box Model (margin, padding, border) ni o'rgatish

**O'yin mexanikasi**:
- Visual box model
- Adjust margin, padding, border
- See real-time changes
- Interactive learning

**Misol Challenge**:
```
Task: "Add 20px padding and 10px margin"
Visual box shows:
- Content
- Padding: 20px
- Border
- Margin: 10px
```

#### E. **CSS Layout Builder**
**Maqsad**: Layout yaratish orqali o'rgatish

**O'yin mexanikasi**:
- Visual layout builder
- Drag elements
- Auto-generate CSS
- Grid va Flexbox

**Misol Challenge**:
```
Task: "Create 3-column layout"
Solution:
.container {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
}
```

#### F. **CSS Animation Game**
**Maqsad**: Animation va transition'ni o'rgatish

**O'yin mexanikasi**:
- Visual animation builder
- Set keyframes
- Adjust timing
- Preview animation

**Misol Challenge**:
```
Task: "Create fade-in animation"
Solution:
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

#### G. **CSS Debugging Game**
**Maqsad**: CSS xatolarini topish va tuzatish

**O'yin mexanikasi**:
- Broken CSS ko'rsatiladi
- Xatolarni topish
- Tuzatish
- Explanation

**Misol Challenge**:
```
Broken CSS:
div {
  color blue;  // Missing colon
  margin: 10px  // Missing semicolon
  display: flexbox;  // Wrong value
}

Fix it!
```

---

### 3. **CATEGORY & LESSON STRUCTURE**

#### **HTML Categories:**

**Category 1: HTML Basics**
- Lesson 1.1: HTML Structure
  - Game: Tag Opening/Closing
  - Game: Tag Matching
  - Quiz: HTML Basics
  
- Lesson 1.2: Headings & Text
  - Game: Tag Usage
  - Game: Tag Builder
  - Challenge: Create heading structure

- Lesson 1.3: Lists
  - Game: Tag Memory
  - Game: Tag Puzzle
  - Challenge: Create ordered/unordered list

- Lesson 1.4: Links & Images
  - Game: Tag Quiz
  - Game: Tag Builder
  - Challenge: Add links and images

**Category 2: HTML Forms**
- Lesson 2.1: Form Basics
- Lesson 2.2: Input Types
- Lesson 2.3: Form Validation

**Category 3: HTML Semantic**
- Lesson 3.1: Semantic Tags
- Lesson 3.2: Layout Structure
- Lesson 3.3: Accessibility

#### **CSS Categories:**

**Category 1: CSS Basics**
- Lesson 1.1: CSS Syntax
  - Game: CSS Property Matching
  - Game: CSS Selector Game
  - Quiz: CSS Basics

- Lesson 1.2: Colors & Backgrounds
  - Game: Color Memory
  - Game: CSS Builder
  - Challenge: Color schemes

- Lesson 1.3: Text Styles
  - Game: CSS Property Matching
  - Challenge: Typography

**Category 2: CSS Layout**
- Lesson 2.1: Display Properties
  - Game: Flexbox Game
  - Game: Display Matching
  - Challenge: Layout creation

- Lesson 2.2: Flexbox
  - Game: Flexbox Game
  - Game: CSS Layout Builder
  - Challenge: Flex layouts

- Lesson 2.3: CSS Grid
  - Game: Grid Builder
  - Challenge: Grid layouts

**Category 3: CSS Advanced**
- Lesson 3.1: Box Model
  - Game: Box Model Game
  - Challenge: Spacing

- Lesson 3.2: Positioning
  - Game: Position Game
  - Challenge: Positioning

- Lesson 3.3: Animations
  - Game: CSS Animation Game
  - Challenge: Create animations

---

### 4. **LESSON FLOW (Tekma-ketlik)**

#### **Example Lesson Flow:**

**Lesson 1.1: HTML Structure**

**Step 1: Introduction (2 min)**
- Video yoki text explanation
- "HTML structure nima?"
- Basic concept

**Step 2: Learn Tags (5 min)**
- Tag Matching Game
- Drag & drop tags
- See explanations

**Step 3: Practice (10 min)**
- Tag Opening/Closing Game
- Fix broken HTML
- Multiple challenges

**Step 4: Quiz (5 min)**
- Tag Quiz Game
- 10 questions
- Instant feedback

**Step 5: Challenge (15 min)**
- Tag Builder Game
- Create complete HTML structure
- Auto-check

**Step 6: Summary (3 min)**
- What you learned
- Key points
- Next lesson preview

**Total Time: ~40 minutes**

---

### 5. **PROGRESSION SYSTEM**

#### **Level Progression:**

**Beginner (Levels 1-5)**
- HTML Structure
- Basic Tags
- CSS Basics
- Simple Styling

**Intermediate (Levels 6-10)**
- Forms & Media
- CSS Layout (Flexbox)
- Responsive Basics
- Advanced Selectors

**Advanced (Levels 11-15)**
- Semantic HTML
- CSS Grid
- Animations
- Advanced Techniques

#### **Unlock System:**
- Complete previous lesson to unlock next
- Earn stars (1-3) based on performance
- Need 2+ stars to unlock next lesson
- Can replay for better score

---

### 6. **GAME VARIATIONS**

#### **For Each Tag/CSS Property:**

**Tag: <h1>**
1. **Matching Game**: Match <h1> with "Heading 1"
2. **Usage Game**: "When to use <h1>?"
3. **Builder Game**: Create heading structure
4. **Quiz Game**: Multiple choice about <h1>
5. **Memory Game**: Remember <h1> properties
6. **Puzzle Game**: Arrange tags with <h1>

**CSS: display: flex**
1. **Matching Game**: Match flex with layout
2. **Visual Game**: See flex in action
3. **Builder Game**: Create flex layout
4. **Challenge Game**: Solve flex problems
5. **Quiz Game**: Flex properties quiz
6. **Debug Game**: Fix flex issues

---

### 7. **INTERACTIVE FEATURES**

#### **Real-time Feedback:**
- ✅ Correct: Green checkmark, sound effect
- ❌ Wrong: Red X, hint shown
- 💡 Hint: Click for help (-5 points)
- 🎯 Perfect: Bonus points

#### **Visual Learning:**
- Code highlighting
- Visual preview
- Step-by-step animations
- Interactive examples

#### **Adaptive Difficulty:**
- Start easy
- Increase difficulty
- Personalize based on performance
- Skip known concepts

---

### 8. **REWARD SYSTEM**

#### **Per Game:**
- Complete game: +10 points
- Perfect score: +20 points
- First try: +5 bonus
- Time bonus: +1 per second

#### **Per Lesson:**
- Complete lesson: +50 points
- All games perfect: +100 bonus
- Achievement unlocked

#### **Per Category:**
- Complete category: +200 points
- Badge unlocked
- New theme unlocked

---

### 9. **IMPLEMENTATION PLAN**

#### **Phase 1: Core Games (Week 1-2)**
1. Tag Matching Game
2. Tag Opening/Closing Game
3. CSS Property Matching
4. Flexbox Game

#### **Phase 2: Advanced Games (Week 3-4)**
1. Tag Builder Game
2. CSS Layout Builder
3. CSS Selector Game
4. Quiz Games

#### **Phase 3: Lesson System (Week 5-6)**
1. Category structure
2. Lesson flow
3. Progress tracking
4. Unlock system

#### **Phase 4: Polish (Week 7-8)**
1. Animations
2. Sound effects
3. Achievements
4. Leaderboard

---

## 🎯 Key Features Summary

1. **7+ Different Game Types** per tag/CSS property
2. **15+ HTML Tags** with games
3. **20+ CSS Properties** with games
4. **3 Categories** (HTML, CSS, Advanced)
5. **30+ Lessons** structured
6. **Progressive Difficulty**
7. **Multiple Game Formats** (drag-drop, quiz, builder, etc.)
8. **Real-time Feedback**
9. **Visual Learning**
10. **Achievement System**

