import { Redirect, SplashScreen, Stack, useSegments } from "expo-router";
import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";

SplashScreen.preventAutoHideAsync();

type AuthGuardProps = {
  ready: boolean;
};

const AuthGuard: React.FC<AuthGuardProps> = ({ ready }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const segments = useSegments();
  const inAuthGroup = segments[segments.length - 1] === "login";

  if (!ready) {
    return null;
  }

  if (!isAuthenticated && !inAuthGroup) {
    return <Redirect href="/(tabs)/login" />;
  }

  if (isAuthenticated && inAuthGroup) {
    return <Redirect href="/(tabs)" />;
  }

  return null;
};

const RootLayout = () => {
  const loadAuth = useAuthStore((state) => state.loadAuth);
  const [ready, setReady] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    if (hasLoaded) {
      return;
    }

    let mounted = true;
    const bootstrap = async () => {
      try {
        await loadAuth();
      } catch (error) {
        console.error("Erro ao carregar credenciais:", error);
      } finally {
        if (mounted) {
          setReady(true);
          setHasLoaded(true);
          SplashScreen.hideAsync();
        }
      }
    };

    bootstrap();

    return () => {
      mounted = false;
    };
  }, [hasLoaded, loadAuth]);

  return (
    <>
      <AuthGuard ready={ready} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="cadastroaluno" options={{ headerShown: false }} />
      </Stack>
    </>
  );
};

export default RootLayout;

