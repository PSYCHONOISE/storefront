import { ProductDetailsDocument } from "@gql/graphql";
import { executeGraphQL } from "@lib/graphql";
import type { PageLoad } from "./$types";
import { error } from "@sveltejs/kit";

export const load: PageLoad = async ({ params }) => {
	try {
		const data = await executeGraphQL(ProductDetailsDocument, {
			variables: {
				slug: params.slug,
				channel: "default-channel",
			},
		});

		if (!data.product) {
			throw error(404, "Product not found");
		}

		return {
			product: data.product,
		};
	} catch (err) {
		console.error("Failed to fetch product:", err);
		throw error(404, "Product not found or API error");
	}
};
