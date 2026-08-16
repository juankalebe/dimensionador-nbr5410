// ==============================================================================
// CONTROLADOR REATIVO DA INTERFACE (UI) - IDENTIDADE VISUAL UPE
// Arquivo: js/app.js
// ==============================================================================

import { dimensionarCircuito } from './engine.js';
import { TABELA_36_PVC, TABELA_37_XLPE } from './tables.js';

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

const presets = {
  chuveiro: document.getElementById('preset-chuveiro'),
  ar: document.getElementById('preset-ar'),
  tugs: document.getElementById('preset-tugs'),
  ilum: document.getElementById('preset-ilum')
};

// ==============================================================================
// 2. MAPEAMENTO DOS ELEMENTOS DO DOM (ABA 2: AMPACIDADE, MOTORES & CAPACITORES)
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
  isolacao: document.getElementById('amp-isolacao')
};

const ampOutputs = {
  metodoBadge: document.getElementById('amp-res-metodo-badge'),
  secao: document.getElementById('amp-res-secao'),
  isolacaoLabel: document.getElementById('amp-res-isolacao-label'),
  iz: document.getElementById('amp-res-iz'),
  in: document.getElementById('amp-res-in'),
  ib: document.getElementById('amp-res-ib'),
  margem: document.getElementById('amp-res-margem'),
  formulaBox: document.getElementById('amp-res-formula-box')
};

const tabs = {
  btnGeral: document.getElementById('tab-btn-geral'),
  btnAmpacidade: document.getElementById('tab-btn-ampacidade'),
  contentGeral: document.getElementById('tab-content-geral'),
  contentAmpacidade: document.getElementById('tab-content-ampacidade')
};

// ==============================================================================
// 3. CÁLCULO DA ABA 1: DIMENSIONAMENTO GERAL (4 CRITÉRIOS)
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
  outputs.disjuntor.textContent = res.disjuntor !== null ? res.disjuntor : '⚠️';
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
    outputs.statusProtecao.innerHTML = `✔ <strong>Coordenação NBR 5410 Válida:</strong> ${res.ib.toFixed(1)} A (Ib) ≤ <strong>${res.disjuntor} A (In)</strong> ≤ ${res.izRealInstalado.toFixed(1)} A (Iz real)`;
  } else {
    outputs.statusProtecao.className = 'p-3.5 rounded-lg border text-xs font-mono font-semibold transition-colors bg-red-50 border-red-200 text-[#ED232A]';
    outputs.statusProtecao.innerHTML = `✖ <strong>Proteção Incompatível:</strong> Nenhum disjuntor comercial atende Ib (${res.ib.toFixed(1)} A) ≤ In ≤ Iz_real (${res.izRealInstalado.toFixed(1)} A).`;
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
// 4. CÁLCULO DA ABA 2: AMPACIDADE (GERAL, MOTORES & BANCO DE CAPACITORES)
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
    // CARGA GERAL
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
    // MOTOR ELÉTRICO
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
    // BANCO DE CAPACITORES (+35% SOBRECORRENTE)
    let qVal = parseFloat(ampInputs.potenciaReativa.value) || 0;
    const unidadeReativa = ampInputs.unidadeReativa.value;
    const qVar = unidadeReativa === 'kvar' ? qVal * 1000 : qVal;

    if (qVar <= 0 || V <= 0) return;

    if (sistema === 'trifasico') {
      inNominal = qVar / (Math.sqrt(3) * V);
      ib = inNominal * 1.35;
      formulaTexto = `In = Q / (√3 · V) = ${qVar.toFixed(0)} var / (1.732 · ${V} V) = ${inNominal.toFixed(2)} A <br><span class="text-upe-red font-bold">➔ Ib = 1.35 · In (+35% Harmônicos/Sobretensão) = 1.35 · ${inNominal.toFixed(2)} = <strong>${ib.toFixed(2)} A</strong></span>`;
    } else {
      inNominal = qVar / V;
      ib = inNominal * 1.35;
      formulaTexto = `In = Q / V = ${qVar.toFixed(0)} var / ${V} V = ${inNominal.toFixed(2)} A <br><span class="text-upe-red font-bold">➔ Ib = 1.35 · In (+35% Harmônicos/Sobretensão) = 1.35 · ${inNominal.toFixed(2)} = <strong>${ib.toFixed(2)} A</strong></span>`;
    }
  }

  // Consulta na Tabela da NBR 5410 (Iz >= Ib)
  const tabela = isolacao === 'PVC' ? TABELA_36_PVC : TABELA_37_XLPE;
  const condKey = sistema === 'trifasico' ? 'n3' : 'n2';

  let condutorEncontrado = null;

  for (let i = 0; i < tabela.length; i++) {
    const item = tabela[i];
    const capacidade = item[metodo] ? item[metodo][condKey] : undefined;

    if (capacidade !== undefined && capacidade >= ib) {
      condutorEncontrado = {
        secao: item.secao,
        iz: capacidade
      };
      break;
    }
  }

  // Atualização Visual
  ampOutputs.in.textContent = inNominal.toFixed(2);
  ampOutputs.ib.textContent = ib.toFixed(2);
  ampOutputs.formulaBox.innerHTML = formulaTexto;
  ampOutputs.metodoBadge.textContent = `${metodo} / ${condKey === 'n3' ? '3 Cond.' : '2 Cond.'}`;
  ampOutputs.isolacaoLabel.textContent = `Cobre / ${isolacao === 'PVC' ? 'PVC 70°C (Tab. 36)' : 'XLPE/EPR 90°C (Tab. 37)'}`;

  if (condutorEncontrado) {
    const margem = condutorEncontrado.iz - ib;
    ampOutputs.secao.textContent = condutorEncontrado.secao;
    ampOutputs.iz.textContent = condutorEncontrado.iz.toFixed(1);
    ampOutputs.margem.textContent = `+${margem.toFixed(2)}`;
    ampOutputs.margem.className = 'text-base font-black font-mono text-emerald-700';
  } else {
    ampOutputs.secao.textContent = '> 240';
    ampOutputs.iz.textContent = '--';
    ampOutputs.margem.textContent = 'Sobrecarga';
    ampOutputs.margem.className = 'text-xs font-bold font-mono text-upe-red';
  }
}

