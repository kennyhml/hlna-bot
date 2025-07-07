import {
	SlashCommandBuilder,
	CommandInteraction,
	MessageFlags,
	ChatInputCommandInteraction,
} from 'discord.js';
import { api } from '../api/api';
import { getBotJWT } from '../api/auth';

// Initialize the API client

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
	const userData = await api.users.getUsers(
		{
			discord_id: interaction.user.id,
		},
		{
			headers: {
				Authorization: `Bearer ${await getBotJWT()}`,
			},
		},
	);

	if (!userData.data.length) {
		await interaction.editReply({ content: 'You dont exist g' });
	} else {
		await interaction.editReply({ content: userData.data[0].name });
	}
}

async function createUser(interaction: ChatInputCommandInteraction) {}

async function showUserProfile(interaction: ChatInputCommandInteraction) {}
