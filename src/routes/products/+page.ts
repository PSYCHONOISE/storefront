import { ProductListPaginatedDocument } from "@gql/graphql";
import { executeGraphQL } from "@lib/graphql";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ url }) => {
	try {
		const channel = "default-channel";

		// Only load first page on initial page load (ignore URL pagination parameters)
		const first = 12;
		const after = undefined; // Always start from the beginning

		const data = await executeGraphQL(ProductListPaginatedDocument, {
			variables: {
				first,
				after,
				channel,
			},
		});

		if (data.products?.edges?.length) {
			const products = data.products.edges.map(({ node: product }: any) => product);
			const pageInfo = data.products.pageInfo;
			return { products, pageInfo };
		}

		return {
			products: [],
			pageInfo: null,
		};
	} catch (error) {
		console.error("Failed to fetch products:", error);
		return {
			products: [],
			pageInfo: null,
			error: "Failed to load products. Please check API configuration.",
		};
	}
};

// Disable prerendering for this page since we use dynamic content loading
export const prerender = false;
