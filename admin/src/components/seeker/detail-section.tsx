import { Card, CardContent } from '@/components/ui/cards';
import type { ReactNode } from 'react';

interface DetailSectionProps {
	title: string;
	children: ReactNode;
	action?: ReactNode;
}

const DetailSection = ({ title, children, action }: DetailSectionProps) => (
	<Card className="shadow-sm">
		<CardContent className="py-5">
			<div className="mb-4 flex items-center justify-between">
				<h3 className="text-sm font-semibold">{title}</h3>
				{action}
			</div>
			{children}
		</CardContent>
	</Card>
);

export default DetailSection;