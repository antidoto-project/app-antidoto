<p align="center">
  <img src="assets/images/antidoto-logo-horizontal.png" alt="Antídoto" width="320" />
</p>

<p align="center"><em>Do susto ao soro certo.</em></p>

# Antídoto

> App mobile (React Native + Expo) do MVP da **Global Solution 2026/2 — FIAP**, tema **CitizenTech**.

Quem é picado por um escorpião, uma cobra, uma aranha, uma lagarta ou uma abelha perde tempo sem saber a gravidade, o que fazer e qual unidade de saúde tem o soro certo. O Antídoto responde isso em poucos toques, **sem precisar de login** para a emergência.

> ⚠️ O app **nunca** diz que a pessoa não precisa de atendimento e **nunca** indica dose ou remédio.

|                    |                                                                                                                                                                                           |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 🌐 API em produção | [https://api-antidoto-integration.onrender.com](https://api-antidoto-integration.onrender.com/actuator/health) · [Swagger](https://api-antidoto-integration.onrender.com/swagger-ui.html) |

---

## 👥 Equipe

| Nome                    | RM        |
| ----------------------- | --------- |
| Gustavo Souto de Melo   | RM 558595 |
| Iago Liziero Pereira    | RM 564063 |
| Ícaro José dos Santos   | RM 562403 |
| Leonardo Barbosa Santos | RM 558230 |

---

## 📱 O que o MVP faz

1. **SOS sem login:** 3 perguntas (animal, quem foi picado e quando, sintomas) e a **urgência calculada no próprio app**, mesmo sem internet.
2. **Unidades próximas com o soro compatível**, com os botões "Ligar" e "Rota".
3. **Ocorrências** (logado): registrar, ver o histórico, **atualizar** (sintomas novos ou outra unidade) e remover. A cada registro ou atualização, a API Java recalcula a urgência e gera, em segundo plano, um **resumo de pré-atendimento com IA** para mostrar na recepção.
4. **Avistamentos** (logado): cadastro, lista, edição e exclusão dos animais peçonhentos vistos no bairro.

Os dois CRUDs (ocorrências e avistamentos), o perfil, as unidades e os primeiros socorros vêm da API Java.

### O que é do aparelho, de propósito

| No app                                        | Por quê                                                                                                                                                                                                                |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SOS e primeiros socorros abrem **sem login**  | RN-G1: quem foi picado não pode parar para criar conta. As abas e as telas de quem está logado têm `RotaProtegida`                                                                                                     |
| A **urgência do SOS** é calculada no aparelho | O resultado precisa aparecer **sem internet**. É a mesma regra (RN-U) da API, com os mesmos 10 casos de teste; a ocorrência registrada mostra a que a API calculou (o app só confere que ela não fica abaixo da regra) |
| **Telefones úteis** (192, 193, 0800 722 6001) | RN-G8: números públicos de emergência, que precisam funcionar sem internet                                                                                                                                             |
| Integrantes na tela **Sobre o App**           | Informação do projeto, não dado do usuário                                                                                                                                                                             |

## 🚧 Andamento

| Passo | O que entra                                                                                                                                   | Situação                                                                              |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| 1     | Base do projeto: Expo + expo-router, NativeWind com a identidade visual, fonte Inter, camada da API, enums e rótulos, ESLint + Prettier, Jest | ✅                                                                                    |
| 2     | Login, cadastro, abas e logout (sessão JWT) + identidade visual: logo, ícone e splash                                                         | ✅                                                                                    |
| 3     | Triagem e resultado (urgência calculada no app, sem internet) + botão SOS no login e no Início                                                | ✅                                                                                    |
| 4     | Unidades próximas com soro compatível (GPS, Ligar e Rota) e primeiros socorros                                                                | ✅                                                                                    |
| 5     | CRUD de avistamentos (aba Avistamentos, novo, editar e excluir com confirmação; localização pelo GPS)                                         | ✅                                                                                    |
| 6     | Registrar ocorrência (com a volta pelo login), resumo por IA consultado a cada 3 s e aba Ocorrências                                          | ✅                                                                                    |
| 7     | Perfil (editar nome e telefone) e Sobre o App (versão, build e hash do commit, integrantes)                                                   | ✅                                                                                    |
| 8     | Nuvem, publicação no Firebase App Distribution e vídeo                                                                                        | 🔜 app apontando para a API no Render (`eas.json`); falta o APK no Firebase e o vídeo |
| 8.2   | Primeiros socorros pela API e atualizar a ocorrência (sintomas e unidade), completando o CRUD                                                 | ✅                                                                                    |

---

## 🛠️ Tecnologias

Expo 54 · React Native 0.81 · TypeScript · expo-router (rotas tipadas) · NativeWind (Tailwind) · TanStack Query · axios · react-hook-form + zod · AsyncStorage · expo-location · Jest + Testing Library · ESLint + Prettier.

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
| Java no Render (a API no ar)            | `https://api-antidoto-integration.onrender.com`                                                                    |

Trocou o `.env`? Reinicie com `npx expo start --clear` (o Expo guarda o endereço antigo em cache).

No APK (build do EAS), o endereço vem do [`eas.json`](eas.json): a API no Render. No plano grátis ela dorme
sem uso e leva 1 a 2 minutos para acordar (o app desiste em 10 s); um monitor do UptimeRobot a mantém acordada.

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
├── app/         telas e rotas (expo-router): login e cadastro, SOS (triagem, resultado, primeiros socorros), abas (Início, Avistamentos, Ocorrências, Perfil) e as telas de quem está logado
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

- **Link do vídeo** (até 5 minutos, no YouTube).
- **Uso de IA generativa:** a Global Solution pede uma seção listando as ferramentas usadas e para quê.
