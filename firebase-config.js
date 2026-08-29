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
// Usa update() por campo de topo em vez de set() no nó inteiro,
// para reduzir o risco de um dispositivo sobrescrever dados de outro.
function salvarFirebase(dados) {
    // Converter para JSON e voltar para limpar undefined/funções
    const limpo = JSON.parse(JSON.stringify(dados));
    dbRef.update(limpo).catch(err => console.error('Erro ao salvar no Firebase:', err));
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
