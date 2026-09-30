#!/usr/bin/env node
// Generates the animated SVG panels used by README.md.
// Edit PROFILE, then run:  node scripts/build.js
const fs = require('fs');
const path = require('path');

const PROFILE = {
  handle: 'farfosh',
  title: 'FARFOSH',
  whoami: 'hamza — reverse engineer · game hacker · full-stack dev',
  location: 'Agadir, Morocco',
  arsenal: [
    ['reverse/', ['IDA Pro', 'Ghidra', 'x64dbg', 'Cheat Engine', 'ReClass.NET', 'dnSpy']],
    ['lang/', ['C++', 'C#', 'Python', 'PHP', 'JavaScript']],
    ['web/', ['Laravel', 'PHP', 'MySQL', 'JavaScript', 'HTML / CSS']],
    ['build/', ['Desktop software', 'Mobile apps', 'Chrome extensions', 'Telegram bots']],
  ],
  targets: [
    ['ARC Raiders', 'Unreal Engine 5'],
    ['DayZ', 'Enfusion'],
    ['Among Us', 'Unity · IL2CPP'],
    ['Valheim', 'Unity · Mono'],
  ],
};

const C = {
  panel: '#0d0d10', bar: '#141418', line: '#24242a', chip: '#121216', chipLine: '#2c2c33',
  text: '#d9d9de', dim: '#6c6c78', red: '#ff1f3d', redDim: '#3a0509', cyan: '#19e6ff',
};
const FONT = "ui-monospace, 'Cascadia Code', 'SF Mono', Menlo, Consolas, 'DejaVu Sans Mono', 'Liberation Mono', monospace";
const W = 1200;

let seed = 1337;
const rnd = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;
const bytes = n => Array.from({ length: n }, () => Math.floor(rnd() * 256).toString(16).padStart(2, '0').toUpperCase()).join(' ');
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Monospace text with a fixed advance so layout and typing clips don't depend on the viewer's font.
const CW = fs => fs * 0.6;
function t(x, y, s, { fs = 20, fill = C.text, weight, anchor } = {}) {
  return `<text x="${x}" y="${y}" font-size="${fs}" fill="${fill}"${weight ? ` font-weight="${weight}"` : ''}` +
    `${anchor ? ` text-anchor="${anchor}"` : ''} textLength="${(s.length * CW(fs)).toFixed(1)}" lengthAdjust="spacing">${esc(s)}</text>`;
}

function prompt(x, y, fs, dir = '~') {
  const user = `root@${PROFILE.handle}`;
  const rest = `:${dir}#`;
  return {
    el: t(x, y, user, { fs, fill: C.red, weight: 700 }) + t(x + user.length * CW(fs), y, rest, { fs, fill: C.dim }),
    w: (user.length + rest.length + 1) * CW(fs),
  };
}

let uid = 0;
function typed(defs, x, y, s, begin, { fs = 22, fill = C.text, speed = 0.065 } = {}) {
  const id = `ty${uid++}`;
  const vals = Array.from({ length: s.length + 1 }, (_, i) => (i * CW(fs)).toFixed(1)).join(';');
  const dur = speed * (s.length + 1);
  defs.push(`<clipPath id="${id}"><rect x="${x}" y="${y - fs}" width="0" height="${fs * 1.6}">` +
    `<animate attributeName="width" values="${vals}" dur="${dur.toFixed(2)}s" begin="${begin}s" calcMode="discrete" fill="freeze"/></rect></clipPath>`);
  return { el: `<g clip-path="url(#${id})">${t(x, y, s, { fs, fill })}</g>`, end: begin + dur };
}

const appear = (begin, inner) => `<g opacity="0">${inner}<set attributeName="opacity" to="1" begin="${begin}s" fill="freeze"/></g>`;
const cursor = (x, y, fs, begin = 0) =>
  `<rect x="${x}" y="${y - fs * 0.82}" width="${CW(fs)}" height="${fs}" fill="${C.red}" opacity="0">` +
  `<animate attributeName="opacity" values="1;0" dur="1s" begin="${begin}s" calcMode="discrete" repeatCount="indefinite"/></rect>`;

