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
  3. (Logado) Registrar, atualizar (sintomas e unidade) e remover a ocorrência; o Java recalcula a urgência e gera um resumo de pré-atendimento com IA (assíncrono).
  4. (Logado) CRUD de avistamentos de animais peçonhentos.
- **Princípio inegociável:** o app **nunca** diz que a pessoa não precisa de atendimento e **nunca** indica dose ou remédio.
- **Fora do MVP** (só no pitch): refresh token, contatos de emergência, foto com IA no app, mapa de risco, modo offline completo, SMS, IoT, integração com o .NET.

---

## 2. Stack e Dependências

| Categoria         | Biblioteca                                                                                                                                                                                                                                                                                                                             |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Runtime/Framework | Expo `~54`, React Native `0.81`, React `19.1`, TypeScript                                                                                                                                                                                                                                                                              |
| Navegação         | `expo-router` `~6` (rotas por arquivo, `typedRoutes` no `app.json`)                                                                                                                                                                                                                                                                    |
| Estilização       | `nativewind` `^4` (Tailwind via `className`)                                                                                                                                                                                                                                                                                           |
| Formulários       | `react-hook-form` `^7` + `@hookform/resolvers/zod`                                                                                                                                                                                                                                                                                     |
| Validação         | `zod` `^4`                                                                                                                                                                                                                                                                                                                             |
| Data fetching     | `@tanstack/react-query` `^5`                                                                                                                                                                                                                                                                                                           |
| HTTP client       | `axios` `^1`                                                                                                                                                                                                                                                                                                                           |
| Sessão            | `@react-native-async-storage/async-storage` (token JWT e usuário)                                                                                                                                                                                                                                                                      |
| Ícones            | `@expo/vector-icons` — **só `Ionicons`** (fonte pré-carregada no `_layout.tsx` raiz). Os animais da triagem são emoji (`ICONE_TIPO_ANIMAL`), como as espécies do Afetto                                                                                                                                                                |
| Fonte             | **Inter** (`assets/fonts`, 3 pesos), carregada com `useFonts` do `expo-font` — sem biblioteca nova                                                                                                                                                                                                                                     |
| Assets            | `expo-asset`: vem com o Expo; declarado no `package.json` porque o `expo-font` o usa e o npm não o deixava na raiz do `node_modules` (o Jest não achava)                                                                                                                                                                               |
| Versão instalada  | `expo-application` — `nativeBuildVersion` na tela Sobre o App                                                                                                                                                                                                                                                                          |
| GPS               | `expo-location` `~19` — **única biblioteca nova** do MVP. A permissão é pedida só quando o resultado abre ou quando a pessoa toca em "Usar minha localização"; o texto dela fica no plugin do `app.json`                                                                                                                               |
| Testes            | `jest` + `jest-expo` + `@testing-library/react-native`. O `jest.setup.js` simula o `expo-router` (`router` com `dismissTo`, `<Redirect>`, `useLocalSearchParams`), a tela sempre em foco (`useFocusEffect` roda ao montar), o AsyncStorage em memória e as fontes já carregadas (sem isso, cada ícone novo gera o aviso de `act(...)`) |
| Lint/formatação   | ESLint (`eslint-config-expo`) + Prettier (`.prettierrc`: 100 colunas, aspas duplas, ponto e vírgula)                                                                                                                                                                                                                                   |

Ligar e abrir a rota usam o `Linking` do React Native (`tel:` e link do Google Maps), **sem biblioteca**.

**Endereço da API** (`definirUrlDaApi`, `src/api/api.ts`):

1. `EXPO_PUBLIC_API_URL` do `.env` (modelo em `.env.example`): o mock do contrato (Prism, porta 4010) ou a API Java no Render (`https://api-antidoto-integration.onrender.com`).
2. Sem `.env`: a API Java no computador que roda o Expo (`Constants.expoConfig.hostUri`), porta **8080**. No navegador, o mesmo endereço da página.
3. Sem esse dado: `http://localhost:8080`.

- **Tempo limite:** 10 s (`TEMPO_LIMITE_API_MS`, MVP-02 §5.1).
- **Trocou o `.env`?** Rode `npx expo start --clear`: o Metro guarda o valor antigo do `EXPO_PUBLIC_API_URL` em cache.
- **Mock antes do Java:** `npx @stoplight/prism-cli mock -h 0.0.0.0 docs/api/openapi-mvp.yaml` e `EXPO_PUBLIC_API_URL=http://<ip do computador>:4010`. O `-h 0.0.0.0` deixa o celular alcançar o mock.
- **Build do celular:** o `.env` não sobe para o EAS (está no `.gitignore`). O `eas.json` (perfil `preview`, igual ao do Afetto: APK, distribuição interna, versão remota com `autoIncrement`) leva o `EXPO_PUBLIC_API_URL` do Render e o `EXPO_PUBLIC_APP_ENV`. O `app.config.ts` (`conferirApiDoBuild`) para o build do EAS que não tiver `EXPO_PUBLIC_API_URL` com `https://`.
- **API no Render (plano grátis):** dorme sem uso e leva 1 a 2 minutos para acordar, mais que os 10 s do app. O monitor do UptimeRobot no `/actuator/health` a mantém acordada.
- **Nenhuma chave de API no app.** Só o endereço.

