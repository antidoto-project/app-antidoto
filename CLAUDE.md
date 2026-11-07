# Antídoto — Contrato de Desenvolvimento

Você é um desenvolvedor Sênior de React Native trabalhando no app **Antídoto**, o MVP mobile da **Global Solution 2026/2 (FIAP)**, tema CitizenTech.

Este arquivo é o contrato de desenvolvimento do projeto: todo código gerado (por humano ou IA) deve seguir estas regras. Elas refletem o **estado real do código hoje**. O que ainda não existe aparece marcado com o passo em que entra — **(Passo N)** —, como plano, não como código pronto.

- **Padrão:** o mesmo do Challenge Afetto (`front-end-afetto`): mesma stack, mesmas pastas e camadas, mesmos nomes. **Não inventar convenção nova.**
- **Regras do produto e do contrato:** `docs/MVP-00-LEIA-ME.md` (regras RN-U, RN-S, RN-G, enums e sintomas), `docs/MVP-02-FRONT-MOBILE.md` (o app) e `docs/api/openapi-mvp.yaml` (as rotas). Onde o MVP-02 escreve um nome diferente do Afetto, vale o do Afetto (ver "Ajustes em relação ao MVP-02", no fim).
- **Idioma do código:** português (variáveis, funções, tipos, textos de UI). Os campos do payload seguem o contrato (que também está em português).

---

## 1. Visão Geral

- **Produto:** app em que o cidadão picado por um animal peçonhento descobre a gravidade, o que fazer e qual unidade de saúde tem o soro certo.
- **MVP (4 funcionalidades):**
  1. SOS **sem login**: 3 perguntas → urgência calculada no próprio app + o que fazer.
  2. Unidades mais próximas com **soro compatível**, com "Ligar" e "Rota".
  3. (Logado) Registrar a ocorrência; o Java gera um resumo de pré-atendimento com IA (assíncrono).
  4. (Logado) CRUD de avistamentos de animais peçonhentos.
- **Princípio inegociável:** o app **nunca** diz que a pessoa não precisa de atendimento e **nunca** indica dose ou remédio.
- **Fora do MVP** (só no pitch): refresh token, contatos de emergência, foto com IA no app, mapa de risco, modo offline completo, SMS, IoT, integração com o .NET.

---

## 2. Stack e Dependências

| Categoria         | Biblioteca                                                                                           |
| ----------------- | ---------------------------------------------------------------------------------------------------- |
| Runtime/Framework | Expo `~54`, React Native `0.81`, React `19.1`, TypeScript                                            |
| Navegação         | `expo-router` `~6` (rotas por arquivo, `typedRoutes` no `app.json`)                                  |
| Estilização       | `nativewind` `^4` (Tailwind via `className`)                                                         |
| Formulários       | `react-hook-form` `^7` + `@hookform/resolvers/zod` (Passo 2)                                         |
| Validação         | `zod` `^4`                                                                                           |
| Data fetching     | `@tanstack/react-query` `^5`                                                                         |
| HTTP client       | `axios` `^1`                                                                                         |
| Sessão            | `@react-native-async-storage/async-storage` (Passo 2)                                                |
| Ícones            | `@expo/vector-icons` — **só `Ionicons`** (fonte pré-carregada no `_layout.tsx` raiz)                 |
| Fonte             | **Inter** (`assets/fonts`, 3 pesos), carregada com `useFonts` do `expo-font` — sem biblioteca nova   |
| Versão instalada  | `expo-application` — `nativeBuildVersion` na tela Sobre o App (Passo 7)                              |
| GPS               | `expo-location` — **única biblioteca nova** do MVP (entra no Passo 4)                                |
| Testes            | `jest` + `jest-expo` + `@testing-library/react-native`                                               |
| Lint/formatação   | ESLint (`eslint-config-expo`) + Prettier (`.prettierrc`: 100 colunas, aspas duplas, ponto e vírgula) |

Ligar e abrir a rota usam o `Linking` do React Native (`tel:` e link do Google Maps), **sem biblioteca**.

**Endereço da API** (`definirUrlDaApi`, `src/api/api.ts`):

