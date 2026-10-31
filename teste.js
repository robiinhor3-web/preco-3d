// Testes da conta do Preço 3D. Rode com: node teste.js
const C = require('./calculo.js');
let falhas = 0;
function ok(cond, nome) { console.log((cond ? '✔ ' : '✖ ') + nome); if (!cond) falhas++; }
const perto = (a, b, t = 0.011) => Math.abs(a - b) <= t;

const cfg0 = () => { const c = C.migraCfg({}); c.falha = 0; c.desp = 0; c.manut = 0; c.fixos.forEach(f => f.v = 0); return c; };
const canal = (r, id) => r.canais.find(k => k.id === id);
const jobCusto = (cfg, custoMat) => C.migraJob({mesas: [{hh: 0, mm: 0, fils: [{id: 'f-pla', g: custoMat * 10}]}], mar: 0}, cfg); // PLA R$100/kg: 10 g = R$1

// 1. Shopee: preço cai na faixa certa e a taxa é 20% + R$ 4,50
{
  const cfg = cfg0(); cfg.arred = false;
  const job = jobCusto(cfg, 20); job.mar = 0;
  const s = canal(C.conta(job, cfg), 'shopee');
  ok(perto(s.p, (20 + 4.5) / 0.8) && perto(s.taxa, s.p * 0.2 + 4.5) && perto(s.lucro, 0), 'Shopee 20% + R$ 4,50 até R$ 79,99');
}
// 2. Shopee abaixo de R$ 9: fixo = metade do preço (70% no total)
{
  const cfg = cfg0(); cfg.arred = false;
  const s = canal(C.conta(jobCusto(cfg, 2), cfg), 'shopee');
  ok(s.p <= 8.99 && perto(s.taxa, s.p * 0.7), 'Shopee abaixo de R$ 9 cobra 70% (sem os R$ 4,50)');
}
// 3. arredondar para ,90 não pode jogar o preço numa faixa mais cara sem recalcular
{
  const cfg = cfg0();
  const job = jobCusto(cfg, 59.5); // cru ≈ 80,00 → passaria de 79,99
  const s = canal(C.conta(job, cfg), 'shopee');
  ok(s.lucro >= -0.01 && (s.p <= 79.99 || s.p >= (59.5 + 16) / 0.86), 'arredondamento recalcula na faixa seguinte (lucro não fica negativo)');
}
// 4. margem sobre o preço x lucro sobre o custo
{
  const cfg = cfg0(); cfg.arred = false;
  const job = jobCusto(cfg, 10); job.mar = 30; job.marTipo = 'preco';
  const d = canal(C.conta(job, cfg), 'direta');
  ok(perto(d.lucro / d.p, 0.30), 'margem 30% sobre o preço = 30% do preço é lucro');
  job.marTipo = 'custo'; job.mar = 100;
  ok(perto(canal(C.conta(job, cfg), 'direta').p, 20), 'markup 100% sobre o custo = custo × 2');
}
// 5. insumo por pedido divide pela quantidade do pedido; por peça não
{
  const cfg = cfg0(); cfg.arred = false;
  const caixa = cfg.insumos.find(i => /Caixa/.test(i.nome)), arg = cfg.insumos.find(i => /Argola/.test(i.nome));
  const job = C.migraJob({mesas: [{fils: [{id: 'f-pla', g: 0}]}], ins: [{id: caixa.id, q: 1}, {id: arg.id, q: 1}], ped: 4}, cfg);
  const r = C.conta(job, cfg);
  ok(perto(r.unit, C.insUnit(caixa) / 4 + C.insUnit(arg)), 'caixa conta 1× por pedido, argola 1× por peça');
}
// 6. códigos fixos: apagar um material não troca o material do orçamento salvo
{
  const velho = {fils: [{nome: 'PLA', kg: 100}, {nome: 'PETG', kg: 110}], canais: [{nome: 'Venda direta', pct: 0, fixo: 0}, {nome: 'Shopee', pct: 20, fixo: 4}], maqPreco: 3500, maqVida: 5000, watts: 100};
  const cfg = C.migraCfg(velho);
  const job = C.migraJob({hh: 1, mm: 0, fils: [{i: 1, g: 100}], canal: '1'}, cfg);
  ok(job.mesas[0].fils[0].id === 'f-petg' && job.canal === 'shopee', 'orçamento antigo (posição) vira código');
  cfg.fils.splice(0, 1);
  ok(C.acha(cfg.fils, job.mesas[0].fils[0].id).nome === 'PETG', 'apagar PLA não muda o PETG do orçamento');
  ok(cfg.imps[0].preco === 3500 && cfg.canais.find(c => c.id === 'shopee').faixas.length === 5, 'impressora e taxas antigas migradas');
}
// 7. frete grátis do Mercado Livre só entra acima de R$ 79
{
  const cfg = cfg0(); cfg.arred = false;
  const job = jobCusto(cfg, 100); job.frete = 25;
  const m = canal(C.conta(job, cfg), 'ml');
  ok(m.p > 79 && perto(m.lucro, 0) && perto(m.taxa, m.p * 0.14 + 25), 'ML acima de R$ 79 desconta o frete');
  const b = canal(C.conta(jobCusto(cfg, 10), cfg), 'ml');
  ok(perto(b.taxa, b.p * 0.14 + 6.75), 'ML abaixo de R$ 79 não desconta frete');
}
// 8. desconto de atacado
{
  const cfg = cfg0(); cfg.arred = false;
  const job = jobCusto(cfg, 10); job.ped = 50; job.mar = 100;
  const d = canal(C.conta(job, cfg), 'direta');
  ok(perto(d.p, 20 * 0.9), '50 unidades = 10% de desconto');
}
// 9. várias mesas e "vezes"
{
  const cfg = cfg0(); cfg.arred = false;
  const job = C.migraJob({mesas: [{hh: 1, mm: 0, vz: 2, fils: [{id: 'f-pla', g: 100}]}, {hh: 0, mm: 30, fils: [{id: 'f-petg', g: 50}]}], qtd: 1}, cfg);
  const r = C.conta(job, cfg);
  ok(perto(r.horas, 2.5) && perto(r.gramas, 250) && perto(r.partes[0][1], 20 + 5.5), 'mesas somam tempo, peso e material (com vezes)');
}
// 10. leitura de G-code de vários fatiadores
{
  const cura = C.lerGcode(';FLAVOR:Marlin\n;TIME:5430\n;Filament used: 2.5m\n');
  ok(cura.seg === 5430 && perto(cura.gramas[0], 7.5, 0.1), 'G-code do Cura (metros → gramas)');
  const prusa = C.lerGcode('; filament used [g] = 12.34\n; estimated printing time (normal mode) = 1h 2m 3s\n');
  ok(prusa.seg === 3723 && perto(prusa.gramas[0], 12.34), 'G-code do PrusaSlicer');
  const bambu = C.lerGcode('; total estimated time: 2h 5m\n; total filament weight [g] : 10.5,3.2\n');
  ok(bambu.seg === 7500 && bambu.gramas.length === 2, 'G-code do Bambu/Orca');
}

console.log(falhas ? `\n${falhas} teste(s) falharam` : '\nTodos os testes passaram');
process.exit(falhas ? 1 : 0);
