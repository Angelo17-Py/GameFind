import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import * as cheerio from 'cheerio';

dotenv.config({ path: '.env.local' });
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function sincronizarPreciosCruzados() {
    console.log('🔄 Iniciando Sincronización Cruzada de Precios...');

    try {
        // 1. Obtener IDs de las tiendas
        const { data: tiendas } = await supabase.from('tiendas').select('id, slug');
        const storeMap = Object.fromEntries(tiendas.map(t => [t.slug, t.id]));

        // 2. Obtener todos los juegos para sincronizarlos
        const { data: juegos } = await supabase
            .from('juegos')
            .select('id, nombre');

        for (const juego of juegos) {
            console.log(`\n⚖️ Buscando comparaciones para: ${juego.nombre}...`);

            // --- BUSCAR EN GOG ---
            try {
                const gogSearchUrl = `https://catalog.gog.com/v1/catalog?limit=1&q=${encodeURIComponent(juego.nombre)}`;
                const resGog = await fetch(gogSearchUrl);
                const dataGog = await resGog.json();
                
                const gogItem = dataGog.products?.[0];
                if (gogItem && gogItem.title.toLowerCase().includes(juego.nombre.toLowerCase())) {
                    const p = gogItem.price;
                    const precioActual = parseFloat(p.finalMoney.amount);
                    const precioOriginal = parseFloat(p.baseMoney.amount);
                    const descuento = precioOriginal > 0 ? Math.round((1 - (precioActual / precioOriginal)) * 100) : 0;

                    await supabase.from('precios').upsert({
                        juego_id: juego.id,
                        tienda_id: storeMap['gog'],
                        precio_actual: precioActual,
                        precio_original: precioOriginal,
                        descuento: descuento,
                        moneda: p.finalMoney.currency,
                        url_oferta: `https://www.gog.com/game/${gogItem.slug}`,
                        ultima_actualizacion: new Date().toISOString()
                    }, { onConflict: 'juego_id,tienda_id' });
                    
                    console.log(`✅ GOG: $${precioActual} encontrado.`);
                }
            } catch (e) { console.error('❌ Error buscando en GOG'); }

            // --- BUSCAR EN STEAM ---
            try {
                const steamSearchUrl = `https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(juego.nombre)}&l=spanish&cc=US`;
                const resSteam = await fetch(steamSearchUrl);
                const dataSteam = await resSteam.json();

                const steamItem = dataSteam.items?.[0];
                if (steamItem && steamItem.name.toLowerCase().includes(juego.nombre.toLowerCase())) {
                    // Para Steam necesitamos el detalle para el precio base
                    const appId = steamItem.id;
                    const resDetail = await fetch(`https://store.steampowered.com/api/appdetails?appids=${appId}&cc=US`);
                    const detailData = await resDetail.json();
                    
                    if (detailData[appId]?.success) {
                        const price = detailData[appId].data.price_overview;
                        if (price) {
                            await supabase.from('precios').upsert({
                                juego_id: juego.id,
                                tienda_id: storeMap['steam'],
                                precio_actual: price.final / 100,
                                precio_original: price.initial / 100,
                                descuento: price.discount_percent,
                                moneda: price.currency,
                                url_oferta: `https://store.steampowered.com/app/${appId}`,
                                ultima_actualizacion: new Date().toISOString()
                            }, { onConflict: 'juego_id,tienda_id' });
                            console.log(`✅ Steam: $${price.final / 100} encontrado.`);
                        }
                    }
                }
            } catch (e) { console.error('❌ Error buscando en Steam'); }

            // --- BUSCAR EN EPIC GAMES (Vía CheapShark) ---
            try {
                if (storeMap['epic']) {
                    const epicSearchUrl = `https://www.cheapshark.com/api/1.0/deals?storeID=25&title=${encodeURIComponent(juego.nombre)}`;
                    const resEpic = await fetch(epicSearchUrl);
                    const dataEpic = await resEpic.json();

                    // CheapShark devuelve array de resultados, tomamos el primero
                    const epicItem = dataEpic?.[0];
                    
                    if (epicItem && epicItem.title.toLowerCase().includes(juego.nombre.toLowerCase())) {
                        const precioActual = parseFloat(epicItem.salePrice);
                        const precioOriginal = parseFloat(epicItem.normalPrice);
                        const descuento = Math.round(parseFloat(epicItem.savings));
                        
                        // Generamos el enlace para que el botón funcione
                        const urlOferta = `https://www.cheapshark.com/redirect?dealID=${epicItem.dealID}`;

                        await supabase.from('precios').upsert({
                            juego_id: juego.id,
                            tienda_id: storeMap['epic'],
                            precio_actual: precioActual,
                            precio_original: precioOriginal,
                            descuento: descuento,
                            moneda: 'USD',
                            url_oferta: urlOferta,
                            ultima_actualizacion: new Date().toISOString()
                        }, { onConflict: 'juego_id,tienda_id' });
                        
                        console.log(`✅ Epic Games: $${precioActual} encontrado.`);
                    }
                }
            } catch (e) { console.error('❌ Error buscando en Epic Games'); }

            // --- BUSCAR EN GAMESPLANET ---
            try {
                if (storeMap['gamesplanet']) {
                    const gpSearchUrl = `https://us.gamesplanet.com/search?query=${encodeURIComponent(juego.nombre)}`;
                    const resGp = await fetch(gpSearchUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
                    const html = await resGp.text();
                    const $ = cheerio.load(html);

                    // Tomamos el primer resultado
                    const firstCard = $('.game_list').first();
                    if (firstCard.length > 0) {
                        const titleElement = firstCard.find('h4 a');
                        const title = titleElement.text().trim();
                        const urlPath = titleElement.attr('href');
                        
                        // Solo si el título se parece al que buscamos
                        if (title.toLowerCase().includes(juego.nombre.toLowerCase())) {
                            const priceCurrentText = firstCard.find('.price_current').text().replace('$', '').trim();
                            const priceRetailText = firstCard.find('.price_base strike').text().replace('$', '').trim();
                            const discountText = firstCard.find('.price_saving').text().replace('-', '').replace('%', '').trim();
                            
                            const precioActual = parseFloat(priceCurrentText);
                            if (!isNaN(precioActual)) {
                                const precioOriginal = parseFloat(priceRetailText) || precioActual;
                                const descuento = parseInt(discountText) || 0;

                                await supabase.from('precios').upsert({
                                    juego_id: juego.id,
                                    tienda_id: storeMap['gamesplanet'],
                                    precio_actual: precioActual,
                                    precio_original: precioOriginal,
                                    descuento: descuento,
                                    moneda: 'USD',
                                    url_oferta: `https://us.gamesplanet.com${urlPath}`,
                                    ultima_actualizacion: new Date().toISOString()
                                }, { onConflict: 'juego_id,tienda_id' });
                                
                                console.log(`✅ Gamesplanet: $${precioActual} encontrado.`);
                            }
                        }
                    }
                }
            } catch (e) { console.error('❌ Error buscando en Gamesplanet'); }

            // --- BUSCAR EN GAMERSGATE ---
            try {
                if (storeMap['gamersgate']) {
                    const ggSearchUrl = `https://www.gamersgate.com/games/?query=${encodeURIComponent(juego.nombre)}`;
                    const resGg = await fetch(ggSearchUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
                    const html = await resGg.text();
                    const $ = cheerio.load(html);

                    const firstCard = $('.catalog-item.product--item').first();
                    if (firstCard.length > 0) {
                        const titleElement = firstCard.find('.catalog-item--title a');
                        const title = titleElement.text().trim();
                        const urlPath = titleElement.attr('href');
                        
                        if (title.toLowerCase().includes(juego.nombre.toLowerCase())) {
                            const priceCurrentText = firstCard.find('.catalog-item--price > span').text().replace('$', '').trim();
                            const priceRetailText = firstCard.find('.catalog-item--full-price').text().replace('$', '').trim();
                            const discountText = firstCard.find('.product--label-discount').text().replace('-', '').replace('%', '').trim();
                            
                            const precioActual = parseFloat(priceCurrentText);
                            if (!isNaN(precioActual)) {
                                const precioOriginal = parseFloat(priceRetailText) || precioActual;
                                const descuento = parseInt(discountText) || 0;

                                await supabase.from('precios').upsert({
                                    juego_id: juego.id,
                                    tienda_id: storeMap['gamersgate'],
                                    precio_actual: precioActual,
                                    precio_original: precioOriginal,
                                    descuento: descuento,
                                    moneda: 'USD',
                                    url_oferta: `https://www.gamersgate.com${urlPath}`,
                                    ultima_actualizacion: new Date().toISOString()
                                }, { onConflict: 'juego_id,tienda_id' });
                                
                                console.log(`✅ GamersGate: $${precioActual} encontrado.`);
                            }
                        }
                    }
                }
            } catch (e) { console.error('❌ Error buscando en GamersGate'); }

            // Delay para evitar bloqueos (10 segundos tal y como especifica AGENTS.md)
            console.log('⏳ Esperando 10 segundos para no saturar las tiendas...');
            await new Promise(r => setTimeout(r, 10000));
        }

        console.log('\n✨ Sincronización cruzada finalizada.');

    } catch (error) {
        console.error('💥 Error fatal:', error);
    }
}

sincronizarPreciosCruzados();
