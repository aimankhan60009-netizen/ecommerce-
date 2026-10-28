/* ============================================================
   Exclusive — Product Database (data.js)
   Saray pages isi data se products render karte hain.
   Images placeholders hain — user baad me replace karega.
   ============================================================ */

const PRODUCTS = [
  { id: 1,  name: "HAVIT HV-G92 Gamepad",    price: 120,  old: 160,  discount: "-40%", rating: 5,   count: 88,  img: "images/gamepad-red.jpg",   cat: "Gaming",
    swatches: ["#DB4444", "#404040"],
    desc: "PlayStation 5 Controller Skin High quality vinyl with air channel adhesive for easy bubble free install & mess free removal Pressure sensitive.",
    gallery: ["images/detail-2.jpg", "images/detail-3.jpg", "images/detail-1.jpg", "images/detail-4.jpg"] },
  { id: 2,  name: "AK-900 Wired Keyboard",    price: 960,  old: 1160, discount: "-35%", rating: 4.5, count: 75,  img: "images/keyboard.jpg",      cat: "Gaming",
    swatches: ["#404040", "#DB4444"],
    desc: "Mechanical wired keyboard with RGB per-key lighting, aluminum top plate and hot-swappable switches for gaming and typing." },
  { id: 3,  name: "IPS LCD Gaming Monitor",   price: 370,  old: 400,  discount: "-30%", rating: 5,   count: 99,  img: "images/monitor.jpg",       cat: "Electronics",
    swatches: ["#000000", "#404040"],
    desc: "27-inch curved IPS LCD gaming monitor with ultra-wide 165Hz refresh rate, 1ms response time and HDR600 for vivid colors." },
  { id: 4,  name: "S-Series Comfort Chair",   price: 375,  old: 400,  discount: "-25%", rating: 4.5, count: 99,  img: "images/chair.jpg",         cat: "Home & Living",
    swatches: ["#C4C4C4", "#404040"],
    desc: "Ergonomic comfort chair with adjustable lumbar support, breathable mesh back and 4D armrests for long working hours." },
  { id: 5,  name: "ASUS FHD Gaming Laptop",   price: 700,  old: null, discount: null,   rating: 5,   count: 325, img: "images/laptop.jpg",        cat: "Electronics",
    swatches: ["#404040", "#000000"],
    desc: "15.6-inch full HD gaming laptop with RTX graphics, 144Hz panel, 16GB RAM and quad-core processor for high performance." },
  { id: 6,  name: "Curology Product Set",     price: 500,  old: null, discount: null,   rating: 4,   count: 145, img: "images/curology.jpg",      cat: "Beauty & Health",
    swatches: ["#E8D5C4", "#DB4444"],
    desc: "Custom skincare set with cleanser, moisturizer and targeted treatment formulas designed for your unique skin needs." },
  { id: 7,  name: "Kids Electric Car",        price: 960,  old: null, discount: null,   rating: 5,   count: 65,  img: "images/toy-car.jpg",       cat: "Kids & Toys", badge: "NEW",
    swatches: ["#DB4444", "#DB4444"],
    desc: "12V ride-on electric car for kids with parental remote control, LED lights, music player and realistic engine sounds." },
  { id: 8,  name: "Jr. Zoom Soccer Cleats",   price: 1160, old: null, discount: null,   rating: 5,   count: 35,  img: "images/cleats.jpg",        cat: "Sports & Outdoor",
    swatches: ["#D6F326", "#DB4444"],
    desc: "Junior soccer cleats with lightweight synthetic upper, firm-ground studs and cushioned insole for young athletes." },
  { id: 9,  name: "GP11 Shooter USB Gamepad", price: 660,  old: null, discount: null,   rating: 4.5, count: 55,  img: "images/gamepad-black.jpg", cat: "Gaming", badge: "NEW",
    swatches: ["#000000", "#DB4444"],
    desc: "USB gamepad with dual vibration motors, textured grip, turbo trigger buttons and plug-and-play compatibility." },
  { id: 10, name: "Quilted Satin Jacket",     price: 660,  old: null, discount: null,   rating: 4.5, count: 55,  img: "images/jacket.jpg",        cat: "Fashion",
    swatches: ["#184A48", "#DB4444"],
    desc: "Quilted satin bomber jacket with ribbed collar, front zip pockets and smooth satin lining for everyday style." },
  { id: 11, name: "Gucci Duffle Bag",         price: 960,  old: 1160, discount: "-35%", rating: 4.5, count: 65,  img: "images/gucci-bag.jpg",     cat: "Fashion",
    swatches: ["#8B6F47", "#000000"],
    desc: "Designer duffle bag with signature monogram canvas, leather trim and spacious interior for weekend travel." },
  { id: 12, name: "RGB Liquid CPU Cooler",    price: 1960, old: null, discount: null,   rating: 4,   count: 50,  img: "images/cooler.jpg",        cat: "Gaming",
    swatches: ["#404040", "#DB4444"],
    desc: "240mm AIO liquid CPU cooler with dual ARGB fans, copper cold plate and silent pump for extreme cooling." },
  { id: 13, name: "The Polaroid Camera Kit",  price: 360,  old: 420,  discount: "-15%", rating: 4.5, count: 120, img: "images/camera.jpg",        cat: "Electronics",
    swatches: ["#404040", "#C4C4C4"],
    desc: "Instant camera kit with 20 film sheets, wrist strap and close-up lens for capturing memories on the spot." },
  { id: 14, name: "JBL Flip 6 Speaker",       price: 130,  old: 160,  discount: "-20%", rating: 5,   count: 210, img: "images/speaker-jbl.jpg",   cat: "Electronics",
    swatches: ["#000000", "#2E6BE6"],
    desc: "Portable bluetooth speaker with bold JBL sound, 12 hours of playtime and IP67 waterproof rating." },
  { id: 15, name: "Long Winter Coat",         price: 550,  old: 700,  discount: "-22%", rating: 4.5, count: 80,  img: "images/coat.jpg",          cat: "Fashion",
    swatches: ["#8A6A4F", "#000000"],
    desc: "Longline winter coat with wool blend fabric, double-breasted buttons and warm quilted lining." },
  { id: 16, name: "Modern Bookshelf",         price: 850,  old: null, discount: null,   rating: 4.5, count: 40,  img: "images/bookshelf.jpg",     cat: "Home & Living",
    swatches: ["#8B6F47", "#C4C4C4"],
    desc: "5-tier open bookshelf with solid wood frame and industrial metal accents for living room storage." },
  { id: 17, name: "Premium Dog Food 10kg",    price: 90,   old: 110,  discount: "-18%", rating: 5,   count: 95,  img: "images/dog-food.jpg",      cat: "Groceries & Pets",
    swatches: ["#C98A3D", "#404040"],
    desc: "Grain-free premium dry dog food with real chicken, omega-3 fatty acids and essential vitamins." },
  { id: 18, name: "iPhone 14 Pro Max",        price: 1450, old: null, discount: null,   rating: 5,   count: 500, img: "images/hero-iphone.jpg",   cat: "Electronics",
    swatches: ["#5D5D8C", "#C4C4C4"],
    desc: "6.7-inch Super Retina XDR display, A16 Bionic chip, 48MP pro camera system and Dynamic Island." },
  { id: 19, name: "Echo Dot Smart Speaker",   price: 60,   old: 80,   discount: "-25%", rating: 4.5, count: 380, img: "images/speakers-echo.jpg", cat: "Electronics",
    swatches: ["#404040", "#C4C4C4"],
    desc: "Smart speaker with Alexa, improved bass, temperature sensor and voice control for your smart home." },
  { id: 20, name: "Women's Collection Set",   price: 780,  old: null, discount: null,   rating: 4.5, count: 70,  img: "images/womens-collection.jpg", cat: "Fashion",
    swatches: ["#DB4444", "#404040"],
    desc: "Curated women's fashion set with premium fabric pieces that give you another level of style." },
  { id: 21, name: "PS5 Console + Controller", price: 1650, old: 1800, discount: "-8%",  rating: 5,   count: 420, img: "images/ps5.jpg",           cat: "Gaming",
    swatches: ["#FFFFFF", "#000000"],
    desc: "PlayStation 5 console with DualSense wireless controller, ultra-high speed SSD and ray tracing support." },
  { id: 22, name: "Bomber Satin Jacket",      price: 750,  old: null, discount: null,   rating: 4.5, count: 60,  img: "images/jacket-green.jpg",  cat: "Fashion",
    swatches: ["#B4693C", "#184A48"],
    desc: "Classic bomber jacket in smooth satin finish with elastic cuffs, zip pockets and durable stitching." },
];

const CATEGORIES = [
  "All", "Gaming", "Electronics", "Fashion", "Home & Living",
  "Beauty & Health", "Sports & Outdoor", "Kids & Toys", "Groceries & Pets",
];

/* ---------- helpers ---------- */
function productById(id) {
  return PRODUCTS.find((p) => p.id === Number(id)) || null;
}
function productByName(name) {
  const n = (name || "").trim().toLowerCase();
  return PRODUCTS.find((p) => p.name.toLowerCase() === n) || null;
}
