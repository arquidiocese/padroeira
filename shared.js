// ===== SHARED: núcleo comum para as páginas focadas =====
// Reutiliza o mesmo Firebase (firebase-config.js) e o mesmo STORAGE_KEY do painel principal.

const BARRACAS = [
    'fazendinha', 'cachorro-quente', 'kafta', 'pernil', 'pastel',
    'batata-frita', 'doces', 'bar', 'chopp', 'kids', 'bingo', 'artesanato'
];

const NOMES_BARRACAS = {
    'fazendinha': '🌽 Fazendinha',
    'cachorro-quente': '🌭 Cachorro Quente',
    'kafta': '🥙 Kafta',
    'pernil': '🥪 Lanche de Pernil',
    'pastel': '🥟 Pastel',
    'batata-frita': '🍟 Batata Frita',
    'doces': '🍬 Doces',
    'bar': '🍺 Bar',
    'chopp': '🍻 Chopp',
    'kids': '🎠 Espaço Kids',
    'bingo': '🎯 Bingo/Leilão',
    'artesanato': '🎨 Artesanato'
};

const DIAS_FESTA = {
    1: '09/Out (Sex)',
    2: '10/Out (Sáb)',
    3: '11/Out (Dom)',
    4: '12/Out (Seg)'
};
const DIAS_CAIXAS = DIAS_FESTA;

const STORAGE_KEY = 'padroeira_financeiro_v1';

function fmt(valor) {
    return (valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function R$(valor) { return 'R$ ' + fmt(valor); }

function mostrarToast(msg, tipo) {
    const existing = document.querySelector('.toast-global');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.className = 'toast-global' + (tipo === 'error' ? ' error' : '');
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => { if (toast.parentNode) toast.remove(); }, 3000);
}

function dadosVazios() {
    const d = { despesas: [], patrocinadores: [], doadores: [], necessidades: [], doacoesEntrada: [], caixas: [], configCaixas: { fixos: 0, volantes: 0 }, meta: 0, configBarracas: null, configProdutos: null };
    BARRACAS.forEach(b => { d[b] = { vendas: [] }; });
    return d;
}

function normalizarDados(d) {
    if (!d) return dadosVazios();
    if (d.patrocinadores && !Array.isArray(d.patrocinadores)) d.patrocinadores = Object.values(d.patrocinadores);
    if (!d.patrocinadores) d.patrocinadores = [];
    if (d.despesas && !Array.isArray(d.despesas)) d.despesas = Object.values(d.despesas);
    if (!d.despesas) d.despesas = [];

    if (d.configBarracas && !Array.isArray(d.configBarracas)) d.configBarracas = Object.values(d.configBarracas);

    // Registrar barracas dinâmicas na memória
    if (d.configBarracas) {
        d.configBarracas.forEach(cb => {
            if (!cb || !cb.id) return;
            if (!BARRACAS.includes(cb.id)) BARRACAS.push(cb.id);
            const temEmoji = /[\u{1F300}-\u{1F9FF}]/u.test(cb.nome || '');
            NOMES_BARRACAS[cb.id] = temEmoji ? cb.nome : '🏪 ' + (cb.nome || cb.id);
        });
    }

    BARRACAS.forEach(b => {
        if (!d[b]) d[b] = { vendas: [] };
        if (d[b].vendas && !Array.isArray(d[b].vendas)) d[b].vendas = Object.values(d[b].vendas);
        if (!d[b].vendas) d[b].vendas = [];
    });

    if (!d.meta) d.meta = 0;

    if (d.configProdutos) {
        Object.keys(d.configProdutos).forEach(key => {
            if (d.configProdutos[key] && !Array.isArray(d.configProdutos[key])) {
                d.configProdutos[key] = Object.values(d.configProdutos[key]);
            }
        });
    }

    if (d.doadores && !Array.isArray(d.doadores)) d.doadores = Object.values(d.doadores);
    if (!d.doadores) d.doadores = [];
    if (d.necessidades && !Array.isArray(d.necessidades)) d.necessidades = Object.values(d.necessidades);
    if (!d.necessidades) d.necessidades = [];
    if (d.doacoesEntrada && !Array.isArray(d.doacoesEntrada)) d.doacoesEntrada = Object.values(d.doacoesEntrada);
    if (!d.doacoesEntrada) d.doacoesEntrada = [];
    if (d.caixas && !Array.isArray(d.caixas)) d.caixas = Object.values(d.caixas);
    if (!d.caixas) d.caixas = [];
    d.caixas.forEach(c => {
        if (c.dias && !Array.isArray(c.dias)) c.dias = Object.values(c.dias);
        if (!c.dias) c.dias = [];
    });
    if (!d.configCaixas) d.configCaixas = { fixos: 0, volantes: 0 };

    return d;
}

function carregarDados() {
    const d = localStorage.getItem(STORAGE_KEY);
    if (d) {
        try { return normalizarDados(JSON.parse(d)); } catch { return dadosVazios(); }
    }
    return dadosVazios();
}

function salvarDados(d) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(d));
    if (typeof salvarFirebase === 'function') salvarFirebase(d);
}

// Objeto global de dados usado pelas páginas
let dados = carregarDados();

// Carrega do Firebase e escuta em tempo real. Chama renderizarPagina() (definida em cada página).
function iniciarSync() {
    if (typeof carregarFirebase === 'function') {
        carregarFirebase().then(dadosFirebase => {
            if (dadosFirebase) {
                dados = normalizarDados(dadosFirebase);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
            } else {
                salvarFirebase(dados);
            }
            if (typeof renderizarPagina === 'function') renderizarPagina();
        }).catch(() => {
            if (typeof renderizarPagina === 'function') renderizarPagina();
        });
    } else {
        if (typeof renderizarPagina === 'function') renderizarPagina();
    }

    if (typeof escutarMudancas === 'function') {
        escutarMudancas(function(dadosFirebase) {
            try {
                dados = normalizarDados(dadosFirebase);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
                if (typeof renderizarPagina === 'function') renderizarPagina();
            } catch (err) {
                console.error('Erro ao sincronizar:', err);
            }
        });
    }
}

function nomeBarraca(id) {
    if (!id || id === 'geral') return 'Geral';
    return (NOMES_BARRACAS[id] || id);
}

// Status de conexão Firebase
function iniciarStatusFirebase() {
    if (typeof firebase !== 'undefined' && firebase.database) {
        firebase.database().ref('.info/connected').on('value', snap => {
            const el = document.getElementById('firebaseStatus');
            if (el) {
                el.innerHTML = snap.val() === true
                    ? '<span class="status-dot online"></span> Online'
                    : '<span class="status-dot offline"></span> Offline';
            }
        });
    }
}
