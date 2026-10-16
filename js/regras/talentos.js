// Talentos e Aptidões escolhidos por nível.
// Cada nível de personagem e de classe abre vagas (js/dados/progressao.js); o jogador escolhe na
// lista da Biblioteca e os pré-requisitos (js/dados/prerequisitos-talentos.js) liberam ou bloqueiam.
//
// Na ficha:
//   escolhas       = [{ vaga, tipo: 'talento' | 'aptidao', nome, detalhe?, motivo? }]
//                    vaga: 'heroico:3', 'raca:1', 'classe:Jedi:2', 'classe:Soldado:inicial' ou 'extra:<id>'
//   outrosTalentos = [{ texto, lista: 'talents' | 'aptitudes' }]  itens da ficha antiga que não bateram com a Biblioteca
//   talents / aptitudes continuam sendo a lista de nomes (usada pela aba Notas), recalculada daqui

const WEAPON_GROUPS = ['Armas Simples', 'Pistolas', 'Rifles', 'Armas Pesadas', 'Sabres de Luz', 'Armas Brancas Avançadas'];

// Talentos que precisam de um complemento (qual arma, perícia ou grau)
const TALENT_DETAIL_OPTIONS = {
    'Proficiência com Arma (Weapon Proficiency)': WEAPON_GROUPS,
    'Foco em Arma (Weapon Focus)': WEAPON_GROUPS,
    'Ataque Duplo (Double Attack)': WEAPON_GROUPS,
    'Ataque Triplo (Triple Attack)': WEAPON_GROUPS,
    'Proficiência com Armadura (Armor Proficiency)': ['Leve', 'Média', 'Pesada'],
    'Foco em Perícia (Skill Focus)': 'pericia',
    'Treinamento em Perícia (Skill Training)': 'pericia',
    'Artes Marciais (I, II e III) (Martial Arts (I, II, and III))': ['I', 'II', 'III'],
    'Maestria em Duas Armas (I, II e III) (Dual Weapon Mastery (I, II, and III))': ['I', 'II', 'III'],
    'Proficiência com Arma Exótica (Exotic Weapon Proficiency)': 'texto',
    'Maestria em Poder da Força (Force Power Mastery)': 'poder',
};

// Itens que podem ser escolhidos mais de uma vez sem complemento (valor = máximo)
const REPEATABLE_ITEMS = {
    'Linguista (Linguist)': 20,
    'Defesa com Sabre de Luz': 3,
};

const ATTRIBUTE_NAMES = { FOR: 'Força', DES: 'Destreza', CON: 'Constituição', INT: 'Inteligência', SAB: 'Sabedoria', CAR: 'Carisma' };

const CHOICE_TYPE_LABELS = {
    talento: { singular: 'Talento', plural: 'Talentos', field: 'talents', notePrefix: 'talent' },
    aptidao: { singular: 'Aptidão', plural: 'Aptidões', field: 'aptitudes', notePrefix: 'aptitude' },
    poder: { singular: 'Poder da Força', plural: 'Poderes da Força', field: 'forcePowers', notePrefix: 'force' },
    tecnica: { singular: 'Técnica da Força', plural: 'Técnicas da Força' },
    segredo: { singular: 'Segredo da Força', plural: 'Segredos da Força' },
};

// ===== Biblioteca =====

function isPlaceholderItem(name) {
    return /ainda não preenchid/i.test(name);
}

function getAptitudeTrees() {
    return (LIBRARY_DATA.aptitudes?.trees || [])
        .map(tree => ({ name: tree.name, items: tree.items.filter(item => !isPlaceholderItem(item)) }));
}

function getTreesOfAptitude(name) {
    return getAptitudeTrees().filter(tree => tree.items.includes(name)).map(tree => tree.name);
}

const hasForceSensitivity = owned => owned.some(entry => entry.tipo === 'talento' && /\(Force Sensitivity\)$/.test(entry.nome));

