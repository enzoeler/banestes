const service = new ApontamentoService();
let registroAtual = null;

// Definição de Usuários e Permissões
const USUARIOS_SISTEMA = {
  "funcionario": { senha: "123", perfil: "funcionario", nome: "Funcionário Padrão" },
  "rh": { senha: "123", perfil: "rh", nome: "Analista de RH" },
  "coordenador": { senha: "123", perfil: "coordenador", nome: "Coordenador de Projetos" }
};

function fmtHoras(minutos) {
  return `${(minutos / 60).toFixed(1)}h`;
}

function fmtMesAno(mesAnoStr) {
  if (!mesAnoStr) return "";
  const [ano, mes] = mesAnoStr.split("-");
  const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const nomeMes = meses[parseInt(mes, 10) - 1] || mes;
  return `${nomeMes}/${ano}`;
}

function statusJornada(total) {
  if (total === JORNADA_MINUTOS) {
    return { texto: "JORNADA COMPLETA OK", classe: "badge-success" };
  }
  if (total < JORNADA_MINUTOS) {
    return { texto: `ATENÇÃO: FALTAM ${fmtHoras(JORNADA_MINUTOS - total)}`, classe: "badge-warning" };
  }
  return { texto: `ATENÇÃO: EXCEDE EM ${fmtHoras(total - JORNADA_MINUTOS)}`, classe: "badge-danger" };
}

// Elementos DOM
const campoDia = document.getElementById("dia");
const filtroMes = document.getElementById("filtro-mes");
const modalLogin = document.getElementById("modal-login");
const formLogin = document.getElementById("form-login");
const infoPerfilNome = document.getElementById("info-perfil-nome");
const btnConfig = document.getElementById("btn-config");

if (campoDia) {
  campoDia.value = new Date().toISOString().split('T')[0];
}

// Controle de Sessão e Login
function verificarSessao() {
  const usuarioSalvo = localStorage.getItem("sessao_usuario");
  if (usuarioSalvo && USUARIOS_SISTEMA[usuarioSalvo]) {
    const userObj = USUARIOS_SISTEMA[usuarioSalvo];
    modalLogin.classList.add("hidden");
    infoPerfilNome.textContent = `${userObj.nome} (${userObj.perfil.toUpperCase()})`;
    
    // Configura visibilidade baseada no perfil
    aplicarPermissoesPerfil(userObj.perfil);
  } else {
    modalLogin.classList.remove("hidden");
  }
}

function aplicarPermissoesPerfil(perfil) {
  const botoesAbas = document.querySelectorAll(".tab-btn");
  let primeiraVisivel = null;

  botoesAbas.forEach(btn => {
    const perfisPermitidos = btn.getAttribute("data-perfis").split(",");
    if (perfisPermitidos.includes(perfil)) {
      btn.style.display = "inline-flex";
      if (!primeiraVisivel) primeiraVisivel = btn;
    } else {
      btn.style.display = "none";
    }
  });

  // Apenas Coordenador vê o botão de Configuração do Jira
  if (btnConfig) {
    if (perfil === "coordenador") {
      btnConfig.classList.remove("hidden");
    } else {
      btnConfig.classList.add("hidden");
    }
  }

  // Ativa a primeira aba visível para o perfil
  if (primeiraVisivel) {
    const abaAlvo = primeiraVisivel.getAttribute("data-tab");
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
    
    primeiraVisivel.classList.add("active");
    const conteudo = document.getElementById(abaAlvo);
    if (conteudo) conteudo.classList.add("active");

    if (abaAlvo === "tab-relatorio") {
      atualizarTabelaGeral();
    }
  }
}

formLogin.addEventListener("submit", (e) => {
  e.preventDefault();
  const user = document.getElementById("login-usuario").value.trim().toLowerCase();
  const pass = document.getElementById("login-senha").value.trim();

  if (USUARIOS_SISTEMA[user] && USUARIOS_SISTEMA[user].senha === pass) {
    localStorage.setItem("sessao_usuario", user);
    verificarSessao();
    document.getElementById("login-senha").value = "";
  } else {
    alert("Usuário ou senha inválidos! Tente 'funcionario', 'rh' ou 'coordenador' com senha '123'.");
  }
});

