/* ============================================================
   Exclusive — Shared Core (main.js)
   Har page par load hota hai. Handles:
   - localStorage state (cart, wishlist, users, orders, coupon)
   - Header badges + account avatar
   - Product cards render + click delegation (add to cart,
     wishlist toggle, quick view)
   - Toast notifications
   - Mock auth (signup / login / logout)
   ============================================================ */

/* ---------------- Store (localStorage wrapper) ---------------- */
const EXStore = {
  get(key, def) {
    try {
      const v = JSON.parse(localStorage.getItem(key));
      return v === null || v === undefined ? def : v;
    } catch (e) { return def; }
  },
  set(key, val) { localStorage.setItem(key, JSON.stringify(val)); },
  del(key) { localStorage.removeItem(key); },
};

const K = {
  CART: "ex_cart", WISH: "ex_wish", USERS: "ex_users", USER: "ex_user",
  ORDERS: "ex_orders", INFO: "ex_saved_info", COUPON: "ex_coupon",
};

/* ---------------- Money formatter ---------------- */
function money(n) {
  return "$" + Number(n).toLocaleString("en-US", { maximumFractionDigits: 0 });
}

/* ---------------- Cart ---------------- */
const EXCart = {
  raw() { return EXStore.get(K.CART, []); },
  save(v) { EXStore.set(K.CART, v); EXUI.updateBadges(); },
  items() {
    return this.raw()
      .map((r) => ({ ...productById(r.id), qty: r.qty }))
      .filter((p) => p && p.id);
  },
  add(id, qty) {
    qty = Math.max(1, Number(qty) || 1);
    const cart = this.raw();
    const row = cart.find((r) => r.id === Number(id));
    if (row) row.qty += qty; else cart.push({ id: Number(id), qty });
    this.save(cart);
  },
  setQty(id, qty) {
    const cart = this.raw();
    const row = cart.find((r) => r.id === Number(id));
    if (row) row.qty = Math.max(1, Number(qty) || 1);
    this.save(cart);
  },
  remove(id) { this.save(this.raw().filter((r) => r.id !== Number(id))); },
  clear() { this.save([]); },
  count() { return this.raw().reduce((s, r) => s + r.qty, 0); },
  subtotal() {
    return this.items().reduce((s, p) => s + p.price * p.qty, 0);
  },
};

/* ---------------- Wishlist ---------------- */
const EXWish = {
  raw() { return EXStore.get(K.WISH, []); },
  save(v) { EXStore.set(K.WISH, v); EXUI.updateBadges(); },
  has(id) { return this.raw().includes(Number(id)); },
  toggle(id) {
    const w = this.raw();
    const i = w.indexOf(Number(id));
    if (i >= 0) { w.splice(i, 1); this.save(w); return false; }
    w.push(Number(id)); this.save(w); return true;
  },
  remove(id) { this.save(this.raw().filter((x) => x !== Number(id))); },
  clear() { this.save([]); },
  count() { return this.raw().length; },
};

/* ---------------- Auth (mock, localStorage) ---------------- */
const EXAuth = {
  users() { return EXStore.get(K.USERS, []); },
  user() { return EXStore.get(K.USER, null); },
  signup(name, email, pass) {
    const users = this.users();
    email = email.trim().toLowerCase();
    if (users.some((u) => u.email === email)) {
      return { ok: false, msg: "This email is already registered. Please log in." };
    }
    const user = { name: name.trim(), email, pass, address: "" };
    users.push(user);
    EXStore.set(K.USERS, users);
    EXStore.set(K.USER, { name: user.name, email, address: "" });
    return { ok: true };
  },
  login(email, pass) {
    const u = this.users().find(
      (x) => x.email === email.trim().toLowerCase() && x.pass === pass
    );
    if (!u) return { ok: false, msg: "Incorrect email or password." };
    EXStore.set(K.USER, { name: u.name, email: u.email, address: u.address || "" });
    return { ok: true };
  },
  logout() { EXStore.del(K.USER); },
  update(profile) {
    const u = this.user(); if (!u) return;
    Object.assign(u, profile);
    EXStore.set(K.USER, u);
    const users = this.users();
    const i = users.findIndex((x) => x.email === u.email);
    if (i >= 0) { Object.assign(users[i], profile); EXStore.set(K.USERS, users); }
  },
  requireLogin() {
    if (!this.user()) { location.href = "login.html"; return false; }
    return true;
  },
};

/* ---------------- Orders ---------------- */
const EXOrders = {
  all() { return EXStore.get(K.ORDERS, []); },
  place(order) {
    const all = this.all();
    all.unshift(order);
    EXStore.set(K.ORDERS, all);
  },
};

