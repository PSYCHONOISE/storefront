<script lang="ts">
	import type { ProductListItemFragment } from "@gql";
	import { formatMoneyRange } from "@lib/utils";
	import LinkWithChannel from "./LinkWithChannel.svelte";
	import ProductImageWrapper from "./ProductImageWrapper.svelte";
	import ProductAttributes from "./ProductAttributes.svelte";

	let {
		product,
		loading,
		priority,
		showVariants = false,
		showAttributes = false,
	}: {
		product: any; // Using any to support enhanced product data
		loading: "eager" | "lazy";
		priority?: boolean;
		showVariants?: boolean;
		showAttributes?: boolean;
	} = $props();

	// Check if product has variants
	const hasVariants = $derived(product.variantCount?.length > 0 || product.variants?.length > 0);
	const variantCount = $derived(product.variantCount?.length || product.variants?.length || 0);

	// Get variant info for display
	const variantInfo = $derived(
		hasVariants && showVariants
			? {
					count: variantCount,
					lowestPrice: getLowestVariantPrice(),
					inStock: getVariantsInStock(),
				}
			: null,
	);

	function getLowestVariantPrice() {
		const variants = product.variantCount || product.variants || [];
		if (variants.length === 0) return null;

		const prices = variants
			.filter((v: any) => v.pricing?.price?.gross?.amount)
			.map((v: any) => v.pricing.price.gross.amount);

		if (prices.length === 0) return null;

		const minPrice = Math.min(...prices);
		const currency = variants[0].pricing?.price?.gross?.currency;

		return { amount: minPrice, currency };
	}

	function getVariantsInStock() {
		const variants = product.variantCount || product.variants || [];
		return variants.filter((v: any) => (v.quantityAvailable || 0) > 0).length;
	}
</script>

<li data-testid="ProductElement">
	<LinkWithChannel href={`/products/${product.slug}`}>
		<div>
			{#if product?.thumbnail?.url}
				<ProductImageWrapper
					{loading}
					src={product.thumbnail.url}
					alt={product.thumbnail.alt ?? ""}
					width={512}
					height={512}
					sizes="512px"
					{priority}
				/>
			{/if}
			<div class="mt-2">
				<div class="flex justify-between">
					<div class="flex-1">
						<h3 class="mt-1 text-sm font-semibold text-neutral-900">{product.name}</h3>
						<p class="mt-1 text-sm text-neutral-500" data-testid="ProductElement_Category">
							{product.category?.name}
						</p>
					</div>
					<div class="text-right">
						<p class="mt-1 text-sm font-medium text-neutral-900" data-testid="ProductElement_PriceRange">
							{#if variantInfo?.lowestPrice}
								From {new Intl.NumberFormat("en-US", {
									style: "currency",
									currency: variantInfo.lowestPrice.currency,
								}).format(variantInfo.lowestPrice.amount)}
							{:else}
								{formatMoneyRange({
									start: product?.pricing?.priceRange?.start?.gross,
									stop: product?.pricing?.priceRange?.stop?.gross,
								})}
							{/if}
						</p>
						{#if variantInfo}
							<p class="text-xs text-neutral-500">
								{variantInfo.count} variant{variantInfo.count === 1 ? "" : "s"}
							</p>
						{/if}
					</div>
				</div>

				<!-- Show attributes if enabled -->
				{#if showAttributes && (product.attributes?.length > 0 || product.metadata?.length > 0)}
					<div class="mt-3">
						<ProductAttributes
							attributes={product.attributes || []}
							metadata={product.metadata || []}
							variant="inline"
							showTitle={false}
						/>
					</div>
				{/if}

				<!-- Show variant status -->
				{#if variantInfo && showVariants}
					<div class="mt-2 flex items-center justify-between text-xs">
						<span class="text-neutral-600">
							{variantInfo.inStock} of {variantInfo.count} in stock
						</span>
						{#if variantInfo.inStock === 0}
							<span class="font-medium text-red-600">Out of stock</span>
						{:else if variantInfo.inStock < variantInfo.count}
							<span class="font-medium text-orange-600">Limited stock</span>
						{:else}
							<span class="font-medium text-green-600">In stock</span>
						{/if}
					</div>
				{/if}
			</div>
		</div>
	</LinkWithChannel>
</li>
