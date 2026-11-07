# MVP — App Mobile (`sos-peconha-app`)

> **Leia junto:** `MVP-00-LEIA-ME.md` (regras RN-U, RN-S, RN-G, enums e sintomas) e `api/openapi-mvp.yaml` (o contrato com o Java).
> **O app consome só a API Java.** Nada de .NET.
> **Nenhuma rota, campo ou enum fora do `openapi-mvp.yaml`.** Se faltar algo, combinar com o Java antes.
>
> **Padrão do projeto:** o mesmo do Challenge Afetto (`front-end-afetto`): mesma stack, mesmas pastas e camadas, mesmos nomes.
> Este documento só aplica esse padrão ao SOS Peçonha. **Não inventar convenção nova.**

---

## 1. Stack (igual à do Afetto)
Expo + React Native + **TypeScript** · **expo-router** (rotas por arquivo, `typedRoutes`) · **NativeWind** (Tailwind via `className`) ·
**TanStack Query** · **axios** · **react-hook-form + zod** · **AsyncStorage** · **Ionicons** (`@expo/vector-icons`) · **jest-expo + Testing Library**.

**Bibliotecas novas (combinar com o time antes de instalar):**
| Lib | Por quê | Alternativa sem lib |
|---|---|---|
| `expo-location` | Pegar o GPS para buscar as unidades próximas e salvar o local do avistamento | Nenhuma boa; o recurso depende dela |

Ligar e abrir a rota usam o `Linking` do próprio React Native (`tel:` e link do Google Maps), **sem lib nova**.
A versão do app vem do `expo-constants` (já faz parte do Expo).

---

## 2. Telas e rotas

```
src/app/
├── _layout.tsx                       (providers: QueryClient, SessaoContext; Stack raiz)
├── (auth)/                           pré-login
│   ├── _layout.tsx
│   ├── login.tsx                     [T1] login + botão grande "SOS — Fui picado"
│   └── cadastro.tsx                  [T2]
├── sos/                              PÚBLICO (funciona logado ou não — RN-G1)
│   ├── _layout.tsx
│   ├── triagem.tsx                   [T3] 3 passos
│   ├── resultado.tsx                 [T4] urgência + 192 + unidades próximas
│   └── primeiros-socorros/[tipoAnimal].tsx   [T5]
└── (app)/                            pós-login (RotaProtegida) em Stack
    ├── _layout.tsx
    ├── (tabs)/
    │   ├── _layout.tsx               abas: Início · Avistamentos · Ocorrências · Perfil
    │   ├── inicio.tsx                [T6] botão SOS + atalhos
    │   ├── avistamentos.tsx          [T7] lista (Read + Delete)
    │   ├── ocorrencias.tsx           [T8] histórico
    │   └── perfil.tsx                [T9] dados, editar, sair, "Sobre o app"
    ├── avistamentos/
    │   ├── novo.tsx                  [T10] Create
    │   └── [id].tsx                  [T11] Update
    ├── ocorrencias/[id].tsx          [T12] detalhe + resumo por IA (consulta a cada 3 s)
    └── sobre.tsx                     [T13] versão + hash do commit (não conta nas 6 telas)
```

> ⚠️ **Ponto a combinar:** no Afetto só existem os grupos `(auth)` e `(app)`. Aqui o SOS precisa ser acessível **sem login e com login**,
> então ele fica em `sos/`, fora dos dois grupos e sem `RotaProtegida`. É a única diferença de estrutura em relação ao Afetto.

**Navegação:** sempre rotas tipadas em forma de objeto, por exemplo
`router.push({ pathname: "/sos/resultado", params: { tipoAnimal, faixaEtaria, sintomas: sintomas.join(","), horaPicada } })`. Nunca `as any`.

---

## 3. Fluxos

### 3.1 SOS (sem login)
1. **T1 ou T6** → botão "SOS — Fui picado" → **T3 Triagem**.
2. **Passo 1 — Animal:** `SeletorAnimal` (ícones grandes: Escorpião, Cobra, Aranha, Lagarta/Taturana, Abelha/Vespa, Não sei).
3. **Passo 2 — Quem foi picado e quando:** `SeletorFaixaEtaria` (Criança 0–9 · Adulto 10–59 · Idoso 60+) e a hora em opções fixas:
   "Agora", "Há 1 hora", "Há 2 horas", "Há 3 horas ou mais" (convertidas para ISO no `useTriagem`, **sem date picker**).
