/* Awaaz — WebGL headings. Plain JavaScript, no libraries.
   Headings stay in the DOM (SEO, screen readers, selection); a canvas copy is drawn on a WebGL quad with a cursor/scroll distortion shader. */
(() => {
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
let plain = false, running = false;
const api = window.AwaazGL = { setPlain() {} };

/* ---------------- WebGL text ---------------- */
function initGLText() {
  const store = k => { try { return localStorage.getItem(k); } catch (_) { return null; } };
  const touch = matchMedia('(pointer: coarse)').matches;
  plain = touch || store('awaaz-plain') === '1';
  const canvas = $('#gl');
  const gl = canvas.getContext('webgl', { premultipliedAlpha: true, alpha: true, antialias: true });
  if (!gl) return;
  const root = document.documentElement;

  const vs = `attribute vec2 p; uniform vec4 uRect; uniform vec2 uRes; varying vec2 vUv;
    void main(){ vUv = p; vec2 px = uRect.xy + p*uRect.zw; vec2 c = px/uRes*2.0-1.0; gl_Position = vec4(c.x,-c.y,0.0,1.0); }`;
  const fs = `precision mediump float; uniform sampler2D uTex; uniform vec4 uRect; uniform vec2 uMouse; uniform float uVel, uStr, uTime; varying vec2 vUv;
    void main(){
      vec2 px = uRect.xy + vUv*uRect.zw;
      vec2 dv = px - uMouse; float d = length(dv);
      float inf = exp(-d*d/(2.0*130.0*130.0)) * uStr;
      vec2 dir = dv/max(d,1.0);
      vec2 uv = vUv - dir*inf*14.0/uRect.zw;
      uv.x += sin(vUv.y*14.0 + uTime*1.6)*uVel*0.0009/ (uRect.z/800.0);
      float sh = (inf*5.0 + abs(uVel)*0.12*uStr)/uRect.z;
      vec4 a = texture2D(uTex, uv + vec2(sh,0.0));
      vec4 b = texture2D(uTex, uv);
      vec4 c = texture2D(uTex, uv - vec2(sh,0.0));
      gl_FragColor = vec4(a.r, b.g, c.b, max(max(a.a,b.a),c.a));
    }`;
  const sh = (t, src) => { const s = gl.createShader(t); gl.shaderSource(s, src); gl.compileShader(s); return s; };
  const prog = gl.createProgram();
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, vs));
  gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
  gl.useProgram(prog);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0,0, 1,0, 0,1, 1,1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
  const U = n => gl.getUniformLocation(prog, n);
  const u = { rect: U('uRect'), res: U('uRes'), mouse: U('uMouse'), vel: U('uVel'), str: U('uStr'), time: U('uTime') };

  const PAD = 24;
  let items = [];

  // Rasterise an element's text (with per-child colours) into a 2D canvas, wrapped to the element's width.
  function rasterise(el) {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const box = el.getBoundingClientRect();
    const cs0 = getComputedStyle(el);
    const lh = parseFloat(cs0.lineHeight) || parseFloat(cs0.fontSize) * 1.1;
    const words = [];
    el.childNodes.forEach(n => {
      const node = n.nodeType === 3 ? el : n;
      const cs = getComputedStyle(node);
      const font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      (n.textContent || '').split(/(\s+)/).forEach(t => t && words.push({ t, font, color: cs.color, ls: cs.letterSpacing }));
    });
    const c = document.createElement('canvas');
    const w = Math.ceil(box.width + PAD * 2), h = Math.ceil(box.height + PAD * 2);
    c.width = w * dpr; c.height = h * dpr;
    const x = c.getContext('2d');
    x.scale(dpr, dpr);
    x.textBaseline = 'middle';
    let line = 0, cx = 0;
    for (const wd of words) {
      x.font = wd.font;
      if ('letterSpacing' in x) x.letterSpacing = wd.ls === 'normal' ? '0px' : wd.ls;
      const mw = x.measureText(wd.t).width;
      if (/^\s+$/.test(wd.t)) { cx += mw; continue; }
      if (cx + mw > box.width + 1 && cx > 0) { line++; cx = 0; }
      x.fillStyle = wd.color;
      x.fillText(wd.t, PAD + cx, PAD + lh * (line + 0.5));
      cx += mw;
    }
    return { c, w, h };
  }

  function build() {
    root.classList.remove('gl-on'); // read real colours/layout while DOM text is visible
    if (plain) return;
    items.forEach(i => gl.deleteTexture(i.tex));
    items = [...document.querySelectorAll('[data-gl]')].map(el => {
      const r = rasterise(el);
      const tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, r.c);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      return { el, tex, w: r.w, h: r.h };
    });
    root.classList.add('gl-on');
  }

  function resize() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = innerWidth * dpr; canvas.height = innerHeight * dpr;
    gl.viewport(0, 0, canvas.width, canvas.height);
  }

  const mouse = { x: -9999, y: -9999, tx: -9999, ty: -9999 };
  addEventListener('pointermove', e => { mouse.tx = e.clientX; mouse.ty = e.clientY; if (mouse.x < -999) { mouse.x = mouse.tx; mouse.y = mouse.ty; } });
  let lastY = scrollY, vel = 0;

  function frame(t) {
    if (plain || document.hidden) { running = false; gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT); return; }
    mouse.x += (mouse.tx - mouse.x) * 0.12; mouse.y += (mouse.ty - mouse.y) * 0.12;
    vel += ((scrollY - lastY) - vel) * 0.15; lastY = scrollY;
    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform2f(u.res, innerWidth, innerHeight);
    gl.uniform2f(u.mouse, mouse.x, mouse.y);
    gl.uniform1f(u.vel, vel);
    gl.uniform1f(u.str, reduceMotion ? 0 : 1);
    gl.uniform1f(u.time, t / 1000);
    for (const it of items) {
      const r = it.el.getBoundingClientRect();
      if (r.bottom < -PAD || r.top > innerHeight + PAD) continue;
      gl.bindTexture(gl.TEXTURE_2D, it.tex);
      gl.uniform4f(u.rect, r.left - PAD, r.top - PAD, it.w, it.h);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
    requestAnimationFrame(frame);
  }

  let timer;
  const rebuild = () => { clearTimeout(timer); timer = setTimeout(() => { resize(); build(); }, 150); };
  api.rebuild = rebuild;
  addEventListener('resize', rebuild);
  new ResizeObserver(rebuild).observe(document.body);
  resize();
  const start = () => { if (!running && !document.hidden) { running = true; requestAnimationFrame(frame); } };
  document.addEventListener('visibilitychange', () => { if (document.hidden) running = false; else if (!plain) start(); });
  api.setPlain = v => { plain = v; if (v) { root.classList.remove('gl-on'); } else { build(); start(); } };
  document.fonts.ready.then(() => { build(); if (!plain) start(); });
}

initGLText();
})();
