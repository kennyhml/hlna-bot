import {
	ActionRowBuilder,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
	User,
} from 'discord.js';

export function buildTribeCreateModal(user: User): ModalBuilder {
	const modal = new ModalBuilder()
		.setCustomId(`create-tribe-${user.id}`)
		.setTitle('Create a new Tribe');

	const nameInput = new TextInputBuilder()
		.setCustomId('tribename')
		.setLabel('Tribe Name')
		.setStyle(TextInputStyle.Short)
		.setMinLength(6)
		.setMaxLength(32)
		.setRequired(true);

	modal.addComponents(
		new ActionRowBuilder<TextInputBuilder>().addComponents(nameInput),
	);
	return modal;
}
