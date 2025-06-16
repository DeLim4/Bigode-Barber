// Classe para gerenciar as abas da aplicação

class BarberApp {
    constructor() {
        this.app = document.getElementById("app");
        this.currentTab = "home-deslogado";
        this.selectedServices = [];
        this.selectedBarber = null;
        this.selectedDate = null;
        this.selectedHour = null;
        this.isLoggedIn = false; // Controle de estado de login
        this.userName = "Usuário"; // Nome do usuário logado
        this.init();

        // Inicializar EmailJS
        this.initEmailJS();
    }

    init() {
        // Torna as funções globais para serem acessíveis pelos botões HTML
        window.loadTab = this.loadTab.bind(this);
        window.goBack = this.goBack.bind(this);
        window.toggleService = this.toggleService.bind(this);
        window.selectBarber = this.selectBarber.bind(this);
        window.selectDate = this.selectDate.bind(this);
        window.selectHour = this.selectHour.bind(this);
        window.sendPasswordRecoveryEmail = this.sendPasswordRecoveryEmail.bind(this); // se for chamada direta
        window.loadUserProfile = this.loadUserProfile.bind(this); // Nova função para carregar perfil

        // Carrega a aba inicial
        this.loadTab("home-deslogado");
    }

    // Inicializar EmailJS com seu Public Key
    initEmailJS() {
        emailjs.init("sPePZVcNEuuxnF3uC"); // substitua pelo seu Public Key
    }

    // Função para enviar email de recuperação de senha
    sendPasswordRecoveryEmail(email, link) {
        return emailjs.send("service_46lfx7j", "template_2098f09", {
            to_email: email,
            message: `Você solicitou a recuperação de senha no Bigode Cortes.\nClique no link abaixo para redefinir sua senha:\n\n${link}`
        }).then((response) => {
            console.log("E-mail enviado com sucesso:", response);
        }).catch((error) => {
            console.error("Erro ao enviar e-mail:", error);
        });
    }

    // Função para carregar o conteúdo das abas
    loadTab(tabName) {
        this.currentTab = tabName;
        let content = "";

        switch (tabName) {
            case "home-deslogado":
                content = this.getHomeDeslogadoContent();
                break;
            case "home-logado":
                content = this.getHomeLogadoContent();
                break;
            case "perfil-usuario":
                content = this.getPerfilUsuarioContent();
                break;
            case "login":
                content = this.getLoginContent();
                break;
            case "cadastro":
                content = this.getCadastroContent();
                break;
            case "esqueci-senha":
                content = this.getEsqueciSenhaContent();
                break;
            case "email-enviado":
                content = this.getEmailEnviadoContent();
                break;
            case "agendar-horario":
                content = this.getAgendarHorarioContent();
                break;
            case "selecionar-servico":
                content = this.getSelecionarServicoContent();
                break;
            case "selecionar-barbeiro":
                content = this.getSelecionarBarbeiroContent();
                break;
            case "selecionar-data":
                content = this.getSelecionarDataContent();
                break;
            case "selecionar-horario":
                content = this.getSelecionarHorarioContent();
                break;
            case "confirmacao":
                content = this.getConfirmacaoContent();
                break;
            case "agendamento-confirmado":
                content = this.getAgendamentoConfirmadoContent();
                break;
            case "contato":
                content = this.getContatoContent();
                break;
            default:
                content = this.getNotFoundContent();
        }

        this.app.innerHTML = content;
        this.addEventListeners();
    }

    // Função para carregar o perfil do usuário
    loadUserProfile() {
        this.loadTab("perfil-usuario");
    }

    // Função para voltar à tela anterior
    goBack() {
        // Lógica para voltar à tela anterior, pode ser mais complexa com histórico
        if (this.isLoggedIn) {
            this.loadTab("home-logado");
        } else {
            this.loadTab("home-deslogado");
        }
    }

