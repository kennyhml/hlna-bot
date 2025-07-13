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

	var modalInteraction: ModalSubmitInteraction | undefined = undefined;

	try {
		modalInteraction = await interaction.awaitModalSubmit({
			filter,
			time: MAX_SUBMISSION_TIME_MS,
		});
		await onSubmit(modalInteraction);
		await onCreated?.(modalInteraction);
	} catch (err: any) {
		if (err.code === 'InteractionCollectorError') {
			return await interaction.followUp({
				content: 'The interaction timed out. Please try again.',
				flags: MessageFlags.Ephemeral,
			});
		}
		const responseError = err.response?.data?.message;
		console.error(responseError);

		await modalInteraction?.editReply({
			content: `**\`${err.message} ${responseError}\`**`,
		});
	}
}

async function onSubmit(interaction: ModalSubmitInteraction) {
	// Make sure the user knows something is going on..
	await interaction.deferReply({ flags: MessageFlags.Ephemeral });

	// Backend request to actually create the tribe
	const response = await api.tribes.createTribe(
		{
			name: interaction.fields.getTextInputValue('tribename'),
		},
		{
			headers: {
				Authorization: await getProxyBearerJWT(interaction.user.id),
			},
		},
	);
	if (response.status === 200) {
		await interaction.editReply({ content: 'Tribe created successfully.' });
	}
	return interaction;
}
