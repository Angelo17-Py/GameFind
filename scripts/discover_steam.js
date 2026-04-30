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

async function descubrirOfertasSteam() {
    console.log('🔍 Buscando ofertas destacadas en Steam...');
    
    try {
        // Obtener el UUID de la tienda Steam
        const { data: tiendaSteam } = await supabase
            .from('tiendas')
            .select('id')
            .eq('slug', 'steam')
            .single();

        if (!tiendaSteam) throw new Error('No se encontró la tienda Steam');
        const TIENDA_STEAM_ID = tiendaSteam.id;

        // 1. Consultar categorías destacadas de Steam
        const res = await fetch('https://store.steampowered.com/api/featuredcategories?cc=us&l=en');
        const data = await res.json();
        
        // 2. Extraer juegos de la sección "Specials"
        const specials = data.specials?.items || [];
        console.log(`📡 Steam reporta ${specials.length} ofertas destacadas.`);

        for (const item of specials) {
            const appId = item.id.toString();
            console.log(`✨ Procesando oferta: ${item.name}`);
            
            // 3. Guardar/Actualizar el juego
            const { data: juegoGuardado, error: gameError } = await supabase
                .from('juegos')
                .upsert({
                    nombre: item.name,
                    steam_app_id: appId,
                    imagen_url: item.header_image
                }, { onConflict: 'steam_app_id' })
                .select()
                .single();

            if (gameError) {
                console.error(`❌ Error con el juego ${item.name}:`, gameError.message);
                continue;
            }

            // 4. Guardar el precio directamente (Steam ya nos lo da aquí)
            if (item.final_price !== undefined) {
                const precioActual = item.final_price / 100;
                const precioOriginal = (item.original_price || item.final_price) / 100;
                const descuento = item.discount_percent || 0;

                const { error: priceError } = await supabase
                    .from('precios')
                    .upsert({
                        juego_id: juegoGuardado.id,
                        tienda_id: TIENDA_STEAM_ID,
                        precio_actual: precioActual,
                        precio_original: precioOriginal,
                        descuento: descuento,
                        moneda: item.currency || 'USD',
                        url_oferta: `https://store.steampowered.com/app/${appId}`,
                        ultima_actualizacion: new Date().toISOString()
                    }, { onConflict: 'juego_id,tienda_id' });

                if (priceError) console.error(`❌ Error guardando precio:`, priceError.message);
            }
        }

        console.log('✅ Descubrimiento y actualización de precios inmediata finalizada.');

    } catch (error) {
        console.error('💥 Error en el descubrimiento:', error);
    }
}

descubrirOfertasSteam();