---

## 3. Estrutura de Pastas

```
src/
├── api/
│   ├── api.ts            ← instância do axios (baseURL via definirUrlDaApi, 10 s), Bearer do token da sessão e 401 → sessão expirada
│   ├── erros.ts          ← classificarErro / mensagemPorTipo / mensagemErroApi / mensagemDaApi / errosDeCampoDaApi / errosDaApiNoFormulario
│   ├── paginacao.ts      ← tipo Pagina<T> do contrato + extrairLista
│   └── queryClient.ts    ← instância do QueryClient (só importado no _layout.tsx raiz)
├── app/
│   ├── _layout.tsx       ← raiz: fontes (Ionicons + Inter), QueryClientProvider > SessaoProvider > Stack
│   ├── index.tsx         ← porta de entrada: lendo a sessão → carregando; com sessão → Início; sem sessão → /login
│   ├── (auth)/           ← login (T1: logo e botão SOS no topo), cadastro (T2). Com as respostas da triagem nos params ("Entre para salvar a ocorrência"), voltam ao resultado
│   ├── sos/              ← PÚBLICA, logado ou não (RN-G1): _layout, triagem (T3, 3 passos), resultado (T4: urgência no aparelho, primeiros socorros, unidades próximas e registrar a ocorrência), primeiros-socorros/[tipoAnimal] (T5, da API; sem internet, o aviso e o 192 continuam)
│   ├── (tabs)/           ← com <RotaProtegida>: index = Início (T6: SOS, atalho do avistamento, telefones úteis), avistamentos (T7: lista, editar, excluir), ocorrencias (T8: histórico), perfil (T9: dados, editar nome e telefone na própria tela, Sobre o App e Sair)
│   └── (app)/            ← com <RotaProtegida>, em Stack: avistamentos/novo (T10), avistamentos/[id] (T11), ocorrencias/[id]/index (T12: urgência, resumo e "Atualizar sintomas ou unidade"), ocorrencias/[id]/editar (T12b: sintomas e unidade, como o pet/[id]/editar do Afetto), sobre (T13: versão, build, commit, integrantes), alterar-senha (pelo cartão "Segurança" do Perfil)
├── components/
│   ├── ui/               ← CampoTexto, CampoSelecao (opções em botões; `colunas` 1, 2 ou 3; `descricao` na 2ª linha), BotaoEnviar, TelaFormulario (prop `topo`), ToastSucesso ("Salvo com sucesso!"; a tela controla quando some, com `TEMPO_DO_AVISO_MS`), CabecalhoAba (cabeçalho verde das 4 abas, com a barra de status clara)
│   ├── sos/              ← BotaoSos, SeletorAnimal, ListaSintomas, SeloUrgencia, BotaoLigar192, AvisoAtendimento (RN-G2), ResumoTriagem, UnidadesProximas (recebe a localização da tela; API e os estados), CartaoUnidade (Ligar, Rota e "Vou para esta unidade"), TelefonesUteis (RN-G8). SeloUrgencia tem a versão `compacto` (listas)
│   ├── ocorrencias/      ← RegistrarOcorrencia (T4: logado registra; deslogado "Entre para salvar a ocorrência"), CartaoOcorrencia (T8), CartaoResumo (T12: PENDENTE → gerando; pronto → cartão + RN-G7), FormOcorrencia (T12b: sintomas e a unidade, entre as próximas do lugar da picada)
│   ├── avistamentos/     ← CartaoAvistamento, FormAvistamento (campos do novo e do editar, como o FormPet do Afetto), CampoLocalizacao ("Usar minha localização")
│   ├── perfil/           ← só da tela Perfil: PerfilHeader (lápis e "Cancelar"), DadosPessoaisCard, FormDadosPessoais (nome e telefone; o e-mail só aparece), SegurancaCard ("Alterar senha", como no Afetto), SobreAppCard, ContaCard
│   ├── EstadoErro.tsx    ← erro com "Tentar novamente" (prop `icone`: a localização usa `location-outline`)
│   ├── EstadoVazio.tsx   ← lista vazia (ex.: RN-S4)
│   ├── LogoAntidoto.tsx  ← logo horizontal; versão de texto branco no tema escuro
│   └── RotaProtegida.tsx ← sem sessão → /login
├── context/
│   └── SessaoContext.tsx ← ÚNICA fonte de verdade da sessão (seção 9)
├── hooks/
│   ├── useAutenticacao.ts ← useEntrar, useCadastrar + CHAVE_USUARIO_LOGADO (["usuario","me"])
│   ├── usePerfil.ts       ← useUsuarioLogado, useAtualizarUsuario (a resposta vai para ["usuario","me"] e para a sessão salva), useAlterarSenha
│   ├── useTriagem.ts      ← hook de tela da T3: passo, respostas, validação por passo, concluir(agora) → params do resultado
│   ├── useLocalizacao.ts  ← hook de tela: permissão + GPS (estado parada/buscando/negada/indisponivel/pronta, podePedirDeNovo, buscar). `automatica: false` = só no toque do botão
│   ├── useUnidades.ts     ← useUnidadesProximas(coordenadas, tipoAnimal): só busca depois do GPS
│   ├── useConteudo.ts     ← usePrimeirosSocorros(tipoAnimal), staleTime Infinity
│   ├── useAvistamentos.ts ← useMeusAvistamentos, useAvistamento, useCriarAvistamento, useAtualizarAvistamento, useExcluirAvistamento (invalidam ["avistamentos","meus"])
│   └── useOcorrencias.ts  ← useMinhasOcorrencias, useOcorrencia (consulta a cada 3 s enquanto PENDENTE: intervaloDoResumo), useCriarOcorrencia, useAtualizarOcorrencia, useExcluirOcorrencia
├── schemas/              ← login, cadastro (+ CAMPOS_LOGIN / CAMPOS_CADASTRO), triagem (OPCOES_HORA_PICADA, um schema por passo, criarParamsResultadoSchema com a RN-G4, ParamsPrimeirosSocorrosSchema, RetornoAoResultadoSchema), avistamento (localização obrigatória e no Brasil, observação até 500, CAMPOS_AVISTAMENTO), editar-perfil (nome e telefone com as regras do cadastro, CAMPOS_EDITAR_PERFIL), editar-ocorrencia (sintomas e unidade, SEM_UNIDADE, CAMPOS_EDITAR_OCORRENCIA), alterar-senha (a nova com a regra do cadastro, repetida igual e diferente da atual; CAMPOS_ALTERAR_SENHA)
├── services/
│   ├── autenticacao.service.ts ← autenticacaoService.{entrar, cadastrar, buscarUsuarioLogado, atualizarUsuario (PUT /api/usuarios/me), alterarSenha (PUT /api/usuarios/me/senha), paraFormulario}
│   ├── unidade.service.ts      ← unidadeService.buscarProximas (GET /api/unidades/proximas, limite 5)
│   ├── conteudo.service.ts     ← conteudoService.buscarPrimeirosSocorros (GET /api/conteudo/primeiros-socorros/{tipoAnimal}, público; o texto fica no Java)
│   ├── avistamento.service.ts  ← avistamentoService.{listarMeus (até 50), buscarPorId, criar (dataHora = agora), atualizar (dataHora original), excluir, paraFormulario}
│   └── ocorrencia.service.ts   ← ocorrenciaService.{criar, listarMinhas (até 50), buscarPorId, atualizar (PUT: sintomas e unidade; o resto vem do registro), paraFormulario, excluir}
├── types/
│   ├── enums.types.ts    ← enums do contrato como listas `as const` + tipos (TipoAnimal, FaixaEtaria, Urgencia, TipoSoro, TipoUnidade, LocalAvistamento, StatusResumo, Perfil, Sintoma)
│   ├── usuario.types.ts  ← Usuario, RespostaAutenticacao
│   ├── unidade.types.ts  ← UnidadeProxima (schema do contrato), Coordenadas
│   ├── conteudo.types.ts ← PrimeirosSocorros (faca, naoFaca, atencao)
│   ├── avistamento.types.ts ← Avistamento, DadosAvistamento (schemas do contrato)
│   └── ocorrencia.types.ts  ← Ocorrencia, DadosOcorrencia (schemas do contrato)
├── utils/
│   ├── rotulos.ts        ← LABEL_* dos enums e da hora da picada, IDADE_FAIXA_ETARIA, ICONE_TIPO_ANIMAL (emoji), SINTOMAS_DE_ALERTA, ehSintomaDeAlerta, alternarSintoma (na ordem do MVP-00 §4.2; triagem e T12b)
│   ├── data.ts           ← converterDataParaBR, horaPorOpcao (opção da triagem → ISO), tempoDecorrido ("há 25 min"), formatarDataHora (ISO → "DD/MM/AAAA HH:mm" no fuso do aparelho)
│   ├── mascaras.ts       ← somenteDigitos, mascararTelefone
│   ├── telefones.ts      ← TELEFONES_UTEIS (RN-G8: 192, 193, 0800 722 6001)
│   ├── links.ts          ← linkLigar (tel:, só dígitos), linkRota (Google Maps pelas coordenadas)
│   ├── unidade.ts        ← formatarDistancia ("850 m", "2,4 km", como no Afetto)
│   ├── cabecalho.ts      ← opcoesCabecalhoNativo (cores da barra nativa do Stack nos dois temas)
│   ├── versao.ts         ← versaoDoApp (versão + commit de Constants.expoConfig.extra), buildDoApp (número do build e ambiente)
│   └── urgencia.ts       ← calcularUrgencia (RN-U, MVP-00 §4.3), no aparelho: funciona sem internet; maiorUrgencia (app × servidor); urgenciaDaOcorrencia (T12)
├── testes/
│   └── clienteDeTeste.ts ← QueryClient dos testes (sem retry e sem o timer de limpeza do cache)
├── __tests__/            ← um arquivo por regra ou tela
└── global.css            ← @tailwind base/components/utilities
assets/fonts/             ← Inter_400Regular, Inter_600SemiBold, Inter_700Bold (.ttf) + OFL.txt (licença)
assets/images/            ← PNGs do app (seção 4, "Identidade visual"): ícone, ícone adaptativo, símbolo (splash), logo claro e escuro
docs/                     ← pacote MVP (MVP-00, MVP-02) e o contrato docs/api/openapi-mvp.yaml — não editar sem combinar com o Java.
                            Eles ainda usam o nome antigo, "SOS Peçonha": o app se chama Antídoto
```

