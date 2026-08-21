const M = `'JetBrains Mono',monospace`;
const G = `max-width:1360px;margin:0 auto;padding:0 clamp(20px,4vw,48px)`;
const ANN = `margin:0;font:500 11.5px ${M};letter-spacing:.1em;text-transform:uppercase;color:var(--t2)`;
const H2 = `margin:0 0 20px;font-weight:500;font-size:clamp(26px,3.2vw,42px);line-height:1.05;letter-spacing:-.035em;color:var(--t1);text-wrap:pretty`;
const P = `margin:0;max-width:46ch;font-weight:400;font-size:clamp(15px,1.2vw,18px);line-height:1.62;color:var(--t2);text-wrap:pretty`;
const NUM = `font:500 10.5px ${M};letter-spacing:.12em;text-transform:uppercase;color:var(--t3)`;
const FONTS = `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet"><link rel="stylesheet" href="assets/tema.css">`;

const NAV = [['Agenti','Agenti.dc.html'],['Casi','Casi.dc.html'],['Modelli','Modelli.dc.html'],['Sicurezza','Sicurezza.dc.html'],['Dati','Dati.dc.html'],['Privacy Bridge','Privacy.dc.html'],['Formazione','Formazione.dc.html'],['Contatti','Contatti.dc.html']];
const ALTRE = [['Modelli in locale','Locali.dc.html'],['Architettura','Architettura.dc.html'],['Automazione','Automazione.dc.html'],['Strumenti','Strumenti.dc.html'],['Metodo','Metodo.dc.html']];

const monogramma = (d) => `<span aria-hidden="true" style="display:inline-flex;align-items:center;justify-content:center;position:relative;width:${d}px;height:${d}px;border:1px solid var(--filo2);flex:none"><span style="font:600 ${Math.round(d*0.4)}px Geist,'Instrument Sans',Helvetica,sans-serif;letter-spacing:-.06em;color:var(--t1)">AS</span><span style="position:absolute;right:-1px;top:-1px;width:3px;height:3px;background:var(--acc)"></span></span>`;

const voce = (h, a) => `<a href="${h[1]}"${h[1]===a?' aria-current="page"':''} style="color:${h[1]===a?'var(--t1)':'var(--t2)'}${h[1]===a?';border-bottom:1px solid var(--acc);padding-bottom:3px':''}">${h[0]}</a>`;

const chrome = (a) => `<div data-avanzamento style="position:fixed;top:0;left:0;height:2px;width:0;background:var(--acc);z-index:60"></div>
<div data-cursore style="position:fixed;inset:0;pointer-events:none;z-index:1"></div>
<div style="position:fixed;inset:0;background:var(--grana);pointer-events:none;z-index:55"></div>

<header style="position:sticky;top:0;z-index:50;background:var(--velo);backdrop-filter:blur(16px);border-bottom:1px solid var(--filo1)">
  <div style="max-width:1360px;margin:0 auto;padding:14px clamp(20px,4vw,48px);display:flex;align-items:center;justify-content:space-between;gap:20px">
    <a href="Home.dc.html" style="display:flex;align-items:center;gap:12px;flex:none;font:500 11.5px ${M};letter-spacing:.1em;text-transform:uppercase;color:var(--t1);white-space:nowrap">${monogramma(30)}Andrea Sforna AI</a>
    <nav data-nav style="display:flex;align-items:center;gap:20px;font:500 11px ${M};letter-spacing:.08em;text-transform:uppercase">
      ${NAV.map(v=>voce(v,a)).join('\n      ')}
    </nav>
    <div style="display:flex;align-items:center;gap:10px">
      <button type="button" data-tema-btn style="padding:7px 12px;background:transparent;border:1px solid var(--filo1);color:var(--t2);font:500 10.5px ${M};letter-spacing:.09em;text-transform:uppercase;cursor:pointer" style-hover="border-color:var(--filo2);color:var(--t1)">Chiaro</button>
      <button type="button" data-burger aria-expanded="false" aria-label="Apri il menu" style="display:none;align-items:center;padding:7px 12px;background:transparent;border:1px solid var(--filo1);color:var(--t1);font:500 10.5px ${M};letter-spacing:.09em;text-transform:uppercase;cursor:pointer">Menu</button>
    </div>
  </div>
  <div data-pannello style="display:none;border-top:1px solid var(--filo1);background:var(--sup1)">
    <div style="max-width:1360px;margin:0 auto;padding:16px clamp(20px,4vw,48px);display:grid;gap:13px;font:500 12px ${M};letter-spacing:.08em;text-transform:uppercase">
      ${NAV.concat(ALTRE).map(v=>voce(v,a)).join('\n      ')}
    </div>
  </div>
</header>`;

