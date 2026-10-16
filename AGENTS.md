# Organização do código

- Consulte `dev/ARQUITETURA.md` antes de acrescentar funcionalidades.
- Modelos ficam em `js/modelos/`; cálculos, validações e compatibilidade de fichas antigas em `js/regras/`.
- Regras recebem dados e não acessam DOM, Firebase, armazenamento ou funções de renderização.
- Handlers da interface usam essas regras e agendam a gravação por `scheduleSave`.
- Preserve as chaves dos documentos existentes. Uma mudança de formato precisa tratar fichas antigas e testar a recuperação dos dados.
- Atualize os scripts da página e os testes quando separar arquivos. A prévia usa a ordem de carregamento da página principal.

# Memória do projeto: estilo das imagens

## Ícones dos Poderes da Força

O usuário exige o estilo dos ícones ORIGINAIS de Star Wars presentes no projeto. A composição pode mudar completamente sem alterar esse estilo. A descrição genérica "silhueta com brilho digital" foi insuficiente e levou a resultados rejeitados: figuras vetoriais recortadas, contornos neon uniformes e roupas detalhadas. Não repetir esse tratamento.

### O que manter: estilo de arte

- Ícone raster compacto de habilidade de jogo antigo, concebido para leitura em aproximadamente 50 px. Formas amplas e econômicas, com leve suavização de raster e pequenas irregularidades orgânicas; não transformar a ampliação numa ilustração moderna com detalhes novos.
- Figuras como massas escuras simples, sem rosto, anatomia detalhada ou texturas e costuras minuciosas. Preservar lavagens de luz e poucas formas amplas de sombra que deem volume a mangas e robes; não exigir preto vetorial absolutamente chapado. O usuário esclareceu que a remoção indiscriminada dos detalhes estragou Bloqueio Desequilibrante e pediu retomar a primeira versão: não achatar novamente os volumes e detalhes suaves que ele aprovou.
- Para homens humanoides, usar a base de um adulto careca, com proporções adultas. Sem menino de cabelo espetado, cabeça juvenil ou personagem de anime. Robes, quando pedidos, aparecem principalmente na forma externa das mangas e da barra.
- Luz localizada com intensidade, largura e continuidade VARIÁVEIS. Em certas partes a borda brilha; em outras se perde na sombra ou se mistura à energia atrás do personagem. O halo é suave, com zonas luminosas concentradas. Não traçar uma linha neon de espessura constante por todo o corpo; não criar adesivo, recorte vetorial ou sinalização luminosa.
- Fundo e figura participam da mesma iluminação. Efeitos podem passar à frente ou atrás da silhueta quando a ação pedir. Não colocar uma silhueta recortada por cima de um fundo genérico sem interação luminosa.
- Sabres e efeitos principais são poucos traços claros e simples, com núcleo luminoso e halo colorido. Movimento é sugerido por arcos, faixas ou clarões econômicos e direcionados, sem excesso de fios de luz, partículas ou faíscas.
- Fundo com grandes massas de cor, sombras e formas luminosas que reforçam a ação. Cada original resolve o fundo de forma diferente: halo oval, faixas de movimento, clarão de contato, energia nas mãos etc. Não repetir automaticamente explosão radial de raios em todos os poderes.
- Enquadramento próximo e compacto; cortes de mãos, braços ou corpos nas margens são naturais nos originais. Não acrescentar chão, horizonte, cenário ou palco de duelo para preencher uma composição que não pede isso.
- Acabamento digital luminoso com gradientes simples e leve caráter de raster, sem textura de tela, pinceladas, manchas de tinta, pelos ou bordas ásperas. Também sem acabamento vetorial excessivamente perfeito, desenho de roupa, renderização 3D, metal realista ou pedras com textura fotográfica.
- Não acrescentar moldura ou borda decorativa por padrão, mesmo quando um ícone original a tiver. O contorno luminoso de um personagem, se solicitado, continua sendo luz integrada, e não moldura da imagem.

### O que pode mudar em cada imagem

Somente o estilo de arte precisa seguir o padrão. Paleta de cores, formato e proporções da silhueta, pose, composição, objetos, formas e distribuição do background, iluminação e efeitos podem mudar conforme o poder e a orientação do usuário. Roxo, personagem com sabre e arco descendente são escolhas de Agressão Temperada, não regras para todos os poderes. Não atribuir uma cor fixa a um lado da Força sem uma orientação específica.

### Referências e conferência

- Antes de sugerir a composição ou gerar a imagem de um poder, pesquisar seu funcionamento em Star Wars Saga Edition e o contexto de Star Wars (formas de sabre, técnicas e efeitos associados). Não deduzir a ação apenas pelo nome traduzido ou por um cadastro resumido. Consultar o livro quando disponível e conferir fontes específicas do sistema; explicar a mecânica que orienta a proposta e citar a fonte.
- Fontes principais do estilo: os 21 JPGs originais em `img/poderes/`, especialmente `barrier-of-blades.jpg`, `draw-closer.jpg`, `fluid-riposte.jpg`, `force-stun.jpg`, `force-slam.jpg`, `negate-energy.jpg`, `rebuke.jpg` e `shien-deflection.jpg`. Comparar vários originais, pois um só não representa todas as soluções de luz e fundo.
- Referências ampliadas enviadas pelo usuário, preservadas sem alteração em `dev/referencias/poderes/`: `01-barrier-of-blades.jpg`, `01-draw-closer.jpg` e `01-fluid-riposte.jpg`. Usar essas cópias permanentes em vez de depender dos arquivos temporários do sistema.
- As imagens PNG geradas nesta conversa e seus prompts são tentativas, não fontes que substituem os originais. Elogiar uma pose ou composição não significa aprovar todo o estilo. O resultado de Bloqueio Desequilibrante foi rejeitado pelo acabamento; não usá-lo como referência de estilo.
- Antes de gerar ou editar, abrir referências originais/ampliadas e distinguir sua função: estilo, pose, perspectiva ou impacto. Na ferramenta de geração, fornecer referências de estilo originais adequadas, inclusive quando a composição vier de outro desenho. Um desenho de pose não define o acabamento.
- Quando o usuário descrever a composição e fornecer uma referência, seguir a descrição e a função indicada para a referência (perspectiva, direção, impacto etc.). Não substituir por uma composição própria nem reutilizar automaticamente o personagem ou a pose de outro poder.
- Conferir o resultado lado a lado com os originais: massa da silhueta, distribuição da luz, continuidade variável do contorno, simplicidade dos efeitos, enquadramento e textura raster. Se parecer vetor com neon, pôster, render 3D ou pintura com pinceladas, ainda não corresponde ao estilo, mesmo com pose e cores certas.
- Conferir também a legibilidade em tamanho pequeno quando possível; informar quando essa conferência não tiver sido feita. Não afirmar que o estilo foi preservado apenas porque o prompt pediu isso.
