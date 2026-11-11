/* ==========================================================================
   MAGICK A.I - CYBER DIVINATION ENGINE v3.0
   Altar Digital de Ciberdivinação 3D com 40 Cartas 100% Visíveis Simultaneamente
   (Suporte Nativo a Android Portrait & Landscape, Ocultação em Dominó e Embaralhamento Dinâmico)
   ========================================================================== */

class CyberDivinationEngine {
  constructor() {
    this.state = 'idle'; // idle, flipping_down, shuffling, reading, transitioning_to_reading, reading_done
    this.servantsOnly = [];
    this.currentDeck = [];
    this.selectedCards = [];
    this.spreadSize = 1;

    // Elementos DOM
    this.divinationHUD = null;
    this.divinationUI = null;
    this.spreadSelect = null;
    this.startBtn = null;
    this.cardsContainer = null;
    this.deckViewport = null;
    this.readingModal = null;
    this.readingCardsContainer = null;
    this.statusTitle = null;
    this.statusSubtitle = null;
    this.closeReadingBtn = null;
    this.resetReadingBtn = null;

    // Configuração de Grade Responsiva de Filas (Exatamente 40 cartas)
    this.gridConfig = {
      cols: 5,
      rows: 8,
      cardWidth: 50,
      cardHeight: 70,
      gapX: 4,
      gapY: 4,
      slots: [] // { x, y } para cada slot de 0 a 39
    };

    this.cardElements = [];
    this.resizeObserver = null;

    this.initElements();
    this.bindEvents();

    // Inicialização imediata ao carregar a página: carregar dados e renderizar face-up
    this.initInitialDeck();
  }

  initElements() {
    this.divinationHUD = document.getElementById('divination-hud');
    this.divinationUI = document.getElementById('divination-ui');
    this.spreadSelect = document.getElementById('divination-spread-select') || document.getElementById('divination-mode-select');
    this.startBtn = document.getElementById('start-divination-btn');
    this.cardsContainer = document.getElementById('cards-container');
    this.deckViewport = document.getElementById('divination-deck-viewport');
    this.readingModal = document.getElementById('reading-result');
    this.readingCardsContainer = document.getElementById('reading-cards') || document.getElementById('reading-results-panel');
    this.statusTitle = document.getElementById('divination-status-title');
    this.statusSubtitle = document.getElementById('divination-status-subtitle');
    this.closeReadingBtn = document.getElementById('modal-close-reading-btn');
    this.resetReadingBtn = document.getElementById('reading-reset-btn');
    this.navServersBtn = document.getElementById('reading-nav-servers-btn');
    this.navChargerBtn = document.getElementById('reading-nav-charger-btn');
    this.navHomeBtn = document.getElementById('reading-nav-home-btn');
  }

