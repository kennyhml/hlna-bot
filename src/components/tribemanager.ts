import { Tribe, TribeRank, TribeMember } from '@/api/api.gen';
import { LogAction, TribemanagerContext } from '@/commands/tribes';
import {
	ContainerBuilder,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder,
	ActionRowBuilder,
	MediaGalleryBuilder,
	MediaGalleryItemBuilder,
	TextDisplayBuilder,
	ButtonBuilder,
	ButtonStyle,
	SectionBuilder,
	SeparatorBuilder,
	userMention,
	UserSelectMenuBuilder,
} from 'discord.js';

const HEADER_URL =
	'https://media.discordapp.net/attachments/1391884971706421439/1392600994063450302/TRIBEMANAGER.png?ex=6870203e&is=686ecebe&hm=271b495242654dabc96faf427b013fed7d9ce12d2ac6f12e46e0df248b6c2a20&=&format=webp&quality=lossless';

const TRIBE_SEP_URL =
	'https://media.discordapp.net/attachments/1391884971706421439/1392917742767833281/tribe_no_scout_1.png?ex=6871473d&is=686ff5bd&hm=956ea1d146778d540c2cc58c43741d0e44f0c422c34d204339d83dc14472c1f3&=&format=webp&quality=lossless';

const MEMBERS_SEP_URL =
	'https://media.discordapp.net/attachments/1391884971706421439/1392916906243133600/rules_no_scout_1.png?ex=68714675&is=686ff4f5&hm=6527b63fc6c93d0a8dc1285c8123863704fc9d50d0fd30d0def07e38cea5c4e8&=&format=webp&quality=lossless';

const OWNER_ICON = '<:Owner:1393335855338356898>';
const ADMIN_ICON = '<:Admin:1393336036318249120> ';
const MEMBER_ICON = '<:Member:1393336034967814205> ';
const ALLY_ICON = '<:Ally:1393336033374113913>';

export const RANK_PRIORITY = [
	TribeRank.Owner,
	TribeRank.Admin,
	TribeRank.Member,
	TribeRank.Ally,
];

const TribemanagerEvents = {
	TribeChanged: 'TribeChanged',
	TribeCreateRequested: 'TribeCreateRequested',
	NewMemberSelected: 'NewMemberSelected',
	MemberAddRequested: 'MemberAddRequested',
	EditTribeRequested: 'EditTribeRequested',
	LeaveTribeRequested: 'LeaveTribeRequested',
	MemberPromoteRequested: 'MemberPromoteRequested',
	MemberDemoteRequested: 'MemberDemoteRequested',
	MemberKickRequested: 'MemberKickRequested',
	PreviousPageRequested: 'PreviousPageRequested',
	NextPageRequested: 'NextPageRequested',
	MemberSelected: 'MemberSelected',
	RefreshRequested: 'RefreshRequested',
} as const;

export type TribemanagerEvent =
	(typeof TribemanagerEvents)[keyof typeof TribemanagerEvents];

export function buildTribeManager(context: TribemanagerContext) {
	const tribeSelect = new StringSelectMenuBuilder()
		.setCustomId(TribemanagerEvents.TribeChanged)
		.setDisabled(context.tribes.length === 0)
		.setMaxValues(1)
		.setPlaceholder('Select a tribe you are a part of.')
		.setMinValues(1);

	const selectedTribe = context.tribes.find(
		(tribe) => tribe.id === context.selectedTribe,
	);

	if (selectedTribe) {
		selectedTribe.members?.sort(
			(a, b) => RANK_PRIORITY.indexOf(a.rank) - RANK_PRIORITY.indexOf(b.rank),
		);
	}

	context.tribes.forEach((tribe, index) => {
		tribeSelect.addOptions(
			new StringSelectMenuOptionBuilder()
				.setLabel(tribe.name)
				.setValue(tribe.id.toString())
				.setDefault(tribe.id === selectedTribe?.id)
				.setDescription('Tribe ' + tribe.name) // TODO: Add a description to the API?
				.setEmoji('1392603795623641289'),
		);
	});

	const header = new MediaGalleryBuilder().addItems(
		new MediaGalleryItemBuilder().setURL(HEADER_URL),
	);

	const tribeSep = new MediaGalleryBuilder().addItems(
		new MediaGalleryItemBuilder().setURL(TRIBE_SEP_URL),
	);

	const containerComponent = new ContainerBuilder().addMediaGalleryComponents(
		tribeSep,
	);

	if (selectedTribe) {
		containerComponent.addActionRowComponents(
			new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
				tribeSelect,
			),
		);
	}

	if (selectedTribe) {
		addTribeInformation(containerComponent, selectedTribe, context.logs || []);
	}

	addTribeManagementButtons(
		containerComponent,
		selectedTribe,
		selectedTribe?.members!.find((m) => m.discord_id === context.discordUserId)
			?.rank,
	);
	if (context.memberSelectExpanded) {
		addNewMemberSelect(containerComponent);
	}

	if (selectedTribe) {
		addMemberSection(
			containerComponent,
			selectedTribe.members || [],
			context.page,
			selectedTribe.members?.find((m) => m.discord_id === context.discordUserId)
				?.rank!,
			context.selectedMember,
		);
		if (context.selectedMember) {
			buildMemberActions(
				containerComponent,
				selectedTribe.members?.find((m) => m.id === context.selectedMember)!,
				selectedTribe.members?.find(
					(m) => m.discord_id === context.discordUserId,
				)!,
			);
		}
		containerComponent.addSeparatorComponents(new SeparatorBuilder());

		addMemberPageButtons(
			containerComponent,
			context.page,
			Math.floor(selectedTribe.members!.length / 5) + 1,
		);
	}
	containerComponent.setAccentColor(0x00e5fe);

	return [header, containerComponent];
}

