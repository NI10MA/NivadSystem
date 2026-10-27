// FPS in 
const GAMES = [
  {n:'Valorant', b:300, cap:500}, {n:'Fortnite', b:110, cap:240},
  {n:'GTA V', b:120, cap:180}, {n:'Warzone', b:85, cap:240},
  {n:'Cyberpunk 2077', b:55, cap:200}, {n:'Elden Ring', b:60, cap:60}
];


/* ===== دیتا ها ===== */
const P = {
  cpus: [
    {n:'Ryzen 5 5500GT', price:42000000, socket:'AM4', idx:60, tdp:65},
    {n:'Ryzen 5 5600G', price:42000000, socket:'AM4', idx:70, tdp:65},
    {n:'Ryzen 7 5700X3D', price:60000000, socket:'AM4', idx:100, tdp:105},
    {n:'Ryzen 5 7600', price:32000000, socket:'AM5', idx:100, tdp:65},
    {n:'Ryzen 7 7800X3D', price:74000000, socket:'AM5', idx:140, tdp:120},
    {n:'Core i5-12400F', price:40000000, socket:'LGA1700', idx:75, tdp:65},
    {n:'Core i5-13400F', price:37000000, socket:'LGA1700', idx:90, tdp:65},
    {n:'Core i7-14700K', price:89000000, socket:'LGA1700', idx:150, tdp:125}
  ],
  gpus: [
    {n:'RX 6600', price:70000000, idx:85, tdp:132, len:238},
    {n:'RTX 4060', price:100000000, idx:100, tdp:115, len:240},
    {n:'RTX 4060 Ti', price:120000000, idx:118, tdp:160, len:250},
    {n:'RTX 4070 Ti Super', price:190000000, idx:165, tdp:220, len:300},
    {n:'RTX 4080 Super', price:300000000, idx:235, tdp:320, len:310}
  ],
  mbs: [
    {n:'A520M', price:20000000, socket:'AM4', ram:'DDR4'},
    {n:'B550M', price:20000000, socket:'AM4', ram:'DDR4'},
    {n:'B650M', price:44000000, socket:'AM5', ram:'DDR5'},
    {n:'X670E', price:78000000, socket:'AM5', ram:'DDR5'},
    {n:'H610M', price:22000000, socket:'LGA1700', ram:'DDR4'},
    {n:'B760M DDR5', price:25000000, socket:'LGA1700', ram:'DDR5'},
    {n:'Z790', price:60000000, socket:'LGA1700', ram:'DDR5'}
  ],
  rams: [
    {n:'16GB DDR4 3200', price:27000000, type:'DDR4'},
    {n:'32GB DDR4 3200', price:55000000, type:'DDR4'},
    {n:'16GB DDR5 5600', price:59000000, type:'DDR5'},
    {n:'32GB DDR5 6000', price:118000000, type:'DDR5'}
  ],
  psus: [
    {n:'450W', price:12000000, watt:450},
    {n:'550W Bronze', price:13200000, watt:550},
    {n:'650W Gold', price:15000000, watt:650}, 
    {n:'750W Gold', price:18000000, watt:750},
    {n:'850W Gold', price:20000000, watt:850}
  ],
  cases: [
    {n:'کیس ساده ATX', price:15000000, maxGpu:300},
    {n:'کیس Mid Tower', price:20000000, maxGpu:350},
    {n:'کیس شیشه‌ای پریمیوم', price:30000000, maxGpu:400}
  ]
};
const SSD = {n:'SSD ۵۱۲ گیگ NVMe', price:50000000};
// b = FPS روی کارت RTX 4060 (idx=100)، cap = سقف FPS بازی

/* ===== منطق انتخاب با بودجه ===== */
const $ = id => document.getElementById(id);
const fmt = n => n.toLocaleString('fa-IR');

const RES = {1080:{cpu:1.3,f:1}, 1440:{cpu:1.6,f:.72}, 2160:{cpu:2.2,f:.42}};
function findBuilds(budget, res){
  const all = [], R = RES[res];
  for (const c of P.cpus) for (const m of P.mbs){
    if (m.socket !== c.socket) continue;                 // سوکت
    for (const r of P.rams){
      if (r.type !== m.ram) continue;                    // نوع رم
      for (const g of P.gpus) for (const s of P.psus){
        if (s.watt < (c.tdp + g.tdp + 100) * 1.4) continue; // توان پاور
        for (const k of P.cases){
          if (k.maxGpu < g.len) continue;                // طول گرافیک
          const cost = c.price+m.price+r.price+g.price+s.price+k.price+SSD.price;
          if (cost > budget) continue;
          const eff = Math.min(g.idx, c.idx * R.cpu);    // گلوگاه CPU
          all.push({sc:eff*1000 + g.idx*10 - cost/1e6, eff, cost, c, m, r, g, s, k});
        }
      }
    }
  }
  all.sort((x,y) => y.sc - x.sc);
  const out = [], seen = new Set();
  for (const x of all){ const key = x.c.n+x.g.n; if (!seen.has(key)){ seen.add(key); out.push(x); } if (out.length === 3) break; }
  return out;
}

let cur = null;
function render(b, budget){
  cur = b;
  const rows = [['پردازنده',b.c],['مادربرد',b.m],['رم',b.r],['گرافیک',b.g],['پاور',b.s],['کیس',b.k],['حافظه',SSD]];
  $('parts').innerHTML = rows.map(([t,p],i) =>
    `<li data-i="${i}"><span>${t}</span><b>${p.n}</b><span>${fmt(p.price)}</span></li>`).join('');
  $('parts').querySelectorAll('li').forEach((li,i) => li.onclick = () => pick(rows[i][1], rows[i][0]));
  $('total').innerHTML = `جمع: <span id="tot"></span> تومان<small>${isFinite(budget) ? (budget >= b.cost ? 'باقی‌مانده' : 'بیشتر از بودجه') + ': ' + fmt(Math.abs(budget-b.cost)) + ' تومان' : ''}</small>`;
  $('fps').innerHTML = GAMES.map(g => {
    const f = Math.round(Math.min(g.cap, g.b * b.eff / 100 * RES[$('res').value].f));
    return `<div class="game"><div class="n"><span>${g.n}</span><b>${fmt(f)}</b></div>
      <div class="bar"><i class="${f>=100?'hi':f<60?'lo':''}" style="width:0" data-w="${Math.min(100, f/g.cap*100)}%"></i></div></div>`;
  }).join('');
  chips(b, $('res').value); build3D(b); pick(null);
  countUp($('tot'), b.cost);
  setTimeout(() => document.querySelectorAll('#fps .bar i').forEach(i => i.style.width = i.dataset.w), 40);
}

