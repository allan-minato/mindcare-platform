# MindCare Platform

CMS multi-tenant para sites de psicólogos e psiquiatras.

## Desenvolvimento

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

Copie `.env.example` para `.env.local` e preencha a chave publicável, em Project Settings → API Keys no [dashboard](https://supabase.com/dashboard/project/uejagjwfvdhpfhpazjhi). A secret key e a `service_role` não entram no aplicativo.

## Banco de dados

O schema, as políticas RLS e o fluxo de publicação estão em [docs/database.md](docs/database.md). As migrations ficam em `supabase/migrations/` e já estão aplicadas no projeto remoto.

## MCP do Supabase

A configuração do projeto está em `.cursor/mcp.json`, no servidor `mindcare`, e aponta para `uejagjwfvdhpfhpazjhi`. No Cursor, abra Settings → Tools & MCP, conecte `mindcare` e entre com a conta que criou o MindCare. O servidor `supabase` da configuração global continua no outro projeto...
