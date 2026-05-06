/* =========================================================================
   WORKER DE EPIC GAMES (EL TRABAJADOR DE OFERTAS)
   =========================================================================
   Explicación sencilla:
   A diferencia del de Steam, Epic Games es muy cerrado y no nos deja 
   preguntarle los precios fácilmente.
   Así que este trabajador usa un atajo: le pregunta a una página de ofertas 
   llamada "CheapShark" que ya hizo el trabajo difícil por nosotros.
   
   ¿Cómo trabaja?
   1. Se conecta a nuestra base de datos.
   2. Le pide a CheapShark la lista de todas las ofertas actuales de Epic Games.
   3. Revisa cada juego en oferta:
      - Si ya lo tenemos en la base de datos, simplemente le actualiza el precio.
      - Si es un juego nuevo, lo anota por primera vez con su foto.
   ========================================================================= */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// PASO 1: Leer nuestras contraseñas secretas para poder guardar los datos
dotenv.config({ path: '.env.local' });
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Faltan variables de entorno.');
    process.exit(1);
}

// PASO 2: Conectarnos a nuestra base de datos (Supabase)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// PASO 3: Definir a quién le vamos a preguntar. 
// "Store 25" es el código que CheapShark usa para referirse a Epic Games.
const CHEAPSHARK_EPIC_URL = 'https://www.cheapshark.com/api/1.0/deals?storeID=25';

async function actualizarJuegosEpic() {
    console.log('Buscando ofertas de Epic Games a través de CheapShark...');

    try {
        // PASO 4: Buscar el código interno que usamos nosotros para "Epic" en la base de datos
        const { data: tiendaEpic } = await supabase
            .from('tiendas')
            .select('id')
            .eq('slug', 'epic')
            .single();

        if (!tiendaEpic) throw new Error('No se encontró la tienda Epic en la BD');
        const TIENDA_EPIC_ID = tiendaEpic.id;

        // PASO 5: Ir a la página de CheapShark y traer la lista de ofertas
        const response = await fetch(CHEAPSHARK_EPIC_URL);
        if (!response.ok) throw new Error(`Error de red (${response.status})`);

        const games = await response.json(); // Transformar el texto en una lista fácil de leer (JSON)

        console.log(`CheapShark reporta ${games.length} juegos con oferta activa en Epic Games.`);

        // PASO 6: Repetir (Bucle) el proceso para cada juego de la lista que nos dieron
        for (const game of games) {
            // Guardamos los datos útiles que nos mandaron
            const title = game.title;
            const precioActual = parseFloat(game.salePrice);
            const precioOriginal = parseFloat(game.normalPrice);
            const descuento = Math.round(parseFloat(game.savings));
            const imageUrl = game.thumb;
            // Usamos un enlace especial que nos lleva directo a la oferta
            const urlOferta = `https://www.cheapshark.com/redirect?dealID=${game.dealID}`;

            console.log(`Procesando: ${title}...`);

            // PASO 7: ¿Conocemos este juego?
            // Buscamos en nuestra base de datos si ya tenemos un juego con exactamente este nombre (ignorando mayúsculas)
            let { data: juegoExistente } = await supabase
                .from('juegos')
                .select('id')
                .ilike('nombre', title) // ilike sirve para comparar texto sin importar mayúsculas
                .maybeSingle();

            let juegoId;

            if (juegoExistente) {
                // Si el juego existe, anotamos su número de identificación
                juegoId = juegoExistente.id;
            } else {
                // PASO 8: ¡Es un juego nuevo! 
                // Como no lo conocíamos, lo agregamos a la base de datos con su nombre y foto
                const { data: nuevoJuego, error: createError } = await supabase
                    .from('juegos')
                    .insert({
                        nombre: title,
                        imagen_url: imageUrl,
                        descripcion: ""
                    })
                    .select().single();

                if (createError) {
                    console.error(`Error creando juego ${title}:`, createError.message);
                    continue; // Si hubo un error, pasa al siguiente juego sin detener todo
                }
                juegoId = nuevoJuego.id;
            }

            // PASO 9: Guardar o actualizar (Upsert) el precio del juego para la tienda Epic
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
                }, { onConflict: 'juego_id,tienda_id' }); // Esto evita que se dupliquen los precios

            if (priceError) {
                console.error(`Error guardando precio de ${title}:`, priceError.message);
            } else {
                console.log(`${title}: $${precioActual} (-${descuento}%)`);
            }
        }

        console.log('Misión cumplida. Actualización de Epic Games finalizada.');

    } catch (error) {
        console.error('Error fatal en worker de Epic:', error.message);
    }
}

// ¡A trabajar! Esta es la orden final que enciende el worker.
actualizarJuegosEpic();
