import type { Tutorial } from '../../types';
import { q } from '../helpers';

export const JAVASCRIPT: Record<string, Tutorial> = {
  basics: {
    goal: 'Write small JavaScript programs with variables, types, conditionals and loops, and avoid the classic beginner traps.',
    steps: [
      {
        title: 'Where to run JavaScript',
        body: `Open DevTools (F12) → Console: it is a JavaScript playground in every browser. For files, create \`index.html\` with \`<script src="main.js" defer></script>\`, or run \`node main.js\` in a terminal.`,
        code: {
          lang: 'js',
          src: `console.log('Hello, adventurer!');`,
        },
      },
      {
        title: 'Variables and types',
        body: `Use \`const\` by default and \`let\` when the value must change. Avoid \`var\`: it is function-scoped and causes surprises.

The primitive types are \`string\`, \`number\`, \`boolean\`, \`null\`, \`undefined\`, \`bigint\` and \`symbol\`. Everything else (arrays, functions, objects) is an object.`,
        code: {
          lang: 'js',
          src: `const name = 'Ada';        // string
let level = 1;             // number
const isHero = true;       // boolean
let weapon = null;         // intentionally empty
let shield;                // undefined (not assigned yet)

level = level + 1;         // ok: let can change
// name = 'Bob';           // TypeError: assignment to constant

console.log(\`\${name} is level \${level}\`); // template literal`,
        },
      },
      {
        title: 'Comparisons and truthiness',
        body: `Always compare with \`===\` and \`!==\`. The loose \`==\` converts types first, which leads to bugs.

In conditions, these values count as false ("falsy"): \`false\`, \`0\`, \`""\`, \`null\`, \`undefined\`, \`NaN\`. Everything else is truthy, including \`"0"\` and \`[]\`.`,
        code: {
          lang: 'js',
          src: `0 == '0';    // true  (type coercion!)
0 === '0';   // false (different types)

const hp = 0;
if (hp) {
  console.log('still alive');
} else {
  console.log('game over');   // runs: 0 is falsy
}`,
        },
      },
      {
        title: 'Loops and conditionals',
        body: `\`for…of\` loops over arrays. \`if/else\` and \`switch\` branch.`,
        code: {
          lang: 'js',
          caption: 'FizzBuzz: the classic warm-up',
          src: `for (let i = 1; i <= 15; i++) {
  if (i % 15 === 0) console.log('FizzBuzz');
  else if (i % 3 === 0) console.log('Fizz');
  else if (i % 5 === 0) console.log('Buzz');
  else console.log(i);
}

const party = ['knight', 'mage', 'archer'];
for (const member of party) console.log(member);`,
        },
        tryIt: 'Write a loop that prints the levels 1 to 10 and the EXP needed for each, where EXP = level × level × 50.',
      },
    ],
    mistakes: [
      'Using `==` instead of `===`.',
      'Declaring everything with `let` (or `var`) when it never changes: prefer `const`.',
      'Forgetting that `"5" + 1` is `"51"` (string concatenation), but `"5" - 1` is `4`.',
    ],
    recap: [
      '`const` by default, `let` when reassigning, never `var`.',
      'Strict equality `===`; know the falsy values.',
      '`for…of` for arrays, `if/else` for decisions.',
    ],
    quiz: [
      q('What does `typeof null` return?', ['"null"', '"object"', '"undefined"', '"number"'], 1, 'A long-standing quirk of JavaScript.'),
      q('What is the result of `0 === "0"`?', ['true', 'false', 'TypeError', 'undefined'], 1),
      q('Which declaration cannot be reassigned?', ['var', 'let', 'const', 'function'], 2),
      q('Which value is truthy?', ['0', '""', '"false"', 'null'], 2, 'Any non-empty string is truthy, even "false".'),
      q('What does `"5" + 1` evaluate to?', ['6', '"51"', 'NaN', 'TypeError'], 1),
    ],
  },

  functions: {
    goal: 'Write and combine functions, use arrow functions and array methods, and understand closures.',
    steps: [
      {
        title: 'Declaring functions',
        body: `Functions package reusable logic. Use a declaration for named helpers, and arrow functions for short callbacks.`,
        code: {
          lang: 'js',
          src: `function expForLevel(level) {
  return level * level * 50;
}

const double = (n) => n * 2;          // implicit return
const greet = (name = 'traveller') => {
  return \`Welcome, \${name}!\`;        // default parameter
};

console.log(expForLevel(3)); // 450
console.log(greet());        // "Welcome, traveller!"`,
        },
      },
      {
        title: 'Functions are values',
        body: `You can pass functions to other functions. Array methods use this everywhere: \`map\` transforms, \`filter\` keeps matches, \`reduce\` combines into one value.`,
        code: {
          lang: 'js',
          src: `const quests = [
  { title: 'HTTP', exp: 50, done: true },
  { title: 'DNS', exp: 50, done: false },
  { title: 'Boss', exp: 300, done: true },
];

const titles = quests.map((q) => q.title);           // ['HTTP', 'DNS', 'Boss']
const finished = quests.filter((q) => q.done);       // 2 quests
const totalExp = finished.reduce((sum, q) => sum + q.exp, 0); // 350`,
        },
        tryIt: 'Using the same array, find the titles of unfinished quests in one chain: `quests.filter(…).map(…)`.',
      },
      {
        title: 'Scope',
        body: `Variables declared with \`let\`/\`const\` live inside the nearest \`{ }\` block. Inner functions can read variables from outer scopes, but not the other way round.`,
      },
      {
        title: 'Closures',
        body: `A closure is a function that remembers the variables from where it was created, even after the outer function has returned. This is how you make private state.`,
        code: {
          lang: 'js',
          src: `function makeCounter() {
  let count = 0;               // private: nobody else can touch it
  return () => {
    count += 1;
    return count;
  };
}

const nextId = makeCounter();
nextId(); // 1
nextId(); // 2`,
        },
        tryIt: 'Write `makeWallet(start)` that returns `{ spend(n), balance() }` and refuses to go below zero.',
      },
    ],
    mistakes: [
      'Forgetting `return` in a function with a `{}` body: it returns `undefined`.',
      'Mutating arrays inside `map`: `map` should return new values, not change the original.',
    ],
    recap: [
      'Functions are values: pass them, return them, store them.',
      '`map`, `filter`, `reduce` replace most manual loops.',
      'Closures keep private state alive.',
    ],
    quiz: [
      q('What is a closure?', ['A function that closes the browser', 'A function bundled with references to its surrounding scope', 'A syntax error', 'A class method'], 1),
      q('Arrow functions differ from regular functions because they…', ['Cannot take parameters', 'Do not have their own `this`', 'Are always async', 'Cannot return values'], 1),
      q('What does `[1, 2, 3].map(x => x * 2)` return?', ['[1,2,3]', '[2,4,6]', '6', 'undefined'], 1),
      q('Which method keeps only the elements that pass a test?', ['map', 'filter', 'reduce', 'forEach'], 1),
      q('What does this return? `const f = (a) => { a * 2 }; f(3)`', ['6', 'undefined', '3', 'NaN'], 1, 'A block body needs an explicit return.'),
    ],
  },

  dom: {
    goal: 'Select elements, change the page and react to user events: build a working to-do list in plain JavaScript.',
    steps: [
      {
        title: 'Selecting elements',
        body: `\`document.querySelector\` returns the first element matching a CSS selector; \`querySelectorAll\` returns all matches.`,
        code: {
          lang: 'html',
          src: `<form id="quest-form">
  <label for="quest">New quest</label>
  <input id="quest" required>
  <button>Add</button>
</form>
<ul id="quest-list"></ul>
<script src="main.js" defer></script>`,
        },
      },
      {
        title: 'Creating and updating elements',
        body: `Create elements with \`document.createElement\`, set text with \`textContent\` and add them with \`append\`. Use \`textContent\`, not \`innerHTML\`, for user input: \`innerHTML\` parses HTML and opens the door to XSS attacks.`,
        code: {
          lang: 'js',
          src: `const list = document.querySelector('#quest-list');

function addQuest(title) {
  const li = document.createElement('li');
  li.textContent = title;          // safe
  list.append(li);
}`,
        },
      },
      {
        title: 'Handling events',
        body: `\`addEventListener\` runs a function when something happens. Forms submit and reload the page by default, so call \`event.preventDefault()\`.`,
        code: {
          lang: 'js',
          src: `const form = document.querySelector('#quest-form');
const input = document.querySelector('#quest');

form.addEventListener('submit', (event) => {
  event.preventDefault();
  addQuest(input.value.trim());
  input.value = '';
  input.focus();
});`,
        },
      },
      {
        title: 'Event delegation',
        body: `Instead of one listener per item, put a single listener on the parent. Events bubble up, so the parent hears clicks on any child, including ones added later.`,
        code: {
          lang: 'js',
          src: `list.addEventListener('click', (event) => {
  const item = event.target.closest('li');
  if (item) item.classList.toggle('done');
});`,
        },
        tryIt: 'Combine all the snippets into a working to-do list. Add a `.done` CSS class with `text-decoration: line-through`.',
      },
    ],
    mistakes: [
      'Running a script before the elements exist: add `defer` to the script tag.',
      'Inserting user text with `innerHTML`.',
      'Forgetting `preventDefault()` so the form reloads the page.',
    ],
    recap: [
      '`querySelector` to find, `createElement` + `append` to add.',
      '`textContent` for safe text; `classList` to toggle styles.',
      'One delegated listener on a parent handles many children.',
    ],
    quiz: [
      q('Which method returns the first element matching a CSS selector?', ['getElementsByClassName', 'querySelector', 'findElement', 'select'], 1),
      q('Why prefer textContent over innerHTML for user input?', ['It is faster to type', 'It does not parse HTML, preventing XSS', 'It supports images', 'It is required by CSS'], 1),
      q('What is event delegation?', ['Removing all events', 'Handling child events with a single listener on an ancestor', 'Running events on a server', 'Delaying events with setTimeout'], 1),
      q('Which method stops the browser default action (e.g. form submit)?', ['event.stop()', 'event.preventDefault()', 'event.cancel()', 'return true'], 1),
      q('Your script says `querySelector(...)` is null on load. Likely fix?', ['Use var', 'Add defer to the script tag so it runs after parsing', 'Use innerHTML', 'Reload twice'], 1),
    ],
  },

  async: {
    goal: 'Fetch real data from an API with async/await, show loading and error states, and understand the event loop.',
    steps: [
      {
        title: 'Why async exists',
        body: `JavaScript runs on one thread. Waiting synchronously for a network response would freeze the page, so slow operations return a Promise: a placeholder for a value that will arrive later (fulfilled) or fail (rejected).`,
      },
      {
        title: 'async and await',
        body: `Inside an \`async\` function, \`await\` pauses that function until the promise settles, without blocking the page. Wrap awaits in \`try/catch\` to handle failures.`,
        code: {
          lang: 'js',
          src: `async function getPokemon(name) {
  const res = await fetch(\`https://pokeapi.co/api/v2/pokemon/\${name}\`);
  if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
  return res.json();
}

try {
  const data = await getPokemon('pikachu');
  console.log(data.name, data.height);
} catch (err) {
  console.error('Could not load:', err.message);
}`,
        },
      },
      {
        title: 'fetch only rejects on network errors',
        body: `A \`404\` or \`500\` still resolves successfully! Always check \`res.ok\` (true for 200–299) before reading the body, as the example above does.`,
      },
      {
        title: 'Loading, success and error states',
        body: `Good UIs show what is happening at every moment.`,
        code: {
          lang: 'js',
          src: `const status = document.querySelector('#status');

async function show(name) {
  status.textContent = 'Loading…';
  try {
    const p = await getPokemon(name);
    status.textContent = \`\${p.name}: \${p.types.map((t) => t.type.name).join(', ')}\`;
  } catch {
    status.textContent = 'Not found. Check the spelling and try again.';
  }
}`,
        },
        tryIt: 'Add a search box that calls `show(input.value)` on submit. Try a real name, then a nonsense one.',
      },
      {
        title: 'The event loop in one example',
        body: `Synchronous code runs first. Then promise callbacks (microtasks) run, then timers (macrotasks).`,
        code: {
          lang: 'js',
          src: `console.log('1');
setTimeout(() => console.log('4'), 0);
Promise.resolve().then(() => console.log('3'));
console.log('2');
// prints 1, 2, 3, 4`,
        },
      },
    ],
    mistakes: [
      'Forgetting `await`, then logging a pending `Promise` instead of the data.',
      'Assuming fetch throws on 404: check `res.ok`.',
      'No error state: users see a spinner forever.',
    ],
    recap: [
      'Promises represent future values; async/await makes them read like normal code.',
      'Check `res.ok`, then `await res.json()`.',
      'Always show loading and error states.',
    ],
    quiz: [
      q('What does an async function always return?', ['A value', 'A Promise', 'A callback', 'undefined'], 1),
      q('fetch() rejects its promise when…', ['The server returns 404', 'There is a network failure', 'The JSON is large', 'Always'], 1, 'HTTP errors like 404 still resolve; check response.ok.'),
      q('What order does this print? log(1); setTimeout(log 4); Promise.then(log 3); log(2)', ['1 2 3 4', '1 4 3 2', '1 3 2 4', '4 3 2 1'], 0),
      q('How do you handle errors with await?', ['.then only', 'try { await x } catch (e) { … }', 'if (await x == error)', 'You cannot'], 1),
      q('`res.ok` is true when the status is…', ['Any status', 'Between 200 and 299', 'Exactly 200', 'Below 500'], 1),
    ],
  },

  boss: {
    goal: 'Build a vanilla-JS app that talks to a real API: search, loading and error states, favourites saved in localStorage, and clean ES modules.',
    steps: [
      {
        title: 'Pick an API and scaffold',
        body: `Choose a free API that needs no key, such as PokeAPI, Open-Meteo (weather), REST Countries or the Open Library. Create the repo and this structure:`,
        code: {
          lang: 'text',
          src: `api-explorer/
├─ index.html
├─ css/style.css
└─ js/
   ├─ main.js      # wires everything together
   ├─ api.js       # fetch helpers
   ├─ ui.js        # rendering functions
   └─ storage.js   # localStorage favourites`,
        },
      },
      {
        title: 'API module',
        body: `Keep all network code in one module so the rest of the app never touches \`fetch\` directly.`,
        code: {
          lang: 'js',
          caption: 'js/api.js',
          src: `const BASE = 'https://restcountries.com/v3.1';

export async function searchCountries(query) {
  const res = await fetch(\`\${BASE}/name/\${encodeURIComponent(query)}\`);
  if (res.status === 404) return [];
  if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
  return res.json();
}`,
        },
      },
      {
        title: 'Favourites with localStorage',
        body: `localStorage only stores strings, so serialise with JSON.`,
        code: {
          lang: 'js',
          caption: 'js/storage.js',
          src: `const KEY = 'favourites';

export function getFavourites() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) ?? [];
  } catch {
    return [];
  }
}

export function toggleFavourite(id) {
  const favs = new Set(getFavourites());
  favs.has(id) ? favs.delete(id) : favs.add(id);
  localStorage.setItem(KEY, JSON.stringify([...favs]));
}`,
        },
      },
      {
        title: 'Render, search and delegate events',
        body: `In \`main.js\`, import from the other modules (\`<script type="module" src="js/main.js">\`). On search submit: show "Loading…", await the API, render cards with \`textContent\`, or show an error message. Use one delegated click listener on the results list for the ★ favourite buttons.`,
        tryIt: 'Add a "Show favourites" filter and a debounced live search (wait 300 ms after the last keystroke before fetching).',
      },
      {
        title: 'Polish, deploy, document',
        body: `Make it responsive and keyboard-friendly, deploy on GitHub Pages or Netlify, add the live URL to the repo About panel, and write a README with a screenshot or GIF. Commit in small steps; the review needs at least 12 commits.`,
      },
    ],
    mistakes: [
      'Calling the API on every keystroke without debouncing.',
      'Rendering API data with `innerHTML` instead of `textContent`.',
      'Forgetting `type="module"`, so `import` statements fail.',
    ],
    recap: [
      'Separated modules for API, UI and storage.',
      'async/await with loading and error states.',
      'Favourites persisted in localStorage, deployed live.',
    ],
  },
};
