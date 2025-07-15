import { Interaction } from 'discord.js';
import { TribemanagerContext } from '@/commands/tribes';
import { onTribeChanged } from './onTribeChanged';
import { TribemanagerEvent } from '@/components/tribemanager';
import { onMemberAddRequested } from './onMemberAddRequested';
import { onTribeCreateRequested } from './onTribeCreateRequested';
import onNewMemberSelected from './onNewMemberSelected';

type EventHandler = (interaction: Interaction) => Promise<void>;

export const EVENT_MAP: Record<TribemanagerEvent, EventHandler> = {
	// UserAddRequested: onUserAddRequested,
	TribeChanged: onTribeChanged,
	MemberAddRequested: onMemberAddRequested,
	TribeCreateRequested: onTribeCreateRequested,
	NewMemberSelected: onNewMemberSelected,
} as any;