---

## 4. Regras de Estilização

- Use **sempre** `className` com NativeWind. Nunca `StyleSheet.create` (exceção: `useAnimatedStyle` do reanimated).
- Nunca passe cor via `style={{ color: "#hex" }}`. Sempre uma classe.
- **Antes de usar uma classe de cor, confirme que ela existe** no `tailwind.config.js` ou na paleta padrão do Tailwind. Classe inexistente não dá erro — a cor só não aparece.

**Tokens de cor** (`tailwind.config.js`): a paleta da identidade visual do Antídoto; as cores de urgência e os tons do tema escuro vêm do MVP-02 §7.

| Classe                                  | Hex                   | Origem           | Uso                                              |
| --------------------------------------- | --------------------- | ---------------- | ------------------------------------------------ |
| `bg-marca` / `text-marca`               | `#0B6E4F`             | Verde escuro     | Barra, botões principais, links                  |
| `bg-marca-claro` / `text-marca-claro`   | `#2BB673`             | Verde vivo       | A marca no tema escuro (`dark:text-marca-claro`) |
| `bg-emergencia` / `text-emergencia`     | `#C62828`             | Vermelho SOS     | **Só** o botão SOS, o selo `EMERGENCIA` e o 192  |
| `bg-alta` / `text-alta`                 | `#EF6C00`             | MVP-02           | Selo `ALTA`                                      |
| `bg-moderada` / `text-moderada`         | `#F9A825`             | MVP-02           | Selo `MODERADA`                                  |
| `bg-fundo` / `dark:bg-fundo-escuro`     | `#FFF8E1` / `#121212` | Creme / MVP-02   | Fundo das telas                                  |
| `text-texto` / `dark:text-texto-escuro` | `#1E2A2F` / `#ECEFF1` | Grafite / MVP-02 | Texto                                            |

