/* =========================================================================
   🤖 WORKER DE GOG (EL TRABAJADOR DE "GOOD OLD GAMES")
   =========================================================================
   Explicación sencilla:
   A este trabajador lo mandamos directo al catálogo oficial de la tienda 
   GOG a revisar qué hay de nuevo.
   
   ¿Cómo trabaja?
   1. Se conecta a nuestra base de datos.
   2. Va al catálogo de GOG y le pide una lista de los 50 juegos más 
      populares o en tendencia de este momento.
   3. Revisa juego por juego. Si encontramos un juego nuevo que no 
      conocíamos, lo anota en la base de datos con su foto de portada.
   4. Anota los precios. A veces GOG no dice el porcentaje de descuento, 
      así que nuestro empleado usa una calculadora para sacarlo él mismo.
   ========================================================================= */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// PASO 1: Leer las contraseñas secretas para entrar a la base de datos
dotenv.config({ path: '.env.local' });
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Faltan variables de entorno.');
    process.exit(1);
}

// PASO 2: Nos conectamos a la base de datos
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// PASO 3: Definir nuestro destino.
// Usamos un enlace oculto (API) del catálogo de GOG pidiéndole los 50 juegos más populares.
const GOG_CATALOG_URL = 'https://catalog.gog.com/v1/catalog?limit=50&order=desc:trending&productType=in:game&price=asc:0';

async function actualizarPreciosGOG() {
    console.log('🚀 Iniciando actualización de precios de GOG...');

    try {
        // PASO 4: Buscar el código interno que usamos nosotros para "GOG" en la base de datos
        const { data: tiendaGog } = await supabase
            .from('tiendas')
            .select('id')
            .eq('slug', 'gog')
            .single();

        if (!tiendaGog) throw new Error('No se encontró la tienda GOG en la BD');
        const TIENDA_GOG_ID = tiendaGog.id;

        // PASO 5: Ir a GOG y traer la lista de juegos populares
        const response = await fetch(GOG_CATALOG_URL);
        if (!response.ok) throw new Error(`Error de red (${response.status})`);

        const data = await response.json(); // Transformar en formato leíble (JSON)
        const products = data.products || [];

        console.log(`📡 GOG reporta ${products.length} productos destacados.`);

        // PASO 6: Empezar a revisar la lista juego por juego
        for (const item of products) {
            const title = item.title;
            const priceInfo = item.price;

            // Tratamos de conseguir la mejor foto del juego (preferiblemente en formato vertical)
            const imageUrl = item.coverVertical || item.images?.main;

            console.log(`🔍 Procesando en GOG: ${title}...`);

            // Asegurar que la dirección de la foto esté completa y funcione
            const cleanImageUrl = imageUrl?.startsWith('//') ? `https:${imageUrl}` : imageUrl;

            // PASO 7: ¿Conocemos este juego? (Buscamos si ya está en nuestra base de datos)
            let { data: juegoExistente } = await supabase
                .from('juegos')
                .select('id')
                .ilike('nombre', title) // "ilike" ignora mayúsculas y minúsculas
                .maybeSingle();

            let juegoId;

            if (juegoExistente) {
                // Si ya existe, anotamos su ID
                juegoId = juegoExistente.id;
                // Aprovechamos de actualizarle la foto por si GOG tiene una mejor
                await supabase.from('juegos').update({ imagen_url: cleanImageUrl }).eq('id', juegoId);
            } else {
                // PASO 8: ¡Es un juego nuevo! Lo anotamos por primera vez
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
                    continue; // Si falla, sigue con el próximo juego
                }
                juegoId = nuevoJuego.id;
            }

            // PASO 9: Sacar cuentas con el precio
            const precioActual = parseFloat(priceInfo?.finalMoney?.amount);
            const precioOriginal = parseFloat(priceInfo?.baseMoney?.amount || priceInfo?.finalMoney?.amount);

            // Si GOG no nos dice el porcentaje de descuento, el trabajador saca la calculadora 
            // y lo calcula matemáticamente: (1 - (actual / original)) * 100
            const descuento = precioOriginal > 0
                ? Math.round((1 - (precioActual / precioOriginal)) * 100)
                : 0;

            // Si por algún motivo el precio viene roto (no es un número), lo saltamos
            if (isNaN(precioActual)) {
                console.warn(`⚠️ No se pudo obtener el precio para ${title}. Saltando...`);
                continue;
            }

            // PASO 10: Anotar el precio en la base de datos.
            // "Upsert" significa: "Si ya tiene precio en GOG, actualízalo. Si no, créalo".
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
                }, { onConflict: 'juego_id,tienda_id' }); // Esto evita tener precios duplicados para el mismo juego y tienda

            if (priceError) {
                console.error(`❌ Error guardando precio de ${title}:`, priceError.message);
            } else {
                console.log(`✅ ${title}: $${precioActual} (-${descuento}%)`);
            }
        }

        console.log('✨ Misión cumplida. Actualización de GOG finalizada.');

    } catch (error) {
        console.error('💥 Error fatal en worker de GOG:', error.message);
    }
}

// ¡A trabajar! Esta es la orden final que enciende el worker.
actualizarPreciosGOG();
