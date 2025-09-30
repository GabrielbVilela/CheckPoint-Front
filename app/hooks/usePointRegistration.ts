import * as Location from 'expo-location'; // Requer expo install expo-location
import { useState } from 'react';
import { Alert } from 'react-native';
import api from '../services/api'; // Cliente Axios com Interceptor de Token
import { useAuthStore } from '../store/authStore';


interface PointData {
  latitude: number | null;
  longitude: number | null;
  timestamp: string; // Data e hora no formato ISO 8601
}

export const usePointRegistration = () => {
  const isAuthenticated = useAuthStore((state: any) => state.isAuthenticated);
  const [pointData, setPointData] = useState<PointData | null>(null); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Remove this duplicate capturePoint definition

  /**
   * Dispara o processo de captura de localização e tempo.
   */
  const capturePoint = async () => {
    const isAuthenticated = useAuthStore(state => state.isAuthenticated);
    if (!isAuthenticated) return;
    setLoading(true);
    setError(null);
    
    // 1. Solicitar Permissão
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setError('Permissão de acesso à localização negada. Habilite o GPS nas configurações.');
      setLoading(false);
      return;
    }

    try {
      // 2. Obter Localização (com alta precisão)
      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeInterval: 10000, // Tempo máximo para a busca
      });
      
      const newPointData: PointData = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        timestamp: new Date().toISOString(), 
      };

      // Define os dados, o que aciona a renderização da Tela 2 (Confirmação)
      setPointData(newPointData); 
      
    } catch (err) {
      console.error('Erro ao capturar localização:', err);
      setError('Não foi possível obter a sua localização. Verifique o GPS.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Envia os dados de ponto capturados para o backend.
   */
  const confirmPointRegistration = async () => {
    if (!isAuthenticated) return;
    if (!pointData) {
      setError('Nenhum dado de ponto para registrar.');
      return;
    }
    setLoading(true);
    setError(null);

    const payload = {
      timestamp: pointData.timestamp,
      latitude: pointData.latitude,
      longitude: pointData.longitude,
      // O token (usuário) é enviado via Interceptor do Axios.
    };

    try {
      // Usa o endpoint POST /registro
      const response = await api.post('/registro', payload);
      
      if (response.status === 201) { 
        Alert.alert('Sucesso', 'Ponto registrado! O backend está validando sua localização.');
        setPointData(null); // Limpa para voltar à Tela 1
      }
    } catch (err: any) {
      console.error('Erro ao registrar ponto:', err);
      // Extrai mensagem de erro da resposta da API
      const errorMessage = err.response?.data?.detail || 'Erro ao comunicar com o servidor.';
      setError(`Falha no Registro: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // Reseta o estado para voltar da Tela 2 para a Tela 1
  const cancelConfirmation = () => setPointData(null);

  return {
    pointData,
    loading,
    error,
    capturePoint,
    confirmPointRegistration,
    cancelConfirmation,
  };
};
export default usePointRegistration;