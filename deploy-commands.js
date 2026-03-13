require('dotenv').config();
const { REST, Routes, SlashCommandBuilder } = require('discord.js');

const clientId = process.env.CLIENT_ID;
const token = process.env.DISCORD_TOKEN;

const commands = [
    new SlashCommandBuilder()
        .setName('play')
        .setDescription('Memutar musik dari YouTube atau Spotify')
        .addStringOption(option => 
            option.setName('url')
                .setDescription('Judul lagu, link YouTube, atau link Spotify')
                .setRequired(true)
        ),
    new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Melewati lagu yang sedang diputar'),
    new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Menghentikan musik dan mengeluarkan bot'),
    new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Melihat daftar antrian lagu'),
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
    try {
        // Global commands - berlaku di semua server, tapi butuh ~1 jam untuk aktif
        await rest.put(Routes.applicationCommands(clientId), { body: commands });
        console.log('✅ Global commands berhasil didaftarkan!');
        console.log('⏳ Tunggu sekitar 1 jam biar aktif di semua server.');
    } catch (error) {
        console.error(error);
    }
})();