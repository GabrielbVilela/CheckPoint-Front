import { useCallback, useEffect, useState } from "react";

import { DiarioDTO, listDiarios } from "@/services/diarios";
import { JustificativaDTO, listJustificativas } from "@/services/justificativas";

type QueuesState = {
  justificativas: JustificativaDTO[];
  diarios: DiarioDTO[];
};

const initialState: QueuesState = {
  justificativas: [],
  diarios: [],
};

export const useApprovalQueues = () => {
  const [queues, setQueues] = useState<QueuesState>(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [justificativas, diarios] = await Promise.all([
        listJustificativas("pendente"),
        listDiarios({ status: "pendente" }),
      ]);
      setQueues({ justificativas, diarios });
    } catch (err: any) {
      console.error("Falha ao carregar filas de aprovacao:", err);
      const message =
        err?.response?.data?.detail ??
        err?.message ??
        "Nao foi possivel carregar as pendencias.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    ...queues,
    loading,
    error,
    refresh: fetchData,
  };
};

export default useApprovalQueues;
