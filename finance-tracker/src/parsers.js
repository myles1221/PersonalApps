import { categorize } from './categorize'

// Normalize date to YYYY-MM-DD
function toDateStr(val) {
  if (!val) return null
  const d = new Date(val)
  if (isNaN(d.getTime())) return null
  return d.toISOString().slice(0, 10)
}

// Parse amount: strip $ and commas, return positive number for expense
function parseAmount(val) {
  if (val == null || val === '') return null
  const s = String(val).replace(/[$,\s]/g, '')
  const n = parseFloat(s)
  if (Number.isNaN(n)) return null
  return Math.abs(n)
}

// One expense: { date, amount, description, accountId?, accountName?, category }
export function parseCSV(text, accountId = null, accountName = 'Upload') {
  const lines = text.trim().split(/\r?\n/)
  if (lines.length < 2) return []
  const headers = lines[0].toLowerCase().split(/,\s*/).map((h) => h.replace(/^["']|["']$/g, ''))
  const dateIdx = headers.findIndex((h) => /date|posting|trans/.test(h))
  const amtIdx = headers.findIndex((h) => /amount|debit|transaction|amt/.test(h))
  const descIdx = headers.findIndex((h) => /description|merchant|name|detail|memo/.test(h))
  const expenses = []
  for (let i = 1; i < lines.length; i++) {
    const row = parseCSVRow(lines[i])
    const date = toDateStr(dateIdx >= 0 ? row[dateIdx] : null) || toDateStr(new Date())
    const amount = parseAmount(amtIdx >= 0 ? row[amtIdx] : row.find((c) => /^\s*\$?[\d,]+\.?\d*\s*$/.test(c))))
    const description = (descIdx >= 0 ? row[descIdx] : row.join(' ')) || 'Unknown'
    if (amount && amount > 0) {
      expenses.push({
        date,
        amount,
        description: description.trim(),
        accountId,
        accountName,
        category: categorize(description),
      })
    }
  }
  return expenses
}

function parseCSVRow(line) {
  const out = []
  let cur = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const c = line[i]
    if (c === '"') {
      inQuotes = !inQuotes
    } else if ((c === ',' && !inQuotes) || c === '\t') {
      out.push(cur.trim())
      cur = ''
    } else {
      cur += c
    }
  }
  out.push(cur.trim())
  return out
}

// Parse pasted statement text: look for lines like "Jan 15  AMAZON  -$42.00" or "02/01  GAS STATION  50.00"
const DATE_RE = /(\d{1,2})[\/\-](\d{1,2})[\/\-]?(\d{2,4})?|(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{1,2},?\s+\d{2,4}|\d{1,2}\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{2,4}/
const AMOUNT_RE = /[-]?\$?\s*[\d,]+\.?\d{2}/

export function parsePastedStatement(text, accountId = null, accountName = 'Pasted') {
  const lines = text.split(/\n/)
  const expenses = []
  const months = { jan:1,feb:2,mar:3,apr:4,may:5,jun:6,jul:7,aug:8,sep:9,oct:10,nov:11,dec:12 }
  for (const line of lines) {
    const amountMatch = line.match(AMOUNT_RE)
    if (!amountMatch) continue
    const amount = parseAmount(amountMatch[0])
    if (!amount || amount <= 0) continue
    let dateStr = null
    const dateMatch = line.match(DATE_RE)
    if (dateMatch) {
      const g = dateMatch
      if (g[4]) {
        const m = months[g[4].toLowerCase().slice(0,3)]
        const day = parseInt(g[0].replace(/[^\d]/g, '').slice(-2) || 1
        const year = parseInt(line.match(/\d{4}/)?.[0]) || new Date().getFullYear()
        if (m) dateStr = `${year}-${String(m).padStart(2,'0')}-${String(day).padStart(2,'0')}`
      } else if (g[1] && g[2]) {
        const y = g[3] ? (g[3].length === 2 ? '20' + g[3] : g[3]) : new Date().getFullYear()
        dateStr = `${y}-${String(g[2]).padStart(2,'0')}-${String(g[1]).padStart(2,'0')}`
      }
    }
    const desc = line.replace(AMOUNT_RE, '').replace(DATE_RE, '').replace(/^\s*[-*]\s*/, '').trim() || 'Unknown'
    if (desc.length < 2) continue
    expenses.push({
      date: dateStr || toDateStr(new Date()),
      amount,
      description: desc.slice(0, 200),
      accountId,
      accountName,
      category: categorize(desc),
    })
  }
  return expenses
}
