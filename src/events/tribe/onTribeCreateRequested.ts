import { api } from '@/api/api';
import { Tribe } from '@/api/api.gen';
import { getProxyBearerJWT, getProxyJWT } from '@/api/auth';
import { TribemanagerContext } from '@/commands/tribes';
import { buildTribeCreateModal } from '@/components/modals/new_tribe';
import { buildTribeManager } from '@/components/tribemanager';
import {
	dumpInteractionContext,
	loadInteractionContext,
} from '@/contextmanager';
import { Interaction, MessageFlags, ModalSubmitInteraction } from 'discord.js';

const MAX_SUBMISSION_TIME_MS = 60_000;

export async function onTribeCreateRequested(interaction: Interaction) {
	if (!interaction.isButton()) {
		return;
	}

	const ctx = (await loadInteractionContext(
		interaction.user.id,
		'Tribemanager',
		{
			expected: true,
		},
	)) as TribemanagerContext;

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

		// Make sure the user knows something is going on..
		await modalInteraction.deferUpdate();

		const tribe = await onSubmit(modalInteraction);
		ctx.tribes.push(tribe);
		await dumpInteractionContext(ctx);

		if (modalInteraction.isFromMessage()) {
			await modalInteraction.editReply({
				components: buildTribeManager(ctx),
				flags: MessageFlags.IsComponentsV2,
			});
		}

		const reply = await modalInteraction.followUp({
			content: 'Tribe created successfully.',
		});
		setTimeout(async () => {
			await reply.delete();
		}, 3000);
	} catch (err: any) {
		if (err.code === 'InteractionCollectorError') {
			return await interaction.followUp({
				content: 'The interaction timed out. Please try again.',
				flags: MessageFlags.Ephemeral,
			});
		}
	}
}

async function onSubmit(interaction: ModalSubmitInteraction): Promise<Tribe> {
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
	return response.data;
}
