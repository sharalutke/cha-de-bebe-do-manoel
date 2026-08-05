# Chá de Bebê do Manoel

Aplicação profissional em Next.js para o site oficial do Chá de Bebê do Manoel, com lista de presentes em tempo real, cálculo ponderado do progresso do enxoval, painel administrativo protegido por autenticação e deploy automático no GitHub Pages.

## Stack

- Next.js App Router com export estático para GitHub Pages
- React, TypeScript e Tailwind CSS
- Supabase Auth, Database, Realtime, RLS, RPCs e triggers
- Framer Motion para micro animações
- ESLint, Prettier e GitHub Actions
- PWA, Open Graph, sitemap, robots e página 404 personalizada

## Decisões de arquitetura

O GitHub Pages hospeda apenas arquivos estáticos. Por isso, o projeto usa `output: "export"` no Next.js e evita API Routes e Server Actions. Toda operação dinâmica acontece diretamente no Supabase usando RLS e funções SQL seguras.

O banco é a fonte de verdade para reservas, quantidades e progresso. A função `get_registry_progress()` calcula o percentual com base em `quantity_owned + quantity_reserved`, ponderado por `progress_weight`. A função `create_gift_reservation()` bloqueia o item, valida disponibilidade e cria a reserva de forma atômica.

## Instalação

```bash
npm install
npm run dev
```

A aplicação abre em modo demonstrativo se as variáveis do Supabase não estiverem configuradas.

## Variáveis de ambiente

Copie `.env.example` para `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://swlaxwpzkiakxbetrles.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_7uhZ4pqp5DCf3JBat0cHdA_PTw0UQ_7
NEXT_PUBLIC_SITE_URL=https://sharalutke.github.io/cha-de-bebe-do-manoel
NEXT_PUBLIC_BASE_PATH=/cha-de-bebe-do-manoel
NEXT_PUBLIC_EVENT_DATE=2026-08-22T15:00:00-03:00
```

Use `NEXT_PUBLIC_BASE_PATH` vazio se o repositório for `seu-usuario.github.io`.

## Banco de dados

1. Crie um projeto no Supabase.
2. Execute a migration em `supabase/migrations/20260723000000_initial_schema.sql`.
3. Execute `supabase/seed.sql`.
4. Crie um usuário no Supabase Auth.
5. Habilite o usuário no painel administrativo:

```sql
insert into public.admin_profiles(user_id, email, display_name)
select id, email, 'Administrador'
from auth.users
where email = 'seu-email@exemplo.com'
on conflict (user_id) do nothing;
```

## Estrutura

```text
src/app                  Rotas App Router e metadados
src/components           Componentes compartilhados
src/features/home        Experiência da página inicial
src/features/gifts       Lista pública e reserva
src/features/admin       Painel administrativo
src/hooks                Hooks de dados Supabase/local
src/lib                  Utilitários, Supabase client e cálculo local
src/data                 Dados locais de demonstração
src/types                Tipos de domínio e Database
supabase/migrations      Schema, RLS, policies, triggers e RPCs
supabase/seed.sql        Categorias, presentes e enxoval inicial
public                   PWA, favicon, service worker e Open Graph
```

## Deploy no GitHub Pages

O workflow `.github/workflows/deploy.yml` executa typecheck, lint, build estático e deploy.

No GitHub, configure:

- Secrets opcionais para sobrescrever os valores publicos ja configurados:
  `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Variable opcional: `NEXT_PUBLIC_EVENT_DATE`
- Pages: Source `GitHub Actions`

O workflow calcula automaticamente o `basePath` para repositórios de projeto.

## Administração

O painel em `/admin` permite:

- editar data, horario, local, endereco, mapa, WhatsApp, dress code, textos do evento e fotos da home
- adicionar e editar presentes
- editar marcas sugeridas, pesos, categorias, quantidades, imagens e links de presentes
- arquivar presentes
- liberar presentes cancelando reservas confirmadas
- visualizar e cancelar reservas
- exportar reservas em CSV compativel com Excel
- acompanhar estatísticas e progresso do enxoval

### Criar admin pelo terminal

1. Copie `admin.env.example` para `admin.env.local`.
2. No Supabase, copie uma Secret key ou service_role key em Settings > API Keys.
3. Preencha `SUPABASE_SECRET_KEY`, `ADMIN_EMAIL` e `ADMIN_PASSWORD`.
4. Rode:

```bash
npm run admin:create
```

Nunca suba `admin.env.local` para o GitHub.

### Atualizar campos do evento no Supabase

Se o projeto Supabase ja existia antes da aba Evento no admin, rode uma vez no SQL Editor o arquivo:

```text
supabase/migrations/20260805000000_media_uploads_and_gift_links.sql
```

Ele cria/atualiza:

- campos editaveis do evento
- campo `product_url` nos presentes
- bucket publico `event-media` no Supabase Storage
- permissoes para admins autenticados enviarem fotos

O SQL principal e:

```sql
alter table public.event_settings
  add column if not exists event_headline text,
  add column if not exists event_description text,
  add column if not exists couple_photo_url text,
  add column if not exists couple_photo_alt text,
  add column if not exists ultrasound_photo_url text,
  add column if not exists ultrasound_photo_alt text;

alter table public.gifts
  add column if not exists product_url text;
```

## Manutenção futura

- Atualize os detalhes do evento em `event_settings`.
- Ajuste pesos com cuidado, pois eles alteram o progresso global.
- Nunca edite `quantity_reserved` manualmente em produção. Cancele reservas para manter triggers e auditoria consistentes.
- Para trocar fotos oficiais, adicione os arquivos em `public/` e substitua os placeholders dos componentes da Home.
- Rode `npm run typecheck`, `npm run lint` e `npm run build` antes de publicar mudanças estruturais.
