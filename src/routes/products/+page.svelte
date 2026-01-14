<script lang="ts">
	import type { PageData } from "./$types";
	import ProductList from "@components/ProductList.svelte";
	import LoadingSpinner from "@components/LoadingSpinner.svelte";
	import ChannelSelector from "@components/ChannelSelector.svelte";
	import { onMount, onDestroy } from "svelte";
	import { 
		initializeProducts, 
		loadMoreProducts, 
		handleScroll, 
		resetProducts,
		products,
		hasMoreProducts,
		isLoadingMore,
		productsError
	} from "@stores/products";
	import { currentChannel, availableChannels } from "@stores/channels";
	import { createScrollObserver, throttle } from "@lib/utils/intersection-observer";
	import { goto } from "$app/navigation";

	let { data }: { data: PageData } = $props();
	let containerElement: HTMLElement;
	let scrollObserver: ReturnType<typeof createScrollObserver> | null = null;
	
	// Initialize products store with server-side data
	onMount(() => {
		if (data.products && data.products.length > 0) {
			initializeProducts(data.products, data.pageInfo);
		}
		
		// Set up scroll observer for intelligent prefetching
		const throttledScrollHandler = throttle(handleScroll, 300);
		
		scrollObserver = createScrollObserver(throttledScrollHandler, 0.8);
		
		// Observe the container for scroll-based prefetching
		if (containerElement) {
			scrollObserver.observe(containerElement);
		}
		
		return () => {
			if (scrollObserver) {
				scrollObserver.disconnect();
			}
		};
	});
	
	// Handle channel changes - reload the page with new channel
	$effect(() => {
		if ($currentChannel && $currentChannel !== (data.channel || 'default-channel')) {
			// Reload the page with the new channel
			goto(`/products?channel=${$currentChannel}`, { replaceState: false });
		}
	});
	
	onDestroy(() => {
		resetProducts();
	});
	
	async function handleLoadMore() {
		await loadMoreProducts();
	}
</script>

<svelte:head>
	<title>All Products | Saleor Storefront</title>
	<meta name="description" content="Browse all products in our store." />
</svelte:head>

<div class="mx-auto max-w-7xl px-4 py-8" bind:this={containerElement}>
	<div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<div>
			<h1 class="text-3xl font-bold">All Products</h1>
			{#if $availableChannels.length > 1}
				<p class="mt-2 text-sm text-gray-600">
					Showing products from: 
					<span class="font-medium">
						{$availableChannels.find(ch => ch.slug === $currentChannel)?.name || $currentChannel}
					</span>
				</p>
			{/if}
		</div>
		{#if $availableChannels.length > 1}
			<ChannelSelector variant="dropdown" className="sm:w-auto" />
		{/if}
	</div>

	{#if data.error}
		<div class="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
			<h2 class="font-semibold text-red-800">API Error</h2>
			<p class="mt-1 text-red-600">{data.error}</p>
			<a href="/debug" class="mt-2 inline-block text-red-700 underline">Check API Debug Page</a>
		</div>
	{:else if $productsError}
		<div class="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
			<h2 class="font-semibold text-red-800">Loading Error</h2>
			<p class="mt-1 text-red-600">{$productsError}</p>
			<button 
				class="mt-2 inline-block rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
				onclick={handleLoadMore}
			>
				Try Again
			</button>
		</div>
	{:else if $products && $products.length > 0}
		<ProductList products={$products} />
		
		<!-- Loading more indicator -->
		{#if $isLoadingMore}
			<div class="mt-8 flex justify-center">
				<LoadingSpinner />
				<span class="ml-3 text-gray-600">Loading more products...</span>
			</div>
		{/if}
		
		<!-- Load More button -->
		{#if $hasMoreProducts && !$isLoadingMore}
			<div class="mt-8 text-center">
				<button
					class="rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
					onclick={handleLoadMore}
					disabled={$isLoadingMore}
					data-testid="load-more-button"
				>
					Load More
				</button>
			</div>
		{/if}
		
		<!-- End of results indicator -->
		{#if !$hasMoreProducts && !$isLoadingMore && $products.length > 0}
			<div class="mt-8 text-center text-gray-500">
				<p>You've reached the end of our product catalog!</p>
				<p class="mt-1 text-sm">Total products loaded: {$products.length}</p>
			</div>
		{/if}
	{:else if data.products && data.products.length === 0}
		<div class="py-12 text-center">
			<p class="mb-4 text-gray-600">No products found.</p>
			<a href="/debug" class="text-blue-600 underline">Check API Configuration</a>
		</div>
	{/if}
</div>