<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=180&section=header&text=MelodyCore&fontSize=52&fontColor=ffffff&animation=fadeIn&fontAlignY=55&desc=Discord%20Music%20Bot%20%7C%20YouTube%20%26%20Spotify&descSize=16&descColor=a78bfa&descAlignY=75" width="100%"/>

<div align="center">

![Status](https://img.shields.io/badge/STATUS-ONLINE-%231DB954?style=for-the-badge&labelColor=0D1117)
![Platform](https://img.shields.io/badge/PLATFORM-Discord-%235865F2?style=for-the-badge&labelColor=0D1117)
![Language](https://img.shields.io/badge/LANGUAGE-JavaScript-%23F7DF1E?style=for-the-badge&labelColor=0D1117)
![Deployments](https://img.shields.io/badge/DEPLOYMENTS-27-%23a78bfa?style=for-the-badge&labelColor=0D1117)

</div>

---

## 🎵 Tentang MelodyCore

```bash
┌──(khoiri2205㉿amikom)-[~/melodycore]
└─$ cat project.txt

  ╔══════════════════════════════════════════════════════════╗
  ║  PROJECT  : MelodyCore                                   ║
  ║  AUTHOR   : Larendra (khoiri2205)                        ║
  ║  TECH     : JavaScript + Discord.js + yt-dlp            ║
  ║  TYPE     : Discord Music Bot                            ║
  ║  SOURCE   : YouTube + Spotify                            ║
  ║  STATUS   : Live on Production  [============>] 100%     ║
  ╚══════════════════════════════════════════════════════════╝
```

**MelodyCore** adalah bot musik Discord yang bisa memutar lagu dari **YouTube** dan **Spotify** langsung di voice channel server kamu. Dibangun dengan JavaScript dan di-deploy ke cloud untuk jalan **24/7**.

---

## ✨ Fitur Utama

| Fitur | Keterangan |
|:---|:---|
| ▶️ **Play** | Putar lagu dari YouTube & Spotify |
| ⏭️ **Skip** | Lewati lagu yang sedang diputar |
| ⏸️ **Pause / Resume** | Jeda dan lanjutkan musik |
| 📋 **Queue** | Antrian lagu otomatis |
| 🔀 **Shuffle** | Acak urutan antrian |
| 🔁 **Loop** | Ulangi lagu atau seluruh queue |
| 🔊 **Volume** | Atur volume suara |
| ⏹️ **Stop** | Hentikan musik dan kosongkan queue |

---

## 🛠️ Tech Stack

<div align="center">

![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Discord.js](https://img.shields.io/badge/Discord.js-5865F2?style=for-the-badge&logo=discord&logoColor=white)
![YouTube](https://img.shields.io/badge/YouTube-FF0000?style=for-the-badge&logo=youtube&logoColor=white)
![Spotify](https://img.shields.io/badge/Spotify-1DB954?style=for-the-badge&logo=spotify&logoColor=white)

</div>

---

## 🚀 Cara Install & Jalankan

### 1. Clone Repo
```bash
git clone https://github.com/khoiri2205/melodycore
cd melodycore
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment
```bash
# Buat file .env dan isi:
DISCORD_TOKEN=your_discord_bot_token
CLIENT_ID=your_discord_client_id
```

### 4. Deploy Slash Commands
```bash
node deploy-commands.js
```

### 5. Jalankan Bot
```bash
node index.js
```

---

## 📁 Struktur File

```
melodycore/
│
├── 📄 index.js               # File utama bot
├── 📄 deploy-commands.js     # Deploy slash commands
├── 📄 package.json           # Dependencies
├── 📄 nixpacks.toml          # Config deployment
├── 📄 .gitignore             # Git ignore
└── 📄 README.md              # Dokumentasi
```

---

## 🎮 Cara Pakai di Discord

```
/play [judul lagu / URL YouTube / URL Spotify]
/skip
/pause
/resume
/queue
/stop
/loop
/shuffle
/volume [0-100]
```

---

## ☁️ Deployment

Bot ini di-deploy menggunakan **Railway** dengan konfigurasi **nixpacks** untuk runtime Node.js + yt-dlp.

```toml
# nixpacks.toml
[phases.setup]
nixPkgs = ["yt-dlp", "nodejs"]
```

---

## 👤 Author

<div align="center">

**Larendra** · STMIK AMIKOM Surakarta · Indonesia 🇮🇩

[![GitHub](https://img.shields.io/badge/GitHub-khoiri2205-0D1117?style=for-the-badge&logo=github&logoColor=39ff14&labelColor=0D1117)](https://github.com/khoiri2205)
[![Instagram](https://img.shields.io/badge/Instagram-__ridlo__-0D1117?style=for-the-badge&logo=instagram&logoColor=ff073a&labelColor=0D1117)](https://instagram.com/__ridlo_)

</div>

---

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=100&section=footer&animation=fadeIn" width="100%"/>
