# API Bigode Barber - Documentação

## Visão Geral

Esta API fornece todos os endpoints necessários para o funcionamento do aplicativo Bigode Barber, incluindo autenticação de usuários, gerenciamento de agendamentos, serviços e barbeiros.

## Configuração do Ambiente

### Requisitos
- Node.js (v14+)
- MySQL (v5.7+)

### Instalação Local

1. Clone o repositório
```
git clone https://seu-repositorio/bigode-backend.git
cd bigode-backend
```

2. Instale as dependências
```
npm install
```

3. Configure o arquivo `.env` com suas credenciais
```
PORT=3001
DB_HOST=localhost
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
DB_NAME=bigode_barber
JWT_SECRET=sua_chave_secreta
FRONTEND_URL=http://localhost:3000
EMAIL_USER=seu-email@gmail.com
EMAIL_PASS=sua_senha_de_app
```

4. Crie o banco de dados usando o script SQL fornecido
```
mysql -u seu_usuario -p < database_model.sql
```

5. Inicie o servidor
```
npm start
```

### Deploy no Heroku

1. Crie uma conta no Heroku e instale o Heroku CLI

2. Faça login no Heroku CLI
```
heroku login
```

3. Crie um novo aplicativo no Heroku
```
heroku create bigode-barber-api
```

4. Adicione o add-on JawsDB MySQL
```
heroku addons:create jawsdb
```

5. Obtenha a URL de conexão do banco de dados
```
heroku config:get JAWSDB_URL
```

6. Configure as variáveis de ambiente no Heroku
```
heroku config:set JWT_SECRET=sua_chave_secreta
heroku config:set FRONTEND_URL=https://seu-frontend.herokuapp.com
heroku config:set EMAIL_USER=seu-email@gmail.com
heroku config:set EMAIL_PASS=sua_senha_de_app
```

7. Faça deploy da aplicação
```
git push heroku main
```

8. Importe o esquema do banco de dados
```
mysql -u usuario -p -h host -P porta database < database_model.sql
```
(Substitua os valores de acordo com a URL do JawsDB)

## Endpoints da API

### Autenticação

#### Cadastro de Usuário
- **URL**: `/api/cadastro`
- **Método**: `POST`
- **Autenticação**: Não
- **Corpo da Requisição**:
```json
{
  "nome": "Nome do Usuário",
  "email": "usuario@email.com",
  "telefone": "11999999999",
  "senha": "senha123"
}
```
- **Resposta de Sucesso**:
```json
{
  "mensagem": "Usuário cadastrado com sucesso",
  "usuario": {
    "id": 1,
    "nome": "Nome do Usuário",
    "email": "usuario@email.com",
    "telefone": "11999999999"
  }
}
```

