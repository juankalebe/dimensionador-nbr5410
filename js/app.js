// ==============================================================================
// CONTROLADOR REATIVO DA INTERFACE (UI) - IDENTIDADE VISUAL UPE
// Arquivo: js/app.js
// ==============================================================================

import { dimensionarCircuito } from './engine.js';
import { 
  TABELA_36_PVC, 
  TABELA_37_XLPE, 
  FCT_PVC, 
  FCT_XLPE, 
  FCA_A_F, 
  FCR_SOLO,
  CATALOGO_CABOS_DIAMETRO, 
  TABELA_ELETRODUTOS, 
  TABELA_ELETROCALHAS,
  TABELA_IMPEDANCIA_COBRE
} from './tables.js';

// Bitolas padronizadas
const SECOES_COMERCIAIS_TODAS = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240];
const SECOES_MAIORES_25 = [35, 50, 70, 95, 120, 150, 185, 240];

// ==============================================================================
// 1. MAPEAMENTO DOS ELEMENTOS DO DOM (ABA 1: GERAL)
// ==============================================================================
const inputs = {
  potencia: document.getElementById('potencia'),
  tensao: document.getElementById('tensao'),
  sistema: document.getElementById('sistema'),
  tipoUso: document.getElementById('tipoUso'),
  cosPhi: document.getElementById('cosPhi'),
  rendimento: document.getElementById('rendimento'),
  temperatura: document.getElementById('temperatura'),
  numCircuitos: document.getElementById('numCircuitos'),
  comprimento: document.getElementById('comprimento'),
  quedaMaxPercent: document.getElementById('quedaMaxPercent')
};

const outputs = {
  secaoFinal: document.getElementById('res-secao-final'),
  disjuntor: document.getElementById('res-disjuntor'),
  criterioBadge: document.getElementById('res-criterio-badge'),
  ib: document.getElementById('res-ib'),
  izNec: document.getElementById('res-iz-nec'),
  izReal: document.getElementById('res-iz-real'),
  quedaPercent: document.getElementById('res-queda-percent'),
  quedaVolts: document.getElementById('res-queda-volts'),
  quedaBar: document.getElementById('res-queda-bar'),
  quedaLimiteLabel: document.getElementById('res-queda-limite-label'),
  statusProtecao: document.getElementById('res-status-protecao')
};

const memorial = {
  ib: document.getElementById('mem-ib'),
  fatores: document.getElementById('mem-fatores'),
  sMin: document.getElementById('mem-s-min'),
  sCond: document.getElementById('mem-s-cond'),
  sQueda: document.getElementById('mem-s-queda'),
  sQuedaCalc: document.getElementById('mem-s-queda-calc'),
  protecao: document.getElementById('mem-protecao')
};

// ==============================================================================
// 2. MAPEAMENTO DOS ELEMENTOS DO DOM (ABA 2: AMPACIDADE & CORREÇÕES)
// ==============================================================================
let ampTipoAplicacao = 'geral'; // 'geral', 'motor' ou 'capacitor'

const ampControls = {
  tipoGeralBtn: document.getElementById('amp-tipo-geral-btn'),
  tipoMotorBtn: document.getElementById('amp-tipo-motor-btn'),
  tipoCapacitorBtn: document.getElementById('amp-tipo-capacitor-btn'),
  modoBadge: document.getElementById('amp-modo-badge'),
  motorModoWrapper: document.getElementById('amp-motor-modo-wrapper'),
  campoInDireta: document.getElementById('amp-campo-in-direta'),
  campoPotenciaWrapper: document.getElementById('amp-campo-potencia-wrapper'),
  campoCosPhiWrapper: document.getElementById('amp-campo-cosphi-wrapper'),
  campoCapacitorWrapper: document.getElementById('amp-campo-capacitor-wrapper'),
  campoRendimento: document.getElementById('amp-campo-rendimento'),
  campoFs: document.getElementById('amp-campo-fs')
};

const ampInputs = {
  tensao: document.getElementById('amp-tensao'),
  sistema: document.getElementById('amp-sistema'),
  inPlaca: document.getElementById('amp-in-placa'),
  potencia: document.getElementById('amp-potencia'),
  unidadePotencia: document.getElementById('amp-unidade-potencia'),
  potenciaReativa: document.getElementById('amp-potencia-reativa'),
  unidadeReativa: document.getElementById('amp-unidade-reativa'),
  cosPhi: document.getElementById('amp-cosPhi'),
  rendimento: document.getElementById('amp-rendimento'),
  fs: document.getElementById('amp-fs'),
  metodo: document.getElementById('amp-metodo'),
  isolacao: document.getElementById('amp-isolacao'),
  corrTemp: document.getElementById('amp-corr-temp'),
  corrAgrup: document.getElementById('amp-corr-agrup'),
  corrSolo: document.getElementById('amp-corr-solo')
};

const ampOutputs = {
  metodoBadge: document.getElementById('amp-res-metodo-badge'),
  secao: document.getElementById('amp-res-secao'),
  isolacaoLabel: document.getElementById('amp-res-isolacao-label'),
  iz: document.getElementById('amp-res-iz'),
  in: document.getElementById('amp-res-in'),
  ib: document.getElementById('amp-res-ib'),
  margem: document.getElementById('amp-res-margem'),
  formulaBox: document.getElementById('amp-res-formula-box'),
  fatorTotalBadge: document.getElementById('amp-fator-total-badge'),
  caboOrig: document.getElementById('amp-corr-cabo-orig'),
  izOrig: document.getElementById('amp-corr-iz-orig'),
  izDegradado: document.getElementById('amp-corr-iz-degradado'),
  statusCaboOrig: document.getElementById('amp-corr-status-cabo-orig'),
  badgeMudanca: document.getElementById('amp-corr-badge-mudanca'),
  secaoFinal: document.getElementById('amp-corr-secao-final'),
  izInstalado: document.getElementById('amp-corr-iz-instalado'),
  explicacao: document.getElementById('amp-corr-explicacao')
};

// ==============================================================================
// 3. MAPEAMENTO DOS ELEMENTOS DO DOM (ABA 3: CONDUTOS)
// ==============================================================================
let listaCabosConduto = [
  { caboId: 'pvc_2.5', qtd: 3 },
  { caboId: 'pvc_4',   qtd: 0 }
];

