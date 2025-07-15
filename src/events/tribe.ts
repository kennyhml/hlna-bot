import { api } from '@/api/api';
import { TribeRank } from '@/api/api.gen';
import { getProxyBearerJWT } from '@/api/auth';
import {
	addLogMessage,
	refreshContext,
	TribemanagerContext,
} from '@/commands/tribes';
import { buildTribeCreateModal } from '@/components/modals/new_tribe';
import {
	buildTribeManager,
	TribemanagerEvent,
} from '@/components/tribemanager';
import {
	dumpInteractionContext,
	loadInteractionContext,
} from '@/contextmanager';
import {
	Interaction,
	MessageFlags,
	ModalSubmitInteraction,
	Snowflake,
	userMention,
} from 'discord.js';

type EventHandler = (interaction: Interaction) => Promise<void>;

export const EVENT_MAP: Record<TribemanagerEvent, EventHandler> = {
	// UserAddRequested: onUserAddRequested,
	TribeChanged: onTribeChanged,
	MemberAddRequested: onMemberAddRequested,
	TribeCreateRequested: onTribeCreateRequested,
	NewMemberSelected: onNewMemberSelected,
	MemberSelected: onMemberSelected,
} as any;

async function onMemberAddRequested(interaction: Interaction): Promise<void> {
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

	if (!ctx.memberSelectExpanded) {
		ctx.memberSelectExpanded = true;
		await dumpInteractionContext(ctx);
	}

	await interaction.update({ components: buildTribeManager(ctx) });
}

async function onMemberSelected(interaction: Interaction) {
	if (!interaction.isButton()) {
		return;
	}

	const userId = parseInt(interaction.customId.split('-')[1]);
	const ctx = (await loadInteractionContext(
		interaction.user.id,
		'Tribemanager',
		{
			expected: true,
		},
	)) as TribemanagerContext;

	if (ctx.selectedMember === userId) {
		ctx.selectedMember = undefined;
	} else {
		ctx.selectedMember = userId;
	}

	await dumpInteractionContext(ctx);
	await interaction.update({
		components: buildTribeManager(ctx),
		flags: MessageFlags.IsComponentsV2,
	});
}

async function onNewMemberSelected(interaction: Interaction): Promise<void> {
	if (!interaction.isUserSelectMenu()) {
		return;
	}

	const userId = interaction.values[0] as Snowflake;

	const ctx = (await loadInteractionContext(
		interaction.user.id,
		'Tribemanager',
		{ expected: true },
	)) as TribemanagerContext;

	const tribe = ctx.tribes.find((t) => t.id === ctx.selectedTribe);
	if (!tribe) {
		throw Error('No tribe is selected.');
	}

	//	The user might already be part of the tribe, we cant really prevent that selection
	if (tribe.members?.find((m) => m.discord_id === userId)) {
		addLogMessage(
			ctx,
			`${userMention(userId)} is already part of \`${tribe.name}\``,
		);
		await interaction.update({ components: buildTribeManager(ctx) });
		await dumpInteractionContext(ctx);
		return;
	}
	ctx.memberSelectExpanded = false;

	await interaction.deferUpdate();

	try {
		const response = await api.tribes.addTribeMembers(
			tribe.id,
			{
				members: [{ discord_id: userId }],
				rank: TribeRank.Member,
			},
			{
				headers: {
					Authorization: await getProxyBearerJWT(interaction.user.id),
				},
			},
		);
	} catch (err: any) {
		if (err.status === 400) {
			addLogMessage(
				ctx,
				`${userMention(userId)} does not have a HLNA-Account.`,
			);
			await interaction.editReply({
				components: buildTribeManager(ctx),
				flags: MessageFlags.IsComponentsV2,
			});
			return;
		}
		throw err;
	}

	// Reload the data so that the new member is in the list
	// TODO: If the endpoint returned the data of the member that was inserted, we could reduce the call
	addLogMessage(ctx, `${userMention(userId)} was added to \`${tribe.name}\`.`);
	await refreshContext(ctx, { fetchTribes: true });
	await interaction.editReply({
		components: buildTribeManager(ctx),
		flags: MessageFlags.IsComponentsV2,
	});
}

async function onTribeChanged(interaction: Interaction) {
	if (!interaction.isStringSelectMenu()) {
		return;
	}

	// get the context
	const userId = interaction.user.id;
	const selectedTribeId = parseInt(interaction.values[0]);

	const ctx = (await loadInteractionContext(
		userId,
		'Tribemanager',
	)) as TribemanagerContext;

	ctx.selectedTribe = selectedTribeId;
	await dumpInteractionContext(ctx);

	await interaction.update({
		components: buildTribeManager(ctx),
	});
}

async function onTribeCreateRequested(interaction: Interaction) {
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
			time: 60_000,
		});

		// Make sure the user knows something is going on..
		await modalInteraction.deferUpdate();

		const response = await api.tribes.createTribe(
			{
				name: modalInteraction.fields.getTextInputValue('tribename'),
			},
			{
				headers: {
					Authorization: await getProxyBearerJWT(interaction.user.id),
				},
			},
		);
		const tribe = response.data;

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