// ==============================================================================
// 5. ALTERNÂNCIA DE MODOS NA ABA AMPACIDADE (GERAL vs MOTOR vs CAPACITOR)
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
// 6. LISTENERS E EVENTOS
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

// Presets Aba 1
function aplicarPreset(config) {
  inputs.potencia.value = config.potencia;
  inputs.tensao.value = config.tensao;
  inputs.sistema.value = config.sistema;
  inputs.tipoUso.value = config.tipoUso;
  inputs.cosPhi.value = config.cosPhi;
  inputs.rendimento.value = config.rendimento;
  inputs.temperatura.value = config.temperatura;
  inputs.numCircuitos.value = config.numCircuitos;
  inputs.comprimento.value = config.comprimento;
  inputs.quedaMaxPercent.value = config.quedaMaxPercent;
  atualizarCalculoGeral();
}

if (presets.chuveiro) {
  presets.chuveiro.addEventListener('click', () => {
    aplicarPreset({ potencia: 7500, tensao: 220, sistema: 'monofasico', tipoUso: 'forca', cosPhi: 1.0, rendimento: 1.0, temperatura: 35, numCircuitos: 2, comprimento: 18, quedaMaxPercent: 4.0 });
  });
}
if (presets.ar) {
  presets.ar.addEventListener('click', () => {
    aplicarPreset({ potencia: 1400, tensao: 220, sistema: 'monofasico', tipoUso: 'forca', cosPhi: 0.85, rendimento: 0.90, temperatura: 35, numCircuitos: 1, comprimento: 22, quedaMaxPercent: 4.0 });
  });
}
if (presets.tugs) {
  presets.tugs.addEventListener('click', () => {
    aplicarPreset({ potencia: 2200, tensao: 127, sistema: 'monofasico', tipoUso: 'forca', cosPhi: 1.0, rendimento: 1.0, temperatura: 30, numCircuitos: 3, comprimento: 12, quedaMaxPercent: 4.0 });
  });
}
if (presets.ilum) {
  presets.ilum.addEventListener('click', () => {
    aplicarPreset({ potencia: 600, tensao: 220, sistema: 'monofasico', tipoUso: 'iluminacao', cosPhi: 0.95, rendimento: 1.0, temperatura: 30, numCircuitos: 2, comprimento: 25, quedaMaxPercent: 4.0 });
  });
}

// Alternador de Abas
function alternarAba(abaAtiva) {
  if (abaAtiva === 'geral') {
    tabs.contentGeral.classList.remove('hidden');
    tabs.contentAmpacidade.classList.add('hidden');
    tabs.btnGeral.className = 'pb-3 text-xs sm:text-sm font-bold border-b-2 border-upe-blue text-upe-blue transition';
    tabs.btnAmpacidade.className = 'pb-3 text-xs sm:text-sm font-bold border-b-2 border-transparent text-slate-500 hover:text-upe-blue transition';
  } else if (abaAtiva === 'ampacidade') {
    tabs.contentGeral.classList.add('hidden');
    tabs.contentAmpacidade.classList.remove('hidden');
    tabs.btnAmpacidade.className = 'pb-3 text-xs sm:text-sm font-bold border-b-2 border-upe-blue text-upe-blue transition';
    tabs.btnGeral.className = 'pb-3 text-xs sm:text-sm font-bold border-b-2 border-transparent text-slate-500 hover:text-upe-blue transition';
  }
}

if (tabs.btnGeral && tabs.btnAmpacidade) {
  tabs.btnGeral.addEventListener('click', () => alternarAba('geral'));
  tabs.btnAmpacidade.addEventListener('click', () => alternarAba('ampacidade'));
}

// Inicialização
atualizarCalculoGeral();
atualizarCalculoAmpacidade();