const condElements = {
  tabelaBody: document.getElementById('cond-tabela-cabos-body'),
  btnAddCabo: document.getElementById('cond-btn-add-cabo'),
  areaTotalLabel: document.getElementById('cond-res-area-total'),
  totalCondutoresLabel: document.getElementById('cond-res-total-condutores'),
  taxaLimiteBadge: document.getElementById('cond-taxa-eletroduto-badge'),
  eletrodutoNome: document.getElementById('cond-res-eletroduto-nome'),
  eletrodutoDint: document.getElementById('cond-res-eletroduto-dint'),
  eletrodutoOcupacao: document.getElementById('cond-res-eletroduto-ocupacao'),
  eletrodutoBar: document.getElementById('cond-eletroduto-bar'),
  eletrodutoProximos: document.getElementById('cond-res-eletroduto-proximos'),
  eletrocalhaNome: document.getElementById('cond-res-eletrocalha-nome'),
  eletrocalhaArea: document.getElementById('cond-res-eletrocalha-area'),
  eletrocalhaOcupacao: document.getElementById('cond-res-eletrocalha-ocupacao'),
  eletrocalhaBar: document.getElementById('cond-eletrocalha-bar'),
  eletrocalhaProximos: document.getElementById('cond-res-eletrocalha-proximos')
};

// ==============================================================================
// 4. MAPEAMENTO DOS ELEMENTOS DO DOM (ABA 4: QUEDA DE TENSÃO)
// ==============================================================================
let quedaModo = 'ate25'; // 'ate25' ou 'acima25'

const quedaControls = {
  btnAte25: document.getElementById('queda-modo-ate25-btn'),
  btnAcima25: document.getElementById('queda-modo-acima25-btn'),
  modoBadge: document.getElementById('queda-modo-badge'),
  wrapperSistema: document.getElementById('queda-wrapper-sistema'),
  wrapperMaterial: document.getElementById('queda-wrapper-material'),
  wrapperAcima25: document.getElementById('queda-wrapper-acima25')
};

const quedaInputs = {
  sistema: document.getElementById('queda-sistema'),
  tensao: document.getElementById('queda-tensao'),
  tensaoLabel: document.getElementById('queda-tensao-label'),
  corrente: document.getElementById('queda-corrente'),
  comprimento: document.getElementById('queda-comprimento'),
  limite: document.getElementById('queda-limite'),
  material: document.getElementById('queda-material'),
  cosPhi: document.getElementById('queda-cosphi'),
  ncp: document.getElementById('queda-ncp')
};

const quedaOutputs = {
  secaoComercial: document.getElementById('queda-res-secao-comercial'),
  metodoBadge: document.getElementById('queda-res-metodo-badge'),
  paraleloInfo: document.getElementById('queda-res-paralelo-info'),
  card2Titulo: document.getElementById('queda-res-card2-titulo'),
  card2Valor: document.getElementById('queda-res-card2-valor'),
  card2Unidade: document.getElementById('queda-res-card2-unidade'),
  card2Legenda: document.getElementById('queda-res-card2-legenda'),
  deltaPercent: document.getElementById('queda-res-delta-percent'),
  deltaVolts: document.getElementById('queda-res-delta-volts'),
  formulaBox: document.getElementById('queda-res-formula-box')
};

// Gerenciador Geral de Abas
const tabs = {
  btnGeral: document.getElementById('tab-btn-geral'),
  btnAmpacidade: document.getElementById('tab-btn-ampacidade'),
  btnCondutos: document.getElementById('tab-btn-condutos'),
  btnQueda: document.getElementById('tab-btn-queda'),
  contentGeral: document.getElementById('tab-content-geral'),
  contentAmpacidade: document.getElementById('tab-content-ampacidade'),
  contentCondutos: document.getElementById('tab-content-condutos'),
  contentQueda: document.getElementById('tab-content-queda')
};

// ==============================================================================
// 5. CÁLCULO DA ABA 1: DIMENSIONAMENTO GERAL (4 CRITÉRIOS)
// ==============================================================================
function atualizarCalculoGeral() {
  if (!inputs.potencia) return;

  const dados = {
    potencia: parseFloat(inputs.potencia.value) || 0,
    tensao: parseFloat(inputs.tensao.value) || 220,
    sistema: inputs.sistema.value,
    tipoUso: inputs.tipoUso.value,
    cosPhi: parseFloat(inputs.cosPhi.value) || 1.0,
    rendimento: parseFloat(inputs.rendimento.value) || 1.0,
    temperatura: parseInt(inputs.temperatura.value, 10) || 30,
    numCircuitos: parseInt(inputs.numCircuitos.value, 10) || 1,
    comprimento: parseFloat(inputs.comprimento.value) || 0,
    quedaMaxPercent: parseFloat(inputs.quedaMaxPercent.value) || 4.0
  };

  if (dados.potencia <= 0) return;

  const res = dimensionarCircuito(dados);

  outputs.secaoFinal.textContent = res.sFinal;
  outputs.disjuntor.textContent = res.disjuntor !== null ? res.disjuntor : '--';
  outputs.criterioBadge.textContent = `Critério: ${res.criterioGovernante}`;

  outputs.ib.textContent = res.ib.toFixed(2);
  outputs.izNec.textContent = res.izNecessario.toFixed(2);
  outputs.izReal.textContent = res.izRealInstalado.toFixed(2);

  outputs.quedaPercent.textContent = res.deltaVRealPercent.toFixed(2);
  outputs.quedaVolts.textContent = res.deltaVRealVolts.toFixed(2);
  outputs.quedaLimiteLabel.textContent = dados.quedaMaxPercent.toFixed(1);

  const proporcaoQueda = (res.deltaVRealPercent / dados.quedaMaxPercent) * 100;
  const larguraBarra = Math.min(Math.max(proporcaoQueda, 5), 100);
  outputs.quedaBar.style.width = `${larguraBarra}%`;

  if (res.deltaVRealPercent <= dados.quedaMaxPercent * 0.8) {
    outputs.quedaBar.className = 'h-full rounded-full transition-all duration-500 bg-upe-blue';
  } else if (res.deltaVRealPercent <= dados.quedaMaxPercent) {
    outputs.quedaBar.className = 'h-full rounded-full transition-all duration-500 bg-amber-500';
  } else {
    outputs.quedaBar.className = 'h-full rounded-full transition-all duration-500 bg-upe-red animate-pulse';
  }

  if (res.disjuntor !== null) {
    outputs.statusProtecao.className = 'p-3.5 rounded-lg border text-xs font-mono font-semibold transition-colors bg-blue-50 border-blue-200 text-[#1C3C78]';
    outputs.statusProtecao.innerHTML = `<strong>Coordenação NBR 5410 Válida:</strong> ${res.ib.toFixed(1)} A (Ib) ≤ <strong>${res.disjuntor} A (In)</strong> ≤ ${res.izRealInstalado.toFixed(1)} A (Iz real)`;
  } else {
    outputs.statusProtecao.className = 'p-3.5 rounded-lg border text-xs font-mono font-semibold transition-colors bg-red-50 border-red-200 text-[#ED232A]';
    outputs.statusProtecao.innerHTML = `<strong>Proteção Incompatível:</strong> Nenhum disjuntor comercial atende Ib (${res.ib.toFixed(1)} A) ≤ In ≤ Iz_real (${res.izRealInstalado.toFixed(1)} A).`;
  }

  const formulaIb = dados.sistema === 'trifasico'
    ? `Ib = P / (√3 · V · cosφ · η) = ${dados.potencia} / (1.732 · ${dados.tensao} · ${dados.cosPhi} · ${dados.rendimento}) = ${res.ib} A`
    : `Ib = P / (V · cosφ · η) = ${dados.potencia} / (${dados.tensao} · ${dados.cosPhi} · ${dados.rendimento}) = ${res.ib} A`;
  memorial.ib.textContent = formulaIb;

  memorial.fatores.textContent = `FCT (${dados.temperatura}°C) = ${res.fct.toFixed(2)} | FCA (${dados.numCircuitos} circ.) = ${res.fca.toFixed(2)} ➔ Fator Total = ${res.fTotal.toFixed(3)}. Corrente de catálogo: Iz' = Ib / Ftotal = ${res.ib} / ${res.fTotal.toFixed(3)} = ${res.izNecessario} A`;

  memorial.sMin.textContent = `${res.sMinima} mm²`;
  memorial.sCond.textContent = `${res.sConducao} mm² (Capacidade nominal: ${res.capacidadeTabela} A)`;
  memorial.sQueda.textContent = `${res.sQueda} mm²`;
  memorial.sQuedaCalc.textContent = `Calculada exata: ${res.sQuedaCalculadaExata} mm² (ΔV real: ${res.deltaVRealPercent}%)`;

  memorial.protecao.textContent = `Condição NBR 5410: Ib (${res.ib} A) ≤ In (${res.disjuntor || '--'} A) ≤ Iz_real (${res.izRealInstalado} A). Capacidade instalada: ${res.capacidadeTabela} A × ${res.fTotal.toFixed(3)} = ${res.izRealInstalado} A.`;
}

