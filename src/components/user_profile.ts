import { User as UserData } from '@/api/api.gen';
import {
	ContainerBuilder,
	SectionBuilder,
	SeparatorBuilder,
	TextDisplayBuilder,
	User as DiscordUser,
	userMention,
	ThumbnailBuilder,
	SeparatorSpacingSize,
} from 'discord.js';

import * as resources from '@/components/resources';

export function buildUserProfile(userData: UserData, discord: DiscordUser) {
	const registered = Math.floor(Date.parse(userData.registered) / 1000);

	const accountComponent = new SectionBuilder()
		.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(
				`## HLNA User **${userMention(discord.id)}**`,
			),
			new TextDisplayBuilder().setContent(
				[
					'### Account',
					`➤ HLNA ID: **\`#${userData.id}\`**`,
					`➤ Username: **${userData.name}**`,
					`➤ Role(s):  **${userData.role}**`,
					`➤ Registered:  **<t:${registered}:D>**`,
				].join('\n'),
			),
		)
		.setThumbnailAccessory(
			new ThumbnailBuilder().setURL(resources.RED_IMPLANT_URL),
		);

	const containerComponent = new ContainerBuilder()
		.addSectionComponents(accountComponent)
		.setAccentColor(0xdd4c4c);

	return [containerComponent];
}
