import {
	Interaction,
	InteractionContextType,
	Snowflake,
	SnowflakeUtil,
} from 'discord.js';
import fs from 'fs/promises';

export type InteractionContext = {
	interactionKind: string;
	discordUserId: Snowflake;
};

type CacheType = Record<string, Record<string, InteractionContext>>;

const INTERACTION_CACHE = 'interactionCache.json';

export async function dumpInteractionContext(
	data: InteractionContext,
): Promise<void> {
	let cache: CacheType = {};

	try {
		const raw = await fs.readFile(INTERACTION_CACHE, { encoding: 'utf-8' });
		cache = JSON.parse(raw) as CacheType;
	} catch (err) {
		console.warn(`Failed to read ${INTERACTION_CACHE}:`, err);
	}

	try {
		if (!cache[data.discordUserId]) {
			cache[data.discordUserId] = {};
		}
		cache[data.discordUserId][data.interactionKind] = data;
		await fs.writeFile(INTERACTION_CACHE, JSON.stringify(cache, null, 2), {
			encoding: 'utf-8',
		});
	} catch (err) {
		throw new Error(
			`Failed to write to ${INTERACTION_CACHE}: ${
				err instanceof Error ? err.message : String(err)
			}`,
		);
	}
}

export async function loadInteractionContext(
	discordUserId: Snowflake,
	type: string,
	params?: {
		expected?: true;
	},
): Promise<InteractionContext>;

export async function loadInteractionContext(
	discordUserId: Snowflake,
	type: string,
	params?: {
		expected?: boolean;
	},
): Promise<InteractionContext | undefined> {
	try {
		const raw = await fs.readFile(INTERACTION_CACHE, { encoding: 'utf-8' });
		const cache = JSON.parse(raw) as CacheType;
		const res = cache[discordUserId]?.[type];
		if (params?.expected && !res) {
			throw Error(
				`No interaction context found for ${discordUserId} (Type ${type})`,
			);
		}
		return res;
	} catch (err) {
		console.warn(`Failed to read ${INTERACTION_CACHE}:`, err);
	}
}