O Verde `#14946A` e o Âmbar `#FFB300` da paleta só aparecem dentro do logo e do ícone (PNG): não viraram classe porque nenhuma tela usa. Crie o token quando uma tela precisar.

**Cores fora do `className`:** a prop `color` do `Ionicons` e do `ActivityIndicator`, as cores da tab bar e a barra nativa do Stack não aceitam classe, então levam o `#hex` do token (`#0B6E4F` no claro, `#2BB673` no escuro; `#EF6C00` no ícone de sinal de alerta; `#FFFFFF`/`#1E2A2F` nos ícones do selo e do "NÃO faça"; neutros `#6B7280`). `cabecalho.test.ts` confere que `utils/cabecalho.ts` usa os mesmos valores do `tailwind.config.js`. Ao mudar um token, procure o hex antigo no `src/`.

**Identidade visual:** no projeto ficam só os PNGs que o app usa, em `assets/images/` (o pacote completo da identidade, com SVGs e variações, fica com o time, fora do repositório):

| Arquivo                               | Onde                                     | De onde veio                                                                   |
| ------------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------ |
| `antidoto-icone-app.png`              | `icon` e `web.favicon` do `app.json`     | `png/antidoto-icone-app.png` da identidade                                     |
| `antidoto-icone-adaptativo.png`       | `android.adaptiveIcon` (fundo `#0B6E4F`) | gota branca do `antidoto-simbolo-branco.svg`, dentro da área segura do Android |
| `antidoto-simbolo.png`                | `splash` (fundo creme `#FFF8E1`)         | `png/antidoto-simbolo.png` da identidade                                       |
| `antidoto-logo-horizontal.png`        | `LogoAntidoto` no tema claro (login)     | `antidoto-logo-horizontal.svg`, sem a margem                                   |
| `antidoto-logo-horizontal-escuro.png` | `LogoAntidoto` no tema escuro            | o mesmo SVG com o texto branco, como os PNGs `fundo-preto`/`fundo-grafite`     |

- O logo é sempre o `LogoAntidoto`, nunca outro `<Image>` com o PNG. O tamanho dele vai no `style` (exceção à regra do `className`): no navegador, o react-native-web põe no `<Image>` o tamanho original do PNG, que ganha da classe.
- Nada de redesenhar o logo nem trocar as cores dele: se faltar uma versão, gere a partir dos SVGs do pacote da identidade e coloque em `assets/images/` só o PNG que for usado.
- Assinatura da marca: "Do susto ao soro certo."

