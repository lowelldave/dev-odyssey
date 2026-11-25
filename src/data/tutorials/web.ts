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
      q('What is the relationship between the internet and the web?', ['They are two names for the same thing', 'The web is the network; the internet is one service that runs on top of it', 'The internet is the network; the web is a service that runs on top of it', 'The web only works offline'], 2, 'The internet is the global network of networks. The web (pages and apps fetched over HTTP) is just one of many services built on it, alongside email and others.', 'Ask yourself which one is the plumbing and which one flows through it.'),
      q('Which protocol re-sends lost packets and reassembles them in order?', ['TCP', 'HTML', 'DNS', 'IP'], 0, 'TCP provides reliable, ordered delivery; IP only addresses and routes individual packets.', 'One protocol guarantees delivery; the other just handles addressing.'),
      q('In `https://shop.example.com/products/42?color=red`, what is `/products/42`?', ['The host', 'The port', 'The query string', 'The path'], 3, 'The path identifies the resource on the host. The query string starts at the `?`.', 'Look at what sits between the host and the question mark.'),
      q('Which port does HTTPS use by default?', ['21', '443', '80', '5173'], 1, 'HTTPS defaults to 443; plain HTTP uses 80. 5173 is just the Vite dev server default.', 'It is the secure sibling of the port used by plain HTTP.'),
      q('What does `localhost` refer to?', ['The nearest server in your city', 'Your own machine', 'Your router', 'Google'], 1, '`localhost` resolves to the loopback address 127.0.0.1, which always points back at the computer you are on.', 'The name describes where the traffic goes, and it never leaves the device.'),
      q('What is an IP address used for?', ['Compressing page content so that it downloads much faster for visitors', 'Giving a website a memorable name that people type', 'Storing a user’s login state between visits', 'Identifying a device on a network so packets can be routed to it'], 3, 'Routers read the destination IP on each packet to forward it hop by hop. Human-friendly names are DNS’s job.', 'Think of it as the postal address on every packet.'),
      q('What does a port number identify?', ['Which service on a machine should receive the traffic', 'The version of HTTP the client and server agreed on', 'The geographic country in which the server is located', 'The maximum size that a single request may have'], 0, 'One machine can run many services (web on 443, a database on 5432). The port tells the OS which one the packet is for.', 'A single machine can host many services at once; something has to tell them apart.'),
      q('Why is data split into packets?', ['Browsers cannot display files larger than a few kilobytes at a time', 'It encrypts each chunk separately before it is sent', 'Packets can take different routes and only lost pieces need re-sending', 'DNS requires every message to fit one record'], 2, 'Small independent chunks let the network route around problems and let TCP retransmit just the missing pieces.', 'Think about what happens if one big message gets damaged halfway.'),
      q('In the client–server model, who usually starts the conversation?', ['The server', 'The router', 'The DNS resolver', 'The client'], 3, 'The client (such as a browser) sends a request and the server answers it.', 'Servers wait; someone has to knock first.'),
      q('What does `ping example.com` mainly tell you?', ['How quickly the page renders after it has downloaded', 'Whether the host is reachable and the round-trip time', 'Which DNS records exist for the domain you queried', 'Which cookies the website tries to set on your browser'], 1, 'Ping sends small ICMP echo requests and reports whether replies come back and how long the round trip takes.', 'Each reply line shows a time in milliseconds.'),
      q('Which tool lists the routers (hops) your packets pass through on the way to a host?', ['ping -t with a very long timeout set', 'ls', 'traceroute (tracert on Windows)', 'git log'], 2, 'traceroute/tracert shows each hop along the path. ping only reports the total round trip.', 'The name of the tool hints at following a route.'),
      q('Why was IPv6 introduced?', ['IPv4 addresses are running out; IPv6 has a much larger address space', 'To replace TCP with a faster, connectionless protocol', 'To make HTTP responses arrive much faster on mobile networks', 'To encrypt all traffic without needing certificates'], 0, 'IPv4 has about 4.3 billion addresses; IPv6 uses 128-bit addresses, giving a practically unlimited supply.', 'It is about how many devices can have an address.'),
      q('Which of these uses the internet but is not the web?', ['Sending an email over SMTP', 'Opening a link in a browser', 'Loading a page over HTTPS', 'Visiting a URL'], 0, 'Email protocols (SMTP, IMAP) run directly on the internet without HTTP or web pages.', 'Which activity does not involve HTTP at all?'),
      q('In `https://shop.example.com/products/42?color=red`, what is `color=red`?', ['The scheme', 'The fragment', 'The query string', 'A path segment sent'], 2, 'The query string follows `?` and carries key=value parameters to the server.', 'Look for the character that starts it.'),
      q('In `http://localhost:5173/about#team`, what is `#team`?', ['The query string that is sent to the server with every request', 'A fragment that points inside the page and is not sent to the server', 'A port number on which the page is being served', 'A path segment that the server receives and routes'], 1, 'The fragment is handled by the browser (scroll position or client-side routing) and is not included in the HTTP request.', 'This part never travels across the network.'),
      q('In `http://localhost:5173`, what is `5173`?', ['The IP address', 'The HTTP version', 'The maximum users on the server', 'The port the dev server listens on'], 3, 'After the colon comes the port number. Vite’s dev server defaults to 5173.', 'It follows the host and a colon.'),
      q('What is network latency?', ['The size of a file', 'The amount of data that is transferred every second over time', 'The delay before data starts arriving after a request', 'The number of connected users'], 2, 'Latency is delay (usually measured in ms). Bandwidth is how much data can flow per second.', 'It is measured in milliseconds, not megabits.'),
      q('What does bandwidth describe?', ['How much data a connection can carry per unit of time', 'How long a single packet takes to arrive end to end on the wire', 'How many hops a path has', 'How many DNS records a domain has'], 0, 'Bandwidth is capacity (e.g. 100 Mbps). A high-bandwidth link can still have high latency.', 'Imagine the width of a pipe rather than its length.'),
      q('What does a router do?', ['Stores website files and serves them to browsers', 'Translates domain names into IP addresses for all clients', 'Renders HTML pages on behalf of the browser', 'Forwards packets toward their destination based on the address'], 3, 'Routers look at each packet’s destination IP and pass it to the next hop closer to the target.', 'Packets get from network to network by passing through these.'),
      q('Where does HTTP sit in the network stack?', ['It replaces IP by handling addressing and routing every packet itself, below TCP', 'It is an application-layer protocol that runs on top of transport protocols like TCP', 'It sits below IP as a physical cable standard', 'It only works on port 53 alongside DNS traffic'], 1, 'HTTP defines how requests and responses look; transport (TCP, or QUIC for HTTP/3) and IP carry them.', 'HTTP describes messages, not how bytes are delivered.'),
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
      q('Which status code means "Not Found"?', ['200', '404', '301', '500'], 1, '404 means the server could not find the requested resource. 200 is OK, 301 is a redirect and 500 is a server error.', 'This one belongs to the family of client errors.'),
      q('Which method is meant for reading data without side effects?', ['POST', 'PATCH', 'DELETE', 'GET'], 3, 'GET is defined as safe: it should only retrieve data and never change state.', 'Think about which method a link click or page load uses.'),
      q('A form submission that creates a new order should usually use…', ['POST', 'HEAD', 'GET', 'OPTIONS'], 0, 'POST sends data to create a new resource. GET must not change server state.', 'The method should signal that something will change on the server.'),
      q('A server responds `503`. Whose problem is it?', ['The client sent a malformed request', 'The resource moved', 'The server is unavailable or overloaded', 'Everything is fine'], 2, '5xx codes are server-side. 503 Service Unavailable usually means overload or maintenance.', 'Look at the first digit of the code.'),
      q('What does it mean that HTTP is stateless?', ['It cannot carry any data in the body of a request, only in the URL', 'It never sends any headers with a request', 'It only works when the connection uses HTTPS', 'Each request is independent unless cookies or tokens add state'], 3, 'The server does not remember earlier requests by itself. Cookies, sessions and tokens are layered on top to add memory.', 'How does the server know that two requests came from the same person?'),
      q('Which status code means a new resource was successfully created?', ['200', '201', '204', '302'], 1, '201 Created is the conventional answer to a successful POST that creates something.', 'It is in the success family but more specific than plain OK.'),
      q('Which header tells the receiver the format of the body being sent?', ['Accept', 'Host', 'Content-Type', 'Cache-Control'], 2, '`Content-Type: application/json` says what the body is. `Accept` is what the client wants back.', 'It describes the thing the message is carrying.'),
      q('Which request header states which response formats the client prefers?', ['Accept', 'Content-Type', 'Authorization', 'User-Agent'], 0, '`Accept: application/json` tells the server what representation the client would like.', 'It is about what the client is willing to receive.'),
      q('A response has status `301` and a `Location` header. What should a browser do?', ['Follow the Location because the resource moved permanently', 'Show an error page because the URL is no longer valid for the site', 'Retry the same URL forever until it works again', 'Ask the user to log in before continuing'], 0, '301 is a permanent redirect; clients (and search engines) update to the new URL given in Location.', 'The 3xx family is about sending you somewhere else.'),
      q('A request needs a login and none was supplied. Which status fits best?', ['400', '404', '401', '500'], 2, '401 means the request lacks valid authentication. 403 is for authenticated users who are not allowed.', 'Authentication, not permission, is missing.'),
      q('What is the key difference between PUT and PATCH?', ['PUT only reads data while PATCH only writes data', 'PUT replaces the whole resource; PATCH changes only some fields', 'PATCH is always faster than PUT, whatever the size of the resource', 'PUT and PATCH behave in exactly the same way'], 1, 'PUT sends a full replacement representation; PATCH sends a partial update.', 'One is about replacing, the other about adjusting.'),
      q('Which method fetches only the response headers, not the body?', ['CONNECT', 'TRACE', 'PUT', 'HEAD'], 3, 'HEAD behaves like GET but the server omits the body, which is handy for checking size or freshness.', 'Its name refers to the top of a message.'),
      q('Why must login credentials travel over HTTPS rather than HTTP?', ['HTTPS is faster', 'HTTP cannot send POST requests', 'Plain HTTP can be read by anyone on the network path', 'HTTPS removes any need for passwords at all in login forms'], 2, 'HTTP is unencrypted, so passwords could be sniffed in transit. TLS encrypts the traffic.', 'Consider who could be listening between you and the server.'),
      q('What does a TLS certificate let a browser verify?', ['That the server really belongs to the domain it claims', 'That the page contains no bugs or broken links on any route', 'That the site loads quickly for visitors', 'That the visitor is currently logged in'], 0, 'A certificate issued by a trusted authority binds a public key to a domain name, enabling authenticated, encrypted connections.', 'It is about the identity of the server.'),
      q('What does the `Set-Cookie` response header do?', ['Deletes the browser’s cached copy of every page it has stored for the site', 'Redirects the request to a different address', 'Changes the HTTP method of the next request', 'Asks the browser to store a cookie and send it back on later requests'], 3, 'Cookies are how stateless HTTP gets memory: the server sets one and the browser returns it automatically.', 'It is how the server asks the browser to remember something.'),
      q('In the request line `POST /api/orders HTTP/1.1`, what is `/api/orders`?', ['The method', 'The target path', 'The status code', 'The HTTP version'], 1, 'The request line is METHOD, target, version. The target says which resource the request is about.', 'The line has three parts in a fixed order.'),
      q('What is the `Authorization` header typically used for?', ['Choosing the language in which the server should write its response', 'Carrying credentials or a token that identifies the caller', 'Naming the server that handled the request', 'Setting the maximum size of the request body'], 1, 'For example `Authorization: Bearer <token>` is how many APIs identify the caller.', 'It answers the question “who is asking?”.'),
      q('Which header lets a browser reuse a response for an hour without asking again?', ['Host: 3600', 'Content-Length: 3600', 'Accept-Encoding: gzip, br, 3600', 'Cache-Control: max-age=3600'], 3, '`Cache-Control: max-age=3600` marks the response as fresh for 3600 seconds.', 'Look for the header whose job is caching.'),
      q('What does status `429` mean?', ['The client has sent too many requests and is being rate limited', 'The gateway timed out', 'The resource has been permanently removed from the server for good', 'The server crashed'], 0, '429 Too Many Requests tells the client to slow down; often paired with a Retry-After header.', 'Think about what happens when you hammer an API.'),
      q('How do HTTP/2 and HTTP/3 differ from HTTP/1.1 for developers?', ['Different HTTP methods and entirely new status codes for everything', 'They only work for video', 'Same semantics, but requests are multiplexed more efficiently', 'They remove headers'], 2, 'Methods, headers and status codes stay the same; the newer versions change how data is framed and sent on the wire.', 'Your application code mostly does not change.'),
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
      q('What does DNS primarily do?', ['Encrypts traffic between a browser and a server', 'Compresses images before they are sent to users', 'Hosts the website files for a domain', 'Translates domain names into IP addresses'], 3, 'DNS maps human-friendly names like example.com to the IP addresses machines use.', 'Think of looking up a contact in a phone book.'),
      q('Which record maps a name to an IPv4 address?', ['MX', 'A', 'CNAME', 'TXT'], 1, 'An A record holds an IPv4 address; AAAA holds IPv6.', 'It is the first letter of the alphabet.'),
      q('A CNAME record is…', ['A mail server that accepts email for the domain', 'An IPv6 address for the domain', 'An alias pointing one name to another name', 'A TLS certificate for the domain'], 2, 'A CNAME makes one name an alias of another, for example www pointing to the apex or to a hosting provider hostname.', 'The C stands for something like a nickname.'),
      q('Which server holds the definitive records for `example.com`?', ['The authoritative name server for example.com', 'The .com TLD server that lists all .com domains', 'The root server at the top of the DNS hierarchy', 'Your own browser’s local cache of lookups'], 0, 'Root and TLD servers only point onward. The authoritative server for the domain holds the real records.', 'It has the final say on that domain.'),
      q('You changed a DNS record but still see the old site. Most likely cause?', ['Resolvers are serving the cached answer until its TTL expires', 'DNS is broken and needs to be restarted', 'You need to register a completely new domain', 'HTTPS is blocking the updated records from loading in your browser'], 0, 'DNS answers are cached for the record’s TTL, so changes take time to be seen everywhere.', 'Something is remembering the old answer for a while.'),
      q('What is the order of a full lookup for `www.example.com` when nothing is cached?', ['Browser → authoritative → root → TLD → resolver', 'Authoritative → root → TLD', 'Resolver → root → TLD (.com) → authoritative', 'TLD → resolver → root'], 2, 'The resolver asks the root which servers handle .com, asks the TLD server who is authoritative for example.com, then asks that server.', 'Work from the most general part of the name to the most specific.'),
      q('Which record type routes email for a domain?', ['A', 'MX', 'AAAA', 'NS'], 1, 'MX (mail exchanger) records list the mail servers that accept email for the domain.', 'The letters stand for mail.'),
      q('Which record type maps a name to an IPv6 address?', ['A', 'MX', 'CNAME', 'AAAA'], 3, 'AAAA (“quad A”) is the IPv6 counterpart of the A record.', 'IPv6 addresses are four times as long as IPv4 ones.'),
      q('A TXT record is commonly used for…', ['Pointing a domain to an IPv4 address', 'Hosting plain text files for the website’s visitors to download', 'Proving domain ownership and email policies such as SPF', 'Redirecting browsers to another URL'], 2, 'TXT holds arbitrary text, which services use for ownership checks and email authentication (SPF, DKIM, DMARC).', 'It stores plain text rather than an address.'),
      q('What is a subdomain?', ['A name below a domain, such as `blog` in `blog.example.com`', 'A cheaper version of a domain that you can buy for yourself, as an add-on', 'A backup DNS server for the domain', 'A cache that stores recent lookups'], 0, 'You can create as many subdomains as you like under a domain you control, each with its own records.', 'It appears to the left of the main domain name.'),
      q('In `www.example.com`, which label is the top-level domain?', ['example.com', 'www', 'example', 'com'], 3, 'Reading right to left: com is the TLD, example the second-level domain and www a subdomain.', 'Read the name from the right.'),
      q('What does a domain registrar do?', ['Hosts your website files', 'Sells and registers domain names for you', 'Encrypts DNS traffic', 'Assigns IP addresses to the routers in a network'], 1, 'Registrars (Namecheap, Cloudflare Registrar…) record your ownership of a domain and let you set its name servers.', 'You rent the name from one of these.'),
      q('Which command looks up DNS records from a terminal?', ['chmod', 'nslookup or dig', 'traceroute -p', 'ipconfig /release'], 1, '`nslookup example.com` or `dig example.com` query DNS and print the answers.', 'The tool’s name hints at looking something up.'),
      q('Why lower a record’s TTL before moving a site to a new server?', ['To avoid needing to create a CNAME record afterwards for the new host', 'To make the site load faster for visitors', 'To enable HTTPS on the new server', 'So caches expire sooner and the switch takes effect quickly'], 3, 'A short TTL means resolvers re-ask more often, so the new IP is picked up quickly after the change.', 'Think about how long the old answer can linger.'),
      q('What does the `hosts` file on your computer do?', ['Maps names to IPs locally, before DNS is asked', 'Lists the registrars that sold you the domain name', 'Stores the cookies of every site you visit', 'Hosts websites for your local network'], 0, 'Entries in the hosts file override DNS on that machine, which is handy for local testing.', 'It is a local override.'),
      q('What is a recursive DNS resolver?', ['A store holding TLS certificates for websites', 'The authoritative server that owns every record for the .com domain', 'A server that looks names up on your behalf and caches the answers', 'A browser extension that blocks trackers'], 2, 'Your ISP or a public service (like 1.1.1.1 or 8.8.8.8) walks the DNS hierarchy for you and caches results.', 'It does the legwork so your device does not have to.'),
      q('Why might one domain return several A records?', ['It is always a mistake in the configuration of the zone', 'To lengthen the TTL of the cached answers', 'To make the DNS responses encrypted', 'To spread traffic across servers or add redundancy'], 3, 'Multiple A records let clients pick among several servers (round-robin) and survive the loss of one.', 'More than one address means more than one place to go.'),
      q('Which port does DNS use by default?', ['22', '53', '443', '3306'], 1, 'DNS queries go to port 53 (UDP, with TCP as fallback).', 'It is a two-digit port number in the 50s.'),
      q('What does an NS record specify?', ['The mail server that handles all email for the domain', 'An IPv4 address for the website', 'Which name servers are authoritative for the domain', 'A text note for domain verification'], 2, 'NS records delegate a domain to its authoritative name servers.', 'It is how the hierarchy knows where to send you next.'),
      q('What happens if DNS lookup for a domain fails?', ['The browser cannot find an IP, so no HTTP request is ever sent', 'The server returns 404', 'The page loads from the local cache with no error, as if nothing had happened', 'The server returns 500'], 0, 'HTTP status codes only exist once a connection is made. A failed lookup shows a “server not found” style browser error instead.', 'Which step comes before any HTTP conversation can start?'),
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
      q('What does the browser build from HTML?', ['The DOM', 'The CSSOM', 'A JSON file', 'A bitmap'], 0, 'The HTML parser turns markup into the Document Object Model, a tree of nodes. CSS becomes the CSSOM.', 'The name has “document” in it.'),
      q('Which script attribute downloads in parallel and runs after parsing, in order?', ['async', 'blocking', 'defer', 'lazy'], 2, '`defer` scripts download without blocking and run in document order once HTML parsing is done. `async` runs as soon as downloaded.', 'It postpones execution until the document is parsed.'),
      q('Which property is usually cheapest to animate?', ['width', 'transform', 'top', 'box-shadow'], 1, '`transform` and `opacity` can be handled by the compositor without re-running layout.', 'Pick the one that does not change surrounding boxes.'),
      q('What is the correct rendering pipeline order?', ['Paint → Layout → Style', 'Layout → Style → Composite → Paint', 'Composite → Paint → Layout', 'Style → Layout → Paint → Composite'], 3, 'The browser computes styles, lays out boxes, paints them into layers, then composites the layers.', 'Work out what must be known before you can draw.'),
      q('Why does a plain `<script>` in the `<head>` slow the first render?', ['It is downloaded twice by the browser', 'It disables CSS until it has finished', 'It pauses HTML parsing until it downloads and runs', 'Browsers ignore scripts that are placed in the head element'], 2, 'A synchronous script blocks the parser because it might change the document. `defer` or `async` avoids this.', 'Parsing has to wait for something.'),
      q('What does the browser build from CSS?', ['The CSSOM', 'The DOM', 'The call stack', 'A sprite sheet'], 0, 'CSS is parsed into the CSS Object Model, which is combined with the DOM to work out each element’s styles.', 'It mirrors the structure that HTML produces.'),
      q('What is the render tree?', ['A folder of images used by the page', 'A list of every network request that the page made while it was loading from the server', 'The call stack of the running JavaScript', 'The DOM combined with the CSSOM, containing the visible nodes and their styles'], 3, 'Only elements that will be displayed (for example not `display: none`) make it into the render tree used for layout.', 'It merges structure with styling.'),
      q('Which change forces the browser to recalculate layout?', ['Changing a `cursor` style', 'Changing an element’s `width`', 'Changing `color`', 'Changing `opacity`'], 1, 'Geometry changes affect other boxes, so layout (reflow) must run again. Colour and opacity changes skip layout.', 'Which property changes the size of the box?'),
      q('Two scripts both use `async`. Which statement is true?', ['They always run in document order', 'They run in whichever order they finish downloading', 'They run only after the page is fully loaded and idle', 'Only the first one runs'], 1, 'Async scripts execute as soon as they arrive, so order is not guaranteed. Use `defer` when order matters.', 'Think about which script finishes downloading first.'),
      q('What is the “critical rendering path”?', ['A CSS property that controls rendering order', 'A caching header for assets that never change', 'The network path that packets take from the browser to the server and back', 'The steps the browser takes from receiving HTML, CSS and JS to painting pixels'], 3, 'Optimising it means getting the first meaningful paint on screen sooner, for example by trimming blocking resources.', 'It is the route from bytes to pixels.'),
      q('Why can a large stylesheet in the `<head>` delay the first paint?', ['CSS is render-blocking: the browser waits for it to avoid showing unstyled content', 'The stylesheet is downloaded twice, which doubles the delay before the first paint', 'CSS blocks DNS lookups until it has loaded', 'It does not delay the first paint at all'], 0, 'The browser will not paint until it knows the styles, so big or slow CSS postpones the first render.', 'The browser avoids a flash of unstyled content.'),
      q('What does the composite step do?', ['Compresses the images used on the page', 'Joins several separate HTML files into a single page for the browser', 'Combines painted layers into the final image shown on screen', 'Merges Git branches on the server'], 2, 'Layers are painted separately and then composited, often by the GPU, which is why transforms are cheap.', 'The name says it assembles pieces.'),
      q('Which DevTools panel shows each request with its status and timing?', ['Elements', 'Application', 'Sources', 'Network'], 3, 'The Network panel lists every request, with headers, size and a waterfall of timings.', 'Think about what travels over the wire.'),
      q('Which DevTools panel lets you inspect and edit the live DOM and CSS?', ['Network', 'Elements', 'Console', 'Performance'], 1, 'The Elements panel shows the current DOM tree and the computed and applied styles.', 'It is named after the things in the tree.'),
      q('Is the DOM identical to the HTML file the server sent?', ['Yes, the two are always byte for byte identical, because the browser copies the file', 'Only for XML documents, not HTML', 'No, it is the live parsed tree that JavaScript and the parser can change', 'Yes, but it is stored on the server'], 2, 'The parser fixes invalid markup and scripts add or remove nodes, so “View Source” and the Elements panel can differ.', 'One is a file; the other is a living structure in memory.'),
      q('What runs on a tab’s main thread?', ['JavaScript plus much of style, layout and paint work, so long tasks freeze the page', 'Only network requests and downloads', 'Only GPU work, such as decoding the video frames that appear inside the tab itself too', 'DNS resolution and TLS handshakes'], 0, 'Because JS and rendering share the main thread, a long-running script makes the page unresponsive.', 'Think about why a heavy script can make clicks feel ignored.'),
      q('What does `loading="lazy"` on an `<img>` do?', ['Defers loading until the image is near the viewport', 'Compresses the image', 'Blocks all rendering until the image has finished loading', 'Preloads every image first'], 0, 'Lazy images are fetched only when the user scrolls close, saving bandwidth on initial load.', 'The word describes when it loads.'),
      q('Which browser and engine pairing is correct?', ['Chrome: Gecko, Firefox: Blink, Safari: WebKit', 'Chrome: WebKit, Firefox: Blink, Safari: Gecko', 'Chrome: Blink, Firefox: Gecko, Safari: WebKit', 'Chrome: Gecko, Firefox: WebKit, Safari: Blink'], 2, 'Chrome and Edge use Blink, Firefox uses Gecko and Safari uses WebKit.', 'Each major browser family has its own engine.'),
      q('What lets a browser avoid re-downloading unchanged files on a repeat visit?', ['The DOM', 'The HTTP cache', 'The call stack', 'The CSSOM'], 1, 'Cache headers let the browser reuse stored copies of assets instead of fetching them again.', 'Files can be stored locally between visits.'),
      q('What does the paint step do?', ['Re-downloads the page from the server', 'Parses JavaScript into an abstract syntax tree for the engine', 'Resolves DNS names for the page’s resources', 'Draws pixels for text, colours, borders and images'], 3, 'Paint turns the laid-out boxes into actual pixels, before layers are composited.', 'This is where visual appearance is actually drawn.'),
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
