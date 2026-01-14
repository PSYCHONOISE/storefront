import { ProductDetailsDocument } from "@gql/graphql";
import { executeGraphQL } from "@lib/graphql";
import type { PageLoad } from "./$types";
import { error } from "@sveltejs/kit";

// Enhanced query will be imported dynamically when needed

export const load: PageLoad = async ({ params, url }) => {
	try {
		// Get channel from URL params or default
		const channel = url.searchParams.get("channel") || "default-channel";

		// Try to use enhanced query for Channel 1 or channels that might have variants
		let queryToUse = ProductDetailsDocument;

		if (channel.includes("1") || channel.toLowerCase().includes("channel-1")) {
			try {
				// Dynamically import enhanced query
				const { ProductDetailsEnhancedDocument: enhancedQuery } = await import("@gql/graphql");
				queryToUse = enhancedQuery || ProductDetailsDocument;
			} catch (importError) {
				console.warn("Enhanced GraphQL queries not available, using regular query");
			}
		}

		const data = await executeGraphQL(queryToUse, {
			variables: {
				slug: params.slug,
				channel,
			},
		});

		if (!data.product) {
			throw error(404, "Product not found");
		}

		return {
			product: data.product,
			channel,
		};
	} catch (err) {
		console.error("Failed to fetch product:", err);
		throw error(404, "Product not found or API error");
	}
};
