# PERFIL 4D — Guia de Instalação Completo

## O que você vai ter no final
- Site profissional onde o casal responde as 84 perguntas
- Painel administrativo com login só seu
- Banco de dados seguro no Supabase
- Geração dos 3 relatórios HTML com um clique
- Tudo gratuito hospedado na Vercel

---

## PASSO 1 — Criar conta no Supabase (banco de dados)

1. Acesse https://supabase.com e clique em "Start your project"
2. Crie uma conta com seu e-mail
3. Clique em "New project"
4. Nome do projeto: `perfil4d`
5. Crie uma senha forte (anote em lugar seguro)
6. Escolha a região: South America (São Paulo)
7. Clique em "Create new project" e aguarde 2 minutos

### Criar as tabelas do banco:
1. No painel do Supabase, clique em "SQL Editor" no menu lateral
2. Clique em "New query"
3. Copie todo o conteúdo do arquivo `supabase_schema.sql`
4. Cole no editor e clique em "Run"
5. Deve aparecer "Success" — as tabelas foram criadas

### Criar seu usuário admin:
1. No Supabase, vá em "Authentication" → "Users"
2. Clique em "Add user" → "Create new user"
3. E-mail: seu e-mail real
4. Senha: crie uma senha forte
5. Clique em "Create user"

### Pegar as chaves do Supabase:
1. Vá em "Settings" → "API"
2. Copie o "Project URL" — vai para NEXT_PUBLIC_SUPABASE_URL
3. Copie o "anon public" key — vai para NEXT_PUBLIC_SUPABASE_ANON_KEY
4. Copie o "service_role" key — vai para SUPABASE_SERVICE_ROLE_KEY

---

## PASSO 2 — Criar conta na Vercel (hospedagem)

1. Acesse https://vercel.com e clique em "Sign Up"
2. Escolha "Continue with GitHub"
3. Autorize a Vercel no GitHub

---

## PASSO 3 — Subir o código no GitHub

1. Acesse https://github.com
2. Clique em "+" → "New repository"
3. Nome: `perfil4d`
4. Deixe como "Private" (privado — mais seguro)
5. Clique em "Create repository"
6. Na próxima tela, clique em "uploading an existing file"
7. Selecione TODOS os arquivos da pasta `perfil4d` e faça upload
8. Clique em "Commit changes"

---

## PASSO 4 — Conectar GitHub à Vercel

1. Na Vercel, clique em "Add New Project"
2. Selecione o repositório `perfil4d`
3. Clique em "Import"
4. ANTES de clicar em Deploy, configure as variáveis de ambiente:
   - Clique em "Environment Variables"
   - Adicione uma por uma:
     ```
     NEXT_PUBLIC_SUPABASE_URL = https://seu-projeto.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY = sua_chave_aqui
     SUPABASE_SERVICE_ROLE_KEY = sua_chave_service_role_aqui
     ADMIN_EMAIL = seu@email.com
     ```
5. Clique em "Deploy"
6. Aguarde 2-3 minutos

Seu site estará em: `https://perfil4d.vercel.app`

---

## PASSO 5 — Testar o sistema

1. Acesse `https://perfil4d.vercel.app/questionario`
   → Deve aparecer o formulário para o casal responder

2. Acesse `https://perfil4d.vercel.app/login`
   → Entre com o e-mail e senha que criou no Supabase

3. Você será redirecionado para o painel com todos os casais

---

## Como usar no dia a dia

### Para enviar ao casal:
- Link do esposo: `https://perfil4d.vercel.app/questionario`
- Link da esposa: `https://perfil4d.vercel.app/questionario`
- Cada um entra, informa os nomes e responde individualmente

### Para gerar os relatórios:
1. Faça login em `https://perfil4d.vercel.app/login`
2. Quando os dois tiverem respondido, o status muda para "Completo"
3. Clique em "Rel. Esposo", "Rel. Esposa" ou "Consultor"
4. O relatório abre na tela — clique em "Baixar HTML"
5. Abra o arquivo no Chrome e use Ctrl+P para salvar como PDF

---

## Atualizar o site no futuro

Quando precisar fazer mudanças:
1. Edite os arquivos
2. Faça upload novamente no GitHub (substitui os antigos)
3. A Vercel detecta a mudança e atualiza automaticamente em 2 minutos

---

## Suporte
WhatsApp: +55 21 97401-3287