const PIEDE = `<footer style="border-top:1px solid var(--filo1);background:var(--sup1)">
  <div style="${G};padding-top:clamp(40px,5vw,72px);padding-bottom:clamp(28px,3.4vw,44px);display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:clamp(28px,4vw,56px)">
    <div>
      <div style="display:flex;align-items:center;gap:14px;margin-bottom:18px">${monogramma(44)}<span style="font:500 11.5px ${M};letter-spacing:.1em;text-transform:uppercase;color:var(--t1)">Andrea Sforna AI</span></div>
      <p style="margin:0;max-width:34ch;font-size:15px;line-height:1.6;color:var(--t2)">Progettazione, sicurezza e manutenzione di sistemi di agenti AI.</p>
    </div>
    <div>
      <p style="margin:0 0 16px;font:500 10.5px ${M};letter-spacing:.12em;text-transform:uppercase;color:var(--t3)">Pagine</p>
      <div style="display:grid;gap:10px;font:500 11px ${M};letter-spacing:.08em;text-transform:uppercase">${NAV.map(v=>`<a href="${v[1]}" style="color:var(--t2)">${v[0]}</a>`).join('')}</div>
    </div>
    <div>
      <p style="margin:0 0 16px;font:500 10.5px ${M};letter-spacing:.12em;text-transform:uppercase;color:var(--t3)">Approfondimenti</p>
      <div style="display:grid;gap:10px;font:500 11px ${M};letter-spacing:.08em;text-transform:uppercase">${ALTRE.map(v=>`<a href="${v[1]}" style="color:var(--t2)">${v[0]}</a>`).join('')}</div>
    </div>
    <div>
      <p style="margin:0 0 16px;font:500 10.5px ${M};letter-spacing:.12em;text-transform:uppercase;color:var(--t3)">Contatti</p>
      <div style="display:grid;gap:10px;font:500 11px ${M};letter-spacing:.06em">
        <a href="mailto:andrea.sforna@gmail.com" style="color:var(--t2)">andrea.sforna@gmail.com</a>
        <a href="https://www.instagram.com/andreasfornaai/" rel="me noopener" target="_blank" style="color:var(--t2)">Instagram @andreasfornaai</a>
      </div>
    </div>
  </div>
  <div style="${G};padding-top:20px;padding-bottom:clamp(28px,3.4vw,44px);border-top:1px solid var(--filo1);display:flex;flex-wrap:wrap;gap:14px;justify-content:space-between;font:500 10.5px ${M};letter-spacing:.1em;text-transform:uppercase;color:var(--t3)">
    <span>&#169; 2026 Andrea Sforna</span>
    <span>Progettato e scritto da Andrea Sforna</span>
  </div>
</footer>`;

const apertura = (ann,h1,riga) => `<section data-screen-label="00 Apertura" style="position:relative;padding:clamp(72px,10vw,150px) 0 clamp(48px,6vw,88px);overflow:hidden">
  <div style="position:absolute;inset:0;background:var(--luce);pointer-events:none"></div>
  <div style="${G};position:relative">
    <p style="${ANN};margin-bottom:clamp(24px,3vw,40px);animation:appari .9s ease .1s both">${ann}</p>
    <h1 style="margin:0 0 clamp(24px,3vw,36px);font-weight:500;font-size:clamp(34px,6.4vw,92px);line-height:.98;letter-spacing:-.045em;color:var(--t1);max-width:20ch;text-wrap:pretty;animation:sali 1s cubic-bezier(.16,1,.3,1) .18s both">${h1}</h1>
    <div style="height:1px;background:var(--acc);max-width:560px;transform-origin:left;animation:filo 1.3s cubic-bezier(.16,1,.3,1) .3s both"></div>
    <p style="margin:clamp(24px,3vw,36px) 0 0;max-width:60ch;font-weight:400;font-size:clamp(16px,1.5vw,22px);line-height:1.55;color:var(--t2);text-wrap:pretty;animation:sali 1s cubic-bezier(.16,1,.3,1) .38s both">${riga}</p>
  </div>
</section>`;

const righe = (rs, acc) => rs.map(([k,v],i) => `<div data-riga style="display:grid;grid-template-columns:minmax(90px,140px) 1fr;gap:clamp(16px,2vw,32px);padding:16px 12px;border-top:1px solid var(--filo1)${i===rs.length-1?';border-bottom:1px solid var(--filo1)':''}"><span data-num style="${NUM}${acc&&i===rs.length-1?';color:var(--acc)':''}">${k}</span><span style="font-size:15.5px;line-height:1.5;color:var(--t1)">${v}</span></div>`).join('\n          ');

