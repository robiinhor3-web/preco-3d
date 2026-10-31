// Preço 3D: dados padrão e toda a conta, sem tela.
// Usado pelo app (index.html) e pelos testes (node teste.js).
(function (raiz) {
const num = v => parseFloat(String(v).replace(',', '.')) || 0;
const uid = () => Math.random().toString(36).slice(2, 9);
const clone = o => JSON.parse(JSON.stringify(o));
const slug = t => String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// taxas dos marketplaces: vêm com o app e são atualizadas pelo taxas.json do site.
// faixas em ordem de preço; "ate: 0" = sem limite; frete: true = você paga o frete grátis nessa faixa
const TAXAS = {"v": 2, "data": "2026-10-30", "canais": [
  {"id": "direta", "nome": "Venda direta (Pix/dinheiro)", "obs": "WhatsApp, Instagram, feira: sem taxas", "faixas": [{"ate": 0, "pct": 0, "fixo": 0}]},
  {"id": "cartao", "nome": "Venda direta (cartão/link)", "obs": "Maquininha ou link de pagamento no crédito à vista. Confira a taxa do seu", "faixas": [{"ate": 0, "pct": 4.5, "fixo": 0}]},
  {"id": "shopee", "nome": "Shopee", "obs": "CNPJ. CPF com mais de 450 pedidos em 90 dias paga +R$ 3/item. Abaixo de R$ 9 o fixo é metade do preço (por isso 70%)", "faixas": [{"ate": 8.99, "pct": 70, "fixo": 0}, {"ate": 79.99, "pct": 20, "fixo": 4.5}, {"ate": 99.99, "pct": 14, "fixo": 16}, {"ate": 199.99, "pct": 14, "fixo": 20}, {"ate": 0, "pct": 14, "fixo": 26}]},
  {"id": "ml", "nome": "Mercado Livre Clássico", "obs": "Comissão de 10 a 14% conforme a categoria. Abaixo de R$ 79 o fixo varia com o peso (≈ R$ 6 a 7). Acima de R$ 79 você paga parte do frete grátis", "faixas": [{"ate": 78.99, "pct": 14, "fixo": 6.75}, {"ate": 0, "pct": 14, "fixo": 0, "frete": true}]},
  {"id": "mlp", "nome": "Mercado Livre Premium", "obs": "Parcelado sem juros. Comissão de 15 a 19% conforme a categoria. Mesmo fixo e frete do Clássico", "faixas": [{"ate": 78.99, "pct": 19, "fixo": 6.75}, {"ate": 0, "pct": 19, "fixo": 0, "frete": true}]},
  {"id": "tiktok", "nome": "TikTok Shop", "obs": "Tabela única desde 15/07/2026. No programa de frete grátis, some mais 6%", "faixas": [{"ate": 49.99, "pct": 10, "fixo": 4}, {"ate": 0, "pct": 6, "fixo": 6}]},
  {"id": "amazon", "nome": "Amazon", "obs": "Plano Profissional (R$ 19/mês). Comissão de 10 a 15% conforme a categoria. Logística (DBA/FBA) à parte", "faixas": [{"ate": 0, "pct": 13, "fixo": 0}]},
  {"id": "magalu", "nome": "Magalu", "obs": "Comissão de 10 a 20% conforme a categoria. Fixo de R$ 5,50 em moda, beleza, pet e brinquedos. Acima de R$ 79 paga parte do frete", "faixas": [{"ate": 78.99, "pct": 18, "fixo": 5}, {"ate": 0, "pct": 18, "fixo": 5, "frete": true}]}
]};

const PADRAO = {
  fils: [{nome: 'PLA', kg: 100}, {nome: 'PLA+', kg: 110}, {nome: 'PLA Matte', kg: 115}, {nome: 'PLA Silk', kg: 130},
    {nome: 'PLA Galaxy / Glitter', kg: 130}, {nome: 'PLA Mármore', kg: 140}, {nome: 'PLA Madeira', kg: 140},
    {nome: 'PLA Glow (brilha no escuro)', kg: 150}, {nome: 'PLA Translúcido', kg: 130}, {nome: 'PLA-CF', kg: 200},
    {nome: 'PETG', kg: 110}, {nome: 'PETG-CF', kg: 220}, {nome: 'ABS', kg: 100}, {nome: 'ASA', kg: 140},
    {nome: 'HIPS', kg: 120}, {nome: 'TPU', kg: 180}, {nome: 'PC', kg: 220}, {nome: 'PA (Nylon)', kg: 250},
    {nome: 'PA-CF', kg: 380}, {nome: 'PVA (suporte solúvel)', kg: 400}, {nome: 'Suporte para PLA', kg: 300},
    {nome: 'Resina padrão (1 L)', kg: 150}, {nome: 'Resina ABS-like (1 L)', kg: 180}, {nome: 'Resina lavável em água (1 L)', kg: 180}],
  imps: [{nome: 'Minha impressora', preco: 3500, vida: 5000, watts: 100}],
  manut: 0.30, kwh: 0.95, moHora: 20, falha: 10, desp: 5, arred: true,
  loja: '', zap: '', insta: '', prazo: '', validade: 7,
  canais: TAXAS.canais.map(c => ({...clone(c), auto: true})), taxasV: TAXAS.v, taxasData: TAXAS.data,
  insumos: [
    {nome: 'Argola de chaveiro 25 mm', preco: 25, qtd: 100}, {nome: 'Corrente/mosquetão de chaveiro', preco: 30, qtd: 100},
    {nome: 'Ímã neodímio 10x2 mm', preco: 20, qtd: 50}, {nome: 'Ímã neodímio 6x2 mm', preco: 15, qtd: 100},
    {nome: 'Inserto roscado M3', preco: 20, qtd: 100}, {nome: 'Parafuso M3', preco: 12, qtd: 100},
    {nome: 'Alfinete / base de botton', preco: 25, qtd: 100}, {nome: 'LED 5 mm', preco: 15, qtd: 100},
    {nome: 'Pilha CR2032', preco: 20, qtd: 10}, {nome: 'Cola instantânea (usos)', preco: 10, qtd: 50},
    {nome: 'Tinta acrílica (usos)', preco: 8, qtd: 20}, {nome: 'Álcool isopropílico (usos, resina)', preco: 40, qtd: 20},
    {nome: 'Saquinho zip 8x12', preco: 10, qtd: 100}, {nome: 'Saquinho de organza', preco: 20, qtd: 50},
    {nome: 'Adesivo com logo', preco: 25, qtd: 100},
    {nome: 'Tag / cartão de agradecimento', preco: 30, qtd: 100, modo: 'pedido'},
    {nome: 'Caixa de envio pequena', preco: 40, qtd: 25, modo: 'pedido'},
    {nome: 'Plástico bolha (metro)', preco: 30, qtd: 50, modo: 'pedido'},
    {nome: 'Fita adesiva (envios)', preco: 8, qtd: 100, modo: 'pedido'}],
  fixos: [{nome: 'MEI (DAS)', v: 82}, {nome: 'Internet (parte da loja)', v: 0}, {nome: 'Assinaturas (apps, modelos)', v: 0}],
  horasMes: 120, imposto: 0,
  atacado: [{q: 1, d: 0}, {q: 10, d: 5}, {q: 50, d: 10}, {q: 100, d: 15}],
  filsV: 3
};

// cada item ganha um código fixo: apagar ou reordenar a lista não troca o item de um orçamento salvo
function daIds(arr, pre) {
  const usados = new Set(arr.map(x => x.id).filter(Boolean));
  arr.forEach(x => {
    if (x.id) return;
    const b = pre + (slug(x.nome) || 'x');
    let id = b, n = 2;
    while (usados.has(id)) id = b + '-' + n++;
    x.id = id; usados.add(id);
  });
}

// canais antigos (pct/fixo) viram uma faixa; canais que o usuário não editou recebem as taxas novas
function aplicaTaxas(cfg, t) {
  const velhos = {'Venda direta': 'direta', 'Shopee': 'shopee', 'Mercado Livre': 'ml'};
  cfg.canais.forEach(c => {
    if (!c.faixas) { c.faixas = [{ate: 0, pct: num(c.pct), fixo: num(c.fixo)}]; delete c.pct; delete c.fixo; }
    if (!c.id && velhos[c.nome]) { c.id = velhos[c.nome]; c.auto = true; }
  });
  daIds(cfg.canais, 'c-');
  if (!t || !t.canais || num(t.v) <= num(cfg.taxasV)) return false;
  t.canais.forEach(n => {
    const c = cfg.canais.find(c => c.id === n.id);
    if (!c) cfg.canais.push({...clone(n), auto: true});
    else if (c.auto !== false) { const off = c.off; Object.assign(c, clone(n)); c.off = off; }
  });
  cfg.taxasV = t.v; cfg.taxasData = t.data;
  return true;
}

function migraCfg(salvo) {
  salvo = salvo || {};
  const cfg = Object.assign(clone(PADRAO), clone(salvo));
  if (salvo.canais && !salvo.taxasV) cfg.taxasV = 0;
  if (num(salvo.filsV) < 3 && salvo.fils) {
    PADRAO.fils.forEach(f => { if (!cfg.fils.some(c => c.nome.toLowerCase() === f.nome.toLowerCase())) cfg.fils.push({...f}); });
  }
  cfg.filsV = 3;
  if (!salvo.imps && salvo.maqPreco !== undefined) {
    cfg.imps = [{nome: 'Minha impressora', preco: num(salvo.maqPreco), vida: num(salvo.maqVida), watts: num(salvo.watts)}];
  }
  delete cfg.maqPreco; delete cfg.maqVida; delete cfg.watts;
  cfg.insumos.forEach(i => {
    if (!i.modo) i.modo = (PADRAO.insumos.find(p => p.nome === i.nome) || {}).modo || 'peca';
  });
  daIds(cfg.fils, 'f-'); daIds(cfg.imps, 'i-'); daIds(cfg.insumos, 'n-'); daIds(cfg.fixos, 'x-');
  aplicaTaxas(cfg, TAXAS);
  if (!cfg.criado) cfg.criado = Date.now();
  return cfg;
}

// orçamentos antigos guardavam a posição na lista; aqui viram códigos
function migraJob(j, cfg) {
  if (!j.mesas) { j.mesas = [{hh: j.hh || 0, mm: j.mm || 0, vz: 1, fils: j.fils || [{i: 0, g: 0}]}]; delete j.hh; delete j.mm; delete j.fils; }
  j.mesas.forEach(m => {
    if (!m.fils || !m.fils.length) m.fils = [{g: 0}];
    m.fils.forEach(f => {
      if (f.i !== undefined) { f.id = (cfg.fils[f.i] || cfg.fils[0]).id; delete f.i; }
      if (!f.id) f.id = cfg.fils[0].id;
    });
    if (!m.imp) m.imp = cfg.imps[0].id;
    if (!m.vz) m.vz = 1;
  });
  j.ins = (j.ins || []).map(x => x.i !== undefined ? {id: (cfg.insumos[x.i] || {}).id, q: x.q} : x).filter(x => x.id);
  if (j.canal === undefined || j.canal === '' || /^\d+$/.test(String(j.canal))) j.canal = (cfg.canais[+j.canal || 0] || cfg.canais[0]).id;
  ['nome', 'mo', 'ext', 'frete'].forEach(k => { if (j[k] === undefined) j[k] = k === 'nome' ? '' : 0; });
  if (!num(j.ped)) j.ped = 1;
  if (!num(j.qtd)) j.qtd = 1;
  if (!j.marTipo) j.marTipo = 'custo';
  if (j.mar === undefined) j.mar = 100;
  return j;
}

const acha = (arr, id) => arr.find(x => x.id === id) || arr[0] || {};
const insUnit = it => it ? num(it.preco) / Math.max(1, num(it.qtd)) : 0;
const fixoHora = cfg => cfg.fixos.reduce((s, f) => s + num(f.v), 0) / Math.max(1, num(cfg.horasMes));
const faixaDe = (k, p) => k.faixas.find(f => !num(f.ate) || p <= num(f.ate)) || k.faixas[k.faixas.length - 1];

function arredonda(cfg, p) {
  if (!cfg.arred || p <= 0) return p;
  const c = Math.ceil(p) - 0.10;
  return c >= p - 1e-9 ? c : c + 1;
}

// acha a faixa em que o preço (já arredondado) cabe; se o arredondamento passar do limite, usa a faixa seguinte
function precoCanal(cfg, k, base, extraPct = 0, freteUn = 0) {
  let p = 0;
  for (const f of k.faixas) {
    const raw = (base + num(f.fixo) + (f.frete ? freteUn : 0)) / Math.max(0.05, 1 - (num(f.pct) + num(cfg.imposto) + extraPct) / 100);
    p = arredonda(cfg, raw);
    if (!num(f.ate) || p <= num(f.ate)) return p;
  }
  return p;
}

function descontoQtd(cfg, q) {
  return (cfg.atacado || []).reduce((d, t) => num(t.q) <= q && num(t.d) > d ? num(t.d) : d, 0);
}

function conta(job, cfg) {
  const qtd = Math.max(1, num(job.qtd)), ped = Math.max(1, num(job.ped) || 1);
  let horas = 0, gramas = 0, mat = 0, ene = 0, maq = 0;
  (job.mesas || []).forEach(m => {
    const vz = Math.max(1, num(m.vz) || 1), h = (num(m.hh) + num(m.mm) / 60) * vz;
    const imp = acha(cfg.imps, m.imp);
    horas += h;
    ene += h * num(imp.watts) / 1000 * num(cfg.kwh);
    maq += h * (num(imp.preco) / Math.max(1, num(imp.vida)) + num(cfg.manut));
    m.fils.forEach(f => { gramas += num(f.g) * vz; mat += num(f.g) / 1000 * num(acha(cfg.fils, f.id).kg) * vz; });
  });
  mat *= 1 + num(cfg.desp) / 100;
  const fal = (mat + ene + maq) * num(cfg.falha) / 100;
  const mo = num(job.mo) / 60 * num(cfg.moHora);
  const fix = horas * fixoHora(cfg);
  const ext = num(job.ext);
  let insPeca = 0, insPed = 0;
  (job.ins || []).forEach(x => {
    const it = cfg.insumos.find(i => i.id === x.id);
    if (!it) return;
    if (it.modo === 'pedido') insPed += insUnit(it) * num(x.q); else insPeca += insUnit(it) * num(x.q);
  });
  // tudo por peça: o lote da impressão divide pelas peças; o que é por pedido divide pela quantidade do pedido
  const partes = [['Filamento', mat / qtd, 'c1'], ['Energia', ene / qtd, 'c2'], ['Impressora', maq / qtd, 'c3'],
    ['Falhas', fal / qtd, 'c4'], ['Mão de obra', mo / qtd, 'c5'], ['Insumos', insPeca + insPed / ped, 'c7'],
    ['Custos fixos', fix / qtd, 'c8'], ['Outros', ext / qtd, 'c6']];
  const unit = partes.reduce((s, p) => s + p[1], 0);
  const desc = descontoQtd(cfg, ped);
  const freteUn = num(job.frete) / ped;
  const mar = num(job.mar), porPreco = job.marTipo === 'preco';
  const base = porPreco ? unit : unit * (1 + mar / 100);
  const ativos = cfg.canais.filter(k => !k.off);
  const canais = (ativos.length ? ativos : cfg.canais).map(k => {
    const cheio = precoCanal(cfg, k, base, porPreco ? mar : 0, freteUn);
    const p = desc ? arredonda(cfg, cheio * (1 - desc / 100)) : cheio;
    const f = faixaDe(k, p);
    const taxa = p * (num(f.pct) + num(cfg.imposto)) / 100 + num(f.fixo) + (f.frete ? freteUn : 0);
    const lucro = p - taxa - unit;
    return {id: k.id, nome: k.nome, p, cheio, taxa, lucro, lucroHora: horas > 0 ? lucro * qtd / horas : 0};
  });
  return {qtd, ped, horas, gramas, partes, unit, desc, canais};
}

// cabeçalho de G-code: Bambu/Orca, PrusaSlicer e Cura (Cura dá metros: 1,75 mm PLA ≈ 2,98 g/m)
function lerGcode(t) {
  let seg = 0;
  const tm = t.match(/total estimated time:\s*([^;\n]+)/i) || t.match(/estimated printing time[^=\n]*=\s*([^\n]+)/i);
  if (tm) { const u = {d: 86400, h: 3600, m: 60, s: 1}; tm[1].replace(/(\d+)\s*([dhms])/g, (_, a, b) => seg += a * u[b]); }
  else { const c = t.match(/;\s*(?:PRINT\.)?TIME:\s*(\d+)/); if (c) seg = +c[1]; }
  const g = t.match(/total filament weight \[g\]\s*:\s*([\d.,\s]+)/i) || t.match(/filament used \[g\]\s*=\s*([\d.,\s]+)/i);
  let gramas = g ? g[1].split(',').map(num).filter(x => x > 0) : [];
  if (!gramas.length) {
    const m = t.match(/;\s*Filament used:\s*([^\n]+)/i);
    if (m) gramas = m[1].split(',').map(x => Math.round(num(x) * 29.8) / 10).filter(x => x > 0);
  }
  return {seg, gramas};
}

const Calc = {num, uid, clone, TAXAS, PADRAO, aplicaTaxas, migraCfg, migraJob, acha, insUnit, fixoHora, faixaDe,
  arredonda, precoCanal, descontoQtd, conta, lerGcode};
if (typeof module !== 'undefined') module.exports = Calc; else raiz.Calc = Calc;
})(this);