1. `EXPO_PUBLIC_API_URL` do `.env` (modelo em `.env.example`): o mock do contrato (Prism, porta 4010) ou a API na Azure (https).
2. Sem `.env`: a API Java no computador que roda o Expo (`Constants.expoConfig.hostUri`), porta **8080**. No navegador, o mesmo endereço da página.
3. Sem esse dado: `http://localhost:8080`.

- **Tempo limite:** 10 s (`TEMPO_LIMITE_API_MS`, MVP-02 §5.1).
- **Mock antes do Java:** `npx @stoplight/prism-cli mock -h 0.0.0.0 docs/api/openapi-mvp.yaml` e `EXPO_PUBLIC_API_URL=http://<ip do computador>:4010`. O `-h 0.0.0.0` deixa o celular alcançar o mock.
- **Build do celular:** o `.env` não sobe para o EAS (está no `.gitignore`). O `app.config.ts` (`conferirApiDoBuild`) para o build do EAS que não tiver `EXPO_PUBLIC_API_URL` com `https://`.
- **Nenhuma chave de API no app.** Só o endereço.

---

## 3. Estrutura de Pastas

```
src/
├── api/
│   ├── api.ts            ← instância do axios (baseURL via definirUrlDaApi, 10 s). Bearer e 401: Passo 2
│   ├── erros.ts          ← classificarErro / mensagemPorTipo / mensagemErroApi / mensagemDaApi / errosDeCampoDaApi
│   ├── paginacao.ts      ← tipo Pagina<T> do contrato + extrairLista
│   └── queryClient.ts    ← instância do QueryClient (só importado no _layout.tsx raiz)
├── app/
│   ├── _layout.tsx       ← raiz: fontes (Ionicons + Inter), QueryClientProvider, Stack
│   ├── index.tsx         ← HOJE: tela de entrada provisória (nome, versão, commit). Passo 2: porta de entrada (sessão → Início; sem sessão → login)
│   ├── (auth)/           ← (Passo 2) login (T1, com o botão SOS), cadastro (T2)
│   ├── sos/              ← (Passo 3–4) PÚBLICA, logado ou não (RN-G1): triagem (T3), resultado (T4), primeiros-socorros/[tipoAnimal] (T5)
│   ├── (tabs)/           ← (Passo 2+) com <RotaProtegida>: index = Início (T6), avistamentos (T7), ocorrencias (T8), perfil (T9)
│   └── (app)/            ← (Passo 5+) com <RotaProtegida>, em Stack: avistamentos/novo (T10), avistamentos/[id] (T11), ocorrencias/[id] (T12), sobre (T13)
├── components/           ← (Passo 2+) ui/ (CampoTexto, CampoSelecao, BotaoEnviar, TelaFormulario), sos/, avistamentos/, ocorrencias/, e na raiz EstadoVazio, EstadoErro, RotaProtegida
├── context/              ← (Passo 2) SessaoContext.tsx
├── hooks/                ← (Passo 2+) dados: useAutenticacao, usePerfil, useUnidades, useOcorrencias, useAvistamentos, useConteudo · tela: useTriagem, useLocalizacao
├── schemas/              ← (Passo 2+) login, cadastro, perfil, avistamento, triagem (.schema.ts)
├── services/             ← (Passo 2+) autenticacao, unidade, ocorrencia, avistamento, conteudo (.service.ts)
├── types/
│   └── enums.types.ts    ← enums do contrato como listas `as const` + tipos (TipoAnimal, FaixaEtaria, Urgencia, TipoSoro, TipoUnidade, LocalAvistamento, StatusResumo, Perfil, Sintoma)
├── utils/
│   ├── rotulos.ts        ← LABEL_* dos enums (textos da tela), SINTOMAS_DE_ALERTA, ehSintomaDeAlerta
│   ├── data.ts           ← converterDataParaBR (Passo 3: formatarDataHora, tempoDecorrido, horaPorOpcao)
│   ├── versao.ts         ← versaoDoApp (versão + commit de Constants.expoConfig.extra), buildDoApp (número do build e ambiente)
│   └── (Passo 3+) urgencia.ts (RN-U), mascaras.ts, links.ts
├── testes/
│   └── clienteDeTeste.ts ← QueryClient dos testes (sem retry e sem o timer de limpeza do cache)
├── __tests__/            ← um arquivo por regra ou tela
└── global.css            ← @tailwind base/components/utilities
assets/fonts/             ← Inter_400Regular, Inter_600SemiBold, Inter_700Bold (.ttf) + OFL.txt (licença)
docs/                     ← pacote MVP (MVP-00, MVP-02) e o contrato docs/api/openapi-mvp.yaml — não editar sem combinar com o Java.
                            Eles ainda usam o nome antigo, "SOS Peçonha": o app se chama Antídoto
```

