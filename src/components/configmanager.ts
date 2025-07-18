import { Configuration, Taskgroup, Tribe } from '@/api/api.gen';
import { LogAction } from '@/commands/tribes';
import { InteractionContext } from '@/contextmanager';
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
	userMention,
	Snowflake,
} from 'discord.js';

const HEADER =
	'https://media.discordapp.net/attachments/1392553548390338591/1393602837321093140/configmanager_header.png?ex=6873c548&is=687273c8&hm=7743e576355315c494b9dee39a65da0c06d110cc082433999992903d69614c41&=&format=webp&quality=lossless';

const TASK_GROUP_SEP =
	'https://media.discordapp.net/attachments/1392553548390338591/1393602952052211753/task_group_separator.png?ex=6873c563&is=687273e3&hm=025f15f3ab59b96ab8d3c4664cb94245ad07ea1f358cca4c1351ba0e0f439f36&=&format=webp&quality=lossless';

const CONFIG_SEP =
	'https://media.discordapp.net/attachments/1392553548390338591/1393602952312262666/config_separator.png?ex=6873c563&is=687273e3&hm=f1e6151d6da93d4089f290367390aab81aaa90ab252daf8b6e83324fc6ae6b83&=&format=webp&quality=lossless';

export type ConfigmanagerContext = InteractionContext & {
	configs: Configuration[];

	selectedConfig?: number;
	isAddingTask?: boolean;
	groupFilter?: string;

	currentPage: 0;
	logs: LogAction[];
};

const ConfigurationEvents = {
	ConfigurationChanged: 'ConfigurationChanged',
} as const;

export type TaskmanagerEvent =
	(typeof ConfigurationEvents)[keyof typeof ConfigurationEvents];

export function buildConfigmanager(ctx: ConfigmanagerContext) {
	const container = new ContainerBuilder().setAccentColor(0x00e5fe);

	const selected = ctx.configs.find((cfg) => cfg.id === ctx.selectedConfig);

	// CONFIG SEPERATOR
	container.addMediaGalleryComponents(
		new MediaGalleryBuilder().addItems(
			new MediaGalleryItemBuilder().setURL(CONFIG_SEP),
		),
	);

	// CONFIG SELECTION
	container.addActionRowComponents(
		new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
			new StringSelectMenuBuilder()
				.setCustomId(ConfigurationEvents.ConfigurationChanged)
				.setDisabled(ctx.configs.length === 0)
				.setPlaceholder('Select one of your taskgroups to display.')
				.setMaxValues(1)
				.setMinValues(1)
				.addOptions(
					ctx.configs.map((cfg) =>
						new StringSelectMenuOptionBuilder()
							.setLabel(cfg.name)
							.setValue(cfg.name)
							.setDescription(cfg.description || cfg.name)
							.setDefault(cfg.id === selected?.id),
					),
				),
		),
	);

	if (selected) {
		const created = Math.floor(Date.parse(selected.created) / 1000);

		const owner = selected.owner;

		var content = [
			'### ⤷ Taskgroup Information',
			`> **HLNA Identifier:\t\`#${selected.id}\`**`,
			`> **Created by:\t  \`${owner.id}\` (${userMention(owner.discord_id)})**`,
			`> **Date of Creation:\t<t:${created}:D>**`,
			`> **Taskgroups:\t  \`${selected.taskgroups.length}\`**\n`,
		].join('\n');

		if (ctx.logs.length !== 0) {
			content +=
				'### ⤷ Action Logs\n' +
				ctx.logs
					.map((log) => `> -# **${log.time}: ${log.message}**`)
					.join('\n');
		}
		container.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(content),
		);
	}

	// TASKGROUPS SEPARATOR
	container.addMediaGalleryComponents(
		new MediaGalleryBuilder().addItems(
			new MediaGalleryItemBuilder().setURL(TASK_GROUP_SEP),
		),
	);

	selected?.taskgroups.forEach((task) =>
		container.addSectionComponents(buildTaskgroupRow(task)),
	);

	return [
		new MediaGalleryBuilder().addItems(
			new MediaGalleryItemBuilder().setURL(HEADER),
		),
		container,
	];
}

function buildTaskgroupRow(taskgroup: Taskgroup) {
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
