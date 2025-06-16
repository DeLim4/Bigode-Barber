require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// Inicialização do app Express
const app = express();
app.use(express.json());
app.use(cors());

// Configuração do banco de dados
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'bigode_barber',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Criação do pool de conexões
const pool = mysql.createPool(dbConfig);

// Middleware para verificar o token JWT
const verificarToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ mensagem: 'Token não fornecido' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'bigode_secret_key');
    req.usuario = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ mensagem: 'Token inválido' });
  }
};

// Configuração do nodemailer para envio de emails
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'seu-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'sua-senha-de-app'
  }
});

// Rotas de autenticação
app.post('/api/cadastro', async (req, res) => {
  try {
    const { nome, email, telefone, senha } = req.body;
    
    // Verificar se o email já está cadastrado
    const [usuarios] = await pool.execute('SELECT * FROM usuarios WHERE email = ?', [email]);
    
    if (usuarios.length > 0) {
      return res.status(400).json({ mensagem: 'Email já cadastrado' });
    }
    
    // Hash da senha
    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(senha, salt);
    
    // Inserir usuário no banco
    const [result] = await pool.execute(
      'INSERT INTO usuarios (nome, email, telefone, senha) VALUES (?, ?, ?, ?)',
      [nome, email, telefone, senhaHash]
    );
    
    res.status(201).json({ 
      mensagem: 'Usuário cadastrado com sucesso',
      usuario: { id: result.insertId, nome, email, telefone }
    });
  } catch (error) {
    console.error('Erro ao cadastrar usuário:', error);
    res.status(500).json({ mensagem: 'Erro ao cadastrar usuário' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, senha } = req.body;
    
    // Buscar usuário pelo email
    const [usuarios] = await pool.execute('SELECT * FROM usuarios WHERE email = ?', [email]);
    
    if (usuarios.length === 0) {
      return res.status(401).json({ mensagem: 'Email ou senha incorretos' });
    }
    
    const usuario = usuarios[0];
    
    // Verificar senha
    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
    
    if (!senhaCorreta) {
      return res.status(401).json({ mensagem: 'Email ou senha incorretos' });
    }
    
    // Gerar token JWT
    const token = jwt.sign(
      { id: usuario.id, nome: usuario.nome, email: usuario.email },
      process.env.JWT_SECRET || 'bigode_secret_key',
      { expiresIn: '24h' }
    );
    
    res.json({
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        telefone: usuario.telefone
      }
    });
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(500).json({ mensagem: 'Erro ao fazer login' });
  }
});

