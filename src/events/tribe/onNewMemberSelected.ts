import { api } from '@/api/api';
import { TribeRank } from '@/api/api.gen';
import { getProxyBearerJWT } from '@/api/auth';
import {
	addLogMessage,
	refreshContext,
	TribemanagerContext,
} from '@/commands/tribes';
import { buildTribeManager } from '@/components/tribemanager';
import {
	dumpInteractionContext,
	loadInteractionContext,
} from '@/contextmanager';
import { Interaction, MessageFlags, Snowflake, userMention } from 'discord.js';

export default async function (interaction: Interaction): Promise<void> {
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
