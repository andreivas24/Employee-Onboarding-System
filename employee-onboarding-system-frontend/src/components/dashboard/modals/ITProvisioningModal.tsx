import type { ITProvisioningRequest, OnboardingRequest } from '../../../types/onboarding';

type Props = {
    request: OnboardingRequest;
    form: ITProvisioningRequest;
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    onSave: () => void;
    onClose: () => void;
};

function ITProvisioningModal({ request, form, onChange, onSave, onClose }: Props) {
    return (
        <div className="modal-overlay">
            <div className="modal-card">
                <h2>Complete IT Provisioning</h2>
                <p>
                    Add company account details and laptop configuration for{' '}
                    <strong>{request.employeeName}</strong>.
                </p>

                <div className="modal-form-group">
                    <label>Company Email</label>
                    <input
                        name="companyEmail"
                        type="email"
                        placeholder="employee@company.com"
                        value={form.companyEmail}
                        onChange={onChange}
                    />
                </div>

                <div className="modal-form-group">
                    <label>Laptop Configuration</label>
                    <textarea
                        name="laptopConfiguration"
                        placeholder="Example: Dell Latitude, 16GB RAM, 512GB SSD"
                        value={form.laptopConfiguration}
                        onChange={onChange}
                    />
                </div>

                <div className="modal-actions">
                    <button className="primary-button" onClick={onSave}>
                        Save
                    </button>

                    <button className="secondary-button" onClick={onClose}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ITProvisioningModal;