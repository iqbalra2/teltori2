/* অ্যাডমিন এডিট মোড: ডাবল-ক্লিক বা ⚙ বাটনে পাসওয়ার্ড দিয়ে লগইন করলে
   data-edit যুক্ত লেখাগুলো ও দাম সরাসরি ওয়েবসাইটে বদলানো যায়। */
(function () {
  const C = window.TELTORI, S = window.Store;
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const dlg = $('#editLogin');
  let on = false, bar = null;

  function collect() {
    const o = { price: C.price, regularPrice: C.regularPrice };
    $$('[data-edit]').forEach(el => { o[el.dataset.edit] = el.innerText.trim(); });
    return o;
  }
  function apply(o) {
    if (!o) return;
    if (o.price) { C.price = +o.price; window.Teltori && window.Teltori.paintPrices(); }
    if (o.regularPrice) C.regularPrice = +o.regularPrice;
    $$('[data-edit]').forEach(el => { const v = o[el.dataset.edit]; if (v != null && el.dataset.edit !== 'price.old') el.innerText = v; });
    window.Teltori && window.Teltori.paintPrices();
  }
  S.siteLoad().then(apply);

  function makeBar() {
    if (bar) return bar;
    bar = document.createElement('div');
    bar.style.cssText = 'position:fixed;left:0;right:0;top:0;z-index:60;background:#0A2A18;color:#fff;padding:10px 16px;display:flex;gap:10px;align-items:center;justify-content:center;flex-wrap:wrap;font:15px "Hind Siliguri",sans-serif;box-shadow:0 4px 14px rgba(0,0,0,.3)';
    bar.innerHTML = '<b style="color:#C6E84A">এডিট মোড চালু</b>' +
      '<span style="opacity:.85">লেখায় ক্লিক করে বদলান</span>' +
      '<label style="display:flex;gap:6px;align-items:center">অফার মূল্য <input id="edPrice" type="number" style="width:90px;padding:5px 8px;border-radius:6px;border:0"></label>' +
      '<button id="edSave" style="background:#C6E84A;color:#0A2A18;border:0;padding:8px 18px;border-radius:999px;font-weight:700;cursor:pointer">সেভ করুন</button>' +
      '<button id="edExport" style="background:transparent;color:#fff;border:1px solid rgba(255,255,255,.5);padding:8px 16px;border-radius:999px;cursor:pointer">GitHub-এর জন্য ফাইল</button>' +
      '<button id="edOrders" style="background:transparent;color:#fff;border:1px solid rgba(255,255,255,.5);padding:8px 16px;border-radius:999px;cursor:pointer">অর্ডার দেখুন</button>' +
      '<button id="edExit" style="background:transparent;color:#C6E84A;border:0;text-decoration:underline;cursor:pointer">বন্ধ করুন</button>';
    document.body.appendChild(bar);
    document.body.style.paddingTop = '54px';
    $('#edPrice').value = C.price;
    $('#edSave').onclick = save;
    $('#edExport').onclick = exportJson;
    $('#edOrders').onclick = () => location.href = 'admin.html';
    $('#edExit').onclick = stop;
    return bar;
  }

  function start() {
    on = true; makeBar();
    $$('[data-edit]').forEach(el => { el.contentEditable = 'true'; el.style.outline = '1.5px dashed rgba(198,232,74,.7)'; el.style.outlineOffset = '3px'; el.style.cursor = 'text'; });
  }
  function stop() {
    on = false; $$('[data-edit]').forEach(el => { el.contentEditable = 'false'; el.style.outline = ''; el.style.cursor = ''; });
    if (bar) { bar.remove(); bar = null; document.body.style.paddingTop = ''; }
  }
  async function save() {
    const o = collect(); o.price = +$('#edPrice').value || C.price;
    try { await S.siteSave(o); apply(o); $('#edSave').textContent = 'সেভ হয়েছে ✓'; setTimeout(() => $('#edSave').textContent = 'সেভ করুন', 1500); }
    catch (e) { alert('সেভ করা যায়নি: ' + e.message); }
  }
  function exportJson() {
    const o = collect(); o.price = +$('#edPrice').value || C.price;
    const blob = new Blob([JSON.stringify(o, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'site-content.json'; a.click();
  }

  async function tryLogin() {
    const pass = $('#epPass').value, errEl = $('#epErr');
    errEl.textContent = '';
    try { await S.editLogin(pass); dlg.close(); start(); }
    catch (e) { errEl.textContent = 'পাসওয়ার্ড সঠিক নয়।'; }
  }
  $('#epGo').onclick = tryLogin;
  $('#epPass').addEventListener('keydown', e => { if (e.key === 'Enter') tryLogin(); });
  $('#epClose').onclick = () => dlg.close();
  function openLogin() { $('#epPass').value = ''; $('#epErr').textContent = ''; dlg.showModal(); $('#epPass').focus(); }
  document.addEventListener('dblclick', e => { if (!on && !e.target.closest('input,textarea,select,button,a,dialog')) openLogin(); });
  $('#gearBtn').onclick = () => on ? stop() : openLogin();
})();
