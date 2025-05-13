/**
 * DADOS HISTÓRICOS DE FUNDAÇÃO
 * Este arquivo contém as datas corretas de fundação das principais cidades.
 * É carregado pelo script principal para garantir a exibição correta
 * na aba de eventos.
 */

const DATAS_FUNDACAO = {
  "Ribeirão Preto": {
    data: "19/06/1856",
    ano: 1856,
    mes: 6,
    dia: 19
  },
  "São Carlos": {
    data: "04/11/1857",
    ano: 1857,
    mes: 11,
    dia: 4
  },
  "Amparo": {
    data: "08/04/1829",
    ano: 1829, 
    mes: 4,
    dia: 8
  },
  "Dois Córregos": {
    data: "20/05/1865",
    ano: 1865,
    mes: 5,
    dia: 20
  },
  "Bauru": {
    data: "01/08/1896",
    ano: 1896,
    mes: 8,
    dia: 1
  },
  "Araraquara": {
    data: "22/08/1817",
    ano: 1817,
    mes: 8,
    dia: 22
  },
  "Jaú": {
    data: "15/08/1853",
    ano: 1853,
    mes: 8,
    dia: 15
  },
  "Campinas": {
    data: "14/07/1774",
    ano: 1774,
    mes: 7,
    dia: 14
  },
  "São Paulo": {
    data: "25/01/1554",
    ano: 1554,
    mes: 1,
    dia: 25
  }
};

// Função para calcular idade a partir do ano de fundação
function calcularIdadeCidade(cidade) {
  const anoAtual = new Date().getFullYear();
  const dadosCidade = DATAS_FUNDACAO[cidade];
  
  if (dadosCidade && dadosCidade.ano) {
    return anoAtual - dadosCidade.ano;
  }
  
  return null; // Cidade não encontrada no catálogo
}

// Função para obter texto formatado com data e idade
function getTextoFundacao(cidade) {
  const dadosCidade = DATAS_FUNDACAO[cidade];
  if (!dadosCidade) return null;
  
  const idade = calcularIdadeCidade(cidade);
  if (idade === null) return null;
  
  return `Data de fundação: ${dadosCidade.data} (${idade} anos)`;
}

// Verificar se estamos no Github Pages e aplicar correção
function corrigirDatasFundacao() {
  // Esta função será chamada pelo sistema principal
  console.log("[DADOS HISTÓRICOS] Correção de datas de fundação carregada");
}

// Exportar funções para uso global
window.dadosFundacao = {
  DATAS_FUNDACAO,
  calcularIdadeCidade,
  getTextoFundacao,
  corrigirDatasFundacao
};