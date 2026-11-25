<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Apontamento de Horas por Relato Livre</title>
  <link rel="stylesheet" href="styles.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>
  <!-- Modal de Autenticação (Login / Cadastro) -->
  <div id="modal-login" class="modal">
    <div class="modal-content" style="max-width: 400px;">
      <h3 id="auth-titulo"><i class="fa-solid fa-lock"></i> Entrar no Sistema</h3>
      <p class="modal-desc" id="auth-desc">Informe suas credenciais para acessar o painel.</p>
      
      <form id="form-auth">
        <div class="form-group">
          <label for="auth-usuario">Nome de Usuário</label>
          <input type="text" id="auth-usuario" placeholder="Ex: ana.silva" required>
        </div>
        <div class="form-group">
          <label for="auth-senha">Senha</label>
          <input type="password" id="auth-senha" placeholder="******" required>
        </div>
        
        <!-- Campo visível apenas no modo Cadastro -->
        <div class="form-group hidden" id="grupo-perfil">
          <label for="auth-perfil">Perfil de Acesso</label>
          <select id="auth-perfil">
            <option value="funcionario">Funcionário</option>
            <option value="rh">RH</option>
            <option value="coordenador">Coordenador</option>
          </select>
        </div>

        <div class="button-group" style="margin-top: 16px; display: flex; flex-direction: column; gap: 8px;">
          <button type="submit" id="btn-submit-auth" class="btn btn-primary" style="width: 100%;">Entrar</button>
          <button type="button" id="btn-toggle-modo" class="btn btn-secondary" style="width: 100%;">Não tem conta? Cadastre-se</button>
        </div>
      </form>
    </div>
  </div>

  <div class="app-container">
    <header class="app-header">
      <div class="header-title">
        <h1><i class="fa-solid fa-clock-rotate-left"></i> Sistema de Apontamento de Horas</h1>
        <p>Usuário: <strong id="info-perfil-nome" style="color: var(--primary-color);">Nenhum</strong></p>
      </div>
      <div style="display: flex; gap: 8px;">
        <button id="btn-config" class="btn btn-secondary hidden"><i class="fa-solid fa-gear"></i> Jira</button>
        <button id="btn-logout" class="btn btn-secondary"><i class="fa-solid fa-right-from-bracket"></i> Sair</button>
      </div>
    </header>

    <!-- Navegação por Abas (Dinâmica por Perfil) -->
    <nav class="nav-tabs" id="nav-abas">
      <button class="tab-btn active" data-tab="tab-novo" data-perfis="funcionario,coordenador"><i class="fa-solid fa-pen-to-square"></i> Novo Relato</button>
      <button class="tab-btn" data-tab="tab-validacao" data-perfis="funcionario,coordenador"><i class="fa-solid fa-list-check"></i> Validação Diária</button>
      <button class="tab-btn" data-tab="tab-relatorio" data-perfis="rh,coordenador"><i class="fa-solid fa-chart-bar"></i> Relatório Mensal / Geral</button>
    </nav>

    <!-- Aba 1: Novo Relato -->
    <section id="tab-novo" class="tab-content active">
      <div class="card">
        <h2><i class="fa-solid fa-comment-dots"></i> Inserir Relato do Colaborador</h2>
        <form id="form-apontamento">
          <div class="form-row">
            <div class="form-group">
              <label for="colaborador">Colaborador</label>
              <input type="text" id="colaborador" placeholder="Ex: Ana, Bruno, Carla..." required>
            </div>
            <div class="form-group">
              <label for="dia">Data do Apontamento</label>
              <input type="date" id="dia" required>
            </div>
          </div>

          <div class="form-group">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <label for="mensagem">Relato Livre do Dia</label>
              <button type="button" id="btn-mic" class="btn btn-secondary" style="padding: 4px 8px; font-size: 0.8rem;">
                <i class="fa-solid fa-microphone"></i> Falar Relato
              </button>
            </div>
            <textarea id="mensagem" rows="6" placeholder="Ex: Hoje passei 2 horas na reunião do Pix, depois fiquei 4 horas desenvolvendo a tela do aplicativo e no final do dia gastei 2 horas resolvendo o erro do suporte." required></textarea>
          </div>

          <div class="button-group">
            <button type="submit" class="btn btn-primary"><i class="fa-solid fa-calculator"></i> Interpretar e Processar</button>
            <button type="button" id="btn-demo" class="btn btn-secondary"><i class="fa-solid fa-flask"></i> Carregar Demonstração</button>
          </div>
        </form>
      </div>
    </section>

    <!-- Aba 2: Validação Diária -->
    <section id="tab-validacao" class="tab-content">
      <div class="card">
        <h2><i class="fa-solid fa-list-check"></i> Validação Diária e Ajustes</h2>
        
        <div id="validacao-placeholder" class="placeholder">
          <i class="fa-solid fa-file-invoice fa-3x"></i>
          <p>Nenhum relato processado ainda. Vá na aba "Novo Relato" para começar.</p>
        </div>

        <div id="validacao-conteudo" class="hidden">
          <div class="info-header">
            <p><strong>Colaborador:</strong> <span id="val-colaborador"></span></p>
            <p><strong>Data:</strong> <span id="val-dia"></span></p>
          </div>

          <div class="table-container">
            <table class="table-apontamentos">
              <thead>
                <tr>
                  <th>Trecho Identificado</th>
                  <th>Card Jira Associado</th>
                  <th>Duração (Minutos / Horas)</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody id="val-tabela-body">
                <!-- Preenchido dinamicamente -->
              </tbody>
            </table>
          </div>

          <button type="button" id="btn-adicionar-lancamento" class="btn btn-secondary" style="margin-bottom: 16px;">
            <i class="fa-solid fa-plus"></i> Adicionar Lançamento Manual
          </button>

          <div id="status-jornada-box" class="status-box">
            <span>TOTAL DO DIA: <strong id="val-total"></strong> / 8.0h</span>
            <div id="val-status-badge" class="badge"></div>
          </div>

          <div id="alert-alerta" class="alert alert-warning hidden">
            <i class="fa-solid fa-triangle-exclamation"></i>
            <span>Existem lançamentos não identificados. Atribua um card válido para prosseguir.</span>
          </div>

          <div class="button-group right-align">
            <button id="btn-confirmar-jira" class="btn btn-success">
              <i class="fa-brands fa-jira"></i> Confirmar e Enviar ao Jira
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Aba 3: Relatório Mensal e Geral -->
    <section id="tab-relatorio" class="tab-content">
      <div class="card">
        <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 16px;">
          <h2 style="margin-bottom: 0;"><i class="fa-solid fa-calendar-check"></i> Relatório Consolidado Mês a Mês</h2>
          <div style="display: flex; align-items: center; gap: 8px;">
            <label for="filtro-mes" style="font-size: 0.85rem; font-weight: 600; color: var(--secondary-color);">Filtrar Mês:</label>
            <input type="month" id="filtro-mes" style="width: auto; padding: 6px 10px;">
            <button type="button" id="btn-limpar-filtro-mes" class="btn btn-secondary" style="padding: 6px 10px; font-size: 0.8rem;">Todos</button>
          </div>
        </div>

        <div class="table-container">
          <table class="table-totais">
            <thead>
              <tr>
                <th>Mês / Ano</th>
                <th>Colaborador</th>
                <th>Dias Apontados</th>
                <th>Horas Consolidadas</th>
                <th>Média Diária</th>
              </tr>
            </thead>
            <tbody id="totais-tabela-body">
              <tr>
                <td colspan="5" class="text-center">Nenhum dado registrado até o momento.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- Modal de Configuração do Jira -->
    <div id="modal-jira" class="modal hidden">
      <div class="modal-content">
        <h3><i class="fa-solid fa-gear"></i> Configurações da API do Jira</h3>
        <p class="modal-desc">Configure sua instância corporativa ou deixe em branco para operar em modo de simulação segura.</p>
        <div class="form-group">
          <label for="jira-url">URL Base do Jira</label>
          <input type="url" id="jira-url" placeholder="https://sua-empresa.atlassian.net">
        </div>
        <div class="form-group">
          <label for="jira-email">E-mail de Acesso</label>
          <input type="email" id="jira-email" placeholder="seu-email@empresa.com">
        </div>
        <div class="form-group">
          <label for="jira-token">Token de API</label>
          <input type="password" id="jira-token" placeholder="Token gerado na Atlassian">
        </div>
        <div class="modal-actions">
          <button id="btn-fechar-modal" class="btn btn-secondary">Cancelar</button>
          <button id="btn-salvar-jira" class="btn btn-primary">Salvar Configurações</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Scripts Modulares -->
  <script src="cards.js"></script>
  <script src="parser.js"></script>
  <script src="service.js"></script>
  <script src="app.js"></script>
</body>
</html>