/* ---------------- UI: badges / toast / avatar ---------------- */
const EXUI = {
  updateBadges() {
    document.querySelectorAll('[data-badge="wish"]').forEach((el) => {
      const n = EXWish.count();
      el.textContent = n;
      el.hidden = n === 0;
    });
    document.querySelectorAll('[data-badge="cart"]').forEach((el) => {
      const n = EXCart.count();
      el.textContent = n;
      el.hidden = n === 0;
    });
    // Account avatar
    const user = EXAuth.user();
    document.querySelectorAll('[data-account-icon]').forEach((a) => {
      if (user) {
        a.href = "account.html";
        a.classList.add("logged-in");
        a.innerHTML = '<span class="avatar-circle">' +
          user.name.trim().charAt(0).toUpperCase() + "</span>";
      } else {
        a.href = "login.html";
      }
    });
  },

  toast(msg, ok = true) {
    let box = document.getElementById("exToast");
    if (!box) {
      box = document.createElement("div");
      box.id = "exToast";
      document.body.appendChild(box);
    }
    box.textContent = msg;
    box.className = "ex-toast show" + (ok ? "" : " err");
    clearTimeout(this._t);
    this._t = setTimeout(() => box.classList.remove("show"), 2200);
  },

  stars(p) {
    let out = "";
    for (let i = 1; i <= 5; i++) {
      let cls = "star empty";
      if (p.rating >= i) cls = "star full";
      else if (p.rating >= i - 0.5) cls = "star half";
      out += '<svg class="' + cls + '"><use href="#i-star"/></svg>';
    }
    return out;
  },

  /* Product card — same markup as homepage design */
  cardHTML(p, opts) {
    opts = opts || {};
    const showWish = opts.showWish !== false && !opts.trash;
    const wished = EXWish.has(p.id) ? " wished" : "";
    const badge = p.discount
      ? '<span class="badge">' + p.discount + "</span>"
      : p.badge
      ? '<span class="badge green">' + p.badge + "</span>"
      : "";
    const actions = opts.trash ? "" :
      '<div class="card-actions">' +
      (showWish ? '<button class="icon-btn wish-btn' + wished + '" aria-label="Wishlist"><svg class="ic"><use href="#i-heart"/></svg></button>' : "") +
      '<button class="icon-btn quick-view" aria-label="Quick view"><svg class="ic"><use href="#i-eye"/></svg></button>' +
      "</div>";
    const swatches = opts.showSwatches !== false && p.swatches
      ? '<div class="swatches">' +
        p.swatches.map((c, i) =>
          '<span class="swatch' + (i === 0 ? " active" : "") + '" style="--sw:' + c + '"></span>'
        ).join("") + "</div>"
      : "";
    const rating = opts.showRating === false ? "" :
      '<div class="rating">' + this.stars(p) +
      '<span class="rating-count">(' + p.count + ")</span></div>";
    const old = p.old ? '<span class="price-old">' + money(p.old) + "</span>" : "";
    const trash = opts.trash
      ? '<button class="icon-btn trash-btn" aria-label="Remove"><svg class="ic"><use href="#i-trash"/></svg></button>'
      : "";
    return (
      '<article class="product-card" data-id="' + p.id + '">' +
      '<div class="card-media">' + badge + trash + actions +
      '<img src="' + p.img + '" alt="' + p.name + '" data-goto="product-details.html?id=' + p.id + '">' +
      '<button class="add-to-cart">Add To Cart</button>' +
      "</div>" +
      '<h3 class="card-title" data-goto="product-details.html?id=' + p.id + '">' + p.name + "</h3>" +
      '<p class="price"><span class="price-new">' + money(p.price) + "</span>" + old + "</p>" +
      rating + swatches +
      "</article>"
    );
  },
};

/* ---------------- SVG sprite (icons for inner pages) ----------------
   Inner pages rely on this injected sprite so pages stay light.
   index.html apna sprite khud rakhta hai — sirf missing symbols add hote hain. */
