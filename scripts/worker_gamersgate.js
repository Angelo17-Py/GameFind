import { createClient } from '@supabase/supabase-js';
import * as cheerio from 'cheerio';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const TIENDA_GG_ID = '4f9de5bc-6b7a-4fc6-94da-cf081bdc7d13';

async function scrapeGamersGate() {
    console.log('🚀 Iniciando actualización de precios de GamersGate...');
    try {
        const response = await fetch('https://www.gamersgate.com/offers/');
        const html = await response.text();
        const $ = cheerio.load(html);

        const games = [];

        $('.catalog-item.product--item').each((i, el) => {
            const card = $(el);
            
            const titleElement = card.find('.catalog-item--title a');
            const title = titleElement.text().trim();
            const urlPath = titleElement.attr('href');
            
            const priceCurrent = card.find('.catalog-item--price > span').text().replace('$', '').trim();
            const priceRetail = card.find('.catalog-item--full-price').text().replace('$', '').trim();
            const discount = card.find('.product--label-discount.for-list').text().replace('-', '').replace('%', '').trim();
            
            const imageUrl = card.find('.catalog-item--image img').attr('src');

            if (title && priceCurrent && !isNaN(parseFloat(priceCurrent))) {
                games.push({
                    title,
                    precioActual: parseFloat(priceCurrent),
                    precioOriginal: parseFloat(priceRetail) || parseFloat(priceCurrent),
                    descuento: parseInt(discount) || 0,
                    imageUrl: imageUrl,
                    url: `https://www.gamersgate.com${urlPath}`
                });
            }
        });

        console.log(`📡 GamersGate reporta ${games.length} juegos en la primera página de ofertas.`);

        for (const game of games) {
            console.log(`🔍 Procesando en GamersGate: ${game.title}...`);

            // 1. Buscar si el juego ya existe (Matching por nombre)
            let { data: juegoExistente } = await supabase
                .from('juegos')
                .select('id')
                .ilike('nombre', game.title)
                .maybeSingle();

            let juegoId;

            if (juegoExistente) {
                juegoId = juegoExistente.id;
                // Actualizar imagen opcionalmente
                if (game.imageUrl) {
                    await supabase.from('juegos').update({ imagen_url: game.imageUrl }).eq('id', juegoId);
                }
            } else {
                const { data: nuevoJuego, error: createError } = await supabase
                    .from('juegos')
                    .insert({
                        nombre: game.title,
                        imagen_url: game.imageUrl || "",
                        descripcion: "" 
                    })
                    .select()
                    .single();
                
                if (createError) {
                    console.error(`❌ Error creando juego ${game.title}:`, createError.message);
                    continue;
                }
                juegoId = nuevoJuego.id;
            }

            // 2. Guardar el precio
            const { error: priceError } = await supabase.from('precios').upsert({
                juego_id: juegoId,
                tienda_id: TIENDA_GG_ID,
                precio_actual: game.precioActual,
                precio_original: game.precioOriginal,
                descuento: game.descuento,
                moneda: 'USD',
                url_oferta: game.url,
                ultima_actualizacion: new Date().toISOString()
            }, { onConflict: 'juego_id,tienda_id' });

            if (priceError) {
                console.error(`❌ Error guardando precio para ${game.title}:`, priceError.message);
            } else {
                console.log(`✅ ${game.title}: $${game.precioActual} (-${game.descuento}%)`);
            }
        }

        console.log('✨ Actualización de GamersGate finalizada.');
    } catch (error) {
        console.error('💥 Error fatal en GamersGate scraper:', error);
    }
}

scrapeGamersGate();
