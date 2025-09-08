import { writable, derived, get } from "svelte/store";
import type { ProductListItemFragment, PageInfo } from "@gql";
import { ProductListPaginatedDocument } from "@gql/graphql";
import { executeGraphQL } from "@lib/graphql";

// Our PageInfo only includes the fields we actually fetch from GraphQL
type PaginationInfo = {
	__typename?: "PageInfo";
	endCursor?: string | null;
	hasNextPage: boolean;
};

interface ProductsState {
	products: ProductListItemFragment[];
	pageInfo: PaginationInfo | null;
	isLoading: boolean;
	isLoadingMore: boolean;
	error: string | null;
	prefetchedPages: Map<string, { products: ProductListItemFragment[]; timestamp: number }>;
	currentPage: number;
	totalPages: number;
	prefetchInProgress: Set<string>;
}

const initialState: ProductsState = {
	products: [],
	pageInfo: null,
	isLoading: false,
	isLoadingMore: false,
	error: null,
	prefetchedPages: new Map(),
	currentPage: 1,
	totalPages: 0,
	prefetchInProgress: new Set(),
};

const productsStore = writable<ProductsState>(initialState);

// Configuration
const PRODUCTS_PER_PAGE = 12;
const PREFETCH_PAGES_AHEAD = 2;
const SCROLL_THRESHOLD = 0.8; // Start prefetching when user scrolls 80% down
const PREFETCH_DELAY = 500; // Delay before starting prefetch to not block initial render
const MAX_CACHED_PAGES = 5; // Maximum number of pages to keep in cache

/**
 * Initialize the products store with initial data
 */
export function initializeProducts(
	initialProducts: ProductListItemFragment[],
	initialPageInfo: PaginationInfo | null,
) {
	productsStore.update((state) => ({
		...state,
		products: initialProducts,
		pageInfo: initialPageInfo,
		currentPage: 1,
		totalPages: initialPageInfo?.hasNextPage ? 2 : 1, // We know there's at least one more page if hasNextPage is true
		error: null,
		prefetchedPages: new Map(),
	}));

	// Start prefetching the next page immediately
	if (initialPageInfo?.hasNextPage) {
		setTimeout(() => {
			prefetchNextPages();
		}, 500); // Small delay to not block initial render
	}
}

/**
 * Load more products and append to existing list
 */
export async function loadMoreProducts(): Promise<boolean> {
	const currentState = get(productsStore);

	if (!currentState.pageInfo?.hasNextPage || currentState.isLoadingMore) {
		return false;
	}

	productsStore.update((state) => ({ ...state, isLoadingMore: true, error: null }));

	try {
		// Check if we have prefetched data
		const cursor = currentState.pageInfo.endCursor || "";
		const prefetchedData = currentState.prefetchedPages.get(cursor);

		if (prefetchedData) {
			// Use prefetched data immediately - fetch fresh data to get updated pageInfo
			const data = await fetchProductPage(currentState.pageInfo.endCursor);

			productsStore.update((state) => {
				const newPrefetchedPages = new Map(state.prefetchedPages);
				newPrefetchedPages.delete(cursor);

				// Clean up old cached pages
				cleanupOldCachedPages(newPrefetchedPages);

				return {
					...state,
					products: [...state.products, ...data.products],
					pageInfo: data.pageInfo,
					isLoadingMore: false,
					currentPage: state.currentPage + 1,
					prefetchedPages: newPrefetchedPages,
				};
			});
		} else {
			// Fetch data normally
			const data = await fetchProductPage(currentState.pageInfo.endCursor);

			productsStore.update((state) => ({
				...state,
				products: [...state.products, ...data.products],
				pageInfo: data.pageInfo,
				isLoadingMore: false,
				currentPage: state.currentPage + 1,
			}));
		}

		// Trigger prefetch of next pages after successful load
		setTimeout(() => {
			prefetchNextPages();
		}, PREFETCH_DELAY);

		return true;
	} catch (error) {
		console.error("Failed to load more products:", error);
		productsStore.update((state) => ({
			...state,
			isLoadingMore: false,
			error: "Failed to load more products",
		}));
		return false;
	}
}

/**
 * Prefetch next pages in background
 */
