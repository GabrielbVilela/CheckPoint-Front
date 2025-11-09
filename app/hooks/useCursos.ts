import { useCallback, useEffect, useState } from "react";

import { createCurso, CursoDTO, listCursos } from "@/services/catalogos";

export const useCursos = () => {
  const [cursos, setCursos] = useState<CursoDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCursos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listCursos();
      setCursos(data);
    } catch (err: any) {
      console.error("Erro ao carregar cursos:", err);
      const detail = err?.response?.data?.detail ?? err?.message ?? "Nao foi possivel carregar os cursos.";
      setError(detail);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCursos();
  }, [fetchCursos]);

  const handleCreate = useCallback(
    async (payload: { nome: string; carga_horaria_total?: number | null; competencias?: string | null }) => {
      setSubmitting(true);
      setError(null);
      try {
        await createCurso(payload);
        await fetchCursos();
      } catch (err: any) {
        console.error("Erro ao criar curso:", err);
        const detail = err?.response?.data?.detail ?? err?.message ?? "Nao foi possivel criar o curso.";
        setError(detail);
        throw err;
      } finally {
        setSubmitting(false);
      }
    },
    [fetchCursos]
  );

  return {
    cursos,
    loading,
    submitting,
    error,
    refresh: fetchCursos,
    createCurso: handleCreate,
  };
};

export default useCursos;
