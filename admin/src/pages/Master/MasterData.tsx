import PageHeader from '@/components/navigation/page-header';
import MasterList from '@/components/master/master-list';

const MasterData = () => {
	return (
		<>
			<PageHeader
				items={[
					{ label: 'Home', href: '/dashboard' },
					{ label: 'Master Data', href: '/master-data' }
				]}
				heading="Masters Data"
			/>

			<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
				<MasterList resource="categories" label="Categorie" />
				<MasterList resource="disability-types" label="Disability Type" />
			</div>
		</>
	);
};

export default MasterData;