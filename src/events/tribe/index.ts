import { Interaction } from 'discord.js';
import { TribemanagerContext } from '@/commands/tribes';
import { onTribeChanged } from './onTribeChanged';
import { TribemanagerEvent } from '@/components/tribemanager';
import { onMemberAddRequested } from './onMemberAddRequested';
import { onTribeCreateRequested } from './onTribeCreateRequested';
import onNewMemberSelected from './onNewMemberSelected';
import onMemberSelected from './onMemberSelected';

type EventHandler = (interaction: Interaction) => Promise<void>;

export const EVENT_MAP: Record<TribemanagerEvent, EventHandler> = {
	// UserAddRequested: onUserAddRequested,
	TribeChanged: onTribeChanged,
	MemberAddRequested: onMemberAddRequested,
	TribeCreateRequested: onTribeCreateRequested,
	NewMemberSelected: onNewMemberSelected,
	MemberSelected: onMemberSelected,
} as any;
