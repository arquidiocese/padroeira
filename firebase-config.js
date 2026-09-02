// Firebase Configuration - Festa da Padroeira 2026
// IMPORTANTE: Crie um novo projeto Firebase para a Padroeira
// ou use o mesmo projeto do Arraiá com um path diferente
const firebaseConfig = {
    apiKey: "AIzaSyBs7zNRlW8i5sJaLypb3WXAuRsdSfD0AVo",
    authDomain: "arraiabasilica.firebaseapp.com",
    databaseURL: "https://arraiabasilica-default-rtdb.firebaseio.com",
    projectId: "arraiabasilica",
    storageBucket: "arraiabasilica.firebasestorage.app",
    messagingSenderId: "989762035527",
    appId: "1:989762035527:web:613a5d2fba39badbbff662",
    measurementId: "G-K9PJSTKW42"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
// Usa path separado para não misturar com dados do Arraiá
const dbRef = db.ref('padroeira');

// ===== FUNÇÕES DE SINCRONIZAÇÃO =====

// Salvar dados no Firebase
// Usa update() por campo de topo em vez de set() no nó inteiro.
// IMPORTANTE: NÃO reescreve os campos geridos item-a-item (patrocinadores, despesas,
// doacoesEntrada, doadores, necessidades, caixas) — esses só são gravados pelas funções
// fbAdicionarItem/fbGravarCampo, para não desfazer o formato chaveado por id (que evita
// duplicação e perda). Aqui gravamos só vendas de barraca, config e meta.
const CAMPOS_ITEM_A_ITEM_FB = ['patrocinadores', 'despesas', 'doacoesEntrada', 'doadores', 'necessidades', 'caixas'];

function salvarFirebase(dados) {
    // Converter para JSON e voltar para limpar undefined/funções
    const limpo = JSON.parse(JSON.stringify(dados));
    // Remove os campos item-a-item para não sobrescrevê-los como array de posição
    CAMPOS_ITEM_A_ITEM_FB.forEach(campo => { delete limpo[campo]; });
    dbRef.update(limpo).catch(err => {
        console.error('Erro ao salvar no Firebase:', err);
        // Avisa o usuário quando a gravação falha (ex: regras expiradas / sem permissão)
        if (typeof mostrarToast === 'function') {
            mostrarToast('⚠️ ERRO: dados NÃO salvos no servidor. Verifique a conexão.', 'error');
        }
    });
}

// Carregar dados do Firebase (retorna Promise)
function carregarFirebase() {
    return dbRef.once('value').then(snapshot => snapshot.val());
}

// Escutar mudanças em tempo real
function escutarMudancas(callback) {
    dbRef.on('value', snapshot => {
        const dados = snapshot.val();
        if (dados) callback(dados);
    });
}

// ===== OPERAÇÕES ITEM-A-ITEM (seguras para uso simultâneo) =====
// Grava/remove/atualiza UM item dentro de um campo (ex: patrocinadores),
// usando o id do item como chave. Dois dispositivos adicionando ao mesmo
// tempo NÃO se sobrescrevem, pois cada item tem sua própria chave.

// Reescreve o campo INTEIRO no Firebase como objeto chaveado pelo id de cada item.
// Isso corrige o problema de itens antigos que ficaram salvos por POSIÇÃO (0,1,2)
// em vez de por id — garantindo que editar/remover sempre acerte o registro certo.
// Recebe a lista atual (array) do campo, já com a alteração aplicada localmente.
function fbGravarCampo(campo, lista) {
    const obj = {};
    (lista || []).forEach(item => {
        if (item && item.id != null) {
            obj[String(item.id)] = JSON.parse(JSON.stringify(item));
        }
    });
    // set() substitui o campo inteiro pela versão chaveada por id (sem duplicatas de posição)
    return dbRef.child(campo).set(obj).catch(err => {
        console.error('Erro ao gravar campo no Firebase:', err);
        if (typeof mostrarToast === 'function') mostrarToast('⚠️ ERRO: dados NÃO salvos no servidor. Verifique a conexão.', 'error');
    });
}

function fbAdicionarItem(campo, item) {
    const limpo = JSON.parse(JSON.stringify(item));
    return dbRef.child(campo).child(String(item.id)).set(limpo).catch(err => {
        console.error('Erro ao adicionar item no Firebase:', err);
        if (typeof mostrarToast === 'function') mostrarToast('⚠️ ERRO: item NÃO salvo no servidor. Verifique a conexão.', 'error');
    });
}

function fbRemoverItem(campo, id) {
    return dbRef.child(campo).child(String(id)).remove().catch(err => {
        console.error('Erro ao remover item no Firebase:', err);
        if (typeof mostrarToast === 'function') mostrarToast('⚠️ ERRO: não foi possível remover no servidor.', 'error');
    });
}

function fbAtualizarItem(campo, id, item) {
    const limpo = JSON.parse(JSON.stringify(item));
    return dbRef.child(campo).child(String(id)).set(limpo).catch(err => {
        console.error('Erro ao atualizar item no Firebase:', err);
        if (typeof mostrarToast === 'function') mostrarToast('⚠️ ERRO: alteração NÃO salva no servidor.', 'error');
    });
}