#### Login
- **URL**: `/api/login`
- **Método**: `POST`
- **Autenticação**: Não
- **Corpo da Requisição**:
```json
{
  "email": "usuario@email.com",
  "senha": "senha123"
}
```
- **Resposta de Sucesso**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": 1,
    "nome": "Nome do Usuário",
    "email": "usuario@email.com",
    "telefone": "11999999999"
  }
}
```

#### Recuperação de Senha
- **URL**: `/api/recuperar-senha`
- **Método**: `POST`
- **Autenticação**: Não
- **Corpo da Requisição**:
```json
{
  "email": "usuario@email.com"
}
```
- **Resposta de Sucesso**:
```json
{
  "mensagem": "Email de recuperação enviado com sucesso"
}
```

#### Redefinir Senha
- **URL**: `/api/redefinir-senha`
- **Método**: `POST`
- **Autenticação**: Não
- **Corpo da Requisição**:
```json
{
  "token": "token-recebido-por-email",
  "novaSenha": "nova-senha123"
}
```
- **Resposta de Sucesso**:
```json
{
  "mensagem": "Senha redefinida com sucesso"
}
```

#### Verificar Token
- **URL**: `/api/verificar-token`
- **Método**: `GET`
- **Autenticação**: Sim (Bearer Token)
- **Resposta de Sucesso**:
```json
{
  "valido": true,
  "usuario": {
    "id": 1,
    "nome": "Nome do Usuário",
    "email": "usuario@email.com"
  }
}
```

### Barbeiros

#### Listar Barbeiros
- **URL**: `/api/barbeiros`
- **Método**: `GET`
- **Autenticação**: Não
- **Resposta de Sucesso**:
```json
[
  {
    "id": 1,
    "nome": "Biel",
    "email": "biel@bigodecortes.com",
    "telefone": "11999999999",
    "foto_url": null,
    "ativo": 1
  }
]
```

### Serviços

#### Listar Serviços
- **URL**: `/api/servicos`
- **Método**: `GET`
- **Autenticação**: Não
- **Resposta de Sucesso**:
```json
[
  {
    "id": 1,
    "nome": "CORTE",
    "descricao": "Corte de cabelo masculino",
    "preco": 35.00,
    "duracao_minutos": 30,
    "ativo": 1
  },
  {
    "id": 2,
    "nome": "BARBA",
    "descricao": "Barba completa com toalha quente",
    "preco": 25.00,
    "duracao_minutos": 20,
    "ativo": 1
  }
]
```

### Agendamentos

#### Criar Agendamento
- **URL**: `/api/agendamentos`
- **Método**: `POST`
- **Autenticação**: Sim (Bearer Token)
- **Corpo da Requisição**:
```json
{
  "barbeiro_id": 1,
  "data_agendamento": "2025-06-20",
  "hora_agendamento": "14:00",
  "servicos": [1, 2]
}
```
- **Resposta de Sucesso**:
```json
{
  "mensagem": "Agendamento criado com sucesso",
  "agendamento": {
    "id": 1,
    "usuario_id": 1,
    "barbeiro_id": 1,
    "data_agendamento": "2025-06-20",
    "hora_agendamento": "14:00",
    "servicos": [1, 2]
  }
}
```

#### Listar Agendamentos do Usuário
- **URL**: `/api/agendamentos`
- **Método**: `GET`
- **Autenticação**: Sim (Bearer Token)
- **Resposta de Sucesso**:
```json
[
  {
    "id": 1,
    "usuario_id": 1,
    "barbeiro_id": 1,
    "barbeiro_nome": "Biel",
    "data_agendamento": "2025-06-20",
    "hora_agendamento": "14:00:00",
    "status": "agendado",
    "servicos": [
      {
        "id": 1,
        "nome": "CORTE",
        "descricao": "Corte de cabelo masculino",
        "preco": 35.00
      },
      {
        "id": 2,
        "nome": "BARBA",
        "descricao": "Barba completa com toalha quente",
        "preco": 25.00
      }
    ]
  }
]
```

#### Buscar Agendamento Específico
- **URL**: `/api/agendamentos/:id`
- **Método**: `GET`
- **Autenticação**: Sim (Bearer Token)
- **Resposta de Sucesso**:
```json
{
  "id": 1,
  "usuario_id": 1,
  "barbeiro_id": 1,
  "barbeiro_nome": "Biel",
  "data_agendamento": "2025-06-20",
  "hora_agendamento": "14:00:00",
  "status": "agendado",
  "servicos": [
    {
      "id": 1,
      "nome": "CORTE",
      "descricao": "Corte de cabelo masculino",
      "preco": 35.00
    },
    {
      "id": 2,
      "nome": "BARBA",
      "descricao": "Barba completa com toalha quente",
      "preco": 25.00
    }
  ]
}
```

#### Atualizar Agendamento
- **URL**: `/api/agendamentos/:id`
- **Método**: `PUT`
- **Autenticação**: Sim (Bearer Token)
- **Corpo da Requisição**:
```json
{
  "barbeiro_id": 1,
  "data_agendamento": "2025-06-21",
  "hora_agendamento": "15:00",
  "servicos": [1, 3]
}
```
- **Resposta de Sucesso**:
```json
{
  "mensagem": "Agendamento atualizado com sucesso",
  "agendamento": {
    "id": 1,
    "usuario_id": 1,
    "barbeiro_id": 1,
    "data_agendamento": "2025-06-21",
    "hora_agendamento": "15:00",
    "servicos": [1, 3]
  }
}
```

#### Cancelar Agendamento
- **URL**: `/api/agendamentos/:id`
- **Método**: `DELETE`
- **Autenticação**: Sim (Bearer Token)
- **Resposta de Sucesso**:
```json
{
  "mensagem": "Agendamento cancelado com sucesso"
}
```

### Horários Disponíveis

#### Verificar Horários Disponíveis
- **URL**: `/api/horarios-disponiveis?barbeiro_id=1&data=2025-06-20`
- **Método**: `GET`
- **Autenticação**: Não
- **Resposta de Sucesso**:
```json
[
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00"
]
```

### Perfil do Usuário

#### Atualizar Perfil
- **URL**: `/api/perfil`
- **Método**: `PUT`
- **Autenticação**: Sim (Bearer Token)
- **Corpo da Requisição**:
```json
{
  "nome": "Novo Nome",
  "telefone": "11988888888"
}
```
- **Resposta de Sucesso**:
```json
{
  "mensagem": "Perfil atualizado com sucesso",
  "usuario": {
    "id": 1,
    "nome": "Novo Nome",
    "email": "usuario@email.com",
    "telefone": "11988888888"
  }
}
```

#### Alterar Senha
- **URL**: `/api/alterar-senha`
- **Método**: `PUT`
- **Autenticação**: Sim (Bearer Token)
- **Corpo da Requisição**:
```json
{
  "senhaAtual": "senha123",
  "novaSenha": "nova-senha456"
}
```
- **Resposta de Sucesso**:
```json
{
  "mensagem": "Senha alterada com sucesso"
}
```

## Autenticação

A API utiliza autenticação JWT (JSON Web Token). Para acessar endpoints protegidos, você deve incluir o token no cabeçalho da requisição:

```
Authorization: Bearer seu-token-jwt
```

## Integração com o Frontend

Para integrar o frontend com esta API, você precisará:

1. Configurar a URL base da API no frontend
2. Implementar as chamadas de API usando fetch ou axios
3. Armazenar o token JWT após o login (localStorage ou sessionStorage)
4. Incluir o token em todas as requisições autenticadas

### Exemplo de Integração com JavaScript

```javascript
// Configuração
const API_URL = 'https://sua-api.herokuapp.com/api';

