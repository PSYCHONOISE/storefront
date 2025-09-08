import { ProductListPaginatedDocument } from "@gql/graphql";
import { executeGraphQL } from "@lib/graphql";
import { PUBLIC_SALEOR_API_URL } from "$env/static/public";
import type { PageLoad } from "./$types";

export const load: PageLoad = async () => {
	const testResult = {
		success: false,
		error: "",
		productCount: 0,
		sampleProducts: [] as Array<{ id: string; name: string }>,
	};

	try {
		const data = await executeGraphQL(ProductListPaginatedDocument, {
			variables: {
				first: 3,
				channel: "default-channel",
			},
		});

		if (data.products?.edges) {
			testResult.success = true;
			testResult.productCount = data.products.edges.length;
			testResult.sampleProducts = data.products.edges.map(({ node }: any) => ({
				id: node.id,
				name: node.name,
			}));
		}
	} catch (error) {
		testResult.error = error instanceof Error ? error.message : "Unknown error";
	}

	return {
		apiUrl: PUBLIC_SALEOR_API_URL,
		testResult,
	};
};
