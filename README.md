# banestes

# ⏱️ Sistema de Apontamento de Horas por Relato Livre

Sistema web interativo para conversão automática de relatos diários de colaboradores em lançamentos estruturados de horas, com validação diária, edição dinâmica e integração com o **Jira Worklog**.

O projeto replica e expande a inteligência de um script Python em uma interface web moderna, modular e 100% em português.

---

## 📂 Estrutura de Arquivos

O projeto é dividido em arquivos modulares para facilitar a manutenção e organização:

```text
├── index.html        # Estrutura principal da página, abas e modais
├── styles.css        # Folha de estilos unificada (Design System corporativo)
├── cards.js          # Cadastro de cards do Jira e palavras-chave
├── parser.js         # Motor de expressões regulares (Regex) e interpretação de texto
├── service.js        # Modelos de dados, controle de registros e API do Jira
└── app.js            # Controlador da interface, navegação por abas e reatividade
