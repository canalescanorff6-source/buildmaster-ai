# Próximo passo: app nativo Android/iOS

A versão atual é uma PWA mobile. Ela já pode ser instalada na tela inicial do celular, mas ainda depende de um servidor Next.js/PostgreSQL rodando localmente ou online.

Para transformar em app nativo offline, existem dois caminhos:

## Caminho A — Capacitor

Mantém a interface Next/React e empacota como app Android/iOS.

Vantagens:

- reaproveita boa parte do front-end atual;
- permite gerar APK;
- permite acesso à câmera e arquivos do celular.

Ajustes necessários:

- trocar PostgreSQL por SQLite local ou usar API online;
- adaptar autenticação;
- garantir funcionamento do OCR dentro do WebView;
- criar build estático/compatível.

## Caminho B — React Native / Expo

Recria o app em React Native.

Vantagens:

- experiência mais nativa;
- melhor acesso à câmera/galeria;
- mais controle para app offline.

Ajustes necessários:

- refazer telas;
- portar motor PRI e dicionário de habilidades;
- usar SQLite/AsyncStorage;
- configurar OCR ou análise por API.

## Recomendação

Para validar e vender a primeira versão, comece com PWA. Depois que o produto estiver aprovado, converta para app nativo.
