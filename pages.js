/* ============================================================
   Exclusive — Pages Logic (pages.js)
   Har inner page ka apna logic, body[data-page] se switch hota hai.
   ============================================================ */

/* Escape helper */
function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

function qs(name) {
  return new URLSearchParams(location.search).get(name);
}

const COUPONS = { SAVE10: 0.10, EXCLUSIVE5: 0.05 };

function cartTotals() {
  const sub = EXCart.subtotal();
  const code = EXStore.get("ex_coupon", null);
  const rate = code && COUPONS[code] ? COUPONS[code] : 0;
  const discount = Math.round(sub * rate);
  const shipping = 0;
  return { sub, discount, shipping, total: sub - discount + shipping, code };
}

/* ============================================================
   PRODUCTS PAGE (shop + filtering)
   ============================================================ */
function initProductsPage() {
  const grid = document.getElementById("shopGrid");
  const catWrap = document.getElementById("catFilters");
  const priceWrap = document.getElementById("priceFilters");
  const sortSel = document.getElementById("sortSelect");
  const countEl = document.getElementById("resultsCount");
  const clearBtn = document.getElementById("clearFilters");
  if (!grid) return;

  const PRICE_RANGES = [
    { label: "All Price", min: 0, max: Infinity },
    { label: "Under $250", min: 0, max: 250 },
    { label: "$250 – $650", min: 250, max: 650 },
    { label: "$650 – $1250", min: 650, max: 1250 },
    { label: "Over $1250", min: 1250, max: Infinity },
  ];

  const state = {
    q: qs("q") || "",
    cat: qs("cat") || "All",
    price: 0,
    sort: "default",
  };

  /* Build category chips */
  CATEGORIES.forEach((c) => {
    const b = document.createElement("button");
    b.className = "chip" + (c === state.cat ? " active" : "");
    b.textContent = c;
    b.addEventListener("click", () => {
      state.cat = c;
      catWrap.querySelectorAll(".chip").forEach((x) => x.classList.remove("active"));
      b.classList.add("active");
      render();
    });
    catWrap.insertBefore(b, sortSel);
  });

  /* Build price chips */
  PRICE_RANGES.forEach((r, i) => {
    const b = document.createElement("button");
    b.className = "chip" + (i === 0 ? " active" : "");
    b.textContent = r.label;
    b.addEventListener("click", () => {
      state.price = i;
      priceWrap.querySelectorAll(".chip").forEach((x) => x.classList.remove("active"));
      b.classList.add("active");
      render();
    });
    priceWrap.appendChild(b);
  });

  sortSel.addEventListener("change", () => { state.sort = sortSel.value; render(); });

  clearBtn.addEventListener("click", () => {
    state.q = ""; state.cat = "All"; state.price = 0; state.sort = "default";
    sortSel.value = "default";
    catWrap.querySelectorAll(".chip").forEach((x, i) =>
      x.classList.toggle("active", x.textContent === "All"));
    priceWrap.querySelectorAll(".chip").forEach((x, i) =>
      x.classList.toggle("active", i === 0));
    render();
  });

  function filtered() {
    let list = PRODUCTS.filter((p) => {
      if (state.cat !== "All" && p.cat !== state.cat) return false;
      const r = PRICE_RANGES[state.price];
      if (p.price < r.min || p.price > r.max) return false;
      if (state.q && !p.name.toLowerCase().includes(state.q.toLowerCase())) return false;
      return true;
    });
    switch (state.sort) {
      case "low": list.sort((a, b) => a.price - b.price); break;
      case "high": list.sort((a, b) => b.price - a.price); break;
      case "rating": list.sort((a, b) => b.rating - a.rating || b.count - a.count); break;
      case "name": list.sort((a, b) => a.name.localeCompare(b.name)); break;
    }
    return list;
  }

  function render() {
    const list = filtered();
    grid.innerHTML = list.length
      ? list.map((p) => EXUI.cardHTML(p)).join("")
      : '<div class="no-results"><strong>No products found!</strong>Try changing filters or search term.</div>';
    countEl.textContent = "Showing " + list.length + " of " + PRODUCTS.length + " products";
    const isFiltered = state.cat !== "All" || state.price !== 0 || state.q || state.sort !== "default";
    clearBtn.style.display = isFiltered ? "inline" : "none";
    if (state.q) countEl.textContent += ' — results for "' + state.q + '"';
  }

  render();
}