export async function prefetchNextPages() {
	const currentState = get(productsStore);

	if (!currentState.pageInfo?.hasNextPage) return;

	// Start prefetching from next page
	let cursor = currentState.pageInfo.endCursor;
	let pagesPrefetched = 0;

	while (pagesPrefetched < PREFETCH_PAGES_AHEAD && cursor) {
		try {
			const state = get(productsStore);

			// Skip if already prefetched or in progress
			if (state.prefetchedPages.has(cursor) || state.prefetchInProgress.has(cursor)) {
				break;
			}

			// Mark as in progress
			productsStore.update((s) => ({
				...s,
				prefetchInProgress: new Set([...s.prefetchInProgress, cursor!]),
			}));

			const data = await fetchProductPage(cursor);

			productsStore.update((s) => {
				const newPrefetchedPages = new Map(s.prefetchedPages);
				const newInProgress = new Set(s.prefetchInProgress);

				newPrefetchedPages.set(cursor!, {
					products: data.products,
					timestamp: Date.now(),
				});
				newInProgress.delete(cursor!);

				// Clean up old cached pages
				cleanupOldCachedPages(newPrefetchedPages);

				return {
					...s,
					prefetchedPages: newPrefetchedPages,
					prefetchInProgress: newInProgress,
				};
			});

			cursor = data.pageInfo.endCursor;
			pagesPrefetched++;

			if (!data.pageInfo.hasNextPage) break;
		} catch (error) {
			console.warn("Failed to prefetch page:", error);

			// Remove from in-progress on error
			if (cursor) {
				productsStore.update((s) => {
					const newInProgress = new Set(s.prefetchInProgress);
					newInProgress.delete(cursor!);
					return { ...s, prefetchInProgress: newInProgress };
				});
			}

			break;
		}
	}
}

/**
 * Fetch a single page of products
 */
async function fetchProductPage(after?: string | null): Promise<{
	products: ProductListItemFragment[];
	pageInfo: PaginationInfo;
}> {
	const data = await executeGraphQL(ProductListPaginatedDocument, {
		variables: {
			first: PRODUCTS_PER_PAGE,
			after: after || undefined,
			channel: "default-channel",
		},
	});

	if (!data.products?.edges?.length) {
		return {
			products: [],
			pageInfo: {
				__typename: "PageInfo",
				hasNextPage: false,
				endCursor: null,
			},
		};
	}

	return {
		products: data.products.edges.map(({ node }: any) => node),
		pageInfo: data.products.pageInfo,
	};
}

/**
 * Handle scroll events to trigger intelligent prefetching
 */
export function handleScroll() {
	const scrollTop = window.scrollY;
	const windowHeight = window.innerHeight;
	const documentHeight = document.documentElement.scrollHeight;

	const scrollPercentage = (scrollTop + windowHeight) / documentHeight;

	// Start prefetching when user scrolls past threshold
	if (scrollPercentage > SCROLL_THRESHOLD) {
		prefetchNextPages();
	}
}

/**
 * Reset products store to initial state
 */
export function resetProducts() {
	productsStore.set(initialState);
}

/**
 * Derived store for checking if there are more products to load
 */
export const hasMoreProducts = derived(
	productsStore,
	($products) => $products.pageInfo?.hasNextPage || false,
);

/**
 * Derived store for loading state
 */
export const isLoadingMore = derived(productsStore, ($products) => $products.isLoadingMore);

/**
 * Derived store for products list
 */
export const products = derived(productsStore, ($products) => $products.products);

/**
 * Derived store for error state
 */
export const productsError = derived(productsStore, ($products) => $products.error);

// Export the main store for direct access when needed
export { productsStore };

/**
 * Clean up old cached pages to prevent memory leaks
 */
function cleanupOldCachedPages(
	cache: Map<string, { products: ProductListItemFragment[]; timestamp: number }>,
) {
	if (cache.size <= MAX_CACHED_PAGES) return;

	// Sort by timestamp and remove oldest entries
	const entries = Array.from(cache.entries());
	entries.sort((a, b) => a[1].timestamp - b[1].timestamp);

	// Remove oldest entries
	const toRemove = entries.slice(0, entries.length - MAX_CACHED_PAGES);
	toRemove.forEach(([key]) => cache.delete(key));
}

/**
 * Get performance metrics for debugging
 */
export function getPerformanceMetrics() {
	const state = get(productsStore);
	return {
		totalProducts: state.products.length,
		cachedPages: state.prefetchedPages.size,
		prefetchInProgress: state.prefetchInProgress.size,
		currentPage: state.currentPage,
		hasNextPage: state.pageInfo?.hasNextPage || false,
	};
}
