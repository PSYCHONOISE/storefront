<script lang="ts">
	import type { PageData } from "./$types";
	import AddToCartButton from "@components/AddToCartButton.svelte";
	import VariantSelector from "@components/VariantSelector.svelte";
	import ProductAttributes from "@components/ProductAttributes.svelte";
	import { formatMoneyRange } from "@lib/utils";
	import { page } from "$app/stores";
	import { currentChannel } from "@stores/channels";

	let { data }: { data: PageData } = $props();

	const { product } = data;

	// Check if this is an enhanced product (with full variant/attribute data)
	const isEnhanced = $derived(
		product &&
			((product.variants?.length > 0 && product.variants[0].attributes) ||
				product.attributes?.length > 0 ||
				product.metadata?.length > 0),
	);

	// Get selected variant from URL params
	let selectedVariantId = $state($page.url.searchParams.get("variant") || "");

	const selectedVariant = $derived(
		selectedVariantId
			? product?.variants?.find((v: any) => v.id === selectedVariantId)
			: (product?.variants?.[0] ?? undefined),
	);

	const currentPrice = $derived(selectedVariant?.pricing?.price?.gross);

	// Handle variant selection
	function handleVariantSelected(event: CustomEvent) {
		const { variant, variantId } = event.detail;
		selectedVariantId = variantId;

		// Update URL
		const url = new URL(window.location.href);
		url.searchParams.set("variant", variantId);
		window.history.replaceState({}, "", url.toString());
	}

	// Auto-select first variant if none selected
	$effect(() => {
		if (typeof window !== "undefined" && product?.variants?.length && !selectedVariantId) {
			const firstVariant = product.variants[0];
			if (firstVariant?.id) {
				const url = new URL(window.location.href);
				url.searchParams.set("variant", firstVariant.id);
				window.history.replaceState({}, "", url.toString());
			}
		}
	});
</script>

<svelte:head>
	<title>{product?.name || "Product"} | Saleor Storefront</title>
	<meta name="description" content={product?.seoDescription || product?.description || ""} />
</svelte:head>

{#if product}
	<div class="mx-auto max-w-7xl px-4 py-8">
		<div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
			<!-- Product Images -->
			<div>
				{#if product.thumbnail}
					<img
						src={product.thumbnail.url}
						alt={product.thumbnail.alt || product.name}
						class="w-full rounded-lg"
					/>
				{/if}
			</div>

			<!-- Product Details -->
			<div class="space-y-6">
				<div>
					<h1 class="text-3xl font-bold">{product.name}</h1>
					{#if product.category}
						<p class="mt-2 text-gray-600">{product.category.name}</p>
					{/if}
					{#if isEnhanced}
						<div
							class="mt-2 inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800"
						>
							Enhanced Product
						</div>
					{/if}
				</div>

				{#if product.description}
					<div class="prose max-w-none">
						{@html product.description}
					</div>
				{/if}

				<!-- Enhanced Variant Selector for products with attributes -->
				{#if isEnhanced && product.variants && product.variants.length > 1}
					<VariantSelector
						variants={product.variants}
						{selectedVariantId}
						{product}
						layout="grid"
						showPrices={true}
						showStock={true}
						showSKU={true}
						onvariantSelected={handleVariantSelected}
					/>
				{:else if product.variants && product.variants.length > 1}
					<!-- Simple variant selector for regular products -->
					<div data-testid="VariantSelector">
						<h3 class="text-sm font-medium text-gray-900">Select variant:</h3>
						<div class="mt-2 space-y-2">
							{#each product.variants as variant}
								<label class="flex items-center">
									<input
										type="radio"
										name="variant"
										value={variant.id}
										checked={selectedVariantId === variant.id ||
											(!selectedVariantId && product.variants?.[0] && variant === product.variants[0])}
										disabled={!variant.quantityAvailable}
										onchange={() => handleVariantSelected({ detail: { variant, variantId: variant.id } })}
										class="mr-2"
									/>
									<span class={variant.quantityAvailable ? "" : "text-gray-400"}>
										{variant.name}
										{#if variant.pricing?.price?.gross}
											- {variant.pricing.price.gross.amount} {variant.pricing.price.gross.currency}
										{/if}
										{#if !variant.quantityAvailable}
											(Out of stock)
										{/if}
									</span>
								</label>
							{/each}
						</div>
					</div>
				{/if}

				<!-- Pricing -->
				<div class="mt-6">
					{#if currentPrice}
						<p class="text-2xl font-bold text-gray-900" data-testid="ProductElement_Price">
							{currentPrice.amount}
							{currentPrice.currency}
						</p>
					{:else if product.pricing?.priceRange}
						<p class="text-2xl font-bold text-gray-900" data-testid="ProductElement_Price">
							{formatMoneyRange({
								start: product.pricing.priceRange.start?.gross,
								stop: product.pricing.priceRange.stop?.gross,
							})}
						</p>
					{/if}
				</div>

				<!-- Product Attributes and Custom Fields -->
				{#if isEnhanced && (product.attributes?.length > 0 || product.metadata?.length > 0)}
					<ProductAttributes
						attributes={product.attributes || []}
						metadata={product.metadata || []}
						title="Product Information"
						variant="detailed"
					/>
				{/if}

				<!-- Selected Variant Attributes -->
				{#if selectedVariant?.attributes?.length > 0}
					<div>
						<h3 class="mb-3 text-lg font-medium text-gray-900">Selected Variant Details</h3>
						<ProductAttributes
							attributes={selectedVariant.attributes}
							metadata={selectedVariant.metadata || []}
							variant="compact"
							showTitle={false}
						/>
					</div>
				{/if}

				<!-- Add to Cart Button -->
				<div>
					{#if selectedVariant?.id}
						<AddToCartButton
							variantId={selectedVariant.id}
							disabled={!selectedVariant.quantityAvailable}
							class="w-full"
						/>
					{:else}
						<button disabled class="w-full cursor-not-allowed rounded bg-gray-400 px-6 py-3 text-white">
							Select a variant
						</button>
					{/if}
				</div>
			</div>
		</div>
	</div>
{:else}
	<div class="mx-auto max-w-7xl px-4 py-8">
		<h1 class="text-2xl font-bold">Product not found</h1>
	</div>
{/if}
