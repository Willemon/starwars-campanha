# Organização do código

O site continua sendo publicado como arquivos estáticos. Esta separação não exige
acesso administrativo ao Firebase, instalação de dependências ou configuração de build.

| Responsabilidade | Local |
| --- | --- |
| Estrutura inicial das fichas e tipos de equipamentos | `js/modelos/` |
| Cálculos, validações, pré-requisitos e compatibilidade com dados antigos | `js/regras/` |
| Catálogos de classes, espécies, poderes e textos | `js/dados/` |
| Renderização, formulários e eventos | `js/ficha.js`, `js/equipamentos.js`, `js/ataques.js`, `js/talentos.js` e demais telas em `js/` |
| Agendamento de gravações | `js/persistencia/salvamento.js` |
| Login, transporte Firestore e leitura em tempo real | `js/firebase.js` |
| Estado da sessão, status visual e criação de fichas | `js/estado.js` |

## Como acrescentar uma funcionalidade

1. Defina seus campos e valores iniciais no modelo, preservando as chaves existentes.
2. Implemente o cálculo ou a validação em `js/regras/`, recebendo a ficha ou item como argumento.
3. Teste essa regra com objetos de exemplo, sem carregar a interface ou o Firebase.
4. Na interface, leia o formulário, valide pela regra, altere a ficha e chame `scheduleSave`.
5. Confira a recuperação dos dados e a compatibilidade com fichas antigas.

As regras não acessam `document`, `window`, armazenamento ou funções de renderização.
Funções `prepare*` podem modificar o objeto recebido para compatibilidade; não devem
repetir a migração nem apagar conteúdo já preenchido. Cálculos `get*`/`calculate*`
retornam resultados sem salvar a ficha.

Exemplo: `getAttackStats` calcula um ataque; `renderAttackRows` mostra o resultado;
o formulário altera o ataque e agenda o salvamento. Guardar uma arma no Stash não
apaga as configurações de ataque ligadas ao seu ID.

## Contrato de dados existente

O Firestore recebe o documento completo da ficha em `sheets_<owner>/<firebaseId>`.
Equipamentos ficam em `inventory`; ataques em `attacks` referenciam `inventory[].id`
por `weaponId`; a reserva de Força fica em `forcePoints`. Esses nomes e o formato
dos documentos foram preservados nesta reorganização.

A prévia em `dev/preview/` carrega os scripts da página principal e usa fichas fictícias.
Ela não grava no Firestore. Os testes locais comprovam regras, validações e recuperação
de objetos serializados; não comprovam permissões ou gravações no serviço real.

## Carregamento e limites atuais

`star_wars_firebase.html` declara a ordem: dados, modelos, regras, persistência e telas.
Os scripts ainda compartilham funções globais para manter os eventos HTML existentes.
Não acrescente novas regras aos handlers; mantenha-as nos arquivos de domínio.
`verificar-arquitetura.cjs` impede dependências do navegador nas regras e executa o
fluxo de equipamentos/ataques sem carregar telas.

Esta etapa separa responsabilidades, mas não substitui as Security Rules do Firestore.
Validação no navegador não é autorização de acesso ao banco.

Próximas melhorias de persistência precisam de uma tarefa própria com testes de falha:
retenção e repetição das gravações que falharam, saída da sessão aguardando gravações,
conflitos entre editores e atualização parcial de documentos. A fila atual ainda remove
as pendências antes da confirmação e apenas informa erro quando uma gravação falha.
Também não existe ainda um sistema central de versões de schema: as migrações atuais
continuam nas funções `prepare*` das respectivas regras.