// ==============================================================================
// 6. CÁLCULO DA ABA 2: AMPACIDADE (DIRETA + CORREÇÃO AMBIENTAL)
// ==============================================================================
function atualizarCalculoAmpacidade() {
  if (!ampInputs.tensao) return;

  const V = parseFloat(ampInputs.tensao.value) || 220;
  const sistema = ampInputs.sistema.value;
  const metodo = ampInputs.metodo.value;
  const isolacao = ampInputs.isolacao.value;

  let inNominal = 0;
  let ib = 0;
  let formulaTexto = '';

  const motorInputType = document.querySelector('input[name="amp-motor-input-type"]:checked')?.value || 'potencia';

  if (ampTipoAplicacao === 'geral') {
    const P = parseFloat(ampInputs.potencia.value) || 0;
    const cosPhi = parseFloat(ampInputs.cosPhi.value) || 1.0;
    if (P <= 0 || V <= 0 || cosPhi <= 0) return;

    if (sistema === 'trifasico') {
      inNominal = P / (Math.sqrt(3) * V * cosPhi);
      formulaTexto = `Ib = P / (√3 · V · cosφ) = ${P} W / (1.732 · ${V} V · ${cosPhi}) = <strong>${inNominal.toFixed(2)} A</strong>`;
    } else {
      inNominal = P / (V * cosPhi);
      formulaTexto = `Ib = P / (V · cosφ) = ${P} W / (${V} V · ${cosPhi}) = <strong>${inNominal.toFixed(2)} A</strong>`;
    }
    ib = inNominal;

  } else if (ampTipoAplicacao === 'motor') {
    const fs = parseFloat(ampInputs.fs.value) || 1.0;

    if (motorInputType === 'corrente') {
      inNominal = parseFloat(ampInputs.inPlaca.value) || 0;
      ib = inNominal * fs;
      formulaTexto = `In (Placa) = ${inNominal.toFixed(2)} A | Ib = In · FS = ${inNominal.toFixed(2)} · ${fs} = <strong>${ib.toFixed(2)} A</strong>`;
    } else {
      let pVal = parseFloat(ampInputs.potencia.value) || 0;
      const unidade = ampInputs.unidadePotencia.value;
      const cosPhi = parseFloat(ampInputs.cosPhi.value) || 0.85;
      const eta = parseFloat(ampInputs.rendimento.value) || 0.88;

      let pWatts = pVal;
      if (unidade === 'cv') pWatts = pVal * 735.5;
      else if (unidade === 'hp') pWatts = pVal * 746;
      else if (unidade === 'kw') pWatts = pVal * 1000;

      if (sistema === 'trifasico') {
        inNominal = pWatts / (Math.sqrt(3) * V * cosPhi * eta);
        ib = inNominal * fs;
        formulaTexto = `In = ${pVal} ${unidade.toUpperCase()} (${pWatts.toFixed(0)}W) / (√3 · ${V}V · ${cosPhi} · ${eta}) = ${inNominal.toFixed(2)} A ➔ Ib = In · ${fs} (FS) = <strong>${ib.toFixed(2)} A</strong>`;
      } else {
        inNominal = pWatts / (V * cosPhi * eta);
        ib = inNominal * fs;
        formulaTexto = `In = ${pVal} ${unidade.toUpperCase()} (${pWatts.toFixed(0)}W) / (${V}V · ${cosPhi} · ${eta}) = ${inNominal.toFixed(2)} A ➔ Ib = In · ${fs} (FS) = <strong>${ib.toFixed(2)} A</strong>`;
      }
    }

  } else if (ampTipoAplicacao === 'capacitor') {
    let qVal = parseFloat(ampInputs.potenciaReativa.value) || 0;
    const unidadeReativa = ampInputs.unidadeReativa.value;
    const qVar = unidadeReativa === 'kvar' ? qVal * 1000 : qVal;

    if (qVar <= 0 || V <= 0) return;

    if (sistema === 'trifasico') {
      inNominal = qVar / (Math.sqrt(3) * V);
      ib = inNominal * 1.35;
      formulaTexto = `In = Q / (√3 · V) = ${qVar.toFixed(0)} var / (1.732 · ${V} V) = ${inNominal.toFixed(2)} A <br><span class="text-upe-red font-bold">➔ Ib = 1.35 · In (+35% Harmônicos) = 1.35 · ${inNominal.toFixed(2)} = <strong>${ib.toFixed(2)} A</strong></span>`;
    } else {
      inNominal = qVar / V;
      ib = inNominal * 1.35;
      formulaTexto = `In = Q / V = ${qVar.toFixed(0)} var / ${V} V = ${inNominal.toFixed(2)} A <br><span class="text-upe-red font-bold">➔ Ib = 1.35 · In (+35% Harmônicos) = 1.35 · ${inNominal.toFixed(2)} = <strong>${ib.toFixed(2)} A</strong></span>`;
    }
  }

  const tabela = isolacao === 'PVC' ? TABELA_36_PVC : TABELA_37_XLPE;
  const condKey = sistema === 'trifasico' ? 'n3' : 'n2';

  let condutorSemCorr = null;
  for (let i = 0; i < tabela.length; i++) {
    const item = tabela[i];
    const cap = item[metodo] ? item[metodo][condKey] : undefined;
    if (cap !== undefined && cap >= ib) {
      condutorSemCorr = { secao: item.secao, iz: cap };
      break;
    }
  }

  ampOutputs.in.textContent = inNominal.toFixed(2);
  ampOutputs.ib.textContent = ib.toFixed(2);
  ampOutputs.formulaBox.innerHTML = formulaTexto;
  ampOutputs.metodoBadge.textContent = `${metodo} / ${condKey === 'n3' ? '3 Cond.' : '2 Cond.'}`;
  ampOutputs.isolacaoLabel.textContent = `Cobre / ${isolacao === 'PVC' ? 'PVC 70°C (Tab. 36)' : 'XLPE/EPR 90°C (Tab. 37)'}`;

  if (condutorSemCorr) {
    const margem = condutorSemCorr.iz - ib;
    ampOutputs.secao.textContent = condutorSemCorr.secao;
    ampOutputs.iz.textContent = condutorSemCorr.iz.toFixed(1);
    ampOutputs.margem.textContent = `+${margem.toFixed(2)}`;
    ampOutputs.margem.className = 'text-base font-black font-mono text-emerald-700';
  } else {
    ampOutputs.secao.textContent = '> 240';
    ampOutputs.iz.textContent = '--';
    ampOutputs.margem.textContent = 'Sobrecarga';
    ampOutputs.margem.className = 'text-xs font-bold font-mono text-upe-red';
  }

  // Correção Térmica
  const tempVal = parseInt(ampInputs.corrTemp.value, 10) || 30;
  const agrupVal = parseInt(ampInputs.corrAgrup.value, 10) || 1;
  const soloVal = parseFloat(ampInputs.corrSolo.value) || 2.5;

  const fct = (isolacao === 'PVC' ? FCT_PVC[tempVal] : FCT_XLPE[tempVal]) || 1.0;
  const fca = FCA_A_F[agrupVal] || 1.0;
  const fcr = metodo === 'D' ? (FCR_SOLO[soloVal] || 1.0) : 1.0;

  const fTotal = fct * fca * fcr;
  ampOutputs.fatorTotalBadge.textContent = `Ftotal = ${fTotal.toFixed(3)} (FCT: ${fct.toFixed(2)} | FCA: ${fca.toFixed(2)}${metodo === 'D' ? ` | FCR: ${fcr.toFixed(2)}` : ''})`;

  if (condutorSemCorr) {
    const izDegradado = condutorSemCorr.iz * fTotal;
    ampOutputs.caboOrig.textContent = `${condutorSemCorr.secao} mm²`;
    ampOutputs.izOrig.textContent = `${condutorSemCorr.iz.toFixed(1)} A`;
    ampOutputs.izDegradado.textContent = `${izDegradado.toFixed(1)} A`;

    if (izDegradado >= ib) {
      ampOutputs.statusCaboOrig.className = 'p-2 rounded text-[11px] font-mono font-bold text-center bg-emerald-50 text-emerald-700 border border-emerald-200';
      ampOutputs.statusCaboOrig.textContent = `Mantém capacidade (Iz real ${izDegradado.toFixed(1)}A ≥ Ib ${ib.toFixed(1)}A)`;
    } else {
      ampOutputs.statusCaboOrig.className = 'p-2 rounded text-[11px] font-mono font-bold text-center bg-red-50 text-upe-red border border-red-200';
      ampOutputs.statusCaboOrig.textContent = `Reprovado por Fator Térmico (${izDegradado.toFixed(1)}A < Ib ${ib.toFixed(1)}A)`;
    }

    const izNecessarioCatalogo = ib / fTotal;
    let condutorCorrigido = null;

    for (let i = 0; i < tabela.length; i++) {
      const item = tabela[i];
      const cap = item[metodo] ? item[metodo][condKey] : undefined;
      if (cap !== undefined && cap >= izNecessarioCatalogo) {
        condutorCorrigido = {
          secao: item.secao,
          izNominal: cap,
          izInstalado: cap * fTotal
        };
        break;
      }
    }

    if (condutorCorrigido) {
      ampOutputs.secaoFinal.textContent = condutorCorrigido.secao;
      ampOutputs.izInstalado.textContent = `${condutorCorrigido.izInstalado.toFixed(1)} A`;

      if (condutorCorrigido.secao > condutorSemCorr.secao) {
        ampOutputs.badgeMudanca.className = 'text-[10px] font-bold px-2 py-0.5 rounded font-mono bg-upe-red text-white';
        ampOutputs.badgeMudanca.textContent = `Bitola Elevada: ${condutorSemCorr.secao} ➔ ${condutorCorrigido.secao} mm²`;
      } else {
        ampOutputs.badgeMudanca.className = 'text-[10px] font-bold px-2 py-0.5 rounded font-mono bg-emerald-700 text-white';
        ampOutputs.badgeMudanca.textContent = 'Bitola Mantida';
      }

      ampOutputs.explicacao.innerHTML = `Condutor selecionado: <strong>${condutorCorrigido.secao} mm²</strong> (Capacidade nominal: ${condutorCorrigido.izNominal} A × ${fTotal.toFixed(3)} = <strong>${condutorCorrigido.izInstalado.toFixed(1)} A instalada</strong>).`;
    } else {
      ampOutputs.secaoFinal.textContent = '> 240';
      ampOutputs.izInstalado.textContent = '--';
      ampOutputs.badgeMudanca.className = 'text-[10px] font-bold px-2 py-0.5 rounded font-mono bg-upe-red text-white';
      ampOutputs.badgeMudanca.textContent = 'Sobrecarga Normativa';
      ampOutputs.explicacao.innerHTML = `Nenhum condutor padrão até 240 mm² suporta a corrente corrigida de <strong>${izNecessarioCatalogo.toFixed(2)} A</strong>.`;
    }
  }
}