const bloccoRighe = (n,titolo,corpo,rs,fondo,acc) => `<section data-screen-label="${n} ${titolo}" style="${fondo?'background:var(--sup1);border-top:1px solid var(--filo1);border-bottom:1px solid var(--filo1);':''}padding:clamp(56px,8vw,120px) 0">
  <div style="${G}">
    <article data-lift data-reveal style="border:1px solid var(--filo1);background:linear-gradient(180deg,var(--sup2),var(--sup1));display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:clamp(24px,4vw,72px);padding:clamp(28px,3.6vw,56px)">
      <div>
        <p style="margin:0 0 clamp(20px,2.4vw,32px);font-weight:500;font-size:clamp(40px,5vw,72px);line-height:1;letter-spacing:-.05em;color:var(--acc);font-variant-numeric:tabular-nums">${n}</p>
        <h2 style="${H2}">${titolo}</h2>
        <p style="${P}">${corpo}</p>
      </div>
      <div style="align-self:center">
          ${righe(rs,acc)}
      </div>
    </article>
  </div>
</section>`;

const affermazione = (etichetta,testo) => `<section data-screen-label="Affermazione" style="background:var(--sup1);border-top:1px solid var(--acc);border-bottom:1px solid var(--filo1);padding:clamp(56px,8vw,120px) 0">
  <div style="${G}">
    <p style="margin:0 0 clamp(20px,2.6vw,34px);font:500 11px ${M};letter-spacing:.14em;text-transform:uppercase;color:var(--acc)" data-reveal>${etichetta}</p>
    <p style="margin:0;max-width:26ch;font-weight:500;font-size:clamp(28px,4.8vw,74px);line-height:1.02;letter-spacing:-.045em;text-wrap:pretty;color:var(--t1)" data-reveal>${testo}</p>
  </div>
</section>`;

const elenco2 = (n,titolo,corpo,ta,ra,tb,rb,fondo) => `<section data-screen-label="${n} ${titolo}" style="${fondo?'background:var(--sup1);border-top:1px solid var(--filo1);border-bottom:1px solid var(--filo1);':''}padding:clamp(56px,8vw,120px) 0">
  <div style="${G}">
    <div style="margin-bottom:clamp(32px,4vw,56px)" data-reveal>
      <p style="margin:0 0 22px;font:500 11px ${M};letter-spacing:.12em;text-transform:uppercase;color:var(--acc);font-variant-numeric:tabular-nums">${n}</p>
      <h2 style="${H2}">${titolo}</h2>
      <p style="${P};max-width:56ch">${corpo}</p>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:clamp(16px,2.4vw,32px)" data-reveal>
      <div>
        <p style="margin:0 0 4px;padding:14px 12px;border-bottom:1px solid var(--filo2);font:500 10.5px ${M};letter-spacing:.12em;text-transform:uppercase;color:var(--t1)">${ta}</p>
        ${ra.map(r=>`<div data-riga style="padding:18px 12px;border-bottom:1px solid var(--filo1);font-size:16px;line-height:1.5;color:var(--t2)">${r}</div>`).join('\n        ')}
      </div>
      <div>
        <p style="margin:0 0 4px;padding:14px 12px;border-bottom:1px solid var(--acc);font:500 10.5px ${M};letter-spacing:.12em;text-transform:uppercase;color:var(--acc)">${tb}</p>
        ${rb.map(r=>`<div data-riga style="padding:18px 12px;border-bottom:1px solid var(--filo1);font-size:16px;line-height:1.5;color:var(--t2)">${r}</div>`).join('\n        ')}
      </div>
    </div>
  </div>
</section>`;

const tabella = (n,titolo,corpo,intest,rs,fondo) => `<section data-screen-label="${n} ${titolo}" style="${fondo?'background:var(--sup1);border-top:1px solid var(--filo1);border-bottom:1px solid var(--filo1);':''}padding:clamp(56px,8vw,120px) 0">
  <div style="${G}">
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:clamp(28px,4vw,64px);align-items:end;margin-bottom:clamp(32px,4vw,56px)" data-reveal>
      <div>
        <p style="margin:0 0 22px;font:500 11px ${M};letter-spacing:.12em;text-transform:uppercase;color:var(--acc);font-variant-numeric:tabular-nums">${n}</p>
        <h2 style="${H2};margin-bottom:0">${titolo}</h2>
      </div>
      <p style="${P};max-width:44ch">${corpo}</p>
    </div>
    <div style="border-top:1px solid var(--filo2)" data-reveal>
      <div style="display:grid;grid-template-columns:70px minmax(150px,1fr) 2fr;gap:clamp(16px,2.4vw,40px);padding:14px 12px;border-bottom:1px solid var(--filo1);font:500 10.5px ${M};letter-spacing:.12em;text-transform:uppercase;color:var(--t3)">
        <span>${intest[0]}</span><span>${intest[1]}</span><span>${intest[2]}</span>
      </div>
      ${rs.map(([a,b,c],i)=>`<div data-riga style="display:grid;grid-template-columns:70px minmax(150px,1fr) 2fr;gap:clamp(16px,2.4vw,40px);padding:clamp(20px,2.4vw,30px) 12px;border-bottom:1px solid var(--filo1);align-items:baseline${i===rs.length-1?';box-shadow:inset 3px 0 0 var(--acc)':''}">
        <span data-num style="font:500 12px ${M};color:${i===rs.length-1?'var(--acc)':'var(--t3)'};font-variant-numeric:tabular-nums">${a}</span>
        <span style="font-weight:500;font-size:clamp(17px,1.7vw,23px);letter-spacing:-.025em;color:var(--t1)">${b}</span>
        <span style="font-size:16px;line-height:1.55;color:var(--t2)">${c}</span>
      </div>`).join('\n      ')}
    </div>
  </div>
</section>`;

