// ===== PÁGINA ITENS NECESSÁRIOS =====
function adicionarNecessidade() {
    const barraca = document.getElementById('necessidadeBarraca').value;
    const item = document.getElementById('necessidadeItem').value.trim();
    const qtd = parseFloat(document.getElementById('necessidadeQtd').value) || 1;
    const unidade = document.getElementById('necessidadeUnidade').value;
    const obs = document.getElementById('necessidadeObs').value.trim();
    if (!item) { alert('Preencha o item necessário'); return; }

    adicionarItem('necessidades', { id: Date.now(), barraca, item, qtd, unidade, obs, conseguido: false });
    document.getElementById('necessidadeItem').value = '';
    document.getElementById('necessidadeQtd').value = '1';
    document.getElementById('necessidadeObs').value = '';
    renderizarPagina();
    mostrarToast(`✅ Item adicionado!`);
}

function removerNecessidade(id) {
    if (!confirm('Remover este item?')) return;
    removerItem('necessidades', id);
    renderizarPagina();
}

function toggleConseguido(id) {
    const item = (dados.necessidades || []).find(n => n.id === id);
    if (item) { atualizarItem('necessidades', id, { conseguido: !item.conseguido }); renderizarPagina(); }
}

function renderizarPagina() {
    if (!dados.necessidades) dados.necessidades = [];

    // Atualizar select de barracas
    const select = document.getElementById('necessidadeBarraca');
    if (select) {
        const valorAtual = select.value;
        const opts = '<option value="geral">Geral (evento todo)</option>' + BARRACAS.map(b =>
            `<option value="${b}">${(NOMES_BARRACAS[b]||b).replace(/^.{2}\s?/,'')}</option>`
        ).join('');
        select.innerHTML = opts;
        if (valorAtual) select.value = valorAtual;
    }

    const contador = document.getElementById('contadorRegistros');
    if (contador) contador.textContent = dados.necessidades.length > 0 ? `(${dados.necessidades.length} item${dados.necessidades.length>1?'ns':''})` : '';

    const container = document.getElementById('listaNecessidades');
    if (!container) return;

    const agrupado = {};
    dados.necessidades.forEach(n => {
        const key = n.barraca || 'geral';
        if (!agrupado[key]) agrupado[key] = [];
        agrupado[key].push(n);
    });

    if (Object.keys(agrupado).length === 0) {
        container.innerHTML = '<p style="opacity:0.5;text-align:center;padding:20px">Nenhum item necessário cadastrado. Adicione itens acima.</p>';
        return;
    }

    let html = '';
    const totalItens = dados.necessidades.length;
    const totalConseguidos = dados.necessidades.filter(n => n.conseguido).length;
    html += `<div class="resumo-barraca" style="margin-bottom:15px"><div class="item neutro"><span>Total de Itens</span><strong>${totalItens}</strong></div><div class="item positivo"><span>Conseguidos</span><strong>${totalConseguidos}</strong></div><div class="item negativo"><span>Pendentes</span><strong>${totalItens - totalConseguidos}</strong></div></div>`;

    const keys = Object.keys(agrupado).sort((a, b) => {
        if (a === 'geral') return -1;
        if (b === 'geral') return 1;
        return (NOMES_BARRACAS[a]||a).localeCompare(NOMES_BARRACAS[b]||b);
    });

    keys.forEach(key => {
        const nome = key === 'geral' ? '🏗️ Geral (Infraestrutura/Evento)' : (NOMES_BARRACAS[key] || key);
        const itens = agrupado[key];
        const conseguidos = itens.filter(n => n.conseguido).length;
        html += `<div class="tabela-box" style="margin-bottom:12px">
            <h4>${nome} <small style="opacity:0.6">(${conseguidos}/${itens.length} conseguidos)</small></h4>
            <table><thead><tr><th></th><th>Item</th><th>Qtd</th><th>Obs</th><th></th></tr></thead><tbody>`;
        itens.forEach(n => {
            const cls = n.conseguido ? 'style="opacity:0.5;text-decoration:line-through"' : '';
            html += `<tr ${cls}>
                <td><input type="checkbox" ${n.conseguido ? 'checked' : ''} onchange="toggleConseguido(${n.id})" style="width:18px;height:18px;accent-color:var(--cor-verde);cursor:pointer"></td>
                <td>${n.item}</td>
                <td>${n.qtd} ${n.unidade}</td>
                <td>${n.obs || '-'}</td>
                <td><button class="btn-delete" onclick="removerNecessidade(${n.id})">X</button></td>
            </tr>`;
        });
        html += '</tbody></table></div>';
    });

    container.innerHTML = html;
}

