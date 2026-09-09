# Case study: Copiloto Work and Travel

## El problema

Quienes evaluan el programa Work and Travel a Estados Unidos suelen buscar
informacion dispersa entre agencias, grupos de redes sociales y foros, con
distinto nivel de precision y actualidad. Despues de 5 anios coordinando y
dirigiendo este tipo de programas (primero como Coordinadora, despues como
Directora de Programas en una agencia de intercambio cultural), la misma
pregunta se repite una y otra vez, solo que en distintos momentos del
proceso: elegibilidad al principio, documentacion de la visa en el medio,
alojamiento y presupuesto sobre el final.

Este proyecto busca convertir ese conocimiento de dominio, adquirido en
gestion real del programa, en un producto: un sitio con contenido propio y
un chat que responde en base a ese contenido, no a conocimiento generico de
un modelo de lenguaje.

## Por que RAG liviano y no fine-tuning

Se evaluaron dos formas de que el chat "sepa" sobre Work and Travel:
afinar (fine-tune) un modelo con el contenido, o inyectar el contenido
relevante en el prompt en el momento de la consulta (retrieval augmented
generation, RAG).

Se eligio RAG liviano por tres motivos:

1. **Trazabilidad.** En un tema sensible como tramites migratorios, poder
   mostrar de que seccion del sitio sale cada respuesta (y poder editar esa
   seccion sin re entrenar nada) es mas importante que la fluidez que
   agregaria un fine-tune.
2. **Costo y velocidad de iteracion.** La base de conocimiento tiene 6
   archivos markdown que cambian con frecuencia (los requisitos migratorios
   se actualizan). Editar un archivo y hacer deploy es inmediato; un
   fine-tune requeriria un ciclo de entrenamiento por cada actualizacion.
3. **Escala del contenido.** Con un puñado de documentos, una base
   vectorial completa (embeddings, un vector store dedicado) es
   sobre ingenieria. Una busqueda simple por keywords sobre secciones bien
   tituladas alcanza para esta v1, y es mas facil de explicar y depurar en
   una demo de portfolio.

Ver [decisions/0001-rag-liviano-vs-fine-tuning.md](decisions/0001-rag-liviano-vs-fine-tuning.md).

## Por que una sola fuente de contenido para sitio y chat

Las paginas del sitio (Requisitos, Visa, Empleo, Alojamiento, Finanzas,
Checklist) se renderizan directamente desde los mismos archivos markdown
que usa el chat para recuperar contexto. La alternativa (escribir el copy
de cada pagina por separado del contenido del chat) hubiese significado
mantener la misma informacion dos veces, con el riesgo de que se
desincronicen (por ejemplo, que la pagina diga una cosa sobre plazos y el
chat responda otra).

Esta decision tambien es la que hace que el checklist descargable en PDF
se genere a partir del mismo `knowledge/checklist.md` que alimenta la
pagina y el chat: un solo lugar donde editar la verdad.

Ver [decisions/0002-fuente-unica-de-contenido.md](decisions/0002-fuente-unica-de-contenido.md).

## Como se evita que el chat invente

El prompt que se le envia a Claude incluye instrucciones explicitas de
responder unicamente con el contexto recuperado, y le pide una salida en
formato JSON con un campo `grounded` (booleano). Cuando la busqueda por
keywords no encuentra fragmentos relevantes, o el modelo decide que el
contexto no alcanza, `grounded` queda en `false`: el chat lo dice con
honestidad en vez de completar con inferencias, y sugiere consultar fuentes
oficiales (embajada, Departamento de Estado, sponsor del programa) en vez
de una respuesta generica.

Ese mismo campo `grounded` es lo que dispara, del lado del servidor, el
webhook de "pregunta sin respuesta" hacia n8n, para que quede registrado
que hueco de contenido reportar.

## Que se dejo afuera de la v1 y por que

- **Base vectorial / embeddings.** No hace falta con 6 documentos; una
  busqueda por keywords con boost por titulo de seccion da resultados
  suficientemente precisos y es mucho mas simple de mantener y explicar.
- **Historial de conversacion persistente.** El chat de v1 no guarda
  conversaciones anteriores entre sesiones; cada visita arranca de cero.
  Agregar memoria conversacional implica decisiones de privacidad y
  almacenamiento que no eran centrales para validar la idea.
- **Multi idioma.** El sitio y el chat estan en espaniol rioplatense.
  Ingles quedo afuera de esta version porque la audiencia objetivo (18 a
  30 anios en Argentina) es mayoritariamente hispanohablante.
- **Autenticacion / cuentas de usuario.** No hay login. El `session_id`
  que viaja a los webhooks de n8n es solo un identificador anonimo por
  navegador (guardado en `localStorage`), no una cuenta.
- **Personalizacion por etapa del usuario.** El frontmatter de cada
  archivo de conocimiento ya incluye un campo `audience` pensado para esto
  (principiante, en proceso, con visa aprobada), pero la v1 no lo usa para
  filtrar o priorizar contenido de forma dinamica. Queda como el gancho
  natural para una v2.

## Metricas que se seguirian en una version real

Aunque esta v1 no incluye analytics, los dos eventos que ya se envian a
n8n (descarga del checklist y pregunta sin respuesta) son, en si mismos,
las dos senales de producto mas utiles para priorizar el roadmap: que
recurso genera mas descargas, y que preguntas revelan huecos en la base de
conocimiento que conviene completar primero.