const limite = (t) => `<section style="padding:clamp(48px,6vw,88px) 0">
  <div style="${G}">
    <div style="border-left:3px solid var(--acc);padding:clamp(22px,2.8vw,36px) clamp(22px,2.8vw,40px);background:linear-gradient(90deg,var(--acc-tenue),transparent 60%)" data-reveal>
      <p style="margin:0 0 14px;font:500 11px ${M};letter-spacing:.12em;text-transform:uppercase;color:var(--acc)">Limite dichiarato</p>
      <p style="${P};max-width:64ch;color:var(--t1)">${t}</p>
    </div>
  </div>
</section>`;

const avanti = (f,t,r) => `<section style="padding:0 0 clamp(72px,9vw,140px)">
  <div style="${G}">
    <a href="${f}" data-lift style="display:flex;flex-wrap:wrap;gap:24px;justify-content:space-between;align-items:end;padding:clamp(28px,3.4vw,48px);border:1px solid var(--filo1);background:linear-gradient(180deg,var(--sup2),var(--sup1));color:var(--t1)" data-reveal>
      <span style="display:block;max-width:56ch">
        <span style="display:block;font:500 11px ${M};letter-spacing:.12em;text-transform:uppercase;color:var(--t3);margin-bottom:16px">Pagina successiva</span>
        <span style="display:block;font-weight:500;font-size:clamp(22px,2.6vw,34px);line-height:1.1;letter-spacing:-.03em;margin-bottom:12px">${t}</span>
        <span style="display:block;font-weight:400;font-size:15px;line-height:1.6;color:var(--t2)">${r}</span>
      </span>
      <span style="font:500 12px ${M};letter-spacing:.09em;text-transform:uppercase;color:var(--acc)">Apri &#8594;</span>
    </a>
  </div>
</section>`;

