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
      q('Which element should wrap the primary content of a page?', ['<div id="main">', '<section>', '<main>', '<content>'], 2, '`<main>` is a landmark that screen-reader users can jump straight to; there should be one visible per page.', 'Look for the element whose name says what it is, not an id on a div.'),
      q('A clickable element that runs JavaScript should be a…', ['<button>', '<div onclick>', '<a href="#">', '<span>'], 0, '`<button>` gives you keyboard activation, focus and the right role for free. A div with onclick has none of that.', 'Which element is built for actions rather than navigation?'),
      q('What alt text should a purely decorative image have?', ['alt="image"', 'No alt attribute', 'alt="decorative"', 'alt=""'], 3, 'An empty alt tells screen readers to skip the image. Omitting alt may cause the file name to be read out.', 'You want assistive tech to say nothing at all.'),
      q('Why not jump from <h1> straight to <h4>?', ['It is invalid HTML', 'It breaks the document outline for assistive tech', 'Browsers refuse to render the page at all if headings skip', 'It disables CSS'], 1, 'Screen-reader users navigate by heading level, so skipped levels make the structure confusing. Use CSS for size instead.', 'Who relies on headings as a table of contents?'),
      q('Which element is meant for major navigation links?', ['<menu>', '<nav>', '<links>', '<aside>'], 1, '`<nav>` is a landmark for primary navigation blocks, letting assistive tech skip to it.', 'The element’s name is a shortened form of the word for finding your way.'),
      q('Which element is best for a self-contained piece of content like a blog post?', ['<header>', '<span>', '<aside>', '<article>'], 3, '`<article>` marks content that would make sense on its own, such as a post, comment or news item.', 'Think of something that could be syndicated by itself.'),
      q('What is `<section>` for?', ['A thematic grouping of content, normally with a heading', 'Purely a styling hook with no meaning', 'The site’s main navigation block', 'The legal text that sits at the very bottom of a page, in small print'], 0, 'Use `<section>` when the content forms a distinct theme with its own heading; otherwise a `<div>` is fine for styling.', 'It should have meaning, not just a style hook.'),
      q('Which element is correct for steps that must be done in a particular order?', ['<ul>', '<dl>', '<ol>', '<menu>'], 2, '`<ol>` is an ordered list; browsers number the items and assistive tech announces the order.', 'The order of the items matters.'),
      q('Which attribute on `<html>` helps screen readers choose the right pronunciation?', ['dir', 'charset', 'role', 'lang'], 3, '`<html lang="en">` declares the page language, which also helps translation tools and search engines.', 'It names the human language of the page.'),
      q('What does `<!DOCTYPE html>` do?', ['Imports the browser’s default stylesheet for the page', 'Makes the browser render in standards mode', 'Declares the language', 'Enables JavaScript'], 1, 'Without it browsers fall back to quirks mode, which renders some CSS inconsistently.', 'It avoids a legacy rendering mode.'),
      q('What does `<meta charset="utf-8">` do?', ['Sets the language of the page’s text', 'Makes the text bold', 'Sets the text encoding of the page', 'Adds a favicon'], 2, 'It tells the browser how to decode bytes into characters so accents, emoji and other scripts display correctly.', 'It is about turning bytes into characters.'),
      q('You need a control that takes the user to another URL. Which element fits best?', ['<a href="…">', '<div>', '<button>', '<input type="reset">'], 0, 'Links (`<a href>`) provide navigation semantics, open in new tabs on middle-click and are indexable.', 'Navigation, not action.'),
      q('What is the accessibility problem with `<img src="chart.png">`?', ['It is missing an alt attribute', 'The src attribute is a relative path', 'It should be a div', 'It needs a width'], 0, 'Every meaningful image needs alt text describing its content or purpose.', 'What would a screen reader announce for it?'),
      q('Which elements pair an image with its caption?', ['<img> and <title>', '<picture> and <label> tags', '<figure> and <figcaption>', '<div> and <small>'], 2, '`<figure>` wraps self-contained media and `<figcaption>` describes it, linking the two semantically.', 'The names echo what you would see in a book.'),
      q('Which landmark is the natural home for copyright and contact links at the bottom of a page?', ['<header>', '<footer>', '<section>', '<aside>'], 1, '`<footer>` holds closing information for its page or section.', 'It sits at the end.'),
      q('What is the difference between `<strong>` and `<b>`?', ['`<strong>` can only be used inside headings and never in paragraphs of text', 'They are identical', '`<b>` was removed from HTML', '`<strong>` conveys importance; `<b>` is only visual emphasis'], 3, '`<strong>` carries meaning (strong importance) that assistive tech can convey, while `<b>` just draws attention.', 'One says something about meaning; the other only about looks.'),
      q('Which link text is best for accessibility and SEO?', ['Click here for pricing', 'Here', 'Read our pricing guide', 'Link'], 2, 'Descriptive link text makes sense out of context, which is how screen-reader users often browse links.', 'Would it still make sense in a list of all links on the page?'),
      q('Which element marks up a date or time in a machine-readable way?', ['<time datetime="2026-03-01">', '<date>', '<span class="date">2026</span>', '<data-time>'], 0, '`<time datetime="…">` provides a machine-readable value alongside the human-readable text.', 'The element name is the thing it represents.'),
      q('Why prefer semantic elements over generic `<div>` soup?', ['They load faster than elements that carry no meaning, which is why developers use them', 'They need no CSS to look good on every device', 'Browsers refuse to render pages without them', 'Assistive tech, search engines and other developers can understand the structure'], 3, 'Semantic elements expose roles and structure without extra ARIA or class-name conventions.', 'Think about everyone and everything that reads your page besides sighted users.'),
      q('Which element suits supporting content related to, but separate from, the main content, like a sidebar?', ['<main>', '<aside>', '<article>', '<nav>'], 1, '`<aside>` marks tangentially related content and is exposed as a complementary landmark.', 'The word means “off to one side”.'),
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
      q('How do you associate a label with an input?', ['Put the label and the input in the same div', 'label for="x" matching input id="x"', 'Use the placeholder', 'Give both the same class'], 1, 'A matching `for`/`id` pair (or wrapping the input in the label) gives the control an accessible name and enlarges its click target.', 'An attribute on the label must point at an attribute on the input.'),
      q('Which input type triggers email validation?', ['text', 'mail', 'address', 'email'], 3, '`type="email"` checks for a plausible address and brings up a suitable mobile keyboard.', 'The type is named after the data.'),
      q('Why is placeholder text not a replacement for a label?', ['It disappears when typing and is often low contrast', 'It is invalid HTML when used on a form', 'It submits the form as soon as you start typing in the box', 'It cannot be styled with CSS at all'], 0, 'Users lose the hint once they type, and placeholders often fail contrast guidelines and are inconsistently announced.', 'Think about what happens to it when you start typing.'),
      q('Which elements group related radio buttons with a caption?', ['<div> and <span>', '<group> and <title> tags', '<fieldset> and <legend>', '<section> and <h1>'], 2, 'A `<fieldset>` groups controls and its `<legend>` names the group, which screen readers announce.', 'Both names sound like they belong to a paper form.'),
      q('Which attribute makes a field mandatory?', ['mandatory', 'needed', 'validate', 'required'], 3, 'The boolean `required` attribute blocks submission until the field has a value.', 'It is the plain English adjective.'),
      q('What does WCAG stand for?', ['Web CSS And Grid', 'Web Content Accessibility Guidelines', 'World Code Access Group', 'Web Components Accessibility Grammar'], 1, 'WCAG is the W3C’s standard for making web content accessible, with levels A, AA and AAA.', 'The “A” in the middle gives it away.'),
      q('What does `autocomplete="email"` do on an input?', ['Validates that the domain of the address exists in DNS', 'Sends an email when the form is submitted', 'Hints to the browser which saved value to fill in', 'Makes the field required before submission'], 2, 'Autocomplete tokens let browsers and password managers fill in the right saved data, which also helps accessibility.', 'It helps the browser pre-fill.'),
      q('Which attribute asks for a numeric on-screen keyboard without changing the input type?', ['inputmode="numeric"', 'keyboard="numeric" on the field', 'type="digits"', 'pad="num"'], 0, '`inputmode="numeric"` suggests a digit keypad, useful for things like postal codes where `type="number"` is a poor fit.', 'The attribute name refers to how input is entered.'),
      q('What does `type="password"` do?', ['Masks the characters on screen', 'Hashes the value in the browser', 'Encrypts the value before sending', 'Blocks pasting'], 0, 'It only hides characters visually. Security still depends on HTTPS and server-side hashing.', 'It changes what you see, not what is sent.'),
      q('What does `<input pattern="[0-9]{5}">` accept?', ['Any digits up to five', 'Five or more digits', 'Exactly five digits', 'Five letters'], 2, 'The pattern must match the whole value, so `[0-9]{5}` means precisely five digits.', 'Read the quantifier carefully.'),
      q('Why must you validate on the server even when the form validates in the browser?', ['Browsers do not support validation at all', 'Users can bypass client-side checks', 'HTML forbids validation attributes', 'Servers are faster'], 1, 'Client-side validation is for convenience; anyone can send requests directly, so the server must enforce the rules.', 'Who controls the browser?'),
      q('How does `method="get"` differ from `method="post"` on a form?', ['GET encrypts the values so that nobody on the network can read them at all', 'GET and POST behave identically for forms', 'POST can only send plain text, not files', 'GET puts field values in the URL; POST sends them in the request body'], 3, 'GET is for idempotent lookups like searches and is bookmarkable; POST suits changes and sensitive data.', 'Look at where the data ends up.'),
      q('A `<button>` inside a `<form>` has no `type`. What happens when it is clicked?', ['Nothing', 'It resets the form fields', 'It submits the form', 'It navigates back'], 2, 'The default type is `submit`. Use `type="button"` for buttons that should not submit.', 'The default is the most common action for a form.'),
      q('Which keys activate a focused `<button>` from the keyboard?', ['Enter and Space', 'Only Enter', 'Only Space', 'Tab and Shift keys'], 0, 'Native buttons respond to both Enter and Space, one reason not to rebuild them from divs.', 'There are two of them, and one is a long bar.'),
      q('Why is `outline: none` without a replacement a problem?', ['It breaks the page layout on small screens and tablets', 'It disables clicks on the element entirely', 'It is invalid CSS that browsers ignore', 'Keyboard users cannot see which element has focus'], 3, 'Visible focus is required for keyboard navigation. Replace the outline with another clear style instead of removing it.', 'Think about someone navigating with Tab.'),
      q('Which attribute connects an input to an error message so screen readers announce it?', ['aria-hidden', 'aria-describedby', 'aria-live="off" attribute', 'tabindex'], 1, '`aria-describedby="err-id"` links the input to the element with that id, whose text is read as its description.', 'The attribute’s name says “described”.'),
      q('What is `aria-label` used for?', ['Adding a CSS class to an element for styling', 'Giving an accessible name to an element without visible text, like an icon button', 'Showing a tooltip whenever the mouse hovers over the element with it, as a title attribute', 'Making a form field required before submission'], 1, 'An icon-only button needs a name such as `aria-label="Close"` so assistive tech can announce it.', 'Think of a button that only shows a symbol.'),
      q('What minimum contrast ratio does WCAG AA require for normal-size text?', ['2:1', '3:1', '10:1', '4.5:1'], 3, 'AA requires 4.5:1 for normal text and 3:1 for large text.', 'Look up the AA level for body text in the guidelines.'),
      q('Which input type gives a date picker whose value is formatted YYYY-MM-DD?', ['type="date"', 'type="calendar"', 'type="datetime-text"', 'type="day"'], 0, '`type="date"` shows a native picker and always submits an ISO-formatted value.', 'It is named after the thing you choose.'),
      q('What makes a set of radio buttons mutually exclusive?', ['Being inside a div', 'Sharing the same `class`', 'Sharing the same `name`', 'Having the same value'], 2, 'Radios with the same `name` form one group, so only one can be selected. Ids must be unique.', 'It is the attribute the server also sees in the submitted data.'),
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
      q('With `box-sizing: border-box`, `width` includes…', ['Only the content box and the margin', 'Nothing', 'Margin too', 'Content, padding and border'], 3, 'Border-box makes the declared width the box’s total visible width, so adding padding does not make it grow.', 'It spans from border edge to border edge.'),
      q('Which selector has the highest specificity?', ['div p', '#hero', '.card', 'p'], 1, 'An id selector outweighs class selectors, which outweigh element selectors.', 'IDs are unique and rank above classes.'),
      q('Two rules with equal specificity conflict. Which wins?', ['The first one', 'The one declared later', 'Neither', 'The shorter one'], 1, 'When importance and specificity tie, source order decides and the later rule wins.', 'The last word wins.'),
      q('Which property creates space outside the border?', ['padding', 'gap', 'margin', 'outline-offset'], 2, 'Margin sits outside the border; padding sits inside it between content and border.', 'It pushes neighbours away.'),
      q('Which of these properties is inherited by child elements by default?', ['color', 'border', 'margin', 'width'], 0, 'Text-related properties like `color` and `font-family` inherit; box properties such as margin and border do not.', 'Think of a property describing text rather than the box.'),
      q('A `<p class="note">` has `p { color: red }` and `.note { color: blue }`. What colour is the text?', ['Blue', 'Red', 'Black', 'It depends on the order'], 0, 'A class selector is more specific than an element selector, so blue wins regardless of order.', 'Compare the specificity of the two selectors.'),
      q('What does `!important` do?', ['Makes the rule load faster than every other rule in the stylesheet', 'Raises the declaration’s priority in the cascade above normal declarations', 'Prevents the property from being inherited', 'Marks the property as deprecated and unsafe'], 1, 'It overrides normal specificity, which is why it is best kept for rare utilities rather than routine styling.', 'It shifts a declaration to a higher tier of the cascade.'),
      q('A `content-box` element has `width: 200px; padding: 20px; border: 5px solid`. How wide is it on screen?', ['200px', '240px', '250px', '270px'], 2, '200 content + 40 padding (both sides) + 10 border (both sides) = 250px.', 'Add both sides of the padding and the border to the width.'),
      q('What is margin collapsing?', ['Margins turning to zero on phones', 'Adjoining vertical margins of block boxes combining into one', 'Margins disappearing whenever a border is added around the box', 'Horizontal margins merging'], 1, 'Two touching vertical margins merge into a single margin equal to the larger of the two.', 'It only affects the vertical direction.'),
      q('Which property draws a line around an element without taking up layout space?', ['border', 'margin', 'padding', 'outline'], 3, 'Outlines are drawn outside the border box and do not affect layout, which suits focus rings.', 'Borders change the size of the box; this one does not.'),
      q('Which selector is more specific: `ul li` or `.item`?', ['`ul li`', 'They are equal', '`.item`', 'It depends on the file order'], 2, '`.item` is one class (0,1,0); `ul li` is two elements (0,0,2). Any class beats any number of element selectors.', 'One class outweighs any number of tag names.'),
      q('How does an inline `style` attribute compare with an `#id` selector in a stylesheet?', ['Inline styles are more specific', 'The id selector is more specific', 'They are equal', 'Inline styles are ignored'], 0, 'Inline styles sit above all selectors in specificity, which is why they are hard to override.', 'It is written directly on the element.'),
      q('What does `*, *::before, *::after { box-sizing: border-box; }` do?', ['Removes all borders from every element on the whole page', 'Adds a subtle box shadow to all elements', 'Applies only to the first element in the document', 'Applies border-box sizing to every element and pseudo-element'], 3, 'This common reset makes sizing predictable across the whole page.', 'The universal selector matches everything.'),
      q('Which `display` value keeps an element in the text flow but lets you set its width and height?', ['block', 'inline-block', 'table-column', 'none'], 1, '`inline-block` flows like text but accepts width, height and vertical margins like a block.', 'It is a hybrid of two other values.'),
      q('What is needed for `margin: 0 auto` to centre a block horizontally?', ['The element must have position: absolute applied to it', 'A width (or max-width) smaller than the container', 'The element must have float: left applied', 'The element must be display: table-cell'], 1, 'Auto margins share the leftover space, but a block with no width already fills the container so nothing is left over.', 'There must be spare horizontal space.'),
      q('What does `padding: 10px 20px` set?', ['10px left/right and 20px top/bottom', '10px on all sides', '10px top and 20px bottom only', '10px top/bottom and 20px left/right'], 3, 'Two values mean vertical then horizontal. Four values go clockwise: top, right, bottom, left.', 'Remember vertical comes first.'),
      q('In `margin: 5px 10px 15px 20px`, which side gets `15px`?', ['Bottom', 'Right', 'Top', 'Left'], 0, 'Four-value shorthand runs clockwise from the top: top, right, bottom, left.', 'Go around the box clockwise starting at the top.'),
      q('What is `rem` relative to?', ['The parent’s font size', 'The viewport width', 'The root (html) element’s font size', 'The element’s own computed width in pixels'], 2, '1rem equals the root font size, which respects the user’s browser settings and avoids compounding like `em`.', 'Unlike em, it does not compound as elements nest.'),
      q('Which is the best summary of how the cascade resolves a conflict?', ['Alphabetical order of the property names in the file', 'Source order, then specificity', 'Specificity only', 'Importance, then specificity, then source order'], 3, 'Roughly: origin and `!important` first, then specificity, then the last declaration wins. Cascade layers slot in before specificity.', 'Start with how forceful a declaration is.'),
      q('What does `@layer` let you do?', ['Create a brand new HTML element together with its own default styles and behaviour', 'Group rules into layers with an explicit priority order that outranks specificity', 'Set the z-index of elements automatically', 'Define named keyframe animations for reuse'], 1, 'Rules in a later layer beat earlier layers regardless of selector specificity, which tames large stylesheets.', 'It gives you control over ordering in the cascade.'),
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
      q('Which layout system is best for a 2D page grid?', ['Flexbox', 'Floats', 'CSS Grid', 'Tables'], 2, 'Grid lays out rows and columns together; flexbox is primarily one-dimensional.', 'The name describes the layout you want.'),
      q('In flexbox, which property aligns items along the main axis?', ['justify-content', 'align-items-start', 'flex-wrap', 'place-self'], 0, '`justify-content` distributes items along the main axis; `align-items` handles the cross axis.', 'The other alignment property handles the perpendicular direction.'),
      q('Mobile-first media queries usually use…', ['min-width', 'max-width', 'orientation only', 'device-pixel-ratio'], 0, 'You write base styles for small screens, then add `@media (min-width: …)` rules to enhance for larger ones.', 'Styles are added as the screen gets bigger.'),
      q('What does `1fr` mean in `grid-template-columns`?', ['One pixel', 'One font-size unit for every grid track', 'One fraction of the free space', 'One frame'], 2, 'An `fr` unit is a share of the leftover space in the grid container.', 'It is a flexible unit that only makes sense in grid tracks.'),
      q('What does `clamp(1.8rem, 4vw, 3rem)` do for a font size?', ['Always sets the size to exactly 4vw', 'Scales with the viewport but never below 1.8rem or above 3rem', 'Picks a random size between the two limits each time the page loads', 'Only works inside a CSS Grid container'], 1, '`clamp(min, preferred, max)` gives fluid sizing with sensible limits.', 'It takes a minimum, a middle and a maximum.'),
      q('Which flexbox property allows items to move onto a new line when they run out of space?', ['flex-flow: none', 'flex-wrap', 'align-content: stretch', 'order'], 1, '`flex-wrap: wrap` lets items wrap instead of shrinking or overflowing.', 'Think of text wrapping.'),
      q('With `flex-direction: column`, `justify-content` aligns items…', ['It has no effect on the layout at all', 'Horizontally', 'Diagonally', 'Vertically, along the main axis'], 3, 'The main axis follows the flex direction, so in a column it runs vertically.', 'The main axis changes with the direction.'),
      q('What does the `gap` property do in flex and grid layouts?', ['Removes borders', 'Adds space around the container', 'Adds space between items', 'Sets the item order'], 2, '`gap` sets gutters between rows and columns, replacing margin hacks.', 'It controls the spacing between neighbours.'),
      q('Which declaration creates three equal-width columns?', ['grid-template-columns: repeat(3, 1fr)', 'grid-columns: 3', 'display: grid-columns(3, 1fr);', 'grid-template: 3fr'], 0, '`repeat(3, 1fr)` repeats an `1fr` track three times.', 'It uses a function that repeats a track.'),
      q('What does `grid-template-columns: repeat(auto-fit, minmax(220px, 1fr))` produce?', ['Exactly one column of any width that always fills the whole container', 'Three columns of equal width at all sizes', 'Columns that are always fixed at 220px wide', 'As many columns of at least 220px as fit, growing to share the space'], 3, 'A responsive card grid without media queries: the number of columns adapts to the width.', 'Focus on the minimum and maximum in `minmax`.'),
      q('Which tag makes phones lay a page out at the device width rather than a zoomed-out desktop width?', ['<meta name="mobile" content="true"> placed inside the head of the page', '<meta name="viewport" content="width=device-width, initial-scale=1">', '<link rel="responsive" href="mobile.css">', '<meta charset="device"> at the top of the head'], 1, 'Without the viewport meta tag, mobile browsers emulate a wide desktop viewport and shrink the page.', 'The meta name is the thing you are controlling.'),
      q('What does `max-width: 100%` do on an image?', ['Stretches it to fill the whole screen in every case', 'Stops it growing wider than its container', 'Crops the image', 'Makes it transparent'], 1, 'The image scales down to fit narrow containers but is not enlarged beyond its natural size.', 'It sets a ceiling, not a target.'),
      q('Which attributes let the browser pick among image files of different widths?', ['rel and href', 'alt and title', 'loading and decoding', 'srcset and sizes'], 3, '`srcset` lists candidates and `sizes` describes how wide the image will be so the browser downloads the best one.', 'One lists the choices, the other describes the layout slot.'),
      q('Which unit equals 1% of the viewport’s width?', ['vw', 'vh', 'rem', 'fr'], 0, '`vw` is 1% of the viewport width; `vh` is 1% of its height.', 'Compare it with the unit for height.'),
      q('What does `flex: 1` on a child roughly mean?', ['Fix the item’s width at exactly one pixel wide, whatever its content', 'Hide the item when the container is small', 'Let it grow to share free space equally with other flexible siblings', 'Put the item first in the visual order'], 2, '`flex: 1` expands to `1 1 0%`: it can grow and shrink and starts from zero basis.', 'It is about distributing leftover space.'),
      q('Which property centres a single child both ways inside a grid container?', ['float: center', 'text-align: middle on the box', 'margin: center', 'place-items: center'], 3, '`place-items: center` is shorthand for `align-items` and `justify-items`.', 'The shorthand covers both axes.'),
      q('What does a container query (`@container`) let you do?', ['Query a server for the size of the container', 'Style an element based on the size of its container instead of the viewport', 'Load a different stylesheet conditionally depending on the type of device used', 'Resize images to fit the container'], 1, 'Components can adapt to the space they are given, wherever they are placed in the layout.', 'The size it responds to is not the window’s.'),
      q('What does `aspect-ratio: 16 / 9` do?', ['Sets a fixed pixel size for the box', 'Rotates the element until it is displayed in landscape orientation', 'Keeps the box at a 16:9 proportion as its width changes', 'Crops video to a square shape'], 2, 'The browser derives the height from the width (or vice versa) to maintain the ratio.', 'It is about proportion rather than size.'),
      q('Why use `min-height: 100dvh` instead of `100vh` for a full-screen section on phones?', ['dvh accounts for browser toolbars that show and hide', 'dvh is faster to calculate than other units', 'vh is deprecated and was removed from all browsers long ago', 'dvh includes the element’s margins in its size'], 0, 'Dynamic viewport units track the visible area as mobile address bars collapse, avoiding content hidden behind them.', 'The “d” stands for something that changes.'),
      q('Why set font sizes in `rem` rather than `px`?', ['It scales with the user’s browser font-size setting', 'It makes the page load faster on slow connections only', 'px is invalid in modern CSS and is ignored', 'It never changes whatever the user prefers'], 0, 'Users who increase their default font size get larger text, which is an accessibility win.', 'It respects a preference the user can change.'),
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
