import CatalogDashboard from "@/components/dashboard/CatalogDashboard";
import CourseManager from "@/components/catalog/CourseManager";
import TurmaManager from "@/components/catalog/TurmaManager";
import CompanyManager from "@/components/catalog/CompanyManager";
import SupervisorManager from "@/components/catalog/SupervisorManager";
import ConvenioManager from "@/components/catalog/ConvenioManager";
import DocumentManager from "@/components/catalog/DocumentManager";
import ImportAlunosWizard from "@/components/catalog/ImportAlunosWizard";
import StudentManager from "@/components/catalog/StudentManager";
import ReportsSnapshot from "@/components/dashboard/ReportsSnapshot";
import LogoutConfirm from "@/components/LogoutConfirm";
import { useAuthStore } from "@/store/authStore";
import { Redirect, useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert } from "react-native";

const AdminScreen = () => {
  const role = useAuthStore((state) => state.userRole);
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const [logoutVisible, setLogoutVisible] = useState(false);

  if (role !== "admin") {
    return <Redirect href="/(tabs)/login" />;
  }

  return (
    <>
      <CatalogDashboard
        title="Central Administrativa"
        subtitle="Visão consolidada dos cadastros institucionais e convênios ativos."
        onLogoutPress={() => setLogoutVisible(true)}
        actions={[
          {
            label: "Cadastrar aluno completo",
            description: "Abrir o fluxo de cadastro integrado de aluno + contrato.",
            onPress: () => router.push("/(tabs)/cadastroaluno"),
          },
          {
            label: "Gerenciar turmas",
            description: "Organize novas turmas e distribua orientadores.",
            onPress: () => Alert.alert("Em breve", "Gestão de turmas estará disponível em uma próxima entrega."),
          },
          {
            label: "Empresas & Convênios",
            description: "Acompanhe parcerias e renovações pendentes.",
            onPress: () =>
              Alert.alert("Em breve", "O módulo de empresas/convênios será integrado ao app nas próximas sprints."),
          },
        ]}
      >
        <StudentManager />
        <CourseManager />
        <TurmaManager />
        <CompanyManager />
        <SupervisorManager />
        <ConvenioManager />
        <DocumentManager />
        <ImportAlunosWizard />
        <ReportsSnapshot />
      </CatalogDashboard>
      <LogoutConfirm
        visible={logoutVisible}
        onCancel={() => setLogoutVisible(false)}
        onConfirm={async () => {
          await logout();
          setLogoutVisible(false);
          router.replace("/(tabs)/login");
        }}
      />
    </>
  );
};

export default AdminScreen;
