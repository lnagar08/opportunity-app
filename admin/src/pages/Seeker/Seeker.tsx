import PageHeader from '@/components/navigation/page-header';
import CustomSearch from '@/components/custom-controls/custom-search';
import { useState } from 'react';
import DataTable from '@/components/seeker/data-table';
import { useSeekers } from '@/hooks/use-seekers';

const Seeker = () => {
	const [search, setSearch] = useState('');
	const {
		seekersData,
		setSeekersData,
		currentPage,
		setCurrentPage,
		totalPages,
		isLoading,
		error
	} = useSeekers(search);

	return (
		<>
			<PageHeader
				items={[
					{ label: 'Home', href: '/dashboard' },
					{ label: 'Seekers Management', href: '/seekers' }
				]}
				heading="Seekers Management"
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
					seekersData={seekersData}
					data={seekersData}
					currentPage={currentPage}
					totalPages={totalPages}
					onPageChange={setCurrentPage}
					setSeekersData={setSeekersData}
					isLoading={isLoading}
				/>
			</div>
		</>
	);
};

export default Seeker;