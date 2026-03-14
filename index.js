require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus, StreamType } = require('@discordjs/voice');
const play = require('play-dl');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const SpotifyWebApi = require('spotify-web-api-node');

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent 
    ] 
});

const token = process.env.DISCORD_TOKEN;

const spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
});

async function refreshSpotifyToken() {
    try {
        const data = await spotifyApi.clientCredentialsGrant();
        spotifyApi.setAccessToken(data.body['access_token']);
        console.log(`[SPOTIFY] Token didapat, expired dalam ${data.body['expires_in']}s`);
        setTimeout(refreshSpotifyToken, (data.body['expires_in'] - 60) * 1000);
    } catch (err) {
        console.error('[SPOTIFY ERROR] Gagal ambil token:', err.message);
        setTimeout(refreshSpotifyToken, 30000);
    }
}

async function getSpotifyTrack(url) {
    const cleanUrl = url.split('?')[0];
    const match = cleanUrl.match(/spotify[.]com[/]track[/]([a-zA-Z0-9]+)/);
    if (!match) throw new Error('Link Spotify tidak valid!');
    const trackId = match[1];
    const https = require('https');
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'open.spotify.com',
            path: '/track/' + trackId,
            headers: { 'User-Agent': 'Mozilla/5.0' }
        };
        https.get(options, res => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                const titleMatch = data.match(/<title>([^<]+)<[/]title>/);
                if (titleMatch) {
                    const title = titleMatch[1].replace(' | Spotify', '').trim();
                    console.log('[SPOTIFY] Track: ' + title);
                    resolve(title);
                } else {
                    reject(new Error('Tidak bisa ambil judul dari Spotify!'));
                }
            });
        }).on('error', reject);
    });
}

async function getSpotifyPlaylist(url) {
    const cleanUrl = url.split("?")[0];
    const match = cleanUrl.match(/spotify\.com\/playlist\/([a-zA-Z0-9]+)/);
    if (!match) throw new Error('Link Spotify playlist tidak valid!');
    const playlistId = match[1];
    const data = await spotifyApi.getPlaylist(playlistId);
    const tracks = data.body.tracks.items;
    return tracks
        .filter(item => item.track)
        .map(item => {
            const title = item.track.name;
            const artist = item.track.artists.map(a => a.name).join(', ');
            return `${title} ${artist}`;
        });
}

const queues = new Map();
const YTDLP_PATH = process.platform === 'win32'
    ? path.join(__dirname, 'yt-dlp.exe')
    : path.join(__dirname, 'yt-dlp');

async function ensureCookies() {
    const cookiesPath = '/app/cookies.txt';
    if (process.env.YT_COOKIES) {
        fs.writeFileSync(cookiesPath, process.env.YT_COOKIES);
        console.log('[COOKIES] cookies.txt dibuat dari env!');
    }
}

async function ensureYtDlp() {
    if (process.platform === 'win32') return;
    const localPath = path.join(__dirname, 'yt-dlp');
    if (!fs.existsSync(localPath)) {
        console.log('[YT-DLP] Downloading yt-dlp binary...');
        const https = require('https');
        const file = fs.createWriteStream(localPath);
        await new Promise((resolve, reject) => {
            function download(url) {
                https.get(url, res => {
                    if (res.statusCode === 301 || res.statusCode === 302) {
                        download(res.headers.location);
                    } else {
                        res.pipe(file);
                        file.on('finish', () => { file.close(); resolve(); });
                    }
                }).on('error', reject);
            }
            download('https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_linux');
        });
        fs.chmodSync(localPath, '755');
        console.log('[YT-DLP] Binary downloaded!');
    }
}


async function getAudioStream(url) {
    console.log(`[STREAM] Streaming: ${url}`);
    try {
        const stream = await play.stream(url);
        return stream;
    } catch(e) {
        console.log('[STREAM] play-dl failed, trying yt-dlp...');
        const cookiesPath = '/app/cookies.txt';
        const nodePath = process.execPath;
        const args = ['-f', 'bestaudio/best[ext=webm]/bestaudio/best[ext=m4a]/bestaudio', '--no-playlist', '--js-runtimes', 'node:' + nodePath, '-o', '-'];
        if (fs.existsSync(cookiesPath)) args.push('--cookies', cookiesPath);
        args.push(url);
        const proc = spawn(YTDLP_PATH, args);
        proc.stderr.on('data', (d) => console.log('[YT-DLP]', d.toString().trim()));
        proc.on('error', (err) => console.error('[YT-DLP ERROR]', err.message));
        return { stream: proc.stdout, type: StreamType.Arbitrary };
    }
}

