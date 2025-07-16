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

export type LogAction = {
	time: string;
	message: string;
};

type TribeId = number;

export type TribemanagerContext = {
	interactionKind: string;

	discordUserId: Snowflake;
	// data of all tribes that can be displayed
	tribes: Tribe[];
	// id of the tribe currently selected
	selectedTribe?: TribeId;
	// Whether the 'new member selection' should be visible
	memberSelectExpanded?: boolean;
	// A member that is currently selected
	selectedMember?: UserId;
	// Action logs of the last few actions
	logs?: LogAction[];

	page: number;
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
		page: 0,
	};

	await refreshContext(ctx, { fetchTribes: true });

	await reply.edit({
		flags: MessageFlags.IsComponentsV2,
		components: buildTribeManager(ctx),
	});
}

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
		ctx.selectedTribe = ctx.tribes.find(
			(tribe) => tribe.id === ctx.selectedTribe,
		)?.id;
		ctx.page = 0;
		changes = true;
	}
	// Make sure the selected tribe exists in the list
	if (!ctx.tribes.find((tribe) => tribe.id === ctx.selectedTribe)) {
		ctx.selectedTribe = undefined;
		ctx.memberSelectExpanded = false;
		ctx.page = 0;
		changes = true;
	}

	// If no tribe is currently selected, use the first tribe as default.
	if (!ctx.selectedTribe && ctx.tribes.length !== 0) {
		ctx.selectedTribe = ctx.tribes[0].id;
		ctx.memberSelectExpanded = false;
		ctx.page = 0;
		changes = true;
	}

	if (changes) {
		await dumpInteractionContext(ctx);
	}
}

export function addLogMessage(ctx: TribemanagerContext, log: string) {
	if (!ctx.logs) {
		ctx.logs = [];
	}
	ctx.logs.push({
		time: new Date().toLocaleTimeString('en-US', { hour12: false }),
		message: log,
	});

	if (ctx.logs.length > 5) {
		ctx.logs.shift();
	}
}
