import { createContext, useContext, useState, useCallback } from 'react'
import api from '../api/axios'

const FinanceContext = createContext(null)

export const FinanceProvider = ({ children }) => {
  const [summary, setSummary] = useState({ total_income: 0, total_expense: 0, balance: 0 })
  const [transactions, setTransactions] = useState([])
  const [categories, setCategories] = useState([])
  const [budgets, setBudgets] = useState([])
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchSummary = useCallback(async () => {
    try {
      const { data } = await api.get('/transactions/summary')
      setSummary(data.data)
    } catch (e) { console.error(e) }
  }, [])

  const fetchTransactions = useCallback(async (params = {}) => {
    setLoading(true)
    try {
      const { data } = await api.get('/transactions', { params })
      setTransactions(data.data)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [])

  const fetchCategories = useCallback(async () => {
    try {
      const { data } = await api.get('/transactions/categories')
      setCategories(data.data)
    } catch (e) { console.error(e) }
  }, [])

  const fetchBudgets = useCallback(async () => {
    try {
      const { data } = await api.get('/budgets')
      setBudgets(data.data)
    } catch (e) { console.error(e) }
  }, [])

  const fetchAlerts = useCallback(async () => {
    try {
      const { data } = await api.get('/budgets/alerts')
      setAlerts(data.data)
    } catch (e) { console.error(e) }
  }, [])

  const refreshAll = useCallback(() => {
    fetchSummary()
    fetchTransactions()
    fetchCategories()
    fetchBudgets()
    fetchAlerts()
  }, [fetchSummary, fetchTransactions, fetchCategories, fetchBudgets, fetchAlerts])

  return (
    <FinanceContext.Provider value={{
      summary, transactions, categories, budgets, alerts, loading,
      fetchSummary, fetchTransactions, fetchCategories, fetchBudgets, fetchAlerts, refreshAll,
      setSummary, setTransactions
    }}>
      {children}
    </FinanceContext.Provider>
  )
}

export const useFinance = () => {
  const ctx = useContext(FinanceContext)
  if (!ctx) throw new Error('useFinance must be used inside FinanceProvider')
  return ctx
}
