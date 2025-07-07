import {
	CommandInteraction,
	MessageFlags,
	SlashCommandSubcommandBuilder,
} from 'discord.js';
import { api } from '../../api/api';
import { getProxyJWT } from '../../api/auth';

export const command = new SlashCommandSubcommandBuilder()
	.setName('me')
	.setDescription('Display your own user profile, must be registered.');

export async function execute(interaction: CommandInteraction) {
	if (!interaction.isChatInputCommand()) return;

	// Call to backend may take a few seconds, make sure the interaction doesnt expire!
	await interaction.deferReply({ flags: MessageFlags.Ephemeral });

	api.users
		.getCurrentUser({
			headers: {
				Authorization: `Bearer ${await getProxyJWT(interaction.user.id)}`,
			},
		})
		.then(async (response) => {
			if (response.status == 401) {
				interaction.editReply({ content: 'Unauthorized.' });
			} else {
				await interaction.editReply({
					content: 'You are ' + response.data.name,
				});
			}
		})
		.catch(async (err) => {
			await interaction.editReply({ content: err.message });
		});
}
