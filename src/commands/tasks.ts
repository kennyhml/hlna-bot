import {
	CommandInteraction,
	Interaction,
	MessageFlags,
	SlashCommandBuilder,
	Snowflake,
} from 'discord.js';
import { buildTaskmanager, TaskmanagerContext } from '@/components/taskmanager';

export const command = new SlashCommandBuilder()
	.setName('tasks')
	.setDescription('Display your tasks, must be registered.');

export async function execute(interaction: CommandInteraction) {
	// Fetching the data can take too long to reply in time. Make sure the user knows
	// that we are working on it.
	const reply = await interaction.deferReply({
		flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
	});

	var ctx: TaskmanagerContext = {
		interactionKind: 'Taskmanager',
		discordUserId: interaction.user.id,
		currentPage: 0,
		taskgroups: [],
		logs: [],
	};

	await reply.edit({
		flags: MessageFlags.IsComponentsV2,
		components: buildTaskmanager(ctx),
	});
}
