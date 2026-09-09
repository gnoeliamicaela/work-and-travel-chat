import { SITE_NAME } from "@/lib/site-config";

export default function Footer() {
  return (
    <footer className="border-t border-terracota-100 bg-marino-500 text-arena-50">
      <div className="mx-auto max-w-5xl px-4 py-8 text-sm">
        <p className="font-display text-base">{SITE_NAME}</p>
        <p className="mt-2 max-w-xl text-marino-100">
          Este sitio ofrece informacion orientativa sobre el programa Work
          and Travel, basada en experiencia real gestionando el programa. No
          reemplaza el asesoramiento legal o migratorio oficial, ni
          garantiza la aprobacion de ninguna visa. La decision final depende
          siempre de la embajada de Estados Unidos.
        </p>
        <p className="mt-4 text-xs text-marino-200">
          {new Date().getFullYear()}, {SITE_NAME}. Proyecto de portfolio.
        </p>
      </div>
    </footer>
  );
}