**Tipografia:**

- Fonte **Inter**, carregada no `_layout.tsx` raiz. Classes: `font-inter` (400), `font-inter-semibold` (600), `font-inter-bold` (700).
- No Android, o peso vem do arquivo da fonte: use `font-inter-bold`, **não** `font-bold`.
- Títulos com 22 ou mais (`text-2xl`+); corpo com 16 ou mais (`text-base`+).

**Tema escuro:** `darkMode: "class"`, como no Afetto. Todo fundo e texto de tela leva a variante `dark:` (`bg-fundo dark:bg-fundo-escuro`, `text-texto dark:text-texto-escuro`). ⚠️ **Em aberto:** se haverá seletor de tema, como o `TemaContext` do Afetto, ou se o app só segue o aparelho.

**Urgência:** sempre **texto + ícone**, nunca só a cor (`SeloUrgencia`: `alert-circle`, `warning`, `information-circle`). O vermelho `emergencia` é exclusivo do SOS, do `EMERGENCIA` e do 192. No selo, texto branco só no vermelho: no laranja (`alta`) e no amarelo (`moderada`) o branco fica sem contraste, então vai o grafite (`text-texto`).

---

## 5. Componentização

- Um bloco que aparece em mais de uma tela → componente. Um bloco com mais de ~40 linhas de JSX → avaliar extração.
- Componentes genéricos em `components/ui/`; os de um domínio em `components/sos/`, `components/avistamentos/`, `components/ocorrencias/`; `EstadoVazio`, `EstadoErro` e `RotaProtegida` na raiz de `components/` (como no Afetto).
- Já existem (MVP-02 §4): `BotaoSos`, `SeletorAnimal`, `ListaSintomas`, `SeloUrgencia`, `BotaoLigar192`, `AvisoAtendimento`, `CartaoUnidade`, mais o `ResumoTriagem` e o `UnidadesProximas`. A faixa etária e a hora da picada usam o `CampoSelecao` (do Afetto), no lugar do `SeletorFaixaEtaria` do MVP-02.
- Avistamentos: `CartaoAvistamento`, `FormAvistamento` (os campos, usados no novo e no editar) e `CampoLocalizacao`. O `SeletorAnimal` serve à triagem e ao avistamento (prop `label`).
- Ocorrências: `RegistrarOcorrencia` (T4), `CartaoOcorrencia` (T8), `CartaoResumo` (T12) e `FormOcorrencia` (T12b).

---

## 6. Responsabilidade Única — Regras por Camada

- **Páginas (`src/app/`):** layout e estado local de UI. **Nunca** chamam HTTP direto: leitura por `useQuery`, escrita por `useMutation`, sempre via hooks.
- **Hooks de dados:** só `useQuery`/`useMutation` chamando o service; devolvem o objeto do TanStack como está. Invalidação com `useQueryClient()` **dentro do hook** (nunca importar o `queryClient` direto). Sem JSX e **sem navegar** — a navegação fica no `onSuccess` da tela.
- **Hooks de tela** (`useTriagem`, `useLocalizacao`): estado local e regra de um fluxo de UI, expondo um objeto próprio.
- **Services:** chamadas HTTP e conversão do payload (máscara, data, lista paginada). Padrão objeto (`avistamentoService.criar`). Comentar todo contorno de limitação da API. Todo dado que a tela mostra vem da API; o que fica no aparelho de propósito (urgência do SOS, telefones do RN-G8) está listado no README.
- **Schemas:** só Zod, exportando o tipo inferido. Use as listas de `types/enums.types.ts` no `z.enum`.
- **Utils:** funções puras, sem hooks e sem I/O, **sempre com teste**.
- **Context:** um único `SessaoContext` para a sessão.

**Chaves do TanStack Query** (MVP-02 §4): `["usuario","me"]` · `["unidades","proximas", latitude, longitude, tipoAnimal]` · `["ocorrencias","minhas"]` · `["ocorrencias", id]` · `["avistamentos","meus"]` · `["avistamentos", id]` · `["conteudo","primeiros-socorros", tipoAnimal]`.

---

## 7. Padrões de UI

