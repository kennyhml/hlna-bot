import dotenv from 'dotenv';

dotenv.config();

const { DISCORD_TOKEN, APPLICATION_ID, HLNA_API_URL, BOT_USER, BOT_PASSWORD } =
	process.env;

if (!DISCORD_TOKEN || !APPLICATION_ID) {
	throw new Error('Missing discord token.');
}

if (!HLNA_API_URL || !BOT_USER || !BOT_PASSWORD) {
	throw new Error('Missing HLNA_API_URL');
}

export const config = {
	DISCORD_TOKEN,
	APPLICATION_ID,
	HLNA_API_URL,
	BOT_USER,
	BOT_PASSWORD,
};
