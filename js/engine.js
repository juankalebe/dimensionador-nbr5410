// ==============================================================================
// MOTOR DE CÁLCULO DE DIMENSIONAMENTO DE CONDUTORES E PROTEÇÃO - NBR 5410
// Arquivo: js/engine.js
// ==============================================================================

import {
  SECAO_MINIMA,
  FCT_PVC,
  FCA_A_F,
  TABELA_B1_PVC,
  DISJUNTORES_COMERCIAIS
} from './tables.js';

/**
 * Realiza o dimensionamento elétrico completo de um circuito conforme a NBR 5410.
 * 
 * @param {Object} dados Objeto contendo os parâmetros de entrada do circuito.
 * @param {number} dados.potencia Potência ativa ou aparente da carga em Watts (W) ou VA.
 * @param {number} dados.tensao Tensão de alimentação em Volts (V), ex: 127, 220, 380.
 * @param {string} dados.sistema Tipo de sistema: 'monofasico', 'bifasico' ou 'trifasico'.
 * @param {number} [dados.cosPhi=1.0] Fator de potência da carga (padrão 1.0 para resistivas).
 * @param {number} [dados.rendimento=1.0] Rendimento do equipamento (padrão 1.0).
 * @param {string} dados.tipoUso Uso do circuito: 'iluminacao' ou 'forca'.
 * @param {number} [dados.temperatura=30] Temperatura ambiente em °C (padrão 30°C).
 * @param {number} [dados.numCircuitos=1] Quantidade de circuitos agrupados no conduto.
 * @param {number} dados.comprimento Distância do circuito em metros (m).
 * @param {number} [dados.quedaMaxPercent=4.0] Limite máximo de queda de tensão admissível em %.
 * 
 * @returns {Object} Relatório consolidado com os 4 critérios e a coordenação de proteção.
 */