4. **Passo 3 — Sintomas:** `ListaSintomas` (os 12 do `MVP-00` §4.2; os sinais de alerta aparecem com um ícone de aviso). Pode não marcar nenhum.
5. "Ver resultado" → **T4** com os params.
6. **T4 Resultado:**
   - Calcula **localmente** `calcularUrgencia(...)` (`utils/urgencia.ts`, **RN-U**): funciona sem internet.
   - Se `EMERGENCIA` ⇒ `BotaoLigar192` **no topo** (RN-G3).
   - `SeloUrgencia` + motivos + `AvisoAtendimento` ("Procure atendimento médico imediatamente.", RN-G2).
   - Pega o GPS (`useLocalizacao`) → `useUnidadesProximas({ latitude, longitude, tipoAnimal })` → lista de `CartaoUnidade` (nome, distância, soros compatíveis, botões **Ligar** e **Rota**).
     - Carregando ⇒ indicador. Erro ⇒ `EstadoErro` com "Tentar novamente" **e** o 192 continua visível. Lista vazia ⇒ "Nenhuma unidade com soro encontrada. Ligue 192." (RN-S4).
     - GPS negado ⇒ mensagem "Ative a localização para ver as unidades próximas" + "Tentar novamente".
   - Botão **"Primeiros socorros"** → **T5**.
   - Botão **"Registrar ocorrência"**: logado ⇒ ação do §3.2; deslogado ⇒ "Entre para salvar a ocorrência" → **T1**.
7. **T5 Primeiros socorros:** conteúdo local do §6 ("Faça" / "NÃO faça" / atenção), sempre com o 192 e o Disque-Intoxicação.

### 3.2 Registrar ocorrência (logado)
1. No **T4**, em cada `CartaoUnidade` aparece "Vou para esta unidade". Ao tocar: `useCriarOcorrencia` → `POST /api/ocorrencias` com `unidadeId`.
2. `onSuccess` (na tela) → `router.replace({ pathname: "/(app)/ocorrencias/[id]", params: { id } })`.
3. **T12:** `useOcorrencia(id)` com `refetchInterval: statusResumo === "PENDENTE" ? 3000 : false`.
   - `PENDENTE` ⇒ "Gerando resumo para a unidade…".
   - `PRONTO`/`MODELO_PADRAO` ⇒ mostra o `resumo` em um cartão grande ("Mostre este resumo na recepção") + o `avisoResumo` (RN-G7).
   - Se a urgência do servidor for **maior** que a calculada no app, vale a do servidor (**nunca rebaixar**).

### 3.3 Avistamentos (CRUD com a API — critério de 30 pts)
- **T7 Lista:** `useMeusAvistamentos` → `CartaoAvistamento` (animal, local, data DD/MM/AAAA HH:mm, observação). Excluir com confirmação → `useExcluirAvistamento` (invalida a lista). Estados: carregando / erro / vazio ("Você ainda não registrou avistamentos").
- **T10 Novo:** formulário (`useForm` + `zodResolver(avistamentoSchema)`): tipo de animal, local (`CampoSelecao`), observação (`CampoTexto`), botão "Usar minha localização" (obrigatório). `dataHora` = agora. `BotaoEnviar` com o `isPending`; erro da API em `setError("root")`.
- **T11 Editar:** carrega com `useAvistamento(id)` e salva com `useAtualizarAvistamento` (mantém a `dataHora` original).
- Somente o dono vê os seus avistamentos (o back garante; um 404 vira `EstadoErro`).

### 3.4 Auth
- **T2 Cadastro:** nome, e-mail, senha (mín. 8, letra e número), telefone opcional (máscara de `utils/mascaras.ts`; enviar só os dígitos). Sucesso ⇒ salva a sessão ⇒ Início.
- **T1 Login:** e-mail e senha. 401 ⇒ "E-mail ou senha incorretos".
- **Logout (T9):** limpa a sessão (AsyncStorage + `queryClient.clear()`) ⇒ Login.
- `RotaProtegida` no `(app)/_layout.tsx`: sem sessão ⇒ redireciona para o login.

