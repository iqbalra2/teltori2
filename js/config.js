/* ===== এখানে প্রয়োজনে পরিবর্তন করুন ===== */
window.TELTORI = {
  shopPhone: '8801763613445',   // WhatsApp নম্বর (দেশের কোডসহ, + ছাড়া)
  messenger: '',                // ⬅ মেসেঞ্জার ইউজারনেম/আইডি বসান (যেমনঃ 'teltori.bd') — ফাঁকা থাকলে বাটন লুকানো থাকবে
  price: 990,                   // অফার মূল্য
  regularPrice: 1500,           // নিয়মিত মূল্য
  maxQty: 10,
  // অ্যাডমিন এডিট মোড: ওয়েবসাইটে ডাবল-ক্লিক করুন, বা মোবাইলে নিচের ⚙ বাটনে চাপুন
  adminEmail: 'admin@teltori.com',
  adminPassHash: 'fccd6aaf76e8f6b2fa1612b6d05d75bd5225150722de3134f4ae5ed43aa2ac99',   // ডেমো পাসওয়ার্ড: Teltori@2026 (নিচের নোট দেখুন)
  // GTM কন্টেইনার আইডি বসালে (যেমনঃ 'GTM-XXXXXXX') Google Tag Manager চালু হবে
  gtmId: '',
  // Firebase বসালে অর্ডার সবার জন্য জমা হবে ও অ্যাডমিন প্যানেলে দেখা যাবে (README দেখুন)
  firebase: { apiKey: '', authDomain: '', projectId: '', appId: '' }
};
