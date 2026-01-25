// Fallback Telugu sample data for local development when API fails or returns wrong tenant data

interface NewsArticle {
  article_id?: string
  title?: string
  description?: string
  content?: string
  image_url?: string
  category?: string[]
  creator?: string[]
  pubDate?: string
  [key: string]: unknown
}

// Load articles from public/data.json or public/news/*.json
let cachedArticles: NewsArticle[] | null = null
const categoryFileMap: Record<string, string> = {
  'latest': 'latest.json',
  'breaking': 'breaking.json',
  'sports': 'sports.json',
  'entertainment': 'entertainment.json',
  'business': 'business.json',
  'political': 'political.json',
  'politics': 'political.json',
  'crime': 'crime.json',
  'health': 'health.json',
  'education': 'education.json',
  'lifestyle': 'lifestyle.json',
  'world': 'world.json',
}

async function loadPublicData() {
  if (cachedArticles) return cachedArticles
  
  try {
    // In server-side context, read from file system
    // Skip in Edge Runtime - check for process.cwd availability
    if (typeof window === 'undefined' && typeof process !== 'undefined' && process.cwd) {
      const fs = await import('fs/promises')
      const path = await import('path')
      
      // Load all category JSON files and combine them
      const allArticles: NewsArticle[] = []
      
      for (const [categorySlug, filename] of Object.entries(categoryFileMap)) {
        try {
          const filePath = path.join(process.cwd(), 'public', 'news', filename)
          const fileContent = await fs.readFile(filePath, 'utf-8')
          const articles = JSON.parse(fileContent) as NewsArticle[]
          
          // Tag articles with category
          articles.forEach(article => {
            if (!article.category || article.category.length === 0) {
              article.category = [categorySlug]
            }
          })
          
          allArticles.push(...articles)
        } catch (err) {
          // Skip if file doesn't exist
        }
      }
      
      // If category files loaded, use them
      if (allArticles.length > 0) {
        cachedArticles = allArticles
        console.log(`✅ Loaded ${cachedArticles.length} articles from public/news/*.json`)
        return cachedArticles
      }
      
      // Fallback to data.json
      const dataFilePath = path.join(process.cwd(), 'public', 'data.json')
      const fileContent = await fs.readFile(dataFilePath, 'utf-8')
      cachedArticles = JSON.parse(fileContent)
      if (cachedArticles && cachedArticles.length > 0) {
        console.log(`✅ Loaded ${cachedArticles.length} articles from public/data.json`)
      }
      return cachedArticles
    }
  } catch (error) {
    console.error('❌ Failed to load public data:', error)
  }
  
  return []
}

// REMOVED: loadCategoryData - all public/news/*.json are mock data only
// Backend APIs should be used for real data

// REMOVED: loadAllCategoryData - all public/news/*.json are mock data only

// Get category slug from filename or article category
function getCategorySlug(item: NewsArticle, filename?: string): string {
  // If loaded from specific category file, use that
  if (filename) return filename
  
  // Otherwise extract from article categories
  if (Array.isArray(item.category) && item.category.length > 0) {
    const cat = item.category[0].toLowerCase()
    // Map common variations to our standard slugs
    if (cat === 'politics') return 'political'
    if (cat === 'tech') return 'technology'
    return cat
  }
  return 'latest'
}

// Transform public data.json format to our article format
function transformPublicArticle(item: NewsArticle, index: number, filename?: string) {
  const categorySlug = getCategorySlug(item, filename)
  const categoryName = getCategoryNameInTelugu(categorySlug)
    
  return {
    id: item.article_id || `article-${index}`,
    title: item.title || 'శీర్షిక లేదు',
    slug: item.article_id || `article-${index}`,
    excerpt: item.description || item.content?.substring(0, 150) || '',
    content: item.content || item.description || '',
    imageUrl: item.image_url || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800',
    category: { 
      id: `cat-${categorySlug}`,
      name: categoryName,
      slug: categorySlug
    },
    author: { 
      name: Array.isArray(item.creator) && item.creator[0] 
        ? item.creator[0] 
        : 'కబుర్లు డెస్క్'
    },
    publishedAt: item.pubDate || new Date().toISOString(),
    featured: index < 5,
  }
}

