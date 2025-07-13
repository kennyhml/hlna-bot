import { Client, MessageFlags } from 'discord.js';
import { config } from './config';
import { commands } from './commands';

const client = new Client({
	intents: ['Guilds', 'GuildMessages', 'DirectMessages'],
});

client.once('ready', () => {
	console.log('Discord bot is ready! 🤖');
});

client.on('interactionCreate', async (interaction) => {
	if (!interaction.isCommand()) {
		return;
	}
	const { commandName } = interaction;

	try {
		if (commands[commandName as keyof typeof commands]) {
			await commands[commandName as keyof typeof commands].execute(interaction);
		}
	} catch (err) {
		if (!interaction.replied && !interaction.deferred) {
			await interaction.reply({
				content: `An Exception occurred: ${JSON.stringify(err)}`,
				flags: MessageFlags.Ephemeral,
			});
		} else {
			await interaction.editReply({
				content: `An Exception occurred: ${JSON.stringify(err)}`,
			});
		}
	}
});

client.login(config.DISCORD_TOKEN);