function frame(h, title, body, defs = []) {
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${W} ${h}" width="${W}" height="${h}">
<style>text{font-family:${FONT}}</style>
<defs>
  <clipPath id="win"><rect width="${W}" height="${h}" rx="14"/></clipPath>
  <pattern id="scan" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="1.3" fill="#000"/></pattern>
  <radialGradient id="corner" cx="${W}" cy="0" r="520" gradientUnits="userSpaceOnUse">
    <stop offset="0" stop-color="${C.redDim}"/><stop offset="1" stop-color="${C.redDim}" stop-opacity="0"/>
  </radialGradient>
  ${defs.join('\n  ')}
</defs>
<g clip-path="url(#win)">
  <rect width="${W}" height="${h}" fill="${C.panel}"/>
  <rect width="${W}" height="${h}" fill="url(#corner)"/>
  ${body}
  <rect width="${W}" height="40" fill="${C.bar}"/>
  <line x1="0" y1="40.5" x2="${W}" y2="40.5" stroke="${C.line}"/>
  <circle cx="24" cy="20" r="6.5" fill="${C.red}"/><circle cx="46" cy="20" r="6.5" fill="#34343b"/><circle cx="68" cy="20" r="6.5" fill="#34343b"/>
  ${t(W / 2, 25, title, { fs: 15, fill: C.dim, anchor: 'middle' })}
  <rect width="${W}" height="${h}" fill="url(#scan)" opacity=".16"/>
</g>
<rect x=".5" y=".5" width="${W - 1}" height="${h - 1}" rx="14" fill="none" stroke="${C.line}"/>
</svg>
`;
}

// ---- hooded figure (1000x1000 space, same drawing as the avatar) ----
const HOOD = 'M 140 1000 C 165 830 255 765 330 735 C 296 640 286 520 318 420 C 350 292 420 205 500 198 C 580 205 650 292 682 420 C 714 520 704 640 670 735 C 745 765 835 830 860 1000 Z';
const RIM = 'M 500 268 C 424 274 366 344 362 440 C 358 546 404 638 500 690 C 596 638 642 546 638 440 C 634 344 576 274 500 268 Z';
const FACE = 'M 500 300 C 440 305 395 362 391 442 C 387 532 422 612 500 654 C 578 612 613 532 609 442 C 605 362 560 305 500 300 Z';

const figureDefs = [
  `<linearGradient id="hoodGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1e1e22"/><stop offset=".55" stop-color="#121215"/><stop offset="1" stop-color="#08080a"/></linearGradient>`,
  `<linearGradient id="hoodShade" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-opacity="0"/><stop offset=".6" stop-opacity=".15"/><stop offset="1" stop-opacity=".55"/></linearGradient>`,
  `<linearGradient id="rimLeft" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${C.red}"/><stop offset=".45" stop-color="${C.red}" stop-opacity=".25"/><stop offset=".55" stop-color="${C.red}" stop-opacity="0"/></linearGradient>`,
  `<linearGradient id="rimRight" x1="0" y1="0" x2="1" y2="0"><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity=".18"/></linearGradient>`,
  `<radialGradient id="faceVoid" cx="500" cy="470" r="200" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#000"/><stop offset=".75" stop-color="#010101"/><stop offset="1" stop-color="#0b0b0d"/></radialGradient>`,
  `<filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`,
  `<filter id="eyeGlow" x="-100%" y="-300%" width="300%" height="700%"><feGaussianBlur stdDeviation="10" result="b1"/><feGaussianBlur in="SourceGraphic" stdDeviation="3" result="b2"/><feMerge><feMergeNode in="b1"/><feMergeNode in="b1"/><feMergeNode in="b2"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`,
];