/* ---- chat pulita: nessun telaio, angoli morbidi ---- */
const R = 'border-radius:18px';
const msg = (m, i) => {
  const d = `animation-delay:${(0.35 + i * 0.55).toFixed(2)}s`;
  const t = m[0];
  if (t === 'u') return `<div data-bolla style="display:flex;justify-content:flex-end;${d}"><div style="max-width:82%;padding:14px 20px;background:var(--sup3);border:1px solid var(--filo2);border-radius:20px 20px 6px 20px;font-size:16px;line-height:1.55;color:var(--t1)">${m[1]}</div></div>`;
  if (t === 'a') return `<div data-bolla style="max-width:70ch;font-size:16px;line-height:1.72;color:var(--t1);${d}">${m[1]}</div>`;
  if (t === 'n') return `<div data-bolla style="max-width:70ch;font-size:15px;line-height:1.68;color:var(--t2);${d}">${m[1]}</div>`;
  if (t === 'p') return `<div data-bolla style="display:inline-flex;align-self:flex-start;align-items:center;gap:12px;padding:8px 14px;border:1px solid var(--filo1);border-radius:999px;white-space:nowrap;flex:none;width:fit-content;font:400 10.5px ${M};letter-spacing:.05em;text-transform:uppercase;color:var(--t3);${d}"><span style="width:5px;height:5px;border-radius:50%;background:var(--acc)"></span>${m[1]}<span style="color:var(--filo2)">/</span>${m[2]}</div>`;
  if (t === 's') return `<div data-bolla style="align-self:flex-start;padding:12px 18px;border:1px solid var(--acc);border-radius:14px;background:var(--acc-tenue);font:500 11.5px ${M};letter-spacing:.06em;color:var(--acc);${d}">${m[1]}</div>`;
  if (t === 'el') return `<div data-bolla style="${R};border:1px solid var(--filo2);background:var(--sup2);overflow:hidden;max-width:560px;${d}">
        ${m[1].map(([k, v], j) => `<div style="display:grid;grid-template-columns:minmax(96px,140px) 1fr;gap:18px;padding:13px 20px;${j ? 'border-top:1px solid var(--filo1)' : ''}"><span style="font:400 12.5px ${M};color:var(--t3)">${k}</span><span style="font-size:15px;color:var(--t1);font-variant-numeric:tabular-nums">${v}</span></div>`).join('')}
      </div>`;
  const larg = m[3] || '1.1fr 1.6fr 1fr 1fr .9fr';
  return `<div data-bolla style="${R};border:1px solid var(--filo2);background:var(--sup2);overflow-x:auto;${d}">
        <div style="display:grid;grid-template-columns:${larg};gap:16px;padding:14px 20px;font:400 11px ${M};letter-spacing:.1em;text-transform:uppercase;color:var(--t3);min-width:430px">${m[1].map((h, j) => `<span style="${j === m[1].length - 1 ? 'text-align:right' : ''}">${h}</span>`).join('')}</div>
        ${m[2].map((r) => `<div style="display:grid;grid-template-columns:${larg};gap:16px;padding:14px 20px;border-top:1px solid var(--filo1);font-size:13.5px;color:var(--t1);font-variant-numeric:tabular-nums;min-width:430px">${r.map((c, j) => `<span style="${j === r.length - 1 ? 'text-align:right;font-weight:500;' : ''}${j === 0 && /\d/.test(String(c)) ? "font-family:'JetBrains Mono',monospace;font-size:13.5px;color:var(--t2);" : ''}">${c}</span>`).join('')}</div>`).join('')}
      </div>`;
};
const chat = (messaggi, nota) => `<div>
      <div data-lift style="display:flex;flex-direction:column;gap:18px;padding:clamp(22px,2.8vw,36px);border:1px solid var(--filo2);border-radius:24px;background:linear-gradient(180deg,var(--sup2),var(--sup1));box-shadow:var(--ombra-alta)">
        ${messaggi.map((m, i) => msg(m, i)).join('\n        ')}
        <div style="display:flex;align-items:center;gap:14px;margin-top:6px;padding:15px 20px;border:1px solid var(--filo1);border-radius:999px;background:var(--fondo)">
          <span style="flex:1;font-size:14.5px;color:var(--t3)">Scrivi&#8230;</span>
          <span style="flex:none;width:30px;height:30px;border-radius:50%;background:var(--acc);display:flex;align-items:center;justify-content:center;color:#fff;font-size:13px">&#8593;</span>
        </div>
      </div>
      <p style="margin:14px 0 0;font:400 11px ${M};letter-spacing:.06em;text-transform:uppercase;color:var(--t3)">${nota || 'Conversazione dimostrativa &#183; dati inventati'}</p>
    </div>`;

const dimostrazione = (n, titolo, corpo, telaio, invertito) => `<section data-screen-label="${n} ${titolo}" style="padding:clamp(56px,8vw,120px) 0;background:var(--sup1);border-top:1px solid var(--filo1);border-bottom:1px solid var(--filo1)">
  <div style="${G};display:grid;grid-template-columns:repeat(auto-fit,minmax(480px,1fr));gap:clamp(32px,5vw,72px);align-items:center" data-reveal>
    ${invertito ? telaio : ''}
    <div>
      <p style="margin:0 0 22px;font:500 11px ${M};letter-spacing:.12em;text-transform:uppercase;color:var(--acc);font-variant-numeric:tabular-nums">${n}</p>
      <h2 style="${H2}">${titolo}</h2>
      <p style="${P}">${corpo}</p>
    </div>
    ${invertito ? '' : telaio}
  </div>
</section>`;

/* ---- striscia loghi ---- */
const LOGHI = [
  ['claude.svg', 30], ['openai.svg', 22], ['gemini.svg', 26], ['deepseek-taglio.png', 22],
  ['qwen.png', 26], ['kimi.svg', 24], ['mistral.svg', 26],
  ['openclaw.svg', 32], ['openclaw-testo.png', 20], ['hermes-marchio.svg', 28], ['higgsfield.svg', 24],
];
const strisciaLoghi = (nota) => `<section data-screen-label="Strumenti" style="background:var(--carta);color:var(--carta-t);padding:clamp(40px,5vw,68px) 0;box-shadow:var(--ombra-alta);position:relative;z-index:2">
  <div style="${G};margin-bottom:clamp(28px,3.4vw,44px)" data-reveal>
    <p style="margin:0;max-width:76ch;font:400 clamp(13px,1.05vw,15px)/1.7 ${M};color:var(--carta-t);text-wrap:pretty">${nota}</p>
  </div>
  <div style="overflow:hidden;mask-image:linear-gradient(to right,transparent,#000 8%,#000 92%,transparent);-webkit-mask-image:linear-gradient(to right,transparent,#000 8%,#000 92%,transparent)">
    <div style="display:flex;width:max-content;animation:scorri 64s linear infinite">
      ${[0, 1].map(k => `<div${k ? ' aria-hidden="true"' : ''} style="display:flex;align-items:center;gap:clamp(44px,5.4vw,80px);padding-right:clamp(44px,5.4vw,80px)">
        ${LOGHI.map(([f, h]) => `<img data-logo src="assets/loghi/${f}" alt="${k ? '' : f.split('.')[0]}" style="height:${h}px;width:auto;flex:none">`).join('\n        ')}
      </div>`).join('\n      ')}
    </div>
  </div>
</section>`;

