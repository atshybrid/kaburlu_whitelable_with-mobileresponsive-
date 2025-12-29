"use client"

import Script from 'next/script'
import Head from 'next/head'
import React from 'react'

type StoryItem = {
  url: string
  title?: string
  poster?: string
}

type AmpStoryPlayerProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
  children?: React.ReactNode
}

function AmpStoryPlayer(props: AmpStoryPlayerProps) {
  return React.createElement('amp-story-player', props)
}

export function WebStoriesPlayer({
  stories,
  height = 600,
}: {
  stories?: StoryItem[]
  height?: number
}) {
  const sample: StoryItem[] = [
    {
      url: 'https://www.gstatic.com/amphtml/stamp/qa/media/animal-photo-essay/amp_story.html',
      title: 'Animal Photo Essay',
      poster: 'https://www.gstatic.com/amphtml/stamp/qa/media/animal-photo-essay/cover.jpg',
    },
    {
      url: 'https://www.gstatic.com/amphtml/stamp/qa/media/kitchen-sink/amp_story.html',
      title: 'Kitchen Sink',
      poster: 'https://www.gstatic.com/amphtml/stamp/qa/media/kitchen-sink/cover.jpg',
    },
    {
      url: 'https://www.gstatic.com/amphtml/stamp/qa/media/thescenic/amp_story.html',
      title: 'The Scenic',
      poster: 'https://www.gstatic.com/amphtml/stamp/qa/media/thescenic/cover.jpg',
    },
    {
      url: 'https://www.gstatic.com/amphtml/stamp/qa/media/healthy-food/amp_story.html',
      title: 'Healthy Food',
      poster: 'https://www.gstatic.com/amphtml/stamp/qa/media/healthy-food/cover.jpg',
    },
  ]

  const list = stories?.length ? stories : sample

  return (
    <div className="overflow-hidden rounded-xl bg-white">
      <Head>
        <link rel="stylesheet" href="https://cdn.ampproject.org/amp-story-player-v0.css" />
      </Head>
      <Script src="https://cdn.ampproject.org/amp-story-player-v0.js" strategy="afterInteractive" />
      <AmpStoryPlayer style={{ width: '100%', height: `${height}px` }}>
        {list.map((s) => (
          <a
            key={s.url}
            href={s.url}
            title={s.title || 'Web story'}
            {...(s.poster ? { 'data-poster-portrait-src': s.poster } : {})}
            style={{ display: 'block' }}
          />
        ))}
      </AmpStoryPlayer>
    </div>
  )
}
