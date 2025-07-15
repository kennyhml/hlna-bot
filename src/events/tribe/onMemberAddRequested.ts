import { TribemanagerContext } from '@/commands/tribes';
import { buildTribeManager } from '@/components/tribemanager';
import {
	dumpInteractionContext,
	loadInteractionContext,
} from '@/contextmanager';
import { Interaction } from 'discord.js';

export async function onMemberAddRequested(
	interaction: Interaction,
): Promise<void> {
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

	console.log(ctx);
	await interaction.update({ components: buildTribeManager(ctx) });
}
