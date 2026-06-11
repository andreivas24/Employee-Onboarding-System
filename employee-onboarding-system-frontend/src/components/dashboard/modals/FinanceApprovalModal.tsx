import type { FinanceApprovalRequest, OnboardingRequest } from '../../../types/onboarding';

type Props = {
    request: OnboardingRequest;
    form: FinanceApprovalRequest;
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    onSave: () => void;
    onClose: () => void;
};

function FinanceApprovalModal({ request, form, onChange, onSave, onClose }: Props) {
    return (
        <div className="modal-overlay">
            <div className="modal-card">
                <h2>Approve Hardware Budget</h2>
                <p>
                    Add approved budget details for <strong>{request.employeeName}</strong>.
                </p>

                <div className="modal-form-group">
                    <label>Approved Budget</label>
                    <input
                        name="approvedBudget"
                        type="number"
                        placeholder="Approved budget"
                        value={form.approvedBudget}
                        onChange={onChange}
                    />
                </div>

                <div className="modal-form-group">
                    <label>Finance Notes</label>
                    <textarea
                        name="financeNotes"
                        placeholder="Finance notes"
                        value={form.financeNotes}
                        onChange={onChange}
                    />
                </div>

                <div className="modal-actions">
                    <button className="primary-button" onClick={onSave}>
                        Save Budget
                    </button>

                    <button className="secondary-button" onClick={onClose}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}

export default FinanceApprovalModal;