import {
	SlashCommandBuilder,
	CommandInteraction,
	MessageFlags,
	ChatInputCommandInteraction,
} from 'discord.js';
import { api } from '../api/api';
import { getBotJWT, getProxyJWT } from '../api/auth';

export const data = new SlashCommandBuilder()
	.setName('users')
	.setDescription('User related commands')
	.addSubcommand((subcommand) =>
		subcommand
			.setName('me')
			.setDescription('Display your own user profile, must be registered.'),
	)
	.addSubcommand((subcommand) =>
		subcommand
			.setName('profile')
			.setDescription('Display the profile of a given user.'),
	)
	.addSubcommand((subcommand) =>
		subcommand
			.setName('register')
			.setDescription('Register an account with the HLNA backend services.')
			.addStringOption((option) =>
				option
					.setName('password')
					.setDescription('Password used for logging in and authenticating.')
					.setRequired(true),
			),
	);

export async function execute(interaction: CommandInteraction) {
	if (!interaction.isChatInputCommand()) return;

	await interaction.deferReply({ flags: MessageFlags.Ephemeral });

	switch (interaction.options.getSubcommand()) {
		case 'me':
			return showMyProfile(interaction);
		case 'register':
			return createUser(interaction);
		case 'profile':
			return showUserProfile(interaction);
	}
}

async function showMyProfile(interaction: ChatInputCommandInteraction) {
	const response = await api.users.getCurrentUser({
		headers: {
			Authorization: `Bearer ${await getProxyJWT(interaction.user.id)}`,
		},
	});

	if (response.status == 401) {
		interaction.editReply({ content: 'Unauthorized.' });
	} else {
		await interaction.editReply({ content: 'Hello ' + response.data.name });
	}
}

async function createUser(interaction: ChatInputCommandInteraction) {}

async function showUserProfile(interaction: ChatInputCommandInteraction) {}