/* ============================================================
   PRODUCT DETAILS PAGE
   ============================================================ */
function initDetailsPage() {
  const root = document.getElementById("detailsRoot");
  if (!root) return;

  const id = Number(qs("id")) || 1;
  const p = productById(id) || PRODUCTS[0];
  const related = PRODUCTS.filter((x) => x.cat === p.cat && x.id !== p.id).slice(0, 4);
  while (related.length < 4) {
    const extra = PRODUCTS.find((x) => x.id !== p.id && !related.includes(x));
    if (!extra) break;
    related.push(extra);
  }

  /* Breadcrumb — Account / {Category} / {Name} */
  const crumbs = document.getElementById("detailsCrumbs");
  crumbs.innerHTML =
    '<a href="account.html">Account</a><span class="sep">/</span>' +
    '<a href="products.html?cat=' + encodeURIComponent(p.cat) + '">' + esc(p.cat) + '</a><span class="sep">/</span>' +
    '<span class="current">' + esc(p.name) + "</span>";

  const gallery = p.gallery || [p.img, p.img, p.img, p.img];
  const wished = EXWish.has(p.id) ? " wished" : "";
  document.title = p.name + " — Exclusive";

  root.innerHTML = `
    <div class="gallery">
      <div class="gallery-thumbs" id="galThumbs">
        ${gallery.map((g, i) => `
          <button class="${i === 0 ? "active" : ""}" data-g="${g}"><img src="${g}" alt="view ${i + 1}"></button>
        `).join("")}
      </div>
      <div class="gallery-main"><img id="galMain" src="${gallery[0]}" alt="${esc(p.name)}"></div>
    </div>

    <div class="details-info">
      <h1>${esc(p.name)}</h1>
      <div class="details-meta">
        <div class="rating">${EXUI.stars(p)}<span class="rating-count">(${p.count} Reviews)</span></div>
        <span class="meta-sep"></span>
        <span class="stock">In Stock</span>
      </div>
      <p class="details-price">${money(p.price)}${p.old ? ' <s style="font-size:18px;color:var(--text-soft)">' + money(p.old) + "</s>" : ""}</p>
      <p class="details-desc">${esc(p.desc)}</p>
      <div class="details-divider"></div>

      <div class="opt-row">
        <span class="opt-label">Colours:</span>
        <div class="color-dots">
          <span class="color-dot active" style="background:#5D8DD8"></span>
          <span class="color-dot" style="background:#DB4444"></span>
        </div>
      </div>

      <div class="opt-row">
        <span class="opt-label">Size:</span>
        <div class="size-chips" id="sizeChips">
          ${["XS", "S", "M", "L", "XL"].map((s) => `
            <button type="button" class="size-chip ${s === "M" ? "active" : ""}">${s}</button>`).join("")}
        </div>
      </div>

      <div class="buy-row">
        <div class="qty-box" id="detailQty">
          <button type="button" class="minus-btn">−</button>
          <span class="qty-num" id="dqNum">2</span>
          <button type="button" class="plus-btn">+</button>
        </div>
        <button type="button" class="btn-buy" id="buyNow">Buy Now</button>
        <button type="button" class="wish-square${wished}" id="detailWish" data-id="${p.id}" aria-label="Wishlist">
          <svg class="ic"><use href="#i-heart"/></svg>
        </button>
      </div>

      <div class="delivery-box">
        <div class="delivery-row">
          <span class="delivery-ic"><svg class="ic"><use href="#i-truck"/></svg></span>
          <div>
            <h4>Free Delivery</h4>
            <span class="d-link" id="postalLink">Enter your postal code for Delivery Availability</span>
          </div>
        </div>
        <div class="delivery-row">
          <span class="delivery-ic"><svg class="ic"><use href="#i-rotate"/></svg></span>
          <div>
            <h4>Return Delivery</h4>
            <span class="d-link" id="returnLink">Free 30 Days Delivery Returns. Details</span>
          </div>
        </div>
      </div>
    </div>`;

  /* Gallery thumbs */
  document.getElementById("galThumbs").addEventListener("click", (e) => {
    const b = e.target.closest("button[data-g]");
    if (!b) return;
    document.getElementById("galMain").src = b.dataset.g;
    document.querySelectorAll("#galThumbs button").forEach((x) => x.classList.remove("active"));
    b.classList.add("active");
  });

  /* Colors */
  root.querySelectorAll(".color-dot").forEach((d) =>
    d.addEventListener("click", () => {
      root.querySelectorAll(".color-dot").forEach((x) => x.classList.remove("active"));
      d.classList.add("active");
    }));

  /* Sizes */
  document.getElementById("sizeChips").addEventListener("click", (e) => {
    const b = e.target.closest(".size-chip");
    if (!b) return;
    document.querySelectorAll("#sizeChips .size-chip").forEach((x) => x.classList.remove("active"));
    b.classList.add("active");
  });

  /* Qty */
  let qty = 2;
  const dq = document.getElementById("dqNum");
  document.querySelector("#detailQty .minus-btn").addEventListener("click", () => {
    qty = Math.max(1, qty - 1); dq.textContent = qty;
  });
  document.querySelector("#detailQty .plus-btn").addEventListener("click", () => {
    qty = Math.min(99, qty + 1); dq.textContent = qty;
  });

  /* Buy Now → add + checkout */
  document.getElementById("buyNow").addEventListener("click", () => {
    EXCart.add(p.id, qty);
    location.href = "checkout.html";
  });

  /* Wish square */
  const dw = document.getElementById("detailWish");
  dw.addEventListener("click", () => {
    const added = EXWish.toggle(p.id);
    dw.classList.toggle("wished", added);
    EXUI.toast(added ? "Added to wishlist ♥" : "Removed from wishlist");
  });

  /* Postal code inline input */
  document.getElementById("postalLink").addEventListener("click", function () {
    if (this.querySelector("input")) return;
    this.innerHTML = '<input class="d-input" placeholder="e.g. 1216" maxlength="6">';
    const inp = this.querySelector("input");
    inp.focus();
    inp.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && inp.value.trim()) {
        this.textContent = "Free delivery available to " + inp.value.trim() + " ✓";
        EXUI.toast("Delivery available for " + inp.value.trim() + " ✓");
      }
    });
  });
  document.getElementById("returnLink").addEventListener("click", () =>
    EXUI.toast("30 din ke andar free return — koi masla nahi ✓"));

  /* Related */
  document.getElementById("relatedGrid").innerHTML = related
    .map((r) => EXUI.cardHTML(r)).join("");
}

