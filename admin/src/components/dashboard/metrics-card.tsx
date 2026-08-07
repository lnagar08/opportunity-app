import { Card, CardContent } from '@/components/ui/cards';
import { Skeleton } from '@/components/ui/skeleton';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricsCardProps {
	label: string;
	value: number | undefined;
	icon: LucideIcon;
	isLoading?: boolean;
	tone?: 'default' | 'warning' | 'danger';
}

const toneClasses: Record<NonNullable<MetricsCardProps['tone']>, string> = {
	default: 'bg-primary/10 text-primary',
	warning: 'bg-amber-500/10 text-amber-600',
	danger: 'bg-destructive/10 text-destructive'
};

const MetricsCard = ({ label, value, icon: Icon, isLoading, tone = 'default' }: MetricsCardProps) => {
	return (
		<Card className="shadow-sm">
			<CardContent className="flex items-center gap-4 py-5">
				<div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-lg', toneClasses[tone])}>
					<Icon className="h-5 w-5" />
				</div>
				<div className="flex flex-col">
					<span className="text-sm text-muted-foreground">{label}</span>
					{isLoading ? (
						<Skeleton className="h-6 w-14 mt-1" />
					) : (
						<span className="text-xl font-semibold">{value ?? 0}</span>
					)}
				</div>
			</CardContent>
		</Card>
	);
};

export default MetricsCard;