// ==============================================================================
// 7. FUNÇÕES DE CÁLCULO - ABA 3 (CONDUTOS)
// ==============================================================================
function renderizarLinhasCabos() {
  if (!condElements.tabelaBody) return;
  condElements.tabelaBody.innerHTML = '';

  listaCabosConduto.forEach((item, index) => {
    const caboInfo = CATALOGO_CABOS_DIAMETRO.find(c => c.id === item.caboId) || CATALOGO_CABOS_DIAMETRO[0];
    const areaUnit = (Math.PI * Math.pow(caboInfo.diametro, 2)) / 4;
    const areaTotalLinha = areaUnit * item.qtd;

    const tr = document.createElement('tr');
    tr.className = 'hover:bg-slate-50';
    tr.innerHTML = `
      <td class="py-2.5">
        <select data-index="${index}" class="cond-select-cabo bg-white border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 outline-none">
          ${CATALOGO_CABOS_DIAMETRO.map(c => `
            <option value="${c.id}" ${c.id === item.caboId ? 'selected' : ''}>
              ${c.tipo} ${c.secao}mm² (${c.polos})
            </option>
          `).join('')}
        </select>
      </td>
      <td class="py-2.5 text-center text-slate-600">${caboInfo.diametro.toFixed(2)}</td>
      <td class="py-2.5 text-center">
        <input type="number" data-index="${index}" min="0" max="100" value="${item.qtd}" class="cond-input-qtd w-14 text-center bg-white border border-slate-300 rounded px-1.5 py-1 text-xs font-bold outline-none" />
      </td>
      <td class="py-2.5 text-right font-bold text-slate-800">${areaTotalLinha.toFixed(1)}</td>
      <td class="py-2.5 text-center">
        <button type="button" data-index="${index}" class="cond-btn-del text-slate-400 hover:text-upe-red font-bold text-sm px-1.5 transition">✕</button>
      </td>
    `;
    condElements.tabelaBody.appendChild(tr);
  });

  document.querySelectorAll('.cond-select-cabo').forEach(sel => {
    sel.addEventListener('change', (e) => {
      const idx = e.target.getAttribute('data-index');
      listaCabosConduto[idx].caboId = e.target.value;
      renderizarLinhasCabos();
      atualizarCalculoCondutos();
    });
  });

  document.querySelectorAll('.cond-input-qtd').forEach(inp => {
    inp.addEventListener('input', (e) => {
      const idx = e.target.getAttribute('data-index');
      listaCabosConduto[idx].qtd = parseInt(e.target.value, 10) || 0;
      atualizarCalculoCondutos();
    });
  });

  document.querySelectorAll('.cond-btn-del').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = e.target.getAttribute('data-index');
      listaCabosConduto.splice(idx, 1);
      renderizarLinhasCabos();
      atualizarCalculoCondutos();
    });
  });
}