/* ============================================================
   CART PAGE
   ============================================================ */
function initCartPage() {
  const root = document.getElementById("cartRoot");
  if (!root) return;

  function render() {
    const items = EXCart.items();
    if (!items.length) {
      root.innerHTML = `
        <div class="cart-empty">
          <h3>Your cart is empty</h3>
          <p>Abhi aapke cart mein koi item nahi hai. Shopping shuru karein!</p>
          <a href="products.html" class="btn-red" style="display:inline-flex;align-items:center;height:56px;padding:0 28px;border-radius:4px">Return To Shop</a>
        </div>`;
      EXUI.updateBadges();
      return;
    }

    const t = cartTotals();
    root.innerHTML = `
      <div class="cart-table">
        <div class="cart-head">
          <span>Product</span><span>Price</span><span>Quantity</span><span style="text-align:right">Subtotal</span>
        </div>
        ${items.map((p) => `
          <div class="cart-row" data-id="${p.id}">
            <div class="cart-prod">
              <div class="cart-thumb">
                <button class="remove-x" data-remove="${p.id}" aria-label="Remove">✕</button>
                <img src="${p.img}" alt="${esc(p.name)}">
              </div>
              <span class="cart-name">${esc(p.name)}</span>
            </div>
            <span class="c-price" data-label="Price">${money(p.price)}</span>
            <div class="qty-box with-arrows" style="justify-self:start">
              <span class="qty-num">${String(p.qty).padStart(2, "0")}</span>
              <span class="step-arrows">
                <button type="button" data-step="1" aria-label="Increase">▲</button>
                <button type="button" data-step="-1" aria-label="Decrease">▼</button>
              </span>
            </div>
            <span class="c-sub" data-label="Subtotal" style="text-align:right">${money(p.price * p.qty)}</span>
          </div>`).join("")}
      </div>

      <div class="cart-actions">
        <a href="products.html" class="btn-outline">Return To Shop</a>
        <button class="btn-outline" id="updateCart">Update Cart</button>
      </div>

      <div class="cart-bottom">
        <div class="coupon-row">
          <input class="input-coupon" id="couponInput" placeholder="Coupon Code" value="${t.code || ""}">
          <button class="btn-apply" id="applyCoupon">Apply Coupon</button>
        </div>
        <div class="cart-total-box">
          <h3>Cart Total</h3>
          <div class="total-row"><span>Subtotal:</span><span>${money(t.sub)}</span></div>
          ${t.discount ? '<div class="total-row"><span>Discount (' + t.code + '):</span><span>−' + money(t.discount) + "</span></div>" : ""}
          <div class="total-row"><span>Shipping:</span><span>Free</span></div>
          <div class="total-row grand"><span>Total:</span><span>${money(t.total)}</span></div>
          <a href="checkout.html" class="btn-checkout">Procees to checkout</a>
        </div>
      </div>`;

    /* remove */
    root.querySelectorAll("[data-remove]").forEach((b) =>
      b.addEventListener("click", () => {
        EXCart.remove(b.dataset.remove);
        render();
        EXUI.toast("Item removed from cart");
      }));

    /* qty steps */
    root.querySelectorAll(".cart-row").forEach((row) => {
      const id = Number(row.dataset.id);
      const item = EXCart.raw().find((r) => r.id === id);
      row.querySelectorAll("[data-step]").forEach((b) =>
        b.addEventListener("click", () => {
          const q = Math.max(1, item.qty + Number(b.dataset.step));
          EXCart.setQty(id, q);
          render();
        }));
    });

    /* update cart (re-sync) */
    root.querySelector("#updateCart").addEventListener("click", () => {
      render();
      EXUI.toast("Cart updated ✓");
    });

    /* coupon */
    root.querySelector("#applyCoupon").addEventListener("click", () => {
      const code = root.querySelector("#couponInput").value.trim().toUpperCase();
      if (COUPONS[code]) {
        EXStore.set("ex_coupon", code);
        EXUI.toast("Coupon " + code + " applied — " + Math.round(COUPONS[code] * 100) + "% off ✓");
      } else {
        EXStore.del("ex_coupon");
        EXUI.toast(code ? "Invalid coupon code ✕" : "Coupon removed", false);
      }
      render();
    });
  }

  render();
  window.onCartPageChange = render;
}

