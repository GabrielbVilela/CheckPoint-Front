import { useCallback, useEffect, useState } from "react";

import { AlunoResumo, fetchAlunos } from "@/services/alunos";

type LoadParams = {
  search?: string;
};

const useAlunosCatalog = () => {
  const [alunos, setAlunos] = useState<AlunoResumo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSearch, setLastSearch] = useState<string>("");

  const load = useCallback(
    async ({ search }: LoadParams = {}) => {
      setLoading(true);
      try {
        const data = await fetchAlunos({
          search: search?.trim() || undefined,
          limit: 100,
        });
        setAlunos(data);
        setLastSearch(search?.trim() ?? "");
        setError(null);
      } catch (err: any) {
        console.error("Erro ao carregar alunos:", err);
        const detail = err?.response?.data?.detail;
        setError(detail ?? "Nao foi possivel carregar alunos.");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    load();
  }, [load]);

  const refresh = useCallback(() => {
    load({ search: lastSearch || undefined });
  }, [lastSearch, load]);

  return {
    alunos,
    loading,
    error,
    load,
    refresh,
  };
};

export default useAlunosCatalog;
