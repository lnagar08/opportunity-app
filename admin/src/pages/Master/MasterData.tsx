import PageHeader from '@/components/navigation/page-header';
import MasterList from '@/components/master/master-list';
import { useState } from 'react';
import StateList from '@/components/master/state-list';
import CityList from '@/components/master/city-list';
import { useStates } from '@/hooks/use-states';
const MasterData = () => {
	const [selectedStateId, setSelectedStateId] = useState<string | undefined>(undefined);
	const { states } = useStates(); // for resolving the selected state's name into CityList
	return (
		<>
			<PageHeader
				items={[
					{ label: 'Home', href: '/dashboard' },
					{ label: 'Master Data', href: '/master-data' }
				]}
				heading="Masters Data"
			/>

			<div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
				<MasterList resource="categories" label="Categorie" />
				<MasterList resource="disability-types" label="Disability Type" />
				<StateList selectedStateId={selectedStateId} onSelectState={setSelectedStateId} />
				<CityList selectedState={states.find((s) => s.id === selectedStateId)} />
			</div>
		</>
	);
};

export default MasterData;