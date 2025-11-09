import { useCallback, useEffect, useState } from "react";

import { createTurma, listTurmas, TurmaDTO } from "@/services/catalogos";

export const useTurmas = () => {
  const [turmas, setTurmas] = useState<TurmaDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTurmas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listTurmas();
      setTurmas(data);
    } catch (err: any) {
      console.error("Erro ao carregar turmas:", err);
      const detail = err?.response?.data?.detail ?? err?.message ?? "Nao foi possivel carregar as turmas.";
      setError(detail);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTurmas();
  }, [fetchTurmas]);

  const handleCreate = useCallback(
    async (payload: { nome: string; id_curso: number; ano?: number; semestre?: number; turno?: string | null }) => {
      setSubmitting(true);
      setError(null);
      try {
        await createTurma(payload);
        await fetchTurmas();
      } catch (err: any) {
        console.error("Erro ao criar turma:", err);
        const detail = err?.response?.data?.detail ?? err?.message ?? "Nao foi possivel criar a turma.";
        setError(detail);
        throw err;
      } finally {
        setSubmitting(false);
      }
    },
    [fetchTurmas]
  );

  return {
    turmas,
    loading,
    submitting,
    error,
    refresh: fetchTurmas,
    createTurma: handleCreate,
  };
};

export default useTurmas;
