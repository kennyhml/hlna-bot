import {
	CommandInteraction,
	Interaction,
	MessageFlags,
	SlashCommandBuilder,
	Snowflake,
} from 'discord.js';
import { api } from '@/api/api';
import { getProxyBearerJWT } from '@/api/auth';
import { DiscordId } from '../api/api.gen';
import {
	buildConfigmanager,
	ConfigmanagerContext,
} from '@/components/configmanager';
import { dumpInteractionContext } from '@/contextmanager';

export const command = new SlashCommandBuilder()
	.setName('configs')
	.setDescription('Display your configurations, must be registered.');

export async function execute(interaction: CommandInteraction) {
	// Fetching the data can take too long to reply in time. Make sure the user knows
	// that we are working on it.
	const reply = await interaction.deferReply({
		flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
	});

	var ctx: ConfigmanagerContext = {
		interactionKind: 'Configmanager',
		discordUserId: interaction.user.id,
		currentPage: 0,
		configs: [],
		logs: [],
	};

	await refreshContext(ctx, { fetchConfigs: true });

	await reply.edit({
		flags: MessageFlags.IsComponentsV2,
		components: buildConfigmanager(ctx),
	});
}

export async function refreshContext(
	ctx: ConfigmanagerContext,
	params: { fetchConfigs?: boolean },
) {
	var changes: boolean = false;
	if (params.fetchConfigs) {
		const token = await getProxyBearerJWT(ctx.discordUserId);
		const response = await api.configs.getUserConfigurations({
			headers: { Authorization: token },
		});
		ctx.configs = response.data;
		ctx.selectedConfig = ctx.configs.find(
			(cfg) => cfg.id === ctx.selectedConfig,
		)?.id;
		ctx.currentPage = 0;
		changes = true;
	}
	// Make sure the selected tribe exists in the list
	if (!ctx.configs.find((c) => c.id === ctx.selectedConfig)) {
		ctx.selectedConfig = undefined;
		ctx.currentPage = 0;
		changes = true;
	}

	// If no tribe is currently selected, use the first tribe as default.
	if (!ctx.selectedConfig && ctx.configs.length !== 0) {
		ctx.selectedConfig = ctx.configs[0].id;
		ctx.currentPage = 0;
		changes = true;
	}

	if (changes) {
		await dumpInteractionContext(ctx);
	}
}

export function addLogMessage(ctx: ConfigmanagerContext, log: string) {
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
