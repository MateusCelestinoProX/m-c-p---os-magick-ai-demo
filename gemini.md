# Gemini.md - Constituição do Projeto MAGICK A.I

## 1. Esquema de Dados (Data Schemas)

### 1.1 Server Entity Schema (`assets/data/servers.json`)
```json
{
  "servers": [
    {
      "id": "adventurer",
      "number": 1,
      "name_en": "THE ADVENTURER",
      "name_pt": "O ADVENTUREIRO",
      "category": "servant",
      "type": "servant",
      "summary": "Este servo é todo sobre aventura, emoção, empurrando seus limites e experimentar coisas novas.",
      "divination": "Sentindo-se entediado com sua vida ou em uma rotina...",
      "divination_meaning": "Sentindo-se entediado com sua vida ou em uma rotina...",
      "magick": "O Operador pode invocar a ajuda do Aventureiro quando eles precisam de alguma excitação...",
      "card_image": "assets/images/cards/adventurer.jpg",
      "image": "assets/images/cards/adventurer.jpg",
      "sigil_image": "assets/images/sigils/adventurer.png"
    }
  ]
}
```

### 1.2 Motor de Fundo Cinematográfico Dinâmico (`backgrounds/` & `background_engine.js`)
- **Pastas de Imagens Suportadas:** `caosphere`, `celestial`, `horror`, `satanic` (59 imagens HD).
- **Abertura Aleatória:** O site abre com uma categoria de fundo selecionada aleatoriamente a cada inicialização.
- **Slideshow Cinematográfico:** Transição suave entre as imagens da pasta ativa a cada **3 segundos**.
- **Widget de Configuração (`#bg-widget-modal`):** Permite alterar a pasta ativa e controlar os níveis de:
  - **Escurecimento (Dim Overlay):** Ajustável de 0% a 90%.
  - **Desfoque (Blur):** Ajustável de 0px a 20px.

### 1.3 Engine de Ciberdivinação 3D (Ciclo de Vida de 5 Fases)
1. **Fase 1: Distribuição & Revelação Inicial (5s):** 40 cartas dos Servidores distribuídas em 3D pelo viewport viradas para CIMA via GSAP (`gsap.to`).
2. **Fase 2: Ocultação em Massa (Flip Down):** Aplicação de `.flipped` simultânea em todas as 40 cartas.
3. **Fase 3: Embaralhamento Caótico 3D (Chaos Shuffle):** Loop assíncrono de 5 rodadas em que 4 cartas convergem ao centro, giram 180° e redisparam para novas coordenadas aleatórias via GSAP (`power2.out`).
4. **Fase 4: Seleção Interativa:** Cursor pointer, hover com `scale: 1.12`. Clique eleva `zIndex: 50`, `scale: 1.3` e remove `.flipped`.
5. **Fase 5: Revelação Oracular (Modal Glassmorphic):** Animação `gsap.fromTo` exibindo títulos de posição em neon orange, imagem e `divination_meaning`.

### 1.4 Design System & Paleta
- **Paleta:** 100% Vanta Black (`#000000`), Red Sanguine Neon (`#ff0033`), Mystic Electric Orange (`#ff5500`) e Yellow Energy (`#ffcc00`).
- **Navegação de Logo:** Clique em `.brand-logo` direciona para a Home.