async function getVideoTitle(url) {
    try {
        const info = await play.video_info(url);
        return info.video_details.title || 'Unknown Title';
    } catch(e) {
        console.log('[TITLE ERROR]', e.message);
        return 'Unknown Title';
    }
}

async function getLyrics(title) {
    const https = require('https');
    const parts = title.split(' - ');
    let artist, song;
    if (parts.length >= 2) {
        artist = parts[0].trim();
        song = parts.slice(1).join(' - ').trim();
    } else {
        artist = title.split(' ')[0];
        song = title.split(' ').slice(1).join(' ');
    }
    song = song.replace(/[(][^)]*[)]/g, '').replace(/[[[][^\]]*[]]/g, '').trim();
    const url = 'https://api.lyrics.ovh/v1/' + encodeURIComponent(artist) + '/' + encodeURIComponent(song);
    return new Promise((resolve, reject) => {
        https.get(url, res => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    if (json.lyrics) resolve(json.lyrics);
                    else reject(new Error('Lirik tidak ditemukan!'));
                } catch(e) {
                    reject(new Error('Lirik tidak ditemukan!'));
                }
            });
        }).on('error', reject);
    });
}

async function searchYouTube(query) {
    const searched = await play.search(query, { limit: 1 });
    if (!searched || searched.length === 0) throw new Error(`Lagu "${query}" tidak ditemukan!`);
    return { url: searched[0].url, title: searched[0].title };
}

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'play') {
        const query = interaction.options.getString('url');
        console.log(`[DEBUG] Input masuk: "${query}"`);

        if (!query) return interaction.reply({ content: "❌ Tulis judul, link YouTube, atau link Spotify!", ephemeral: true });

        const channel = interaction.member.voice.channel;
        if (!channel) return interaction.reply({ content: "❌ Kamu harus masuk Voice Channel dulu!", ephemeral: true });

        await interaction.deferReply();

        try {
            let songs = [];
            let isPlaylist = false;

            const isSpotifyPlaylist = query.includes('spotify.com/playlist');
            const isSpotify = query.includes('spotify.com');
            const isYouTubeUrl = query.includes('youtube.com/watch') || query.includes('youtu.be/');

            if (isSpotifyPlaylist) {
                console.log(`[DEBUG] Mode: Spotify Playlist`);
                await interaction.editReply(`🔍 Memuat playlist Spotify...`);
                const queries = await getSpotifyPlaylist(query);
                isPlaylist = true;
                for (const q of queries.slice(0, 50)) {
                    try {
                        const result = await searchYouTube(q);
                        songs.push(result);
                    } catch (e) {
                        console.log(`[SKIP] Tidak ketemu: ${q}`);
                    }
                }
                if (songs.length === 0) throw new Error('Tidak ada lagu di playlist yang bisa diputar!');
            } else if (isSpotify) {
                console.log(`[DEBUG] Mode: Spotify Track`);
                const searchQuery = await getSpotifyTrack(query);
                const result = await searchYouTube(searchQuery);
                songs.push(result);
            } else if (isYouTubeUrl) {
                console.log(`[DEBUG] Mode: YouTube URL`);
                const title = await getVideoTitle(query);
                songs.push({ url: query, title });
            } else {
                console.log(`[DEBUG] Mode: Search judul`);
                const result = await searchYouTube(query);
                songs.push(result);
            }

            let serverQueue = queues.get(interaction.guildId);

            if (!serverQueue) {
                const connection = joinVoiceChannel({
                    channelId: channel.id,
                    guildId: interaction.guildId,
                    adapterCreator: channel.guild.voiceAdapterCreator,
                    selfDeaf: false,
                });

                const player = createAudioPlayer();
                connection.subscribe(player);

                serverQueue = { connection, player, songs: [], isPlaying: false };
                queues.set(interaction.guildId, serverQueue);

                connection.on(VoiceConnectionStatus.Disconnected, () => {
                    queues.delete(interaction.guildId);
                });

                player.on(AudioPlayerStatus.Idle, () => {
                    serverQueue.songs.shift();
                    if (serverQueue.songs.length > 0) {
                        playNext(interaction.guildId);
                    } else {
                        serverQueue.isPlaying = false;
                    }
                });

                player.on('error', error => {
                    console.error('[PLAYER ERROR]', error.message);
                    serverQueue.songs.shift();
                    if (serverQueue.songs.length > 0) {
                        playNext(interaction.guildId);
                    } else {
                        serverQueue.isPlaying = false;
                    }
                });
            }

            for (const song of songs) serverQueue.songs.push(song);

            if (!serverQueue.isPlaying) {
                await playNext(interaction.guildId);
                await interaction.editReply(isPlaylist
                    ? `🎶 Memutar playlist (${songs.length} lagu): **${songs[0].title}** dan lainnya!`
                    : `🎶 Memutar: **${songs[0].title}**`
                );
            } else {
                await interaction.editReply(isPlaylist
                    ? `📋 Ditambahkan ${songs.length} lagu dari playlist ke antrian!`
                    : `📋 Ditambahkan ke antrian: **${songs[0].title}** (posisi #${serverQueue.songs.length})`
                );
            }

        } catch (error) {
            console.error("[LOG ERROR]:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
            await interaction.editReply(`❌ Error: ${error.message}`);
        }
    }

    if (interaction.commandName === 'skip') {
        const serverQueue = queues.get(interaction.guildId);
        if (!serverQueue || !serverQueue.isPlaying) return interaction.reply("❌ Tidak ada lagu yang sedang diputar!");
        serverQueue.player.stop();
        await interaction.reply("⏭️ Lagu di-skip!");
    }

    if (interaction.commandName === 'stop') {
        const serverQueue = queues.get(interaction.guildId);
        if (!serverQueue) return interaction.reply("❌ Bot tidak sedang memutar musik!");
        serverQueue.songs = [];
        serverQueue.player.stop();
        serverQueue.connection.destroy();
        queues.delete(interaction.guildId);
        await interaction.reply("⏹️ Musik dihentikan.");
    }

    if (interaction.commandName === 'lyrics') {
        const serverQueue = queues.get(interaction.guildId);
        if (!serverQueue || serverQueue.songs.length === 0) return interaction.reply('❌ Tidak ada lagu yang sedang diputar!');
        const song = serverQueue.songs[0];
        await interaction.deferReply();
        try {
            const lyrics = await getLyrics(song.title);
            const chunks = lyrics.match(/[\s\S]{1,1900}/g) || [];
            await interaction.editReply('🎵 **' + song.title + '**\n\n' + chunks[0]);
            for (let i = 1; i < Math.min(chunks.length, 3); i++) {
                await interaction.followUp(chunks[i]);
            }
        } catch(e) {
            await interaction.editReply('❌ ' + e.message);
        }
    }

    if (interaction.commandName === 'queue') {
        const serverQueue = queues.get(interaction.guildId);
        if (!serverQueue || serverQueue.songs.length === 0) return interaction.reply("📋 Queue kosong!");
        const list = serverQueue.songs
            .slice(0, 10)
            .map((s, i) => `${i === 0 ? '🎶' : `${i}.`} ${s.title}`)
            .join('\n');
        await interaction.reply(`**Queue (${serverQueue.songs.length} lagu):**\n${list}${serverQueue.songs.length > 10 ? `\n...dan ${serverQueue.songs.length - 10} lagu lagi` : ''}`);
    }
});

async function playNext(guildId) {
    const serverQueue = queues.get(guildId);
    if (!serverQueue || serverQueue.songs.length === 0) return;

    const song = serverQueue.songs[0];
    serverQueue.isPlaying = true;
    console.log(`[PLAYING] ${song.title}`);

    try {
        const stream = await getAudioStream(song.url);
        const resource = createAudioResource(stream.stream, { inputType: stream.type });
        serverQueue.player.play(resource);
        console.log(`[PLAYING] ✅ Player mulai!`);
    } catch (error) {
        console.error(`[ERROR] Gagal stream:`, error.message);
        serverQueue.songs.shift();
        serverQueue.isPlaying = false;
        if (serverQueue.songs.length > 0) playNext(guildId);
    }
}

client.once('clientReady', async () => {
    console.log('✅ MELODYCORE SUDAH HIDUP!');
    console.log(`Bot login sebagai: ${client.user.tag}`);
    await ensureCookies();
    await ensureYtDlp();
    await refreshSpotifyToken();
});

client.login(token);