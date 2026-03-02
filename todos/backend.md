# Backend - To-Do List

## Setup & Infraestrutura
- [ ] Inicializar projeto Node.js (package.json, dependências)
- [ ] Configurar estrutura de pastas (`src/`, `migrations/`, `seeds/`, `tests/`)
- [ ] Configurar variáveis de ambiente e arquivo `.env`
- [ ] Configurar database (conexão, pool, config)
- [ ] Criar sistema de migrations para schema do banco
- [ ] Configurar logger (utils/logger.js)
- [ ] Criar endpoint de health check (`GET /api/health`)

## Autenticação (BE-FR-02)
- [ ] Criar model `User` (id, email, password_hash, created_at, preferences)
- [ ] Implementar registro de usuário (`POST /api/auth/register`)
- [ ] Implementar login com emissão de JWT (`POST /api/auth/login`)
- [ ] Implementar refresh de token (`POST /api/auth/refresh`)
- [ ] Criar middleware de autenticação JWT (`middleware/auth.js`)
- [ ] Criar middleware de rate limiting (`middleware/rateLimit.js`)
- [ ] Configurar CORS para frontend e extension

## Ingestão de Eventos (BE-FR-01)
- [ ] Criar model `BrowsingEvent` (id, user_id, url, domain, title, event_type, timestamp, duration, session_id)
- [ ] Criar middleware de validação de requests (`middleware/validation.js`)
- [ ] Implementar endpoint de ingestão em batch (`POST /api/events`)
- [ ] Validar estrutura dos eventos e rejeitar dados malformados
- [ ] Retornar confirmação com contagem de eventos processados

## Classificação de Sites (BE-FR-03)
- [ ] Criar model `SiteClassification` (domain, default_category, user_id, user_category)
- [ ] Criar seed com classificações padrão (`seeds/default-classifications.js`)
- [ ] Implementar `classification.service.js` (classificar automaticamente)
- [ ] Implementar endpoints de classificação (`GET/PUT /api/settings/classifications`)
- [ ] Permitir override de classificação por usuário
- [ ] Implementar aprendizado com feedback do usuário

## Extração de Features (BE-FR-04)
- [ ] Implementar `feature.service.js`
- [ ] Calcular `daily_productive_time` e `daily_distraction_time`
- [ ] Calcular `peak_focus_hours` e `peak_distraction_hours`
- [ ] Calcular `tab_switch_frequency`
- [ ] Calcular `avg_session_duration`
- [ ] Detectar `site_sequence_patterns`
- [ ] Calcular `usage_variance`

## Focus Score (BE-FR-05)
- [ ] Implementar `focusScore.service.js`
- [ ] Calcular score diário: `productive_time - (distraction_time * weight)`
- [ ] Normalizar score para range 0-100
- [ ] Tornar weight configurável e adaptativo
- [ ] Armazenar scores históricos

## Resumos Diários
- [ ] Criar model `DailySummary` (id, user_id, date, productive_time, distraction_time, neutral_time, focus_score, tab_switches, total_sessions, top_sites)
- [ ] Implementar job de agregação noturna (`jobs/dailySummary.job.js`)

## API de Dashboard (BE-FR-10)
- [ ] Implementar `GET /api/summary/daily`
- [ ] Implementar `GET /api/summary/weekly`
- [ ] Implementar `GET /api/summary/monthly`
- [ ] Implementar `GET /api/timeline` (time series horário)
- [ ] Implementar `GET /api/top-sites`
- [ ] Implementar `GET /api/categories`
- [ ] Implementar `GET /api/focus-score/history`

## Motor de IA - Detecção de Anomalias (BE-FR-06)
- [ ] Implementar helpers matemáticos (`utils/math.js` - Z-score, moving average)
- [ ] Implementar `anomaly.service.js` (Z-score + moving average)
- [ ] Evoluir para Isolation Forest
- [ ] Gerar alertas quando desvios excedem threshold

## Motor de IA - Insights Automatizados (BE-FR-07)
- [ ] Criar model `Insight` (id, user_id, type, severity, message, data, created_at, read)
- [ ] Implementar `insight.service.js` (geração de insights em linguagem natural)
- [ ] Priorizar insights por relevância e severidade
- [ ] Implementar job periódico (`jobs/insightGeneration.job.js`)

## Motor de IA - Predição e Padrões (BE-FR-08, BE-FR-09)
- [ ] Implementar `prediction.service.js` (risco de baixa produtividade)
- [ ] Implementar `pattern.service.js` (padrões sequenciais de navegação)
- [ ] Detectar cadeias de distração (ex: email -> twitter -> youtube)

## API de Insights (BE-FR-11)
- [ ] Implementar `GET /api/insights` (com paginação)
- [ ] Implementar filtros por data, tipo, severidade
- [ ] Implementar `PATCH /api/insights/:id` (marcar como lido/descartado)

## Goals & Comparação (BE-FR-12)
- [ ] Implementar `GET /api/goals`
- [ ] Implementar `PUT /api/goals`
- [ ] Implementar `GET /api/comparison/weekly`
- [ ] Implementar sugestões adaptativas de metas
- [ ] Tracking de progresso contra metas

## Requisitos Não-Funcionais
- [ ] Garantir tempo de resposta < 200ms na ingestão de eventos
- [ ] Garantir tempo de resposta < 500ms nos endpoints de dashboard
- [ ] Suportar batch de até 1000 eventos por request
- [ ] Hash de senhas com bcrypt
- [ ] Validação e sanitização de input em todos os endpoints
- [ ] Indexação no banco por user_id e timestamps
- [ ] Processamento de IA em background (não bloquear API)
- [ ] Tratamento de erros graceful com respostas significativas
- [ ] Escrever testes
