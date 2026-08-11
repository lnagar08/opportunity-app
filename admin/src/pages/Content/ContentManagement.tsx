import PageHeader from '@/components/navigation/page-header';
import ContentPageCard from '@/components/content/content-page-card';
import { useContentPages } from '@/hooks/use-content-pages';
import type { ContentPage } from '@/types/content.types';

const ContentManagement = () => {
	const { pages, setPages, isLoading, error } = useContentPages();

	const handleUpdated = (updated: ContentPage) => {
		setPages(pages.map((p) => (p.id === updated.id ? updated : p)));
	};

	return (
		<>
			<PageHeader
				items={[
					{ label: 'Home', href: '/dashboard' },
					{ label: 'Content Management', href: '/content-management' }
				]}
				heading="Content Management"
			/>

			{error && <p className="text-destructive mt-4 text-sm">{error}</p>}

			{isLoading ? (
				<p className="text-muted-foreground mt-4 text-sm">Loading…</p>
			) : (
				<div className="mt-4 grid grid-cols-1 gap-4">
					{pages.map((page) => (
						<ContentPageCard key={page.id} page={page} onUpdated={handleUpdated} />
					))}
				</div>
			)}
		</>
	);
};

export default ContentManagement;