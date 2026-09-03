# Controle Financeiro Pessoal e Compartilhado

Aplicação web full stack para gestão de finanças pessoais e compartilhadas.
O usuário cadastra receitas e despesas, acompanha um resumo financeiro e pode
compartilhar carteiras com outras pessoas, definindo níveis de acesso
diferentes para cada uma.

Projeto acadêmico da disciplina de Programação Web — Parte 1 (frontend)
e Parte 2 (backend).

## Arquitetura

O repositório é dividido em dois módulos independentes:

```
/frontend   → SPA em React (Vite), consome a API REST do backend
/backend    → API REST em Spring Boot, persistência em MySQL
```

O frontend não guarda nenhuma regra de negócio: ele apenas chama os
endpoints do backend (`/auth/**`, `/api/v1/**`) através do Axios e guarda a
sessão (token + dados do usuário) no `localStorage`.

O backend segue arquitetura em camadas (`controller` → `service` →
`repository` → `entity`), com DTOs para requisições sensíveis (login,
cadastro, alteração de senha) e um `@RestControllerAdvice` central para
padronizar erros da API no formato:

```json
{
  "status": 422,
  "error": "Unprocessable Entity",
  "message": "Este e-mail já está cadastrado!",
  "timestamp": "2026-08-27T10:00:00"
}
```

## Tecnologias

**Frontend:** React 19, Vite, React Router DOM 7, Tailwind CSS 4, shadcn/ui,
Recharts, Axios, Lucide React.

**Backend:** Spring Boot 4 (Web MVC), Spring Data JPA / Hibernate, MySQL,
Bean Validation, Spring Mail + Thymeleaf (e-mails transacionais), Lombok,
SpringDoc/Swagger.

> **Sobre segurança:** esta entrega ainda não implementa Spring Security nem
> JWT de verdade — o conteúdo ainda não foi visto na disciplina. A
> autenticação atual usa um token simples gerado no login
> (`token_bearer_{id}_{uuid}`), validado manualmente por um header
> `Authorization: Bearer` em cada controller. Isso cobre a navegação e a
> proteção de rotas no frontend, mas não é seguro para produção. A
> senha também é comparada e armazenada em texto puro, sem hashing (ver
> seção "Próximos passos" abaixo).

## Pré-requisitos

- Node.js 18+ e npm
- Java 17+
- MySQL 8+ (ou outro banco compatível) rodando localmente
- Maven (o projeto já inclui o Maven Wrapper, `./mvnw`)

## Configuração e execução — Backend

1. Crie o banco de dados no MySQL:
   ```sql
   CREATE DATABASE financeiro;
   ```

2. Copie o arquivo de exemplo de segredos e preencha com seus próprios
   valores (esse arquivo é ignorado pelo Git — nunca faça commit dele):
   ```bash
   cd backend/src/main/resources
   cp "application-secrets(exemlo).properties" application-secrets.properties
   ```

   Preencha `application-secrets.properties`:
   ```properties
   spring.datasource.password=SUA_SENHA_DO_MYSQL
   spring.mail.password=SENHA_DE_APP_DO_GMAIL
   jwt.secret=string_de_pelo_menos_32_caracteres
   jwt.expiration=1000000
   ```

3. Ajuste, se necessário, `application.properties` (usuário do banco,
   porta, host do MySQL (que hoje aponta para `localhost:3306`), usuário
   `root`).

4. Execute a aplicação:
   ```bash
   cd backend
   ./mvnw spring-boot:run
   ```

   A API sobe em `http://localhost:8081`.

5. Documentação interativa (Swagger):
   `http://localhost:8081/swagger-ui.html`

Ao subir pela primeira vez, um `CommandLineRunner` (`DataInitializer`) cria
um usuário de teste automaticamente:

| Campo  | Valor              |
|--------|--------------------|
| E-mail | usuario@teste.com  |
| Senha  | 123456User!        |

## Configuração e execução — Frontend

1. Instale as dependências:
   ```bash
   cd frontend
   npm install
   ```

2. (Opcional) crie um arquivo `.env` na pasta `frontend/` para apontar para
   outra URL de backend:
   ```
   VITE_API_BASE_URL=http://localhost:8081
   ```

3. Execute o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

4. Acesse `http://localhost:5173`.

## Funcionalidades entregues

**Autenticação e conta**
- Login com validação, exibir/ocultar senha, loading e mensagens de erro
  específicas
- Cadastro com indicador de força de senha em tempo real e confirmação de
  senha
- Recuperação de senha em duas etapas (e-mail → código de 6 dígitos →
  redefinição), com mensagem neutra para não revelar e-mails cadastrados
- Alteração de senha na área logada, exigindo a senha atual
- Persistência de sessão via `localStorage` e proteção de rotas
  (`RotaProtegida` / `RotaPublica`)

**Dashboard**
- Indicadores de saldo, receitas e despesas calculados pelo backend
  (`GET /api/v1/wallets/{id}/summary`)
- Gráfico (Recharts) de receitas x despesas
- Lista de lançamentos recentes com diferenciação visual por tipo
- Estado de carregamento enquanto os dados são buscados
- Criação de novas transações direto pelo dashboard (funcionalidade extra)

**Backend**
- CRUD completo de categorias, carteiras, membros de carteira e transações
- Compartilhamento de carteiras com papéis DONO / EDITOR / VISUALIZADOR,
  com a verificação de permissão feita na camada de serviço
- Filtros e paginação em `GET /transactions` (tipo, categoria, período,
  página, ordenação)
- Tratamento de erros centralizado com `@RestControllerAdvice`
- Envio real de e-mails (cadastro e recuperação de senha) via Thymeleaf +
  Spring Mail

## Decisões de projeto

- **Carteira e categorias padrão no cadastro:** ao criar a conta, o usuário
  já recebe uma carteira principal e categorias pré-populadas
  (Salário, Alimentação, Transporte etc.), para que o dashboard não fique
  vazio no primeiro acesso.
- **Recuperação de senha com código de 6 dígitos** em vez de link com
  token na URL: optei por uma segunda tela de "validar código", com
  reenvio de e-mail real via Gmail SMTP, para simular de forma mais
  realista o fluxo de um produto real.
- **Sem Spring Security por enquanto:** o filtro de autenticação foi
  simulado manualmente (extração do header `Authorization` em cada
  controller) porque o conteúdo de Spring Security/JWT ainda será
  ensinado. A estrutura de DTOs e camadas já foi pensada para facilitar a
  troca por Spring Security + JWT real na próxima entrega.

## Próximos passos (segurança — fora do escopo desta entrega)

- Hash de senha com BCrypt em vez de texto puro
- Spring Security + filtro JWT real (`OncePerRequestFilter`), substituindo
  o token artificial atual
- Restringir CORS às origens reais do frontend em produção (hoje libera
  `*` para facilitar o desenvolvimento)
- Externalizar as configurações de banco/e-mail como variáveis de
  ambiente reais (hoje ficam em `application.properties` /
  `application-secrets.properties`)
