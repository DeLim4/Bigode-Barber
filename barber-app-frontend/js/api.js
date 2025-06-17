// Configuração da API
const API_URL = 'http://localhost:3001/api';

// Função para fazer login
async function login(email, senha ) {
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

// Função para cadastrar usuário
async function cadastrar(nome, email, telefone, senha) {
  try {
    const response = await fetch(`${API_URL}/cadastro`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ nome, email, telefone, senha })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.mensagem || 'Erro ao cadastrar');
    }
    
    return data;
  } catch (error) {
    console.error('Erro de cadastro:', error);
    throw error;
  }
}

// Função para recuperar senha
async function recuperarSenha(email) {
  try {
    const response = await fetch(`${API_URL}/recuperar-senha`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.mensagem || 'Erro ao recuperar senha');
    }
    
    return data;
  } catch (error) {
    console.error('Erro ao recuperar senha:', error);
    throw error;
  }
}

// Função para fazer requisições autenticadas
async function fetchAutenticado(url, options = {}) {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Usuário não autenticado');
  }
  
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
      // Redirecionar para login
      window.appInstance.loadTab('login');
    }
    
    throw new Error(data.mensagem || 'Erro na requisição');
  }
  
  return data;
}

// Funções para agendamentos
async function listarBarbeiros() {
  return fetch(`${API_URL}/barbeiros`).then(res => res.json());
}

async function listarServicos() {
  return fetch(`${API_URL}/servicos`).then(res => res.json());
}

async function verificarHorariosDisponiveis(barbeiro_id, data) {
  return fetch(`${API_URL}/horarios-disponiveis?barbeiro_id=${barbeiro_id}&data=${data}`).then(res => res.json());
}

async function criarAgendamento(dados) {
  return fetchAutenticado('/agendamentos', {
    method: 'POST',
    body: JSON.stringify(dados)
  });
}

async function listarAgendamentos() {
  return fetchAutenticado('/agendamentos');
}

async function cancelarAgendamento(id) {
  return fetchAutenticado(`/agendamentos/${id}`, {
    method: 'DELETE'
  });
}

// Exportar todas as funções
window.api = {
  login,
  cadastrar,
  recuperarSenha,
  listarBarbeiros,
  listarServicos,
  verificarHorariosDisponiveis,
  criarAgendamento,
  listarAgendamentos,
  cancelarAgendamento,
  fetchAutenticado
};
