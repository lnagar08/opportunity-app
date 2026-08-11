import PageHeader from '@/components/navigation/page-header';
import CustomSearch from '@/components/custom-controls/custom-search';
import { useState } from 'react';
import DataTable from '@/components/giver/data-table';
import { useGivers } from '@/hooks/use-givers';

const Giver = () => {
	const [search, setSearch] = useState('');
	const { giversData, setGiversData, currentPage, setCurrentPage, totalPages, isLoading, error } = useGivers(search);

	return (
		<>
			<PageHeader
				items={[
					{ label: 'Home', href: '/dashboard' },
					{ label: 'Givers Management', href: '/givers' }
				]}
				heading="Givers Management"
			>
				<div className="space-y-4">
					<div className="flex flex-col items-start justify-between gap-4 sm:flex-row md:items-center">
						<CustomSearch
							value={search}
							onChange={setSearch}
							className="w-full sm:w-[200px]"
							placeholder="Search by Name"
						/>
					</div>
				</div>
			</PageHeader>

			{error && <p className="text-sm text-destructive mt-4">{error}</p>}

			<div>
				<DataTable
					giversData={giversData}
					data={giversData}
					currentPage={currentPage}
					totalPages={totalPages}
					onPageChange={setCurrentPage}
					setGiversData={setGiversData}
					isLoading={isLoading}
				/>
			</div>
		</>
	);
};

export default Giver;