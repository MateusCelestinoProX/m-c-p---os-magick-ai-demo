# Task Plan - MAGICK A.I (Altar e Templo Digital de Magia do Caos)

## Objetivo
Desenvolver uma plataforma web completa, responsiva e de alta performance chamada **MAGICK A.I**, que atua como Altar Digital e Templo Digital focada na prática da Magia do Caos (Chaos Magick).

---

## Estrutura das Funcionalidades Principais

### 1. Opção 1: Servidores do Caos (Os 40 Servos + Os 4 Diabos)
- Catálogo interativo contendo os 40 Servidores de Tommie Kelly + os 4 Diabos (total: 44 entidades).
- Páginas/Modais detalhados para cada entidade com:
  - Nome oficial da entidade.
  - Ilustração/Foto completa do Servidor.
  - Sigilo isolado do Servidor (exibido na parte inferior).
  - Descrição detalhada do significado em **Divinação**.
  - Descrição detalhada do significado em **Magia (Feitiçaria/Evocação)**.
  - Botão rápido "Adicionar Sigilo ao Energizador".

### 2. Opção 2: Carregador de Sigilos (Sigil Charging Engine)
- Upload de até 3 imagens/sigilos próprios do usuário (suporte a PNG, JPG, WebP, SVG).
- Seleção direta de até 3 sigilos da lista oficial dos 44 Servidores.
- Modos de Energização / Gnose:
  - Ocultação temporária do plano de fundo padrão (Chaosphere).
  - Execução de vídeo/animação hipnótica e abstrata em loop de alta intensidade no fundo.
  - Exibição centralizada e sobreposta das imagens/sigilos selecionados com opacidade e brilho configuráveis.
  - Temporizador de transe / foco (ex: 1min, 3min, 5min, contínuo).

### 3. Opção 3: Cyberdivinação (Cyber Divination Engine)
- Deck interativo com as 44 cartas dos Servidores e Diabos.
- Animação de revelação de 5 segundos (todas as cartas abertas no container Glassmorphic).
- Animação de virada individual de cartas para baixo (face oculta).
- Algoritmo de embaralhamento imprevisível para desarmar a mente consciente e ativar a intuição subconsciente.
- Métodos de tiragem (Ex: Carta Única / Oráculo Diário, Três Cartas - Passado/Presente/Futuro ou Desafio/Caminho/Resultado).
- Revelação com interpretação instantânea (Divinação + Magia).

---

## Design System & Estética (V.L.A.E.G. - Estilo)
- **Tema:** Ultra Dark / Vanta Black (`#020205`, `#080810`, `#0f0f1a`).
- **Glassmorphism:** Apple Liquid Glass, bordas de cristal translúcido, desfoque de fundo (`backdrop-filter: blur(16px)`), sombras profundas e brilho neon místico (roxo, azul ciano, magenta caótico).
- **Background:** Chaosphere (Esfera do Caos) dinâmica e animada cobrindo todo o viewport, visível em todas as telas (exceto durante a energização de sigilos).
- **Responsividade:** Layout adaptável em tempo real para dispositivos móveis, tablets e telas 4K.

---

## Checklist de Execução V.L.A.E.G.

### Fase 0: Inicialização e Blueprint 🟢
- [x] Leitura das diretrizes mestre em `RULES/RULES.MD` e especificações em `IMPLEMENTATION/`.
- [x] Inicialização de `task_plan.md`, `findings.md`, `progress.md` e `gemini.md`.
- [x] Extração de textos e imagens do livro PDF e fontes autoritativas.

### Fase 1: Visão (V) - Estruturação de Dados ⏳
- [x] Leitura completa da especificação de negócio na pasta `IMPLEMENTATION/`.
- [ ] Definir o JSON Data Schema oficial de todas as 44 entidades em `gemini.md`.
- [ ] Mapear todos os sigilos e descrições dos 40 Servos e 4 Diabos.

### Fase 2: Link (L) - Conectividade & Recursos ⏳
- [ ] Garantir que os arquivos de mídia (imagens, ícones e vídeos hipnóticos) estejam organizados em `assets/`.
- [ ] Testar carregamento local da aplicação via servidor local HTTP.

### Fase 3: Arquitetura (A) - Construção das 3 Camadas ⏳
- [ ] Criar POP em `architecture/pop_magick_ai.md`.
- [ ] Implementar a estrutura HTML5 semântica e acessível em `index.html`.
- [ ] Implementar a estilização CSS3 (Vanta Black + Ultra Glassmorphism) em `styles.css`.
- [ ] Implementar o motor de lógica em JavaScript modular (`app.js`, `servers_data.js`, `sigil_charger.js`, `cyber_divination.js`).

### Fase 4: Estilo (E) - Refinamento Visual & UX ⏳
- [ ] Aplicar micro-animações, efeitos hover, partículas e transições fluida nas cartas.
- [ ] Validar a visualização das páginas dos 44 Servidores.
- [ ] Testar a experiência imersiva do Energizador de Sigilos e Cyberdivinação.

### Fase 5: Gatilho (G) - Validação Final & Link ⏳
- [ ] Iniciar o servidor HTTP e testar em múltiplos tamanhos de tela.
- [ ] Entregar o link clicável para visualização imediata no navegador.
- [ ] Atualizar o log de manutenção final em `gemini.md`.