const EX_SPRITE =
  '<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="position:absolute;width:0;height:0;overflow:hidden">' +
  '<defs><linearGradient id="halfGrad" x1="0" y1="0" x2="1" y2="0">' +
  '<stop offset="50%" stop-color="#FFAD33"/><stop offset="50%" stop-color="#C4C4C4"/></linearGradient></defs>' +
  '<symbol id="i-heart" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></symbol>' +
  '<symbol id="i-eye" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="1.6"/></symbol>' +
  '<symbol id="i-cart" viewBox="0 0 24 24"><circle cx="9" cy="21" r="1" fill="currentColor" stroke="none"/><circle cx="20" cy="21" r="1" fill="currentColor" stroke="none"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></symbol>' +
  '<symbol id="i-search" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="1.8"/><line x1="20.5" y1="20.5" x2="16.2" y2="16.2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></symbol>' +
  '<symbol id="i-star" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></symbol>' +
  '<symbol id="i-user" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><circle cx="12" cy="7" r="4" fill="none" stroke="currentColor" stroke-width="1.6"/></symbol>' +
  '<symbol id="i-phone" viewBox="0 0 24 24"><rect x="6" y="2.5" width="12" height="19" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.6"/><line x1="10.5" y1="18.5" x2="13.5" y2="18.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><line x1="10" y1="5" x2="14" y2="5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></symbol>' +
  '<symbol id="i-trash" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><line x1="10" y1="11" x2="10" y2="17" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><line x1="14" y1="11" x2="14" y2="17" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></symbol>' +
  '<symbol id="i-rotate" viewBox="0 0 24 24"><polyline points="1 4 1 10 7 10" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></symbol>' +
  '<symbol id="i-truck" viewBox="0 0 24 24"><rect x="1" y="4" width="14" height="12" rx="1" fill="none" stroke="currentColor" stroke-width="1.7"/><polygon points="15 9 19.5 9 23 12.5 23 16 15 16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><circle cx="6" cy="18.5" r="2" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="18" cy="18.5" r="2" fill="none" stroke="currentColor" stroke-width="1.7"/></symbol>' +
  '<symbol id="i-store" viewBox="0 0 24 24"><path d="M3 9l1.5-5h15L21 9" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M4 9v11h16V9" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M9 20v-6h6v6" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0" fill="none" stroke="currentColor" stroke-width="1.7"/></symbol>' +
  '<symbol id="i-dollar" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M12 6.5v11M15 8.5c-.7-1-1.7-1.5-3-1.5-1.8 0-3 1-3 2.5s1.2 2.2 3 2.5 3 1 3 2.5-1.2 2.5-3 2.5c-1.3 0-2.3-.5-3-1.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></symbol>' +
  '<symbol id="i-bag" viewBox="0 0 24 24"><path d="M6 7h12l1 14H5L6 7z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M9 10V6a3 3 0 0 1 6 0v4" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></symbol>' +
  '<symbol id="i-cash" viewBox="0 0 24 24"><rect x="2" y="6" width="20" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M5.5 9.5v.01M18.5 14.5v.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></symbol>' +
  '<symbol id="i-check" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></symbol>' +
  '<symbol id="i-x" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></symbol>' +
  '<symbol id="i-chevron-down" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></symbol>' +
  '<symbol id="i-chevron-up" viewBox="0 0 24 24"><polyline points="18 15 12 9 6 15" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></symbol>' +
  '<symbol id="i-google" viewBox="0 0 24 24"><path fill="#4285F4" d="M23.5 12.27c0-.85-.08-1.66-.22-2.45H12v4.64h6.46a5.52 5.52 0 0 1-2.4 3.62v3h3.87c2.27-2.09 3.57-5.17 3.57-8.81z"/><path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.87-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.29v3.1A12 12 0 0 0 12 24z"/><path fill="#FBBC05" d="M5.27 14.28A7.2 7.2 0 0 1 4.89 12c0-.79.14-1.56.38-2.28v-3.1H1.29a12 12 0 0 0 0 10.76l3.98-3.1z"/><path fill="#EA4335" d="M12 4.77c1.76 0 3.35.61 4.6 1.8l3.42-3.42A11.97 11.97 0 0 0 12 0 12 12 0 0 0 1.29 6.62l3.98 3.1C6.22 6.88 8.87 4.77 12 4.77z"/></symbol>' +
  '<symbol id="i-send" viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><polygon points="22 2 15 22 11 13 2 9 22 2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></symbol>' +
  '<symbol id="i-facebook" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></symbol>' +
  '<symbol id="i-twitter" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></symbol>' +
  '<symbol id="i-instagram" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" fill="none" stroke="currentColor" stroke-width="1.6"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></symbol>' +
  '<symbol id="i-linkedin" viewBox="0 0 24 24"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><rect x="2" y="9" width="4" height="12" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="4" cy="4" r="2" fill="none" stroke="currentColor" stroke-width="1.6"/></symbol>' +
  '<symbol id="i-arrow-right" viewBox="0 0 24 24"><line x1="4" y1="12" x2="20" y2="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><polyline points="13 5 20 12 13 19" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></symbol>' +
  '<symbol id="i-arrow-left" viewBox="0 0 24 24"><line x1="20" y1="12" x2="4" y2="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><polyline points="11 5 4 12 11 19" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></symbol>' +
  '<symbol id="i-arrow-up" viewBox="0 0 24 24"><line x1="12" y1="20" x2="12" y2="5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><polyline points="5 12 12 5 19 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></symbol>' +
  '<symbol id="i-apple" viewBox="0 0 24 24"><path fill="currentColor" d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.53 4.08zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></symbol>' +
  '<symbol id="i-headset" viewBox="0 0 24 24"><path d="M3 17v-5a9 9 0 0 1 18 0v5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="M21 16.5a2 2 0 0 1-2 2h-1a1.5 1.5 0 0 1-1.5-1.5v-3a1.5 1.5 0 0 1 1.5-1.5H21zM3 16.5a2 2 0 0 0 2 2h1a1.5 1.5 0 0 0 1.5-1.5v-3A1.5 1.5 0 0 0 6 12.5H3z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></symbol>' +
  '<symbol id="i-shield" viewBox="0 0 24 24"><path d="M12 22s8-3.6 8-9.5V5.5L12 2.5 4 5.5v7C4 18.4 12 22 12 22z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><polyline points="9 11.5 11.2 13.7 15.2 9.7" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></symbol>' +
  '</svg>';