document.getElementById("btn-logout").addEventListener("click", () => {
  localStorage.removeItem("sessao_usuario");
  window.location.reload();
});

document.addEventListener("DOMContentLoaded", () => {
  verificarSessao();

  // Navegação por Abas
  const botoesAbas = document.querySelectorAll(".tab-btn");
  botoesAbas.forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const abaAlvo = btn.getAttribute("data-tab");

      document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
      
      btn.classList.add("active");
      const conteudo = document.getElementById(abaAlvo);
      if (conteudo) conteudo.classList.add("active");

      if (abaAlvo === "tab-relatorio") {
        atualizarTabelaGeral();
      }
    });
  });

  if (filtroMes) {
    filtroMes.addEventListener("change", () => atualizarTabelaGeral());
  }

  const btnLimparFiltro = document.getElementById("btn-limpar-filtro-mes");
  if (btnLimparFiltro) {
    btnLimparFiltro.addEventListener("click", () => {
      if (filtroMes) filtroMes.value = "";
      atualizarTabelaGeral();
    });
  }

  atualizarTabelaGeral();
});

function trocarAba(idAba) {
  document.querySelectorAll(".tab-btn").forEach(b => {
    if (b.dataset.tab === idAba && b.style.display !== "none") {
      b.classList.add("active");
    } else {
      b.classList.remove("active");
    }
  });
  document.querySelectorAll(".tab-content").forEach(c => {
    c.classList.toggle("active", c.id === idAba);
  });
  if (idAba === "tab-relatorio") {
    atualizarTabelaGeral();
  }
}

// Renderização da Validação
function renderizarValidacao(registro) {
  registroAtual = registro;
  const placeholder = document.getElementById("validacao-placeholder");
  const conteudo = document.getElementById("validacao-conteudo");

  if (!registro || registro.lancamentos.length === 0) {
    placeholder.classList.remove("hidden");
    conteudo.classList.add("hidden");
    return;
  }

  placeholder.classList.add("hidden");
  conteudo.classList.remove("hidden");

  document.getElementById("val-colaborador").textContent = registro.colaborador;
  document.getElementById("val-dia").textContent = registro.dia.split("-").reverse().join("/");

  const tbody = document.getElementById("val-tabela-body");
  tbody.innerHTML = "";

  registro.lancamentos.forEach((lanc, index) => {
    const tr = document.createElement("tr");

    let optionsCard = `<option value="">-- Não Identificado --</option>`;
    CARDS.forEach(c => {
      const selected = (lanc.card && lanc.card.chave === c.chave) ? "selected" : "";
      optionsCard += `<option value="${c.chave}" ${selected}>Card ${c.chave} - ${c.nome}</option>`;
    });

    tr.innerHTML = `
      <td><input type="text" value="${lanc.trecho}" data-index="${index}" class="edit-trecho" style="width:100%"></td>
      <td><select data-index="${index}" class="edit-card">${optionsCard}</select></td>
      <td><input type="number" value="${lanc.minutos}" data-index="${index}" class="edit-minutos" min="5" step="5" style="width:90px"> min</td>
      <td><button type="button" class="btn-danger-icon btn-remover" data-index="${index}"><i class="fa-solid fa-trash"></i></button></td>
    `;
    tbody.appendChild(tr);
  });

  atualizarTotaisValidados();
}

function atualizarTotaisValidados() {
  if (!registroAtual) return;

  service.salvarNoLocalStorage();

  const totalMinutos = registroAtual.totalMinutos;
  document.getElementById("val-total").textContent = fmtHoras(totalMinutos);
  
  const st = statusJornada(totalMinutos);
  const badge = document.getElementById("val-status-badge");
  badge.textContent = st.texto;
  badge.className = `badge ${st.classe}`;

  const alerta = document.getElementById("alert-alerta");
  const btnEnviar = document.getElementById("btn-confirmar-jira");

  if (registroAtual.naoIdentificados.length > 0) {
    alerta.classList.remove("hidden");
    btnEnviar.disabled = true;
    btnEnviar.style.opacity = "0.6";
  } else {
    alerta.classList.add("hidden");
    btnEnviar.disabled = false;
    btnEnviar.style.opacity = "1";
  }

  atualizarTabelaGeral();
}

