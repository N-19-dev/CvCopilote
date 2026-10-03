# Product

## Purpose

Nathan Sornet’s personal portfolio: show who he is, what he has built, his experience and his Data/AI skills. The site should be attractive, approachable and a little playful. Recruiters, prospective collaborators and curious visitors should understand his work without needing to use the chat.

The portfolio is also a working project. Mongoose makes the existing RAG and model routing implementation inspectable through a real conversation or a job description comparison.

## User journey

1. Meet Nathan through a photographic, scroll-driven opening; optionally use the direct navigation or simple reading mode.
2. Follow his experience chronologically from Firstcop in 2020 through ReportLinker, Ippon / FFR and internal Data & AI projects at Ippon. The introduction stays alongside the milestones on desktop.
3. Discover selected projects, with category filters and expandable details.
4. Try Mongoose in the AI lab.
5. Discover accumulated skills, degrees and certifications.
6. Continue the conversation on LinkedIn.

The opening follows the supplied screen-recording reference: a full-bleed photographic hero, a portrait rendered through fine vertical lines on a charcoal background, an advancing vertical-strip curtain into parchment, and large offset project prints traversing the screen. The photo and its striped treatment share the same visual subject. This replaces the rejected fixed rounded frame and cartoon map. Native scroll drives the sequence in both directions without intercepting wheel or touch gestures. Progress is sampled once per animation frame, avoiding inconsistent browser-native keyframe timing at clipped scroll ranges.

The Kalé print uses two actual locally supplied app captures, with no personal calendar entries. Orchestra and Data/AI are explicitly illustrative compositions pending assets. A reading mode and the OS reduced-motion preference render the content statically. The detailed career and project sections follow the opening, and remain directly accessible from navigation. The floating chat stays hidden while the opening is visible. The storyboard and asset provenance are in `../docs/storyboard-continu.md`.

## Visual direction

Warm cream, orange accents and sage green; dark green text, never pure black. Personal portfolio first: a photographic cutout emerging from layered depth planes, a small initials wordmark, real company and school logos, and concrete first-person stories rather than AI product slogans. Keep the AI lab as one project, not the whole identity. Generous typography and whitespace, lightweight, intentional interactions. The opening alternates charcoal and parchment, with large editorial typography and a recurring engraved portrait. Text stays on calm surfaces and no full-height sidebar competes with the portfolio.

Illustrations represent concepts, not screenshots or claimed production results. The rugby visual is explicitly labelled as a schematic. Respect reduced-motion settings. Small screens retain the full content and functionality.

## Existing AI implementation

Next.js frontend, FastAPI backend, LiteLLM model routing, Redis response caching and local sentence-transformer retrieval. The server emits classification, retrieval, model-call, cache and completion events. The interface reflects those actual events, rather than playing a fabricated progress animation.

Responses display the model, latency, actual returned cost or cache state, estimated savings when available, and expandable source passages. A failed or incomplete stream yields a clear retry action. Requests time out after 60 seconds.

This is currently a RAG pipeline, not an autonomous multi-agent system. New agents or automations are a potential product expansion and must be implemented before being advertised as live capabilities.

## Content and integrity

Profile facts come from `src/lib/profile.ts`. Never invent clients, dates, metrics, certifications, outcomes or motivations. Company names identify experience, not endorsements. Keep Mongoose’s name and geometric identity within the lab. The main personal identity uses Nathan’s initials. Do not invent hobbies or biographical details; ask for these when needed. The portrait uses a transparent cutout edited from the supplied photo with built-in imagegen, then web-optimized with its alpha preserved. The original supplied-photo asset remains available. CSS perspective and spring-based pointer tilt create depth; a button changes the angle on touch and keyboard. Respect the operating system’s reduced-motion setting. The generation prompt is recorded in `design/portrait-cutout.md`.

Job comparisons must distinguish evidence from gaps and uncertainty. No account, persistent chat history or invented email address. Chat history remains in memory for the current page session. Backend credentials remain server-side.

## Validation

Check production compilation, TypeScript, lint, desktop and narrow mobile layouts, project filters, expandable content, menu navigation, chat submission, job comparison, sources, failure/retry, and reduced motion. Test response fixtures must remain temporary browser instrumentation and must not ship as live AI responses.

## Personal project selection — October 2, 2026

Nathan confirmed ownership of Kalé (PoteAgenda), Orchestra, MapAsk, Podcast Brief and his technology-watch experiments. Kalé and Orchestra are the leading personal projects. MapAsk and Podcast Brief remain exploratory tools; smaller automation projects are a spare-time hobby. Show the latter in a separate compact section rather than giving every experiment equal prominence. Project artwork is conceptual, not an application screenshot. No public release, user count or production outcome is asserted. Local evidence is recorded in `../docs/inventaire-projets.md`; an enriched CV draft is in `../docs/cv-enrichi.md`.

## Reload behavior

A full browser reload starts at the top of the portfolio, including when the previous URL contained `#labo`. The early layout script clears the hash on reload and temporarily prevents browser scroll restoration. Ordinary anchor clicks, incoming section links and browser back/forward navigation retain their normal behavior.
