import { CommandInteraction, SlashCommandBuilder } from 'discord.js';

export const command = new SlashCommandBuilder()
	.setName('config')
	.setDescription('Config-related commands');

export async function execute(interaction: CommandInteraction) {
	console.log('Executing /me');
	interaction.reply({ content: 'Executed.' });
}