/* ===== صحنه سه‌بعدی ===== */
const stage = $('stage');
const scene = new THREE.Scene();
const cam = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
cam.position.set(6.5, 3, 9);
const ren = new THREE.WebGLRenderer({antialias:true});
const touchy = matchMedia('(pointer: coarse)').matches;
ren.setPixelRatio(Math.min(devicePixelRatio, touchy ? 1.5 : 2));   // روی موبایل سبک‌تر
ren.shadowMap.enabled = true; ren.shadowMap.type = THREE.PCFSoftShadowMap; ren.toneMappingExposure = 1.15;
ren.toneMapping = THREE.ACESFilmicToneMapping;
ren.outputEncoding = THREE.sRGBEncoding;
ren.setClearColor(0x0d0a14, 1);
scene.fog = new THREE.FogExp2(0x0d0a14, 0.018);
stage.appendChild(ren.domElement);
// افکت درخشش (Bloom) برای نورهای RGB
const comp = new THREE.EffectComposer(ren);
comp.addPass(new THREE.RenderPass(scene, cam));
comp.addPass(new THREE.UnrealBloomPass(new THREE.Vector2(512,512), .8, .55, .85));
const ctl = new THREE.OrbitControls(cam, ren.domElement);
ctl.enableDamping = true; ctl.autoRotate = true; ctl.autoRotateSpeed = 1.2;
ctl.minDistance = 5; ctl.maxDistance = 20;
// روی لمسی‌ها چرخش دوربین پیش‌فرض قفله تا اسکرول صفحه روی سه‌بعدی گیر نکنه
if (touchy){
  ctl.enabled = false;
  const rb = $('rot'), lab = () => rb.textContent = ctl.enabled ? '🔓 چرخش فعال' : '🔒 چرخش قفل (اسکرول آزاده)';
  rb.hidden = false; lab();
  rb.onclick = () => { ctl.enabled = !ctl.enabled; rb.setAttribute('aria-pressed', ctl.enabled); lab(); };
}
scene.add(new THREE.HemisphereLight(0xbfe6ff, 0x101a2a, 0.8));
const dl = new THREE.DirectionalLight(0xffffff, 1.1); dl.position.set(5,9,6); dl.castShadow = true;
Object.assign(dl.shadow.camera, {left:-8, right:8, top:8, bottom:-8}); dl.shadow.mapSize.set(2048,2048); dl.shadow.bias = -0.0004;
scene.add(dl);
// محیط انعکاسی (استودیوی نور): فلزها و شیشه واقعی‌تر برق می‌زنن
(function(){
  const es = new THREE.Scene();
  es.add(new THREE.Mesh(new THREE.BoxGeometry(30,30,30), new THREE.MeshBasicMaterial({color:0x1a2230, side:THREE.BackSide})));
  [[0,14,0,12,1,12,0xffffff,6],[10,3,6,1,8,12,0xfff2e0,4],[-10,3,-6,1,8,12,0x9fd0ff,3],[0,2,14,14,8,1,0xffe0e0,2]].forEach(([x,y,z,w,hh,d,c,i]) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w,hh,d), new THREE.MeshBasicMaterial({color:new THREE.Color(c).multiplyScalar(i)}));
    m.position.set(x,y,z); es.add(m); });
  scene.environment = new THREE.PMREMGenerator(ren).fromScene(es, .04).texture;
})();
const glow = new THREE.PointLight(0x5fd0ff, 1.2, 9); glow.position.set(0,0,0); scene.add(glow);
const lc = new THREE.PointLight(0x5fd0ff, 1.2, 6); lc.position.set(0,0,1.9); scene.add(lc);      // نور فن‌های جلو
const lo = new THREE.PointLight(0xff7a3d, 1.0, 5); lo.position.set(-.2,-.9,0); scene.add(lo);    // نور کارت گرافیک
const floor = new THREE.Mesh(new THREE.PlaneGeometry(40,40), new THREE.ShadowMaterial({opacity:.35}));
floor.rotation.x = -Math.PI/2; floor.position.y = -2.45; floor.receiveShadow = true; scene.add(floor);
const grid = new THREE.GridHelper(30, 30, 0x2a4466, 0x1b3350); grid.position.y = -2.44; scene.add(grid);

const group = new THREE.Group(); scene.add(group);
let parts = [], spinners = [], selP = null, iso = false, ex = 0, cableGrp = null;
const rgbMats = [], tgt = new THREE.Vector3(), _zero = new THREE.Vector3(), _v = new THREE.Vector3();

function resize(){
  const w = stage.clientWidth, h = stage.clientHeight;
  ren.setSize(w, h); comp.setSize(w, h); cam.aspect = w/h; cam.fov = cam.aspect < 1 ? Math.min(75, 42 + (1 - cam.aspect)*45) : 42; cam.updateProjectionMatrix();
}
addEventListener('resize', resize); resize();
if (window.ResizeObserver) new ResizeObserver(resize).observe(stage);

const M = (c, o={}) => { const m = new THREE.MeshStandardMaterial({color:c, roughness:o.r ?? .5, metalness:o.m ?? .3,
  emissive:o.e ?? 0, transparent:(o.a ?? 1) < 1, opacity:o.a ?? 1}); m.userData.e = o.e ?? 0; m.emissiveIntensity = o.i ?? 1; if (o.rgb) rgbMats.push(m); return m; };
