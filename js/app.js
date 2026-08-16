// ==============================================================================
// CONTROLADOR REATIVO DA INTERFACE (UI) - NBR 5410
// Arquivo: js/app.js
// ==============================================================================

import { dimensionarCircuito } from './engine.js';

// ------------------------------------------------------------------------------
// 1. MAPEAMENTO DOS ELEMENTOS DO DOM (Inputs, Saídas e Memorial)
// ------------------------------------------------------------------------------
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

// ------------------------------------------------------------------------------
// 2. FUNÇÃO PRINCIPAL DE LEITURA, CÁLCULO E RENDERIZAÇÃO
// ------------------------------------------------------------------------------
function atualizarCalculo() {
  // Leitura e sanitização dos dados do formulário
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

  // Se a potência for inválida ou zerada, encerra sem quebrar a tela
  if (dados.potencia <= 0) return;

  // Execução do motor de cálculo da NBR 5410
  const res = dimensionarCircuito(dados);

  // ----------------------------------------------------------------------------
  // ATUALIZAÇÃO DOS CARDS PRINCIPAIS E TELEMETRIA
  // ----------------------------------------------------------------------------
  outputs.secaoFinal.textContent = res.sFinal;
  outputs.disjuntor.textContent = res.disjuntor !== null ? res.disjuntor : '⚠️';
  outputs.criterioBadge.textContent = `Critério: ${res.criterioGovernante}`;

  outputs.ib.textContent = res.ib.toFixed(2);
  outputs.izNec.textContent = res.izNecessario.toFixed(2);
  outputs.izReal.textContent = res.izRealInstalado.toFixed(2);

  outputs.quedaPercent.textContent = res.deltaVRealPercent.toFixed(2);
  outputs.quedaVolts.textContent = res.deltaVRealVolts.toFixed(2);
  outputs.quedaLimiteLabel.textContent = dados.quedaMaxPercent.toFixed(1);

  // Barra visual de Queda de Tensão
  const proporcaoQueda = (res.deltaVRealPercent / dados.quedaMaxPercent) * 100;
  const larguraBarra = Math.min(Math.max(proporcaoQueda, 5), 100);
  outputs.quedaBar.style.width = `${larguraBarra}%`;

  // Estilização dinâmica da barra de queda conforme a severidade
  if (res.deltaVRealPercent <= dados.quedaMaxPercent * 0.8) {
    outputs.quedaBar.className = 'h-full rounded-full transition-all duration-500 bg-teal-500';
  } else if (res.deltaVRealPercent <= dados.quedaMaxPercent) {
    outputs.quedaBar.className = 'h-full rounded-full transition-all duration-500 bg-amber-500';
  } else {
    outputs.quedaBar.className = 'h-full rounded-full transition-all duration-500 bg-rose-500 animate-pulse';
  }

  // Estilização e texto do status de proteção
  if (res.disjuntor !== null) {
    outputs.statusProtecao.className = 'p-3.5 rounded-xl border text-xs font-mono transition-colors bg-teal-500/10 border-teal-500/30 text-teal-300';
    outputs.statusProtecao.innerHTML = `✔ <strong>Coordenação Válida:</strong> ${res.ib.toFixed(1)} A (Ib) ≤ <strong>${res.disjuntor} A (In)</strong> ≤ ${res.izRealInstalado.toFixed(1)} A (Iz real)`;
  } else {
    outputs.statusProtecao.className = 'p-3.5 rounded-xl border text-xs font-mono transition-colors bg-rose-500/10 border-rose-500/30 text-rose-300';
    outputs.statusProtecao.innerHTML = `✖ <strong>Proteção Incompatível:</strong> Nenhum disjuntor comercial atende a inequação Ib (${res.ib.toFixed(1)} A) ≤ In ≤ Iz_real (${res.izRealInstalado.toFixed(1)} A). Aumente a bitola do cabo.`;
  }

  // ----------------------------------------------------------------------------
  // ATUALIZAÇÃO DO MEMORIAL DE CÁLCULO PASSO A PASSO
  // ----------------------------------------------------------------------------
  const formulaIb = dados.sistema === 'trifasico'
    ? `Ib = P / (√3 · V · cosφ · η) = ${dados.potencia} / (1.732 · ${dados.tensao} · ${dados.cosPhi} · ${dados.rendimento}) = ${res.ib} A`
    : `Ib = P / (V · cosφ · η) = ${dados.potencia} / (${dados.tensao} · ${dados.cosPhi} · ${dados.rendimento}) = ${res.ib} A`;
  memorial.ib.textContent = formulaIb;

  memorial.fatores.textContent = `FCT (${dados.temperatura}°C) = ${res.fct.toFixed(2)} | FCA (${dados.numCircuitos} circ.) = ${res.fca.toFixed(2)} ➔ Fator Total = ${res.fTotal.toFixed(3)}. Corrente fictícia de catálogo: Iz' = Ib / Ftotal = ${res.ib} / ${res.fTotal.toFixed(3)} = ${res.izNecessario} A`;

  memorial.sMin.textContent = `${res.sMinima} mm²`;
  memorial.sCond.textContent = `${res.sConducao} mm² (Capacidade nominal de catálogo: ${res.capacidadeTabela} A)`;
  memorial.sQueda.textContent = `${res.sQueda} mm²`;
  memorial.sQuedaCalc.textContent = `Calculada exata: ${res.sQuedaCalculadaExata} mm² (ΔV real: ${res.deltaVRealPercent}%)`;

  memorial.protecao.textContent = `Condição NBR 5410: Ib (${res.ib} A) ≤ In (${res.disjuntor || '--'} A) ≤ Iz_real (${res.izRealInstalado} A). Capacidade instalada corrigida: ${res.capacidadeTabela} A × ${res.fTotal.toFixed(3)} = ${res.izRealInstalado} A.`;
}

