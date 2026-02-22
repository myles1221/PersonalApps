import { useState, useCallback } from 'react'
import { addExpenses, getAllExpenses } from './db'
import { parseCSV, parsePastedStatement } from './parsers'
import { categorize } from './categorize'
import Dashboard, { ExpenseList } from './Dashboard'
import './App.css'

const DEFAULT_LIMIT = 25
const MAX_LIMIT = 1000

export default function App() {
  const [refreshKey, setRefreshKey] = useState(0)
  const [uploadError, setUploadError] = useState('')
  const [uploadSuccess, setUploadSuccess] = useState('')
  const [pasteText, setPasteText] = useState('')
  const [accountName, setAccountName] = useState('My account')
  const [showPaste, setShowPaste] = useState(false)

  const addSampleData = useCallback(async () => {
    const existing = await getAllExpenses()
    if (existing.length > 0) return
    const now = new Date()
    const sample = [
      { date: now.toISOString().slice(0, 10), amount: 42.5, description: 'AMAZON', accountName: 'Credit', category: categorize('AMAZON') },
      { date: new Date(now - 864e5 * 2).toISOString().slice(0, 10), amount: 15, description: 'COFFEE SHOP', accountName: 'Debit', category: categorize('COFFEE') },
      { date: new Date(now - 864e5 * 5).toISOString().slice(0, 10), amount: 68, description: 'GROCERY STORE', accountName: 'Debit', category: categorize('GROCERY') },
      { date: new Date(now - 864e5 * 8).toISOString().slice(0, 10), amount: 35, description: 'GAS STATION', accountName: 'Credit', category: categorize('GAS') },
      { date: new Date(now - 864e5 * 12).toISOString().slice(0, 10), amount: 12.99, description: 'NETFLIX', accountName: 'Credit', category: categorize('NETFLIX') },
    ]
    await addExpenses(sample)
    setUploadSuccess('Sample data added. Refresh to see charts.')
    refresh()
  }, [refresh])

  const refresh = useCallback(() => {
    setRefreshKey((k) => k + 1)
  }, [])

  const handleFile = useCallback(
    async (e) => {
      setUploadError('')
      setUploadSuccess('')
      const file = e.target.files?.[0]
      if (!file) return
      const name = accountName.trim() || file.name.replace(/\.[^.]*$/, '')
      const text = await file.text()
      let expenses = []
      if (file.name.toLowerCase().endsWith('.csv')) {
        expenses = parseCSV(text, null, name)
      } else {
        setUploadError('Only CSV files are supported. For PDF statements, copy the text and paste below.')
        e.target.value = ''
        return
      }
      if (expenses.length === 0) {
        setUploadError('No valid transactions found. CSV should have columns like Date, Amount, Description.')
        e.target.value = ''
        return
      }
      try {
        await addExpenses(expenses)
        setUploadSuccess(`Imported ${expenses.length} transactions.`)
        refresh()
      } catch (err) {
        setUploadError(err?.message || 'Import failed.')
      }
      e.target.value = ''
    },
    [accountName, refresh]
  )

  const handlePaste = useCallback(
    async (e) => {
      e.preventDefault()
      setUploadError('')
      setUploadSuccess('')
      const name = accountName.trim() || 'Pasted'
      const expenses = parsePastedStatement(pasteText, null, name)
      if (expenses.length === 0) {
        setUploadError('No amounts found in pasted text. Paste lines that contain dates and amounts.')
        return
      }
      try {
        await addExpenses(expenses)
        setUploadSuccess(`Imported ${expenses.length} transactions.`)
        setPasteText('')
        setShowPaste(false)
        refresh()
      } catch (err) {
        setUploadError(err?.message || 'Import failed.')
      }
    },
    [pasteText, accountName, refresh]
  )

  return (
    <div className="app">
      <header className="header">
        <h1>Finance Tracker</h1>
        <p className="tagline">Local on your device · No account</p>
      </header>

      <section className="upload-section">
        <label className="upload-label">Account / source name</label>
        <input
          type="text"
          className="input account-name"
          placeholder="e.g. Chase Credit, Debit"
          value={accountName}
          onChange={(e) => setAccountName(e.target.value)}
        />
        <div className="upload-row">
          <label className="btn btn-primary">
            Upload CSV
            <input type="file" accept=".csv" onChange={handleFile} hidden />
          </label>
          <button type="button" className="btn btn-secondary" onClick={() => setShowPaste((v) => !v)}>
            {showPaste ? 'Cancel paste' : 'Paste statement'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={addSampleData} title="Add demo data if you have none">
            Try sample data
          </button>
        </div>
        {showPaste && (
          <form className="paste-form" onSubmit={handlePaste}>
            <textarea
              className="textarea"
              placeholder="Paste statement text (lines with date and amount)..."
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              rows={4}
            />
            <button type="submit" className="btn btn-primary">Import from paste</button>
          </form>
        )}
        {uploadError && <p className="message error">{uploadError}</p>}
        {uploadSuccess && <p className="message success">{uploadSuccess}</p>}
      </section>

      <main className="main">
        <Dashboard refreshKey={refreshKey} />
        <ExpenseList refreshKey={refreshKey} defaultLimit={DEFAULT_LIMIT} maxLimit={MAX_LIMIT} />
      </main>
    </div>
  )
}
