/* =========================================================================
   WORKER DE GAMESPLANET (EL LECTOR DE PÁGINAS 2)
   =========================================================================
   Explicación sencilla:
   Al igual que GamersGate, Gamesplanet no tiene un acceso fácil de base 
   de datos. Así que usamos la misma estrategia: descargar la página como 
   una revista y ponernos a leer su código con nuestra "lupa" (cheerio).
   
   ¿Cómo trabaja?
   1. Se conecta a nuestra base de datos.
   2. Descarga la página principal de ofertas de Gamesplanet. Se disfraza 
      un poco de "Navegador normal" (User-Agent) para que no lo bloqueen.
   3. Con la lupa recorta de la página los datos importantes: Título, 
      precios y la foto de cada juego.
   4. Lo anota o actualiza todo en nuestra base de datos.
   ========================================================================= */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import * as cheerio from 'cheerio'; // La "lupa" para leer el código de la web

// PASO 1: Leer contraseñas y conectarnos a la base de datos
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
    console.log('Iniciando actualización de precios de Gamesplanet...');

    try {
        // PASO 2: Obtener el ID de la tienda Gamesplanet en nuestra base de datos
        const { data: tiendaGp } = await supabase
            .from('tiendas')
            .select('id')
            .eq('slug', 'gamesplanet')
            .single();

        if (!tiendaGp) throw new Error('No se encontró la tienda Gamesplanet en la BD. Ejecuta el insert primero.');
        const TIENDA_GP_ID = tiendaGp.id;

        // PASO 3: Descargar la "revista" (HTML) de ofertas
        // Le pasamos un "User-Agent" que básicamente le miente a la página y 
        // le dice "Hola, soy un humano usando Google Chrome de Windows", para que nos deje entrar.
        const response = await fetch(GAMESPLANET_OFFERS_URL, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        if (!response.ok) throw new Error(`Error de red (${response.status})`);

        const html = await response.text(); // Guardamos todo el texto de la página
        const $ = cheerio.load(html); // Ponemos la lupa

        const games = [];

        // PASO 4: Buscar cada "tarjetita" de juego en la página
        // Le decimos a la lupa que busque todo lo que tenga la clase "game_list"
        $('.game_list').each((i, el) => {
            const card = $(el); // Esto es una tarjeta de juego

            // Recortar Título y Enlace (están un poco ocultos en Gamesplanet)
            const titleElement = card.find('h4.d-none a');
            const title = titleElement.text().trim();
            const urlPath = titleElement.attr('href');

            // Recortar Precios
            const priceCurrent = card.find('.price_current').text().replace('$', '').trim();
            const priceRetail = card.find('.price_base strike').text().replace('$', '').trim();
            const discount = card.find('.price_saving').text().replace('-', '').replace('%', '').trim();

            // Recortar Imagen
            const imageUrl = card.find('img.card-img-top').attr('src');

            // PASO 5: Si el juego es válido y no dice "No disponible", lo guardamos en la lista temporal
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

        console.log(`Gamesplanet reporta ${games.length} juegos en oferta.`);

        // PASO 6: Pasar la información de la lista a nuestra base de datos (Supabase)
        for (const game of games) {
            console.log(`Procesando en Gamesplanet: ${game.title}...`);

            // Buscamos si ya conocemos este juego
            let { data: juegoExistente } = await supabase
                .from('juegos')
                .select('id')
                .ilike('nombre', game.title) // ignorando mayúsculas/minúsculas
                .maybeSingle();

            let juegoId;

            if (juegoExistente) {
                // Si ya existe, anotamos su ID y actualizamos la foto por si hay una mejor
                juegoId = juegoExistente.id;
                await supabase.from('juegos').update({ imagen_url: game.imageUrl }).eq('id', juegoId);
            } else {
                // PASO 7: Si no existe, creamos un registro nuevo en la base de datos para él
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
                    console.error(`Error creando juego ${game.title}:`, createError.message);
                    continue; // Si falla, pasa al siguiente
                }
                juegoId = nuevoJuego.id;
            }

            // PASO 8: Guardar o actualizar el precio (Upsert) en la base de datos
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

            console.log(`${game.title}: $${game.precioActual} (-${game.descuento}%)`);
        }

        console.log('Misión cumplida. Actualización de Gamesplanet finalizada.');

    } catch (error) {
        console.error('Error fatal en worker de Gamesplanet:', error.message);
    }
}

// ¡A trabajar! Esta es la orden final que enciende el worker.
actualizarPreciosGamesplanet();
