# 0001. RAG liviano en vez de fine-tuning

## Contexto

El chat necesita responder preguntas sobre Work and Travel con precision,
sin inventar informacion sobre tramites migratorios. Habia dos caminos
posibles: afinar un modelo con el contenido propio, o inyectar el contenido
relevante en el prompt de cada consulta (RAG).

## Decision

Se implementa RAG liviano: los archivos de `/knowledge` se parsean en
secciones (chunks), se buscan por keywords segun la pregunta del usuario,
y los fragmentos relevantes se inyectan como contexto en el prompt que se
le envia a Claude, junto con instrucciones explicitas de no responder por
fuera de ese contexto.

## Por que

- Trazabilidad: cada respuesta puede rastrearse a una seccion especifica
  del contenido.
- El contenido cambia con frecuencia (los requisitos migratorios se
  actualizan); RAG permite editar un archivo markdown y que el chat lo
  refleje de inmediato, sin re entrenar nada.
- El volumen de contenido (6 archivos) no justifica el costo ni la
  complejidad de un fine-tune.

## Alternativas descartadas

- **Fine-tuning de un modelo.** Mas costoso, mas lento de iterar, y peor
  para auditar de donde sale cada respuesta.
- **Sin ningun mecanismo de contexto (prompt generico).** Mayor riesgo de
  alucinacion en un tema sensible como visas.