---

## 4. Camadas (padrão Afetto)

```
src/
├── api/
│   ├── cliente.ts         axios (baseURL = EXPO_PUBLIC_API_URL); interceptor adiciona o Bearer; 401 dispara o logout
│   ├── erros.ts           extrairMensagemErro(erro) e extrairErrosDeCampo(erro) a partir do formato { mensagem, campos[] }
│   ├── paginacao.ts       tipo Pagina<T> = { conteudo, pagina, tamanho, totalElementos, totalPaginas }
│   └── queryClient.ts
├── context/
│   └── SessaoContext.tsx  token + usuário (AsyncStorage: @sospeconha:token, @sospeconha:usuario); entrar(), sair()
├── services/
│   ├── auth.service.ts           authService.login / .cadastrar
│   ├── usuarios.service.ts       usuariosService.buscarMe / .atualizarMe
│   ├── unidades.service.ts       unidadesService.buscarProximas
│   ├── ocorrencias.service.ts    ocorrenciasService.criar / .buscarPorId / .listarMinhas / .excluir
│   ├── avistamentos.service.ts   avistamentosService.criar / .listarMeus / .buscarPorId / .atualizar / .excluir
│   └── conteudo.service.ts       conteudoService.buscarPrimeirosSocorros(tipoAnimal) — dados LOCAIS (§6)*
├── hooks/
│   ├── dados:  useLogin, useCadastro, useUsuarioLogado, useAtualizarUsuario, useUnidadesProximas,
│   │           useCriarOcorrencia, useOcorrencia, useMinhasOcorrencias, useExcluirOcorrencia,
│   │           useMeusAvistamentos, useAvistamento, useCriarAvistamento, useAtualizarAvistamento,
│   │           useExcluirAvistamento, usePrimeirosSocorros
│   └── tela:   useTriagem (passo atual, seleções, validação, montagem dos params), useLocalizacao (permissão + coordenadas)
├── schemas/
│   ├── login.schema.ts · cadastro.schema.ts · perfil.schema.ts · avistamento.schema.ts · triagem.schema.ts
├── types/
│   ├── enums.ts            TipoAnimal, FaixaEtaria, Urgencia, TipoSoro, TipoUnidade, LocalAvistamento, StatusResumo, Perfil, Sintoma
│   ├── usuario.ts · unidade.ts · ocorrencia.ts · avistamento.ts   (iguais aos schemas do YAML)
├── utils/
│   ├── urgencia.ts         calcularUrgencia() — pura, RN-U
│   ├── rotulos.ts          rotuloTipoAnimal(), rotuloSintoma(), rotuloUrgencia(), rotuloSoro(), rotuloLocal(), ehSintomaDeAlerta()
│   ├── datas.ts            formatarDataHora(iso) → "DD/MM/AAAA HH:mm"; tempoDecorrido(iso) → "há 25 min"; horaPorOpcao(opcao, agora) → ISO
│   ├── mascaras.ts         telefone
│   └── links.ts            linkLigar(telefone) → "tel:…"; linkRota(lat, lng) → URL do Google Maps
├── components/
│   ├── ui/                 CampoTexto, CampoSelecao, BotaoEnviar, TelaFormulario, EstadoVazio, EstadoErro, RotaProtegida (os mesmos do Afetto)
│   ├── sos/                BotaoSos, SeletorAnimal, SeletorFaixaEtaria, ListaSintomas, SeloUrgencia, BotaoLigar192, AvisoAtendimento, CartaoUnidade
│   ├── avistamentos/       CartaoAvistamento
│   └── ocorrencias/        CartaoOcorrencia, CartaoResumo
└── __tests__/
```
\* **Ponto a combinar:** o conteúdo de primeiros socorros é local (não vem da API). Ele fica no `conteudo.service.ts`, que devolve uma `Promise`,
para o hook seguir o padrão `useQuery` e a origem poder virar API depois sem mexer nas telas.

