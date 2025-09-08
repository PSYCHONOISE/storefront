import { CheckoutCreateDocument, CheckoutFindDocument } from "@gql/graphql";
import { executeGraphQL } from "./graphql";
import { browser } from "$app/environment";

export function getIdFromCookies(channel: string): string {
	if (!browser) return "";
	const cookieName = `checkoutId-${channel}`;
	return getCookie(cookieName) || "";
}

export function saveIdToCookie(channel: string, checkoutId: string) {
	if (!browser) return;
	const cookieName = `checkoutId-${channel}`;
	setCookie(cookieName, checkoutId, {
		sameSite: "lax",
		secure: window.location.protocol === "https:",
		maxAge: 60 * 60 * 24 * 30, // 30 days
	});
}

// Cookie utilities for browser
function getCookie(name: string): string | null {
	if (typeof document === "undefined") return null;
	const value = `; ${document.cookie}`;
	const parts = value.split(`; ${name}=`);
	if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
	return null;
}

function setCookie(
	name: string,
	value: string,
	options: {
		sameSite?: string;
		secure?: boolean;
		maxAge?: number;
	},
) {
	if (typeof document === "undefined") return;
	let cookie = `${name}=${value}`;
	if (options.maxAge) cookie += `; max-age=${options.maxAge}`;
	if (options.sameSite) cookie += `; samesite=${options.sameSite}`;
	if (options.secure) cookie += "; secure";
	cookie += "; path=/";
	document.cookie = cookie;
}

export async function find(checkoutId: string) {
	try {
		const { checkout } = checkoutId
			? await executeGraphQL(CheckoutFindDocument, {
					variables: {
						id: checkoutId,
					},
					cache: "no-cache",
				})
			: { checkout: null };

		return checkout;
	} catch {
		// we ignore invalid ID or checkout not found
	}
}

export async function findOrCreate({ channel, checkoutId }: { checkoutId?: string; channel: string }) {
	if (!checkoutId) {
		return (await create({ channel })).checkoutCreate?.checkout;
	}
	const checkout = await find(checkoutId);
	return checkout || (await create({ channel })).checkoutCreate?.checkout;
}

export const create = ({ channel }: { channel: string }) =>
	executeGraphQL(CheckoutCreateDocument, { cache: "no-cache", variables: { channel } });
