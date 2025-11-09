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

const CoordenadorScreen = () => {
  const role = useAuthStore((state) => state.userRole);
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const [logoutVisible, setLogoutVisible] = useState(false);

  if (role !== "coordenador") {
    return <Redirect href="/(tabs)/login" />;
  }

  return (
    <>
      <CatalogDashboard
        title="Painel da Coordenação"
        subtitle="Supervisione vagas, turmas e documentos críticos do estágio."
        onLogoutPress={() => setLogoutVisible(true)}
        actions={[
          {
            label: "Fluxo de cadastro de aluno",
            description: "Registrar novos estagiários e contratos em poucos passos.",
            onPress: () => router.push("/(tabs)/cadastroaluno"),
          },
          {
            label: "Distribuir orientadores",
            description: "Mapa rápido para acompanhar turmas por professor (em breve).",
            onPress: () => Alert.alert("Em breve", "Distribuição de orientadores estará disponível em breve."),
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

export default CoordenadorScreen;
