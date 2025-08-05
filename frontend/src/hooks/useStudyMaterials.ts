import { useState, useEffect, useCallback } from 'react'
import {
  getStudyMaterials,
  getStudyMaterialById,
  deleteStudyMaterial,
  StudyMaterial,
  StudyMaterialDetailed,
  ApiException,
} from '../services/aiServices'
import { useAuth } from './useAuth'

interface UseStudyMaterialsReturn {
  materials: StudyMaterial[]
  loading: boolean
  error: string | null
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  loadMaterials: (page?: number, limit?: number) => Promise<void>
  deleteMaterial: (id: string) => Promise<void>
  refresh: () => Promise<void>
}

export function useStudyMaterials(
  initialPage: number = 1,
  initialLimit: number = 20,
): UseStudyMaterialsReturn {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const [materials, setMaterials] = useState<StudyMaterial[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: initialPage,
    limit: initialLimit,
    total: 0,
    totalPages: 0,
  })

  const loadMaterials = useCallback(
    async (page: number = 1, limit: number = 20) => {
      try {
        setLoading(true)
        setError(null)

        const response = await getStudyMaterials(page, limit)

        setMaterials(response.data)
        setPagination(response.pagination)
      } catch (err) {
        if (err instanceof ApiException) {
          setError(err.message)
        } else {
          setError('Erro ao carregar materiais de estudo')
        }
        console.error('Erro ao carregar materiais:', err)
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  const deleteMaterial = useCallback(
    async (id: string) => {
      try {
        await deleteStudyMaterial(id)
        // Atualizar a lista removendo o item deletado
        setMaterials((prev) => prev.filter((material) => material.id !== id))

        // Se a página atual ficou vazia e não é a primeira página, voltar uma página
        if (materials.length === 1 && pagination.page > 1) {
          await loadMaterials(pagination.page - 1)
        } else {
          await loadMaterials()
        }
      } catch (err) {
        if (err instanceof ApiException) {
          setError(err.message)
        } else {
          setError('Erro ao deletar material de estudo')
        }
        console.error('Erro ao deletar material:', err)
        throw err
      }
    },
    [materials.length, pagination.page, loadMaterials],
  )

  const refresh = useCallback(() => {
    return loadMaterials()
  }, [loadMaterials])

  useEffect(() => {
    // Só carregar materiais se o usuário estiver autenticado e não estiver carregando
    if (!authLoading && isAuthenticated) {
      // Chamada direta para evitar dependência circular
      const loadInitialMaterials = async () => {
        try {
          setLoading(true)
          setError(null)

          const response = await getStudyMaterials(initialPage, initialLimit)

          setMaterials(response.data)
          setPagination(response.pagination)
        } catch (err) {
          if (err instanceof ApiException) {
            setError(err.message)
          } else {
            setError('Erro ao carregar materiais de estudo')
          }
          console.error('Erro ao carregar materiais:', err)
        } finally {
          setLoading(false)
        }
      }

      loadInitialMaterials()
    } else if (!authLoading && !isAuthenticated) {
      // Se não estiver autenticado, limpar estado
      setMaterials([])
      setLoading(false)
      setError(null)
    }
  }, [authLoading, isAuthenticated, initialPage, initialLimit]) // Dependências específicas

  return {
    materials,
    loading,
    error,
    pagination,
    loadMaterials,
    deleteMaterial,
    refresh,
  }
}

interface UseStudyMaterialDetailReturn {
  material: StudyMaterialDetailed | null
  loading: boolean
  error: string | null
  loadMaterial: (id: string) => Promise<void>
  clearMaterial: () => void
}

export function useStudyMaterialDetail(): UseStudyMaterialDetailReturn {
  const [material, setMaterial] = useState<StudyMaterialDetailed | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadMaterial = useCallback(async (id: string) => {
    try {
      setLoading(true)
      setError(null)

      const response = await getStudyMaterialById(id)
      setMaterial(response)
    } catch (err) {
      if (err instanceof ApiException) {
        setError(err.message)
      } else {
        setError('Erro ao carregar material de estudo')
      }
      console.error('Erro ao carregar material:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const clearMaterial = useCallback(() => {
    setMaterial(null)
    setError(null)
  }, [])

  return {
    material,
    loading,
    error,
    loadMaterial,
    clearMaterial,
  }
}
