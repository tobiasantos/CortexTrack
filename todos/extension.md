# Chrome Extension - To-Do List

## Setup & Infraestrutura
- [ ] Criar `manifest.json` (Manifest V3, Chrome 110+)
- [ ] Configurar estrutura de pastas (`background/`, `popup/`, `options/`, `utils/`, `assets/`)
- [ ] Criar ícones da extensão (16px, 48px, 128px)

## Service Worker - Tracking de Navegação (EXT-FR-01)
- [ ] Implementar captura de navegação (URL, título, timestamp)
- [ ] Detectar quando uma tab fica ativa ou perde foco
- [ ] Ignorar páginas internas do Chrome (`chrome://`, `chrome-extension://`)

## Tracking de Tempo (EXT-FR-02)
- [ ] Medir tempo ativo em cada site/tab
- [ ] Pausar tracking quando o browser está idle ou minimizado
- [ ] Tratar tab switching (parar timer na tab antiga, iniciar na nova)

## Gerenciamento de Sessão (EXT-FR-03)
- [ ] Detectar início de sessão (browser aberto / primeira atividade)
- [ ] Detectar fim de sessão (browser fechado / idle prolongado)
- [ ] Rastrear duração total da sessão

## Tracking de Tab Switching (EXT-FR-04)
- [ ] Logar cada evento de troca de tab com timestamps
- [ ] Calcular frequência de troca por sessão
- [ ] Identificar padrões de alternância rápida (sinal de distração)

## Sincronização com Backend (EXT-FR-05)
- [ ] Implementar API client (`utils/api.js`)
- [ ] Enviar eventos coletados em batch para o backend
- [ ] Implementar fila local quando offline (`chrome.storage.local`)
- [ ] Retry automático quando conexão for restaurada
- [ ] Agendar sync periódico com `chrome.alarms`
- [ ] Usar token de autenticação nos requests

## Autenticação (EXT-FR-06)
- [ ] Implementar lógica de auth (`utils/auth.js`)
- [ ] Implementar login/signup no popup da extensão
- [ ] Armazenar token com segurança em `chrome.storage`
- [ ] Tratar expiração e refresh de token

## Storage Helpers
- [ ] Implementar `utils/storage.js` (helpers para chrome.storage)
- [ ] Persistir eventos não enviados em `chrome.storage.local`
- [ ] Sincronizar preferências com `chrome.storage.sync`

## Popup UI (EXT-FR-07)
- [ ] Criar `popup/popup.html` (estrutura)
- [ ] Criar `popup/popup.css` (estilos)
- [ ] Implementar `popup/popup.js`:
  - [ ] Mostrar status do tracking (ativo / pausado)
  - [ ] Exibir resumo do dia: tempo total, top sites, focus score
  - [ ] Toggle para pausar/resumir tracking
  - [ ] Mostrar status de conexão com backend

## Preferences / Options (EXT-FR-08)
- [ ] Criar `options/options.html` (estrutura)
- [ ] Criar `options/options.css` (estilos)
- [ ] Implementar `options/options.js`:
  - [ ] Configurar sites para excluir do tracking (allowlist/blocklist)
  - [ ] Configurar threshold de idle timeout
  - [ ] Configurar frequência de sync
- [ ] Persistir preferências em `chrome.storage.sync`

## Requisitos Não-Funcionais
- [ ] Footprint mínimo de CPU e memória no service worker
- [ ] Nenhum impacto visível na performance do browser
- [ ] Nunca capturar conteúdo de página, dados de formulário ou senhas
- [ ] Coletar apenas: URL, título, timestamps, eventos de tab
- [ ] Transmissão de dados apenas via HTTPS
- [ ] Limpeza de dados locais mediante request do usuário
- [ ] Sobreviver a restarts do browser sem perda de dados
- [ ] Tratamento graceful de downtime da API
- [ ] Escrever testes
