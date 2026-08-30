// ===== PÁGINA DOAÇÕES (dinheiro + bingo/leilão) =====
let edicaoDoacao = null; // { tipo: 'dinheiro'|'doador', id }

function mostrarSub(secao) {
    document.querySelectorAll('.sub-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.sub-nav button').forEach(b => b.classList.remove('active'));
    document.getElementById('sub-' + secao).classList.add('active');
    event.target.classList.add('active');
}

// ----- Doações em dinheiro -----
function lancarDoacaoEntrada() {
    const nome = document.getElementById('doacaoNome').value.trim();
    const valor = parseFloat(document.getElementById('doacaoValor').value);
    const tipo = document.getElementById('doacaoTipo').value;
    const data = document.getElementById('doacaoData').value || '';
    const obs = document.getElementById('doacaoObs').value.trim();
    const recebido = document.getElementById('doacaoRecebido').checked;
    if (!nome || isNaN(valor) || valor <= 0) { alert('Preencha o nome e valor da doação'); return; }

    if (!dados.doacoesEntrada) dados.doacoesEntrada = [];
    dados.doacoesEntrada.push({ id: Date.now(), nome, valor, tipo, data, obs, recebido });
    salvarDados(dados);
    document.getElementById('doacaoNome').value = '';
    document.getElementById('doacaoValor').value = '';
    document.getElementById('doacaoObs').value = '';
    renderizarPagina();
    mostrarToast(`✅ Doação de ${nome} - ${R$(valor)} lançada!`);
}

function removerDoacaoEntrada(id) {
    if (!confirm('Remover esta doação?')) return;
    dados.doacoesEntrada = (dados.doacoesEntrada || []).filter(d => d.id !== id);
    salvarDados(dados);
    renderizarPagina();
}

function toggleDoacaoRecebida(id) {
    const item = (dados.doacoesEntrada || []).find(d => d.id === id);
    if (item) { item.recebido = !item.recebido; salvarDados(dados); renderizarPagina(); }
}

function editarDoacaoEntrada(id) {
    const item = (dados.doacoesEntrada || []).find(d => d.id === id);
    if (!item) return;
    edicaoDoacao = { tipo: 'dinheiro', id };
    const tipoSel = (t) => item.tipo === t ? 'selected' : '';
    document.getElementById('modalConteudo').innerHTML = `
        <div class="campo"><label>Doador</label><input type="text" id="editNome" value="${item.nome}"></div>
        <div class="campo"><label>Valor (R$)</label><input type="number" id="editValor" value="${item.valor}" step="0.01"></div>
        <div class="campo"><label>Tipo</label>
            <select id="editTipoDoacao">
                <option value="pessoa" ${tipoSel('pessoa')}>👤 Pessoa Física</option>
                <option value="empresa" ${tipoSel('empresa')}>🏢 Empresa</option>
                <option value="saldo" ${tipoSel('saldo')}>📦 Saldo Anterior</option>
                <option value="outro" ${tipoSel('outro')}>📌 Outro</option>
            </select>
        </div>
        <div class="campo"><label>Data</label><input type="date" id="editData" value="${item.data || ''}"></div>
        <div class="campo"><label>Observação</label><input type="text" id="editObs" value="${item.obs || ''}"></div>
    `;
    document.getElementById('modalTitulo').textContent = 'Editar Doação';
    document.getElementById('modalOverlay').style.display = 'flex';
}

// ----- Doações bingo/leilão -----
function lancarDoador() {
    const nome = document.getElementById('doadorNome').value.trim();
    const item = document.getElementById('doadorItem').value.trim();
    const valor = parseFloat(document.getElementById('doadorValor').value) || 0;
    const obs = document.getElementById('doadorObs').value.trim();
    if (!nome || !item) { alert('Preencha o nome do doador e o item doado'); return; }

    if (!dados.doadores) dados.doadores = [];
    dados.doadores.push({ id: Date.now(), nome, item, valor, obs });
    salvarDados(dados);
    document.getElementById('doadorNome').value = '';
    document.getElementById('doadorItem').value = '';
    document.getElementById('doadorValor').value = '';
    document.getElementById('doadorObs').value = '';
    renderizarPagina();
    mostrarToast(`✅ ${nome} - ${item} cadastrado!`);
}

