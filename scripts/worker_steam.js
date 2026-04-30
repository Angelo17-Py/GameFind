import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
// También intentar cargar .env por si acaso
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // Importante: usar Service Role para escritura

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Error: Faltan variables de entorno (VITE_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY)');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const ESPERA_MS = 10000; // 10 segundos según reglas

const esperar = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function actualizarPreciosSteam() {
    console.log('🚀 Iniciando actualización de precios de Steam...');
    console.log(`🔗 Conectando a: ${SUPABASE_URL}`);

    // Diagnóstico: verificar conexión y permisos básicos
    const { data: testData, error: testError } = await supabase
        .from('tiendas')
        .select('id, nombre')
        .limit(1);

    if (testError) {
        console.error('❌ Error de conexión/permisos:', testError);
        console.error('\n💡 Solución: Ejecuta en el SQL Editor de Supabase:');
        console.error('   GRANT USAGE ON SCHEMA public TO service_role;');
        console.error('   GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO service_role;');
        console.error('   GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO service_role;');
        console.error('   ALTER TABLE juegos DISABLE ROW LEVEL SECURITY;');
        console.error('   ALTER TABLE tiendas DISABLE ROW LEVEL SECURITY;');
        console.error('   ALTER TABLE precios DISABLE ROW LEVEL SECURITY;');
        console.error('   ALTER TABLE historial_precios DISABLE ROW LEVEL SECURITY;');
        return;
    }

    console.log('✅ Conexión exitosa! Tiendas disponibles:', testData);

    // Obtener el UUID real de la tienda Steam dinámicamente
    const { data: tiendaSteam, error: tiendaError } = await supabase
        .from('tiendas')
        .select('id')
        .eq('slug', 'steam')
        .single();

    if (tiendaError || !tiendaSteam) {
        console.error('❌ No se encontró la tienda Steam en la base de datos:', tiendaError);
        return;
    }

    const TIENDA_STEAM_ID = tiendaSteam.id;
    console.log(`🏪 Tienda Steam ID: ${TIENDA_STEAM_ID}`);

    // 1. Obtener juegos que tengan steam_app_id
    const { data: juegos, error } = await supabase
        .from('juegos')
        .select('id, nombre, steam_app_id')
        .not('steam_app_id', 'is', null);

    if (error) {
        console.error('Error al obtener juegos:', error);
        return;
    }

    console.log(`📦 Se encontraron ${juegos.length} juegos para procesar.`);

    for (const juego of juegos) {
        try {
            console.log(`🔍 Procesando: ${juego.nombre} (ID: ${juego.steam_app_id})...`);

            const url = `https://store.steampowered.com/api/appdetails?appids=${juego.steam_app_id}&cc=us&l=en`;
            const response = await fetch(url);
            const data = await response.json();

            if (data[juego.steam_app_id]?.success) {
                const info = data[juego.steam_app_id].data;
                const priceInfo = info.price_overview;

                if (priceInfo) {
                    const precioActual = priceInfo.final / 100;
                    const precioOriginal = priceInfo.initial / 100;
                    const descuento = priceInfo.discount_percent;
                    const moneda = priceInfo.currency;

                    // 1.5 Actualizar info básica del juego (Imagen y Descripción)
                    await supabase
                        .from('juegos')
                        .update({
                            imagen_url: info.header_image,
                            descripcion: info.short_description
                        })
                        .eq('id', juego.id);

                    // 2. Upsert en la tabla de precios
                    const { error: upsertError } = await supabase
                        .from('precios')
                        .upsert({
                            juego_id: juego.id,
                            tienda_id: TIENDA_STEAM_ID,
                            precio_actual: precioActual,
                            precio_original: precioOriginal,
                            descuento: descuento,
                            moneda: moneda,
                            url_oferta: `https://store.steampowered.com/app/${juego.steam_app_id}`,
                            ultima_actualizacion: new Date().toISOString()
                        }, { onConflict: 'juego_id,tienda_id' });

                    if (upsertError) {
                        console.error(`❌ Error al guardar precio de ${juego.nombre}:`, upsertError);
                    } else {
                        console.log(`✅ ${juego.nombre}: $${precioActual} ${moneda} (${descuento}% desc)`);
                    }
                } else {
                    console.log(`⚠️ ${juego.nombre} no tiene información de precio (posiblemente gratuito o no disponible).`);
                }
            } else {
                console.warn(`⚠️ Steam no devolvió éxito para ${juego.nombre}.`);
            }

        } catch (err) {
            console.error(`💥 Error fatal procesando ${juego.nombre}:`, err);
        }

        console.log(`Waiting ${ESPERA_MS / 1000}s for next request...`);
        await esperar(ESPERA_MS);
    }

    console.log('✨ Actualización de Steam finalizada.');
}

actualizarPreciosSteam();