// Árvores de onde uma vaga de Aptidão pode tirar escolhas (as da classe + as da Força, se Sensível à Força)
function getSlotTrees(sheet, slot, owned) {
    const trees = [...(slot.arvores || [])];
    if (slot.forca && hasForceSensitivity(owned || getOwnedChoices(sheet, slot.key))) {
        const force = typeof FORCE_TALENT_TREES !== 'undefined' ? FORCE_TALENT_TREES : [];
        const traditions = typeof FORCE_TRADITION_TREES !== 'undefined' ? FORCE_TRADITION_TREES : [];
        trees.push(...force, ...traditions);
    }
    return [...new Set(trees)];
}

function isTraditionTree(treeName) {
    return typeof FORCE_TRADITION_TREES !== 'undefined' && FORCE_TRADITION_TREES.includes(treeName);
}

// "Foco em Arma (Weapon Focus)" -> "Foco em Arma"
function choiceShortName(name) {
    return String(name).replace(/\s*\((?:[^()]|\([^()]*\))*\)\s*$/, '').trim() || name;
}

function choiceLabel(entry) {
    return entry.detalhe ? `${entry.nome} — ${entry.detalhe}` : entry.nome;
}

function getDetailOptions(nome) {
    const aptitudeOptions = typeof APTITUDE_DETAIL_OPTIONS !== 'undefined' ? APTITUDE_DETAIL_OPTIONS : {};
    const options = TALENT_DETAIL_OPTIONS[nome] || aptitudeOptions[nome];
    if (options === 'pericia') return SKILL_ROWS.filter(skill => !skill.group).map(skill => skill.label);
    if (options === 'poder') return (LIBRARY_DATA.forcePowers?.items || []).map(choiceShortName);
    return options || null;
}

