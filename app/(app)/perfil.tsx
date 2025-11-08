import React from 'react';
import { SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';
// Lembre-se de instalar os ícones se ainda não o fez: npx expo install @expo/vector-icons
import { MaterialCommunityIcons } from '@expo/vector-icons';

// --- 1. DEFINIÇÃO DE TIPOS E MOCKS ---

type UserProfile = {
  nome: string;
  matricula: string;
  contato: string;
  email: string;
  turma?: string; // Opcional
  periodo?: string; // Opcional, específico do aluno
  departamento?: string; // Opcional, específico do professor
  cursoCoordenado?: string; // Opcional, específico do coordenador
};

const mockAluno: UserProfile = {
  nome: 'Beatriz Costa',
  matricula: '202510301',
  contato: '(21) 91111-2222',
  email: 'beatriz.costa@email.com',
  turma: 'Análise e Des. de Sistemas - T1',
  periodo: '3º Período',
};

// mock variants kept only for quick manual testing. Remove unused ones to avoid lint warnings.

// --- 2. VARIÁVEL DE TESTE ---
// Mude esta linha para testar os diferentes perfis
const usuarioParaExibir = mockAluno; 

// --- 3. COMPONENTE AUXILIAR ---
const InfoRow = ({ icon, text }: { icon: keyof typeof MaterialCommunityIcons.glyphMap; text: string }) => (
  <View style={styles.infoRow}>
    <MaterialCommunityIcons name={icon} size={24} color="#555" style={styles.icon} />
    <Text style={styles.infoText}>{text}</Text>
  </View>
);

// --- 4. O COMPONENTE DA TELA ---
const ProfileScreen = () => {
  const user = usuarioParaExibir;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        
        {/* Card Principal */}
        <View style={styles.headerCard}>
          <View style={styles.avatar}>
            <MaterialCommunityIcons name="account-circle" size={60} color="#34495E" />
          </View>
          <Text style={styles.studentName}>{user.nome}</Text>
          <Text style={styles.studentMatricula}>Matrícula: {user.matricula}</Text>
        </View>

        {/* Card de Contato */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Informações de Contato</Text>
          <InfoRow icon="phone" text={user.contato} />
          <InfoRow icon="email" text={user.email} />
        </View>

        {/* Card de Informações Acadêmicas (Dinâmico) */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Informações Acadêmicas</Text>
          
          {/* Lógica de renderização condicional segura */}
          {user.turma ? <InfoRow icon="google-classroom" text={user.turma} /> : null}
          {user.periodo ? <InfoRow icon="calendar-clock" text={user.periodo} /> : null}
          {user.departamento ? <InfoRow icon="briefcase-outline" text={user.departamento} /> : null}
          {user.cursoCoordenado ? <InfoRow icon="star-circle-outline" text={user.cursoCoordenado} /> : null}
        </View>
      </View>
    </SafeAreaView>
  );
};

// --- 5. OS ESTILOS ---
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F0F2F5' },
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  headerCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 20, alignItems: 'center', marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#EAEFF2', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  studentName: { fontSize: 22, fontWeight: 'bold', color: '#2C3E50' },
  studentMatricula: { fontSize: 16, color: '#7F8C8D', marginTop: 4 },
  infoCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 20, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  cardTitle: { fontSize: 18, fontWeight: '600', color: '#34495E', marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#ECF0F1', paddingBottom: 10 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  icon: { marginRight: 15 },
  infoText: { fontSize: 16, color: '#34495E', flexShrink: 1 },
});

export default ProfileScreen;