import { openDB } from 'idb'

const DB_NAME = 'finance-tracker'
const DB_VERSION = 1
const STORE_EXPENSES = 'expenses'
const STORE_ACCOUNTS = 'accounts'

export async function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_EXPENSES)) {
        const exp = db.createObjectStore(STORE_EXPENSES, { keyPath: 'id', autoIncrement: true })
        exp.createIndex('date', 'date', { unique: false })
        exp.createIndex('accountId', 'accountId', { unique: false })
        exp.createIndex('category', 'category', { unique: false })
      }
      if (!db.objectStoreNames.contains(STORE_ACCOUNTS)) {
        db.createObjectStore(STORE_ACCOUNTS, { keyPath: 'id', autoIncrement: true })
      }
    },
  })
}

export async function addExpense(expense) {
  const db = await getDB()
  return db.add(STORE_EXPENSES, expense)
}

export async function addExpenses(expenses) {
  const db = await getDB()
  const tx = db.transaction(STORE_EXPENSES, 'readwrite')
  for (const e of expenses) {
    await tx.store.add(e)
  }
  return tx.done
}

export async function getAllExpenses() {
  const db = await getDB()
  return db.getAll(STORE_EXPENSES)
}

export async function getExpensesByDateRange(start, end) {
  const db = await getDB()
  const all = await db.getAll(STORE_EXPENSES)
  return all.filter((e) => {
    const d = new Date(e.date)
    return d >= start && d <= end
  })
}

export async function getExpensesSorted(limit = 25) {
  const db = await getDB()
  const all = await db.getAll(STORE_EXPENSES)
  all.sort((a, b) => new Date(b.date) - new Date(a.date))
  return limit ? all.slice(0, limit) : all
}

export async function getExpensesLastN(n) {
  const all = await getExpensesSorted(null)
  return all.slice(0, n)
}

export async function getAccounts() {
  const db = await getDB()
  return db.getAll(STORE_ACCOUNTS)
}

export async function addAccount(account) {
  const db = await getDB()
  return db.add(STORE_ACCOUNTS, account)
}
