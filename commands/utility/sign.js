const { SlashCommandBuilder } = require('discord.js');
const openpgp = require('openpgp');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sign')
        .setDescription('Sign a message using a private key')
        .addStringOption(option => option.setName('passphrase').setDescription('Passphrase for the private key').setRequired(true))
        .addStringOption(option => option.setName('message').setDescription('The message to sign').setRequired(true))
        .addStringOption(option => option.setName('privatekey').setDescription('Private key to sign with (armor without headers or footers)').setRequired(false))
        .addAttachmentOption(option => option.setName('privatekeyfile').setDescription('A file containing the exported armor private key').setRequired(false)),
    async execute(interaction) {
        await interaction.deferReply();
        const message = interaction.options.getString('message');
        const privateKeyFile = interaction.options.getAttachment('privatekeyfile');
        let privateKeyArmored = interaction.options.getString('privatekey');

        if (privateKeyFile) {
            const response = await fetch(privateKeyFile.url);
            privateKeyArmored = await response.text();
            privateKeyArmored = await openpgp.readPrivateKey({ armoredKey: privateKeyArmored });
        } else if (!privateKeyFile) {
            privateKeyArmored = `-----BEGIN PGP PRIVATE KEY BLOCK-----\n\n${privateKeyArmored}\n-----END PGP PRIVATE KEY BLOCK-----`;
        }

        if (!privateKeyArmored) {
            return interaction.editReply({ content: 'A private key must be provided either as a string or an attachment.' });
        }

        const privatekey = await openpgp.decryptKey({
            privateKey: privateKeyArmored,
            passphrase: interaction.options.getString('passphrase')
        });
        const signed = await openpgp.sign({
            message: await openpgp.createCleartextMessage({ text: message }), // using cleartext message as we are signing a message not encrypting
            signingKeys: privatekey,
            format: "armored"
        });
        interaction.editReply({ content: `\`\`\`${signed}\`\`\`` });
    }
}