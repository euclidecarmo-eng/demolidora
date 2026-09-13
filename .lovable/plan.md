# DemolidoraSmart — Solicitar Orçamento

## Objetivo
Criar uma PWA móvel instalável, sem login, para solicitar orçamento em quatro etapas em menos de dois minutos.

## Experiência
- Aplicar a identidade navy, âmbar e branco, com Poppins nos títulos e Inter no texto.
- Manter tagline, progresso de quatro etapas e credenciais sempre visíveis.
- Usar cartões e controles grandes, adequados para uso externo e com luvas.
- Criar os passos: serviço; detalhes e urgência; mídias e contato; revisão e envio.
- Permitir voltar diretamente a qualquer etapa pela revisão.
- Exibir prazo de resposta dinâmico conforme a urgência.
- Finalizar com confirmação clara após abrir o WhatsApp.

## Dados e continuidade
- Salvar solicitações anônimas no Lovable Cloud com os campos definidos e status inicial “novo”.
- Armazenar fotos e vídeos em área privada, vinculados à solicitação.
- Preservar automaticamente o rascunho e a etapa atual no celular.
- Implementar fila de envio com tentativas automáticas, progresso e estado de erro recuperável.
- Usar o WhatsApp `5511944435095` em uma única configuração e montar a mensagem estruturada.
- Explicar antes do envio que as mídias precisam ser anexadas manualmente no WhatsApp.

## Instalação no celular
- Adicionar manifesto e ícones para instalação na tela inicial de iOS e Android.
- Não adicionar modo offline completo; o rascunho local protege o preenchimento durante oscilações de sinal.

## Validação
- Verificar o fluxo completo, máscaras, GPS, seleção de mídia, retomada do rascunho e abertura do WhatsApp.
- Conferir visualmente em viewport móvel e desktop, além de erros de execução e compilação.
