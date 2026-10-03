import { notFound } from "next/navigation";
import "../../globals.css";

export default async function JournalLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (locale !== "fr" && locale !== "en") notFound();
  return (
    <html lang={locale}>
      <body>{children}</body>
    </html>
  );
}
