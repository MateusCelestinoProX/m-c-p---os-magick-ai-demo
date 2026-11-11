/* ==========================================================================
   MAGICK A.I - PORTFOLIO SHOWCASE DEMO CONTROLLER
   Transição cinematográfica: Tela Base suave -> Layout Animado do Software
   ========================================================================== */

class DemoShowcaseController {
  constructor() {
    this.overlay = document.getElementById('demo-intro-overlay');
    this.enterBtn = document.getElementById('demo-enter-btn');
    this.quickDivBtn = document.getElementById('demo-quick-div-btn');
    this.progressBar = document.getElementById('demo-progress-fill');
    this.floatingDock = document.getElementById('demo-floating-dock');
    this.replayBtn = document.getElementById('demo-replay-btn');
    this.tourBtn = document.getElementById('demo-tour-btn');
    this.specsBtn = document.getElementById('demo-specs-btn');
    this.specsModal = document.getElementById('demo-specs-modal');
    this.closeSpecsBtn = document.getElementById('demo-close-specs-btn');

    this.autoTimer = null;
    this.progressInterval = null;
    this.hasEntered = false;
    this.audioCtx = null;

    this.init();
  }

  init() {
    if (!this.overlay) return;

    // Iniciar contagem progressiva da Tela Base
    this.startCountdown(4500);

    // Eventos de clique
    if (this.enterBtn) {
      this.enterBtn.addEventListener('click', () => this.launchDemo('home'));
    }

    if (this.quickDivBtn) {
      this.quickDivBtn.addEventListener('click', () => this.launchDemo('divination'));
    }

    // Tecla rápida (Enter ou Barra de espaço para avançar imediatamente)
    window.addEventListener('keydown', (e) => {
      if (!this.hasEntered && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        this.launchDemo('home');
      }
    });

    // Controles do Floating Dock
    if (this.replayBtn) {
      this.replayBtn.addEventListener('click', () => this.replayIntro());
    }

    if (this.tourBtn) {
      this.tourBtn.addEventListener('click', () => this.runInteractiveTour());
    }

    if (this.specsBtn) {
      this.specsBtn.addEventListener('click', () => this.openSpecsModal());
    }

    if (this.closeSpecsBtn && this.specsModal) {
      this.closeSpecsBtn.addEventListener('click', () => this.closeSpecsModal());
      this.specsModal.addEventListener('click', (e) => {
        if (e.target === this.specsModal) this.closeSpecsModal();
      });
    }
  }

