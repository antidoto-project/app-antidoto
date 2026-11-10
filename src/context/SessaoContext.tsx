import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQueryClient } from "@tanstack/react-query";
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";

import { definirTokenDeAcesso, definirTratadorSessaoExpirada } from "@/api/api";
import { classificarErro } from "@/api/erros";
import { CHAVE_USUARIO_LOGADO } from "@/hooks/useAutenticacao";
import { autenticacaoService } from "@/services/autenticacao.service";
import type { RespostaAutenticacao, Usuario } from "@/types/usuario.types";

export const CHAVE_TOKEN = "@antidoto:token";
export const CHAVE_USUARIO = "@antidoto:usuario";

export type Sessao = {
  token: string;
  usuario: Usuario;
};

type DadosSessaoContexto = {
  sessao: Sessao | null;
  /** Lendo a sessão salva no aparelho (só na abertura do app, sem esperar a rede). */
  carregando: boolean;
  /** Guarda o token e o usuário da resposta do login ou do cadastro. */
  entrar: (resposta: RespostaAutenticacao) => Promise<void>;
  /** Apaga a sessão do aparelho e o cache. Não há rota de logout: o JWT é do aparelho. */
  sair: () => Promise<void>;
  /** Troca o usuário salvo depois de editar o Perfil (o Início mostra o nome novo). */
  atualizarPerfil: (usuario: Usuario) => Promise<void>;
};

const SessaoContext = createContext<DadosSessaoContexto>({} as DadosSessaoContexto);

function usuarioValido(valor: unknown): valor is Usuario {
  const usuario = valor as Partial<Usuario> | null;
  return typeof usuario?.id === "number" && typeof usuario.nome === "string";
}

/** Sessão salva no aparelho; formato estranho (ex.: versão antiga) vira "sem sessão". */
async function lerSessaoSalva(): Promise<Sessao | null> {
  const [[, token], [, usuarioBruto]] = await AsyncStorage.multiGet([CHAVE_TOKEN, CHAVE_USUARIO]);
  if (!token || !usuarioBruto) return null;

  try {
    const usuario: unknown = JSON.parse(usuarioBruto);
    if (usuarioValido(usuario)) return { token, usuario };
  } catch {
    // JSON inválido: trata como sessão inexistente
  }
  await AsyncStorage.multiRemove([CHAVE_TOKEN, CHAVE_USUARIO]);
  return null;
}

export function SessaoProvider({ children }: { children: ReactNode }) {
  const [sessao, setSessao] = useState<Sessao | null>(null);
  const [carregando, setCarregando] = useState(true);
  // Token da sessão que vale agora: a revalidação do boot não ressuscita uma
  // sessão que a pessoa encerrou (ou trocou) enquanto a resposta não chegava
  const tokenAtual = useRef<string | null>(null);

  // Os dados em cache são da conta logada e ficam "frescos" por 5 min
  // (queryClient.ts): sem limpar ao trocar de conta, a nova veria os da anterior.
  const queryClient = useQueryClient();

  async function limpar() {
    tokenAtual.current = null;
    definirTokenDeAcesso(null);
    await AsyncStorage.multiRemove([CHAVE_TOKEN, CHAVE_USUARIO]);
    queryClient.clear();
    setSessao(null);
  }

  // 401 numa chamada logada (token expirado ou inválido): a sessão local deixa de
  // valer e o <RotaProtegida> manda para o login (MVP-02 §5.1)
  useEffect(() => {
    definirTratadorSessaoExpirada(() => void limpar());
    return () => definirTratadorSessaoExpirada(null);
    // limpar só usa o queryClient, que é o mesmo durante toda a vida do app
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryClient]);

  useEffect(() => {
    async function abrir() {
      const salva = await lerSessaoSalva();
      if (salva) {
        tokenAtual.current = salva.token;
        definirTokenDeAcesso(salva.token);
        setSessao(salva);
      }
      // O app abre na hora com a sessão salva, sem esperar a rede: o SOS não pode
      // depender da internet (MVP-02 §5.2). A conferência com a API vem depois.
      setCarregando(false);
      if (salva) await revalidar(salva);
    }

    /*
     * Confere o token com GET /api/usuarios/me (pelo TanStack Query, como toda
     * chamada do app). Token recusado (401) → sai. Sem internet → mantém a sessão
     * salva: a próxima chamada logada confere de novo. Respondeu → atualiza nome e
     * telefone (podem ter mudado em outro aparelho).
     */
    async function revalidar(salva: Sessao) {
      try {
        const usuario = await queryClient.fetchQuery({
          queryKey: CHAVE_USUARIO_LOGADO,
          queryFn: autenticacaoService.buscarUsuarioLogado,
          staleTime: 0,
          retry: false,
        });
        if (tokenAtual.current !== salva.token) return;

        if (!usuarioValido(usuario) || usuario.id !== salva.usuario.id) {
          await limpar();
          return;
        }
        await AsyncStorage.setItem(CHAVE_USUARIO, JSON.stringify(usuario));
        setSessao({ token: salva.token, usuario });
      } catch (erro) {
        if (tokenAtual.current === salva.token && classificarErro(erro) === "nao_autenticado") {
          await limpar();
        }
      }
    }

    void abrir();
    // Só na abertura do app
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function entrar({ token, usuario }: RespostaAutenticacao) {
    await AsyncStorage.multiSet([
      [CHAVE_TOKEN, token],
      [CHAVE_USUARIO, JSON.stringify(usuario)],
    ]);
    tokenAtual.current = token;
    definirTokenDeAcesso(token);
    // Conta nova (ou a mesma de novo): nada do cache anterior é reaproveitado.
    // O usuário da resposta já vai para o cache do Perfil.
    queryClient.clear();
    queryClient.setQueryData(CHAVE_USUARIO_LOGADO, usuario);
    setSessao({ token, usuario });
  }

  async function atualizarPerfil(usuario: Usuario) {
    // Só o dono da sessão: se ela acabou (ou mudou de conta) no meio, não ressuscita
    if (!sessao || sessao.usuario.id !== usuario.id) return;
    await AsyncStorage.setItem(CHAVE_USUARIO, JSON.stringify(usuario));
    setSessao({ token: sessao.token, usuario });
  }

  return (
    <SessaoContext.Provider value={{ sessao, carregando, entrar, sair: limpar, atualizarPerfil }}>
      {children}
    </SessaoContext.Provider>
  );
}

export function useSessao() {
  return useContext(SessaoContext);
}