export function dimensionarCircuito(dados) {
  // ----------------------------------------------------------------------------
  // PASSO 0: DESESTRUTURAÇÃO DOS PARÂMETROS COM VALORES PADRÃO
  // ----------------------------------------------------------------------------
  const {
    potencia,
    tensao,
    sistema,
    cosPhi = 1.0,
    rendimento = 1.0,
    tipoUso = 'forca',
    temperatura = 30,
    numCircuitos = 1,
    comprimento = 0,
    quedaMaxPercent = 4.0
  } = dados;

  // Constante da resistividade elétrica do cobre a 20°C (NBR 5410 / IEC)
  const RHO_COBRE = 1 / 58; // aprox. 0.017241 ohm * mm² / m

  // ----------------------------------------------------------------------------
  // PASSO 1: CÁLCULO DA CORRENTE DE PROJETO (Ib)
  // ----------------------------------------------------------------------------
  // Monofásico / Bifásico: Ib = P / (V * cosPhi * eta)
  // Trifásico:             Ib = P / (sqrt(3) * V * cosPhi * eta)
  let ib = 0;
  if (sistema === 'trifasico') {
    ib = potencia / (Math.sqrt(3) * tensao * cosPhi * rendimento);
  } else {
    ib = potencia / (tensao * cosPhi * rendimento);
  }

  // ----------------------------------------------------------------------------
  // PASSO 2: FATORES DE CORREÇÃO E CORRENTE CORRIGIDA (Iz')
  // ----------------------------------------------------------------------------
  // 1. FCT: Tabela 40 (temperatura de referência da norma é 30°C com fator 1.00)
  const fct = FCT_PVC[temperatura] !== undefined 
    ? FCT_PVC[temperatura] 
    : (temperatura === 30 ? 1.00 : 1.00);

  // 2. FCA: Tabela 42 (fator de agrupamento para circuitos no mesmo conduto)
  const fca = FCA_A_F[numCircuitos] !== undefined 
    ? FCA_A_F[numCircuitos] 
    : (numCircuitos > 20 ? 0.38 : 1.00);

  // Fator total combinado
  const fTotal = fct * fca;

  // Corrente fictícia que o condutor deve suportar na tabela de catálogo: Iz' = Ib / Ftotal
  const izNecessario = ib / fTotal;

  // ----------------------------------------------------------------------------
  // PASSO 3: CRITÉRIO 1 - SEÇÃO MÍNIMA (TABELA 47)
  // ----------------------------------------------------------------------------
  // Iluminação = 1.5 mm² | Força/Tomadas = 2.5 mm²
  const sMinima = SECAO_MINIMA[tipoUso] || 2.5;

  // ----------------------------------------------------------------------------
  // PASSO 4: CRITÉRIO 2 - CAPACIDADE DE CONDUÇÃO DE CORRENTE (TABELA 36 - MÉTODO B1)
  // ----------------------------------------------------------------------------
  // Trifásico utiliza a coluna de 3 condutores carregados ('n3').
  // Monofásico e Bifásico utilizam a coluna de 2 condutores carregados ('n2').
  const colunaCondutores = (sistema === 'trifasico') ? 'n3' : 'n2';

  // Encontra a menor seção comercial cuja capacidade nominal seja >= Iz'
  const itemConducao = TABELA_B1_PVC.find(linha => linha[colunaCondutores] >= izNecessario);
  const sConducao = itemConducao ? itemConducao.secao : null;

  // ----------------------------------------------------------------------------
  // PASSO 5: CRITÉRIO 3 - QUEDA DE TENSÃO ADMISSÍVEL (ΔV)
  // ----------------------------------------------------------------------------
  // Converte a porcentagem admissível para Volts
  const deltaVAdmVolts = (quedaMaxPercent / 100) * tensao;

  // Cálculo da seção teórica contínua:
  // Monofásico / Bifásico: S = (2 * rho * L * Ib * cosPhi) / deltaV_adm
  // Trifásico:             S = (sqrt(3) * rho * L * Ib * cosPhi) / deltaV_adm
  let sQuedaCalculada = 0;
  if (sistema === 'trifasico') {
    sQuedaCalculada = (Math.sqrt(3) * RHO_COBRE * comprimento * ib * cosPhi) / deltaVAdmVolts;
  } else {
    sQuedaCalculada = (2 * RHO_COBRE * comprimento * ib * cosPhi) / deltaVAdmVolts;
  }

  // Encontra a primeira seção comercial padrão que seja >= à calculada
  const itemQueda = TABELA_B1_PVC.find(linha => linha.secao >= sQuedaCalculada);
  const sQueda = itemQueda ? itemQueda.secao : null;

  // ----------------------------------------------------------------------------
  // PASSO 6: DETERMINAÇÃO DA SEÇÃO FINAL (GOVERNANTE)
  // ----------------------------------------------------------------------------
  // A seção final deve ser a maior entre todos os critérios válidos
  const secoesValidas = [sMinima];
  if (sConducao !== null) secoesValidas.push(sConducao);
  if (sQueda !== null) secoesValidas.push(sQueda);

  let sFinal = Math.max(...secoesValidas);

  // Garante que sFinal seja uma seção comercial existente na tabela
  const itemFinal = TABELA_B1_PVC.find(linha => linha.secao >= sFinal);
  sFinal = itemFinal ? itemFinal.secao : sFinal;

  // Cálculo da queda de tensão real obtida com o cabo comercial final escolhido
  let deltaVRealVolts = 0;
  if (sistema === 'trifasico') {
    deltaVRealVolts = (Math.sqrt(3) * RHO_COBRE * comprimento * ib * cosPhi) / sFinal;
  } else {
    deltaVRealVolts = (2 * RHO_COBRE * comprimento * ib * cosPhi) / sFinal;
  }
  const deltaVRealPercent = (deltaVRealVolts / tensao) * 100;

  // ----------------------------------------------------------------------------
  // PASSO 7: DIMENSIONAMENTO E COORDENAÇÃO DA PROTEÇÃO (DISJUNTOR In)
  // ----------------------------------------------------------------------------
  // Capacidade de corrente da seção final na tabela (sem fatores)
  const capacidadeTabelaFinal = itemFinal ? itemFinal[colunaCondutores] : 0;

  // Capacidade real de condução corrigida instalada: Iz_real = Iz_tab * Ftotal
  const izRealInstalado = capacidadeTabelaFinal * fTotal;

  // Regra fundamental da NBR 5410: Ib <= In <= Iz_real
  // Encontra o menor disjuntor comercial padrão que satisfaça a inequação
  const disjuntorEscolhido = DISJUNTORES_COMERCIAIS.find(inNom => {
    return inNom >= ib && inNom <= izRealInstalado;
  }) || null;

  // ----------------------------------------------------------------------------
  // PASSO 8: DIAGNÓSTICO DO CRITÉRIO DETERMINANTE
  // ----------------------------------------------------------------------------
  let criterioGovernante = "Capacidade de Condução";
  if (sFinal === sQueda && sQueda > (sConducao || 0) && sQueda > sMinima) {
    criterioGovernante = "Queda de Tensão";
  } else if (sFinal === sMinima && sMinima > (sConducao || 0) && sMinima > (sQueda || 0)) {
    criterioGovernante = "Seção Mínima";
  }

  // ----------------------------------------------------------------------------
  // PASSO 9: ESTRUTURAÇÃO DO OBJETO DE RETORNO
  // ----------------------------------------------------------------------------
  return {
    // Correntes
    ib: Number(ib.toFixed(2)),
    izNecessario: Number(izNecessario.toFixed(2)),
    izRealInstalado: Number(izRealInstalado.toFixed(2)),
    capacidadeTabela: capacidadeTabelaFinal,

    // Fatores de correção
    fct: Number(fct.toFixed(2)),
    fca: Number(fca.toFixed(2)),
    fTotal: Number(fTotal.toFixed(3)),

    // Seções intermediárias por critério (mm²)
    sMinima,
    sConducao: sConducao || 'Acima de 150 mm²',
    sQueda: sQueda || 'Acima de 150 mm²',
    sQuedaCalculadaExata: Number(sQuedaCalculada.toFixed(2)),
    
    // Decisão final
    sFinal,
    criterioGovernante,

    // Queda de tensão verificada
    deltaVRealVolts: Number(deltaVRealVolts.toFixed(2)),
    deltaVRealPercent: Number(deltaVRealPercent.toFixed(2)),
    quedaAtendida: deltaVRealPercent <= quedaMaxPercent,

    // Proteção
    disjuntor: disjuntorEscolhido,
    statusProtecao: disjuntorEscolhido 
      ? `Disjuntor de ${disjuntorEscolhido} A coordenado (Ib: ${ib.toFixed(1)} A ≤ In: ${disjuntorEscolhido} A ≤ Iz: ${izRealInstalado.toFixed(1)} A)` 
      : 'Incompatível: aumente a bitola do condutor para elevar Iz_real ou ajuste a corrente de projeto.'
  };
}