function B(g, w,h,d, x,y,z, mat){
  const m = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), mat);
  m.position.set(x,y,z); m.castShadow = m.receiveShadow = true; g.add(m); return m;
}
function fan(r, col, rgb){
  const o = new THREE.Group(), s = new THREE.Group(); o.add(s);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(r, .035, 8, 28), M(0x0d1117,{m:.6,e:rgb ?? 0,i:2.5,rgb:!!rgb})); ring.rotation.x = Math.PI/2; o.add(ring);
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(r*.28, r*.28, .06, 16), M(rgb ?? 0x222a33,{e:rgb ?? 0,i:2,rgb:!!rgb})); s.add(hub);
  for (let i=0;i<7;i++){
    const a = i/7*Math.PI*2, bl = new THREE.Mesh(new THREE.BoxGeometry(r*.75, .012, r*.3), M(col,{r:.4}));
    bl.position.set(Math.cos(a)*r*.55, 0, Math.sin(a)*r*.55); bl.rotation.set(.35, -a, 0); s.add(bl);
  }
  spinners.push(s); return o;
}
function part(label, p, pos, dir){
  const g = new THREE.Group(); g.position.set(...pos);
  g.userData = {label, p, base:new THREE.Vector3(...pos), dir:new THREE.Vector3(...dir)};
  group.add(g); parts.push(g); return g;
}

// جعبه‌ی گوشه‌گرد (برای شروود کارت گرافیک و ...)
function RB(g, w,h,d, r, x,y,z, mat){
  const s = new THREE.Shape(), a = w/2, c = h/2;
  s.moveTo(-a+r,-c); s.lineTo(a-r,-c); s.quadraticCurveTo(a,-c,a,-c+r); s.lineTo(a,c-r); s.quadraticCurveTo(a,c,a-r,c);
  s.lineTo(-a+r,c); s.quadraticCurveTo(-a,c,-a,c-r); s.lineTo(-a,-c+r); s.quadraticCurveTo(-a,-c,-a+r,-c);
  const geo = new THREE.ExtrudeGeometry(s,{depth:d,bevelEnabled:true,bevelSize:r*.3,bevelThickness:r*.3,bevelSegments:2});
  geo.translate(0,0,-d/2);
  const m = new THREE.Mesh(geo, mat); m.position.set(x,y,z); m.castShadow = m.receiveShadow = true; g.add(m); return m;
}
const CY = (g, r,h, x,y,z, mat, rot) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,16), mat);
  m.position.set(x,y,z); if (rot) m.rotation.set(...rot); m.castShadow = m.receiveShadow = true; g.add(m); return m; };

let _pcb;
function pcbMat(){       // بافت مدارچاپی: خطوط طلایی، پد و چیپ
  if (!_pcb){
    const c = document.createElement('canvas'); c.width = c.height = 512; const x = c.getContext('2d');
    x.fillStyle = '#0d1210'; x.fillRect(0,0,512,512); x.strokeStyle = '#c9a24a55'; x.lineWidth = 1.5;
    for (let i=0;i<90;i++){ x.beginPath(); let px = Math.random()*512, py = Math.random()*512; x.moveTo(px,py);
      for (let k=0;k<4;k++){ if (k%2) px += (Math.random()-.5)*160; else py += (Math.random()-.5)*160; x.lineTo(px,py); } x.stroke(); }
    x.fillStyle = '#c9a24a88'; for (let i=0;i<140;i++) x.fillRect(Math.random()*505, Math.random()*505, 4+Math.random()*5, 4+Math.random()*5);
    x.fillStyle = '#1b2220'; for (let i=0;i<18;i++) x.fillRect(Math.random()*470, Math.random()*470, 28+Math.random()*24, 28+Math.random()*24);
    _pcb = new THREE.CanvasTexture(c); _pcb.encoding = THREE.sRGBEncoding; _pcb.anisotropy = 4;
  }
  const m = M(0xffffff,{r:.55,m:.25}); m.map = _pcb; return m;
}

