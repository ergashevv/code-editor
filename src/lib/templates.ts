// Code templates and snippets

export interface Template {
  id: string;
  name: string;
  description: string;
  html: string;
  css: string;
  js: string;
}

export const templates: Template[] = [
  {
    id: 'blank',
    name: 'Blank',
    description: 'Empty template',
    html: '',
    css: '',
    js: ''
  },
  {
    id: 'html5',
    name: 'HTML5 Boilerplate',
    description: 'Basic HTML5 structure',
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>
<body>
  <h1>Hello World</h1>
</body>
</html>`,
    css: `body {
  font-family: Arial, sans-serif;
  padding: 20px;
}`,
    js: `// Your JavaScript code here`
  },
  {
    id: 'bootstrap',
    name: 'Bootstrap Starter',
    description: 'Bootstrap template',
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bootstrap Template</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
  <div class="container mt-5">
    <h1 class="display-4">Bootstrap Template</h1>
    <p class="lead">Start building with Bootstrap</p>
    <button class="btn btn-primary">Click Me</button>
  </div>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>`,
    css: `/* Custom CSS here */`,
    js: `// Your JavaScript code here`
  },
  {
    id: 'tailwind',
    name: 'Tailwind CSS',
    description: 'Tailwind CSS template',
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tailwind Template</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100">
  <div class="container mx-auto p-8">
    <h1 class="text-4xl font-bold text-gray-800">Tailwind CSS</h1>
    <p class="text-gray-600 mt-4">Start building with Tailwind</p>
    <button class="bg-blue-500 text-white px-4 py-2 rounded mt-4">Click Me</button>
  </div>
</body>
</html>`,
    css: `/* Custom CSS here */`,
    js: `// Your JavaScript code here`
  },
  {
    id: 'react-like',
    name: 'React-like Component',
    description: 'Simple component structure',
    html: `<div id="app"></div>`,
    css: `.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}`,
    js: `// Simple component-like structure
function App() {
  const container = document.getElementById('app');
  container.innerHTML = \`
    <div class="container">
      <div class="card">
        <h1>Hello from Component</h1>
        <p>This is a simple component structure</p>
      </div>
    </div>
  \`;
}

App();`
  },
  {
    id: 'calculator',
    name: 'Calculator',
    description: 'Simple calculator',
    html: `<div class="calculator">
  <div class="display" id="display">0</div>
  <div class="buttons">
    <button onclick="clearDisplay()">C</button>
    <button onclick="appendToDisplay('/')">/</button>
    <button onclick="appendToDisplay('*')">*</button>
    <button onclick="appendToDisplay('-')">-</button>
    <button onclick="appendToDisplay('7')">7</button>
    <button onclick="appendToDisplay('8')">8</button>
    <button onclick="appendToDisplay('9')">9</button>
    <button onclick="appendToDisplay('+')" class="operator">+</button>
    <button onclick="appendToDisplay('4')">4</button>
    <button onclick="appendToDisplay('5')">5</button>
    <button onclick="appendToDisplay('6')">6</button>
    <button onclick="appendToDisplay('1')">1</button>
    <button onclick="appendToDisplay('2')">2</button>
    <button onclick="appendToDisplay('3')">3</button>
    <button onclick="calculate()" class="equals">=</button>
    <button onclick="appendToDisplay('0')" class="zero">0</button>
    <button onclick="appendToDisplay('.')">.</button>
  </div>
</div>`,
    css: `.calculator {
  max-width: 300px;
  margin: 50px auto;
  background: #f0f0f0;
  padding: 20px;
  border-radius: 10px;
}

.display {
  background: white;
  padding: 20px;
  text-align: right;
  font-size: 24px;
  margin-bottom: 10px;
  border-radius: 5px;
  min-height: 40px;
}

.buttons {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

button {
  padding: 20px;
  font-size: 18px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  background: white;
}

button:hover {
  background: #e0e0e0;
}

.operator {
  background: #ff9500;
  color: white;
}

.operator:hover {
  background: #ff8500;
}

.equals {
  grid-column: 4;
  grid-row: 4 / 6;
  background: #ff9500;
  color: white;
}

.zero {
  grid-column: 1 / 3;
}`,
    js: `let display = document.getElementById('display');
let currentInput = '0';

function appendToDisplay(value) {
  if (currentInput === '0') {
    currentInput = value;
  } else {
    currentInput += value;
  }
  display.textContent = currentInput;
}

function clearDisplay() {
  currentInput = '0';
  display.textContent = currentInput;
}

function calculate() {
  try {
    currentInput = eval(currentInput).toString();
    display.textContent = currentInput;
  } catch (error) {
    display.textContent = 'Error';
    currentInput = '0';
  }
}`
  }
];

export function getTemplate(id: string): Template | undefined {
  return templates.find(t => t.id === id);
}

