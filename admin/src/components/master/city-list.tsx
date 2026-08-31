import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/cards';
import { Button } from '@/components/ui/button';
import { Pencil, Ban, CheckCircle2, Plus } from 'lucide-react';
import { locationService } from '@/services/location.service';
import { getApiErrorMessage } from '@/lib/http';
import { useCities } from '@/hooks/use-cities';
import CityItemDialog from './city-item-dialog';
import ConfirmActionDialog from '@/components/opportunity/confirm-action-dialog';
import type { AdminCity, AdminState } from '@/types/location.types';

interface CityListProps {
	selectedState: AdminState | undefined;
}

const CityList = ({ selectedState }: CityListProps) => {
	const { cities, setCities, isLoading, error, refetch } = useCities(selectedState?.id);
	const [dialogOpen, setDialogOpen] = useState(false);
	const [editingCity, setEditingCity] = useState<AdminCity | null>(null);
	const [deactivateTarget, setDeactivateTarget] = useState<AdminCity | null>(null);
	const [actionError, setActionError] = useState<string | null>(null);

	if (!selectedState) {
		return (
			<Card className="shadow-sm">
				<CardContent className="py-5">
					<h3 className="mb-2 text-sm font-semibold">Cities</h3>
					<p className="text-muted-foreground text-sm">Select a state on the left to manage its cities.</p>
				</CardContent>
			</Card>
		);
	}

	const handleSubmit = async (values: { name: string }) => {
		try {
			if (editingCity) {
				const updated = await locationService.updateCity(editingCity.id, values);
				setCities(cities.map((c) => (c.id === updated.id ? updated : c)));
			} else {
				const created = await locationService.createCity({ ...values, stateId: selectedState.id });
				setCities([...cities, created].sort((a, b) => a.name.localeCompare(b.name)));
			}
		} catch (err) {
			setActionError(getApiErrorMessage(err, 'Failed to save city'));
			throw err;
		}
	};

	const handleReactivate = async (city: AdminCity) => {
		try {
			const updated = await locationService.updateCity(city.id, { isActive: true });
			setCities(cities.map((c) => (c.id === updated.id ? updated : c)));
		} catch (err) {
			setActionError(getApiErrorMessage(err, 'Failed to reactivate city'));
		}
	};

	const handleDeactivate = async () => {
		if (!deactivateTarget) return;
		try {
			await locationService.deactivateCity(deactivateTarget.id);
			setCities(cities.map((c) => (c.id === deactivateTarget.id ? { ...c, isActive: false } : c)));
		} catch (err) {
			setActionError(getApiErrorMessage(err, 'Failed to deactivate city'));
			throw err;
		}
	};

	return (
		<Card className="shadow-sm">
			<CardContent className="py-5">
				<div className="mb-4 flex items-center justify-between">
					<h3 className="text-sm font-semibold">Cities in {selectedState.name}</h3>
					<Button
						size="sm"
						variantClassName="primary"
						onClick={() => {
							setEditingCity(null);
							setDialogOpen(true);
						}}
						leftIcon={<Plus className="h-4 w-4" />}
					>
						Add City
					</Button>
				</div>

				{error && <p className="text-destructive mb-3 text-sm">{error}</p>}
				{actionError && <p className="text-destructive mb-3 text-sm">{actionError}</p>}

				{isLoading ? (
					<p className="text-muted-foreground text-sm">Loading…</p>
				) : cities.length === 0 ? (
					<p className="text-muted-foreground text-sm">No cities yet for this state.</p>
				) : (
					<div className="divide-muted max-h-[480px] divide-y overflow-y-auto">
						{cities.map((city) => (
							<div key={city.id} className="flex items-center justify-between py-2.5">
								<div className="flex items-center gap-2">
									<span className={`text-sm font-medium ${!city.isActive ? 'text-muted-foreground line-through' : ''}`}>
										{city.name}
									</span>
									{!city.isActive && <span className="bg-muted rounded-md px-2 py-0.5 text-xs font-medium">Inactive</span>}
								</div>
								<div className="flex items-center gap-1">
									<Button
										variant="outline"
										size="icon"
										className="h-7 w-7"
										onClick={() => {
											setEditingCity(city);
											setDialogOpen(true);
										}}
										leftIcon={<Pencil className="h-3.5 w-3.5" />}
									/>
									{city.isActive ? (
										<Button
											variant="outline"
											size="icon"
											className="h-7 w-7"
											onClick={() => setDeactivateTarget(city)}
											leftIcon={<Ban className="h-3.5 w-3.5 text-destructive" />}
										/>
									) : (
										<Button
											variant="outline"
											size="icon"
											className="h-7 w-7"
											onClick={() => handleReactivate(city)}
											leftIcon={<CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
										/>
									)}
								</div>
							</div>
						))}
					</div>
				)}
			</CardContent>

			<CityItemDialog
				open={dialogOpen}
				onOpenChange={setDialogOpen}
				editingCity={editingCity}
				stateName={selectedState.name}
				onSubmit={handleSubmit}
			/>
			<ConfirmActionDialog
				open={!!deactivateTarget}
				onOpenChange={(open) => !open && setDeactivateTarget(null)}
				title="Deactivate this city?"
				description="It will no longer appear in dropdowns for this state. Existing profiles/opportunities that reference it are unaffected."
				confirmLabel="Deactivate"
				destructive
				onConfirm={handleDeactivate}
			/>
		</Card>
	);
};

export default CityList;