# 🎵 MelodyCore

> Bot musik Discord yang bisa memutar lagu dari YouTube dan Spotify.

## ✨ Fitur

- 🎶 Putar lagu dari **YouTube** (link atau judul)
- 🟢 Putar lagu dari **Spotify** (track & playlist)
- 📋 Sistem antrian lagu
- ⏭️ Skip & stop musik
- 🔄 Auto-play lagu berikutnya

## 🛠️ Commands

| Command | Deskripsi |
|---------|-----------|
| `/play <judul/link>` | Memutar lagu dari YouTube atau Spotify |
| `/skip` | Skip lagu yang sedang diputar |
| `/stop` | Hentikan musik dan bot keluar dari VC |
| `/queue` | Lihat daftar antrian lagu |

## ⚙️ Setup

### 1. Clone repo
```bash
git clone https://github.com/khoiri2205/melodycore.git
cd melodycore
```

### 2. Install dependencies
```bash
npm install
```

### 3. Download yt-dlp
Download `yt-dlp.exe` dari [sini](https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe) dan taruh di folder yang sama dengan `index.js`.

### 4. Buat file `.env`
```env
DISCORD_TOKEN=token_discord_kamu
CLIENT_ID=client_id_discord_kamu
GUILD_ID=guild_id_server_kamu
SPOTIFY_CLIENT_ID=spotify_client_id_kamu
SPOTIFY_CLIENT_SECRET=spotify_client_secret_kamu
```

### 5. Deploy commands
```bash
node deploy-commands.js
```

### 6. Jalankan bot
```bash
node index.js
```

## 📦 Dependencies

- [discord.js](https://discord.js.org/)
- [@discordjs/voice](https://github.com/discordjs/voice)
- [play-dl](https://github.com/play-dl/play-dl)
- [spotify-web-api-node](https://github.com/thelinmichael/spotify-web-api-node)
- [yt-dlp](https://github.com/yt-dlp/yt-dlp)

## 📝 License

MIT
