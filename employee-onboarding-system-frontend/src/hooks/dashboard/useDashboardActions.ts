import { onboardingApi } from '../../api/onboardingApi';
import type { UserRole } from '../../types/auth';
import type { OnboardingRequest } from '../../types/onboarding';

type ShowNotification = (type: 'success' | 'error', message: string) => void;

export function useDashboardActions(
    role: UserRole,
    loadRequests: () => Promise<void>,
    showNotification: ShowNotification,
    openEditForm: (request: OnboardingRequest) => void
) {
    const canApproveOrReject = (request: OnboardingRequest) => {
        if (request.status === 'MANAGER_REVIEW') {
            return role === 'MANAGER';
        }

        if (request.status === 'FINANCE_APPROVAL') {
            return role === 'FINANCE';
        }

        return false;
    };

    const canCompleteItProvisioning = (request: OnboardingRequest) => {
        return request.status === 'IT_PROVISIONING' && role === 'IT';
    };

    const canResubmit = (request: OnboardingRequest) => {
        return request.status === 'NEEDS_REWORK' && role === 'HR';
    };

    const handleApprove = async (request: OnboardingRequest) => {
        try {
            await onboardingApi.approve(request.id);

            showNotification(
                'success',
                request.hardwareTier === 'PREMIUM'
                    ? 'Request approved by Manager and sent to Finance for budget approval.'
                    : 'Request approved by Manager and sent to IT Provisioning.'
            );

            await loadRequests();
        } catch {
            showNotification('error', 'Failed to approve request.');
        }
    };

    const handleReject = async (request: OnboardingRequest) => {
        const reason = window.prompt('Enter rejection reason:');

        if (!reason) {
            return;
        }

        try {
            await onboardingApi.reject(request.id, {
                rejectionReason: reason,
            });

            showNotification(
                'success',
                'Request rejected and sent back to HR for rework.'
            );

            await loadRequests();
        } catch {
            showNotification('error', 'Failed to reject request.');
        }
    };

    const handleResubmit = async (request: OnboardingRequest) => {
        const confirmWithoutChanges = window.confirm(
            'Do you want to resubmit this request without making any changes?'
        );

        if (confirmWithoutChanges) {
            try {
                await onboardingApi.resubmit(request.id);

                showNotification(
                    'success',
                    'Request resubmitted by HR and sent back to Manager Review.'
                );

                await loadRequests();
            } catch {
                showNotification('error', 'Failed to resubmit request.');
            }

            return;
        }

        openEditForm(request);
    };

    const handleDelete = async (request: OnboardingRequest) => {
        const confirmed = window.confirm(
            `Delete onboarding request for ${request.employeeName}?`
        );

        if (!confirmed) {
            return;
        }

        try {
            await onboardingApi.deleteRequest(request.id);

            showNotification(
                'success',
                'Onboarding request deleted successfully.'
            );

            await loadRequests();
        } catch {
            showNotification(
                'error',
                'Failed to delete onboarding request.'
            );
        }
    };

    const handleExportExcel = async () => {
        try {
            await onboardingApi.exportExcel();
            showNotification('success', 'Excel file exported successfully.');
        } catch {
            showNotification('error', 'Failed to export Excel file.');
        }
    };

    return {
        canApproveOrReject,
        canCompleteItProvisioning,
        canResubmit,
        handleApprove,
        handleReject,
        handleResubmit,
        handleDelete,
        handleExportExcel,
    };
}