function atualizarCalculoCondutos() {
  if (!condElements.areaTotalLabel) return;

  let areaTotalCabos = 0;
  let totalCondutores = 0;

  listaCabosConduto.forEach(item => {
    const caboInfo = CATALOGO_CABOS_DIAMETRO.find(c => c.id === item.caboId);
    if (caboInfo && item.qtd > 0) {
      const areaUnit = (Math.PI * Math.pow(caboInfo.diametro, 2)) / 4;
      areaTotalCabos += areaUnit * item.qtd;

      const multiplicadorPolos = caboInfo.polos === 'Tetrapolar' ? 4 : 1;
      totalCondutores += item.qtd * multiplicadorPolos;
    }
  });

  condElements.areaTotalLabel.textContent = areaTotalCabos.toFixed(2);
  condElements.totalCondutoresLabel.textContent = totalCondutores;

  let taxaLimiteEletroduto = 0.40;
  if (totalCondutores === 1) taxaLimiteEletroduto = 0.53;
  else if (totalCondutores === 2) taxaLimiteEletroduto = 0.31;
  else taxaLimiteEletroduto = 0.40;

  condElements.taxaLimiteBadge.textContent = `Limite: ${(taxaLimiteEletroduto * 100).toFixed(0)}% (${totalCondutores} cond.)`;

  if (areaTotalCabos <= 0) {
    condElements.eletrodutoNome.textContent = '--';
    condElements.eletrodutoDint.textContent = '--';
    condElements.eletrodutoOcupacao.textContent = '0%';
    condElements.eletrodutoBar.style.width = '0%';
    if (condElements.eletrodutoProximos) condElements.eletrodutoProximos.innerHTML = '<p class="text-[11px] text-slate-400 italic">Aguardando dados...</p>';

    condElements.eletrocalhaNome.textContent = '--';
    condElements.eletrocalhaArea.textContent = '--';
    condElements.eletrocalhaOcupacao.textContent = '0%';
    condElements.eletrocalhaBar.style.width = '0%';
    if (condElements.eletrocalhaProximos) condElements.eletrocalhaProximos.innerHTML = '<p class="text-[11px] text-slate-400 italic">Aguardando dados...</p>';
    return;
  }

  // 1. Eletroduto
  let eletrodutoEscolhido = null;
  let idxEletroduto = -1;
  for (let i = 0; i < TABELA_ELETRODUTOS.length; i++) {
    const el = TABELA_ELETRODUTOS[i];
    const ocupacao = areaTotalCabos / el.areaTotal;
    if (ocupacao <= taxaLimiteEletroduto) {
      eletrodutoEscolhido = { ...el, ocupacaoPercent: ocupacao * 100 };
      idxEletroduto = i;
      break;
    }
  }

  if (eletrodutoEscolhido) {
    condElements.eletrodutoNome.textContent = eletrodutoEscolhido.nome;
    condElements.eletrodutoDint.textContent = eletrodutoEscolhido.dInt;
    condElements.eletrodutoOcupacao.textContent = `${eletrodutoEscolhido.ocupacaoPercent.toFixed(1)}%`;
    condElements.eletrodutoBar.style.width = `${Math.min(eletrodutoEscolhido.ocupacaoPercent, 100)}%`;

    const proximosEletrodutos = TABELA_ELETRODUTOS.slice(idxEletroduto + 1, idxEletroduto + 4);
    if (proximosEletrodutos.length > 0 && condElements.eletrodutoProximos) {
      condElements.eletrodutoProximos.innerHTML = proximosEletrodutos.map(item => {
        const ocup = (areaTotalCabos / item.areaTotal) * 100;
        return `
          <div class="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-100">
            <span class="font-bold text-slate-800">${item.nome} <span class="text-slate-400 font-normal">(Ø int. ${item.dInt} mm)</span></span>
            <span class="text-emerald-700 font-black">${ocup.toFixed(1)}%</span>
          </div>
        `;
      }).join('');
    } else if (condElements.eletrodutoProximos) {
      condElements.eletrodutoProximos.innerHTML = '<p class="text-[11px] text-slate-400 italic">Não há seções comerciais maiores cadastradas.</p>';
    }
  } else {
    condElements.eletrodutoNome.textContent = '> 4"';
    condElements.eletrodutoDint.textContent = '--';
    condElements.eletrodutoOcupacao.textContent = 'Sobrecarga';
    condElements.eletrodutoBar.style.width = '100%';
    if (condElements.eletrodutoProximos) condElements.eletrodutoProximos.innerHTML = '<p class="text-[11px] text-upe-red font-bold">Sobrecarga acima do diâmetro máximo de 4".</p>';
  }

  // 2. Eletrocalha
  const taxaLimiteEletrocalha = 0.40;
  let eletrocalhaEscolhida = null;
  let idxEletrocalha = -1;
  for (let i = 0; i < TABELA_ELETROCALHAS.length; i++) {
    const ec = TABELA_ELETROCALHAS[i];
    const ocupacao = areaTotalCabos / ec.areaTotal;
    if (ocupacao <= taxaLimiteEletrocalha) {
      eletrocalhaEscolhida = { ...ec, ocupacaoPercent: ocupacao * 100 };
      idxEletrocalha = i;
      break;
    }
  }

  if (eletrocalhaEscolhida) {
    condElements.eletrocalhaNome.textContent = eletrocalhaEscolhida.nome;
    condElements.eletrocalhaArea.textContent = eletrocalhaEscolhida.areaTotal;
    condElements.eletrocalhaOcupacao.textContent = `${eletrocalhaEscolhida.ocupacaoPercent.toFixed(1)}%`;
    condElements.eletrocalhaBar.style.width = `${Math.min(eletrocalhaEscolhida.ocupacaoPercent, 100)}%`;

    const proximasEletrocalhas = TABELA_ELETROCALHAS.slice(idxEletrocalha + 1, idxEletrocalha + 4);
    if (proximasEletrocalhas.length > 0 && condElements.eletrocalhaProximos) {
      condElements.eletrocalhaProximos.innerHTML = proximasEletrocalhas.map(item => {
        const ocup = (areaTotalCabos / item.areaTotal) * 100;
        return `
          <div class="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-100">
            <span class="font-bold text-slate-800">${item.nome} <span class="text-slate-400 font-normal">(${item.areaTotal} mm²)</span></span>
            <span class="text-emerald-700 font-black">${ocup.toFixed(1)}%</span>
          </div>
        `;
      }).join('');
    } else if (condElements.eletrocalhaProximos) {
      condElements.eletrocalhaProximos.innerHTML = '<p class="text-[11px] text-slate-400 italic">Não há seções comerciais maiores cadastradas.</p>';
    }
  } else {
    condElements.eletrocalhaNome.textContent = '> 200x200';
    condElements.eletrocalhaArea.textContent = '--';
    condElements.eletrocalhaOcupacao.textContent = 'Sobrecarga';
    condElements.eletrocalhaBar.style.width = '100%';
    if (condElements.eletrocalhaProximos) condElements.eletrocalhaProximos.innerHTML = '<p class="text-[11px] text-upe-red font-bold">Sobrecarga acima de 200x200 mm.</p>';
  }
}

