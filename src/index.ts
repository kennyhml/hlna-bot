import {
	Client,
	MessageFlags,
	TextDisplayBuilder,
	TextDisplayComponent,
} from 'discord.js';
import { config } from './config';
import { commands } from './commands';
import { EVENT_MAP } from './events/tribe';

const client = new Client({
	intents: ['Guilds', 'GuildMessages', 'DirectMessages'],
});

client.once('ready', () => {
	console.log('Discord bot is ready! 🤖');
});

client.on('interactionCreate', async (interaction) => {
	if (interaction.isCommand()) {
		const { commandName } = interaction;

		try {
			if (commands[commandName as keyof typeof commands]) {
				await commands[commandName as keyof typeof commands].execute(
					interaction,
				);
			}
		} catch (err) {
			console.error(err);
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
	}

	if (interaction.isMessageComponent()) {
		await EVENT_MAP[interaction.customId as keyof typeof EVENT_MAP](
			interaction,
		);
	}
});

client.login(config.DISCORD_TOKEN);
