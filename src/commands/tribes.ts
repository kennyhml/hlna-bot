import {
	ButtonInteraction,
	CommandInteraction,
	ComponentType,
	Interaction,
	MessageFlags,
	ModalSubmitInteraction,
	SlashCommandBuilder,
	SlashCommandSubcommandBuilder,
	Snowflake,
	StringSelectMenuInteraction,
	UserSelectMenuInteraction,
} from 'discord.js';
import { buildTribeManager } from '@/components/tribemanager';
import { Tribe } from '@/api/api.gen';
import { onTribeCreateRequested } from '@/events/tribe/on_create';
import { api } from '@/api/api';
import { getProxyBearerJWT } from '@/api/auth';
import { onNewMemberSelected } from '@/events/tribe/on_member_added';

export const command = new SlashCommandBuilder()
	.setName('tribes')
	.setDescription('Display your own user profile, must be registered.');

export interface TribemanagerContext {
	// data of all tribes that can be displayed
	tribeData: Tribe[];
	// id of the tribe currently selected
	selectedTribe?: number;
	// Whether the 'new member selection' should be visible
	memberSelectExpanded?: boolean;
}

export async function execute(interaction: CommandInteraction) {
	// Fetching the data can take too long to reply in time. Make sure the user knows
	// that we are working on it.
	const reply = await interaction.deferReply({
		flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
	});

	var ctx: TribemanagerContext = await getTribeContextFromServer(
		interaction.user.id,
	);

	await reply.edit({
		flags: MessageFlags.IsComponentsV2,
		components: buildTribeManager(ctx),
	});

	const collector = reply.createMessageComponentCollector({
		filter: (i: Interaction) => interaction.user.id == i.user.id,
	});

	// Connect the events for this interaction
	collector.on('collect', async (interaction) => {
		console.log(interaction.customId);
		if (interaction.customId === 'createTribe') {
			await onTribeCreateRequested(
				interaction as ButtonInteraction,
				async (submitInteraction: ModalSubmitInteraction) => {
					// Rebuild the tribe manager components
					ctx = await getTribeContextFromServer(interaction.user.id);
					await reply.edit({ components: buildTribeManager(ctx) });
					await submitInteraction.deleteReply();
				},
			);
		} else if (interaction.customId == 'selectedTribe') {
			const values = (interaction as StringSelectMenuInteraction).values;
			ctx.selectedTribe = parseInt(values[0]);
			await reply.edit({ components: buildTribeManager(ctx) });
			await interaction.deferUpdate();
		} else if (interaction.customId == 'addMember') {
			ctx.memberSelectExpanded = true;
			await reply.edit({ components: buildTribeManager(ctx) });
			if (!interaction.replied) {
				await interaction.deferUpdate();
			}
		} else if (interaction.customId == 'newMember') {
			ctx.memberSelectExpanded = false;
			const tribe = ctx.tribeData.find((v) => v.id === ctx.selectedTribe);
			await onNewMemberSelected(
				interaction as UserSelectMenuInteraction,
				tribe!,
			);
			await reply.edit({ components: buildTribeManager(ctx) });
			if (!interaction.replied) {
				await interaction.deferUpdate();
			}
		}
	});
}

async function getTribeContextFromServer(
	userId: Snowflake,
): Promise<TribemanagerContext> {
	const token = await getProxyBearerJWT(userId);

	const response = await api.users.getCurrentUserTribes({
		headers: { Authorization: token },
	});
	return {
		tribeData: response.data,
		selectedTribe: response.data[0]?.id,
	};
}
