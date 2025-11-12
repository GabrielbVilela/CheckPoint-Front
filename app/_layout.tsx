import { useAuthStore } from "@/store/authStore";
import { Slot, SplashScreen, useRouter, useSegments } from "expo-router";
import React, { useEffect, useState } from "react";

SplashScreen.preventAutoHideAsync();

const RootLayout = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const userRole = useAuthStore((state) => state.userRole);
  const segments = useSegments();
  const router = useRouter();
  const loadAuth = useAuthStore((state) => state.loadAuth);
  const [appIsReady, setAppIsReady] = useState(false);

  // Efeito para inicialização e carregamento do estado de autenticação
  useEffect(() => {
    async function initializeApp() {
      try {
        await loadAuth();
      } catch (error) {
        console.error("Erro ao carregar credenciais:", error);
      } finally {
        setAppIsReady(true);
        await SplashScreen.hideAsync();
      }
    }

    initializeApp();
  }, [loadAuth]);

  // Efeito para controle de navegação baseado na autenticação
  useEffect(() => {
    if (!appIsReady) return;

    const inAuthGroup = segments[0] === "(tabs)";
    const inLoginScreen = segments[1] === "login";

    if (!isAuthenticated) {
      // Se não estiver autenticado, redireciona para login
      router.replace("/(tabs)/login");
    } else if (isAuthenticated && inLoginScreen) {
      // Se estiver autenticado, redireciona baseado no papel
      switch (userRole) {
        case "aluno":
          router.replace("/(tabs)");
          break;
        case "coordenador":
          router.replace("/(tabs)/cadastroaluno");
          break;
        default:
          router.replace("/(tabs)/login");
      }
    }
  }, [appIsReady, isAuthenticated, segments, userRole, router]);

  if (!appIsReady) {
    return null;
  }

  return <Slot />;
};

export default RootLayout;
