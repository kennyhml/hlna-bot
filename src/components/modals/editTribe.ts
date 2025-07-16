import { Tribe } from '@/api/api.gen';
import {
	ActionRowBuilder,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
	User,
} from 'discord.js';

export function buildEditTribeModal(user: User, tribe: Tribe): ModalBuilder {
	const modal = new ModalBuilder()
		.setCustomId(`edit-tribe-${user.id}`)
		.setTitle(`Modify '${tribe.name}'`);

	const nameInput = new TextInputBuilder()
		.setCustomId('tribename')
		.setLabel('Change Name')
		.setStyle(TextInputStyle.Short)
		.setMinLength(6)
		.setMaxLength(32)
		.setRequired(false);

	const description = new TextInputBuilder()
		.setCustomId('description')
		.setLabel('Change Description')
		.setStyle(TextInputStyle.Paragraph)
		.setMinLength(10)
		.setMaxLength(200)
		.setRequired(false);

	modal.addComponents(
		new ActionRowBuilder<TextInputBuilder>().addComponents(nameInput),
		new ActionRowBuilder<TextInputBuilder>().addComponents(description),
	);
	return modal;
}
