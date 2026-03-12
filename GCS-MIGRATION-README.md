# Migração para Google Cloud Storage

## ✅ Implementação Concluída

A migração do sistema de carregamento de imagens da pasta local `/public/files` para o Google Cloud Storage foi implementada com sucesso.

## 🔧 Configuração Necessária

### 1. Configurar Credenciais do GCS

Edite o arquivo `.env.local` na raiz do projeto e substitua os valores pelos seus dados reais:

```env
# Google Cloud Storage Configuration
GCS_BUCKET_NAME=bucket-catalogo-colorsublime
GCS_PROJECT_ID=seu-projeto-id-real
GCS_CLIENT_EMAIL=sua-service-account@projeto.iam.gserviceaccount.com
GCS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nSUA_CHAVE_PRIVADA_AQUI\n-----END PRIVATE KEY-----\n"
```

### 2. Obter Credenciais do GCS

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)
2. Selecione seu projeto
3. Vá para "IAM & Admin" > "Service Accounts"
4. Crie uma nova Service Account ou use uma existente
5. Baixe o arquivo JSON da chave
6. Copie os valores `project_id`, `client_email` e `private_key` para o `.env.local`

### 3. Configurar Permissões do Bucket

Certifique-se de que o bucket `bucket-catalogo-colorsublime` tenha:
- Acesso público para leitura (para as imagens)
- Permissões de leitura para a Service Account

## 🧪 Testar a Migração

Execute o script de teste para verificar se tudo está funcionando:

```bash
node test-gcs-migration.js
```

## 📁 Estrutura do Bucket

As imagens devem estar organizadas no bucket da seguinte forma:

```
bucket-catalogo-colorsublime/
└── public/
    └── files/
        ├── AAAA/
        │   ├── AAAA-1.jpg
        │   ├── AAAA-2.jpg
        │   └── ...
        ├── BBBB/
        │   ├── BBBB-1.jpg
        │   └── ...
        └── CCCC/
            └── ...
```

## 🔄 O que Mudou

### URLs das Imagens
- **Antes**: `/files/AAAA/AAAA-1.jpg`
- **Depois**: `https://storage.googleapis.com/bucket-catalogo-colorsublime/public/files/AAAA/AAAA-1.jpg`

### Funcionalidades Mantidas
- ✅ Carregamento de imagens por categoria
- ✅ Sistema de busca
- ✅ Paginação e scroll infinito
- ✅ Cache local no frontend
- ✅ Estrutura de categorias

### Funcionalidades Temporariamente Desabilitadas
- ⏸️ Upload de imagens (admin)
- ⏸️ Criação de pastas (admin)
- ⏸️ Exclusão de arquivos (admin)

## 🚀 Próximos Passos

1. **Configure as credenciais** no arquivo `.env.local`
2. **Teste a conexão** com o script fornecido
3. **Verifique a página** `/catalog` para confirmar o carregamento
4. **Implemente upload/delete** quando necessário (futuro)

## 🐛 Solução de Problemas

### Erro de Credenciais
```
❌ Erro ao testar conexão GCS: Invalid credentials
```
**Solução**: Verifique se as credenciais no `.env.local` estão corretas

### Bucket Não Encontrado
```
❌ Erro ao testar conexão GCS: Bucket not found
```
**Solução**: Verifique se o bucket `bucket-catalogo-colorsublime` existe e está acessível

### Nenhuma Imagem Encontrada
```
⚠️ Nenhum arquivo encontrado no prefixo "public/files/"
```
**Solução**: Verifique se as imagens foram enviadas para o bucket com a estrutura correta

## 📞 Suporte

Se encontrar problemas, verifique:
1. Se as variáveis de ambiente estão corretas
2. Se o bucket existe e tem as permissões adequadas
3. Se as imagens estão na estrutura correta no bucket
4. Se a Service Account tem as permissões necessárias
