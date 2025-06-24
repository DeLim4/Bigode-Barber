-- Modelo de Banco de Dados para o Bigode Barber App - VERSÃO CORRIGIDA
-- MySQL

-- Criação do banco de dados
CREATE DATABASE IF NOT EXISTS bigode_barber;
USE bigode_barber;

-- Remover tabelas existentes para evitar conflitos (ordem importante devido às foreign keys)
DROP TABLE IF EXISTS agendamento_servicos;
DROP TABLE IF EXISTS recuperacao_senha;
DROP TABLE IF EXISTS agendamentos;
DROP TABLE IF EXISTS servicos;
DROP TABLE IF EXISTS barbeiros;
DROP TABLE IF EXISTS usuarios;

-- Tabela de Usuários
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    telefone VARCHAR(20) NOT NULL,
    senha VARCHAR(255) NOT NULL,
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultima_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de Barbeiros
CREATE TABLE barbeiros (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    telefone VARCHAR(20),
    foto_url VARCHAR(255),
    ativo BOOLEAN DEFAULT TRUE,
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Serviços
CREATE TABLE servicos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL,
    descricao TEXT,
    preco DECIMAL(10, 2) NOT NULL,
    duracao_minutos INT NOT NULL,
    ativo BOOLEAN DEFAULT TRUE
);

-- Tabela de Agendamentos
CREATE TABLE agendamentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    barbeiro_id INT NOT NULL,
    data_agendamento DATE NOT NULL,
    hora_agendamento TIME NOT NULL,
    status ENUM('agendado', 'concluido', 'cancelado') DEFAULT 'agendado',
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultima_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (barbeiro_id) REFERENCES barbeiros(id) ON DELETE CASCADE
);

-- Tabela de relação entre agendamentos e serviços (muitos para muitos)
CREATE TABLE agendamento_servicos (
    agendamento_id INT NOT NULL,
    servico_id INT NOT NULL,
    PRIMARY KEY (agendamento_id, servico_id),
    FOREIGN KEY (agendamento_id) REFERENCES agendamentos(id) ON DELETE CASCADE,
    FOREIGN KEY (servico_id) REFERENCES servicos(id) ON DELETE CASCADE
);

-- Tabela para recuperação de senha
CREATE TABLE recuperacao_senha (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    token VARCHAR(255) NOT NULL,
    data_expiracao TIMESTAMP NOT NULL,
    utilizado BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Inserir dados iniciais para testes (usando INSERT IGNORE para evitar duplicatas)

-- Inserir barbeiro padrão
INSERT IGNORE INTO barbeiros (nome, email, telefone) VALUES 
('Biel', 'biel@bigodecortes.com', '11999999999');

-- Inserir serviços padrão
INSERT IGNORE INTO servicos (nome, descricao, preco, duracao_minutos) VALUES 
('CORTE', 'Corte de cabelo masculino', 35.00, 30),
('BARBA', 'Barba completa com toalha quente', 25.00, 20),
('COMBO', 'Corte + Barba', 55.00, 50),
('SOBRANCELHA', 'Modelagem de sobrancelha', 15.00, 15),
('NEVOU', 'Descoloração de cabelo', 45.00, 40);

-- Inserir usuário de teste
INSERT IGNORE INTO usuarios (nome, email, telefone, senha) VALUES 
('Usuário Teste', 'teste@bigodecortes.com', '11888888888', '$2a$10$example.hash.here');

-- Verificar se as tabelas foram criadas corretamente
SHOW TABLES;

-- Verificar dados inseridos
SELECT 'BARBEIROS' as tabela, COUNT(*) as total FROM barbeiros
UNION ALL
SELECT 'SERVIÇOS' as tabela, COUNT(*) as total FROM servicos
UNION ALL
SELECT 'USUÁRIOS' as tabela, COUNT(*) as total FROM usuarios;

