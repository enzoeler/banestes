const service = new ApontamentoService();
let registroAtual = null;

function fmtHoras(minutos) {
  return `${(minutos / 60).toFixed(1)}h`;
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
campoDia.valueAsDate = new Date();

// Navegação por Abas
document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
    
    btn.classList.add("active");
    document.getElementById(btn.dataset.tab).classList.add("active");
  });
});

function trocarAba(idAba) {
  document.querySelectorAll(".tab-btn").forEach(b => {
    b.classList.toggle("active", b.dataset.tab === idAba);
  });
  document.querySelectorAll(".tab-content").forEach(c => {
    c.classList.toggle("active", c.id === idAba);
  });
}

// Renderização da Validação
function renderizarValidacao(registro) {
  registroAtual = registro;
  document.getElementById("validacao-placeholder").classList.add("hidden");
  document.getElementById("validacao-conteudo").classList.remove("hidden");

  document.getElementById("val-colaborador").textContent = registro.colaborador;
  document.getElementById("val-dia").textContent = registro.dia.split("-").reverse().join("/");

  const tbody = document.getElementById("val-tabela-body");
  tbody.innerHTML = "";

  registro.lancamentos.forEach((lanc, index) => {
    const tr = document.createElement("tr");

    // Select de Cards
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

// Adicionar Lançamento Manual
document.getElementById("btn-adicionar-lancamento").addEventListener("click", () => {
  if (!registroAtual) return;
  registroAtual.lancamentos.push(new Lancamento(60, "Atividade extra", CARDS[0]));
  renderizarValidacao(registroAtual);
});

// Relatório Geral
function atualizarTabelaGeral() {
  const { totais, quantidades } = service.totalPorColaborador();
  const tbody = document.getElementById("totais-tabela-body");
  tbody.innerHTML = "";

  const colabs = Object.keys(totais).sort();
  if (colabs.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" class="text-center">Nenhum dado registrado até o momento.</td></tr>`;
    return;
  }

  for (const colab of colabs) {
    const totalMin = totais[colab];
    const qtd = quantidades[colab];
    const media = totalMin / qtd;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>${colab}</strong></td>
      <td>${qtd} registro(s)</td>
      <td>${fmtHoras(totalMin)}</td>
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

  const reg = service.receberMensagem(colab, msg, dia);
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

  const reg = service.receberMensagem(item.colab, item.msg, campoDia.value);
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