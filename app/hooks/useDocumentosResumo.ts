import { useCallback, useEffect, useState } from "react";

import { DocumentoResumoDTO, listDocumentosResumo } from "@/services/documentos";

const useDocumentosResumo = () => {
  const [resumo, setResumo] = useState<DocumentoResumoDTO>({ pendentes: 0, aprovados: 0, rejeitados: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchResumo = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listDocumentosResumo();
      setResumo(data);
    } catch (err: any) {
      console.error("Erro ao carregar resumo de documentos:", err);
      const detail =
        err?.response?.data?.detail ?? err?.message ?? "Nao foi possivel carregar o resumo de documentos.";
      setError(detail);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResumo();
  }, [fetchResumo]);

  return {
    resumo,
    loading,
    error,
    refresh: fetchResumo,
  };
};

export default useDocumentosResumo;