/* ============================================================
   CHECKOUT PAGE
   ============================================================ */
function initCheckoutPage() {
  const rootEl = document.getElementById("checkoutRoot");
  if (!rootEl) return;

  const items = EXCart.items();
  if (!items.length) {
    rootEl.innerHTML = `
      <div class="cart-empty">
        <h3>Nothing to checkout</h3>
        <p>Checkout karne ke liye pehle cart mein items add karein.</p>
        <a href="products.html" class="btn-red" style="display:inline-flex;align-items:center;height:56px;padding:0 28px;border-radius:4px">Return To Shop</a>
      </div>`;
    return;
  }

  const form = document.getElementById("billForm");
  const saved = EXStore.get("ex_saved_info", null);
  const user = EXAuth.user();

  /* Prefill: saved info → user profile */
  if (saved) {
    form.firstName.value = saved.firstName || "";
    form.company.value = saved.company || "";
    form.street.value = saved.street || "";
    form.apartment.value = saved.apartment || "";
    form.city.value = saved.city || "";
    form.phone.value = saved.phone || "";
    form.email.value = saved.email || "";
  } else if (user) {
    const parts = (user.name || "").trim().split(" ");
    form.firstName.value = parts[0] || "";
    form.email.value = user.email || "";
    form.street.value = user.address || "";
  }

  function summary() {
    const t = cartTotals();
    document.getElementById("orderSummary").innerHTML = `
      ${items.map((p) => `
        <div class="order-item">
          <div class="order-thumb"><img src="${p.img}" alt="${esc(p.name)}"></div>
          <span class="o-name">${esc(p.name)}</span>
          <span>x${p.qty}</span>
          <span style="min-width:64px;text-align:right">${money(p.price * p.qty)}</span>
        </div>`).join("")}
      <div class="total-row"><span>Subtotal:</span><span>${money(t.sub)}</span></div>
      ${t.discount ? '<div class="total-row"><span>Discount (' + t.code + '):</span><span>−' + money(t.discount) + "</span></div>" : ""}
      <div class="total-row"><span>Shipping:</span><span>Free</span></div>
      <div class="total-row grand"><span>Total:</span><span>${money(t.total)}</span></div>

      <div class="pay-block">
        <label class="pay-option">
          <input type="radio" name="payment" value="Bank">
          Bank
          <span class="pay-cards">
            <span class="pc pc-bkash">bKash</span>
            <span class="pc pc-visa">VISA</span>
            <span class="pc pc-mc"></span>
            <span class="pc pc-amex">AMEX</span>
          </span>
        </label>
        <label class="pay-option">
          <input type="radio" name="payment" value="Cash on delivery" checked>
          Cash on delivery
        </label>
      </div>

      <div class="checkout-coupon">
        <input class="input-coupon" id="coCoupon" placeholder="Coupon Code" value="${t.code || ""}">
        <button type="button" class="btn-apply" id="coApply">Apply Coupon</button>
      </div>
      <button type="button" class="btn-place" id="placeOrder">Place Order</button>`;

    document.getElementById("coApply").addEventListener("click", () => {
      const code = document.getElementById("coCoupon").value.trim().toUpperCase();
      if (COUPONS[code]) {
        EXStore.set("ex_coupon", code);
        EXUI.toast("Coupon applied ✓");
      } else {
        EXStore.del("ex_coupon");
        EXUI.toast(code ? "Invalid coupon ✕" : "Coupon removed", false);
      }
      summary();
    });

    document.getElementById("placeOrder").addEventListener("click", placeOrder);
  }

  function placeOrder() {
    /* validation */
    let ok = true;
    ["firstName", "street", "city", "phone", "email"].forEach((n) => {
      const f = form[n];
      if (!f.value.trim()) {
        f.style.border = "1px solid var(--red)";
        ok = false;
      } else f.style.border = "";
    });
    if (!ok) {
      EXUI.toast("Please fill all required fields (*)", false);
      return;
    }
    const paySel = document.querySelector('input[name="payment"]:checked');
    const payment = paySel ? paySel.value : "Cash on delivery";
    if (form.saveInfo.checked) {
      EXStore.set("ex_saved_info", {
        firstName: form.firstName.value.trim(),
        company: form.company.value.trim(),
        street: form.street.value.trim(),
        apartment: form.apartment.value.trim(),
        city: form.city.value.trim(),
        phone: form.phone.value.trim(),
        email: form.email.value.trim(),
      });
    }

    const t = cartTotals();
    const orderId = "EX-" + Date.now().toString().slice(-8);
    EXOrders.place({
      id: orderId,
      date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      items: items.map((p) => ({ id: p.id, name: p.name, price: p.price, qty: p.qty })),
      subtotal: t.sub, discount: t.discount, total: t.total,
      payment: payment,
      name: form.firstName.value.trim() + " " + (form.apartment.value.trim() || ""),
      city: form.city.value.trim(),
    });
    EXCart.clear();
    EXStore.del("ex_coupon");

    rootEl.innerHTML = `
      <div class="order-success">
        <div class="ok-circle">✓</div>
        <h2>Order Placed Successfully!</h2>
        <p>Shukriya! Aapka order receive ho gaya hai.</p>
        <p>Order ID: <span class="order-id">${orderId}</span></p>
        <p>Payment: ${payment} — Total: <b>${money(t.total)}</b></p>
        <a href="index.html" class="btn-red">Continue Shopping</a>
      </div>`;
    EXUI.updateBadges();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  summary();
}

/* ============================================================
   WISHLIST PAGE
   ============================================================ */
function onWishlistChange() {
  if (document.body.dataset.page === "wishlist") renderWishlist();
}

function initWishlistPage() {
  if (!document.getElementById("wishGrid")) return;
  renderWishlist();

  document.getElementById("moveAllBtn").addEventListener("click", () => {
    const wish = EXWish.raw();
    if (!wish.length) { EXUI.toast("Wishlist already empty", false); return; }
    wish.forEach((id) => EXCart.add(id, 1));
    EXWish.clear();
    renderWishlist();
    EXUI.toast("Sab items bag mein move ho gaye ✓");
  });
}

function renderWishlist() {
  const grid = document.getElementById("wishGrid");
  const title = document.getElementById("wishTitle");
  const wish = EXWish.raw();
  const items = wish.map((id) => productById(id)).filter(Boolean);
  title.textContent = "Wishlist (" + items.length + ")";
  grid.innerHTML = items.length
    ? items.map((p) => EXUI.cardHTML(p, { showRating: false, showSwatches: false, trash: true })).join("")
    : '<div class="no-results" style="grid-column:1/-1"><strong>Your wishlist is empty</strong>Products par ♥ icon daba kar wishlist mein add karein.</div>';

  /* Just For You — wishlist mein na hon, 4 items (eye icon only, design) */
  const others = PRODUCTS.filter((p) => !wish.includes(p.id)).slice(0, 4);
  document.getElementById("jfyGrid").innerHTML =
    others.map((p) => EXUI.cardHTML(p, { showSwatches: false, showWish: false })).join("");
  EXUI.updateBadges();
}

/* ============================================================
   ACCOUNT PAGE
   ============================================================ */
function initAccountPage() {
  if (!document.getElementById("profileView")) return;
  if (!EXAuth.requireLogin()) return;

  const user = EXAuth.user();
  const parts = (user.name || "").split(" ");
  const $ = (id) => document.getElementById(id);

  $("welcomeName").textContent = user.name || "User";
  $("pfFirst").value = parts[0] || "";
  $("pfLast").value = parts.slice(1).join(" ") || "";
  $("pfEmail").value = user.email || "";
  $("pfAddress").value = user.address || "";

  /* views */
  document.querySelectorAll("[data-view]").forEach((a) =>
    a.addEventListener("click", (e) => {
      e.preventDefault();
      document.querySelectorAll("[data-view]").forEach((x) => x.classList.remove("active"));
      a.classList.add("active");
      const v = a.dataset.view;
      $("profileView").style.display = v === "profile" ? "" : "none";
      $("ordersView").style.display = v === "orders" ? "" : "none";
      if (v === "orders") renderOrders();
    }));

  document.querySelectorAll("[data-soon]").forEach((a) =>
    a.addEventListener("click", (e) => {
      e.preventDefault();
      EXUI.toast(a.dataset.soon + " — coming soon", false);
    }));

  function renderOrders() {
    const orders = EXOrders.all();
    $("ordersList").innerHTML = orders.length
      ? orders.map((o) => `
          <div class="mini-order">
            <span class="o-id">${o.id}</span>
            <span class="o-date">${o.date}</span>
            <span>${o.items.length} item(s)</span>
            <span class="o-total">${money(o.total)}</span>
          </div>`).join("")
      : '<p style="color:var(--text-soft)">Abhi koi order nahi. <a href="products.html" style="color:var(--red)">Shop now →</a></p>';
  }

  /* save profile */
  $("profileForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const first = $("pfFirst").value.trim();
    const last = $("pfLast").value.trim();
    const email = $("pfEmail").value.trim();
    const address = $("pfAddress").value.trim();
    if (!first || !email) { EXUI.toast("Name aur Email zaroori hain", false); return; }

    /* password change (optional) */
    const f = e.target;
    const cur = f.curPass.value, nw = f.newPass.value, cf = f.confPass.value;
    if (cur || nw || cf) {
      const users = EXStore.get("ex_users", []);
      const u = users.find((x) => x.email === user.email);
      if (!u || u.pass !== cur) { EXUI.toast("Current password ghalat hai", false); return; }
      if (nw.length < 6) { EXUI.toast("Naya password kam az kam 6 characters ka ho", false); return; }
      if (nw !== cf) { EXUI.toast("Confirm password match nahi kar raha", false); return; }
      u.pass = nw;
      EXStore.set("ex_users", users);
      EXUI.toast("Password bhi update ho gaya ✓");
    }

    EXAuth.update({ name: (first + " " + last).trim(), email, address });
    $("welcomeName").textContent = (first + " " + last).trim();
    EXUI.toast("Profile saved ✓");
  });

  $("pfCancel").addEventListener("click", () => {
    const u = EXAuth.user();
    const p2 = (u.name || "").split(" ");
    $("pfFirst").value = p2[0] || "";
    $("pfLast").value = p2.slice(1).join(" ") || "";
    $("pfEmail").value = u.email || "";
    $("pfAddress").value = u.address || "";
    document.getElementById("profileForm").reset();
    /* reset password fields only; re-fill profile fields */
    $("pfFirst").value = p2[0] || "";
    $("pfLast").value = p2.slice(1).join(" ") || "";
    $("pfEmail").value = u.email || "";
    $("pfAddress").value = u.address || "";
  });
}

