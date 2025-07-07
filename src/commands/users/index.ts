import { CommandInteraction, SlashCommandBuilder } from 'discord.js';

import * as me from './me';
import * as register from './register';

export const command = new SlashCommandBuilder()
	.setName('users')
	.setDescription('User-related commands')
	.addSubcommand(me.command)
	.addSubcommand(register.command);

const dispatch = {
	[me.command.name]: me.execute,
	[register.command.name]: register.execute,
};

export async function execute(interaction: CommandInteraction) {
	if (!interaction.isChatInputCommand()) {
		return;
	}

	let subcommand = interaction.options.getSubcommand(true);
	await dispatch[subcommand](interaction);
}
