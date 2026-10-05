import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { brag, bragInstall, journal, thoughtPath, type Locale } from "@/lib/thoughts";
import { profile } from "@/lib/profile";

export function ThoughtsPage({
  locale,
  article = false,
}: {
  locale: Locale;
  article?: boolean;
}) {
  const copy = journal[locale];
  const post = brag[locale];
  return (
    <div className="thoughts-shell">
      <a className="skip-link" href="#thought-content">
        {locale === "fr" ? "Aller au contenu" : "Skip to content"}
      </a>
      <header className="thoughts-header">
        <Link className="wordmark" href="/">
          <span className="personal-monogram">ns.</span>
          <span>nathan sornet.</span>
        </Link>
        <nav
          aria-label={
            locale === "fr" ? "Navigation et langue" : "Navigation and language"
          }
        >
          <Link className="thoughts-home" href="/">
            {copy.home} <ArrowUpRight size={14} />
          </Link>
          <div
            className="language-switch"
            aria-label={locale === "fr" ? "Langue" : "Language"}
          >
            {(["fr", "en"] as const).map((lang) => (
              <Link
                key={lang}
                href={thoughtPath(lang, article)}
                hrefLang={lang}
                lang={lang}
                aria-current={lang === locale ? "page" : undefined}
                aria-label={
                  lang === "fr" ? "Lire en français" : "Read in English"
                }
              >
                {lang.toUpperCase()}
              </Link>
            ))}
          </div>
        </nav>
      </header>
      <main
        id="thought-content"
        className={article ? "thought-article" : "thought-index"}
      >
        {article ? (
          <>
            <Link className="thought-back" href={thoughtPath(locale)}>
              <ArrowLeft size={15} />
              {copy.back}
            </Link>
            <div className="thought-meta">
              <span>{copy.category}</span>
              <span>{copy.status}</span>
              <span>{copy.minutes}</span>
            </div>
            <h1>{post.title}</h1>
            <p className="thought-byline">
              Nathan Sornet <span>·</span>{" "}
              <time dateTime="2026-10-03">
                {locale === "fr" ? "3 octobre 2026" : "October 3, 2026"}
              </time>
              <br />
              <time dateTime="2026-10-05">
                {locale === "fr" ? "Mis à jour le 5 octobre 2026" : "Updated October 5, 2026"}
              </time>
            </p>
            <div className="thought-prose">
              {post.paragraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
              <h2>{post.installationTitle}</h2>
              <p>{post.installation}</p>
              <pre className="thought-command"><code>{bragInstall}</code></pre>
              <p className="thought-prompt-note">{post.promptNote}</p>
              {post.trials.map((trial) => (
                <section className="thought-trial" key={trial.file}>
                  <h2>{trial.title}</h2>
                  <pre className="thought-command"><code>{trial.prompt}</code></pre>
                  <p>{trial.description}</p>
                  <figure>
                    <video controls playsInline preload="metadata" width="1080" height="1920" aria-label={trial.caption}>
                      <source src={`/videos/brag/${trial.file}`} type="video/mp4" />
                      <a href={`/videos/brag/${trial.file}`}>{post.download}</a>
                    </video>
                    <figcaption>{trial.caption} <a href={`/videos/brag/${trial.file}`}>{post.download} ↗</a></figcaption>
                  </figure>
                </section>
              ))}
              <h2>{post.conclusionTitle}</h2>
              <p>{post.conclusion}</p>
              <h2>{post.costTitle}</h2>
              <p>{post.cost}</p>
            </div>
            <a
              className="thought-source"
              href="https://github.com/latent-spaces/brag"
              target="_blank"
              rel="noopener noreferrer"
            >
              {post.source}
              <span>
                latent-spaces / brag <ArrowUpRight size={16} />
              </span>
            </a>
            <p className="thought-disclosure">{copy.disclosure}</p>
            <aside className="thought-contact">
              <p>{post.next}</p>
              <a
                href={profile.linkedin}
                target="_blank"
                rel="noopener noreferrer"
              >
                {post.contact} <ArrowUpRight size={16} />
              </a>
            </aside>
          </>
        ) : (
          <>
            <p className="eyebrow">
              {locale === "fr" ? "LE CARNET DE NATHAN" : "NATHAN’S NOTEBOOK"} /
              01
            </p>
            <h1>
              {copy.title}
              <span className="orange">.</span>
            </h1>
            <p className="thought-subtitle">{copy.subtitle}</p>
            <p className="thought-intro">{copy.intro}</p>
            <section
              className="thought-list"
              aria-label={locale === "fr" ? "Les notes" : "Notes"}
            >
              <article>
                <div className="thought-meta">
                  <span>{copy.category}</span>
                  <span>{copy.status}</span>
                  <time dateTime="2026-10-05">{locale === "fr" ? "Actualisé le 05.10.2026" : "Updated 05.10.2026"}</time>
                </div>
                <Link
                  className="thought-entry"
                  href={thoughtPath(locale, true)}
                >
                  <h2>{post.title}</h2>
                  <p>{post.excerpt}</p>
                  <span>
                    {copy.read} <ArrowUpRight size={17} />
                  </span>
                </Link>
              </article>
            </section>
          </>
        )}
      </main>
      <footer className="thoughts-footer">
        <span>{copy.footer}</span>
        <span>© Nathan Sornet</span>
      </footer>
    </div>
  );
}
