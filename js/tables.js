//TABELA 47 DA NBR5410
export const SECAO_MINIMA = {
    iluminacao: 1.5,
    forca: 2.5
};

//TABELA 40 DA NBR5410
export const FCT_PVC = {
    10: 1.22,
    15: 1.17,
    20: 1.12,
    25: 1.06,
    35: 0.94,
    40: 0.87,
    45: 0.79,
    50: 0.71,
    55: 0.61,
    60: 0.50
};

//TABELA 42 DA NBR5410
export const FCA_A_F = {
    1: 1.00,
    2: 0.80,
    3: 0.70,
    4: 0.65,
    5: 0.60,
    6: 0.57,
    7: 0.54,
    8: 0.52,
    9: 0.50,
    10: 0.50,
    11: 0.50,
    12: 0.45,
    13: 0.45,
    14: 0.45,
    15: 0.45,
    16: 0.41,
    17: 0.41,
    18: 0.41,
    19: 0.41,
    20: 0.38
};

//TABELA 36 DA NBR5410
//Cada elemento representa uma seção comercial com sua capacidade de 
// corrente para 2 condutores carregados (monofásico/bifásico) e 
// 3 condutores carregados (trifásico)
export const TABELA_B1_PVC = [
    {secao: 1.5, n2: 17.5, n3: 15.5},
    {secao: 2.5, n2: 24, n3: 21},
    {secao: 4, n2: 32, n3: 28},
    {secao: 6, n2: 41, n3: 36},
    {secao: 10, n2: 57, n3: 50},
    {secao: 16, n2: 76, n3: 68},
    {secao: 25, n2: 101, n3: 89},
    {secao: 35, n2: 125, n3: 110},
    {secao: 50, n2: 151, n3: 134},
    {secao: 70, n2: 192, n3: 171},
    {secao: 95, n2: 232, n3: 207},
    {secao: 120, n2: 269, n3: 239},
    {secao: 150, n2: 309, n3: 275}
];

//MINIDISJUNTORES COMERCIAIS DE 10 A 125
export const DISJUNTORES_COMERCIAIS = [
    10,16,20,25,32,40,50,63,70,80,100,125
];