// ------------------------------------------------------------------------------
// 3. REGISTRO DE EVENT LISTENERS (REATIVIDADE INSTANTÂNEA)
// ------------------------------------------------------------------------------
Object.values(inputs).forEach(input => {
  input.addEventListener('input', atualizarCalculo);
  input.addEventListener('change', atualizarCalculo);
});

// ------------------------------------------------------------------------------
// 4. CONFIGURAÇÃO DOS PRESETS RÁPIDOS
// ------------------------------------------------------------------------------
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
  atualizarCalculo();
}

presets.chuveiro.addEventListener('click', () => {
  aplicarPreset({
    potencia: 7500, tensao: 220, sistema: 'monofasico', tipoUso: 'forca',
    cosPhi: 1.0, rendimento: 1.0, temperatura: 35, numCircuitos: 2, comprimento: 18, quedaMaxPercent: 4.0
  });
});

presets.ar.addEventListener('click', () => {
  aplicarPreset({
    potencia: 1400, tensao: 220, sistema: 'monofasico', tipoUso: 'forca',
    cosPhi: 0.85, rendimento: 0.90, temperatura: 35, numCircuitos: 1, comprimento: 22, quedaMaxPercent: 4.0
  });
});

presets.tugs.addEventListener('click', () => {
  aplicarPreset({
    potencia: 2200, tensao: 127, sistema: 'monofasico', tipoUso: 'forca',
    cosPhi: 1.0, rendimento: 1.0, temperatura: 30, numCircuitos: 3, comprimento: 12, quedaMaxPercent: 4.0
  });
});

presets.ilum.addEventListener('click', () => {
  aplicarPreset({
    potencia: 600, tensao: 220, sistema: 'monofasico', tipoUso: 'iluminacao',
    cosPhi: 0.95, rendimento: 1.0, temperatura: 30, numCircuitos: 2, comprimento: 25, quedaMaxPercent: 4.0
  });
});

// Executa o dimensionamento inicial assim que o arquivo é carregado
atualizarCalculo();