**Regras das camadas (do Afetto):**
- Página só monta o layout e o estado local de UI; **nunca chama HTTP direto**: lê por `useQuery` e escreve por `useMutation`, via hooks.
- Hook de dados só usa `useQuery`/`useMutation` chamando o service; a invalidação fica dentro do hook (`useQueryClient()`); **hook não tem JSX nem navega** (a navegação fica no `onSuccess` da tela).
- Service: chamadas HTTP e conversão do payload (máscara, data, lista paginada). Comentar todo contorno de limitação da API.
- Schemas só em Zod, exportando o tipo inferido. Utils só funções puras, com teste.
- Um único `SessaoContext`.

**Chaves do TanStack Query:**
| Chave | Invalidada por |
|---|---|
| `["usuario","me"]` | `useAtualizarUsuario` |
| `["unidades","proximas", latitude, longitude, tipoAnimal]` | — (`staleTime` de 5 min) |
| `["ocorrencias","minhas"]` | `useCriarOcorrencia`, `useExcluirOcorrencia` |
| `["ocorrencias", id]` | — (refaz a consulta enquanto estiver PENDENTE) |
| `["avistamentos","meus"]` | criar / atualizar / excluir avistamento |
| `["avistamentos", id]` | `useAtualizarAvistamento` |
| `["conteudo","primeiros-socorros", tipoAnimal]` | — (`staleTime: Infinity`) |

---

## 5. Regras do front

### 5.1 Integração com a API
- `EXPO_PUBLIC_API_URL` no `.env` (ex.: `http://192.168.0.10:8080` local; a URL da Azure na build publicada). **Nenhuma chave de API no app.**
- Timeout do axios: 10 s.
- **Erros:** o back responde `{ status, erro, mensagem, campos[] }`. Em 400, mapear `campos[].campo` para os campos do formulário (`setError`) e o resto para `setError("root")`. Nos demais, mostrar a `mensagem`. Erro de rede ⇒ "Sem conexão. Tente novamente."
- **401 em rota logada** ⇒ `sair()` + Login. (No login, o 401 é só uma mensagem de credenciais.)
- Datas: enviar `toISOString()`; exibir DD/MM/AAAA HH:mm (conversão no service/utils).
- Telefone: tela com máscara; API só com os dígitos (conversão no service).
- Os enums trafegam em MAIÚSCULAS; a tela mostra os rótulos de `utils/rotulos.ts`.

### 5.2 Regras de tela
- Toda tela com dados remotos tem **carregando, erro (com "Tentar novamente") e vazio**.
- **Nenhum botão ou tela sem efeito real** ("Em breve" não existe).
- **RN-G2:** `AvisoAtendimento` em T4, T5 e T12.
- **RN-G3:** `BotaoLigar192` no topo quando for `EMERGENCIA`. Nos demais casos, o 192 aparece no fim da tela.
- **Nunca** mostrar textos como "sem urgência", "não é perigoso" ou dose/remédio.
- O SOS **não pode depender** da internet para mostrar a urgência e os primeiros socorros.
- Acessibilidade: alvos de toque ≥ 48 dp, `accessibilityLabel` em botões com ícone, contraste alto, urgência sempre com **texto + ícone** (nunca só cor).

