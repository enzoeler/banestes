const JORNADA_MINUTOS = 8 * 60; // 480 minutos (8h)

class Card {
  constructor(chave, nome, palavrasChave) {
    this.chave = chave;
    this.nome = nome;
    this.palavrasChave = palavrasChave;
  }
}

const CARDS = [
  new Card("BAN-101", "Reunião Pix", ["reuniao", "pix", "alinhamento"]),
  new Card("BAN-304", "Desenvolvimento App", ["desenvolv", "tela", "aplicativo", "app", "codigo", "programa", "implement"]),
  new Card("BAN-050", "Atendimento Suporte", ["suporte", "erro", "chamado", "incidente", "atendimento", "bug"])
];