const figure = () => `<g id="figure">
    <path d="${HOOD}" fill="url(#hoodGrad)"/>
    <path d="${HOOD}" fill="url(#hoodShade)"/>
    <g fill="none" stroke-linecap="round">
      <path d="M 500 200 C 502 225 501 250 500 268" stroke="#26262b" stroke-width="4"/>
      <path d="M 350 712 C 420 752 470 760 500 760 C 530 760 580 752 650 712" stroke="#1d1d21" stroke-width="6"/>
      <path d="M 250 800 C 275 850 290 910 292 1000" stroke="#18181b" stroke-width="5"/>
      <path d="M 750 800 C 725 850 710 910 708 1000" stroke="#18181b" stroke-width="5"/>
      <path d="M 335 470 C 330 560 345 640 380 700" stroke="#1f1f23" stroke-width="4"/>
      <path d="M 665 470 C 670 560 655 640 620 700" stroke="#1f1f23" stroke-width="4"/>
    </g>
    <path d="${HOOD}" fill="none" stroke="url(#rimLeft)" stroke-width="6" filter="url(#softGlow)"/>
    <path d="${HOOD}" fill="none" stroke="url(#rimRight)" stroke-width="4"/>
    <path d="${RIM}" fill="#121215"/>
    <path d="${RIM}" fill="none" stroke="#2a2a30" stroke-width="3"/>
    <path d="M 440 283 C 395 305 368 360 364 440" fill="none" stroke="${C.red}" stroke-opacity=".45" stroke-width="3" stroke-linecap="round"/>
    <path d="${FACE}" fill="url(#faceVoid)"/>
    <g filter="url(#eyeGlow)">
      <path d="M 428 478 Q 455 461 484 473 Q 457 487 428 478 Z" fill="${C.red}"/>
      <path d="M 572 478 Q 545 461 516 473 Q 543 487 572 478 Z" fill="${C.red}"/>
      <animate attributeName="opacity" values="1;.5;1" dur="3.2s" repeatCount="indefinite"/>
    </g>
    <path d="M 440 477 Q 457 469 474 474 Q 458 480 440 477 Z" fill="#ffe3e6"/>
    <path d="M 560 477 Q 543 469 526 474 Q 542 480 560 477 Z" fill="#ffe3e6"/>
    <g stroke="#2e2e34" stroke-width="7" stroke-linecap="round" fill="none">
      <path d="M 448 668 C 444 710 438 760 436 812"/>
      <path d="M 552 668 C 556 710 562 760 564 812"/>
    </g>
    <rect x="429" y="806" width="14" height="30" rx="3" fill="#3a3a42"/>
    <rect x="557" y="806" width="14" height="30" rx="3" fill="#3a3a42"/>
    ${t(500, 918, '>_', { fs: 64, fill: C.red, weight: 700, anchor: 'middle' }).replace('<text', '<text filter="url(#softGlow)"')}
  </g>`;

// Brief glitch: a displaced copy of `href` inside a horizontal band, shown for a fraction of each cycle.
function glitchBand(defs, id, href, band, dx, dur, at, tint) {
  defs.push(`<clipPath id="${id}"><rect x="${band[0]}" y="${band[1]}" width="${band[2]}" height="${band[3]}"/></clipPath>`);
  return `<g clip-path="url(#${id})" opacity="0">
    <rect x="${band[0]}" y="${band[1]}" width="${band[2]}" height="${band[3]}" fill="${C.panel}"/>
    <use href="#${href}" xlink:href="#${href}" transform="translate(${dx} 0)"/>
    ${tint ? `<rect x="${band[0]}" y="${band[1]}" width="${band[2]}" height="${band[3]}" fill="${tint}" opacity=".18"/>` : ''}
    <animate attributeName="opacity" values="0;1;0" keyTimes="0;${at};${(at + 0.035).toFixed(3)}" dur="${dur}s" calcMode="discrete" repeatCount="indefinite"/>
  </g>`;
}