(function injectSprite() {
  const tmp = document.createElement("div");
  tmp.innerHTML = EX_SPRITE;
  const newSvg = tmp.firstChild;
  const existing = new Set(
    Array.from(document.querySelectorAll("symbol")).map((s) => s.id)
  );
  const gradExists = !!document.getElementById("halfGrad");
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("aria-hidden", "true");
  svg.style.cssText = "position:absolute;width:0;height:0;overflow:hidden";
  if (!gradExists) {
    const defs = newSvg.querySelector("defs");
    if (defs) svg.appendChild(defs.cloneNode(true));
  }
  let added = 0;
  newSvg.querySelectorAll("symbol").forEach((sym) => {
    if (!existing.has(sym.id)) { svg.appendChild(sym); added++; }
  });
  if (svg.childElementCount > 0) document.body.insertBefore(svg, document.body.firstChild);
})();

/* ---------------- Global click delegation ---------------- */
document.addEventListener("DOMContentLoaded", function () {
  EXUI.updateBadges();

  /* Bind static homepage cards (index.html) to product DB by title */
  document.querySelectorAll(".product-card:not([data-id])").forEach((card) => {
    const t = card.querySelector(".card-title");
    const p = t ? productByName(t.textContent) : null;
    if (p) {
      card.dataset.id = p.id;
      const w = card.querySelector(".wish-btn");
      if (w && EXWish.has(p.id)) w.classList.add("wished");
    }
  });

  document.addEventListener("click", function (e) {
    /* --- Add to cart --- */
    const atc = e.target.closest(".add-to-cart");
    if (atc) {
      const host = atc.closest("[data-id]");
      if (host && host.dataset.id) {
        EXCart.add(host.dataset.id, 1);
        EXUI.toast("Added to cart ✓");
        if (!atc.classList.contains("added")) {
          atc.classList.add("added");
          const old = atc.textContent;
          atc.textContent = "Added ✓";
          setTimeout(() => { atc.classList.remove("added"); atc.textContent = old; }, 1400);
        }
      }
      return;
    }

    /* --- Wishlist toggle --- */
    const wbtn = e.target.closest(".wish-btn");
    if (wbtn) {
      const host = wbtn.closest("[data-id]");
      if (host && host.dataset.id) {
        const added = EXWish.toggle(host.dataset.id);
        wbtn.classList.toggle("wished", added);
        EXUI.toast(added ? "Added to wishlist ♥" : "Removed from wishlist");
      } else {
        wbtn.classList.toggle("wished");
      }
      return;
    }

    /* --- Trash (wishlist remove) --- */
    const trash = e.target.closest(".trash-btn");
    if (trash) {
      const host = trash.closest("[data-id]");
      if (host && host.dataset.id) {
        EXWish.remove(host.dataset.id);
        if (typeof onWishlistChange === "function") onWishlistChange();
        EXUI.toast("Removed from wishlist");
      }
      return;
    }

    /* --- Quick view / product link --- */
    const qv = e.target.closest(".quick-view, [data-goto]");
    if (qv) {
      const url = qv.dataset.goto ||
        "product-details.html?id=" + (qv.closest("[data-id]") || {}).dataset?.id;
      if (url && url !== "product-details.html?id=undefined") {
        location.href = url;
      }
      return;
    }

    /* --- Empty hash links --- */
    const link = e.target.closest('a[href="#"]');
    if (link) e.preventDefault();
  });

  /* --- Search boxes → shop page --- */
  document.querySelectorAll(".search-box").forEach((form) => {
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      const q = form.querySelector("input").value.trim();
      location.href = "products.html" + (q ? "?q=" + encodeURIComponent(q) : "");
    });
  });

  /* --- Logout links --- */
  document.querySelectorAll("[data-logout]").forEach((a) => {
    a.addEventListener("click", function (e) {
      e.preventDefault();
      EXAuth.logout();
      location.href = "index.html";
    });
  });
});
