import type { OnboardingHistory, OnboardingRequest } from '../../../types/onboarding';

type Props = {
    request: OnboardingRequest;
    historyItems: OnboardingHistory[];
    loading: boolean;
    onClose: () => void;
};

function HistoryModal({ request, historyItems, loading, onClose }: Props) {
    return (
    <div className="modal-overlay">
        <div className="modal-card history-modal-card">
            <h2>Workflow History</h2>
            <p>
                Audit trail for <strong>{request.employeeName}</strong>
            </p>

            {loading && <p className="dashboard-message">Loading history...</p>}

            {!loading && historyItems.length === 0 && (
                <p className="no-actions-label">No history available.</p>
            )}

            {!loading && historyItems.length > 0 && (
                <div className="history-timeline">
                    {historyItems.map((item) => (
                        <div className="history-item" key={item.id}>
                            <div className="history-dot" />

                            <div className="history-content">
                                <div className="history-header">
                                    <span className="history-action">{item.action}</span>
                                    <span className={`role-badge role-${item.performedByRole.toLowerCase()}`}>
                                        {item.performedByRole}
                                    </span>
                                </div>

                                    <p className="history-notes">{item.notes}</p>

                                    <p className="history-date">
                                        {new Date(item.createdAt).toLocaleString()}
                                    </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="modal-actions">
                <button className="secondary-button" onClick={onClose}>
                    Close
                </button>
            </div>
        </div>
    </div>
    );
}

export default HistoryModal;