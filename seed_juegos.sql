-- Insertar juegos famosos para scraping (compatible con UUIDs)
INSERT INTO juegos (nombre, steam_app_id, imagen_url) VALUES
('Elden Ring', '1245620', 'https://shared.fastly.steamstatic.com/store_images/1245620/header.jpg'),
('Cyberpunk 2077', '1091500', 'https://shared.fastly.steamstatic.com/store_images/1091500/header.jpg'),
('Grand Theft Auto V', '271590', 'https://shared.fastly.steamstatic.com/store_images/271590/header.jpg'),
('Red Dead Redemption 2', '1174180', 'https://shared.fastly.steamstatic.com/store_images/1174180/header.jpg'),
('Baldur''s Gate 3', '1086940', 'https://shared.fastly.steamstatic.com/store_images/1086940/header.jpg'),
('Counter-Strike 2', '730', 'https://shared.fastly.steamstatic.com/store_images/730/header.jpg'),
('Hogwarts Legacy', '990080', 'https://shared.fastly.steamstatic.com/store_images/990080/header.jpg'),
('Starfield', '1716740', 'https://shared.fastly.steamstatic.com/store_images/1716740/header.jpg'),
('The Witcher 3: Wild Hunt', '292030', 'https://shared.fastly.steamstatic.com/store_images/292030/header.jpg'),
('Terraria', '105600', 'https://shared.fastly.steamstatic.com/store_images/105600/header.jpg'),
('Hades', '1145360', 'https://shared.fastly.steamstatic.com/store_images/1145360/header.jpg'),
('Stardew Valley', '413150', 'https://shared.fastly.steamstatic.com/store_images/413150/header.jpg'),
('Dark Souls III', '374320', 'https://shared.fastly.steamstatic.com/store_images/374320/header.jpg'),
('Monster Hunter: World', '582010', 'https://shared.fastly.steamstatic.com/store_images/582010/header.jpg'),
('Death Stranding', '1190460', 'https://shared.fastly.steamstatic.com/store_images/1190460/header.jpg'),
('God of War', '1593500', 'https://shared.fastly.steamstatic.com/store_images/1593500/header.jpg'),
('Spider-Man Remastered', '1817070', 'https://shared.fastly.steamstatic.com/store_images/1817070/header.jpg'),
('Fallout 4', '377160', 'https://shared.fastly.steamstatic.com/store_images/377160/header.jpg'),
('Sekiro: Shadows Die Twice', '814380', 'https://shared.fastly.steamstatic.com/store_images/814380/header.jpg'),
('Horizon Zero Dawn', '1151640', 'https://shared.fastly.steamstatic.com/store_images/1151640/header.jpg')
ON CONFLICT (steam_app_id) DO NOTHING;

-- Alias iniciales para busqueda por abreviaturas y nombres alternativos.
-- Requiere haber ejecutado primero supabase_schema.sql o supabase_busqueda_inteligente.sql.
INSERT INTO alias_juegos (juego_id, alias)
SELECT j.id, alias_data.alias
FROM juegos j
JOIN (
    VALUES
        ('Grand Theft Auto V', 'GTA'),
        ('Grand Theft Auto V', 'GTA V'),
        ('Grand Theft Auto V', 'GTA 5'),
        ('Red Dead Redemption 2', 'RDR2'),
        ('Red Dead Redemption 2', 'RDR 2'),
        ('Counter-Strike 2', 'CS2'),
        ('Counter-Strike 2', 'CS 2'),
        ('The Witcher 3: Wild Hunt', 'Witcher 3'),
        ('The Witcher 3: Wild Hunt', 'TW3'),
        ('Baldur''s Gate 3', 'BG3'),
        ('Cyberpunk 2077', 'CP2077')
) AS alias_data(nombre_juego, alias)
    ON lower(j.nombre) = lower(alias_data.nombre_juego)
ON CONFLICT (juego_id, alias) DO NOTHING;
