# Cardápio AR — MVP

SaaS de cardápio digital para restaurantes com visualização 3D/AR dos pratos.
Cliente escaneia o QR code da mesa, abre o cardápio num PWA mobile-first e
pode ver pratos selecionados em 3D / Realidade Aumentada em tamanho real,
usando a câmera do próprio celular (`<model-viewer>`, Google Scene Viewer no
Android e AR Quick Look no iOS).

## Estrutura do monorepo (Turborepo)

```
apps/
  menu/     PWA mobile-first do cliente final — /r/[slug], 3D/AR, mobile-first
  admin/    Dashboard desktop-first do restaurante — login, CRUD, upload, preview
packages/
  ui/       Componentes React compartilhados (Button, Card, BottomSheet, ...)
  db/       Schema Prisma + client compartilhado + seed
  config/   tsconfig, eslint e tailwind preset compartilhados
```

**Por que Turborepo (e não Nx)?** Para este MVP o monorepo é simples — dois
apps Next.js e dois pacotes de suporte, sem geradores de código, sem grafo de
build complexo. Turborepo dá cache de build/dev e `--filter` por pacote com
uma configuração mínima (`turbo.json` de ~20 linhas) e integra-se
naturalmente ao ecossistema Vercel/Next.js. Nx traria mais poder (generators,
module boundaries, computation caching distribuído) mas também mais
configuração — overhead que não se paga ainda neste estágio. Se o produto
crescer para múltiplos times/apps, migrar para Nx é uma reavaliação razoável.

## Stack

- Next.js 14 (App Router) + TypeScript nos dois apps
- Tailwind CSS (preset compartilhado em `packages/config`)
- Prisma ORM + PostgreSQL
- NextAuth (Credentials, JWT) — login do dono do restaurante em `apps/admin`
- `@google/model-viewer` — 3D e trigger de AR (Scene Viewer / AR Quick Look), carregado via `next/dynamic({ ssr: false })` só quando o cliente abre a visualização 3D de um prato
- Upload mockado localmente (`apps/admin/public/uploads`), com ponto de troca documentado para S3/Cloudflare R2
- Service worker manual (`apps/menu/public/sw.js`) + `manifest.json` para instalar o app como PWA

## Modelo de dados

`Restaurant 1—N Category 1—N Dish`, `Restaurant 1—N User` (dono/staff que
faz login). Veja `packages/db/prisma/schema.prisma` para os campos e
comentários de cada um.

## Rodando localmente

### 1. Pré-requisitos

- Node.js ≥ 18.17
- pnpm (`npm install -g pnpm`)
- Docker (para o Postgres local) — ou aponte `DATABASE_URL` para um Postgres já existente

### 2. Instalar dependências

```bash
pnpm install
```

### 3. Banco de dados

```bash
# sobe um Postgres local em localhost:5432
docker compose up -d

# copie o .env de exemplo (ajuste se necessário)
cp .env.example .env

# aplica o schema (cria as migrations iniciais na primeira execução)
pnpm db:migrate

# popula com o restaurante de demonstração
pnpm db:seed
```

O seed cria:
- Restaurante **Sabor Brasil** (`/r/sabor-brasil`)
- 4 categorias (Entradas, Pratos Principais, Sobremesas, Bebidas)
- 6 pratos, um deles ("Picanha na Brasa") com um modelo 3D/AR de exemplo
  (glTF + USDZ públicos, CC0, hospedados pelo próprio projeto `model-viewer`
  do Google — usados só para validar o pipeline de AR, não é um scan real do
  prato)
- Usuário admin: **dono@saborbrasil.com** / **admin123**

### 4. Rodar os apps

```bash
# os dois de uma vez (Turborepo)
pnpm dev

# ou individualmente
pnpm dev:menu    # http://localhost:3000  (cliente / PWA)
pnpm dev:admin   # http://localhost:3001  (dashboard do restaurante)
```

Abra:
- **Cliente:** http://localhost:3000/r/sabor-brasil
- **Admin:** http://localhost:3001/login (dono@saborbrasil.com / admin123)

### Outros comandos úteis

```bash
pnpm db:studio   # Prisma Studio — inspecionar/editar dados manualmente
pnpm build       # build de produção dos dois apps
pnpm lint        # lint dos dois apps
```

## Como funciona o fluxo 3D/AR

