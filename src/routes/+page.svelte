<script lang="ts">
	import { onMount } from "svelte";
	import type { PageData } from "./$types";
	import ProductList from "@components/ProductList.svelte";
	import ChannelSelector from "@components/ChannelSelector.svelte";
	import LoadingSpinner from "@components/LoadingSpinner.svelte";
	import { currentChannel, availableChannels, channelsLoading } from "@stores/channels";
	import { executeGraphQL } from "@lib/graphql";
	import { ProductListPaginatedDocument } from "@gql/graphql";

	// Use regular query for now - enhanced queries will be imported dynamically when needed
	let ProductListEnhancedDocument = ProductListPaginatedDocument;

	let { data }: { data: PageData } = $props();

	// State for channel-specific products
	let channelProducts: Record<string, any[]> = $state({});
	let loadingProducts = $state(false);

	// Load products when channel changes
	async function loadProductsForChannel(channelSlug: string) {
		if (channelProducts[channelSlug]) {
			return; // Already loaded
		}

		loadingProducts = true;
		try {
			// Try to import enhanced query for channels that might have variants
			let queryToUse = ProductListPaginatedDocument;

			if (channelSlug.includes("1") || channelSlug.toLowerCase().includes("channel-1")) {
				try {
					// Dynamically import enhanced query
					const { ProductListEnhancedDocument: enhancedQuery } = await import("@gql/graphql");
					queryToUse = enhancedQuery || ProductListPaginatedDocument;
				} catch (importError) {
					console.warn("Enhanced GraphQL queries not available, using regular query");
				}
			}

			const result = await executeGraphQL(queryToUse, {
				variables: {
					first: 12,
					channel: channelSlug,
				},
			});

			if (result.products?.edges?.length) {
				const products = result.products.edges.map(({ node }: any) => node);
				channelProducts[channelSlug] = products;
			} else {
				channelProducts[channelSlug] = [];
			}
		} catch (error) {
			console.error(`Failed to load products for channel ${channelSlug}:`, error);
			channelProducts[channelSlug] = [];
		} finally {
			loadingProducts = false;
		}
	}

	// React to channel changes
	$effect(() => {
		if ($currentChannel && $availableChannels.length > 0) {
			loadProductsForChannel($currentChannel);
		}
	});

	// Load initial products for all channels on mount
	onMount(async () => {
		// Wait a bit for channels to load
		setTimeout(async () => {
			for (const channel of $availableChannels) {
				await loadProductsForChannel(channel.slug);
			}
		}, 1000);
	});
</script>

<svelte:head>
	<title>ACME Storefront, powered by Saleor & SvelteKit</title>
	<meta
		name="description"
		content="Storefront SvelteKit Example for building performant e-commerce experiences with Saleor - the composable, headless commerce platform for global brands."
	/>
</svelte:head>

<div class="mx-auto max-w-7xl px-4 py-12">
	<!-- Hero Section -->
	<div class="mb-16 text-center">
		<h1 class="mb-4 text-4xl font-bold text-gray-900">Welcome to Saleor Storefront</h1>
		<p class="mb-8 text-xl text-gray-600">Powered by SvelteKit - A modern e-commerce experience</p>
		<a href="/products" class="inline-block rounded-lg bg-blue-600 px-8 py-3 text-white hover:bg-blue-700">
			Shop Now
		</a>
	</div>

	<!-- Channel Selector and Products Section -->
	<section class="mb-16">
		<div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
			<h2 class="text-2xl font-bold text-gray-900">Products by Channel</h2>
			<ChannelSelector variant="dropdown" className="sm:w-auto" />
		</div>

		<!-- Channel Tabs -->
		{#if $availableChannels.length > 1}
			<div class="mb-8">
				<ChannelSelector variant="tabs" showCurrency={false} />
			</div>
		{/if}

		<!-- Products for Current Channel -->
		{#if $channelsLoading}
			<div class="flex items-center justify-center py-12">
				<LoadingSpinner />
				<span class="ml-3 text-gray-600">Loading channels...</span>
			</div>
		{:else if loadingProducts}
			<div class="flex items-center justify-center py-12">
				<LoadingSpinner />
				<span class="ml-3 text-gray-600">Loading products...</span>
			</div>
		{:else if $currentChannel && channelProducts[$currentChannel]}
			{#if channelProducts[$currentChannel].length > 0}
				<ProductList
					products={channelProducts[$currentChannel]}
					showVariants={$currentChannel.includes("1") || $currentChannel.toLowerCase().includes("channel-1")}
					showAttributes={$currentChannel.includes("1") ||
						$currentChannel.toLowerCase().includes("channel-1")}
				/>
			{:else}
				<div class="py-12 text-center">
					<p class="mb-2 text-gray-600">No products available in this channel.</p>
					<p class="text-sm text-gray-500">Try switching to another channel or check back later.</p>
				</div>
			{/if}
		{:else if data.products}
			<!-- Fallback to initial data if channel data not loaded -->
			<div class="mb-4">
				<h3 class="text-lg font-medium text-gray-900">Featured Products</h3>
				<p class="text-sm text-gray-600">Default channel products</p>
			</div>
			<ProductList products={data.products} />
		{:else}
			<p class="py-12 text-center text-gray-600">No products available.</p>
		{/if}
	</section>
</div>
