-- Esquema de Base de Datos para GameFind (Scraping Propio)

-- 1. Tabla de Tiendas
CREATE TABLE tiendas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- QUE SEA 1,2,3
    nombre TEXT NOT NULL UNIQUE, -- Steam, Epic Games, GOG
    slug TEXT NOT NULL UNIQUE,   
    url_base TEXT,
    logo_url TEXT,
    fecha_creacion TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabla de Juegos (Biblioteca Central)
CREATE TABLE juegos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- QUE SEA 1,2,3
    nombre TEXT NOT NULL,
    descripcion TEXT,
    imagen_url TEXT,
    steam_app_id TEXT UNIQUE, -- ID interno de Steam para la API Storefront
    epic_slug TEXT UNIQUE,    -- Slug para buscar en Epic
    gog_id TEXT UNIQUE,       -- ID para buscar en GOG
    fecha_creacion TIMESTAMPTZ DEFAULT NOW(),
    fecha_actualizacion TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabla de Precios Actuales (Fuente para la UI)
CREATE TABLE precios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    juego_id UUID REFERENCES juegos(id) ON DELETE CASCADE,
    tienda_id UUID REFERENCES tiendas(id) ON DELETE CASCADE,
    precio_actual NUMERIC(10, 2) NOT NULL,
    precio_original NUMERIC(10, 2),
    descuento INTEGER DEFAULT 0,
    moneda TEXT DEFAULT 'USD',
    url_oferta TEXT,
    ultima_actualizacion TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(juego_id, tienda_id) -- Permite usar UPSERT
);

-- 4. Tabla de Historial de Precios
CREATE TABLE historial_precios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    juego_id UUID REFERENCES juegos(id) ON DELETE CASCADE,
    tienda_id UUID REFERENCES tiendas(id) ON DELETE CASCADE,
    precio NUMERIC(10, 2) NOT NULL,
    fecha_registro TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Trigger para guardar historial automáticamente cuando cambie un precio
CREATE OR REPLACE FUNCTION registrar_historial_precio()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') OR (OLD.precio_actual IS DISTINCT FROM NEW.precio_actual) THEN
        INSERT INTO historial_precios (juego_id, tienda_id, precio)
        VALUES (NEW.juego_id, NEW.tienda_id, NEW.precio_actual);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_historial_precios
AFTER INSERT OR UPDATE ON precios
FOR EACH ROW
EXECUTE FUNCTION registrar_historial_precio();

-- Insertar tiendas iniciales
INSERT INTO tiendas (nombre, slug, url_base, logo_url) VALUES
('Steam', 'steam', 'https://store.steampowered.com', 'https://upload.wikimedia.org/wikipedia/commons/8/83/Steam_icon_logo.svg'),
('Epic Games', 'epic', 'https://store.epicgames.com', 'https://upload.wikimedia.org/wikipedia/commons/3/31/Epic_Games_logo.svg'),
('GOG', 'gog', 'https://www.gog.com', 'https://upload.wikimedia.org/wikipedia/commons/2/2e/GOG.com_logo.svg')
ON CONFLICT DO NOTHING;
