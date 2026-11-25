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
      q('What does `typeof null` return?', ['"null"', '"undefined"', '"object"', '"number"'], 2, 'A long-standing quirk of JavaScript: `typeof null` is `"object"`, so check for null explicitly with `=== null`.', 'This is a famous historical bug that was never fixed.'),
      q('What is the result of `0 === "0"`?', ['true', 'false', 'TypeError', 'undefined'], 1, 'Strict equality compares type as well as value, and a number is never strictly equal to a string.', 'Strict equality does no type conversion.'),
      q('Which declaration cannot be reassigned?', ['var', 'let', 'function', 'const'], 3, '`const` creates a binding that cannot be reassigned, though an object it holds can still be mutated.', 'The name suggests the value stays constant.'),
      q('Which value is truthy?', ['0', '""', '"false"', 'undefined'], 2, 'Any non-empty string is truthy, even the text "false".', 'Only the empty string is falsy among the strings.'),
      q('What does `"5" + 1` evaluate to?', ['"51"', '6', 'NaN', 'TypeError'], 0, 'With a string operand, `+` concatenates, so the number is converted to text.', 'One operand is text, so `+` does something other than addition.'),
      q('What does `"5" - 1` evaluate to?', ['NaN', '"51"', '"4"', '4'], 3, 'The `-` operator only works on numbers, so the string is coerced to 5 and the result is the number 4.', 'Unlike `+`, subtraction has no string meaning.'),
      q('Which value is falsy?', ['"0"', 'NaN', '[]', '"false"'], 1, 'The falsy values are false, 0, -0, 0n, "", null, undefined and NaN. Non-empty strings and empty arrays are truthy.', 'Look for the numeric oddity.'),
      q('What does `null === undefined` evaluate to?', ['true', 'false', 'null', 'TypeError'], 1, 'They are different types, so strict equality is false. Loose `==` treats them as equal.', 'Compare the types, not the meaning.'),
      q('What does `let x; console.log(x);` print?', ['null', '0', 'ReferenceError', 'undefined'], 3, 'A declared variable with no value holds `undefined`.', 'Nothing has been assigned yet.'),
      q('What does `0.1 + 0.2 === 0.3` evaluate to?', ['false', 'true', 'NaN', 'It throws'], 0, 'Floating-point numbers cannot represent 0.1 and 0.2 exactly, so the sum is 0.30000000000000004.', 'Think about how computers store decimal fractions.'),
      q('Which loop always runs its body at least once?', ['for', 'while', 'do…while', 'for…await'], 2, '`do { … } while (cond)` checks the condition after the body runs.', 'The check happens at the other end of the loop.'),
      q('What does `for (const i in ["a", "b"])` loop over?', ['The values "a" and "b" themselves', 'Nothing, it throws', 'Only the array length', 'The keys as strings: "0" and "1"'], 3, '`for…in` iterates property keys (as strings). Use `for…of` to iterate the values.', 'The `in` keyword is about keys.'),
      q('What does `0 ?? 5` evaluate to?', ['5', '0', 'null', 'undefined'], 1, 'The nullish coalescing operator only falls back when the left side is `null` or `undefined`, and 0 is neither.', 'It is stricter than `||` about what counts as missing.'),
      q('What does `"" || "guest"` evaluate to?', ['""', 'true', '"guest"', 'undefined'], 2, '`||` returns the first truthy operand, and an empty string is falsy.', 'Which operand is truthy here?'),
      q('What does `user?.name` return when `user` is `undefined`?', ['undefined', 'null', 'It throws a TypeError', '""'], 0, 'Optional chaining short-circuits to `undefined` instead of throwing.', 'The `?.` stops evaluation safely.'),
      q('Which kind of string literal supports `${expression}` interpolation and multi-line text?', ['Template literals (backticks)', 'Double-quoted strings only', 'Single-quoted strings', 'Regex literals'], 0, 'Template literals use backticks and can embed expressions and span lines.', 'It uses a different delimiter character.'),
      q('What is the reliable way to check whether a value is an array?', ['typeof x === "array"', 'x instanceof Object', 'Array.isArray(x)', 'x.length > 0'], 2, '`typeof []` is `"object"`, so use `Array.isArray`, which is built for the job.', 'There is a static method on Array for this.'),
      q('What does `parseInt("42px")` return?', ['NaN', '42', '"42"', '0'], 1, '`parseInt` reads digits until it hits a non-digit and stops, returning 42.', 'It parses as far as it can.'),
      q('Which check correctly detects `NaN`?', ['x === NaN', 'typeof x === "nan"', 'x == null', 'Number.isNaN(x)'], 3, '`NaN` is not equal to anything, including itself, so use `Number.isNaN`.', 'NaN has an unusual relationship with equality.'),
      q('What happens with `const arr = []; arr.push(1);`?', ['SyntaxError', 'TypeError: const makes the array immutable and blocks push', 'It works: const prevents reassignment, not mutation', 'The array becomes frozen'], 2, 'The binding `arr` stays fixed, but the array object it points to can still change.', 'const protects the variable, not what it points to.'),
      q('What does `typeof someUndeclaredName` return when that name was never declared?', ['"undefined"', 'It throws a ReferenceError', '"null"', '"object"'], 0, 'typeof is the one operator that does not throw for an undeclared identifier.', 'This operator is forgiving in a way others are not.'),
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
      q('What is a closure?', ['A function that closes the browser window when it returns a value', 'A class method', 'A syntax error', 'A function bundled with references to its surrounding scope'], 3, 'A closure keeps access to variables from the scope where it was created even after that scope has finished.', 'It remembers where it came from.'),
      q('Arrow functions differ from regular functions because they…', ['Cannot take any parameters or arguments', 'Do not have their own `this`', 'Are always async', 'Cannot return values'], 1, 'Arrow functions take `this` from the surrounding scope, which makes them handy for callbacks.', 'Think about what they borrow from outside.'),
      q('What does `[1, 2, 3].map(x => x * 2)` return?', ['[1,2,3]', '[2,4,6]', '6', 'undefined'], 1, '`map` returns a new array with each element transformed.', 'The result has the same length as the input.'),
      q('Which method keeps only the elements that pass a test?', ['map', 'forEach', 'reduce', 'filter'], 3, '`filter` returns a new array containing only the elements for which the callback returns a truthy value.', 'The name is what a coffee machine does.'),
      q('What does this return? `const f = (a) => { a * 2 }; f(3)`', ['undefined', '6', '3', 'TypeError'], 0, 'A block body needs an explicit `return`; without it the function returns `undefined`.', 'Look carefully at the curly braces.'),
      q('Variables declared with `let` are scoped to…', ['The function', 'The window', 'The nearest block', 'Only the current file'], 2, '`let` and `const` are block scoped, unlike `var`, which is function scoped.', 'Curly braces matter.'),
      q('What does `[1, 2, 3].reduce((sum, n) => sum + n, 0)` return?', ['[1,2,3]', '0', '"123"', '6'], 3, '`reduce` folds the array into one value, starting from 0: 0+1+2+3 = 6.', 'The second argument is the starting value.'),
      q('`makeCounter()` declares `let n = 0` and returns `() => ++n`. What do three calls to the returned function give?', ['1, 1, 1', '1, 2, 3', '0, 1, 2', 'undefined, undefined, undefined'], 1, 'The inner function closes over the same `n` and pre-increments it on every call.', 'The variable lives on between calls.'),
      q('What does `console.log(x); var x = 5;` print?', ['5', 'ReferenceError', 'undefined', 'null'], 2, '`var` declarations are hoisted and initialised to `undefined`, but the assignment stays where it is.', 'The declaration moves up; the value does not.'),
      q('What happens with `console.log(y); let y = 5;`?', ['ReferenceError', 'It prints 5', 'It prints undefined', 'It prints null'], 0, '`let` variables are hoisted but not initialised, so accessing them before the declaration throws (the temporal dead zone).', 'let and var behave differently before the declaration line.'),
      q('With `function greet(name = "friend") { return "Hi " + name; }`, what does `greet()` return?', ['"Hi friend"', '"Hi undefined"', '"Hi "', 'It throws'], 0, 'A default parameter is used when the argument is `undefined`.', 'What value does a missing argument have?'),
      q('If `a = [1, 2, 3]`, what is `[...a, 4]`?', ['[[1,2,3],4]', '[4]', '[1,2,3,4] as a new array', 'It modifies `a` and returns 4'], 2, 'Spread copies the elements into a new array, leaving `a` untouched.', 'The three dots unpack the array.'),
      q('In `function sum(...nums)`, what is `nums`?', ['The first argument and nothing else', 'An array of all the arguments', 'An object', 'A string'], 1, 'The rest parameter collects the remaining arguments into a real array.', 'It gathers rather than spreads.'),
      q('After `const [first, second] = [10, 20, 30]`, what is `second`?', ['10', 'undefined', '30', '20'], 3, 'Array destructuring assigns by position.', 'Positions start at zero.'),
      q('What is a callback?', ['A syntax error that is raised when a function is missing', 'A function that returns itself when called', 'A function passed to another function to be called later', 'A browser event fired after a click'], 2, 'Callbacks let the receiver decide when to run your code, as in `setTimeout` or `array.map`.', 'It is something you hand over to be called back.'),
      q('What does `[1, 2, 3].forEach(x => x * 2)` return?', ['undefined', '6', '[2, 4, 6]', 'The original array'], 0, '`forEach` always returns `undefined`. Use `map` when you need the transformed values.', 'Compare with `map`, which this method resembles.'),
      q('Which array method returns the first element that passes a test?', ['filter', 'indexOf', 'some', 'find'], 3, '`find` returns the matching element (or `undefined`); `filter` returns an array of all matches.', 'Its name is a verb for locating.'),
      q('Which method returns a sorted copy without changing the original array (ES2023)?', ['sort()', 'toSorted()', 'sorted()', 'order()'], 1, '`sort` mutates in place, while `toSorted` returns a new array and is available in current browsers and Node.', 'The newer method begins with “to”.'),
      q('What defines a pure function?', ['It is defined with the `const` keyword', 'The same inputs always give the same output and it causes no side effects', 'It never uses any arguments at all', 'It is always declared with the async keyword and never returns a plain value'], 1, 'Pure functions are predictable and easy to test because they depend only on their inputs.', 'Think of a function that never touches anything outside itself.'),
      q('What does `[10, 1, 5].sort()` return?', ['[1, 5, 10]', '[5, 10, 1]', '[10, 5, 1]', '[1, 10, 5]'], 3, 'The default sort converts items to strings and compares them, so "10" comes before "5". Pass `(a, b) => a - b` to sort numbers.', 'The default comparison is not numeric.'),
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
      q('Which method returns the first element matching a CSS selector?', ['querySelector', 'getElementsByClassName', 'findElement', 'select'], 0, '`document.querySelector(selector)` returns the first match or `null`.', 'The method name contains the word for asking a question.'),
      q('Why prefer textContent over innerHTML for user input?', ['It is faster to type', 'It supports images', 'It does not parse HTML, preventing XSS', 'It is required by all CSS stylesheets to work'], 2, '`textContent` inserts plain text, so injected `<script>` or event-handler markup is never interpreted.', 'Think about what could be hidden in the input.'),
      q('What is event delegation?', ['Removing every single event listener that exists on the page', 'Delaying events with a setTimeout call', 'Running event handlers on a server', 'Handling child events with a single listener on an ancestor'], 3, 'Because events bubble, one listener on a parent can handle clicks from many children, including ones added later.', 'It relies on events travelling up the tree.'),
      q('Which method stops the browser default action (e.g. form submit)?', ['event.stop()', 'event.preventDefault()', 'event.cancel() on the event', 'return true'], 1, '`preventDefault()` cancels the default behaviour while the event still propagates.', 'It prevents something the browser would otherwise do.'),
      q('Your script says `querySelector(...)` is null on load. Likely fix?', ['Declare the variable with var instead of let at the top', 'Assign the markup using innerHTML', 'Add defer to the script tag so it runs after parsing', 'Reload the page twice in a row'], 2, 'The script ran before the elements existed. `defer` (or placing the script at the end of body) fixes the timing.', 'The elements were not in the DOM yet.'),
      q('Which method attaches a click handler to an element?', ['el.addEventListener("click", fn)', 'el.onEvent("click", fn) on the element', 'el.listen("click", fn)', 'el.attach(fn)'], 0, '`addEventListener` is the standard way and allows multiple listeners per event.', 'The name says exactly what it does.'),
      q('What does “event bubbling” mean?', ['The event travels from the target up through its ancestors', 'The event is cancelled before it ever reaches the target element', 'The event runs twice on every element', 'The event is sent to the server first'], 0, 'After firing on the target, most events propagate up to parent elements, which makes delegation possible.', 'Imagine a bubble rising upward.'),
      q('In a delegated click handler on a list, which property is the element that was actually clicked?', ['event.source', 'event.currentTarget', 'event.target', 'event.owner'], 2, '`target` is the originating element; `currentTarget` is the element the listener is attached to.', 'The other candidate is where the listener lives.'),
      q('Which method finds the nearest ancestor (or the element itself) matching a selector?', ['parentOf()', 'closest()', 'findUp()', 'ancestor()'], 1, '`event.target.closest("li")` is the standard helper inside delegated handlers.', 'It looks for the closest match going upward.'),
      q('How do you create a new `<li>` element in JavaScript?', ['document.add("li")', 'new Element("li")', 'document.make("li") for the list', 'document.createElement("li")'], 3, '`createElement` makes a detached element; you then insert it with `append` or similar.', 'The method begins with “create”.'),
      q('Which method adds an element as the last child of a parent?', ['parent.insert(el)', 'parent.push(el)', 'parent.append(el)', 'parent.add(el)'], 2, '`append` (or `appendChild`) adds a node at the end of the child list.', 'Arrays have a similar-sounding method but the DOM uses a different word.'),
      q('What does `el.classList.toggle("done")` do?', ['Adds the class if missing and removes it if present', 'Always adds the class', 'Always removes the class', 'Replaces every existing class on the element with "done"'], 0, 'Toggling flips the class on and off, ideal for done/open states.', 'It switches between two states.'),
      q('What does `querySelectorAll` return?', ['The first match', 'A live-updating HTMLCollection of nodes', 'A single string', 'A static NodeList of all matches'], 3, 'It returns a NodeList snapshot (supporting `forEach`); convert with `Array.from` to use `map`.', 'It returns all matches, as a list-like object.'),
      q('How do you read the value of `data-id="5"` on an element `el`?', ['el.data.id', 'el.dataset.id', 'el.getData("id")', 'el.props.id'], 1, 'Custom `data-*` attributes are exposed on `el.dataset` with camelCased names.', 'The attributes share the prefix with a collection property.'),
      q('Which event fires when the HTML is parsed, without waiting for images and stylesheets?', ['load', 'DOMContentLoaded', 'ready', 'DOM parsed OK now'], 1, '`DOMContentLoaded` fires after the DOM is built; `load` waits for all resources.', 'The name mentions the DOM and its content.'),
      q('Which event fires on every keystroke in a text field?', ['change', 'submit', 'blur', 'input'], 3, '`input` fires immediately on each edit. `change` fires when the field loses focus after being modified.', 'Think about which one is “live”.'),
      q('What does `element.remove()` do?', ['Removes the element from the DOM', 'Hides it with CSS', 'Clears its text', 'Removes only its event listeners'], 0, 'The element is detached from the document tree.', 'It is the opposite of appending.'),
      q('What does the option `{ once: true }` do in `addEventListener`?', ['Fires the handler only on the first click anywhere', 'Delays the handler by one tick', 'Removes the listener automatically after it runs once', 'Runs the handler in the capture phase'], 2, 'The listener is removed after its first invocation, which is handy for one-off setup.', 'The option name tells you how many times it runs.'),
      q('Which method stops an event from bubbling up to ancestors?', ['stopDefault()', 'preventDefault() on the form', 'cancelBubble()', 'stopPropagation()'], 3, '`stopPropagation()` halts propagation; `preventDefault()` only stops the browser’s default action.', 'It stops the event’s journey up the tree.'),
      q('Why listen for `submit` on the form rather than `click` on its button?', ['Click events never fire on buttons at all, in any browser', 'Submit also catches submission by pressing Enter', 'Submit runs faster', 'Click handlers cannot read inputs'], 1, 'Forms can be submitted from the keyboard, which a button-click handler would miss.', 'Think of other ways to send a form besides clicking.'),
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
      q('What does an async function always return?', ['A value', 'A callback', 'A Promise', 'undefined'], 2, 'Whatever you return is wrapped in a Promise, and thrown errors become rejections.', 'It never hands back the raw value.'),
      q('fetch() rejects its promise when…', ['There is a network failure', 'The server returns a 404 status', 'The JSON is large', 'Always'], 0, 'HTTP errors like 404 still resolve; check `response.ok`. Only network-level failures reject.', 'Does a server error count as “no response”?'),
      q('What order does this print? `console.log("A"); setTimeout(() => console.log("B"), 0); Promise.resolve().then(() => console.log("C")); console.log("D");`', ['A D C B', 'A D B C', 'A B C D', 'D C B A'], 0, 'Synchronous code runs first (A, D), then the microtask queue (promise callback C), then the timer macrotask (B).', 'Promise callbacks get priority over timers.'),
      q('How do you handle errors with await?', ['.then only', 'if (await x == error) { … };', 'try { await x } catch (e) { … }', 'You cannot'], 2, 'A rejected promise throws at the `await`, so a normal try/catch handles it.', 'A rejection behaves like a thrown exception.'),
      q('`res.ok` is true when the status is…', ['Any status', 'Between 200 and 299', 'Exactly 200 only, nothing else', 'Below 500'], 1, '`ok` covers the whole 2xx success range.', 'It is a range, not a single code.'),
      q('Which are the three states of a Promise?', ['start, running and done states', 'idle, loading, error', 'open, closed, locked', 'pending, fulfilled, rejected'], 3, 'A promise starts pending and settles once, either fulfilled with a value or rejected with a reason.', 'One of the states is “waiting”.'),
      q('What does `Promise.all([a, b])` do if `b` rejects?', ['It waits for `a` and then resolves anyway', 'It ignores the rejection', 'It rejects immediately with that reason', 'It retries `b`'], 2, 'Promise.all fails fast: the first rejection rejects the combined promise.', 'It is all or nothing.'),
      q('Which method waits for every promise to finish, whether it succeeds or fails?', ['Promise.allSettled', 'Promise.any', 'Promise.race', 'Promise.firstDone()'], 0, '`allSettled` resolves with an array describing each outcome as fulfilled or rejected.', 'It reports on all of them regardless of the result.'),
      q('What does `Promise.race([p1, p2])` give you?', ['The first promise to settle, success or failure', 'Both results gathered together in an array', 'The result of the slowest promise only', 'Only the first successful result, ignoring failures'], 0, 'It settles as soon as any input settles, which suits timeouts.', 'Think of an actual race.'),
      q('What does `await` do inside an async function?', ['Blocks the whole page, including scrolling, until the promise settles, then resumes', 'Cancels the promise if it takes too long', 'Converts the promise into a callback function', 'Pauses that function until the promise settles while other code keeps running'], 3, 'Only the async function is suspended; the event loop stays free for other work.', 'The page itself does not freeze.'),
      q('What is wrong with `const data = await fetch(url).json();`?', ['Nothing is wrong, this code works fine', 'fetch returns a Promise, so `.json()` must be called on the awaited response', '`json` was deprecated and later removed from the fetch API, so it never works', 'await cannot be used together with fetch'], 1, 'Write `const res = await fetch(url); const data = await res.json();`. The Promise itself has no `.json()` method.', 'What does `fetch(url)` return before it is awaited?'),
      q('Which call correctly POSTs an object as JSON?', ['fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: obj, json: true })', 'fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(obj) })', 'fetch(url, { post: obj, type: "json" })', 'fetch.post(url, JSON.parse(obj))'], 1, 'The body must be a string, and the Content-Type header tells the server it is JSON.', 'The body has to be text and the server needs to know its format.'),
      q('What does `JSON.parse` do?', ['Converts an object into a JSON string value', 'Validates a schema', 'Sends JSON to a server', 'Converts a JSON string into a JavaScript value'], 3, '`JSON.parse` turns text into data; `JSON.stringify` does the reverse.', 'It reads text and builds data from it.'),
      q('Which API cancels an in-flight `fetch`?', ['AbortController', 'CancelToken', 'fetch.stop() on the request', 'clearFetch()'], 0, 'Pass `controller.signal` to fetch, then call `controller.abort()` to cancel, for example when the user types again.', 'The controller’s verb is about stopping a request.'),
      q('What is the microtask queue?', ['A queue of animation frames that are waiting to be painted by the browser', 'A list of outstanding network requests', 'Where promise callbacks wait; it runs before the next timer or other macrotask', 'Another name for the call stack'], 2, 'After each task, the engine drains all microtasks before moving to the next macrotask like a `setTimeout` callback.', 'It takes priority over timers.'),
      q('Why is `items.forEach(async (i) => { await save(i); })` a poor way to wait for all saves?', ['forEach is deprecated', 'It saves items twice', 'await cannot be used at all inside arrow functions, so the code never runs', 'forEach ignores the returned promises, so code after it does not wait'], 3, 'Use `for…of` with await for sequential work, or `await Promise.all(items.map(save))` for parallel work.', 'What does forEach do with return values?'),
      q('When does `.finally()` run?', ['Only when the promise fulfils', 'Whether it fulfils or rejects', 'Only when it rejects', 'Before the promise starts'], 1, 'Use `finally` for cleanup such as hiding a loading spinner.', 'It is for work that happens in both outcomes.'),
      q('What does `setTimeout(fn, 1000)` guarantee?', ['`fn` runs at exactly 1000 ms on the dot', '`fn` runs in a separate thread, in parallel with the main code, after exactly 1000 ms', '`fn` runs no sooner than 1000 ms, once the call stack is free', '`fn` runs before any promise callbacks'], 2, 'The delay is a minimum; busy synchronous code can postpone the callback.', 'It is a lower bound, not a promise of precision.'),
      q('What happens to the page while a long synchronous `for` loop runs?', ['Other callbacks and rendering wait until it finishes', 'The browser runs the loop on another thread in parallel', 'Promises run in parallel', 'Nothing special'], 0, 'JavaScript on the main thread is single-threaded, so long loops block events and rendering.', 'There is only one thread of JS on the page.'),
      q('How does `await Promise.all([fa(), fb()])` compare with awaiting them one after the other?', ['The calls overlap, so it takes roughly as long as the slowest one', 'It is slower, because starting both calls together delays whichever finishes first', 'It skips errors from either call silently', 'It always runs `fb` before `fa`'], 0, 'Both requests start immediately and run concurrently, so total time is about the longest, not the sum.', 'Think about starting both tasks before waiting for either.'),
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
