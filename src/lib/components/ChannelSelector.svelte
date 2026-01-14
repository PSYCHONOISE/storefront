<script lang="ts">
  import { onMount } from 'svelte';
  import { 
    availableChannels, 
    currentChannel, 
    currentChannelInfo,
    channelsLoading,
    loadChannels,
    switchChannel,
    initializeChannel
  } from '@stores/channels';
  import LoadingSpinner from './LoadingSpinner.svelte';

  // Component props
  let { 
    className = '', 
    showCurrency = true,
    variant = 'dropdown' // 'dropdown' | 'tabs'
  }: {
    className?: string;
    showCurrency?: boolean;
    variant?: 'dropdown' | 'tabs';
  } = $props();

  // Local state
  let isOpen = $state(false);

  // Initialize channels on mount
  onMount(async () => {
    initializeChannel();
    await loadChannels();
  });

  // Handle channel selection
  function selectChannel(channelSlug: string) {
    switchChannel(channelSlug);
    isOpen = false;
  }

  // Handle outside click for dropdown
  function handleOutsideClick(event: MouseEvent) {
    const target = event.target as Element;
    if (!target.closest('.channel-selector')) {
      isOpen = false;
    }
  }

  // Format channel display name
  function formatChannelName(channel: any) {
    let name = channel.name;
    if (showCurrency && channel.currencyCode) {
      name += ` (${channel.currencyCode})`;
    }
    return name;
  }
</script>

<svelte:window onclick={handleOutsideClick} />

{#if $channelsLoading}
  <div class="flex items-center space-x-2 {className}">
    <LoadingSpinner size="small" />
    <span class="text-sm text-gray-600">Loading channels...</span>
  </div>
{:else if $availableChannels.length > 1}
  <div class="channel-selector {className}">
    {#if variant === 'dropdown'}
      <!-- Dropdown variant -->
      <div class="relative">
        <button
          type="button"
          onclick={() => isOpen = !isOpen}
          class="flex items-center justify-between rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          <span class="flex items-center">
            {#if $currentChannelInfo}
              <span>{formatChannelName($currentChannelInfo)}</span>
            {:else}
              <span>Select Channel</span>
            {/if}
          </span>
          <svg class="ml-2 h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>

        {#if isOpen}
          <div class="absolute right-0 z-50 mt-1 w-64 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div class="py-1" role="menu" aria-orientation="vertical">
              {#each $availableChannels as channel}
                <button
                  type="button"
                  onclick={() => selectChannel(channel.slug)}
                  class="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 {$currentChannel === channel.slug ? 'bg-blue-50 text-blue-700' : ''}"
                  role="menuitem"
                >
                  <div class="flex-1 text-left">
                    <div class="font-medium">{channel.name}</div>
                    {#if showCurrency}
                      <div class="text-xs text-gray-500">{channel.currencyCode}</div>
                    {/if}
                  </div>
                  {#if $currentChannel === channel.slug}
                    <svg class="h-4 w-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                  {/if}
                </button>
              {/each}
            </div>
          </div>
        {/if}
      </div>
    {:else}
      <!-- Tabs variant -->
      <div class="border-b border-gray-200">
        <nav class="-mb-px flex space-x-8" aria-label="Channels">
          {#each $availableChannels as channel}
            <button
              type="button"
              onclick={() => selectChannel(channel.slug)}
              class="whitespace-nowrap border-b-2 py-2 px-1 text-sm font-medium {$currentChannel === channel.slug 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}"
              aria-current={$currentChannel === channel.slug ? 'page' : undefined}
            >
              {formatChannelName(channel)}
            </button>
          {/each}
        </nav>
      </div>
    {/if}
  </div>
{/if}
