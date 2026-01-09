import type { Article } from '@/lib/data-sources'
import type { EffectiveSettings } from '@/lib/remote'
import type { ReactElement } from 'react'

// Common props for all ThemeHome components
export interface ThemeHomeProps {
  tenantSlug: string
  title: string
  articles: Article[]
  settings?: EffectiveSettings
  tenantDomain?: string
}

// Common props for all ThemeArticle components
export interface ThemeArticleProps {
  tenantSlug: string
  title: string
  article: Article
  tenantDomain?: string
}

// Common props for all ThemeCategory components
export interface ThemeCategoryProps {
  tenantSlug: string
  title: string
  categorySlug: string
  categoryName: string
  articles: Article[]
}

// Theme module type definition
export interface ThemeModule {
  ThemeHome: (props: ThemeHomeProps) => ReactElement | Promise<ReactElement>
  ThemeArticle?: (props: ThemeArticleProps) => ReactElement | Promise<ReactElement>
  ThemeCategory?: (props: ThemeCategoryProps) => ReactElement | Promise<ReactElement>
}

// Type for async theme home component
export type ThemeHomeComponent = (props: ThemeHomeProps) => ReactElement | Promise<ReactElement>
export type ThemeArticleComponent = (props: ThemeArticleProps) => ReactElement | Promise<ReactElement>
export type ThemeCategoryComponent = (props: ThemeCategoryProps) => ReactElement | Promise<ReactElement>
