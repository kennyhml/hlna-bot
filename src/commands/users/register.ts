import {
	ActionRowBuilder,
	CommandInteraction,
	ModalBuilder,
	SlashCommandSubcommandBuilder,
	TextInputBuilder,
	TextInputStyle,
} from 'discord.js';

const registerPopup = new ModalBuilder()
	.setCustomId('userRegisterModal')
	.setTitle('Create your HLNA Account');

const nameInput = new TextInputBuilder()
	.setCustomId('userRegisterModalName')
	.setLabel('Username')
	.setStyle(TextInputStyle.Short)
	.setMinLength(3)
	.setMaxLength(32)
	.setRequired(true);

const passwordInput = new TextInputBuilder()
	.setCustomId('userRegisterModalPw')
	.setLabel('Password')
	.setStyle(TextInputStyle.Short)
	.setMinLength(8)
	.setMaxLength(20)
	.setRequired(true);

const firstRow = new ActionRowBuilder<TextInputBuilder>().addComponents(
	nameInput,
);

const secondRow = new ActionRowBuilder<TextInputBuilder>().addComponents(
	passwordInput,
);

registerPopup.addComponents(firstRow, secondRow);

export const command = new SlashCommandSubcommandBuilder()
	.setName('register')
	.setDescription('Register an account with the HLNA backend services.');

export async function execute(interaction: CommandInteraction) {
	if (!interaction.isChatInputCommand()) return;

	interaction.showModal(registerPopup);
}
