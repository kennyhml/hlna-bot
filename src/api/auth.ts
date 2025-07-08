import fs from 'fs/promises';
import { config } from '../config';
import { api } from './api';
import { DiscordId, JWTData } from './api.gen';

interface CachedTokenData {
	access: string;
	refresh: string;
	expires: number;
}

var botToken: CachedTokenData | undefined;

async function checkForCachedToken(
	discord_id: DiscordId,
): Promise<CachedTokenData | undefined> {
	var data;
	try {
		data = await fs.readFile('tokencache.json', 'utf-8');
	} catch (err) {
		console.log('Failed to check for cached tokens: ', err);
		return;
	}

	const json = JSON.parse(data) as { [key: string]: CachedTokenData };
	return json[discord_id];
}

async function dumpToken(discord_id: DiscordId, token: CachedTokenData) {
	var data = '{}';
	try {
		data = await fs.readFile('tokencache.json', 'utf-8');
	} catch (err) {}
	var json = JSON.parse(data) as { [key: string]: CachedTokenData };

	json[discord_id] = token;
	await fs.writeFile('tokencache.json', JSON.stringify(json, null, 4), {
		encoding: 'utf-8',
	});
}

/**
 * Gets a proxy JWT for the specified user by their discord ID. In other words,
 * this token allows us to 'impersonate' being the user of the discord ID in order
 * to relay the commands they invoked to the server as if they made a request.
 *
 * The 'proxy' scope is required for this endpoint, which is a special scope the
 * bots personal JWT possesses.
 *
 * Before reaching out to the endpoint, local cache is checked for access / refresh
 * tokens that may still be valid to reduce load on the api.
 *
 * @param user The user, identified through the discord id, to obtain a proxy token for.
 */
export async function getProxyJWT(user: DiscordId): Promise<string> {
	// TODO: Check if we have a chached (refresh) token for this user already.
	// If there is no token, use the proxy login to obtain one and cache it.

	const now = Math.floor(Date.now() / 1000);

	let cached = await checkForCachedToken(user);
	if (cached) {
		const timeDeltaHours = (cached.expires - now) / 3600;
		console.log(`Time left on ${user} token: ${timeDeltaHours.toFixed()}h`);
		// Refresh the token if less than 1 day is left on it
		if (timeDeltaHours < 24) {
			// TODO: refresh token(), write new data to cache
			// cached.access = '';
			// cached.expires = 0;
		}
		return cached.access;
	}

	console.log(`No cached token found for ${user}, doing proxy auth..`);
	let response = await api.proxyLogin.proxyLogin(
		{ discord_id: user },
		{
			headers: {
				Authorization: `Bearer ${await getBotJWT()}`,
			},
		},
	);
	if (response.status == 401) {
		throw Error(response.data as any);
	}

	const tokenData: JWTData = response.data;
	dumpToken(user, {
		access: tokenData.access_token,
		refresh: tokenData.refresh_token,
		expires: now + tokenData.expires_in,
	});

	return tokenData.access_token;
}

/**
 * Gets a JWT for the bot user with elevated permission / scope. This allows it to
 * perform actions like creating a new user or obtaining a proxy token.
 */
export async function getBotJWT(): Promise<string> {
	if (botToken) {
		return botToken.access;
	}

	let response = await api.login.login({
		user: { username: config.BOT_USER },
		password: config.BOT_PASSWORD,
	});
	if (response.status == 401) {
		throw Error(response.data as any);
	}

	const tokenData: JWTData = response.data;

	botToken = {
		access: tokenData.access_token,
		refresh: '',
		expires: 0,
	};

	// This seems dangerous, I would rather explicitly set the bots authorization
	// where needed. Otherwise I might end up forgetting to set the user jwt somewhere
	// and give the user alot more power than they should have..
	// api.instance.defaults.headers.common['Authorization'] = `Bearer ${'123'}`;

	return tokenData.access_token;
}

export async function getProxyBearerJWT(user: DiscordId): Promise<string> {
	return `Bearer ${await getProxyJWT(user)}`;
}

export async function getBotBearerJWT(): Promise<string> {
	return `Bearer ${await getBotJWT()}`;
}
