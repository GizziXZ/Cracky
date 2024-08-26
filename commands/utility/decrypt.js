const { SlashCommandBuilder } = require('discord.js');
const openpgp = require('openpgp');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('decrypt')
        .setDescription('Decrypt a message using a private key')
        .addStringOption(option => option.setName('passphrase').setDescription('Passphrase for the private key').setRequired(true))
        .addStringOption(option => option.setName('encrypted').setDescription('The encrypted message to decrypt (without headers or footers)').setRequired(false))
        .addStringOption(option => option.setName('privatekey').setDescription('Private key to decrypt with (armor without headers or footers)').setRequired(false))
        .addAttachmentOption(option => option.setName('encryptedfile').setDescription('A file containing the encrypted message').setRequired(false))
        .addAttachmentOption(option => option.setName('privatekeyfile').setDescription('A file containing the exported armor private key').setRequired(false)),
    async execute(interaction) {
        try {
            await interaction.deferReply({ ephemeral: true });
            let encryptedMessage = interaction.options.getString('encrypted');
            let privateKeyArmored = interaction.options.getString('privatekey');
            const encryptedFile = interaction.options.getAttachment('encryptedfile');
            const privateKeyFile = interaction.options.getAttachment('privatekeyfile');

            if (encryptedFile) {
                const response = await fetch(encryptedFile.url);
                encryptedMessage = await response.text();
                // console.log(encryptedMessage);
            } else if (!encryptedFile) {
                encryptedMessage = `-----BEGIN PGP MESSAGE-----\n\n${encryptedMessage}\n-----END PGP MESSAGE-----`;
            }

            if (privateKeyFile) {
                const response = await fetch(privateKeyFile.url);
                privateKeyArmored = await response.text();
                // console.log(privateKeyArmored);
            } else if (!privateKeyFile) {
                privateKeyArmored = `-----BEGIN PGP PRIVATE KEY BLOCK-----\n\n${privateKeyArmored}\n-----END PGP PRIVATE KEY BLOCK-----`;
            }

            if (!encryptedMessage || !privateKeyArmored) {
                return interaction.editReply({ content: 'Both encrypted message and private key must be provided either as strings or attachments.' });
            }

            const privatekey = await openpgp.decryptKey({
                privateKey: await openpgp.readPrivateKey({ armoredKey: privateKeyArmored }),
                passphrase: interaction.options.getString('passphrase')
            });
            const decrypted = await openpgp.decrypt({
                message: await openpgp.readMessage({ armoredMessage: encryptedMessage }),
                decryptionKeys: privatekey,
            });
            // console.log(decrypted);
            interaction.editReply({ content: decrypted.data });
        } catch (error) {
            console.error(error);
            await interaction.editReply({ content: `\`\`\`${error.message}\`\`\`` });
        }
    }
}