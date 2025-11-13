import { useCallback, useEffect, useState } from "react";

import { DocumentoAnalyticsItem, listDocumentosAnalytics } from "@/services/documentos";

export interface DocumentosAnalyticsData {
  curso: DocumentoAnalyticsItem[];
  empresa: DocumentoAnalyticsItem[];
  periodo: DocumentoAnalyticsItem[];
}

const useDocumentosAnalytics = () => {
  const [data, setData] = useState<DocumentosAnalyticsData>({ curso: [], empresa: [], periodo: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [curso, empresa, periodo] = await Promise.all([
        listDocumentosAnalytics("curso"),
        listDocumentosAnalytics("empresa"),
        listDocumentosAnalytics("periodo"),
      ]);
      setData({ curso, empresa, periodo });
    } catch (err: any) {
      console.error("Erro ao carregar analytics de documentos:", err);
      const detail = err?.response?.data?.detail ?? err?.message ?? "Não foi possível carregar os analytics.";
      setError(detail);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refresh: fetchData,
  };
};

export default useDocumentosAnalytics;