// ---- panels ----
function header() {
  const H = 400;
  const defs = [...figureDefs,
    `<radialGradient id="glow" cx="1010" cy="250" r="420" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${C.redDim}"/><stop offset=".55" stop-color="#150204"/><stop offset="1" stop-color="#150204" stop-opacity="0"/></radialGradient>`,
  ];
  let body = `<rect width="${W}" height="${H}" fill="url(#glow)"/>`;

  // hex dump behind the figure
  let addr = 0x00401000;
  body += `<g>`;
  for (let y = 66; y < H; y += 24) {
    body += `<g opacity="${(0.06 + rnd() * 0.14).toFixed(2)}">${t(1184, y, `${addr.toString(16).toUpperCase().padStart(8, '0')}  ${bytes(8)}`, { fs: 14, fill: C.red, anchor: 'end' })}</g>`;
    addr += 0x10 * (1 + Math.floor(rnd() * 4));
  }
  body += `</g>`;

  // hooded figure with chromatic split
  body += `<g transform="translate(810 0) scale(.4)">
    <path d="${HOOD}" fill="none" stroke="${C.red}" stroke-width="4" opacity=".5" transform="translate(-10 0)"/>
    <path d="${HOOD}" fill="none" stroke="${C.cyan}" stroke-width="4" opacity=".3" transform="translate(10 0)"/>
    ${figure()}
  </g>`;
  body += `<g transform="translate(810 0) scale(.4)">${glitchBand(defs, 'fg1', 'figure', [300, 468, 420, 16], 24, 3.7, 0.62, null)}</g>`;
  body += `<g transform="translate(810 0) scale(.4)">${glitchBand(defs, 'fg2', 'figure', [200, 740, 560, 22], -34, 5.3, 0.81, C.cyan)}</g>`;

  // glitch title
  const X = 56, TY = 136, TFS = 80;
  const ghost = (color, a, b, c, dur, op) =>
    `<g opacity="${op}">${t(X, TY, PROFILE.title, { fs: TFS, fill: color, weight: 800 })}` +
    `<animateTransform attributeName="transform" type="translate" values="${a} 0;${b} 0;${c} 2;${a} 0" keyTimes="0;.88;.92;.95" dur="${dur}s" calcMode="discrete" repeatCount="indefinite"/></g>`;
  body += `<g id="title">
    ${ghost(C.red, -3, -12, 6, 4.1, 0.9)}
    ${ghost(C.cyan, 3, 10, -7, 4.1, 0.55)}
    ${t(X, TY, PROFILE.title, { fs: TFS, fill: '#f4f4f6', weight: 800 })}
  </g>`;
  body += glitchBand(defs, 'tg1', 'title', [X - 10, TY - 40, 460, 12], 18, 4.1, 0.88, C.red);
  body += `<rect x="${X}" y="${TY + 18}" width="64" height="4" fill="${C.red}"/>`;

  // terminal session
  const fs = 22, LH = 38;
  let y = 212;
  let p = prompt(X, y, fs);
  let a = typed(defs, X + p.w, y, 'whoami', 0.5, { fs });
  body += p.el + a.el;
  y += LH;
  body += appear(a.end + 0.25, t(X, y, PROFILE.whoami, { fs, fill: C.text }));
  y += LH;
  p = prompt(X, y, fs);
  const b = typed(defs, X + p.w, y, 'cat ~/location', a.end + 0.8, { fs });
  body += appear(a.end + 0.6, p.el) + b.el;
  y += LH;
  body += appear(b.end + 0.25, t(X, y, `[+] ${PROFILE.location}`, { fs, fill: C.text }));
  y += LH;
  p = prompt(X, y, fs);
  body += appear(b.end + 0.6, p.el) + cursor(X + p.w + 2, y, fs, b.end + 0.6);

  return frame(H, `root@${PROFILE.handle}: ~`, body, defs);
}

