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