// Map English category names to Telugu - comprehensive mapping
function getCategoryNameInTelugu(category: string): string {
  const categoryMap: Record<string, string> = {
    'latest': 'లేటెస్ట్',
    'breaking': 'బ్రేకింగ్',
    'top': 'ముఖ్యాంశాలు',
    'sports': 'క్రీడలు',
    'entertainment': 'వినోదం',
    'lifestyle': 'జీవనశైలి',
    'politics': 'రాజకీయాలు',
    'political': 'రాజకీయాలు',
    'business': 'వ్యాపారం',
    'technology': 'టెక్నాలజీ',
    'tech': 'టెక్నాలజీ',
    'health': 'ఆరోగ్యం',
    'education': 'విద్య',
    'national': 'జాతీయం',
    'international': 'అంతర్జాతీయం',
    'world': 'ప్రపంచం',
    'state': 'రాష్ట్రం',
    'crime': 'నేరాలు',
    'environment': 'పర్యావరణం',
    'science': 'సైన్స్',
  }
  return categoryMap[category.toLowerCase()] || category
}

export async function getFallbackArticles() {
  // Load from public/news/*.json category files for development
  const publicData = await loadPublicData()
  if (publicData && publicData.length > 0) {
    console.log(`⚠️ Using fallback data from public/news/*.json (${publicData.length} articles) - backend API should be used`)
    return publicData.slice(0, 100).map((item, index) => transformPublicArticle(item, index))
  }
  
  // Ultimate fallback - static data
  console.warn('⚠️ Using static fallback articles - backend APIs are required for production')
  return STATIC_FALLBACK_ARTICLES
}

export async function getFallbackCategories() {
  // Extract categories from loaded public/news/*.json files
  console.warn('⚠️ Using fallback categories - backend /public/categories API should be used')
  
  // Extract from public data
  const publicData = await loadPublicData()
  if (publicData && publicData.length > 0) {
    const categorySet = new Set<string>()
    const categoryMap = new Map<string, string>()
    
    publicData.forEach((item: NewsArticle) => {
      if (Array.isArray(item.category)) {
        item.category.forEach((cat: string) => {
          const normalized = cat.toLowerCase()
          categorySet.add(normalized)
          categoryMap.set(normalized, getCategoryNameInTelugu(normalized))
        })
      }
    })
    
    // Return all unique categories found
    return Array.from(categorySet).map((slug, index) => ({
      id: `cat-${index + 1}`,
      name: categoryMap.get(slug) || slug,
      nameLocalized: categoryMap.get(slug) || slug, // Telugu name for navbar
      slug: slug,
      description: `${categoryMap.get(slug)} వార్తలు`
    }))
  }
  
  return STATIC_FALLBACK_CATEGORIES
}

