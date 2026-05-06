/* =========================================================================
   🤖 WORKER DE GAMERSGATE (EL LECTOR DE PÁGINAS)
   =========================================================================
   Explicación sencilla:
   GamersGate no tiene una conexión directa (API) fácil de usar.
   Así que nuestro trabajador hace algo diferente: descarga la página web 
   entera como si fuera una revista y se pone a leer el código de la 
   página para buscar dónde están los precios. A esto se le llama "Scraping".
   
   ¿Cómo trabaja?
   1. Se conecta a nuestra base de datos.
   2. Descarga la página principal de ofertas de GamersGate.
   3. Usa una lupa especial (llamada "cheerio") para revisar todo el texto 
      de la página y encontrar las cajitas donde aparecen los juegos.
   4. Recorta la información: título, precio viejo, precio nuevo y foto.
   5. Lo anota todo en nuestra base de datos.
   ========================================================================= */

import { createClient } from '@supabase/supabase-js';
import * as cheerio from 'cheerio'; // Esta es nuestra "lupa" para leer páginas web
import dotenv from 'dotenv';

// PASO 1: Leer nuestras contraseñas y conectarnos a la base de datos
dotenv.config({ path: '.env.local' });
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Este es el código interno fijo que usamos para referirnos a GamersGate en la BD
const TIENDA_GG_ID = '4f9de5bc-6b7a-4fc6-94da-cf081bdc7d13';

async function scrapeGamersGate() {
    console.log('🚀 Iniciando actualización de precios de GamersGate...');
    try {
        // PASO 2: Descargar la "revista" de ofertas
        const response = await fetch('https://www.gamersgate.com/offers/');
        const html = await response.text(); // Guardamos todo el texto de la página
        const $ = cheerio.load(html); // Activamos la lupa especial para leerlo

        const games = [];

        // PASO 3: Buscar las "cajitas" (tarjetas) de los juegos en la página
        // Le decimos a la lupa que busque todo lo que tenga la etiqueta de clase "catalog-item"
        $('.catalog-item.product--item').each((i, el) => {
            const card = $(el); // Esto es una cajita de un juego

            // Empezamos a recortar la información de la cajita
            const titleElement = card.find('.catalog-item--title a');
            const title = titleElement.text().trim(); // Sacamos el nombre
            const urlPath = titleElement.attr('href'); // Sacamos el enlace

            // Sacamos los precios y le quitamos el símbolo de dólar para poder calcular
            const priceCurrent = card.find('.catalog-item--price > span').text().replace('$', '').trim();
            const priceRetail = card.find('.catalog-item--full-price').text().replace('$', '').trim();
            const discount = card.find('.product--label-discount.for-list').text().replace('-', '').replace('%', '').trim();

            const imageUrl = card.find('.catalog-item--image img').attr('src'); // Sacamos la foto

            // PASO 4: Si encontró un juego válido y con precio, lo guardamos en una lista temporal
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

        // PASO 5: Pasar la información de la lista temporal a nuestra base de datos
        for (const game of games) {
            console.log(`🔍 Procesando en GamersGate: ${game.title}...`);

            // Buscamos si ya conocemos este juego
            let { data: juegoExistente } = await supabase
                .from('juegos')
                .select('id')
                .ilike('nombre', game.title)
                .maybeSingle();

            let juegoId;

            if (juegoExistente) {
                // Si existe, solo anotamos su ID y actualizamos la foto por si acaso
                juegoId = juegoExistente.id;
                if (game.imageUrl) {
                    await supabase.from('juegos').update({ imagen_url: game.imageUrl }).eq('id', juegoId);
                }
            } else {
                // Si es nuevo, le creamos un registro nuevo en la base de datos
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
                    continue; // Si hay error, pasamos al siguiente
                }
                juegoId = nuevoJuego.id;
            }

            // PASO 6: Anotamos o actualizamos los precios (Upsert)
            const { error: priceError } = await supabase.from('precios').upsert({
                juego_id: juegoId,
                tienda_id: TIENDA_GG_ID,
                precio_actual: game.precioActual,
                precio_original: game.precioOriginal,
                descuento: game.descuento,
                moneda: 'USD',
                url_oferta: game.url,
                ultima_actualizacion: new Date().toISOString()
            }, { onConflict: 'juego_id,tienda_id' }); // Para evitar duplicados

            if (priceError) {
                console.error(`❌ Error guardando precio para ${game.title}:`, priceError.message);
            } else {
                console.log(`✅ ${game.title}: $${game.precioActual} (-${game.descuento}%)`);
            }
        }

        console.log('✨ Misión cumplida. Actualización de GamersGate finalizada.');
    } catch (error) {
        console.error('💥 Error fatal en GamersGate scraper:', error);
    }
}

// ¡A trabajar! Esta es la orden final que enciende el worker.
scrapeGamersGate();
