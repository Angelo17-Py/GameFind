import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import * as cheerio from 'cheerio';

dotenv.config({ path: '.env.local' });
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Faltan variables de entorno.');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const GAMESPLANET_OFFERS_URL = 'https://us.gamesplanet.com/games/offers';

async function actualizarPreciosGamesplanet() {
    console.log('🚀 Iniciando actualización de precios de Gamesplanet...');

    try {
        // 1. Obtener ID de la tienda Gamesplanet
        const { data: tiendaGp } = await supabase
            .from('tiendas')
            .select('id')
            .eq('slug', 'gamesplanet')
            .single();

        if (!tiendaGp) throw new Error('No se encontró la tienda Gamesplanet en la BD. Ejecuta el insert primero.');
        const TIENDA_GP_ID = tiendaGp.id;

        // 2. Descargar HTML de ofertas
        const response = await fetch(GAMESPLANET_OFFERS_URL, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        if (!response.ok) throw new Error(`Error de red (${response.status})`);
        
        const html = await response.text();
        const $ = cheerio.load(html);

        const games = [];

        // 3. Parsear cada tarjeta de juego
        $('.game_list').each((i, el) => {
            const card = $(el);
            
            // Título y Enlace (están en un h4 oculto)
            const titleElement = card.find('h4.d-none a');
            const title = titleElement.text().trim();
            const urlPath = titleElement.attr('href');
            
            // Precios
            const priceCurrent = card.find('.price_current').text().replace('$', '').trim();
            const priceRetail = card.find('.price_base strike').text().replace('$', '').trim();
            const discount = card.find('.price_saving').text().replace('-', '').replace('%', '').trim();
            
            // Imagen
            const imageUrl = card.find('img.card-img-top').attr('src');

            if (title && priceCurrent && !priceCurrent.includes('Not available')) {
                games.push({
                    title,
                    precioActual: parseFloat(priceCurrent),
                    precioOriginal: parseFloat(priceRetail) || parseFloat(priceCurrent),
                    descuento: parseInt(discount) || 0,
                    imageUrl: imageUrl,
                    url: `https://us.gamesplanet.com${urlPath}`
                });
            }
        });

        console.log(`📡 Gamesplanet reporta ${games.length} juegos en oferta.`);

        for (const game of games) {
            console.log(`🔍 Procesando en Gamesplanet: ${game.title}...`);

            // 4. Buscar si el juego ya existe (Matching por nombre)
            let { data: juegoExistente } = await supabase
                .from('juegos')
                .select('id')
                .ilike('nombre', game.title)
                .maybeSingle();

            let juegoId;

            if (juegoExistente) {
                juegoId = juegoExistente.id;
                // Actualizamos la foto por si acaso
                await supabase.from('juegos').update({ imagen_url: game.imageUrl }).eq('id', juegoId);
            } else {
                // Si no existe, lo creamos
                const { data: nuevoJuego, error: createError } = await supabase
                    .from('juegos')
                    .insert({
                        nombre: game.title,
                        imagen_url: game.imageUrl,
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

            // 5. Guardar el precio
            await supabase.from('precios').upsert({
                juego_id: juegoId,
                tienda_id: TIENDA_GP_ID,
                precio_actual: game.precioActual,
                precio_original: game.precioOriginal,
                descuento: game.descuento,
                moneda: 'USD',
                url_oferta: game.url,
                ultima_actualizacion: new Date().toISOString()
            }, { onConflict: 'juego_id,tienda_id' });

            console.log(`✅ ${game.title}: $${game.precioActual} (-${game.descuento}%)`);
        }

        console.log('✨ Actualización de Gamesplanet finalizada.');

    } catch (error) {
        console.error('💥 Error fatal en worker de Gamesplanet:', error.message);
    }
}

actualizarPreciosGamesplanet();