---

## 4. Regras de Estilização

- Use **sempre** `className` com NativeWind. Nunca `StyleSheet.create` (exceção: `useAnimatedStyle` do reanimated).
- Nunca passe cor via `style={{ color: "#hex" }}`. Sempre uma classe.
- **Antes de usar uma classe de cor, confirme que ela existe** no `tailwind.config.js` ou na paleta padrão do Tailwind. Classe inexistente não dá erro — a cor só não aparece.

**Tokens de cor** (`tailwind.config.js`, MVP-02 §7):

| Classe                                  | Hex                   | Uso                                                 |
| --------------------------------------- | --------------------- | --------------------------------------------------- |
| `bg-marca` / `text-marca`               | `#1B5E20`             | Barra, botões principais                            |
| `bg-marca-claro` / `text-marca-claro`   | `#4C8C4A`             | Variante clara (ex.: texto da marca no tema escuro) |
| `bg-emergencia` / `text-emergencia`     | `#C62828`             | **Só** o botão SOS, o selo `EMERGENCIA` e o 192     |
| `bg-alta` / `text-alta`                 | `#EF6C00`             | Selo `ALTA`                                         |
| `bg-moderada` / `text-moderada`         | `#F9A825`             | Selo `MODERADA`                                     |
| `bg-fundo` / `dark:bg-fundo-escuro`     | `#FFF8E1` / `#121212` | Fundo das telas                                     |
| `text-texto` / `dark:text-texto-escuro` | `#263238` / `#ECEFF1` | Texto                                               |

**Tipografia:**

- Fonte **Inter**, carregada no `_layout.tsx` raiz. Classes: `font-inter` (400), `font-inter-semibold` (600), `font-inter-bold` (700).
- No Android, o peso vem do arquivo da fonte: use `font-inter-bold`, **não** `font-bold`.
- Títulos com 22 ou mais (`text-2xl`+); corpo com 16 ou mais (`text-base`+).

**Tema escuro:** `darkMode: "class"`, como no Afetto. Todo fundo e texto de tela leva a variante `dark:` (`bg-fundo dark:bg-fundo-escuro`, `text-texto dark:text-texto-escuro`). ⚠️ **Em aberto:** se haverá seletor de tema, como o `TemaContext` do Afetto, ou se o app só segue o aparelho.

**Urgência:** sempre **texto + ícone**, nunca só a cor. O vermelho `emergencia` é exclusivo do SOS, do `EMERGENCIA` e do 192.

---

## 5. Componentização

- Um bloco que aparece em mais de uma tela → componente. Um bloco com mais de ~40 linhas de JSX → avaliar extração.
- Componentes genéricos em `components/ui/`; os de um domínio em `components/sos/`, `components/avistamentos/`, `components/ocorrencias/`; `EstadoVazio`, `EstadoErro` e `RotaProtegida` na raiz de `components/` (como no Afetto).
- Componentes previstos (MVP-02 §4): `BotaoSos`, `SeletorAnimal`, `SeletorFaixaEtaria`, `ListaSintomas`, `SeloUrgencia`, `BotaoLigar192`, `AvisoAtendimento`, `CartaoUnidade`, `CartaoAvistamento`, `CartaoOcorrencia`, `CartaoResumo`.

---

## 6. Responsabilidade Única — Regras por Camada