// ==============================================================================
// 8. FUNÇÃO DE CÁLCULO - ABA 4: QUEDA DE TENSÃO (2 MÉTODOS)
// ==============================================================================
function atualizarCalculoQueda() {
  if (!quedaInputs.tensao) return;

  const V = parseFloat(quedaInputs.tensao.value) || 220;
  const Ic = parseFloat(quedaInputs.corrente.value) || 0;
  const Lc = parseFloat(quedaInputs.comprimento.value) || 0;
  const deltaVc = parseFloat(quedaInputs.limite.value) || 4.0;

  if (V <= 0 || Ic <= 0 || Lc <= 0 || deltaVc <= 0) return;

  if (quedaModo === 'ate25') {
    // ==========================================================================
    // MÉTODO 1: CONDUTORES ATÉ 25 mm² (SIMPLIFICADO)
    // ==========================================================================
    const sistema = quedaInputs.sistema.value;
    const material = quedaInputs.material.value;

    if (sistema === 'trifasico') {
      if (quedaInputs.tensaoLabel) quedaInputs.tensaoLabel.textContent = 'Tensão Fase-Fase Vff (V)';
    } else {
      if (quedaInputs.tensaoLabel) quedaInputs.tensaoLabel.textContent = 'Tensão Fase-Neutro Vfn (V)';
    }

    const rho = material === 'cobre' ? (1 / 56) : (1 / 34);
    let scCalculada = 0;
    let formulaStr = '';

    if (sistema === 'monofasico') {
      scCalculada = (200 * rho * Lc * Ic) / (deltaVc * V);
      formulaStr = `Sc = [200 · ρ · (Lc · Ic)] / (ΔVc · Vfn)<br>` +
                   `Sc = [200 · (1/${material === 'cobre' ? '56' : '34'}) · (${Lc} · ${Ic})] / (${deltaVc} · ${V}) = <strong>${scCalculada.toFixed(3)} mm²</strong>`;
    } else {
      scCalculada = (100 * Math.sqrt(3) * rho * Lc * Ic) / (deltaVc * V);
      formulaStr = `Sc = [100 · √3 · ρ · (Lc · Ic)] / (ΔVc · Vff)<br>` +
                   `Sc = [100 · 1.732 · (1/${material === 'cobre' ? '56' : '34'}) · (${Lc} · ${Ic})] / (${deltaVc} · ${V}) = <strong>${scCalculada.toFixed(3)} mm²</strong>`;
    }

    const scComercial = SECOES_COMERCIAIS_TODAS.find(s => s >= scCalculada) || null;

    let deltaVRealPercent = 0;
    let deltaVRealVolts = 0;

    if (scComercial) {
      if (sistema === 'monofasico') {
        deltaVRealPercent = (200 * rho * Lc * Ic) / (scComercial * V);
      } else {
        deltaVRealPercent = (100 * Math.sqrt(3) * rho * Lc * Ic) / (scComercial * V);
      }
      deltaVRealVolts = (deltaVRealPercent / 100) * V;
    }

    // Configuração dos Cards
    quedaOutputs.metodoBadge.textContent = 'Simplificado (≤ 25 mm²)';
    quedaOutputs.paraleloInfo.textContent = 'Condutor único por fase';
    quedaOutputs.card2Titulo.textContent = 'Seção Mínima Sc';
    quedaOutputs.card2Valor.textContent = scCalculada.toFixed(2);
    quedaOutputs.card2Unidade.textContent = 'mm²';
    quedaOutputs.card2Legenda.textContent = 'Cálculo analítico pela fórmula';

    quedaOutputs.formulaBox.innerHTML = formulaStr;

    if (scComercial) {
      quedaOutputs.secaoComercial.textContent = scComercial;
      quedaOutputs.deltaPercent.textContent = deltaVRealPercent.toFixed(2);
      quedaOutputs.deltaVolts.textContent = deltaVRealVolts.toFixed(2);
    } else {
      quedaOutputs.secaoComercial.textContent = '> 240';
      quedaOutputs.deltaPercent.textContent = '--';
      quedaOutputs.deltaVolts.textContent = '--';
    }

  } else {
    // ==========================================================================
    // MÉTODO 2: CONDUTORES > 25 mm² (FORMA COMPLETA - TRIFÁSICO)
    // ΔVc = [√3 · Ic · Lc · (R · cosθ + X · senθ)] / (10 · Ncp · Vff)  (%)
    // ==========================================================================
    if (quedaInputs.tensaoLabel) quedaInputs.tensaoLabel.textContent = 'Tensão Fase-Fase Vff (V)';

    const cosTheta = parseFloat(quedaInputs.cosPhi.value) || 0.85;
    const senTheta = Math.sqrt(Math.max(0, 1 - Math.pow(cosTheta, 2)));
    const ncp = parseInt(quedaInputs.ncp.value, 10) || 1;

    // Busca do menor condutor comercial > 25 mm² que atende ΔVc <= limite
    let condutorEscolhido = null;
    let deltaVCalculadoPercent = 0;
    let deltaVCalculadoVolts = 0;

    for (let i = 0; i < SECOES_MAIORES_25.length; i++) {
      const secao = SECOES_MAIORES_25[i];
      const imp = TABELA_IMPEDANCIA_COBRE[secao];
      if (!imp) continue;

      // Fórmula Completa da imagem
      const deltaPercent = (Math.sqrt(3) * Ic * Lc * (imp.r * cosTheta + imp.x * senTheta)) / (10 * ncp * V);

      if (deltaPercent <= deltaVc) {
        condutorEscolhido = {
          secao: secao,
          r: imp.r,
          x: imp.x,
          deltaPercent: deltaPercent,
          deltaVolts: (deltaPercent / 100) * V
        };
        deltaVCalculadoPercent = deltaPercent;
        deltaVCalculadoVolts = (deltaPercent / 100) * V;
        break;
      }
    }

    quedaOutputs.metodoBadge.textContent = 'Forma Completa (> 25 mm²)';
    quedaOutputs.paraleloInfo.textContent = `${ncp} condutor(es) em paralelo por fase`;
    quedaOutputs.card2Titulo.textContent = 'Queda Calculada';
    quedaOutputs.card2Valor.textContent = deltaVCalculadoPercent > 0 ? deltaVCalculadoPercent.toFixed(2) : '--';
    quedaOutputs.card2Unidade.textContent = '%';
    quedaOutputs.card2Legenda.textContent = `Limite máximo admitido: ${deltaVc.toFixed(1)}%`;

    if (condutorEscolhido) {
      quedaOutputs.secaoComercial.textContent = condutorEscolhido.secao;
      quedaOutputs.deltaPercent.textContent = condutorEscolhido.deltaPercent.toFixed(2);
      quedaOutputs.deltaVolts.textContent = condutorEscolhido.deltaVolts.toFixed(2);

      const termoImpedancia = (condutorEscolhido.r * cosTheta + condutorEscolhido.x * senTheta).toFixed(4);

      quedaOutputs.formulaBox.innerHTML = 
        `ΔVc = [√3 · Ic · Lc · (R · cosθ + X · senθ)] / (10 · Ncp · Vff)<br>` +
        `ΔVc = [1.732 · ${Ic} · ${Lc} · (${condutorEscolhido.r} · ${cosTheta} + ${condutorEscolhido.x} · ${senTheta.toFixed(3)})] / (10 · ${ncp} · ${V})<br>` +
        `ΔVc = [1.732 · ${Ic} · ${Lc} · ${termoImpedancia}] / (${10 * ncp * V}) = <strong>${condutorEscolhido.deltaPercent.toFixed(2)}%</strong> (${condutorEscolhido.deltaVolts.toFixed(2)} V)`;
    } else {
      quedaOutputs.secaoComercial.textContent = '> 240';
      quedaOutputs.deltaPercent.textContent = '--';
      quedaOutputs.deltaVolts.textContent = '--';
      quedaOutputs.formulaBox.innerHTML = `Nenhuma bitola até 240 mm² atende o limite de queda de ${deltaVc}%. <strong>Aumente o número de condutores em paralelo (Ncp).</strong>`;
    }
  }
}

