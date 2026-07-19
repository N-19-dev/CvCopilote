import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { education, experiences, profile, projects, skillDomains } from "@/lib/profile";

export function Dashboard() {
  return (
    <div className="flex flex-col gap-8 p-6">
      <header>
        <p className="text-sm text-muted-foreground">{profile.title}</p>
        <h1 className="text-3xl font-semibold tracking-tight">{profile.name}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">{profile.summary}</p>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <a
            href={profile.linkedin}
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-4 hover:text-foreground"
          >
            LinkedIn
          </a>
          {profile.languages.map((l) => (
            <span key={l.name}>
              {l.name} — {l.level}
            </span>
          ))}
        </div>
      </header>

      <Separator />

      <section>
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-muted-foreground">
          Compétences
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {skillDomains.map((d) => (
            <Card key={d.title}>
              <CardHeader>
                <CardTitle>{d.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-1.5">
                {d.skills.map((s) => (
                  <Badge key={s} variant="secondary">
                    {s}
                  </Badge>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-muted-foreground">
          Expérience
        </h2>
        <div className="flex flex-col gap-3">
          {experiences.map((e) => (
            <Card key={`${e.company}-${e.period}`}>
              <CardHeader>
                <CardTitle>
                  {e.role} — {e.company}
                </CardTitle>
                <CardDescription>{e.period}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-muted-foreground">{e.description}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {e.tech.map((t) => (
                    <Badge key={t} variant="outline">
                      {t}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-muted-foreground">
          Projets
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {projects.map((p) => (
            <Card key={p.title}>
              <CardHeader>
                <CardTitle>{p.title}</CardTitle>
                <CardDescription>{p.period}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-muted-foreground">{p.description}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {p.tech.map((t) => (
                    <Badge key={t} variant="outline">
                      {t}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-muted-foreground">
          Formation
        </h2>
        <Card>
          <CardContent className="flex flex-col gap-3">
            {education.degrees.map((d) => (
              <div key={d.school}>
                <p className="text-sm font-medium">{d.degree}</p>
                <p className="text-xs text-muted-foreground">{d.school}</p>
              </div>
            ))}
            <Separator />
            <div className="flex flex-wrap gap-1.5">
              {education.certifications.map((c) => (
                <Badge key={c} variant="secondary">
                  {c}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