function build3D(b){
  while (group.children.length) group.remove(group.children[0]);
  parts = []; spinners = []; rgbMats.length = 0;
  const steel = M(0x1b2129,{m:.7,r:.45}), dark = M(0x0d1117,{m:.5}), silver = M(0xc9d3dd,{m:.9,r:.3}), RGB = 0x5fd0ff;
  let g;

  /* ---------- کیس ---------- */
  group.add(new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(2.2,4.6,4.4)), new THREE.LineBasicMaterial({color:0x2f5d85})));
  B(group, .05,4.6,4.4, -1.1,0,0, steel);                    // دیواره‌ی پشت مادربرد
  B(group, 2.2,.05,4.4, 0,-2.3,0, steel);                    // کف
  [[-.9,-1.8],[.9,-1.8],[-.9,1.8],[.9,1.8]].forEach(([x,z]) => CY(group, .13,.16, x,-2.4,z, dark));  // پایه‌ها

  g = part('کیس (پنل جلو)', b.k, [0,0,2.25], [0,0,3.2]);     // پنل جلو: قاب + مش + ۳ فن
  B(g, .1,4.6,.12, -1.1,0,0, steel); B(g, .1,4.6,.12, 1.1,0,0, steel);
  B(g, 2.3,.16,.12, 0,2.3,0, steel); B(g, 2.3,.16,.12, 0,-2.3,0, steel);
  for (let i=0;i<21;i++) B(g, .025,4.4,.03, -1+i*.1,0,.05, M(0x2a323b,{m:.8}));
  [-1.5,0,1.5].forEach(y => { const f = fan(.5, 0x1c232b, RGB); f.rotation.x = Math.PI/2; f.position.set(0,y,-.2); g.add(f); });

  g = part('کیس (پنل بالا)', b.k, [0,2.3,0], [0,2.8,0]);
  B(g, 2.2,.05,4.4, 0,0,0, steel);
  for (let i=0;i<10;i++) B(g, 1.5,.02,.07, 0,.035,-1.7+i*.2, dark);   // دریچه‌ی هوا
  CY(g, .09,.05, .7,.04,1.85, M(0xffffff,{e:0xffffff,i:2}));          // دکمه پاور

  g = part('کیس (پنل پشت)', b.k, [0,0,-2.2], [0,0,-2.6]);
  B(g, 2.2,4.6,.05, 0,0,0, steel);
  const rf = fan(.34, 0x1c232b, RGB); rf.rotation.x = Math.PI/2; rf.position.set(-.1,1.1,.12); g.add(rf);
  for (let i=0;i<6;i++) B(g, .5,.12,.03, -.65,-.2-i*.17,.04, silver);    // درپوش اسلات‌ها

  g = part('کیس (پنل شیشه‌ای)', b.k, [1.1,0,0], [3.2,0,0]);
  B(g, .04,4.5,4.3, 0,0,0, M(0xcfe8ff,{a:.1,r:.02,m:0}));
  B(g, .06,.1,4.4, 0,2.27,0, steel); B(g, .06,.1,4.4, 0,-2.27,0, steel);
  B(g, .06,4.6,.1, 0,0,2.17, steel); B(g, .06,4.6,.1, 0,0,-2.17, steel);
  [[1.9,2.0],[1.9,-2.0],[-1.9,2.0],[-1.9,-2.0]].forEach(([z,y]) => CY(g, .06,.05, .04,y*1.05,z*1.05, silver, [0,0,Math.PI/2]));

  /* ---------- مادربرد ---------- */
  g = part('مادربرد', b.m, [-.95,.5,0], [-1.4,0,0]);
  B(g, .08,3.2,3.2, 0,0,0, pcbMat());                       // PCB مشکی
  B(g, .22,1.0,.45, .1,.55,-1.35, dark);                              // شروود درگاه‌ها
  B(g, .18,.4,1.3, .09,1.35,-.5, M(0x2b333c,{m:.8}));                 // هیت‌سینک VRM
  for (let i=0;i<8;i++) B(g, .2,.4,.02, .1,1.35,-1.1+i*.17, silver);
  B(g, .14,.6,.6, .08,-.7,.85, M(0x2b333c,{m:.8}));                   // چیپست
  B(g, .02,.22,.22, .16,-.7,.85, M(0xffb347,{e:0xffb347,i:2}));
  B(g, .07,.1,1.3, .07,-.9,-.85, dark);                                // PCIe x16
  B(g, .07,.1,.6, .07,-1.2,-.5, dark);
  B(g, .12,.9,.18, .08,.3,1.45, M(0xe8e4d8));                          // کانکتور ۲۴ پین
  [[-1.5,1.5],[1.5,1.5],[-1.5,-1.5],[1.5,-1.5]].forEach(([y,z]) => CY(g, .05,.04, .05,y,z, silver, [0,0,Math.PI/2]));

  /* ---------- پردازنده + کولر برجی ---------- */
  g = part('پردازنده و کولر', b.c, [-.88,1.1,-.6], [-2,1.2,-1.4]);
  B(g, .06,.5,.5, 0,0,0, silver);
  B(g, .1,.5,.5, .08,0,0, M(0x6e7a86,{m:.9}));                         // بیس مسی/آلومینیومی
  for (let i=0;i<14;i++) B(g, .7,1.1,.012, .45,0,-.4+i*.06, silver);   // فین‌ها
  for (let i=0;i<3;i++) CY(g, .02,1.2, .2+i*.18,0,-.05, M(0xb87333,{m:.9,r:.3}));  // هیت‌پایپ
  B(g, .8,.8,.1, .45,0,.42, M(0x0d1117,{m:.6}));                        // قاب فن
  const cf = fan(.34, 0x1c232b, RGB); cf.rotation.x = Math.PI/2; cf.position.set(.45,0,.48); g.add(cf);

  /* ---------- رم ---------- */
  [.55,.8].forEach((z,i) => {
    const r = part('رم', b.r, [-.86,1.1,z], [-2,1.5,1.2+i*.5]);
    B(r, .05,1.1,.1, 0,0,0, M(0x14110f));
    B(r, .09,1.0,.12, .05,0,0, M(0x1a2027,{m:.7}));
    B(r, .02,.85,.03, .115,0,0, M(RGB,{e:RGB,i:2.5,rgb:1}));
  });

  /* ---------- کارت گرافیک (طول در جهت جلو-عقب، فن‌ها رو به پایین) ---------- */
  const gl = b.g.len/180, gw = .8;
  g = part('کارت گرافیک', b.g, [-.45,-.4,-1.85+gl/2], [0,-.7,2.8]);
  const sh = RB(g, gw,gl,.3, .06, 0,0,0, M(0x1a2027,{m:.6,r:.4})); sh.rotation.x = Math.PI/2;
  B(g, gw,.02,gl, 0,.16,0, M(0x8a96a3,{m:.9,r:.3}));                    // بک‌پلیت
  B(g, gw+.1,.38,.03, 0,0,-gl/2-.02, silver);                           // براکت
  B(g, .02,.05,gl*.8, gw/2+.01,0,0, M(0xff7a3d,{e:0xff7a3d,i:2.5,rgb:1}));  // RGB کناری
  B(g, .02,.16,.5, gw/2+.01,0,-gl*.28, M(0x2b333c,{m:.8}));
  B(g, .14,.1,.3, gw/2-.1,.2,gl*.3, dark);                              // کانکتور برق
  const nf = gl > 1.7 ? 3 : 2, fr = Math.min(.36, gl/nf*.46);
  for (let i=0;i<nf;i++){ const f = fan(fr, 0x1c232b, 0xff7a3d); f.position.set(0,-.17,-gl/2+gl*(i+.5)/nf); g.add(f); }

  /* ---------- SSD و پاور ---------- */
  g = part('حافظه', SSD, [-.86,.2,-.5], [-1.6,.4,-1.2]);
  B(g, .08,.28,.9, 0,0,0, M(0x2b333c,{m:.7})); B(g, .1,.2,.5, .02,0,0, M(0x5fd0ff,{m:.5,e:0x0a3a52}));

  g = part('پاور', b.s, [.15,-1.95,-1.2], [0,-2,-1.5]);
  B(g, 1.5,.8,1.6, 0,0,0, M(0x2a3139,{m:.6}));
  [.32,.2].forEach(r => { const t = new THREE.Mesh(new THREE.TorusGeometry(r,.02,8,24), silver); t.rotation.y = Math.PI/2; t.position.x = .76; g.add(t); });
  B(g, .02,.2,.6, .76,-.25,0, M(0xffb347,{e:0x553300}));

  // کابل‌های پاور (فقط وقتی قطعات بسته‌ان دیده می‌شن)
  cableGrp = new THREE.Group(); group.add(cableGrp);
  const cab = (pts, r) => { const t = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(...p))), 48, r, 8), M(0x15181c,{r:.55,m:.15}));
    t.castShadow = true; cableGrp.add(t); };
  cab([[-.2,-1.8,-.35],[-.2,-1.9,.9],[-.55,-1.4,1.75],[-.82,.1,1.8],[-.84,.8,1.55]], .09);          // ۲۴ پین مادربرد
  cab([[.5,-1.5,-.9],[.62,-1.0,-.75],[.3,-.4,-.6],[-.12,-.2,-1.85+gl*.8]], .06);                      // برق کارت گرافیک
  cab([[.3,-1.5,-2.0],[.45,-.2,-2.05],[.3,1.5,-2.0],[-.4,2.0,-1.6],[-.84,2.0,-1.0]], .06);            // برق پردازنده

  // پنل‌های کیس سایه نندازن تا داخل کیس تاریک نشه
  parts.forEach(p => { if (p.userData.p === b.k) p.traverse(m => m.castShadow = false); });
  group.children.forEach(m => { if (m.isMesh) m.castShadow = false; });

  // برچسب‌های شناور
  $('labels').innerHTML = ''; const seen = new Set();
  parts.forEach(g => { if (seen.has(g.userData.p)) return; seen.add(g.userData.p);
    const el = document.createElement('div'); el.className = 'lbl'; el.textContent = g.userData.label;
    $('labels').appendChild(el); g.userData.el = el; });
}

