/* =========================================================================
   🤖 WORKER DE STEAM (EL TRABAJADOR AUTOMÁTICO)
   =========================================================================
   Explicación sencilla:
   Imaginemos que este código es un empleado (un "worker" o trabajador) que 
   mandamos a la tienda de Steam a revisar los precios por nosotros.
   
   ¿Cómo trabaja?
   1. Se conecta a nuestra base de datos de Supabase).
   2. Busca en nuestra base de datos todos los juegos que sabemos que están en Steam.
   3. Va a la tienda virtual de Steam y pregunta el precio de cada uno (usando una API).
   4. Anota los precios nuevos en nuestra base de datos y guarda la foto del juego.
   5. ¡MUY IMPORTANTE!: Descansa 10 segundos entre cada juego para que Steam 
      no piense que somos un robot malo y nos bloquee.
   ========================================================================= */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// PASO 1: Leer las contraseñas secretas para poder entrar a nuestra base de datos
dotenv.config({ path: '.env.local' });
dotenv.config(); // También intentar cargar .env por si acaso

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // La llave maestra que permite escribir

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Error: Faltan variables de entorno (VITE_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY)');
    process.exit(1);
}

// PASO 2: Conectarnos a la base de datos usando nuestras llaves
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// PASO 3: Definir el tiempo de descanso (10 segundos)
// Esto es para cumplir la regla de "no hacer scraping masivo sin control"
const ESPERA_MS = 10000;

// Función auxiliar para decirle al trabajador que se detenga y espere
const esperar = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function actualizarPreciosSteam() {
    console.log('🚀 Iniciando actualización de precios de Steam...');
    console.log(`🔗 Conectando a: ${SUPABASE_URL}`);

    // PASO 4: Comprobar que podemos leer la base de datos sin problemas
    const { data: testData, error: testError } = await supabase
        .from('tiendas')
        .select('id, nombre')
        .limit(1);

    if (testError) {
        console.error('❌ Error de conexión/permisos:', testError);
        return;
    }
    console.log('✅ Conexión exitosa! Tiendas disponibles:', testData);

    // PASO 5: Buscar el número de identificación interno que le pusimos a "Steam" en nuestra base de datos
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

    // PASO 6: Buscar qué juegos en nuestra base de datos tienen un código de Steam
    // (Solo le preguntaremos a Steam por los juegos que sabemos que vende)
    const { data: juegos, error } = await supabase
        .from('juegos')
        .select('id, nombre, steam_app_id')
        .not('steam_app_id', 'is', null);

    if (error) {
        console.error('Error al obtener juegos:', error);
        return;
    }

    console.log(`📦 Se encontraron ${juegos.length} juegos para procesar.`);

    // PASO 7: Ir juego por juego preguntando el precio
    // Esto es un "bucle" o repetición: repite lo mismo para cada juego de la lista.
    for (const juego of juegos) {
        try {
            console.log(`🔍 Procesando: ${juego.nombre} (ID: ${juego.steam_app_id})...`);

            // Aquí está el truco: usamos un enlace "oculto" de Steam (una API) 
            // que nos devuelve los datos en texto puro, sin gráficos pesados.
            const url = `https://store.steampowered.com/api/appdetails?appids=${juego.steam_app_id}&cc=us&l=en`;
            const response = await fetch(url);
            const data = await response.json(); // Convertir la respuesta a un formato fácil de leer (JSON)

            // Si Steam dice "success: true", significa que encontró el juego
            if (data[juego.steam_app_id]?.success) {
                const info = data[juego.steam_app_id].data;
                const priceInfo = info.price_overview;

                // Si el juego no es gratis y tiene un precio
                if (priceInfo) {
                    // Los precios vienen en centavos, así que los dividimos entre 100 para tener dólares normales
                    const precioActual = priceInfo.final / 100;
                    const precioOriginal = priceInfo.initial / 100;
                    const descuento = priceInfo.discount_percent;
                    const moneda = priceInfo.currency;

                    // PASO 8: Aprovechamos de guardar la foto de portada y descripción oficial del juego
                    await supabase
                        .from('juegos')
                        .update({
                            imagen_url: info.header_image,
                            descripcion: info.short_description
                        })
                        .eq('id', juego.id);

                    // PASO 9: Guardar o actualizar (Upsert) el precio en nuestra base de datos.
                    // Si el precio ya existía, lo actualiza. Si es nuevo, lo crea. ¡Así evitamos duplicados!
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

        // PASO 10: El descanso obligatorio. 
        // El trabajador se toma un café por 10 segundos antes de ir al siguiente juego.
        // Sin esto, Steam nos banearía (nos echaría de la tienda por hacer muchas preguntas muy rápido).
        console.log(`⏳ Tomando un descanso de ${ESPERA_MS / 1000} segundos para no saturar a Steam...`);
        await esperar(ESPERA_MS);
    }

    console.log('✨ Misión cumplida. Actualización de Steam finalizada.');
}

// ¡A trabajar! Esta es la orden final que enciende el worker.
actualizarPreciosSteam();

