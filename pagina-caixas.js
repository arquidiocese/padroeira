// ===== PÁGINA CAIXAS =====
let edicaoCaixaId = null;

function atualizarDiasDisponiveis() {
    if (!dados.configCaixas) dados.configCaixas = { fixos: 0, volantes: 0 };
    const tipoSelect = document.getElementById('caixaTipo');
    const tipo = tipoSelect ? tipoSelect.value : '';
    const rowDias = document.getElementById('rowDiasCaixa');
    const aviso = document.getElementById('avisoLimiteCaixas');

    if (!tipo) {
        if (rowDias) rowDias.style.display = 'none';
        if (aviso) aviso.style.display = 'none';
        return;
    }

    const limite = tipo === 'fixo' ? (dados.configCaixas.fixos || 0) : (dados.configCaixas.volantes || 0);
    let diasDisponiveis = 0;
    let diasLotados = [];

    [1,2,3,4].forEach(dia => {
        const checkbox = document.getElementById('caixaDia' + dia);
        const label = document.getElementById('labelCaixaDia' + dia);
        if (!checkbox || !label) return;

        if (limite > 0) {
            const jaCadastrados = (dados.caixas || []).filter(c => c.tipo === tipo && c.dias.includes(dia)).length;
            if (jaCadastrados >= limite) {
                checkbox.checked = false;
                checkbox.disabled = true;
                label.style.opacity = '0.3';
                label.style.textDecoration = 'line-through';
                label.title = `LOTADO (${jaCadastrados}/${limite})`;
                diasLotados.push(DIAS_CAIXAS[dia].split(' ')[0]);
            } else {
                checkbox.disabled = false;
                checkbox.checked = true;
                label.style.opacity = '1';
                label.style.textDecoration = 'none';
                label.title = `${jaCadastrados}/${limite} preenchidos`;
                diasDisponiveis++;
            }
        } else {
            checkbox.disabled = false;
            checkbox.checked = true;
            label.style.opacity = '1';
            label.style.textDecoration = 'none';
            label.title = '';
            diasDisponiveis++;
        }
    });

    if (rowDias) rowDias.style.display = diasDisponiveis > 0 ? 'flex' : 'none';

    if (aviso) {
        if (diasDisponiveis === 0) {
            aviso.style.display = 'block';
            aviso.style.color = '#ef5350';
            aviso.innerHTML = `⚠️ <strong>Todos os dias estão completos</strong> para Caixa ${tipo === 'fixo' ? 'Fixo' : 'Volante'} (máx ${limite}/dia).`;
        } else if (diasLotados.length > 0) {
            aviso.style.display = 'block';
            aviso.style.color = '#ffb300';
            aviso.innerHTML = `ℹ️ Dias lotados: ${diasLotados.join(', ')} — selecione apenas os dias disponíveis.`;
        } else {
            aviso.style.display = 'none';
        }
    }
}

function cadastrarCaixa() {
    const nome = document.getElementById('caixaNome').value.trim();
    const telefone = document.getElementById('caixaTelefone').value.trim();
    const tipo = document.getElementById('caixaTipo').value;
    if (!nome) { alert('Preencha o nome da pessoa'); return; }
    if (!tipo) { alert('Selecione o tipo de caixa'); return; }

    const dias = [];
    if (document.getElementById('caixaDia1').checked) dias.push(1);
    if (document.getElementById('caixaDia2').checked) dias.push(2);
    if (document.getElementById('caixaDia3').checked) dias.push(3);
    if (document.getElementById('caixaDia4').checked) dias.push(4);
    if (dias.length === 0) { alert('Selecione pelo menos um dia'); return; }

    if (!dados.configCaixas) dados.configCaixas = { fixos: 0, volantes: 0 };
    const limite = tipo === 'fixo' ? (dados.configCaixas.fixos || 0) : (dados.configCaixas.volantes || 0);
    if (limite > 0) {
        const lotados = [];
        dias.forEach(dia => {
            const ja = (dados.caixas || []).filter(c => c.tipo === tipo && c.dias.includes(dia)).length;
            if (ja >= limite) lotados.push(DIAS_CAIXAS[dia].split(' ')[0]);
        });
        if (lotados.length > 0) {
            alert(`Limite de caixas ${tipo === 'fixo' ? 'fixos' : 'volantes'} atingido em: ${lotados.join(', ')} (máx ${limite}/dia).`);
            return;
        }
    }

    if (typeof indicarSalvando === 'function') indicarSalvando();
    adicionarItem('caixas', { id: Date.now(), nome, telefone, tipo, dias });

    document.getElementById('caixaNome').value = '';
    document.getElementById('caixaTelefone').value = '';
    document.getElementById('caixaTipo').value = '';
    document.getElementById('rowDiasCaixa').style.display = 'none';
    document.getElementById('avisoLimiteCaixas').style.display = 'none';

    renderizarPagina();
    mostrarToast(`✅ ${nome} cadastrado!`);
}

