import { writable, derived } from 'svelte/store';
import { ChannelsListDocument } from '@gql/graphql';
import { executeGraphQL } from '@lib/graphql';

export interface Channel {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  currencyCode: string;
  countries: Array<{
    country: string;
    code: string;
  }>;
}

// Current selected channel (defaults to 'default-channel')
export const currentChannel = writable<string>('default-channel');

// Available channels list
export const availableChannels = writable<Channel[]>([]);

// Loading state for channels
export const channelsLoading = writable<boolean>(false);

// Derived store for current channel info
export const currentChannelInfo = derived(
  [currentChannel, availableChannels],
  ([$currentChannel, $availableChannels]) => {
    return $availableChannels.find(channel => channel.slug === $currentChannel) || null;
  }
);

// Function to load available channels
export async function loadChannels() {
  channelsLoading.set(true);
  try {
    const data = await executeGraphQL(ChannelsListDocument, {});
    const channels = data.channels || [];
    
    // Filter only active channels
    const activeChannels = channels.filter(channel => channel.isActive);
    
    availableChannels.set(activeChannels);
    
    // If current channel is not in the list, switch to first available
    const current = currentChannel;
    const currentValue = await new Promise(resolve => {
      const unsubscribe = current.subscribe(value => {
        resolve(value);
        unsubscribe();
      });
    }) as string;
    
    if (activeChannels.length > 0 && !activeChannels.find(ch => ch.slug === currentValue)) {
      currentChannel.set(activeChannels[0].slug);
    }
    
    return activeChannels;
  } catch (error) {
    console.error('Failed to load channels:', error);
    // Fallback to default channels
    const fallbackChannels: Channel[] = [
      {
        id: 'default',
        name: 'Main Store',
        slug: 'default-channel',
        isActive: true,
        currencyCode: 'USD',
        countries: [{ country: 'United States', code: 'US' }]
      }
    ];
    availableChannels.set(fallbackChannels);
    return fallbackChannels;
  } finally {
    channelsLoading.set(false);
  }
}

// Function to switch channel
export function switchChannel(channelSlug: string) {
  currentChannel.set(channelSlug);
  // Store in localStorage for persistence
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('selectedChannel', channelSlug);
  }
}

// Function to initialize channel from localStorage
export function initializeChannel() {
  if (typeof localStorage !== 'undefined') {
    const stored = localStorage.getItem('selectedChannel');
    if (stored) {
      currentChannel.set(stored);
    }
  }
}
