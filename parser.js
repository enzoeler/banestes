function normalizar(texto) {
  return texto
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

const NUMEROS_POR_EXTENSO = {
  "um": 1, "uma": 1, "dois": 2, "duas": 2, "tres": 3, "quatro": 4,
  "cinco": 5, "seis": 6, "sete": 7, "oito": 8
};

const REGEX_DURACAO = /(?:(?<h1 layout>\d{1,2})\s*h\s*(?<m1>\d{2})(?!\d)(?!\s*horas?)|(?<umameia>(?:uma|um)\s+hora\s+e\s+meia)|(?<meiahora>meia\s+hora)|(?<num>\d+(?:[.,]\d+)?|um|uma|dois|duas|tres|quatro|cinco|seis|sete|oito)\s*(?<unid>horas?|hrs?|hs?|minutos?|mins?)\b(?:\s*e\s*(?:(?<meia>meia)|(?<m2>\d{1,2})\s*min\w*))?)/gi;

function minutosDoMatch(match) {
  const groups = match.groups || {};

  if (groups.h1 && groups.m1) {
    return parseInt(groups.h1, 10) * 60 + parseInt(groups.m1, 10);
  }
  if (groups.umameia) return 90;
  if (groups.meiahora) return 30;

  const bruto = groups.num;
  if (!bruto) return 0;

  let valor = NUMEROS_POR_EXTENSO[bruto] !== undefined 
    ? NUMEROS_POR_EXTENSO[bruto] 
    : parseFloat(bruto.replace(",", "."));

  let minutos = 0;
  if (groups.unid && groups.unid.startsWith("m")) {
    minutos = Math.round(valor);
  } else {
    minutos = Math.round(valor * 60);
    if (groups.meia) {
      minutos += 30;
    } else if (groups.m2) {
      minutos += parseInt(groups.m2, 10);
    }
  }

  return minutos;
}

function identificarCard(textoNormalizado) {
  let melhor = null;
  let melhorPontos = 0;

  for (const card of CARDS) {
    let pontos = 0;
    for (const p of card.palavrasChave) {
      if (textoNormalizado.includes(p)) pontos++;
    }
    if (pontos > melhorPontos) {
      melhor = card;
      melhorPontos = pontos;
    }
  }
  return melhor;
}

const REGEX_SEPARADOR = /[,;.!?\n]|\s+e\s+|\s+depois\s+|\s+mas\s+|\s+alem\s+disso\s+/gi;

function limitesDasOracoes(texto, duracoes) {
  const protegidos = duracoes.map(d => ({ start: d.index, end: d.index + d[0].length }));
  const cortes = [0];

  let match;
  REGEX_SEPARADOR.lastIndex = 0;
  while ((match = REGEX_SEPARADOR.exec(texto)) !== null) {
    const start = match.index;
    const end = match.index + match[0].length;
    const estaProtegido = protegidos.some(p => (start > p.start && start < p.end) || (end > p.start && end <= p.end));
    
    if (!estaProtegido) {
      cortes.push(start);
      cortes.push(end);
    }
  }
  cortes.push(texto.length);

  const oracoes = [];
  for (let i = 0; i < cortes.length; i += 2) {
    oracoes.push([cortes[i], cortes[i + 1]]);
  }
  return oracoes;
}

function interpretarMensagem(mensagem) {
  const texto = normalizar(mensagem);
  
  const duracoes = [];
  let m;
  REGEX_DURACAO.lastIndex = 0;
  while ((m = REGEX_DURACAO.exec(texto)) !== null) {
    duracoes.push({ ...m, index: m.index, groups: m.groups ? { ...m.groups } : {} });
  }

  const oracoes = limitesDasOracoes(texto, duracoes);
  const lancamentos = [];

  for (const durMatch of duracoes) {
    const minutos = minutosDoMatch(durMatch);
    if (minutos <= 0) continue;

    const startPos = durMatch.index;
    const endPos = startPos + durMatch[0].length;

    const oracao = oracoes.find(([a, b]) => a <= startPos && startPos <= b) || [0, texto.length];
    const [ini, fim] = oracao;

    const vizinhas = duracoes.filter(d => ini <= d.index && d.index < fim);
    const pos = vizinhas.findIndex(d => d.index === startPos);

    const fimDepois = (pos + 1 < vizinhas.length) ? vizinhas[pos + 1].index : fim;
    const iniAntes = (pos > 0) ? (vizinhas[pos - 1].index + vizinhas[pos - 1][0].length) : ini;

    const depois = texto.substring(endPos, fimDepois);
    const antes = texto.substring(iniAntes, startPos);

    let card = identificarCard(depois);
    let trecho = depois;

    if (!card) {
      card = identificarCard(antes);
      trecho = antes;
    }

    const trechoFormatado = trecho.trim().replace(/^[,;.]+|[,;.]+$|^\s*|\s*$/g, "") || durMatch[0];
    lancamentos.push({ minutos, trecho: trechoFormatado, card });
  }

  return lancamentos;
}