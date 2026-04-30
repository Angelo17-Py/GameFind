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

// Endpoint de CheapShark para extraer las ofertas actuales de la Store 25 (Epic Games)
const CHEAPSHARK_EPIC_URL = 'https://www.cheapshark.com/api/1.0/deals?storeID=25';

async function actualizarJuegosEpic() {
    console.log('🚀 Buscando ofertas de Epic Games a través de CheapShark...');

    try {
        const { data: tiendaEpic } = await supabase
            .from('tiendas')
            .select('id')
            .eq('slug', 'epic')
            .single();

        if (!tiendaEpic) throw new Error('No se encontró la tienda Epic en la BD');
        const TIENDA_EPIC_ID = tiendaEpic.id;

        const response = await fetch(CHEAPSHARK_EPIC_URL);
        if (!response.ok) throw new Error(`Error de red (${response.status})`);

        const games = await response.json();

        console.log(`📡 CheapShark reporta ${games.length} juegos con oferta activa en Epic Games.`);

        for (const game of games) {
            const title = game.title;
            const precioActual = parseFloat(game.salePrice);
            const precioOriginal = parseFloat(game.normalPrice);
            const descuento = Math.round(parseFloat(game.savings));
            const imageUrl = game.thumb;
            // CheapShark URL para redirigir si no tenemos slug (podríamos construir la de Epic, pero Cheapshark ya valida esto).
            const urlOferta = `https://www.cheapshark.com/redirect?dealID=${game.dealID}`;

            console.log(`🔍 Procesando: ${title}...`);

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
                console.log(`✅ ${title}: $${precioActual} (-${descuento}%)`);
            }
        }

        console.log('✨ Actualización de Epic Games finalizada.');

    } catch (error) {
        console.error('💥 Error fatal en worker de Epic:', error.message);
    }
}

actualizarJuegosEpic();
