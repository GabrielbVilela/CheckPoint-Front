import React from 'react';
import { Tabs } from 'expo-router';
// Lembre-se de instalar: npx expo install @expo/vector-icons
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function TabLayout() {
  // NOTA: O AuthGuard NÃO fica mais aqui.
  // Este arquivo agora SÓ define as abas da área logada.
  
  return (
    <Tabs>
      <Tabs.Screen
        name="index" // Tela principal (Bater Ponto)
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="home" color={color} size={28} />,
        }}
      />
      <Tabs.Screen
        name="perfil" // A tela de perfil que criamos
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="account-circle" color={color} size={28} />,
        }}
      />
      <Tabs.Screen
        name="cadastroaluno" // Tela de Cadastro (que coordenador vê)
        options={{
          title: 'Cadastrar Aluno',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="account-plus" color={color} size={28} />,
          // Você pode adicionar uma lógica para esconder esta aba se o usuário não for coordenador
        }}
      />
    </Tabs>
  );
}