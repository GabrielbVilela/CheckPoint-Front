import AsyncStorage from "@react-native-async-storage/async-storage";
import { getEndpoints } from "@/config/env";
import getApiClient from "@/services/api";

const STORAGE_KEY = "offline_point_queue";

export type OfflinePointPayload = {
  idAluno: number;
  latitude: number | null;
  longitude: number | null;
  timestamp: string;
};

export type OfflineQueueItem = {
  id: string;
  payload: OfflinePointPayload;
  createdAt: string;
  attempts: number;
  lastError?: string;
};

export type SyncResult = {
  sent: number;
  pending: number;
  errors: number;
};

const parseQueue = (raw: string | null): OfflineQueueItem[] => {
  if (!raw) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch (error) {
    console.warn("[offlineQueue] Falha ao ler fila, limpando...", error);
    return [];
  }
};

const serializeQueue = (queue: OfflineQueueItem[]) => JSON.stringify(queue);

const randomId = () => `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;

const readQueue = async (): Promise<OfflineQueueItem[]> => {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return parseQueue(raw);
};

const writeQueue = async (queue: OfflineQueueItem[]) => {
  await AsyncStorage.setItem(STORAGE_KEY, serializeQueue(queue));
};

export const getOfflineQueueLength = async (): Promise<number> => {
  const queue = await readQueue();
  return queue.length;
};

export const enqueueOfflinePoint = async (payload: OfflinePointPayload) => {
  const queue = await readQueue();
  const item: OfflineQueueItem = {
    id: randomId(),
    payload,
    createdAt: new Date().toISOString(),
    attempts: 0,
  };
  queue.push(item);
  await writeQueue(queue);
  return item;
};

const extractErrorMessage = (error: any) => {
  if (typeof error?.message === "string") {
    return error.message;
  }
  if (typeof error?.response?.data?.detail === "string") {
    return error.response.data.detail;
  }
  return "Erro desconhecido ao sincronizar ponto offline.";
};

export const syncOfflinePoints = async (): Promise<SyncResult> => {
  const queue = await readQueue();
  if (queue.length === 0) {
    return { sent: 0, pending: 0, errors: 0 };
  }

  const api = getApiClient();
  const endpoints = getEndpoints();
  const remaining: OfflineQueueItem[] = [];
  let sent = 0;
  let errors = 0;

  for (const item of queue) {
    try {
      const payload = {
        id_aluno: item.payload.idAluno,
        latitude_atual: item.payload.latitude,
        longitude_atual: item.payload.longitude,
      };
      await api.post(endpoints.verificarLocalizacao, payload);
      await api.post(endpoints.registro, payload);
      sent += 1;
    } catch (error) {
      errors += 1;
      remaining.push({
        ...item,
        attempts: (item.attempts ?? 0) + 1,
        lastError: extractErrorMessage(error),
      });
    }
  }

  await writeQueue(remaining);

  return { sent, pending: remaining.length, errors };
};
