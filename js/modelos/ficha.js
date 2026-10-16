// Estrutura inicial da ficha e chaves persistidas. Nao depende do DOM ou Firebase.

// As chaves identificam campos salvos; renomea-las exige migracao dos dados antigos.
const SKILLS = [
    { key: 'acrobacia',      label: 'Acrobacia',         attr: 'DES', icon: 'acrobatics' },
    { key: 'conhecimentos',  label: 'Conhecimento',      attr: 'INT', icon: 'knowledge', group: 'knowledge' },
    { key: 'enganacao',      label: 'Enganar',           attr: 'CAR', icon: 'deception' },
    { key: 'escalar',        label: 'Escalar',           attr: 'FOR', icon: 'climb' },
    { key: 'furtividade',    label: 'Furtividade',       attr: 'DES', icon: 'stealth' },
    { key: 'iniciativa',     label: 'Iniciativa',        attr: 'DES', icon: 'initiative' },
    { key: 'mecanica',       label: 'Mecânica',          attr: 'INT', icon: 'mechanics' },
    { key: 'montaria',       label: 'Montar',            attr: 'DES', icon: 'ride' },
    { key: 'nadar',          label: 'Nadar',             attr: 'FOR', icon: 'swim' },
    { key: 'percepcao',      label: 'Percepção',         attr: 'SAB', icon: 'perception' },
    { key: 'persuasao',      label: 'Persuasão',         attr: 'CAR', icon: 'persuasion' },
    { key: 'pilotar',        label: 'Pilotar',           attr: 'DES', icon: 'pilot' },
    { key: 'obterInfo',      label: 'Reunir Informação', attr: 'CAR', icon: 'gather-information' },
    { key: 'saltar',         label: 'Saltar',            attr: 'FOR', icon: 'jump' },
    { key: 'sobrevivencia',  label: 'Sobrevivência',     attr: 'SAB', icon: 'survival' },
    { key: 'resistencia',    label: 'Tolerância',        attr: 'CON', icon: 'endurance' },
    { key: 'primeiros',      label: 'Tratar Ferimento',  attr: 'SAB', icon: 'treat-injury' },
    { key: 'usarForca',      label: 'Usar a Força',      attr: 'CAR', icon: 'use-the-force' },
    { key: 'usarComputador', label: 'Usar Computador',   attr: 'INT', icon: 'use-computer' },
];

const KNOWLEDGE_SKILLS = [
    { key: 'conhecimentoBurocracia',        label: 'Burocracia',         attr: 'INT', icon: 'knowledge-bureaucracy' },
    { key: 'conhecimentoCienciasFisicas',   label: 'Ciências Físicas',   attr: 'INT', icon: 'knowledge-physical-sciences' },
    { key: 'conhecimentoCienciasSociais',   label: 'Ciências Sociais',   attr: 'INT', icon: 'knowledge-social-sciences' },
    { key: 'conhecimentoCienciasVida',      label: 'Ciências da Vida',   attr: 'INT', icon: 'knowledge-life-sciences' },
    { key: 'conhecimentoTaticas',           label: 'Táticas',            attr: 'INT', icon: 'knowledge-tactics' },
    { key: 'conhecimentoTecnologia',        label: 'Tecnologia',         attr: 'INT', icon: 'knowledge-technology' },
    { key: 'conhecimentoTradicaoGalactica', label: 'Tradição Galáctica', attr: 'INT', icon: 'knowledge-galactic-lore' },
];

const REMOVED_SKILLS = [
    { key: 'atletismo', label: 'Atletismo', hint: 'use Escalar, Saltar ou Nadar' },
    { key: 'intimidar', label: 'Intimidar', hint: 'no Saga Edition intimidar é feito com Persuasão' },
];

const SKILL_ROWS = [...SKILLS.filter(skill => !skill.group), ...KNOWLEDGE_SKILLS];

const ATTRIBUTES = ['FOR', 'DES', 'CON', 'INT', 'SAB', 'CAR'];

const DEFENSES = [
    { key: 'FORT', label: 'Fortitude', attr: 'CON', icon: 'fortitude' },
    { key: 'REF',  label: 'Reflexos',  attr: 'DES', icon: 'reflex' },
    { key: 'VON',  label: 'Vontade',   attr: 'SAB', icon: 'will' },
];

function createEmptySheet(id) {
    return {
        id: id || Date.now() + Math.floor(Math.random() * 100000),
        name: "Novo Personagem",
        player: "",
        classes: [{ name: "Jedi", level: 1 }],
        species: "",
        speciesKey: "",
        level: 1,
        age: "",
        sex: "",
        weight: "",
        height: "",
        alignment: "Neutro",
        // val = valor real do atributo (já com a raça); speciesMods = modificadores de raça já somados em val
        attributes: {
            FOR: { val: 10, mod: 0 },
            DES: { val: 10, mod: 0 },
            CON: { val: 10, mod: 0 },
            INT: { val: 10, mod: 0 },
            SAB: { val: 10, mod: 0 },
            CAR: { val: 10, mod: 0 }
        },
        hp: { total: 0, current: 0 },
        damageThreshold: { other: 0 },
        condition: 0,
        defenses: {
            FORT: { level: 0, class: 0, hab: 0, other: 0 },
            REF: { level: 0, class: 0, hab: 0, other: 0 },
            VON: { level: 0, class: 0, hab: 0, other: 0 }
        },
        combat: { speed: "", init: "", perc: "", bab: "", forcePoints: "" },
        inventory: [],
        attacks: [],
        specialActions: ["", "", ""],
        skills: Object.fromEntries(SKILL_ROWS.map(skill => [skill.key, { treinada: false, bonus: 0 }])),
        // talents/aptitudes são recalculados a partir de "escolhas" (js/talentos.js cria esse campo na
        // primeira renderização e converte o que já estiver digitado aqui)
        talents: [],
        aptitudes: [],
        excludedAutomaticChoices: [],
        forcePowers: [],
        lore: "",
        noteDetails: {},
        generalNotes: "",
        customNotes: [],
        activeTab: 'ficha',
        image: "",
        imageState: {
            zoom: 1,
            offsetX: 0,
            offsetY: 0
        }
    };
}
