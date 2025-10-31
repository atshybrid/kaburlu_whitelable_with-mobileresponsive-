import { Article, Category, Reporter } from './types'

export const categories: Category[] = [
  { slug: 'top', name: 'Top' },
  { slug: 'latest', name: 'Latest' },
  { slug: 'business', name: 'Business' },
  { slug: 'markets', name: 'Markets' },
  { slug: 'technology', name: 'Technology' },
  { slug: 'sports', name: 'Sports' },
  { slug: 'world', name: 'World' },
  { slug: 'politics', name: 'Politics' },
]

export const reporters: Reporter[] = [
  { slug: 'jane-doe', name: 'Jane Doe', avatar: 'https://i.pravatar.cc/96?img=5', bio: 'Markets and macroeconomy reporter.' },
  { slug: 'john-smith', name: 'John Smith', avatar: 'https://i.pravatar.cc/96?img=12', bio: 'Technology, AI and startups.' },
  { slug: 'sara-lee', name: 'Sara Lee', avatar: 'https://i.pravatar.cc/96?img=32', bio: 'Global politics and diplomacy.' },
]

const c = (slug: string) => categories.find(x => x.slug === slug)!
const r = (slug: string) => reporters.find(x => x.slug === slug)!

function html(p: string[]): string { return p.map(x => `<p>${x}</p>`).join('\n') }

