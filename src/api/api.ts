import { HlnaApi } from './api.gen';

export const api = new HlnaApi({
	baseURL: 'http://localhost:3000',
	// Use a 15 seconds timedout
	timeout: 15_000,
});
