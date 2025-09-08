import { writable } from "svelte/store";
import { browser } from "$app/environment";
import { getIdFromCookies, saveIdToCookie, findOrCreate } from "@lib/checkout";
import { executeGraphQL } from "@lib/graphql";
import { CheckoutAddLineDocument, CheckoutDeleteLinesDocument } from "@gql/graphql";
import type { CheckoutFragmentFragment } from "@gql";

interface CartState {
	checkout: CheckoutFragmentFragment | null;
	isLoading: boolean;
	error: string | null;
	itemsCount: number;
}

const initialState: CartState = {
	checkout: null,
	isLoading: false,
	error: null,
	itemsCount: 0,
};

function createCartStore() {
	const { subscribe, set, update } = writable<CartState>(initialState);

	return {
		subscribe,

		async initialize(channel: string = "default-channel") {
			if (!browser) return;

			update((state) => ({ ...state, isLoading: true }));

			try {
				const checkoutId = getIdFromCookies(channel);
				const checkout = await findOrCreate({ channel, checkoutId });

				if (checkout?.id && checkout.id !== checkoutId) {
					saveIdToCookie(channel, checkout.id);
				}

				update((state) => ({
					...state,
					checkout: (checkout as CheckoutFragmentFragment) || null,
					isLoading: false,
					itemsCount: checkout?.lines?.reduce((total: number, line: any) => total + line.quantity, 0) || 0,
					error: null,
				}));
			} catch (error) {
				update((state) => ({
					...state,
					isLoading: false,
					error: error instanceof Error ? error.message : "Failed to initialize cart",
				}));
			}
		},

		async addItem(variantId: string, quantity: number = 1, channel: string = "default-channel") {
			update((state) => ({ ...state, isLoading: true, error: null }));

			try {
				const checkoutId = getIdFromCookies(channel);
				const checkout = await findOrCreate({ channel, checkoutId });

				if (!checkout?.id) {
					throw new Error("Failed to create checkout");
				}

				const result = await executeGraphQL(CheckoutAddLineDocument, {
					variables: {
						id: checkout.id,
						lines: [
							{
								variantId,
								quantity,
							},
						],
					},
					cache: "no-cache",
				});

				if (result.checkoutLinesAdd?.errors?.length) {
					const firstError = result.checkoutLinesAdd.errors[0];
					throw new Error(firstError?.message || "Failed to add item");
				}

				const updatedCheckout = result.checkoutLinesAdd?.checkout;

				update((state) => ({
					...state,
					checkout: (updatedCheckout as CheckoutFragmentFragment) || null,
					isLoading: false,
					itemsCount:
						updatedCheckout?.lines?.reduce((total: number, line: any) => total + line.quantity, 0) || 0,
					error: null,
				}));
			} catch (error) {
				update((state) => ({
					...state,
					isLoading: false,
					error: error instanceof Error ? error.message : "Failed to add item to cart",
				}));
			}
		},

		async removeItem(lineId: string, channel: string = "default-channel") {
			update((state) => ({ ...state, isLoading: true, error: null }));

			try {
				const checkoutId = getIdFromCookies(channel);

				if (!checkoutId) {
					throw new Error("No checkout found");
				}

				const result = await executeGraphQL(CheckoutDeleteLinesDocument, {
					variables: {
						checkoutId: checkoutId,
						lineIds: [lineId],
					},
					cache: "no-cache",
				});

				if (result.checkoutLinesDelete?.errors?.length) {
					const firstError = result.checkoutLinesDelete.errors[0];
					throw new Error(firstError?.message || "Failed to remove item");
				}

				const updatedCheckout = result.checkoutLinesDelete?.checkout;

				update((state) => ({
					...state,
					checkout: (updatedCheckout as CheckoutFragmentFragment) || null,
					isLoading: false,
					itemsCount:
						updatedCheckout?.lines?.reduce((total: number, line: any) => total + line.quantity, 0) || 0,
					error: null,
				}));
			} catch (error) {
				update((state) => ({
					...state,
					isLoading: false,
					error: error instanceof Error ? error.message : "Failed to remove item from cart",
				}));
			}
		},

		clear() {
			set(initialState);
		},
	};
}

export const cartStore = createCartStore();
