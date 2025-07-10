import {
	CommandInteraction,
	EmbedBuilder,
	MessageFlags,
	SlashCommandSubcommandBuilder,
} from 'discord.js';
import { api } from '../../api/api';
import { getProxyJWT } from '../../api/auth';
import { buildUserProfile } from '@/components/user_profile';
import { buildTribeManager } from '@/components/tribemanager';
import { TribeAssociation } from '@/api/api.gen';

export const command = new SlashCommandSubcommandBuilder()
	.setName('test')
	.setDescription('Display your own user profile, must be registered.');

export async function execute(interaction: CommandInteraction) {
	if (!interaction.isChatInputCommand()) return;

	const components = buildTribeManager({
		tribes: [
			{
				created: '2025-07-09T17:04:42.714Z',
				id: 1012891283,
				members: [
					{
						association: TribeAssociation.Owner,
						discord_id: '1212121212121211',
						id: 9109685,
						joined: '2025-07-09T19:38:22.534Z',
						name: 'Test2',
						updated: '2025-07-09T19:04:41.526Z',
					},
				],
				name: 'AmazingTribe',
			},
		],
	});
	await interaction.reply({
		flags: MessageFlags.IsComponentsV2,
		components,
	});
}
