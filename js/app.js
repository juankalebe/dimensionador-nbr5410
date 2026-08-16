import { dimensionarCircuito } from './engine.js';

// Caso de Teste: Chuveiro elétrico 7500W, 220V, Monofásico, 20 metros, 35°C, 2 circuitos agrupados
const resultado = dimensionarCircuito({
  potencia: 7500,
  tensao: 220,
  sistema: 'monofasico',
  cosPhi: 1.0,
  tipoUso: 'forca',
  temperatura: 35,
  numCircuitos: 2,
  comprimento: 20,
  quedaMaxPercent: 4.0
});

console.log("=== RESULTADO DO DIMENSIONAMENTO ===");
console.log(resultado);