- **Páginas (`src/app/`):** layout e estado local de UI. **Nunca** chamam HTTP direto: leitura por `useQuery`, escrita por `useMutation`, sempre via hooks.
- **Hooks de dados:** só `useQuery`/`useMutation` chamando o service; devolvem o objeto do TanStack como está. Invalidação com `useQueryClient()` **dentro do hook** (nunca importar o `queryClient` direto). Sem JSX e **sem navegar** — a navegação fica no `onSuccess` da tela.
- **Hooks de tela** (`useTriagem`, `useLocalizacao`): estado local e regra de um fluxo de UI, expondo um objeto próprio.
- **Services:** chamadas HTTP e conversão do payload (máscara, data, lista paginada). Padrão objeto (`avistamentoService.criar`). Comentar todo contorno de limitação da API. Exceção do MVP: `conteudo.service.ts` devolve o conteúdo **local** de primeiros socorros numa `Promise`, para o hook seguir o padrão `useQuery`.
- **Schemas:** só Zod, exportando o tipo inferido. Use as listas de `types/enums.types.ts` no `z.enum`.
- **Utils:** funções puras, sem hooks e sem I/O, **sempre com teste**.
- **Context:** um único `SessaoContext` para a sessão (Passo 2).

**Chaves do TanStack Query** (MVP-02 §4): `["usuario","me"]` · `["unidades","proximas", latitude, longitude, tipoAnimal]` · `["ocorrencias","minhas"]` · `["ocorrencias", id]` · `["avistamentos","meus"]` · `["avistamentos", id]` · `["conteudo","primeiros-socorros", tipoAnimal]`.

---

## 7. Padrões de UI

- Toda tela com dados remotos tem **carregando, erro (com "Tentar novamente") e vazio**.
- **Nenhum botão ou tela sem efeito real.** "Em breve" não existe; uma tela só entra no passo em que funciona.
- **RN-G2:** o texto fixo "Procure atendimento médico imediatamente." (`AvisoAtendimento`) aparece no resultado (T4), nos primeiros socorros (T5) e na ocorrência (T12).
- **RN-G3:** em `EMERGENCIA`, o `BotaoLigar192` fica **no topo**, antes de tudo. Nos outros níveis, no fim da tela.
- **Nunca** mostrar "sem urgência", "não é perigoso", dose ou remédio.
- **Acessibilidade:** alvo de toque com 48 dp ou mais, `accessibilityLabel` em todo botão com ícone, contraste alto.
- Segurança de área no topo: padding fixo nos cabeçalhos (`pt-14`), como no Afetto.

---

## 8. Formulários

- `useForm` + `zodResolver` + schema em `src/schemas/`. Campos com `CampoTexto`/`CampoSelecao`; envio com `BotaoEnviar`.
- O botão usa o `isPending` do `useMutation` (nunca o `isSubmitting`).
- **Erros da API** (`src/api/erros.ts`): no 400, `errosDeCampoDaApi(erro)` dá `campo → mensagem` para o `setError` de cada campo; o resto vai para `setError("root", { message: mensagemDaApi(erro) })`. Nunca silenciar um erro.
- Telefone: máscara na tela (`utils/mascaras.ts`), só os dígitos na API — a conversão fica no service.
- Datas: a API usa ISO-8601 UTC (`toISOString()`); a tela mostra DD/MM/AAAA HH:mm. A conversão fica em `utils/data.ts`/service, nunca na tela.

---

## 9. Autenticação e Sessão (Passo 2)

- **JWT** no cabeçalho `Authorization: Bearer` (`POST /api/auth/login` e `/api/auth/cadastro` devolvem `{ token, tipo, expiraEmSegundos, usuario }`). Não há refresh token no MVP.
- `SessaoContext` é a **única** fonte de verdade da sessão: token e usuário no AsyncStorage (`@antidoto:token`, `@antidoto:usuario`), com `entrar()` e `sair()`.
- **401 numa rota logada** ⇒ `sair()` e login. **No login**, o 401 é só a mensagem "E-mail ou senha incorretos".
- **Logout** limpa o AsyncStorage e faz `queryClient.clear()`.
- `RotaProtegida` nos layouts de `(tabs)` e `(app)`. A pasta `sos/` **não** é protegida (RN-G1).

---

## 10. Navegação

