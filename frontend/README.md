# FinançaApp - Controle Financeiro Pessoal e Compartilhado

Aplicação web desenvolvida em React para gerenciamento de finanças pessoais e compartilhadas, com foco em usabilidade, design moderno e alta legibilidade de código.

## 🚀 Tecnologias Utilizadas

- **Vite & React (v19)**: Framework e biblioteca para desenvolvimento ágil da interface.
- **TailwindCSS v4 & Shadcn UI**: Estilização moderna e componentes refinados baseados no tema *Slate/Emerald*.
- **React Router DOM (v7)**: Roteamento dinâmico no cliente (SPA) com proteção de rotas públicas e autenticadas.
- **Recharts**: Visualização de dados financeiros em gráficos interativos e responsivos.
- **Lucide React**: Ícones visuais de alta qualidade.

---

## 🛠️ Funcionalidades Desenvolvidas

### 1. Autenticação e Sessão
- **Tela de Login (`/login`)**: Validação em tempo real, visualização de senha (Eye/EyeOff), tratamento visual de erros de login e exibição de estado de carregamento (*spinner*).
- **Persistência de Sessão**: Utilização do `localStorage` via Context API (`AuthContext.jsx`) para manter a sessão ativa do usuário entre recarregamentos.
- **Proteção de Rotas**: Usuários logados são redirecionados automaticamente para o `/dashboard`. Tentativas de acesso não autenticado a rotas privadas redirecionam para o `/login`.

### 2. Cadastro de Novo Usuário (`/cadastro`)
- Formulário com nome completo, e-mail, senha e confirmação de senha.
- **Indicador Visual de Força da Senha**: Barra reativa em tempo real com 3 níveis (Fraca, Média, Forte).
- **Validação Cross-field**: Comparação imediata das senhas ao sair do campo (`onBlur`).
- Tratamento de duplicidade de e-mail (mock no `localStorage`).

### 3. Fluxo de Recuperação de Senha (2 Etapas)
- **Etapa 1 - Solicitar Recuperação (`/redefinicao-senha/informar-email`)**: Campo de e-mail com resposta neutra de segurança (para evitar engenharia reversa de e-mails cadastrados).
- **Etapa 2 - Validação do Código (`/redefinicao-senha/validacao-codigo`)**: Interface de 6 dígitos alinhados com suporte a colar (*paste*) e navegação automática por teclado.
- **Redefinição de Senha (`/redefinir-senha/:token`)**: Recebe o parâmetro do token via URL com `useParams()`, avalia critérios de força da nova senha e efetua a alteração.

### 4. Área Autenticada
- **Alteração de Senha (`/app/perfil/senha`)**: Exige validação da senha atual antes de autorizar a troca da senha.
- **Dashboard Financeiro (`/dashboard`)**:
  - **Indicadores Numéricos**: Saldo Atual, Receitas e Despesas do mês.
  - **Gráfico Interativo**: Construído com `Recharts` para fluxo de caixa (Receitas vs. Despesas).
  - **Lançamentos Recentes**: Tabela visual com distinção gráfica por cores (Verde/Emerald para Receita, Vermelho/Rose para Despesa).
  - **Simulação de API**: Carregamento assíncrono via `Promise` com indicador de *loading* visual.
  - **Navegação Responsiva & Logout**: Sidebar com menu mobile e botão de encerramento da sessão.

---

## 💻 Instruções de Execução

1. Clone ou acesse o repositório da aplicação:
   ```bash
   cd frontend
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Execute o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

4. Acesse no navegador:
   ```text
   http://localhost:5173
   ```

---

## 🎯 Credenciais para Teste (Mock Inicial)

Caso deseje realizar login diretamente com a conta de testes padrão:
- **E-mail**: `usuario@teste.com`
- **Senha**: `123456User!`

*(Você também pode cadastrar novos usuários pela tela de cadastro!)*
