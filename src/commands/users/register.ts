import {
	ActionRowBuilder,
	CommandInteraction,
	MessageFlags,
	ModalBuilder,
	ModalSubmitInteraction,
	SlashCommandSubcommandBuilder,
	TextInputBuilder,
	TextInputStyle,
	User,
} from 'discord.js';
import generator from 'generate-password-ts';

import { api } from '@/api/api';
import { ErrorMessage, UserRole } from '@/api/api.gen';
import { getBotBearerJWT } from '@/api/auth';

// Timeout until the Modal Interaction expires
const MAX_SUBMISSION_TIME_MS = 60_000;

// Config to generate the autofilled user password
const PASSWORD_GENERATION_CONFIG = {
	length: 20,
	numbers: true,
	symbols: true,
};

export const command = new SlashCommandSubcommandBuilder()
	.setName('register')
	.setDescription('Register an account with the HLNA backend services.');

export async function execute(interaction: CommandInteraction) {
	if (!interaction.isChatInputCommand()) return;

	const modal = await buildRegisterModalForUser(interaction.user);

	await interaction.showModal(modal);

	// Create a filter for modal submissions that will identify this one.
	const filter = (interaction: ModalSubmitInteraction) =>
		interaction.customId === modal.data.custom_id;

	interaction
		.awaitModalSubmit({ filter, time: MAX_SUBMISSION_TIME_MS })
		.then(onSubmit)
		.catch(async (err) => {
			if (err.code == 'InteractionCollectorError') {
				await interaction.followUp({
					content: 'The interaction timed out. Please try again.',
					flags: MessageFlags.Ephemeral,
				});
			}
		});
}

/**
 * Handles the modal being submitted by the user by making the server request.
 *
 * As the request may take some time, the reply is always deferred initally.
 *
 * If the submitted data and server response is valid, a user is created.
 *
 * @param interaction The interaction of the Modal being submitted.
 */
async function onSubmit(interaction: ModalSubmitInteraction) {
	await interaction.deferReply({ flags: MessageFlags.Ephemeral });

	const name = interaction.fields.getTextInputValue('username');
	const password = interaction.fields.getTextInputValue('password');

	const payload = {
		name,
		discord_id: interaction.user.id,
		role: UserRole.Member,
		password,
	};

	api.users
		.createUser(payload, {
			headers: { Authorization: await getBotBearerJWT() },
		})
		.then(async (response) => {
			await interaction.editReply({
				content: '[200 OK]:' + response.data,
			});
		})
		.catch(async (err) => {
			// Username is taken or user is already registered
			if (err.status === 403) {
				return await interaction.editReply({
					content: (err.response.data as ErrorMessage).message,
				});
			}
			throw err;
		});
}

/**
 *
 * Builds a Modal that asks the user to enter a username and password.
 *
 * @note The username is prefilled with the users unique discord name.
 * @note password is prefilled with one that is automatically generated.
 *
 * @param user The discord user to build the modal for.
 *
 * @returns The ModalBuilder to respond with.
 */
async function buildRegisterModalForUser(user: User): Promise<ModalBuilder> {
	const registerPopup = new ModalBuilder()
		.setCustomId(`user-register-${user.id}`)
		.setTitle('Create your HLNA Account');

	const nameInput = new TextInputBuilder()
		.setCustomId('username')
		.setLabel('Username')
		.setStyle(TextInputStyle.Short)
		.setMinLength(3)
		.setMaxLength(32)
		.setValue(user.username)
		.setRequired(true);

	const passwordInput = new TextInputBuilder()
		.setCustomId('password')
		.setLabel('Password')
		.setStyle(TextInputStyle.Short)
		.setMinLength(8)
		.setMaxLength(20)
		.setValue(generator.generate(PASSWORD_GENERATION_CONFIG))
		.setRequired(true);

	registerPopup.addComponents(
		new ActionRowBuilder<TextInputBuilder>().addComponents(nameInput),
		new ActionRowBuilder<TextInputBuilder>().addComponents(passwordInput),
	);
	return registerPopup;
}
