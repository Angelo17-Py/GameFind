import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const gamesList = [
    "EA SPORTS FC™ 25", "EA SPORTS FC™ 26", "TEKKEN 8", "TEKKEN 7", "Street Fighter™ 6",
    "Street Fighter™ V", "Mortal Kombat 11", "Mortal Kombat 1", "DRAGON BALL FighterZ", "DRAGON BALL: Sparking! ZERO",
    "Guilty Gear -Strive-", "THE KING OF FIGHTERS XV", "THE KING OF FIGHTERS XIV STEAM EDITION", "SOULCALIBUR VI", "Injustice™ 2",
    "Injustice: Gods Among Us Ultimate Edition", "MultiVersus", "Nickelodeon All-Star Brawl 2", "Brawlhalla", "Rivals of Aether",
    "Skullgirls 2nd Encore", "MELTY BLOOD: TYPE LUMINA", "NBA 2K25", "Apex Legends™", "Call of Duty®",
    "Warframe", "Destiny 2", "Palworld", "Black Myth: Wukong", "New World: Aeternum",
    "Lost Ark", "The Last of Us™ Part I", "God of War", "Marvel’s Spider-Man Remastered", "Uncharted™: Legacy of Thieves Collection",
    "Days Gone", "Horizon Zero Dawn™ Complete Edition", "Battlefield™ 2042", "Halo: The Master Chief Collection", "Insurgency: Sandstorm",
    "Hell Let Loose", "Ready or Not", "Vampire Survivors", "Dave the Diver", "Undertale",
    "Disco Elysium - The Final Cut", "Outer Wilds", "Valheim", "DayZ", "Green Hell",
    "7 Days to Die", "Microsoft Flight Simulator", "Assetto Corsa", "BeamNG.drive"
];

async function seedGamesList() {
    console.log(`🚀 Iniciando inyección de ${gamesList.length} juegos en la base de datos...`);

    for (const title of gamesList) {
        console.log(`\n🔍 Buscando: ${title}...`);
        
        // 1. Verificamos si ya existe
        const { data: existingGame } = await supabase
            .from('juegos')
            .select('id')
            .ilike('nombre', title)
            .maybeSingle();

        if (existingGame) {
            console.log(`⚠️  ${title} ya existe en la BD. Saltando...`);
            continue;
        }

        let imageUrl = '';

        // 2. Intentamos buscar la imagen en Steam primero (mejor calidad)
        try {
            const resSteam = await fetch(`https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(title)}&l=english&cc=US`);
            const dataSteam = await resSteam.json();
            const steamItem = dataSteam.items?.[0];
            
            if (steamItem && steamItem.name.toLowerCase().includes(title.toLowerCase().split(':')[0])) {
                imageUrl = `https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${steamItem.id}/header.jpg`;
            }
        } catch (e) {}

        // 3. Fallback: Buscar imagen en CheapShark si Steam falló (ej: Fortnite)
        if (!imageUrl) {
            try {
                const resCs = await fetch(`https://www.cheapshark.com/api/1.0/games?title=${encodeURIComponent(title)}&limit=1`);
                const dataCs = await resCs.json();
                if (dataCs && dataCs.length > 0) {
                    imageUrl = dataCs[0].thumb;
                }
            } catch (e) {}
        }

        // Si es Fortnite y todo falló, hardcodeamos una imagen bonita oficial
        if (title === 'Fortnite' && !imageUrl) imageUrl = 'https://cdn2.unrealengine.com/fortnite-key-art-2560x1440-2a8128329cc6.jpg';
        if (title === 'Fall Guys' && !imageUrl) imageUrl = 'https://cdn2.unrealengine.com/fall-guys-hero-1920x1080-6bc537eef9dc.jpg';
        if (title === 'Rocket League' && !imageUrl) imageUrl = 'https://cdn2.unrealengine.com/rl-s16-keyart-textless-1920x1080-9ec802fddba8.jpg';

        // 4. Insertar en la tabla juegos
        const { error: insertError } = await supabase
            .from('juegos')
            .insert({
                nombre: title,
                imagen_url: imageUrl || '',
                descripcion: ""
            });

        if (insertError) {
            console.error(`❌ Error insertando ${title}:`, insertError.message);
        } else {
            console.log(`✅ ${title} agregado a la base de datos.`);
        }
        
        // Delay para no saturar APIs
        await new Promise(r => setTimeout(r, 1000));
    }
    
    console.log('\n✨ Inyección de los 50 juegos finalizada.');
}

seedGamesList();