// Static fallback data (used only if public/data.json fails)
const STATIC_FALLBACK_ARTICLES = [
  {
    id: 'sample-1',
    title: 'తెలంగాణ రాష్ట్రంలో నేడు భారీ వర్షాలు',
    slug: 'telangana-heavy-rains',
    excerpt: 'తెలంగాణ రాష్ట్రంలోని వివిధ జిల్లాల్లో నేడు భారీ వర్షాలు కురిసాయి. హైదరాబాద్‌లో కూడా ఉదయం నుంచి వర్షం కురుస్తోంది.',
    content: 'తెలంగాణ రాష్ట్రంలోని వివిధ జిల్లాల్లో నేడు భారీ వర్షాలు కురిసాయి...',
    imageUrl: 'https://images.unsplash.com/photo-1527482937786-6608bdd5c7d4?w=800',
    category: { id: 'cat-1', name: 'రాష్ట్రం', slug: 'state' },
    author: { name: 'కబుర్లు డెస్క్' },
    publishedAt: new Date().toISOString(),
    featured: true,
  },
  {
    id: 'sample-2',
    title: 'టెక్నాలజీ రంగంలో భారత్ అభివృద్ధి',
    slug: 'india-tech-growth',
    excerpt: 'టెక్నాలజీ రంగంలో భారత్ గణనీయంగా ముందుకు సాగుతోంది. కృత్రిమ మేధస్సు, క్లౌడ్ కంప్యూటింగ్‌లో భారీ పెట్టుబడులు.',
    content: 'టెక్నాలజీ రంగంలో భారత్ గణనీయంగా ముందుకు సాగుతోంది...',
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800',
    category: { id: 'cat-2', name: 'సాంకేతికం', slug: 'technology' },
    author: { name: 'టెక్ బ్యూరో' },
    publishedAt: new Date(Date.now() - 3600000).toISOString(),
    featured: true,
  },
  {
    id: 'sample-3',
    title: 'క్రికెట్: భారత్ vs ఆస్ట్రేలియా మ్యాచ్ నేడు',
    slug: 'india-vs-australia-cricket',
    excerpt: 'భారత్-ఆస్ట్రేలియా మధ్య క్రికెట్ మ్యాచ్ నేడు జరగనుంది. టీమ్ ఇండియా గెలుపు కోసం సిద్ధం.',
    content: 'భారత్-ఆస్ట్రేలియా మధ్య క్రికెట్ మ్యాచ్ నేడు జరగనుంది...',
    imageUrl: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800',
    category: { id: 'cat-3', name: 'క్రీడలు', slug: 'sports' },
    author: { name: 'స్పోర్ట్స్ డెస్క్' },
    publishedAt: new Date(Date.now() - 7200000).toISOString(),
    featured: false,
  },
  {
    id: 'sample-4',
    title: 'ఆర్థిక రంగంలో కొత్త సంస్కరణలు',
    slug: 'economic-reforms',
    excerpt: 'కేంద్ర ప్రభుత్వం ఆర్థిక రంగంలో కొత్త సంస్కరణలను ప్రకటించింది. వ్యాపారాలకు పన్ను తగ్గింపులు.',
    content: 'కేంద్ర ప్రభుత్వం ఆర్థిక రంగంలో కొత్త సంస్కరణలను ప్రకటించింది...',
    imageUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800',
    category: { id: 'cat-4', name: 'ఆర్థికం', slug: 'business' },
    author: { name: 'బిజినెస్ బ్యూరో' },
    publishedAt: new Date(Date.now() - 10800000).toISOString(),
    featured: false,
  },
  {
    id: 'sample-5',
    title: 'వినోదం: కొత్త చిత్రం విడుదల',
    slug: 'new-movie-release',
    excerpt: 'టాలీవుడ్ స్టార్ హీరో కొత్త చిత్రం ఈ వారాంతం విడుదల అవుతోంది. అభిమానులలో భారీ ఆసక్తి.',
    content: 'టాలీవుడ్ స్టార్ హీరో కొత్త చిత్రం ఈ వారాంతం విడుదల అవుతోంది...',
    imageUrl: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800',
    category: { id: 'cat-5', name: 'వినోదం', slug: 'entertainment' },
    author: { name: 'ఎంటర్‌టైన్‌మెంట్ డెస్క్' },
    publishedAt: new Date(Date.now() - 14400000).toISOString(),
    featured: false,
  },
  {
    id: 'sample-6',
    title: 'ఆరోగ్యం: వేసవిలో జాగ్రత్తలు',
    slug: 'summer-health-tips',
    excerpt: 'వేసవి కాలంలో ఆరోగ్యంగా ఉండటానికి తీసుకోవాల్సిన జాగ్రత్తలు. నీరు ఎక్కువగా త్రాగాలి.',
    content: 'వేసవి కాలంలో ఆరోగ్యంగా ఉండటానికి తీసుకోవాల్సిన జాగ్రత్తలు...',
    imageUrl: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800',
    category: { id: 'cat-6', name: 'ఆరోగ్యం', slug: 'health' },
    author: { name: 'హెల్త్ బ్యూరో' },
    publishedAt: new Date(Date.now() - 18000000).toISOString(),
    featured: false,
  },
  {
    id: 'sample-7',
    title: 'విద్య: కొత్త విద్యా విధానం',
    slug: 'new-education-policy',
    excerpt: 'కొత్త విద్యా విధానం అమలులోకి వచ్చింది. విద్యార్థులకు ఎక్కువ ఎంపికలు.',
    content: 'కొత్త విద్యా విధానం అమలులోకి వచ్చింది...',
    imageUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800',
    category: { id: 'cat-7', name: 'విద్య', slug: 'education' },
    author: { name: 'విద్యా బ్యూరో' },
    publishedAt: new Date(Date.now() - 21600000).toISOString(),
    featured: false,
  },
  {
    id: 'sample-8',
    title: 'రైతుల కోసం కొత్త పథకం',
    slug: 'farmer-scheme',
    excerpt: 'రైతులకు అనుకూలంగా కొత్త పథకం ప్రకటించింది ప్రభుత్వం. ఉచిత విద్యుత్, నీటి సౌకర్యాలు.',
    content: 'రైతులకు అనుకూలంగా కొత్త పథకం ప్రకటించింది ప్రభుత్వం...',
    imageUrl: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=800',
    category: { id: 'cat-8', name: 'వ్యవసాయం', slug: 'agriculture' },
    author: { name: 'రూరల్ బ్యూరో' },
    publishedAt: new Date(Date.now() - 25200000).toISOString(),
    featured: false,
  },
]

