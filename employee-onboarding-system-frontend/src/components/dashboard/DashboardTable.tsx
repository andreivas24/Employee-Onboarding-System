import type { OnboardingRequest } from '../../types/onboarding';
import type { UserRole } from '../../types/auth';

type Props = {
    requests: OnboardingRequest[];
    role: UserRole;
    canApproveOrReject: (request: OnboardingRequest) => boolean;
    canCompleteItProvisioning: (request: OnboardingRequest) => boolean;
    canResubmit: (request: OnboardingRequest) => boolean;
    onApprove: (request: OnboardingRequest) => void;
    onReject: (request: OnboardingRequest) => void;
    onResubmit: (request: OnboardingRequest) => void;
    onOpenFinanceForm: (request: OnboardingRequest) => void;
    onOpenItForm: (request: OnboardingRequest) => void;
    onOpenHistory: (request: OnboardingRequest) => void;
    onOpenComments: (request: OnboardingRequest) => void;
    onDelete: (request: OnboardingRequest) => void;
};

function DashboardTable({
    requests,
    role,
    canApproveOrReject,
    canCompleteItProvisioning,
    canResubmit,
    onApprove,
    onReject,
    onResubmit,
    onOpenFinanceForm,
    onOpenItForm,
    onOpenHistory,
    onOpenComments,
    onDelete,
}: Props) {
    return (
        <table className="dashboard-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Employee</th>
                    <th>Role</th>
                    <th>Start Date</th>
                    <th>Hardware</th>
                    <th>Status</th>
                    <th>Job Description</th>
                    <th>Actions</th>
                    <th>History</th>
                    <th>Comments</th>
                </tr>
            </thead>

            <tbody>
                {requests.map((request) => (
                    <tr key={request.id}>
                        <td>{request.id}</td>
                        <td>{request.employeeName}</td>
                        <td>{request.employeeRole}</td>
                        <td>{request.startDate}</td>
                        <td>{request.hardwareTier}</td>
                        <td>
                            <span className={`status-badge status-${request.status.toLowerCase()}`}>
                                {request.status}
                            </span>
                        </td>
                        <td>{request.jobDescription}</td>

                        <td>
                            <div className="action-group">
                                {canApproveOrReject(request) && request.status === 'MANAGER_REVIEW' && (
                                    <>
                                        <button className="primary-button" onClick={() => onApprove(request)}>
                                            Approve
                                        </button>

                                        <button className="danger-button" onClick={() => onReject(request)}>
                                            Reject
                                        </button>
                                    </>
                                )}

                                {role === 'FINANCE' && request.status === 'FINANCE_APPROVAL' && (
                                    <>
                                        <button
                                            className="primary-button"
                                            onClick={() => onOpenFinanceForm(request)}
                                        >
                                            Approve Budget
                                        </button>

                                        <button className="danger-button" onClick={() => onReject(request)}>
                                            Reject
                                        </button>
                                    </>
                                )}

                                {canCompleteItProvisioning(request) && (
                                    <>
                                        <button className="primary-button" onClick={() => onOpenItForm(request)}>
                                            Complete IT
                                        </button>

                                        <button className="danger-button" onClick={() => onReject(request)}>
                                            Reject
                                        </button>
                                    </>
                                )}

                                {canResubmit(request) && (
                                    <button className="secondary-button" onClick={() => onResubmit(request)}>
                                        Resubmit
                                    </button>
                                )}

                                {request.status === 'COMPLETED' && (
                                    <span className="completed-label">Completed</span>
                                )}

                                {role === 'ADMIN' && (
                                    <button
                                        className="danger-button"
                                        onClick={() => onDelete(request)}
                                    >
                                        Delete
                                    </button>
                                )}

                                {!canApproveOrReject(request) &&
                                    !canCompleteItProvisioning(request) &&
                                    !canResubmit(request) &&
                                    request.status !== 'COMPLETED' && (
                                    <span className="no-actions-label">No actions available</span>
                                )}
                            </div>
                        </td>

                        <td>
                            {role !== 'VIEWER' ? (
                                <button className="history-button" onClick={() => onOpenHistory(request)}>
                                    View History
                                </button>
                            ) : (
                                <span className="no-actions-label">Read only</span>
                            )}
                        </td>

                        <td>
                            {role !== 'VIEWER' ? (
                                <button className="history-button" onClick={() => onOpenComments(request)}>
                                    Comments
                                </button>
                            ) : (
                                <span className="no-actions-label">Read only</span>
                            )}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

export default DashboardTable;