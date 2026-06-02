# Supabase Backend

Este projeto usa Supabase como backend simples para a app CommuHub.

## Features Integradas

### Login simples

Foi criada a tabela `public.users` para guardar utilizadores da app.

Campos principais:

- `id`: identificador unico do utilizador.
- `username`: nome usado no login.
- `password`: password em texto simples para demo/faculdade.
- `type`: tipo de utilizador, pode ser `admin` ou `condomino`.
- `date_added`: data de criacao do utilizador.

Tambem foi criada a funcao `public.login_user(input_username, input_password)`.
Ela recebe username/password e devolve os dados do utilizador sem devolver a password.

Exemplo de uso no app:

```ts
const { data, error } = await supabase.rpc('login_user', {
  input_username: username,
  input_password: password,
});

const user = data?.[0];
```

Se `user` existir, login valido. Se vier vazio, login invalido.

### Storage de documentos

Foi criado o bucket `documentos` no Supabase Storage.

Tambem foram adicionadas colunas na tabela `public.documentos`:

- `file_path`: caminho do ficheiro dentro do bucket.
- `mime_type`: tipo do ficheiro, por exemplo `application/pdf`.

A tabela `documentos` continua responsavel por guardar os dados visiveis no app:

- titulo
- categoria
- tipo
- data
- tamanho
- caminho do ficheiro

O ficheiro real fica no Supabase Storage.

## Como Integrar Com o App

### 1. Listar documentos

Atualizar o select atual em `src/services/communityService.ts` para tambem buscar `file_path` e `mime_type`.

```ts
const { data, error } = await supabase
  .from('documentos')
  .select('id,title,category,type,date,size,file_path,mime_type')
  .order('id', { ascending: true });
```

Depois mapear `file_path` para o model usado no app.

### 2. Abrir/download de documento

Como o bucket `documentos` esta publico, pode ser usada URL publica:

```ts
const { data } = supabase.storage
  .from('documentos')
  .getPublicUrl(filePath);

const url = data.publicUrl;
```

No React Native, abrir com:

```ts
import { Linking } from 'react-native';

await Linking.openURL(url);
```

### 3. Fazer upload de documento

Fluxo recomendado:

1. Enviar ficheiro para o bucket `documentos`.
2. Guardar metadata na tabela `documentos`.

Exemplo:

```ts
await supabase.storage
  .from('documentos')
  .upload(filePath, fileBody, {
    contentType: 'application/pdf',
    upsert: true,
  });

await supabase.from('documentos').insert({
  id,
  title,
  category,
  type: 'PDF',
  date,
  size,
  file_path: filePath,
  mime_type: 'application/pdf',
});
```

## Notas

- Esta implementacao foi feita para contexto academico, com foco em simplicidade.
- Para producao, passwords devem ser guardadas com hash ou usando Supabase Auth.
- Para documentos privados, o bucket deve deixar de ser publico e o app deve usar `createSignedUrl`.

## Push Notifications FCM

Backend de push notifications implementado para Android usando Firebase Cloud
Messaging, Supabase Edge Functions, triggers Postgres e webhook da base de dados.

### O que foi feito

- Criada a tabela `public.profiles` com `fcm_token`.
- Criada a tabela `public.notifications` para guardar notificacoes a enviar.
- Criada a Edge Function `supabase/functions/push/index.ts`.
- Configurado o secret `FCM_SERVICE_ACCOUNT_JSON` no Supabase.
- Criado webhook remoto: insert em `public.notifications` chama a funcao `push`.
- Criadas triggers de insert em `public.documentos`, `public.votacoes` e `public.eventos`.
- A app sincroniza o token FCM no login e regista o handler foreground no arranque.
- O mesmo token FCM e limpo de outros perfis antes de ser gravado no utilizador logado, evitando varias notificacoes no mesmo aparelho.
- Firebase Android app configurada com package `com.commuhub`.
- Ficheiro Firebase Android colocado em `android/app/google-services.json`.

Fluxo:

1. Ao fazer login, a app chama `setupPushNotifications(user.id)`.
2. A funcao pede permissao Android/Firebase, obtem o token FCM e grava em `public.profiles.fcm_token`.
3. Antes de gravar, remove esse mesmo token de outros perfis.
4. Quando um documento, votacao ou evento e criado, um trigger cria uma linha em `public.notifications` para cada utilizador em `public.users`.
5. O webhook de `public.notifications` chama a Edge Function `push`.
6. A Edge Function procura `profiles.fcm_token` do utilizador da notificacao.
7. Se existir token, envia para Firebase Cloud Messaging e preenche `sent_at`.
8. Se nao existir token, grava `send_error = 'User has no FCM token'`.