const CO = { M, G, ANN, H2, P, NUM, FONTS, NAV, ALTRE, monogramma, chrome, PIEDE, apertura, righe, bloccoRighe, affermazione, elenco2, tabella, limite, avanti, chat, dimostrazione, strisciaLoghi };

/* ---- chat professionale (struttura approvata) ---- */
const bollaU = (t,d) => `<div style="display:flex;justify-content:flex-end"><div data-bolla style="max-width:52ch;padding:13px 18px;border-radius:20px 20px 6px 20px;border:1px solid var(--filo2);background:var(--sup2);font-size:15.5px;line-height:1.55;color:var(--t1);animation-delay:${d}s">${t}</div></div>`;
const rigaStrumento = (t,s,d) => `<div data-bolla style="display:flex;align-items:center;gap:12px;padding:2px 0;animation-delay:${d}s">
          <span style="width:5px;height:5px;border-radius:50%;background:var(--acc);flex:none"></span>
          <span style="font:400 11.5px ${M};letter-spacing:.06em;color:var(--t3)">${t}</span>
          <span style="flex:1;height:1px;background:var(--filo1)"></span>
          <span style="font:400 11.5px ${M};letter-spacing:.06em;color:var(--t3)">${s}</span>
        </div>`;
const bollaA = (t,d) => `<div data-bolla style="max-width:66ch;font-size:15.5px;line-height:1.7;color:var(--t1);animation-delay:${d}s">${t}</div>`;
const notaA = (t,d) => `<div data-bolla style="max-width:64ch;font-size:14px;line-height:1.62;color:var(--t2);animation-delay:${d}s">${t}</div>`;
const tabChat = (head,rows,d) => `<div data-bolla style="border:1px solid var(--filo2);border-radius:16px;background:var(--sup2);overflow:hidden;animation-delay:${d}s">
          <div style="display:grid;grid-template-columns:${head.map((h,i)=>i===0?'1.05fr':i===head.length-1?'.75fr':'1fr').join(' ')};gap:14px;padding:12px 18px;font:400 10.5px ${M};letter-spacing:.1em;text-transform:uppercase;color:var(--t3);background:var(--sup1)">${head.map(h=>`<span>${h}</span>`).join('')}</div>
          ${rows.map(r=>`<div style="display:grid;grid-template-columns:${head.map((h,i)=>i===0?'1.05fr':i===head.length-1?'.75fr':'1fr').join(' ')};gap:14px;padding:11px 18px;border-top:1px solid var(--filo1);font-size:13.5px;color:var(--t1);font-variant-numeric:tabular-nums">${r.map((c,i)=>`<span style="${i===0?`font:400 12.5px ${M};color:var(--t2)`:''}${i===head.length-1?';text-align:right':''}">${c}</span>`).join('')}</div>`).join('')}
        </div>`;
const schedaChat = (titolo,rs,d) => `<div data-bolla style="border:1px solid var(--filo2);border-radius:16px;background:var(--sup2);padding:18px 20px;display:grid;gap:10px;max-width:44ch;animation-delay:${d}s">
          <p style="margin:0 0 4px;font:500 11px ${M};letter-spacing:.1em;text-transform:uppercase;color:var(--acc)">${titolo}</p>
          ${rs.map(([k,v])=>`<div style="display:grid;grid-template-columns:minmax(84px,120px) 1fr;gap:14px;font-size:14px"><span style="font:400 12px ${M};color:var(--t3)">${k}</span><span style="color:var(--t1)">${v}</span></div>`).join('')}
        </div>`;
const statoChat = (t,d) => `<div data-bolla style="display:inline-flex;align-self:flex-start;align-items:center;gap:10px;padding:8px 14px;border:1px dashed var(--acc);border-radius:999px;background:var(--acc-tenue);font:400 11.5px ${M};letter-spacing:.06em;color:var(--acc);animation-delay:${d}s">${t}</div>`;
const chatPro = (ms, nota) => {
  let d = 0.3;
  const out = ms.map((m) => {
    const t = m[0]; const dd = d.toFixed(2); d += t === 't' ? 0.5 : 0.75;
    if (t === 'u') return bollaU(m[1], dd);
    if (t === 't') return rigaStrumento(m[1], m[2], dd);
    if (t === 'a') return bollaA(m[1], dd);
    if (t === 'n') return notaA(m[1], dd);
    if (t === 's') return statoChat(m[1], dd);
    if (t === 'scheda') return schedaChat(m[1], m[2], dd);
    return tabChat(m[1], m[2], dd);
  });
  return `<div>
      <div data-lift style="display:flex;flex-direction:column;gap:16px;padding:clamp(22px,2.8vw,34px);border:1px solid var(--filo2);border-radius:26px;background:linear-gradient(180deg,var(--sup2),var(--sup1));box-shadow:var(--ombra-alta)">
        ${out.join('\n        ')}
      </div>
      ${nota ? `<p style="margin:14px 2px 0;font:400 11.5px ${M};letter-spacing:.05em;color:var(--t3)">${nota}</p>` : ''}
    </div>`;
};

