# BarberApp - Frontend

## Descrição
Website frontend para aplicativo de barbearia desenvolvido com HTML, CSS e JavaScript puro, baseado no layout fornecido.

## Funcionalidades Implementadas

### Navegação por Abas
- **Home (Deslogado)**: Tela inicial com opções de agendamento e login
- **Login**: Formulário de autenticação com validação
- **Cadastro**: Formulário de registro com todos os campos necessários
- **Esqueci Senha**: Tela para recuperação de senha
- **Agendamento**: Fluxo completo de agendamento incluindo:
  - Seleção de serviço (Corte, Barba, Combo, Sobrancelha, Nevou)
  - Calendário interativo para seleção de data
  - Grade de horários disponíveis
  - Tela de confirmação com resumo do agendamento
- **Contato**: Informações de contato da barbearia

### Características Técnicas
- **Design Responsivo**: Adaptável para desktop e mobile
- **Animações CSS**: Transições suaves e efeitos visuais modernos
- **Validação de Formulários**: Campos obrigatórios e feedback visual
- **Navegação Fluida**: Sistema de abas com JavaScript
- **Interface Moderna**: Gradientes, glassmorphism e sombras

### Estrutura de Arquivos
```
frontend/
├── index.html          # Arquivo principal
├── css/
│   └── style.css      # Estilos CSS
├── js/
│   └── script.js      # Lógica JavaScript
└── assets/
    └── images/        # Imagens do projeto
```

## Como Usar

1. Abra o arquivo `index.html` em um navegador web
2. Navegue pelas diferentes abas usando os botões
3. Teste o fluxo de agendamento completo
4. Todos os formulários possuem validação básica

## Próximos Passos

Para integração com backend:
1. Conectar formulários às APIs
2. Implementar autenticação real
3. Integrar com sistema de agendamento
4. Adicionar notificações e confirmações por email/SMS

## Tecnologias Utilizadas
- HTML5
- CSS3 (Flexbox, Grid, Animations)
- JavaScript ES6+
- Design responsivo
- Glassmorphism UI

