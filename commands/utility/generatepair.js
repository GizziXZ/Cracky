const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const openpgp = require('openpgp');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('generatepair')
        .setDescription('Generate a new key pair')
        .addStringOption(option => option.setName('passphrase').setDescription('Passphrase for the private key').setRequired(true))
        .addStringOption(option => option.setName('name').setDescription('Name for the key pair').setRequired(true))
        .addStringOption(option => option.setName('email').setDescription('Email for the key pair').setRequired(true)),
    async execute(interaction) {
        await interaction.deferReply();
        const passphrase = interaction.options.getString('passphrase');
        const name = interaction.options.getString('name');
        const email = interaction.options.getString('email');

        const { privateKey, publicKey } = await openpgp.generateKey({
            userIDs: [{ name, email }],
            type: 'rsa',
            rsaBits: 4096,
            passphrase: passphrase
        });
        const privateKeyFile = new AttachmentBuilder(Buffer.from(privateKey, 'ascii'), 'privatekey.asc');
        await interaction.editReply({ content: 'Here are your keys:', files: [privateKeyFile]});
    }
}