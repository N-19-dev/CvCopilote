import { ThoughtsPage } from "@/components/thoughts-page";
import { journal } from "@/lib/thoughts";
import {
  validateThought,
  thoughtMetadata,
  type ThoughtParams,
} from "@/lib/thought-routes";
export const dynamicParams = false;
export function generateStaticParams() {
  return (["fr", "en"] as const).map((locale) => ({
    locale,
    section: journal[locale].section,
  }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<ThoughtParams>;
}) {
  return thoughtMetadata(validateThought(await params));
}
export default async function Page({
  params,
}: {
  params: Promise<ThoughtParams>;
}) {
  return <ThoughtsPage locale={validateThought(await params)} />;
}
