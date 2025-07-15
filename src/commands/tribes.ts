import {
	CommandInteraction,
	MessageFlags,
	SlashCommandBuilder,
	Snowflake,
} from 'discord.js';
import { buildTribeManager } from '@/components/tribemanager';
import { Tribe, UserId } from '@/api/api.gen';
import { api } from '@/api/api';
import { getProxyBearerJWT } from '@/api/auth';
import { dumpInteractionContext } from '@/contextmanager';

export const command = new SlashCommandBuilder()
	.setName('tribes')
	.setDescription('Display your own user profile, must be registered.');

export type TribemanagerContext = {
	interactionKind: string;

	discordUserId: Snowflake;
	// data of all tribes that can be displayed
	tribes: Tribe[];
	// id of the tribe currently selected
	selectedTribe?: Tribe;
	// Whether the 'new member selection' should be visible
	memberSelectExpanded?: boolean;
	// A member that is currently selected
	selectedMember?: UserId;
};

export async function execute(interaction: CommandInteraction) {
	// Fetching the data can take too long to reply in time. Make sure the user knows
	// that we are working on it.
	const reply = await interaction.deferReply({
		flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
	});

	// Always create a new context and override the previous interation (within refreshContext)
	const ctx: TribemanagerContext = {
		interactionKind: 'Tribemanager',
		discordUserId: interaction.user.id,
		tribes: [],
	};

	await refreshContext(ctx, { fetchTribes: true });

	await reply.edit({
		flags: MessageFlags.IsComponentsV2,
		components: buildTribeManager(ctx),
	});
}

// 	// Connect the events for this interaction
// 	collector.on('collect', async (interaction) => {
// 		console.log(interaction.customId);
// 		if (interaction.customId === 'createTribe') {
// 			await onTribeCreateRequested(
// 				interaction as ButtonInteraction,
// 				async (submitInteraction: ModalSubmitInteraction) => {
// 					// Rebuild the tribe manager components
// 					ctx = await getTribeContextFromServer(interaction.user.id);
// 					await reply.edit({ components: buildTribeManager(ctx) });
// 					await submitInteraction.deleteReply();
// 				},
// 			);
// 		} else if (interaction.customId == 'selectedTribe') {
// 			const values = (interaction as StringSelectMenuInteraction).values;
// 			ctx.selectedTribe = parseInt(values[0]);
// 			await reply.edit({ components: buildTribeManager(ctx) });
// 			await interaction.deferUpdate();
// 		} else if (interaction.customId == 'addMember') {
// 			ctx.memberSelectExpanded = true;
// 			await reply.edit({ components: buildTribeManager(ctx) });
// 			if (!interaction.replied) {
// 				await interaction.deferUpdate();
// 			}
// 		} else if (interaction.customId == 'newMember') {
// 			ctx.memberSelectExpanded = false;
// 			const tribe = ctx.tribeData.find((v) => v.id === ctx.selectedTribe);
// 			await onNewMemberSelected(
// 				interaction as UserSelectMenuInteraction,
// 				tribe!,
// 			);
// 			await reply.edit({ components: buildTribeManager(ctx) });
// 			if (!interaction.replied) {
// 				await interaction.deferUpdate();
// 			}
// 		} else if (interaction.customId.startsWith('manage-member')) {
// 			const memberId = parseInt(interaction.customId.split('-')[2]);

// 			ctx.memberSelectExpanded = false;
// 			if (ctx.selectedMember === memberId) {
// 				ctx.selectedMember = undefined;
// 			} else {
// 				ctx.selectedMember = memberId;
// 			}
// 			await reply.edit({ components: buildTribeManager(ctx) });
// 			await interaction.deferUpdate();
// 		} else if (interaction.customId == 'kickMember') {
// 			const memberId = ctx.selectedMember;
// 			if (!memberId) {
// 				throw Error('Could not get the ID of the member to kick.');
// 			}

// 			const tribe = ctx.tribeData.find((t) => t.id === ctx.selectedTribe);
// 			console.log(`Kicking ${memberId} from ${tribe?.name}`);
// 			try {
// 				const response = await api.tribes.removeTribemember(
// 					tribe!.id,
// 					memberId,
// 					{
// 						headers: {
// 							Authorization: await getProxyBearerJWT(interaction.user.id),
// 						},
// 					},
// 				);
// 				// Remove the member from the list so we dont need to refetch data.
// 				tribe?.members?.filter((t) => t.id != memberId);
// 				ctx.selectedMember = undefined;
// 				await reply.edit({ components: buildTribeManager(ctx) });
// 				await interaction.deferUpdate();
// 			} catch (err: any) {
// 				await interaction.reply({
// 					content: `Failed to kick Member:  ${err?.response?.data?.message}`,
// 				});
// 			}
// 		}
// 	});
// }

export async function refreshContext(
	ctx: TribemanagerContext,
	params: { fetchTribes?: boolean },
) {
	var changes: boolean = false;
	if (params.fetchTribes) {
		const token = await getProxyBearerJWT(ctx.discordUserId);
		const response = await api.users.getCurrentUserTribes({
			headers: { Authorization: token },
		});
		ctx.tribes = response.data;
		changes = true;
	}
	// Make sure the selected tribe exists in the list
	if (ctx.selectedTribe && !ctx.tribes.includes(ctx.selectedTribe)) {
		ctx.selectedTribe = undefined;
		changes = true;
	}

	// If no tribe is currently selected, use the first tribe as default.
	if (!ctx.selectedTribe && ctx.tribes.length !== 0) {
		ctx.selectedTribe = ctx.tribes[0];
		changes = true;
	}

	if (changes) {
		await dumpInteractionContext(ctx);
	}
}