/* ============================================================
   LOGIN PAGE
   ============================================================ */
function initLoginPage() {
  const form = document.getElementById("loginForm");
  if (!form) return;

  /* demo user seed */
  const users = EXStore.get("ex_users", []);
  if (!users.some((u) => u.email === "demo@exclusive.com")) {
    users.push({ name: "Demo User", email: "demo@exclusive.com", pass: "123456", address: "Dhaka, Bangladesh" });
    EXStore.set("ex_users", users);
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const err = document.getElementById("loginError");
    const res = EXAuth.login(form.email.value, form.pass.value);
    if (res.ok) {
      err.textContent = "";
      EXUI.toast("Welcome back, " + EXAuth.user().name + " ✓");
      setTimeout(() => { location.href = "account.html"; }, 600);
    } else {
      err.textContent = res.msg;
    }
  });

  document.getElementById("forgetLink").addEventListener("click", (e) => {
    e.preventDefault();
    EXUI.toast("Password reset link (demo) — email check karein ✓");
  });
}

/* ============================================================
   SIGNUP PAGE
   ============================================================ */
function initSignupPage() {
  const form = document.getElementById("signupForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const err = document.getElementById("signupError");
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const pass = form.pass.value;
    if (!name || !email || !pass) { err.textContent = "Tamam fields bharain."; return; }
    if (pass.length < 6) { err.textContent = "Password kam az kam 6 characters ka ho."; return; }
    const res = EXAuth.signup(name, email, pass);
    if (res.ok) {
      err.textContent = "";
      EXUI.toast("Account created — welcome " + name + " ✓");
      setTimeout(() => { location.href = "index.html"; }, 700);
    } else {
      err.textContent = res.msg;
    }
  });

  document.getElementById("googleBtn").addEventListener("click", () =>
    EXUI.toast("Google sign-in (demo only) ✓"));
}

