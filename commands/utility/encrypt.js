const { SlashCommandBuilder } = require('discord.js');
const openpgp = require('openpgp');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('encrypt')
        .setDescription('Encrypt a message using a public key')
        .addStringOption(option => option.setName('message').setDescription('The message to encrypt').setRequired(true))
        .addStringOption(option => option.setName('publickey').setDescription('Public key to encrypt with (armor with no headers or footers)').setRequired(false))
        .addAttachmentOption(option => option.setName('publickeyfile').setDescription('A file containing the exported armor public key').setRequired(false))
        .addBooleanOption(option => option.setName('ephemeral').setDescription('Whether to show the result only to you').setRequired(false)),
    async execute(interaction) {
        try {
            await interaction.deferReply({ ephemeral: !!interaction.options.getBoolean('ephemeral') }); // is !! even needed? idk lol i just did it to be safe
            const message = interaction.options.getString('message');
            const publicKeyFile = interaction.options.getAttachment('publickeyfile');
            let publicKeyArmored = interaction.options.getString('publickey');
            
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
            const encrypted = await openpgp.encrypt({
                message: await openpgp.createMessage({ text: message }),
                encryptionKeys: publicKeyArmored
                // can add an optional signing key here
            });
            // console.log(encrypted);
            interaction.editReply({ content: `\`\`\`${encrypted}\`\`\`` });
        } catch (error) {
            console.error(error);
            await interaction.editReply({ content: `\`\`\`${error.message}\`\`\`` });
        }
    }
}