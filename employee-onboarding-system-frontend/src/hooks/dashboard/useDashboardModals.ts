import { useState } from 'react';
import { commentApi } from '../../api/commentApi';
import { onboardingApi } from '../../api/onboardingApi';
import type { OnboardingComment } from '../../types/comment';
import type {
    FinanceApprovalRequest,
    ITProvisioningRequest,
    OnboardingHistory,
    OnboardingRequest,
    UpdateOnboardingRequest,
} from '../../types/onboarding';

type ShowNotification = (type: 'success' | 'error', message: string) => void;

const initialEditForm: UpdateOnboardingRequest = {
    employeeName: '',
    employeeRole: '',
    startDate: '',
    hardwareTier: 'STANDARD',
    jobDescription: '',
};

const initialFinanceForm: FinanceApprovalRequest = {
    approvedBudget: 0,
    financeNotes: '',
};

const initialItForm: ITProvisioningRequest = {
    companyEmail: '',
    laptopConfiguration: '',
};

export function useDashboardModals(
    loadRequests: () => Promise<void>,
    showNotification: ShowNotification
) {
    const [selectedCommentsRequest, setSelectedCommentsRequest] =
        useState<OnboardingRequest | null>(null);
        const [comments, setComments] = useState<OnboardingComment[]>([]);
        const [commentText, setCommentText] = useState('');
        const [commentsLoading, setCommentsLoading] = useState(false);

        const [selectedEditRequest, setSelectedEditRequest] = useState<OnboardingRequest | null>(null);
        const [editForm, setEditForm] = useState<UpdateOnboardingRequest>(initialEditForm);

        const [selectedHistoryRequest, setSelectedHistoryRequest] = useState<OnboardingRequest | null>(null);
        const [historyItems, setHistoryItems] = useState<OnboardingHistory[]>([]);
        const [historyLoading, setHistoryLoading] = useState(false);

        const [selectedFinanceRequest, setSelectedFinanceRequest] = useState<OnboardingRequest | null>(null);
        const [financeForm, setFinanceForm] = useState<FinanceApprovalRequest>(initialFinanceForm);

        const [selectedItRequest, setSelectedItRequest] = useState<OnboardingRequest | null>(null);
        const [itForm, setItForm] = useState<ITProvisioningRequest>(initialItForm);

        const openEditForm = (request: OnboardingRequest) => {
            setSelectedEditRequest(request);
            setEditForm({
                employeeName: request.employeeName,
                employeeRole: request.employeeRole,
                startDate: request.startDate,
                hardwareTier: request.hardwareTier,
                jobDescription: request.jobDescription,
            });
        };

    const closeEditForm = () => {
        setSelectedEditRequest(null);
        setEditForm(initialEditForm);
    };

    const handleEditFormChange = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = event.target;

        setEditForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleUpdateAndResubmit = async () => {
        if (!selectedEditRequest) {
            return;
        }

        try {
            await onboardingApi.update(selectedEditRequest.id, editForm);
            await onboardingApi.resubmit(selectedEditRequest.id);

            closeEditForm();

            showNotification(
            'success',
            'Request updated and sent back to Manager Review.'
            );

            await loadRequests();
        } catch {
            showNotification('error', 'Failed to update and resubmit request.');
        }
    };

    const openHistoryModal = async (request: OnboardingRequest) => {
        try {
            setSelectedHistoryRequest(request);
            setHistoryLoading(true);

            const data = await onboardingApi.getHistory(request.id);
            setHistoryItems(data);
        } catch {
            showNotification('error', 'Failed to load request history.');
        } finally {
            setHistoryLoading(false);
        }
    };

    const closeHistoryModal = () => {
        setSelectedHistoryRequest(null);
        setHistoryItems([]);
        };

    const openCommentsModal = async (request: OnboardingRequest) => {
        try {
            setSelectedCommentsRequest(request);
            setCommentsLoading(true);

            const data = await commentApi.getComments(request.id);
            setComments(data);
        } catch {
            showNotification('error', 'Failed to load comments.');
        } finally {
            setCommentsLoading(false);
        }
    };

    const closeCommentsModal = () => {
        setSelectedCommentsRequest(null);
        setComments([]);
        setCommentText('');
    };

    const handleAddComment = async () => {
        if (!selectedCommentsRequest) {
            return;
        }

        if (!commentText.trim()) {
            showNotification('error', 'Comment cannot be empty.');
            return;
        }

        try {
            await commentApi.addComment(selectedCommentsRequest.id, {
                commentText,
            });

            setCommentText('');

            const data = await commentApi.getComments(selectedCommentsRequest.id);
            setComments(data);

            showNotification('success', 'Comment added successfully.');
        } catch {
            showNotification('error', 'Failed to add comment.');
        }
    };

    const openItProvisioningForm = (request: OnboardingRequest) => {
        setSelectedItRequest(request);
        setItForm({
            companyEmail: request.companyEmail ?? '',
            laptopConfiguration: request.laptopConfiguration ?? '',
        });
    };

    const closeItProvisioningForm = () => {
        setSelectedItRequest(null);
        setItForm(initialItForm);
    };

    const handleItFormChange = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = event.target;

        setItForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleCompleteItProvisioning = async () => {
        if (!selectedItRequest) {
            return;
        }

        if (!itForm.companyEmail.trim() || !itForm.laptopConfiguration.trim()) {
            showNotification('error', 'Please complete both IT provisioning fields.');
            return;
        }

        try {
            await onboardingApi.approve(selectedItRequest.id, itForm);

            showNotification(
                'success',
                'IT provisioning completed. Onboarding request is now completed.'
            );

            closeItProvisioningForm();
            await loadRequests();
        } catch {
            showNotification('error', 'Failed to complete IT provisioning.');
        }
    };

    const openFinanceForm = (request: OnboardingRequest) => {
        setSelectedFinanceRequest(request);
        setFinanceForm({
            approvedBudget: request.approvedBudget ?? 0,
            financeNotes: request.financeNotes ?? '',
        });
    };

    const closeFinanceForm = () => {
        setSelectedFinanceRequest(null);
        setFinanceForm(initialFinanceForm);
    };

    const handleFinanceFormChange = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = event.target;

        setFinanceForm((prev) => ({
            ...prev,
            [name]: name === 'approvedBudget' ? Number(value) : value,
        }));
    };

    const handleFinanceApprove = async () => {
        if (!selectedFinanceRequest) {
            return;
        }

        if (!financeForm.approvedBudget || financeForm.approvedBudget <= 0) {
            showNotification('error', 'Please enter a valid approved budget.');
            return;
        }

        try {
            await onboardingApi.financeApprove(selectedFinanceRequest.id, financeForm);

            showNotification(
                'success',
                'Budget approved by Finance. Request sent to IT Provisioning.'
            );

            closeFinanceForm();
            await loadRequests();
        } catch {
            showNotification('error', 'Failed to approve finance budget.');
        }
    };

  return {
    selectedCommentsRequest,
    comments,
    commentText,
    commentsLoading,
    selectedEditRequest,
    editForm,
    selectedHistoryRequest,
    historyItems,
    historyLoading,
    selectedFinanceRequest,
    financeForm,
    selectedItRequest,
    itForm,
    setCommentText,
    openEditForm,
    closeEditForm,
    handleEditFormChange,
    handleUpdateAndResubmit,
    openHistoryModal,
    closeHistoryModal,
    openCommentsModal,
    closeCommentsModal,
    handleAddComment,
    openItProvisioningForm,
    closeItProvisioningForm,
    handleItFormChange,
    handleCompleteItProvisioning,
    openFinanceForm,
    closeFinanceForm,
    handleFinanceFormChange,
    handleFinanceApprove,
  };
}