### 5.3 `utils/urgencia.ts` (RN-U do `MVP-00` §4.3)
```ts
import { FaixaEtaria, Sintoma, TipoAnimal, Urgencia } from "@/types/enums";
import { ehSintomaDeAlerta } from "@/utils/rotulos";

const ORDEM: Urgencia[] = ["MODERADA", "ALTA", "EMERGENCIA"];
const maior = (a: Urgencia, b: Urgencia): Urgencia => (ORDEM.indexOf(a) >= ORDEM.indexOf(b) ? a : b);

export interface ResultadoUrgencia { urgencia: Urgencia; motivos: string[]; ligar192: boolean }

export function calcularUrgencia(
  tipoAnimal: TipoAnimal, faixaEtaria: FaixaEtaria, sintomas: Sintoma[], horaPicada: Date, agora: Date,
): ResultadoUrgencia {
  let urgencia: Urgencia = "MODERADA";
  const motivos: string[] = [];
  const subir = (nivel: Urgencia, motivo: string) => { urgencia = maior(urgencia, nivel); if (!motivos.includes(motivo)) motivos.push(motivo); };

  if (sintomas.some(ehSintomaDeAlerta)) subir("EMERGENCIA", "Sinal de alerta");
  if (tipoAnimal === "ESCORPIAO" && faixaEtaria === "CRIANCA") subir("EMERGENCIA", "Escorpião em criança");
  if (["SERPENTE", "ARANHA", "LAGARTA", "NAO_SEI"].includes(tipoAnimal)) subir("ALTA", "Animal com risco de agravamento");
  if (faixaEtaria === "CRIANCA" || faixaEtaria === "IDOSO") subir("ALTA", "Criança ou idoso");

  const horas = (agora.getTime() - horaPicada.getTime()) / 3_600_000;
  if (horas >= 3 && urgencia !== "EMERGENCIA") {
    urgencia = ORDEM[ORDEM.indexOf(urgencia) + 1];
    motivos.push("Mais de 3 horas desde a picada");
  }
  if (motivos.length === 0) motivos.push("Avaliação necessária");
  return { urgencia, motivos, ligar192: urgencia === "EMERGENCIA" };
}
```
O teste `__tests__/urgencia.test.ts` precisa cobrir os **10 casos** do `MVP-00` §4.3 (os mesmos do JUnit do Java).

---

## 6. Conteúdo local de primeiros socorros (`conteudo.service.ts`)
> ⚠️ Revisar com o material do Ministério da Saúde antes da apresentação. **Sem dose, remédio ou tratamento.**

**Para todos os animais**
- **Faça:** afaste-se do animal; lave o local com água e sabão; mantenha a vítima em repouso; tire anéis, pulseiras e calçados apertados; vá **já** para a unidade indicada.
- **NÃO faça:** ❌ amarrar ou fazer torniquete · ❌ cortar, furar ou espremer · ❌ sugar o veneno · ❌ colocar folhas, pó de café, terra, álcool ou qualquer outra coisa · ❌ dar bebida alcoólica ou remédio caseiro · ❌ esperar os sintomas aparecerem.
- **Não tente capturar o animal.** Se for seguro, tire uma foto de longe.

| TipoAnimal | Atenção específica |
|---|---|
| `ESCORPIAO` | Compressa morna pode aliviar a dor no caminho. Crianças e idosos podem piorar rápido. Prevenção: sacudir roupas, toalhas e calçados; vedar ralos; não acumular entulho. |
| `SERPENTE` | Mantenha o membro picado parado e a vítima deitada, se possível. Pálpebras caídas, visão turva ou sangramento = emergência. Prevenção: botas e luvas no trabalho rural; não pôr a mão em buracos. |
| `ARANHA` | A aranha-marrom quase não dói, mas a lesão aparece horas depois: vá mesmo sem dor. A armadeira causa dor forte na hora. |
| `LAGARTA` | Lave com água fria e faça compressas frias. A taturana pode causar sangramento horas depois: procure atendimento. |
| `ABELHA` | Tire os ferrões **raspando** com um cartão (sem pinça). Muitas picadas, inchaço no rosto/garganta ou alergia = ligue 192. |
| `NAO_SEI` | Siga as orientações gerais e vá à unidade indicada. |

Telefones (RN-G8): SAMU **192** · Bombeiros **193** · Disque-Intoxicação **0800 722 6001**.

---

## 7. Identidade visual (tokens no `tailwind.config.js`; nunca `#hex` no `style`)
| Token (`colors`) | Valor | Uso |
|---|---|---|
| `marca` / `marca-claro` | `#1B5E20` / `#4C8C4A` | Barra, botões principais |
| `emergencia` | `#C62828` | **Só** o botão SOS, o selo EMERGENCIA e o 192 |
| `alta` | `#EF6C00` | Selo ALTA |
| `moderada` | `#F9A825` | Selo MODERADA |
| `fundo` / `fundo-escuro` | `#FFF8E1` / `#121212` | Fundo claro / `dark:` |
| `texto` / `texto-escuro` | `#263238` / `#ECEFF1` | Texto |

