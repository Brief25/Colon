
    // =====================
    // CONFIGURE EMAILJS HERE
    // 1) Create account at https://www.emailjs.com/
    // 2) Add an Email Service (e.g., Gmail) => get SERVICE_ID
    // 3) Create a Template for orders and one for newsletter => get TEMPLATE_IDs
    // 4) Add Public Key => PUBLIC_KEY
    // 5) Paste below and in template fields, expect: order_id, items, subtotal, total, customer_name, customer_email, phone, address, city, pincode, notes; newsletter_email
    const EMAILJS_PUBLIC_KEY = "GAhdytROOEOD-S6bA";
    const EMAILJS_SERVICE_ID = "service_apkbe7o";
    const EMAILJS_ORDER_TEMPLATE_ID = "template_1xfe2hk";
    const EMAILJS_NEWSLETTER_TEMPLATE_ID = "template_8t9scqq";

    emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
    // =====================

    // Demo catalog
    const PRODUCTS = [
      {id:1, name:"Demo 1", description:"This is Description..", price:249, category:"Office", category:"Tabls", img:"assets/images/6538430.jpg"},
      {id:2, name:"Demo 2", price:249, category:"Office", img:"assets/images/6538430.jpg"}      
    ];

    // State
    let CART = JSON.parse(localStorage.getItem('mono_cart')||'[]');
    let FILTER = 'All';
    const CURRENCYSYMBOL = '₹';

    // Elements
    const grid = document.getElementById('grid');
    const filtersEl = document.getElementById('filters');
    const searchInput = document.getElementById('searchInput');
    const cartDrawer = document.getElementById('cartDrawer');
    const cartList = document.getElementById('cartList');
    const cartCount = document.getElementById('cartCount');
    const subtotalEl = document.getElementById('subtotal');
    const toast = document.getElementById('toast');

    // Utilities
    const money = n => CURRENCYSYMBOL + Number(n).toLocaleString('en-IN');
    const saveCart = () => localStorage.setItem('mono_cart', JSON.stringify(CART));
    const notify = (msg) => { toast.textContent = msg; toast.classList.add('show'); setTimeout(()=>toast.classList.remove('show'), 2000); }

    // Render filters
    const categories = ['All', ...Array.from(new Set(PRODUCTS.map(p=>p.category)))];
    function renderFilters(){
      filtersEl.innerHTML = '';
      categories.forEach(cat=>{
        const b = document.createElement('button');
        b.className = 'chip' + (FILTER===cat?' active':'');
        b.textContent = cat;
        b.onclick = ()=>{ FILTER = cat; renderGrid(); };
        filtersEl.appendChild(b);
      })
    }

    // Render grid
    function renderGrid(){
      const q = searchInput.value.trim().toLowerCase();
      const list = PRODUCTS.filter(p => (FILTER==='All' || p.category===FILTER) && (!q || p.name.toLowerCase().includes(q)));
      grid.innerHTML = list.map(p => `
        <article class="card" aria-label="${p.name}">
          <div class="media"><img src="${p.img}"></div>
          <div class="body">
            <div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start">
              <div>
                <div style="font-weight:700">${p.name}</div>
                <div style="font-weight:400">${p.description}</div>
                <div class="muted">${p.category}</div>
              </div>
              <div style="font-weight:700">${money(p.price)}</div>
            </div>
            <button class="btn block" data-add="${p.id}">Add to Cart</button>
          </div>
        </article>
      `).join('');
      grid.querySelectorAll('[data-add]').forEach(btn=>{
        btn.addEventListener('click',()=> addToCart(Number(btn.dataset.add)) );
      })
    }

    function addToCart(id){
      const item = CART.find(i=>i.id===id);
      if(item){ item.qty++; } else {
        const p = PRODUCTS.find(p=>p.id===id);
        CART.push({id:p.id,name:p.name,price:p.price,qty:1});
      }
      saveCart();
      updateCartUI();
      notify('Added to cart');
    }

    function updateCartUI(){
      cartCount.textContent = CART.reduce((s,i)=>s+i.qty,0);
      cartList.innerHTML = CART.length? CART.map(i=>`
        <div class="row">
          <img alt="${i.name}" src="data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80'><rect width='100%' height='100%' fill='black'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='white' font-family='monospace' font-size='10'>IMG</text></svg>`)}"/>
          <div>
            <div style="font-weight:700">${i.name}</div>
            <div class="muted">${money(i.price)}</div>
            <div class="qty" role="group" aria-label="Quantity selector">
              <button aria-label="Decrease" data-qty="dec" data-id="${i.id}">－</button>
              <button disabled style="min-width:36px">${i.qty}</button>
              <button aria-label="Increase" data-qty="inc" data-id="${i.id}">＋</button>
            </div>
          </div>
          <button class="iconbtn" aria-label="Remove" data-remove="${i.id}">🗑</button>
        </div>
      `).join('') : '<div class="muted">Your cart is empty.</div>';

      const subtotal = CART.reduce((s,i)=>s + i.price*i.qty,0);
      subtotalEl.textContent = money(subtotal);

      cartList.querySelectorAll('[data-qty]').forEach(btn=>{
        btn.onclick = ()=>{
          const id = Number(btn.dataset.id);
          const it = CART.find(x=>x.id===id);
          if(!it) return;
          if(btn.dataset.qty==='inc'){ it.qty++; }
          else { it.qty = Math.max(1, it.qty-1); }
          saveCart(); updateCartUI();
        }
      })
      cartList.querySelectorAll('[data-remove]').forEach(btn=>{
        btn.onclick = ()=>{ CART = CART.filter(x=>x.id!==Number(btn.dataset.remove)); saveCart(); updateCartUI(); }
      })
    }

    // Checkout
    const checkoutModal = document.getElementById('checkoutModal');
    document.getElementById('checkoutBtn').onclick = ()=>{
      if(!CART.length){ notify('Cart is empty'); return; }
      checkoutModal.classList.add('open');
      cartDrawer.classList.remove('open');
    }
    document.getElementById('closeCheckout').onclick = ()=> checkoutModal.classList.remove('open');

    document.getElementById('checkoutForm').addEventListener('submit', async (e)=>{
      e.preventDefault();
      if(!EMAILJS_PUBLIC_KEY || EMAILJS_PUBLIC_KEY.startsWith('REPLACE_')){
        notify('Configure EmailJS keys first');
        return;
      }
      const fd = new FormData(e.target);
      const data = Object.fromEntries(fd.entries());
      const orderId = 'ORD-' + Date.now();
      const itemsText = CART.map(i=> `${i.name} ×${i.qty} — ${money(i.price*i.qty)}`).join('\n');
      const subtotal = CART.reduce((s,i)=>s+i.price*i.qty,0);
      const shipping = subtotal>1500?0:120;
      const total = subtotal + shipping;

      const params = {
        order_id: orderId,
        items: itemsText,
        subtotal: money(subtotal),
        shipping: money(shipping),
        total: money(total),
        customer_name: data.name,
        customer_email: data.email,
        phone: data.phone,
        address: data.address,
        city: data.city,
        pincode: data.pincode,
        notes: data.notes||''
      };

      try{
        await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_ORDER_TEMPLATE_ID, params);
        notify('Order email sent ✅');
        CART = []; saveCart(); updateCartUI();
        checkoutModal.classList.remove('open');
        e.target.reset();
      }catch(err){
        console.error(err);
        notify('Failed to send email');
      }
    });

    // Newsletter
    /*document.getElementById('newsletterForm').addEventListener('submit', async (e)=>{
      e.preventDefault();
      const email = document.getElementById('newsletterEmail').value.trim();
      if(!email) return;
      try{
        await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_NEWSLETTER_TEMPLATE_ID, { newsletter_email: email });
        notify('Subscribed. Check your inbox ✅');
        e.target.reset();
      }catch(err){
        console.error(err);
        notify('Subscription failed');
      }
    });*/

    // Drawer + Search
    document.getElementById('openCart').onclick = ()=> cartDrawer.classList.add('open');
    document.getElementById('closeCart').onclick = ()=> cartDrawer.classList.remove('open');
    document.getElementById('clearCartBtn').onclick = ()=>{ CART=[]; saveCart(); updateCartUI(); };
    document.getElementById('searchBtn').onclick = renderGrid;
    searchInput.addEventListener('input', renderGrid);

    // Init
    renderFilters();
    renderGrid();
    updateCartUI();
    document.getElementById('year').textContent = new Date().getFullYear();
