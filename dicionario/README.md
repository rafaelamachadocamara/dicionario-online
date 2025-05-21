📘 Dicionário Web com Angular
Um aplicativo web responsivo e moderno desenvolvido com Angular que permite aos usuários pesquisar palavras e obter informações detalhadas, como definições, sinônimos, antônimos e outros dados linguísticos, por meio de uma API de dicionário.

✨ Funcionalidades
🔍 Pesquisa de palavras em tempo real

📚 Exibição de definições completas

🟢 Sinônimos e 🔴 antônimos listados de forma clara

🧠 Informações adicionais sobre cada palavra (classe gramatical, fonética, etc.)

📱 Interface responsiva e amigável para todos os dispositivos

⚡ Rápido e leve, com carregamento eficiente

🛠️ Tecnologias Utilizadas
Angular 19 – Framework principal

TypeScript – Linguagem de desenvolvimento

RxJS – Programação reativa

Express – Servidor para SSR (Server-side rendering)

Zone.js – Detecção de mudanças

API de Dicionário – Fonte de dados (substitua pela API real utilizada)

🚀 Como Executar o Projeto
1. Pré-requisitos
Node.js v18 ou superior

Angular CLI

2. Instalação
Clone o repositório e instale as dependências:

bash
Copiar
Editar
git clone https://github.com/seu-usuario/dicionario.git
cd dicionario
npm install
3. Rodando o projeto localmente
bash
Copiar
Editar
npm start
Acesse: http://localhost:4200

🌐 SSR (Server-Side Rendering)
Para rodar a versão com renderização no servidor:

bash
Copiar
Editar
npm run build
npm run serve:ssr:dicionario
🧪 Testes
Execute os testes unitários com:

bash
Copiar
Editar
npm test
📁 Estrutura do Projeto
pgsql
Copiar
Editar
dicionario/
├── src/
│   ├── app/
│   │   ├── components/
│   │   ├── services/
│   │   └── pages/
│   ├── assets/
│   └── index.html
├── angular.json
├── package.json
└── tsconfig.json
📦 Scripts Disponíveis
Comando	Descrição
npm start	Inicia o servidor de desenvolvimento
npm run build	Compila o projeto para produção
npm run test	Executa os testes unitários
npm run serve:ssr:dicionario	Inicia o servidor com SSR