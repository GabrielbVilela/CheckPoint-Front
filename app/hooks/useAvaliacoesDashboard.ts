import { useCallback, useEffect, useMemo, useState } from "react";

import { AvaliacaoDTO, AvaliacaoRubricaDTO, listAvaliacoes, listRubricas } from "@/services/avaliacoes";

export const useAvaliacoesDashboard = () => {
  const [avaliacoes, setAvaliacoes] = useState<AvaliacaoDTO[]>([]);
  const [rubricas, setRubricas] = useState<AvaliacaoRubricaDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [avaliacoesData, rubricasData] = await Promise.all([listAvaliacoes(), listRubricas(true)]);
      setAvaliacoes(avaliacoesData);
      setRubricas(rubricasData);
    } catch (err: any) {
      console.error("Erro ao carregar avaliacoes:", err);
      const detail = err?.response?.data?.detail ?? err?.message ?? "Nao foi possivel carregar avaliacoes.";
      setError(detail);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const resumo = useMemo(() => {
    const total = avaliacoes.length;
    const concluidas = avaliacoes.filter((a) => a.status === "concluida").length;
    return { total, concluidas, pendentes: total - concluidas };
  }, [avaliacoes]);

  return {
    avaliacoes,
    rubricas,
    resumo,
    loading,
    error,
    refresh: fetchData,
  };
};

export default useAvaliacoesDashboard;
