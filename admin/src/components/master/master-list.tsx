import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/cards';
import { Button } from '@/components/ui/button';
import { Pencil, Ban, CheckCircle2, Plus } from 'lucide-react';
import { masterService } from '@/services/master.service';
import { getApiErrorMessage } from '@/lib/http';
import { useMasterList } from '@/hooks/use-master-list';
import MasterItemDialog from './master-item-dialog';
import ConfirmActionDialog from '@/components/opportunity/confirm-action-dialog';
import type { MasterItem, MasterResource } from '@/types/master.types';

interface MasterListProps {
	resource: MasterResource;
	label: string; // "Category" | "Disability Type"
}

const MasterList = ({ resource, label }: MasterListProps) => {
	const { items, setItems, isLoading, error } = useMasterList(resource);
	const [dialogOpen, setDialogOpen] = useState(false);
	const [editingItem, setEditingItem] = useState<MasterItem | null>(null);
	const [deactivateTarget, setDeactivateTarget] = useState<MasterItem | null>(null);
	const [actionError, setActionError] = useState<string | null>(null);

	const openAddDialog = () => {
		setEditingItem(null);
		setDialogOpen(true);
	};

	const openEditDialog = (item: MasterItem) => {
		setEditingItem(item);
		setDialogOpen(true);
	};

	const handleSubmit = async (name: string) => {
		setActionError(null);
		try {
			if (editingItem) {
				const updated = await masterService.update(resource, editingItem.id, { name });
				setItems(items.map((i) => (i.id === updated.id ? updated : i)));
			} else {
				const created = await masterService.create(resource, name);
				setItems([...items, created].sort((a, b) => a.name.localeCompare(b.name)));
			}
		} catch (err) {
			setActionError(getApiErrorMessage(err, `Failed to save ${label.toLowerCase()}`));
			throw err; // keep dialog open on failure
		}
	};

	const handleReactivate = async (item: MasterItem) => {
		setActionError(null);
		try {
			const updated = await masterService.update(resource, item.id, { isActive: true });
			setItems(items.map((i) => (i.id === updated.id ? updated : i)));
		} catch (err) {
			setActionError(getApiErrorMessage(err, `Failed to reactivate ${label.toLowerCase()}`));
		}
	};

	const handleDeactivate = async () => {
		if (!deactivateTarget) return;
		try {
			await masterService.deactivate(resource, deactivateTarget.id);
			setItems(items.map((i) => (i.id === deactivateTarget.id ? { ...i, isActive: false } : i)));
		} catch (err) {
			setActionError(getApiErrorMessage(err, `Failed to deactivate ${label.toLowerCase()}`));
			throw err;
		}
	};

	return (
		<Card className="shadow-sm">
			<CardContent className="py-5">
				<div className="mb-4 flex items-center justify-between">
					<h3 className="text-sm font-semibold">{label}s</h3>
					<Button size="sm" variantClassName="primary" onClick={openAddDialog} leftIcon={<Plus className="h-4 w-4" />}>
						Add {label}
					</Button>
				</div>

				{error && <p className="text-destructive mb-3 text-sm">{error}</p>}
				{actionError && <p className="text-destructive mb-3 text-sm">{actionError}</p>}

				{isLoading ? (
					<p className="text-muted-foreground text-sm">Loading…</p>
				) : items.length === 0 ? (
					<p className="text-muted-foreground text-sm">No {label.toLowerCase()}s yet.</p>
				) : (
					<div className="divide-muted divide-y">
						{items.map((item) => (
							<div key={item.id} className="flex items-center justify-between py-2.5">
								<div className="flex items-center gap-2">
									<span className={`text-sm font-medium ${!item.isActive ? 'text-muted-foreground line-through' : ''}`}>
										{item.name}
									</span>
									{!item.isActive && (
										<span className="bg-muted rounded-md px-2 py-0.5 text-xs font-medium">Inactive</span>
									)}
								</div>
								<div className="flex items-center gap-1">
									<Button
										variant="outline"
										size="icon"
										className="h-7 w-7"
										onClick={() => openEditDialog(item)}
										leftIcon={<Pencil className="h-3.5 w-3.5" />}
									/>
									{item.isActive ? (
										<Button
											variant="outline"
											size="icon"
											className="h-7 w-7"
											onClick={() => setDeactivateTarget(item)}
											leftIcon={<Ban className="h-3.5 w-3.5 text-destructive" />}
										/>
									) : (
										<Button
											variant="outline"
											size="icon"
											className="h-7 w-7"
											onClick={() => handleReactivate(item)}
											leftIcon={<CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
										/>
									)}
								</div>
							</div>
						))}
					</div>
				)}
			</CardContent>

			<MasterItemDialog
				open={dialogOpen}
				onOpenChange={setDialogOpen}
				editingItem={editingItem}
				label={label}
				onSubmit={handleSubmit}
			/>
			<ConfirmActionDialog
				open={!!deactivateTarget}
				onOpenChange={(open) => !open && setDeactivateTarget(null)}
				title={`Deactivate this ${label.toLowerCase()}?`}
				description={`It will no longer appear as an option for new ${resource === 'categories' ? 'opportunities' : 'registrations'}, but existing records that reference it are unaffected.`}
				confirmLabel="Deactivate"
				destructive
				onConfirm={handleDeactivate}
			/>
		</Card>
	);
};

export default MasterList;