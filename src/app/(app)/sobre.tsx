import { Ionicons } from "@expo/vector-icons";
import * as Application from "expo-application";
import Constants, { ExecutionEnvironment } from "expo-constants";
import type { ReactNode } from "react";
import { ScrollView, Text, View } from "react-native";

import { LogoAntidoto } from "@/components/LogoAntidoto";
import { buildDoApp, versaoDoApp } from "@/utils/versao";

/** Integrantes do grupo (Global Solution 2026/2). */
const INTEGRANTES = [
  "Gustavo Souto de Melo",
  "Iago Liziero Pereira",
  "Ícaro José dos Santos",
  "Leonardo Barbosa Santos",
];

function Secao({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <View className="gap-2">
      <Text className="px-1 font-inter-semibold text-base text-texto dark:text-texto-escuro">
        {titulo}
      </Text>
      <View className="rounded-2xl bg-white px-4 dark:bg-gray-800">{children}</View>
    </View>
  );
}

function Linha({
  rotulo,
  valor,
  destaque = false,
  ultima = false,
}: {
  rotulo: string;
  valor: string;
  destaque?: boolean;
  ultima?: boolean;
}) {
  return (
    <View
      className={`flex-row items-center justify-between gap-3 py-3.5 ${
        ultima ? "" : "border-b border-gray-200 dark:border-gray-700"
      }`}
    >
      <Text className="font-inter text-sm text-gray-600 dark:text-gray-300">{rotulo}</Text>
      <Text
        selectable
        className={`text-base ${
          destaque
            ? "font-inter-bold text-marca dark:text-marca-claro"
            : "font-inter text-texto dark:text-texto-escuro"
        }`}
      >
        {valor}
      </Text>
    </View>
  );
}

/**
 * T13 — Sobre o App (MVP-02 §9): versão do app.json, número do build, ambiente
 * e o commit da versão instalada, mais os integrantes e o aviso de dados
 * fictícios. O hash não é escrito à mão: o app.config.ts lê do git (ou do EAS)
 * na hora do build e ele chega em `Constants.expoConfig.extra`. O número do
 * build é lido do APK (expo-application). Igual à tela do Afetto.
 */
export default function TelaSobre() {
  const versao = versaoDoApp(Constants.expoConfig);
  const build = buildDoApp({
    numeroNativo: Application.nativeBuildVersion,
    noExpoGo: Constants.executionEnvironment === ExecutionEnvironment.StoreClient,
    ambiente: process.env.EXPO_PUBLIC_APP_ENV,
  });

  return (
    <ScrollView
      className="flex-1 bg-fundo dark:bg-fundo-escuro"
      contentContainerClassName="gap-6 px-5 pb-10 pt-2"
    >
      <Text
        accessibilityRole="header"
        className="px-1 font-inter-bold text-3xl text-texto dark:text-texto-escuro"
      >
        Sobre o App
      </Text>

      <View className="items-center gap-3 rounded-2xl bg-white p-6 dark:bg-gray-800">
        <LogoAntidoto />
        <Text className="font-inter-semibold text-base text-marca dark:text-marca-claro">
          Do susto ao soro certo.
        </Text>
        <Text className="text-center font-inter text-base text-texto dark:text-texto-escuro">
          Para quem foi picado por um animal peçonhento: a gravidade, o que fazer e a unidade de
          saúde com o soro certo.
        </Text>
        <Text className="text-center font-inter text-sm text-gray-600 dark:text-gray-300">
          Global Solution 2026/2 · FIAP · CitizenTech
        </Text>
      </View>

      <View className="gap-2">
        <Secao titulo="Versão">
          <Linha rotulo="Versão do app" valor={versao.versao} />
          {build.numero && <Linha rotulo="Build" valor={build.numero} />}
          <Linha rotulo="Ambiente" valor={build.ambiente} />
          <Linha
            rotulo="Commit"
            valor={versao.commitCurto ?? "não informado"}
            destaque
            ultima={!versao.dataCommit && !versao.commitCompleto}
          />
          {versao.dataCommit && (
            <Linha
              rotulo="Data do commit"
              valor={versao.dataCommit}
              ultima={!versao.commitCompleto}
            />
          )}
          {versao.commitCompleto && (
            <View className="py-3.5">
              <Text className="font-inter text-sm text-gray-600 dark:text-gray-300">
                Hash completo
              </Text>
              <Text
                selectable
                className="mt-1 font-inter text-sm text-texto dark:text-texto-escuro"
              >
                {versao.commitCompleto}
              </Text>
            </View>
          )}
        </Secao>

        {versao.comAlteracoes && (
          <View className="flex-row items-center gap-2 px-1">
            <Ionicons name="warning" size={18} color="#EF6C00" />
            <Text className="flex-1 font-inter text-sm text-texto dark:text-texto-escuro">
              Gerado com alterações que ainda não estão em nenhum commit. Faça o commit antes de
              publicar.
            </Text>
          </View>
        )}
        {!versao.commitCompleto && (
          <Text className="px-1 font-inter text-sm text-gray-600 dark:text-gray-300">
            O hash é lido do git na hora do build (app.config.ts).
          </Text>
        )}
      </View>

      <Secao titulo="Integrantes">
        {INTEGRANTES.map((nome, indice) => (
          <View
            key={nome}
            className={`flex-row items-center gap-3 py-3.5 ${
              indice < INTEGRANTES.length - 1 ? "border-b border-gray-200 dark:border-gray-700" : ""
            }`}
          >
            <Ionicons name="person-circle-outline" size={20} color="#6B7280" />
            <Text className="font-inter text-base text-texto dark:text-texto-escuro">{nome}</Text>
          </View>
        ))}
      </Secao>

      {/* MVP-02 §9: aviso de dados fictícios */}
      <View className="flex-row gap-3 rounded-2xl border border-gray-300 p-4 dark:border-gray-700">
        <Ionicons name="information-circle-outline" size={20} color="#6B7280" />
        <Text className="flex-1 font-inter text-sm text-gray-600 dark:text-gray-300">
          Projeto acadêmico: as unidades de saúde deste MVP são fictícias, só para demonstração. Em
          caso de picada, ligue 192.
        </Text>
      </View>
    </ScrollView>
  );
}