Nota: os switches de preferencias do Perfil continuam no app, mas a Edge Function nao usa `push_enabled`, `notify_documentos`, `notify_votacoes` ou `notify_eventos` para bloquear envio. Regra atual: todos os utilizadores com `fcm_token` valido recebem.

### Formato da notificacao

A mensagem enviada ao Firebase e **data-only**, como no tutorial do professor.
Isto ajuda o app a tratar foreground, background e navegacao via Notifee.

O payload recebido pela app fica assim:

```ts
remoteMessage.data = {
  title: 'Titulo',
  body: 'Mensagem',
  screen: 'Votacoes',
};
```

O campo `screen` deve bater com uma screen real do projeto React Native:

- `Inicio`
- `Votacoes`
- `Docs`
- `Agenda`
- `Perfil`

### Notificacoes automaticas

As notificacoes automaticas sao criadas por triggers no Supabase.

Documentos:

- `documentos_notify_after_insert`: cria push `Upload novo`.
- `data.screen`: `Docs`.

Votacoes:

- `votacoes_notify_after_insert`: cria push `Votação nova`.
- `data.screen`: `Votacoes`.

Eventos:

- `eventos_notify_after_insert`: cria push `Evento novo`.
- `data.screen`: `Agenda`.

As funcoes privadas responsaveis sao:

- `private.create_document_notification()`
- `private.create_votacao_notification()`
- `private.create_evento_notification()`

Nao existem triggers de update para documentos ou votacoes nesta regra atual.
Editar documento/votacao nao deve gerar push.

### Sincronizacao do token no app

No login, a app chama:

```ts
setupPushNotifications(user.id).catch(pushError => {
  console.error('Erro ao configurar push notifications no login:', pushError);
});
```

A funcao obtem o token do Firebase, limpa duplicados e grava:

```ts
await supabase
  .from('profiles')
  .update({
    fcm_token: null,
    fcm_token_updated_at: null,
  })
  .eq('fcm_token', token)
  .neq('id', userId);

await supabase.from('profiles').upsert({
  id: userId,
  fcm_token: token,
  fcm_token_updated_at: new Date().toISOString(),
});
```

O foreground handler e registado no arranque do app em `index.js` para evitar
perder notificacoes enquanto o app esta aberto. O handler e unico para evitar
notificacoes duplicadas no mesmo aparelho.

### Como criar uma push manual

Para testar quando ja existir token FCM real:

```sql
insert into public.notifications (user_id, title, body, data)
values (
  '<USER_ID>',
  'Titulo teste',
  'Mensagem teste',
  '{"screen":"Votacoes"}'::jsonb
);
```

Verificar resultado:

```sql
select id, title, sent_at, send_error
from public.notifications
order by created_at desc
limit 5;
```

### Como testar automatico

Criar evento:

```sql
insert into public.eventos (id, title, date, time, location)
values (
  extract(epoch from now())::bigint::text,
  'evento teste',
  '2026-06-02',
  '15:00',
  'Teste'
);
```

Criar votacao:

```sql
insert into public.votacoes (
  id,
  title,
  description,
  deadline,
  status,
  user_voted,
  votes_sim,
  votes_nao,
  votes_abstencao,
  total_voters
)
values (
  extract(epoch from now())::bigint::text,
  'votacao teste',
  'Teste de notificacao',
  '2026-06-30',
  'active',
  false,
  0,
  0,
  0,
  0
);
```

Criar documento:

```sql
insert into public.documentos (
  id,
  title,
  category,
  type,
  date,
  size,
  file_path,
  mime_type
)
values (
  extract(epoch from now())::bigint::text,
  'documento teste',
  'Teste',
  'IMG',
  '2026-06-02',
  '1 KB',
  'uploads/teste.jpg',
  'image/jpeg'
);
```

Verificar resultado:

```sql
select title, body, data->>'screen' as screen, sent_at, send_error, created_at
from public.notifications
order by created_at desc
limit 20;
```

### Estado atual do app

- `@react-native-firebase/messaging` e `@notifee/react-native` estao instalados.
- Android/Firebase estao configurados com `android/app/google-services.json`.
- O app mostra notificacoes foreground com Notifee.
- Como a mensagem FCM e `data-only`, o app le `remoteMessage.data.title` e `remoteMessage.data.body`.
- O token FCM e sincronizado no login.
- Ainda nao ha navegacao automatica ao tocar na notificacao.

### Comando util

Quando alterar a Edge Function, fazer deploy:

```bash
npx supabase functions deploy push --project-ref chbccyllwibmlbvvexzw --use-api
```
