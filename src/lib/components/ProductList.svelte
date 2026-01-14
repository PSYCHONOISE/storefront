<script lang="ts">
	import ProductElement from "./ProductElement.svelte";

	let {
		products,
		showVariants = false,
		showAttributes = false,
	}: {
		products: readonly any[]; // Using any to support both regular and enhanced product data
		showVariants?: boolean;
		showAttributes?: boolean;
	} = $props();

	// Detect if we have enhanced product data (with variants/attributes)
	const hasEnhancedData = $derived(
		products.some((p) => p.variantCount?.length > 0 || p.variants?.length > 0 || p.attributes?.length > 0),
	);
</script>

<div data-testid="ProductList">
	{#if hasEnhancedData}
		<!-- Enhanced view with variants and attributes support -->
		<div class="mb-4 text-sm text-gray-600">Showing enhanced product information</div>
	{/if}

	<ul role="list" class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
		{#each products as product, index}
			<ProductElement
				{product}
				priority={index < 2}
				loading={index < 3 ? "eager" : "lazy"}
				showVariants={showVariants || hasEnhancedData}
				showAttributes={showAttributes || hasEnhancedData}
			/>
		{/each}
	</ul>
</div>
