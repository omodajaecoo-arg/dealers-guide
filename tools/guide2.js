function initGuide(){


function svgColor(svg, color){ return svg.replace(/#000000/g, color); }
function el(html){ const t=document.createElement('template'); t.innerHTML=html.trim(); return t.content.firstElementChild; }

/* Logos en demos */
document.getElementById('cob-logo').innerHTML = LOGOS['oj-horizontal'];
document.getElementById('clear-logo').innerHTML = LOGOS['omoda'];

/* Tarjetas de logos */
const LOGO_LIST = [
  {key:'oj-horizontal', name:'OMODA | JAECOO horizontal', desc:'Versión principal de la red.'},
  {key:'oj-apilado', name:'OMODA | JAECOO apilado', desc:'Para espacios angostos o altos.', tall:true},
  {key:'omoda', name:'OMODA', desc:'Para piezas de modelos Omoda.'},
  {key:'jaecoo', name:'JAECOO', desc:'Para piezas de modelos JAECOO.'}
];
const grid = document.getElementById('logo-grid');
LOGO_LIST.forEach(l=>{
  const c = el(`<div class="logo-card">
    <div class="logo-tiles">
      <div class="tile light ${l.tall?'tall':''}">${LOGOS[l.key]}</div>
      <div class="tile darkt ${l.tall?'tall':''}">${svgColor(LOGOS[l.key],'#FFFFFF')}</div>
    </div>
    <div class="logo-info">
      <div><b>${l.name}</b><div class="small muted">${l.desc}</div></div>
      <div class="btn-row">
        <button class="btn ghost" type="button" data-dl="${l.key}" data-fmt="svg" data-col="negro">SVG negro</button>
        <button class="btn ghost" type="button" data-dl="${l.key}" data-fmt="svg" data-col="blanco">SVG blanco</button>
        <button class="btn" type="button" data-dl="${l.key}" data-fmt="png" data-col="negro">PNG negro</button>
        <button class="btn" type="button" data-dl="${l.key}" data-fmt="png" data-col="blanco">PNG blanco</button>
      </div>
    </div>
  </div>`);
  grid.appendChild(c);
});

/* Escala de fondos */
const scale = document.getElementById('scale');
for(let i=0;i<=10;i++){
  const pct=i*10, v=Math.round(255*(1-pct/100)), dark=pct>=60;
  const mid = pct>50 && pct<60;
  const d = el(`<div style="background:rgb(${v},${v},${v});color:${dark?'#fff':'#000'}">${svgColor(LOGOS['omoda'], dark?'#FFFFFF':'#000000')}<span>${pct}%</span></div>`);
  scale.appendChild(d);
}

/* Errores comunes */
const DONTS = [
  ['d-stretch','Deformarlo o estirarlo'],
  ['d-rotate','Rotarlo o inclinarlo'],
  ['d-shadow','Agregarle sombras o efectos'],
  ['d-color','Cambiarle el color'],
  ['d-contrast','Usarlo con poco contraste'],
  ['d-busy','Ponerlo sobre fondos recargados']
];
const donts = document.getElementById('donts');
DONTS.forEach(([cls,txt])=>{
  donts.appendChild(el(`<div class="dont"><div class="stage ${cls}">${LOGOS['omoda']}</div><div class="cap"><span class="x" aria-hidden="true">✕</span><span>${txt}</span></div></div>`));
});

/* Paleta */
const SW = [
  {n:'Negro', hex:'#000000', rgb:'0 · 0 · 0', cmyk:'0 · 0 · 0 · 100'},
  {n:'Blanco', hex:'#FFFFFF', rgb:'255 · 255 · 255', cmyk:'0 · 0 · 0 · 0'},
  {n:'Plata', hex:'#B2B3B3', rgb:'178 · 179 · 179', cmyk:'35 · 27 · 26 · 0'},
  {n:'Azul OMODA & JAECOO', hex:'#67B0C4', rgb:'103 · 176 · 196', cmyk:'60 · 15 · 20 · 0'}
];
const sws = document.getElementById('swatches');
SW.forEach(s=>{
  sws.appendChild(el(`<div class="swatch"><div class="chipc" style="background:${s.hex}"></div>
  <div class="info"><b>${s.n.replace('&','&amp;')}</b><span>HEX ${s.hex}</span><span>RGB ${s.rgb}</span><span>CMYK ${s.cmyk}</span>
  <button class="copy" type="button" data-copy="${s.hex}">Copiar ${s.hex}</button></div></div>`));
});

/* Copiar */
async function copyText(text){
  try{ await navigator.clipboard.writeText(text); return true; }catch(e){
    try{ const ta=document.createElement('textarea'); ta.value=text; ta.style.position='fixed'; ta.style.opacity='0'; document.body.appendChild(ta); ta.select(); const ok=document.execCommand('copy'); ta.remove(); return ok; }catch(e2){ return false; }
  }
}
document.addEventListener('click', async (ev)=>{
  const b = ev.target.closest('[data-copy]');
  if(b){ const ok = await copyText(b.dataset.copy); const old=b.textContent; b.textContent= ok?'Copiado':'No se pudo copiar'; setTimeout(()=>b.textContent=old,1600); }
  const s = ev.target.closest('[data-copy-el]');
  if(s){ const ok = await copyText(document.getElementById(s.dataset.copyEl).innerText); document.getElementById('sig-status').textContent = ok?'Firma copiada.':'No se pudo copiar. Seleccioná el texto y copialo a mano.'; }
});

/* Descargas */
let downloads = null;
(async()=>{ try{ if(window.claude && typeof window.claude.use==='function'){ downloads = await window.claude.use('downloads'); } }catch(e){ downloads=null; } })();

function svgToPng(svg, width){
  return new Promise((res,rej)=>{
    const vb = svg.match(/viewBox="([^"]+)"/)[1].split(/\s+/).map(Number);
    const h = Math.round(width*vb[3]/vb[2]);
    const sized = svg.replace('<svg ', `<svg width="${width}" height="${h}" `);
    const img = new Image();
    img.onload = ()=>{ const c=document.createElement('canvas'); c.width=width; c.height=h; c.getContext('2d').drawImage(img,0,0,width,h); c.toBlob(b=> b?res(b):rej(new Error('png')), 'image/png'); };
    img.onerror = rej;
    img.src = 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(sized);
  });
}
document.addEventListener('click', async (ev)=>{
  const b = ev.target.closest('[data-dl]');
  if(!b) return;
  const msg = document.getElementById('dl-msg');
  const key=b.dataset.dl, fmt=b.dataset.fmt, col=b.dataset.col;
  const svg = svgColor(LOGOS[key], col==='blanco'?'#FFFFFF':'#000000');
  const filename = `${key}-${col}.${fmt}`;
  const old=b.textContent;
  try{
    const data = fmt==='svg' ? svg : await svgToPng(svg, 2400);
    if(!downloads){
      const blob = typeof data==='string' ? new Blob([data],{type:'image/svg+xml'}) : data;
      const url = URL.createObjectURL(blob); const lnk=document.createElement('a'); lnk.href=url; lnk.download=filename; document.body.appendChild(lnk); lnk.click(); lnk.remove(); setTimeout(()=>URL.revokeObjectURL(url),4000);
      msg.classList.add('show'); return;
    }
    await downloads.save({filename, data});
    b.textContent='Listo'; setTimeout(()=>b.textContent=old,1600);
  }catch(e){
    if(e && e.code==='declined'){ return; }
    if(e && (e.code==='unavailable' || e.code==='not_granted' || e.code==='capability_disabled')){ msg.classList.add('show'); return; }
    b.textContent='Probá de nuevo'; setTimeout(()=>b.textContent=old,1800);
  }
});

/* Pedido de aprobación */
const $ = id=>document.getElementById(id);
(function(){ const d=new Date(); d.setDate(d.getDate()+7); $('f-fecha').value = d.toISOString().slice(0,10); })();
function fmtDate(v){ if(!v) return 'a definir'; const [y,m,d]=v.split('-'); return `${d}/${m}/${y}`; }
function build(){
  const dealer=$('f-dealer').value.trim()||'Concesionario', tipo=$('f-tipo').value, canal=$('f-canal').value.trim()||'a definir';
  const fecha=fmtDate($('f-fecha').value), precio=$('f-precio').value, pauta=$('f-pauta').value.trim(), com=$('f-com').value.trim();
  const subj = `[Aprobación] ${dealer} · ${tipo} · ${fecha}`;
  const lines = [
    'Hola, equipo de marketing:',
    '',
    'Les envío para aprobar la siguiente pieza.',
    '',
    `Concesionario: ${dealer}`,
    `Tipo de pieza: ${tipo}`,
    `Canal o medio: ${canal}`,
    `Fecha de publicación: ${fecha}`,
    `Incluye precio, cuotas o promoción: ${precio}`
  ];
  if(pauta) lines.push(`Pauta paga (presupuesto y zona): ${pauta}`);
  if(com) lines.push(`Comentarios: ${com}`);
  lines.push('', 'Adjunto la pieza final.', '', 'Gracias.');
  const body = lines.join('\n');
  $('o-subj').textContent = subj; $('o-body').textContent = body;
  $('b-mail').href = `mailto:${MAIL}?subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(body)}`;
  return {subj, body};
}
$('ap').addEventListener('input', build);
$('ap').addEventListener('submit', e=>e.preventDefault());
build();
$('b-copy').addEventListener('click', async ()=>{
  const {subj, body} = build();
  const ok = await copyText(`Para: ${MAIL}\nAsunto: ${subj}\n\n${body}`);
  $('o-status').textContent = ok ? 'Copiado. Pegalo en un mail nuevo y adjuntá la pieza.' : 'No se pudo copiar. Seleccioná el texto y copialo a mano.';
});

/* Navegación activa */
const links=[...document.querySelectorAll('nav.side a')];
const byId=Object.fromEntries(links.map(a=>[a.getAttribute('href').slice(1),a]));
try{
  const io=new IntersectionObserver(entries=>{
    entries.forEach(en=>{ if(en.isIntersecting){ links.forEach(a=>a.classList.remove('on')); const a=byId[en.target.id]; if(a){ a.classList.add('on'); if(window.innerWidth<=980){ a.scrollIntoView({block:'nearest',inline:'center'}); } } } });
  },{rootMargin:'-30% 0px -60% 0px'});
  document.querySelectorAll('main section').forEach(s=>io.observe(s));
}catch(e){}

}
