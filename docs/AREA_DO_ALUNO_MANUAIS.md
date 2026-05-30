# Manuais de Usuário (Área do Aluno V6)

Este documento está dividido em duas partes: o **Manual do Administrador** (focado em um passo a passo para a gestão diária da plataforma) e o **Roteiro do Aluno** (estruturado para ser convertido futuramente em tooltips e tutoriais guiados dentro das páginas).

---

## PARTE 1: Manual do Administrador (Passo a Passo)

O acesso ao painel de administração é feito pela rota `/admin` e está restrito a usuários com a flag `is_admin = TRUE` ou `is_staff = TRUE`.

### 1. Gestão de Cursos e Conteúdo
**Como criar um novo curso?**
1. No menu lateral, acesse **Cursos** e clique no botão **"Novo Curso"**.
2. Preencha os metadados principais (Título, Slug, Pilar de Conhecimento, Professor).
3. Defina se ele aparecerá na vitrine pública (`Destaque Vitrine`).
4. Salve para gerar o registro no banco.

**Como adicionar módulos e aulas?**
1. Dentro do curso criado, ou navegando para **Módulos**, crie um "Novo Módulo", selecionando a qual Curso ele pertence e sua Ordem.
2. Com o módulo criado, vá em **Aulas** > **Nova Aula**.
3. Escolha o módulo pai, o título da aula e insira a **URL do Vídeo** (ex: link do YouTube Unlisted).
4. Informe o tempo estimado em segundos e a ordem de exibição.
5. Se for uma aula gratuita para captação, ative a flag `is_gratis`.

### 2. Gestão Financeira e Preços
**Como configurar o preço de um curso?**
1. Vá em **Planos** > **Novo Plano** (crie um pacote geral ou plano único do curso).
2. Na aba **Pacotes/Planos_Cursos**, crie um vínculo entre o Plano e o Curso.
3. Insira o valor em BRL, EUR e USD, bem como os respectivos IDs de preço gerados previamente no Stripe (`stripe_price_id_brl`, etc).

**Como criar um Cupom de Desconto?**
1. Acesse **Cupons** > **Novo Cupom**.
2. Defina o código (ex: `LANCAMENTO50`), o tipo (percentual ou valor fixo) e o valor de desconto.
3. Preencha a data de validade final e o limite máximo de usos.

### 3. Gestão de Alunos e Matrículas
**Como consultar o progresso de um aluno?**
1. Vá em **Alunos** > Pesquise pelo Nome ou E-mail.
2. Na página de **Consulta**, você verá o perfil completo, status de bloqueio, número de PHD Coins acumulados e o Streak diário dele.

**Como liberar acesso manualmente?**
1. Navegue para **Matrículas**.
2. Clique em **Conceder Acesso** ou "Nova Matrícula".
3. Selecione o aluno, o curso e defina o provedor como `manual` na transação para gerar um log oficial.

### 4. Configurações e Vitrine
**Como editar os textos da Vitrine/Checkout?**
1. Vá em **Configurações** > **Checkout**.
2. Edite os textos persuasivos, promessas, benefícios e tags de urgência exibidos na tela de pagamento.

---

## PARTE 2: Roteiro do Aluno (Script para Tutorial Online)

Este roteiro é ideal para implementações futuras usando bibliotecas como `react-joyride` (um passo a passo guiado assim que o aluno entra na página).

### Tela: Vitrine Pública (`/vitrine`)
- **Passo 1 (Hero):** "Bem-vindo à PHD Academy! Explore nossos treinamentos de alta performance e materiais gratuitos."
- **Passo 2 (Cursos):** "Clique aqui para conhecer a ementa de um curso ou iniciar o seu checkout seguro."

### Tela: Dashboard Principal (`/dashboard`)
- **Passo 1 (Boas-vindas):** "Seja muito bem-vindo! Aqui é o seu quartel-general de estudos."
- **Passo 2 (Gamificação - Streak):** "O fogo ao lado do seu nome mostra o seu Streak. Estude todos os dias para manter a sua sequência acesa e ganhar PHD Coins!"
- **Passo 3 (Continuar de onde parou):** "Nós salvamos exatamente onde você parou. Clique aqui para pular direto para sua última aula."

### Tela: Player de Aula (`/player/[cursoId]/[aulaId]`)
- **Passo 1 (O Vídeo):** "Dê o play! Seu progresso é salvo automaticamente a cada 30 segundos."
- **Passo 2 (Ferramentas/Materiais):** "Abaixo do vídeo, você encontra materiais em PDF e ferramentas anexas. Tudo projetado para execução prática."
- **Passo 3 (Insights/Anotações):** "Teve uma sacada? Escreva nos seus Insights! Eles são salvos e atrelados a esta aula específica."
- **Passo 4 (Conclusão):** "Não se esqueça de marcar a aula como concluída. Você será recompensado com PHD Coins a cada etapa finalizada."

### Tela: Perfil e Onboarding (`/onboarding/perfil-profissional`)
- **Passo 1 (Obrigatório):** "Para extrairmos o máximo do seu potencial, precisamos te conhecer. Preencha seu cargo, tempo de experiência e segmento."
- **Passo 2 (Privacidade):** "Esses dados nos ajudam a moldar a Inteligência Artificial da plataforma para dar exemplos práticos da SUA área de atuação."

### Tela: Loja e Catálogo (`/loja`)
- **Passo 1 (Descoberta):** "Ficou com vontade de ir mais fundo? Aqui estão todos os cursos disponíveis na nossa academia."
- **Passo 2 (Multi-moeda):** "Os preços se adaptam magicamente à sua localização. Escolha o curso e pague de forma transparente."

### Tela: Simuladores e Questionários (`/simuladores`)
- **Passo 1 (Testando conhecimentos):** "Chegou a hora de provar que você não apenas assistiu, mas aprendeu. Escolha um simulador para interagir com a IA ou faça um questionário objetivo."
