# 0002. Una sola fuente de contenido para sitio y chat

## Contexto

El sitio tiene paginas de contenido (Requisitos, Visa, Empleo, Alojamiento,
Finanzas, Checklist) y un chat que responde en base a una base de
conocimiento. Habia que decidir si esas paginas iban a tener su propio copy
(componentes React con texto propio) o si iban a renderizarse a partir de
los mismos archivos que usa el chat.

## Decision

Los archivos de `/knowledge` son la unica fuente de verdad. Cada pagina del
sitio (`app/(contenido)/.../page.tsx`) renderiza el markdown del archivo
correspondiente a traves de `components/content/ContentPage.tsx`. El chat
recupera fragmentos de esos mismos archivos como contexto.

## Por que

- Evita mantener la misma informacion en dos lugares (riesgo de que el
  sitio diga una cosa y el chat responda otra).
- El checklist descargable en PDF tambien se genera desde
  `knowledge/checklist.md`, asi que hay un unico lugar donde actualizar el
  contenido y se propaga a la pagina, al chat y al PDF.
- Simplifica el mantenimiento para una sola persona (la autora) escribiendo
  contenido con conocimiento de dominio real.

## Costo de esta decision

El diseño visual de cada seccion queda mas acotado al usar un unico
renderer de markdown (`ContentPage`), en vez de layouts completamente a
medida por pagina. Se compensa con estilos de tipografia (`prose`) y
componentes reutilizables (disclaimer, resumen, categoria) dentro del
mismo renderer.
