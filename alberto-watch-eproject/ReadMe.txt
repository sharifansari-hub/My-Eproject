ALBERTO WATCH COMPANY - eProject (HTML5 / CSS / Bootstrap / jQuery / JavaScript)
================================================================================

A single-page, responsive website for a watch repair, appraisal and retail store.

HOW TO RUN
----------
Option 1 (simplest): double-click index.html. It opens in your browser.
   - The product data is read from js/data-fallback.js in this case, because
     browsers block JSON files opened straight from disk.
   - The location feature (ticker + "nearest store") may not work from file://.

Option 2 (recommended for the demo video): serve the folder locally, so the
JSON data store and the location feature both work.
   - Python:   open a terminal in this folder and run   python -m http.server 8000
               then visit   http://localhost:8000
   - VS Code:  install the "Live Server" extension, right-click index.html,
               choose "Open with Live Server".

An internet connection is needed for Bootstrap, jQuery and the Google fonts
(all loaded from CDNs). Without internet the site still works, but with plain
styling. Allow location access when the browser asks, to see the location
in the ticker.

FOLDER STRUCTURE
----------------
index.html            The whole site (all pages are sections of this one file)
css/style.css         Custom styling on top of Bootstrap
js/app.js             All behaviour (jQuery): routing, rendering, ticker, forms
js/data-fallback.js   Copy of data/watches.json for opening from disk
data/watches.json     The data store: products, categories, stores, FAQs, etc.
images/               Logo, icons, and all product and gallery pictures (SVG)

REQUIREMENTS CHECKLIST
----------------------
Logo and colour scheme at the top ............ header, racing green and brass
Menu: Products, Technology, Store Locator,
  Support and more ........................... navigation bar
Sections for watches, clocks, technology ..... Products, Technology pages
Product line-ups (Vintage, Luxury, Smart
  Watches, Sport & Casual, Clocks) ........... Products page and Home tiles
Selecting a line-up lists its watches ........ filter buttons on Products page
Watch details in a popup window .............. Bootstrap modal
Price list for all watches ................... Price List page (search, filter, sort)
Gallery ...................................... Gallery page with enlarge (lightbox)
Site map, Gallery, About Us, Contact Us ...... menu and footer links
About Us and Contact Us show email, address
  and phone .................................. About Us and Contact Us pages
Scrolling ticker with date, time, location ... bottom of every page (HTML5 Geolocation)
Visitor count at top right beside a logo
  image ...................................... header (eye icon + count)
Menu colour changes on hover and after click . CSS hover and .active styles
Fade in / fade out for menu pages ............ jQuery fadeOut / fadeIn
Single-Page Application ...................... pages switch without reloading
Responsive ................................... Bootstrap grid, tested at phone width
Works in Chrome, Edge, Firefox, Safari ....... standard HTML5/CSS3/ES5 only
Add to cart ................................... button on every product card and
                                                 in the details popup; cart panel
                                                 (top right) with quantity, remove
                                                 and a subtotal
Sign in ........................................ "Sign in" button opens a sign in /
                                                 create account popup; checkout
                                                 asks you to sign in first
Add to cart confirmation ....................... a notice slides down from the
                                                 top of the page each time a
                                                 watch is added, with a "View
                                                 cart" shortcut

ASSUMPTIONS
-----------
1. All product names, prices, store addresses, phone numbers and the email
   address are sample data written for this project, not real listings.
2. The images are drawings (SVG) made for this project, not photographs, so
   no brand pictures are used.
3. The visitor count starts from a base number in data/watches.json and adds
   one for each new browser session on the same browser. A real site-wide
   counter needs a server, which the brief does not include.
4. The support and contact forms check the input and store the message in the
   browser's localStorage. They do not send email, because there is no server.
4b. Sign in / create account and the shopping cart work the same way: accounts
   and cart items are checked and stored in the browser (localStorage /
   sessionStorage), since there is no server or payment gateway. Checkout
   clears the cart and shows a confirmation message; no real order is placed.
5. The place name in the ticker comes from OpenStreetMap's free lookup. If it
   is not reachable, the ticker shows the coordinates instead.
6. Prices are in US dollars.
