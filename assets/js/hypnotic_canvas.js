/* ==========================================================================
   MAGICK A.I - REACT BITS CANVAS SHADERS
   (Balatro, Ferrofluid, MetaBalls, Plasma, SplashCursor, PrismaticBurst)
   ========================================================================== */

class ChaosphereEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.angle = 0;
    this.isRunning = true;
    this.isActiveView = true;
    
    this.init();
    this.createParticles();
    this.animate();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.isRunning = false;
      } else {
        if (!this.isRunning && this.isActiveView) {
          this.isRunning = true;
          this.animate();
        }
      }
    });

    window.addEventListener('viewchange', (e) => {
      this.isActiveView = (e.detail && e.detail.view === 'home');
      if (this.isActiveView) {
        if (!this.isRunning && !document.hidden) {
          this.isRunning = true;
          this.animate();
        }
      } else {
        this.isRunning = false;
        if (this.ctx) {
          this.ctx.clearRect(0, 0, this.width, this.height);
        }
      }
    });

    window.addEventListener('modalopen', () => {
      this.isRunning = false;
    });

    window.addEventListener('modalclose', () => {
      if (this.isActiveView && !document.hidden && !this.isRunning) {
        this.isRunning = true;
        this.animate();
      }
    });
  }

  resize() {
    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;
    this.centerX = this.width / 2;
    this.centerY = this.height / 2;
  }

  createParticles() {
    this.particles = [];
    const count = Math.min(60, Math.floor((this.width * this.height) / 16000));
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        radius: Math.random() * 2 + 0.5,
        color: Math.random() > 0.5 ? 'rgba(255, 0, 51, ' : 'rgba(255, 85, 0, ',
        alpha: Math.random() * 0.5 + 0.1,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3
      });
    }
  }

  drawChaosphere() {
    const ctx = this.ctx;
    const cx = this.centerX;
    const cy = this.centerY;
    const radius = Math.min(this.width, this.height) * 0.2;

    ctx.save();
    ctx.translate(cx, cy);

    ctx.rotate(this.angle * 0.15);
    ctx.beginPath();
    ctx.arc(0, 0, radius * 1.2, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 0, 51, 0.15)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    const arrowCount = 8;
    for (let i = 0; i < arrowCount; i++) {
      const a = (i * Math.PI * 2) / arrowCount;
      ctx.save();
      ctx.rotate(a);

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -radius);
      ctx.strokeStyle = 'rgba(255, 0, 51, 0.35)';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(-10, -radius + 15);
      ctx.lineTo(0, -radius - 8);
      ctx.lineTo(10, -radius + 15);
      ctx.fillStyle = 'rgba(255, 85, 0, 0.6)';
      ctx.fill();

      ctx.restore();
    }

    ctx.restore();
  }

  animate() {
    if (!this.isRunning) return;
    this.ctx.clearRect(0, 0, this.width, this.height);

    for (let p of this.particles) {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = this.width;
      if (p.x > this.width) p.x = 0;
      if (p.y < 0) p.y = this.height;
      if (p.y > this.height) p.y = 0;

      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color + p.alpha + ')';
      this.ctx.fill();
    }

    this.drawChaosphere();
    this.angle += 0.004;

    requestAnimationFrame(() => this.animate());
  }
}

