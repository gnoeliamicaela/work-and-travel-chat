import Link from "next/link";
import Card from "@/components/ui/Card";
import { SITE_NAME, SITE_TAGLINE, NAV_LINKS } from "@/lib/site-config";
import { getAllKnowledgeFiles } from "@/lib/knowledge";

export default function HomePage() {
  const files = getAllKnowledgeFiles();

  return (
    <div>
      <section className="bg-marino-500 text-arena-50">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:py-24">
          <p className="text-sm font-medium uppercase tracking-widest text-mostaza-300">
            Work and Travel a Estados Unidos
          </p>
          <h1 className="mt-4 max-w-2xl font-display text-4xl font-semibold leading-tight sm:text-5xl">
            {SITE_TAGLINE}
          </h1>
          <p className="mt-6 max-w-xl text-marino-100">
            Guia practica, escrita con anios de experiencia coordinando este
            programa, para que sepas que esperar en cada etapa: desde si te
            conviene postularte hasta como resolver tus primeros dias de
            trabajo en Estados Unidos.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/requisitos"
              className="rounded-full bg-terracota-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-terracota-600"
            >
              Ver requisitos
            </Link>
            <span className="rounded-full bg-white/10 px-5 py-2.5 text-sm font-semibold text-white">
              Abri el chat abajo a la derecha para empezar
            </span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-14">
        <h2 className="font-display text-2xl font-semibold text-marino-500">
          Que es el Work and Travel
        </h2>
        <p className="mt-4 max-w-2xl text-carbon-800/80">
          Work and Travel es un programa de intercambio cultural con visa
          J-1 que permite a estudiantes universitarios trabajar y viajar en
          Estados Unidos durante las vacaciones de verano del hemisferio
          norte. {SITE_NAME} ordena la informacion que normalmente esta
          dispersa entre agencias, embajada y grupos en redes sociales, en un
          solo lugar pensado para quien recien esta evaluando el programa.
        </p>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-16">
        <h2 className="font-display text-2xl font-semibold text-marino-500">
          Para quien es este sitio
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <Card>
            <p className="font-semibold text-marino-500">
              Recien te enteraste del programa
            </p>
            <p className="mt-2 text-sm text-carbon-800/70">
              Entende que es, quien puede postularse y si te conviene este
              anio.
            </p>
          </Card>
          <Card>
            <p className="font-semibold text-marino-500">
              Estas en proceso de visa
            </p>
            <p className="mt-2 text-sm text-carbon-800/70">
              Segui las etapas, la documentacion y los tiempos tipicos del
              tramite.
            </p>
          </Card>
          <Card>
            <p className="font-semibold text-marino-500">
              Ya tenes la visa aprobada
            </p>
            <p className="mt-2 text-sm text-carbon-800/70">
              Resolve alojamiento, presupuesto y el checklist antes de
              viajar.
            </p>
          </Card>
        </div>
      </section>

      <section className="bg-arena-100">
        <div className="mx-auto max-w-5xl px-4 py-16">
          <h2 className="font-display text-2xl font-semibold text-marino-500">
            Explora cada etapa
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {NAV_LINKS.map((link) => {
              const file = files.find(
                (f) => f.slug === link.href.replace("/", "")
              );
              return (
                <Link key={link.href} href={link.href}>
                  <Card className="h-full transition-shadow hover:shadow-md">
                    <p className="font-display text-lg font-semibold text-marino-500">
                      {link.label}
                    </p>
                    {file?.summary && (
                      <p className="mt-2 text-sm text-carbon-800/70">
                        {file.summary}
                      </p>
                    )}
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16">
        <Card className="bg-terracota-50">
          <h2 className="font-display text-xl font-semibold text-marino-500">
            Por que existe este sitio
          </h2>
          <p className="mt-3 max-w-2xl text-sm text-carbon-800/80">
            Despues de anios coordinando y dirigiendo programas de Work and
            Travel, la pregunta que mas se repite siempre es la misma, solo
            que en distintos momentos del proceso. {SITE_NAME} junta esas
            respuestas en un solo lugar, con un chat que busca en esta misma
            informacion antes de responder, en vez de inventar.
          </p>
        </Card>
      </section>
    </div>
  );
}
