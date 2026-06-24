-- Mejora de busqueda inteligente para una base GameFind ya existente.
-- Ejecutar este archivo una vez en el SQL Editor de Supabase.

CREATE EXTENSION IF NOT EXISTS unaccent;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE OR REPLACE FUNCTION normalizar_texto_busqueda(valor TEXT)
RETURNS TEXT AS $$
    SELECT trim(regexp_replace(lower(unaccent(coalesce(valor, ''))), '[^a-z0-9]+', ' ', 'g'));
$$ LANGUAGE SQL STABLE;

CREATE OR REPLACE FUNCTION generar_acronimo_busqueda(valor TEXT)
RETURNS TEXT AS $$
    SELECT coalesce(
        string_agg(
            CASE
                WHEN palabra ~ '^[0-9]+$' THEN palabra
                ELSE left(palabra, 1)
            END,
            ''
            ORDER BY posicion
        ),
        ''
    )
    FROM regexp_split_to_table(normalizar_texto_busqueda(valor), '\s+') WITH ORDINALITY AS partes(palabra, posicion)
    WHERE palabra <> '';
$$ LANGUAGE SQL STABLE;

ALTER TABLE juegos
ADD COLUMN IF NOT EXISTS nombre_normalizado TEXT;

ALTER TABLE juegos
ADD COLUMN IF NOT EXISTS acronimo_normalizado TEXT;

UPDATE juegos
SET
    nombre_normalizado = normalizar_texto_busqueda(nombre),
    acronimo_normalizado = generar_acronimo_busqueda(nombre)
WHERE nombre_normalizado IS NULL
   OR nombre_normalizado <> normalizar_texto_busqueda(nombre)
   OR acronimo_normalizado IS NULL
   OR acronimo_normalizado <> generar_acronimo_busqueda(nombre);

CREATE OR REPLACE FUNCTION actualizar_nombre_normalizado_juego()
RETURNS TRIGGER AS $$
BEGIN
    NEW.nombre_normalizado := normalizar_texto_busqueda(NEW.nombre);
    NEW.acronimo_normalizado := generar_acronimo_busqueda(NEW.nombre);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_nombre_normalizado_juegos ON juegos;
CREATE TRIGGER trigger_nombre_normalizado_juegos
BEFORE INSERT OR UPDATE OF nombre ON juegos
FOR EACH ROW
EXECUTE FUNCTION actualizar_nombre_normalizado_juego();

CREATE INDEX IF NOT EXISTS idx_juegos_nombre_normalizado_trgm
ON juegos USING gin (nombre_normalizado gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_juegos_acronimo_normalizado_trgm
ON juegos USING gin (acronimo_normalizado gin_trgm_ops);

CREATE TABLE IF NOT EXISTS alias_juegos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    juego_id UUID NOT NULL REFERENCES juegos(id) ON DELETE CASCADE,
    alias TEXT NOT NULL,
    alias_normalizado TEXT,
    fecha_creacion TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(juego_id, alias)
);

CREATE OR REPLACE FUNCTION actualizar_alias_normalizado_juego()
RETURNS TRIGGER AS $$
BEGIN
    NEW.alias_normalizado := normalizar_texto_busqueda(NEW.alias);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_alias_normalizado_juegos ON alias_juegos;
CREATE TRIGGER trigger_alias_normalizado_juegos
BEFORE INSERT OR UPDATE OF alias ON alias_juegos
FOR EACH ROW
EXECUTE FUNCTION actualizar_alias_normalizado_juego();

UPDATE alias_juegos
SET alias_normalizado = normalizar_texto_busqueda(alias)
WHERE alias_normalizado IS NULL
   OR alias_normalizado <> normalizar_texto_busqueda(alias);

CREATE INDEX IF NOT EXISTS idx_alias_juegos_alias_normalizado_trgm
ON alias_juegos USING gin (alias_normalizado gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_alias_juegos_juego_id
ON alias_juegos (juego_id);

CREATE OR REPLACE FUNCTION buscar_juegos(
    termino_busqueda TEXT,
    limite_resultados INTEGER DEFAULT 24
)
RETURNS TABLE (
    id UUID,
    relevancia NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    WITH entrada AS (
        SELECT normalizar_texto_busqueda(termino_busqueda) AS texto
    ),
    candidatos AS (
        SELECT
            j.id,
            GREATEST(
                CASE
                    WHEN j.nombre_normalizado = entrada.texto THEN 1.00
                    WHEN j.nombre_normalizado LIKE '%' || entrada.texto || '%' THEN 0.90
                    ELSE similarity(j.nombre_normalizado, entrada.texto)
                END,
                CASE
                    WHEN j.acronimo_normalizado = entrada.texto THEN 1.00
                    WHEN j.acronimo_normalizado LIKE entrada.texto || '%' THEN 0.98
                    ELSE similarity(j.acronimo_normalizado, entrada.texto)
                END,
                COALESCE(MAX(
                    CASE
                        WHEN aj.alias_normalizado = entrada.texto THEN 1.00
                        WHEN aj.alias_normalizado LIKE '%' || entrada.texto || '%' THEN 0.95
                        ELSE similarity(aj.alias_normalizado, entrada.texto)
                    END
                ), 0)
            )::NUMERIC AS relevancia
        FROM juegos j
        CROSS JOIN entrada
        LEFT JOIN alias_juegos aj ON aj.juego_id = j.id
        WHERE entrada.texto <> ''
        GROUP BY j.id, j.nombre_normalizado, entrada.texto
    )
    SELECT candidatos.id, candidatos.relevancia
    FROM candidatos
    WHERE candidatos.relevancia >= 0.25
    ORDER BY candidatos.relevancia DESC
    LIMIT limite_resultados;
END;
$$ LANGUAGE plpgsql STABLE;

GRANT SELECT ON juegos TO anon, authenticated;
GRANT SELECT ON precios TO anon, authenticated;
GRANT SELECT ON tiendas TO anon, authenticated;
GRANT SELECT ON alias_juegos TO anon, authenticated;
GRANT EXECUTE ON FUNCTION buscar_juegos(TEXT, INTEGER) TO anon, authenticated;

INSERT INTO alias_juegos (juego_id, alias)
SELECT j.id, alias_data.alias
FROM juegos j
JOIN (
    VALUES
        ('Grand Theft Auto V', 'GTA'),
        ('Grand Theft Auto V', 'GTA V'),
        ('Grand Theft Auto V', 'GTA 5'),
        ('Red Dead Redemption 2', 'RDR2'),
        ('Red Dead Redemption 2', 'RDR 2'),
        ('Counter-Strike 2', 'CS2'),
        ('Counter-Strike 2', 'CS 2'),
        ('The Witcher 3: Wild Hunt', 'Witcher 3'),
        ('The Witcher 3: Wild Hunt', 'TW3'),
        ('Baldur''s Gate 3', 'BG3'),
        ('Cyberpunk 2077', 'CP2077'),
        ('Call of Duty', 'COD')
) AS alias_data(nombre_juego, alias)
    ON lower(j.nombre) = lower(alias_data.nombre_juego)
ON CONFLICT (juego_id, alias) DO NOTHING;