// Eventos de Edição Dinâmica na Tabela
document.getElementById("val-tabela-body").addEventListener("input", (e) => {
  const index = parseInt(e.target.dataset.index, 10);
  if (isNaN(index)) return;

  if (e.target.classList.contains("edit-minutos")) {
    registroAtual.lancamentos[index].minutos = parseInt(e.target.value || 0, 10);
  } else if (e.target.classList.contains("edit-trecho")) {
    registroAtual.lancamentos[index].trecho = e.target.value;
  }
  atualizarTotaisValidados();
});

document.getElementById("val-tabela-body").addEventListener("change", (e) => {
  const index = parseInt(e.target.dataset.index, 10);
  if (isNaN(index)) return;

  if (e.target.classList.contains("edit-card")) {
    const chave = e.target.value;
    registroAtual.lancamentos[index].card = CARDS.find(c => c.chave === chave) || null;
    atualizarTotaisValidados();
  }
});

document.getElementById("val-tabela-body").addEventListener("click", (e) => {
  const btnRemover = e.target.closest(".btn-remover");
  if (!btnRemover) return;
  const index = parseInt(btnRemover.dataset.index, 10);
  registroAtual.lancamentos.splice(index, 1);
  renderizarValidacao(registroAtual);
});

document.getElementById("btn-adicionar-lancamento").addEventListener("click", () => {
  if (!registroAtual) return;
  registroAtual.lancamentos.push(new Lancamento(60, "Atividade extra", CARDS[0]));
  renderizarValidacao(registroAtual);
});

