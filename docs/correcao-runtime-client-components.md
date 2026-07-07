# Correção runtime: Client Components

Correção aplicada para o erro:

`Functions cannot be passed directly to Client Components`

Causa: o `AppShell` é Server Component e estava passando componentes de ícone do `lucide-react` diretamente para o `NavLink`, que é Client Component. No Next.js, funções/componentes não podem ser serializados como props de Server para Client Component.

Solução: o `AppShell` agora envia apenas uma string (`home`, `camera`, `cards`, etc.) e o `NavLink` escolhe o ícone no lado client.

Arquivos alterados:

- `src/components/app-shell.tsx`
- `src/components/nav-link.tsx`