function removerDoador(id) {
    if (!confirm('Remover esta doação?')) return;
    dados.doadores = (dados.doadores || []).filter(d => d.id !== id);
    salvarDados(dados);
    renderizarPagina();
}

function editarDoador(id) {
    const item = (dados.doadores || []).find(d => d.id === id);
    if (!item) return;
    edicaoDoacao = { tipo: 'doador', id };
    document.getElementById('modalConteudo').innerHTML = `
        <div class="campo"><label>Doador</label><input type="text" id="editNome" value="${item.nome}"></div>
        <div class="campo"><label>Item Doado</label><input type="text" id="editItem" value="${item.item}"></div>
        <div class="campo"><label>Valor Estimado R$</label><input type="number" id="editValor" value="${item.valor || 0}" step="0.01"></div>
        <div class="campo"><label>Observação</label><input type="text" id="editObs" value="${item.obs || ''}"></div>
    `;
    document.getElementById('modalTitulo').textContent = 'Editar Doador';
    document.getElementById('modalOverlay').style.display = 'flex';
}

function salvarEdicaoDoacoes() {
    if (!edicaoDoacao) { fecharModal(); return; }
    if (edicaoDoacao.tipo === 'dinheiro') {
        const item = (dados.doacoesEntrada || []).find(d => d.id === edicaoDoacao.id);
        if (item) {
            item.nome = document.getElementById('editNome').value.trim() || item.nome;
            const v = document.getElementById('editValor').value;
            item.valor = v === '' ? 0 : parseFloat(v);
            item.tipo = document.getElementById('editTipoDoacao').value;
            item.data = document.getElementById('editData').value || '';
            item.obs = document.getElementById('editObs').value.trim();
        }
    } else if (edicaoDoacao.tipo === 'doador') {
        const item = (dados.doadores || []).find(d => d.id === edicaoDoacao.id);
        if (item) {
            item.nome = document.getElementById('editNome').value.trim() || item.nome;
            item.item = document.getElementById('editItem').value.trim() || item.item;
            const v = document.getElementById('editValor').value;
            item.valor = v === '' ? 0 : parseFloat(v);
            item.obs = document.getElementById('editObs').value.trim();
        }
    }
    salvarDados(dados);
    fecharModal();
    renderizarPagina();
}

function fecharModal() {
    document.getElementById('modalOverlay').style.display = 'none';
    edicaoDoacao = null;
}

