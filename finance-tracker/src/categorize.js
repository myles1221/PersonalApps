// Auto-categorize by merchant/description keywords. Add your own rules.
const RULES = [
  { category: 'Groceries', keywords: ['grocery', 'supermarket', 'safeway', 'kroger', 'whole foods', 'trader joe', 'aldi', 'walmart', 'costco', 'food lion', 'publix'] },
  { category: 'Food & Dining', keywords: ['restaurant', 'cafe', 'coffee', 'starbucks', 'mcdonald', 'uber eats', 'doordash', 'grubhub', 'chipotle', 'subway', 'pizza', 'dining', 'bar ', 'pub'] },
  { category: 'Transport', keywords: ['gas', 'fuel', 'uber', 'lyft', 'parking', 'transit', 'metro', 'bus', 'train', 'toll', 'shell', 'chevron', 'exxon', 'mobil'] },
  { category: 'Shopping', keywords: ['amazon', 'target', 'ebay', 'etsy', 'best buy', 'apple.com', 'shop', 'store'] },
  { category: 'Bills & Utilities', keywords: ['electric', 'water', 'gas utility', 'internet', 'phone', 'mobile', 'verizon', 'att', 'comcast', 'insurance', 'rent', 'mortgage'] },
  { category: 'Entertainment', keywords: ['netflix', 'spotify', 'hulu', 'disney', 'movie', 'cinema', 'game', 'steam', 'playstation', 'xbox', 'youtube'] },
  { category: 'Health', keywords: ['pharmacy', 'cvs', 'walgreens', 'doctor', 'hospital', 'medical', 'dental', 'gym', 'health'] },
  { category: 'Other', keywords: [] },
]

const CATEGORY_ORDER = RULES.map((r) => r.category)
const FALLBACK = 'Other'

export function getCategoryKeys() {
  return CATEGORY_ORDER
}

export function categorize(description = '') {
  const lower = (description || '').toLowerCase()
  for (const { category, keywords } of RULES) {
    if (category === FALLBACK) continue
    if (keywords.some((k) => lower.includes(k))) return category
  }
  return FALLBACK
}

export function getCategoryColor(category) {
  const colors = {
    'Food & Dining': '#34d399',
    Transport: '#38bdf8',
    Shopping: '#a78bfa',
    'Bills & Utilities': '#fbbf24',
    Entertainment: '#f472b6',
    Health: '#2dd4bf',
    Groceries: '#4ade80',
    Other: '#94a3b8',
  }
  return colors[category] || colors.Other
}