    // Adiciona event listeners após carregar o conteúdo
    addEventListeners() {
        const forms = document.querySelectorAll("form");
        forms.forEach((form) => {
            form.addEventListener("submit", (e) => {
                e.preventDefault();
                this.handleFormSubmit(form);
            });
        });
        

        // Adicionar lógica para seleção de múltiplos serviços
        if (this.currentTab === "selecionar-servico") {
            const servicoButtons = document.querySelectorAll(".btn-servico");
            servicoButtons.forEach(button => {
                if (this.selectedServices.includes(button.dataset.servico)) {
                    button.classList.add("selected");
                }
            });
        }

        // Adicionar lógica para seleção de barbeiro
        if (this.currentTab === "selecionar-barbeiro") {
            const barberCards = document.querySelectorAll(".barbeiro-card");
            barberCards.forEach(card => {
                if (this.selectedBarber === card.dataset.barber) {
                    card.classList.add("selected");
                }
            });
        }
        
        // Adicionar lógica para seleção de data
        if (this.currentTab === "selecionar-data") {
            this.initCalendar();
        }
        
        // Adicionar lógica para seleção de horário
        if (this.currentTab === "selecionar-horario") {
            const horarioButtons = document.querySelectorAll(".btn-horario");
            horarioButtons.forEach(button => {
                if (this.selectedHour === button.textContent) {
                    button.classList.add("selected");
                }
                
                // Corrigido: Adicionando evento de clique diretamente aqui
                button.addEventListener("click", () => {
                    this.selectHour(button.textContent);
                    
                    // Atualizar visualmente a seleção
                    horarioButtons.forEach(btn => btn.classList.remove('selected'));
                    button.classList.add('selected');
                    
                    // Habilitar o botão de continuar
                    const continueBtn = document.querySelector('#selecionar-horario .btn-primary');
                    if (continueBtn) {
                        continueBtn.removeAttribute('disabled');
                    }
                });
            });
        }
    }

    // Manipula o envio de formulários
    handleFormSubmit(form) {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);

        console.log("Dados do formulário:", data);

