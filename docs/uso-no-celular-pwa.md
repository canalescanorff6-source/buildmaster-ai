# Uso no celular — BuildMaster AI Mobile/PWA

Esta versão foi preparada para funcionar como **PWA**, ou seja, um app instalável pelo navegador do celular.

## Opção 1 — Usar no celular pela rede local

1. No computador, rode o projeto:

```bash
npm install
cp .env.example .env
docker compose up -d
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run db:seed
npm run start:mobile-lan
```

2. Descubra o IP do computador na rede Wi-Fi.

No Windows:

```bash
ipconfig
```

Procure o IPv4, por exemplo:

```text
192.168.1.25
```

3. No celular, conectado no mesmo Wi-Fi, abra:

```text
http://192.168.1.25:3000
```

## Instalar como app na tela inicial

### Android / Chrome

1. Abra o site no Chrome.
2. Toque nos três pontinhos.
3. Toque em **Adicionar à tela inicial** ou **Instalar app**.
4. O BuildMaster AI abrirá como app em tela cheia.

### iPhone / Safari

1. Abra o site no Safari.
2. Toque em compartilhar.
3. Toque em **Adicionar à Tela de Início**.

## Câmera e imagem da carta

Na tela:

```text
/dashboard/analisar-imagem
```

O botão de upload já aceita foto da câmera ou imagem da galeria.

O fluxo ideal no celular é:

1. tirar print/foto da carta;
2. enviar no app;
3. revisar o texto extraído pelo OCR;
4. clicar em **Analisar carta**;
5. ver PRI, melhor ficha, posição ideal e habilidades adicionais.

## Offline: o que funciona e o que não funciona

### Funciona parcialmente offline

A interface PWA pode abrir novamente sem internet depois de instalada, e o OCR pode funcionar no navegador quando os arquivos já estiverem carregados/cached.

### Ainda precisa de servidor local ou online

A análise completa usa rotas API do Next.js e banco PostgreSQL. Por isso, para usar no celular você precisa de uma destas opções:

- computador ligado rodando o sistema na mesma rede Wi-Fi;
- servidor online;
- futura versão app nativo com banco local SQLite.

## Para virar app 100% offline de celular

Será necessário criar uma versão nativa com:

- Capacitor ou React Native/Expo;
- SQLite local no celular;
- OCR embarcado ou OCR no navegador WebView;
- sincronização opcional quando tiver internet.

Essa é uma etapa futura. A versão atual é o melhor caminho para validar o produto rápido no celular.
