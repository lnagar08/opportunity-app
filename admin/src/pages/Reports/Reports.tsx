import PageHeader from '@/components/navigation/page-header';
import DataTable from '@/components/report/data-table';
import CustomSelect from '@/components/custom-controls/custom-select';
import { useReports } from '@/hooks/use-reports';
import { reportStatusFilterOptions, targetTypeFilterOptions } from '@/constants/report-constants';
import type { ReportStatus, ReportTargetType } from '@/types/report.types';

const ALL_VALUE = 'ALL';

const Reports = () => {
	const {
		reportsData,
		setReportsData,
		currentPage,
		setCurrentPage,
		totalPages,
		statusFilter,
		setStatusFilter,
		targetTypeFilter,
		setTargetTypeFilter,
		isLoading,
		error
	} = useReports();

	return (
		<>
			<PageHeader
				items={[
					{ label: 'Home', href: '/dashboard' },
					{ label: 'Reports & Moderation', href: '/reports' }
				]}
				heading="Reports & Moderation"
			>
				<div className="flex flex-col items-start justify-between gap-4 sm:flex-row md:items-center">
					<div className="flex gap-2">
						<CustomSelect
							value={statusFilter ?? ALL_VALUE}
							onValueChange={(value) => setStatusFilter(value === ALL_VALUE ? undefined : (value as ReportStatus))}
							options={[{ value: ALL_VALUE, label: 'All Statuses' }, ...reportStatusFilterOptions]}
							placeholder="Status"
							className="w-[160px]"
						/>
						<CustomSelect
							value={targetTypeFilter ?? ALL_VALUE}
							onValueChange={(value) =>
								setTargetTypeFilter(value === ALL_VALUE ? undefined : (value as ReportTargetType))
							}
							options={[{ value: ALL_VALUE, label: 'All Targets' }, ...targetTypeFilterOptions]}
							placeholder="Target Type"
							className="w-[160px]"
						/>
					</div>
				</div>
			</PageHeader>

			{error && <p className="text-sm text-destructive mt-4">{error}</p>}

			<div>
				<DataTable
					reportsData={reportsData}
					data={reportsData}
					currentPage={currentPage}
					totalPages={totalPages}
					onPageChange={setCurrentPage}
					setReportsData={setReportsData}
					isLoading={isLoading}
				/>
			</div>
		</>
	);
};

export default Reports;