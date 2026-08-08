import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Eye, Check, X } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router';
import { useState } from 'react';
import CustomSelect from '../custom-controls/custom-select';
import RejectCertificateDialog from './reject-certificate-dialog';
import { seekerService } from '@/services/seeker.service';
import { getApiErrorMessage } from '@/lib/http';
import {
	accountStatusOptions,
	accountStatusClassMap,
	certificateStatusClassMap
} from '@/constants/seeker-table-constants';
import type { AdminSeeker, AccountStatus, CertificateReviewResult } from '@/types/seeker.types';

interface IDataTableProps {
	data: AdminSeeker[];
	currentPage: number;
	totalPages: number;
	onPageChange: (page: number) => void;
	setSeekersData: (data: AdminSeeker[]) => void;
	seekersData: AdminSeeker[];
	isLoading?: boolean;
}

const DataTable = ({
	data,
	currentPage,
	totalPages,
	onPageChange,
	setSeekersData,
	seekersData,
	isLoading
}: IDataTableProps) => {
	const navigate = useNavigate();
	const [rejectTargetId, setRejectTargetId] = useState<string | null>(null);
	const [pendingActionId, setPendingActionId] = useState<string | null>(null);

	const patchSeeker = (updated: AdminSeeker) => {
		setSeekersData(seekersData.map((s) => (s.id === updated.id ? updated : s)));
	};

	const patchSeekerCertificate = (seekerId: string, result: CertificateReviewResult) => {
		setSeekersData(
			seekersData.map((s) =>
				s.id === seekerId && s.seekerProfile
					? {
							...s,
							seekerProfile: {
								...s.seekerProfile,
								certificateStatus: result.certificateStatus
							}
						}
					: s
			)
		);
	};

	const handleAccountStatusChange = async (seeker: AdminSeeker, status: AccountStatus) => {
		const previous = seeker.status;
		// optimistic update
		patchSeeker({ ...seeker, status });
		setPendingActionId(seeker.id);
		try {
			const updated = await seekerService.updateStatus(seeker.id, status);
			patchSeeker(updated);
		} catch (err) {
			patchSeeker({ ...seeker, status: previous }); // revert on failure
			alert(getApiErrorMessage(err, 'Failed to update account status'));
		} finally {
			setPendingActionId(null);
		}
	};

	const handleApproveCertificate = async (seeker: AdminSeeker) => {
		if (!seeker.seekerProfile) return;
		setPendingActionId(seeker.id);
		try {
			const result = await seekerService.reviewCertificate(seeker.id, 'APPROVED');
			patchSeekerCertificate(seeker.id, result);
		} catch (err) {
			alert(getApiErrorMessage(err, 'Failed to approve certificate'));
		} finally {
			setPendingActionId(null);
		}
	};

	const handleRejectCertificate = async (reason: string) => {
		if (!rejectTargetId) return;
		const result = await seekerService.reviewCertificate(rejectTargetId, 'REJECTED', reason);
		patchSeekerCertificate(rejectTargetId, result);
		setRejectTargetId(null);
	};

	return (
		<div className="space-y-4">
			<div className="w-full">
				<Table>
					<TableHeader className="table-row-background">
						<TableRow className="!border-none">
							<TableHead className="rounded-l-md !border-none pl-4">Name</TableHead>
							<TableHead>Location</TableHead>
							<TableHead>Disability Type</TableHead>
							<TableHead>Certificate</TableHead>
							<TableHead>Joined</TableHead>
							<TableHead>Account Status</TableHead>
							<TableHead className="rounded-r-md !border-none pr-1">Action</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody className="!px-3">
						{!isLoading && data.length === 0 && (
							<TableRow>
								<TableCell colSpan={7} className="text-muted-foreground py-8 text-center">
									No seekers found.
								</TableCell>
							</TableRow>
						)}
						{data.map((seeker) => (
							<TableRow key={seeker.id} className="!border-none">
								<TableCell className="pl-4">
									<h6 className="text-sm font-medium">{seeker.fullName}</h6>
									<h6 className="text-muted-foreground mt-[4px]">{seeker.mobileNumber}</h6>
								</TableCell>
								<TableCell>
									<h6 className="text-sm font-medium">{seeker.city ?? '—'}</h6>
									<h6 className="text-muted-foreground mt-[4px]">{seeker.state ?? ''}</h6>
								</TableCell>
								<TableCell>
									<h6 className="text-sm font-medium">
										{seeker.seekerProfile?.disabilityType.name ?? '—'}
									</h6>
								</TableCell>
								<TableCell>
									{seeker.seekerProfile ? (
										<div className="flex items-center gap-2">
											<span
												className={`rounded-md px-2 py-1 text-xs font-medium ${certificateStatusClassMap[seeker.seekerProfile.certificateStatus]}`}
											>
												{seeker.seekerProfile.certificateStatus}
											</span>
											{seeker.seekerProfile.certificateStatus === 'PENDING' && (
												<div className="flex items-center gap-1">
													<Button
														variant="outline"
														size="icon"
														className="h-7 w-7"
														disabled={pendingActionId === seeker.id}
														onClick={() => handleApproveCertificate(seeker)}
														leftIcon={<Check className="h-3.5 w-3.5 text-emerald-500" />}
													/>
													<Button
														variant="outline"
														size="icon"
														className="h-7 w-7"
														disabled={pendingActionId === seeker.id}
														onClick={() => setRejectTargetId(seeker.id)}
														leftIcon={<X className="h-3.5 w-3.5 text-destructive" />}
													/>
												</div>
											)}
										</div>
									) : (
										<span className="text-muted-foreground text-sm">No profile</span>
									)}
								</TableCell>
								<TableCell>
									<h6 className="text-sm font-medium">{format(new Date(seeker.createdAt), 'dd MMM yyyy')}</h6>
								</TableCell>
								<TableCell>
									<CustomSelect
										value={seeker.status}
										disabled={pendingActionId === seeker.id}
										onValueChange={(value) => handleAccountStatusChange(seeker, value as AccountStatus)}
										options={accountStatusOptions}
										placeholder="Select status"
										className={`w-[150px] !border-none ${accountStatusClassMap[seeker.status]}`}
									/>
								</TableCell>
								<TableCell>
									<Button
										variant="outline"
										size="sm"
										variantClassName="primary"
										onClick={() => navigate(`/seekers/${seeker.id}`)}
										leftIcon={<Eye className="h-4 w-4" />}
									>
										View
									</Button>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>

			<div className="flex items-center justify-end space-x-2">
				<div className="text-muted-foreground text-sm">
					{currentPage} - {totalPages} of {totalPages}
				</div>
				<Button
					variant="outline"
					size="icon"
					onClick={() => onPageChange(currentPage - 1)}
					disabled={currentPage === 1}
					leftIcon={<ChevronLeft className="h-4 w-4" />}
				/>
				<Button
					variant="outline"
					size="icon"
					onClick={() => onPageChange(currentPage + 1)}
					disabled={currentPage === totalPages}
					leftIcon={<ChevronRight className="h-4 w-4" />}
				/>
			</div>

			<RejectCertificateDialog
				open={!!rejectTargetId}
				onOpenChange={(open) => !open && setRejectTargetId(null)}
				onConfirm={handleRejectCertificate}
			/>
		</div>
	);
};

export default DataTable;