export const articles: Article[] = [
  {
    id: 't1', slug: 'ai-summit-hyderabad-te', title: 'హైదరాబాద్ AI సమ్మిట్‌లో ప్రధాన ప్రకటనలు',
    summary: 'భారత్‌ టెక్ ఎకోసిస్టమ్‌ కోసం సేఫ్టీ, సమర్థతపై దృష్టి సారించిన కొత్త AI మోడళ్లు.',
    bodyHtml: html([
      'హైదరాబాద్‌లో జరిగిన AI సమ్మిట్‌లో పలువురు దిగ్గజాలు తమ కొత్త మోడళ్లను ఆవిష్కరించాయి.',
      'ఎంటర్‌ప్రైజ్ వాడుకకు సులభంగా కలిసేలా టూల్స్‌ను రూపొదించారు.'
    ]),
    hero: 'https://images.unsplash.com/photo-1551281044-8b89a212d3b9?q=80&w=1600&auto=format&fit=crop',
    thumb: 'https://images.unsplash.com/photo-1551281044-8b89a212d3b9?q=80&w=600&auto=format&fit=crop',
    publishedAt: new Date(Date.now() - 1000*60*8).toISOString(),
    readTime: 4, category: c('technology'), reporter: r('john-smith'),
    views: 2100, trendingScore: 74,
  },
  {
    id: 't2', slug: 'sports-thriller-final-te', title: 'ఫైనల్ మ్యాచ్‌లో ఉత్కంఠ భరిత ముగింపు',
    summary: 'అంతిమ క్షణాల్లో గెలుపు సాధించిన అండర్‌డాగ్స్ వెంటనే హీరోలయ్యారు.',
    bodyHtml: html([
      'ఎక్స్‌ట్రా టైమ్‌లో వచ్చిన గోల్‌తో మ్యాచ్ మలుపు తిరిగింది.',
      'ప్రేక్షకులు అద్భుతం అంటూ సంబరాలు చేసుకున్నారు.'
    ]),
    hero: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=1600&auto=format&fit=crop',
    thumb: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=600&auto=format&fit=crop',
    publishedAt: new Date(Date.now() - 1000*60*20).toISOString(),
    readTime: 3, category: c('sports'), reporter: r('sara-lee'),
    views: 3900, trendingScore: 80,
  },
  {
    id: 't3', slug: 'global-markets-outlook-te', title: 'గ్లోబల్ మార్కెట్లకు స్థిరత్వం సంకేతాలు',
    summary: 'ద్రవ్యోల్బణం తగ్గుదలతో పెట్టుబడిదారుల్లో నమ్మకం పెరిగింది.',
    bodyHtml: html([
      'సప్లై చైన్లు సాధారణ స్థితికి చేరుతున్నాయని విశ్లేషకులు చెబుతున్నారు.',
      'రేటు కోతలపై అంచనాలు బలపడుతున్నాయి.'
    ]),
    hero: 'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?q=80&w=1600&auto=format&fit=crop',
    thumb: 'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?q=80&w=600&auto=format&fit=crop',
    publishedAt: new Date(Date.now() - 1000*60*35).toISOString(),
    readTime: 4, category: c('markets'), reporter: r('jane-doe'),
    views: 3100, trendingScore: 69,
  },
  {
    id: 'a1', slug: 'markets-rally-as-inflation-cools', title: 'Markets rally as inflation cools to 2.7%',
    summary: 'Stocks surged globally after new data showed inflation easing faster than expected, boosting hopes of rate cuts.',
    bodyHtml: html([
      'Global stocks climbed as investors cheered the latest inflation report coming in below expectations.',
      'Analysts say a soft landing looks more plausible as wage growth stabilizes and supply chains normalize.'
    ]),
    hero: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?q=80&w=1600&auto=format&fit=crop',
    thumb: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?q=80&w=600&auto=format&fit=crop',
    publishedAt: new Date(Date.now() - 1000*60*45).toISOString(),
    readTime: 4, category: c('markets'), reporter: r('jane-doe'),
    views: 4200, trendingScore: 91,
  },
  {
    id: 'a2', slug: 'big-tech-unveils-new-ai-models', title: 'Big Tech unveils new AI models at annual summit',
    summary: 'The latest wave of AI releases focuses on safety and efficiency, targeting both consumers and enterprises.',
    bodyHtml: html([
      'At the annual developer summit, multiple companies showcased cutting-edge AI models with improved reasoning and safety.',
      'Enterprises are keen to adopt tools that integrate seamlessly with existing workflows.'
    ]),
    hero: 'https://images.unsplash.com/photo-1555255707-c07966088b7b?q=80&w=1600&auto=format&fit=crop',
    thumb: 'https://images.unsplash.com/photo-1555255707-c07966088b7b?q=80&w=600&auto=format&fit=crop',
    publishedAt: new Date(Date.now() - 1000*60*120).toISOString(),
    readTime: 6, category: c('technology'), reporter: r('john-smith'),
    views: 9800, trendingScore: 88,
  },
  {
    id: 'a3', slug: 'championship-finals-go-down-to-wire', title: 'Championship finals go down to the wire',
    summary: 'An instant classic: the finals delivered edge-of-the-seat drama and a stunning last-minute winner.',
    bodyHtml: html([
      'The underdogs stunned the defending champions with a last-minute strike in extra time.',
      'Fans hailed it as one of the greatest finals in recent memory.'
    ]),
    hero: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=1600&auto=format&fit=crop',
    thumb: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=600&auto=format&fit=crop',
    publishedAt: new Date(Date.now() - 1000*60*15).toISOString(),
    readTime: 3, category: c('sports'), reporter: r('sara-lee'),
    views: 12500, trendingScore: 95,
  },
  {
    id: 'a4', slug: 'election-talks-resume-amid-tensions', title: 'Election talks resume amid tensions',
    summary: 'Leaders return to the table trying to avert a political crisis with a fragile ceasefire in place.',
    bodyHtml: html([
      'Negotiations resumed with mediators urging restraint as both sides traded barbs.',
      'A breakthrough remains elusive, but channels are open for further dialogue.'
    ]),
    hero: 'https://images.unsplash.com/photo-1529101091764-c3526daf38fe?q=80&w=1600&auto=format&fit=crop',
    thumb: 'https://images.unsplash.com/photo-1529101091764-c3526daf38fe?q=80&w=600&auto=format&fit=crop',
    publishedAt: new Date(Date.now() - 1000*60*240).toISOString(),
    readTime: 5, category: c('politics'), reporter: r('sara-lee'),
    views: 6300, trendingScore: 72,
  },
  {
    id: 'a5', slug: 'small-businesses-see-strong-q3', title: 'Small businesses see strong Q3 demand',
    summary: 'Resilient consumer spending and easing supply constraints buoyed SMEs across regions in Q3.',
    bodyHtml: html([
      'Demand for services outpaced goods, though both categories grew sequentially.',
      'Hiring plans remain cautious amid lingering uncertainty.'
    ]),
    hero: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1600&auto=format&fit=crop',
    thumb: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=600&auto=format&fit=crop',
    publishedAt: new Date(Date.now() - 1000*60*70).toISOString(),
    readTime: 4, category: c('business'), reporter: r('jane-doe'),
    views: 5400, trendingScore: 60,
  },
]

export function getCategories(): Category[] { return categories }
export function getAllArticles(): Article[] { return [...articles].sort((a,b)=>+new Date(b.publishedAt)-+new Date(a.publishedAt)) }
export function getTopHeadlines(n=5): Article[] { return getAllArticles().slice(0,n) }
export function getTrending(n=5): Article[] { return [...articles].sort((a,b)=> (b.trendingScore||0)-(a.trendingScore||0)).slice(0,n) }
export function getMostRead(n=5): Article[] { return [...articles].sort((a,b)=> (b.views||0)-(a.views||0)).slice(0,n) }
export function getArticlesByCategory(slug:string, n?:number): Article[] { const list = getAllArticles().filter(a=>a.category.slug===slug); return typeof n==='number'?list.slice(0,n):list }
export function getArticleBySlug(slug:string): Article|undefined { return articles.find(a=>a.slug===slug) }
export function getReporterBySlug(slug:string): Reporter|undefined { return reporters.find(r=>r.slug===slug) }
export function getArticlesByReporter(slug:string): Article[] { return getAllArticles().filter(a=>a.reporter.slug===slug) }
export function getReporters(): Reporter[] { return reporters }
