const { SlashCommandBuilder } = require('discord.js');
const openpgp = require('openpgp');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('verify')
        .setDescription('Verify a signed message using a public key')
        .addAttachmentOption(option => option.setName('message').setDescription('The signed message to verify, armored file').setRequired(true))
        .addStringOption(option => option.setName('publickey').setDescription('Public key to verify with (armor with no headers or footers)').setRequired(false))
        .addAttachmentOption(option => option.setName('publickeyfile').setDescription('A file containing the exported armor public key').setRequired(false)),
    async execute(interaction) {
        await interaction.deferReply();

        const messageFile = interaction.options.getAttachment('message');
        const publicKeyFile = interaction.options.getAttachment('publickeyfile');
        let publicKeyArmored = interaction.options.getString('publickey');
        let message;

        if (messageFile) {
            const response = await fetch(messageFile.url);
            message = await response.text();
            // console.log(message);
        } else {
            return interaction.editReply({ content: 'A signed message must be provided as an attachment.' });
        }
        if (publicKeyFile) {
            const response = await fetch(publicKeyFile.url);
            publicKeyArmored = await response.text();
            publicKeyArmored = await openpgp.readKey({ armoredKey: publicKeyArmored });
        } else if (!publicKeyFile) {
            publicKeyArmored = `-----BEGIN PGP PUBLIC KEY BLOCK-----\n\n${publicKeyArmored}\n-----END PGP PUBLIC KEY BLOCK-----`;
            publicKeyArmored = await openpgp.readKey({ armoredKey: publicKeyArmored });
        }
        if (!publicKeyArmored) {
            return interaction.editReply({ content: 'A public key must be provided either as a string or an attachment.' });
        }

        const verified = await openpgp.verify({
            message: await openpgp.readCleartextMessage({ cleartextMessage: message }),
            verificationKeys: publicKeyArmored
        });
        // console.log(await verified.signatures[0].verified);
        interaction.editReply({ content: await verified.signatures[0].verified ? 'Signature is **valid**' : 'Signature is **invalid**' });
    }
}