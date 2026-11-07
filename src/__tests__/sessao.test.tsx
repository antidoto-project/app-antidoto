import AsyncStorage from "@react-native-async-storage/async-storage";
import { QueryClientProvider } from "@tanstack/react-query";
import { act, render, screen } from "@testing-library/react-native";
import { AxiosError, AxiosHeaders, type AxiosResponse } from "axios";
import { Text } from "react-native";

import { definirTokenDeAcesso, definirTratadorSessaoExpirada } from "@/api/api";
import { CHAVE_TOKEN, CHAVE_USUARIO, SessaoProvider, useSessao } from "@/context/SessaoContext";
import { CHAVE_USUARIO_LOGADO } from "@/hooks/useAutenticacao";
import { autenticacaoService } from "@/services/autenticacao.service";
import { criarClienteDeTeste } from "@/testes/clienteDeTeste";
import type { Usuario } from "@/types/usuario.types";

// O token vai para o cliente HTTP (api.ts); o tratador do 401 é registrado lá
jest.mock("@/api/api", () => ({
  definirTokenDeAcesso: jest.fn(),
  definirTratadorSessaoExpirada: jest.fn(),
}));

// A sessão salva é conferida no boot com GET /api/usuarios/me
jest.mock("@/services/autenticacao.service", () => ({
  autenticacaoService: { buscarUsuarioLogado: jest.fn() },
}));

const mockBuscarUsuarioLogado = autenticacaoService.buscarUsuarioLogado as jest.Mock;
const mockDefinirToken = definirTokenDeAcesso as jest.Mock;
const mockDefinirTratador = definirTratadorSessaoExpirada as jest.Mock;

const ANA: Usuario = {
  id: 1,
  nome: "Ana Souza",
  email: "ana@teste.com",
  telefone: "11999990000",
  perfil: "CIDADAO",
  criadoEm: "2026-11-07T12:00:00Z",
};

const config = { headers: new AxiosHeaders() };
function erroHttp(status: number) {
  const resposta = { status, statusText: "", headers: {}, config, data: {} } as AxiosResponse;
  return new AxiosError("falhou", "ERR_BAD_REQUEST", config, null, resposta);
}

let sessaoAtual: ReturnType<typeof useSessao>;
let queryClient: ReturnType<typeof criarClienteDeTeste>;

function MostrarSessao() {
  sessaoAtual = useSessao();
  const { sessao, carregando } = sessaoAtual;
  if (carregando) return <Text>carregando</Text>;
  return <Text>{sessao ? `logada: ${sessao.usuario.nome}` : "sem sessão"}</Text>;
}

async function abrirApp() {
  queryClient = criarClienteDeTeste();
  render(
    <QueryClientProvider client={queryClient}>
      <SessaoProvider>
        <MostrarSessao />
      </SessaoProvider>
    </QueryClientProvider>
  );
  await screen.findByText(/logada|sem sessão/);
}

async function salvarSessaoDaAna() {
  await AsyncStorage.multiSet([
    [CHAVE_TOKEN, "token-da-ana"],
    [CHAVE_USUARIO, JSON.stringify(ANA)],
  ]);
}

beforeEach(async () => {
  // Só estes mocks: resetAllMocks apagaria também as funções do mock do AsyncStorage
  mockBuscarUsuarioLogado.mockReset();
  mockDefinirToken.mockReset();
  mockDefinirTratador.mockReset();
  await AsyncStorage.clear();
});

