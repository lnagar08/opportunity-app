import { useParams, useNavigate } from 'react-router';
import { format } from 'date-fns';
import { ArrowLeft, Check, X, Download } from 'lucide-react';
import PageHeader from '@/components/navigation/page-header';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useSeekerDetail } from '@/hooks/use-seeker-detail';
import { seekerService } from '@/services/seeker.service';
import { getApiErrorMessage } from '@/lib/http';
import DetailSection from '@/components/seeker/detail-section';
import RejectCertificateDialog from '@/components/seeker/reject-certificate-dialog';
import { certificateStatusClassMap, accountStatusClassMap } from '@/constants/seeker-table-constants';

const applicationStatusClassMap: Record<string, string> = {
	PENDING: 'bg-amber-500/10 text-amber-600',
	SHORTLISTED: 'bg-blue-500/10 text-blue-600',
	ACCEPTED: 'bg-emerald-500/10 text-emerald-600',
	REJECTED: 'bg-red-500/10 text-red-600',
	WITHDRAWN: 'bg-slate-500/10 text-slate-600'
};

const SeekerDetail = () => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const { seeker, setSeeker, isLoading, error } = useSeekerDetail(id);
	const [isRejectOpen, setIsRejectOpen] = useState(false);
	const [isReviewing, setIsReviewing] = useState(false);
	const [actionError, setActionError] = useState<string | null>(null);

	const handleApprove = async () => {
		if (!seeker) return;
		setIsReviewing(true);
		setActionError(null);
		try {
			const result = await seekerService.reviewCertificate(seeker.id, 'APPROVED');
			setSeeker({
				...seeker,
				seekerProfile: seeker.seekerProfile
					? { ...seeker.seekerProfile, certificateStatus: result.certificateStatus, certificateRejectReason: null }
					: null
			});
		} catch (err) {
			setActionError(getApiErrorMessage(err, 'Failed to approve certificate'));
		} finally {
			setIsReviewing(false);
		}
	};

	const handleReject = async (reason: string) => {
		if (!seeker) return;
		const result = await seekerService.reviewCertificate(seeker.id, 'REJECTED', reason);
		setSeeker({
			...seeker,
			seekerProfile: seeker.seekerProfile
				? {
						...seeker.seekerProfile,
						certificateStatus: result.certificateStatus,
						certificateRejectReason: result.certificateRejectReason
					}
				: null
		});
		setIsRejectOpen(false);
	};

	if (isLoading) {
		return <div className="text-muted-foreground flex min-h-[40vh] items-center justify-center text-sm">Loading…</div>;
	}

	if (error || !seeker) {
		return (
			<div className="text-destructive flex min-h-[40vh] flex-col items-center justify-center gap-3 text-sm">
				<p>{error ?? 'Seeker not found'}</p>
				<Button variant="outline" onClick={() => navigate('/seekers')} leftIcon={<ArrowLeft className="h-4 w-4" />}>
					Back to Seekers
				</Button>
			</div>
		);
	}

	const profile = seeker.seekerProfile;

	return (
		<>
			<PageHeader
				items={[
					{ label: 'Home', href: '/dashboard' },
					{ label: 'Seekers Management', href: '/seekers' },
					{ label: seeker.fullName, href: `/seekers/${seeker.id}` }
				]}
				heading={seeker.fullName}
			/>

			<div className="mb-4">
				<Button variant="ghost" size="sm" onClick={() => navigate('/seekers')} leftIcon={<ArrowLeft className="h-4 w-4" />}>
					Back to Seekers
				</Button>
			</div>

			{actionError && <p className="text-destructive mb-4 text-sm">{actionError}</p>}

			<div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
				{/* Left column: identity + account */}
				<div className="space-y-4 lg:col-span-1">
					<DetailSection title="Account">
						<div className="space-y-2 text-sm">
							<Row label="Mobile Number" value={seeker.mobileNumber} />
							<Row label="Email" value={seeker.email ?? '—'} />
							<Row label="City" value={seeker.city ?? '—'} />
							<Row label="State" value={seeker.state ?? '—'} />
							<Row label="Mobile Verified" value={seeker.isMobileVerified ? 'Yes' : 'No'} />
							<Row label="Joined" value={format(new Date(seeker.createdAt), 'dd MMM yyyy')} />
							<div className="flex items-center justify-between pt-1">
								<span className="text-muted-foreground">Account Status</span>
								<span className={`rounded-md px-2 py-1 text-xs font-medium ${accountStatusClassMap[seeker.status]}`}>
									{seeker.status}
								</span>
							</div>
						</div>
					</DetailSection>

					{profile && (
						<DetailSection title="Disability Certificate">
							<div className="space-y-3 text-sm">
								<Row label="Disability Type" value={profile.disabilityType.name} />
								<div className="flex items-center justify-between">
									<span className="text-muted-foreground">Status</span>
									<span
										className={`rounded-md px-2 py-1 text-xs font-medium ${certificateStatusClassMap[profile.certificateStatus]}`}
									>
										{profile.certificateStatus}
									</span>
								</div>
								{profile.certificateStatus === 'REJECTED' && profile.certificateRejectReason && (
									<p className="text-destructive text-xs">Reason: {profile.certificateRejectReason}</p>
								)}
								<a
									href={import.meta.env.VITE_BACKEND_URL + profile.disabilityCertificateUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="text-primary flex items-center gap-1 text-xs font-medium hover:underline"
								>
									<Download className="h-3.5 w-3.5" /> View Certificate
								</a>
								{profile.certificateStatus === 'PENDING' && (
									<div className="flex gap-2 pt-1">
										<Button
											size="sm"
											variantClassName="primary"
											disabled={isReviewing}
											onClick={handleApprove}
											leftIcon={<Check className="h-4 w-4" />}
										>
											Approve
										</Button>
										<Button
											size="sm"
											variant="outline"
											disabled={isReviewing}
											onClick={() => setIsRejectOpen(true)}
											leftIcon={<X className="h-4 w-4" />}
										>
											Reject
										</Button>
									</div>
								)}
							</div>
						</DetailSection>
					)}

					{profile && (
						<DetailSection title="Preferences">
							<div className="space-y-2 text-sm">
								<Row label="Gender" value={profile.gender ?? '—'} />
								<Row label="Date of Birth" value={format(new Date(profile.dateOfBirth), 'dd MMM yyyy')} />
								<Row label="Available for Remote" value={profile.availableForRemote ? 'Yes' : 'No'} />
								<Row label="Willing to Travel" value={profile.willingToTravel ? 'Yes' : 'No'} />
								<Row label="Profile Completed" value={profile.isProfileCompleted ? 'Yes' : 'No'} />
							</div>
						</DetailSection>
					)}
				</div>

				{/* Right column: bio + everything else */}
				<div className="space-y-4 lg:col-span-2">
					{profile?.bio && (
						<DetailSection title="Bio">
							<p className="text-muted-foreground text-sm whitespace-pre-line">{profile.bio}</p>
						</DetailSection>
					)}

					<DetailSection title="Education">
						{profile?.education.length ? (
							<div className="space-y-3">
								{profile.education.map((edu) => (
									<div key={edu.id} className="border-muted border-b pb-3 last:border-0 last:pb-0">
										<p className="text-sm font-medium">{edu.degree}{edu.fieldOfStudy ? ` — ${edu.fieldOfStudy}` : ''}</p>
										<p className="text-muted-foreground text-xs">{edu.institution}</p>
										<p className="text-muted-foreground text-xs">
											{edu.startYear} – {edu.currentlyStudying ? 'Present' : (edu.endYear ?? '—')}
										</p>
									</div>
								))}
							</div>
						) : (
							<EmptyText />
						)}
					</DetailSection>

					<DetailSection title="Experience">
						{profile?.experience.length ? (
							<div className="space-y-3">
								{profile.experience.map((exp) => (
									<div key={exp.id} className="border-muted border-b pb-3 last:border-0 last:pb-0">
										<p className="text-sm font-medium">{exp.position} — {exp.organization}</p>
										{exp.description && <p className="text-muted-foreground text-xs mt-1">{exp.description}</p>}
										<p className="text-muted-foreground text-xs mt-1">
											{exp.fresher
												? 'Fresher'
												: `${format(new Date(exp.startDate), 'MMM yyyy')} – ${
														exp.currentlyWorking ? 'Present' : exp.endDate ? format(new Date(exp.endDate), 'MMM yyyy') : '—'
													}`}
										</p>
									</div>
								))}
							</div>
						) : (
							<EmptyText />
						)}
					</DetailSection>

					<DetailSection title="Skills">
						{profile?.skills.length ? (
							<div className="flex flex-wrap gap-2">
								{profile.skills.map((skill) => (
									<span key={skill.id} className="bg-muted rounded-full px-3 py-1 text-xs font-medium">
										{skill.skillName}
									</span>
								))}
							</div>
						) : (
							<EmptyText />
						)}
					</DetailSection>

					<DetailSection title="Awards">
						{profile?.awards.length ? (
							<div className="space-y-2">
								{profile.awards.map((award) => (
									<div key={award.id} className="flex items-center justify-between text-sm">
										<span>{award.awardName}{award.organization ? ` — ${award.organization}` : ''}</span>
										<span className="text-muted-foreground text-xs">{award.year}</span>
									</div>
								))}
							</div>
						) : (
							<EmptyText />
						)}
					</DetailSection>

					<DetailSection title="Certifications">
						{profile?.certifications.length ? (
							<div className="space-y-2">
								{profile.certifications.map((cert) => (
									<div key={cert.id} className="flex items-center justify-between text-sm">
										<span>{cert.certificationName}{cert.issuedBy ? ` — ${cert.issuedBy}` : ''}</span>
										<span className="text-muted-foreground text-xs">{format(new Date(cert.date), 'MMM yyyy')}</span>
									</div>
								))}
							</div>
						) : (
							<EmptyText />
						)}
					</DetailSection>

					<DetailSection title="Portfolio">
						{profile?.portfolioItems.length ? (
							<div className="space-y-3">
								{profile.portfolioItems.map((item) => (
									<div key={item.id} className="border-muted border-b pb-3 last:border-0 last:pb-0">
										<p className="text-sm font-medium">{item.title}</p>
										{item.description && <p className="text-muted-foreground text-xs mt-1">{item.description}</p>}
									</div>
								))}
							</div>
						) : (
							<EmptyText />
						)}
					</DetailSection>

					<DetailSection title="Applications">
						{seeker.applications.length ? (
							<div className="space-y-2">
								{seeker.applications.map((app) => (
									<div key={app.id} className="flex items-center justify-between text-sm">
										<span className="text-muted-foreground text-xs">
											{format(new Date(app.appliedAt), 'dd MMM yyyy')}
										</span>
										<span
											className={`rounded-md px-2 py-1 text-xs font-medium ${applicationStatusClassMap[app.status]}`}
										>
											{app.status}
										</span>
									</div>
								))}
							</div>
						) : (
							<EmptyText />
						)}
					</DetailSection>
				</div>
			</div>

			<RejectCertificateDialog open={isRejectOpen} onOpenChange={setIsRejectOpen} onConfirm={handleReject} />
		</>
	);
};

const Row = ({ label, value }: { label: string; value: string }) => (
	<div className="flex items-center justify-between">
		<span className="text-muted-foreground">{label}</span>
		<span className="font-medium">{value}</span>
	</div>
);

const EmptyText = () => <p className="text-muted-foreground text-sm">Nothing added yet.</p>;

export default SeekerDetail;