function removerCaixa(id) {
    if (!confirm('Remover esta pessoa dos caixas?')) return;
    removerItem('caixas', id);
    renderizarPagina();
}

function editarCaixa(id) {
    const item = (dados.caixas || []).find(c => c.id === id);
    if (!item) return;
    edicaoCaixaId = id;
    const diasChecks = [1,2,3,4].map(d =>
        `<label class="checkbox-opt" style="display:inline-flex;margin-right:8px"><input type="checkbox" id="editCaixaDia${d}" ${item.dias.includes(d)?'checked':''}> ${DIAS_CAIXAS[d].split(' ')[0]}</label>`
    ).join('');
    document.getElementById('modalConteudo').innerHTML = `
        <div class="campo"><label>Nome</label><input type="text" id="editNome" value="${item.nome}"></div>
        <div class="campo"><label>Telefone</label><input type="tel" id="editTelefone" value="${item.telefone || ''}"></div>
        <div class="campo"><label>Tipo</label>
            <select id="editTipoCaixa">
                <option value="fixo" ${item.tipo==='fixo'?'selected':''}>Caixa Fixo</option>
                <option value="volante" ${item.tipo==='volante'?'selected':''}>Caixa Volante</option>
            </select>
        </div>
        <div class="campo"><label>Dias</label><div style="margin-top:5px">${diasChecks}</div></div>
    `;
    document.getElementById('modalTitulo').textContent = 'Editar Caixa';
    document.getElementById('modalOverlay').style.display = 'flex';
}

function salvarEdicaoCaixa() {
    const item = (dados.caixas || []).find(c => c.id === edicaoCaixaId);
    if (!item) { fecharModal(); return; }
    const dias = [];
    if (document.getElementById('editCaixaDia1').checked) dias.push(1);
    if (document.getElementById('editCaixaDia2').checked) dias.push(2);
    if (document.getElementById('editCaixaDia3').checked) dias.push(3);
    if (document.getElementById('editCaixaDia4').checked) dias.push(4);
    atualizarItem('caixas', edicaoCaixaId, {
        nome: document.getElementById('editNome').value.trim() || item.nome,
        telefone: document.getElementById('editTelefone').value.trim(),
        tipo: document.getElementById('editTipoCaixa').value,
        dias: dias
    });
    fecharModal();
    renderizarPagina();
}

function fecharModal() {
    document.getElementById('modalOverlay').style.display = 'none';
    edicaoCaixaId = null;
}

