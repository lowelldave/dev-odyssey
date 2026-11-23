import type { Tutorial } from '../../types';
import { q } from '../helpers';

export const HTML_CSS: Record<string, Tutorial> = {
  semantic: {
    goal: 'Structure a page with semantic HTML, so browsers, search engines and screen readers all understand it.',
    steps: [
      {
        title: 'The skeleton of every page',
        body: `Every HTML document starts with a doctype, a \`<html>\` element with a language, a \`<head>\` for metadata, and a \`<body>\` for visible content.`,
        code: {
          lang: 'html',
          src: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Hero Profile</title>
  </head>
  <body>
    <!-- visible content goes here -->
  </body>
</html>`,
        },
      },
      {
        title: 'Landmarks instead of div soup',
        body: `Landmark elements describe what each region is for. Screen-reader users jump between them like chapters.

- \`<header>\` intro content or site banner
- \`<nav>\` major navigation links
- \`<main>\` the page's primary content (only one per page)
- \`<article>\` self-contained content; \`<section>\` a themed group
- \`<aside>\` related side content; \`<footer>\` closing info`,
        code: {
          lang: 'html',
          caption: 'Before → after',
          src: `<!-- before -->
<div class="top"><div class="menu">…</div></div>
<div class="content">…</div>

<!-- after -->
<header><nav>…</nav></header>
<main>
  <article>
    <h1>Level 3 reached!</h1>
    <p>Today I learned semantic HTML.</p>
  </article>
</main>
<footer>© 2026</footer>`,
        },
      },
      {
        title: 'Headings form an outline',
        body: `Use exactly one \`<h1>\` for the page title, then \`<h2>\` for sections and \`<h3>\` for subsections. Never skip levels just to get a smaller font; style the size with CSS instead.`,
        tryIt: 'Install a "headings map" browser extension (or use the Accessibility tree in DevTools) and check the outline of your favourite site.',
      },
      {
        title: 'Buttons, links and images',
        body: `Links (\`<a href>\`) go somewhere; buttons (\`<button>\`) do something. A \`<div onclick>\` cannot be focused with the keyboard and is invisible to assistive tech.

Every meaningful image needs \`alt\` text describing it. Purely decorative images get \`alt=""\` so screen readers skip them.`,
        code: {
          lang: 'html',
          src: `<a href="/quests">See all quests</a>
<button type="button">Equip sword</button>

<img src="hero.png" alt="Pixel-art hero holding a sword">
<img src="divider.svg" alt="">`,
        },
        tryIt: 'Rewrite a page you built earlier using landmarks, a proper heading order and alt text.',
      },
    ],
    mistakes: [
      'Several `<main>` elements on one page, or none at all.',
      'Using `<br>` and empty `<p>` tags for spacing instead of CSS margins.',
      'Missing `alt` attributes: screen readers then read the file name aloud.',
    ],
    recap: [
      'Landmarks (`header`, `nav`, `main`, `footer`…) describe page regions.',
      'One `h1`, then a logical heading order.',
      'Links navigate, buttons act, and images need alt text.',
    ],
    quiz: [
      q('Which element should wrap the primary content of a page?', ['<div id="main">', '<main>', '<section>', '<body2>'], 1),
      q('A clickable element that runs JavaScript should be a…', ['<a href="#">', '<div onclick>', '<button>', '<span>'], 2),
      q('What alt text should a purely decorative image have?', ['alt="image"', 'No alt attribute', 'alt=""', 'alt="decorative"'], 2),
      q('Why not jump from <h1> straight to <h4>?', ['It is invalid HTML', 'It breaks the document outline for assistive tech', 'Browsers refuse to render it', 'It disables CSS'], 1),
      q('Which element is meant for major navigation links?', ['<menu>', '<nav>', '<links>', '<aside>'], 1),
    ],
  },

  forms: {
    goal: 'Build an accessible, validated form that works with mouse, keyboard and screen readers.',
    steps: [
      {
        title: 'Labels are not optional',
        body: `Every input needs a visible \`<label>\` linked by \`for\`/\`id\`. Clicking the label focuses the input, and screen readers announce it.`,
        code: {
          lang: 'html',
          src: `<form action="/signup" method="post">
  <label for="name">Hero name</label>
  <input id="name" name="name" type="text" autocomplete="nickname" required>

  <label for="email">Email</label>
  <input id="email" name="email" type="email" autocomplete="email" required>

  <button type="submit">Join the guild</button>
</form>`,
        },
      },
      {
        title: 'Input types and built-in validation',
        body: `The right \`type\` gives you validation and the right mobile keyboard for free: \`email\`, \`url\`, \`tel\`, \`number\`, \`date\`, \`password\`.

Attributes add rules without JavaScript: \`required\`, \`minlength\`, \`maxlength\`, \`min\`, \`max\`, \`pattern\`.`,
        code: {
          lang: 'html',
          src: `<label for="level">Starting level (1–10)</label>
<input id="level" name="level" type="number" min="1" max="10" value="1">

<label for="guild">Guild tag (3 capital letters)</label>
<input id="guild" name="guild" pattern="[A-Z]{3}" title="Three capital letters, e.g. DEV">`,
        },
        tryIt: 'Submit the form with empty or invalid values and watch the browser block it with a message.',
      },
      {
        title: 'Group related controls',
        body: `Radio buttons and checkboxes that belong together go in a \`<fieldset>\` with a \`<legend>\`, which screen readers announce as the group's question.`,
        code: {
          lang: 'html',
          src: `<fieldset>
  <legend>Choose your class</legend>
  <label><input type="radio" name="class" value="frontend"> Frontend mage</label>
  <label><input type="radio" name="class" value="backend"> Backend knight</label>
</fieldset>`,
        },
      },
      {
        title: 'Keyboard and focus',
        body: `Tab through the form: the order should follow the visual order, and focus must always be visible. Never remove outlines without a replacement.

Placeholder text is a hint, not a label: it disappears when typing and is often low contrast.`,
        code: {
          lang: 'css',
          src: `input:focus-visible,
button:focus-visible {
  outline: 3px solid #f5b400;
  outline-offset: 2px;
}`,
        },
        tryIt: 'Complete your whole form using only Tab, Shift+Tab, Space and Enter.',
      },
    ],
    mistakes: [
      'Using `placeholder` instead of `<label>`.',
      'Writing `outline: none` with no other focus style.',
      'Relying only on front-end validation: servers must validate too.',
    ],
    recap: [
      'Every control gets a linked label.',
      'Input types and attributes give free validation.',
      'Group radios in a fieldset/legend and keep focus visible.',
    ],
    quiz: [
      q('How do you associate a label with an input?', ['Put them in the same div', 'label for="x" matching input id="x"', 'Use the placeholder', 'Give both the same class'], 1),
      q('Which input type triggers email validation?', ['text', 'mail', 'email', 'address'], 2),
      q('Why is placeholder text not a replacement for a label?', ['It disappears when typing and is often low contrast', 'It is invalid HTML', 'It submits the form', 'It cannot be styled'], 0),
      q('Which elements group related radio buttons with a caption?', ['<div> and <span>', '<fieldset> and <legend>', '<group> and <title>', '<section> and <h1>'], 1),
      q('Which attribute makes a field mandatory?', ['mandatory', 'needed', 'required', 'validate'], 2),
    ],
  },

  'box-model': {
    goal: 'Predict exactly how big an element will be and which CSS rule wins when rules conflict.',
    steps: [
      {
        title: 'Every element is a box',
        body: `From inside out: content → padding → border → margin. Padding is space inside the border (it takes the background colour); margin is space outside it.`,
        code: {
          lang: 'css',
          src: `.card {
  width: 300px;
  padding: 20px;
  border: 4px solid #333;
  margin: 16px;
}
/* default (content-box) rendered width:
   300 + 20*2 + 4*2 = 348px */`,
        },
      },
      {
        title: 'Use border-box everywhere',
        body: `With \`box-sizing: border-box\`, \`width\` includes padding and border, so the card above is exactly 300px wide. Almost every project sets this globally.`,
        code: {
          lang: 'css',
          src: `*, *::before, *::after {
  box-sizing: border-box;
}`,
        },
        tryIt: 'Inspect an element in DevTools and look at the box-model diagram in the "Computed" tab. Toggle box-sizing and watch the numbers change.',
      },
      {
        title: 'The cascade decides who wins',
        body: `When two rules set the same property, the browser compares, in order:

- Importance (\`!important\` declarations win, so avoid them)
- Specificity: inline style > \`#id\` > \`.class\` / \`[attr]\` / \`:hover\` > element
- Source order: with equal specificity, the later rule wins`,
        code: {
          lang: 'css',
          src: `p { color: black; }          /* 0-0-1 */
.intro { color: blue; }      /* 0-1-0 wins over p */
#hero .intro { color: red; } /* 1-1-0 wins over both */`,
        },
      },
      {
        title: 'Inheritance and resets',
        body: `Text properties like \`color\`, \`font-family\` and \`line-height\` inherit from parents, so set them once on \`body\`. Box properties like \`margin\` and \`border\` do not inherit.

Keep specificity low: style with classes, not IDs, and you rarely fight the cascade.`,
        tryIt: 'Create two conflicting rules for the same element and predict which wins before checking in DevTools (crossed-out rules lost).',
      },
    ],
    mistakes: [
      'Sprinkling `!important` to win fights: it makes future changes painful.',
      'Styling with IDs: the high specificity is hard to override.',
    ],
    recap: [
      'Content → padding → border → margin.',
      '`box-sizing: border-box` makes width include padding and border.',
      'Importance → specificity → source order decides conflicts.',
    ],
    quiz: [
      q('With box-sizing: border-box, width includes…', ['Only content', 'Content, padding and border', 'Margin too', 'Nothing'], 1),
      q('Which selector has the highest specificity?', ['div p', '.card', '#hero', 'p'], 2),
      q('Two rules with equal specificity conflict. Which wins?', ['The first one', 'The one declared later', 'Neither', 'The shorter one'], 1),
      q('Which property creates space outside the border?', ['padding', 'margin', 'gap', 'outline-offset'], 1),
      q('Which of these properties is inherited by child elements?', ['margin', 'border', 'color', 'width'], 2),
    ],
  },

  layout: {
    goal: 'Lay out any page with Flexbox and Grid, and make it adapt from phones to wide screens.',
    steps: [
      {
        title: 'Flexbox for one direction',
        body: `Flexbox arranges items in a row or a column. \`justify-content\` aligns along the main axis, \`align-items\` across it, and \`gap\` spaces items.`,
        code: {
          lang: 'css',
          caption: 'A navigation bar',
          src: `.nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}`,
        },
      },
      {
        title: 'Grid for two dimensions',
        body: `Grid controls rows and columns together. The \`fr\` unit shares the free space; \`repeat(auto-fill, minmax(…))\` creates responsive columns with no media queries at all.`,
        code: {
          lang: 'css',
          caption: 'A responsive card gallery',
          src: `.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
}`,
        },
        tryIt: 'Build a gallery of 8 cards with the code above and resize the window: the number of columns adapts on its own.',
      },
      {
        title: 'Mobile-first media queries',
        body: `Write base styles for small screens, then add \`min-width\` media queries as the screen grows. Small screens download the simplest CSS.`,
        code: {
          lang: 'css',
          src: `.layout { display: grid; gap: 24px; }

@media (min-width: 900px) {
  .layout { grid-template-columns: 2fr 1fr; } /* content + sidebar */
}`,
        },
      },
      {
        title: 'Fluid sizes and images',
        body: `Use relative units: \`rem\` for type and spacing, \`%\` and \`fr\` for widths. \`clamp()\` makes text scale smoothly between a minimum and a maximum. Images should never overflow their container.`,
        code: {
          lang: 'css',
          src: `h1 { font-size: clamp(1.8rem, 4vw, 3rem); }
img { max-width: 100%; height: auto; }`,
        },
        tryIt: 'Use DevTools device mode to check your layout at 375px, 768px and 1280px wide.',
      },
    ],
    mistakes: [
      'Fixed pixel widths like `width: 1200px` that cause horizontal scrolling on phones.',
      'Using Flexbox for a two-dimensional grid and fighting `flex-wrap` all day.',
    ],
    recap: [
      'Flexbox: one dimension, great for bars and alignment.',
      'Grid: two dimensions; `auto-fill` + `minmax` gives responsive columns.',
      'Mobile-first `min-width` queries, fluid units and `clamp()`.',
    ],
    quiz: [
      q('Which layout system is best for a 2D page grid?', ['Flexbox', 'CSS Grid', 'Floats', 'Tables'], 1),
      q('In flexbox, which property aligns items along the main axis?', ['align-items', 'justify-content', 'flex-wrap', 'place-self'], 1),
      q('Mobile-first media queries usually use…', ['max-width', 'min-width', 'orientation only', 'device-pixel-ratio'], 1),
      q('What does 1fr mean in grid-template-columns?', ['One pixel', 'One fraction of the free space', 'One font size', 'One frame'], 1),
      q('What does `clamp(1.8rem, 4vw, 3rem)` do for a font size?', ['Always 4vw', 'Scales with the viewport but never below 1.8rem or above 3rem', 'Picks a random size', 'Only works in Grid'], 1),
    ],
  },

  boss: {
    goal: 'Build your personal developer portfolio with semantic HTML and modern CSS (no frameworks). This site will host every project you finish on this adventure.',
    steps: [
      {
        title: 'Plan the sections',
        body: `Sketch your page on paper first: hero (name, role, call to action), about, skills, projects (cards), contact form, footer. Create a repo called \`portfolio\` and commit an empty \`index.html\` and \`css/style.css\`.`,
      },
      {
        title: 'Write semantic HTML',
        body: `Use landmarks and one \`h1\`. Each section gets an \`id\` so the nav can link to it.`,
        code: {
          lang: 'html',
          src: `<header class="site-header">
  <nav>
    <a href="#about">About</a>
    <a href="#projects">Projects</a>
    <a href="#contact">Contact</a>
  </nav>
</header>
<main>
  <section class="hero">
    <h1>Hi, I'm Alex, a web developer in training.</h1>
    <p>I build accessible, fast websites.</p>
    <a class="btn" href="#projects">See my work</a>
  </section>
  <section id="projects">
    <h2>Projects</h2>
    <div class="cards">
      <article class="card">
        <img src="img/web-explorer.png" alt="Screenshot of the How the Web Works site">
        <h3>How the Web Works</h3>
        <p>An illustrated explainer of DNS, HTTP and rendering.</p>
        <a href="https://github.com/you/how-the-web-works">Code</a>
      </article>
    </div>
  </section>
</main>`,
        },
      },
      {
        title: 'Theme with custom properties',
        body: `Define your colours once as CSS variables. Supporting dark mode then takes just a few lines.`,
        code: {
          lang: 'css',
          src: `:root {
  --bg: #ffffff;
  --text: #1f2937;
  --accent: #2563eb;
}
@media (prefers-color-scheme: dark) {
  :root { --bg: #0f172a; --text: #e5e7eb; --accent: #60a5fa; }
}
body { background: var(--bg); color: var(--text); }
a { color: var(--accent); }`,
        },
      },
      {
        title: 'Lay it out responsively',
        body: `Use Flexbox for the nav and Grid for the project cards, mobile first.`,
        code: {
          lang: 'css',
          src: `.site-header nav { display: flex; gap: 20px; justify-content: flex-end; padding: 16px; }
.cards { display: grid; gap: 24px; grid-template-columns: 1fr; }

@media (min-width: 720px) {
  .cards { grid-template-columns: repeat(2, 1fr); }
}
@media (min-width: 1080px) {
  .cards { grid-template-columns: repeat(3, 1fr); }
}`,
        },
      },
      {
        title: 'Add an accessible contact form',
        body: `Use labelled inputs (name, email, message). To actually receive messages without a server, point the form at a free form service such as Formspree or Netlify Forms.`,
        tryIt: 'Run Lighthouse in DevTools and fix issues until the Accessibility score is 90 or higher.',
      },
      {
        title: 'Deploy and document',
        body: `Deploy with GitHub Pages (or Netlify) and put the URL in the repo's "Website" field. Write a README with a screenshot, the tech used, and your Lighthouse scores. Then submit it below.`,
      },
    ],
    mistakes: [
      'Huge, uncompressed images: resize screenshots to about 1200px wide and export as WebP or optimised PNG.',
      'Placeholder lorem ipsum left in: recruiters notice.',
    ],
    recap: [
      'Semantic, accessible structure with a working contact form.',
      'CSS variables for theming; Flexbox and Grid with media queries.',
      'Live, documented, and ready to link from your resume.',
    ],
  },
};
