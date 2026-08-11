export type ContentPageEnumSlug = 'TERMS_AND_CONDITIONS' | 'PRIVACY_POLICY';
export type ContentPageUrlSlug = 'terms-and-conditions' | 'privacy-policy';

export interface ContentPageUpdatedBy {
	id: string;
	fullName: string;
}

export interface ContentPage {
	id: string;
	slug: ContentPageEnumSlug;
	title: string;
	content: string;
	updatedByAdminId: string | null;
	updatedByAdmin?: ContentPageUpdatedBy | null;
	createdAt: string;
	updatedAt: string;
}

export interface UpdateContentPagePayload {
	title: string;
	content: string;
}