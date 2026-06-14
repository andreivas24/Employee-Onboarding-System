import type { OnboardingComment } from '../../types/comment';
import type {
    FinanceApprovalRequest,
    ITProvisioningRequest,
    OnboardingHistory,
    OnboardingRequest,
    UpdateOnboardingRequest,
} from '../../types/onboarding';

import HistoryModal from './modals/HistoryModal';
import CommentsModal from './modals/CommentsModal';
import ITProvisioningModal from './modals/ITProvisioningModal';
import FinanceApprovalModal from './modals/FinanceApprovalModal';
import EditRequestForm from './modals/EditRequestForm';

type Props = {
    selectedHistoryRequest: OnboardingRequest | null;
    historyItems: OnboardingHistory[];
    historyLoading: boolean;
    onCloseHistoryModal: () => void;

    selectedCommentsRequest: OnboardingRequest | null;
    comments: OnboardingComment[];
    commentText: string;
    commentsLoading: boolean;
    onCommentTextChange: (value: string) => void;
    onAddComment: () => void;
    onCloseCommentsModal: () => void;

    selectedEditRequest: OnboardingRequest | null;
    editForm: UpdateOnboardingRequest;
    onEditFormChange: (
        event: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => void;
    onUpdateAndResubmit: () => void;
    onCloseEditForm: () => void;

    selectedItRequest: OnboardingRequest | null;
    itForm: ITProvisioningRequest;
    onItFormChange: (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => void;
    onCompleteItProvisioning: () => void;
    onCloseItProvisioningForm: () => void;

    selectedFinanceRequest: OnboardingRequest | null;
    financeForm: FinanceApprovalRequest;
    onFinanceFormChange: (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => void;
    onFinanceApprove: () => void;
    onCloseFinanceForm: () => void;
};

function DashboardModals({
    selectedHistoryRequest,
    historyItems,
    historyLoading,
    onCloseHistoryModal,

    selectedCommentsRequest,
    comments,
    commentText,
    commentsLoading,
    onCommentTextChange,
    onAddComment,
    onCloseCommentsModal,

    selectedEditRequest,
    editForm,
    onEditFormChange,
    onUpdateAndResubmit,
    onCloseEditForm,

    selectedItRequest,
    itForm,
    onItFormChange,
    onCompleteItProvisioning,
    onCloseItProvisioningForm,

    selectedFinanceRequest,
    financeForm,
    onFinanceFormChange,
    onFinanceApprove,
    onCloseFinanceForm,
}: Props) {
    return (
        <>
            {selectedHistoryRequest && (
                <HistoryModal
                    request={selectedHistoryRequest}
                    historyItems={historyItems}
                    loading={historyLoading}
                    onClose={onCloseHistoryModal}
                />
            )}

            {selectedCommentsRequest && (
                <CommentsModal
                    request={selectedCommentsRequest}
                    comments={comments}
                    commentText={commentText}
                    loading={commentsLoading}
                    onCommentTextChange={onCommentTextChange}
                    onAddComment={onAddComment}
                    onClose={onCloseCommentsModal}
                />
            )}

            {selectedEditRequest && (
                <EditRequestForm
                    request={selectedEditRequest}
                    form={editForm}
                    onChange={onEditFormChange}
                    onSubmit={onUpdateAndResubmit}
                    onCancel={onCloseEditForm}
                />
            )}

            {selectedItRequest && (
                <ITProvisioningModal
                    request={selectedItRequest}
                    form={itForm}
                    onChange={onItFormChange}
                    onSave={onCompleteItProvisioning}
                    onClose={onCloseItProvisioningForm}
                />
            )}

            {selectedFinanceRequest && (
                <FinanceApprovalModal
                    request={selectedFinanceRequest}
                    form={financeForm}
                    onChange={onFinanceFormChange}
                    onSave={onFinanceApprove}
                    onClose={onCloseFinanceForm}
                />
            )}
        </>
    );
}

export default DashboardModals;