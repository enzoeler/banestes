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
    this.carregarDoLocalStorage();
  }

  receberMensagem(colaborador, mensagem, diaStr) {
    const lancamentosBrutos = interpretarMensagem(mensagem);
    const lancamentos = lancamentosBrutos.map(l => new Lancamento(l.minutos, l.trecho, l.card));
    const registro = new RegistroDiario(colaborador, diaStr, lancamentos);
    
    const chave = `${colaborador}_${diaStr}`;
    this.registros.set(chave, registro);
    this.salvarNoLocalStorage();
    
    return registro;
  }

  obterRegistro(colaborador, diaStr) {
    const chave = `${colaborador}_${diaStr}`;
    return this.registros.get(chave) || null;
  }

  salvarNoLocalStorage() {
    const dadosObj = {};
    for (const [chave, reg] of this.registros.entries()) {
      dadosObj[chave] = {
        colaborador: reg.colaborador,
        dia: reg.dia,
        lancamentos: reg.lancamentos.map(l => ({
          minutos: l.minutos,
          trecho: l.trecho,
          card: l.card ? { chave: l.card.chave, nome: l.card.nome, palavrasChave: l.card.palavrasChave } : null
        }))
      };
    }
    localStorage.setItem("apontamentos_historico", JSON.stringify(dadosObj));
  }

  carregarDoLocalStorage() {
    const salvo = localStorage.getItem("apontamentos_historico");
    if (!salvo) return;

    try {
      const dadosObj = JSON.parse(salvo);
      for (const [chave, dados] of Object.entries(dadosObj)) {
        const lancamentos = dados.lancamentos.map(l => {
          let cardObj = null;
          if (l.card) {
            cardObj = CARDS.find(c => c.chave === l.card.chave) || new Card(l.card.chave, l.card.nome, l.card.palavrasChave);
          }
          return new Lancamento(l.minutos, l.trecho, cardObj);
        });
        const reg = new RegistroDiario(dados.colaborador, dados.dia, lancamentos);
        this.registros.set(chave, reg);
      }
    } catch (e) {
      console.error("Erro ao carregar histórico do localStorage:", e);
    }
  }

  // Agrupa e consolida os registros por Mês/Ano (YYYY-MM) e Colaborador
  consolidadoMensal(filtroMes = "") {
    const agrupado = [];
    const mapa = new Map();

    for (const [_, reg] of this.registros.entries()) {
      if (!reg.dia || reg.lancamentos.length === 0) continue;

      const mesAno = reg.dia.substring(0, 7); // Extrai "YYYY-MM"
      if (filtroMes && mesAno !== filtroMes) continue;

      const chaveGrupo = `${mesAno}_${reg.colaborador}`;
      if (!mapa.has(chaveGrupo)) {
        mapa.set(chaveGrupo, {
          mesAno: mesAno,
          colaborador: reg.colaborador,
          dias: 0,
          totalMinutos: 0
        });
      }

      const item = mapa.get(chaveGrupo);
      item.dias += 1;
      item.totalMinutos += reg.totalMinutos;
    }

    for (const item of mapa.values()) {
      agrupado.push(item);
    }

    // Ordena do mês mais recente para o mais antigo e depois por nome do colaborador
    return agrupado.sort((a, b) => {
      if (a.mesAno !== b.mesAno) return b.mesAno.localeCompare(a.mesAno);
      return a.colaborador.localeCompare(b.colaborador);
    });
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
      logs.push(`[SIMULADO] ${chave}: ${(minutos / 60).toFixed(1)}h registradas para ${registro.colaborador} em ${registro.dia}`);
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