app.post('/api/recuperar-senha', async (req, res) => {
  try {
    const { email } = req.body;
    
    // Verificar se o email existe
    const [usuarios] = await pool.execute('SELECT * FROM usuarios WHERE email = ?', [email]);
    
    if (usuarios.length === 0) {
      return res.status(404).json({ mensagem: 'Email não encontrado' });
    }
    
    const usuario = usuarios[0];
    
    // Gerar token de recuperação
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email },
      process.env.JWT_SECRET || 'bigode_secret_key',
      { expiresIn: '1h' }
    );
    
    // Salvar token no banco
    const dataExpiracao = new Date();
    dataExpiracao.setHours(dataExpiracao.getHours() + 1);
    
    await pool.execute(
      'INSERT INTO recuperacao_senha (usuario_id, token, data_expiracao) VALUES (?, ?, ?)',
      [usuario.id, token, dataExpiracao]
    );
    
    // Enviar email com link de recuperação
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/redefinir-senha?token=${token}`;
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'seu-email@gmail.com',
      to: email,
      subject: 'Recuperação de Senha - Bigode Cortes',
      html: `
        <h1>Recuperação de Senha</h1>
        <p>Olá ${usuario.nome},</p>
        <p>Você solicitou a recuperação de senha. Clique no link abaixo para redefinir sua senha:</p>
        <a href="${resetLink}">Redefinir Senha</a>
        <p>Este link expira em 1 hora.</p>
        <p>Se você não solicitou esta recuperação, ignore este email.</p>
      `
    };
    
    // Simulação de envio de email (em produção, descomentar a linha abaixo)
    // await transporter.sendMail(mailOptions);
    
    res.json({ mensagem: 'Email de recuperação enviado com sucesso' });
  } catch (error) {
    console.error('Erro ao recuperar senha:', error);
    res.status(500).json({ mensagem: 'Erro ao processar recuperação de senha' });
  }
});

app.post('/api/redefinir-senha', async (req, res) => {
  try {
    const { token, novaSenha } = req.body;
    
    // Verificar token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'bigode_secret_key');
    } catch (error) {
      return res.status(401).json({ mensagem: 'Token inválido ou expirado' });
    }
    
    // Verificar se o token existe no banco e não foi utilizado
    const [tokens] = await pool.execute(
      'SELECT * FROM recuperacao_senha WHERE token = ? AND utilizado = 0 AND data_expiracao > NOW()',
      [token]
    );
    
    if (tokens.length === 0) {
      return res.status(401).json({ mensagem: 'Token inválido ou expirado' });
    }
    
    // Hash da nova senha
    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(novaSenha, salt);
    
    // Atualizar senha do usuário
    await pool.execute(
      'UPDATE usuarios SET senha = ? WHERE id = ?',
      [senhaHash, decoded.id]
    );
    
    // Marcar token como utilizado
    await pool.execute(
      'UPDATE recuperacao_senha SET utilizado = 1 WHERE token = ?',
      [token]
    );
    
    res.json({ mensagem: 'Senha redefinida com sucesso' });
  } catch (error) {
    console.error('Erro ao redefinir senha:', error);
    res.status(500).json({ mensagem: 'Erro ao redefinir senha' });
  }
});

// Rotas de barbeiros
app.get('/api/barbeiros', async (req, res) => {
  try {
    const [barbeiros] = await pool.execute('SELECT * FROM barbeiros WHERE ativo = 1');
    res.json(barbeiros);
  } catch (error) {
    console.error('Erro ao buscar barbeiros:', error);
    res.status(500).json({ mensagem: 'Erro ao buscar barbeiros' });
  }
});

// Rotas de serviços
app.get('/api/servicos', async (req, res) => {
  try {
    const [servicos] = await pool.execute('SELECT * FROM servicos WHERE ativo = 1');
    res.json(servicos);
  } catch (error) {
    console.error('Erro ao buscar serviços:', error);
    res.status(500).json({ mensagem: 'Erro ao buscar serviços' });
  }
});

// Rotas de agendamentos (protegidas por autenticação)
app.post('/api/agendamentos', verificarToken, async (req, res) => {
  try {
    const { barbeiro_id, data_agendamento, hora_agendamento, servicos } = req.body;
    const usuario_id = req.usuario.id;
    
    // Verificar se o horário está disponível
    const [agendamentosExistentes] = await pool.execute(
      'SELECT * FROM agendamentos WHERE barbeiro_id = ? AND data_agendamento = ? AND hora_agendamento = ? AND status = "agendado"',
      [barbeiro_id, data_agendamento, hora_agendamento]
    );
    
    if (agendamentosExistentes.length > 0) {
      return res.status(400).json({ mensagem: 'Horário já agendado' });
    }
    
    // Iniciar transação
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // Inserir agendamento
      const [result] = await connection.execute(
        'INSERT INTO agendamentos (usuario_id, barbeiro_id, data_agendamento, hora_agendamento) VALUES (?, ?, ?, ?)',
        [usuario_id, barbeiro_id, data_agendamento, hora_agendamento]
      );
      
      const agendamento_id = result.insertId;
      
      // Inserir serviços do agendamento
      for (const servico_id of servicos) {
        await connection.execute(
          'INSERT INTO agendamento_servicos (agendamento_id, servico_id) VALUES (?, ?)',
          [agendamento_id, servico_id]
        );
      }
      
      // Commit da transação
      await connection.commit();
      
      res.status(201).json({
        mensagem: 'Agendamento criado com sucesso',
        agendamento: {
          id: agendamento_id,
          usuario_id,
          barbeiro_id,
          data_agendamento,
          hora_agendamento,
          servicos
        }
      });
    } catch (error) {
      // Rollback em caso de erro
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Erro ao criar agendamento:', error);
    res.status(500).json({ mensagem: 'Erro ao criar agendamento' });
  }
});

app.get('/api/agendamentos', verificarToken, async (req, res) => {
  try {
    const usuario_id = req.usuario.id;
    
    // Buscar agendamentos do usuário
    const [agendamentos] = await pool.execute(`
      SELECT a.*, b.nome as barbeiro_nome
      FROM agendamentos a
      JOIN barbeiros b ON a.barbeiro_id = b.id
      WHERE a.usuario_id = ?
      ORDER BY a.data_agendamento DESC, a.hora_agendamento DESC
    `, [usuario_id]);
    
    // Buscar serviços de cada agendamento
    for (const agendamento of agendamentos) {
      const [servicos] = await pool.execute(`
        SELECT s.*
        FROM agendamento_servicos as_rel
        JOIN servicos s ON as_rel.servico_id = s.id
        WHERE as_rel.agendamento_id = ?
      `, [agendamento.id]);
      
      agendamento.servicos = servicos;
    }
    
    res.json(agendamentos);
  } catch (error) {
    console.error('Erro ao buscar agendamentos:', error);
    res.status(500).json({ mensagem: 'Erro ao buscar agendamentos' });
  }
});

app.get('/api/agendamentos/:id', verificarToken, async (req, res) => {
  try {
    const { id } = req.params;
    const usuario_id = req.usuario.id;
    
    // Buscar agendamento específico
    const [agendamentos] = await pool.execute(`
      SELECT a.*, b.nome as barbeiro_nome
      FROM agendamentos a
      JOIN barbeiros b ON a.barbeiro_id = b.id
      WHERE a.id = ? AND a.usuario_id = ?
    `, [id, usuario_id]);
    
    if (agendamentos.length === 0) {
      return res.status(404).json({ mensagem: 'Agendamento não encontrado' });
    }
    
    const agendamento = agendamentos[0];
    
    // Buscar serviços do agendamento
    const [servicos] = await pool.execute(`
      SELECT s.*
      FROM agendamento_servicos as_rel
      JOIN servicos s ON as_rel.servico_id = s.id
      WHERE as_rel.agendamento_id = ?
    `, [id]);
    
    agendamento.servicos = servicos;
    
    res.json(agendamento);
  } catch (error) {
    console.error('Erro ao buscar agendamento:', error);
    res.status(500).json({ mensagem: 'Erro ao buscar agendamento' });
  }
});

app.put('/api/agendamentos/:id', verificarToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { barbeiro_id, data_agendamento, hora_agendamento, servicos } = req.body;
    const usuario_id = req.usuario.id;
    
    // Verificar se o agendamento existe e pertence ao usuário
    const [agendamentos] = await pool.execute(
      'SELECT * FROM agendamentos WHERE id = ? AND usuario_id = ?',
      [id, usuario_id]
    );
    
    if (agendamentos.length === 0) {
      return res.status(404).json({ mensagem: 'Agendamento não encontrado' });
    }
    
    // Verificar se o novo horário está disponível (excluindo o próprio agendamento)
    const [agendamentosExistentes] = await pool.execute(
      'SELECT * FROM agendamentos WHERE barbeiro_id = ? AND data_agendamento = ? AND hora_agendamento = ? AND status = "agendado" AND id != ?',
      [barbeiro_id, data_agendamento, hora_agendamento, id]
    );
    
    if (agendamentosExistentes.length > 0) {
      return res.status(400).json({ mensagem: 'Horário já agendado' });
    }
    
    // Iniciar transação
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // Atualizar agendamento
      await connection.execute(
        'UPDATE agendamentos SET barbeiro_id = ?, data_agendamento = ?, hora_agendamento = ? WHERE id = ?',
        [barbeiro_id, data_agendamento, hora_agendamento, id]
      );
      
      // Remover serviços antigos
      await connection.execute(
        'DELETE FROM agendamento_servicos WHERE agendamento_id = ?',
        [id]
      );
      
      // Inserir novos serviços
      for (const servico_id of servicos) {
        await connection.execute(
          'INSERT INTO agendamento_servicos (agendamento_id, servico_id) VALUES (?, ?)',
          [id, servico_id]
        );
      }
      
      // Commit da transação
      await connection.commit();
      
      res.json({
        mensagem: 'Agendamento atualizado com sucesso',
        agendamento: {
          id: parseInt(id),
          usuario_id,
          barbeiro_id,
          data_agendamento,
          hora_agendamento,
          servicos
        }
      });
    } catch (error) {
      // Rollback em caso de erro
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Erro ao atualizar agendamento:', error);
    res.status(500).json({ mensagem: 'Erro ao atualizar agendamento' });
  }
});

app.delete('/api/agendamentos/:id', verificarToken, async (req, res) => {
  try {
    const { id } = req.params;
    const usuario_id = req.usuario.id;
    
    // Verificar se o agendamento existe e pertence ao usuário
    const [agendamentos] = await pool.execute(
      'SELECT * FROM agendamentos WHERE id = ? AND usuario_id = ?',
      [id, usuario_id]
    );
    
    if (agendamentos.length === 0) {
      return res.status(404).json({ mensagem: 'Agendamento não encontrado' });
    }
    
    // Atualizar status para cancelado em vez de excluir
    await pool.execute(
      'UPDATE agendamentos SET status = "cancelado" WHERE id = ?',
      [id]
    );
    
    res.json({ mensagem: 'Agendamento cancelado com sucesso' });
  } catch (error) {
    console.error('Erro ao cancelar agendamento:', error);
    res.status(500).json({ mensagem: 'Erro ao cancelar agendamento' });
  }
});

// Rota para verificar horários disponíveis
app.get('/api/horarios-disponiveis', async (req, res) => {
  try {
    const { barbeiro_id, data } = req.query;
    
    if (!barbeiro_id || !data) {
      return res.status(400).json({ mensagem: 'Barbeiro e data são obrigatórios' });
    }
    
    // Horários padrão disponíveis
    const horariosDisponiveis = [
      '08:00', '09:00', '10:00', '11:00', 
      '14:00', '15:00', '16:00', '17:00', 
      '18:00', '19:00'
    ];
    
    // Buscar horários já agendados
    const [agendamentosExistentes] = await pool.execute(
      'SELECT hora_agendamento FROM agendamentos WHERE barbeiro_id = ? AND data_agendamento = ? AND status = "agendado"',
      [barbeiro_id, data]
    );
    
    // Filtrar horários ocupados
    const horariosOcupados = agendamentosExistentes.map(a => a.hora_agendamento.slice(0, 5));
    const horariosLivres = horariosDisponiveis.filter(h => !horariosOcupados.includes(h));
    
    res.json(horariosLivres);
  } catch (error) {
    console.error('Erro ao buscar horários disponíveis:', error);
    res.status(500).json({ mensagem: 'Erro ao buscar horários disponíveis' });
  }
});

// Rota para atualizar perfil do usuário
app.put('/api/perfil', verificarToken, async (req, res) => {
  try {
    const { nome, telefone } = req.body;
    const usuario_id = req.usuario.id;
    
    await pool.execute(
      'UPDATE usuarios SET nome = ?, telefone = ? WHERE id = ?',
      [nome, telefone, usuario_id]
    );
    
    res.json({
      mensagem: 'Perfil atualizado com sucesso',
      usuario: {
        id: usuario_id,
        nome,
        email: req.usuario.email,
        telefone
      }
    });
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({ mensagem: 'Erro ao atualizar perfil' });
  }
});

// Rota para alterar senha
app.put('/api/alterar-senha', verificarToken, async (req, res) => {
  try {
    const { senhaAtual, novaSenha } = req.body;
    const usuario_id = req.usuario.id;
    
    // Buscar usuário
    const [usuarios] = await pool.execute('SELECT * FROM usuarios WHERE id = ?', [usuario_id]);
    
    if (usuarios.length === 0) {
      return res.status(404).json({ mensagem: 'Usuário não encontrado' });
    }
    
    const usuario = usuarios[0];
    
    // Verificar senha atual
    const senhaCorreta = await bcrypt.compare(senhaAtual, usuario.senha);
    
    if (!senhaCorreta) {
      return res.status(401).json({ mensagem: 'Senha atual incorreta' });
    }
    
    // Hash da nova senha
    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(novaSenha, salt);
    
    // Atualizar senha
    await pool.execute(
      'UPDATE usuarios SET senha = ? WHERE id = ?',
      [senhaHash, usuario_id]
    );
    
    res.json({ mensagem: 'Senha alterada com sucesso' });
  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    res.status(500).json({ mensagem: 'Erro ao alterar senha' });
  }
});

// Rota para verificar se o token é válido
app.get('/api/verificar-token', verificarToken, (req, res) => {
  res.json({
    valido: true,
    usuario: {
      id: req.usuario.id,
      nome: req.usuario.nome,
      email: req.usuario.email
    }
  });
});

// Rota para teste de conexão
app.get('/api/status', (req, res) => {
  res.json({ status: 'online', mensagem: 'API Bigode Barber funcionando!' });
});

// Iniciar o servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
