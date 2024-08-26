const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const openpgp = require('openpgp');
const localStorage = require('node-persist');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('generatepair')
        .setDescription('Generate a new RSA key pair')
        .addStringOption(option => option.setName('passphrase').setDescription('Passphrase for the private key').setRequired(true))
        .addStringOption(option => option.setName('name').setDescription('Name for the key pair').setRequired(true))
        .addStringOption(option => option.setName('email').setDescription('Email for the key pair (doesn\'t need to be a real email)').setRequired(true))
        .addIntegerOption(option => option.setName('bits').setDescription('Number of bits for the RSA key, 4096 default').setRequired(false)),
    async execute(interaction) {
        try {
            await interaction.deferReply({ ephemeral: true });
            const passphrase = interaction.options.getString('passphrase');
            const name = interaction.options.getString('name');
            const email = interaction.options.getString('email');
            const bits = interaction.options.getInteger('bits') || 4096; // default to 4096 bits

            const { privateKey, publicKey } = await openpgp.generateKey({
                userIDs: [{ name, email }],
                type: 'rsa',
                rsaBits: bits,
                passphrase: passphrase
            });

            await localStorage.init();
            let userStorage = await localStorage.getItem(interaction.user.id);
            if (!userStorage) {
                userStorage = {};
            }
            if (!userStorage[name]) {
                userStorage[name] = {};
            }
            userStorage[name].private = privateKey;
            userStorage[name].public = publicKey;
            await localStorage.setItem(interaction.user.id, userStorage);

            const publicKeyFile = new AttachmentBuilder(Buffer.from(publicKey, 'ascii'), {name: 'publickey.asc'});
            const privateKeyFile = new AttachmentBuilder(Buffer.from(privateKey, 'ascii'), {name: 'privatekey.asc'});
            await interaction.editReply({ content: 'Here are your keys:', files: [privateKeyFile, publicKeyFile] });
        } catch (error) {
            console.error(error);
            await interaction.editReply({ content: `\`\`\`${error.message}\`\`\`` });
        }
    }
}