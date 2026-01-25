import { NextResponse, type NextRequest } from 'next/server'
import { defaultHomeLayout, readHomeLayout, resetHomeLayout, writeHomeLayout, type HomeLayoutThemeKey } from '@/lib/home-layout'
import { getConfigForDomain } from '@/lib/config'

export const runtime = 'nodejs'

type ThemeKey = HomeLayoutThemeKey

function domainFromHost(host: string | null) {
  const h = (host || 'localhost').split(':')[0]
  return h || 'localhost'
}

async function themeKeyForRequest(req: NextRequest): Promise<ThemeKey> {
  const domain = domainFromHost(req.headers.get('host'))
  try {
    // Use new /public/config API - theme key not in config yet, fallback to style1
    const config = await getConfigForDomain(domain)
    // For now, always return style1 until backend adds theme to config API
    return 'style1'
  } catch {
    return 'style1'
  }
}

function tenantFromRequest(req: NextRequest) {
  const url = new URL(req.url)
  const fromQuery = url.searchParams.get('tenant')
  const fromHeader = req.headers.get('x-tenant') || req.headers.get('x-tenant-slug')
  const fallback = process.env.NEXT_PUBLIC_DEFAULT_TENANT || 'demo'
  return String(fromQuery || fromHeader || fallback).trim()
}

export async function GET(req: NextRequest) {
  const tenantSlug = tenantFromRequest(req)
  const themeKey = await themeKeyForRequest(req)
  const layout = await readHomeLayout(tenantSlug, themeKey)
  return NextResponse.json({ ok: true, layout })
}

export async function POST(req: NextRequest) {
  const tenantSlug = tenantFromRequest(req)
  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ ok: false, error: 'Invalid JSON body' }, { status: 400 })

  try {
    const saved = await writeHomeLayout(tenantSlug, body)
    return NextResponse.json({ ok: true, layout: saved })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Invalid payload'
    return NextResponse.json({ ok: false, error: msg }, { status: 400 })
  }
}

// Reset to default (deletes saved file)
export async function DELETE(req: NextRequest) {
  const tenantSlug = tenantFromRequest(req)
  await resetHomeLayout(tenantSlug)
  const themeKey = await themeKeyForRequest(req)
  const layout = defaultHomeLayout(tenantSlug, themeKey)
  return NextResponse.json({ ok: true, layout })
}
