import { User } from '@notification-system/shared-db';
import { NotificationChannel } from '@notification-system/shared-types';

export interface ResolvedChannels {
  channels: NotificationChannel[];
  digestMode: boolean;
}

export async function resolveChannels(
  userId: string,
  requestedChannels: NotificationChannel[]
): Promise<ResolvedChannels> {
  const user = await User.findOne({ userId });
  
  if (!user) {
    // Default: allow all requested channels
    return { channels: requestedChannels, digestMode: false };
  }

  const enabledPrefs = user.preferences.filter(p => p.enabled);
  const allowedChannels = enabledPrefs.map(p => p.channel);
  
  // Intersection: requested channels ∩ user-enabled channels
  const finalChannels = requestedChannels.filter(ch => 
    allowedChannels.includes(ch)
  );

  const hasDigest = enabledPrefs.some(p => p.digestMode);

  return {
    channels: finalChannels,
    digestMode: hasDigest
  };
}