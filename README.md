# Agenda por Voz — Backend

## Como publicar no Render (passo a passo)

### 1. Criar conta no GitHub
Acesse https://github.com e crie uma conta gratuita.

### 2. Criar repositório
- Clique em "New repository"
- Nome: agendavoz-backend
- Clique em "Create repository"

### 3. Subir os arquivos
Arraste os arquivos para o GitHub:
- server.js
- package.json
- pasta public/ (com index.html dentro)

### 4. Criar conta no Render
Acesse https://render.com e clique em "Get Started for Free"
Pode entrar com a conta do GitHub.

### 5. Criar o serviço
- Clique em "New +" → "Web Service"
- Conecte seu repositório do GitHub
- Configure:
  - Name: agendavoz
  - Runtime: Node
  - Build Command: npm install
  - Start Command: node server.js

### 6. Adicionar sua chave da API
- Vá em "Environment" no painel do Render
- Clique em "Add Environment Variable"
- Key: ANTHROPIC_KEY
- Value: sua chave sk-ant-...

### 7. Publicar
- Clique em "Create Web Service"
- Aguarde 2-3 minutos
- Copie a URL gerada (ex: https://agendavoz.onrender.com)

### 8. Compartilhar
Mande a URL para quem quiser usar!
As pessoas só precisam informar o nome delas — sem chave de API.
