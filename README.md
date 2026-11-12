# DemolidoraSmart Quote

Crie um aplicativo mobile (iOS e Android, ou PWA instalável no celular) chamado DemolidoraSmart — Solicitar Orçamento, para uma empresa de demolição, terraplanagem e fechamento de obras. O app tem um único objetivo: permitir que o cliente (incorporadora, engenheiro, arquiteto, empresa industrial ou proprietário de imóvel) solicite um orçamento em menos de 2 minutos, direto do celular, no canteiro de obra ou terreno, sem precisar ligar ou digitar textos longos.

Identidade visual

Paleta: navy escuro (#0F172A) como cor de base/header, âmbar (#F59E0B) como cor de destaque e ação, branco (#FFFFFF) para fundos de conteúdo.

Tipografia: títulos em fonte forte tipo Poppins (peso 700–800), corpo de texto em Inter ou similar.

Tom de voz: direto, técnico, confiável — nunca informal ou "descontraído". Frases curtas.

Tagline fixa no topo: "Obra no prazo. Sem improviso."

Barra de credibilidade sempre visível (topo ou fixa no rodapé): "15+ anos de obra", "800+ projetos entregues", "Frota própria CAT/Volvo".

Por que este app é diferente de um formulário de contato tradicional

Não construa um formulário único com vários campos na mesma tela. O setor de demolição/terraplanagem hoje só oferece "fale conosco" genérico ou WhatsApp sem contexto. Este app precisa ser um wizard de 4 passos, com navegação por toque (não por digitação sempre que possível), progresso visual no topo, e uma mensagem de tempo de resposta estimado que muda de acordo com a urgência escolhida pelo cliente — isso é o principal diferencial de percepção de profissionalismo do produto.

Fluxo de telas (nessa ordem)

Tela 1 — Escolha do serviço Grid de cartões grandes e tocáveis (não dropdown), 2 colunas, com ícone + rótulo, um só selecionável por vez: Demolição de Casa · Demolição de Prédio · Demolição Industrial · Terraplanagem · Escavação · Limpeza de Terreno · Remoção de Entulho · Fechamento de Obra (Tapume).

Tela 2 — Detalhes da obra

Seletor de urgência em 3 opções tocáveis (não dropdown), cada uma exibindo o prazo de resposta associado:

"Urgente — até 7 dias" → resposta prioritária

"Este mês" → resposta em 1 dia útil

"Estou planejando / sem data" → resposta em até 2 dias úteis

Campo de endereço da obra (com opção de usar GPS do celular para preencher automaticamente a localização atual, já que o cliente pode estar no próprio terreno)

Campo de cidade/UF

Campo de tamanho aproximado (m² ou observação livre curta)

Tela 3 — Fotos, vídeos e contato

Botão de upload que abre diretamente câmera OU galeria do celular (não só galeria — importante porque o cliente frequentemente está no local e quer fotografar na hora)

Suporte a múltiplas fotos e vídeos curtos, com miniaturas de pré-visualização em grid

Campo nome completo

Campo telefone/WhatsApp com máscara de formatação automática

Tela 4 — Resumo e envio

Lista de revisão de todos os dados preenchidos, editável (permitir voltar e corrigir qualquer campo tocando nele)

Caixa de destaque com o prazo de resposta estimado (dinâmico conforme urgência escolhida na Tela 2)

Botão principal "Enviar via WhatsApp": monta uma mensagem de texto estruturada (não texto livre) com todos os campos preenchidos e abre o WhatsApp do cliente com o número da empresa e a mensagem pronta, pedindo para o cliente anexar as fotos/vídeos selecionados diretamente na conversa que abrir (explicar ao usuário, na tela, que essa etapa manual existe por limitação de segurança dos navegadores/OS, não é falha do app)

Tela de confirmação final: "Solicitação enviada! Nossa equipe entrará em contato em até [prazo dinâmico]."

Requisitos técnicos e de dados

Salvar cada solicitação em um banco de dados (Supabase ou Firebase): campos service, urgency, address, city, size, client_name, client_phone, files[], created_at, status (novo / respondido / convertido).

Persistência local do rascunho: se o cliente fechar o app no meio do preenchimento, ao reabrir ele retoma de onde parou (útil porque muitas vezes o sinal de internet é fraco em canteiro de obra/terreno).

Botões e áreas de toque grandes (mínimo 48x48px) — o público pode estar usando luvas ou em ambiente externo com sol forte na tela.

Deve funcionar bem com conexão de internet instável (retry automático de envio de fotos, feedback visual de "enviando").

Número de WhatsApp da empresa configurável em uma única variável/constante, não hardcoded em múltiplos lugares.

Fora do escopo do MVP (não construir agora, só deixar preparado para o futuro)

Login/cadastro de usuário — o app deve funcionar sem exigir conta.

Painel administrativo interno para a equipe da DemolidoraSmart gerenciar leads (fica para uma fase 2).

Envio automático de arquivos via API do WhatsApp Business — no MVP o envio de mídia é manual pelo próprio WhatsApp, como descrito na Tela 4.

Este prompt foi modelado a partir do protótipo web já validado (demolidorasmart-app-orcamento.html), adaptando a mesma lógica de fluxo, marca e diferenciação para um app mobile nativo/PWA.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://demolidora.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/b55d6c7d-b7a6-4dab-8c45-f11f3f6470c9).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
