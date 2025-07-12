import {
	CommandInteraction,
	Interaction,
	MessageFlags,
	SlashCommandBuilder,
	Snowflake,
} from 'discord.js';
import { api } from '@/api/api';
import { getProxyBearerJWT } from '@/api/auth';
import {
	buildConfigManager,
	ConfigmanagerContext,
} from '@/components/configmanager';

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
		configData: [
			{
				id: 123,
				name: 'Mock Config',
				owner: 1233131,
				created: '',
				shareTribes: [],
				taskData: [
					{
						id: 1234,
						name: 'Gacha Tower',
						type: 'GACHAFEED',
						priority: 1,
						enabled: false,
						tasks: [],
					},
				],
			},
		],
		selectedConfig: 123,
	};

	await reply.edit({
		flags: MessageFlags.IsComponentsV2,
		components: buildConfigManager(ctx),
	});

	const collector = reply.createMessageComponentCollector({
		filter: (i: Interaction) => interaction.user.id == i.user.id,
	});

	// Connect the events for this interaction
	collector.on('collect', async (interaction) => {
		console.log(interaction.customId);
		// if (interaction.customId === 'createTribe') {
		// 	await onTribeCreateRequested(
		// 		interaction as ButtonInteraction,
		// 		async (submitInteraction: ModalSubmitInteraction) => {
		// 			// Rebuild the tribe manager components
		// 			ctx = await getTribeContextFromServer(interaction.user.id);
		// 			await reply.edit({ components: buildTribeManager(ctx) });
		// 			await submitInteraction.deleteReply();
		// 		},
		// 	);
		// } else if (interaction.customId == 'selectedTribe') {
		// 	const values = (interaction as StringSelectMenuInteraction).values;
		// 	ctx.selectedTribe = parseInt(values[0]);
		// 	await reply.edit({ components: buildTribeManager(ctx) });
		// 	await interaction.deferUpdate();
		// } else if (interaction.customId == 'addMember') {
		// 	ctx.memberSelectExpanded = true;
		// 	await reply.edit({ components: buildTribeManager(ctx) });
		// 	await interaction.deferUpdate();
		// }
	});
}

async function getTribeContextFromServer(
	userId: Snowflake,
): Promise<ConfigmanagerContext> {
	const token = await getProxyBearerJWT(userId);

	const data = await api.users
		.getCurrentUserTribes({ headers: { Authorization: token } })
		.then(async (response) => {
			return response.data;
		})
		.catch(async (err) => {
			console.error(err);
			// TODO: Make a meaningful error of whatever the api throws at us
			throw err;
		});

	return {
		configData: [],
	};
}
