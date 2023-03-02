const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');

const { token } = require('./config.json');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

// Find all commands and add them to client.commands
for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	}
	else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

// Check and execute commands
client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});

// Successful launch
client.once(Events.ClientReady, c => {
	console.log(`Ready! Logged in as ${c.user.tag}`);
});

// We want to map every user to their own matrices so that they do not interfere with each other
const matrix1 = new Map();
const matrix2 = new Map();

// Parse through the input, making sure that the formatting is correct and return a 2D array
const parseMatrix = (input) => {
	const data = input.split(/\r?\n/);
	data.shift();
	if (data.length < 1) return 'invalid';
	const size = data[0].split(' ').length;
	const matrix = [data.length];
	for (let i = 0; i < data.length; i++) {
		data[i] = data[i].split(' ');
		if (size != data[i].length) return 'invalid';
		matrix[i] = data[i].map((str) => parseInt(str));
		if (isNaN(matrix[i][0])) return 'invalid';
	}
	return matrix;
};

// We add matrices through a '.' command
client.on('messageCreate', async message => {
	if (message.author.bot) return;
	if (message.content.startsWith(`.hello`)) {
		message.reply("Hello");
	}
	if (message.content.startsWith(`.matrix1`)) {
		const matrix = parseMatrix(message.content);
		if (matrix == 'invalid') {
			message.reply('Invalid Matrix, must be rectangular');
		}
		matrix1.set(message.author.id, matrix);
		message.reply(`Matrix 1 Set!`);
	}
	else if (message.content.startsWith(`.matrix2`)) {
		const matrix = parseMatrix(message.content);
		if (matrix == 'invalid') {
			message.reply('Invalid Matrix, must be rectangular');
		}
		matrix2.set(message.author.id, matrix);
		message.reply(`Matrix 2 Set!`);
	}
});
global.matrix1 = matrix1;
global.matrix2 = matrix2;


client.login(token);