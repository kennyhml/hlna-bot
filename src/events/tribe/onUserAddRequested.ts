import { api } from '@/api/api';
import { TribeRank } from '@/api/api.gen';
import { getProxyBearerJWT } from '@/api/auth';
import { TribemanagerContext } from '@/commands/tribes';
import { Interaction, MessageFlags, Snowflake } from 'discord.js';

export async function onUserAddRequested(
	interaction: Interaction,
	ctx: TribemanagerContext,
): Promise<void> {
	if (!interaction.isUserSelectMenu()) {
		return;
	}

	const userId = interaction.values[0] as Snowflake;
	// const tribe = ctx.tribeData.find((tribe) => tribe.id === ctx.selectedTribe);

	// if (!userId || !tribe) {
	// 	await interaction.reply({
	// 		content:
	// 			'**<:Warning:1394455306595074078> Could not get the User ID or Tribe.**',
	// 		flags: MessageFlags.Ephemeral,
	// 	});
	// 	return;
	// }

	// The user might already be part of the tribe, we cant really prevent that selection
	// if (tribe.members?.find((member) => member.discord_id === userId)) {
	// 	await interaction.reply({
	// 		content:
	// 			'**<:Warning:1394455306595074078> This user is already part of the tribe.**',
	// 		flags: MessageFlags.Ephemeral,
	// 	});
	// 	return;
	// }

	await interaction.deferReply({ flags: MessageFlags.Ephemeral });

	// try {
	// 	const response = await api.tribes.addTribeMembers(
	// 		tribe.id,
	// 		{
	// 			members: [{ discord_id: userId }],
	// 			rank: TribeRank.Member,
	// 		},
	// 		{
	// 			headers: {
	// 				Authorization: await getProxyBearerJWT(interaction.user.id),
	// 			},
	// 		},
	// 	);

	// 	if (response.status === 200) {
	// 		await interaction.editReply({ content: 'Member added successfully.' });
	// 	}
	// } catch (err: any) {
	// 	const responseError = err.response?.data?.message;
	// 	console.error(responseError);

	// 	await interaction?.editReply({
	// 		content: `**<:Warning:1394455306595074078> \`${err.message} ${responseError}\`**`,
	// 	});
	// }
}