/* ---- grafico a barre ---- */
const barre = (n, titolo, corpo, sotto, dati, unita, max, fondo) => `<section data-screen-label="${n} ${titolo}" style="${fondo?'background:var(--sup1);border-top:1px solid var(--filo1);border-bottom:1px solid var(--filo1);':''}padding:clamp(56px,8vw,120px) 0">
  <div style="${G}">
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:clamp(28px,4vw,64px);align-items:end;margin-bottom:clamp(28px,3.4vw,44px)" data-reveal>
      <div><h2 style="${H2};margin-bottom:0">${titolo}</h2></div>
      <p style="${P}">${corpo}</p>
    </div>
    <div data-reveal style="border:1px solid var(--filo1);background:linear-gradient(180deg,var(--sup2),var(--sup1));padding:clamp(20px,2.6vw,34px)">
      <div style="display:flex;justify-content:space-between;gap:16px;padding-bottom:14px;font:400 10.5px ${M};letter-spacing:.1em;text-transform:uppercase;color:var(--t3)"><span>${sotto}</span><span>${unita}</span></div>
      ${dati.map(([nome, val, evid, extra]) => `<div style="display:grid;grid-template-columns:minmax(140px,230px) 1fr auto;gap:clamp(12px,1.6vw,22px);align-items:center;padding:9px 0;border-top:1px solid var(--filo1)">
        <span style="font:400 12.5px ${M};color:${evid?'var(--t1)':'var(--t2)'};overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${nome}</span>
        <span style="position:relative;display:block;height:9px;background:var(--filo1)"><i style="position:absolute;top:0;bottom:0;left:0;width:${(val/max*100).toFixed(1)}%;background:${evid?'var(--acc)':'var(--t3)'};${evid?'box-shadow:0 0 18px var(--acc-tenue)':''}"></i></span>
        <span style="font:500 13px ${M};color:var(--t1);font-variant-numeric:tabular-nums;min-width:74px;text-align:right">${val}${extra?`<span style="color:var(--t3)"> · ${extra}</span>`:''}</span>
      </div>`).join('')}
    </div>
  </div>
</section>`;