- Toda tela com dados remotos tem **carregando, erro (com "Tentar novamente") e vazio**.
- **Nenhum botão ou tela sem efeito real.** "Em breve" não existe; uma tela só entra no passo em que funciona.
- **RN-G2:** o texto fixo "Procure atendimento médico imediatamente." (`AvisoAtendimento`) aparece no resultado (T4), nos primeiros socorros (T5) e na ocorrência (T12).
- **RN-G3:** em `EMERGENCIA`, o `BotaoLigar192` fica **no topo**, antes de tudo. Nos outros níveis, no fim da tela.
- **Unidades no resultado:** GPS negado → "Ative a localização para ver as unidades próximas" + "Tentar novamente" (negada de vez: "Abrir as configurações"); GPS sem sinal em 15 s → pede para conferir o GPS; erro da API → `EstadoErro`; lista vazia → RN-S4. Nenhuma dessas falhas esconde a urgência, o 192 ou os primeiros socorros.
- **Ocorrência (T12):** a urgência é a **maior** entre a do servidor e a do app (`urgenciaDaOcorrencia`: a mesma RN-U, com a hora do registro): nunca rebaixar. Regra de negócio fica em `utils/`, nunca dentro da tela. Resumo `PENDENTE` → "Gerando resumo para a unidade…" e nova consulta a cada 3 s; `PRONTO` ou `MODELO_PADRAO` → cartão "Mostre este resumo na recepção" + o `avisoResumo` da API (RN-G7; sem ele, o texto fixo).
- **Atualizar a ocorrência (T12b):** só com o resumo pronto (com `PENDENTE`, o botão some: a API responderia 409). A tela edita os sintomas e a unidade (entre as próximas do lugar da picada, ou "Ainda não escolhi"); animal, faixa etária, hora e lugar vão como no registro. Salvou → `router.back()`, e o detalhe mostra "Gerando resumo…".
- **Primeiros socorros (T5):** vêm da API. Sem internet, o erro aparece no lugar do texto, mas o aviso RN-G2 e os telefones úteis continuam na tela.
- **Registrar a ocorrência (T4)** exige as coordenadas do GPS (contrato): sem elas, o botão fica desligado e a tela explica. O erro da API aparece embaixo do botão.
- **Excluir** sempre com confirmação (`Alert.alert`, como no Afetto). O `Alert` do React Native não aparece no navegador: teste a exclusão no celular.
- **Nunca** mostrar "sem urgência", "não é perigoso", dose ou remédio.
- **Acessibilidade:** alvo de toque com 48 dp ou mais, `accessibilityLabel` em todo botão com ícone, contraste alto.
- Segurança de área no topo: padding fixo nos cabeçalhos (`pt-14`), como no Afetto.
- **Cabeçalho das abas:** sempre o `CabecalhoAba`. Com a aba em foco (`useFocusEffect` do expo-router), a barra de status fica clara: os ícones escuros do tema claro quase somem no verde. Nas outras telas (fundo creme), vale a barra do `_layout.tsx` raiz, que segue o tema.
- **Ligar e Rota** (`Linking.openURL`): se o aparelho não abrir o discador ou o mapa (ex.: tablet sem chip), um `Alert` mostra o número ou o endereço. Nunca deixar o toque sem resposta.

---

## 8. Formulários

- `useForm` + `zodResolver` + schema em `src/schemas/`. Campos com `CampoTexto`/`CampoSelecao`; envio com `BotaoEnviar`.
- O botão usa o `isPending` do `useMutation` (nunca o `isSubmitting`).
- **Erros da API** (`src/api/erros.ts`): `errosDaApiNoFormulario(erro, CAMPOS_DA_TELA)` divide o erro em `porCampo` (o `campos[]` do 400 com um campo que existe na tela → `setError` de cada um) e `geral` (campo que a tela não tem, 409, 500, sem conexão → `setError("root")`). Cada schema exporta a lista dos seus campos (`CAMPOS_LOGIN`, `CAMPOS_CADASTRO`). Nunca silenciar um erro.
- **409 no cadastro** ("E-mail já cadastrado."): mensagem geral, como manda o MVP-02 §5.1 — não vai para baixo do campo e-mail.
- Telefone: máscara na tela (`utils/mascaras.ts`), só os dígitos na API — a conversão fica no service.
- Datas: a API usa ISO-8601 UTC (`toISOString()`); a tela mostra DD/MM/AAAA HH:mm. A conversão fica em `utils/data.ts`/service, nunca na tela.

---

## 9. Autenticação e Sessão

- **JWT** no cabeçalho `Authorization: Bearer` (`POST /api/auth/login` e `/api/auth/cadastro` devolvem `{ token, tipo, expiraEmSegundos, usuario }`). O interceptor de `api.ts` põe o token que o `SessaoContext` passou em `definirTokenDeAcesso`. Não há refresh token no MVP.
- `SessaoContext` é a **única** fonte de verdade da sessão: token e usuário no AsyncStorage (`@antidoto:token`, `@antidoto:usuario`), com `sessao`, `carregando`, `entrar(resposta)`, `sair()` e `atualizarPerfil(usuario)`.
- **Abertura do app (diferente do Afetto, de propósito):** a sessão salva vale **na hora**, sem esperar a rede — o SOS e os telefones úteis não podem depender da internet. A conferência com `GET /api/usuarios/me` (`queryClient.fetchQuery` na `CHAVE_USUARIO_LOGADO`) roda depois, em segundo plano:
  - 401 → sai (token vencido ou recusado);
  - sem internet ou servidor fora → **mantém** a sessão;
  - usuário de outra conta → sai;
  - deu certo → atualiza o usuário salvo (o nome pode ter mudado em outro aparelho).
    Se a pessoa sair ou trocar de conta antes da resposta, a resposta é ignorada (`tokenAtual`).
