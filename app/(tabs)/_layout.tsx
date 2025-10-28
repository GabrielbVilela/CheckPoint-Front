import { useAuthStore } from "@/store/authStore";
import { Redirect, Stack, useSegments } from "expo-router";
import React from "react";

const TabsLayout = () => {
  const userRole = useAuthStore((state) => state.userRole);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const segments = useSegments();

  return (
    <Stack 
      screenOptions={{ 
        headerShown: false,
        animation: "none",
        gestureEnabled: false
      }}
    >
      {/* Tela de login sempre disponível */}
      <Stack.Screen 
        name="login" 
        options={{ 
          headerShown: false,
          gestureEnabled: false
        }} 
      />
      
      {/* Tela de ponto apenas para alunos autenticados */}
      <Stack.Screen 
        name="index" 
        options={{
          headerShown: false,
          gestureEnabled: false
        }}
      />
      
      {/* Tela de cadastro apenas para coordenadores autenticados */}
      <Stack.Screen 
        name="cadastroaluno" 
        options={{
          headerShown: false,
          gestureEnabled: false
        }}
      />
      
      {/* Redireciona usuários não autenticados para o login */}
      {!isAuthenticated && <Redirect href="/(tabs)/login" />}
      
      {/* Redireciona usuários autenticados para suas respectivas telas */}
      {isAuthenticated && userRole === "aluno" && segments[1] === "login" && (
        <Redirect href="/(tabs)" />
      )}
      {isAuthenticated && userRole === "coordenador" && segments[1] === "login" && (
        <Redirect href="/(tabs)/cadastroaluno" />
      )}
    </Stack>
  );
};

export default TabsLayout;
