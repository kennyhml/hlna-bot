import { Taskgroup } from '@/api/api.gen';
import {
	ActionRowBuilder,
	ContainerBuilder,
	MediaGalleryBuilder,
	MediaGalleryItemBuilder,
	Snowflake,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder,
	TextDisplayBuilder,
} from 'discord.js';
import { LogAction } from '@/commands/tribes';
import { InteractionContext } from '@/contextmanager';

const HEADER_URL =
	'https://media.discordapp.net/attachments/1117391295808282729/1395125350136152147/taskmanager_header.png?ex=68794f3b&is=6877fdbb&hm=190ae2196f58e745a4db91afc1b5d63a7a11eb5efe7652627a623264f66cce13&=&format=webp&quality=lossless';

const TASKGROUP_SEP =
	'https://media.discordapp.net/attachments/1117391295808282729/1395126237651009597/taskgroup_sep.png?ex=6879500f&is=6877fe8f&hm=d27501fc183510d025afba8e640589fceba8b53f93e007cbede1af28060c6474&=&format=webp&quality=lossless';

const TASKS_SEP =
	'https://media.discordapp.net/attachments/1117391295808282729/1395126518816047104/tasks_sep.png?ex=68795052&is=6877fed2&hm=7e7906b2e565295ff32557faca6a44f94899a6e07a6d83e2626f5dc13cfa4482&=&format=webp&quality=lossless';

export type TaskmanagerContext = InteractionContext & {
	// Data of all the taskgroups this user has access to, for now this is just going to be
	// taskgroups that the user himself created, with association through config to be setup
	taskgroups: Taskgroup[];
	// What taskgroup is selected (if any)?
	selectedTaskgroup?: number;
	// Page of tasks we are currently on
	currentPage: number;
	// Is there a filter for the tasks list?
	taskFilter?: string;
	// Track the last few action logs
	logs: LogAction[];
};

const TaskmanagerEvents = {
	TaskgroupChanged: 'TaskgroupChanged',
} as const;

export type TaskmanagerEvent =
	(typeof TaskmanagerEvents)[keyof typeof TaskmanagerEvents];

export function buildTaskmanager(ctx: TaskmanagerContext) {
	const container = new ContainerBuilder().setAccentColor(0x00e5fe);

	const selected = ctx.taskgroups.find(
		(group) => group.id === ctx.selectedTaskgroup,
	);

	// TASKGROUPS SEPERATOR
	container.addMediaGalleryComponents(
		new MediaGalleryBuilder().addItems(
			new MediaGalleryItemBuilder().setURL(TASKGROUP_SEP),
		),
	);

	// TASKGROUP SELECTION
	container.addActionRowComponents(
		new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
			new StringSelectMenuBuilder()
				.setCustomId(TaskmanagerEvents.TaskgroupChanged)
				.setDisabled(ctx.taskgroups.length === 0)
				.setPlaceholder('Select one of your taskgroups to display.')
				.setMaxValues(1)
				.setMinValues(1)
				.addOptions(
					ctx.taskgroups.map((group) =>
						// TODO: Add emoji based on type?
						new StringSelectMenuOptionBuilder()
							.setLabel(group.name)
							.setValue(group.name)
							.setDescription(group.description || group.name)
							.setDefault(group.id === selected?.id),
					),
				),
		),
	);

	if (selected) {
		const created = Math.floor(Date.parse(selected.created) / 1000);

		//TODO: Change this so we get the actual owner, not just his ID?
		const owner = selected.owner;

		var content = [
			'### ⤷ Taskgroup Information',
			`> **HLNA Identifier:\t\`#${selected.id}\`**`,
			`> **Current Owner:\t  \`${'-'}\` (${'-'})**`,
			`> **Date of Creation:\t<t:${created}:D>**`,
			`> **Task Count:\t  \`${selected.tasks!.length}\`**\n`,
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

	// addManagementButtons(containerComponent, selectedConfig);
	// if (context.isAddingTask) {
	// 	// addNewMemberSelect(containerComponent);
	// }

	// if (selectedConfig && selectedConfig.taskData.length !== 0) {
	// 	addTaskgroupSection(containerComponent, selectedConfig.taskData || []);
	// 	containerComponent.addSeparatorComponents(new SeparatorBuilder());
	// 	addTaskgroupPageButtons(containerComponent, 0, 5);
	// }

	return [
		new MediaGalleryBuilder().addItems(
			new MediaGalleryItemBuilder().setURL(HEADER_URL),
		),
		container,
	];
}
