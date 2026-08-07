export interface Admin {
	id: string;
	fullName: string;
	email: string;
	isSuperAdmin: boolean;
}

export interface LoginResponse {
	token: string;
	admin: Admin;
}