/* انتخاب قطعه با کلیک */
const ray = new THREE.Raycaster(), mouse = new THREE.Vector2();
let down = null;
ren.domElement.addEventListener('pointerdown', e => { down = [e.clientX, e.clientY]; ctl.autoRotate = false; });
ren.domElement.addEventListener('pointerup', e => {
  if (!down || Math.hypot(e.clientX-down[0], e.clientY-down[1]) > 5) return;
  const r = ren.domElement.getBoundingClientRect();
  mouse.set(((e.clientX-r.left)/r.width)*2-1, -((e.clientY-r.top)/r.height)*2+1);
  ray.setFromCamera(mouse, cam);
  const hit = ray.intersectObjects(parts.filter(x => x.visible), true)[0];
  if (!hit) return pick(null);
  let o = hit.object; while (o && !o.userData.p) o = o.parent;
  pick(o.userData.p, o.userData.label);
});

function pick(p, label){
  selP = p;
  const sg = parts.find(g => g.userData.p === p);          // دوربین به سمت قطعه می‌ره
  tgt.copy(sg ? sg.userData.base : _zero).addScaledVector(sg ? sg.userData.dir : _zero, ex);
  if (p) ctl.autoRotate = false;
  parts.forEach(g => g.traverse(m => { if (m.material) m.material.emissive.setHex(g.userData.p === p ? 0x554400 : m.material.userData.e); }));
  document.querySelectorAll('#parts li').forEach(li => li.classList.toggle('on', !!p && li.querySelector('b').textContent === p.n));
  if (p) $('info').innerHTML = `<b>${label}:</b> ${p.n} — ${fmt(p.price)} تومان`;
  else { iso = false; $('info').textContent = 'روی هر قطعه یا ردیف لیست کلیک کن تا قیمتش رو ببینی. بکش تا بچرخه.'; }
}
$('iso').onclick = () => { if (selP) iso = !iso; };

(function loop(){
  requestAnimationFrame(loop);
  ex += (+$('explode').value - ex) * 0.1;                   // حرکت نرم
  parts.forEach(g => { g.position.copy(g.userData.base).addScaledVector(g.userData.dir, ex);
    g.visible = !iso || g.userData.p === selP; });
  spinners.forEach(s => s.rotation.y += 0.25);
  if (cableGrp) cableGrp.visible = ex < .03;
  ctl.target.lerp(tgt, .06);
  const T = performance.now()/5000;                         // چرخش رنگ RGB
  rgbMats.forEach((m,i) => m.emissive.setHSL((T + i*.04) % 1, 1, .55));
  const w = stage.clientWidth, h = stage.clientHeight;
  parts.forEach(g => { const el = g.userData.el; if (!el) return;
    g.getWorldPosition(_v).project(cam);
    el.style.left = (_v.x*.5+.5)*w + 'px'; el.style.top = (-_v.y*.5+.5)*h + 'px';
    el.style.opacity = ex > .25 && g.visible ? 1 : 0; });
  ctl.update(); comp.render();
})();

function chips(b, res){
  const R = RES[res], watt = b.c.tdp + b.g.tdp + 100;
  const bn = b.c.idx*R.cpu < b.g.idx*.9 ? 'پردازنده گلوگاهه' : b.c.idx*R.cpu > b.g.idx*1.8 ? 'گرافیک گلوگاهه' : 'ترکیب متعادل';
  $('chips').innerHTML = `<span>⚡ مصرف تقریبی ${fmt(watt)} وات</span><span>⚖️ ${bn}</span><span>🎮 امتیاز ${fmt(Math.round(b.eff))}</span>`;
}

/* ===== اتصال دکمه ===== */
let builds = [], idx = 0;
function show(i){
  idx = i;
  document.querySelectorAll('#alts button').forEach((b,k) => b.setAttribute('aria-pressed', k === i));
  render(builds[i], +$('budget').value);
}
function run(){
  const budget = +$('budget').value;
  builds = findBuilds(budget, $('res').value);
  if (!builds.length){
    $('msg').textContent = 'با این بودجه کیس کامل نمی‌شه. حداقل ۱۵ میلیون تومان لازمه.';
    $('alts').innerHTML = '';
    return;
  }
  $('msg').textContent = '';
  $('alts').innerHTML = builds.map((_,i) => `<button aria-pressed="false">پیشنهاد ${fmt(i+1)}</button>`).join('');
  document.querySelectorAll('#alts button').forEach((b,i) => b.onclick = () => show(i));
  show(0);
}
$('go').onclick = run;
$('res').onchange = () => mode === 'mine' ? mine() : run();
$('budget').addEventListener('keydown', e => e.key === 'Enter' && run());