function arsenal() {
  const fs = 19, cw = CW(fs), X = 40, CHIP_X = 300, CHIP_H = 36, PAD = 14, GAP = 10, MAX_X = W - 36;
  const defs = [];
  let y = 88;
  let p = prompt(X, y, 20, '~');
  let body = p.el + t(X + p.w, y, 'ls -la ~/arsenal', { fs: 20 });
  y += 26;
  for (const [dir, items] of PROFILE.arsenal) {
    y += 22;
    let x = CHIP_X;
    const rowTop = y;
    for (const item of items) {
      const w = item.length * cw + PAD * 2;
      if (x + w > MAX_X) { x = CHIP_X; y += CHIP_H + 10; }
      body += `<rect x="${x}" y="${y}" width="${w}" height="${CHIP_H}" rx="7" fill="${C.chip}" stroke="${C.chipLine}"/>`;
      body += t(x + PAD, y + 24, item, { fs, fill: C.text });
      x += w + GAP;
    }
    body += t(X, rowTop + 24, 'drwxr-x---', { fs: 16, fill: C.dim });
    body += t(X + 128, rowTop + 24, dir, { fs, fill: C.red, weight: 700 });
    y += CHIP_H;
  }
  y += 50;
  p = prompt(X, y, 20, '~');
  body += p.el + cursor(X + p.w + 2, y, 20);
  return frame(y + 30, '~/arsenal', body, defs);
}

function targets() {
  const fs = 20, X = 40, COLS = [X, 200, 520, 930], RH = 50;
  let y = 88;
  let p = prompt(X, y, fs);
  let body = p.el + t(X + p.w, y, 'ps -ef | grep -i game', { fs });
  y += 48;
  ['PID', 'TARGET', 'ENGINE', 'STATUS'].forEach((h, i) => { body += t(COLS[i], y, h, { fs: 15, fill: C.dim, weight: 700 }); });
  y += 14;
  body += `<line x1="${X}" y1="${y}" x2="${W - X}" y2="${y}" stroke="${C.line}"/>`;
  PROFILE.targets.forEach(([name, engine], i) => {
    const top = y + i * RH;
    const base = top + 32;
    if (i % 2 === 0) body += `<rect x="${X - 12}" y="${top + 4}" width="${W - 2 * X + 24}" height="${RH - 4}" rx="6" fill="#ffffff" opacity=".025"/>`;
    const pid = `0x${(0x1a40 + i * 0x0f37 + Math.floor(rnd() * 0x40)).toString(16).toUpperCase()}`;
    body += t(COLS[0], base, pid, { fs: 17, fill: C.dim });
    body += t(COLS[1], base, name, { fs, fill: '#f4f4f6', weight: 700 });
    body += t(COLS[2], base, engine, { fs, fill: C.cyan });
    body += `<rect x="${COLS[3]}" y="${top + 11}" width="130" height="30" rx="6" fill="${C.red}" fill-opacity=".12" stroke="${C.red}" stroke-opacity=".7"/>`;
    body += `<circle cx="${COLS[3] + 18}" cy="${top + 26}" r="5" fill="${C.red}"><animate attributeName="opacity" values="1;.25;1" dur="${1.4 + i * 0.3}s" repeatCount="indefinite"/></circle>`;
    body += t(COLS[3] + 34, top + 32, 'PWNED', { fs: 17, fill: C.red, weight: 700 });
  });
  y += PROFILE.targets.length * RH + 46;
  p = prompt(X, y, fs);
  body += p.el + cursor(X + p.w + 2, y, fs);
  return frame(y + 30, 'attach — process list', body, []);
}

function footer() {
  const H = 132, X = 40;
  let y = 88;
  let p = prompt(X, y, 20);
  let body = p.el + t(X + p.w, y, 'exit', { fs: 20 });
  body += t(W - X, y, 'logout · connection to farfosh closed.', { fs: 16, fill: C.dim, anchor: 'end' });
  body += `<rect x="${X}" y="${y + 16}" width="${W - 2 * X}" height="2" fill="${C.red}" opacity=".5"/>`;
  body += `<rect x="${X + 180}" y="${y + 14}" width="120" height="6" fill="${C.red}" opacity=".8"><animate attributeName="x" values="${X};${W - X - 120};${X}" dur="6s" repeatCount="indefinite"/></rect>`;
  return frame(H, 'session', body, []);
}

const out = path.join(__dirname, '..', 'assets');
fs.mkdirSync(out, { recursive: true });
for (const [name, fn] of Object.entries({ header, arsenal, targets, footer })) {
  fs.writeFileSync(path.join(out, `${name}.svg`), fn());
  console.log(`assets/${name}.svg`);
}
