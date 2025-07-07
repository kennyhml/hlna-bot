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
import { api } from '../../api/api';
import { UserRole } from '../../api/api.gen';
import { getBotJWT } from '../../api/auth';

const MAX_SUBMISSION_TIME_MS = 60_000;

export const command = new SlashCommandSubcommandBuilder()
	.setName('register')
	.setDescription('Register an account with the HLNA backend services.');

export async function execute(interaction: CommandInteraction) {
	if (!interaction.isChatInputCommand()) return;

	const modal = await buildRegisterModalForUser(interaction.user);
	const filter = (interaction: ModalSubmitInteraction) =>
		interaction.customId === modal.data.custom_id;

	await interaction.showModal(modal);

	interaction
		.awaitModalSubmit({ filter, time: 60_000 })
		.then(async (modalInteraction) => {
			const name = modalInteraction.fields.getTextInputValue('username');
			const password = modalInteraction.fields.getTextInputValue('password');

			await modalInteraction.deferReply({ flags: MessageFlags.Ephemeral });

			try {
				const response = await api.users.createUser(
					{
						name,
						discord_id: interaction.user.id,
						role: UserRole.Member,
						password,
					},
					{
						headers: {
							Authorization: `Bearer ${await getBotJWT()}`,
						},
						timeout: 30_000,
					},
				);
				await modalInteraction.editReply({
					content: 'User created with ID ' + response.data.id,
				});
			} catch (err: any) {
				if (err.status == 403) {
					console.log(err);
					await modalInteraction.editReply({
						content: err.response.data.message,
					});
				}
				console.log(err);
				return;
			}
		})
		.catch(async (err) => {
			if (err.code == 'InteractionCollectorError') {
				await interaction.followUp({
					content: 'The interaction timed out. Please try again.',
					flags: MessageFlags.Ephemeral,
				});
			} else {
				console.log(err);
			}
		});
}

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
		.setValue('qwd83213ma9$$lal')
		.setRequired(true);

	const firstRow = new ActionRowBuilder<TextInputBuilder>().addComponents(
		nameInput,
	);

	const secondRow = new ActionRowBuilder<TextInputBuilder>().addComponents(
		passwordInput,
	);

	registerPopup.addComponents(firstRow, secondRow);
	return registerPopup;
}