- Fonte padrão do sistema; títulos ≥ 22, corpo ≥ 16.
- `BotaoSos`: circular, ≥ 120 dp, vermelho `emergencia`, ícone `alert-circle` (Ionicons), texto "SOS — Fui picado".
- Ícones dos animais: Ionicons ou ilustrações próprias (**nada** de imagens de terceiros sem licença).
- Sempre `className` (NativeWind); conferir que a classe existe no config.

---

## 8. Requisitos da disciplina de Mobile (checklist)
| Requisito | Pts | Como atende |
|---|---|---|
| ≥ 6 telas + navegação (expo-router) | 10 | T1–T12 (12 telas; a T13 "Sobre" não conta) |
| CRUD com a API Java (axios) | 30 | Avistamentos: T10 (C), T7 (R/D), T11 (U); loaders, erros e feedback |
| Autenticação (cadastro, login real, logout, rotas protegidas) | 20 | T1, T2, T9 + `RotaProtegida` |
| Estilização com identidade visual | 5 | §7 |
| Arquitetura do código | 20 | §4 + ESLint/Prettier + `tsc --noEmit` limpo |
| Vídeo ≤ 5 min | 10 | Roteiro: SOS sem login → resultado → unidades → login → registrar ocorrência → resumo → CRUD de avistamentos → logout |
| Publicação no Firebase App Distribution + "Sobre" com o hash do commit | 5 | §9 |

**O que tira pontos:** um histórico de Git confuso (**−50**: commits pequenos, sequenciais e claros); não colocar o e-mail do professor no GitHub (−20); sem README (−10); app publicado diferente do código (−20); **o backend precisa estar no ar durante a avaliação.**

---

## 9. Publicação e tela "Sobre"
- **T13 Sobre:** nome, versão (`Constants.expoConfig?.version`), **hash do commit** (`process.env.EXPO_PUBLIC_COMMIT_HASH`), integrantes, aviso de dados fictícios.
- Na build, definir `EXPO_PUBLIC_COMMIT_HASH=$(git rev-parse --short HEAD)` e gerar o APK (ex.: EAS com o perfil `preview`, que gera `.apk`).
- Enviar o APK ao **Firebase App Distribution** e adicionar o e-mail do professor como tester. A versão publicada tem que ser **exatamente** a do commit exibido.

---

## 10. Como desenvolver antes do Java ficar pronto
```bash
npx @stoplight/prism-cli mock api/openapi-mvp.yaml        # API falsa na porta 4010, respondendo pelo contrato
# .env → EXPO_PUBLIC_API_URL=http://<ip-da-sua-máquina>:4010
```
Quando o Java subir, basta trocar o `EXPO_PUBLIC_API_URL`.

---

## 11. Testes (jest-expo)
- `__tests__/urgencia.test.ts`: os 10 casos da RN-U.
- `__tests__/datas.test.ts`: `formatarDataHora`, `tempoDecorrido` e `horaPorOpcao` (com uma data fixa).
- `__tests__/rotulos.test.ts`: `ehSintomaDeAlerta` para os 12 sintomas.
- `__tests__/avistamento.schema.test.ts`: válido; sem localização; observação com mais de 500 caracteres.
- `__tests__/SeloUrgencia.test.tsx`: renderiza o texto e o ícone para cada nível.

Antes de cada commit: `npx tsc --noEmit` sem erros + testes passando.

---

## 12. Ordem sugerida (uma feature por vez)
1. Projeto base (copiar do Afetto a config, `api/`, `components/ui`, `SessaoContext`, tokens de cor) + Prism.
2. Login, cadastro, `RotaProtegida`, abas e logout.
3. Triagem + `calcularUrgencia` + testes + resultado (sem unidades).
4. `useLocalizacao` + unidades próximas + Ligar/Rota + primeiros socorros.
5. CRUD de avistamentos.
6. Registrar ocorrência + tela de resumo com consulta periódica + histórico.
7. Perfil (editar) + Sobre.
8. Trocar o Prism pela API na nuvem, publicar no Firebase, gravar o vídeo.
