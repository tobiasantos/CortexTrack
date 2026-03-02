# Habit Intelligence --- AI Behavior Analyzer

Uma extensão que aprende padrões digitais do usuário e detecta mudanças
comportamentais relevantes.

---

## Valor real para usuário

Não é só dashboard. O valor é:

- entender padrões de foco
- detectar distrações
- alertar mudanças de rotina
- sugerir melhorias

Isso transforma o projeto de _tracker_ → _assistente inteligente_.

---

## Arquitetura ideal

### 1. Coleta de dados (Chrome Extension API)

Dados possíveis: - sites visitados - tempo em cada site - horário de
uso - frequência - sessões - alternância de abas

---

### 2. Pipeline de processamento

Transforma logs brutos → features

Exemplos: - tempo médio produtivo - horário pico de distração -
variância de uso - sequência de sites

---

### 3. Engine de IA

Primeira versão: - Z-score - média móvel - detecção de outlier

Versão evoluída: - Isolation Forest - clustering - detecção de mudança
de padrão

---

### 4. Sistema de insights

Exemplo:

> Seu uso do YouTube aumentou 72% nas manhãs comparado à média semanal.

---

### 5. UI

Dashboards possíveis: - heatmap de produtividade - gráfico de foco -
score diário - timeline de uso

---

## Inteligências que você pode implementar

### Detector de mudança comportamental

Detecta quando rotina muda.

### Classificador de sites

Classifica automaticamente: - produtivo - neutro - distração

### Score de foco

Formula:

foco = tempo_produtivo − tempo_distracao × peso

### Preditor de risco

Prevê dias com chance de baixa produtividade.

---

## Features que impressionam recrutadores

Implemente pelo menos duas:

- modelo que aprende com feedback do usuário
- sistema de metas adaptativas
- explicação dos insights
- detecção de padrões sequenciais
- comparação com semanas anteriores

---

## Sugestões de nome

- CortexTrack
- PatternMind
- InsightFlow
- HabitScope
- Cognalytics

---

## Roadmap (8 semanas)

**Semana 1--2** Extensão + coleta de dados

**Semana 3** Banco local + logs estruturados

**Semana 4** Dashboard básico

**Semana 5** Algoritmo de anomalia

**Semana 6** Insights automáticos

**Semana 7** Otimização + UI refinada

**Semana 8** Deploy + documentação

---

## O que o projeto prova tecnicamente

Mostra que você sabe:

- coletar dados reais
- construir pipeline
- criar modelo
- avaliar comportamento
- gerar valor com IA

---

## Dica de ouro

Adicione no README:

- diagrama de arquitetura
- explicação matemática do algoritmo
- comparação antes/depois
- limites do modelo
- possíveis melhorias
