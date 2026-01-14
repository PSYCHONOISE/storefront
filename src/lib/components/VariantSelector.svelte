<script lang="ts">
	import { createEventDispatcher } from "svelte";

	const dispatch = createEventDispatcher();

	// Component props
	let {
		variants = [],
		selectedVariantId = "",
		product = null,
		showPrices = true,
		showStock = true,
		showSKU = false,
		layout = "dropdown", // 'dropdown' | 'grid' | 'list'
	}: {
		variants?: any[];
		selectedVariantId?: string;
		product?: any;
		showPrices?: boolean;
		showStock?: boolean;
		showSKU?: boolean;
		layout?: "dropdown" | "grid" | "list";
	} = $props();

	// Get currently selected variant
	const selectedVariant = $derived(variants.find((v) => v.id === selectedVariantId) || variants[0]);

	// Group attributes for variant selection (e.g., size, color)
	const variantAttributes = $derived(getVariantAttributes(variants));

	// Current attribute selections
	let attributeSelections = $state<Record<string, string>>({});

	// Find matching variant based on attribute selections
	const matchingVariant = $derived(findVariantByAttributes(variants, attributeSelections));

	function getVariantAttributes(variants: any[]) {
		if (!variants?.length) return {};

		const attributes: Record<string, Set<any>> = {};

		variants.forEach((variant) => {
			variant.attributes?.forEach((attr: any) => {
				const attrSlug = attr.attribute.slug;
				if (!attributes[attrSlug]) {
					attributes[attrSlug] = new Set();
				}
				attr.values?.forEach((value: any) => {
					attributes[attrSlug].add(value);
				});
			});
		});

		// Convert Sets to Arrays for easier iteration
		const result: Record<string, any> = {};
		Object.entries(attributes).forEach(([key, valueSet]) => {
			result[key] = {
				attribute: variants[0]?.attributes?.find((attr: any) => attr.attribute.slug === key)?.attribute,
				values: Array.from(valueSet),
			};
		});

		return result;
	}

	function findVariantByAttributes(variants: any[], selections: Record<string, string>) {
		if (Object.keys(selections).length === 0) return variants[0];

		return (
			variants.find((variant) => {
				return Object.entries(selections).every(([attrSlug, selectedValueId]) => {
					const attr = variant.attributes?.find((a: any) => a.attribute.slug === attrSlug);
					return attr?.values?.some((value: any) => value.id === selectedValueId);
				});
			}) || variants[0]
		);
	}

	function selectAttribute(attributeSlug: string, valueId: string) {
		attributeSelections[attributeSlug] = valueId;

		// Find and select the matching variant
		const variant = findVariantByAttributes(variants, attributeSelections);
		if (variant) {
			selectVariant(variant.id);
		}
	}

	function selectVariant(variantId: string) {
		const variant = variants.find((v) => v.id === variantId);
		if (variant) {
			dispatch("variantSelected", {
				variant,
				variantId,
			});
		}
	}

	function formatPrice(variant: any) {
		if (!variant?.pricing?.price?.gross) return "";
		const { amount, currency } = variant.pricing.price.gross;
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency,
		}).format(amount);
	}

	function getStockStatus(variant: any) {
		const qty = variant?.quantityAvailable || 0;
		if (qty === 0) return { text: "Out of stock", class: "text-red-600" };
		if (qty < 5) return { text: `Only ${qty} left`, class: "text-orange-600" };
		return { text: "In stock", class: "text-green-600" };
	}

	function isColorAttribute(attribute: any) {
		const slug = attribute?.slug?.toLowerCase() || "";
		return slug.includes("color") || slug.includes("colour");
	}

	function isSizeAttribute(attribute: any) {
		const slug = attribute?.slug?.toLowerCase() || "";
		return slug.includes("size") || slug.includes("dimension");
	}
</script>

