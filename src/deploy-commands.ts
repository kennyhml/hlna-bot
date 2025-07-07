import { REST, Routes } from 'discord.js';
import { config } from './config';
import { commands } from './commands';

const commandData = Object.values(commands).map((command) => command.command);
const rest = new REST({ version: '10' }).setToken(config.DISCORD_TOKEN);

(async () => {
	try {
		console.log(`Refreshing commands: ${commandData.length} total.`);
		await rest.put(Routes.applicationCommands(config.APPLICATION_ID), {
			body: commandData,
		});
		console.log('Successfully reloaded app commands.');
	} catch (error) {
		console.error(error);
	}
})();
