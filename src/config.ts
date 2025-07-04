import dotenv from "dotenv"

dotenv.config();

const { DISCORD_TOKEN, APPLICATION_ID } = process.env;

if (!DISCORD_TOKEN || !APPLICATION_ID) {
    throw new Error("Missing discord token.")
}

export const config = {
    DISCORD_TOKEN,
    APPLICATION_ID
}