function addMemberSection(
	container: ContainerBuilder,
	members: TribeMember[],
	page: number,
	myRank: TribeRank,
	selected?: number,
) {
	container.addMediaGalleryComponents(
		new MediaGalleryBuilder().addItems(
			new MediaGalleryItemBuilder().setURL(MEMBERS_SEP_URL),
		),
	);

	members
		.slice(page * 5, page * 5 + 5)
		.forEach((member, index, arr) =>
			container.addSectionComponents(
				buildMemberRow(
					member,
					member.id === selected,
					members.find((m) => m.id === selected)!,
					myRank,
					index === arr.length - 1 && selected !== undefined,
				),
			),
		);
}

function buildMemberRow(
	member: TribeMember,
	isSelected: boolean,
	selected: TribeMember,
	myRank: TribeRank,
	showInfo: boolean,
) {
	const icon = getIconForRole(member.rank);
	var content = `### ${icon} ${member.name} (<@${member.discord_id}>)`;
	if (showInfo) {
		content += `\n### ⤷ Managing ${userMention(selected.discord_id)}`;
	}
	const hasAuthority =
		myRank === TribeRank.Owner ||
		(myRank === TribeRank.Admin && member.rank !== TribeRank.Owner);

	const button = new ButtonBuilder();
	if (isSelected) {
		button.setLabel('Cancel');
	} else if (hasAuthority) {
		button.setLabel('Manage');
	} else {
		button.setLabel('🔒').setDisabled(true);
	}

	if (hasAuthority) {
		button.setEmoji('1392616309098811503');
	}

	button
		.setCustomId(`${TribemanagerEvents.MemberSelected}-${member.id.toString()}`)
		.setStyle(isSelected ? ButtonStyle.Danger : ButtonStyle.Secondary);

	return new SectionBuilder()
		.addTextDisplayComponents(new TextDisplayBuilder().setContent(content))
		.setButtonAccessory(button);
}

function buildMemberActions(
	container: ContainerBuilder,
	member: TribeMember,
	user: TribeMember,
) {
	const currentRankIndex = RANK_PRIORITY.findIndex((v) => v === member.rank);
	const userRankIndex = RANK_PRIORITY.findIndex((v) => v === user.rank);

	// 0 and 1 is Owner and Admin, nobody else should be able to perform these actions.
	// Also check if the target has a higher rank than we do (e.g owner, then we cant do anything.)
	if (userRankIndex > 1 || currentRankIndex < userRankIndex) {
		return;
	}
	const row = new ActionRowBuilder<ButtonBuilder>();

	if (currentRankIndex !== 0 && !(currentRankIndex === userRankIndex)) {
		const nextRank = RANK_PRIORITY[currentRankIndex - 1];
		row.addComponents(
			new ButtonBuilder()
				.setCustomId(TribemanagerEvents.MemberPromoteRequested)
				.setStyle(ButtonStyle.Success)
				.setEmoji(getIconForRole(nextRank))
				.setLabel(
					nextRank === TribeRank.Owner
						? `Transfer Ownership`
						: `Promote to ${nextRank}`,
				),
		);
	}
	if (currentRankIndex !== RANK_PRIORITY.length - 1) {
		const previousRank = RANK_PRIORITY[currentRankIndex + 1];
		row.addComponents(
			new ButtonBuilder()
				.setCustomId(TribemanagerEvents.MemberDemoteRequested)
				.setStyle(ButtonStyle.Secondary)
				.setEmoji(getIconForRole(previousRank))
				.setLabel(`Demote to ${previousRank}`),
		);
	}
	if (user.id !== member.id) {
		row.addComponents(
			new ButtonBuilder()
				.setCustomId(TribemanagerEvents.MemberKickRequested)
				.setStyle(ButtonStyle.Danger)
				.setEmoji('1392921854221619470')
				.setLabel('Remove from Tribe'),
		);
	}

	container.addActionRowComponents(row);
}

