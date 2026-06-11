import type { OnboardingRequest, UpdateOnboardingRequest } from '../../../types/onboarding';

type Props = {
    request: OnboardingRequest;
    form: UpdateOnboardingRequest;
    onChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => void;
    onSubmit: () => void;
    onCancel: () => void;
};

function EditRequestForm({ request, form, onChange, onSubmit, onCancel }: Props) {
    return (
        <div className="edit-request-card">
            <div className="edit-request-header">
                <h2>Edit Onboarding Request</h2>
                <p>
                    Update the request details for <strong>{request.employeeName}</strong> before
                    resubmitting.
                </p>
            </div>

            <div className="edit-request-form">
                <div className="edit-form-group">
                    <label>Employee Name</label>
                    <input name="employeeName" value={form.employeeName} onChange={onChange} />
                </div>

                <div className="edit-form-group">
                    <label>Employee Role</label>
                    <input name="employeeRole" value={form.employeeRole} onChange={onChange} />
                </div>

                <div className="edit-form-group">
                    <label>Start Date</label>
                    <input type="date" name="startDate" value={form.startDate} onChange={onChange} />
                </div>

                <div className="edit-form-group">
                    <label>Hardware Tier</label>
                    <select name="hardwareTier" value={form.hardwareTier} onChange={onChange}>
                    <option value="STANDARD">STANDARD</option>
                    <option value="PREMIUM">PREMIUM</option>
                    </select>
                </div>

                <div className="edit-form-group">
                    <label>Job Description</label>
                    <textarea name="jobDescription" value={form.jobDescription} onChange={onChange} />
                </div>

                <div className="edit-form-actions">
                    <button className="edit-submit-button" onClick={onSubmit}>
                        Update & Resubmit
                    </button>

                    <button className="edit-cancel-button" onClick={onCancel}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}

export default EditRequestForm;