const STATIC_FALLBACK_CATEGORIES = [
  { id: 'cat-1', name: 'రాష్ట్రం', slug: 'state', description: 'రాష్ట్ర వార్తలు' },
  { id: 'cat-2', name: 'సాంకేతికం', slug: 'technology', description: 'టెక్నాలజీ వార్తలు' },
  { id: 'cat-3', name: 'క్రీడలు', slug: 'sports', description: 'క్రీడా వార్తలు' },
  { id: 'cat-4', name: 'ఆర్థికం', slug: 'business', description: 'వ్యాపార వార్తలు' },
  { id: 'cat-5', name: 'వినోదం', slug: 'entertainment', description: 'వినోద వార్తలు' },
  { id: 'cat-6', name: 'ఆరోగ్యం', slug: 'health', description: 'ఆరోగ్య వార్తలు' },
  { id: 'cat-7', name: 'విద్య', slug: 'education', description: 'విద్యా వార్తలు' },
  { id: 'cat-8', name: 'వ్యవసాయం', slug: 'agriculture', description: 'వ్యవసాయ వార్తలు' },
]

const FALLBACK_TICKER_ITEMS = [
  'తెలంగాణలో నేడు భారీ వర్షాలు - ప్రజలు జాగ్రత్తగా ఉండాలి',
  'టెక్నాలజీ రంగంలో భారత్ అభివృద్ధి - కొత్త స్టార్టప్‌లకు మద్దతు',
  'క్రికెట్: భారత్ vs ఆస్ట్రేలియా మ్యాచ్ నేడు - టీమ్ ఇండియా సిద్ధం',
  'ఆర్థిక రంగంలో కొత్త సంస్కరణలు - వ్యాపారాలకు పన్ను తగ్గింపు',
  'కొత్త చిత్రం ఈ వారాంతం విడుదల - అభిమానుల ఆసక్తి',
]

export function getFallbackTickerItems() {
  return FALLBACK_TICKER_ITEMS
}

export async function getFallbackTickerItemsAsync() {
  const articles = await getFallbackArticles()
  return articles.slice(0, 5).map((a) => a.title)
}

// Check if logo URL belongs to wrong tenant
export function isWrongTenantLogo(logoUrl?: string | null): boolean {
  if (!logoUrl) return false
  
  const url = logoUrl.toLowerCase()
  const wrongPatterns = [
    'crown',
    'humanrights',
    'human-rights',
    'crownhumanrights'
  ]
  
  for (const pattern of wrongPatterns) {
    if (url.includes(pattern)) {
      console.log(`🚫 Detected wrong tenant logo: ${logoUrl}`)
      return true
    }
  }
  
  return false
}

// Check if data looks like wrong tenant (e.g., Crown Human Rights)
export function isWrongTenantData(data: unknown): boolean {
  if (!data) return true
  
  const dataString = JSON.stringify(data).toLowerCase()
  
  // Check for Crown Human Rights or similar unwanted tenant patterns
  const wrongTenantPatterns = [
    'crown human rights',
    'crown',
    'human rights',
    'humanrights',
    'crownhumanrights'
  ]
  
  for (const pattern of wrongTenantPatterns) {
    if (dataString.includes(pattern)) {
      console.log(`🚫 Detected wrong tenant pattern: "${pattern}"`)
      return true
    }
  }
  
  // Check if tenant name/slug doesn't match expected Telugu news patterns
  if (data && typeof data === 'object' && 'tenant' in data) {
    const tenant = (data as { tenant?: { name?: string; slug?: string } }).tenant
    if (tenant) {
      const tenantName = (tenant.name || '').toLowerCase()
      const tenantSlug = (tenant.slug || '').toLowerCase()
    
      // If it contains English news org names that aren't ours
      if (tenantName.includes('crown') || tenantSlug.includes('crown')) {
        console.log(`🚫 Wrong tenant name detected: ${tenantName} / ${tenantSlug}`)
        return true  
      }
    }
  }
  
  return false
}

