(function () {
  const C = window.TELTORI, P = C.price, S = window.Store;
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const D = '০১২৩৪৫৬৭৮৯', bn = n => String(n).replace(/\d/g, d => D[d]);
  const money = n => '৳' + bn(n.toLocaleString('en-US')), norm = s => s.replace(/[০-৯]/g, d => D.indexOf(d));
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const ready = new Promise(r => setTimeout(r, reduced ? 0 : 1650));
  ready.then(() => document.body.classList.add('ready'));

  $$('.split').forEach((el, gi) => { el.innerHTML = '<span style="--i:' + gi + '">' + el.innerHTML + '</span>'; });

  function count(el) {
    const n = +el.dataset.count, suf = el.dataset.suf || '', t0 = performance.now(), dur = reduced ? 1 : 1200;
    (function step(t) { const k = Math.min(1, (t - t0) / dur), v = Math.round(n * (1 - Math.pow(1 - k, 3))); el.textContent = bn(v.toLocaleString('en-US')) + suf; if (k < 1) requestAnimationFrame(step); })(t0);
  }
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; const el = e.target; io.unobserve(el);
    const go = () => { el.classList.add('in'); if (el.dataset.count) count(el); };
    el.closest('.hero') ? ready.then(go) : go();
  }), { threshold: .3 });
  $$('.split,[data-count]').forEach(el => io.observe(el));

  const sd = $('.seeds');
  if (sd && !reduced) for (let i = 0; i < 14; i++) {
    const s = document.createElement('i');
    s.style.cssText = 'left:' + Math.random() * 100 + '%;animation-duration:' + (7 + Math.random() * 7) + 's;animation-delay:-' + Math.random() * 12 + 's';
    sd.appendChild(s);
  }

  function paintPrices() {
    $$('[data-price]').forEach(e => e.textContent = money(P));
    $$('[data-edit="price.old"]').forEach(e => e.textContent = 'নিয়মিত মূল্য ' + money(C.regularPrice));
  }
  paintPrices();
  const fq = $('#fq');
  for (let i = 1; i <= C.maxQty; i++) fq.insertAdjacentHTML('beforeend', '<option value="' + i + '">' + bn(i) + ' সেট — ' + money(i * P) + '</option>');
  const sum = () => { const q = +fq.value; $('#sUnit').textContent = money(P) + ' × ' + bn(q); $('#sTot').textContent = money(q * P); };
  fq.onchange = sum; sum();
  $('#fn').addEventListener('focus', () => S.warm(), { once: true });

  let lastMsg = '';
  $$('[data-wa]').forEach(a => a.href = 'https://wa.me/' + C.shopPhone);
  function paintMessenger() {
    $$('[data-ms]').forEach(a => {
      if (!C.messenger) { a.hidden = true; return; }
      a.hidden = false; a.href = 'https://m.me/' + C.messenger; a.target = '_blank'; a.rel = 'noopener';
      a.onclick = () => { if (lastMsg && navigator.clipboard) navigator.clipboard.writeText(lastMsg).catch(() => {}); };
    });
  }
  paintMessenger();

  const msg = o => ['🛒 *নতুন অর্ডার — Teltori Hair Care Combo*', 'অর্ডার নং: ' + o.orderNo, 'নাম: ' + o.name, 'ফোন: ' + o.phone, 'ঠিকানা: ' + o.address,
    'পণ্য: নারকেল তেল ৫০০ মি.লি. + ক্যাস্টর অয়েল ২৫০ মি.লি. × ' + bn(o.qty) + ' সেট', 'মূল্য: ' + money(o.total), 'ডেলিভারি চার্জ: ফ্রি',
    'সর্বমোট: ' + money(o.total) + ' (ক্যাশ অন ডেলিভারি)'].concat(o.note ? ['নোট: ' + o.note] : []).join('\n');

  $('#of').addEventListener('submit', async e => {
    e.preventDefault();
    const name = $('#fn').value.trim(), addr = $('#fa').value.trim(), note = $('#fnote').value.trim();
    const phone = norm($('#fp').value).replace(/[\s-]/g, '').replace(/^\+?88/, ''), err = $('#err');
    if (name.length < 2) return err.textContent = 'আপনার নাম লিখুন।', $('#fn').focus();
    if (!/^01[3-9]\d{8}$/.test(phone)) return err.textContent = 'সঠিক ১১ সংখ্যার মোবাইল নম্বর দিন, যেমনঃ 01712345678', $('#fp').focus();
    if (addr.length < 8) return err.textContent = 'বাসা/হোল্ডিং, রোড, থানা ও জেলাসহ সম্পূর্ণ ঠিকানা লিখুন।', $('#fa').focus();
    err.textContent = '';
    const btn = $('#sub'); btn.disabled = true; btn.textContent = 'অর্ডার পাঠানো হচ্ছে…';
    const q = +fq.value;
    const o = { orderNo: 'TT-' + Date.now().toString(36).slice(-5).toUpperCase(), product: 'Hair Care Combo (নারকেল তেল + ক্যাস্টর অয়েল)', name, phone, address: addr, qty: q, unitPrice: P, total: q * P, note, status: 'new', createdAt: Date.now() };
    if (window.dataLayer) window.dataLayer.push({ event: 'purchase_order', order_id: o.orderNo, value: o.total, currency: 'BDT', quantity: q });
    await S.create(o);
    const url = 'https://wa.me/' + C.shopPhone + '?text=' + encodeURIComponent(msg(o));
    const rows = [['নাম', o.name], ['ফোন', o.phone], ['ঠিকানা', o.address], ['পরিমাণ', bn(o.qty) + ' সেট'], ['সর্বমোট', money(o.total) + ' (ক্যাশ অন ডেলিভারি)'], ['অবস্থা', S.ST.new]];
    $('#dSum').innerHTML = rows.map(r => '<div><dt>' + r[0] + '</dt><dd>' + esc(r[1]) + '</dd></div>').join('');
    $('#of').hidden = true; $('#done').hidden = false;
    $('#dNo').textContent = o.orderNo; $('#dWa').href = url; lastMsg = msg(o); paintMessenger();
    $('#done').scrollIntoView({ block: 'center', behavior: 'smooth' });
    setTimeout(() => { location.href = url; }, 3500);
  });

  const dlg = $('#mine');
  async function openMine() {
    dlg.showModal(); const box = $('#mList'); box.innerHTML = '<p>লোড হচ্ছে…</p>';
    const l = await S.mine();
    box.innerHTML = l.length ? l.map(o => '<article><b>' + esc(o.orderNo) + '</b><span class="tag">' + (S.ST[o.status] || o.status) + '</span><p>' +
      new Date(o.createdAt).toLocaleDateString('bn-BD') + ' · ' + bn(o.qty) + ' সেট · ' + money(o.total) + '</p></article>').join('')
      : '<p>এই ডিভাইস থেকে এখনো কোনো অর্ডার করা হয়নি।</p>';
  }
  $$('.openMine').forEach(b => b.onclick = openMine);
  $('#mClose').onclick = () => dlg.close();

  const bar = $('.bar'); let inOrder = false;
  const upd = () => bar.classList.toggle('show', scrollY > 500 && !inOrder);
  new IntersectionObserver(e => { inOrder = e[0].isIntersecting; upd(); }).observe($('#order'));
  addEventListener('scroll', upd, { passive: true });

  window.Teltori = { paintPrices, paintMessenger, money, bn, esc };
})();