/* ============================================================
   ABOUT PAGE — team dots
   ============================================================ */
function initAboutPage() {
  const dots = document.getElementById("teamDots");
  if (!dots) return;
  const cards = Array.from(document.querySelectorAll("#teamGrid .team-card"));

  function show(offset) {
    cards.forEach((c, i) => {
      c.style.display = i >= offset && i < offset + 3 ? "" : "none";
    });
  }

  dots.querySelectorAll("button").forEach((b, i) =>
    b.addEventListener("click", () => {
      dots.querySelectorAll("button").forEach((x) => x.classList.remove("active"));
      b.classList.add("active");
      show(Math.min(i, cards.length - 3));
    }));

  show(0); /* design ke mutabiq pehle 3 members */
}

/* ============================================================
   CONTACT PAGE
   ============================================================ */
function initContactPage() {
  const form = document.getElementById("contactForm");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let ok = true;
    ["name", "email", "phone", "message"].forEach((n) => {
      if (!form[n].value.trim()) {
        form[n].style.border = "1px solid var(--red)";
        ok = false;
      } else form[n].style.border = "";
    });
    if (!ok) { EXUI.toast("Please fill all required fields (*)", false); return; }
    form.reset();
    EXUI.toast("Message sent — hum 24 hours mein contact karenge ✓");
  });
}

/* ============================================================
   BOOT — page dispatch
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  const p = document.body.dataset.page;
  ({
    products: initProductsPage,
    "product-details": initDetailsPage,
    cart: initCartPage,
    checkout: initCheckoutPage,
    wishlist: initWishlistPage,
    account: initAccountPage,
    login: initLoginPage,
    signup: initSignupPage,
    about: initAboutPage,
    contact: initContactPage,
  }[p] || function () {})();
});
