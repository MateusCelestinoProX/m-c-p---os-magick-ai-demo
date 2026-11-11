/* ==========================================================================
   MAGICK A.I - DYNAMIC BACKGROUND ENGINE & CONFIGURATION WIDGET
   ========================================================================== */

class BackgroundEngine {
  constructor() {
    this.categories = {};
    this.currentCategory = '';
    this.currentImages = [];
    this.currentIndex = 0;
    this.slideshowInterval = null;
    this.displayDuration = 3000; // 3 segundos por imagem

    this.dimOpacity = 0.5; // 50% de escurecimento padrão
    this.blurAmount = 0; // 0px de blur padrão

    this.container = null;
    this.layerA = null;
    this.layerB = null;
    this.dimOverlay = null;
    this.activeLayer = 'A';

    this.initDOM();
    this.loadBackgroundsData();
    this.initWidgetEvents();
  }

  initDOM() {
    this.container = document.getElementById('cinematic-bg-container');
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'cinematic-bg-container';
      document.body.prepend(this.container);
    }

    this.container.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      z-index: 0;
      overflow: hidden;
      pointer-events: none;
    `;

    this.container.innerHTML = `
      <div id="bg-layer-a" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-size: cover; background-position: center; background-repeat: no-repeat; transition: opacity 1.2s ease-in-out, filter 0.4s ease; opacity: 0;"></div>
      <div id="bg-layer-b" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-size: cover; background-position: center; background-repeat: no-repeat; transition: opacity 1.2s ease-in-out, filter 0.4s ease; opacity: 0;"></div>
      <div id="bg-dim-overlay" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, ${this.dimOpacity}); transition: background-color 0.3s ease;"></div>
    `;

    this.layerA = document.getElementById('bg-layer-a');
    this.layerB = document.getElementById('bg-layer-b');
    this.dimOverlay = document.getElementById('bg-dim-overlay');
  }

  async loadBackgroundsData() {
    try {
      const response = await fetch('assets/data/backgrounds.json');
      const data = await response.json();
      this.categories = data.categories || {};

      const catNames = Object.keys(this.categories);
      if (catNames.length === 0) return;

      // REGRA: Abrir com um background aleatório cada vez que o site for aberto
      const randomCat = catNames[Math.floor(Math.random() * catNames.length)];
      this.setCategory(randomCat);

      this.populateWidgetCategoryOptions(catNames);
    } catch (e) {
      console.error('Erro ao carregar dados de backgrounds:', e);
    }
  }

  setCategory(categoryName) {
    if (!this.categories[categoryName] || this.categories[categoryName].length === 0) return;

    this.currentCategory = categoryName;
    this.currentImages = this.categories[categoryName];
    this.currentIndex = 0;

    // Atualizar UI do widget
    const activeRadio = document.querySelector(`input[name="bg-category-radio"][value="${categoryName}"]`);
    if (activeRadio) activeRadio.checked = true;

    // Reiniciar slideshow
    this.startSlideshow();
  }

  startSlideshow() {
    if (this.slideshowInterval) {
      clearInterval(this.slideshowInterval);
    }

    // Exibir primeira imagem imediatamente
    this.showNextImage();

    // REGRA: Cada imagem fica 3 segundos e troca cinematicamente
    this.slideshowInterval = setInterval(() => {
      this.showNextImage();
    }, this.displayDuration);

    if (!this.visibilityListenerBound) {
      this.visibilityListenerBound = true;
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          if (this.slideshowInterval) {
            clearInterval(this.slideshowInterval);
            this.slideshowInterval = null;
          }
        } else {
          if (!this.slideshowInterval && this.currentImages && this.currentImages.length > 0) {
            this.slideshowInterval = setInterval(() => {
              this.showNextImage();
            }, this.displayDuration);
          }
        }
      });

      window.addEventListener('modalopen', () => {
        if (this.slideshowInterval) {
          clearInterval(this.slideshowInterval);
          this.slideshowInterval = null;
        }
      });

      window.addEventListener('modalclose', () => {
        if (!this.slideshowInterval && this.currentImages && this.currentImages.length > 0 && !document.hidden) {
          this.slideshowInterval = setInterval(() => {
            this.showNextImage();
          }, this.displayDuration);
        }
      });
    }
  }

  showNextImage() {
    if (!this.currentImages.length) return;

    const imgUrl = this.currentImages[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % this.currentImages.length;

    // Transição cinematica suave usando duas camadas
    if (this.activeLayer === 'A') {
      this.layerB.style.backgroundImage = `url('${imgUrl}')`;
      this.layerB.style.filter = `blur(${this.blurAmount}px)`;
      this.layerB.style.opacity = '1';
      this.layerA.style.opacity = '0';
      this.activeLayer = 'B';
    } else {
      this.layerA.style.backgroundImage = `url('${imgUrl}')`;
      this.layerA.style.filter = `blur(${this.blurAmount}px)`;
      this.layerA.style.opacity = '1';
      this.layerB.style.opacity = '0';
      this.activeLayer = 'A';
    }
  }

  setDimOpacity(val) {
    this.dimOpacity = parseFloat(val);
    if (this.dimOverlay) {
      this.dimOverlay.style.backgroundColor = `rgba(0, 0, 0, ${this.dimOpacity})`;
    }
  }

  setBlurAmount(val) {
    this.blurAmount = parseFloat(val);
    if (this.layerA) this.layerA.style.filter = `blur(${this.blurAmount}px)`;
    if (this.layerB) this.layerB.style.filter = `blur(${this.blurAmount}px)`;
  }

  populateWidgetCategoryOptions(catNames) {
    const container = document.getElementById('bg-categories-options-container');
    if (!container) return;

    const categoryLabels = {
      caosphere: '🌀 Caosfera (Esfera Caótica)',
      celestial: '✨ Celestial (Estrelas & Cosmos)',
      horror: '🩸 Horror (Tenebroso Sanguíneo)',
      satanic: '⛧ Satânico (Ritual & Símbolos)'
    };

    container.innerHTML = '';

    catNames.forEach(cat => {
      const count = this.categories[cat].length;
      const label = categoryLabels[cat] || cat.toUpperCase();

      const labelEl = document.createElement('label');
      labelEl.className = 'bg-cat-option-card';
      labelEl.innerHTML = `
        <input type="radio" name="bg-category-radio" value="${cat}" ${cat === this.currentCategory ? 'checked' : ''}>
        <div class="bg-cat-card-body">
          <span class="bg-cat-name">${label}</span>
          <span class="bg-cat-count">${count} imagens</span>
        </div>
      `;

      labelEl.querySelector('input').addEventListener('change', (e) => {
        if (e.target.checked) {
          this.setCategory(e.target.value);
        }
      });

      container.appendChild(labelEl);
    });
  }

  initWidgetEvents() {
    const widgetBtn = document.getElementById('bg-widget-toggle-btn');
    const modal = document.getElementById('bg-widget-modal');
    const closeBtn = document.getElementById('bg-widget-close-btn');

    if (widgetBtn && modal) {
      widgetBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isActive = modal.classList.toggle('active');
        widgetBtn.classList.toggle('active', isActive);
      });
    }

    if (closeBtn && modal) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        modal.classList.remove('active');
        if (widgetBtn) widgetBtn.classList.remove('active');
      });
    }

    // Fechar ao clicar fora do widget
    document.addEventListener('click', (e) => {
      if (modal && modal.classList.contains('active')) {
        if (!modal.contains(e.target) && widgetBtn && !widgetBtn.contains(e.target)) {
          modal.classList.remove('active');
          if (widgetBtn) widgetBtn.classList.remove('active');
        }
      }
    });

    // Fechar ao pressionar tecla Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
        modal.classList.remove('active');
        if (widgetBtn) widgetBtn.classList.remove('active');
      }
    });

    // Sliders de escurecimento e blur
    const dimSlider = document.getElementById('bg-dim-slider');
    const dimValueText = document.getElementById('bg-dim-value-text');
    if (dimSlider) {
      dimSlider.addEventListener('input', (e) => {
        const opacity = parseFloat(e.target.value);
        this.setDimOpacity(opacity);
        if (dimValueText) dimValueText.innerText = `${Math.round(opacity * 100)}%`;
      });
    }

    const blurSlider = document.getElementById('bg-blur-slider');
    const blurValueText = document.getElementById('bg-blur-value-text');
    if (blurSlider) {
      blurSlider.addEventListener('input', (e) => {
        const blurPx = parseFloat(e.target.value);
        this.setBlurAmount(blurPx);
        if (blurValueText) blurValueText.innerText = `${blurPx}px`;
      });
    }
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.backgroundEngine = new BackgroundEngine();
  });
} else {
  window.backgroundEngine = new BackgroundEngine();
}