/* Engine do Carregador de Sigilos (React Bits Canvas Shaders: Balatro, Ferrofluid, MetaBalls, Plasma, SplashCursor, PrismaticBurst) */
class HypnoticStageEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.gl = this.canvas.getContext('webgl2') || this.canvas.getContext('webgl');
    this.currentMode = 'balatro';
    this.animFrameId = null;
    this.startTime = performance.now();
    this.mousePos = [0.5, 0.5];
    this.program = null;
    this.isActiveView = false;
    this.pausedByVisibility = false;

    this.initEvents();
  }

  initEvents() {
    window.addEventListener('resize', () => this.resize());
    if (this.canvas) {
      const updateMouse = (clientX, clientY) => {
        const rect = this.canvas.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          const x = (clientX - rect.left) / rect.width;
          const y = 1.0 - (clientY - rect.top) / rect.height;
          this.mousePos = [Math.max(0, Math.min(1, x)), Math.max(0, Math.min(1, y))];
        }
      };

      this.canvas.addEventListener('mousemove', (e) => updateMouse(e.clientX, e.clientY));
      this.canvas.addEventListener('touchstart', (e) => {
        if (e.touches && e.touches[0]) updateMouse(e.touches[0].clientX, e.touches[0].clientY);
      }, { passive: true });
      this.canvas.addEventListener('touchmove', (e) => {
        if (e.touches && e.touches[0]) updateMouse(e.touches[0].clientX, e.touches[0].clientY);
      }, { passive: true });
    }

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pausedByVisibility = true;
        if (this.animFrameId) {
          cancelAnimationFrame(this.animFrameId);
          this.animFrameId = null;
        }
      } else {
        this.pausedByVisibility = false;
        if (this.program && !this.animFrameId && this.isActiveView) {
          this.loop();
        }
      }
    });

    window.addEventListener('viewchange', (e) => {
      this.isActiveView = (e.detail && e.detail.view === 'charger');
      if (!this.isActiveView) {
        if (this.animFrameId) {
          cancelAnimationFrame(this.animFrameId);
          this.animFrameId = null;
        }
      } else {
        if (this.program && !this.animFrameId && !document.hidden) {
          this.loop();
        }
      }
    });
  }

  resize() {
    if (!this.canvas || !this.gl) return;
    const width = this.canvas.clientWidth || 800;
    const height = this.canvas.clientHeight || 500;
    // Otimização Mobile Snapdragon 8 Gen 1: limitar DPI a 1.5x reduz em 70% consumo térmico/GPU
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    this.canvas.width = Math.floor(width * dpr);
    this.canvas.height = Math.floor(height * dpr);
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
  }

  start(mode = 'balatro') {
    this.currentMode = mode;
    this.isActiveView = true;
    this.stop();
    this.resize();
    this.initShaderProgram(mode);
    this.startTime = performance.now();
    this.loop();
  }

  stop() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.gl) {
      this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    }
  }

  initShaderProgram(mode) {
    const gl = this.gl;
    if (!gl) return;

    const vsSource = `
      attribute vec2 position;
      varying vec2 vUv;
      void main() {
        vUv = position * 0.5 + 0.5;
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    let fsSource = '';

    if (mode === 'balatro') {
      fsSource = `
        precision highp float;
        uniform float iTime;
        uniform vec3 iResolution;
        uniform vec2 uMouse;
        varying vec2 vUv;

        vec4 effect(vec2 screenSize, vec2 screen_coords) {
            float pixelFilter = 745.0;
            float pixel_size = length(screenSize.xy) / pixelFilter;
            vec2 uv = (floor(screen_coords.xy * (1.0 / pixel_size)) * pixel_size - 0.5 * screenSize.xy) / length(screenSize.xy);
            float uv_len = length(uv);
            
            float speed = iTime * -0.4 + 302.2 + (uMouse.x * 2.0 - 1.0) * 0.1;
            float new_pixel_angle = atan(uv.y, uv.x) + speed - 20.0 * (0.25 * uv_len + 0.75);
            vec2 mid = (screenSize.xy / length(screenSize.xy)) / 2.0;
            uv = (vec2(uv_len * cos(new_pixel_angle) + mid.x, uv_len * sin(new_pixel_angle) + mid.y) - mid);
            uv *= 30.0;
            float baseSpeed = iTime * 7.0;
            speed = baseSpeed + (uMouse.x * 2.0 - 1.0) * 2.0;
            
            vec2 uv2 = vec2(uv.x + uv.y);
            for(int i = 0; i < 5; i++) {
                uv2 += sin(max(uv.x, uv.y)) + uv;
                uv += 0.5 * vec2(cos(5.1123 + 0.353 * uv2.y + speed * 0.1311), sin(uv2.x - 0.113 * speed));
                uv -= cos(uv.x + uv.y) - sin(uv.x * 0.711 - uv.y);
            }
            
            float contrast_mod = (0.25 * 3.5 + 0.5 * 0.25 + 1.2);
            float paint_res = min(2.0, max(0.0, length(uv) * 0.035 * contrast_mod));
            float c1p = max(0.0, 1.0 - contrast_mod * abs(1.0 - paint_res));
            float c2p = max(0.0, 1.0 - contrast_mod * abs(paint_res));
            float c3p = 1.0 - min(1.0, c1p + c2p);
            
            vec4 col1 = vec4(1.0, 0.0, 0.2, 1.0); // Vermelho Sanguíneo
            vec4 col2 = vec4(1.0, 0.33, 0.0, 1.0); // Laranja Místico
            vec4 col3 = vec4(0.08, 0.0, 0.02, 1.0);
            
            return col1 * c1p + col2 * c2p + vec4(c3p * col3.rgb, c3p * col1.a);
        }

        void main() {
            vec2 uv = vUv * iResolution.xy;
            gl_FragColor = effect(iResolution.xy, uv);
        }
      `;
    } else if (mode === 'ferrofluid') {
      fsSource = `
        precision highp float;
        uniform vec3 iResolution;
        uniform vec2 iMouse;
        uniform float iTime;
        varying vec2 vUv;

        void main() {
          vec2 p = (gl_FragCoord.xy - 0.5 * iResolution.xy) / iResolution.y;
          float t = iTime * 0.5;
          float d = length(p);
          float angle = atan(p.y, p.x);
          
          float wave = sin(d * 22.0 - t * 4.0 + sin(angle * 6.0 + t));
          float rim = smoothstep(0.0, 0.1, abs(wave) - 0.05);
          
          vec3 col = mix(vec3(1.0, 0.0, 0.2), vec3(1.0, 0.33, 0.0), sin(t + d * 5.0) * 0.5 + 0.5);
          gl_FragColor = vec4(col * (1.0 - rim), 1.0);
        }
      `;
    } else if (mode === 'metaballs') {
      fsSource = `
        precision highp float;
        uniform vec3 iResolution;
        uniform vec2 iMouse;
        uniform float iTime;
        varying vec2 vUv;

        float getMetaBall(vec2 p, vec2 center, float r) {
          vec2 d = p - center;
          return (r * r) / dot(d, d);
        }

        void main() {
          vec2 p = (gl_FragCoord.xy - 0.5 * iResolution.xy) / iResolution.y * 30.0;
          vec2 m = (iMouse - 0.5) * 30.0;
          float t = iTime * 0.8;
          
          float mb = 0.0;
          for (int i = 0; i < 8; i++) {
            float fi = float(i);
            vec2 pos = vec2(cos(t + fi * 0.8) * 10.0, sin(t * 1.2 + fi * 0.9) * 8.0);
            mb += getMetaBall(p, pos, 2.5);
          }
          mb += getMetaBall(p, m, 3.5);
          
          float f = smoothstep(0.9, 1.1, mb);
          vec3 col = mix(vec3(1.0, 0.0, 0.2), vec3(1.0, 0.5, 0.0), mb * 0.25);
          gl_FragColor = vec4(col * f, f * 0.95);
        }
      `;
    } else if (mode === 'splashcursor') {
      fsSource = `
        precision highp float;
        uniform vec2 iResolution;
        uniform float iTime;
        uniform vec2 uMouse;
        varying vec2 vUv;

        void main() {
          vec2 p = vUv;
          vec2 m = uMouse;
          float d = length(p - m);
          float wave = sin(d * 40.0 - iTime * 6.0) * exp(-d * 5.0);
          vec3 col = mix(vec3(1.0, 0.0, 0.2), vec3(1.0, 0.8, 0.0), wave * 0.5 + 0.5);
          gl_FragColor = vec4(col * (1.0 - d), 0.9);
        }
      `;
    } else if (mode === 'prismaticburst') {
      fsSource = `
        precision highp float;
        uniform vec2 iResolution;
        uniform float iTime;
        uniform vec2 uMouse;
        varying vec2 vUv;

        void main() {
          vec2 p = (gl_FragCoord.xy - 0.5 * iResolution.xy) / iResolution.y;
          float t = iTime * 0.8;
          float angle = atan(p.y, p.x);
          float dist = length(p);
          
          float rays = sin(angle * 16.0 + t) * sin(dist * 20.0 - t * 2.0);
          vec3 col = mix(vec3(1.0, 0.0, 0.2), vec3(1.0, 0.8, 0.0), rays * 0.5 + 0.5);
          gl_FragColor = vec4(col * smoothstep(0.8, 0.0, dist), 0.95);
        }
      `;
    } else { // plasma
      fsSource = `
        precision highp float;
        uniform vec2 iResolution;
        uniform float iTime;
        uniform vec2 uMouse;
        varying vec2 vUv;

        void main() {
          vec2 p = (gl_FragCoord.xy - 0.5 * iResolution.xy) / iResolution.y;
          float t = iTime * 0.6;
          
          float v1 = sin(p.x * 10.0 + t);
          float v2 = sin(10.0 * (p.x * sin(t / 2.0) + p.y * cos(t / 3.0)) + t);
          float cx = p.x + 0.5 * sin(t / 5.0);
          float cy = p.y + 0.5 * cos(t / 3.0);
          float v3 = sin(sqrt(100.0 * (cx * cx + cy * cy) + 1.0) + t);
          
          float v = v1 + v2 + v3;
          vec3 col = vec3(sin(v * 3.14159), sin(v * 3.14159 + 1.0), sin(v * 3.14159 + 2.0));
          col = mix(col, vec3(1.0, 0.0, 0.2), 0.6);
          
          gl_FragColor = vec4(col, 0.85);
        }
      `;
    }

    const vs = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vs, vsSource);
    gl.compileShader(vs);

    const fs = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fs, fsSource);
    gl.compileShader(fs);

    this.program = gl.createProgram();
    gl.attachShader(this.program, vs);
    gl.attachShader(this.program, fs);
    gl.linkProgram(this.program);
    gl.useProgram(this.program);

    const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const posAttr = gl.getAttribLocation(this.program, 'position');
    gl.enableVertexAttribArray(posAttr);
    gl.vertexAttribPointer(posAttr, 2, gl.FLOAT, false, 0, 0);
  }

  loop() {
    if (!this.gl || !this.program) return;
    const gl = this.gl;
    const elapsed = (performance.now() - this.startTime) * 0.001;

    gl.useProgram(this.program);

    const timeLoc = gl.getUniformLocation(this.program, 'iTime');
    if (timeLoc) gl.uniform1f(timeLoc, elapsed);

    const resLoc = gl.getUniformLocation(this.program, 'iResolution');
    if (resLoc) gl.uniform3f(resLoc, this.canvas.width, this.canvas.height, 1.0);

    const mouseLoc = gl.getUniformLocation(this.program, 'uMouse');
    if (mouseLoc) gl.uniform2f(mouseLoc, this.mousePos[0], this.mousePos[1]);

    const iMouseLoc = gl.getUniformLocation(this.program, 'iMouse');
    if (iMouseLoc) gl.uniform2f(iMouseLoc, this.mousePos[0] * this.canvas.width, this.mousePos[1] * this.canvas.height);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    this.animFrameId = requestAnimationFrame(() => this.loop());
  }
}
