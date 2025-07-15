import { Interaction } from 'discord.js';
import { onUserAddRequested } from './onUserAddRequested';
import { TribemanagerContext } from '@/commands/tribes';
import { onTribeChanged } from './onTribeChanged';
import { TribemanagerEvent } from '@/components/tribemanager';
import { onMemberAddRequested } from './onMemberAddRequested';
import { onTribeCreateRequested } from './onTribeCreateRequested';

type EventHandler = (interaction: Interaction) => Promise<void>;

export const EVENT_MAP: Record<TribemanagerEvent, EventHandler> = {
	// UserAddRequested: onUserAddRequested,
	TribeChanged: onTribeChanged,
	MemberAddRequested: onMemberAddRequested,
	TribeCreateRequested: onTribeCreateRequested,
} as any;
