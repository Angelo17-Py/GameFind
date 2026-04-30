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
    console.log('🔍 Extrayendo el TOP 200 de los juegos más jugados de Steam...');
    
    try {
        const { data: tiendaSteam } = await supabase
            .from('tiendas')
            .select('id')
            .eq('slug', 'steam')
            .single();

        if (!tiendaSteam) throw new Error('No se encontró la tienda Steam');
        const TIENDA_STEAM_ID = tiendaSteam.id;

        // Extraer Top 100 últimas 2 semanas y Top 100 de toda la historia
        console.log('📡 Consultando SteamSpy API (Top In 2 Weeks)...');
        const res2Weeks = await fetch('https://steamspy.com/api.php?request=top100in2weeks');
        const data2Weeks = await res2Weeks.json();

        console.log('📡 Consultando SteamSpy API (Top Forever)...');
        const resForever = await fetch('https://steamspy.com/api.php?request=top100forever');
        const dataForever = await resForever.json();

        // Combinar y eliminar duplicados usando el appid
        const juegosMap = new Map();
        
        Object.values(data2Weeks).forEach(game => juegosMap.set(game.appid, game));
        Object.values(dataForever).forEach(game => juegosMap.set(game.appid, game));

        const juegosUnicos = Array.from(juegosMap.values());
        console.log(`\n✅ Se han recolectado ${juegosUnicos.length} juegos Top de Steam. Insertando en la BD...`);

        for (const item of juegosUnicos) {
            const appId = item.appid.toString();
            const title = item.name;
            // Steam usa este formato oficial de imágenes
            const imageUrl = `https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${appId}/header.jpg`;
            
            console.log(`✨ Procesando: ${title}`);
            
            // 3. Guardar/Actualizar el juego (Matching por AppID porque es 100% seguro)
            const { data: juegoGuardado, error: gameError } = await supabase
                .from('juegos')
                .upsert({
                    nombre: title,
                    steam_app_id: appId,
                    imagen_url: imageUrl,
                    descripcion: ""
                }, { onConflict: 'steam_app_id' })
                .select()
                .single();

            if (gameError) {
                console.error(`❌ Error con el juego ${title}:`, gameError.message);
                continue;
            }

            // 4. Guardar el precio
            const precioActual = parseFloat(item.price) / 100;
            const precioOriginal = parseFloat(item.initialprice) / 100;
            const descuento = parseInt(item.discount) || 0;

            const { error: priceError } = await supabase
                .from('precios')
                .upsert({
                    juego_id: juegoGuardado.id,
                    tienda_id: TIENDA_STEAM_ID,
                    precio_actual: precioActual,
                    precio_original: precioOriginal,
                    descuento: descuento,
                    moneda: 'USD',
                    url_oferta: `https://store.steampowered.com/app/${appId}`,
                    ultima_actualizacion: new Date().toISOString()
                }, { onConflict: 'juego_id,tienda_id' });

            if (priceError) {
                console.error(`❌ Error guardando precio de ${title}:`, priceError.message);
            }
        }

        console.log('\n✨ Inyección del TOP 200 de Steam finalizada exitosamente.');

    } catch (error) {
        console.error('💥 Error en el descubrimiento:', error);
    }
}

descubrirOfertasSteam();
