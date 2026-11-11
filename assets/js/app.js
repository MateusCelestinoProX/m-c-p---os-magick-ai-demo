/* ==========================================================================
   MAGICK A.I - MAIN SPA APPLICATION ROUTER & CONTROLLER
   ========================================================================== */

class AppRouter {
  constructor() {
    this.currentView = 'home';
    this.navButtons = document.querySelectorAll('.nav-btn');
    this.viewSections = document.querySelectorAll('.view-section');
    this.brandLogo = document.querySelector('.brand-logo');
    this.chaosphereEngine = null;

    this.init();
  }

  init() {
    // Inicializar motor gráfico de fundo (Chaosphere Canvas)
    this.chaosphereEngine = new ChaosphereEngine('chaosphere-canvas');

    // Inicializar os motores dos módulos
    window.serversManager = new ServersManager();
    window.sigilChargerEngine = new SigilChargerEngine();
    window.cyberDivinationEngine = new CyberDivinationEngine();

    this.bindNavigation();
    this.bindHomeActionCards();
    this.bindHardwareBackButton();
  }

  bindHardwareBackButton() {
    // Interceptação nativa do botão "Voltar" do Android (Capacitor)
    const handleBack = () => {
      // 1. Fechar modal de leitura divinatória se estiver aberto
      const readingModal = document.getElementById('reading-result');
      if (readingModal && readingModal.classList.contains('active')) {
        if (window.cyberDivinationEngine) {
          window.cyberDivinationEngine.closeReadingModal();
        } else {
          readingModal.classList.remove('active');
        }
        return true;
      }

      // 2. Fechar modal de detalhes do servidor se estiver aberto
      const serverModal = document.getElementById('server-modal');
      if (serverModal && serverModal.classList.contains('active')) {
        if (window.serversManager) {
          window.serversManager.closeModal();
        } else {
          serverModal.classList.remove('active');
        }
        return true;
      }

      // 3. Fechar widget de backgrounds se estiver aberto
      const bgWidgetModal = document.getElementById('bg-widget-modal');
      if (bgWidgetModal && bgWidgetModal.classList.contains('active')) {
        bgWidgetModal.classList.remove('active');
        return true;
      }

      // 4. Se estiver em uma tela interna, retornar para Home
      if (this.currentView !== 'home') {
        this.navigateTo('home');
        return true;
      }

      return false; // Permite saída natural do app se já estiver na Home
    };

    // Ouvinte Capacitor Nativo para Android
    if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App) {
      window.Capacitor.Plugins.App.addListener('backButton', () => {
        const handled = handleBack();
        if (!handled && window.Capacitor.Plugins.App.exitApp) {
          window.Capacitor.Plugins.App.exitApp();
        }
      });
    }

    // Suporte a tecla Escape em teclados físicos ou emuladores
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        handleBack();
      }
    });
  }

  bindNavigation() {
    this.navButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const viewTarget = btn.dataset.view;
        if (viewTarget) {
          this.navigateTo(viewTarget);
        }
      });
    });

    if (this.brandLogo) {
      this.brandLogo.addEventListener('click', (e) => {
        e.preventDefault();
        this.navigateTo('home');
      });
    }
  }

  bindHomeActionCards() {
    const featureCards = document.querySelectorAll('.feature-card[data-navigate]');
    featureCards.forEach(card => {
      card.addEventListener('click', () => {
        const target = card.dataset.navigate;
        if (target) this.navigateTo(target);
      });
    });
  }

  navigateTo(viewId) {
    // Fechar modais ao transitar de rota
    const readingModal = document.getElementById('reading-result');
    if (readingModal && readingModal.classList.contains('active')) {
      if (window.cyberDivinationEngine) {
        window.cyberDivinationEngine.closeReadingModal();
      } else {
        readingModal.classList.remove('active');
      }
    }
    const serverModal = document.getElementById('server-modal');
    if (serverModal && serverModal.classList.contains('active')) {
      if (window.serversManager) {
        window.serversManager.closeModal();
      } else {
        serverModal.classList.remove('active');
      }
    }

    this.currentView = viewId;

    // Atualizar botões de navegação
    this.navButtons.forEach(btn => {
      if (btn.dataset.view === viewId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Alternar seções de visualização
    this.viewSections.forEach(section => {
      if (section.id === `view-${viewId}`) {
        section.classList.add('active');
      } else {
        section.classList.remove('active');
      }
    });

    if (viewId === 'divination') {
      document.body.classList.add('view-divination-active');
    } else {
      document.body.classList.remove('view-divination-active');
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Notificar componentes e engines para pausar/retomar animações e poupar CPU/GPU
    window.dispatchEvent(new CustomEvent('viewchange', { detail: { view: viewId } }));
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.appRouter = new AppRouter();
});