// ==============================================================================
// 9. ALTERNÂNCIA DE MODOS NA ABA QUEDA DE TENSÃO
// ==============================================================================
function configurarModoQueda(modo) {
  quedaModo = modo;

  const btnAtivoClass = 'px-3 py-1.5 text-xs font-bold rounded-md bg-upe-blue text-white shadow-sm transition';
  const btnInativoClass = 'px-3 py-1.5 text-xs font-bold rounded-md text-slate-600 hover:text-upe-blue transition';

  if (modo === 'ate25') {
    quedaControls.btnAte25.className = btnAtivoClass;
    quedaControls.btnAcima25.className = btnInativoClass;
    quedaControls.modoBadge.textContent = 'Modo: Até 25 mm² (Simplificado)';

    quedaControls.wrapperSistema.classList.remove('hidden');
    quedaControls.wrapperMaterial.classList.remove('hidden');
    quedaControls.wrapperAcima25.classList.add('hidden');
  } else {
    quedaControls.btnAcima25.className = btnAtivoClass;
    quedaControls.btnAte25.className = btnInativoClass;
    quedaControls.modoBadge.textContent = 'Modo: > 25 mm² (Forma Completa)';

    quedaControls.wrapperSistema.classList.add('hidden');
    quedaControls.wrapperMaterial.classList.add('hidden');
    quedaControls.wrapperAcima25.classList.remove('hidden');
  }

  atualizarCalculoQueda();
}

