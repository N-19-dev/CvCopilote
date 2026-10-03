import type { Metadata } from "next";
import Script from "next/script";
import "../globals.css";

export const metadata: Metadata = {
  title: "Nathan Sornet — Mon parcours, mes projets",
  description:
    "Le portfolio de Nathan Sornet, ingénieur Data & IA. De l’entrepreneuriat à l’ingénierie : mon parcours, mes projets et les choses que j’apprends en les construisant.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body>
        <Script id="reload-at-top" strategy="beforeInteractive">{`
          (() => {
            const navigation = performance.getEntriesByType("navigation")[0];
            if (!navigation || navigation.type !== "reload") return;

            const previousRestoration = history.scrollRestoration;
            history.scrollRestoration = "manual";
            if (location.hash) {
              history.replaceState(history.state, "", location.pathname + location.search);
            }
            const reset = () => window.scrollTo({ top: 0, left: 0, behavior: "instant" });
            reset();
            const finish = () => {
              reset();
              requestAnimationFrame(() => {
                reset();
                history.scrollRestoration = previousRestoration;
              });
            };
            if (document.readyState === "complete") finish();
            else window.addEventListener("pageshow", finish, { once: true });
          })();
        `}</Script>
        {children}
      </body>
    </html>
  );
}