- **Entrar** (login e cadastro): grava token e usuário, passa o token ao `api.ts`, limpa o cache e já põe o usuário em `["usuario","me"]` (o Perfil abre sem esperar). O cadastro já entra, sem uma segunda chamada.
- **401 numa chamada que levou o token** ⇒ o tratador registrado em `definirTratadorSessaoExpirada` limpa a sessão e o `<RotaProtegida>` manda para o login. **No login** (sem token), o 401 é só a mensagem "E-mail ou senha incorretos" (MVP-02 §3.4). O 403 não encerra a sessão.
- **Editar o perfil (T9):** `PUT /api/usuarios/me` só com nome e telefone (o contrato não deixa mudar o e-mail). O usuário que a API devolve vai para `["usuario","me"]` e para a sessão salva (`atualizarPerfil`, que ignora outra conta): o Início cumprimenta pelo nome novo.
- **Alterar senha** (Perfil → Segurança → `(app)/alterar-senha`): `PUT /api/usuarios/me/senha` com a atual e a nova. Senha atual errada volta como **400 no campo `senhaAtual`** (não 401, que encerraria a sessão). Salvou → "Salvo com sucesso!" e volta para o Perfil. **Sem "esqueci a senha"** (decisão de 13/11): precisaria de envio de e-mail, e o Render grátis bloqueia SMTP. Nada de botão sem tela (foi o que tirou ponto no Afetto).
- **Logout** é local: o contrato não tem rota de logout (o JWT vive no aparelho). `sair()` apaga o AsyncStorage, tira o token do `api.ts` e faz `queryClient.clear()`; a tela vai para `/login`.
- `RotaProtegida` nos layouts de `(tabs)` e `(app)`. A pasta `sos/` **não** é protegida (RN-G1).

## 10. Navegação

- Toda navegação pelo `expo-router` (`router.push`, `router.replace`, `router.back`, `<Redirect>`, `useFocusEffect`). Nada importado direto do `@react-navigation` (ele só está no `package.json` porque o expo-router precisa).
- Depois de entrar (login ou cadastro): `router.replace("/(tabs)")`. Depois de sair: `router.replace("/login")`.
- **"Entre para salvar a ocorrência" (decisão de 09/11):** o resultado manda as respostas da triagem como params do `/login` (e o login, do `/cadastro`). Depois de entrar, `router.dismissTo({ pathname: "/sos/resultado", params })` volta ao resultado que já estava aberto, sem empilhar outro igual. Nada é registrado sozinho: a pessoa toca em "Registrar ocorrência".
- Registrou: `router.replace({ pathname: "/ocorrencias/[id]", params: { id } })` (MVP-02 §3.2).
- Os grupos `(auth)`, `(tabs)` e `(app)` **não** aparecem na URL: `(auth)/login.tsx` é `/login`. A pasta `sos/` **aparece**: `/sos/triagem`.
- **Rotas tipadas, sempre em forma de objeto:** `router.push({ pathname: "/sos/resultado", params: { tipoAnimal, faixaEtaria, sintomas: sintomas.join(","), horaPicada } })`. Nunca template literal + `as any`.
- **Triagem → resultado:** os params vão como texto (`sintomas` separados por vírgula, `""` quando nenhum; `horaPicada` em ISO). O resultado confere com `criarParamsResultadoSchema(agora)` (enums do contrato e RN-G4); se faltar algo, volta para `/sos/triagem`.
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
- **RN-U (§4.3):** `utils/urgencia.ts` calcula a urgência **no app**, sem internet. Os **10 casos** do §4.3 são obrigatórios em `urgencia.test.ts`, os mesmos do JUnit do Java. **Não mudar a regra sem combinar com o Java.** Entre a urgência do servidor e a do app, vale a maior (`urgenciaDaOcorrencia`, T12): nunca rebaixar.
- **RN-S (§4.4):** compatibilidade e ordenação das unidades são do Java. O app só mostra; a lista vazia é válida e mostra "Nenhuma unidade com soro encontrada. Ligue 192." (RN-S4). Na abelha não existe soro: a API devolve hospitais e UPAs, e o app fala em "atendimento de urgência".
- **RN-G1 a RN-G8 (§4.5):** SOS sem login; texto fixo no resultado; 192 no topo em `EMERGENCIA`; hora da picada sem futuro e até 72 h; avistamento só do dono; resumo por IA sem dados pessoais e com o aviso "Resumo gerado por IA. Não substitui avaliação profissional."; telefones úteis 192, 193 e 0800 722 6001.
- Implementações e testes de uma regra citam o ID dela em comentário (ex.: `// RN-U2`).

---

## 13. Sobre o App e versão