/* ---- dispersione intelligenza / costo (asse x logaritmico, etichette senza sovrapposizioni) ---- */
const dispersione = (n, titolo, corpo, punti, fronte, nota) => {
  const W = 1040, Hh = 720, ml = 76, mr = 34, mt = 30, mb = 66;
  const x0 = Math.log10(0.03), x1 = Math.log10(5), y0 = 20, y1 = 66;
  const px = (c) => ml + (Math.log10(c) - x0) / (x1 - x0) * (W - ml - mr);
  const py = (v) => Hh - mb - (v - y0) / (y1 - y0) * (Hh - mt - mb);
  const tick = [0.03, 0.05, 0.1, 0.25, 0.5, 1, 2, 5];
  const griglia = tick.map((t) => `<line x1="${px(t).toFixed(1)}" y1="${mt}" x2="${px(t).toFixed(1)}" y2="${Hh - mb}" stroke="var(--filo1)" stroke-width="1"/><text x="${px(t).toFixed(1)}" y="${Hh - mb + 24}" fill="var(--t3)" font-family="JetBrains Mono, monospace" font-size="12" text-anchor="middle">$${t}</text>`).join('');
  const oriz = [20, 30, 40, 50, 60].map((v) => `<line x1="${ml}" y1="${py(v).toFixed(1)}" x2="${W - mr}" y2="${py(v).toFixed(1)}" stroke="var(--filo1)" stroke-width="1"/><text x="${ml - 14}" y="${(py(v) + 4).toFixed(1)}" fill="var(--t3)" font-family="JetBrains Mono, monospace" font-size="12" text-anchor="end">${v}</text>`).join('');
  const linea = `<polyline points="${fronte.map(([c, v]) => `${px(c).toFixed(1)},${py(v).toFixed(1)}`).join(' ')}" fill="none" stroke="var(--acc)" stroke-width="1.5" stroke-dasharray="5 5" opacity=".7"/>`;
  const MIN = 21;
  const posti = punti.map((p, i) => ({ nome: p[0], cx: px(p[1]), cy: py(p[2]), evid: p[3], lato: p[4] || 'dx', i }));
  ['sx', 'dx'].forEach((lato) => {
    const gruppo = posti.filter((p) => p.lato === lato).sort((a, b) => a.cy - b.cy);
    let prec = -1e9;
    gruppo.forEach((p) => { p.ly = Math.max(p.cy, prec + MIN); prec = p.ly; });
    const ultimo = gruppo[gruppo.length - 1];
    if (ultimo && ultimo.ly > Hh - mb - 6) {
      const eccesso = ultimo.ly - (Hh - mb - 6);
      gruppo.forEach((p) => { p.ly -= eccesso; });
    }
  });
  const pts = posti.map((p) => {
    const dx = p.lato === 'sx' ? -14 : 14;
    const lx = p.cx + dx;
    const guida = Math.abs(p.ly - p.cy) > 5 ? `<line x1="${(p.cx + dx * 0.4).toFixed(1)}" y1="${p.cy.toFixed(1)}" x2="${(lx - dx * 0.15).toFixed(1)}" y2="${(p.ly - 4).toFixed(1)}" stroke="var(--filo2)" stroke-width="1"/>` : '';
    return `<g>${guida}<circle cx="${p.cx.toFixed(1)}" cy="${p.cy.toFixed(1)}" r="${p.evid ? 6 : 4.5}" fill="${p.evid ? 'var(--acc)' : 'var(--t3)'}" stroke="var(--sup1)" stroke-width="${p.evid ? 2 : 1.5}"/><text x="${lx.toFixed(1)}" y="${p.ly.toFixed(1)}" fill="${p.evid ? 'var(--t1)' : 'var(--t2)'}" font-family="JetBrains Mono, monospace" font-size="12.5" text-anchor="${p.lato === 'sx' ? 'end' : 'start'}" paint-order="stroke" stroke="var(--sup1)" stroke-width="4" stroke-linejoin="round">${p.nome}</text></g>`;
  }).join('');
  return `<section data-screen-label="${n} ${titolo}" style="padding:clamp(56px,8vw,120px) 0">
  <div style="${G}">
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:clamp(28px,4vw,64px);align-items:end;margin-bottom:clamp(28px,3.4vw,44px)" data-reveal>
      <div><h2 style="${H2};margin-bottom:0">${titolo}</h2></div>
      <p style="${P}">${corpo}</p>
    </div>
    <div data-reveal style="border:1px solid var(--filo1);background:linear-gradient(180deg,var(--sup2),var(--sup1));padding:clamp(18px,2.2vw,30px)">
      <svg viewBox="0 0 ${W} ${Hh}" style="width:100%;height:auto;display:block" role="img" aria-label="${titolo}">
        ${griglia}${oriz}${linea}${pts}
        <text x="${ml}" y="${Hh - mb + 50}" fill="var(--t3)" font-family="JetBrains Mono, monospace" font-size="12">COSTO PER COMPITO (USD, SCALA LOGARITMICA) &#8594;</text>
        <text x="${ml - 40}" y="${mt + 10}" fill="var(--t3)" font-family="JetBrains Mono, monospace" font-size="12" transform="rotate(-90 ${ml - 40} ${mt + 10})" text-anchor="end">&#8592; INDICE DI INTELLIGENZA</text>
      </svg>
      <p style="margin:14px 4px 0;font:400 11.5px ${M};letter-spacing:.05em;color:var(--t3)">${nota}</p>
    </div>
  </div>
</section>`;
};

/* ---- numeri ---- */
const numeri = (n, titolo, dati) => `<section data-screen-label="${n} ${titolo}" style="background:var(--sup1);border-top:1px solid var(--filo1);border-bottom:1px solid var(--filo1);padding:clamp(48px,6vw,96px) 0">
  <div style="${G}">
    <p style="${ANN};margin-bottom:clamp(24px,3vw,40px)" data-reveal>${titolo}</p>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:1px;background:var(--filo1)">
      ${dati.map(([v,k,u]) => `<div data-reveal style="background:var(--sup1);padding:clamp(20px,2.6vw,34px) clamp(18px,2.2vw,28px)">
        <p style="margin:0 0 10px;font-weight:500;font-size:clamp(34px,4.4vw,60px);line-height:.95;letter-spacing:-.04em;color:var(--t1)">${v}<span style="font-size:.42em;color:var(--acc);letter-spacing:0"> ${u||''}</span></p>
        <p style="margin:0;max-width:26ch;font-size:14px;line-height:1.55;color:var(--t2)">${k}</p>
      </div>`).join('')}
    </div>
  </div>
</section>`;

CO.chatPro = chatPro; CO.barre = barre; CO.dispersione = dispersione; CO.numeri = numeri; CO.ANN = ANN;

