# Controle Financeiro Pessoal & Compartilhado

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.0.6-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19.2-blue.svg)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.3-38bdf8.svg)](https://tailwindcss.com/)
[![OpenAPI](https://img.shields.io/badge/Swagger-OpenAPI%203.0-green.svg)](http://localhost:8081/swagger-ui/index.html)
[![PWA](https://img.shields.io/badge/PWA-Installable-purple.svg)](https://web.dev/progressive-web-apps/)
[![AI](https://img.shields.io/badge/IA-Google%20Gemini-orange.svg)](https://aistudio.google.com/)

Aplicação full stack de alto nível para **gestão de finanças pessoais e carteiras compartilhadas em tempo real**, integrando relatórios analíticos, diagnósticos financeiros por inteligência artificial (Google Gemini), suporte offline e instalabilidade PWA, além de rigorosas práticas de segurança alinhadas ao **OWASP Top 10**.

---

## 🏛️ 1. Arquitetura do Sistema

A aplicação é arquitetada no modelo desacoplado cliente-servidor (SPA + API RESTful):

```
┌────────────────────────────────────────────────────────┐
│               FRONTEND (React 19 + Vite)               │
│  • PWA (Service Worker + Manifest + Cache Offline)     │
│  • Tailwind CSS 4 + Shadcn/ui + Lucide Icons           │
│  • Recharts (Gráficos Dinâmicos) + SSE Client          │
└──────────────────────────┬─────────────────────────────┘
                           │ HTTP / REST / SSE EventSource
                           ▼
┌────────────────────────────────────────────────────────┐
│              BACKEND (Spring Boot 4 / Java 17)         │
│  • Rate Limiting Filter & Security Headers (OWASP)     │
│  • Camadas: Controller ➔ Service ➔ Repository ➔ Entity  │
│  • SseNotificacaoService (Broadcasting em Tempo Real)  │
│  • AiService (Google Gemini API - Plano Gratuito)      │
│  • SpringDoc OpenAPI / Swagger UI                      │
└──────────────────────────┬─────────────────────────────┘
                           │ JDBC / JPA Hibernate
                           ▼
┌────────────────────────────────────────────────────────┐
│                   BANCO DE DADOS                       │
│  • MySQL 8.0 (Persistência relacional transacional)    │
└────────────────────────────────────────────────────────┘
```

---

## ✅ 2. Cobertura dos Requisitos Mínimos Obrigatórios

### 2.1 Integração Completa (Item 1.1)
- Frontend e backend **100% integrados**, sem dados mockados.
- Persistência real em banco MySQL com integridade referencial:
  - Autenticação de usuários com senha criptografada em BCrypt.
  - Carteiras pessoais e colaborativas com controle de múltiplos membros.
  - CRUD de transações financeiras (receitas e despesas) vinculadas a categorias e usuários.
  - Histórico de auditoria indicando autor da criação e última edição.

### 2.2 Comunicação em Tempo Real (Item 1.2)
- Implementada via **Server-Sent Events (SSE)** em `/api/v1/sse/subscribe`.
- **Comportamento em produção:** quando qualquer membro adiciona, edita ou exclui uma movimentação em uma carteira compartilhada, **o saldo e a lista de transações dos outros membros são atualizados instantaneamente em tempo real**, exibindo uma notificação flutuante com o autor e valor da alteração.

### 2.3 Relatórios & Extratos (Item 1.3)
- Página dedicada em `/relatorios`:
  - **Filtros e Presets de Período**: Mês Atual, Mês Anterior, Últimos 3 Meses, Ano Atual e Filtro por Calendário Personalizado.
  - **Filtros Combinados**: por tipo (Receita/Despesa), por categoria e por membro da carteira.
  - **Indicadores Executivos (KPIs)**: Total de Receitas, Total de Despesas, Saldo Líquido, Taxa de Poupança (`%`) e Média de Gasto Diário.
  - **Visualização Gráfica**:
    - Distribuição de despesas por categoria (*Gráfico Donut/Pizza*).
    - Comparativo mensal de receitas vs. despesas (*Gráfico de Barras Duplo*).
  - **Distribuição de Membros**: transparência indicando quanto cada participante aportou ou gastou na carteira.
  - **Exportação de Dados**:
    - Download em planilha **CSV** (com UTF-8 BOM, compatível com Excel e LibreOffice).
    - Impressão executiva e **Exportação PDF** via layout nativo `@media print` formatado para folha A4.

### 2.4 Integração com Inteligência Artificial (Item 1.4)
- **Provedor:** Google Gemini (`gemini-flash-lite-latest` / `gemini-3.8-flash`) via Google AI Studio.
- **Custo:** **R$ 0,00 (Plano gratuito permanente, sem necessidade de cartão de crédito)**.
- **Funcionalidade Real:**
  - O backend consolida o extrato financeiro da carteira (taxa de poupança, categorias com maior gasto, ritmo diário e distribuição de membros) e envia ao Gemini.
  - O modelo processa um diagnóstico executivo contendo:
    1. **Score de Saúde Financeira** (nota de 0 a 100 com badge dinâmico: *Excelente, Saudável, Atenção ou Crítico*).
    2. **Resumo Executivo** da carteira.
    3. **Pontos Fortes & Positivos** detectados no período.
    4. **Pontos de Atenção & Riscos** orçamentários.
    5. **Recomendações Práticas** e aplicáveis para economizar.
- **Segurança da Chave:** A chave **nunca é exposta ao frontend**. Fica isolada no backend através do arquivo `application-secrets.properties` ou da variável `GEMINI_API_KEY`.

### 2.5 PWA - Progressive Web App (Item 1.5)
- **Instalável**: `manifest.webmanifest` e `manifest.json` com nome, descrição, cores do tema, ícones responsivos (192x192 e 512x512) e modo de exibição `standalone`.
- **Banner de Instalação Nativo**: Detecta o evento `beforeinstallprompt` e oferece botão *"Instalar Aplicativo"* no menu lateral para desktop e mobile.
- **Suporte Offline**:
  - `sw.js` com pré-cache do App Shell (HTML, CSS, JS, fontes, ícones).
  - Estratégia `Network First` com fallback automático para o cache quando desconectado da internet.
  - Estratégia `Cache First` para recursos estáticos com revalidação em segundo plano.

### 2.6 Segurança Alinhada ao OWASP Top 10 (Item 1.6)
- **A01: Broken Access Control**: Verificação de permissões em cascata na camada de serviço (`validarMembro` e `validarPermissaoEscrita`) em todas as rotas de carteiras, transações, membros, relatórios e IA.
- **A02: Cryptographic Failures**: Senhas criptografadas com hash irreversível **BCrypt** (`PasswordEncoder`). Chaves e senhas isoladas em arquivos ignorados pelo Git (`application-secrets.properties`).
- **A03: Injection (SQL Injection)**: Persistência gerenciada via Spring Data JPA com consultas parametrizadas (PreparedStatements).
- **A04: Insecure Design & Rate Limiting**: Filtro `RateLimitingFilter.java` ativo nas rotas sensíveis (`/auth/login`, `/auth/register`, `/auth/forgot-password`) limitando requisições por IP contra ataques de força bruta (HTTP 429).
- **A05: Security Misconfiguration**: Filtro `SecurityHeadersFilter.java` injetando cabeçalhos de segurança HTTP em todas as respostas:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY` (anti-clickjacking)
  - `X-XSS-Protection: 1; mode=block`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: camera=(), microphone=(), geolocation=()`
  - `Cache-Control: no-store` para respostas de autenticação e dados bancários.

### 2.7 Arquitetura, Qualidade e Testes (Item 1.7)
- Padrões de projeto com separação estrita de responsabilidades:
  - `Controller`: Endpoints REST e serialização HTTP.
  - `Service`: Regras de negócio, cálculos, controle de acesso e segurança.
  - `Repository`: Consultas JPA e operações de banco.
  - `DTO`: Transferência de dados sem expor entidades JPA.
  - `Exception`: Tratamento global padronizado via `@RestControllerAdvice`.
- **Testes Automatizados (JUnit 5 + Mockito)**:
  - `AuthServiceTest`: validação de cadastro, criptografia BCrypt, e-mail duplicado e login.
  - `TransacaoServiceTest`: criação de transações, permissão de escrita, cálculos de saldo e taxa de poupança no relatório.
  - `AiServiceTest`: validação de status da IA, detecção de chave pendente e geração sem dados.
  - Execução: `./mvnw test` (100% de sucesso).

### 2.8 Implantação e Deploy (Item 1.8)
- Configuração pronta para deploy com:
  - `docker-compose.yml`: Orquestração completa de MySQL 8 + Backend + Frontend Nginx com 1 comando.
  - `backend/Dockerfile`: Multi-stage build com JRE Alpine leve e usuário não-root.
  - `frontend/Dockerfile` + `frontend/nginx.conf`: Nginx otimizado com SPA routing e compressão gzip.
  - `frontend/vercel.json`: Suporte nativo para deploy instantâneo na Vercel.

### 2.9 Documentação da API com OpenAPI / Swagger (Item 1.9)
- Documentação interativa Swagger UI acessível em:
  - **Swagger UI**: `http://localhost:8081/swagger-ui/index.html`
  - **Especificação OpenAPI JSON**: `http://localhost:8081/v3/api-docs`

---

## 🚀 3. Como Rodar a Aplicação Localmente

### Opção A: Execução Rápida via Docker Compose (Recomendada)

Com o Docker instalado, execute na raiz do projeto:

```bash
docker compose up -d --build
```

- **Frontend:** `http://localhost:3000`
- **Backend API:** `http://localhost:8081`
- **Swagger UI:** `http://localhost:8081/swagger-ui/index.html`
- **MySQL:** Porta `3306`

---

### Opção B: Execução Manual (Desenvolvimento)

#### 1. Pré-requisitos
- **Java 17+**
- **Node.js 18+** e npm
- **MySQL 8+** ativo na porta 3306

#### 2. Configurando o Banco de Dados
No MySQL, crie o banco da aplicação:
```sql
CREATE DATABASE financeiro;
```

#### 3. Configurando o Backend (Spring Boot)
1. Acesse a pasta do backend:
   ```bash
   cd backend
   ```
2. Crie o arquivo de segredos locais em `src/main/resources/application-secrets.properties`:
   ```properties
   spring.datasource.password=sua_senha_do_mysql
   spring.mail.password=sua_senha_de_app_gmail
   jwt.secret=string_secreta_com_pelo_menos_32_caracteres_12345
   jwt.expiration=1000000

   # Chave Gratuita do Google Gemini (https://aistudio.google.com/app/apikey)
   gemini.api.key=SUA_CHAVE_GEMINI_AQUI
   ```
3. Execute o backend:
   ```bash
   ./mvnw spring-boot:run
   ```
   *(No Windows: `mvnw.cmd spring-boot:run`)*  
   O backend inicializará em `http://localhost:8081`.

#### 4. Configurando o Frontend (React + Vite)
1. Em outro terminal, acesse a pasta do frontend:
   ```bash
   cd frontend
   npm install
   ```
2. Inicie o servidor Vite:
   ```bash
   npm run dev
   ```
   Acesse a aplicação no navegador em `http://localhost:5173`.

---

## 🔑 4. Como Obter e Configurar a Chave do Google Gemini (Custo R$ 0,00)

1. Acesse o **Google AI Studio**: [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Faça login com qualquer conta Google (Gmail comum).
3. Clique em **"Create API key"** (não é exigido nenhum cartão de crédito).
4. Copie a chave gerada e cole no arquivo `backend/src/main/resources/application-secrets.properties`:
   ```properties
   gemini.api.key=AIzaSy...sua_chave...
   ```
   *(Ou defina a variável de ambiente `$env:GEMINI_API_KEY="AIzaSy..."` no terminal).*

---

## 🧪 5. Execução dos Testes Automatizados

Para rodar a suíte completa de testes unitários e de integração do backend:

```bash
cd backend
./mvnw test
```

---

## 👥 Usuário de Demonstração

Ao iniciar pela primeira vez com o banco limpo, o sistema cria automaticamente um usuário de testes via `DataInitializer`:

| Campo | Valor |
| :--- | :--- |
| **E-mail** | `usuario@teste.com` |
| **Senha** | `123456User!` |
