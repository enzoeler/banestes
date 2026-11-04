class Lancamento {
  constructor(minutos, trecho, card) {
    this.minutos = minutos;
    this.trecho = trecho;
    this.card = card;
  }
}

class RegistroDiario {
  constructor(colaborador, dia, lancamentos = []) {
    this.colaborador = colaborador;
    this.dia = dia;
    this.lancamentos = lancamentos;
  }

  get totalMinutos() {
    return this.lancamentos.reduce((acc, l) => acc + parseInt(l.minutos || 0, 10), 0);
  }

  porCard() {
    const agrupado = {};
    for (const lanc of this.lancamentos) {
      const chave = lanc.card ? lanc.card.chave : null;
      agrupado[chave] = (agrupado[chave] || 0) + parseInt(lanc.minutos || 0, 10);
    }
    return agrupado;
  }

  get naoIdentificados() {
    return this.lancamentos.filter(l => l.card === null);
  }
}

class ApontamentoService {
  constructor() {
    this.registros = new Map();
  }

  receberMensagem(colaborador, mensagem, diaStr) {
    const lancamentosBrutos = interpretarMensagem(mensagem);
    const lancamentos = lancamentosBrutos.map(l => new Lancamento(l.minutos, l.trecho, l.card));
    const registro = new RegistroDiario(colaborador, diaStr, lancamentos);
    const chave = `${colaborador}_${diaStr}`;
    this.registros.set(chave, registro);
    return registro;
  }

  totalPorColaborador() {
    const totais = {};
    const quantidades = {};

    for (const [_, reg] of this.registros.entries()) {
      totais[reg.colaborador] = (totais[reg.colaborador] || 0) + reg.totalMinutos;
      quantidades[reg.colaborador] = (quantidades[reg.colaborador] || 0) + 1;
    }

    return { totais, quantidades };
  }
}

async function enviarAoJira(registro, config) {
  if (registro.naoIdentificados.length > 0) {
    throw new Error("Há lançamentos não identificados; revise antes de enviar.");
  }

  const { url, email, token } = config;
  const porCard = registro.porCard();
  const logs = [];
  const inicioISO = `${registro.dia}T09:00:00.000-0300`;

  for (const [chave, minutos] of Object.entries(porCard)) {
    const payload = {
      timeSpentSeconds: minutos * 60,
      started: inicioISO,
      comment: {
        type: "doc",
        version: 1,
        content: [{
          type: "paragraph",
          content: [{ type: "text", text: `Apontamento de ${registro.colaborador}` }]
        }]
      }
    };

    if (!url || !email || !token) {
      logs.push(`[SIMULADO] ${chave}: ${(minutos / 60).toFixed(1)}h registradas para ${registro.colaborador}`);
      continue;
    }

    const response = await fetch(`${url}/rest/api/3/issue/${chave}/worklog`, {
      method: "POST",
      headers: {
        "Authorization": "Basic " + btoa(`${email}:${token}`),
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Erro Jira (${chave}): Status ${response.status}`);
    }

    logs.push(`[JIRA REST] ${chave}: ${(minutos / 60).toFixed(1)}h registradas com sucesso!`);
  }

  return logs;
}