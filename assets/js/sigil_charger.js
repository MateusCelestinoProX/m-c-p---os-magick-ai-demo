/* ==========================================================================
   MAGICK A.I - SIGIL CHARGING ENGINE
   (Suporte a 6 React Bits WebGL Canvas Shaders & 9 Vídeos Hipnóticos do YouTube)
   ========================================================================== */

class SigilChargerEngine {
  constructor() {
    this.selectedSigils = []; // Max 3 items
    this.hypnoticEngine = null;
    this.isCharging = false;

    // Combinação dos 4 vídeos originais + 5 vídeos novos (Total: 9 vídeos do YouTube)
    this.ytVideos = {
      yt_1: '4m58zTmoqkw',
      yt_2: 'wx1zn2BzJXA',
      yt_3: '4ZiTrVxEQ-U',
      yt_4: 'MagELQywiGI',
      yt_5: 'M5vi8vNKq0E',
      yt_6: 'wjQq0nSGS28',
      yt_7: 'hOgVAYpHPCc',
      yt_8: 'uP2W7trXBPQ',
      yt_9: 'XrDUTpeGW0A'
    };

    // Paleta Canônica das 12 Cores de Gnose e Magia
    this.colorPalette = [
      { name: 'Branco Puro', hex: '#ffffff', glow: 'rgba(255, 255, 255, 0.75)', dark: false },
      { name: 'Vermelho Sangue', hex: '#ff0033', glow: 'rgba(255, 0, 51, 0.8)', dark: true },
      { name: 'Laranja Hermético', hex: '#ff6600', glow: 'rgba(255, 102, 0, 0.8)', dark: true },
      { name: 'Amarelo Ouro Solar', hex: '#ffd700', glow: 'rgba(255, 215, 0, 0.8)', dark: false },
      { name: 'Verde Esmeralda', hex: '#00ff66', glow: 'rgba(0, 255, 102, 0.8)', dark: false },
      { name: 'Ciano Astral', hex: '#00f0ff', glow: 'rgba(0, 240, 255, 0.8)', dark: false },
      { name: 'Azul Elétrico', hex: '#0066ff', glow: 'rgba(0, 102, 255, 0.8)', dark: true },
      { name: 'Roxo Caótico', hex: '#a855f7', glow: 'rgba(168, 85, 247, 0.8)', dark: true },
      { name: 'Magenta Octarina', hex: '#ff0099', glow: 'rgba(255, 0, 153, 0.8)', dark: true },
      { name: 'Rosa Radiante', hex: '#ff66b2', glow: 'rgba(255, 102, 178, 0.8)', dark: false },
      { name: 'Violeta Cósmico', hex: '#6366f1', glow: 'rgba(99, 102, 241, 0.8)', dark: true },
      { name: 'Prata Lunar', hex: '#c0c0c0', glow: 'rgba(192, 192, 192, 0.8)', dark: false }
    ];

    this.selectedColor = localStorage.getItem('magick_sigil_color') || '#ffffff';

    this.initElements();
    this.bindEvents();
  }

  initElements() {
    this.dropzone = document.getElementById('charger-dropzone');
    this.fileInput = document.getElementById('sigil-file-input');
    this.serverSelect = document.getElementById('charger-server-select');
    this.addServerBtn = document.getElementById('charger-add-server-btn');
    this.previewContainer = document.getElementById('selected-sigils-preview');
    this.stageOverlay = document.getElementById('sigils-overlay-layer');
    this.patternSelect = document.getElementById('hypnotic-pattern-select');
    this.toggleChargeBtn = document.getElementById('toggle-charge-btn');
    this.fullscreenBtn = document.getElementById('toggle-fullscreen-btn');
    this.stageContainer = document.getElementById('charging-stage-container');
    this.ytIframe = document.getElementById('hypnotic-yt-iframe');
    this.stageCanvas = document.getElementById('hypnotic-stage-canvas');

    this.colorPaletteContainer = document.getElementById('sigil-color-palette');
    this.colorNameDisplay = document.getElementById('active-sigil-color-name');

    this.initColorPalette();
    this.hypnoticEngine = new HypnoticStageEngine('hypnotic-stage-canvas');
    this.loadServerSelectOptions();
  }