- Toda navegação pelo `expo-router` (`router.push`, `router.replace`, `router.back`, `<Redirect>`).
- Os grupos `(auth)`, `(tabs)` e `(app)` **não** aparecem na URL: `(auth)/login.tsx` é `/login`. A pasta `sos/` **aparece**: `/sos/triagem`.
- **Rotas tipadas, sempre em forma de objeto:** `router.push({ pathname: "/sos/resultado", params: { tipoAnimal, faixaEtaria, sintomas: sintomas.join(","), horaPicada } })`. Nunca template literal + `as any`.
- As definições das rotas ficam em `.expo/types/router.d.ts` (fora do Git), geradas pelo `npx expo start`: rode-o uma vez antes do `npx tsc --noEmit` num clone novo.

---

## 11. Convenções de Nomenclatura

| Tipo                   | Convenção                        | Exemplo                                             |
| ---------------------- | -------------------------------- | --------------------------------------------------- |
| Arquivos de página     | kebab-case português             | `primeiros-socorros/[tipoAnimal].tsx`               |
| ⚠️ Exceção             | nomes reservados do Expo Router  | `_layout.tsx`, `+not-found.tsx`                     |
| Arquivos de componente | PascalCase português             | `CartaoUnidade.tsx`                                 |
| Arquivos de hook       | camelCase com `use`              | `useAvistamentos.ts`                                |
| Arquivos de service    | kebab-case singular + `.service` | `avistamento.service.ts`, `autenticacao.service.ts` |
| Arquivos de schema     | kebab-case + `.schema`           | `avistamento.schema.ts`                             |
| Arquivos de types      | kebab-case + `.types`            | `enums.types.ts`                                    |
| Funções e variáveis    | camelCase português              | `definirUrlDaApi`, `ehSintomaDeAlerta`              |
| Tipos                  | PascalCase português             | `TipoAnimal`, `VersaoDoApp`                         |
| Listas de enum         | MAIÚSCULAS no plural             | `TIPOS_ANIMAL`, `SINTOMAS`                          |
| Rótulos de enum        | `LABEL_` + nome                  | `LABEL_TIPO_ANIMAL`, `LABEL_SINTOMA`                |

---

## 12. Regras do Domínio (resumo — a fonte é o `docs/MVP-00-LEIA-ME.md`)

- **Enums:** os valores trafegam em MAIÚSCULAS, exatamente como no contrato (`types/enums.types.ts`); a tela mostra os rótulos de `utils/rotulos.ts`.
- **Sintomas (§4.2):** 12 códigos; 8 são sinais de alerta (`SINTOMAS_DE_ALERTA`). Teste: `rotulos.test.ts`.
- **RN-U (§4.3), Passo 3:** `utils/urgencia.ts` calcula a urgência **no app**, sem internet. Os **10 casos** do §4.3 são obrigatórios em `urgencia.test.ts`, os mesmos do JUnit do Java. **Não mudar a regra sem combinar com o Java.** Se a urgência do servidor for maior, vale a do servidor (nunca rebaixar).
- **RN-S (§4.4):** compatibilidade e ordenação das unidades são do Java. O app só mostra; a lista vazia é válida e mostra "Nenhuma unidade com soro encontrada. Ligue 192." (RN-S4).
- **RN-G1 a RN-G8 (§4.5):** SOS sem login; texto fixo no resultado; 192 no topo em `EMERGENCIA`; hora da picada sem futuro e até 72 h; avistamento só do dono; resumo por IA sem dados pessoais e com o aviso "Resumo gerado por IA. Não substitui avaliação profissional."; telefones úteis 192, 193 e 0800 722 6001.
- Implementações e testes de uma regra citam o ID dela em comentário (ex.: `// RN-U2`).

---

## 13. Sobre o App e versão (tela no Passo 7)

- **O hash nunca é escrito à mão.** O `app.config.ts` descobre o commit quando o Expo lê a configuração e coloca em `extra.commitHash`, `extra.commitData` e `extra.commitComAlteracoes`; o app lê de `Constants.expoConfig.extra` via `utils/versao.ts`.
- **De onde vem:** no build do EAS (o APK do Firebase), de `EAS_BUILD_GIT_COMMIT_HASH`; no computador, do `git rev-parse HEAD`. Sem git, "não informado".
- **Depois de um commit novo, reinicie o `npx expo start`** — o Expo só lê o `app.config.ts` quando inicia.
- Para conferir sem abrir o app: `npx expo config --type public` mostra o `extra` com o hash.
- **Pacote Android:** `br.fiap.mad.antidoto` (padrão do professor). Ele trava no primeiro registro no Firebase (Passo 8); até lá, pode mudar.