function exportarNecessidadesPDF() {
    if (!dados.necessidades || dados.necessidades.length === 0) { alert('Nenhum item cadastrado'); return; }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const pageW = doc.internal.pageSize.getWidth();
    let y = 20;

    doc.setFontSize(16); doc.setTextColor(91, 192, 235);
    doc.text('LISTA DE ITENS NECESSÁRIOS', pageW / 2, y, { align: 'center' }); y += 8;
    doc.setFontSize(11); doc.setTextColor(0);
    doc.text('Festa da Padroeira - Edição 2026', pageW / 2, y, { align: 'center' }); y += 6;
    doc.text('09, 10, 11 e 12 de Outubro', pageW / 2, y, { align: 'center' }); y += 10;

    doc.setFontSize(9); doc.setTextColor(100);
    const totalItens = dados.necessidades.length;
    const totalConseguidos = dados.necessidades.filter(n => n.conseguido).length;
    doc.text(`Total: ${totalItens} itens | Conseguidos: ${totalConseguidos} | Pendentes: ${totalItens - totalConseguidos}`, 14, y); y += 10;
    doc.setTextColor(0);

    const agrupado = {};
    dados.necessidades.forEach(n => {
        const key = n.barraca || 'geral';
        if (!agrupado[key]) agrupado[key] = [];
        agrupado[key].push(n);
    });
    const keys = Object.keys(agrupado).sort((a, b) => {
        if (a === 'geral') return -1; if (b === 'geral') return 1;
        return (NOMES_BARRACAS[a]||a).localeCompare(NOMES_BARRACAS[b]||b);
    });
    keys.forEach(key => {
        const nome = key === 'geral' ? 'Geral (Infraestrutura)' : (NOMES_BARRACAS[key]||key).replace(/^.{2}\s?/,'');
        const itens = agrupado[key];
        if (y + 20 > 270) { doc.addPage(); y = 20; }
        doc.autoTable({
            startY: y, theme: 'striped',
            headStyles: { fillColor: [91, 192, 235] },
            styles: { overflow: 'linebreak', cellPadding: 3, fontSize: 9 },
            columnStyles: { 0: { cellWidth: 90 }, 1: { cellWidth: 30 }, 2: { cellWidth: 45 }, 3: { cellWidth: 27 } },
            head: [[nome, 'Qtd', 'Obs', 'Status']],
            body: itens.map(n => [n.item || '-', `${n.qtd||0} ${n.unidade||''}`, n.obs || '-', n.conseguido ? 'Conseguido' : 'PENDENTE'])
        });
        y = doc.lastAutoTable.finalY + 8;
    });

    doc.save('lista_necessidades_padroeira.pdf');
    mostrarToast('📄 Lista exportada!');
}

function exportarNecessidadesCSV() {
    if (!dados.necessidades || dados.necessidades.length === 0) { alert('Nenhum item cadastrado'); return; }
    let csv = 'Barraca;Item;Quantidade;Unidade;Observação;Status\n';
    dados.necessidades.forEach(n => {
        const barraca = n.barraca === 'geral' ? 'Geral' : (NOMES_BARRACAS[n.barraca]||n.barraca||'').replace(/^.{2}\s?/,'');
        csv += `${barraca};${n.item};${n.qtd};${n.unidade};${n.obs||''};${n.conseguido ? 'Conseguido' : 'Pendente'}\n`;
    });
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'necessidades_padroeira.csv';
    link.click();
}

iniciarStatusFirebase();
iniciarSync();
