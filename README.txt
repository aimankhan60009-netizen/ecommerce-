=====================================================
  EXCLUSIVE - Full E-Commerce Website (Design Clone)
  Homepage + 10 Inner Pages | HTML + CSS + JavaScript
=====================================================

Ye aapke design ka same-to-same HTML/CSS/JS clone hai —
ab POORI WEBSITE working functionality ke saath!

-----------------------------------------------------
PAGES (11 total)
-----------------------------------------------------
  index.html           -> Home page (hero, flash sales, categories...)
  products.html        -> Shop — ALL products + FILTERS (category,
                          price, sort, search) + Add To Cart
  product-details.html -> Product detail (gallery, colours, size,
                          quantity, Buy Now, related items)
                          Link: product-details.html?id=1
  cart.html            -> Cart — quantity +/-, remove, coupon,
                          cart total (subtotal/shipping/total)
  checkout.html        -> Billing details form, order summary,
                          Bank / Cash on delivery, Place Order
                          -> order success screen + order saved
  wishlist.html        -> Wishlist (count), Move All To Bag,
                          remove item, Just For You section
  account.html         -> My Account — Edit profile (save/cancel),
                          password change, My Orders list
                          (login zaroori hai, warna login par jayega)
  login.html           -> Log in (underline inputs, forget password)
  signup.html          -> Create account + Sign up with Google button
  about.html           -> Our Story, stats cards, team slider (dots)
  contact.html         -> Call To Us / Write To US + Send Massage form

-----------------------------------------------------
KAISE CHALAYEIN (How to run)
-----------------------------------------------------
1. Is folder ko kahin bhi extract kar lo
2. "index.html" par double-click karo
3. Internet sirf fonts (Google Fonts) ke liye chahiye,
   baaki sab offline chalega

-----------------------------------------------------
WORKING FEATURES (sab functional!)
-----------------------------------------------------
+ Add To Cart — kisi bhi product card se (badge count update hota hai)
+ Cart — quantity up/down, remove (X), coupon code:
      SAVE10  = 10% off
      EXCLUSIVE5 = 5% off
+ Checkout — form validation, billing info save (next time auto-fill),
      Bank / Cash on delivery radio, Place Order -> success + My Orders
+ Wishlist — heart icon se add/remove, Move All To Bag
+ Login / Sign Up — localStorage auth (demo login:
      demo@exclusive.com / 123456)
+ Account — profile edit save, password change, order history
+ Search — header search se products.html par results
+ Filters — category chips, price chips, sort dropdown, clear all
+ Quick view (eye icon) -> product details page
+ Header badges — wishlist/cart count har page par live update
+ Homepage: countdown timers, hero slider, flash carousel,
  scroll-to-top (pehle jaisa hi)

Note: Data browser ke localStorage me save hota hai.
Demo user: login page par hint diya hua hai.

-----------------------------------------------------
IMAGES KAISE CHANGE KAREIN (Important!)
-----------------------------------------------------
Saari images "images" folder me hain — apni image same
naam se replace kar do, code me kuch nahi badalna:

  hero-iphone.jpg        -> Hero banner
  gamepad-red.jpg        -> HAVIT Gamepad
  keyboard.jpg           -> AK-900 Keyboard
  monitor.jpg            -> Gaming Monitor
  chair.jpg              -> Comfort Chair
  laptop.jpg             -> ASUS Laptop
  curology.jpg           -> Curology Set
  toy-car.jpg            -> Kids Electric Car
  cleats.jpg             -> Soccer Cleats
  gamepad-black.jpg      -> GP11 Gamepad
  jacket.jpg             -> Quilted Satin Jacket
  gucci-bag.jpg          -> Gucci Duffle Bag
  cooler.jpg             -> RGB CPU Cooler
  camera.jpg             -> Polaroid Camera
  speaker-jbl.jpg        -> JBL Speaker / music banner
  coat.jpg               -> Long Winter Coat
  bookshelf.jpg          -> Bookshelf
  dog-food.jpg           -> Dog Food
  hero-iphone.jpg        -> iPhone 14 (phone product)
  speakers-echo.jpg      -> Echo Dot speaker
  womens-collection.jpg  -> Women's Collection set
  ps5.jpg                -> PS5 Console
  jacket-green.jpg       -> Bomber Jacket
  detail-1..4.jpg        -> Product page gallery (gamepad views)
  auth-side.jpg          -> Login / Sign Up side image
  about-story.jpg        -> About "Our Story" image
  team-1..6.jpg          -> About team members
  qr-code.png            -> Footer QR code
  google-play.svg        -> Google Play badge
  app-store.svg          -> App Store badge

-----------------------------------------------------
FILE STRUCTURE
-----------------------------------------------------
  index.html + 10 inner pages
  css/style.css   -> homepage + shared design
  css/pages.css   -> inner pages ke styles
  js/data.js      -> PRODUCTS database (22 products — naam,
                     price, rating, category yahan badlo)
  js/main.js      -> shared: cart/wishlist/auth state, badges,
                     toasts, product cards
  js/pages.js     -> har page ka apna logic
  js/script.js    -> homepage sliders/countdown
  images/         -> saari images (replaceable)

-----------------------------------------------------
COLORS / FONTS (change karne ke liye)
-----------------------------------------------------
style.css ke :root block me:
  --red:  #DB4444   (main red)
  --green:#00FF66   (new badge)
  --star: #FFAD33   (rating stars)
Fonts: Poppins + Inter (Google Fonts)
