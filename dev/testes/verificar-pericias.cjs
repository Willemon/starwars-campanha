// node dev/testes/verificar-pericias.cjs
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.join(__dirname, '../..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const context = vm.createContext({ console, assert, window: {} });
vm.runInContext(read('js/estado.js').split('let syncStatusTimer')[0], context);
vm.runInContext(read('js/modelos/ficha.js'), context);
vm.runInContext(read('js/dados/pericias-usos.js'), context);
vm.runInContext(read('js/pericias.js'), context);
vm.runInContext(`
    const withoutTraining = { id: 1, skills: {} };
    const withTraining = { id: 2, skills: Object.fromEntries(SKILL_ROWS.map(s => [s.key, { treinada: true }])) };
    const expectedCore = { acrobacia: 7, conhecimentos: 2, enganacao: 4, escalar: 4, furtividade: 6, iniciativa: 2,
        mecanica: 13, montaria: 8, nadar: 1, percepcao: 7, persuasao: 3, pilotar: 6, obterInfo: 3,
        saltar: 3, sobrevivencia: 4, resistencia: 7, primeiros: 9, usarForca: 7, usarComputador: 6 };
    for (const [key, count] of Object.entries(expectedCore)) {
        assert.equal(SKILL_USES[key].uses.filter(use => !use.supplement).length, count, key + ': usos do capítulo completos');
    }
    for (const skill of SKILL_ROWS) {
        const ref = getSkillReference(skill.key);
        assert.ok(ref?.uses.length, skill.key + ': sem usos');
        assert.equal(new Set(ref.uses.map(use => use.title)).size, ref.uses.length);
        assert.ok(ref.description && ref.sourceLabel.includes('v1.05'));
        const html = renderSkillUses(withoutTraining, skill);
        assert.ok(html.includes(escapeHtml(ref.description.split('\\n\\n')[0])), skill.key + ': introdução');
        if (ref.rules) assert.ok(html.includes(escapeHtml(ref.rules.split('\\n\\n')[0])), skill.key + ': regras gerais');
        for (const use of ref.uses) {
            assert.equal(typeof use.trainedOnly, 'boolean');
            assert.ok(use.title && use.text);
            assert.ok(use.sourceLabel, skill.key + ': fonte');
            if (use.supplement) assert.ok(use.source.startsWith('https://swse.fandom.com/wiki/'));
            if (use.requirements) assert.ok(html.includes(escapeHtml(use.requirements)), use.title + ': requisitos');
            assert.ok(!/[a-zà-ÿ]{2}[0-9]{2}/.test(use.text), use.title + ': número de página no meio de palavra');
            assert.ok(!/[\\uFFFE\\uFFFD]/.test(use.text), use.title + ': artefato de extração');
        }
        for (const table of [...(ref.tables || []), ...ref.uses.flatMap(use => [...(use.table ? [use.table] : []), ...(use.tables || [])])]) {
            assert.ok(html.includes('<caption>' + escapeHtml(table.caption) + '</caption>'));
            for (const row of table.rows) {
                assert.equal(row.length, table.headers.length, table.caption + ': colunas');
                for (const cell of row) assert.ok(html.includes('<td>' + escapeHtml(cell) + '</td>'));
            }
        }
        const muted = ref.uses.filter(use => use.trainedOnly).length;
        assert.equal((renderSkillUses(withoutTraining, skill).match(/class="skill-use skill-use-untrained"/g) || []).length, muted);
        assert.ok(!renderSkillUses(withTraining, skill).includes('skill-use-untrained'));
    }
    const trainedFlag = (key, title) => getSkillReference(key).uses.find(use => use.title === title).trainedOnly;
    assert.equal(trainedFlag('acrobacia', 'Equilibrar-se'), false);
    const balance = getSkillReference('acrobacia').uses.find(use => use.title === 'Equilibrar-se');
    assert.deepEqual(balance.table.rows, [['8–15 cm', '10'], ['4–7 cm', '15'], ['Menos de 4 cm', '20']]);
    const balanceHtml = renderSkillUses(withoutTraining, SKILL_ROWS.find(skill => skill.key === 'acrobacia'));
    assert.ok(balanceHtml.includes('Defesa de Reflexo'));
    assert.ok(balanceHtml.includes('imediatamente fazer outro teste'));
    assert.ok(balanceHtml.includes('<th scope="col">CD de Acrobacia</th>'));
    assert.equal(trainedFlag('acrobacia', 'Atravessar terreno difícil'), true);
    assert.equal(trainedFlag('mecanica', 'Ajudar outro'), false);
    assert.equal(trainedFlag('mecanica', 'Reparar'), true);
    assert.equal(trainedFlag('primeiros', 'Primeiros socorros'), false);
    assert.equal(trainedFlag('primeiros', 'Cirurgia'), true);
    assert.equal(trainedFlag('usarForca', 'Sentir arredores'), false);
    assert.equal(trainedFlag('usarForca', 'Sentir Yuuzhan Vong nos arredores'), true);
    const content = (key, title) => getSkillReference(key).uses.find(use => use.title === title).text;
    assert.ok(content('acrobacia', 'Escapar de amarras').includes('Leva um minuto'));
    assert.ok(content('mecanica', 'Modificar droide').includes('Um dróide não pode substituir'));
    assert.ok(content('pilotar', 'Evitar colisão').includes('nenhuma colisão ocorre'));
    assert.ok(content('pilotar', 'Perseguição (briga de cão)').includes('Saindo de uma Perseguição'));
    assert.ok(content('primeiros', 'Cirurgia').includes('5 ou mais'));
    assert.ok(content('usarComputador', 'Astrogação').includes('5%'));
    assert.ok(content('usarComputador', 'Astrogação').includes('dobro do tempo'));
    assert.ok(content('usarComputador', 'Usar sensores').includes('−5 por 10 quadrados'));
    assert.ok(content('primeiros', 'Cuidados críticos').includes('Cada tentativa anterior, mesmo falha'));
    assert.ok(content('sobrevivencia', 'Criar posição defensiva').includes('20 × 20'));
    assert.ok(content('mecanica', 'Sobrecarregar arma').includes('um 1 a faz explodir'));
    assert.equal(getSkillReference('conhecimentoTaticas').uses.length, 4);
    assert.equal(getSkillReference('conhecimentoBurocracia').uses.length, 2);
    const knowledgeSheet = { id: 3, skills: { conhecimentoTaticas: { treinada: true } } };
    const state = JSON.stringify(knowledgeSheet);
    assert.ok(!renderSkillUses(knowledgeSheet, KNOWLEDGE_SKILLS.find(s => s.key === 'conhecimentoTaticas')).includes('skill-use-untrained'));
    assert.ok(renderSkillUses(knowledgeSheet, KNOWLEDGE_SKILLS.find(s => s.key === 'conhecimentoBurocracia')).includes('skill-use-untrained'));
    assert.equal(JSON.stringify(knowledgeSheet), state, 'Consulta não pode alterar a ficha');
    assert.equal(getSkillReference('inexistente'), null);
    assert.equal(renderSkillParagraphs('<img src=x onerror=alert(1)>'), '<p>&lt;img src=x onerror=alert(1)&gt;</p>');
    const core = Object.values(SKILL_USES).flatMap(ref => ref.uses).filter(use => !use.supplement).length;
    const extra = Object.values(SKILL_USES).flatMap(ref => ref.uses).filter(use => use.supplement).length + KNOWLEDGE_TACTICS_USES.length;
    console.log(core + ' usos do livro e ' + extra + ' complementos com fontes, requisitos e tabelas: OK.');
    console.log(SKILL_ROWS.length + ' perícias/áreas verificadas; treinamento, exceções, isolamento e consulta sem alterações: OK.');
`, context);