// قیمت‌ها از prices.json (اگه با سرور محلی باز شده باشه)؛ وگرنه همون دیتای بالا
fetch('prices.json').then(r => r.json()).then(d => {
  const all = [...P.cpus,...P.gpus,...P.mbs,...P.rams,...P.psus,...P.cases,SSD,...EXTRA];
  all.forEach(p => { if (d.prices[p.n]) p.price = d.prices[p.n]; });
  $('pdate').textContent = 'آخرین آپدیت قیمت: ' + d.updated + '.';
}).catch(() => { $('pdate').textContent = 'قیمت‌ها نمونه‌ان.'; }).finally(() => { run(); renderSearch(); });

function countUp(el, to){
  const t0 = performance.now();
  (function f(t){ const k = Math.min(1, (t - t0)/700);
    el.textContent = fmt(Math.round(to * (1 - Math.pow(1 - k, 3))));
    if (k < 1) requestAnimationFrame(f); })(t0);
}

/* ===== پارالاکس هیرو + ظاهر شدن بخش‌ها هنگام اسکرول ===== */
(function(){
  const hero = $('hero'), bg = $('heroBg'), tx = $('heroText'), img = $('heroImg');
  const fail = () => hero.classList.add('noimg');
  img.addEventListener('error', fail); if (img.complete && !img.naturalWidth) fail();
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!calm){
    let busy = false;
    const upd = () => { const y = Math.min(scrollY, innerHeight*1.2);
      bg.style.transform = `translate3d(0,${y*.35}px,0) scale(${1 + y/innerHeight*.12})`;   // عکس کندتر حرکت می‌کنه
      tx.style.transform = `translate3d(0,${y*.6}px,0)`;                                   // متن تندتر
      tx.style.opacity = Math.max(0, 1 - y/(innerHeight*.6)); busy = false; };
    addEventListener('scroll', () => { if (!busy){ busy = true; requestAnimationFrame(upd); } }, {passive:true});
    upd();
  }
  const io = new IntersectionObserver(es => es.forEach(e => e.isIntersecting && e.target.classList.add('in')), {threshold:.08});
  document.querySelectorAll('.layout,.games,.search').forEach(el => { el.classList.add('reveal'); io.observe(el); });
})();

/* ===== پس‌زمینه‌ی جوی: شهر شب، باران، مه، رعدوبرق + پارالاکس اسکرول ===== */
(function(){
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function city(el, seed, lo, hi, fill, lit){
    let r = seed, x = -20, out = '';
    const rnd = () => (r = r * 16807 % 2147483647) / 2147483647;
    while (x < 1620){
      const w = 45 + rnd()*80, h = lo + rnd()*(hi - lo);
      out += `<rect x="${x|0}" y="${(400-h)|0}" width="${w|0}" height="${h|0}" fill="${fill}"/>`;
      if (lit) for (let i = 0, n = rnd()*5|0; i < n; i++)
        out += `<rect class="win" x="${(x+6+rnd()*(w-18))|0}" y="${(400-h+10+rnd()*(h-40))|0}" width="7" height="10" style="animation-delay:-${(rnd()*5).toFixed(1)}s"/>`;
      x += w + rnd()*6;
    }
    el.setAttribute('viewBox','0 0 1600 400'); el.setAttribute('preserveAspectRatio','xMidYMax slice'); el.innerHTML = out;
  }
  city($('cityFar'), 7, 90, 230, '#1c0d18', false);
  city($('cityNear'), 31, 130, 330, '#0a0610', true);

  // باران
  const cv = $('rain'), cx = cv.getContext('2d'); let W, H, drops = [];
  const size = () => { W = cv.width = innerWidth; H = cv.height = innerHeight;
    drops = Array.from({length: Math.min(170, W/8|0)}, () => ({x:Math.random()*W, y:Math.random()*H, l:10+Math.random()*16, v:12+Math.random()*10})); };
  size(); addEventListener('resize', size);
  if (!calm){
    (function f(){
      cx.clearRect(0,0,W,H); cx.strokeStyle = 'rgba(170,200,230,.22)'; cx.beginPath();
      drops.forEach(d => { cx.moveTo(d.x, d.y); cx.lineTo(d.x - d.l*.25, d.y + d.l); d.y += d.v; d.x -= d.v*.25;
        if (d.y > H || d.x < 0){ d.y = -20; d.x = Math.random()*(W+200); } });
      cx.stroke(); requestAnimationFrame(f);
    })();
    // رعدوبرق
    (function bolt(){ setTimeout(() => { const f = $('flash'); f.style.opacity = .5; setTimeout(() => f.style.opacity = 0, 90);
      setTimeout(() => { f.style.opacity = .3; setTimeout(() => f.style.opacity = 0, 140); }, 230); bolt(); }, 7000 + Math.random()*9000); })();
  }

  // پارالاکس: لایه‌های دورتر کندتر، نزدیک‌تر تندتر
  const sky = $('sky'), far = $('cityFar'), near = $('cityNear'), fog = $('fog');
  let busy = false;
  const lay = () => { const y = scrollY;
    sky.style.transform  = `translate3d(0,${Math.min(y*.08,160)}px,0) scale(${1 + Math.min(y/4000,.15)})`;
    far.style.transform  = `translate3d(${-Math.min(y*.01,30)}px,${-Math.min(y*.05,120)}px,0)`;
    near.style.transform = `translate3d(${-Math.min(y*.03,50)}px,${-Math.min(y*.13,160)}px,0)`;
    fog.style.transform  = `translate3d(0,${-Math.min(y*.2,240)}px,0)`; busy = false; };
  if (!calm){ addEventListener('scroll', () => { if (!busy){ busy = true; requestAnimationFrame(lay); } }, {passive:true}); lay(); }
})();

