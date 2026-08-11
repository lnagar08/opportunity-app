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
import { useState } from 'react';
import { reportService } from '@/services/report.service';
import { getApiErrorMessage } from '@/lib/http';
import { reportStatusClassMap, targetTypeLabel } from '@/constants/report-constants';
import ResolveReportDialog from './resolve-report-dialog';
import type { AdminReport, UpdateReportPayload } from '@/types/report.types';

interface IDataTableProps {
	data: AdminReport[];
	currentPage: number;
	totalPages: number;
	onPageChange: (page: number) => void;
	setReportsData: (data: AdminReport[]) => void;
	reportsData: AdminReport[];
	isLoading?: boolean;
}

const DataTable = ({
	data,
	currentPage,
	totalPages,
	onPageChange,
	setReportsData,
	reportsData,
	isLoading
}: IDataTableProps) => {
	const [selectedReport, setSelectedReport] = useState<AdminReport | null>(null);

	const handleResolve = async (payload: UpdateReportPayload) => {
		if (!selectedReport) return;
		try {
			const updated = await reportService.updateStatus(selectedReport.id, payload);
			setReportsData(reportsData.map((r) => (r.id === updated.id ? updated : r)));
		} catch (err) {
			throw new Error(getApiErrorMessage(err, 'Failed to update report'));
		}
	};

	return (
		<div className="space-y-4">
			<div className="w-full">
				<Table>
					<TableHeader className="table-row-background">
						<TableRow className="!border-none">
							<TableHead className="rounded-l-md !border-none pl-4">Reported By</TableHead>
							<TableHead>Target</TableHead>
							<TableHead>Reason</TableHead>
							<TableHead>Submitted</TableHead>
							<TableHead>Status</TableHead>
							<TableHead className="rounded-r-md !border-none pr-1">Action</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody className="!px-3">
						{!isLoading && data.length === 0 && (
							<TableRow>
								<TableCell colSpan={6} className="text-muted-foreground py-8 text-center">
									No reports found.
								</TableCell>
							</TableRow>
						)}
						{data.map((report) => (
							<TableRow key={report.id} className="!border-none">
								<TableCell className="pl-4">
									<h6 className="text-sm font-medium">{report.reportedBy.fullName}</h6>
									<h6 className="text-muted-foreground mt-[4px]">{report.reportedBy.role}</h6>
								</TableCell>
								<TableCell>
									<h6 className="text-sm font-medium">{targetTypeLabel[report.targetType]}</h6>
									{report.reportedUser && (
										<h6 className="text-muted-foreground mt-[4px]">{report.reportedUser.fullName}</h6>
									)}
								</TableCell>
								<TableCell>
									<p className="max-w-[240px] truncate text-sm">{report.reason}</p>
								</TableCell>
								<TableCell>
									<h6 className="text-sm font-medium">{format(new Date(report.createdAt), 'dd MMM yyyy')}</h6>
								</TableCell>
								<TableCell>
									<span className={`rounded-md px-2 py-1 text-xs font-medium ${reportStatusClassMap[report.status]}`}>
										{report.status}
									</span>
								</TableCell>
								<TableCell>
									<Button
										variant="outline"
										size="sm"
										variantClassName="primary"
										onClick={() => setSelectedReport(report)}
										leftIcon={<Eye className="h-4 w-4" />}
									>
										{report.status === 'PENDING' ? 'Review' : 'View'}
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

			<ResolveReportDialog
				open={!!selectedReport}
				onOpenChange={(open) => !open && setSelectedReport(null)}
				report={selectedReport}
				onConfirm={handleResolve}
			/>
		</div>
	);
};

export default DataTable;