        const submitBtn = form.querySelector('.btn-primary[type="submit"]');
        if (submitBtn) {
            const originalText = submitBtn.textContent;
            submitBtn.innerHTML = "Enviando...";
            submitBtn.disabled = true;

            // Verificar qual formulário está sendo enviado
            if (form.id === "esqueci-senha-form") {
                // Enviar email de recuperação de senha
                this.sendPasswordRecoveryEmail(data.email)
                    .then(() => {
                        // Redirecionar para a tela de confirmação de email enviado
                        this.loadTab("email-enviado");
                    })
                    .catch(error => {
                        console.error("Erro ao enviar email:", error);
                        alert("Erro ao enviar email. Por favor, tente novamente.");
                        submitBtn.textContent = originalText;
                        submitBtn.disabled = false;
                    });
            } else if (form.id === "login-form") {
                // Simulação de login bem-sucedido
                setTimeout(() => {
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                    this.isLoggedIn = true; // Atualiza o estado de login
                    this.loadTab("home-logado"); // Redireciona para a home logada
                }, 2000);
            } else {
                // Outros formulários
                setTimeout(() => {
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                }, 2000);
            }
        }
    }

    // Função para selecionar/desselecionar serviços
    toggleService(serviceName) {
        const index = this.selectedServices.indexOf(serviceName);
        if (index > -1) {
            this.selectedServices.splice(index, 1); // Remover
        } else {
            this.selectedServices.push(serviceName); // Adicionar
        }
        this.loadTab("selecionar-servico"); // Recarrega a aba para atualizar a seleção visual
    }

    // Função para selecionar barbeiro
    selectBarber(barberName) {
        this.selectedBarber = barberName;
        this.loadTab("selecionar-barbeiro"); // Recarrega a aba para atualizar a seleção visual
    }
    
    // Função para selecionar data
    selectDate(date) {
        this.selectedDate = date;
        
        // Remover seleção anterior
        const allDays = document.querySelectorAll('.dia');
        allDays.forEach(day => {
            day.classList.remove('selected');
        });
        
        // Adicionar seleção ao dia clicado
        const clickedDay = document.querySelector(`.dia[data-date="${date}"]`);
        if (clickedDay) {
            clickedDay.classList.add('selected');
        }
        
        // Habilitar o botão de continuar
        const continueBtn = document.querySelector('#selecionar-data .btn-primary');
        if (continueBtn) {
            continueBtn.removeAttribute('disabled');
        }
    }
    
    // Função para selecionar horário
    selectHour(hour) {
        this.selectedHour = hour;
    }
    
    // Inicializar o calendário com o mês atual
    initCalendar() {
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        
        this.renderCalendar(currentMonth, currentYear);
        
        // Adicionar event listeners para navegação do calendário
        const prevMonthBtn = document.querySelector('.btn-prev-month');
        const nextMonthBtn = document.querySelector('.btn-next-month');
        
        if (prevMonthBtn && nextMonthBtn) {
            prevMonthBtn.addEventListener('click', () => {
                const monthYearText = document.querySelector('.mes-ano-text').textContent;
                const [month, year] = this.parseMonthYear(monthYearText);
                
                let newMonth = month - 1;
                let newYear = year;
                
                if (newMonth < 0) {
                    newMonth = 11;
                    newYear--;
                }
                
                this.renderCalendar(newMonth, newYear);
            });
            
            nextMonthBtn.addEventListener('click', () => {
                const monthYearText = document.querySelector('.mes-ano-text').textContent;
                const [month, year] = this.parseMonthYear(monthYearText);
                
                let newMonth = month + 1;
                let newYear = year;
                
                if (newMonth > 11) {
                    newMonth = 0;
                    newYear++;
                }
                
                this.renderCalendar(newMonth, newYear);
            });
        }
    }
    
    // Renderizar o calendário para um mês específico
    renderCalendar(month, year) {
        const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        
        // Atualizar texto do mês e ano
        const monthYearText = document.querySelector('.mes-ano-text');
        if (monthYearText) {
            monthYearText.textContent = `${monthNames[month]} ${year}`;
        }
        
        // Gerar os dias do calendário
        let daysHTML = '';
        
        // Espaços em branco para os dias antes do primeiro dia do mês
        for (let i = 0; i < firstDayOfMonth; i++) {
            daysHTML += '<div class="dia empty"></div>';
        }
        
        // Dias do mês
        for (let i = 1; i <= daysInMonth; i++) {
            const date = `${year}-${(month + 1).toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`;
            const isSelected = date === this.selectedDate ? 'selected' : '';
            daysHTML += `<div class="dia ${isSelected}" data-date="${date}">${i}</div>`;
        }
        
        // Atualizar o conteúdo do calendário
        const diasMesElement = document.querySelector('.dias-mes');
        if (diasMesElement) {
            diasMesElement.innerHTML = daysHTML;
            
            // Adicionar event listeners aos dias após renderizar
            const dias = diasMesElement.querySelectorAll('.dia:not(.empty)');
            dias.forEach(dia => {
                dia.addEventListener('click', () => {
                    const date = dia.getAttribute('data-date');
                    this.selectDate(date);
                });
            });
        }
    }
    
    // Converter texto de mês e ano para números
    parseMonthYear(monthYearText) {
        const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
        const parts = monthYearText.split(' ');
        const month = monthNames.indexOf(parts[0]);
        const year = parseInt(parts[1]);
        
        return [month, year];
    }

    // Conteúdo da tela inicial (deslogado)
    getHomeDeslogadoContent() {
        return `
            <div class="tab-content active" id="home-deslogado">
                <!-- Botão Entrar no canto superior esquerdo -->
                <button class="btn-entrar" onclick="loadTab('login')">Entrar</button>
                
                <!-- Ícone Instagram no canto superior direito -->
                <div class="instagram-icon"><a href="https://www.instagram.com/gabriel_lima20/"><img src="assets/images/instagram-new2.png" alt="Instagram"></a></div>
                
                <!-- Logo circular -->
                <div class="logo">
                    <img src="assets/images/logo-bigode-new.png" alt="Logo Bigode Cortes">
                </div>
                
                <!-- Ilustração do barbeiro -->
                <img src="assets/images/vetor-home.png" alt="Ilustração Barbeiro" class="illustration">
                
                <!-- texto -->
                <p>Um novo conceito em barbearia</p>
                
                <!-- Botão principal de agendamento -->
                <button class="btn-primary" onclick="loadTab('login')">Agende seu horário</button>
                
                <!-- Texto de rodapé -->
                <p class="footer-text">Todos os direitos reservados *BigodeCortes</p>
                
                <!-- Botão de contato -->
                <button class="btn-contato" onclick="loadTab('contato')">Contato</button>
            </div>
        `;
    }

    // Conteúdo da tela inicial (logado)
    getHomeLogadoContent() {
        return `
            <div class="tab-content active" id="home-logado">
                <!-- Ícone de perfil no canto superior esquerdo -->
                <div class="user-icon" onclick="loadUserProfile()">
                    <img src="assets/images/cara.png" alt="Perfil">
                </div>
                
                <!-- Ícone Instagram no canto superior direito -->
                <div class="instagram-icon"><img src="assets/images/instagram-new2.png" alt="Instagram"></div>
                
                <!-- Logo circular -->
                <div class="logo">
                    <img src="assets/images/logo-bigode-new.png" alt="Logo Bigode Cortes">
                </div>
                
                <!-- Ilustração do barbeiro -->
                <img src="assets/images/vetor-home.png" alt="Ilustração Barbeiro" class="illustration">
                
                <!-- texto -->
                <p>Um novo conceito em barbearia</p>
                
                <!-- Botão principal de agendamento -->
                <button class="btn-primary" onclick="loadTab('selecionar-servico')">Agende seu horário</button>
                
                <!-- Texto de rodapé -->
                <p class="footer-text">Todos os direitos reservados *BigodeCortes</p>
                
                <!-- Botão de contato -->
                <button class="btn-contato" onclick="loadTab('contato')">Contato</button>
            </div>
        `;
    }

    // Conteúdo da tela de perfil do usuário
    getPerfilUsuarioContent() {
        return `
            <div class="tab-content active" id="perfil-usuario">
                <div class="form-container">
                   
                    
                    <!-- Botão voltar no canto superior esquerdo -->
                    <button class="btn-voltar-perfil" onclick="goBack()">
                        <img src="assets/images/back-icon.png" alt="Voltar">
                    </button>
                    
                    <!-- Ícone Instagram no canto superior direito -->
                    <div class="instagram-icon-perfil">
                        <img src="assets/images/instagram-new2.png" alt="Instagram">
                    </div>
                    
                    <!-- Logo circular -->
                    <div class="logo">
                        <img src="assets/images/logo-bigode-new.png" alt="Logo Bigode Cortes">
                    </div>
                    
                    <!-- Saudação ao usuário -->
                    <h2 class="saudacao">Olá, ${this.userName}</h2>
                    
                    <!-- Opções do perfil -->
                    <div class="opcoes-perfil">
                        <button class="btn-opcao-perfil" onclick="loadTab('agendamentos')">Seus agendamentos</button>
                        <button class="btn-opcao-perfil" onclick="loadTab('informacoes')">Suas informações</button>
                        <button class="btn-opcao-perfil" onclick="loadTab('redefinir-senha')">Redefinir senha</button>
                        <button class="btn-opcao-perfil" onclick="loadTab('feedback')">Enviar um feedback</button>
                    </div>
                    
                    <!-- Texto de rodapé -->
                    <p class="footer-text">Todos os direitos reservados *Tbarbershop</p>
                    
                    <!-- Botão de contato -->
                    <button class="btn-contato" onclick="loadTab('contato')">Contato</button>
                </div>
            </div>
        `;
    }

    // Conteúdo da tela de login
    getLoginContent() {
        return `
            <div class="tab-content active" id="login">
                <div class="form-container">
                    <!-- Botão voltar no canto superior esquerdo -->
                    <button class="btn-voltar-perfil" onclick="goBack()">
                        <img src="assets/images/back-icon.png" alt="Voltar">
                    </button>
                    
                    <!-- Logo -->
                    <div class="logo">
                        <img src="assets/images/logo-bigode-new.png" alt="Logo Bigode Cortes">
                    </div>
                    
                    <h2>Entre agora</h2>
                    
                    <form id="login-form">
                        <div class="form-group">
                            <input type="email" name="email" placeholder="Email" required>
                        </div>
                        <div class="form-group">
                            <input type="password" name="password" placeholder="Digite sua senha" required>
                        </div>
                        <button type="submit" class="btn-primary">Entrar</button>
                    </form>
                    
                    <p><a href="#" onclick="loadTab('esqueci-senha')">Esqueci minha senha</a></p>
                    <p>Não tem conta? <a href="#" onclick="loadTab('cadastro')">Cadastre-se</a></p>
                </div>
            </div>
        `;
    }

    // Conteúdo da tela de cadastro
    getCadastroContent() {
        return `
            <div class="tab-content active" id="cadastro">
                <div class="form-container">
                    <!-- Botão voltar no canto superior esquerdo -->
                    <button class="btn-voltar-perfil" onclick="goBack()">
                        <img src="assets/images/back-icon.png" alt="Voltar">
                    </button>
                    
                    <!-- Logo -->
                    <div class="logo">
                        <img src="assets/images/logo-bigode-new.png" alt="Logo Bigode Cortes">
                    </div>
                    
                    <h2>Cadastre-se agora</h2>
                    
                    <form id="cadastro-form">
                        <div class="form-group">
                            <input type="text" name="nome" placeholder="Nome Completo" required>
                        </div>
                        <div class="form-group">
                            <input type="email" name="email" placeholder="Email" required>
                        </div>
                        <div class="form-group">
                            <input type="tel" name="telefone" placeholder="Telefone" required>
                        </div>
                        <div class="form-group">
                            <input type="password" name="password" placeholder="Crie uma senha" required>
                        </div>
                        <div class="form-group">
                            <input type="password" name="confirm_password" placeholder="Confirme sua senha" required>
                        </div>
                        <div class="checkbox-group">
                            <input type="checkbox" name="terms" id="terms" required>
                            <label for="terms">Aceito os termos de uso e diretrizes do app</label>
                        </div>
                        <button type="submit" class="btn-primary">Cadastrar</button>
                    </form>
                    
                    <p>Já tem conta? <a href="#" onclick="loadTab('login')">Entre agora</a></p>
                </div>
            </div>
        `;
    }

    // Conteúdo da tela de esqueci senha
    getEsqueciSenhaContent() {
        return `
            <div class="tab-content active" id="esqueci-senha">
                <div class="form-container">
                    <!-- Botão voltar no canto superior esquerdo -->
                    <button class="btn-voltar-perfil" onclick="goBack()">
                        <img src="assets/images/back-icon.png" alt="Voltar">
                    </button>
                    
                    <!-- Logo -->
                    <div class="logo">
                        <img src="assets/images/logo-bigode-new.png" alt="Logo Bigode Cortes">
                    </div>
                    
                    <h2>Recuperar Senha</h2>
                    <p>Digite seu email para receber as instruções de recuperação</p>
                    
                    <form id="esqueci-senha-form">
                        <div class="form-group">
                            <input type="email" name="email" placeholder="Seu email" required>
                        </div>
                        <button type="submit" class="btn-primary">Enviar</button>
                    </form>
                    
                    <p><a href="#" onclick="loadTab('login')">Voltar ao login</a></p>
                </div>
            </div>
        `;
    }
    
    // Conteúdo da tela de confirmação de email enviado
    getEmailEnviadoContent() {
        return `
            <div class="tab-content active" id="email-enviado">
                <div class="form-container">
                    <!-- Botão voltar no canto superior esquerdo -->
                    <button class="btn-voltar-perfil" onclick="loadTab('login')">
                        <img src="assets/images/back-icon.png" alt="Voltar">
                    </button>
                    
                    <!-- Logo -->
                    <div class="logo">
                        <img src="assets/images/logo-bigode-new.png" alt="Logo Bigode Cortes">
                    </div>
                    
                    <h2>Email Enviado</h2>
                    <div class="success-message">
                        <img src="assets/images/verifica.png" alt="Verificado" class="check-icon">
                        <p>Email de recuperação de senha enviado com sucesso!</p>
                        <p>Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.</p>
                    </div>
                    
                    <button class="btn-primary" onclick="loadTab('login')">Voltar ao Login</button>
                </div>
            </div>
        `;
    }

    // Conteúdo da tela de agendamento
    getAgendarHorarioContent() {
        return `
            <div class="tab-content active" id="agendar-horario">
                <div class="form-container">
                    <!-- Botão voltar no canto superior esquerdo -->
                    <button class="btn-voltar-perfil" onclick="goBack()">
                        <img src="assets/images/back-icon.png" alt="Voltar">
                    </button>
                    
                    <!-- Logo -->
                    <div class="logo">
                        <img src="assets/images/logo-bigode-new.png" alt="Logo Bigode Cortes">
                    </div>
                    
                    <h2>Agendar Horário</h2>
                    <p>Para agendar um horário, você precisa estar logado.</p>
                    
                    <button class="btn-primary" onclick="loadTab('login')">Fazer login</button>
                </div>
            </div>
        `;
    }

    // Conteúdo da tela de seleção de serviço
    getSelecionarServicoContent() {
        const selectedCount = this.selectedServices.length;
        const buttonText = selectedCount > 0 ? `Continuar (${selectedCount} selecionado${selectedCount > 1 ? 's' : ''})` : "Continuar";

        return `
            <div class="tab-content active" id="selecionar-servico">
                <div class="form-container">
                    <!-- Botão voltar no canto superior esquerdo -->
                    <button class="btn-voltar-perfil" onclick="goBack()">
                        <img src="assets/images/back-icon.png" alt="Voltar">
                    </button>
                    
                    <!-- Logo -->
                    <div class="logo">
                        <img src="assets/images/logo-bigode-new.png" alt="Logo Bigode Cortes">
                    </div>
                    
                    <h2>Selecione um serviço</h2>
                    
                    <div class="servicos-list">
                        <button class="btn-servico" onclick="toggleService('corte')" data-servico="corte">CORTE</button>
                        <button class="btn-servico" onclick="toggleService('barba')" data-servico="barba">BARBA</button>
                        <button class="btn-servico" onclick="toggleService('combo')" data-servico="combo">COMBO</button>
                        <button class="btn-servico" onclick="toggleService('sobrancelha')" data-servico="sobrancelha">SOBRANCELHA</button>
                        <button class="btn-servico" onclick="toggleService('nevou')" data-servico="nevou">NEVOU</button>
                    </div>
                    
                    <button class="btn-primary" onclick="loadTab('selecionar-barbeiro')" ${selectedCount === 0 ? 'disabled' : ''}>${buttonText}</button>
                </div>
            </div>
        `;
    }

    // Conteúdo da tela de seleção de barbeiro
    getSelecionarBarbeiroContent() {
        return `
            <div class="tab-content active" id="selecionar-barbeiro">
                <div class="form-container">
                    <!-- Botão voltar no canto superior esquerdo -->
                    <button class="btn-voltar-perfil" onclick="loadTab('selecionar-servico')">
                        <img src="assets/images/back-icon.png" alt="Voltar">
                    </button>
                    
                    <!-- Logo -->
                    <div class="logo">
                        <img src="assets/images/logo-bigode-new.png" alt="Logo Bigode Cortes">
                    </div>
                    
                    <h2>Selecione um barbeiro</h2>
                    
                    <div class="barbeiros-grid">
                        <!--<div class="barbeiro-card" onclick="selectBarber('marcos')" data-barber="marcos">
                            <img src="assets/images/cara.png" alt="Marcos">
                            <p>Marcos</p>
                        </div>-->
                        <div class="barbeiro-card" onclick="selectBarber('Biel')" data-barber="Biel">
                           
                            <p>Biel</p>
                        </div>
                        <!-- Adicione mais barbeiros conforme necessário -->
                    </div>
                    
                    <button class="btn-primary" onclick="loadTab('selecionar-data')" ${this.selectedBarber === null ? 'disabled' : ''}>Continuar</button>
                </div>
            </div>
        `;
    }

    // Conteúdo da tela de seleção de data
    getSelecionarDataContent() {
        // Obter o mês e ano atual
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
        
        return `
            <div class="tab-content active" id="selecionar-data">
                <div class="form-container">
                    <!-- Botão voltar no canto superior esquerdo -->
                    <button class="btn-voltar-perfil" onclick="loadTab('selecionar-barbeiro')">
                        <img src="assets/images/back-icon.png" alt="Voltar">
                    </button>
                    
                    <!-- Logo -->
                    <div class="logo">
                        <img src="assets/images/logo-bigode-new.png" alt="Logo Bigode Cortes">
                    </div>
                    
                    <h2>Selecione uma data</h2>
                    
                    <div class="calendario">
                        <div class="mes-nav">
                            <button class="btn-nav btn-prev-month">&lt;</button>
                            <span class="mes-ano-text">${monthNames[currentMonth]} ${currentYear}</span>
                            <button class="btn-nav btn-next-month">&gt;</button>
                        </div>
                        <div class="dias-semana">
                            <span>Dom</span>
                            <span>Seg</span>
                            <span>Ter</span>
                            <span>Qua</span>
                            <span>Qui</span>
                            <span>Sex</span>
                            <span>Sáb</span>
                        </div>
                        <div class="dias-mes">
                            <!-- Os dias serão gerados dinamicamente pelo JavaScript -->
                        </div>
                    </div>
                    
                    <button class="btn-primary" onclick="loadTab('selecionar-horario')" ${this.selectedDate === null ? 'disabled' : ''}>Continuar</button>
                </div>
            </div>
        `;
    }

    // Conteúdo da tela de seleção de horário
    getSelecionarHorarioContent() {
        return `
            <div class="tab-content active" id="selecionar-horario">
                <div class="form-container">
                    <!-- Botão voltar no canto superior esquerdo -->
                    <button class="btn-voltar-perfil" onclick="loadTab('selecionar-data')">
                        <img src="assets/images/back-icon.png" alt="Voltar">
                    </button>
                    
                    <!-- Logo -->
                    <div class="logo">
                        <img src="assets/images/logo-bigode-new.png" alt="Logo Bigode Cortes">
                    </div>
                    
                    <h2>Selecione um horário</h2>
                    
                    <div class="horarios-grid">
                        <button class="btn-horario" data-hour="08:00">08:00</button>
                        <button class="btn-horario" data-hour="09:00">09:00</button>
                        <button class="btn-horario" data-hour="10:00">10:00</button>
                        <button class="btn-horario" data-hour="11:00">11:00</button>
                        <button class="btn-horario" data-hour="14:00">14:00</button>
                        <button class="btn-horario" data-hour="15:00">15:00</button>
                        <button class="btn-horario" data-hour="16:00">16:00</button>
                        <button class="btn-horario" data-hour="17:00">17:00</button>
                        <button class="btn-horario" data-hour="18:00">18:00</button>
                        <button class="btn-horario" data-hour="19:00">19:00</button>
                    </div>
                    
                    <button class="btn-primary" onclick="loadTab('confirmacao')" ${this.selectedHour === null ? 'disabled' : ''}>Continuar</button>
                </div>
            </div>
        `;
    }

    // Conteúdo da tela de confirmação
    getConfirmacaoContent() {
        const servicosSelecionados = this.selectedServices.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(", ");
        const formattedDate = this.selectedDate ? this.formatDate(this.selectedDate) : "Data não selecionada";
        
        return `
            <div class="tab-content active" id="confirmacao">
                <div class="form-container">
                    <!-- Botão voltar no canto superior esquerdo -->
                    <button class="btn-voltar-perfil" onclick="loadTab('selecionar-horario')">
                        <img src="assets/images/back-icon.png" alt="Voltar">
                    </button>
                    
                    <!-- Logo -->
                    <div class="logo">
                        <img src="assets/images/logo-bigode-new.png" alt="Logo Bigode Cortes">
                    </div>
                    
                    <h2>O seu agendamento:</h2>
                    
                    <div class="agendamento-info">
                        <p><strong>Data:</strong> ${formattedDate}</p>
                        <p><strong>Horário:</strong> ${this.selectedHour || "Horário não selecionado"}</p>
                        <p><strong>Serviços:</strong> ${servicosSelecionados}</p>
                        <p><strong>Barbeiro:</strong> ${this.selectedBarber ? this.selectedBarber.charAt(0).toUpperCase() + this.selectedBarber.slice(1) : 'Não selecionado'}</p>
                    </div>
                    
                    <button class="btn-primary" onclick="loadTab('agendamento-confirmado')">Confirmar</button>
                </div>
            </div>
        `;
    }
    
    // Conteúdo da tela de agendamento confirmado
    getAgendamentoConfirmadoContent() {
        return `
            <div class="tab-content active" id="agendamento-confirmado">
                <div class="form-container">
                    <!-- Botão voltar no canto superior esquerdo -->
                    <button class="btn-voltar-perfil" onclick="loadTab('home-logado')">
                        <img src="assets/images/back-icon.png" alt="Voltar">
                    </button>
                    
                    <!-- Logo -->
                    <div class="logo">
                        <img src="assets/images/logo-bigode-new.png" alt="Logo Bigode Cortes">
                    </div>
                    
                    <h2>Agendamento Confirmado!</h2>
                    <div class="success-message">
                        <img src="assets/images/verifica.png" alt="Verificado" class="check-icon">
                        <p>Seu agendamento foi confirmado com sucesso!</p>
                        <p>Aguardamos você na data e horário marcados.</p>
                    </div>
                    
                    <button class="btn-primary" onclick="loadTab('home-logado')">Voltar ao Início</button>
                </div>
            </div>
        `;
    }

    // Conteúdo da tela de contato
    getContatoContent() {
        return `
            <div class="tab-content active" id="contato">
                <div class="form-container">
                    <!-- Botão voltar no canto superior esquerdo -->
                    <button class="btn-voltar-perfil" onclick="goBack()">
                        <img src="assets/images/back-icon.png" alt="Voltar">
                    </button>
                    
                    <!-- Logo -->
                    <div class="logo">
                        <img src="assets/images/logo-bigode-new.png" alt="Logo Bigode Cortes">
                    </div>
                    
                    <h2>Contato</h2>
                    
                    <div class="agendamento-info">
                        <p><strong>Telefone:</strong> (11) 99999-9999</p>
                        <p><strong>WhatsApp:</strong> (11) 99999-9999</p>
                        <p><strong>Instagram:</strong> @bigodecortes</p>
                        <p><strong>Endereço:</strong> Rua das Barbearias, 123</p>
                    </div>
                </div>
            </div>
        `;
    }

    // Conteúdo da tela de página não encontrada
    getNotFoundContent() {
        return `
            <div class="tab-content active">
                <div class="form-container">
                    <!-- Botão voltar no canto superior esquerdo -->
                    <button class="btn-voltar-perfil" onclick="goBack()">
                        <img src="assets/images/back-icon.png" alt="Voltar">
                    </button>
                    
                    <h2>Página não encontrada</h2>
                    <p>A página que você está procurando não existe.</p>
                    <button class="btn-primary" onclick="goBack()">Voltar ao início</button>
                </div>
            </div>
        `;
    }
    
    // Formatar data para exibição
    formatDate(dateString) {
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
    }
}

// Inicializa a aplicação quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    new BarberApp();
});