function renderizarPagina() {
    if (!dados.caixas) dados.caixas = [];
    if (!dados.configCaixas) dados.configCaixas = { fixos: 0, volantes: 0 };

    const totalFixos = dados.configCaixas.fixos || 0;
    const totalVolantes = dados.configCaixas.volantes || 0;

    // Resumo
    const resumoEl = document.getElementById('resumoCaixas');
    if (resumoEl) {
        resumoEl.innerHTML = `
            <div class="item neutro"><span>Necessários/dia</span><strong>${totalFixos + totalVolantes}</strong></div>
            <div class="item positivo"><span>Cadastrados</span><strong>${dados.caixas.length}</strong></div>
            <div class="item neutro"><span>Fixos</span><strong>${dados.caixas.filter(c=>c.tipo==='fixo').length}</strong></div>
            <div class="item neutro"><span>Volantes</span><strong>${dados.caixas.filter(c=>c.tipo==='volante').length}</strong></div>
        `;
    }

    // Escala por dia
    const porDiaEl = document.getElementById('caixasPorDia');
    if (porDiaEl) {
        const escalaDias = [1,2,3,4].map(dia => ({
            dia,
            fixos: dados.caixas.filter(c => c.tipo === 'fixo' && c.dias.includes(dia)).sort((a,b)=>a.nome.localeCompare(b.nome)),
            volantes: dados.caixas.filter(c => c.tipo === 'volante' && c.dias.includes(dia)).sort((a,b)=>a.nome.localeCompare(b.nome))
        }));
        const maxFixos = Math.max(...escalaDias.map(d => d.fixos.length), 1);
        const maxVolantes = Math.max(...escalaDias.map(d => d.volantes.length), 1);

        let html = '<div class="tabela-box" style="overflow-x:auto"><h4 style="text-align:center;font-size:1.1rem">ESCALA DE CAIXAS - FESTA DA PADROEIRA 2026</h4>';
        html += '<table style="width:100%;border-collapse:collapse;font-size:0.82rem">';
        html += '<thead><tr style="background:rgba(91,192,235,0.2)"><th style="width:30px;padding:8px;border:1px solid rgba(255,255,255,0.15)"></th>';
        [1,2,3,4].forEach(dia => { html += `<th style="padding:8px;text-align:center;border:1px solid rgba(255,255,255,0.15);color:var(--cor-amarelo)">${DIAS_CAIXAS[dia]}</th>`; });
        html += '</tr></thead><tbody>';
        html += '<tr style="background:rgba(212,160,23,0.15)"><td style="padding:6px;border:1px solid rgba(255,255,255,0.1);font-weight:700;text-align:center" colspan="5">Caixa Fixo</td></tr>';
        for (let i = 0; i < maxFixos; i++) {
            html += '<tr>';
            html += `<td style="padding:4px 8px;border:1px solid rgba(255,255,255,0.08);text-align:center;color:var(--cor-amarelo);font-weight:700;font-size:0.75rem">${i+1}</td>`;
            [0,1,2,3].forEach(di => { const p = escalaDias[di].fixos[i]; html += `<td style="padding:4px 8px;border:1px solid rgba(255,255,255,0.08);color:var(--cor-palha)">${p ? p.nome : ''}</td>`; });
            html += '</tr>';
        }
        html += '<tr style="background:rgba(129,199,132,0.15)"><td style="padding:6px;border:1px solid rgba(255,255,255,0.1);font-weight:700;text-align:center" colspan="5">Caixa Volante</td></tr>';
        for (let i = 0; i < maxVolantes; i++) {
            html += '<tr>';
            html += `<td style="padding:4px 8px;border:1px solid rgba(255,255,255,0.08);text-align:center;color:#81c784;font-weight:700;font-size:0.75rem">${maxFixos + i + 1}</td>`;
            [0,1,2,3].forEach(di => { const p = escalaDias[di].volantes[i]; html += `<td style="padding:4px 8px;border:1px solid rgba(255,255,255,0.08);color:var(--cor-palha)">${p ? p.nome : ''}</td>`; });
            html += '</tr>';
        }
        html += '</tbody></table></div>';
        porDiaEl.innerHTML = html;
    }

    // Tabela completa
    const tbody = document.querySelector('#tabelaCaixas tbody');
    if (tbody) {
        const lista = [...dados.caixas].sort((a,b) => a.nome.localeCompare(b.nome));
        tbody.innerHTML = lista.map(c => {
            const diasStr = c.dias.map(d => DIAS_CAIXAS[d].split(' ')[0]).join(', ');
            const tipoBadge = c.tipo === 'fixo'
                ? '<span style="background:var(--cor-amarelo);color:#1a1a2e;padding:2px 8px;border-radius:10px;font-size:0.7rem;font-weight:700">Fixo</span>'
                : '<span style="background:#81c784;color:#1a1a2e;padding:2px 8px;border-radius:10px;font-size:0.7rem;font-weight:700">Volante</span>';
            return `<tr>
                <td style="font-weight:700">${c.nome}</td>
                <td>${c.telefone || '-'}</td>
                <td>${tipoBadge}</td>
                <td style="font-size:0.78rem">${diasStr}</td>
                <td><button class="btn-edit" onclick="editarCaixa(${c.id})">✏️</button> <button class="btn-delete" onclick="removerCaixa(${c.id})">X</button></td>
            </tr>`;
        }).join('') || '<tr><td colspan="5" style="text-align:center;opacity:0.5;padding:15px">Nenhum caixa cadastrado</td></tr>';
    }

    // Atualizar dias disponíveis se um tipo já estiver selecionado
    atualizarDiasDisponiveis();
}

