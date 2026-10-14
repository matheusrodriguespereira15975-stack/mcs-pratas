# MCS Jóias — Catálogo + Painel

- `/` → catálogo (lê os produtos de `/api/products`)
- `/admin` → painel para cadastrar, editar, ocultar, reordenar e excluir produtos

Produtos ficam no **Firebase Firestore**; fotos no **Vercel Blob**.

## 1) Firebase (produtos)
1. console.firebase.google.com → criar projeto.
2. **Build → Firestore Database → Criar banco** (modo produção; região `southamerica-east1`). Não precisa mexer nas regras: o acesso é feito só pelo servidor.
3. **Configurações do projeto → Contas de serviço → Gerar nova chave privada**. Abra o `.json` baixado e copie TODO o conteúdo.

## 2) Vercel
1. Suba esta pasta para o GitHub e importe em vercel.com/new (ou rode `npx vercel`).
2. **Storage → Create → Blob** (acesso **Public**) → conecte ao projeto (fotos).
3. **Settings → Environment Variables**:
   - `FIREBASE_SERVICE_ACCOUNT` = conteúdo completo do JSON da etapa 1
   - `ADMIN_PASSWORD` = senha do painel
   - `SESSION_SECRET` (opcional) = texto aleatório longo
4. **Redeploy** e acesse `seusite.vercel.app/admin`.

Os 6 produtos originais são gravados no Firestore automaticamente no primeiro acesso.
