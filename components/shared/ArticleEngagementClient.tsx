'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'

type Reaction = 'like' | 'dislike' | null

interface SavedComment {
  id: string
  text: string
  createdAt: string
}

interface SavedEngagement {
  reaction: Reaction
  comments: SavedComment[]
}

const MAX_COMMENT_LENGTH = 500

function storageKey(articleId: string) {
  return `article-engagement:v1:${articleId}`
}

function nowIso() {
  return new Date().toISOString()
}

function createCommentId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

function readInitialEngagement(articleId: string): SavedEngagement {
  if (typeof window === 'undefined') {
    return { reaction: null, comments: [] }
  }

  try {
    const raw = window.localStorage.getItem(storageKey(articleId))
    if (!raw) return { reaction: null, comments: [] }

    const parsed = JSON.parse(raw) as SavedEngagement
    const safeReaction: Reaction = parsed?.reaction === 'like' || parsed?.reaction === 'dislike' ? parsed.reaction : null
    const safeComments = Array.isArray(parsed?.comments)
      ? parsed.comments
          .filter((c) => c && typeof c.text === 'string' && c.text.trim())
          .slice(0, 100)
      : []

    return { reaction: safeReaction, comments: safeComments }
  } catch {
    return { reaction: null, comments: [] }
  }
}

export default function ArticleEngagementClient({ articleId }: { articleId: string }) {
  const initial = readInitialEngagement(articleId)
  const [reaction, setReaction] = useState<Reaction>(initial.reaction)
  const [comments, setComments] = useState<SavedComment[]>(initial.comments)
  const [draft, setDraft] = useState('')

  useEffect(() => {
    if (typeof window === 'undefined') return

    const payload: SavedEngagement = { reaction, comments }
    try {
      window.localStorage.setItem(storageKey(articleId), JSON.stringify(payload))
    } catch {
      // Storage full or blocked; safely ignore
    }
  }, [articleId, reaction, comments])

  const remainingChars = useMemo(() => MAX_COMMENT_LENGTH - draft.length, [draft])

  const toggleReaction = (next: Exclude<Reaction, null>) => {
    setReaction((prev) => (prev === next ? null : next))
  }

  const addComment = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const text = draft.trim()
    if (!text) return
    if (text.length > MAX_COMMENT_LENGTH) return

    const comment: SavedComment = {
      id: createCommentId(),
      text,
      createdAt: nowIso(),
    }

    setComments((prev) => [comment, ...prev].slice(0, 100))
    setDraft('')
  }

  return (
    <section className="mt-8 rounded-xl border border-zinc-200 bg-white p-4 sm:p-5" aria-labelledby="article-engagement-heading">
      <h3 id="article-engagement-heading" className="text-lg font-semibold text-zinc-900">
        మీ అభిప్రాయం చెప్పండి
      </h3>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => toggleReaction('like')}
          aria-pressed={reaction === 'like'}
          className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
            reaction === 'like'
              ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
              : 'border-zinc-300 bg-white text-zinc-700 hover:border-emerald-300 hover:text-emerald-700'
          }`}
        >
          <span aria-hidden="true">👍</span>
          Like
        </button>

        <button
          type="button"
          onClick={() => toggleReaction('dislike')}
          aria-pressed={reaction === 'dislike'}
          className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
            reaction === 'dislike'
              ? 'border-rose-500 bg-rose-50 text-rose-700'
              : 'border-zinc-300 bg-white text-zinc-700 hover:border-rose-300 hover:text-rose-700'
          }`}
        >
          <span aria-hidden="true">👎</span>
          Dislike
        </button>

        <span className="text-sm text-zinc-500">Comments: {comments.length}</span>
      </div>

      <form className="mt-4 space-y-2" onSubmit={addComment}>
        <label htmlFor={`comment-${articleId}`} className="block text-sm font-medium text-zinc-700">
          మీ కామెంట్
        </label>
        <textarea
          id={`comment-${articleId}`}
          value={draft}
          onChange={(event) => setDraft(event.target.value.slice(0, MAX_COMMENT_LENGTH))}
          rows={3}
          placeholder="ఈ వార్త గురించి మీ అభిప్రాయం రాయండి..."
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-800 outline-none focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary))]/20"
        />
        <div className="flex items-center justify-between">
          <span className={`text-xs ${remainingChars < 40 ? 'text-rose-600' : 'text-zinc-500'}`}>
            {remainingChars} characters left
          </span>
          <button
            type="submit"
            disabled={!draft.trim()}
            className="inline-flex items-center rounded-md bg-[hsl(var(--primary))] px-4 py-2 text-sm font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
          >
            Comment Post చేయండి
          </button>
        </div>
      </form>

      {comments.length > 0 ? (
        <ul className="mt-5 space-y-3" aria-label="Posted comments">
          {comments.map((comment) => (
            <li key={comment.id} className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
              <p className="whitespace-pre-wrap text-sm leading-6 text-zinc-800">{comment.text}</p>
              <time className="mt-2 block text-xs text-zinc-500" dateTime={comment.createdAt}>
                {new Date(comment.createdAt).toLocaleString('te-IN', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </time>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-5 text-sm text-zinc-500">ఇంకా కామెంట్లు లేవు. మొదటి కామెంట్ మీరు చేయండి.</p>
      )}
    </section>
  )
}
