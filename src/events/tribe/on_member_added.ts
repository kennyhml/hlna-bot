import { api } from '@/api/api';
import { Tribe, TribeAssociation } from '@/api/api.gen';
import { getProxyBearerJWT } from '@/api/auth';
import { MessageFlags, Snowflake, UserSelectMenuInteraction } from 'discord.js';

export async function onNewMemberSelected(
	interaction: UserSelectMenuInteraction,
	tribe: Tribe,
): Promise<void> {
	const userId = interaction.values[0] as Snowflake;

	// The user might already be part of the tribe, we cant really prevent
	// that selection, so check that first.
	if (tribe.members?.find((member) => member.discord_id === userId)) {
		await interaction.reply({
			content: 'This user is already part of the tribe.',
			flags: MessageFlags.Ephemeral,
		});
		return;
	}

	// Make sure to defer since we are making a server request
	await interaction.deferReply({ flags: MessageFlags.Ephemeral });

	try {
		const response = await api.tribes.addTribeMembers(
			tribe.id,
			{
				members: [{ discord_id: userId }],
				grant_role: TribeAssociation.Member,
			},
			{
				headers: {
					Authorization: await getProxyBearerJWT(interaction.user.id),
				},
			},
		);

		if (response.status === 200) {
			await interaction.editReply({ content: 'Member added successfully.' });
		}
	} catch (err: any) {
		const responseError = err.response?.data?.message;
		console.error(responseError);

		await interaction?.editReply({
			content: `**\`${err.message} ${responseError}\`**`,
		});
	}
}
