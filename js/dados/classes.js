// Descrições e seções copiadas da fonte indicada pelo GM em 2026-10-13; dados básicos em formato compacto.
// Fonte: https://willemon.github.io/starwars-campanha/star_wars_firebase.html
// Algumas classes também têm descrições curtas na fonte. Classes ausentes nela são preservadas.
const HEROIC_CLASSES = ["Jedi", "Sith", "Nobre", "Malandro", "Batedor", "Soldado"];
const PRESTIGE_CLASSES = [
    "Piloto Ás", "Caçador de Recompensas", "Senhor do Crime", "Soldado de Elite", 
    "Adepto da Força", "Discípulo da Força", "Pistoleiro", "Cavaleiro Jedi", 
    "Mestre Jedi", "Oficial",
    "Agente Corporativo", "Gladiador", "Duelista de Melee", "Executor",
    "Droide Independente", "Infiltrador", "Corsário Mestre"
];

const CLASS_DATA = {
    "Jedi": {
            "nome": "Jedi",
            "desc": "Os Jedi são os guardiões da paz e justiça na galáxia. Eles aprendem a dominar a Força e sua arma característica é o Sabre de Luz.",
            "hp": "30 + CON no 1º nível; 1d10 + CON por nível.",
            "forcePoints": "5 + metade do nível do personagem por nível de classe.",
            "forcePointBase": 5,
            "defenses": "Fortitude +1, Reflexos +1, Vontade +1.",
            "skills": "2 + INT: Acrobacia, Resistência, Iniciativa, Saltar, Conhecimentos, Mecânica, Percepção, Pilotar, Usar a Força.",
            "feats": "Sensibilidade à Força, Proficiência com Sabres de Luz, Proficiência com Armas Simples.",
            "defenseBonuses": {
                    "FORT": 1,
                    "REF": 1,
                    "VON": 1
            },
            "initialTalents": [
                    "Sensibilidade à Força",
                    "Proficiência com Sabres de Luz",
                    "Proficiência com Armas Simples"
            ],
            "table": [
                    [
                            "Nível",
                            "BBA",
                            "Características"
                    ],
                    [
                            "1º",
                            "+1",
                            "Bônus de Defesa, Sabre de Luz, Aptidão, Talentos Iniciais"
                    ],
                    [
                            "2º",
                            "+2",
                            "Talento Bônus (Jedi)"
                    ],
                    [
                            "3º",
                            "+3",
                            "Aptidão"
                    ],
                    [
                            "4º",
                            "+4",
                            "Talento Bônus (Jedi)"
                    ],
                    [
                            "5º",
                            "+5",
                            "Aptidão"
                    ],
                    [
                            "6º",
                            "+6",
                            "Talento Bônus (Jedi)"
                    ],
                    [
                            "7º",
                            "+7",
                            "Aptidão, Construção de Sabre de Luz"
                    ],
                    [
                            "8º",
                            "+8",
                            "Talento Bônus (Jedi)"
                    ],
                    [
                            "9º",
                            "+9",
                            "Aptidão"
                    ],
                    [
                            "10º",
                            "+10",
                            "Talento Bônus (Jedi)"
                    ],
                    [
                            "11º",
                            "+11",
                            "Aptidão"
                    ],
                    [
                            "12º",
                            "+12",
                            "Talento Bônus (Jedi)"
                    ],
                    [
                            "13º",
                            "+13",
                            "Aptidão"
                    ],
                    [
                            "14º",
                            "+14",
                            "Talento Bônus (Jedi)"
                    ],
                    [
                            "15º",
                            "+15",
                            "Aptidão"
                    ],
                    [
                            "16º",
                            "+16",
                            "Talento Bônus (Jedi)"
                    ],
                    [
                            "17º",
                            "+17",
                            "Aptidão"
                    ],
                    [
                            "18º",
                            "+18",
                            "Talento Bônus (Jedi)"
                    ],
                    [
                            "19º",
                            "+19",
                            "Aptidão"
                    ],
                    [
                            "20º",
                            "+20",
                            "Talento Bônus (Jedi)"
                    ]
            ]
    },
    "Noble": {
            "nome": "Nobre",
            "desc": "O Nobre é um negociador astuto que inspira confiança e é um excelente líder. Usa intelecto e carisma para navegar na galáxia.",
            "hp": "18 + CON no 1º nível; 1d6 + CON por nível.",
            "forcePoints": "5 + metade do nível do personagem por nível de classe.",
            "forcePointBase": 5,
            "defenses": "Reflexos +1, Vontade +2.",
            "skills": "6 + INT: Enganação, Obter Informação, Iniciativa, Conhecimentos, Percepção, Persuasão, Pilotar, Montar, Tratar Ferimentos, Usar Computadores.",
            "feats": "Linguista, Proficiência com Pistolas, Proficiência com Armas Simples.",
            "defenseBonuses": {
                    "FORT": 0,
                    "REF": 1,
                    "VON": 2
            },
            "initialTalents": [
                    "Linguista",
                    "Proficiência com Pistolas",
                    "Proficiência com Armas Simples"
            ],
            "table": [
                    [
                            "Nível",
                            "BBA",
                            "Características"
                    ],
                    [
                            "1º",
                            "+0",
                            "Bônus de Defesa, Aptidão, Talentos Iniciais"
                    ],
                    [
                            "2º",
                            "+1",
                            "Talento Bônus (Nobre)"
                    ],
                    [
                            "3º",
                            "+2",
                            "Aptidão"
                    ],
                    [
                            "4º",
                            "+3",
                            "Talento Bônus (Nobre)"
                    ],
                    [
                            "5º",
                            "+3",
                            "Aptidão"
                    ],
                    [
                            "6º",
                            "+4",
                            "Talento Bônus (Nobre)"
                    ],
                    [
                            "7º",
                            "+5",
                            "Aptidão"
                    ],
                    [
                            "8º",
                            "+6",
                            "Talento Bônus (Nobre)"
                    ],
                    [
                            "9º",
                            "+6",
                            "Aptidão"
                    ],
                    [
                            "10º",
                            "+7",
                            "Talento Bônus (Nobre)"
                    ],
                    [
                            "11º",
                            "+8",
                            "Aptidão"
                    ],
                    [
                            "12º",
                            "+9",
                            "Talento Bônus (Nobre)"
                    ],
                    [
                            "13º",
                            "+9",
                            "Aptidão"
                    ],
                    [
                            "14º",
                            "+10",
                            "Talento Bônus (Nobre)"
                    ],
                    [
                            "15º",
                            "+11",
                            "Aptidão"
                    ],
                    [
                            "16º",
                            "+12",
                            "Talento Bônus (Nobre)"
                    ],
                    [
                            "17º",
                            "+12",
                            "Aptidão"
                    ],
                    [
                            "18º",
                            "+13",
                            "Talento Bônus (Nobre)"
                    ],
                    [
                            "19º",
                            "+14",
                            "Aptidão"
                    ],
                    [
                            "20º",
                            "+15",
                            "Talento Bônus (Nobre)"
                    ]
            ]
    },
    "Scoundrel": {
            "nome": "Malandro",
            "desc": "O Malandro é um ladino habilidoso que prefere a furtividade e a astúcia à força bruta. Vivem no limiar da lei.",
            "hp": "18 + CON no 1º nível; 1d6 + CON por nível.",
            "forcePoints": "5 + metade do nível do personagem por nível de classe.",
            "forcePointBase": 5,
            "defenses": "Reflexos +2, Vontade +1.",
            "skills": "4 + INT: Acrobacia, Enganação, Obter Informação, Iniciativa, Conhecimentos, Mecânica, Percepção, Persuasão, Pilotar, Furtividade, Usar Computadores.",
            "feats": "Tiro à Queima-Roupa, Proficiência com Pistolas, Proficiência com Armas Simples.",
            "defenseBonuses": {
                    "FORT": 0,
                    "REF": 2,
                    "VON": 1
            },
            "initialTalents": [
                    "Tiro à Queima-Roupa",
                    "Proficiência com Pistolas",
                    "Proficiência com Armas Simples"
            ],
            "table": [
                    [
                            "Nível",
                            "BBA",
                            "Características"
                    ],
                    [
                            "1º",
                            "+0",
                            "Bônus de Defesa, Aptidão, Talentos Iniciais"
                    ],
                    [
                            "2º",
                            "+1",
                            "Talento Bônus (Malandro)"
                    ],
                    [
                            "3º",
                            "+2",
                            "Aptidão"
                    ],
                    [
                            "4º",
                            "+3",
                            "Talento Bônus (Malandro)"
                    ],
                    [
                            "5º",
                            "+3",
                            "Aptidão"
                    ],
                    [
                            "6º",
                            "+4",
                            "Talento Bônus (Malandro)"
                    ],
                    [
                            "7º",
                            "+5",
                            "Aptidão"
                    ],
                    [
                            "8º",
                            "+6",
                            "Talento Bônus (Malandro)"
                    ],
                    [
                            "9º",
                            "+6",
                            "Aptidão"
                    ],
                    [
                            "10º",
                            "+7",
                            "Talento Bônus (Malandro)"
                    ],
                    [
                            "11º",
                            "+8",
                            "Aptidão"
                    ],
                    [
                            "12º",
                            "+9",
                            "Talento Bônus (Malandro)"
                    ],
                    [
                            "13º",
                            "+9",
                            "Aptidão"
                    ],
                    [
                            "14º",
                            "+10",
                            "Talento Bônus (Malandro)"
                    ],
                    [
                            "15º",
                            "+11",
                            "Aptidão"
                    ],
                    [
                            "16º",
                            "+12",
                            "Talento Bônus (Malandro)"
                    ],
                    [
                            "17º",
                            "+12",
                            "Aptidão"
                    ],
                    [
                            "18º",
                            "+13",
                            "Talento Bônus (Malandro)"
                    ],
                    [
                            "19º",
                            "+14",
                            "Aptidão"
                    ],
                    [
                            "20º",
                            "+15",
                            "Talento Bônus (Malandro)"
                    ]
            ]
    },
    "Scout": {
            "nome": "Batedor",
            "desc": "Exploradores astutos e sobreviventes natos, os Batedores operam nas fronteiras selvagens do espaço.",
            "hp": "24 + CON no 1º nível; 1d8 + CON por nível.",
            "forcePoints": "5 + metade do nível do personagem por nível de classe.",
            "forcePointBase": 5,
            "defenses": "Fortitude +1, Reflexos +2.",
            "skills": "5 + INT: Escalar, Resistência, Iniciativa, Saltar, Conhecimentos, Mecânica, Percepção, Pilotar, Montar, Furtividade, Sobrevivência, Nadar.",
            "feats": "Shake It Off, Proficiência com Pistolas, Proficiência com Rifles, Proficiência com Armas Simples.",
            "defenseBonuses": {
                    "FORT": 1,
                    "REF": 2,
                    "VON": 0
            },
            "initialTalents": [
                    "Shake It Off",
                    "Proficiência com Pistolas",
                    "Proficiência com Rifles",
                    "Proficiência com Armas Simples"
            ],
            "table": [
                    [
                            "Nível",
                            "BBA",
                            "Características"
                    ],
                    [
                            "1º",
                            "+0",
                            "Bônus de Defesa, Aptidão, Talentos Iniciais"
                    ],
                    [
                            "2º",
                            "+1",
                            "Talento Bônus (Batedor)"
                    ],
                    [
                            "3º",
                            "+2",
                            "Aptidão"
                    ],
                    [
                            "4º",
                            "+3",
                            "Talento Bônus (Batedor)"
                    ],
                    [
                            "5º",
                            "+3",
                            "Aptidão"
                    ],
                    [
                            "6º",
                            "+4",
                            "Talento Bônus (Batedor)"
                    ],
                    [
                            "7º",
                            "+5",
                            "Aptidão"
                    ],
                    [
                            "8º",
                            "+6",
                            "Talento Bônus (Batedor)"
                    ],
                    [
                            "9º",
                            "+6",
                            "Aptidão"
                    ],
                    [
                            "10º",
                            "+7",
                            "Talento Bônus (Batedor)"
                    ],
                    [
                            "11º",
                            "+8",
                            "Aptidão"
                    ],
                    [
                            "12º",
                            "+9",
                            "Talento Bônus (Batedor)"
                    ],
                    [
                            "13º",
                            "+9",
                            "Aptidão"
                    ],
                    [
                            "14º",
                            "+10",
                            "Talento Bônus (Batedor)"
                    ],
                    [
                            "15º",
                            "+11",
                            "Aptidão"
                    ],
                    [
                            "16º",
                            "+12",
                            "Talento Bônus (Batedor)"
                    ],
                    [
                            "17º",
                            "+12",
                            "Aptidão"
                    ],
                    [
                            "18º",
                            "+13",
                            "Talento Bônus (Batedor)"
                    ],
                    [
                            "19º",
                            "+14",
                            "Aptidão"
                    ],
                    [
                            "20º",
                            "+15",
                            "Talento Bônus (Batedor)"
                    ]
            ]
    },
    "Soldier": {
            "nome": "Soldado",
            "desc": "Guerreiros disciplinados com treinamento marcial inigualável, os Soldados são os mestres do combate na galáxia.",
            "hp": "30 + CON no 1º nível; 1d10 + CON por nível.",
            "forcePoints": "5 + metade do nível do personagem por nível de classe.",
            "forcePointBase": 5,
            "defenses": "Reflexos +1, Fortitude +2.",
            "skills": "3 + INT: Escalar, Resistência, Iniciativa, Saltar, Conhecimento (Táticas), Mecânica, Percepção, Pilotar, Nadar, Tratar Ferimentos, Usar Computadores.",
            "feats": "Proficiência com Armaduras (Leve, Média), Proficiência com Pistolas, Proficiência com Rifles, Proficiência com Armas Simples.",
            "defenseBonuses": {
                    "FORT": 2,
                    "REF": 1,
                    "VON": 0
            },
            "initialTalents": [
                    "Proficiência com Armaduras (Leve, Média)",
                    "Proficiência com Pistolas",
                    "Proficiência com Rifles",
                    "Proficiência com Armas Simples"
            ],
            "table": [
                    [
                            "Nível",
                            "BBA",
                            "Características"
                    ],
                    [
                            "1º",
                            "+1",
                            "Bônus de Defesa, Aptidão, Talentos Iniciais"
                    ],
                    [
                            "2º",
                            "+2",
                            "Talento Bônus (Soldado)"
                    ],
                    [
                            "3º",
                            "+3",
                            "Aptidão"
                    ],
                    [
                            "4º",
                            "+4",
                            "Talento Bônus (Soldado)"
                    ],
                    [
                            "5º",
                            "+5",
                            "Aptidão"
                    ],
                    [
                            "6º",
                            "+6",
                            "Talento Bônus (Soldado)"
                    ],
                    [
                            "7º",
                            "+7",
                            "Aptidão"
                    ],
                    [
                            "8º",
                            "+8",
                            "Talento Bônus (Soldado)"
                    ],
                    [
                            "9º",
                            "+9",
                            "Aptidão"
                    ],
                    [
                            "10º",
                            "+10",
                            "Talento Bônus (Soldado)"
                    ],
                    [
                            "11º",
                            "+11",
                            "Aptidão"
                    ],
                    [
                            "12º",
                            "+12",
                            "Talento Bônus (Soldado)"
                    ],
                    [
                            "13º",
                            "+13",
                            "Aptidão"
                    ],
                    [
                            "14º",
                            "+14",
                            "Talento Bônus (Soldado)"
                    ],
                    [
                            "15º",
                            "+15",
                            "Aptidão"
                    ],
                    [
                            "16º",
                            "+16",
                            "Talento Bônus (Soldado)"
                    ],
                    [
                            "17º",
                            "+17",
                            "Aptidão"
                    ],
                    [
                            "18º",
                            "+18",
                            "Talento Bônus (Soldado)"
                    ],
                    [
                            "19º",
                            "+19",
                            "Aptidão"
                    ],
                    [
                            "20º",
                            "+20",
                            "Talento Bônus (Soldado)"
                    ]
            ]
    },
    "Sith": {
            "nome": "Sith",
            "desc": "A energia do Lado Sombrio da Força corre através do Sith, concedendo-lhe poderes terríveis e a capacidade de dominar. Este personagem frequentemente manifesta a Força através de emoções intensas como ódio, raiva e ambição. O Carisma e a Sabedoria são as habilidades mais importantes para um Sith, pois governam a manipulação e o poder da Força, embora o Vigor e a Força sejam cruciais para aqueles que seguem o caminho do Guerreiro Sith.",
            "hp": "30 + CON no 1º nível; 1d10 + CON por nível.",
            "forcePoints": "5 + metade do nível do personagem por nível de classe.",
            "forcePointBase": 5,
            "defenses": "Fortitude +1, Reflexos +1, Vontade +1.",
            "skills": "2 + INT: Acrobacia, Conhecimentos, Enganação, Iniciativa, Intimidar, Percepção, Persuasão, Pilotar, Saltar, Usar a Força.",
            "feats": "Sensibilidade à Força, Proficiência com Sabres de Luz, Proficiência com Armas Simples.",
            "defenseBonuses": {
                    "FORT": 1,
                    "REF": 1,
                    "VON": 1
            },
            "initialTalents": [
                    "Sensibilidade à Força",
                    "Proficiência com Sabres de Luz",
                    "Proficiência com Armas Simples"
            ],
            "table": [
                    [
                            "Nível",
                            "BBA",
                            "Características"
                    ],
                    [
                            "1º",
                            "+1",
                            "Bônus de Defesa, Sabre de Luz, Aptidão, Talentos Iniciais, Acólito Sith"
                    ],
                    [
                            "2º",
                            "+2",
                            "Talento Bônus (Sith)"
                    ],
                    [
                            "3º",
                            "+3",
                            "Aptidão"
                    ],
                    [
                            "4º",
                            "+4",
                            "Talento Bônus (Sith), Aprendiz Sith"
                    ],
                    [
                            "5º",
                            "+5",
                            "Aptidão"
                    ],
                    [
                            "6º",
                            "+6",
                            "Talento Bônus (Sith)"
                    ],
                    [
                            "7º",
                            "+7",
                            "Construir Sabre de Luz, Aptidão, Sith"
                    ],
                    [
                            "8º",
                            "+8",
                            "Talento Bônus (Sith)"
                    ],
                    [
                            "9º",
                            "+9",
                            "Aptidão"
                    ],
                    [
                            "10º",
                            "+10",
                            "Talento Bônus (Sith)"
                    ],
                    [
                            "11º",
                            "+11",
                            "Aptidão, Lorde Sith"
                    ],
                    [
                            "12º",
                            "+12",
                            "Talento Bônus (Sith)"
                    ],
                    [
                            "13º",
                            "+13",
                            "Aptidão"
                    ],
                    [
                            "14º",
                            "+14",
                            "Talento Bônus (Sith)"
                    ],
                    [
                            "15º",
                            "+15",
                            "Aptidão"
                    ],
                    [
                            "16º",
                            "+16",
                            "Talento Bônus (Sith), Lorde Negro (Darth)"
                    ],
                    [
                            "17º",
                            "+17",
                            "Aptidão"
                    ],
                    [
                            "18º",
                            "+18",
                            "Talento Bônus (Sith)"
                    ],
                    [
                            "19º",
                            "+19",
                            "Aptidão"
                    ],
                    [
                            "20º",
                            "+20",
                            "Talento Bônus (Sith)"
                    ]
            ],
            "sections": [
                    {
                            "title": "Sabre de Luz",
                            "text": "Você começa o jogo com um sabre de luz providenciado pelo seu Mestre ou, se for um Acólito, um sabre de luz de treinamento. Mais tarde, você pode construir seu próprio sabre de luz (ver Construir Sabre de Luz, abaixo)."
                    },
                    {
                            "title": "Seleção de Aptidões",
                            "text": "No 1º nível e a cada nível de número ímpar seguinte (3º, 5º, 7º, etc.), você seleciona uma aptidão de qualquer uma das seguintes árvores de aptidão. Você pode escolher uma aptidão de qualquer árvore que você desejar, mas você deve atender aos pré-requisitos (se houver) da aptidão escolhida. Aptidões não podem ser selecionadas mais de uma vez a menos que expressamente indicado."
                    },
                    {
                            "title": "Hierarquia Sith (Velha República)",
                            "text": "A progressão na classe Sith reflete a hierarquia do Império Sith na Velha República, onde a Ordem é vasta e hierárquica.\n\n• Acólito Sith (1º Nível): O personagem começa como um Acólito, um estudante na Academia Sith em Korriban ou em outro mundo Sith. O foco é na sobrevivência e na demonstração de poder.\n\n• Aprendiz Sith (4º Nível): O Acólito provou seu valor e foi escolhido por um Lorde Sith para ser seu aprendiz pessoal. O treinamento se torna mais focado e brutal.\n\n• Sith (7º Nível): O Aprendiz completou seus testes e se tornou um membro pleno da Ordem, assumindo o título de Guerreiro Sith, Inquisidor Sith ou similar.\n\n• Lorde Sith (11º Nível): O Sith alcança o domínio do Lado Sombrio e pode tomar seu próprio aprendiz.\n\n• Lorde Negro (Darth) (16º Nível): O Sith mais poderoso, que pode ser um membro do Conselho Sombrio ou um mestre de grande influência."
                    },
                    {
                            "title": "Construindo um Sabre de Luz",
                            "text": "Esta seção é idêntica à seção Construindo um Sabre de Luz da classe Jedi. Você pode construir um sabre de luz se você possuir ao menos sete níveis heróicos além dos talentos Sensibilidade da Força e Proficiência com Armas (sabres de luz). Você deve gastar 1.500 créditos para obter os componentes básicos e 24 horas ininterruptas construindo a arma. Ao final deste tempo, faça um teste de Usar a Força com CD 20; você não pode escolher 20 neste teste. Se obtiver um sucesso neste teste, você completa a construção do sabre de luz. Se o teste falhar, você deve passar outras 24 horas desmontando e reconstruindo a arma defeituosa. Depois que seu sabre de luz for construído, você deve gastar um Ponto de Força para afiná-lo (uma ação de rodada completa). Deste ponto em diante, você recebe um bônus de +1 em rolagens de ataque com o seu sabre de luz feito sob medida. Ninguém mais que brandir a arma recebe este bônus. Você pode construir um sabre de luz duplo ao invés de um sabre de luz normal, mas o custo dos componentes aumenta para 3.000 créditos."
                    },
                    {
                            "title": "Talentos Bônus",
                            "text": "A cada nível de número par (2º, 4º, 6º, etc.), você recebe um talento bônus. Este talento deve ser selecionado da lista a seguir, e você deve atender qualquer pré-requisito para este talento. Ataque Acrobático, Trespassar, Reflexos de Combate, Esquiva, Ataque Duplo, Domínio de Armas Duplas I, Domínio de Armas Duplas II, Domínio de Armas Duplas III, Trespassar Maior, Investida Aprimorada, Desarme Aprimorado, Artes Marciais I, Artes Marciais II, Artes Marciais III, Defesa de Ataque Físico, Mobilidade, Saque Rápido, Ataque Poderoso, Investida Poderosa, Ataque Rápido, Ataque em Corrida, Foco em Perícia, Treinamento em Perícia, Forte na Força, Ataque Triplo, Triplo Crítico, Acuidade Mente, Foco em Arma (sabres de luz), Poder do Lado Sombrio, Adepto do Lado Sombrio."
                    },
                    {
                            "title": "Explorações",
                            "text": "Todos os Sith viajam pela galáxia para impor a vontade do Império e buscar poder. Eles assumem a responsabilidade de esmagar a oposição e eliminar a fraqueza, tanto em si mesmos quanto nos outros. Muitos Sith seguem o Lado Sombrio por pura ambição e desejo de poder. Eles caminham em um mundo maior do que aqueles que não sentem ou não consideram a Força."
                    },
                    {
                            "title": "Créditos Iniciais",
                            "text": "Um Sith de 1º nível começa o jogo com 3d4 × 100 créditos."
                    }
            ]
    },
    "Ace Pilot": {
            "nome": "Piloto Ás",
            "desc": "Classe de Prestígio. Requisitos: Nível 7+, Pilotar (Treinada), Vehicular Combat",
            "hp": "1d8 + CON por nível.",
            "forcePoints": "6 + metade do nível do personagem (arredondada para baixo) a cada novo nível nesta classe.",
            "forcePointBase": 6,
            "defenses": "Bônus de Classe: Reflexos +2",
            "skills": "Não ganha perícias treinadas adicionais.",
            "feats": "Não ganha talentos iniciais.",
            "defenseBonuses": {
                    "FORT": 2,
                    "REF": 4,
                    "VON": 0
            },
            "initialTalents": [],
            "table": [
                    [
                            "Nível",
                            "BBA",
                            "Características"
                    ],
                    [
                            "1º",
                            "+0.75",
                            "Aptidão"
                    ],
                    [
                            "2º",
                            "+0.75",
                            "Técnica da Força ou Outra"
                    ],
                    [
                            "3º",
                            "+0.75",
                            "Aptidão"
                    ],
                    [
                            "4º",
                            "+0.75",
                            "Técnica da Força ou Outra"
                    ],
                    [
                            "5º",
                            "+0.75",
                            "Aptidão"
                    ],
                    [
                            "6º",
                            "+0.75",
                            "Técnica da Força ou Outra"
                    ],
                    [
                            "7º",
                            "+0.75",
                            "Aptidão"
                    ],
                    [
                            "8º",
                            "+0.75",
                            "Técnica da Força ou Outra"
                    ],
                    [
                            "9º",
                            "+0.75",
                            "Aptidão"
                    ],
                    [
                            "10º",
                            "+0.75",
                            "Segredo da Força ou Outra"
                    ]
            ]
    },
    "Bounty Hunter": {
            "nome": "Caçador de Recompensas",
            "desc": "Classe de Prestígio. Requisitos: Nível 7+, Sobrevivência (Treinada), 2 Awareness Talents",
            "hp": "1d10 + CON por nível.",
            "forcePoints": "6 + metade do nível do personagem (arredondada para baixo) a cada novo nível nesta classe.",
            "forcePointBase": 6,
            "defenses": "Bônus de Classe: Reflexos +1, Fortitude +1, Vontade +1",
            "skills": "Não ganha perícias treinadas adicionais.",
            "feats": "Não ganha talentos iniciais.",
            "defenseBonuses": {
                    "FORT": 2,
                    "REF": 4,
                    "VON": 0
            },
            "initialTalents": [],
            "table": [
                    [
                            "Nível",
                            "BBA",
                            "Características"
                    ],
                    [
                            "1º",
                            "+1",
                            "Aptidão"
                    ],
                    [
                            "2º",
                            "+1",
                            "Técnica da Força ou Outra"
                    ],
                    [
                            "3º",
                            "+1",
                            "Aptidão"
                    ],
                    [
                            "4º",
                            "+1",
                            "Técnica da Força ou Outra"
                    ],
                    [
                            "5º",
                            "+1",
                            "Aptidão"
                    ],
                    [
                            "6º",
                            "+1",
                            "Técnica da Força ou Outra"
                    ],
                    [
                            "7º",
                            "+1",
                            "Aptidão"
                    ],
                    [
                            "8º",
                            "+1",
                            "Técnica da Força ou Outra"
                    ],
                    [
                            "9º",
                            "+1",
                            "Aptidão"
                    ],
                    [
                            "10º",
                            "+1",
                            "Segredo da Força ou Outra"
                    ]
            ]
    },
    "Crime Lord": {
            "nome": "Senhor do Crime",
            "desc": "Classe de Prestígio. Requisitos: Nível 7+, Enganação e Persuasão (Treinadas), 1 Fortune/Lineage/Misfortune Talent",
            "hp": "1d8 + CON por nível.",
            "forcePoints": "6 + metade do nível do personagem (arredondada para baixo) a cada novo nível nesta classe.",
            "forcePointBase": 6,
            "defenses": "Bônus de Classe: Vontade +2, Reflexos +1",
            "skills": "Não ganha perícias treinadas adicionais.",
            "feats": "Não ganha talentos iniciais.",
            "defenseBonuses": {
                    "FORT": 0,
                    "REF": 2,
                    "VON": 4
            },
            "initialTalents": [],
            "table": [
                    [
                            "Nível",
                            "BBA",
                            "Características"
                    ],
                    [
                            "1º",
                            "+0.75",
                            "Aptidão"
                    ],
                    [
                            "2º",
                            "+0.75",
                            "Técnica da Força ou Outra"
                    ],
                    [
                            "3º",
                            "+0.75",
                            "Aptidão"
                    ],
                    [
                            "4º",
                            "+0.75",
                            "Técnica da Força ou Outra"
                    ],
                    [
                            "5º",
                            "+0.75",
                            "Aptidão"
                    ],
                    [
                            "6º",
                            "+0.75",
                            "Técnica da Força ou Outra"
                    ],
                    [
                            "7º",
                            "+0.75",
                            "Aptidão"
                    ],
                    [
                            "8º",
                            "+0.75",
                            "Técnica da Força ou Outra"
                    ],
                    [
                            "9º",
                            "+0.75",
                            "Aptidão"
                    ],
                    [
                            "10º",
                            "+0.75",
                            "Segredo da Força ou Outra"
                    ]
            ]
    },
    "Elite Trooper": {
            "nome": "Soldado de Elite",
            "desc": "Classe de Prestígio. Requisitos: BBA +7, AP (Medium), Martial Arts I, Point-Blank Shot ou Flurry, 1 Armor/Commando/Mercenary/Weapon Talent",
            "hp": "1d12 + CON por nível.",
            "forcePoints": "6 + metade do nível do personagem (arredondada para baixo) a cada novo nível nesta classe.",
            "forcePointBase": 6,
            "defenses": "Bônus de Classe: Fortitude +2, Reflexos +1",
            "skills": "Não ganha perícias treinadas adicionais.",
            "feats": "Não ganha talentos iniciais.",
            "defenseBonuses": {
                    "FORT": 4,
                    "REF": 2,
                    "VON": 0
            },
            "initialTalents": [],
            "table": [
                    [
                            "Nível",
                            "BBA",
                            "Características"
                    ],
                    [
                            "1º",
                            "+1",
                            "Aptidão"
                    ],
                    [
                            "2º",
                            "+1",
                            "Técnica da Força ou Outra"
                    ],
                    [
                            "3º",
                            "+1",
                            "Aptidão"
                    ],
                    [
                            "4º",
                            "+1",
                            "Técnica da Força ou Outra"
                    ],
                    [
                            "5º",
                            "+1",
                            "Aptidão"
                    ],
                    [
                            "6º",
                            "+1",
                            "Técnica da Força ou Outra"
                    ],
                    [
                            "7º",
                            "+1",
                            "Aptidão"
                    ],
                    [
                            "8º",
                            "+1",
                            "Técnica da Força ou Outra"
                    ],
                    [
                            "9º",
                            "+1",
                            "Aptidão"
                    ],
                    [
                            "10º",
                            "+1",
                            "Segredo da Força ou Outra"
                    ]
            ]
    },
    "Force Adept": {
            "nome": "Adepto da Força",
            "desc": "Classe de Prestígio. Requisitos: Nível 7+, Use the Force (Treinada), Force Sensitivity, 3 Force Talents",
            "hp": "1d8 + CON por nível.",
            "forcePoints": "6 + metade do nível do personagem (arredondada para baixo) a cada novo nível nesta classe.",
            "forcePointBase": 6,
            "defenses": "Bônus de Classe: Vontade +2, Fortitude +1",
            "skills": "Não ganha perícias treinadas adicionais.",
            "feats": "Não ganha talentos iniciais.",
            "defenseBonuses": {
                    "FORT": 2,
                    "REF": 2,
                    "VON": 4
            },
            "initialTalents": [],
            "table": [
                    [
                            "Nível",
                            "BBA",
                            "Características"
                    ],
                    [
                            "1º",
                            "+0.75",
                            "Aptidão"
                    ],
                    [
                            "2º",
                            "+0.75",
                            "Técnica da Força ou Outra"
                    ],
                    [
                            "3º",
                            "+0.75",
                            "Aptidão"
                    ],
                    [
                            "4º",
                            "+0.75",
                            "Técnica da Força ou Outra"
                    ],
                    [
                            "5º",
                            "+0.75",
                            "Aptidão"
                    ],
                    [
                            "6º",
                            "+0.75",
                            "Técnica da Força ou Outra"
                    ],
                    [
                            "7º",
                            "+0.75",
                            "Aptidão"
                    ],
                    [
                            "8º",
                            "+0.75",
                            "Técnica da Força ou Outra"
                    ],
                    [
                            "9º",
                            "+0.75",
                            "Aptidão"
                    ],
                    [
                            "10º",
                            "+0.75",
                            "Segredo da Força ou Outra"
                    ]
            ]
    },
    "Force Disciple": {
            "nome": "Discípulo da Força",
            "desc": "Classe de Prestígio. Requisitos: Nível 12+, Use the Force (Treinada), Force Sensitivity, 2 Dark Side/Force Adept/Force Item Talents, Farseeing, 1 Force Technique",
            "hp": "1d8 + CON por nível.",
            "forcePoints": "7 + metade do nível do personagem (arredondada para baixo) a cada novo nível nesta classe.",
            "forcePointBase": 7,
            "defenses": "Bônus de Classe: Vontade +2, Fortitude +1, Reflexos +1",
            "skills": "Não ganha perícias treinadas adicionais.",
            "feats": "Não ganha talentos iniciais.",
            "defenseBonuses": {
                    "FORT": 3,
                    "REF": 3,
                    "VON": 6
            },
            "initialTalents": [],
            "table": [
                    [
                            "Nível",
                            "BBA",
                            "Características"
                    ],
                    [
                            "1º",
                            "+0.75",
                            "Aptidão"
                    ],
                    [
                            "2º",
                            "+0.75",
                            "Técnica da Força ou Outra"
                    ],
                    [
                            "3º",
                            "+0.75",
                            "Aptidão"
                    ],
                    [
                            "4º",
                            "+0.75",
                            "Técnica da Força ou Outra"
                    ],
                    [
                            "5º",
                            "+0.75",
                            "Aptidão"
                    ],
                    [
                            "6º",
                            "+0.75",
                            "Técnica da Força ou Outra"
                    ],
                    [
                            "7º",
                            "+0.75",
                            "Aptidão"
                    ],
                    [
                            "8º",
                            "+0.75",
                            "Técnica da Força ou Outra"
                    ],
                    [
                            "9º",
                            "+0.75",
                            "Aptidão"
                    ],
                    [
                            "10º",
                            "+0.75",
                            "Segredo da Força ou Outra"
                    ]
            ]
    },
    "Gunslinger": {
            "nome": "Pistoleiro",
            "desc": "Classe de Prestígio. Requisitos: Nível 7+, Point-Blank Shot, Precise Shot, Quick Draw, WP (Pistols)",
            "hp": "1d8 + CON por nível.",
            "forcePoints": "6 + metade do nível do personagem (arredondada para baixo) a cada novo nível nesta classe.",
            "forcePointBase": 6,
            "defenses": "Bônus de Classe: Reflexos +2, Vontade +1",
            "skills": "Não ganha perícias treinadas adicionais.",
            "feats": "Não ganha talentos iniciais.",
            "defenseBonuses": {
                    "FORT": 0,
                    "REF": 4,
                    "VON": 2
            },
            "initialTalents": [],
            "table": [
                    [
                            "Nível",
                            "BBA",
                            "Características"
                    ],
                    [
                            "1º",
                            "+1",
                            "Aptidão"
                    ],
                    [
                            "2º",
                            "+1",
                            "Técnica da Força ou Outra"
                    ],
                    [
                            "3º",
                            "+1",
                            "Aptidão"
                    ],
                    [
                            "4º",
                            "+1",
                            "Técnica da Força ou Outra"
                    ],
                    [
                            "5º",
                            "+1",
                            "Aptidão"
                    ],
                    [
                            "6º",
                            "+1",
                            "Técnica da Força ou Outra"
                    ],
                    [
                            "7º",
                            "+1",
                            "Aptidão"
                    ],
                    [
                            "8º",
                            "+1",
                            "Técnica da Força ou Outra"
                    ],
                    [
                            "9º",
                            "+1",
                            "Aptidão"
                    ],
                    [
                            "10º",
                            "+1",
                            "Segredo da Força ou Outra"
                    ]
            ]
    },
    "Jedi Knight": {
            "nome": "Cavaleiro Jedi",
            "desc": "Classe de Prestígio. Requisitos: BBA +7, Use the Force (Treinada), Force Sensitivity, WP (Lightsabers), Membro dos Jedi",
            "hp": "1d10 + CON por nível.",
            "forcePoints": "6 + metade do nível do personagem (arredondada para baixo) a cada novo nível nesta classe.",
            "forcePointBase": 6,
            "defenses": "Bônus de Classe: Reflexos +1, Fortitude +1, Vontade +1",
            "skills": "Não ganha perícias treinadas adicionais.",
            "feats": "Não ganha talentos iniciais.",
            "defenseBonuses": {
                    "FORT": 2,
                    "REF": 2,
                    "VON": 2
            },
            "initialTalents": [],
            "table": [
                    [
                            "Nível",
                            "BBA",
                            "Características"
                    ],
                    [
                            "1º",
                            "+1",
                            "Aptidão"
                    ],
                    [
                            "2º",
                            "+1",
                            "Técnica da Força ou Outra"
                    ],
                    [
                            "3º",
                            "+1",
                            "Aptidão"
                    ],
                    [
                            "4º",
                            "+1",
                            "Técnica da Força ou Outra"
                    ],
                    [
                            "5º",
                            "+1",
                            "Aptidão"
                    ],
                    [
                            "6º",
                            "+1",
                            "Técnica da Força ou Outra"
                    ],
                    [
                            "7º",
                            "+1",
                            "Aptidão"
                    ],
                    [
                            "8º",
                            "+1",
                            "Técnica da Força ou Outra"
                    ],
                    [
                            "9º",
                            "+1",
                            "Aptidão"
                    ],
                    [
                            "10º",
                            "+1",
                            "Segredo da Força ou Outra"
                    ]
            ]
    },
    "Jedi Master": {
            "nome": "Mestre Jedi",
            "desc": "Classe de Prestígio. Requisitos: Nível 12+, Use the Force (Treinada), Force Sensitivity, WP (Lightsabers), 1 Force Technique, Membro dos Jedi",
            "hp": "1d10 + CON por nível.",
            "forcePoints": "7 + metade do nível do personagem (arredondada para baixo) a cada novo nível nesta classe.",
            "forcePointBase": 7,
            "defenses": "Bônus de Classe: Vontade +2, Reflexos +1, Fortitude +1",
            "skills": "Não ganha perícias treinadas adicionais.",
            "feats": "Não ganha talentos iniciais.",
            "defenseBonuses": {
                    "FORT": 3,
                    "REF": 3,
                    "VON": 3
            },
            "initialTalents": [],
            "table": [
                    [
                            "Nível",
                            "BBA",
                            "Características"
                    ],
                    [
                            "1º",
                            "+0.75",
                            "Aptidão"
                    ],
                    [
                            "2º",
                            "+0.75",
                            "Técnica da Força ou Outra"
                    ],
                    [
                            "3º",
                            "+0.75",
                            "Aptidão"
                    ],
                    [
                            "4º",
                            "+0.75",
                            "Técnica da Força ou Outra"
                    ],
                    [
                            "5º",
                            "+0.75",
                            "Aptidão"
                    ],
                    [
                            "6º",
                            "+0.75",
                            "Técnica da Força ou Outra"
                    ],
                    [
                            "7º",
                            "+0.75",
                            "Aptidão"
                    ],
                    [
                            "8º",
                            "+0.75",
                            "Técnica da Força ou Outra"
                    ],
                    [
                            "9º",
                            "+0.75",
                            "Aptidão"
                    ],
                    [
                            "10º",
                            "+0.75",
                            "Segredo da Força ou Outra"
                    ]
            ]
    },
    "Officer": {
            "nome": "Oficial",
            "desc": "Classe de Prestígio. Requisitos: Nível 7+, Conhecimento (Táticas) (Treinada), 1 Leadership/Commando/Veteran Talent, Organização Militar",
            "hp": "1d8 + CON por nível.",
            "forcePoints": "6 + metade do nível do personagem (arredondada para baixo) a cada novo nível nesta classe.",
            "forcePointBase": 6,
            "defenses": "Bônus de Classe: Vontade +2, Reflexos +1",
            "skills": "Não ganha perícias treinadas adicionais.",
            "feats": "Não ganha talentos iniciais.",
            "defenseBonuses": {
                    "FORT": 0,
                    "REF": 2,
                    "VON": 4
            },
            "initialTalents": [],
            "table": [
                    [
                            "Nível",
                            "BBA",
                            "Características"
                    ],
                    [
                            "1º",
                            "+0.75",
                            "Aptidão"
                    ],
                    [
                            "2º",
                            "+0.75",
                            "Técnica da Força ou Outra"
                    ],
                    [
                            "3º",
                            "+0.75",
                            "Aptidão"
                    ],
                    [
                            "4º",
                            "+0.75",
                            "Técnica da Força ou Outra"
                    ],
                    [
                            "5º",
                            "+0.75",
                            "Aptidão"
                    ],
                    [
                            "6º",
                            "+0.75",
                            "Técnica da Força ou Outra"
                    ],
                    [
                            "7º",
                            "+0.75",
                            "Aptidão"
                    ],
                    [
                            "8º",
                            "+0.75",
                            "Técnica da Força ou Outra"
                    ],
                    [
                            "9º",
                            "+0.75",
                            "Aptidão"
                    ],
                    [
                            "10º",
                            "+0.75",
                            "Segredo da Força ou Outra"
                    ]
            ]
    },
    "Sith Apprentice": {
            "nome": "Aprendiz Sith",
            "desc": "Classe de Prestígio.",
            "hp": "1d10 por nível + CON.",
            "forcePoints": "6 + metade do nível de personagem a cada nível nesta classe.",
            "forcePointBase": 6,
            "defenses": "Fortitude +2, Reflexos +2, Vontade +2.",
            "skills": "Não ganha perícias treinadas adicionais.",
            "feats": "Não ganha talentos iniciais.",
            "defenseBonuses": {
                    "FORT": 2,
                    "REF": 2,
                    "VON": 2
            },
            "initialTalents": [],
            "table": [
                    [
                            "Nível",
                            "BBA",
                            "Características"
                    ],
                    [
                            "1º",
                            "+1",
                            "Bônus de Defesa, Aptidão"
                    ],
                    [
                            "2º",
                            "+2",
                            "Técnica da Força"
                    ],
                    [
                            "3º",
                            "+3",
                            "Aptidão"
                    ],
                    [
                            "4º",
                            "+4",
                            "Técnica da Força"
                    ],
                    [
                            "5º",
                            "+5",
                            "Aptidão"
                    ],
                    [
                            "6º",
                            "+6",
                            "Técnica da Força"
                    ],
                    [
                            "7º",
                            "+7",
                            "Aptidão"
                    ],
                    [
                            "8º",
                            "+8",
                            "Técnica da Força"
                    ],
                    [
                            "9º",
                            "+9",
                            "Aptidão"
                    ],
                    [
                            "10º",
                            "+10",
                            "Técnica da Força"
                    ]
            ]
    },
    "Sith Lord": {
            "nome": "Lorde Sith",
            "desc": "Classe de Prestígio.",
            "hp": "1d10 por nível + CON.",
            "forcePoints": "7 + metade do nível de personagem a cada nível nesta classe.",
            "forcePointBase": 7,
            "defenses": "Fortitude +3, Reflexos +3, Vontade +3.",
            "skills": "Não ganha perícias treinadas adicionais.",
            "feats": "Não ganha talentos iniciais.",
            "defenseBonuses": {
                    "FORT": 3,
                    "REF": 3,
                    "VON": 3
            },
            "initialTalents": [],
            "table": [
                    [
                            "Nível",
                            "BBA",
                            "Características"
                    ],
                    [
                            "1º",
                            "+1",
                            "Bônus de Defesa, Destemido, Aptidão, Tentação"
                    ],
                    [
                            "2º",
                            "+2",
                            "Segredo da Força"
                    ],
                    [
                            "3º",
                            "+3",
                            "Segredo da Força, Aptidão"
                    ],
                    [
                            "4º",
                            "+4",
                            "Segredo da Força"
                    ],
                    [
                            "5º",
                            "+5",
                            "Segredo da Força, Aptidão"
                    ]
            ]
    },
    "Assassin": {
            "nome": "Assassino",
            "desc": "Classe de Prestígio. Requisitos: Nível 7+, Furtividade (Treinada), Sniper, Dastardly Strike",
            "hp": "1d8 + CON por nível.",
            "forcePoints": "6 + metade do nível do personagem (arredondada para baixo) a cada novo nível nesta classe.",
            "forcePointBase": 6,
            "defenses": "Bônus de Classe: Reflexos +2",
            "skills": "Não ganha perícias treinadas adicionais.",
            "feats": "Não ganha talentos iniciais.",
            "defenseBonuses": {
                    "FORT": 2,
                    "REF": 4,
                    "VON": 0
            },
            "initialTalents": [],
            "table": [
                    [
                            "Nível",
                            "BBA",
                            "Características"
                    ],
                    [
                            "1º",
                            "+1",
                            "Aptidão"
                    ],
                    [
                            "2º",
                            "+1",
                            "Técnica da Força ou Outra"
                    ],
                    [
                            "3º",
                            "+1",
                            "Aptidão"
                    ],
                    [
                            "4º",
                            "+1",
                            "Técnica da Força ou Outra"
                    ],
                    [
                            "5º",
                            "+1",
                            "Aptidão"
                    ],
                    [
                            "6º",
                            "+1",
                            "Técnica da Força ou Outra"
                    ],
                    [
                            "7º",
                            "+1",
                            "Aptidão"
                    ],
                    [
                            "8º",
                            "+1",
                            "Técnica da Força ou Outra"
                    ],
                    [
                            "9º",
                            "+1",
                            "Aptidão"
                    ],
                    [
                            "10º",
                            "+1",
                            "Segredo da Força ou Outra"
                    ]
            ]
    },
    "Imperial Knight": {
            "nome": "Cavaleiro Imperial",
            "desc": "Classe de Prestígio.",
            "hp": "1d10 por nível + CON.",
            "forcePoints": "6 + metade do nível de personagem a cada nível nesta classe.",
            "forcePointBase": 6,
            "defenses": "Fortitude +2, Reflexos +2, Vontade +2.",
            "skills": "Não ganha perícias treinadas adicionais.",
            "feats": "Não ganha talentos iniciais.",
            "defenseBonuses": {
                    "FORT": 2,
                    "REF": 2,
                    "VON": 2
            },
            "initialTalents": [],
            "table": [
                    [
                            "Nível",
                            "BBA",
                            "Características"
                    ],
                    [
                            "1º",
                            "+1",
                            "Bônus de Defesa, Aptidão"
                    ],
                    [
                            "2º",
                            "+2",
                            "Técnica da Força"
                    ],
                    [
                            "3º",
                            "+3",
                            "Aptidão"
                    ],
                    [
                            "4º",
                            "+4",
                            "Técnica da Força"
                    ],
                    [
                            "5º",
                            "+5",
                            "Aptidão"
                    ],
                    [
                            "6º",
                            "+6",
                            "Técnica da Força"
                    ],
                    [
                            "7º",
                            "+7",
                            "Aptidão"
                    ],
                    [
                            "8º",
                            "+8",
                            "Técnica da Força"
                    ],
                    [
                            "9º",
                            "+9",
                            "Aptidão"
                    ],
                    [
                            "10º",
                            "+10",
                            "Técnica da Força"
                    ]
            ]
    },
    "Corporate Agent": {
            "nome": "Agente Corporativo",
            "desc": "Classe de Prestígio (Knights of the Old Republic Campaign Guide). Agentes corporativos cuidam dos interesses de grandes corporações interestelares, podendo se especializar em segurança, fraude, exploração, administração ou espionagem corporativa. Requisitos: Nível 7+, Obter Informação e Conhecimento (Burocracia) (Treinadas), Foco em Perícia (Conhecimento (Burocracia)), Empregado por corporação interestelar.",
            "hp": "1d8 + CON por nível.",
            "forcePoints": "6 + metade do nível do personagem por nível de classe.",
            "forcePointBase": 6,
            "defenses": "Bônus de Classe: Reflexos +2, Vontade +4.",
            "skills": "Não ganha perícias treinadas adicionais.",
            "feats": "Não ganha talentos iniciais.",
            "defenseBonuses": {
                    "FORT": 0,
                    "REF": 2,
                    "VON": 4
            },
            "initialTalents": [],
            "table": [
                    [
                            "Nível",
                            "BBA",
                            "Características"
                    ],
                    [
                            "1º",
                            "+0",
                            "Bônus de Defesa, Talento"
                    ],
                    [
                            "2º",
                            "+1",
                            "Liderança Executiva (1/Encontro)"
                    ],
                    [
                            "3º",
                            "+2",
                            "Talento"
                    ],
                    [
                            "4º",
                            "+3",
                            "Liderança Executiva (2/Encontro)"
                    ],
                    [
                            "5º",
                            "+3",
                            "Talento"
                    ],
                    [
                            "6º",
                            "+4",
                            "Liderança Executiva (3/Encontro)"
                    ],
                    [
                            "7º",
                            "+5",
                            "Talento"
                    ],
                    [
                            "8º",
                            "+6",
                            "Liderança Executiva (4/Encontro)"
                    ],
                    [
                            "9º",
                            "+6",
                            "Talento"
                    ],
                    [
                            "10º",
                            "+7",
                            "Liderança Executiva (5/Encontro)"
                    ]
            ]
    },
    "Gladiator": {
            "nome": "Gladiador",
            "desc": "Classe de Prestígio (Knights of the Old Republic Campaign Guide). Gladiadores são combatentes de arena extremamente perigosos, vindos de diversos backgrounds — ex-soldados, caçadores de emoções ou prisioneiros forçados a lutar. Requisitos: Nível 7+, BBA +7, Improved Damage Threshold, Proficiência com Armas Corpo a Corpo Avançadas.",
            "hp": "1d10 + CON por nível.",
            "forcePoints": "6 + metade do nível do personagem por nível de classe.",
            "forcePointBase": 6,
            "defenses": "Bônus de Classe: Reflexos +4, Fortitude +2.",
            "skills": "Não ganha perícias treinadas adicionais.",
            "feats": "Não ganha talentos iniciais.",
            "defenseBonuses": {
                    "FORT": 2,
                    "REF": 4,
                    "VON": 0
            },
            "initialTalents": [],
            "table": [
                    [
                            "Nível",
                            "BBA",
                            "Características"
                    ],
                    [
                            "1º",
                            "+1",
                            "Bônus de Defesa, Talento"
                    ],
                    [
                            "2º",
                            "+2",
                            "Inabalável (1/Encontro)"
                    ],
                    [
                            "3º",
                            "+3",
                            "Talento"
                    ],
                    [
                            "4º",
                            "+4",
                            "Inabalável (2/Encontro)"
                    ],
                    [
                            "5º",
                            "+5",
                            "Talento"
                    ],
                    [
                            "6º",
                            "+6",
                            "Inabalável (3/Encontro)"
                    ],
                    [
                            "7º",
                            "+7",
                            "Talento"
                    ],
                    [
                            "8º",
                            "+8",
                            "Inabalável (4/Encontro)"
                    ],
                    [
                            "9º",
                            "+9",
                            "Talento"
                    ],
                    [
                            "10º",
                            "+10",
                            "Inabalável (5/Encontro)"
                    ]
            ]
    },
    "Melee Duelist": {
            "nome": "Duelista de Melee",
            "desc": "Classe de Prestígio (Knights of the Old Republic Campaign Guide). Especialistas em combate singular, os Duelistas de Melee dominam manobras, fintas e truques com armas corpo a corpo. Jedi e Sith também podem se tornar Duelistas para aprimorar seu combate com sabres de luz. Requisitos: Nível 7+, BBA +7, Melee Defense, Rapid Strike, Weapon Focus (Arma Corpo a Corpo).",
            "hp": "1d8 + CON por nível.",
            "forcePoints": "6 + metade do nível do personagem por nível de classe.",
            "forcePointBase": 6,
            "defenses": "Bônus de Classe: Reflexos +4, Vontade +2.",
            "skills": "Não ganha perícias treinadas adicionais.",
            "feats": "Não ganha talentos iniciais.",
            "defenseBonuses": {
                    "FORT": 0,
                    "REF": 4,
                    "VON": 2
            },
            "initialTalents": [],
            "table": [
                    [
                            "Nível",
                            "BBA",
                            "Características"
                    ],
                    [
                            "1º",
                            "+1",
                            "Bônus de Defesa, Talento"
                    ],
                    [
                            "2º",
                            "+2",
                            "Mestre do Movimento (1/Encontro)"
                    ],
                    [
                            "3º",
                            "+3",
                            "Talento"
                    ],
                    [
                            "4º",
                            "+4",
                            "Mestre do Movimento (2/Encontro)"
                    ],
                    [
                            "5º",
                            "+5",
                            "Talento"
                    ],
                    [
                            "6º",
                            "+6",
                            "Mestre do Movimento (3/Encontro)"
                    ],
                    [
                            "7º",
                            "+7",
                            "Talento"
                    ],
                    [
                            "8º",
                            "+8",
                            "Mestre do Movimento (4/Encontro)"
                    ],
                    [
                            "9º",
                            "+9",
                            "Talento"
                    ],
                    [
                            "10º",
                            "+10",
                            "Mestre do Movimento (5/Encontro)"
                    ]
            ]
    },
    "Enforcer": {
            "nome": "Executor",
            "desc": "Classe de Prestígio (Force Unleashed Campaign Guide). Executores são oficiais de elite da lei — investigadores habilidosos, patrulheiros experientes e líderes dentro de suas organizações. Podem ser honestos defensores da paz ou corruptos em busca de poder pessoal. Requisitos: Nível 7+, Obter Informação e Percepção (Treinadas), 1 Talento da Árvore de Sobrevivente, Membro de organização de segurança.",
            "hp": "1d8 + CON por nível.",
            "forcePoints": "6 + metade do nível do personagem por nível de classe.",
            "forcePointBase": 6,
            "defenses": "Bônus de Classe: Reflexos +4, Vontade +2.",
            "skills": "Não ganha perícias treinadas adicionais.",
            "feats": "Não ganha talentos iniciais.",
            "defenseBonuses": {
                    "FORT": 0,
                    "REF": 4,
                    "VON": 4
            },
            "initialTalents": [],
            "table": [
                    [
                            "Nível",
                            "BBA",
                            "Características"
                    ],
                    [
                            "1º",
                            "+0",
                            "Bônus de Defesa, Recursos, Talento"
                    ],
                    [
                            "2º",
                            "+1",
                            "Recursos, Suspeito Alvo +1"
                    ],
                    [
                            "3º",
                            "+2",
                            "Recursos, Talento"
                    ],
                    [
                            "4º",
                            "+3",
                            "Recursos, Suspeito Alvo +2"
                    ],
                    [
                            "5º",
                            "+3",
                            "Recursos, Talento"
                    ],
                    [
                            "6º",
                            "+4",
                            "Recursos, Suspeito Alvo +3"
                    ],
                    [
                            "7º",
                            "+5",
                            "Recursos, Talento"
                    ],
                    [
                            "8º",
                            "+6",
                            "Recursos, Suspeito Alvo +4"
                    ],
                    [
                            "9º",
                            "+6",
                            "Recursos, Talento"
                    ],
                    [
                            "10º",
                            "+7",
                            "Recursos, Suspeito Alvo +5"
                    ]
            ]
    },
    "Independent Droid": {
            "nome": "Droide Independente",
            "desc": "Classe de Prestígio (Force Unleashed Campaign Guide). Droides altamente independentes e autossuficientes que passaram por um evento que quebrou sua programação — ordens conflitantes, processador com defeito ou ação deliberada. Rejeitam a noção de pertencer a alguém e expressam forte individualidade. Requisitos: Nível 3+, Usar Computador (Treinada), Processador Heurístico, Deve ser um Droide.",
            "hp": "1d12 por nível (sem modificador de CON).",
            "forcePoints": "6 + metade do nível do personagem por nível de classe.",
            "forcePointBase": 6,
            "defenses": "Bônus de Classe: Reflexos +2, Vontade +4.",
            "skills": "Não ganha perícias treinadas adicionais.",
            "feats": "Não ganha talentos iniciais.",
            "defenseBonuses": {
                    "FORT": 0,
                    "REF": 2,
                    "VON": 4
            },
            "initialTalents": [],
            "table": [
                    [
                            "Nível",
                            "BBA",
                            "Características"
                    ],
                    [
                            "1º",
                            "+0",
                            "Bônus de Defesa, Sapiência, Talento"
                    ],
                    [
                            "2º",
                            "+1",
                            "Espírito Independente +1"
                    ],
                    [
                            "3º",
                            "+2",
                            "Talento"
                    ],
                    [
                            "4º",
                            "+3",
                            "Espírito Independente +2"
                    ],
                    [
                            "5º",
                            "+3",
                            "Talento"
                    ],
                    [
                            "6º",
                            "+4",
                            "Espírito Independente +3"
                    ],
                    [
                            "7º",
                            "+5",
                            "Talento"
                    ],
                    [
                            "8º",
                            "+6",
                            "Espírito Independente +4"
                    ],
                    [
                            "9º",
                            "+6",
                            "Talento"
                    ],
                    [
                            "10º",
                            "+7",
                            "Espírito Independente +5"
                    ]
            ]
    },
    "Infiltrator": {
            "nome": "Infiltrador",
            "desc": "Classe de Prestígio (Force Unleashed Campaign Guide). Infiltradores são espiões, agentes secretos e operativos de forças especiais que se especializam em penetrar secretamente fortalezas ou organizações inimigas. Operam individualmente ou em pequenos grupos, com ênfase em furtividade e combate discreto. Requisitos: Nível 7+, Percepção e Furtividade (Treinadas), Foco em Perícia (Furtividade), 2 Talentos da Árvore de Camuflagem ou Espião.",
            "hp": "1d8 + CON por nível.",
            "forcePoints": "6 + metade do nível do personagem por nível de classe.",
            "forcePointBase": 6,
            "defenses": "Bônus de Classe: Reflexos +4, Vontade +2.",
            "skills": "Não ganha perícias treinadas adicionais.",
            "feats": "Não ganha talentos iniciais.",
            "defenseBonuses": {
                    "FORT": 0,
                    "REF": 4,
                    "VON": 2
            },
            "initialTalents": [],
            "table": [
                    [
                            "Nível",
                            "BBA",
                            "Características"
                    ],
                    [
                            "1º",
                            "+0",
                            "Bônus de Defesa, Talento"
                    ],
                    [
                            "2º",
                            "+1",
                            "Atordoamento Desarmado (+1d)"
                    ],
                    [
                            "3º",
                            "+2",
                            "Talento"
                    ],
                    [
                            "4º",
                            "+3",
                            "Infiltrador Líder"
                    ],
                    [
                            "5º",
                            "+3",
                            "Talento"
                    ],
                    [
                            "6º",
                            "+4",
                            "Atordoamento Desarmado (+2d)"
                    ],
                    [
                            "7º",
                            "+5",
                            "Talento"
                    ],
                    [
                            "8º",
                            "+6",
                            "Infiltrador Líder (x2)"
                    ],
                    [
                            "9º",
                            "+6",
                            "Talento"
                    ],
                    [
                            "10º",
                            "+7",
                            "Atordoamento Desarmado (+3d)"
                    ]
            ]
    },
    "Master Privateer": {
            "nome": "Corsário Mestre",
            "desc": "Classe de Prestígio (Force Unleashed Campaign Guide). Corsários Mestres são especialistas na arte de parar e apreender naves. São pilotos habilidosos, combatentes capazes e negociadores astutos que operam sob cartas de corso de governos ou corporações. A linha entre piratas e corsários é frequentemente borrada. Requisitos: Nível 7+, Enganação e Pilotar (Treinadas), Vehicular Combat, 2 Talentos da Árvore de Infortúnio, Contrabando ou Espacial.",
            "hp": "1d10 + CON por nível.",
            "forcePoints": "6 + metade do nível do personagem por nível de classe.",
            "forcePointBase": 6,
            "defenses": "Bônus de Classe: Vontade +4, Reflexos +2.",
            "skills": "Não ganha perícias treinadas adicionais.",
            "feats": "Não ganha talentos iniciais.",
            "defenseBonuses": {
                    "FORT": 0,
                    "REF": 2,
                    "VON": 4
            },
            "initialTalents": [],
            "table": [
                    [
                            "Nível",
                            "BBA",
                            "Características"
                    ],
                    [
                            "1º",
                            "+1",
                            "Bônus de Defesa, Tentação da Pirataria, Talento"
                    ],
                    [
                            "2º",
                            "+2",
                            "Corsário Veterano (1/Encontro)"
                    ],
                    [
                            "3º",
                            "+3",
                            "Talento"
                    ],
                    [
                            "4º",
                            "+4",
                            "Corsário Veterano (2/Encontro)"
                    ],
                    [
                            "5º",
                            "+5",
                            "Talento"
                    ],
                    [
                            "6º",
                            "+6",
                            "Corsário Veterano (3/Encontro)"
                    ],
                    [
                            "7º",
                            "+7",
                            "Talento"
                    ],
                    [
                            "8º",
                            "+8",
                            "Corsário Veterano (4/Encontro)"
                    ],
                    [
                            "9º",
                            "+9",
                            "Talento"
                    ],
                    [
                            "10º",
                            "+10",
                            "Corsário Veterano (5/Encontro)"
                    ]
            ]
    }
};
