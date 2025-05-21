/**
 * DADOS DE OUTROS EVENTOS DAS CIDADES NA ROTA
 * Eventos além de aniversários de cidades (feiras, exposições, festas, etc)
 */

// Definição de outros eventos importantes por cidade
const outrosEventosCidades = {
  "Ribeirão Preto": [
    {
      titulo: "Agrishow",
      data: "24/04/2025",
      descricao: "Maior feira de agronegócio da América Latina com forte impacto no tráfego local",
      tipo: "Evento",
      impacto: "Alto"
    },
    {
      titulo: "Feira Tecnológica",
      data: "14/05/2025",
      descricao: "Exposição de novas tecnologias agrícolas",
      tipo: "Evento",
      impacto: "Médio"
    }
  ],
  "Jaú": [
    {
      titulo: "Festa do Rodeio",
      data: "09/06/2025",
      descricao: "Evento com grande circulação de veículos",
      tipo: "Evento",
      impacto: "Médio"
    }
  ],
  "Bauru": [
    {
      titulo: "Expo Bauru",
      data: "05/08/2025",
      descricao: "Feira agropecuária e industrial",
      tipo: "Evento", 
      impacto: "Alto"
    }
  ],
  "Itapeva": [
    {
      titulo: "ExpoAgro",
      data: "22/09/2025",
      descricao: "Exposição agrícola regional",
      tipo: "Evento",
      impacto: "Médio"
    }
  ],
  "São Paulo": [
    {
      titulo: "Virada Cultural",
      data: "18/05/2025",
      descricao: "Evento cultural com grande movimentação no centro",
      tipo: "Evento",
      impacto: "Alto"
    },
    {
      titulo: "Salão do Automóvel",
      data: "10/11/2025",
      descricao: "Grande exposição com fluxo intenso de visitantes",
      tipo: "Evento",
      impacto: "Médio"
    }
  ],
  "Dois Córregos": [
    {
      titulo: "Festa do Café",
      data: "15/07/2025",
      descricao: "Celebração da produção cafeeira local",
      tipo: "Evento",
      impacto: "Baixo"
    }
  ],
  "Piedade": [
    {
      titulo: "Festa do Kaki",
      data: "12/04/2025",
      descricao: "Exposição e venda da fruta símbolo da cidade",
      tipo: "Evento",
      impacto: "Baixo"
    }
  ],
  "Campinas": [
    {
      titulo: "TechCamp",
      data: "22/06/2025",
      descricao: "Evento de tecnologia e inovação",
      tipo: "Evento",
      impacto: "Médio"
    }
  ],
  "Santos": [
    {
      titulo: "Festival do Café",
      data: "13/07/2025",
      descricao: "Celebração da história cafeeira do porto",
      tipo: "Evento", 
      impacto: "Médio"
    }
  ],
  "Buri": [
    {
      titulo: "Festa da Mandioca",
      data: "08/11/2025",
      descricao: "Celebração da produção local de mandioca",
      tipo: "Evento",
      impacto: "Baixo"
    }
  ]
};

// Exportar os dados para uso em outros scripts
window.outrosEventosCidades = outrosEventosCidades;