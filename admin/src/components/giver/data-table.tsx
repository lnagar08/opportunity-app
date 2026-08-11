import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router';
import { useState } from 'react';
import CustomSelect from '../custom-controls/custom-select';
import { giverService } from '@/services/giver.service';
import { getApiErrorMessage } from '@/lib/http';
import { accountStatusOptions, accountStatusClassMap } from '@/constants/seeker-table-constants';
import type { AccountStatus } from '@/types/seeker.types';
import type { AdminGiver } from '@/types/giver.types';

interface IDataTableProps {
	data: AdminGiver[];
	currentPage: number;
	totalPages: number;
	onPageChange: (page: number) => void;
	setGiversData: (data: AdminGiver[]) => void;
	giversData: AdminGiver[];
	isLoading?: boolean;
}

const DataTable = ({
	data,
	currentPage,
	totalPages,
	onPageChange,
	setGiversData,
	giversData,
	isLoading
}: IDataTableProps) => {
	const navigate = useNavigate();
	const [pendingActionId, setPendingActionId] = useState<string | null>(null);

	const patchGiver = (updated: AdminGiver) => {
		// updateStatus returns the User row without _count — keep the
		// existing opportunity count instead of losing it on patch.
		setGiversData(
			giversData.map((g) => (g.id === updated.id ? { ...g, ...updated, _count: g._count } : g))
		);
	};

	const handleAccountStatusChange = async (giver: AdminGiver, status: AccountStatus) => {
		const previous = giver.status;
		patchGiver({ ...giver, status });
		setPendingActionId(giver.id);
		try {
			const updated = await giverService.updateStatus(giver.id, status);
			patchGiver(updated);
		} catch (err) {
			patchGiver({ ...giver, status: previous });
			alert(getApiErrorMessage(err, 'Failed to update account status'));
		} finally {
			setPendingActionId(null);
		}
	};

	return (
		<div className="space-y-4">
			<div className="w-full">
				<Table>
					<TableHeader className="table-row-background">
						<TableRow className="!border-none">
							<TableHead className="rounded-l-md !border-none pl-4">Name</TableHead>
							<TableHead>Organization</TableHead>
							<TableHead>Location</TableHead>
							<TableHead>Opportunities Posted</TableHead>
							<TableHead>Joined</TableHead>
							<TableHead>Account Status</TableHead>
							<TableHead className="rounded-r-md !border-none pr-1">Action</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody className="!px-3">
						{!isLoading && data.length === 0 && (
							<TableRow>
								<TableCell colSpan={7} className="text-muted-foreground py-8 text-center">
									No givers found.
								</TableCell>
							</TableRow>
						)}
						{data.map((giver) => (
							<TableRow key={giver.id} className="!border-none">
								<TableCell className="pl-4">
									<h6 className="text-sm font-medium">{giver.fullName}</h6>
									<h6 className="text-muted-foreground mt-[4px]">{giver.mobileNumber}</h6>
								</TableCell>
								<TableCell>
									<h6 className="text-sm font-medium">{giver.giverProfile?.organizationName ?? '—'}</h6>
								</TableCell>
								<TableCell>
									<h6 className="text-sm font-medium">{giver.city ?? '—'}</h6>
									<h6 className="text-muted-foreground mt-[4px]">{giver.state ?? ''}</h6>
								</TableCell>
								<TableCell>
									<h6 className="text-sm font-medium">{giver._count.opportunities}</h6>
								</TableCell>
								<TableCell>
									<h6 className="text-sm font-medium">{format(new Date(giver.createdAt), 'dd MMM yyyy')}</h6>
								</TableCell>
								<TableCell>
									<CustomSelect
										value={giver.status}
										disabled={pendingActionId === giver.id}
										onValueChange={(value) => handleAccountStatusChange(giver, value as AccountStatus)}
										options={accountStatusOptions}
										placeholder="Select status"
										className={`w-[150px] !border-none ${accountStatusClassMap[giver.status]}`}
									/>
								</TableCell>
								<TableCell>
									<Button
										variant="outline"
										size="sm"
										variantClassName="primary"
										onClick={() => navigate(`/givers/${giver.id}`)}
										leftIcon={<Eye className="h-4 w-4" />}
									>
										View
									</Button>
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
		</div>
	);
};

export default DataTable;