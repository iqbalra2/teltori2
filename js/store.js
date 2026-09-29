/* অর্ডার ও সাইট-কনটেন্ট সংরক্ষণ: Firebase কনফিগ থাকলে ক্লাউডে, না থাকলে এই ব্রাউজারে (ডেমো) */
(function () {
  const C = window.TELTORI, KEY = 'teltori_orders_v1', SK = 'teltori_site_v1';
  const fbOn = !!(C.firebase && C.firebase.apiKey && C.firebase.projectId);
  const ST = { new: 'নতুন', confirmed: 'কনফার্ম হয়েছে', shipping: 'ডেলিভারিতে আছে', delivered: 'ডেলিভারি সম্পন্ন', cancelled: 'বাতিল' };
  const ls = {
    get(k) { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  let fb = null, localCb = null;
  const load = src => new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s); });
  function init() {
    if (!fbOn) return Promise.resolve(null);
    if (fb) return fb;
    const b = 'https://www.gstatic.com/firebasejs/10.14.1/firebase-';
    fb = load(b + 'app-compat.js').then(() => Promise.all([load(b + 'auth-compat.js'), load(b + 'firestore-compat.js')])).then(() => {
      firebase.initializeApp(C.firebase);
      return { auth: firebase.auth(), db: firebase.firestore() };
    }).catch(e => { console.warn(e); return null; });
    return fb;
  }
  async function user() {
    const f = await init(); if (!f) return null;
    return new Promise(res => {
      const un = f.auth.onAuthStateChanged(async u => {
        un(); if (u) return res(u);
        try { res((await f.auth.signInAnonymously()).user); } catch (e) { res(null); }
      });
    });
  }
  const fix = d => { const x = d.data({ serverTimestamps: 'estimate' }); return Object.assign({ id: d.id }, x, { createdAt: x.createdAt ? x.createdAt.toMillis() : Date.now() }); };

  async function create(o) {
    const l = ls.get(KEY) || []; l.unshift(Object.assign({}, o, { id: o.orderNo, synced: false })); ls.set(KEY, l);
    const f = await init(), u = f && await user(); if (!u) return false;
    try {
      const d = Object.assign({}, o, { uid: u.uid, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
      await Promise.race([f.db.collection('orders').add(d), new Promise((_, r) => setTimeout(r, 3500))]);
      return true;
    } catch (e) { console.warn(e); return false; }
  }
  async function mine() {
    const loc = ls.get(KEY) || [], f = await init(), u = f && await user(); if (!u) return loc;
    try {
      const s = await f.db.collection('orders').where('uid', '==', u.uid).get();
      const cl = s.docs.map(fix), have = new Set(cl.map(x => x.orderNo));
      return cl.concat(loc.filter(x => !have.has(x.orderNo))).sort((a, b) => b.createdAt - a.createdAt);
    } catch (e) { return loc; }
  }
  /* ---- অ্যাডমিন: অর্ডার ---- */
  async function adminAuth(cb) {
    if (!fbOn) { cb({ demo: true }); return; }
    const f = await init(); if (!f) { cb(null); return; }
    f.auth.onAuthStateChanged(u => cb(u && !u.isAnonymous ? u : null));
  }
  async function login(e, p) { const f = await init(); if (!f) throw new Error('offline'); return f.auth.signInWithEmailAndPassword(e, p); }
  async function logout() { const f = await init(); if (f) await f.auth.signOut(); }
  async function adminWatch(cb, err) {
    if (!fbOn) { localCb = cb; cb(ls.get(KEY) || []); return () => {}; }
    const f = await init();
    return f.db.collection('orders').orderBy('createdAt', 'desc').onSnapshot(s => cb(s.docs.map(fix)), err);
  }
  async function setStatus(id, st) {
    if (!fbOn) { ls.set(KEY, (ls.get(KEY) || []).map(o => o.id === id ? Object.assign(o, { status: st }) : o)); localCb && localCb(ls.get(KEY) || []); return; }
    return (await init()).db.collection('orders').doc(id).update({ status: st });
  }
  async function remove(id) {
    if (!fbOn) { ls.set(KEY, (ls.get(KEY) || []).filter(o => o.id !== id)); localCb && localCb(ls.get(KEY) || []); return; }
    return (await init()).db.collection('orders').doc(id).delete();
  }
  /* ---- অ্যাডমিন: সাইট এডিট মোডের পাসওয়ার্ড যাচাই ---- */
  async function sha256(t) { const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(t)); return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join(''); }
  async function editLogin(pass) {
    if (fbOn) { await login(C.adminEmail, pass); return true; }
    const h = await sha256(pass); if (h !== C.adminPassHash) throw new Error('bad'); return true;
  }
  /* ---- সাইট কনটেন্ট (এডিট মোডে বদলানো লেখা/ছবি/প্রোডাক্ট তালিকা) ---- */
  async function siteLoad() {
    if (fbOn) {
      const f = await init(); if (!f) return null;
      try { const d = await f.db.collection('site').doc('content').get(); return d.exists ? d.data() : null; } catch (e) { return null; }
    }
    return ls.get(SK);
  }
  async function siteSave(o) {
    if (fbOn) { const f = await init(); if (!f) throw new Error('offline'); return f.db.collection('site').doc('content').set(o); }
    ls.set(SK, o);
  }
  window.Store = { fbOn, ST, create, mine, adminAuth, login, logout, adminWatch, setStatus, remove, editLogin, siteLoad, siteSave, warm: () => { if (fbOn) user(); } };
})();
