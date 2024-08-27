const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const localStorage = require('node-persist');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('import')
        .setDescription('Import a key pair')
        .addStringOption(option => option.setName('keytype').setDescription('Public or private key').setRequired(true).addChoices({name: 'Public', value: 'public'}, {name: 'Private', value: 'private'}))
        .addStringOption(option => option.setName('name').setDescription('Name for the key pair').setRequired(true))
        .addStringOption(option => option.setName('key').setDescription('Key to import without ascii header or footer').setRequired(false))
        .addAttachmentOption(option => option.setName('keyfile').setDescription('A file containing the key').setRequired(false)),
    async execute(interaction) {
        try {
            await interaction.deferReply({ ephemeral: true });
            const keyType = interaction.options.getString('keytype');
            const name = interaction.options.getString('name');
            const key = interaction.options.getString('key');
            const keyFile = interaction.options.getAttachment('keyfile');
            let keyData = keyFile ? await (await fetch(publicKeyFile.url)).text() : `-----BEGIN PGP PUBLIC KEY BLOCK-----\n\n${key}\n-----END PGP PUBLIC KEY BLOCK-----`;

            if (!key && !keyFile) {
                return interaction.editReply({ content: 'No key provided' });
            }

            await localStorage.init();
            let userStorage = await localStorage.getItem(interaction.user.id);
            if (!userStorage) {
                userStorage = {};
            }
            if (!userStorage[name]) {
                userStorage[name] = {};
            }
            userStorage[name][keyType] = keyData;
            await localStorage.setItem(interaction.user.id, userStorage);

            await interaction.editReply({ content: `Key pair imported as ${keyType} key` });
        } catch (error) {
            console.error(error);
            await interaction.editReply({ content: `\`\`\`${error.message}\`\`\`` });
        }
    }
}