// ==============================================================================
// 10. ALTERNÂNCIA DE MODOS NA ABA AMPACIDADE (GERAL vs MOTOR vs CAPACITOR)
// ==============================================================================
function configurarModoAmpacidade(tipo) {
  ampTipoAplicacao = tipo;

  const btnAtivoClass = 'px-3 py-1.5 text-xs font-bold rounded-md bg-upe-blue text-white shadow-sm transition';
  const btnInativoClass = 'px-3 py-1.5 text-xs font-bold rounded-md text-slate-600 hover:text-upe-blue transition';

  ampControls.tipoGeralBtn.className = tipo === 'geral' ? btnAtivoClass : btnInativoClass;
  ampControls.tipoMotorBtn.className = tipo === 'motor' ? btnAtivoClass : btnInativoClass;
  ampControls.tipoCapacitorBtn.className = tipo === 'capacitor' ? btnAtivoClass : btnInativoClass;

  if (tipo === 'geral') {
    ampControls.modoBadge.textContent = 'Modo: Carga Geral';
    ampControls.motorModoWrapper.classList.add('hidden');
    ampControls.campoInDireta.classList.add('hidden');
    ampControls.campoPotenciaWrapper.classList.remove('hidden');
    ampControls.campoCosPhiWrapper.classList.remove('hidden');
    ampControls.campoCapacitorWrapper.classList.add('hidden');
    ampControls.campoRendimento.classList.add('hidden');
    ampControls.campoFs.classList.add('hidden');

    ampInputs.potencia.value = '10000';
    ampInputs.unidadePotencia.value = 'w';
    ampInputs.cosPhi.value = '0.92';

  } else if (tipo === 'motor') {
    ampControls.modoBadge.textContent = 'Modo: Motor Elétrico';
    ampControls.motorModoWrapper.classList.remove('hidden');
    ampControls.campoCosPhiWrapper.classList.remove('hidden');
    ampControls.campoCapacitorWrapper.classList.add('hidden');
    ampControls.campoRendimento.classList.remove('hidden');
    ampControls.campoFs.classList.remove('hidden');

    ampInputs.potencia.value = '10';
    ampInputs.unidadePotencia.value = 'cv';
    ampInputs.cosPhi.value = '0.85';
    ampInputs.rendimento.value = '0.88';
    ampInputs.fs.value = '1.15';

    atualizarSubModoMotor();

  } else if (tipo === 'capacitor') {
    ampControls.modoBadge.textContent = 'Modo: Banco de Capacitores (+35%)';
    ampControls.motorModoWrapper.classList.add('hidden');
    ampControls.campoInDireta.classList.add('hidden');
    ampControls.campoPotenciaWrapper.classList.add('hidden');
    ampControls.campoCapacitorWrapper.classList.remove('hidden');
    ampControls.campoRendimento.classList.add('hidden');
    ampControls.campoFs.classList.add('hidden');

    ampInputs.potenciaReativa.value = '25';
    ampInputs.unidadeReativa.value = 'kvar';
  }

  atualizarCalculoAmpacidade();
}

function atualizarSubModoMotor() {
  if (ampTipoAplicacao !== 'motor') return;

  const motorInputType = document.querySelector('input[name="amp-motor-input-type"]:checked')?.value || 'potencia';

  if (motorInputType === 'corrente') {
    ampControls.campoInDireta.classList.remove('hidden');
    ampControls.campoPotenciaWrapper.classList.add('hidden');
    ampControls.campoRendimento.classList.add('hidden');
  } else {
    ampControls.campoInDireta.classList.add('hidden');
    ampControls.campoPotenciaWrapper.classList.remove('hidden');
    ampControls.campoRendimento.classList.remove('hidden');
  }
  atualizarCalculoAmpacidade();
}

// ==============================================================================
// 11. LISTENERS E EVENTOS
// ==============================================================================

// Aba 1
Object.values(inputs).forEach(input => {
  if (input) {
    input.addEventListener('input', atualizarCalculoGeral);
    input.addEventListener('change', atualizarCalculoGeral);
  }
});

// Aba 2
Object.values(ampInputs).forEach(input => {
  if (input) {
    input.addEventListener('input', atualizarCalculoAmpacidade);
    input.addEventListener('change', atualizarCalculoAmpacidade);
  }
});

document.querySelectorAll('input[name="amp-motor-input-type"]').forEach(radio => {
  radio.addEventListener('change', atualizarSubModoMotor);
});

if (ampControls.tipoGeralBtn) ampControls.tipoGeralBtn.addEventListener('click', () => configurarModoAmpacidade('geral'));
if (ampControls.tipoMotorBtn) ampControls.tipoMotorBtn.addEventListener('click', () => configurarModoAmpacidade('motor'));
if (ampControls.tipoCapacitorBtn) ampControls.tipoCapacitorBtn.addEventListener('click', () => configurarModoAmpacidade('capacitor'));

// Aba 3 (Condutos)
if (condElements.btnAddCabo) {
  condElements.btnAddCabo.addEventListener('click', () => {
    listaCabosConduto.push({ caboId: 'pvc_2.5', qtd: 1 });
    renderizarLinhasCabos();
    atualizarCalculoCondutos();
  });
}

// Aba 4 (Queda de Tensão)
Object.values(quedaInputs).forEach(input => {
  if (input) {
    input.addEventListener('input', atualizarCalculoQueda);
    input.addEventListener('change', atualizarCalculoQueda);
  }
});

if (quedaControls.btnAte25) quedaControls.btnAte25.addEventListener('click', () => configurarModoQueda('ate25'));
if (quedaControls.btnAcima25) quedaControls.btnAcima25.addEventListener('click', () => configurarModoQueda('acima25'));

// Alternador Geral de Abas
function alternarAba(abaAtiva) {
  const todasAbas = ['geral', 'ampacidade', 'condutos', 'queda'];
  todasAbas.forEach(aba => {
    const content = document.getElementById(`tab-content-${aba}`);
    const btn = document.getElementById(`tab-btn-${aba}`);
    if (aba === abaAtiva) {
      content?.classList.remove('hidden');
      if (btn) btn.className = 'pb-3 text-xs sm:text-sm font-bold border-b-2 border-upe-blue text-upe-blue transition';
    } else {
      content?.classList.add('hidden');
      if (btn) btn.className = 'pb-3 text-xs sm:text-sm font-bold border-b-2 border-transparent text-slate-500 hover:text-upe-blue transition';
    }
  });
}

if (tabs.btnGeral) tabs.btnGeral.addEventListener('click', () => alternarAba('geral'));
if (tabs.btnAmpacidade) tabs.btnAmpacidade.addEventListener('click', () => alternarAba('ampacidade'));
if (tabs.btnCondutos) tabs.btnCondutos.addEventListener('click', () => alternarAba('condutos'));
if (tabs.btnQueda) tabs.btnQueda.addEventListener('click', () => alternarAba('queda'));

// ==============================================================================
// 12. INICIALIZAÇÃO AUTOMÁTICA
// ==============================================================================
atualizarCalculoGeral();
atualizarCalculoAmpacidade();
renderizarLinhasCabos();
atualizarCalculoCondutos();
atualizarCalculoQueda();