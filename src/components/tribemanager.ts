import { Tribe, TribeRank, TribeMember } from '@/api/api.gen';
import { TribemanagerContext } from '@/commands/tribes';
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

const RANK_PRIORITY = [
	TribeRank.Owner,
	TribeRank.Admin,
	TribeRank.Member,
	TribeRank.Ally,
];

export function buildTribeManager(context: TribemanagerContext) {
	const tribeSelect = new StringSelectMenuBuilder()
		.setCustomId('selectedTribe')
		.setDisabled(context.tribeData.length === 0)
		.setMaxValues(1)
		.setPlaceholder('Select a tribe you are a part of.')
		.setMinValues(1);

	const selectedTribe = context.tribeData.find(
		(v) => v.id === context.selectedTribe,
	);

	if (selectedTribe) {
		selectedTribe.members?.sort(
			(a, b) => RANK_PRIORITY.indexOf(a.rank) - RANK_PRIORITY.indexOf(b.rank),
		);
	}

	context.tribeData.forEach((tribe, index) => {
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
		addTribeInformation(containerComponent, selectedTribe);
	}

	addTribeManagementButtons(containerComponent, selectedTribe);
	if (context.memberSelectExpanded) {
		addNewMemberSelect(containerComponent);
	}

	if (selectedTribe) {
		addMemberSection(containerComponent, selectedTribe.members || []);
		containerComponent.addSeparatorComponents(new SeparatorBuilder());
		addMemberPageButtons(containerComponent, 0, 5);
	}

	containerComponent.setAccentColor(0x00e5fe);

	return [header, containerComponent];
}

function addMemberSection(container: ContainerBuilder, members: TribeMember[]) {
	container.addMediaGalleryComponents(
		new MediaGalleryBuilder().addItems(
			new MediaGalleryItemBuilder().setURL(MEMBERS_SEP_URL),
		),
	);

	members.forEach((member) =>
		container.addSectionComponents(buildMemberRow(member)),
	);
}

function buildMemberRow(member: TribeMember) {
	const icon = getIconForRole(member.rank);
	const content = `### ${icon} ${member.name} (<@${member.discord_id}>)`;

	return new SectionBuilder()
		.addTextDisplayComponents(new TextDisplayBuilder().setContent(content))
		.setButtonAccessory(
			new ButtonBuilder()
				.setLabel('Manage')
				.setCustomId(member.id.toString())
				.setStyle(ButtonStyle.Secondary)
				.setEmoji('1392616309098811503'),
		);
}

function addTribeInformation(container: ContainerBuilder, tribe: Tribe) {
	const created = Math.floor(Date.parse(tribe.created) / 1000);

	const owner = tribe.members?.find((m) => m.rank === TribeRank.Owner);
	const mention = owner?.discord_id ? userMention(owner?.discord_id) : 'N/A;';

	container.addTextDisplayComponents(
		new TextDisplayBuilder().setContent(
			[
				'## ⤷ Tribe Information',
				`>>> **HLNA Identifier:\t\`#${tribe.id}\`**`,
				`**Current Owner:\t  \`${owner?.name || '-'}\` (${mention})**`,
				`**Date of Creation:\t<t:${created}:D>**`,
				`**Member Count:\t  \`${tribe.members?.length || 0}\`**`,
			].join('\n'),
		),
	);
}

function addTribeManagementButtons(container: ContainerBuilder, tribe?: Tribe) {
	const row = new ActionRowBuilder<ButtonBuilder>();

	row.addComponents(
		new ButtonBuilder()
			.setCustomId('createTribe')
			.setLabel('Create a new Tribe')
			.setEmoji('1392921273029623950')
			.setStyle(ButtonStyle.Success),
	);

	if (tribe) {
		row.addComponents(
			new ButtonBuilder()
				.setCustomId('addMember')
				.setLabel('Add Tribemember')
				.setEmoji('1392921274665144460')
				.setStyle(ButtonStyle.Success),
			new ButtonBuilder()
				.setCustomId('editTribe')
				.setLabel('Edit')
				.setEmoji('1392616309098811503')
				.setStyle(ButtonStyle.Secondary),
			new ButtonBuilder()
				.setCustomId('leaveTribe')
				.setLabel('Leave')
				.setEmoji('1392921854221619470')
				.setStyle(ButtonStyle.Danger),
		);
	}

	container.addActionRowComponents(row);
}

function addNewMemberSelect(container: ContainerBuilder) {
	container.addTextDisplayComponents(
		new TextDisplayBuilder().setContent('## ↪ New Member'),
	);
	const row = new ActionRowBuilder<UserSelectMenuBuilder>().addComponents(
		new UserSelectMenuBuilder()
			.setCustomId('newMember')
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
			.setCustomId('prev')
			.setLabel('↩ Show Previous Members Page')
			.setStyle(ButtonStyle.Primary)
			.setDisabled(currentPage == 0),
		new ButtonBuilder()
			.setCustomId('page')
			.setLabel(`Current Page: ${currentPage + 1}/${maxPages}`)
			.setStyle(ButtonStyle.Secondary)
			.setDisabled(true),
		new ButtonBuilder()
			.setCustomId('next')
			.setLabel('Show Next Members Page ↪')
			.setStyle(ButtonStyle.Primary)
			.setDisabled(currentPage + 1 === maxPages),
	);

	container.addActionRowComponents(row);
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
