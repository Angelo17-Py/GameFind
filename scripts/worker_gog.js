import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Faltan variables de entorno.');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// API de Catálogo de GOG (Trae las 50 ofertas más populares)
const GOG_CATALOG_URL = 'https://catalog.gog.com/v1/catalog?limit=50&order=desc:trending&productType=in:game&price=asc:0';

async function actualizarPreciosGOG() {
    console.log('🚀 Iniciando actualización de precios de GOG...');

    try {
        // 1. Obtener ID de la tienda GOG
        const { data: tiendaGog } = await supabase
            .from('tiendas')
            .select('id')
            .eq('slug', 'gog')
            .single();

        if (!tiendaGog) throw new Error('No se encontró la tienda GOG en la BD');
        const TIENDA_GOG_ID = tiendaGog.id;

        // 2. Consultar catálogo de GOG
        const response = await fetch(GOG_CATALOG_URL);
        if (!response.ok) throw new Error(`Error de red (${response.status})`);

        const data = await response.json();
        const products = data.products || [];

        console.log(`📡 GOG reporta ${products.length} productos destacados.`);

        for (const item of products) {
            const title = item.title;
            const priceInfo = item.price;
            
            // Imagen principal (GOG usa coverVertical ahora)
            const imageUrl = item.coverVertical || item.images?.main;

            console.log(`🔍 Procesando en GOG: ${title}...`);

            // Asegurar que la URL de imagen sea completa
            const cleanImageUrl = imageUrl?.startsWith('//') ? `https:${imageUrl}` : imageUrl;

            // 3. Buscar si el juego ya existe (Matching por nombre)
            let { data: juegoExistente } = await supabase
                .from('juegos')
                .select('id')
                .ilike('nombre', title)
                .maybeSingle();

            let juegoId;

            if (juegoExistente) {
                juegoId = juegoExistente.id;
                // Actualizamos la foto por si acaso
                await supabase.from('juegos').update({ imagen_url: cleanImageUrl }).eq('id', juegoId);
            } else {
                // Si no existe, lo creamos
                const { data: nuevoJuego, error: createError } = await supabase
                    .from('juegos')
                    .insert({
                        nombre: title,
                        imagen_url: cleanImageUrl,
                        descripcion: "" 
                    })
                    .select()
                    .single();
                
                if (createError) {
                    console.error(`❌ Error creando juego ${title}:`, createError.message);
                    continue;
                }
                juegoId = nuevoJuego.id;
            }

            // 4. Guardar/Actualizar precio
            const precioActual = parseFloat(priceInfo?.finalMoney?.amount);
            const precioOriginal = parseFloat(priceInfo?.baseMoney?.amount || priceInfo?.finalMoney?.amount);
            
            // Calcular descuento si no viene directo
            const descuento = precioOriginal > 0 
                ? Math.round((1 - (precioActual / precioOriginal)) * 100) 
                : 0;

            if (isNaN(precioActual)) {
                console.warn(`⚠️ No se pudo obtener el precio para ${title}. Saltando...`);
                continue;
            }

            const { error: priceError } = await supabase
                .from('precios')
                .upsert({
                    juego_id: juegoId,
                    tienda_id: TIENDA_GOG_ID,
                    precio_actual: precioActual,
                    precio_original: precioOriginal,
                    descuento: descuento,
                    moneda: priceInfo.currency || 'USD',
                    url_oferta: `https://www.gog.com/game/${item.slug}`,
                    ultima_actualizacion: new Date().toISOString()
                }, { onConflict: 'juego_id,tienda_id' });

            if (priceError) {
                console.error(`❌ Error guardando precio de ${title}:`, priceError.message);
            } else {
                console.log(`✅ ${title}: $${precioActual} (-${descuento}%)`);
            }
        }

        console.log('✨ Actualización de GOG finalizada.');

    } catch (error) {
        console.error('💥 Error fatal en worker de GOG:', error.message);
    }
}

actualizarPreciosGOG();
