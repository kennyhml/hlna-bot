import { TribemanagerContext } from '@/commands/tribes';
import { buildTribeManager } from '@/components/tribemanager';
import {
	dumpInteractionContext,
	loadInteractionContext,
} from '@/contextmanager';
import { Interaction } from 'discord.js';

export async function onTribeChanged(interaction: Interaction) {
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

	ctx.selectedTribe = ctx.tribes.find((tribe) => tribe.id === selectedTribeId);
	await dumpInteractionContext(ctx);

	await interaction.update({
		components: buildTribeManager(ctx),
	});
}