- **Tela (T13, `(app)/sobre.tsx`, MVP-02 §9):** versão do `app.json`, número do build (só no APK; no Expo Go seria o do próprio Expo Go), ambiente (`EXPO_PUBLIC_APP_ENV` do perfil do EAS; sem ele, "desenvolvimento"), commit curto, data e hash completo, integrantes com o RM (os mesmos do Challenge) e o aviso de dados fictícios. Entra pelo cartão "Sobre o App" do Perfil.
- **O hash nunca é escrito à mão.** O `app.config.ts` descobre o commit quando o Expo lê a configuração e coloca em `extra.commitHash`, `extra.commitData` e `extra.commitComAlteracoes`; o app lê de `Constants.expoConfig.extra` via `utils/versao.ts`.
- **De onde vem:** no build do EAS (o APK do Firebase), de `EAS_BUILD_GIT_COMMIT_HASH`; no computador, do `git rev-parse HEAD`. Sem git, "não informado".
- **Depois de um commit novo, reinicie o `npx expo start`** — o Expo só lê o `app.config.ts` quando inicia.
- Para conferir sem abrir o app: `npx expo config --type public` mostra o `extra` com o hash.
- **Pacote Android:** `br.fiap.mad.antidoto` (padrão do professor). Ele trava no primeiro registro no Firebase (Passo 8); até lá, pode mudar.

---

## 14. O Que Nunca Fazer

- Chamar HTTP dentro de uma página.
- Usar `StyleSheet.create` (fora do reanimated) ou `#hex` em `style`; usar classe de cor sem confirmar que ela existe.
- Redesenhar o logo, mudar as cores dele ou usar o PNG fora do `LogoAntidoto`.
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

## Ajustes em relação ao MVP-02 e ao Afetto (decididos pelo time em 06 e 07/11)

| No MVP-02                                                       | No código (como no Afetto)                                                                                               |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `(tabs)` dentro de `(app)`                                      | `(tabs)` na raiz, com a `RotaProtegida` no layout dela                                                                   |
| Início em `(tabs)/inicio.tsx`                                   | `(tabs)/index.tsx`                                                                                                       |
| `api/cliente.ts`                                                | `api/api.ts`                                                                                                             |
| `auth.service.ts`, `usuarios.service.ts`, services no plural    | `autenticacao.service.ts` e services no singular (`unidade`, `ocorrencia`, `avistamento`)                                |
| `useLogin`, `useCadastro`                                       | `useEntrar`, `useCadastrar` (em `useAutenticacao.ts`)                                                                    |
| `useUsuarioLogado`, `useAtualizarUsuario`                       | mesmos nomes, em `usePerfil.ts`                                                                                          |
| `perfil.schema.ts`                                              | `editar-perfil.schema.ts` (`EditarPerfilSchema`, como no Afetto)                                                         |
| `utils/datas.ts`                                                | `utils/data.ts`                                                                                                          |
| `types/enums.ts`, `usuario.ts`…                                 | `types/*.types.ts`                                                                                                       |
| `EstadoVazio`, `EstadoErro`, `RotaProtegida` em `components/ui` | na raiz de `components/`                                                                                                 |
| `SeletorFaixaEtaria`                                            | `CampoSelecao` (componente do Afetto), com a idade na 2ª linha                                                           |
| RN-S4 também na abelha ("…com soro…")                           | Na abelha: "Nenhum hospital ou UPA encontrado perto de você. Ligue 192." (não existe soro)                               |
| `rotuloTipoAnimal()` etc.                                       | constantes `LABEL_*` (como o `LABEL_ESPECIE` do Afetto); `ehSintomaDeAlerta()` continua função                           |
| `extrairMensagemErro`, `extrairErrosDeCampo`                    | `mensagemDaApi`, `errosDeCampoDaApi` (nomes do `erros.ts` do Afetto)                                                     |
| Hash por `EXPO_PUBLIC_COMMIT_HASH` definido no terminal         | `app.config.ts` lendo `EAS_BUILD_GIT_COMMIT_HASH` (ou o git)                                                             |
| Fonte padrão do sistema                                         | Inter em `assets/fonts` (a rubrica pede fontes personalizadas)                                                           |
| Paleta do §7 (`#1B5E20`, `#4C8C4A`, `#263238`)                  | Paleta da identidade visual (`#0B6E4F`, `#2BB673`, `#1E2A2F`); urgência e tema escuro seguem o §7                        |
| Revalidar a sessão antes de abrir o app (como no Afetto)        | Sessão salva vale na hora; conferência com a API em segundo plano (seção 9)                                              |
| Nome "SOS Peçonha" (`sos-peconha-app`, `@sospeconha:token`)     | **Antídoto** (`antidoto-app`, `@antidoto:token`, `@antidoto:usuario`) — decisão de 07/11                                 |
| Primeiros socorros locais no app (MVP-02 §6)                    | `GET /api/conteudo/primeiros-socorros/{tipoAnimal}` (público): todo dado que a tela mostra vem da API — decisão de 12/11 |
| Ocorrência sem edição                                           | T12b: `PUT /api/ocorrencias/{id}` com os sintomas e a unidade; a ocorrência ganha o CRUD completo — decisão de 12/11     |

---

_Antídoto — Global Solution 2026/2 · FIAP_
_React Native + Expo + TypeScript + NativeWind + TanStack Query_
