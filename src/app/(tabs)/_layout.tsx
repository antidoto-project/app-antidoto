import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useColorScheme } from "nativewind";

import { RotaProtegida } from "@/components/RotaProtegida";

type NomeIcone = React.ComponentProps<typeof Ionicons>["name"];

// Aba ativa com o ícone cheio, as outras com o contorno: a aba atual se destaca
// pela forma, não só pela cor (como no Afetto)
function IconeAba({
  cheio,
  contorno,
  focado,
  color,
}: {
  cheio: NomeIcone;
  contorno: NomeIcone;
  focado: boolean;
  color: string;
}) {
  return <Ionicons name={focado ? cheio : contorno} size={24} color={color} />;
}

/** Abas de quem está logado. Ocorrências entra no Passo 6. */
export default function LayoutAbas() {
  const { colorScheme } = useColorScheme();
  const escuro = colorScheme === "dark";

  return (
    <RotaProtegida>
      <Tabs
        screenOptions={{
          headerShown: false,
          // A barra de abas é nativa: as cores vão por prop (o className não chega nela)
          tabBarActiveTintColor: escuro ? "#2BB673" : "#0B6E4F",
          tabBarInactiveTintColor: escuro ? "#9CA3AF" : "#6B7280",
          tabBarStyle: {
            backgroundColor: escuro ? "#1E1E1E" : "#FFFFFF",
            borderTopColor: escuro ? "#2A2A2A" : "#E5E7EB",
            borderTopWidth: 1,
          },
          tabBarLabelStyle: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Início",
            tabBarIcon: ({ color, focused }) => (
              <IconeAba cheio="home" contorno="home-outline" focado={focused} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="avistamentos"
          options={{
            title: "Avistamentos",
            tabBarIcon: ({ color, focused }) => (
              <IconeAba cheio="eye" contorno="eye-outline" focado={focused} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="perfil"
          options={{
            title: "Perfil",
            tabBarIcon: ({ color, focused }) => (
              <IconeAba cheio="person" contorno="person-outline" focado={focused} color={color} />
            ),
          }}
        />
      </Tabs>
    </RotaProtegida>
  );
}
