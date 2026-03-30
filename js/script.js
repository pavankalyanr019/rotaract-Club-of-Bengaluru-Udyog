
// --- Configuration ---
const ENDPOINTS = {
  // If Rotary publishes a JSON endpoint for global stats, add it here.
  // Below are proxy-based attempts that may or may not work depending on CORS.
  // They are optional and have graceful fallbacks.
  globalCountTry: [
    // Example: a GitHub RAW (if you later host a small JSON like: {"rotaractors": 203000})
    // "https://raw.githubusercontent.com/your-org/your-repo/main/rotaract_stats.json",
  ],
  // Add RSS/JSON endpoints for district 3192 news if available later.
  district3192Try: [
    // "https://district3192.rotary.org/news.json"
  ]
};

async function fetchWithFallback(urls, parseFn, fallbackValue){
  for(const url of urls){
    try{
      const res = await fetch(url, {cache: 'no-store'});
      if(!res.ok) continue;
      const data = await parseFn(res);
      if(data) return data;
    }catch(e){/* try next */}
  }
  return fallbackValue;
}

function setText(id, text){
  const el = document.getElementById(id);
  if(el) el.textContent = text;
}

function setDistrictUpdates(list){
  const ul = document.getElementById('district-updates');
  if(!ul) return;
  ul.innerHTML = '';
  list.forEach(item=>{
    const li = document.createElement('li');
    li.innerHTML = `<a href="${item.link || '#'}" target="_blank" rel="noopener">${item.title}</a> <small>${item.date||''}</small>`;
    ul.appendChild(li);
  });
}

// Attempt to get global Rotaractor count
(async ()=>{
  const defaultCount = { value: '200,000+ Rotaractors in 10,000+ clubs (est.)', live:false };
  const result = await fetchWithFallback(
    ENDPOINTS.globalCountTry,
    async (res)=>{
      const type = res.headers.get('content-type') || '';
      if(type.includes('application/json')){
        const json = await res.json();
        if(json.rotaractors) return { value: json.rotaractors.toLocaleString(), live:true };
      }else{
        // try to parse text and regex (if page contains a number pattern) — optional
        const txt = await res.text();
        const m = txt.match(/(\d{3}[,\d]*)\s*Rotaractor/i);
        if(m) return { value: m[1], live:true };
      }
      return null;
    },
    defaultCount
  );
  const target = document.getElementById('global-count');
  if(target){
    target.innerHTML = result.live ? `${result.value} <small>(live)</small>` : `${result.value} <small>(fallback)</small>`;
  }
})();

// Attempt to get District 3192 updates
(async ()=>{
  const defaultUpdates = [
    {title: 'District 3192 fellowship meetup scheduled', date: '', link: '#'},
    {title: 'Call for volunteers: Community Health Camp', date: '', link: '#'},
  ];
  const updates = await fetchWithFallback(
    ENDPOINTS.district3192Try,
    async (res)=>{
      const type = res.headers.get('content-type') || '';
      if(type.includes('application/json')){
        const json = await res.json();
        if(Array.isArray(json.items)){
          return json.items.slice(0,5).map(i=>({title:i.title, date:i.date || '', link:i.link || '#'}));
        }
      }
      return null;
    },
    defaultUpdates
  );
  setDistrictUpdates(updates);
})();

// Add animated sea-themed doodles on every page.
document.addEventListener('DOMContentLoaded', ()=>{
  const anchors = Array.from({length:4},()=> '⚓');
  const ships = Array.from({length:4},()=> '⛵');
  const waves = Array.from({length:4},()=> '🌊');
  const compasses = Array.from({length:2},()=> '🧭');
  const doodles = [...anchors, ...ships, ...waves, ...compasses];
  doodles.sort(()=>Math.random()-0.5);

  doodles.forEach((emoji, i)=>{
    const c = document.createElement('span');
    const sizeClass = i % 3 === 0 ? 'large' : (i % 2 === 0 ? 'small' : '');
    c.className = 'doodle-floating ' + sizeClass;
    c.textContent = emoji;
    c.style.left = `${5 + Math.random() * 85}%`;
    c.style.top = `${5 + Math.random() * 85}%`;
    c.style.animationDuration = `${5 + Math.random() * 7}s`;
    c.style.animationDelay = `${Math.random() * 4}s`;
    c.style.zIndex = '0';
    document.body.appendChild(c);
  });
});



// Hamburger Menu Toggle functionality
document.addEventListener('DOMContentLoaded', () => {
  const menuBtn = document.getElementById('mobile-menu-btn');
  const navMenu = document.getElementById('nav-menu');
  if (menuBtn && navMenu) {
    menuBtn.addEventListener('click', () => {
      navMenu.classList.toggle('active');
    });
  }
});
