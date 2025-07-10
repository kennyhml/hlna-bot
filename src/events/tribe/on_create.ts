import { api } from '@/api/api';
import { getProxyBearerJWT, getProxyJWT } from '@/api/auth';
import { buildTribeCreateModal } from '@/components/modals/new_tribe';
import { UserId } from '../../api/api.gen';
import {
	ButtonInteraction,
	MessageFlags,
	ModalSubmitInteraction,
} from 'discord.js';

const MAX_SUBMISSION_TIME_MS = 60_000;

export async function onTribeCreateRequested(
	interaction: ButtonInteraction,
	onCreated?: (interaction: ModalSubmitInteraction) => Promise<void>,
) {
	const modal = buildTribeCreateModal(interaction.user);

	await interaction.showModal(modal);

	// Create a filter for modal submissions that will identify this one.
	const filter = (interaction: ModalSubmitInteraction) =>
		interaction.customId === modal.data.custom_id;

	interaction
		.awaitModalSubmit({ filter, time: MAX_SUBMISSION_TIME_MS })
		.then(onSubmit)
		.then(onCreated)
		.catch(async (err) => {
			if (err.code == 'InteractionCollectorError') {
				await interaction.followUp({
					content: 'The interaction timed out. Please try again.',
					flags: MessageFlags.Ephemeral,
				});
			}
			console.error(err);
		});
}

async function onSubmit(interaction: ModalSubmitInteraction) {
	// Make sure the user knows something is going on..
	await interaction.deferReply({ flags: MessageFlags.Ephemeral });

	// Make a request to th backend to actually create the tribe
	await api.tribes
		.createTribe(
			{
				name: interaction.fields.getTextInputValue('tribename'),
			},
			{
				headers: {
					Authorization: await getProxyBearerJWT(interaction.user.id),
				},
			},
		)
		.then(async (response) => {
			console.log('meow');
			await interaction.editReply({
				content: '[200 OK]: Tribe created ' + response.data.id,
			});
		});
	return interaction;
}
