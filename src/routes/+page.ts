import { ProductListByCollectionDocument } from "@gql/graphql";
import { executeGraphQL } from "@lib/graphql";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ fetch }) => {
	try {
		// Try to get featured products from collection first
		const channel = "default-channel";

		try {
			const data = await executeGraphQL(ProductListByCollectionDocument, {
				variables: {
					slug: "featured-products", // Try common collection names
					channel,
				},
			});

			if (data.collection?.products?.edges?.length) {
				const products = data.collection.products.edges.map(({ node: product }: any) => product);
				return { products };
			}
		} catch (error) {
			console.log("Featured collection not found, trying other collections...");
		}

		// If no featured collection, try to get any products
		const { ProductListPaginatedDocument } = await import("@gql");
		try {
			const data = await executeGraphQL(ProductListPaginatedDocument, {
				variables: {
					first: 6, // Get first 6 products
					channel,
				},
			});

			if (data.products?.edges?.length) {
				const products = data.products.edges.map(({ node: product }: any) => product);
				return { products };
			}
		} catch (error) {
			console.error("Failed to fetch products:", error);
		}

		// Fallback to mock data if API fails
		console.log("Using fallback mock data");
		return {
			products: [
				{
					__typename: "Product" as const,
					id: "mock-1",
					name: "API Connection Issue",
					slug: "api-issue",
					thumbnail: {
						__typename: "Image" as const,
						url: "https://via.placeholder.com/300x300?text=Check+API",
						alt: "Check API Configuration",
					},
					category: {
						__typename: "Category" as const,
						id: "system-cat",
						name: "System",
					},
					pricing: {
						__typename: "ProductPricingInfo" as const,
						priceRange: {
							__typename: "TaxedMoneyRange" as const,
							start: {
								__typename: "TaxedMoney" as const,
								gross: {
									__typename: "Money" as const,
									amount: 0,
									currency: "USD",
								},
							},
							stop: {
								__typename: "TaxedMoney" as const,
								gross: {
									__typename: "Money" as const,
									amount: 0,
									currency: "USD",
								},
							},
						},
					},
				},
			],
		};
	} catch (error) {
		console.error("Page load error:", error);
		return {
			products: [],
		};
	}
};
