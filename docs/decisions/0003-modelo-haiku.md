# 0003. Claude Haiku 4.5 como modelo del chat

## Contexto

Habia que elegir que modelo de Claude usar para responder las preguntas
del chat, con costo y calidad de respuesta como principales variables en
tension.

## Decision

Se usa Claude Haiku 4.5 (`claude-haiku-4-5-20251001`) para las llamadas del
endpoint `/api/chat`.

## Por que

- El chat responde acotado a un contexto chico e inyectado (los fragmentos
  recuperados de `/knowledge`), no requiere razonamiento largo ni
  conocimiento general amplio del modelo.
- Es un proyecto de portfolio, pagado por la autora: el costo por request
  es una variable real a cuidar.
- Haiku 4.5 es lo suficientemente capaz para seguir instrucciones estrictas
  de formato (JSON con `answer`, `grounded`, `sources`) y para mantener el
  tono definido en el system prompt.

## Cuando reconsiderar

Si en una version futura el chat necesitara sostener conversaciones mas
largas, razonar sobre casos ambiguos (por ejemplo, comparar situaciones
migratorias complejas) o combinar informacion de varias secciones con mas
matices, migrar a un modelo con mas capacidad de razonamiento (como Sonnet)
seria la primera palanca a evaluar. El cambio es de una sola linea en
`lib/claude.ts` (la constante `MODEL`).