---

## 14. O Que Nunca Fazer

- Chamar HTTP dentro de uma página.
- Usar `StyleSheet.create` (fora do reanimated) ou `#hex` em `style`; usar classe de cor sem confirmar que ela existe.
- Criar um segundo context de sessão.
- Usar `any` sem justificativa em comentário; usar `as any` em rota.
- Instalar biblioteca nova sem combinar com o time (no MVP, só `expo-location`).
- Colocar chave de API ou senha no app.
- Criar rota, campo ou enum fora do `docs/api/openapi-mvp.yaml` — se faltar algo, combinar com o Java antes.
- Deixar botão, tela ou texto "Em breve" sem efeito real.
- Mostrar "sem urgência", "não é perigoso", dose ou remédio.
- Commitar com `tsc`, lint ou testes falhando.

---

## 15. Checklist Antes de Todo Commit

```
[ ] npx tsc --noEmit sem erros
[ ] npm run lint sem erros (inclui o Prettier)
[ ] npm test passando
[ ] Nenhum StyleSheet.create novo, nenhuma cor em style, nenhuma classe inexistente
[ ] Nenhum HTTP direto em página; useQueryClient() em vez do queryClient importado
[ ] Componentes existentes reutilizados; nenhum import sem uso
[ ] Formulários com useForm + zodResolver; isPending no botão; erro da API na tela
[ ] Estados de carregando, erro e vazio nas telas com dados remotos
[ ] Nomes em português; rotas tipadas sem as any
```

---

## Ajustes em relação ao MVP-02 (decididos pelo time em 06 e 07/11)

| No MVP-02                                                       | No código (como no Afetto)                                                                     |
| --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `(tabs)` dentro de `(app)`                                      | `(tabs)` na raiz, com a `RotaProtegida` no layout dela                                         |
| Início em `(tabs)/inicio.tsx`                                   | `(tabs)/index.tsx`                                                                             |
| `api/cliente.ts`                                                | `api/api.ts`                                                                                   |
| `auth.service.ts`, `usuarios.service.ts`, services no plural    | `autenticacao.service.ts` e services no singular (`unidade`, `ocorrencia`, `avistamento`)      |
| `useLogin`, `useCadastro`                                       | `useEntrar`, `useCadastrar` (em `useAutenticacao.ts`)                                          |
| `useUsuarioLogado`, `useAtualizarUsuario`                       | mesmos nomes, em `usePerfil.ts`                                                                |
| `utils/datas.ts`                                                | `utils/data.ts`                                                                                |
| `types/enums.ts`, `usuario.ts`…                                 | `types/*.types.ts`                                                                             |
| `EstadoVazio`, `EstadoErro`, `RotaProtegida` em `components/ui` | na raiz de `components/`                                                                       |
| `rotuloTipoAnimal()` etc.                                       | constantes `LABEL_*` (como o `LABEL_ESPECIE` do Afetto); `ehSintomaDeAlerta()` continua função |
| `extrairMensagemErro`, `extrairErrosDeCampo`                    | `mensagemDaApi`, `errosDeCampoDaApi` (nomes do `erros.ts` do Afetto)                           |
| Hash por `EXPO_PUBLIC_COMMIT_HASH` definido no terminal         | `app.config.ts` lendo `EAS_BUILD_GIT_COMMIT_HASH` (ou o git)                                   |
| Fonte padrão do sistema                                         | Inter em `assets/fonts` (a rubrica pede fontes personalizadas)                                 |
| Nome "SOS Peçonha" (`sos-peconha-app`, `@sospeconha:token`)     | **Antídoto** (`antidoto-app`, `@antidoto:token`, `@antidoto:usuario`) — decisão de 07/11       |

---

_Antídoto — Global Solution 2026/2 · FIAP_
_React Native + Expo + TypeScript + NativeWind + TanStack Query_
