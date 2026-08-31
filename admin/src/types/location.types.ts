export interface AdminState {
	id: string;
	name: string;
	code: string | null;
	isActive: boolean;
}

export interface AdminCity {
	id: string;
	name: string;
	stateId: string;
	isActive: boolean;
	state?: { id: string; name: string };
}