describe("SessaoProvider — abertura do app", () => {
  it("sem sessão salva: abre sem sessão e não chama a API", async () => {
    await abrirApp();

    expect(screen.getByText("sem sessão")).toBeTruthy();
    expect(mockBuscarUsuarioLogado).not.toHaveBeenCalled();
  });

  it("abre na hora com a sessão salva, antes de a API responder (o SOS não espera a rede)", async () => {
    await salvarSessaoDaAna();
    mockBuscarUsuarioLogado.mockReturnValueOnce(new Promise(() => {})); // nunca responde

    await abrirApp();

    expect(screen.getByText("logada: Ana Souza")).toBeTruthy();
    expect(mockDefinirToken).toHaveBeenCalledWith("token-da-ana");
  });

  it("a API confirma o token: atualiza o nome (pode ter mudado em outro aparelho)", async () => {
    await salvarSessaoDaAna();
    mockBuscarUsuarioLogado.mockResolvedValueOnce({ ...ANA, nome: "Ana Paula" });

    await abrirApp();

    expect(await screen.findByText("logada: Ana Paula")).toBeTruthy();
    const salvo = JSON.parse((await AsyncStorage.getItem(CHAVE_USUARIO)) ?? "{}");
    expect(salvo.nome).toBe("Ana Paula");
  });

  it("token recusado (401): sai e apaga a sessão do aparelho", async () => {
    await salvarSessaoDaAna();
    mockBuscarUsuarioLogado.mockRejectedValueOnce(erroHttp(401));

    await abrirApp();

    expect(await screen.findByText("sem sessão")).toBeTruthy();
    expect(await AsyncStorage.getItem(CHAVE_TOKEN)).toBeNull();
    expect(mockDefinirToken).toHaveBeenLastCalledWith(null);
  });

  it("sem internet: mantém a sessão salva", async () => {
    await salvarSessaoDaAna();
    mockBuscarUsuarioLogado.mockRejectedValueOnce(new AxiosError("Network Error", "ERR_NETWORK"));

    await abrirApp();
    await act(async () => {}); // deixa a conferência terminar

    expect(screen.getByText("logada: Ana Souza")).toBeTruthy();
    expect(await AsyncStorage.getItem(CHAVE_TOKEN)).toBe("token-da-ana");
  });

  it("token de outra conta: sai", async () => {
    await salvarSessaoDaAna();
    mockBuscarUsuarioLogado.mockResolvedValueOnce({ ...ANA, id: 99 });

    await abrirApp();

    expect(await screen.findByText("sem sessão")).toBeTruthy();
  });
});

describe("SessaoProvider — entrar, sair e 401", () => {
  it("entrar guarda token e usuário, limpa o cache e já deixa o usuário pronto para o Perfil", async () => {
    await abrirApp();
    queryClient.setQueryData(["avistamentos", "meus"], ["da conta anterior"]);

    await act(() =>
      sessaoAtual.entrar({
        token: "token-novo",
        tipo: "Bearer",
        expiraEmSegundos: 86400,
        usuario: ANA,
      })
    );

    expect(screen.getByText("logada: Ana Souza")).toBeTruthy();
    expect(await AsyncStorage.getItem(CHAVE_TOKEN)).toBe("token-novo");
    expect(mockDefinirToken).toHaveBeenLastCalledWith("token-novo");
    expect(queryClient.getQueryData(["avistamentos", "meus"])).toBeUndefined();
    expect(queryClient.getQueryData(CHAVE_USUARIO_LOGADO)).toEqual(ANA);
  });

  it("sair apaga a sessão do aparelho, o token do cliente e o cache", async () => {
    await salvarSessaoDaAna();
    mockBuscarUsuarioLogado.mockResolvedValueOnce(ANA);
    await abrirApp();
    queryClient.setQueryData(["avistamentos", "meus"], ["da Ana"]);

    await act(() => sessaoAtual.sair());

    expect(screen.getByText("sem sessão")).toBeTruthy();
    expect(await AsyncStorage.getItem(CHAVE_TOKEN)).toBeNull();
    expect(await AsyncStorage.getItem(CHAVE_USUARIO)).toBeNull();
    expect(mockDefinirToken).toHaveBeenLastCalledWith(null);
    expect(queryClient.getQueryData(["avistamentos", "meus"])).toBeUndefined();
  });

  it("um 401 numa chamada logada (tratador do api.ts) encerra a sessão", async () => {
    await salvarSessaoDaAna();
    mockBuscarUsuarioLogado.mockResolvedValueOnce(ANA);
    await abrirApp();

    const tratador = mockDefinirTratador.mock.calls.find(([funcao]) => funcao)?.[0];
    await act(async () => tratador());

    expect(screen.getByText("sem sessão")).toBeTruthy();
    expect(await AsyncStorage.getItem(CHAVE_TOKEN)).toBeNull();
  });
});
