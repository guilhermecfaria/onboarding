# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript and enable type-aware lint rules. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Sistema de Agendamento

Este é um sistema de agendamento desenvolvido com React para o frontend e Node.js/Express para o backend.

## Requisitos

- Node.js (versão 18 ou superior)
- MongoDB (versão 6 ou superior)
- npm ou yarn

## Instalação

1. Clone o repositório:
```bash
git clone [URL_DO_REPOSITORIO]
cd meu-saas
```

2. Instale as dependências do frontend:
```bash
cd src
npm install
```

3. Instale as dependências do backend:
```bash
cd ../backend
npm install
```

4. Configure as variáveis de ambiente:
- Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:
```
MONGODB_URI=sua_url_do_mongodb
JWT_SECRET=seu_secret_jwt
PORT=5000
```

## Executando o Projeto

1. Inicie o servidor backend:
```bash
cd backend
npm start
```

2. Em outro terminal, inicie o frontend:
```bash
cd src
npm run dev
```

3. Acesse o sistema em:
```
http://localhost:5173
```

## Estrutura do Projeto

- `/src` - Código fonte do frontend (React)
- `/backend` - Código fonte do backend (Node.js/Express)
- `/public` - Arquivos estáticos

## Funcionalidades Principais

- Sistema de autenticação
- Agendamento de consultas
- Gerenciamento de clientes
- Calendário interativo
- Dashboard para profissionais
- Interface responsiva

## Suporte

Para suporte ou dúvidas, entre em contato com o administrador do sistema.

### Sistema de Agendamento por Drag-and-Drop

Foi implementado um sistema de agendamento com funcionalidade de arrastar e soltar (drag-and-drop) que permite à secretária agendar atendimentos facilmente:

1. A secretária seleciona um profissional na lista suspensa
2. Os clientes do profissional selecionado são mostrados na lista à direita
3. A secretária pode buscar um cliente específico usando a barra de pesquisa
4. Para agendar um atendimento:
   - Arraste o cliente da lista para o dia desejado no calendário
   - No modal que aparece, confirme ou ajuste a data e hora
   - O agendamento é salvo e aparece no calendário

### Componentes Implementados

- **CalendarioTab**: Exibe o calendário mensal e gerencia a lógica de arrastar e soltar
- **ClienteItem**: Componente para exibir informações do cliente na lista com suporte a arrastar
- **LoadingOverlay**: Componente reutilizável para exibir estado de carregamento

### Integração com Backend

O sistema de agendamento está integrado com o backend através de:

- Carregamento de clientes e profissionais
- Agendamento de próximos atendimentos para clientes
- Sincronização do estado entre os componentes

### Fluxo de Dados

1. Os dados de clientes e profissionais são carregados da API
2. Quando um agendamento é feito, ele é salvo no banco de dados
3. Após o agendamento, o calendário e a lista de clientes são atualizados
4. Quando o profissional ou gerente acessa seu calendário, os agendamentos já estão disponíveis
