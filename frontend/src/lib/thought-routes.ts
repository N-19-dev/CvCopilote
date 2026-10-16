import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { thoughts, thoughtId, journal, thoughtPath, type Locale, type ThoughtSelection } from "./thoughts";
export type ThoughtParams = { locale: string; section: string; slug?: string };
export function validateThought(params: ThoughtParams): Locale {
  if (params.locale !== "fr" && params.locale !== "en") notFound();
  const locale = params.locale;
  if (
    params.section !== journal[locale].section ||
    (params.slug !== undefined && !thoughtId(locale, params.slug))
  )
    notFound();
  return locale;
}
export function thoughtMetadata(locale: Locale, article: ThoughtSelection = false): Metadata {
  const post = thoughts[article === true || article === false ? "brag" : article][locale];
  const title = `${article ? post.title : journal[locale].title} — Nathan Sornet`;
  const description = article ? post.excerpt : journal[locale].intro;
  const productionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  return {
    metadataBase: new URL(
      productionHost ? `https://${productionHost}` : "http://localhost:3000",
    ),
    title,
    description,
    alternates: {
      canonical: thoughtPath(locale, article),
      languages: {
        fr: thoughtPath("fr", article),
        en: thoughtPath("en", article),
      },
    },
    openGraph: {
      title,
      description,
      type: article ? "article" : "website",
      locale: locale === "fr" ? "fr_FR" : "en_US",
    },
  };
}
