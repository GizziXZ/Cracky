const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const openpgp = require('openpgp');
const localStorage = require('node-persist');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('list')
        .setDescription('List all stored keys'),
    async execute(interaction) {
        try { // TODO - message components for pagination if there are too many keys
            await interaction.deferReply({ ephemeral: true });
            await localStorage.init();

            const userStorage = await localStorage.getItem(interaction.user.id);
            if (!userStorage) {
                await interaction.editReply({ content: 'You have no stored keys' });
                return;
            }

            const keys = Object.keys(userStorage);
            let files = [];
            for (const key of keys) {
                files.push(new AttachmentBuilder(Buffer.from(userStorage[key].private, 'ascii'), { name: `${key} private.asc` }));
                files.push(new AttachmentBuilder(Buffer.from(userStorage[key].public, 'ascii'), { name: `${key} public.asc` }));
            }

            if (files.length === 0) return await interaction.editReply({ content: 'You have no stored keys' });
            await interaction.editReply({ content: 'Here are your stored keys:\n', files });            
        } catch (error) {
            console.error(error);
            await interaction.editReply({ content: `\`\`\`${error.message}\`\`\`` });
        }
    }
}