  playHarmonicChime() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      if (!this.audioCtx) this.audioCtx = new AudioContext();

      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      // Frequência harmônica 528Hz (tom de cura/transformação da Magia do Caos)
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(528, now);
      osc.frequency.exponentialRampToValueAtTime(1056, now + 0.8);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.12, now + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 1.2);
    } catch (e) {
      // Ignorar caso navegador bloqueie autoplay de áudio
    }
  }

  startCountdown(totalDurationMs) {
    let elapsed = 0;
    const step = 50;

    if (this.progressBar) {
      this.progressBar.style.width = '0%';
    }

    this.progressInterval = setInterval(() => {
      elapsed += step;
      const pct = Math.min((elapsed / totalDurationMs) * 100, 100);
      if (this.progressBar) {
        this.progressBar.style.width = `${pct}%`;
      }

      if (elapsed >= totalDurationMs) {
        clearInterval(this.progressInterval);
        if (!this.hasEntered) {
          this.launchDemo('home');
        }
      }
    }, step);
  }

  launchDemo(targetView = 'home') {
    if (this.hasEntered) return;
    this.hasEntered = true;

    if (this.progressInterval) clearInterval(this.progressInterval);
    if (this.autoTimer) clearTimeout(this.autoTimer);

    // Efeito sonoro suave harmônico
    this.playHarmonicChime();

    // Navegar para a view inicial desejada
    if (window.appRouter && targetView !== 'home') {
      window.appRouter.navigateTo(targetView);
    }

    // GSAP Timeline para animação suave do software
    if (window.gsap) {
      const tl = gsap.timeline();

      // 1. Desvanecer a Tela Base com efeito expansivo e blur
      tl.to(this.overlay, {
        opacity: 0,
        scale: 1.05,
        filter: 'blur(10px)',
        duration: 0.85,
        ease: 'power2.inOut',
        onComplete: () => {
          this.overlay.style.display = 'none';
          this.overlay.style.pointerEvents = 'none';
        }
      });

      // 2. Animar Header
      tl.fromTo('#main-header', 
        { y: -40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out' },
        '-=0.4'
      );

      // 3. Animar Seção Hero
      tl.fromTo('.hero-header',
        { opacity: 0, y: 30, scale: 0.97 },
        { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'back.out(1.2)' },
        '-=0.5'
      );

      // 4. Animar Cards de Funcionalidade em Stagger
      tl.fromTo('.feature-card',
        { opacity: 0, y: 40, scale: 0.94 },
        { 
          opacity: 1, 
          y: 0, 
          scale: 1, 
          duration: 0.7, 
          stagger: 0.12, 
          ease: 'power3.out' 
        },
        '-=0.4'
      );

      // 5. Revelar o Floating Dock da Demo
      if (this.floatingDock) {
        tl.fromTo(this.floatingDock,
          { opacity: 0, y: 30, scale: 0.9 },
          { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'back.out(1.5)' },
          '-=0.2'
        );
      }
    } else {
      // Fallback sem GSAP
      this.overlay.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
      this.overlay.style.opacity = '0';
      this.overlay.style.transform = 'scale(1.05)';
      setTimeout(() => {
        this.overlay.style.display = 'none';
        if (this.floatingDock) this.floatingDock.style.opacity = '1';
      }, 800);
    }
  }

  replayIntro() {
    if (!this.overlay) return;
    this.hasEntered = false;
    this.overlay.style.display = 'flex';
    this.overlay.style.pointerEvents = 'auto';

    if (window.gsap) {
      gsap.to(this.overlay, {
        opacity: 1,
        scale: 1,
        filter: 'blur(0px)',
        duration: 0.6,
        ease: 'power2.out',
        onComplete: () => {
          this.startCountdown(5000);
        }
      });
    } else {
      this.overlay.style.opacity = '1';
      this.overlay.style.transform = 'scale(1)';
      this.startCountdown(5000);
    }
  }

  runInteractiveTour() {
    if (!window.appRouter) return;
    const views = ['home', 'servers', 'charger', 'divination'];
    let idx = 0;

    const toast = document.createElement('div');
    toast.className = 'demo-tour-toast';
    document.body.appendChild(toast);

    const stepLabels = {
      home: '🏠 1/4: Visão Geral & Hero Cinematográfico com Esfera ASCII e Canvas Shader',
      servers: '🔮 2/4: Catálogo Completo dos 40 Servidores + 4 Diabos com Filtros e Sigilos',
      charger: '⚡ 3/4: Energizador de Sigilos com 6 WebGL Shaders e 12 Cores de Emissão',
      divination: '🃏 4/4: Cyberdivinação 3D com GSAP, Embaralhamento Caótico e Revelação Oracular'
    };

    const nextStep = () => {
      if (idx >= views.length) {
        toast.innerHTML = '✨ <strong>Tour Completo Concluído!</strong> Aproveite a demonstração livremente.';
        setTimeout(() => toast.remove(), 2500);
        return;
      }

      const view = views[idx];
      window.appRouter.navigateTo(view);
      toast.innerHTML = stepLabels[view];

      idx++;
      setTimeout(nextStep, 2600);
    };

    nextStep();
  }

  openSpecsModal() {
    if (this.specsModal) {
      this.specsModal.classList.add('active');
    }
  }

  closeSpecsModal() {
    if (this.specsModal) {
      this.specsModal.classList.remove('active');
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.demoShowcase = new DemoShowcaseController();
});
