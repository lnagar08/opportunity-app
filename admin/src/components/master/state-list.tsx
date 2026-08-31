import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/cards';
import { Button } from '@/components/ui/button';
import { Pencil, Ban, CheckCircle2, Plus } from 'lucide-react';
import { locationService } from '@/services/location.service';
import { getApiErrorMessage } from '@/lib/http';
import { useStates } from '@/hooks/use-states';
import StateItemDialog from './state-item-dialog';
import ConfirmActionDialog from '@/components/opportunity/confirm-action-dialog';
import type { AdminState } from '@/types/location.types';

interface StateListProps {
	selectedStateId: string | undefined;
	onSelectState: (stateId: string) => void;
}

const StateList = ({ selectedStateId, onSelectState }: StateListProps) => {
	const { states, setStates, isLoading, error } = useStates();
	const [dialogOpen, setDialogOpen] = useState(false);
	const [editingState, setEditingState] = useState<AdminState | null>(null);
	const [deactivateTarget, setDeactivateTarget] = useState<AdminState | null>(null);
	const [actionError, setActionError] = useState<string | null>(null);

	const handleSubmit = async (values: { name: string; code?: string }) => {
		try {
			if (editingState) {
				const updated = await locationService.updateState(editingState.id, values);
				setStates(states.map((s) => (s.id === updated.id ? updated : s)));
			} else {
				const created = await locationService.createState(values);
				setStates([...states, created].sort((a, b) => a.name.localeCompare(b.name)));
			}
		} catch (err) {
			setActionError(getApiErrorMessage(err, 'Failed to save state'));
			throw err;
		}
	};

	const handleReactivate = async (state: AdminState) => {
		try {
			const updated = await locationService.updateState(state.id, { isActive: true });
			setStates(states.map((s) => (s.id === updated.id ? updated : s)));
		} catch (err) {
			setActionError(getApiErrorMessage(err, 'Failed to reactivate state'));
		}
	};

	const handleDeactivate = async () => {
		if (!deactivateTarget) return;
		try {
			await locationService.deactivateState(deactivateTarget.id);
			setStates(states.map((s) => (s.id === deactivateTarget.id ? { ...s, isActive: false } : s)));
		} catch (err) {
			setActionError(getApiErrorMessage(err, 'Failed to deactivate state'));
			throw err;
		}
	};

	return (
		<Card className="shadow-sm">
			<CardContent className="py-5">
				<div className="mb-4 flex items-center justify-between">
					<h3 className="text-sm font-semibold">States</h3>
					<Button
						size="sm"
						variantClassName="primary"
						onClick={() => {
							setEditingState(null);
							setDialogOpen(true);
						}}
						leftIcon={<Plus className="h-4 w-4" />}
					>
						Add State
					</Button>
				</div>

				{error && <p className="text-destructive mb-3 text-sm">{error}</p>}
				{actionError && <p className="text-destructive mb-3 text-sm">{actionError}</p>}

				{isLoading ? (
					<p className="text-muted-foreground text-sm">Loading…</p>
				) : (
					<div className="divide-muted max-h-[480px] divide-y overflow-y-auto">
						{states.map((state) => (
							<button
								key={state.id}
								type="button"
								onClick={() => onSelectState(state.id)}
								className={`flex w-full items-center justify-between py-2.5 text-left ${
									selectedStateId === state.id ? 'bg-muted/60 -mx-2 rounded-md px-2' : ''
								}`}
							>
								<div className="flex items-center gap-2">
									<span className={`text-sm font-medium ${!state.isActive ? 'text-muted-foreground line-through' : ''}`}>
										{state.name} {state.code ? `(${state.code})` : ''}
									</span>
									{!state.isActive && <span className="bg-muted rounded-md px-2 py-0.5 text-xs font-medium">Inactive</span>}
								</div>
								<div className="flex items-center gap-1">
									<Button
										variant="outline"
										size="icon"
										className="h-7 w-7"
										onClick={(e) => {
											e.stopPropagation();
											setEditingState(state);
											setDialogOpen(true);
										}}
										leftIcon={<Pencil className="h-3.5 w-3.5" />}
									/>
									{state.isActive ? (
										<Button
											variant="outline"
											size="icon"
											className="h-7 w-7"
											onClick={(e) => {
												e.stopPropagation();
												setDeactivateTarget(state);
											}}
											leftIcon={<Ban className="h-3.5 w-3.5 text-destructive" />}
										/>
									) : (
										<Button
											variant="outline"
											size="icon"
											className="h-7 w-7"
											onClick={(e) => {
												e.stopPropagation();
												handleReactivate(state);
											}}
											leftIcon={<CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
										/>
									)}
								</div>
							</button>
						))}
					</div>
				)}
			</CardContent>

			<StateItemDialog open={dialogOpen} onOpenChange={setDialogOpen} editingState={editingState} onSubmit={handleSubmit} />
			<ConfirmActionDialog
				open={!!deactivateTarget}
				onOpenChange={(open) => !open && setDeactivateTarget(null)}
				title="Deactivate this state?"
				description="It will no longer appear in the registration/opportunity dropdown. Its cities are unaffected and remain selectable if reached directly."
				confirmLabel="Deactivate"
				destructive
				onConfirm={handleDeactivate}
			/>
		</Card>
	);
};

export default StateList;