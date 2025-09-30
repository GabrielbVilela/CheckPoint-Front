import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// Lógica principal
// ...existing code...
import { usePointRegistration } from '../hooks/usePointRegistration';
// ...existing code...
import "expo-router/entry";
import { useAuthStore } from '../store/authStore';

// --- Dados Mockados do Usuário (Para exibição na Tela 2) ---
// Em um projeto avançado, você faria uma requisição à API para obter esses dados após o login
const mockUserInfo = {
    nome: 'Estagiário de Direito',
    matricula: '123456',
    curso: 'DIREITO',
    periodo: '5º',
    // O userRole virá do Zustand, este é apenas um exemplo
};
// -----------------------------------------------------------

const PointScreen = () => {
  const userRole = useAuthStore((state: any) => state.userRole);
  const isAuthenticated = useAuthStore((state: any) => state.isAuthenticated);

  // Protege contra requisições sem autenticação
  if (!isAuthenticated) {
    return null;
  }

  const {
    pointData,
    loading: isProcessing,
    error: pointError,
    capturePoint,
    confirmPointRegistration,
    cancelConfirmation
  } = usePointRegistration();

  // A tela de ponto só é visível para o Aluno
  const isAluno = userRole === 'aluno';
  
  // Função auxiliar para formatar a data/hora
  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    // Para fins de demonstração, o componente pode atualizar o relógio local a cada segundo
    const time = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const fullDate = date.toLocaleDateString('pt-BR');
    return { time, fullDate };
  };

  // 🔄 Estado para o Relógio em Tempo Real na UI (separado da lógica de ponto)
  const [localTime, setLocalTime] = useState(new Date().toISOString());

  useEffect(() => {
    if (!isAuthenticated) return;
    // Atualiza o relógio a cada segundo para o display visual
    const interval = setInterval(() => {
      setLocalTime(new Date().toISOString());
    }, 1000);
    return () => clearInterval(interval); // Limpeza ao desmontar
  }, [isAuthenticated]);

  // Usa o timestamp do ponto capturado (Tela 2) ou o relógio local (Tela 1)
  const displayTimestamp = pointData ? pointData.timestamp : localTime;
  const { time, fullDate } = formatTime(displayTimestamp);

  if (!isAluno) {
    return (
        <View style={[styles.container, { justifyContent: 'center' }]}>
            <Text style={styles.mainTitle}>ACESSO RESTRITO</Text>
            <Text style={styles.errorText}>Seu perfil ({userRole?.toUpperCase()}) não tem acesso a esta tela.</Text>
        </View>
    );
  }


  // 🛑 TELA 2: CONFIRMAÇÃO DE PONTO (image_4a4c0a.png)
  if (pointData) {
    return (
      <View style={styles.container}>
        <Text style={styles.mainTitle}>PONTO ELETRÔNICO</Text>
        
        <View style={styles.pointCard}>
          {/* Box de Informações do Colaborador, seguindo o protótipo */}
          <View style={styles.userInfoBox}>
            <Text style={styles.collaboratorTitle}>Colaborador</Text>
            <Text style={styles.userInfoText}>ALUNO: {mockUserInfo.nome}</Text>
            <Text style={styles.userInfoText}>MATRÍCULA: {mockUserInfo.matricula}</Text>
          </View>

          <Text style={styles.timeText}>{time}</Text>
          <Text style={styles.dateText}>{fullDate}</Text>
          
          <Text style={styles.confirmationText}>Confirmar o registro?</Text>
          
          <View style={styles.buttonGroup}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.cancelButton]} 
              onPress={cancelConfirmation} 
              disabled={isProcessing}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, styles.registerButton]} 
              onPress={confirmPointRegistration} 
              disabled={isProcessing}
            >
              {isProcessing
                ? <ActivityIndicator color="#fff" /> 
                : <Text style={styles.registerButtonText}>Registrar</Text>}
            </TouchableOpacity>
          </View>
        </View>
        {pointError && <Text style={styles.errorText}>{pointError}</Text>}
      </View>
    );
  }

  // 🟢 TELA 1: BATER PONTO (image_4a4924.png)
  return (
    <View style={styles.container}>
      <Text style={styles.mainTitle}>PONTO ELETRÔNICO</Text>

      <View style={styles.pointCard}>
        <Text style={styles.timeText}>{time}</Text>
        <Text style={styles.dateText}>{fullDate}</Text>
        
        {isProcessing 
          ? <ActivityIndicator size="large" color="#4CAF50" style={{ marginVertical: 20 }} />
          : (
            <TouchableOpacity 
              style={styles.mainButton} 
              onPress={capturePoint}
              // O botão só é habilitado se não houver erro de localização
              disabled={!!pointError} 
            >
              <Text style={styles.mainButtonText}>BATER PONTO !</Text>
            </TouchableOpacity>
          )}

        {pointError && <Text style={styles.errorText}>{pointError}</Text>}
      </View>
    </View>
  );
};

// --- Estilos Baseados nos Protótipos (Foco em Layout) ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 80, 
    backgroundColor: '#fff', // Fundo padrão branco
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 50,
  },
  pointCard: {
    width: '90%',
    maxWidth: 350,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    // Sombra (Opcional, mas melhora o visual no mobile)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3, 
  },
  userInfoBox: {
    width: '100%',
    padding: 10,
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'flex-start',
  },
  collaboratorTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
  },
  userInfoText: {
    fontSize: 14,
    color: '#333',
  },
  timeText: {
    fontSize: 50,
    fontWeight: 'bold',
    color: '#333',
  },
  dateText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 40,
  },
  mainButton: {
    backgroundColor: '#4CAF50', // Verde
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
  },
  mainButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  confirmationText: {
    fontSize: 18,
    marginVertical: 20,
    fontWeight: '600',
    color: '#333',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#E53935', // Vermelho
  },
  registerButton: {
    backgroundColor: '#4CAF50', // Verde
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#E53935',
    marginTop: 10,
    textAlign: 'center',
    fontWeight: 'bold',
  }
});

export default PointScreen;