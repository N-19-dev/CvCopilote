import { ThoughtsPage } from "@/components/thoughts-page";
import { journal, thoughts, thoughtId } from "@/lib/thoughts";
import {
  validateThought,
  thoughtMetadata,
  type ThoughtParams,
} from "@/lib/thought-routes";
export const dynamicParams = false;
export function generateStaticParams() {
  return (["fr", "en"] as const).flatMap((locale) => Object.values(thoughts).map((post) => ({
    locale,
    section: journal[locale].section,
    slug: post[locale].slug,
  })));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<ThoughtParams>;
}) {
  const values = await params;
  const locale = validateThought(values);
  return thoughtMetadata(locale, thoughtId(locale, values.slug));
}
export default async function Page({
  params,
}: {
  params: Promise<ThoughtParams>;
}) {
  const values = await params;
  const locale = validateThought(values);
  return <ThoughtsPage locale={locale} article={thoughtId(locale, values.slug)} />;
}