{#if variants?.length > 1}
	<div class="variant-selector">
		<h3 class="mb-4 text-lg font-medium text-gray-900">Options</h3>

		<!-- Attribute-based selection -->
		{#if Object.keys(variantAttributes).length > 0}
			<div class="space-y-4">
				{#each Object.entries(variantAttributes) as [attributeSlug, attrData]}
					<div>
						<label class="mb-2 block text-sm font-medium text-gray-700">
							{attrData.attribute?.name || attributeSlug}
						</label>

						{#if isColorAttribute(attrData.attribute)}
							<!-- Color swatches -->
							<div class="flex flex-wrap gap-2">
								{#each attrData.values as value}
									<button
										type="button"
										onclick={() => selectAttribute(attributeSlug, value.id)}
										class="group relative flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-medium uppercase focus:outline-none {attributeSelections[
											attributeSlug
										] === value.id
											? 'border-gray-900'
											: 'border-gray-300'}"
										title={value.name}
									>
										{#if value.file?.url}
											<img
												src={value.file.url}
												alt={value.name}
												class="h-full w-full rounded-full object-cover"
											/>
										{:else}
											<span
												class="h-6 w-6 rounded-full border border-gray-200"
												style="background-color: {value.value || '#ccc'}"
											></span>
										{/if}
										{#if attributeSelections[attributeSlug] === value.id}
											<span
												class="pointer-events-none absolute -inset-px rounded-full border-2 border-gray-900"
											></span>
										{/if}
									</button>
								{/each}
							</div>
						{:else if isSizeAttribute(attrData.attribute)}
							<!-- Size buttons -->
							<div class="flex flex-wrap gap-2">
								{#each attrData.values as value}
									<button
										type="button"
										onclick={() => selectAttribute(attributeSlug, value.id)}
										class="flex items-center justify-center rounded-md border px-3 py-2 text-sm font-medium uppercase focus:outline-none {attributeSelections[
											attributeSlug
										] === value.id
											? 'border-gray-900 bg-gray-900 text-white'
											: 'border-gray-300 bg-white text-gray-900 hover:bg-gray-50'}"
									>
										{value.name}
									</button>
								{/each}
							</div>
						{:else}
							<!-- Generic dropdown -->
							<select
								bind:value={attributeSelections[attributeSlug]}
								onchange={() => selectAttribute(attributeSlug, attributeSelections[attributeSlug])}
								class="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
							>
								<option value="">Choose {attrData.attribute?.name || attributeSlug}</option>
								{#each attrData.values as value}
									<option value={value.id}>{value.name}</option>
								{/each}
							</select>
						{/if}
					</div>
				{/each}
			</div>
		{:else}
			<!-- Fallback: Direct variant selection -->
			{#if layout === "dropdown"}
				<select
					bind:value={selectedVariantId}
					onchange={() => selectVariant(selectedVariantId)}
					class="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
				>
					{#each variants as variant}
						<option value={variant.id}>
							{variant.name}
							{#if showPrices}
								- {formatPrice(variant)}{/if}
							{#if showSKU && variant.sku}
								({variant.sku}){/if}
						</option>
					{/each}
				</select>
			{:else if layout === "grid"}
				<div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
					{#each variants as variant}
						<button
							type="button"
							onclick={() => selectVariant(variant.id)}
							class="flex flex-col items-center rounded-lg border p-3 text-sm hover:border-gray-400 {selectedVariantId ===
							variant.id
								? 'border-blue-500 bg-blue-50'
								: 'border-gray-300'}"
						>
							{#if variant.media?.[0]}
								<img
									src={variant.media[0].url}
									alt={variant.name}
									class="mb-2 h-12 w-12 rounded object-cover"
								/>
							{/if}
							<span class="font-medium">{variant.name}</span>
							{#if showPrices}
								<span class="text-gray-600">{formatPrice(variant)}</span>
							{/if}
						</button>
					{/each}
				</div>
			{:else}
				<!-- List layout -->
				<div class="space-y-2">
					{#each variants as variant}
						<button
							type="button"
							onclick={() => selectVariant(variant.id)}
							class="flex w-full items-center justify-between rounded-lg border p-3 text-left hover:border-gray-400 {selectedVariantId ===
							variant.id
								? 'border-blue-500 bg-blue-50'
								: 'border-gray-300'}"
						>
							<div class="flex items-center space-x-3">
								{#if variant.media?.[0]}
									<img src={variant.media[0].url} alt={variant.name} class="h-10 w-10 rounded object-cover" />
								{/if}
								<div>
									<div class="font-medium">{variant.name}</div>
									{#if showSKU && variant.sku}
										<div class="text-sm text-gray-500">SKU: {variant.sku}</div>
									{/if}
								</div>
							</div>
							<div class="text-right">
								{#if showPrices}
									<div class="font-medium">{formatPrice(variant)}</div>
								{/if}
								{#if showStock}
									{@const stock = getStockStatus(variant)}
									<div class="text-sm {stock.class}">{stock.text}</div>
								{/if}
							</div>
						</button>
					{/each}
				</div>
			{/if}
		{/if}

		<!-- Selected variant info -->
		{#if selectedVariant}
			<div class="mt-4 rounded-lg bg-gray-50 p-4">
				<h4 class="font-medium text-gray-900">Selected: {selectedVariant.name}</h4>
				<div class="mt-2 flex items-center justify-between">
					{#if showPrices}
						<span class="text-lg font-bold text-gray-900">{formatPrice(selectedVariant)}</span>
					{/if}
					{#if showStock}
						{@const stock = getStockStatus(selectedVariant)}
						<span class="text-sm {stock.class}">{stock.text}</span>
					{/if}
				</div>
				{#if showSKU && selectedVariant.sku}
					<div class="mt-1 text-sm text-gray-600">SKU: {selectedVariant.sku}</div>
				{/if}
			</div>
		{/if}
	</div>
{:else if variants?.length === 1}
	<!-- Single variant info -->
	<div class="rounded-lg bg-gray-50 p-4">
		<div class="flex items-center justify-between">
			{#if showPrices}
				<span class="text-lg font-bold text-gray-900">{formatPrice(variants[0])}</span>
			{/if}
			{#if showStock}
				{@const stock = getStockStatus(variants[0])}
				<span class="text-sm {stock.class}">{stock.text}</span>
			{/if}
		</div>
		{#if showSKU && variants[0].sku}
			<div class="mt-1 text-sm text-gray-600">SKU: {variants[0].sku}</div>
		{/if}
	</div>
{/if}
