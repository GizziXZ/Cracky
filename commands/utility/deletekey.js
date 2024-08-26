const { SlashCommandBuilder } = require('discord.js');
const localStorage = require('node-persist');
const openpgp = require('openpgp');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('deletekey')
        .setDescription('Delete a stored key')
        .addStringOption(option => option.setName('name').setDescription('Name of the key to delete').setRequired(true)),
    async execute(interaction) {
        try {
            await interaction.deferReply({ ephemeral: true });
            const name = interaction.options.getString('name');

            await localStorage.init();
            let userStorage = await localStorage.getItem(interaction.user.id);
            if (!userStorage || !userStorage[name]) {
                return await interaction.editReply({ content: `Key with name ${name} not found` });
            }

            delete userStorage[name];
            await localStorage.setItem(interaction.user.id, userStorage);
            await interaction.editReply({ content: `Deleted keys associated with name \`${name}\`` });
        } catch (error) {
            console.error(error);
            await interaction.editReply({ content: `\`\`\`${error.message}\`\`\`` });
        }
    }
}