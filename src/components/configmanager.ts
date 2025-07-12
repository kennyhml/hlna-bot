import { Tribe } from '@/api/api.gen';
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
	UserSelectMenuBuilder,
} from 'discord.js';

const HEADER_URL =
	'https://media.discordapp.net/attachments/1392553548390338591/1393602837321093140/configmanager_header.png?ex=6873c548&is=687273c8&hm=7743e576355315c494b9dee39a65da0c06d110cc082433999992903d69614c41&=&format=webp&quality=lossless';

const TASK_GROUP_SEP =
	'https://media.discordapp.net/attachments/1392553548390338591/1393602952052211753/task_group_separator.png?ex=6873c563&is=687273e3&hm=025f15f3ab59b96ab8d3c4664cb94245ad07ea1f358cca4c1351ba0e0f439f36&=&format=webp&quality=lossless';

const CONFIG_SEP =
	'https://media.discordapp.net/attachments/1392553548390338591/1393602952312262666/config_separator.png?ex=6873c563&is=687273e3&hm=f1e6151d6da93d4089f290367390aab81aaa90ab252daf8b6e83324fc6ae6b83&=&format=webp&quality=lossless';

export interface TaskGroup {
	id: number;
	name: string;
	type: string;
	enabled: boolean;
	tasks: undefined[];
	priority: number;
}

export interface Config {
	id: number;
	owner: number; // userid
	name: string;
	created: string;
	shareTribes: Tribe[];
	taskData: TaskGroup[];
}

export interface ConfigmanagerContext {
	configData: Config[];
	selectedConfig?: number;
	isAddingTask?: boolean;
	groupFilter?: string;
}

export function buildConfigManager(context: ConfigmanagerContext) {
	const configSelect = new StringSelectMenuBuilder()
		.setCustomId('selectedConfig')
		.setDisabled(context.configData.length === 0)
		.setMaxValues(1)
		.setPlaceholder('Select one of your configurations.')
		.setMinValues(1);

	const selectedConfig = context.configData.find(
		(v) => v.id === context.selectedConfig,
	);

	if (selectedConfig) {
		selectedConfig.taskData?.sort((a, b) => a.priority - b.priority);
	}

	context.configData.forEach((config) => {
		configSelect.addOptions(
			new StringSelectMenuOptionBuilder()
				.setLabel(config.name)
				.setValue(config.id.toString())
				.setDefault(config.id === selectedConfig?.id)
				.setDescription('Config ' + config.name) // TODO: Add a description to the API?
				.setEmoji('1393609184100220968'),
		);
	});

	const header = new MediaGalleryBuilder().addItems(
		new MediaGalleryItemBuilder().setURL(HEADER_URL),
	);

	const configSep = new MediaGalleryBuilder().addItems(
		new MediaGalleryItemBuilder().setURL(CONFIG_SEP),
	);

	const containerComponent = new ContainerBuilder().addMediaGalleryComponents(
		configSep,
	);

	if (selectedConfig) {
		containerComponent.addActionRowComponents(
			new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
				configSelect,
			),
		);
	}

	if (selectedConfig) {
		addConfigInformation(containerComponent, selectedConfig);
	}

	addManagementButtons(containerComponent, selectedConfig);
	if (context.isAddingTask) {
		// addNewMemberSelect(containerComponent);
	}

	if (selectedConfig && selectedConfig.taskData.length !== 0) {
		addTaskgroupSection(containerComponent, selectedConfig.taskData || []);
		containerComponent.addSeparatorComponents(new SeparatorBuilder());
		addTaskgroupPageButtons(containerComponent, 0, 5);
	}

	containerComponent.setAccentColor(0x00e5fe);

	return [header, containerComponent];
}

function addTaskgroupSection(container: ContainerBuilder, tasks: TaskGroup[]) {
	container.addMediaGalleryComponents(
		new MediaGalleryBuilder().addItems(
			new MediaGalleryItemBuilder().setURL(TASK_GROUP_SEP),
		),
	);

	tasks.forEach((task) =>
		container.addSectionComponents(buildTaskgroupRow(task)),
	);
}

function buildTaskgroupRow(taskgroup: TaskGroup) {
	// TODO: Get icon based on task group type
	const icon = '<:Dust:1393605645307215975>';

	var content = `### ${icon} ${taskgroup.name} (\`#${taskgroup.id}\`)`;

	if (!taskgroup.enabled) {
		content += ' (Disabled)';
	}

	return new SectionBuilder()
		.addTextDisplayComponents(new TextDisplayBuilder().setContent(content))
		.setButtonAccessory(
			new ButtonBuilder()
				.setLabel('Manage')
				.setCustomId(taskgroup.id.toString())
				.setStyle(ButtonStyle.Secondary)
				.setEmoji('1392616309098811503'),
		);
}

function addConfigInformation(container: ContainerBuilder, config: Config) {
	const created = Math.floor(Date.parse(config.created) / 1000);

	// const owner = tribe.members?.find(
	// 	(m) => m.association === TribeAssociation.Owner,
	// );
	// const mention = owner?.discord_id ? userMention(owner?.discord_id) : 'N/A;';

	container.addTextDisplayComponents(
		new TextDisplayBuilder().setContent(
			[
				'## ⤷ Config Information',
				`>>> **HLNA Identifier:\t\`#${config.id}\`**`,
				// `**Current Owner:\t  \`${owner?.name || '-'}\` (${mention})**`,
				`**Date of Creation:\t<t:${created}:D>**`,
				`**Task Group Count:\t  \`${config.taskData.length}\`**`,
			].join('\n'),
		),
	);
}

function addManagementButtons(container: ContainerBuilder, config?: Config) {
	const row = new ActionRowBuilder<ButtonBuilder>();

	row.addComponents(
		new ButtonBuilder()
			.setCustomId('createConfig')
			.setLabel('New Configuration')
			.setEmoji('1393608855908515923')
			.setStyle(ButtonStyle.Success),
	);

	if (config) {
		row.addComponents(
			new ButtonBuilder()
				.setCustomId('addTask')
				.setLabel('Add a Task')
				.setEmoji('1392921274665144460')
				.setStyle(ButtonStyle.Success),
			new ButtonBuilder()
				.setCustomId('edit')
				.setLabel('Edit')
				.setEmoji('1392616309098811503')
				.setStyle(ButtonStyle.Secondary),
			new ButtonBuilder()
				.setCustomId('delete')
				.setLabel('Delete')
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
			.setPlaceholder('Select the Task Group to add to the configuration.'),
	);

	container.addActionRowComponents(row);
}

function addTaskgroupPageButtons(
	container: ContainerBuilder,
	currentPage: number,
	maxPages: number,
) {
	const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
		new ButtonBuilder()
			.setCustomId('prev')
			.setLabel('↩ Show Previous Task Page')
			.setStyle(ButtonStyle.Primary)
			.setDisabled(currentPage == 0),
		new ButtonBuilder()
			.setCustomId('page')
			.setLabel(`Current Page: ${currentPage + 1}/${maxPages}`)
			.setStyle(ButtonStyle.Secondary)
			.setDisabled(true),
		new ButtonBuilder()
			.setCustomId('next')
			.setLabel('Show Next Task Page ↪')
			.setStyle(ButtonStyle.Primary)
			.setDisabled(currentPage + 1 === maxPages),
	);

	container.addActionRowComponents(row);
}
