import { useAuthStore } from "@/store/authStore";
import { router, SplashScreen, Stack, useSegments } from "expo-router";
import React, { useEffect } from "react";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // Selecionamos cada valor separadamente
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const userRole = useAuthStore((state) => state.userRole);

  const isLoading = false; 
  const segments = useSegments();

  // Mantenha os logs por enquanto para testar
  // Debug logs removidos para produção

  useEffect(() => {
    let mounted = true;
		(async () => {
			if (!isLoading && mounted) {
				try { await SplashScreen.hideAsync(); } catch { /* ignore */ }
			}
		})();
    return () => { mounted = false; };
  }, [isLoading]);

  if (isLoading) {
    return null; 
  }

  const inAuthGroup = segments[0] === '(auth)';

	if (!isAuthenticated && !inAuthGroup) {
		// redirecting to login because user is not authenticated and not in (auth)
		try { router.replace("/(auth)/login"); } catch { /* ignore */ }
		return null;
	}

	if (isAuthenticated && inAuthGroup) {
		// redirecting out of (auth) because user is authenticated and is in (auth)
		try {
					if (userRole === "aluno") {
						router.replace("/(app)" as any);
					} else if (userRole === "coordenador") {
						router.replace("/(app)/cadastroaluno" as any);
					} else {
						router.replace("/(app)" as any);
					}
			} catch { // ignore
			}
		return null;
	}
  
  // nenhum redirect aplicavel, renderizando Stack
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(app)" /> {/* <-- MUDANÇA AQUI */}
    </Stack>
  );
}