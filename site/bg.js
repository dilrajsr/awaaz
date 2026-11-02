/* Animated background. The fragment shader (pixel moon over a noise field) is by Alexandr Korotaev (lekzd@mail.ru).
   It is drawn at low resolution and low frame rate so it stays light on phones and laptops. */
(() => {
'use strict';
const canvas = document.getElementById('bg');
if (!canvas) return;
const gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' });
if (!gl) { canvas.remove(); return; }

const FRAG = `#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 resolution;
uniform float time;
uniform vec3 cFg, cFg2, cBg;
float sdMoon(vec2 p, float d, float ra, float rb )
{
    p.y = abs(p.y);
    float a = (ra*ra - rb*rb + d*d)/(2.0*d);
    float b = sqrt(max(ra*ra-a*a,0.0));
    if( d*(p.x*b-p.y*a) > d*d*max(b-p.y,0.0) )
          return length(p-vec2(a,b));
    return max( (length(p          )-ra),
               -(length(p-vec2(d,0))-rb));
}

//	Classic Perlin 3D Noise
      //	by Stefan Gustavson
      //
      vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
      vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
      vec4 fade(vec4 t) {return t*t*t*(t*(t*6.0-15.0)+10.0);}

      float cnoise(vec4 P){
        vec4 Pi0 = floor(P); // Integer part for indexing
        vec4 Pi1 = Pi0 + 1.0; // Integer part + 1
        Pi0 = mod(Pi0, 289.0);
        Pi1 = mod(Pi1, 289.0);
        vec4 Pf0 = fract(P); // Fractional part for interpolation
        vec4 Pf1 = Pf0 - 1.0; // Fractional part - 1.0
        vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
        vec4 iy = vec4(Pi0.yy, Pi1.yy);
        vec4 iz0 = vec4(Pi0.zzzz);
        vec4 iz1 = vec4(Pi1.zzzz);
        vec4 iw0 = vec4(Pi0.wwww);
        vec4 iw1 = vec4(Pi1.wwww);

        vec4 ixy = permute(permute(ix) + iy);
        vec4 ixy0 = permute(ixy + iz0);
        vec4 ixy1 = permute(ixy + iz1);
        vec4 ixy00 = permute(ixy0 + iw0);
        vec4 ixy01 = permute(ixy0 + iw1);
        vec4 ixy10 = permute(ixy1 + iw0);
        vec4 ixy11 = permute(ixy1 + iw1);

        vec4 gx00 = ixy00 / 7.0;
        vec4 gy00 = floor(gx00) / 7.0;
        vec4 gz00 = floor(gy00) / 6.0;
        gx00 = fract(gx00) - 0.5;
        gy00 = fract(gy00) - 0.5;
        gz00 = fract(gz00) - 0.5;
        vec4 gw00 = vec4(0.75) - abs(gx00) - abs(gy00) - abs(gz00);
        vec4 sw00 = step(gw00, vec4(0.0));
        gx00 -= sw00 * (step(0.0, gx00) - 0.5);
        gy00 -= sw00 * (step(0.0, gy00) - 0.5);

        vec4 gx01 = ixy01 / 7.0;
        vec4 gy01 = floor(gx01) / 7.0;
        vec4 gz01 = floor(gy01) / 6.0;
        gx01 = fract(gx01) - 0.5;
        gy01 = fract(gy01) - 0.5;
        gz01 = fract(gz01) - 0.5;
        vec4 gw01 = vec4(0.75) - abs(gx01) - abs(gy01) - abs(gz01);
        vec4 sw01 = step(gw01, vec4(0.0));
        gx01 -= sw01 * (step(0.0, gx01) - 0.5);
        gy01 -= sw01 * (step(0.0, gy01) - 0.5);

        vec4 gx10 = ixy10 / 7.0;
        vec4 gy10 = floor(gx10) / 7.0;
        vec4 gz10 = floor(gy10) / 6.0;
        gx10 = fract(gx10) - 0.5;
        gy10 = fract(gy10) - 0.5;
        gz10 = fract(gz10) - 0.5;
        vec4 gw10 = vec4(0.75) - abs(gx10) - abs(gy10) - abs(gz10);
        vec4 sw10 = step(gw10, vec4(0.0));
        gx10 -= sw10 * (step(0.0, gx10) - 0.5);
        gy10 -= sw10 * (step(0.0, gy10) - 0.5);

        vec4 gx11 = ixy11 / 7.0;
        vec4 gy11 = floor(gx11) / 7.0;
        vec4 gz11 = floor(gy11) / 6.0;
        gx11 = fract(gx11) - 0.5;
        gy11 = fract(gy11) - 0.5;
        gz11 = fract(gz11) - 0.5;
        vec4 gw11 = vec4(0.75) - abs(gx11) - abs(gy11) - abs(gz11);
        vec4 sw11 = step(gw11, vec4(0.0));
        gx11 -= sw11 * (step(0.0, gx11) - 0.5);
        gy11 -= sw11 * (step(0.0, gy11) - 0.5);

        vec4 g0000 = vec4(gx00.x,gy00.x,gz00.x,gw00.x);
        vec4 g1000 = vec4(gx00.y,gy00.y,gz00.y,gw00.y);
        vec4 g0100 = vec4(gx00.z,gy00.z,gz00.z,gw00.z);
        vec4 g1100 = vec4(gx00.w,gy00.w,gz00.w,gw00.w);
        vec4 g0010 = vec4(gx10.x,gy10.x,gz10.x,gw10.x);
        vec4 g1010 = vec4(gx10.y,gy10.y,gz10.y,gw10.y);
        vec4 g0110 = vec4(gx10.z,gy10.z,gz10.z,gw10.z);
        vec4 g1110 = vec4(gx10.w,gy10.w,gz10.w,gw10.w);
        vec4 g0001 = vec4(gx01.x,gy01.x,gz01.x,gw01.x);
        vec4 g1001 = vec4(gx01.y,gy01.y,gz01.y,gw01.y);
        vec4 g0101 = vec4(gx01.z,gy01.z,gz01.z,gw01.z);
        vec4 g1101 = vec4(gx01.w,gy01.w,gz01.w,gw01.w);
        vec4 g0011 = vec4(gx11.x,gy11.x,gz11.x,gw11.x);
        vec4 g1011 = vec4(gx11.y,gy11.y,gz11.y,gw11.y);
        vec4 g0111 = vec4(gx11.z,gy11.z,gz11.z,gw11.z);
        vec4 g1111 = vec4(gx11.w,gy11.w,gz11.w,gw11.w);

        vec4 norm00 = taylorInvSqrt(vec4(dot(g0000, g0000), dot(g0100, g0100), dot(g1000, g1000), dot(g1100, g1100)));
        g0000 *= norm00.x;
        g0100 *= norm00.y;
        g1000 *= norm00.z;
        g1100 *= norm00.w;

        vec4 norm01 = taylorInvSqrt(vec4(dot(g0001, g0001), dot(g0101, g0101), dot(g1001, g1001), dot(g1101, g1101)));
        g0001 *= norm01.x;
        g0101 *= norm01.y;
        g1001 *= norm01.z;
        g1101 *= norm01.w;

        vec4 norm10 = taylorInvSqrt(vec4(dot(g0010, g0010), dot(g0110, g0110), dot(g1010, g1010), dot(g1110, g1110)));
        g0010 *= norm10.x;
        g0110 *= norm10.y;
        g1010 *= norm10.z;
        g1110 *= norm10.w;

        vec4 norm11 = taylorInvSqrt(vec4(dot(g0011, g0011), dot(g0111, g0111), dot(g1011, g1011), dot(g1111, g1111)));
        g0011 *= norm11.x;
        g0111 *= norm11.y;
        g1011 *= norm11.z;
        g1111 *= norm11.w;

        float n0000 = dot(g0000, Pf0);
        float n1000 = dot(g1000, vec4(Pf1.x, Pf0.yzw));
        float n0100 = dot(g0100, vec4(Pf0.x, Pf1.y, Pf0.zw));
        float n1100 = dot(g1100, vec4(Pf1.xy, Pf0.zw));
        float n0010 = dot(g0010, vec4(Pf0.xy, Pf1.z, Pf0.w));
        float n1010 = dot(g1010, vec4(Pf1.x, Pf0.y, Pf1.z, Pf0.w));
        float n0110 = dot(g0110, vec4(Pf0.x, Pf1.yz, Pf0.w));
        float n1110 = dot(g1110, vec4(Pf1.xyz, Pf0.w));
        float n0001 = dot(g0001, vec4(Pf0.xyz, Pf1.w));
        float n1001 = dot(g1001, vec4(Pf1.x, Pf0.yz, Pf1.w));
        float n0101 = dot(g0101, vec4(Pf0.x, Pf1.y, Pf0.z, Pf1.w));
        float n1101 = dot(g1101, vec4(Pf1.xy, Pf0.z, Pf1.w));
        float n0011 = dot(g0011, vec4(Pf0.xy, Pf1.zw));
        float n1011 = dot(g1011, vec4(Pf1.x, Pf0.y, Pf1.zw));
        float n0111 = dot(g0111, vec4(Pf0.x, Pf1.yzw));
        float n1111 = dot(g1111, Pf1);

        vec4 fade_xyzw = fade(Pf0);
        vec4 n_0w = mix(vec4(n0000, n1000, n0100, n1100), vec4(n0001, n1001, n0101, n1101), fade_xyzw.w);
        vec4 n_1w = mix(vec4(n0010, n1010, n0110, n1110), vec4(n0011, n1011, n0111, n1111), fade_xyzw.w);
        vec4 n_zw = mix(n_0w, n_1w, fade_xyzw.z);
        vec2 n_yzw = mix(n_zw.xy, n_zw.zw, fade_xyzw.y);
        float n_xyzw = mix(n_yzw.x, n_yzw.y, fade_xyzw.x);
        return 2.2 * n_xyzw;
      }
      
vec2 grid(vec2 uv) {
  return floor(uv * 50.) * 0.02;
}

vec3 getColor(vec2 uv, float d, float n) {  
  vec3 fgColor = cFg;
  vec3 fgColor2 = cFg2;
  vec3 bgColor = cBg;
  
  if (d < 0.1 && n < 0.1) {
    float mx = mod(uv.x, 0.04);
    float my = mod(uv.y, 0.04);
    return mix(fgColor, bgColor, step(0.02, min(mx, my)));
  }
  
  if (d < 0.1) {
    return fgColor;
  }
  
  if (n < 0.1) {
  float mx = mod(uv.x, 0.04);
    float my = mod(uv.y, 0.04);
    return mix(bgColor, fgColor2, step(0.02, min(mx, my)));
    return fgColor2;
  }
  
  return bgColor;
}

void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy*2.-1.;
  uv.y *= resolution.y/resolution.x;
  
  vec2 ruv = uv;
  
    float PI = 3.14159;
  
  float sectors = 8.;
  
  float halfSector = sectors * 0.5;
  
  float angle = atan(uv.y, uv.x); 
  angle = abs(mod(angle, PI / halfSector) - PI / sectors); 
  
  
  float d = 1.;
  
  float ra = 0.7;
  float rb = 0.6;
  float di = 1.5;
  
  float noiseAmount = 0.5;
  float noiseFrequency = 3.0;
  float n = cnoise(vec4(noiseFrequency * grid(uv), noiseFrequency * grid(uv).x, time)) * noiseAmount;
  
  vec2 muv = uv;
  
  // muv = mod(uv * 5., 1.) - 0.5;
  muv = floor(muv * 50.) * 0.02;
  vec2 guv = floor(ruv * 50.) * 0.02;
  
  // guv = mod(guv * 5., 1.) - 0.5;
  // muv += n;
  
  // muv = uv;
  
  
  float moonD = di * sin(-time);
  if (abs(moonD) < 0.001) moonD = 0.001;
  d = min(d, sdMoon(2.0 * guv + vec2(cos(-time), sin(-time)), moonD, ra, rb));
  d = smoothstep(0.0, 0.01, d);
  n = smoothstep(0.0, 0.01, n);

  vec3 color = getColor(ruv, d, n);

  gl_FragColor = vec4(color, 1.);
}
`;
const VERT = 'attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }';

const compile = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : (console.warn(gl.getShaderInfoLog(s)), null); };
const vs = compile(gl.VERTEX_SHADER, VERT), fs = compile(gl.FRAGMENT_SHADER, FRAG);
if (!vs || !fs) { canvas.remove(); return; }
const prog = gl.createProgram();
gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { canvas.remove(); return; }
gl.useProgram(prog);
gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
const loc = gl.getAttribLocation(prog, 'p');
gl.enableVertexAttribArray(loc);
gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
const U = n => gl.getUniformLocation(prog, n);
const u = { res: U('resolution'), time: U('time'), fg: U('cFg'), fg2: U('cFg2'), bg: U('cBg') };

const coarse = matchMedia('(pointer: coarse)').matches;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const light = matchMedia('(prefers-color-scheme: light)');
const MAXW = coarse ? 520 : 900;            // internal resolution cap
const FRAME_MS = coarse ? 50 : 33;          // 20 fps on phones, 30 fps on laptops

const PALETTES = {
  dark:  { bg: [0.045, 0.047, 0.125], fg: [0.12, 0.45, 0.33], fg2: [0.14, 0.12, 0.50] },
  light: { bg: [0.955, 0.950, 1.000], fg: [0.70, 0.90, 0.80], fg2: [0.78, 0.76, 0.98] },
};
const isLight = () => { const t = document.documentElement.dataset.theme; return t ? t === 'light' : light.matches; };

function resize() {
  const k = Math.min(1, MAXW / Math.max(innerWidth, 1));
  canvas.width = Math.max(2, Math.round(innerWidth * k));
  canvas.height = Math.max(2, Math.round(innerHeight * k));
  gl.viewport(0, 0, canvas.width, canvas.height);
  draw(last);
}

let last = 3, raf = 0, prev = 0;
function draw(t) {
  last = t;
  const p = PALETTES[isLight() ? 'light' : 'dark'];
  gl.uniform2f(u.res, canvas.width, canvas.height);
  gl.uniform1f(u.time, t);
  gl.uniform3fv(u.bg, p.bg); gl.uniform3fv(u.fg, p.fg); gl.uniform3fv(u.fg2, p.fg2);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}
function loop(now) {
  raf = requestAnimationFrame(loop);
  if (now - prev < FRAME_MS) return;
  prev = now;
  draw(now / 1000 * 0.5);                  // slowed down: calmer behind text
}
function start() { if (!raf && !reduce && !document.hidden) raf = requestAnimationFrame(loop); }
function stop() { cancelAnimationFrame(raf); raf = 0; }

addEventListener('resize', resize);
document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
document.addEventListener('awaaz-theme', () => draw(last));
light.addEventListener?.('change', () => draw(last));
resize(); start();
})();
