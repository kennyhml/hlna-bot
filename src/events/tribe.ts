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
	RANK_PRIORITY,
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
	TribeChanged: onTribeChanged,
	MemberAddRequested: onMemberAddRequested,
	TribeCreateRequested: onTribeCreateRequested,
	NewMemberSelected: onNewMemberSelected,
	MemberSelected: onMemberSelected,
	EditTribeRequested: async (i: Interaction) => {},
	LeaveTribeRequested: async (i: Interaction) => {},
	MemberPromoteRequested: onMemberPromoteRequested,
	MemberDemoteRequested: onMemberDemoteRequested,
	MemberKickRequested: onMemberKickRequested,
	PreviousPageRequested: onPreviousPageRequested,
	NextPageRequested: onNextPageRequested,
};

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
	ctx.selectedMember = undefined;
	ctx.page = 0;
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
		ctx.selectedTribe = tribe.id;
		ctx.selectedMember = undefined;
		ctx.page = 0;

		addLogMessage(ctx, `Tribe \`${tribe.name}\` was created.`);
		await dumpInteractionContext(ctx);

		if (modalInteraction.isFromMessage()) {
			await modalInteraction.editReply({
				components: buildTribeManager(ctx),
				flags: MessageFlags.IsComponentsV2,
			});
		}
	} catch (err: any) {
		if (err.code === 'InteractionCollectorError') {
			await interaction.followUp({
				content: 'The interaction timed out. Please try again.',
				flags: MessageFlags.Ephemeral,
			});
		}
		console.error(err);
	}
}

async function onMemberKickRequested(interaction: Interaction) {
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

	const tribe = ctx.tribes.find((tribe) => tribe.id === ctx.selectedTribe);
	if (!tribe) {
		throw Error('Invalid tribe selection.');
	}
	const userToKick = tribe.members?.find(
		(member) => member.id === ctx.selectedMember,
	);

	if (!userToKick) {
		throw Error('No member is currently selected.');
	}

	console.log(
		`Kick requested for user ${userToKick.name} from tribe ${tribe.name}`,
	);
	await interaction.deferUpdate();
	try {
		await api.tribes.removeTribemember(tribe.id, userToKick.id, {
			headers: {
				Authorization: await getProxyBearerJWT(interaction.user.id),
			},
		});
		console.log('Member kicked successfully.');
		// Remove the member from the tribe internally to avoid
		// making another request to get the data.
		tribe.members = tribe.members?.filter(
			(member) => member.id !== userToKick.id,
		);
		ctx.selectedMember = undefined;
		if (ctx.page + 1 > Math.floor(tribe.members!.length / 5)) {
			ctx.page = 0;
		}
		addLogMessage(
			ctx,
			`${userMention(userToKick.discord_id)} was kicked from \`${tribe.name}\``,
		);
	} catch (err: any) {
		const msg = err.response?.data?.message;
		console.error(err.response?.data);
		addLogMessage(ctx, msg);
	}

	await dumpInteractionContext(ctx);
	await interaction.editReply({
		components: buildTribeManager(ctx),
		flags: MessageFlags.IsComponentsV2,
	});
}

async function onMemberPromoteRequested(interaction: Interaction) {
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

	var tribe = ctx.tribes.find((tribe) => tribe.id === ctx.selectedTribe);
	if (!tribe) {
		throw Error('Invalid tribe selection.');
	}
	const userToPromote = tribe.members?.find(
		(member) => member.id === ctx.selectedMember,
	);
	const promotedBy = tribe.members?.find(
		(member) => member.discord_id === interaction.user.id,
	);

	if (!userToPromote || !promotedBy) {
		throw Error('No member is currently selected.');
	}

	const currentRankIndex = RANK_PRIORITY.findIndex(
		(rank) => rank === userToPromote.rank,
	);
	const nextRank = RANK_PRIORITY[currentRankIndex - 1];

	console.log(
		`Promotion to ${nextRank} requested for user ${userToPromote.name} in tribe ${tribe.name} by ${promotedBy.name}`,
	);
	await interaction.deferUpdate();
	try {
		const response = await api.tribes.updateTribemember(
			tribe.id,
			userToPromote.id,
			{
				rank: nextRank,
			},
			{
				headers: {
					Authorization: await getProxyBearerJWT(interaction.user.id),
				},
			},
		);
		console.log('Member promoted successfully.');

		// The full tribe data is returned as promoting one user to owner may
		// automatically demote another user.
		Object.assign(tribe, response.data);

		// Remove the member from the tribe internally to avoid
		// making another request to get the data.
		addLogMessage(
			ctx,
			`${userMention(
				userToPromote.discord_id,
			)} was promoted to \`${nextRank}\``,
		);
	} catch (err: any) {
		const msg = err.response?.data?.message;
		console.error(err.response?.data);
		addLogMessage(ctx, msg);
	}

	await dumpInteractionContext(ctx);
	await interaction.editReply({
		components: buildTribeManager(ctx),
		flags: MessageFlags.IsComponentsV2,
	});
}

async function onMemberDemoteRequested(interaction: Interaction) {
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

	var tribe = ctx.tribes.find((tribe) => tribe.id === ctx.selectedTribe);
	if (!tribe) {
		throw Error('Invalid tribe selection.');
	}
	const userToDemote = tribe.members?.find(
		(member) => member.id === ctx.selectedMember,
	);
	const promotedBy = tribe.members?.find(
		(member) => member.discord_id === interaction.user.id,
	);

	if (!userToDemote || !promotedBy) {
		throw Error('No member is currently selected.');
	}

	const currentRankIndex = RANK_PRIORITY.findIndex(
		(rank) => rank === userToDemote.rank,
	);
	const previousRank = RANK_PRIORITY[currentRankIndex + 1];

	console.log(
		`Demotion to ${previousRank} requested for user ${userToDemote.name} in tribe ${tribe.name} by ${promotedBy.name}`,
	);
	await interaction.deferUpdate();
	try {
		const response = await api.tribes.updateTribemember(
			tribe.id,
			userToDemote.id,
			{
				rank: previousRank,
			},
			{
				headers: {
					Authorization: await getProxyBearerJWT(interaction.user.id),
				},
			},
		);
		console.log('Member demoted successfully.');

		// The full tribe data is returned as promoting one user to owner may
		// automatically demote another user.
		Object.assign(tribe, response.data);

		// Remove the member from the tribe internally to avoid
		// making another request to get the data.
		addLogMessage(
			ctx,
			`${userMention(
				userToDemote.discord_id,
			)} was demoted to \`${previousRank}\``,
		);
	} catch (err: any) {
		const msg = err.response?.data?.message;
		console.error(err.response?.data);
		addLogMessage(ctx, msg);
	}

	await dumpInteractionContext(ctx);
	await interaction.editReply({
		components: buildTribeManager(ctx),
		flags: MessageFlags.IsComponentsV2,
	});
}

async function onNextPageRequested(interaction: Interaction) {
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

	ctx.page += 1;
	await dumpInteractionContext(ctx);
	await interaction.update({
		components: buildTribeManager(ctx),
		flags: MessageFlags.IsComponentsV2,
	});
}

async function onPreviousPageRequested(interaction: Interaction) {
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

	ctx.page -= 1;
	await dumpInteractionContext(ctx);
	await interaction.update({
		components: buildTribeManager(ctx),
		flags: MessageFlags.IsComponentsV2,
	});
}