  initColorPalette() {
    if (!this.colorPaletteContainer) return;
    this.colorPaletteContainer.innerHTML = '';

    this.colorPalette.forEach(c => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `sigil-color-btn ${this.selectedColor.toLowerCase() === c.hex.toLowerCase() ? 'active' : ''}`;
      btn.style.backgroundColor = c.hex;
      btn.style.setProperty('--btn-glow', c.glow);
      btn.title = c.name;
      if (c.dark) btn.dataset.dark = 'true';

      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.setColor(c.hex);
      });

      this.colorPaletteContainer.appendChild(btn);
    });

    this.updateColorNameDisplay();
  }

  setColor(hex) {
    this.selectedColor = hex;
    localStorage.setItem('magick_sigil_color', hex);

    if (this.colorPaletteContainer) {
      const buttons = this.colorPaletteContainer.querySelectorAll('.sigil-color-btn');
      buttons.forEach((btn, idx) => {
        const c = this.colorPalette[idx];
        if (c && c.hex.toLowerCase() === hex.toLowerCase()) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
    }

    this.updateColorNameDisplay();
    this.updateActiveSigilsColor();
  }

  updateColorNameDisplay() {
    if (!this.colorNameDisplay) return;
    const currentColor = this.colorPalette.find(c => c.hex.toLowerCase() === this.selectedColor.toLowerCase()) || this.colorPalette[0];
    this.colorNameDisplay.textContent = currentColor.name;
    this.colorNameDisplay.style.color = currentColor.hex;
  }

  updateActiveSigilsColor() {
    const currentColor = this.colorPalette.find(c => c.hex.toLowerCase() === this.selectedColor.toLowerCase()) || this.colorPalette[0];
    
    // Atualiza sigilos ativos no Altar
    if (this.stageOverlay) {
      const activeSigils = this.stageOverlay.querySelectorAll('.active-sigil-display');
      activeSigils.forEach(el => {
        if (el.tagName === 'IMG') {
          el.style.filter = `drop-shadow(0 0 16px ${currentColor.glow}) drop-shadow(0 0 32px ${currentColor.glow})`;
        } else {
          el.style.backgroundColor = currentColor.hex;
          el.style.filter = `drop-shadow(0 0 16px ${currentColor.glow}) drop-shadow(0 0 32px ${currentColor.glow})`;
        }
      });
    }

    // Atualiza miniaturas
    if (this.previewContainer) {
      const thumbIcons = this.previewContainer.querySelectorAll('.sigil-thumb-icon');
      thumbIcons.forEach(icon => {
        icon.style.backgroundColor = currentColor.hex;
        icon.style.filter = `drop-shadow(0 0 6px ${currentColor.glow})`;
      });

      const thumbImgs = this.previewContainer.querySelectorAll('.sigil-thumb-img');
      thumbImgs.forEach(img => {
        img.style.filter = `drop-shadow(0 0 4px ${currentColor.glow})`;
      });
    }
  }

  async loadServerSelectOptions() {
    if (!this.serverSelect) return;
    try {
      const response = await fetch('assets/data/servers.json');
      const data = await response.json();
      const servers = data.servers || [];

      this.serverSelect.innerHTML = '<option value="">-- Selecione um Sigilo da Lista --</option>';
      servers.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s.id;
        opt.textContent = `${s.name_pt} (${s.name_en})`;
        opt.dataset.sigilUrl = (s.sigil_image || s.image || '').replace('.jpg', '.png');
        opt.dataset.name = s.name_pt;
        this.serverSelect.appendChild(opt);
      });
    } catch (e) {
      console.error('Erro ao carregar opções no select do carregador:', e);
    }
  }

  bindEvents() {
    if (this.dropzone && this.fileInput) {
      this.dropzone.addEventListener('click', () => this.fileInput.click());
      this.fileInput.addEventListener('change', (e) => this.handleFileUpload(e.target.files));

      this.dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        this.dropzone.style.borderColor = 'var(--accent-red)';
      });

      this.dropzone.addEventListener('dragleave', () => {
        this.dropzone.style.borderColor = 'var(--border-glass-bright)';
      });

      this.dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        this.dropzone.style.borderColor = 'var(--border-glass-bright)';
        if (e.dataTransfer.files.length) {
          this.handleFileUpload(e.dataTransfer.files);
        }
      });
    }

    if (this.addServerBtn && this.serverSelect) {
      this.addServerBtn.addEventListener('click', () => {
        const selectedOpt = this.serverSelect.options[this.serverSelect.selectedIndex];
        if (!selectedOpt || !selectedOpt.value) return;

        const sigilData = {
          id: selectedOpt.value,
          name: selectedOpt.dataset.name,
          url: selectedOpt.dataset.sigilUrl,
          isUserUpload: false
        };

        this.addSigil(sigilData);
      });
    }

    if (this.toggleChargeBtn) {
      this.toggleChargeBtn.addEventListener('click', () => this.toggleCharging());
    }

    if (this.fullscreenBtn && this.stageContainer) {
      this.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
    }

    if (this.patternSelect) {
      this.patternSelect.addEventListener('change', (e) => {
        if (this.isCharging) {
          this.applyPattern(e.target.value);
        }
      });
    }
  }

  async processImageToSigilMask(file) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onerror = () => resolve({ originalUrl: '', cleanUrl: '', hasNativeAlpha: false });
      reader.onload = (e) => {
        const originalDataUrl = e.target.result;
        const img = new Image();
        img.onerror = () => resolve({ originalUrl: originalDataUrl, cleanUrl: originalDataUrl, hasNativeAlpha: false });
        img.onload = () => {
          try {
            // Limita dimensão a 800px para máxima performance, nitidez e leveza na GPU
            const maxDimension = 800;
            let w = img.naturalWidth || img.width || 300;
            let h = img.naturalHeight || img.height || 300;
            if (w > maxDimension || h > maxDimension) {
              if (w >= h) {
                h = Math.round((h * maxDimension) / w);
                w = maxDimension;
              } else {
                w = Math.round((w * maxDimension) / h);
                h = maxDimension;
              }
            }

            const canvas = document.createElement('canvas');
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, w, h);

            const imgData = ctx.getImageData(0, 0, w, h);
            const d = imgData.data;
            const totalPixels = w * h;

            // 1. Verifica se já possui transparência nativa (ex: PNG/SVG já vazados)
            let transparentPixels = 0;
            for (let i = 3; i < d.length; i += 4) {
              if (d[i] < 210) {
                transparentPixels++;
              }
            }
            const hasNativeAlpha = (transparentPixels / totalPixels) > 0.04;

            if (hasNativeAlpha) {
              const cleanUrl = canvas.toDataURL('image/png');
              resolve({
                originalUrl: originalDataUrl,
                cleanUrl: cleanUrl,
                hasNativeAlpha: true
              });
              return;
            }

            // 2. Imagem opaca (JPG, PNG com fundo de papel/tela)
            // Analisa as bordas para identificar a cor do papel/fundo
            let borderSum = 0;
            let borderCount = 0;
            for (let x = 0; x < w; x += 2) {
              const topIdx = (x) * 4;
              const botIdx = ((h - 1) * w + x) * 4;
              borderSum += 0.299 * d[topIdx] + 0.587 * d[topIdx + 1] + 0.114 * d[topIdx + 2];
              borderSum += 0.299 * d[botIdx] + 0.587 * d[botIdx + 1] + 0.114 * d[botIdx + 2];
              borderCount += 2;
            }
            for (let y = 0; y < h; y += 2) {
              const leftIdx = (y * w) * 4;
              const rightIdx = (y * w + (w - 1)) * 4;
              borderSum += 0.299 * d[leftIdx] + 0.587 * d[leftIdx + 1] + 0.114 * d[leftIdx + 2];
              borderSum += 0.299 * d[rightIdx] + 0.587 * d[rightIdx + 1] + 0.114 * d[rightIdx + 2];
              borderCount += 2;
            }
            const borderLum = borderSum / (borderCount || 1);

            // Estatísticas de luminância
            let minLum = 255;
            let maxLum = 0;
            const step = Math.max(1, Math.floor(totalPixels / 1000));
            for (let i = 0; i < d.length; i += step * 4) {
              const lum = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
              if (lum < minLum) minLum = lum;
              if (lum > maxLum) maxLum = lum;
            }

            const isLightBackground = borderLum >= 120;

            if (isLightBackground) {
              // Fundo claro (papel branco/bege) -> remove papel e isola a tinta escura
              const contrast = Math.max(25, borderLum - minLum);
              const thHigh = borderLum - Math.max(12, contrast * 0.15);
              const thLow = minLum + Math.max(20, contrast * 0.35);
              const range = Math.max(1, thHigh - thLow);

              for (let i = 0; i < d.length; i += 4) {
                const lum = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
                let alpha = 0;
                if (lum >= thHigh) {
                  alpha = 0;
                } else if (lum <= thLow) {
                  alpha = 255;
                } else {
                  alpha = Math.round(255 * (thHigh - lum) / range);
                }
                d[i] = 255;
                d[i + 1] = 255;
                d[i + 2] = 255;
                d[i + 3] = alpha;
              }
            } else {
              // Fundo escuro (preto/cinza) -> remove fundo escuro e isola os traços claros
              const contrast = Math.max(25, maxLum - borderLum);
              const thLow = borderLum + Math.max(12, contrast * 0.15);
              const thHigh = maxLum - Math.max(20, contrast * 0.35);
              const range = Math.max(1, thHigh - thLow);

              for (let i = 0; i < d.length; i += 4) {
                const lum = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
                let alpha = 0;
                if (lum <= thLow) {
                  alpha = 0;
                } else if (lum >= thHigh) {
                  alpha = 255;
                } else {
                  alpha = Math.round(255 * (lum - thLow) / range);
                }
                d[i] = 255;
                d[i + 1] = 255;
                d[i + 2] = 255;
                d[i + 3] = alpha;
              }
            }

            ctx.putImageData(imgData, 0, 0);
            const cleanUrl = canvas.toDataURL('image/png');
            resolve({
              originalUrl: originalDataUrl,
              cleanUrl: cleanUrl,
              hasNativeAlpha: false
            });
          } catch (err) {
            console.warn('Erro ao purificar imagem no canvas:', err);
            resolve({
              originalUrl: originalDataUrl,
              cleanUrl: originalDataUrl,
              hasNativeAlpha: false
            });
          }
        };
        img.src = originalDataUrl;
      };
      reader.readAsDataURL(file);
    });
  }

  async handleFileUpload(files) {
    const availableSlots = 3 - this.selectedSigils.length;
    if (availableSlots <= 0) {
      alert('Limite máximo de 3 sigilos simultâneos atingido.');
      if (this.fileInput) this.fileInput.value = '';
      return;
    }

    const filesToProcess = Array.from(files)
      .filter(f => f.type.startsWith('image/'))
      .slice(0, availableSlots);

    if (filesToProcess.length === 0) {
      if (this.fileInput) this.fileInput.value = '';
      return;
    }

    const dropzoneText = this.dropzone ? this.dropzone.querySelector('.upload-text') : null;
    const oldText = dropzoneText ? dropzoneText.textContent : '';
    if (dropzoneText) {
      dropzoneText.textContent = `🔮 Purificando e extraindo ${filesToProcess.length} sigilo(s)...`;
    }

    try {
      for (const file of filesToProcess) {
        const result = await this.processImageToSigilMask(file);
        this.addSigil({
          id: 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
          name: file.name.replace(/\.[^/.]+$/, ''),
          url: result.cleanUrl,
          cleanUrl: result.cleanUrl,
          originalUrl: result.originalUrl,
          isUserUpload: true,
          renderMode: 'glyph'
        });
      }
    } catch (err) {
      console.error('Falha no upload/processamento de sigilos:', err);
      alert('Houve um problema ao processar a imagem do sigilo.');
    } finally {
      if (dropzoneText) {
        dropzoneText.textContent = oldText;
      }
      if (this.fileInput) {
        this.fileInput.value = '';
      }
    }
  }

  addServerSigil(server) {
    if (!server) return;
    const sigilUrl = (server.sigil_image || server.image || '').replace('.jpg', '.png');
    this.addSigil({
      id: server.id,
      name: server.name_pt || server.name_en || server.name,
      url: sigilUrl,
      cleanUrl: sigilUrl,
      originalUrl: sigilUrl,
      isUserUpload: false,
      renderMode: 'glyph'
    });
  }

  addSigil(sigilObj) {
    if (this.selectedSigils.length >= 3) {
      alert('Limite máximo de 3 sigilos simultâneos atingido.');
      return;
    }
    if (this.selectedSigils.some(s => s.id === sigilObj.id)) return;

    if (!sigilObj.cleanUrl) sigilObj.cleanUrl = sigilObj.url;
    if (!sigilObj.originalUrl) sigilObj.originalUrl = sigilObj.url;
    if (!sigilObj.renderMode) sigilObj.renderMode = 'glyph';

    this.selectedSigils.push(sigilObj);
    this.renderPreviews();
    this.renderStageOverlay();
  }

  removeSigil(id) {
    this.selectedSigils = this.selectedSigils.filter(s => s.id !== id);
    this.renderPreviews();
    this.renderStageOverlay();
  }

  renderPreviews() {
    if (!this.previewContainer) return;
    this.previewContainer.innerHTML = '';

    const currentColor = this.colorPalette.find(c => c.hex.toLowerCase() === this.selectedColor.toLowerCase()) || this.colorPalette[0];

    this.selectedSigils.forEach(s => {
      const thumbCard = document.createElement('div');
      thumbCard.className = 'sigil-thumb-card';

      const thumb = document.createElement('div');
      thumb.className = 'sigil-thumb';
      thumb.title = s.name;

      const isOriginal = s.renderMode === 'original';

      if (isOriginal) {
        thumb.innerHTML = `
          <img class="sigil-thumb-img" src="${s.originalUrl || s.url}" alt="${s.name}" style="filter: drop-shadow(0 0 4px ${currentColor.glow});">
          <button class="sigil-thumb-remove" title="Remover sigilo">✕</button>
        `;
      } else {
        const maskUrl = s.cleanUrl || s.url;
        thumb.innerHTML = `
          <div class="sigil-thumb-icon" style="-webkit-mask-image: url('${maskUrl}'); mask-image: url('${maskUrl}'); background-color: ${currentColor.hex}; filter: drop-shadow(0 0 6px ${currentColor.glow});"></div>
          <button class="sigil-thumb-remove" title="Remover sigilo">✕</button>
        `;
      }

      thumb.querySelector('.sigil-thumb-remove').addEventListener('click', (e) => {
        e.stopPropagation();
        this.removeSigil(s.id);
      });

      thumbCard.appendChild(thumb);

      // Botão para alternar entre modo Glifo Mágico (12 cores) e Imagem Original (cores autênticas)
      if (s.isUserUpload) {
        const toggleBtn = document.createElement('button');
        toggleBtn.type = 'button';
        toggleBtn.className = `sigil-mode-toggle-btn ${isOriginal ? 'mode-original' : 'mode-glyph'}`;
        toggleBtn.title = isOriginal ? 'Mudar para Glifo Mágico (12 Cores)' : 'Mudar para Imagem Original';
        toggleBtn.innerHTML = isOriginal ? '🖼️ Original' : '⚡ Glifo';
        toggleBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          s.renderMode = s.renderMode === 'original' ? 'glyph' : 'original';
          this.renderPreviews();
          this.renderStageOverlay();
        });
        thumbCard.appendChild(toggleBtn);
      }

      this.previewContainer.appendChild(thumbCard);
    });
  }

  renderStageOverlay() {
    if (!this.stageOverlay) return;
    this.stageOverlay.innerHTML = '';

    if (this.selectedSigils.length === 0) {
      this.stageOverlay.innerHTML = `
        <div style="color: var(--text-muted); text-align: center; font-family: var(--font-display);">
          Adicione até 3 sigilos para iniciar a energização de gnose.
        </div>
      `;
      return;
    }

    const currentColor = this.colorPalette.find(c => c.hex.toLowerCase() === this.selectedColor.toLowerCase()) || this.colorPalette[0];

    this.selectedSigils.forEach(s => {
      const isOriginal = s.renderMode === 'original';

      if (isOriginal) {
        const img = document.createElement('img');
        img.className = 'active-sigil-display active-sigil-original-img';
        img.src = s.originalUrl || s.url;
        img.alt = s.name;
        img.title = s.name;
        img.style.filter = `drop-shadow(0 0 16px ${currentColor.glow}) drop-shadow(0 0 32px ${currentColor.glow})`;
        this.stageOverlay.appendChild(img);
      } else {
        const display = document.createElement('div');
        display.className = 'active-sigil-display';
        display.title = s.name;

        const maskUrl = s.cleanUrl || s.url;
        display.style.webkitMaskImage = `url("${maskUrl}")`;
        display.style.maskImage = `url("${maskUrl}")`;
        display.style.backgroundColor = currentColor.hex;
        display.style.filter = `drop-shadow(0 0 16px ${currentColor.glow}) drop-shadow(0 0 32px ${currentColor.glow})`;

        this.stageOverlay.appendChild(display);
      }
    });
  }

  toggleCharging() {
    this.isCharging = !this.isCharging;

    if (this.isCharging) {
      const pattern = this.patternSelect ? this.patternSelect.value : 'balatro';
      this.applyPattern(pattern);
      this.toggleChargeBtn.innerHTML = '🛑 Parar Energização';
      this.toggleChargeBtn.classList.remove('btn-action');
      this.toggleChargeBtn.classList.add('btn-secondary');
    } else {
      if (this.hypnoticEngine) this.hypnoticEngine.stop();
      if (this.ytIframe) {
        this.ytIframe.style.display = 'none';
        this.ytIframe.src = '';
      }
      this.toggleChargeBtn.innerHTML = '⚡ Iniciar Energização de Sigilos';
      this.toggleChargeBtn.classList.remove('btn-secondary');
      this.toggleChargeBtn.classList.add('btn-action');
    }
  }

  applyPattern(pattern) {
    if (pattern.startsWith('yt_')) {
      const videoId = this.ytVideos[pattern] || '4m58zTmoqkw';
      if (this.hypnoticEngine) this.hypnoticEngine.stop();
      if (this.ytIframe) {
        this.ytIframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&autohide=1`;
        this.ytIframe.style.display = 'block';
      }
    } else {
      if (this.ytIframe) {
        this.ytIframe.style.display = 'none';
        this.ytIframe.src = '';
      }
      if (this.hypnoticEngine) this.hypnoticEngine.start(pattern);
    }
  }

  toggleFullscreen() {
    const stage = this.stageContainer || document.getElementById('charging-stage-container');
    if (!stage) return;

    if (!document.fullscreenElement) {
      if (stage.requestFullscreen) {
        stage.requestFullscreen();
      } else if (stage.webkitRequestFullscreen) {
        stage.webkitRequestFullscreen();
      } else if (stage.msRequestFullscreen) {
        stage.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    }
  }
}
