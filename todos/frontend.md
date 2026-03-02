# Frontend - To-Do List

## Setup & Infraestrutura
- [ ] Inicializar projeto (Next.js + TypeScript)
- [ ] Configurar estrutura de pastas (`app/`, `components/`, `hooks/`, `services/`, `lib/`, `styles/`, `types/`)
- [ ] Configurar tema (color tokens, spacing, typography) em `styles/theme.ts`
- [ ] Configurar estilos globais (`styles/globals.css`)
- [ ] Definir interfaces TypeScript compartilhadas (`types/index.ts`)
- [ ] Configurar constantes e formatadores (`lib/constants.ts`, `lib/formatters.ts`, `lib/utils.ts`)

## API Client & Serviços
- [ ] Implementar API client com auth interceptor (`services/api.ts`)
- [ ] Implementar `services/auth.service.ts`
- [ ] Implementar `services/dashboard.service.ts`
- [ ] Implementar `services/analytics.service.ts`
- [ ] Implementar `services/insights.service.ts`
- [ ] Implementar `services/goals.service.ts`

## Hooks de Estado
- [ ] Implementar `hooks/useAuth.ts` (auth state, login, logout, register)
- [ ] Implementar `hooks/useDashboard.ts` (summary, timeline, topSites, focusScore)
- [ ] Implementar `hooks/useAnalytics.ts` (heatmap, trends, comparison, dateRange)
- [ ] Implementar `hooks/useInsights.ts` (items, filters, unreadCount)
- [ ] Implementar `hooks/useGoals.ts` (items, suggestions)

## Layout & Navegação (FE-FR-08)
- [ ] Implementar `layout/Sidebar.tsx` (navegação lateral, colapsável no mobile)
- [ ] Implementar `layout/TopBar.tsx` (avatar, notificações, settings)
- [ ] Implementar `layout/MobileNav.tsx` (nav inferior para mobile)
- [ ] Implementar root layout (`app/layout.tsx`)
- [ ] Design responsivo: mobile (< 768px), tablet (768-1024px), desktop (> 1024px)

## Componentes Base (ui/)
- [ ] Criar componentes base: Button, Input, Card, Modal, Spinner, Skeleton
- [ ] Implementar loading skeletons para fetch de dados
- [ ] Implementar empty states com mensagens úteis
- [ ] Implementar error states com ação de retry

## Páginas de Autenticação (FE-FR-01)
- [ ] Implementar página de Login (`app/login/page.tsx`)
- [ ] Implementar página de Registro (`app/register/page.tsx`)
- [ ] Validação inline de formulários
- [ ] Redirect para dashboard após auth bem-sucedida

## Dashboard - Página Principal (FE-FR-02)
- [ ] Implementar `components/dashboard/ScoreCard.tsx` (score grande com trend arrow)
- [ ] Implementar `components/dashboard/DailySummary.tsx` (tempo produtivo, distração, neutro)
- [ ] Implementar `components/dashboard/TopSites.tsx` (lista ranqueada com favicon, tempo, badge)
- [ ] Implementar `components/charts/CategoryDonut.tsx` (donut chart por categoria)
- [ ] Implementar `components/charts/HourlyTimeline.tsx` (bar chart 24h color-coded)
- [ ] Integrar insights ativos na dashboard (últimos não-lidos)
- [ ] Implementar date picker para visualizar dias históricos
- [ ] Montar página principal (`app/page.tsx`) com grid de cards

## Analytics (FE-FR-03)
- [ ] Implementar `components/charts/ProductivityHeatmap.tsx` (grid estilo GitHub)
- [ ] Implementar `components/charts/TrendChart.tsx` (line chart focus score)
- [ ] Implementar `components/charts/ComparisonBars.tsx` (semana atual vs anterior)
- [ ] Implementar stacked area chart de tendência por categoria
- [ ] Implementar chart de análise de tab switching
- [ ] Implementar seletor de time range (7d, 30d, 90d, custom)
- [ ] Montar página de Analytics (`app/analytics/page.tsx`)
- [ ] Lazy loading dos charts

## Insights (FE-FR-04)
- [ ] Implementar `components/insights/InsightCard.tsx` (ícone, mensagem, mini-viz, timestamp)
- [ ] Implementar `components/insights/InsightList.tsx`
- [ ] Implementar filtros por tipo (anomaly, trend, pattern, prediction)
- [ ] Implementar filtros por severidade (info, warning, critical)
- [ ] Implementar ação de marcar como lido / descartar
- [ ] Montar página de Insights (`app/insights/page.tsx`)

## Goals (FE-FR-05)
- [ ] Implementar `components/goals/GoalProgress.tsx` (progress bar com target e streak)
- [ ] Implementar `components/goals/GoalForm.tsx` (criar/editar metas)
- [ ] Suportar tipos: tempo produtivo, max distração, focus score, sessões
- [ ] Implementar streak counter (dias consecutivos atingindo meta)
- [ ] Exibir metas sugeridas pela IA
- [ ] Montar página de Goals (`app/goals/page.tsx`)

## Settings (FE-FR-06)
- [ ] Implementar seção de Perfil (email, trocar senha)
- [ ] Implementar seção de Classificação de Sites (visualizar/override categorias)
- [ ] Implementar seção de Preferências (time range padrão, tema light/dark, notificações)
- [ ] Implementar seção de Dados (exportar dados, deletar conta)
- [ ] Montar página de Settings (`app/settings/page.tsx`)

## Requisitos Não-Funcionais
- [ ] Page load inicial < 2 segundos
- [ ] Render do dashboard < 1 segundo após resposta da API
- [ ] Cache de respostas da API com TTL curto
- [ ] HTML semântico e ARIA labels
- [ ] Suporte a navegação por teclado
- [ ] Contraste de cores >= 4.5:1
- [ ] Tabelas de dados como fallback para charts
- [ ] Tooltips nos data points dos charts
- [ ] Transições suaves entre páginas
- [ ] Escrever testes
