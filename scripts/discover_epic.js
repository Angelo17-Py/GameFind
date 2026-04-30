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

async function descubrirTopJuegosEpic() {
    console.log('🚀 Extrayendo el TOP 100 de mejores juegos de Epic Games...');

    try {
        const { data: tiendaEpic } = await supabase
            .from('tiendas')
            .select('id')
            .eq('slug', 'epic')
            .single();

        if (!tiendaEpic) throw new Error('No se encontró la tienda Epic en la BD');
        const TIENDA_EPIC_ID = tiendaEpic.id;

        let allGames = [];
        
        // Extraemos las 2 primeras páginas (50 resultados cada una)
        for (let page = 0; page < 2; page++) {
            const url = `https://www.cheapshark.com/api/1.0/deals?storeID=25&sortBy=SteamRating&pageSize=50&pageNumber=${page}`;
            console.log(`📡 Consultando página ${page + 1}...`);
            const response = await fetch(url);
            const games = await response.json();
            allGames = allGames.concat(games);
        }

        console.log(`\n✅ Se han recolectado ${allGames.length} juegos Top de Epic. Insertando en la BD...`);

        for (const game of allGames) {
            const title = game.title;
            const precioActual = parseFloat(game.salePrice);
            const precioOriginal = parseFloat(game.normalPrice);
            const descuento = Math.round(parseFloat(game.savings));
            const imageUrl = game.thumb;
            const urlOferta = `https://www.cheapshark.com/redirect?dealID=${game.dealID}`;

            // Matching por nombre con juego ya existente
            let { data: juegoExistente } = await supabase
                .from('juegos')
                .select('id')
                .ilike('nombre', title)
                .maybeSingle();

            let juegoId;

            if (juegoExistente) {
                juegoId = juegoExistente.id;
            } else {
                const { data: nuevoJuego, error: createError } = await supabase
                    .from('juegos')
                    .insert({
                        nombre: title,
                        imagen_url: imageUrl,
                        descripcion: ""
                    })
                    .select().single();

                if (createError) {
                    console.error(`❌ Error creando juego ${title}:`, createError.message);
                    continue;
                }
                juegoId = nuevoJuego.id;
            }

            const { error: priceError } = await supabase
                .from('precios')
                .upsert({
                    juego_id: juegoId,
                    tienda_id: TIENDA_EPIC_ID,
                    precio_actual: precioActual,
                    precio_original: precioOriginal,
                    descuento: descuento,
                    moneda: 'USD',
                    url_oferta: urlOferta,
                    ultima_actualizacion: new Date().toISOString()
                }, { onConflict: 'juego_id,tienda_id' });

            if (priceError) {
                console.error(`❌ Error guardando precio de ${title}:`, priceError.message);
            } else {
                console.log(`🎮 Registrado: ${title} -> $${precioActual} (-${descuento}%)`);
            }
        }

        console.log('\n✨ Descubrimiento del Top 100 finalizado exitosamente.');

    } catch (error) {
        console.error('💥 Error fatal en discover_epic:', error.message);
    }
}

descubrirTopJuegosEpic();
