<p align="center">
  <img src="assets/images/antidoto-logo-horizontal.png" alt="Antídoto" width="320" />
</p>

<p align="center"><em>Do susto ao soro certo.</em></p>

# Antídoto

> App mobile (React Native + Expo) do MVP da **Global Solution 2026/2 — FIAP**, tema **CitizenTech**.

Quem é picado por um escorpião, uma cobra, uma aranha, uma lagarta ou uma abelha perde tempo sem saber a gravidade, o que fazer e qual unidade de saúde tem o soro certo. O Antídoto responde isso em poucos toques, **sem precisar de login** para a emergência.

> ⚠️ O app **nunca** diz que a pessoa não precisa de atendimento e **nunca** indica dose ou remédio.

---

## 📱 O que o MVP faz

1. **SOS sem login:** 3 perguntas (animal, quem foi picado e quando, sintomas) e a **urgência calculada no próprio app**, mesmo sem internet.
2. **Unidades próximas com o soro compatível**, com os botões "Ligar" e "Rota".
3. **Registrar a ocorrência** (logado): a API Java gera, em segundo plano, um **resumo de pré-atendimento com IA** para mostrar na recepção.
4. **Avistamentos** (logado): cadastro, lista, edição e exclusão dos animais peçonhentos vistos no bairro.

## 🚧 Andamento

| Passo | O que entra                                                                                                                                   | Situação |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| 1     | Base do projeto: Expo + expo-router, NativeWind com a identidade visual, fonte Inter, camada da API, enums e rótulos, ESLint + Prettier, Jest | ✅       |
| 2     | Login, cadastro, abas e logout (sessão JWT) + identidade visual: logo, ícone e splash                                                         | ✅       |
| 3     | Triagem e resultado (urgência no app)                                                                                                         | ⏳       |
| 4     | Unidades próximas e primeiros socorros                                                                                                        | ⏳       |
| 5     | CRUD de avistamentos                                                                                                                          | ⏳       |
| 6     | Ocorrência e resumo por IA                                                                                                                    | ⏳       |
| 7     | Perfil e Sobre o App                                                                                                                          | ⏳       |
| 8     | Nuvem, publicação no Firebase App Distribution e vídeo                                                                                        | ⏳       |

---

## 🛠️ Tecnologias

Expo 54 · React Native 0.81 · TypeScript · expo-router (rotas tipadas) · NativeWind (Tailwind) · TanStack Query · axios · react-hook-form + zod · AsyncStorage · Jest + Testing Library · ESLint + Prettier.

O app consome **só a API Java** do projeto, pelo contrato [`docs/api/openapi-mvp.yaml`](docs/api/openapi-mvp.yaml).

## ▶️ Como rodar

Pré-requisitos: **Node 22 LTS** e o app **Expo Go** no celular (ou um emulador Android).

```bash
npm install
cp .env.example .env      # e ajuste o EXPO_PUBLIC_API_URL (ver abaixo)
npx expo start
```

**Endereço da API** (`.env`, modelo em [`.env.example`](.env.example)):

| Situação                                | `EXPO_PUBLIC_API_URL`                                                                                              |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Java ainda não pronto: mock do contrato | `http://<ip do computador>:4010`, com `npx @stoplight/prism-cli mock -h 0.0.0.0 docs/api/openapi-mvp.yaml` rodando |
| Java rodando no computador (porta 8080) | deixe comentado: o app acha o computador sozinho                                                                   |
| Java na Azure                           | `https://<app>.azurewebsites.net`                                                                                  |

Nenhuma chave de API fica no app: só o endereço.

## ✅ Qualidade

```bash
npx tsc --noEmit   # tipos
npm run lint       # ESLint + Prettier
npm run format     # formata o código com o Prettier
npm test           # testes (Jest)
```

## 📂 Estrutura

```
src/
├── api/         cliente da API (axios + JWT), erros, paginação, QueryClient
├── app/         telas e rotas (expo-router): login, cadastro, Início, Perfil
├── components/  componentes de tela e de formulário
├── context/     sessão (token e usuário)
├── hooks/       dados (TanStack Query)
├── schemas/     validação dos formulários (zod)
├── services/    chamadas à API
├── types/       enums e tipos do contrato
├── utils/       funções puras: rótulos, datas, máscaras, telefones, versão
├── testes/      apoio aos testes
└── __tests__/   testes
assets/fonts/    fonte Inter (licença OFL)
assets/images/   logo, ícone e splash
docs/            pacote do MVP e contrato da API
```

As convenções do projeto estão no [`CLAUDE.md`](CLAUDE.md).

---

## 📝 A completar antes da entrega

- **Integrantes** (nome e RM).
- **Link do vídeo** (até 5 minutos, no YouTube).
- **Uso de IA generativa:** a Global Solution pede uma seção listando as ferramentas usadas e para quê.