/* ===== جستجوی قطعات (مشخصات + قیمت) ===== */
const CATS = {cpus:'پردازنده', gpus:'کارت گرافیک', mbs:'مادربرد', rams:'رم', psus:'پاور', cases:'کیس', ssd:'حافظه', cool:'خنک‌کننده', mon:'مانیتور'};
const ENG  = {cpus:'cpu processor', gpus:'gpu graphics vga', mbs:'motherboard mainboard', rams:'ram memory', psus:'psu power supply', cases:'case', ssd:'ssd hdd storage', cool:'cooler fan', mon:'monitor display'};
const EXTRA = [
  {cat:'ssd', n:'SSD ۱ ترابایت NVMe', price:28000000},
  {cat:'ssd', n:'هارد ۲ ترابایت HDD', price:55000000},
  {cat:'cool', n:'DeepCool AK400', price:10300000},
  {cat:'cool', n:'Cooler Master Hyper 212', price:8700000},
  {cat:'cool', n:'Arctic Liquid Freezer II 240', price:18000000},
  {cat:'mon', n:'مانیتور ۲۴ اینچ 1080p 144Hz', price:33500000},
  {cat:'mon', n:'مانیتور ۲۷ اینچ 1440p 165Hz', price:48000000},
  {cat:'mon', n:'مانیتور ۲۷ اینچ 4K 144Hz', price:43700000}
];
// مشخصات کلی و تقریبی؛ برای دقیق‌ترین عدد به صفحه‌ی سازنده نگاه کن
const SP = {
  'Ryzen 5 5500':'۶ هسته / ۱۲ رشته · 3.6–4.2GHz · کش 16MB · بدون گرافیک داخلی',
  'Ryzen 5 5600':'۶ هسته / ۱۲ رشته · 3.5–4.4GHz · کش 32MB',
  'Ryzen 7 5700X3D':'۸ هسته / ۱۶ رشته · تا 4.1GHz · کش 96MB (3D V-Cache)',
  'Ryzen 5 7600':'۶ هسته / ۱۲ رشته · 3.8–5.1GHz · کش 32MB · گرافیک داخلی',
  'Ryzen 7 7800X3D':'۸ هسته / ۱۶ رشته · تا 5.0GHz · کش 96MB (3D V-Cache)',
  'Core i5-12400F':'۶ هسته / ۱۲ رشته · تا 4.4GHz · کش 18MB · بدون گرافیک داخلی',
  'Core i5-13400F':'۱۰ هسته (6P+4E) / ۱۶ رشته · تا 4.6GHz · کش 20MB',
  'Core i7-14700K':'۲۰ هسته (8P+12E) / ۲۸ رشته · تا 5.6GHz · کش 33MB · قابل اورکلاک',
  'RX 6600':'۸ گیگ GDDR6 · باس 128bit · ۱۷۹۲ استریم پردازنده',
  'RTX 4060':'۸ گیگ GDDR6 · باس 128bit · ۳۰۷۲ هسته CUDA · DLSS 3',
  'RTX 4060 Ti':'۸ گیگ GDDR6 · باس 128bit · ۴۳۵۲ هسته CUDA · DLSS 3',
  'RTX 4070 Super':'۱۲ گیگ GDDR6X · باس 192bit · ۷۱۶۸ هسته CUDA · DLSS 3',
  'RTX 4080 Super':'۱۶ گیگ GDDR6X · باس 256bit · ۱۰۲۴۰ هسته CUDA · DLSS 3',
  'A520M':'فرم mATX · یک اسلات M.2 · بدون اورکلاک پردازنده',
  'B550M':'فرم mATX · PCIe 4.0 · دو اسلات M.2',
  'B650M':'فرم mATX · M.2 نسل ۵ · پشتیبانی از اورکلاک',
  'X670E':'فرم ATX · PCIe 5.0 برای گرافیک و M.2 · اورکلاک قوی',
  'H610M':'فرم mATX · یک اسلات M.2 · بدون اورکلاک',
  'B760M DDR5':'فرم mATX · M.2 نسل ۴ · حافظه DDR5',
  'Z790':'فرم ATX · PCIe 5.0 · اورکلاک پردازنده و رم',
  '16GB DDR4 3200':'۲×۸ گیگ · CL16 · ولتاژ 1.35V',
  '32GB DDR4 3200':'۲×۱۶ گیگ · CL16 · ولتاژ 1.35V',
  '16GB DDR5 5600':'۲×۸ گیگ · CL40',
  '32GB DDR5 6000':'۲×۱۶ گیگ · CL30 · پروفایل EXPO/XMP',
  '450W':'استاندارد ATX · بدون گواهی راندمان مشخص',
  '550W Bronze':'گواهی 80+ Bronze · ATX',
  '650W Gold':'گواهی 80+ Gold · ATX',
  '750W Gold':'گواهی 80+ Gold · ATX · مناسب کارت‌های پرمصرف',
  '850W Gold':'گواهی 80+ Gold · ATX · کابل‌های قدرتمند برای گرافیک سنگین',
  'کیس ساده ATX':'پشتیبانی ATX و mATX · یک فن · بدون شیشه',
  'کیس Mid Tower':'شیشه‌ای تمپرد · ۳ فن جلو · ATX',
  'کیس شیشه‌ای پریمیوم':'شیشه‌ی تمپرد · ۴ فن RGB · ATX و E-ATX',
  'SSD ۵۱۲ گیگ NVMe':'ظرفیت 512GB · M.2 PCIe 3.0 · سرعت خواندن حدود 3000MB/s',
  'SSD ۱ ترابایت NVMe':'ظرفیت 1TB · M.2 PCIe 4.0 · سرعت خواندن حدود 5000MB/s',
  'هارد ۲ ترابایت HDD':'ظرفیت 2TB · 7200 دور · SATA',
  'DeepCool AK400':'کولر هوایی برجی · ۴ هیت‌پایپ · فن 120mm · تا ۱۵۰W',
  'Cooler Master Hyper 212':'کولر هوایی برجی · فن 120mm · تا ۱۳۰W',
  'Arctic Liquid Freezer II 240':'خنک‌کننده‌ی مایع 240mm · دو فن 120mm · تا ۲۵۰W',
  'مانیتور ۲۴ اینچ 1080p 144Hz':'پنل IPS · 1920×1080 · ۱۴۴ هرتز · ۱ms',
  'مانیتور ۲۷ اینچ 1440p 165Hz':'پنل IPS · 2560×1440 · ۱۶۵ هرتز · ۱ms',
  'مانیتور ۲۷ اینچ 4K 144Hz':'پنل IPS · 3840×2160 · ۱۴۴ هرتز · HDR'
};
const derived = (c, p) => ({
  cpus:`سوکت ${p.socket} · مصرف ${p.tdp}W`, gpus:`مصرف ${p.tdp}W · طول ${p.len}mm`,
  mbs:`سوکت ${p.socket} · رم ${p.ram}`, rams:`نوع ${p.type}`, psus:`توان ${p.watt}W`,
  cases:`حداکثر طول گرافیک ${p.maxGpu}mm`}[c] || '');
