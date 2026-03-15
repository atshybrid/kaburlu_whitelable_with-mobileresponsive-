'use client'

import { FormEvent, useCallback, useEffect, useRef, useState } from 'react'
import Script from 'next/script'
import { useReaderAuth } from '@/context/ReaderAuthContext'

// ── types ────────────────────────────────────────────────────────────────────
type ReactionType = 'LIKE' | 'DISLIKE' | 'NONE'

interface BackendComment {
  id: string
  content: string
  user: { displayName: string; photoUrl?: string | null }
  createdAt: string
}

// ── Google Identity Services global type ─────────────────────────────────────
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (cfg: {
            client_id: string
            callback: (r: { credential: string }) => void
            auto_select?: boolean
          }) => void
          renderButton: (el: HTMLElement, cfg: object) => void
          prompt: () => void
          cancel: () => void
        }
      }
    }
  }
}

const MAX_COMMENT_LEN = 500

function authHeader(jwt: string): Record<string, string> {
  return { Authorization: `Bearer ${jwt}`, 'Content-Type': 'application/json' }
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ArticleEngagementClient({ articleId }: { articleId: string }) {
  const { user, jwt, googleClientId, login, logout } = useReaderAuth()

  // reactions
  const [reaction, setReaction] = useState<ReactionType>('NONE')
  const [counts, setCounts] = useState({ likes: 0, dislikes: 0 })

  // comments
  const [comments, setComments] = useState<BackendComment[]>([])
  const [commentsLoaded, setCommentsLoaded] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [draft, setDraft] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // login modal
  const [showLogin, setShowLogin] = useState(false)
  const [gsiReady, setGsiReady] = useState(false)
  const gBtnRef = useRef<HTMLDivElement>(null)

  // ── Load reaction counts (+ user's own reaction if logged in) ──────────────
  useEffect(() => {
    const headers: Record<string, string> = {}
    if (jwt) headers['Authorization'] = `Bearer ${jwt}`

    fetch(`/api/reader/reactions?articleId=${encodeURIComponent(articleId)}`, { headers })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return
        setReaction(data.reaction ?? 'NONE')
        setCounts({ likes: data.likeCount ?? 0, dislikes: data.dislikeCount ?? 0 })
      })
      .catch(() => {})
  }, [articleId, jwt])

  // ── Load comments when section is opened ──────────────────────────────────
  useEffect(() => {
    if (!showComments || commentsLoaded) return
    fetch(`/api/reader/comments?articleId=${encodeURIComponent(articleId)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return
        setComments(
          Array.isArray(data.comments) ? data.comments : Array.isArray(data) ? data : []
        )
        setCommentsLoaded(true)
      })
      .catch(() => {})
  }, [articleId, showComments, commentsLoaded])

  // ── Initialize + render Google Sign-In button when modal opens ─────────────
  useEffect(() => {
    if (!showLogin || !gsiReady || !googleClientId || !gBtnRef.current) return
    try {
      window.google?.accounts.id.initialize({
        client_id: googleClientId,
        auto_select: false,
        callback: async (response: { credential: string }) => {
          const res = await fetch('/api/reader/google-signin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ googleIdToken: response.credential }),
          })
          const data = await res.json()
          if (data.success && data.jwt && data.user) {
            login(data.jwt, data.user)
            setShowLogin(false)
          }
        },
      })
      window.google?.accounts.id.renderButton(gBtnRef.current, {
        theme: 'outline',
        size: 'large',
        text: 'signin_with',
        width: 280,
        logo_alignment: 'left',
      })
    } catch {
      // GIS not ready yet; retries when gsiReady flips
    }
  }, [showLogin, gsiReady, googleClientId, login])

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleReaction = useCallback(
    async (type: 'LIKE' | 'DISLIKE') => {
      if (!jwt) { setShowLogin(true); return }

      const next: ReactionType = reaction === type ? 'NONE' : type

      // Optimistic update
      setReaction(next)
      setCounts((prev) => ({
        likes:
          next === 'LIKE' ? prev.likes + 1
            : reaction === 'LIKE' ? prev.likes - 1
            : prev.likes,
        dislikes:
          next === 'DISLIKE' ? prev.dislikes + 1
            : reaction === 'DISLIKE' ? prev.dislikes - 1
            : prev.dislikes,
      }))

      try {
        const res = await fetch('/api/reader/reactions', {
          method: 'PUT',
          headers: authHeader(jwt),
          body: JSON.stringify({ articleId, reaction: next }),
        })
        const data = await res.json()
        if (typeof data.likeCount === 'number') {
          setCounts({ likes: data.likeCount, dislikes: data.dislikeCount ?? 0 })
        }
      } catch {
        // Revert on failure
        setReaction(reaction)
        setCounts((prev) => ({
          likes: type === 'LIKE' ? prev.likes - 1 : prev.likes,
          dislikes: type === 'DISLIKE' ? prev.dislikes - 1 : prev.dislikes,
        }))
      }
    },
    [jwt, reaction, articleId]
  )

  async function handleComment(e: FormEvent) {
    e.preventDefault()
    if (!jwt) { setShowLogin(true); return }
    const text = draft.trim()
    if (!text || submitting) return

    setSubmitting(true)
    try {
      const res = await fetch('/api/reader/comments', {
        method: 'POST',
        headers: authHeader(jwt),
        body: JSON.stringify({ articleId, content: text }),
      })
      const data = await res.json()
      const newComment: BackendComment = data.comment ?? data
      if (newComment?.id) {
        setComments((prev) => [newComment, ...prev])
        setDraft('')
      }
    } catch {
      // silently fail; user can retry
    } finally {
      setSubmitting(false)
    }
  }

  const remaining = MAX_COMMENT_LEN - draft.length

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Load Google Identity Services lazily — only when googleClientId is available */}
      {googleClientId && (
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="lazyOnload"
          onLoad={() => setGsiReady(true)}
        />
      )}

      <section
        className="mt-8 rounded-xl border border-zinc-200 bg-white p-4 sm:p-5"
        aria-labelledby="article-engagement-heading"
      >
        {/* Header row */}
        <div className="flex items-center justify-between gap-3">
          <h3 id="article-engagement-heading" className="text-lg font-semibold text-zinc-900">
            మీ అభిప్రాయం చెప్పండి
          </h3>

          {user ? (
            <div className="flex items-center gap-2">
              {user.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.photoUrl}
                  alt={user.displayName}
                  className="h-7 w-7 rounded-full ring-2 ring-zinc-200"
                />
              ) : (
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-orange-400 text-xs font-bold text-white">
                  {user.displayName?.[0] || '?'}
                </div>
              )}
              <span className="max-w-[120px] truncate text-sm font-medium text-zinc-700">
                {user.displayName}
              </span>
              <button
                onClick={logout}
                className="text-xs text-zinc-400 hover:text-zinc-600 transition-colors"
              >
                Sign out
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowLogin(true)}
              className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:border-zinc-300 hover:text-zinc-900 transition-colors"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
              </svg>
              Sign in
            </button>
          )}
        </div>

        {/* ── Reaction buttons ─────────────────────────────────────────────── */}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => handleReaction('LIKE')}
            aria-pressed={reaction === 'LIKE'}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              reaction === 'LIKE'
                ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                : 'border-zinc-300 bg-white text-zinc-700 hover:border-emerald-300 hover:text-emerald-700'
            }`}
          >
            <span aria-hidden>👍</span>
            <span>Like</span>
            {counts.likes > 0 && (
              <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs">{counts.likes}</span>
            )}
          </button>

          <button
            type="button"
            onClick={() => handleReaction('DISLIKE')}
            aria-pressed={reaction === 'DISLIKE'}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              reaction === 'DISLIKE'
                ? 'border-rose-500 bg-rose-50 text-rose-700'
                : 'border-zinc-300 bg-white text-zinc-700 hover:border-rose-300 hover:text-rose-700'
            }`}
          >
            <span aria-hidden>👎</span>
            <span>Dislike</span>
            {counts.dislikes > 0 && (
              <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs">{counts.dislikes}</span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setShowComments((v) => !v)}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              showComments
                ? 'border-blue-400 bg-blue-50 text-blue-700'
                : 'border-zinc-300 bg-white text-zinc-700 hover:border-blue-300 hover:text-blue-700'
            }`}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>Comments</span>
            {comments.length > 0 && (
              <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs">{comments.length}</span>
            )}
          </button>
        </div>

        {/* ── Comments section ─────────────────────────────────────────────── */}
        {showComments && (
          <div className="mt-5 border-t border-zinc-100 pt-5">
            {/* Comment form */}
            <form onSubmit={handleComment} className="mb-6 space-y-2">
              <label htmlFor={`comment-${articleId}`} className="block text-sm font-medium text-zinc-700">
                మీ కామెంట్
              </label>
              <textarea
                id={`comment-${articleId}`}
                value={draft}
                onChange={(e) => setDraft(e.target.value.slice(0, MAX_COMMENT_LEN))}
                onFocus={() => { if (!jwt) setShowLogin(true) }}
                rows={3}
                placeholder={
                  jwt
                    ? 'ఈ వార్త గురించి మీ అభిప్రాయం రాయండి...'
                    : 'కామెంట్ చేయడానికి Sign in చేయండి'
                }
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-800 outline-none focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary))]/20"
              />
              <div className="flex items-center justify-between">
                <span className={`text-xs ${remaining < 40 ? 'text-rose-600' : 'text-zinc-500'}`}>
                  {remaining} characters left
                </span>
                <button
                  type="submit"
                  disabled={!draft.trim() || submitting}
                  className="inline-flex items-center rounded-md bg-[hsl(var(--primary))] px-4 py-2 text-sm font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? 'Posting...' : 'Comment Post చేయండి'}
                </button>
              </div>
            </form>

            {/* Comments list */}
            {comments.length === 0 ? (
              <p className="py-4 text-center text-sm text-zinc-400">
                ఇంకా కామెంట్లు లేవు. మొదటిది మీరు రాయండి!
              </p>
            ) : (
              <div className="space-y-4">
                {comments.map((c) => (
                  <div key={c.id} className="flex gap-3">
                    {c.user.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={c.user.photoUrl}
                        alt={c.user.displayName}
                        className="h-8 w-8 flex-shrink-0 rounded-full ring-1 ring-zinc-200"
                      />
                    ) : (
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-orange-400 text-xs font-bold text-white">
                        {c.user.displayName?.[0] || '?'}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-zinc-800">{c.user.displayName}</p>
                      <p className="mt-0.5 text-sm text-zinc-700">{c.content}</p>
                      <p className="mt-1 text-xs text-zinc-400">
                        {new Date(c.createdAt).toLocaleDateString('te-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* ── Login Modal ──────────────────────────────────────────────────────── */}
      {showLogin && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 backdrop-blur-sm sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-label="Sign in"
          onClick={() => setShowLogin(false)}
        >
          <div
            className="relative w-full max-w-sm rounded-2xl bg-white p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowLogin(false)}
              className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-colors"
              aria-label="Close"
            >
              ✕
            </button>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-orange-400">
                <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-zinc-900">Sign in చేయండి</h2>
              <p className="mt-2 text-sm text-zinc-500">
                Like చేయడానికి, కామెంట్ చేయడానికి Google తో లాగిన్ అవ్వండి
              </p>

              <div className="mt-6 flex justify-center">
                {googleClientId ? (
                  <div ref={gBtnRef} />
                ) : (
                  <p className="text-sm text-zinc-400">
                    Google Sign-In ఇప్పుడు అందుబాటులో లేదు
                  </p>
                )}
              </div>

              {!gsiReady && googleClientId && (
                <p className="mt-3 text-xs text-zinc-400">Loading...</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