function normalizeChoiceText(text) {
    return normalizeSearch(text).replace(/[’']/g, "'").replace(/\s+/g, ' ').trim();
}

// Tenta achar um texto digitado na ficha antiga dentro da Biblioteca
function matchLibraryName(text) {
    const typed = normalizeChoiceText(text);
    if (!typed) return null;
    const candidates = [
        ...(LIBRARY_DATA.talents?.items || []).map(nome => ({ tipo: 'talento', nome })),
        ...getAptitudeTrees().flatMap(tree => tree.items.map(nome => ({ tipo: 'aptidao', nome }))),
    ];
    // "Bloqueio (Block)" encontra "Bloquear (Block)" pelo nome em inglês
    const englishOf = name => normalizeChoiceText((String(name).match(/\(((?:[^()]|\([^()]*\))*)\)\s*$/) || [])[1] || '');
    const typedEn = englishOf(text);
    for (const item of candidates) {
        const full = normalizeChoiceText(item.nome);
        const pt = normalizeChoiceText(choiceShortName(item.nome));
        const en = englishOf(item.nome);
        if (typed === full || typed === pt || (en && (typed === en || typedEn === en))) return item;
    }
    // "Proficiência com Arma (Pistolas)" -> item genérico + complemento
    const withDetail = String(text).match(/^(.*?)\s*\(([^()]+)\)\s*$/);
    if (withDetail) {
        const base = normalizeChoiceText(withDetail[1]);
        const item = candidates.find(c => getDetailOptions(c.nome) && normalizeChoiceText(choiceShortName(c.nome)) === base);
        if (item) return { ...item, detalhe: withDetail[2].trim() };
    }
    return null;
}

// ===== Nível, classes e vagas =====

function getClassProgression(className) {
    return CLASS_PROGRESSION[className] || null;
}

function getClassLevel(classObj, progression) {
    const level = Math.max(0, toInt(classObj.level));
    return progression ? Math.min(level, progression.nivelMax) : level;
}

function getBaseAttackBonus(sheet) {
    return (sheet.classes || []).reduce((total, classObj) => {
        const progression = getClassProgression(classObj.name);
        const rule = progression && BBA_PROGRESSION[progression.bba];
        return total + (rule ? rule(getClassLevel(classObj, progression)) : 0);
    }, 0);
}

function getFirstHeroicClassIndex(sheet) {
    return (sheet.classes || []).findIndex(c => getClassProgression(c.name)?.tipo === 'heroica');
}

// Talentos que a ficha ganha sem escolher (talentos iniciais da primeira classe heroica)
function getAutomaticChoices(sheet, includeRemoved = false) {
    const index = getFirstHeroicClassIndex(sheet);
    if (index < 0) return [];
    const classObj = sheet.classes[index];
    return getClassProgression(classObj.name).talentosIniciais.map(item => ({
        tipo: 'talento', nome: item.nome, ...(item.detalhe ? { detalhe: item.detalhe } : {}),
        fonte: `${classObj.name} · inicial`,
    })).filter(entry => includeRemoved || !(sheet.excludedAutomaticChoices || []).includes(automaticChoiceKey(entry)));
}

function automaticChoiceKey(entry) {
    return JSON.stringify([entry.fonte, entry.nome, entry.detalhe || '']);
}

function prestigeSlotTypes(rule, level) {
    const odd = level % 2 === 1;
    if (rule === 'aptidaoTodoNivel') return ['aptidao'];
    if (rule === 'aptidaoImparTecnica') return odd ? ['aptidao'] : ['tecnica'];
    if (rule === 'aptidaoImparSegredo') return level === 1 ? ['aptidao'] : odd ? ['aptidao', 'segredo'] : ['segredo'];
    return odd ? ['aptidao'] : [];
}

// Todas as vagas que a ficha tem hoje, na ordem em que aparecem
function getSheetSlots(sheet) {
    const slots = [];
    const level = getCharacterLevel(sheet);

    HEROIC_TALENT_LEVELS.filter(l => l <= level).forEach(l => {
        slots.push({ key: `heroico:${l}`, tipo: 'talento', fonte: `Nível ${l} de personagem` });
    });

    const speciesBonus = toInt(getSpeciesEffects(sheet)?.talentoBonus);
    for (let i = 1; i <= speciesBonus; i++) {
        slots.push({ key: `raca:${i}`, tipo: 'talento', fonte: `Raça · ${getSpeciesData(sheet)?.nome || ''}` });
    }

    const firstHeroic = getFirstHeroicClassIndex(sheet);
    const seen = new Set();
    (sheet.classes || []).forEach((classObj, index) => {
        const progression = getClassProgression(classObj.name);
        if (!progression || seen.has(classObj.name)) return;
        seen.add(classObj.name);
        const classLevel = getClassLevel(classObj, progression);
        const name = classObj.name;

        if (progression.tipo === 'heroica') {
            if (index !== firstHeroic && classLevel >= 1) {
                slots.push({
                    key: `classe:${name}:inicial`, tipo: 'talento', fonte: `${name} · talento inicial`,
                    lista: progression.talentosIniciais,
                });
            }
            for (let n = 1; n <= classLevel; n++) {
                if (n % 2 === 1) {
                    slots.push({ key: `classe:${name}:${n}`, tipo: 'aptidao', fonte: `${name} ${n}º`, arvores: progression.arvores, forca: true });
                } else {
                    slots.push({
                        key: `classe:${name}:${n}`, tipo: 'talento', fonte: `${name} ${n}º · talento bônus`,
                        lista: progression.talentosBonus.map(nome => ({ nome })),
                        aptidoesPermitidas: progression.aptidoesComoTalentoBonus || [],
                    });
                }
            }
            return;
        }

        for (let n = 1; n <= classLevel; n++) {
            prestigeSlotTypes(progression.vagas, n).forEach(tipo => {
                slots.push({
                    key: `classe:${name}:${n}${tipo === 'aptidao' ? '' : ':' + tipo}`, tipo, fonte: `${name} ${n}º`,
                    arvores: progression.arvores, forca: Boolean(progression.arvoresDaForca),
                });
            });
        }
    });
    return slots;
}

// ===== Pré-requisitos =====

function hasChoice(owned, tipo, nome, detalhe) {
    return owned.some(entry => entry.tipo === tipo && entry.nome === nome && (!detalhe || entry.detalhe === detalhe));
}

// Tudo o que a ficha já tem (automáticos + escolhas), menos a vaga que está sendo trocada
function getOwnedChoices(sheet, ignoreSlotKey) {
    return [
        ...getAutomaticChoices(sheet),
        ...(sheet.escolhas || []).filter(entry => entry.vaga !== ignoreSlotKey),
    ];
}

function getItemPrerequisites(tipo, nome, detalhe) {
    if (tipo === 'aptidao') return APTITUDE_PREREQUISITES[nome] || [];
    if (tipo === 'tecnica' || tipo === 'segredo') {
        return (typeof FORCE_TECHNIQUE_PREREQUISITES !== 'undefined' && FORCE_TECHNIQUE_PREREQUISITES[nome]) || [];
    }
    const known = TALENT_PREREQUISITES[`${nome} [${detalhe}]`] || TALENT_PREREQUISITES[nome];
    if (known) return known;
    // Sem cadastro: se o texto da Biblioteca cita pré-requisito, vira aviso para conferir
    const text = LIBRARY_ITEM_DETAILS[nome]?.text || '';
    const cited = text.match(/Pré-requisitos?:\s*([^\n]+)/);
    if (cited && !/^nenhum/i.test(cited[1].trim())) return [{ tipo: 'texto', texto: cited[1].trim().replace(/\.$/, '') }];
    return [];
}

// Texto de um pré-requisito sem olhar a ficha (usado na janela de Classes)
function describeRequirement(req) {
    const skillLabel = key => SKILL_ROWS.find(s => s.key === key)?.label || key;
    const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
    switch (req.tipo) {
        case 'atributo': return `${ATTRIBUTE_NAMES[req.attr] || req.attr} ${req.min}`;
        case 'bba': return `Bônus base de ataque +${req.min}`;
        case 'pericia': return `Treinado em ${skillLabel(req.pericia)}`;
        case 'periciaAlguma': return req.texto || `Treinado em ${req.pericias.map(skillLabel).join(' ou ')}`;
        case 'nivel': return `Nível ${req.min} de personagem`;
        case 'talento':
        case 'aptidao':
            return `${CHOICE_TYPE_LABELS[req.tipo].singular} ${choiceShortName(req.nome)}${req.detalhe && req.detalhe !== '@escolhido' ? ' — ' + req.detalhe : ''}`;
        case 'poder': return `Poder da Força ${choiceShortName(req.nome)}`;
        case 'alguma': return req.requisitos.map(describeRequirement).join(' ou ');
        case 'todos': return req.requisitos.map(describeRequirement).join(' e ');
        case 'arvoreQuantidade':
            return `Pelo menos ${plural(req.min, 'aptidão', 'aptidões')} de ${req.arvores.map(shortTreeName).join(' ou ')}`;
        case 'aptidoesDaForca': return `Pelo menos ${plural(req.min, 'aptidão da Força', 'aptidões da Força')}`;
        case 'escolhaQuantidade':
            return `Pelo menos ${plural(req.min, CHOICE_TYPE_LABELS[req.escolha].singular, CHOICE_TYPE_LABELS[req.escolha].plural)}`;
        case 'droide': return req.droide ? 'Ser droide' : 'Não ser droide';
        case 'tamanho':
        case 'especie': return req.texto;
        default: return req.texto;
    }
}

// Espécies que são droides (para pré-requisitos "Droide" / "Não droide")
const DROID_SPECIES = ['replica-droid'];

function evaluateRequirement(sheet, req, owned, detalheEscolhido) {
    const skillLabel = key => SKILL_ROWS.find(s => s.key === key)?.label || key;
    switch (req.tipo) {
        case 'alguma':
        case 'todos': {
            const parts = req.requisitos.map(r => evaluateRequirement(sheet, r, owned, detalheEscolhido));
            const ok = req.tipo === 'alguma' ? parts.some(p => p.status === 'ok') : parts.every(p => p.status === 'ok');
            const warn = parts.some(p => p.status === 'warn');
            return { status: ok ? 'ok' : warn ? 'warn' : 'blocked', texto: parts.map(p => p.texto).join(req.tipo === 'alguma' ? ' ou ' : ' e ') };
        }
        case 'poder': {
            const english = (req.nome.match(/\(([^()]*)\)\s*$/) || [])[1] || req.nome;
            const name = findForcePowerName(req.nome);
            const has = (sheet.forcePowers || []).some(p => (name && findForcePowerName(p) === name)
                || normalizeChoiceText(p).includes(normalizeChoiceText(choiceShortName(req.nome)))
                || normalizeChoiceText(p).includes(normalizeChoiceText(english)));
            return { status: has ? 'ok' : 'blocked', texto: `Poder da Força ${choiceShortName(req.nome)}` };
        }
        case 'aptidoesDaForca': {
            const forceTrees = [
                ...(typeof FORCE_TALENT_TREES !== 'undefined' ? FORCE_TALENT_TREES : []),
                ...(typeof FORCE_TRADITION_TREES !== 'undefined' ? FORCE_TRADITION_TREES : []),
            ];
            const count = owned.filter(entry => entry.tipo === 'aptidao' && getTreesOfAptitude(entry.nome).some(t => forceTrees.includes(t))).length;
            return { status: count >= req.min ? 'ok' : 'blocked', texto: `${describeRequirement(req)} (você tem ${count})` };
        }
        case 'escolhaQuantidade': {
            const count = owned.filter(entry => entry.tipo === req.escolha).length;
            return { status: count >= req.min ? 'ok' : 'blocked', texto: `${describeRequirement(req)} (você tem ${count})` };
        }
        case 'arvoreQuantidade': {
            const count = owned.filter(entry => entry.tipo === 'aptidao' && getTreesOfAptitude(entry.nome).some(t => req.arvores.includes(t))).length;
            const trees = req.arvores.map(shortTreeName).join(' ou ');
            return { status: count >= req.min ? 'ok' : 'blocked', texto: `Pelo menos ${req.min} ${req.min > 1 ? 'aptidões' : 'aptidão'} de ${trees} (você tem ${count})` };
        }
        case 'periciaAlguma': {
            const ok = req.pericias.some(key => sheet.skills?.[key]?.treinada);
            return { status: ok ? 'ok' : 'blocked', texto: req.texto || `Treinado em ${req.pericias.map(skillLabel).join(' ou ')}` };
        }
        case 'droide': {
            const isDroid = DROID_SPECIES.includes(sheet.speciesKey);
            return { status: isDroid === req.droide ? 'ok' : 'blocked', texto: req.droide ? 'Ser droide' : 'Não ser droide' };
        }
        case 'tamanho': {
            const size = getSpeciesEffects(sheet)?.tamanho;
            if (!size) return { status: 'warn', texto: `${req.texto} — escolha a raça para checar` };
            return { status: req.tamanhos.includes(size) ? 'ok' : 'blocked', texto: req.texto };
        }
        case 'especie':
            return { status: req.especies.includes(sheet.speciesKey) ? 'ok' : 'blocked', texto: req.texto };
        case 'atributo': {
            const value = toInt(sheet.attributes?.[req.attr]?.val);
            return { status: value >= req.min ? 'ok' : 'blocked', texto: `${ATTRIBUTE_NAMES[req.attr] || req.attr} ${req.min} (você tem ${value})` };
        }
        case 'bba': {
            const bba = getBaseAttackBonus(sheet);
            return { status: bba >= req.min ? 'ok' : 'blocked', texto: `Bônus base de ataque +${req.min} (você tem +${bba})` };
        }
        case 'pericia':
            return { status: sheet.skills?.[req.pericia]?.treinada ? 'ok' : 'blocked', texto: `Treinado em ${skillLabel(req.pericia)}` };
        case 'nivel': {
            const level = getCharacterLevel(sheet);
            return { status: level >= req.min ? 'ok' : 'blocked', texto: `Nível ${req.min} de personagem (você tem ${level})` };
        }
        case 'talento':
        case 'aptidao': {
            // "@escolhido" = o mesmo complemento escolhido para o item (ex.: Foco em Arma exige proficiência com a mesma arma)
            const detalhe = req.detalhe === '@escolhido' ? detalheEscolhido : req.detalhe;
            if (req.detalhe === '@escolhido' && !detalhe) {
                return { status: 'ok', texto: `${CHOICE_TYPE_LABELS[req.tipo].singular} ${choiceShortName(req.nome)} com a arma escolhida` };
            }
            const label = `${CHOICE_TYPE_LABELS[req.tipo].singular} ${choiceShortName(req.nome)}${detalhe ? ' — ' + detalhe : ''}`;
            return { status: hasChoice(owned, req.tipo, req.nome, detalhe) ? 'ok' : 'blocked', texto: label };
        }
        default:
            return { status: 'warn', texto: `${req.texto} — confira com o Mestre` };
    }
}

// Situação de um item para uma vaga: ok, warn (só avisos) ou blocked
function evaluateChoice(sheet, candidate, detalhe, ignoreSlotKey) {
    const owned = getOwnedChoices(sheet, ignoreSlotKey);
    const chosenDetail = detalhe === '__qualquer__' ? undefined : detalhe;
    const results = getItemPrerequisites(candidate.tipo, candidate.nome, detalhe)
        .map(req => evaluateRequirement(sheet, req, owned, chosenDetail));

    const options = getDetailOptions(candidate.nome);
    const sameItem = owned.filter(entry => entry.tipo === candidate.tipo && entry.nome === candidate.nome);
    const maxTimes = REPEATABLE_ITEMS[candidate.nome]
        || (typeof APTITUDE_REPEATABLE !== 'undefined' && APTITUDE_REPEATABLE[candidate.nome]) || 0;
    // Repetir nunca trava (vários itens podem ser pegos mais de uma vez, ex.: Treinamento da Força); só avisa
    if (options) {
        if (detalhe && sameItem.some(entry => entry.detalhe === detalhe)) {
            results.unshift({ status: 'warn', texto: `Você já tem ${choiceShortName(candidate.nome)} — ${detalhe} (confira com o Mestre se pode repetir)` });
        }
    } else if (sameItem.length >= (maxTimes || 1)) {
        results.unshift({ status: 'warn', texto: maxTimes
            ? `Já escolhido ${sameItem.length} vezes (normalmente o máximo é ${maxTimes})`
            : `Você já tem este item ${sameItem.length === 1 ? '1 vez' : `${sameItem.length} vezes`} (confira com o Mestre se pode repetir)` });
    }
    if (candidate.tradicao) {
        results.push({ status: 'warn', texto: `Pertencer à tradição ${candidate.grupo} — confira com o Mestre` });
    }

    const status = results.some(r => r.status === 'blocked') ? 'blocked' : results.some(r => r.status === 'warn') ? 'warn' : 'ok';
    return { status, results };
}

// ===== Ficha antiga -> escolhas =====

// Leva a anotação da aba Notas junto quando o item muda de nome ou de lista (talento <-> aptidão)
function moveNote(sheet, prefix, oldName, newName, newPrefix = prefix) {
    const oldKey = `${prefix}_${encodeURIComponent(oldName)}`;
    const newKey = `${newPrefix}_${encodeURIComponent(newName)}`;
    if (!sheet.noteDetails || oldKey === newKey) return;
    if (sheet.noteDetails[oldKey] && !sheet.noteDetails[newKey]) {
        sheet.noteDetails[newKey] = sheet.noteDetails[oldKey];
        delete sheet.noteDetails[oldKey];
    }
}

function slotAccepts(sheet, slot, match) {
    if (slot.tipo === 'aptidao') {
        const trees = getSlotTrees(sheet, slot);
        return match.tipo === 'aptidao' && getTreesOfAptitude(match.nome).some(tree => trees.includes(tree));
    }
    if (slot.tipo !== 'talento') return false;
    if (match.tipo === 'aptidao') return (slot.aptidoesPermitidas || []).includes(match.nome);
    return !slot.lista || slot.lista.some(item => item.nome === match.nome && (!item.detalhe || item.detalhe === match.detalhe));
}

// Coloca os itens da ficha antiga que batem com a Biblioteca em vagas livres (ou como extra)
function resolveLegacyChoices(sheet) {
    let changed = false;
    const remaining = [];
    (sheet.outrosTalentos || []).forEach(legacy => {
        const match = matchLibraryName(legacy.texto);
        if (!match) {
            remaining.push(legacy);
            return;
        }
        changed = true;
        const oldPrefix = legacy.lista === 'aptitudes' ? 'aptitude' : 'talent';
        moveNote(sheet, oldPrefix, legacy.texto, choiceLabel(match), CHOICE_TYPE_LABELS[match.tipo].notePrefix);
        // Já vem de graça (talento inicial): nada a guardar
        if (hasChoice(getAutomaticChoices(sheet), match.tipo, match.nome, match.detalhe)) return;

        const taken = new Set((sheet.escolhas || []).map(entry => entry.vaga));
        const slot = getSheetSlots(sheet).find(s => !taken.has(s.key) && slotAccepts(sheet, s, match));
        sheet.escolhas.push({
            vaga: slot ? slot.key : `extra:${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
            tipo: match.tipo, nome: match.nome,
            ...(match.detalhe ? { detalhe: match.detalhe } : {}),
            ...(slot ? {} : { motivo: 'Da ficha antiga' }),
        });
    });
    if (changed) sheet.outrosTalentos = remaining;
    return changed;
}

// Mantém talents/aptitudes (lista de nomes usada nas Notas) igual às escolhas
function syncChoiceNameLists(sheet) {
    const entries = [...getAutomaticChoices(sheet), ...(sheet.escolhas || [])];
    let changed = false;
    ['talento', 'aptidao'].forEach(tipo => {
        const { field } = CHOICE_TYPE_LABELS[tipo];
        const names = [
            ...entries.filter(entry => entry.tipo === tipo).map(choiceLabel),
            ...(sheet.outrosTalentos || []).filter(legacy => legacy.lista === field).map(legacy => legacy.texto),
        ];
        if (JSON.stringify(sheet[field] || []) !== JSON.stringify(names)) {
            sheet[field] = names;
            changed = true;
        }
    });
    return changed;
}

// Chamado a cada renderização da ficha. Retorna true se algo precisa ser salvo.
function prepareSheetChoices(sheet) {
    let changed = false;
    if (!Array.isArray(sheet.escolhas)) {
        sheet.escolhas = [];
        sheet.outrosTalentos = [
            ...(sheet.talents || []).filter(t => String(t).trim()).map(texto => ({ texto: String(texto).trim(), lista: 'talents' })),
            ...(sheet.aptitudes || []).filter(t => String(t).trim()).map(texto => ({ texto: String(texto).trim(), lista: 'aptitudes' })),
        ];
        changed = true;
    }
    if (!Array.isArray(sheet.outrosTalentos)) {
        sheet.outrosTalentos = [];
        changed = true;
    }
    if (renameOldLibraryChoices(sheet)) changed = true;
    if (resolveLegacyChoices(sheet)) changed = true;
    if (renameOldSkillDetails(sheet)) changed = true;
    if (syncChoiceNameLists(sheet)) changed = true;
    return changed;
}

// Perícias renomeadas para o nome do livro: atualiza o complemento salvo (ex.: Foco em Perícia — Enganação)
const RENAMED_SKILL_LABELS = {
    'Enganação': 'Enganar',
    'Obter Informação': 'Reunir Informação',
    'Resistência': 'Tolerância',
    'Tratar Ferimentos': 'Tratar Ferimento',
    'Usar Computadores': 'Usar Computador',
};

function renameOldLibraryChoices(sheet) {
    let changed = false;
    (sheet.forcePowers || []).forEach((value, index) => {
        const name = findForcePowerName(value);
        if (!name || name === value) return;
        const oldKey = `force_${encodeURIComponent(value)}`;
        const newKey = `force_${encodeURIComponent(name)}`;
        const oldNote = sheet.noteDetails?.[oldKey];
        const newNote = sheet.noteDetails?.[newKey];
        if (oldNote && newNote && oldNote !== newNote) {
            sheet.noteDetails[newKey] = `${newNote}\n\n${oldNote}`;
            delete sheet.noteDetails[oldKey];
        } else moveNote(sheet, 'force', value, name);
        sheet.forcePowers[index] = name;
        changed = true;
    });
    (sheet.escolhas || []).forEach(entry => {
        const oldLabel = choiceLabel(entry);
        const name = resolveLibraryItemName(entry.nome, CHOICE_LIBRARY_CATEGORIES[entry.tipo]);
        const detail = TALENT_DETAIL_OPTIONS[name] === 'poder' ? findForcePowerName(entry.detalhe) : null;
        if (name === entry.nome && (!detail || choiceShortName(detail) === entry.detalhe)) return;
        entry.nome = name;
        if (detail) entry.detalhe = choiceShortName(detail);
        const prefix = CHOICE_TYPE_LABELS[entry.tipo]?.notePrefix;
        if (prefix) moveNote(sheet, prefix, oldLabel, choiceLabel(entry));
        changed = true;
    });
    return changed;
}

function renameOldSkillDetails(sheet) {
    const aptitudeOptions = typeof APTITUDE_DETAIL_OPTIONS !== 'undefined' ? APTITUDE_DETAIL_OPTIONS : {};
    let changed = false;
    sheet.escolhas.forEach(entry => {
        const isSkillDetail = (TALENT_DETAIL_OPTIONS[entry.nome] || aptitudeOptions[entry.nome]) === 'pericia';
        if (isSkillDetail && RENAMED_SKILL_LABELS[entry.detalhe]) {
            entry.detalhe = RENAMED_SKILL_LABELS[entry.detalhe];
            changed = true;
        }
    });
    return changed;
}

// ===== Cards na aba Ficha =====

function findForcePowerName(value) {
    const typed = normalizeChoiceText(resolveLibraryItemName(value, 'forcePowers'));
    if (!typed) return null;
    const english = name => normalizeChoiceText(String(name).match(/\(([^()]*)\)\s*$/)?.[1] || '');
    return (LIBRARY_DATA.forcePowers?.items || []).find(name =>
        typed === normalizeChoiceText(name) || typed === normalizeChoiceText(choiceShortName(name))
        || typed === english(name) || (english(value) && english(value) === english(name))) || null;
}


function checkClassEntry(sheet, index, className) {
    const reqs = getClassProgression(className)?.preRequisitos || [];
    if (!reqs.length) return { status: 'ok', results: [] };
    const others = { ...sheet, classes: (sheet.classes || []).filter((_, i) => i !== index) };
    const owned = getOwnedChoices(others);
    const results = reqs.map(req => evaluateRequirement(others, req, owned));
    const status = results.some(r => r.status === 'blocked') ? 'blocked' : results.some(r => r.status === 'warn') ? 'warn' : 'ok';
    return { status, results };
}
