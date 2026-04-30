# AGENTS.md

## Objetivo

Construir un comparador de precios de videojuegos usando scraping controlado y base de datos propia.

## Cómo funciona el scraping (referencia SteamDB)

- El scraping NO se ejecuta por acciones del usuario
- Se usan workers en background que recolectan datos constantemente
- Los datos se obtienen desde APIs o endpoints JSON (como Steam Storefront API)
- Se almacenan en una base de datos propia
- El usuario solo consulta la base de datos, no se hacen requests en tiempo real
- Las actualizaciones se realizan de forma incremental y controlada

## Reglas de scraping

- Usar APIs o endpoints JSON (Steam Storefront API) cuando sea posible
- Agregar delay entre requests (>= 10 segundos)
- Evitar requests duplicados
- Ejecutar scraping solo en background (workers)
- No hacer scraping masivo sin control

## Reglas de base de datos (SUPABASE)

- Guardar historial de precios (no sobrescribir)
- Evitar duplicados (upsert)
- Usar la base de datos como fuente principal
- Usar nombres en español para tablas y atributos
- Usar formato camel_snake en nombres (ej: precio, fecha_creacion)

## Principio clave

El usuario nunca dispara scraping, solo consulta datos ya almacenados
