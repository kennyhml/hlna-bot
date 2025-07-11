import {
	ButtonInteraction,
	CommandInteraction,
	ComponentType,
	MessageFlags,
	ModalSubmitInteraction,
	SlashCommandBuilder,
	SlashCommandSubcommandBuilder,
	Snowflake,
} from 'discord.js';
import { buildTribeManager } from '@/components/tribemanager';
import { Tribe } from '@/api/api.gen';
import { onTribeCreateRequested } from '@/events/tribe/on_create';
import { api } from '@/api/api';
import { getProxyBearerJWT } from '@/api/auth';

export const command = new SlashCommandBuilder()
	.setName('tribes')
	.setDescription('Display your own user profile, must be registered.');

export async function execute(interaction: CommandInteraction) {
	// Fetching the data can take too long to reply in time. Make sure the user knows
	// that we are working on it.
	const reply = await interaction.deferReply({
		flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
	});

	const data = await requestTribeData(interaction.user.id);
	await reply.edit({
		flags: MessageFlags.IsComponentsV2,
		components: buildTribeManager({ tribes: data }),
	});

	const collector = reply.createMessageComponentCollector({
		componentType: ComponentType.Button,
		filter: (i: ButtonInteraction) => interaction.user.id == i.user.id,
	});

	// Connect the events for this interaction
	collector.on('collect', async (interaction) => {
		if (interaction.customId === 'createTribe') {
			await onTribeCreateRequested(
				interaction,
				async (submitInteraction: ModalSubmitInteraction) => {
					// Rebuild the tribe manager components
					const data = await requestTribeData(interaction.user.id);
					await reply.edit({ components: buildTribeManager({ tribes: data }) });
					await submitInteraction.deleteReply();
				},
			);
		}
	});
}

async function requestTribeData(userId: Snowflake): Promise<Tribe[]> {
	const token = await getProxyBearerJWT(userId);

	return api.users
		.getCurrentUserTribes({ headers: { Authorization: token } })
		.then(async (response) => {
			return response.data;
		})
		.catch(async (err) => {
			console.error(err);
			// TODO: Make a meaningful error of whatever the api throws at us
			throw err;
		});
}
