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
Messaging, Supabase Edge Functions e webhook da base de dados.

### O que foi feito

- Criada a tabela `public.profiles` com `fcm_token`.
- Criada a tabela `public.notifications` para guardar notificacoes a enviar.
- Criada a Edge Function `supabase/functions/push/index.ts`.
- Configurado o secret `FCM_SERVICE_ACCOUNT_JSON` no Supabase.
- Criado webhook remoto: insert em `public.notifications` chama a funcao `push`.
- Firebase Android app configurada com package `com.commuhub`.
- Ficheiro Firebase Android colocado em `android/app/google-services.json`.

Fluxo:

1. A app grava o token FCM do utilizador em `public.profiles.fcm_token`.
2. O backend insere uma linha em `public.notifications`.
3. O webhook chama a Edge Function `push`.
4. A funcao procura o token FCM do utilizador.
5. A funcao envia a push para Firebase Cloud Messaging.
6. Se enviar com sucesso, preenche `sent_at`.
7. Se falhar, preenche `send_error`.

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

### Como criar uma push

Para testar quando ja existir token FCM real:

```sql
update public.profiles
set fcm_token = '<TOKEN_FCM_REAL>',
    fcm_token_updated_at = now()
where id = '<USER_ID>';

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

### O que falta no app

O backend esta pronto. Falta o colega integrar o app Android seguindo o tutorial:

1. Instalar `@react-native-firebase/messaging`.
2. Instalar `@notifee/react-native`.
3. Configurar Gradle e `AndroidManifest.xml`.
4. Obter o token FCM do dispositivo.
5. Guardar o token no Supabase:

```ts
await supabase.from('profiles').upsert({
  id: user.id,
  fcm_token: token,
  fcm_token_updated_at: new Date().toISOString(),
});
```

6. Tratar `remoteMessage.data.screen` para navegar para a screen certa.

### Comando util

```bash
supabase functions deploy push --project-ref chbccyllwibmlbvvexzw
```
