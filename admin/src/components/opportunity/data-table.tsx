import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Eye, Lock, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router';
import { useState } from 'react';
import { opportunityService } from '@/services/opportunity.service';
import { getApiErrorMessage } from '@/lib/http';
import { opportunityStatusClassMap } from '@/constants/opportunity-status-constants';
import ConfirmActionDialog from './confirm-action-dialog';
import type { AdminOpportunity } from '@/types/opportunity.types';

interface IDataTableProps {
	data: AdminOpportunity[];
	currentPage: number;
	totalPages: number;
	onPageChange: (page: number) => void;
	setOpportunitiesData: (data: AdminOpportunity[]) => void;
	opportunitiesData: AdminOpportunity[];
	isLoading?: boolean;
}

const DataTable = ({
	data,
	currentPage,
	totalPages,
	onPageChange,
	setOpportunitiesData,
	opportunitiesData,
	isLoading
}: IDataTableProps) => {
	const navigate = useNavigate();
	const [closeTargetId, setCloseTargetId] = useState<string | null>(null);
	const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
	const [actionError, setActionError] = useState<string | null>(null);

	const patchOpportunity = (updated: AdminOpportunity) => {
		setOpportunitiesData(
			opportunitiesData.map((o) => (o.id === updated.id ? { ...o, ...updated, _count: o._count } : o))
		);
	};

	const handleClose = async () => {
		if (!closeTargetId) return;
		try {
			const updated = await opportunityService.close(closeTargetId);
			patchOpportunity(updated);
		} catch (err) {
			setActionError(getApiErrorMessage(err, 'Failed to close opportunity'));
			throw err;
		}
	};

	const handleDelete = async () => {
		if (!deleteTargetId) return;
		try {
			await opportunityService.remove(deleteTargetId);
			setOpportunitiesData(opportunitiesData.filter((o) => o.id !== deleteTargetId));
		} catch (err) {
			setActionError(getApiErrorMessage(err, 'Failed to delete opportunity'));
			throw err;
		}
	};

	return (
		<div className="space-y-4">
			{actionError && <p className="text-destructive text-sm">{actionError}</p>}

			<div className="w-full">
				<Table>
					<TableHeader className="table-row-background">
						<TableRow className="!border-none">
							<TableHead className="rounded-l-md !border-none pl-4">Title</TableHead>
							<TableHead>Posted By</TableHead>
							<TableHead>Work Mode</TableHead>
							<TableHead>Applications</TableHead>
							<TableHead>Posted On</TableHead>
							<TableHead>Status</TableHead>
							<TableHead className="rounded-r-md !border-none pr-1">Action</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody className="!px-3">
						{!isLoading && data.length === 0 && (
							<TableRow>
								<TableCell colSpan={7} className="text-muted-foreground py-8 text-center">
									No opportunities found.
								</TableCell>
							</TableRow>
						)}
						{data.map((opportunity) => (
							<TableRow key={opportunity.id} className="!border-none">
								<TableCell className="pl-4">
									<h6 className="text-sm font-medium">{opportunity.title}</h6>
								</TableCell>
								<TableCell>
									<h6 className="text-sm font-medium">{opportunity.giver.fullName}</h6>
									<h6 className="text-muted-foreground mt-[4px]">{opportunity.giver.mobileNumber}</h6>
								</TableCell>
								<TableCell>{opportunity.workMode}</TableCell>
								<TableCell>
									<h6 className="text-sm font-medium">{opportunity._count.applications}</h6>
								</TableCell>
								<TableCell>
									<h6 className="text-sm font-medium">{format(new Date(opportunity.createdAt), 'dd MMM yyyy')}</h6>
								</TableCell>
								<TableCell>
									<span
										className={`rounded-md px-2 py-1 text-xs font-medium ${opportunityStatusClassMap[opportunity.status]}`}
									>
										{opportunity.status}
									</span>
								</TableCell>
								<TableCell>
									<div className="flex items-center gap-1">
										<Button
											variant="outline"
											size="sm"
											variantClassName="primary"
											onClick={() => navigate(`/opportunities/${opportunity.id}`)}
											leftIcon={<Eye className="h-4 w-4" />}
										>
											View
										</Button>
										{opportunity.status === 'ACTIVE' && (
											<Button
												variant="outline"
												size="icon"
												className="h-8 w-8"
												onClick={() => setCloseTargetId(opportunity.id)}
												leftIcon={<Lock className="h-3.5 w-3.5" />}
											/>
										)}
										{opportunity.status !== 'DELETED' && (
											<Button
												variant="outline"
												size="icon"
												className="h-8 w-8"
												onClick={() => setDeleteTargetId(opportunity.id)}
												leftIcon={<Trash2 className="h-3.5 w-3.5 text-destructive" />}
											/>
										)}
									</div>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>

			<div className="flex items-center justify-end space-x-2">
				<div className="text-muted-foreground text-sm">
					{currentPage} - {totalPages} of {totalPages}
				</div>
				<Button
					variant="outline"
					size="icon"
					onClick={() => onPageChange(currentPage - 1)}
					disabled={currentPage === 1}
					leftIcon={<ChevronLeft className="h-4 w-4" />}
				/>
				<Button
					variant="outline"
					size="icon"
					onClick={() => onPageChange(currentPage + 1)}
					disabled={currentPage === totalPages}
					leftIcon={<ChevronRight className="h-4 w-4" />}
				/>
			</div>

			<ConfirmActionDialog
				open={!!closeTargetId}
				onOpenChange={(open) => !open && setCloseTargetId(null)}
				title="Close this opportunity?"
				description="Seekers will no longer be able to apply. This can't be reopened from here."
				confirmLabel="Close Opportunity"
				onConfirm={handleClose}
			/>
			<ConfirmActionDialog
				open={!!deleteTargetId}
				onOpenChange={(open) => !open && setDeleteTargetId(null)}
				title="Delete this opportunity?"
				description="This removes it from search and listings. Existing applications are kept for record-keeping."
				confirmLabel="Delete Opportunity"
				destructive
				onConfirm={handleDelete}
			/>
		</div>
	);
};

export default DataTable;