  bindEvents() {
    if (this.startBtn) {
      this.startBtn.addEventListener('click', () => {
        if (this.spreadSelect) {
          const val = this.spreadSelect.value;
          if (val === '1' || val === 'single') this.spreadSize = 1;
          else if (val === '3' || val === 'triad') this.spreadSize = 3;
          else if (val === '5' || val === 'cross' || val === 'mirror') this.spreadSize = 5;
          else this.spreadSize = parseInt(val) || 1;
        }
        this.startRitual();
      });
    }

    if (this.spreadSelect) {
      this.spreadSelect.addEventListener('change', (e) => {
        const val = e.target.value;
        if (val === '1' || val === 'single') this.spreadSize = 1;
        else if (val === '3' || val === 'triad') this.spreadSize = 3;
        else if (val === '5' || val === 'cross' || val === 'mirror') this.spreadSize = 5;
        else this.spreadSize = parseInt(val) || 1;
      });
    }

    if (this.closeReadingBtn) {
      this.closeReadingBtn.addEventListener('click', () => {
        this.closeReadingModal();
      });
    }

    if (this.resetReadingBtn) {
      this.resetReadingBtn.addEventListener('click', () => {
        this.closeReadingModal();
      });
    }

    // Clique no backdrop fecha o modal
    if (this.readingModal) {
      this.readingModal.addEventListener('click', (e) => {
        if (e.target === this.readingModal) {
          this.closeReadingModal();
        }
      });
    }

    // Botões de navegação direta integrados no painel de leitura
    if (this.navServersBtn) {
      this.navServersBtn.addEventListener('click', () => {
        this.closeReadingModal();
        if (window.appRouter) window.appRouter.navigateTo('servers');
      });
    }

    if (this.navChargerBtn) {
      this.navChargerBtn.addEventListener('click', () => {
        this.closeReadingModal();
        if (window.appRouter) window.appRouter.navigateTo('charger');
      });
    }

    if (this.navHomeBtn) {
      this.navHomeBtn.addEventListener('click', () => {
        this.closeReadingModal();
        if (window.appRouter) window.appRouter.navigateTo('home');
      });
    }

    // Ouvir resize e mudança de orientação no Android nativo
    let resizeTimer;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        this.handleResize();
      }, 50);
    };

    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', () => {
      setTimeout(() => this.handleResize(), 100);
      setTimeout(() => this.handleResize(), 300);
    });

    if (window.screen && window.screen.orientation) {
      window.screen.orientation.addEventListener('change', () => {
        setTimeout(() => this.handleResize(), 100);
        setTimeout(() => this.handleResize(), 300);
      });
    }

    // ResizeObserver dedicado para o Altar: garante reação imediata a qualquer rotação
    if (typeof ResizeObserver !== 'undefined' && this.deckViewport) {
      const ro = new ResizeObserver((entries) => {
        for (const entry of entries) {
          if (entry.contentRect.width > 60 && entry.contentRect.height > 60) {
            onResize();
          }
        }
      });
      ro.observe(this.deckViewport);
    }

    // Ouvir transição de abas (evento viewchange do AppRouter)
    window.addEventListener('viewchange', (e) => {
      const view = e.detail?.view;
      if (view === 'divination' || view === 'cyberdivination') {
        // Renderizar ou reposicionar na hora que a aba se torna visível
        requestAnimationFrame(() => {
          setTimeout(() => {
            this.ensureFaceUpGrid();
            this.handleResize();
          }, 80);
        });
      }
    });
  }

  async loadServersData() {
    if (this.servantsOnly.length > 0) return;
    try {
      const response = await fetch('assets/data/servers.json');
      const data = await response.json();
      const allServers = data.servers || [];
      // Isolando com rigor as 40 cartas dos Servidores
      this.servantsOnly = allServers.filter(s => s.category !== 'devil' && s.type !== 'devil');
    } catch (e) {
      console.error('Erro ao carregar banco de dados para Cyberdivinação:', e);
    }
  }

  async initInitialDeck() {
    await this.loadServersData();
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.renderInitialFaceUpGrid();
      });
    } else {
      this.renderInitialFaceUpGrid();
    }
  }

  async ensureFaceUpGrid() {
    this.initElements();
    if (!this.servantsOnly.length) {
      await this.loadServersData();
    }

    if (this.cardElements.length === 0) {
      this.renderInitialFaceUpGrid();
    } else {
      this.calculateGridGeometry();
      this.handleResize();
      if (this.state === 'idle' || this.state === 'reading_done') {
        this.resetDeckToFaceUp();
      }
    }
  }

  // =========================================================================
  // GEOMETRIA RESPONSIVA: Garante 100% das 40 Cartas Visíveis Simultaneamente
  // =========================================================================
  calculateGridGeometry() {
    this.initElements();
    if (!this.cardsContainer) return;

    let containerWidth = 0;
    let containerHeight = 0;

    if (this.deckViewport) {
      const vpRect = this.deckViewport.getBoundingClientRect();
      containerWidth = Math.floor(vpRect.width || this.deckViewport.clientWidth);
      containerHeight = Math.floor(vpRect.height || this.deckViewport.clientHeight);
    }

    if (!containerWidth || containerWidth < 80) {
      containerWidth = this.cardsContainer.clientWidth || (window.innerWidth ? Math.max(300, window.innerWidth - 16) : 380);
    }
    if (!containerHeight || containerHeight < 80) {
      const headerH = document.querySelector('.main-header')?.clientHeight || 45;
      const hudH = document.getElementById('divination-hud')?.clientHeight || 45;
      containerHeight = window.innerHeight ? Math.max(260, window.innerHeight - headerH - hudH - 20) : 520;
    }

    // Fixar dimensões físicas explícitas no cardsContainer para impedir colapso a 0px
    this.cardsContainer.style.width = `${containerWidth}px`;
    this.cardsContainer.style.height = `${containerHeight}px`;

    // Detecção precisa de orientação de tela
    const isLandscape = containerWidth > containerHeight * 1.12;

    let cols, rows;
    let gapX, gapY;

    if (isLandscape) {
      // No modo landscape: comparar 10 colunas x 4 linhas vs 8 colunas x 5 linhas
      // Escolher a grade que entrega maior área por carta sem nenhum corte
      const padX = 8, padY = 6;

      // Opção 1: 10 colunas x 4 linhas (40 cartas)
      const gX10 = 5, gY10 = 4;
      const netW10 = containerWidth - (padX * 2) - (9 * gX10);
      const netH10 = containerHeight - (padY * 2) - (3 * gY10);
      const maxW10 = netW10 / 10;
      const maxH10 = netH10 / 4;
      const h10 = Math.min(maxH10, maxW10 * 1.36);
      const w10 = h10 / 1.36;
      const area10 = w10 * h10;

      // Opção 2: 8 colunas x 5 linhas (40 cartas)
      const gX8 = 6, gY8 = 4;
      const netW8 = containerWidth - (padX * 2) - (7 * gX8);
      const netH8 = containerHeight - (padY * 2) - (4 * gY8);
      const maxW8 = netW8 / 8;
      const maxH8 = netH8 / 5;
      const h8 = Math.min(maxH8, maxW8 * 1.36);
      const w8 = h8 / 1.36;
      const area8 = w8 * h8;

      if (area10 >= area8) {
        cols = 10;
        rows = 4;
        gapX = gX10;
        gapY = gY10;
        this.gridConfig.cardWidth = Math.floor(w10);
        this.gridConfig.cardHeight = Math.floor(h10);
      } else {
        cols = 8;
        rows = 5;
        gapX = gX8;
        gapY = gY8;
        this.gridConfig.cardWidth = Math.floor(w8);
        this.gridConfig.cardHeight = Math.floor(h8);
      }
    } else {
      // Modo Portrait: 5 colunas x 8 linhas (40 cartas perfeitas)
      cols = 5;
      rows = 8;
      gapX = 4;
      gapY = 4;
      const padX = 6, padY = 6;
      const netW = containerWidth - (padX * 2) - (4 * gapX);
      const netH = containerHeight - (padY * 2) - (7 * gapY);
      const maxW = netW / 5;
      const maxH = netH / 8;

      const targetRatio = 1.38;
      let cardH = Math.min(maxH, maxW * targetRatio);
      let cardW = cardH / targetRatio;
      if (cardW * 5 + 4 * gapX > netW) {
        cardW = maxW;
        cardH = cardW * targetRatio;
      }
      this.gridConfig.cardWidth = Math.max(28, Math.floor(cardW));
      this.gridConfig.cardHeight = Math.max(38, Math.floor(cardH));
    }

    // Trava de segurança anti-overflow absoluta: garante que cols*W + gap <= containerW e rows*H + gap <= containerH
    while ((cols * this.gridConfig.cardWidth + (cols - 1) * gapX > containerWidth - 6) && this.gridConfig.cardWidth > 20) {
      this.gridConfig.cardWidth--;
      this.gridConfig.cardHeight = Math.floor(this.gridConfig.cardWidth * 1.36);
    }
    while ((rows * this.gridConfig.cardHeight + (rows - 1) * gapY > containerHeight - 6) && this.gridConfig.cardHeight > 28) {
      this.gridConfig.cardHeight--;
      this.gridConfig.cardWidth = Math.floor(this.gridConfig.cardHeight / 1.36);
    }

    this.gridConfig.cols = cols;
    this.gridConfig.rows = rows;
    this.gridConfig.gapX = gapX;
    this.gridConfig.gapY = gapY;

    const totalGridWidth = cols * this.gridConfig.cardWidth + (cols - 1) * gapX;
    const totalGridHeight = rows * this.gridConfig.cardHeight + (rows - 1) * gapY;

    // Alinhamento perfeitamente centralizado no Altar Sagrado
    const startX = Math.max(2, Math.floor((containerWidth - totalGridWidth) / 2));
    const startY = Math.max(2, Math.floor((containerHeight - totalGridHeight) / 2));

    this.gridConfig.slots = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = startX + c * (this.gridConfig.cardWidth + gapX);
        const y = startY + r * (this.gridConfig.cardHeight + gapY);
        this.gridConfig.slots.push({ x, y });
      }
    }
  }

  handleResize() {
    if (this.cardElements.length === 0) return;
    this.calculateGridGeometry();

    const captionFontSize = Math.max(6.5, Math.floor(this.gridConfig.cardWidth * 0.13));
    const captionHeight = Math.max(12, Math.floor(this.gridConfig.cardHeight * 0.18));
    const sigilFontSize = Math.max(12, Math.floor(this.gridConfig.cardWidth * 0.38));

    this.cardElements.forEach((wrapper, index) => {
      const slotIndex = parseInt(wrapper.dataset.slotIndex);
      const targetIndex = !isNaN(slotIndex) ? slotIndex : index;
      const slot = this.gridConfig.slots[targetIndex] || { x: 0, y: 0 };

      // Atualizar tipografia proporcional
      const caption = wrapper.querySelector('.card-caption');
      if (caption) {
        caption.style.fontSize = `${captionFontSize}px`;
        caption.style.height = `${captionHeight}px`;
        caption.style.lineHeight = `${captionHeight}px`;
      }
      const sigil = wrapper.querySelector('.cyber-card-back-sigil');
      if (sigil) {
        sigil.style.fontSize = `${sigilFontSize}px`;
      }

      if (typeof gsap !== 'undefined') {
        gsap.to(wrapper, {
          left: slot.x,
          top: slot.y,
          width: this.gridConfig.cardWidth,
          height: this.gridConfig.cardHeight,
          duration: 0.32,
          ease: 'power2.out'
        });
      } else {
        wrapper.style.left = `${slot.x}px`;
        wrapper.style.top = `${slot.y}px`;
        wrapper.style.width = `${this.gridConfig.cardWidth}px`;
        wrapper.style.height = `${this.gridConfig.cardHeight}px`;
      }
    });
  }

  // =========================================================================
  // VERSO PREMIUM VECTORIAL (SVG) • A SAGRADA CAOSFERA DE 8 FLECHAS
  // =========================================================================
  getPremiumCardBackSVG() {
    return `
      <svg class="cyber-card-back-svg" viewBox="0 0 100 150" width="100%" height="100%" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Fundo Imperial Aveludado Sanguíneo -->
        <rect width="100" height="150" rx="4.5" fill="url(#bgVelvet)"/>

        <!-- Molduras Ornamentais em Fio de Ouro e Carmesim -->
        <rect x="2.5" y="2.5" width="95" height="145" rx="3.5" fill="none" stroke="url(#cardGold)" stroke-width="1.2"/>
        <rect x="4.8" y="4.8" width="90.4" height="140.4" rx="2.8" fill="none" stroke="url(#cardRed)" stroke-width="0.65" stroke-opacity="0.75"/>
        <rect x="7" y="7" width="86" height="136" rx="2.2" fill="none" stroke="url(#cardGold)" stroke-width="0.75" stroke-dasharray="2.5, 1.5"/>

        <!-- Cantoneiras Ornamentais Místicas nos 4 Cantos -->
        <g stroke="url(#cardGold)" stroke-width="0.85" fill="none">
          <path d="M8.5 17 L8.5 8.5 L17 8.5"/>
          <path d="M10.5 10.5 L14.5 14.5"/>
          <circle cx="10.5" cy="10.5" r="0.8" fill="#ffd56b"/>

          <path d="M91.5 17 L91.5 8.5 L83 8.5"/>
          <path d="M89.5 10.5 L85.5 14.5"/>
          <circle cx="89.5" cy="10.5" r="0.8" fill="#ffd56b"/>

          <path d="M8.5 133 L8.5 141.5 L17 141.5"/>
          <path d="M10.5 139.5 L14.5 135.5"/>
          <circle cx="10.5" cy="139.5" r="0.8" fill="#ffd56b"/>

          <path d="M91.5 133 L91.5 141.5 L83 141.5"/>
          <path d="M89.5 139.5 L85.5 135.5"/>
          <circle cx="89.5" cy="139.5" r="0.8" fill="#ffd56b"/>
        </g>

        <!-- Geometria Sagrada de Losangos Interiores -->
        <polygon points="50,11 88.5,75 50,139 11.5,75" fill="none" stroke="url(#cardGold)" stroke-width="0.7" stroke-opacity="0.4"/>
        <polygon points="50,19 80.5,75 50,131 19.5,75" fill="none" stroke="url(#cardRed)" stroke-width="0.6" stroke-opacity="0.5"/>
        <polygon points="50,29 72.5,75 50,121 27.5,75" fill="none" stroke="url(#cardGold)" stroke-width="0.5" stroke-opacity="0.3"/>

        <!-- Halo Radiante de Fundo da Caosfera Central -->
        <circle cx="50" cy="75" r="27" fill="url(#caosCore)"/>

        <!-- Anéis Místicos Consecratórios -->
        <circle cx="50" cy="75" r="23" fill="none" stroke="url(#cardGold)" stroke-width="0.95"/>
        <circle cx="50" cy="75" r="19.5" fill="none" stroke="url(#cardRed)" stroke-width="0.65" stroke-dasharray="1.5, 1.2"/>
        <circle cx="50" cy="75" r="16" fill="none" stroke="url(#cardGold)" stroke-width="0.8"/>
        <circle cx="50" cy="75" r="10" fill="none" stroke="url(#cardGold)" stroke-width="0.6" stroke-opacity="0.5"/>

        <!-- A Caosfera Sagrada de 8 Flechas (Chaos Star em Alta Definição) -->
        <g class="caosfera-sigil-group" transform="translate(50, 75)">
          <!-- 0 deg (Norte) -->
          <line x1="0" y1="-2.5" x2="0" y2="-19.5" stroke="url(#cardGold)" stroke-width="1.2"/>
          <polygon points="0,-24 -3.2,-17.5 3.2,-17.5" fill="url(#cardGold)"/>

          <!-- 180 deg (Sul) -->
          <line x1="0" y1="2.5" x2="0" y2="19.5" stroke="url(#cardGold)" stroke-width="1.2"/>
          <polygon points="0,24 -3.2,17.5 3.2,17.5" fill="url(#cardGold)"/>

          <!-- 90 deg (Leste) -->
          <line x1="2.5" y1="0" x2="19.5" y2="0" stroke="url(#cardGold)" stroke-width="1.2"/>
          <polygon points="24,0 17.5,-3.2 17.5,3.2" fill="url(#cardGold)"/>

          <!-- 270 deg (Oeste) -->
          <line x1="-2.5" y1="0" x2="-19.5" y2="0" stroke="url(#cardGold)" stroke-width="1.2"/>
          <polygon points="-24,0 -17.5,-3.2 -17.5,3.2" fill="url(#cardGold)"/>

          <!-- 45 deg (Nordeste) -->
          <line x1="1.8" y1="-1.8" x2="13.8" y2="-13.8" stroke="url(#cardGold)" stroke-width="1.1"/>
          <polygon points="17,-17 10.5,-15 15,-10.5" fill="url(#cardGold)"/>

          <!-- 135 deg (Sudeste) -->
          <line x1="1.8" y1="1.8" x2="13.8" y2="13.8" stroke="url(#cardGold)" stroke-width="1.1"/>
          <polygon points="17,17 15,10.5 10.5,15" fill="url(#cardGold)"/>

          <!-- 225 deg (Sudoeste) -->
          <line x1="-1.8" y1="1.8" x2="-13.8" y2="13.8" stroke="url(#cardGold)" stroke-width="1.1"/>
          <polygon points="-17,17 -10.5,15 -15,10.5" fill="url(#cardGold)"/>

          <!-- 315 deg (Noroeste) -->
          <line x1="-1.8" y1="-1.8" x2="-13.8" y2="-13.8" stroke="url(#cardGold)" stroke-width="1.1"/>
          <polygon points="-17,-17 -15,-10.5 -10.5,-15" fill="url(#cardGold)"/>

          <!-- Joia Central Rubi do Caos & Ponto Cósmico -->
          <circle cx="0" cy="0" r="4.8" fill="#c40026" stroke="url(#cardGold)" stroke-width="1.1"/>
          <circle cx="0" cy="0" r="2.2" fill="#ffd700"/>
          <circle cx="0" cy="0" r="0.9" fill="#ffffff"/>
        </g>

        <!-- Floretes e Estrelas Cardeais Cósmicas (✦) -->
        <g fill="url(#cardGold)" font-family="serif" font-size="5.5" text-anchor="middle" dominant-baseline="central">
          <text x="50" y="13.5">✦</text>
          <text x="50" y="136.5">✦</text>
          <text x="14" y="75">✦</text>
          <text x="86" y="75">✦</text>
        </g>
      </svg>
    `;
  }

  // =========================================================================
  // FASE INICIAL: Altar Aberto com Todas as 40 Cartas Face-Up Simultaneamente Visíveis
  // =========================================================================
  renderInitialFaceUpGrid() {
    this.initElements();
    if (!this.cardsContainer || !this.servantsOnly.length) return;

    this.selectedCards = [];
    this.cardElements = [];
    this.cardsContainer.innerHTML = '';
    document.querySelectorAll('.card-selection-badge').forEach(b => b.remove());

    this.currentDeck = [...this.servantsOnly]; // Ordem dos 40 Servos
    this.calculateGridGeometry();

    this.state = 'idle';
    this.updateStatus(
      '🃏 Altar de Ciberdivinação • 40 Servidores Revelados',
      'Todas as 40 cartas estão visíveis com a face para cima no Altar. Escolha o método e inicie o ritual.'
    );

    if (this.divinationUI) {
      this.divinationUI.classList.remove('hud-collapsed');
      this.divinationUI.style.opacity = '1';
      this.divinationUI.style.pointerEvents = 'auto';
    }
    if (this.startBtn) {
      this.startBtn.disabled = false;
      this.startBtn.style.opacity = '1';
    }
    if (this.spreadSelect) {
      this.spreadSelect.disabled = false;
    }

    const captionFontSize = Math.max(6.5, Math.floor(this.gridConfig.cardWidth * 0.13));
    const captionHeight = Math.max(12, Math.floor(this.gridConfig.cardHeight * 0.18));
    const sigilFontSize = Math.max(12, Math.floor(this.gridConfig.cardWidth * 0.38));

    // Criar as 40 cartas diretamente no DOM organizadas nos 40 slots do Altar (Face-Up)
    this.currentDeck.forEach((servant, index) => {
      const slot = this.gridConfig.slots[index] || { x: 0, y: 0 };

      const wrapper = document.createElement('div');
      wrapper.className = 'cyber-card-wrapper';
      wrapper.id = `card-wrapper-${index}`;
      wrapper.dataset.index = index;
      wrapper.dataset.slotIndex = index;
      wrapper._servant = servant;
      wrapper.style.width = `${this.gridConfig.cardWidth}px`;
      wrapper.style.height = `${this.gridConfig.cardHeight}px`;
      wrapper.style.left = `${slot.x}px`;
      wrapper.style.top = `${slot.y}px`;

      const card = document.createElement('div');
      card.className = 'cyber-card'; // Face-up por padrão

      const front = document.createElement('div');
      front.className = 'cyber-card-face cyber-card-front';
      front.innerHTML = `
        <img src="${servant.image || servant.card_image}" alt="${servant.name_pt || servant.name}" loading="eager">
        <div class="card-caption" style="font-size: ${captionFontSize}px; height: ${captionHeight}px; line-height: ${captionHeight}px;">
          ${servant.name_pt || servant.name}
        </div>
      `;

      const back = document.createElement('div');
      back.className = 'cyber-card-face cyber-card-back';
      back.innerHTML = this.getPremiumCardBackSVG();

      card.appendChild(front);
      card.appendChild(back);
      wrapper.appendChild(card);
      this.cardsContainer.appendChild(wrapper);

      this.cardElements.push(wrapper);
    });

    if (typeof gsap !== 'undefined') {
      gsap.fromTo(
        this.cardElements,
        { opacity: 0, scale: 0.88, rotationY: 0 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.35,
          stagger: 0.012,
          ease: 'power2.out'
        }
      );
    }
  }

  resetDeckToFaceUp() {
    this.selectedCards = [];
    document.querySelectorAll('.card-selection-badge').forEach(b => b.remove());

    if (this.divinationUI) {
      this.divinationUI.classList.remove('hud-collapsed');
      this.divinationUI.style.opacity = '1';
      this.divinationUI.style.pointerEvents = 'auto';
    }
    if (this.startBtn) {
      this.startBtn.disabled = false;
      this.startBtn.style.opacity = '1';
    }
    if (this.spreadSelect) {
      this.spreadSelect.disabled = false;
    }

    this.cardElements.forEach((wrapper) => {
      if (typeof gsap !== 'undefined') {
        gsap.killTweensOf(wrapper);
        gsap.set(wrapper, { clearProps: 'transform,scale,boxShadow,opacity' });
      }
      wrapper.classList.remove('shuffled-face-down');
      wrapper.dataset.selected = '';
      wrapper.style.cursor = 'default';
      wrapper.style.opacity = '1';
      wrapper.style.boxShadow = 'none';
      wrapper.style.transform = 'none';
      wrapper.onclick = null;
      wrapper.onmouseenter = null;
      wrapper.onmouseleave = null;

      const card = wrapper.querySelector('.cyber-card');
      if (card) {
        if (typeof gsap !== 'undefined') {
          gsap.killTweensOf(card);
          gsap.set(card, { clearProps: 'transform,rotateY' });
        }
        card.classList.remove('flipped');
        if (typeof gsap !== 'undefined') {
          gsap.set(card, { rotateY: 0 });
        } else {
          card.style.transform = 'rotateY(0deg)';
        }
      }
    });

    this.state = 'idle';
    this.updateStatus(
      '🃏 Altar de Ciberdivinação • 40 Servidores Revelados',
      'Todas as 40 cartas estão visíveis com a face para cima no Altar. Escolha o método e inicie o ritual.'
    );
  }

  // =========================================================================
  // RITUAL DE DIVINAÇÃO: Disparado ao Clicar em "✨ Iniciar Ritual"
  // =========================================================================
  async startRitual() {
    if (this.state === 'flipping_down' || this.state === 'shuffling' || this.state === 'reading') return;

    if (!this.servantsOnly.length) {
      await this.loadServersData();
    }

    if (this.cardElements.length === 0) {
      this.renderInitialFaceUpGrid();
    }

    // Limpar estados anteriores
    this.selectedCards = [];
    document.querySelectorAll('.card-selection-badge').forEach(b => b.remove());
    if (this.readingCardsContainer) this.readingCardsContainer.innerHTML = '';

    // Recolher controles do HUD para dar 100% de visão ao Altar das 40 cartas
    if (this.divinationUI) {
      this.divinationUI.classList.add('hud-collapsed');
    }
    if (this.startBtn) {
      this.startBtn.disabled = true;
    }
    if (this.spreadSelect) {
      this.spreadSelect.disabled = true;
    }

    // Resetar estilos e garantir cartas face-up antes do flip dominó
    this.cardElements.forEach(wrapper => {
      wrapper.dataset.selected = '';
      wrapper.style.cursor = 'default';
      wrapper.onclick = null;
      wrapper.onmouseenter = null;
      wrapper.onmouseleave = null;
      if (typeof gsap !== 'undefined') {
        gsap.to(wrapper, { scale: 1, opacity: 1, boxShadow: 'none', duration: 0.2 });
      } else {
        wrapper.style.transform = 'none';
        wrapper.style.opacity = '1';
        wrapper.style.boxShadow = 'none';
      }

      const card = wrapper.querySelector('.cyber-card');
      if (card) {
        card.classList.remove('flipped');
        if (typeof gsap !== 'undefined') {
          gsap.set(card, { rotateY: 0 });
        } else {
          card.style.transform = 'rotateY(0deg)';
        }
      }
    });

    // Iniciar FASE 1: Virada Sequencial Dominó Carta a Carta
    this.executePhase1_DominoFlipDown();
  }

  // =========================================================================
  // FASE 1: Virar sequencialmente cada uma das 40 cartas para baixo (Dominó Flip)
  // =========================================================================
  executePhase1_DominoFlipDown() {
    this.state = 'flipping_down';
    this.updateStatus(
      '🌀 FASE 1: Ocultação em Dominó Carta a Carta',
      'Virando sequencialmente todas as 40 cartas para baixo em cascata mística...'
    );

    if (typeof gsap !== 'undefined') {
      const tl = gsap.timeline({
        onComplete: () => {
          setTimeout(() => {
            this.executePhase2_DynamicShuffle();
          }, 260);
        }
      });

      this.cardElements.forEach((wrapper, i) => {
        const card = wrapper.querySelector('.cyber-card');
        tl.to(
          card,
          {
            rotateY: 180,
            duration: 0.26,
            ease: 'power2.inOut',
            onStart: () => {
              wrapper.style.zIndex = 15;
            },
            onUpdate: function() {
              if (this.progress() >= 0.5 && !card.classList.contains('flipped')) {
                card.classList.add('flipped');
              }
            },
            onComplete: () => {
              card.classList.add('flipped');
              wrapper.style.zIndex = 1;
            }
          },
          i * 0.026 // Dominó visual ágil através de todas as 40 cartas
        );
      });
    } else {
      this.cardElements.forEach((wrapper, i) => {
        setTimeout(() => {
          const card = wrapper.querySelector('.cyber-card');
          if (card) {
            card.classList.add('flipped');
            card.style.transform = 'rotateY(180deg)';
          }
        }, i * 26);
      });
      setTimeout(() => {
        this.executePhase2_DynamicShuffle();
      }, this.cardElements.length * 26 + 300);
    }
  }

  // =========================================================================
  // FASE 2: Embaralhamento Visual Dinâmico Carta a Carta (Swap Visível nos 40 Slots)
  // =========================================================================
  async executePhase2_DynamicShuffle() {
    this.state = 'shuffling';
    this.updateStatus(
      '🔄 FASE 2: Embaralhamento Dinâmico (40 Cartas Visíveis)',
      'Permutando as posições no altar sagrado... Todas as cartas permanecem visíveis na tela.'
    );

    const totalSwaps = 22; // Permutações dinâmicas visualmente perceptíveis
    const cards = [...this.cardElements];

    for (let s = 0; s < totalSwaps; s++) {
      const idxA = Math.floor(Math.random() * cards.length);
      let idxB = Math.floor(Math.random() * cards.length);
      while (idxB === idxA) {
        idxB = Math.floor(Math.random() * cards.length);
      }

      const cardA = cards[idxA];
      const cardB = cards[idxB];

      const slotAIdx = parseInt(cardA.dataset.slotIndex);
      const slotBIdx = parseInt(cardB.dataset.slotIndex);

      const slotA = this.gridConfig.slots[slotAIdx];
      const slotB = this.gridConfig.slots[slotBIdx];

      cardA.style.zIndex = 30;
      cardB.style.zIndex = 30;

      if (typeof gsap !== 'undefined') {
        const swapPromise = Promise.all([
          gsap.to(cardA, {
            left: slotB.x,
            top: slotB.y,
            scale: 1.12,
            duration: 0.16,
            ease: 'power2.inOut',
            onComplete: () => {
              cardA.style.zIndex = 2;
              gsap.to(cardA, { scale: 1.0, duration: 0.05 });
            }
          }),
          gsap.to(cardB, {
            left: slotA.x,
            top: slotA.y,
            scale: 1.12,
            duration: 0.16,
            ease: 'power2.inOut',
            onComplete: () => {
              cardB.style.zIndex = 2;
              gsap.to(cardB, { scale: 1.0, duration: 0.05 });
            }
          })
        ]);

        cardA.dataset.slotIndex = slotBIdx;
        cardB.dataset.slotIndex = slotAIdx;

        await swapPromise;
      } else {
        cardA.style.left = `${slotB.x}px`;
        cardA.style.top = `${slotB.y}px`;
        cardB.style.left = `${slotA.x}px`;
        cardB.style.top = `${slotA.y}px`;
        cardA.dataset.slotIndex = slotBIdx;
        cardB.dataset.slotIndex = slotAIdx;
        await new Promise(r => setTimeout(r, 60));
      }
    }

    // Leve pulso ondulatório coletivo confirmando o término da consagração
    if (typeof gsap !== 'undefined') {
      gsap.to('.cyber-card-wrapper', {
        scale: 1.06,
        duration: 0.14,
        yoyo: true,
        repeat: 1,
        stagger: 0.01,
        ease: 'power1.inOut',
        onComplete: () => {
          this.executePhase3_InteractiveSelection();
        }
      });
    } else {
      this.executePhase3_InteractiveSelection();
    }
  }

  // =========================================================================
  // FASE 3: Seleção Interativa Direta nos 40 Slots Visíveis
  // =========================================================================
  executePhase3_InteractiveSelection() {
    this.state = 'reading';
    this.updateStatus(
      `✨ FASE 3: Toque no Altar para Escolher (${this.selectedCards.length}/${this.spreadSize})`,
      `O Altar está consagrado. Toque diretamente em qualquer uma das cartas visíveis para selecionar.`
    );

    this.cardElements.forEach(wrapper => {
      wrapper.classList.add('shuffled-face-down');
      wrapper.style.cursor = 'pointer';

      wrapper.onmouseenter = () => {
        if (this.state === 'reading' && !wrapper.dataset.selected && typeof gsap !== 'undefined') {
          gsap.to(wrapper, {
            scale: 1.18,
            zIndex: 40,
            duration: 0.16,
            boxShadow: '0 0 20px rgba(255, 85, 0, 0.9)',
            ease: 'power2.out'
          });
        }
      };

      wrapper.onmouseleave = () => {
        if (this.state === 'reading' && !wrapper.dataset.selected && typeof gsap !== 'undefined') {
          gsap.to(wrapper, {
            scale: 1.0,
            zIndex: 2,
            duration: 0.16,
            boxShadow: 'none',
            ease: 'power2.out'
          });
        }
      };

      wrapper.onclick = () => {
        this.handleCardSelection(wrapper);
      };
    });
  }

  handleCardSelection(wrapper) {
    if (this.state !== 'reading' || wrapper.dataset.selected === 'true') return;
    if (this.selectedCards.length >= this.spreadSize) return;

    wrapper.dataset.selected = 'true';
    wrapper.classList.remove('shuffled-face-down');
    const servant = wrapper._servant;
    this.selectedCards.push(servant);

    const selectionOrder = this.selectedCards.length;

    // Badge ordinal no topo da carta selecionada (Carta 1, Carta 2, etc.)
    const badge = document.createElement('div');
    badge.className = 'card-selection-badge';
    badge.innerText = `Carta ${selectionOrder}`;
    wrapper.appendChild(badge);

    const card = wrapper.querySelector('.cyber-card');

    // Revelação imediata Face-Up da carta selecionada
    if (card) {
      card.classList.remove('flipped');
      if (typeof gsap !== 'undefined') {
        gsap.to(card, { rotateY: 0, duration: 0.45, ease: 'back.out(1.5)' });
      } else {
        card.style.transform = 'rotateY(0deg)';
      }
    }

    if (typeof gsap !== 'undefined') {
      gsap.to(wrapper, {
        scale: 1.25,
        zIndex: 55,
        duration: 0.35,
        boxShadow: '0 0 30px rgba(255, 204, 0, 0.95)',
        ease: 'back.out(1.7)'
      });
    }

    if (navigator.vibrate) {
      navigator.vibrate([25, 45, 25]);
    }

    if (this.selectedCards.length === this.spreadSize) {
      this.state = 'transitioning_to_reading';
      this.updateStatus('🔮 Todas as Cartas Reveladas', 'Interpretando as frequências dos Servidores selecionados...');

      // Desativar classes de pulso e interação de todas as cartas imediatamente para poupar GPU
      this.cardElements.forEach(w => {
        w.classList.remove('shuffled-face-down');
        w.style.cursor = 'default';
        w.onclick = null;
        w.onmouseenter = null;
        w.onmouseleave = null;
        if (!w.dataset.selected && typeof gsap !== 'undefined') {
          gsap.to(w, { opacity: 0.45, duration: 0.4 });
        }
      });

      setTimeout(() => {
        this.executePhase4_ReadingPresentation();
      }, 900);
    } else {
      this.updateStatus(
        `✨ FASE 3: Toque no Altar para Escolher (${this.selectedCards.length}/${this.spreadSize})`,
        `Selecionada ${this.selectedCards.length} de ${this.spreadSize}. Toque na próxima carta no Altar...`
      );
    }
  }

  // =========================================================================
  // FASE 4: Painel Oracular Glassmorphic & Revelação Completa
  // =========================================================================
  executePhase4_ReadingPresentation() {
    this.state = 'reading_done';
    if (!this.readingCardsContainer) return;

    this.readingCardsContainer.innerHTML = '';

    const positionTitles = {
      1: ['🔮 A Resposta Direta & Conselho da Vontade'],
      3: ['1. O Passado / Origem Oculta', '2. O Presente / O Desafio Ativo', '3. O Futuro / A Vontade Manifesta'],
      5: [
        '1. A Situação Presente',
        '2. O Obstáculo ou Sombra',
        '3. A Influência Subconsciente',
        '4. O Conselho Mágico Prático',
        '5. O Resultado da Manifestação'
      ]
    };

    const titles = positionTitles[this.spreadSize] || positionTitles[1];

    this.selectedCards.forEach((servant, i) => {
      const posTitle = titles[i] || `Posição ${i + 1}`;
      const cardResult = document.createElement('div');
      cardResult.className = 'glass-panel';
      cardResult.style.display = 'flex';
      cardResult.style.flexDirection = 'column';
      cardResult.style.gap = '0.9rem';
      cardResult.style.padding = '1.25rem';

      cardResult.innerHTML = `
        <div style="font-family: var(--font-display); font-weight: 800; color: var(--accent-orange); text-transform: uppercase; letter-spacing: 1.2px; font-size: 0.85rem;">
          ${posTitle}
        </div>

        <div style="display: flex; gap: 1rem; align-items: center;">
          <img src="${servant.image || servant.card_image}" alt="${servant.name_pt || servant.name}" style="width: 80px; height: 115px; object-fit: cover; border-radius: var(--radius-sm); border: 1px solid var(--accent-red); flex-shrink: 0;">
          <div>
            <h3 style="font-family: var(--font-heading); font-size: 1.25rem; color: #fff; margin-bottom: 0.2rem;">${servant.name_pt || servant.name}</h3>
            <span style="font-size: 0.82rem; color: var(--accent-yellow); font-weight: 600;">${servant.name || servant.name_en}</span>
          </div>
        </div>

        <div style="background: rgba(255, 0, 51, 0.05); padding: 0.85rem; border-left: 3px solid var(--accent-red); border-radius: 0 8px 8px 0;">
          <div style="font-size: 0.75rem; font-weight: 800; color: var(--accent-red); text-transform: uppercase; margin-bottom: 0.3rem; letter-spacing: 1px;">
            🔮 Significado Divinatório
          </div>
          <div style="font-size: 0.88rem; color: var(--text-secondary); line-height: 1.6; white-space: pre-line;">
            ${servant.divination_meaning || servant.divination}
          </div>
        </div>

        ${servant.magick ? `
        <div style="background: rgba(255, 85, 0, 0.05); padding: 0.85rem; border-left: 3px solid var(--accent-orange); border-radius: 0 8px 8px 0;">
          <div style="font-size: 0.75rem; font-weight: 800; color: var(--accent-orange); text-transform: uppercase; margin-bottom: 0.3rem; letter-spacing: 1px;">
            ⚡ Orientação Mágica Integrada
          </div>
          <div style="font-size: 0.88rem; color: var(--text-secondary); line-height: 1.6; white-space: pre-line;">
            ${servant.magick}
          </div>
        </div>
        ` : ''}

        <div style="display: flex; gap: 0.6rem; margin-top: 0.35rem; flex-wrap: wrap;">
          <button class="btn-card-action btn-card-grimoire" style="flex: 1; min-width: 135px; padding: 0.5rem 0.8rem; font-size: 0.78rem; background: rgba(255, 0, 51, 0.15); border: 1px solid var(--accent-red); border-radius: var(--radius-sm); color: #fff; display: flex; align-items: center; justify-content: center; gap: 0.4rem; font-weight: 600;">
            <span>🔮</span>
            <span>Ver no Grimório</span>
          </button>
          <button class="btn-card-action btn-card-charger" style="flex: 1; min-width: 135px; padding: 0.5rem 0.8rem; font-size: 0.78rem; background: rgba(255, 85, 0, 0.15); border: 1px solid var(--accent-orange); border-radius: var(--radius-sm); color: #fff; display: flex; align-items: center; justify-content: center; gap: 0.4rem; font-weight: 600;">
            <span>⚡</span>
            <span>Carregar Sigilo</span>
          </button>
        </div>
      `;

      const grimoireBtn = cardResult.querySelector('.btn-card-grimoire');
      if (grimoireBtn) {
        grimoireBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.viewInGrimoire(servant);
        });
      }

      const chargerBtn = cardResult.querySelector('.btn-card-charger');
      if (chargerBtn) {
        chargerBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.chargeSigil(servant);
        });
      }

      this.readingCardsContainer.appendChild(cardResult);
    });

    if (this.readingModal) {
      window.dispatchEvent(new CustomEvent('modalopen', { detail: { modal: 'reading' } }));
      this.readingModal.classList.add('active');
      const container = this.readingModal.querySelector('.modal-container');
      if (container && typeof gsap !== 'undefined') {
        gsap.fromTo(container, 
          { opacity: 0, scale: 0.94, y: 15 }, 
          { opacity: 1, scale: 1, y: 0, duration: 0.3, ease: 'power2.out', clearProps: 'transform' }
        );
      }
    }

    this.state = 'reading_done';
    this.updateStatus('✨ Leitura Oracular Concluída', 'As revelações dos 40 Servidores e a direção da sua Vontade foram manifestadas.');
  }

  // Fechamento infalível e seguro do Modal de Leitura
  closeReadingModal() {
    if (!this.readingModal) return;

    const finalize = () => {
      this.readingModal.classList.remove('active');
      this.readingModal.style.cssText = '';
      const container = this.readingModal.querySelector('.modal-container');
      if (container && typeof gsap !== 'undefined') {
        gsap.set(container, { clearProps: 'all' });
      }
      window.dispatchEvent(new CustomEvent('modalclose', { detail: { modal: 'reading' } }));
      this.resetDeckToFaceUp();
    };

    const container = this.readingModal.querySelector('.modal-container');
    if (container && typeof gsap !== 'undefined' && this.readingModal.classList.contains('active')) {
      gsap.to(container, {
        opacity: 0,
        scale: 0.94,
        y: 10,
        duration: 0.2,
        ease: 'power2.in',
        onComplete: finalize
      });
    } else {
      finalize();
    }
  }

  // Navegar diretamente para o Grimório e abrir a carta selecionada
  viewInGrimoire(servant) {
    this.closeReadingModal();
    if (window.appRouter) {
      window.appRouter.navigateTo('servers');
    }
    setTimeout(() => {
      if (window.serversManager) {
        window.serversManager.openModal(servant);
      }
    }, 150);
  }

  // Carregar o sigilo do servo diretamente no Carregador
  chargeSigil(servant) {
    this.closeReadingModal();
    if (window.sigilChargerEngine) {
      window.sigilChargerEngine.addServerSigil(servant);
    }
    if (window.appRouter) {
      window.appRouter.navigateTo('charger');
    }
  }

  updateStatus(title, subtitle) {
    if (this.statusTitle) this.statusTitle.innerText = title;
    if (this.statusSubtitle) this.statusSubtitle.innerText = subtitle;
  }
}
