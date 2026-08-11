import PageHeader from '@/components/navigation/page-header';
import CustomSearch from '@/components/custom-controls/custom-search';
import { useState } from 'react';
import DataTable from '@/components/opportunity/data-table';
import { useAdminOpportunities } from '@/hooks/use-admin-opportunities';

const Opportunity = () => {
	const [search, setSearch] = useState('');
	const {
		opportunitiesData,
		setOpportunitiesData,
		currentPage,
		setCurrentPage,
		totalPages,
		isLoading,
		error
	} = useAdminOpportunities(search);

	return (
		<>
			<PageHeader
				items={[
					{ label: 'Home', href: '/dashboard' },
					{ label: 'Opportunity Management', href: '/opportunities' }
				]}
				heading="Opportunities"
			>
				<div className="space-y-4">
					<div className="flex flex-col items-start justify-between gap-4 sm:flex-row md:items-center">
						<CustomSearch
							value={search}
							onChange={setSearch}
							className="w-full sm:w-[200px]"
							placeholder="Search by title"
						/>
					</div>
				</div>
			</PageHeader>

			{error && <p className="text-sm text-destructive mt-4">{error}</p>}

			<div>
				<DataTable
					opportunitiesData={opportunitiesData}
					data={opportunitiesData}
					currentPage={currentPage}
					totalPages={totalPages}
					onPageChange={setCurrentPage}
					setOpportunitiesData={setOpportunitiesData}
					isLoading={isLoading}
				/>
			</div>
		</>
	);
};

export default Opportunity;