function exportarEscalaPDF() {
    if (!dados.caixas || dados.caixas.length === 0) { alert('Nenhum caixa cadastrado'); return; }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('landscape');
    const pageW = doc.internal.pageSize.getWidth();
    let y = 15;

    doc.setFontSize(16); doc.setTextColor(91, 192, 235);
    doc.text('ESCALA DE CAIXAS', pageW / 2, y, { align: 'center' }); y += 7;
    doc.setFontSize(12); doc.setTextColor(0);
    doc.text('Festa da Padroeira - Edição 2026', pageW / 2, y, { align: 'center' }); y += 6;
    doc.setFontSize(10);
    doc.text('09, 10, 11 e 12 de Outubro', pageW / 2, y, { align: 'center' }); y += 12;

    const escalaDias = [1,2,3,4].map(dia => ({
        dia,
        fixos: dados.caixas.filter(c => c.tipo === 'fixo' && c.dias.includes(dia)).sort((a,b)=>a.nome.localeCompare(b.nome)),
        volantes: dados.caixas.filter(c => c.tipo === 'volante' && c.dias.includes(dia)).sort((a,b)=>a.nome.localeCompare(b.nome))
    }));
    const maxFixos = Math.max(...escalaDias.map(d => d.fixos.length), 1);
    const maxVolantes = Math.max(...escalaDias.map(d => d.volantes.length), 1);

    const head = [['#', DIAS_CAIXAS[1], DIAS_CAIXAS[2], DIAS_CAIXAS[3], DIAS_CAIXAS[4]]];
    const body = [];
    body.push([{ content: 'CAIXA FIXO', colSpan: 5, styles: { halign: 'center', fillColor: [212, 160, 23], textColor: [30, 30, 30], fontStyle: 'bold' } }]);
    for (let i = 0; i < maxFixos; i++) {
        body.push([(i+1).toString(),
            escalaDias[0].fixos[i]?escalaDias[0].fixos[i].nome:'', escalaDias[1].fixos[i]?escalaDias[1].fixos[i].nome:'',
            escalaDias[2].fixos[i]?escalaDias[2].fixos[i].nome:'', escalaDias[3].fixos[i]?escalaDias[3].fixos[i].nome:'']);
    }
    body.push([{ content: 'CAIXA VOLANTE', colSpan: 5, styles: { halign: 'center', fillColor: [129, 199, 132], textColor: [30, 30, 30], fontStyle: 'bold' } }]);
    for (let i = 0; i < maxVolantes; i++) {
        body.push([(maxFixos+i+1).toString(),
            escalaDias[0].volantes[i]?escalaDias[0].volantes[i].nome:'', escalaDias[1].volantes[i]?escalaDias[1].volantes[i].nome:'',
            escalaDias[2].volantes[i]?escalaDias[2].volantes[i].nome:'', escalaDias[3].volantes[i]?escalaDias[3].volantes[i].nome:'']);
    }

    doc.autoTable({ startY: y, theme: 'grid', head, body,
        headStyles: { fillColor: [91, 192, 235], textColor: [255, 255, 255], fontSize: 9 },
        bodyStyles: { fontSize: 9 }, columnStyles: { 0: { cellWidth: 12, halign: 'center', fontStyle: 'bold' } }, styles: { cellPadding: 3 } });

    doc.save('escala_caixas_padroeira.pdf');
    mostrarToast('📄 Escala exportada!');
}

// Iniciar
iniciarStatusFirebase();
iniciarSync();
