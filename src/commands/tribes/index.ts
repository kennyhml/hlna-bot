import { CommandInteraction, SlashCommandBuilder } from 'discord.js';

import * as test from './test';

export const command = new SlashCommandBuilder()
	.setName('tribes')
	.setDescription('User-related commands')
	.addSubcommand(test.command);

const dispatch = {
	[test.command.name]: test.execute,
};

export async function execute(interaction: CommandInteraction) {
	if (!interaction.isChatInputCommand()) {
		return;
	}

	let subcommand = interaction.options.getSubcommand(true);
	await dispatch[subcommand](interaction);
}
