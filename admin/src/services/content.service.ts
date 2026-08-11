import { http, type ApiEnvelope } from '@/lib/http';
import type { ContentPage, ContentPageEnumSlug, ContentPageUrlSlug, UpdateContentPagePayload } from '@/types/content.types';

// The list/get response stores the DB enum slug, but the GET/PUT :slug
// routes expect the URL-friendly form — this is the single place that
// bridges the two so nothing else in the app needs to know about it.
const ENUM_TO_URL_SLUG: Record<ContentPageEnumSlug, ContentPageUrlSlug> = {
	TERMS_AND_CONDITIONS: 'terms-and-conditions',
	PRIVACY_POLICY: 'privacy-policy'
};

export const toUrlSlug = (slug: ContentPageEnumSlug): ContentPageUrlSlug => ENUM_TO_URL_SLUG[slug];

export const contentService = {
	list: async (): Promise<ContentPage[]> => {
		const { data } = await http.get<ApiEnvelope<ContentPage[]>>('/admin/content-pages');
		return data.data;
	},

	update: async (slug: ContentPageEnumSlug, payload: UpdateContentPagePayload): Promise<ContentPage> => {
		const { data } = await http.put<ApiEnvelope<ContentPage>>(
			`/admin/content-pages/${toUrlSlug(slug)}`,
			payload
		);
		return data.data;
	}
};