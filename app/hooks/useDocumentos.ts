import { useCallback, useEffect, useMemo, useState } from "react";

import {
  createDocumento,
  deleteDocumento,
  DocumentoDTO,
  DocumentoFilterParams,
  DocumentoPayload,
  listDocumentos,
  updateDocumento,
} from "@/services/documentos";

export const useDocumentos = (filters?: DocumentoFilterParams) => {
  const [documentos, setDocumentos] = useState<DocumentoDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const payload = useMemo(() => {
    if (!filters) {
      return undefined;
    }
    const entries = Object.entries(filters).filter(([, value]) => value !== undefined && value !== null && value !== "");
    if (entries.length === 0) {
      return undefined;
    }
    return Object.fromEntries(entries) as DocumentoFilterParams;
  }, [filters]);

  const fetchDocumentos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listDocumentos(payload);
      setDocumentos(data);
    } catch (err: any) {
      console.error("Erro ao carregar documentos:", err);
      const detail = err?.response?.data?.detail ?? err?.message ?? "Não foi possível carregar os documentos.";
      setError(detail);
    } finally {
      setLoading(false);
    }
  }, [payload]);

  useEffect(() => {
    fetchDocumentos();
  }, [fetchDocumentos]);

  const handleCreate = useCallback(
    async (payloadCreate: DocumentoPayload) => {
      setSubmitting(true);
      setError(null);
      try {
        await createDocumento(payloadCreate);
        await fetchDocumentos();
      } catch (err: any) {
        console.error("Erro ao criar documento:", err);
        const detail = err?.response?.data?.detail ?? err?.message ?? "Não foi possível criar o documento.";
        setError(detail);
        throw err;
      } finally {
        setSubmitting(false);
      }
    },
    [fetchDocumentos]
  );

  const handleUpdate = useCallback(
    async (id: number, payloadUpdate: Partial<DocumentoPayload> & { status?: string }) => {
      setSubmitting(true);
      setError(null);
      try {
        await updateDocumento(id, payloadUpdate);
        await fetchDocumentos();
      } catch (err: any) {
        console.error("Erro ao atualizar documento:", err);
        const detail = err?.response?.data?.detail ?? err?.message ?? "Não foi possível atualizar o documento.";
        setError(detail);
        throw err;
      } finally {
        setSubmitting(false);
      }
    },
    [fetchDocumentos]
  );

  const handleDelete = useCallback(
    async (id: number) => {
      setSubmitting(true);
      setError(null);
      try {
        await deleteDocumento(id);
        await fetchDocumentos();
      } catch (err: any) {
        console.error("Erro ao remover documento:", err);
        const detail = err?.response?.data?.detail ?? err?.message ?? "Não foi possível remover o documento.";
        setError(detail);
        throw err;
      } finally {
        setSubmitting(false);
      }
    },
    [fetchDocumentos]
  );

  return {
    documentos,
    loading,
    submitting,
    error,
    refresh: fetchDocumentos,
    createDocumento: handleCreate,
    updateDocumento: handleUpdate,
    deleteDocumento: handleDelete,
  };
};

export default useDocumentos;