function renderizarPagina() {
    // ----- Doações em dinheiro -----
    if (!dados.doacoesEntrada) dados.doacoesEntrada = [];
    const TIPOS = { pessoa: '👤 Pessoa', empresa: '🏢 Empresa', saldo: '📦 Saldo Anterior', outro: '📌 Outro' };
    const tbodyDin = document.querySelector('#tabelaDoacoesEntrada tbody');
    if (tbodyDin) {
        const lista = [...dados.doacoesEntrada].sort((a,b) => a.nome.localeCompare(b.nome));
        tbodyDin.innerHTML = lista.map(d => {
            const dataFmt = d.data ? d.data.split('-').reverse().join('/') : '-';
            return `<tr>
                <td style="font-weight:700">${d.nome}</td>
                <td><span class="badge-categoria">${TIPOS[d.tipo] || d.tipo}</span></td>
                <td style="color:#66bb6a;font-weight:700">R$ ${fmt(d.valor)}</td>
                <td>${dataFmt}</td>
                <td>${d.obs || '-'}</td>
                <td><span class="${d.recebido ? 'badge-pago' : 'badge-pendente'}" onclick="toggleDoacaoRecebida(${d.id})">${d.recebido ? 'Recebido' : 'Pendente'}</span></td>
                <td><button class="btn-edit" onclick="editarDoacaoEntrada(${d.id})">✏️</button> <button class="btn-delete" onclick="removerDoacaoEntrada(${d.id})">X</button></td>
            </tr>`;
        }).join('') || '<tr><td colspan="7" style="text-align:center;opacity:0.5;padding:15px">Nenhuma doação em dinheiro</td></tr>';
    }
    const total = dados.doacoesEntrada.reduce((s, d) => s + d.valor, 0);
    const recebido = dados.doacoesEntrada.filter(d => d.recebido).reduce((s, d) => s + d.valor, 0);
    const resumoDin = document.getElementById('resumoDoacoesEntrada');
    if (resumoDin) {
        resumoDin.innerHTML = `
            <div class="item positivo"><span>Total Doações</span><strong>${R$(total)}</strong></div>
            <div class="item positivo"><span>Recebido</span><strong>${R$(recebido)}</strong></div>
            <div class="item negativo"><span>Pendente</span><strong>${R$(total - recebido)}</strong></div>
            <div class="item neutro"><span>Doadores</span><strong>${dados.doacoesEntrada.length}</strong></div>
        `;
    }

    // ----- Doações bingo/leilão -----
    if (!dados.doadores) dados.doadores = [];
    const busca = (document.getElementById('buscaDoador')?.value || '').toLowerCase();
    let listaD = [...dados.doadores].sort((a,b) => a.nome.localeCompare(b.nome) || a.item.localeCompare(b.item));
    if (busca) listaD = listaD.filter(d => d.nome.toLowerCase().includes(busca) || d.item.toLowerCase().includes(busca));

    const tbodyDoad = document.querySelector('#tabelaDoadores tbody');
    if (tbodyDoad) {
        const agrupado = {};
        listaD.forEach(d => { if (!agrupado[d.nome]) agrupado[d.nome] = []; agrupado[d.nome].push(d); });
        let html = '';
        Object.entries(agrupado).sort((a,b)=>a[0].localeCompare(b[0])).forEach(([nome, itens]) => {
            itens.forEach((d, i) => {
                html += `<tr${i===0?' style="border-top:2px solid rgba(255,255,255,0.15)"':''}>
                    <td style="font-weight:700">${i===0?nome:''}</td>
                    <td>${d.item}</td>
                    <td>${d.valor > 0 ? R$(d.valor) : '-'}</td>
                    <td>${d.obs || '-'}</td>
                    <td><button class="btn-edit" onclick="editarDoador(${d.id})">✏️</button> <button class="btn-delete" onclick="removerDoador(${d.id})">X</button></td>
                </tr>`;
            });
        });
        tbodyDoad.innerHTML = html || '<tr><td colspan="5" style="text-align:center;opacity:0.5;padding:15px">Nenhuma doação de prêmio</td></tr>';
    }
    const totalD = dados.doadores.reduce((s,d) => s + (d.valor || 0), 0);
    const qtdDoadores = new Set(dados.doadores.map(d => d.nome)).size;
    const resumoD = document.getElementById('resumoDoadores');
    if (resumoD) {
        resumoD.innerHTML = `
            <div class="item doacao"><span>Valor Total Estimado</span><strong>${R$(totalD)}</strong></div>
            <div class="item neutro"><span>Itens Doados</span><strong>${dados.doadores.length}</strong></div>
            <div class="item neutro"><span>Doadores</span><strong>${qtdDoadores}</strong></div>
        `;
    }
    const datalist = document.getElementById('listaDoadoresExistentes');
    if (datalist) {
        const nomesUnicos = [...new Set(dados.doadores.map(d => d.nome))].sort();
        datalist.innerHTML = nomesUnicos.map(n => `<option value="${n}">`).join('');
    }
}

iniciarStatusFirebase();
iniciarSync();
