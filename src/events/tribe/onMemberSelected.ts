import { TribemanagerContext } from '@/commands/tribes';
import { buildTribeManager } from '@/components/tribemanager';
import {
	dumpInteractionContext,
	loadInteractionContext,
} from '@/contextmanager';
import { Interaction, MessageFlags } from 'discord.js';

export default async function (interaction: Interaction) {
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