1. No admin, ao cadastrar um prato o dono do restaurante opcionalmente sobe
   um `.glb`/`.gltf` (modelo 3D) e um `.usdz` (versão para AR Quick Look no
   iOS — o Android usa o próprio `.glb` via Scene Viewer).
2. No cardápio do cliente, cada card de prato mostra a foto 2D normalmente.
   Só pratos com modelo 3D exibem um selo "3D".
3. Ao abrir o prato (bottom sheet) e tocar em **"Ver em tamanho real
   (3D/AR)"**, o app carrega sob demanda (`next/dynamic`, `ssr:false`) o
   componente que importa `@google/model-viewer` — o runtime baseado em
   Three.js só é baixado nesse momento, nunca no carregamento inicial da
   página.
4. O `<model-viewer>` renderiza o modelo 3D interativo e expõe o botão
   nativo de AR, que aciona o Scene Viewer (Android) ou AR Quick Look (iOS)
   para o usuário ver o prato em tamanho real sobre a mesa.

### Compressão Draco

Modelos glTF de pratos escaneados tendem a ser pesados (malha densa +
textura de alta resolução), o que pesa em conexões móveis e principalmente
na banda de CDN paga a cada visualização em AR. `.glb` enviados no admin
são comprimidos com **Draco** (posições, normais, índices — reduz o payload
de malha em até ~90%) via `@gltf-transform/core` (`NodeIO`) + `draco3dgltf`
(`apps/admin/src/lib/draco.ts`), chamado por `/api/upload` antes de salvar
o arquivo.

A compressão roda **no servidor**, não no navegador: os encoders/decoders
Draco do `draco3dgltf` são builds Node (usam `fs`/`path` para carregar o
`.wasm`), então não empacotam no bundle do cliente. Isso é uma escolha
consciente, não uma limitação prática — a compressão só precisa acontecer
**uma vez**, quando o dono do restaurante sobe o prato, então não faz
diferença ela custar uma passagem pelo servidor. O que importa para o custo
recorrente é que toda visualização em AR depois disso baixa a versão já
comprimida direto do bucket, nunca reprocessando nada.

- Só se aplica a `.glb`; `.gltf` (multi-arquivo) e `.usdz` são enviados
  como estão (não são comprimíveis por Draco da mesma forma).
- Por isso `.glb` sempre passa pelo proxy do admin (`/api/upload`), mesmo
  com `STORAGE_DRIVER=s3` — é o único tipo de upload que não vai direto
  para o bucket (ver seção de storage abaixo). Depois de comprimido, o
  resultado é que vai para o bucket (ou disco, em dev).
- `<model-viewer>` já inclui os decoders Draco no seu runtime, então nenhuma
  mudança foi necessária no `apps/menu`.
- **Meshopt** não foi implementado — seria um complemento (decodificação
  ainda mais rápida no cliente), não substitui o ganho do Draco.
- Também vale gerar um `poster` (thumbnail estático) por modelo para o
  `<model-viewer>` exibir instantaneamente enquanto o `.glb` carrega — hoje
  reaproveitamos a foto 2D do prato para isso.

### Storage: upload direto para o bucket

Com `STORAGE_DRIVER=s3` (ver `.env.example`), fotos e modelos `.gltf`/`.usdz`
vão **direto do navegador pro bucket configurado**, sem passar pelo servidor
Next.js. Funciona com qualquer storage compatível com S3 — Cloudflare R2,
Supabase Storage, AWS S3, Backblaze B2 — só os valores no `.env` mudam
(`apps/admin/src/lib/s3.ts`); o projeto está configurado com **Supabase
Storage** (tier gratuito, sem cartão de crédito) por enquanto:

1. O navegador pede uma URL presignada em `POST /api/upload/presign`
   (`apps/admin/src/app/api/upload/presign/route.ts`) — só metadados
   (nome, content-type, tamanho) trafegam aqui, nunca o arquivo.
2. O navegador faz `PUT` do arquivo direto nessa URL
   (`apps/admin/src/lib/storage.ts#createUploadTarget`,
   `apps/admin/src/lib/s3.ts`).
3. A URL pública final (bucket/CDN) é salva em `Dish.imageUrl` /
   `Dish.model3dUrl` / `Dish.usdzUrl`.

Isso significa que o volume/tamanho de upload não consome compute nem banda
deste servidor. A única exceção é `.glb`, que precisa passar pelo servidor
para a compressão Draco (ver seção acima) antes de ir para o bucket.