function addTribeInformation(
	container: ContainerBuilder,
	tribe: Tribe,
	logs: LogAction[],
) {
	const created = Math.floor(Date.parse(tribe.created) / 1000);

	const owner = tribe.members?.find((m) => m.rank === TribeRank.Owner);
	const mention = owner?.discord_id ? userMention(owner?.discord_id) : 'N/A;';

	var content = [
		'### ⤷ Tribe Information',
		`> **HLNA Identifier:\t\`#${tribe.id}\`**`,
		`> **Current Owner:\t  \`${owner?.name || '-'}\` (${mention})**`,
		`> **Date of Creation:\t<t:${created}:D>**`,
		`> **Member Count:\t  \`${tribe.members?.length || 0}\`**\n`,
	].join('\n');

	if (logs.length !== 0) {
		content +=
			'### ⤷ Action Logs\n' +
			logs.map((log) => `> -# **${log.time}: ${log.message}**`).join('\n');
	}
	container.addTextDisplayComponents(
		new TextDisplayBuilder().setContent(content),
	);
}

function addTribeManagementButtons(
	container: ContainerBuilder,
	tribe?: Tribe,
	userRank?: TribeRank,
) {
	const row = new ActionRowBuilder<ButtonBuilder>();

	row.addComponents(
		new ButtonBuilder()
			.setCustomId(TribemanagerEvents.TribeCreateRequested)
			.setLabel('Create Tribe')
			.setEmoji('1392921273029623950')
			.setStyle(ButtonStyle.Success),
	);

	if (tribe && userRank) {
		// Only Admins and Owners can invite Members and Edit the Tribe
		if (userRank === TribeRank.Admin || userRank === TribeRank.Owner) {
			row.addComponents(
				new ButtonBuilder()
					.setCustomId(TribemanagerEvents.MemberAddRequested)
					.setLabel('Add Tribemember')
					.setEmoji('1392921274665144460')
					.setStyle(ButtonStyle.Success),
				new ButtonBuilder()
					.setCustomId(TribemanagerEvents.EditTribeRequested)
					.setLabel('Edit')
					.setEmoji('1392616309098811503')
					.setStyle(ButtonStyle.Secondary),
			);
		}
		// Leaving is always possible, if the owner leaves then owner is simply given
		// to the next admin that has been in tribe the longest.
		row.addComponents(
			new ButtonBuilder()
				.setCustomId(TribemanagerEvents.RefreshRequested)
				.setLabel('↻ Refresh')
				.setStyle(ButtonStyle.Secondary),
			new ButtonBuilder()
				.setCustomId(TribemanagerEvents.LeaveTribeRequested)
				.setLabel('Leave')
				.setEmoji('1392921854221619470')
				.setStyle(ButtonStyle.Danger),
		);
		container.addActionRowComponents(row);
	}
}

function addNewMemberSelect(container: ContainerBuilder) {
	container.addTextDisplayComponents(
		new TextDisplayBuilder().setContent('## ↪ New Member'),
	);
	const row = new ActionRowBuilder<UserSelectMenuBuilder>().addComponents(
		new UserSelectMenuBuilder()
			.setCustomId(TribemanagerEvents.NewMemberSelected)
			.setMinValues(1)
			.setMaxValues(1)
			.setPlaceholder('Select the User to add to the tribe.'),
	);

	container.addActionRowComponents(row);
}

function addMemberPageButtons(
	container: ContainerBuilder,
	currentPage: number,
	maxPages: number,
) {
	const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
		new ButtonBuilder()
			.setCustomId(TribemanagerEvents.PreviousPageRequested)
			.setLabel('↩ Show Previous Members Page')
			.setStyle(ButtonStyle.Primary)
			.setDisabled(currentPage === 0),
		new ButtonBuilder()
			.setCustomId('page')
			.setLabel(`Current Page: ${currentPage + 1}/${maxPages}`)
			.setStyle(ButtonStyle.Secondary)
			.setDisabled(true),
		new ButtonBuilder()
			.setCustomId(TribemanagerEvents.NextPageRequested)
			.setLabel('Show Next Members Page ↪')
			.setStyle(ButtonStyle.Primary)
			.setDisabled(currentPage + 1 === maxPages),
	);

	container.addActionRowComponents(row);
}

function addLogArea(container: ContainerBuilder, logs: LogAction[]) {
	if (!logs) {
		return;
	}
	const content = new TextDisplayBuilder().setContent(
		'\n## ⤷ Action Output\n' +
			logs.map((log) => `-# \\> **${log.time}: ${log.message}**`).join('\n'),
	);
	container.addTextDisplayComponents(content);
}

function getIconForRole(role: TribeRank) {
	switch (role) {
		case TribeRank.Admin:
			return ADMIN_ICON;
		case TribeRank.Owner:
			return OWNER_ICON;
		case TribeRank.Member:
			return MEMBER_ICON;
		case TribeRank.Ally:
			return ALLY_ICON;
	}
}
