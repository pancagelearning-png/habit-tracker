import { api } from './api'

const DEFAULT_CATEGORIES = [
  { name: 'Spiritual',        icon: '🙏', color: '#E84545', is_default: true },
  { name: 'Quit a bad habit', icon: '🚫', color: '#E84545', is_default: true },
  { name: 'Art',              icon: '🎨', color: '#FF6B9D', is_default: true },
  { name: 'Meditation',       icon: '🧘', color: '#9B59B6', is_default: true },
  { name: 'Study',            icon: '📚', color: '#6C63FF', is_default: true },
  { name: 'Sports',           icon: '⚽', color: '#3498DB', is_default: true },
  { name: 'Gym',              icon: '💪', color: '#2980B9', is_default: true },
  { name: 'Entertainment',    icon: '🎬', color: '#E67E22', is_default: true },
  { name: 'Social',           icon: '👥', color: '#1ABC9C', is_default: true },
  { name: 'Finance',          icon: '💰', color: '#27AE60', is_default: true },
  { name: 'Health',           icon: '❤️', color: '#E8445A', is_default: true },
  { name: 'Running',          icon: '🏃', color: '#2ECC71', is_default: true },
  { name: 'Work',             icon: '💼', color: '#34495E', is_default: true },
  { name: 'Nutrition',        icon: '🥗', color: '#F39C12', is_default: true },
  { name: 'Home',             icon: '🏠', color: '#795548', is_default: true },
  { name: 'Outdoor',          icon: '🌲', color: '#4CAF50', is_default: true },
  { name: 'Other',            icon: '📌', color: '#95A5A6', is_default: true },
]

export const categoriesService = {
  getAll:    ()         => api.get('/categories'),
  getCustom: ()         => api.get('/categories?is_default=false'),
  create:    (data)     => api.post('/categories', data),
  update:    (id, data) => api.put(`/categories/${id}`, data),
  delete:    (id)       => api.delete(`/categories/${id}`)
}

export async function seedDefaultCategories() {
  console.log('seeding default categories...')
  try {
    const data          = await categoriesService.getAll()
    const existing      = Array.isArray(data) ? data : (data?.categories || [])
    const existingNames = new Set(existing.map(c => c.name))
    const missing       = DEFAULT_CATEGORIES.filter(dc => !existingNames.has(dc.name))
    const created       = await Promise.all(missing.map(dc => categoriesService.create(dc).catch(() => null)))
    const newlyCreated  = created.filter(Boolean)
    console.log(`seedDefaultCategories: created ${newlyCreated.length} new default categories`)
    return [...existing, ...newlyCreated]
  } catch {
    return []
  }
}
