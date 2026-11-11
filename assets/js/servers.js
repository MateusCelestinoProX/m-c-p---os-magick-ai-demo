/* ==========================================================================
   MAGICK A.I - SERVERS CATALOG MANAGER (OPÇÃO 1 - UPDATE 2)
   ========================================================================== */

class ServersManager {
  constructor() {
    this.serversData = [];
    this.filteredServers = [];
    this.currentFilter = 'all';
    this.searchQuery = '';

    this.gridContainer = document.getElementById('servers-grid');
    this.searchInput = document.getElementById('search-servers');
    this.filterButtons = document.querySelectorAll('.filter-btn');
    this.modalBackdrop = document.getElementById('server-modal');
    this.modalCloseBtn = document.getElementById('modal-close-btn');

    this.init();
  }

  async init() {
    await this.loadData();
    this.bindEvents();
    this.render();
  }

  async loadData() {
    try {
      const response = await fetch('assets/data/servers.json');
      const data = await response.json();
      this.serversData = data.servers || [];
      this.filteredServers = [...this.serversData];
    } catch (error) {
      console.error('Erro ao carregar base de dados dos servidores:', error);
    }
  }

  bindEvents() {
    if (this.searchInput) {
      this.searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        this.filterData();
      });
    }

    this.filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        this.filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentFilter = btn.dataset.filter;
        this.filterData();
      });
    });

    if (this.modalCloseBtn) {
      this.modalCloseBtn.addEventListener('click', () => this.closeModal());
    }

    if (this.modalBackdrop) {
      this.modalBackdrop.addEventListener('click', (e) => {
        if (e.target === this.modalBackdrop) this.closeModal();
      });
    }
  }

  filterData() {
    this.filteredServers = this.serversData.filter(item => {
      const matchesSearch = 
        item.name_pt.toLowerCase().includes(this.searchQuery) ||
        item.name_en.toLowerCase().includes(this.searchQuery) ||
        item.summary.toLowerCase().includes(this.searchQuery);

      const matchesFilter = 
        this.currentFilter === 'all' ||
        (this.currentFilter === 'servants' && item.category === 'servant') ||
        (this.currentFilter === 'devils' && item.category === 'devil');

      return matchesSearch && matchesFilter;
    });

    this.render();
  }

  render() {
    if (!this.gridContainer) return;
    this.gridContainer.innerHTML = '';

    if (this.filteredServers.length === 0) {
      this.gridContainer.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--text-muted);">
          Nenhum servo ou diabo encontrado com os termos de busca informados.
        </div>
      `;
      return;
    }

    this.filteredServers.forEach(server => {
      const card = document.createElement('div');
      card.className = 'server-card';
      card.innerHTML = `
        <div class="card-img-wrap">
          <img src="${server.card_image}" alt="${server.name_pt}" loading="lazy">
          <span class="card-badge ${server.category}">${server.category === 'devil' ? 'DIABO' : 'SERVO'}</span>
        </div>
        <div class="server-card-info">
          <span class="server-number">#${String(server.number).padStart(2, '0')}</span>
          <h3 class="server-name-pt">${server.name_pt}</h3>
          <span class="server-name-en">${server.name_en}</span>
        </div>
      `;

      card.addEventListener('click', () => this.openModal(server));
      this.gridContainer.appendChild(card);
    });
  }

  openModal(server) {
    if (!this.modalBackdrop) return;

    // Usar sigilo PNG transparente
    const sigilPng = (server.sigil_image || '').replace('.jpg', '.png');

    document.getElementById('modal-card-img').src = server.card_image;
    document.getElementById('modal-sigil-img').src = sigilPng;
    document.getElementById('modal-title-pt').innerText = server.name_pt;
    document.getElementById('modal-title-en').innerText = `${server.name_en} (#${String(server.number).padStart(2, '0')})`;
    document.getElementById('modal-summary').innerText = server.summary;
    document.getElementById('modal-divination').innerText = server.divination || 'Sem descrição divinatória disponível.';
    document.getElementById('modal-magick').innerText = server.magick || 'Sem instrução mágica disponível.';

    const addChargerBtn = document.getElementById('modal-add-charger-btn');
    if (addChargerBtn) {
      addChargerBtn.onclick = () => {
        this.closeModal();
        if (window.sigilChargerEngine) {
          window.sigilChargerEngine.addServerSigil(server);
        }
        if (window.appRouter) {
          window.appRouter.navigateTo('charger');
        }
      };
    }

    this.modalBackdrop.classList.add('active');
    window.dispatchEvent(new CustomEvent('modalopen', { detail: { modal: 'server' } }));
  }

  closeModal() {
    if (this.modalBackdrop) {
      this.modalBackdrop.classList.remove('active');
      this.modalBackdrop.style.cssText = '';
      window.dispatchEvent(new CustomEvent('modalclose', { detail: { modal: 'server' } }));
    }
  }
}
