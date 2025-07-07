import { DiscordId, HlnaApi, UserIdentifier } from './api.gen';

export const api = new HlnaApi({
	baseURL: 'http://localhost:3000',
});

api.instance.interceptors.request.use(async (config) => {
	return config;
});
