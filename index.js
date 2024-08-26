const Discord = require('discord.js');
const { TOKEN } = require('./config.json');
const fs = require('fs');
const path = require('path');
const client = new Discord.Client({ intents: ['MessageContent','DirectMessages'], partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });

client.on('ready', async () => {
    console.log(client.user.tag);
    try {
        // console.log(`Started refreshing ${commands.length} GUILD (/) commands.`);
		// const guild = await client.guilds.fetch(GUILDID);
		// await guild.commands.set(commands.map(command => command.data));
        // console.log(`Successfully reloaded ${commands.length} GUILD (/) commands.`);
        console.log(`Started refreshing ${commands.length} GLOBAL (/) commands.`);
        await client.application.commands.set(commands.map(command => command.data));
        console.log(`Successfully reloaded ${commands.length} GLOBAL (/) commands.`);
    } catch (error) {
        console.error(error);
    }
});

const commands = [];
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		commands.push(command);
	}
}

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const { commandName } = interaction;
	const command = commands.find(command => command.data.name === commandName);

	if (!command) return;

	try {
		// console.log(command)
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

client.login(TOKEN);