// Relatório Consolidado Mês a Mês
function atualizarTabelaGeral() {
  const mesSelecionado = filtroMes ? filtroMes.value : "";
  const dadosMensais = service.consolidadoMensal(mesSelecionado);
  const tbody = document.getElementById("totais-tabela-body");
  if (!tbody) return;
  tbody.innerHTML = "";

  if (dadosMensais.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center">Nenhum dado registrado para o período selecionado.</td></tr>`;
    return;
  }

  for (const item of dadosMensais) {
    const media = item.totalMinutos / item.dias;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><span class="badge badge-success" style="font-size: 0.8rem;">${fmtMesAno(item.mesAno)}</span></td>
      <td><strong>${item.colaborador}</strong></td>
      <td>${item.dias} dia(s)</td>
      <td><strong>${fmtHoras(item.totalMinutos)}</strong></td>
      <td>${fmtHoras(media)} / dia</td>
    `;
    tbody.appendChild(tr);
  }
}

// Eventos de Formulário e Demonstração
document.getElementById("form-apontamento").addEventListener("submit", (e) => {
  e.preventDefault();
  const colab = document.getElementById("colaborador").value.trim();
  const dia = document.getElementById("dia").value;
  const msg = document.getElementById("mensagem").value.trim();

  if (!colab || !msg) return;

  let reg = service.obterRegistro(colab, dia);

  if (!reg) {
    reg = service.receberMensagem(colab, msg, dia);
  } else {
    const lancamentosBrutos = interpretarMensagem(msg);
    lancamentosBrutos.forEach(l => {
      reg.lancamentos.push(new Lancamento(l.minutos, l.trecho, l.card));
    });
    service.salvarNoLocalStorage();
  }

  renderizarValidacao(reg);
  trocarAba("tab-validacao");
});

document.getElementById("btn-demo").addEventListener("click", () => {
  const demos = [
    { colab: "Ana", msg: "Hoje passei 2 horas na reunião do Pix, depois fiquei 4 horas desenvolvendo a tela do aplicativo e no final do dia gastei 2 horas resolvendo o erro do suporte." },
    { colab: "Bruno", msg: "Fiz reunião do Pix por 1h30, desenvolvi o app por 5 horas e atendi chamado de suporte por uma hora e meia." },
    { colab: "Carla", msg: "Fiquei 3 horas no suporte, 2h testando uma coisa e meia hora na reunião do Pix." }
  ];
  const item = demos[Math.floor(Math.random() * demos.length)];
  document.getElementById("colaborador").value = item.colab;
  document.getElementById("mensagem").value = item.msg;
  const diaAtual = campoDia.value || new Date().toISOString().split('T')[0];

  let reg = service.obterRegistro(item.colab, diaAtual);
  if (!reg) {
    reg = service.receberMensagem(item.colab, item.msg, diaAtual);
  } else {
    const lancamentosBrutos = interpretarMensagem(item.msg);
    lancamentosBrutos.forEach(l => {
      reg.lancamentos.push(new Lancamento(l.minutos, l.trecho, l.card));
    });
    service.salvarNoLocalStorage();
  }

  renderizarValidacao(reg);
  trocarAba("tab-validacao");
});

// Envio ao Jira
document.getElementById("btn-confirmar-jira").addEventListener("click", async () => {
  if (!registroAtual) return;

  const config = {
    url: localStorage.getItem("jira_url") || "",
    email: localStorage.getItem("jira_email") || "",
    token: localStorage.getItem("jira_token") || ""
  };

  try {
    const logs = await enviarAoJira(registroAtual, config);
    alert("Operação realizada com sucesso:\n\n" + logs.join("\n"));
  } catch (err) {
    alert(`Erro ao enviar: ${err.message}`);
  }
});

// Modal de Configurações
const modal = document.getElementById("modal-jira");
document.getElementById("btn-config").addEventListener("click", () => {
  document.getElementById("jira-url").value = localStorage.getItem("jira_url") || "";
  document.getElementById("jira-email").value = localStorage.getItem("jira_email") || "";
  document.getElementById("jira-token").value = localStorage.getItem("jira_token") || "";
  modal.classList.remove("hidden");
});

document.getElementById("btn-fechar-modal").addEventListener("click", () => modal.classList.add("hidden"));

document.getElementById("btn-salvar-jira").addEventListener("click", () => {
  localStorage.setItem("jira_url", document.getElementById("jira-url").value.trim());
  localStorage.setItem("jira_email", document.getElementById("jira-email").value.trim());
  localStorage.setItem("jira_token", document.getElementById("jira-token").value.trim());
  modal.classList.add("hidden");
  alert("Configurações salvas com sucesso!");
});

// --- Captação de Áudio (Speech-to-Text) ---
const btnMic = document.getElementById("btn-mic");
const campoMensagem = document.getElementById("mensagem");

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognition) {
  if (btnMic) {
    btnMic.style.display = "none";
  }
} else {
  const recognition = new SpeechRecognition();
  recognition.lang = "pt-BR";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  let gravando = false;

  btnMic.addEventListener("click", () => {
    if (gravando) {
      recognition.stop();
      return;
    }

    try {
      recognition.start();
    } catch (e) {
      console.error("Erro ao iniciar reconhecimento:", e);
    }
  });

  recognition.onstart = () => {
    gravando = true;
    btnMic.classList.add("btn-primary");
    btnMic.classList.remove("btn-secondary");
    btnMic.innerHTML = '<i class="fa-solid fa-microphone-lines fa-fade"></i> Ouvindo...';
  };

  recognition.onresult = (event) => {
    const textoFalado = event.results[0][0].transcript;
    if (campoMensagem.value.trim() !== "") {
      campoMensagem.value += " " + textoFalado;
    } else {
      campoMensagem.value = textoFalado;
    }
  };

  recognition.onerror = (event) => {
    console.error("Erro no reconhecimento de voz:", event.error);
    alert("Não foi possível capturar o áudio. Verifique as permissões do microfone.");
  };

  recognition.onend = () => {
    gravando = false;
    btnMic.classList.remove("btn-primary");
    btnMic.classList.add("btn-secondary");
    btnMic.innerHTML = '<i class="fa-solid fa-microphone"></i> Falar Relato';
  };
}