**Supabase Storage vs. Cloudflare R2**: o Supabase free tier (1GB storage +
5GB egress/mês, sem cartão) é o ponto de partida — dá margem confortável
pro lançamento sem cobrança. R2 tem egress zero (sem limite de banda de
saída), o que importa quando o tráfego de visualizações em AR crescer de
verdade; migrar é só trocar as variáveis `S3_*` no `.env` (ver
`.env.example`), sem mudança de código. R2 exige cadastrar cartão na
Cloudflare mesmo dentro do tier gratuito — por isso não é o ponto de
partida aqui.

Com `STORAGE_DRIVER=local` (padrão, dev), tudo continua caindo em
`apps/admin/public/uploads` como antes — nenhuma mudança de comportamento
em desenvolvimento.

## Autenticação e multi-tenant

Cada usuário (`User`) pertence a um `Restaurant`. Toda rota de API do admin
(`/api/categories`, `/api/dishes`, `/api/upload`) resolve a sessão via
NextAuth e escopa as queries Prisma por `session.user.restaurantId` — nunca
confia em um `restaurantId`/`categoryId` vindo do client sem antes confirmar
que pertence ao restaurante autenticado.

## O que foi entregue

1. Monorepo Turborepo funcional (`apps/menu`, `apps/admin`, `packages/ui`,
   `packages/db`, `packages/config`)
2. Schema Prisma completo (`Restaurant`, `Category`, `Dish`, `User`) pronto
   para `prisma migrate dev`
3. Seed com 1 restaurante, 4 categorias, 6 pratos (1 com modelo 3D/AR de
   exemplo público/CC0)
4. `apps/menu`: cardápio público por slug, agrupado por categoria com swipe
   horizontal, bottom sheet de detalhe, visualização 3D/AR lazy-loaded,
   fallback para foto 2D, PWA instalável (manifest + service worker)
5. `apps/admin`: login (NextAuth/Credentials), CRUD de categorias e pratos,
   upload de foto/modelo 3D/USDZ (local em dev; upload direto pra bucket
   S3-compatível em produção, ver seção de storage acima), preview do
   cardápio como o cliente vê
6. Este README

## Próximos passos técnicos

- ~~**Storage real**~~ — código feito: `STORAGE_DRIVER=s3` faz upload direto
  do navegador pro bucket via URL presignada (`apps/admin/src/lib/{storage,s3}.ts`,
  `/api/upload/presign`), sem passar o binário pelo servidor Next.js.
  Compatível com R2, Supabase Storage, etc. Falta só criar o bucket de
  verdade e preencher as credenciais no `.env` (ver `.env.example`) —
  decidido usar Supabase Storage pro lançamento (sem exigir cartão).
- ~~**Compressão Draco**~~ — feito, ver seção acima. Meshopt segue como
  possível complemento futuro.
- **Multi-restaurante self-serve**: hoje o seed cria 1 restaurante/1 usuário
  manualmente; falta fluxo de cadastro (signup), convite de staff adicional
  e limites por plano.
- **Pagamentos/assinatura** (Stripe): planos por restaurante, paywall de
  features (ex.: número de pratos com 3D, remoção de marca "powered by").
- **Analytics**: quantas mesas escanearam o QR, quais pratos mais visualizados
  em 3D/AR vs. só foto, funil até a visualização em AR — dado valioso para o
  dono do restaurante validar o ROI do 3D.
- **Multi-idioma**: cardápio (`apps/menu`) e admin em PT/EN/ES no mínimo —
  campos de nome/descrição do prato precisariam virar traduções (tabela
  separada ou colunas JSON) em vez de string única.
- **Geração/gestão do QR code** por mesa direto no admin (hoje é responsabilidade manual do restaurante apontar para `/r/[slug]`).
- **Testes automatizados**: nenhum teste foi incluído no MVP; prioridade
  seria e2e do fluxo `/r/[slug]` → abrir prato → abrir 3D, e testes de API
  para o isolamento multi-tenant (`restaurantId` scoping).
- **Rate limiting / validação de payload** mais robusta nas rotas de API
  (hoje há apenas validação básica de presença de campos).
- **Otimizar imagens de verdade**: seed usa `picsum.photos` como placeholder;
  produção precisaria de um pipeline de otimização (resize, WebP/AVIF) no
  upload.
- **Ícones PWA em PNG** (192/512) gerados a partir do `icon.svg` fornecido —
  o SVG funciona no Chrome/Android, mas PNG amplia a compatibilidade (iOS
  "Adicionar à Tela de Início" em particular).
