import type { Tutorial } from '../../types';
import { q } from '../helpers';

export const WEB: Record<string, Tutorial> = {
  internet: {
    goal: 'Explain, in your own words, how a request travels from your laptop to a server and back, and know the difference between "the internet" and "the web".',
    steps: [
      {
        title: 'The internet is a network of networks',
        body: `The internet is the physical and logical plumbing: millions of networks (your home Wi-Fi, your ISP, data centres, undersea cables) connected by routers that pass small chunks of data called packets.

Every device on it gets an IP address, such as \`142.250.72.14\` (IPv4) or \`2607:f8b0:4005::200e\` (IPv6). Routers read the destination address on each packet and forward it one hop closer to where it needs to go.`,
        tryIt: 'Open a terminal and run `ping example.com`. Each reply line is one round trip; the `time=` value is how long it took in milliseconds.',
      },
      {
        title: 'TCP/IP: reliable delivery on an unreliable network',
        body: `Packets can arrive out of order, get duplicated, or be lost. Two protocols cooperate to fix that:

- \`IP\` addresses and routes each packet.
- \`TCP\` numbers the packets, re-sends lost ones, and reassembles them in order, so applications see a clean stream of bytes.

Before data flows, TCP performs a three-way handshake (SYN → SYN-ACK → ACK) to open a connection.`,
        code: {
          lang: 'shell',
          caption: 'Trace the routers between you and a server',
          src: `# Windows
tracert example.com

# macOS / Linux
traceroute example.com`,
        },
        tryIt: 'Run the trace above. Count the hops; each line is a router that forwarded your packets.',
      },
      {
        title: 'The web runs on top of the internet',
        body: `The web is one service that uses the internet, alongside email, video calls and games. It is made of resources (HTML pages, images, JSON data) identified by URLs and fetched with the HTTP protocol.

A URL breaks down like this: \`https://\` (protocol) \`shop.example.com\` (host) \`:443\` (port, usually hidden) \`/products/42\` (path) \`?color=red\` (query string).`,
      },
      {
        title: 'Clients, servers and ports',
        body: `Your browser is a client: it starts conversations by sending requests. A server is a program listening for requests and sending responses.

One machine can run many servers, so a port number picks the right one: \`80\` for HTTP, \`443\` for HTTPS, \`5432\` for PostgreSQL, \`5173\` for a Vite dev server.`,
        code: {
          lang: 'shell',
          caption: 'Run a tiny web server on port 8000 (needs Python)',
          src: `python -m http.server 8000
# then open http://localhost:8000 in your browser`,
        },
        tryIt: 'Start the server above in any folder and open it in your browser. You are now both the client and the server!',
      },
    ],
    mistakes: [
      'Using "internet" and "web" as if they mean the same thing: the web is one application of the internet.',
      'Thinking `localhost` goes out to the internet: it always means "this same machine" (`127.0.0.1`).',
    ],
    recap: [
      'The internet moves packets between IP addresses; TCP makes delivery reliable.',
      'The web is documents and apps addressed by URLs and fetched over HTTP.',
      'Clients ask, servers answer, and ports pick which server on a machine.',
    ],
    quiz: [
      q('What is the relationship between the internet and the web?', ['They are the same thing', 'The web is a service that runs on top of the internet', 'The internet runs on top of the web', 'The web only works offline'], 1),
      q('Which protocol re-sends lost packets and reassembles them in order?', ['IP', 'TCP', 'HTML', 'DNS'], 1, 'TCP provides reliable, ordered delivery; IP only addresses and routes.'),
      q('In `https://shop.example.com/products/42?color=red`, what is `/products/42`?', ['The host', 'The port', 'The path', 'The query string'], 2),
      q('Which port does HTTPS use by default?', ['21', '80', '443', '5173'], 2),
      q('What does `localhost` refer to?', ['The nearest server in your city', 'Your own machine', 'Your router', 'Google'], 1),
    ],
  },

  http: {
    goal: 'Read and write raw HTTP: understand methods, status codes and headers, and inspect real requests in your browser.',
    steps: [
      {
        title: 'Anatomy of a request',
        body: `An HTTP request is plain text. The first line has the method, the path and the version, followed by headers, a blank line, and an optional body.`,
        code: {
          lang: 'http',
          caption: 'A raw HTTP request',
          src: `GET /api/products?page=2 HTTP/1.1
Host: shop.example.com
Accept: application/json
User-Agent: Mozilla/5.0`,
        },
      },
      {
        title: 'Methods say what you want to do',
        body: `- \`GET\` reads data and should never change anything.
- \`POST\` creates something (submit a form, add an order).
- \`PUT\` replaces a resource; \`PATCH\` updates part of it.
- \`DELETE\` removes it.

GET, PUT and DELETE are idempotent: repeating the same request has the same effect as sending it once. POST is not; that is why browsers warn before re-submitting a form.`,
      },
      {
        title: 'Responses and status codes',
        body: `The server answers with a status line, headers and usually a body. The status code tells the client what happened:

- \`2xx\` success: \`200 OK\`, \`201 Created\`, \`204 No Content\`
- \`3xx\` redirect: \`301 Moved Permanently\`, \`304 Not Modified\`
- \`4xx\` the client made a mistake: \`400\`, \`401 Unauthorized\`, \`403 Forbidden\`, \`404 Not Found\`
- \`5xx\` the server failed: \`500\`, \`503 Service Unavailable\``,
        code: {
          lang: 'http',
          caption: 'A raw HTTP response',
          src: `HTTP/1.1 200 OK
Content-Type: application/json
Cache-Control: max-age=60

{"items":[{"id":42,"name":"Lantern"}],"page":2}`,
        },
      },
      {
        title: 'Send requests yourself',
        body: `HTTP is stateless: each request stands alone, so the server needs cookies or tokens to remember who you are. HTTPS wraps the same messages in TLS encryption so nobody in between can read or change them.

\`curl\` lets you send requests from the terminal and see exactly what comes back.`,
        code: {
          lang: 'shell',
          src: `# -i shows the status line and headers
curl -i https://httpbin.org/get

# send JSON with POST
curl -i -X POST https://httpbin.org/post \\
  -H "Content-Type: application/json" \\
  -d '{"hero":"you","level":1}'`,
        },
        tryIt: 'Open DevTools (F12) → Network, reload any site, click a request and find its method, status code and three response headers.',
      },
    ],
    mistakes: [
      'Using GET for actions that change data (like `/deleteUser?id=5`): crawlers and prefetchers will happily trigger it.',
      'Returning `200 OK` with an error message in the body: use the right 4xx/5xx code so clients can react.',
    ],
    recap: [
      'Requests have a method, path, headers and an optional body; responses have a status, headers and a body.',
      'Status families: 2xx ok, 3xx redirect, 4xx client error, 5xx server error.',
      'HTTP is stateless; HTTPS adds encryption with TLS.',
    ],
    quiz: [
      q('Which status code means "Not Found"?', ['200', '301', '404', '500'], 2),
      q('Which method is meant for reading data without side effects?', ['POST', 'GET', 'DELETE', 'PATCH'], 1),
      q('A form submission that creates a new order should usually use…', ['GET', 'POST', 'HEAD', 'OPTIONS'], 1),
      q('A server responds `503`. Whose problem is it?', ['The client sent a bad request', 'The server is unavailable or overloaded', 'The resource moved', 'Everything is fine'], 1),
      q('What does it mean that HTTP is stateless?', ['It cannot carry data', 'Each request is independent unless cookies/tokens add state', 'It only works over HTTPS', 'It never uses headers'], 1),
    ],
  },

  dns: {
    goal: 'Understand how a domain name becomes an IP address, read DNS records, and know what to change when you point a domain at your own site.',
    steps: [
      {
        title: 'Why DNS exists',
        body: `Computers route by IP address, but humans remember names. The Domain Name System is a distributed phone book that turns \`github.com\` into an address like \`140.82.113.3\`.

No single server knows everything: the work is split across a hierarchy of servers, and answers are cached along the way.`,
      },
      {
        title: 'Following a lookup',
        body: `When you visit \`blog.example.com\`:

- Your computer asks a recursive resolver (from your ISP, or one like \`1.1.1.1\`).
- If it has no cached answer, it asks a root server, which points to the \`.com\` servers.
- The \`.com\` servers point to the authoritative servers for \`example.com\`.
- The authoritative server answers with the record, and everyone caches it for its TTL.`,
        code: {
          lang: 'shell',
          caption: 'Look up a domain',
          src: `nslookup github.com

# more detail (macOS / Linux, or WSL on Windows)
dig github.com +noall +answer`,
        },
        tryIt: 'Run `nslookup` on three sites you use. Do any return more than one IP address? (Big sites spread traffic across many servers.)',
      },
      {
        title: 'Common record types',
        body: `- \`A\` maps a name to an IPv4 address; \`AAAA\` to IPv6.
- \`CNAME\` makes one name an alias of another name.
- \`MX\` says which servers receive email for the domain.
- \`TXT\` holds text, often used to prove you own a domain.

The TTL (time to live, in seconds) controls how long resolvers cache the answer.`,
        code: {
          lang: 'dns',
          caption: 'Records you might add to host a site',
          src: `example.com.      3600  IN  A      185.199.108.153
www.example.com.  3600  IN  CNAME  you.github.io.
example.com.      3600  IN  MX     10 mail.example.com.
example.com.      3600  IN  TXT    "google-site-verification=abc123"`,
        },
      },
      {
        title: 'Pointing a domain at your project',
        body: `When you deploy to GitHub Pages, Vercel or Netlify, they tell you which records to add at your domain registrar: usually \`A\` records for the root domain and a \`CNAME\` for \`www\`.

Changes are not instant: old answers stay cached until their TTL expires. Lower the TTL a day before a migration so the switch is fast.`,
      },
    ],
    mistakes: [
      'Putting a CNAME on the root domain (`example.com`): most DNS providers do not allow it; use A/ALIAS records instead.',
      'Panicking when a change does not show up immediately: wait for the old TTL to expire.',
    ],
    recap: [
      'DNS turns names into IP addresses through resolvers, root, TLD and authoritative servers.',
      'A/AAAA point to addresses, CNAME aliases names, MX handles mail, TXT holds verification text.',
      'TTL controls caching, and therefore how fast changes spread.',
    ],
    quiz: [
      q('What does DNS primarily do?', ['Encrypts traffic', 'Translates domain names into IP addresses', 'Hosts websites', 'Compresses images'], 1),
      q('Which record maps a name to an IPv4 address?', ['MX', 'CNAME', 'A', 'TXT'], 2),
      q('A CNAME record is…', ['An alias pointing one name to another name', 'A mail server', 'An IPv6 address', 'A TLS certificate'], 0),
      q('Which server holds the definitive records for `example.com`?', ['The root server', 'The authoritative name server for example.com', 'Your browser', 'The .com TLD server'], 1),
      q('You changed a DNS record but still see the old site. Most likely cause?', ['DNS is broken', 'Resolvers are still serving the cached answer until its TTL expires', 'You need a new domain', 'HTTPS blocks it'], 1),
    ],
  },

  browser: {
    goal: 'Know what the browser does between receiving HTML and showing pixels, so you can write pages that load fast and stay smooth.',
    steps: [
      {
        title: 'From bytes to the DOM and CSSOM',
        body: `The browser parses HTML top to bottom into the DOM (Document Object Model), a tree of element objects. CSS is parsed into the CSSOM, a tree of style rules.

Scripts can change both trees, which is why a plain \`<script>\` tag pauses HTML parsing until the script has downloaded and run.`,
        code: {
          lang: 'html',
          caption: 'Load scripts without blocking the parser',
          src: `<!-- blocks parsing until downloaded and executed -->
<script src="app.js"></script>

<!-- downloads in parallel, runs after parsing, in order -->
<script src="app.js" defer></script>

<!-- modules are deferred by default -->
<script type="module" src="main.js"></script>`,
        },
      },
      {
        title: 'Render tree, layout, paint, composite',
        body: `- The DOM and CSSOM combine into the render tree: only visible elements with their computed styles.
- Layout (reflow) calculates each box's position and size.
- Paint fills in pixels: text, colours, borders, shadows.
- Composite stacks painted layers together on the GPU.

Every change you make re-runs some of these stages. The earlier the stage, the more expensive the change.`,
      },
      {
        title: 'Cheap and expensive changes',
        body: `Changing \`width\`, \`height\`, \`top\` or \`margin\` triggers layout, then paint, then composite. Changing \`color\` or \`background\` skips layout. Changing \`transform\` or \`opacity\` can skip both and run on the compositor alone, which is why smooth animations use them.`,
        code: {
          lang: 'css',
          caption: 'Animate transform, not left/top',
          src: `/* janky: re-layouts every frame */
.card:hover { left: 10px; }

/* smooth: compositor only */
.card { transition: transform 0.2s; }
.card:hover { transform: translateX(10px); }`,
        },
        tryIt: 'In DevTools open the Rendering panel (⋮ → More tools → Rendering) and turn on "Paint flashing". Hover around a site and watch what repaints.',
      },
      {
        title: 'Measure it',
        body: `The Performance panel records everything the browser does. Look for long yellow scripting blocks and purple layout blocks. Lighthouse summarises page speed using the Core Web Vitals.`,
        tryIt: 'Record a page load in DevTools → Performance. Find one "Layout" and one "Paint" event in the timeline.',
      },
    ],
    mistakes: [
      'Putting large scripts in `<head>` without `defer`: the page stays blank while they download.',
      'Animating layout properties like `left` or `width` instead of `transform`.',
    ],
    recap: [
      'HTML → DOM, CSS → CSSOM, combined into the render tree.',
      'Then layout → paint → composite; later stages are cheaper to re-run.',
      'Use `defer` for scripts and `transform`/`opacity` for animation.',
    ],
    quiz: [
      q('What does the browser build from HTML?', ['CSSOM', 'DOM', 'JSON', 'A bitmap'], 1),
      q('Which script attribute downloads in parallel and runs after parsing, in order?', ['async', 'defer', 'blocking', 'lazy'], 1),
      q('Which property is usually cheapest to animate?', ['width', 'top', 'transform', 'margin'], 2, 'transform and opacity can be handled by the compositor without re-layout.'),
      q('What is the correct pipeline order?', ['Paint → Layout → Style', 'Style → Layout → Paint → Composite', 'Composite → Paint → Layout', 'Layout → Style → Composite'], 1),
      q('Why does a plain `<script>` in the `<head>` slow the first render?', ['It is downloaded twice', 'It pauses HTML parsing until it downloads and runs', 'It disables CSS', 'Browsers ignore it'], 1),
    ],
  },

  boss: {
    goal: 'Build and publish a small multi-page website that explains how the web works: your first portfolio piece. Each step below is one work session; commit after every step.',
    steps: [
      {
        title: 'Set up the repository',
        body: `Create a new public repository on GitHub called \`how-the-web-works\` with a README, then clone it. Set the repository description in the "About" panel right away.`,
        code: {
          lang: 'shell',
          src: `git clone https://github.com/<you>/how-the-web-works.git
cd how-the-web-works
mkdir css img
echo ".DS_Store" > .gitignore
git add . && git commit -m "Set up project structure"`,
        },
      },
      {
        title: 'Build the page skeleton',
        body: `Create \`index.html\`, \`dns.html\` and \`http.html\`. Every page shares the same structure: a header with a \`<nav>\`, a \`<main>\` with the content, and a footer. Don't forget the viewport meta tag so it works on phones.`,
        code: {
          lang: 'html',
          caption: 'index.html',
          src: `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>How the Web Works</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <header>
    <nav>
      <a href="index.html">Overview</a>
      <a href="dns.html">DNS</a>
      <a href="http.html">HTTP</a>
    </nav>
  </header>
  <main>
    <h1>What happens when you type a URL?</h1>
    <ol>
      <li>DNS turns the name into an IP address</li>
      <li>TCP and TLS open a secure connection</li>
      <li>The browser sends an HTTP request</li>
      <li>The server responds and the browser renders the page</li>
    </ol>
  </main>
  <footer>Made by you · 2026</footer>
</body>
</html>`,
        },
      },
      {
        title: 'Write the content',
        body: `Use what you learned in the four quests. On \`dns.html\` explain the lookup chain and record types. On \`http.html\` show a raw request and response, and a table of status codes (\`200\`, \`301\`, \`404\`, \`500\`…). Add at least one diagram image (draw one in Excalidraw or tldraw and export a PNG into \`img/\`) with a descriptive \`alt\` text.`,
        tryIt: 'Explain each topic as if to a friend who has never coded. If you can, you have truly learned it.',
      },
      {
        title: 'Style it and make it responsive',
        body: `Create \`css/style.css\`. Start with readable defaults, then add a media query so the nav stacks on small screens.`,
        code: {
          lang: 'css',
          caption: 'css/style.css',
          src: `body { font-family: system-ui, sans-serif; line-height: 1.6; margin: 0; }
main { max-width: 760px; margin: 0 auto; padding: 24px 16px; }
nav { display: flex; gap: 16px; padding: 16px; background: #1e293b; }
nav a { color: #fff; text-decoration: none; }
img { max-width: 100%; height: auto; }

@media (max-width: 600px) {
  nav { flex-direction: column; }
}`,
        },
      },
      {
        title: 'Deploy and polish the README',
        body: `In your repo go to Settings → Pages → "Deploy from a branch" → \`main\` / root. After a minute your site is live at \`https://<you>.github.io/how-the-web-works/\`. Paste that URL into the repo's "Website" field.

Finally, write a README with: what the project is, a screenshot (\`![Screenshot](img/screenshot.png)\`), what you learned, and how to run it locally. Then submit the repo below.`,
      },
    ],
    mistakes: [
      'Forgetting the viewport meta tag: the site looks tiny on phones.',
      'Linking files with absolute paths like `/css/style.css`: on GitHub Pages project sites, use relative paths.',
      'One giant commit at the end: commit after each step to show your progress.',
    ],
    recap: [
      'Three linked pages with semantic structure, a stylesheet and a diagram.',
      'Deployed on GitHub Pages with the live URL in the repo About panel.',
      'A portfolio-ready README with a screenshot.',
    ],
  },
};