const CATALOG = [
  ...Object.keys(CATS).filter(k => P[k]).flatMap(k => P[k].map(p => ({cat:k, p}))),
  {cat:'ssd', p:SSD}, ...EXTRA.map(p => ({cat:p.cat, p}))
].map(c => { c.specs = [...derived(c.cat, c.p).split(' · '), ...(SP[c.p.n] || '').split(' · ')].filter(Boolean);
  c.hay = norm(`${CATS[c.cat]} ${ENG[c.cat]} ${c.p.n} ${c.specs.join(' ')}`); return c; });

function norm(s){
  return s.toLowerCase().replace(/[\s\-_.]/g,'').replace(/ي/g,'ی').replace(/ك/g,'ک').replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d));
}
let selCat = 'all';
function renderSearch(){
  const toks = $('q').value.split(/\s+/).map(norm).filter(Boolean), sort = $('sort').value;
  const list = CATALOG.filter(c => (selCat === 'all' || c.cat === selCat) && toks.every(t => c.hay.includes(t)));
  if (sort) list.sort((a,b) => sort === 'asc' ? a.p.price - b.p.price : b.p.price - a.p.price);
  $('count').textContent = `${fmt(list.length)} مورد پیدا شد`;
  $('results').innerHTML = list.length ? list.map(c =>
    `<article class="card"><div class="ch"><b>${c.p.n}</b><span class="tag">${CATS[c.cat]}</span></div>
     <div class="price">${fmt(c.p.price)} <small>تومان</small></div>
     <ul class="spec">${c.specs.map(s => `<li>${s}</li>`).join('')}</ul></article>`).join('')
    : '<p class="empty">چیزی پیدا نشد. اسم دیگه‌ای امتحان کن، مثلاً «رم» یا «AM5».</p>';
}
$('cats').innerHTML = [['all','همه'], ...Object.entries(CATS)].map(([k,t]) => `<button data-c="${k}" aria-pressed="${k==='all'}">${t}</button>`).join('');
$('cats').onclick = e => { const b = e.target.closest('button'); if (!b) return; selCat = b.dataset.c;
  document.querySelectorAll('#cats button').forEach(x => x.setAttribute('aria-pressed', x === b)); renderSearch(); };
$('q').addEventListener('input', renderSearch); $('sort').onchange = renderSearch;
renderSearch();

/* ===== چیدمان دلخواه: خودت قطعه‌ها رو انتخاب کن ===== */
let mode = 'auto';
const FIELDS = [['cpus','پردازنده','c'],['mbs','مادربرد','m'],['rams','رم','r'],['gpus','کارت گرافیک','g'],['psus','پاور','s'],['cases','کیس','k']];
function fillMine(){
  const keep = {};
  FIELDS.forEach(([k,,f]) => { const s = $('s_'+k); keep[k] = s ? +s.value : Math.max(0, P[k].indexOf(cur && cur[f])); });
  $('mineSel').innerHTML = FIELDS.map(([k,t]) => `<label for="s_${k}">${t}</label><select id="s_${k}">` +
    P[k].map((p,i) => `<option value="${i}">${p.n} — ${fmt(p.price)} تومان</option>`).join('') + '</select>').join('');
  FIELDS.forEach(([k]) => { $('s_'+k).value = keep[k]; $('s_'+k).onchange = mine; });
}
function mine(){
  const g = {}; FIELDS.forEach(([k,,f]) => g[f] = P[k][+$('s_'+k).value]);
  const b = {...g, cost: g.c.price+g.m.price+g.r.price+g.g.price+g.s.price+g.k.price+SSD.price};
  b.eff = Math.min(g.g.idx, g.c.idx * RES[$('res').value].cpu);
  const w = [], need = Math.ceil((g.c.tdp + g.g.tdp + 100) * 1.4 / 50) * 50;
  if (g.c.socket !== g.m.socket) w.push(`سوکت پردازنده (${g.c.socket}) با مادربرد (${g.m.socket}) نمی‌خونه.`);
  if (g.r.type !== g.m.ram) w.push(`رم ${g.r.type} روی این مادربرد (${g.m.ram}) کار نمی‌کنه.`);
  if (g.s.watt < need) w.push(`پاور کمه؛ حداقل حدود ${fmt(need)} وات پیشنهاد می‌شه.`);
  if (g.k.maxGpu < g.g.len) w.push(`کارت گرافیک (${fmt(g.g.len)}mm) توی این کیس (حداکثر ${fmt(g.k.maxGpu)}mm) جا نمی‌شه.`);
  $('warn').innerHTML = w.length ? w.map(x => `<li>⚠️ ${x}</li>`).join('') : '<li class="ok">✅ همه‌ی قطعات با هم سازگارن.</li>';
  render(b, Infinity);
}
function setMode(m){
  mode = m; $('autoBox').hidden = m !== 'auto'; $('mineBox').hidden = m !== 'mine';
  $('tAuto').setAttribute('aria-pressed', m === 'auto'); $('tMine').setAttribute('aria-pressed', m === 'mine');
  if (m === 'mine'){ $('msg').textContent = ''; $('alts').innerHTML = ''; fillMine(); mine(); } else run();
}
$('tAuto').onclick = () => setMode('auto'); $('tMine').onclick = () => setMode('mine');
