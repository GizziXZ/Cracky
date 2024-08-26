const { SlashCommandBuilder } = require('discord.js');
const openpgp = require('openpgp');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('encrypt')
        .setDescription('Encrypt a message using a public key')
        .addStringOption(option => option.setName('message').setDescription('The message to encrypt').setRequired(true))
        .addStringOption(option => option.setName('publickey').setDescription('The public key to use').setRequired(true)),
    async execute(interaction) {
        const message = interaction.options.getString('message');
        const publickey = await openpgp.readKey({ armoredKey: `-----BEGIN PGP PUBLIC KEY BLOCK-----\n\n${interaction.options.getString('publickey')}\n-----END PGP PRIVATE KEY BLOCK-----`});

        console.log(publickey);
    }
}