// Função para fazer login
async function login(email, senha) {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, senha })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.mensagem || 'Erro ao fazer login');
    }
    
    // Armazenar token e dados do usuário
    localStorage.setItem('token', data.token);
    localStorage.setItem('usuario', JSON.stringify(data.usuario));
    
    return data;
  } catch (error) {
    console.error('Erro de login:', error);
    throw error;
  }
}

// Função para fazer requisições autenticadas
async function fetchAutenticado(url, options = {}) {
  const token = localStorage.getItem('token');
  
  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
  
  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    // Se o token expirou, redirecionar para login
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      window.location.href = '/login';
    }
    
    throw new Error(data.mensagem || 'Erro na requisição');
  }
  
  return data;
}

// Exemplo de uso para criar um agendamento
async function criarAgendamento(dadosAgendamento) {
  return fetchAutenticado('/agendamentos', {
    method: 'POST',
    body: JSON.stringify(dadosAgendamento)
  });
}

// Exemplo de uso para listar agendamentos
async function listarAgendamentos() {
  return fetchAutenticado('/agendamentos');
}
```

## Tratamento de Erros

A API retorna códigos de status HTTP apropriados para cada situação:

- 200: Sucesso
- 201: Recurso criado com sucesso
- 400: Requisição inválida
- 401: Não autorizado (token inválido ou expirado)
- 404: Recurso não encontrado
- 500: Erro interno do servidor

Todas as respostas de erro incluem uma mensagem descritiva no formato:

```json
{
  "mensagem": "Descrição do erro"
}
```

## Suporte

Para dúvidas ou problemas, entre em contato com o desenvolvedor.
