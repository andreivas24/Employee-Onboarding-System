import { useState } from 'react';
import axios from 'axios';
import { onboardingApi } from '../../../api/onboardingApi';
import type { CreateOnboardingRequest, HardwareTier } from '../../../types/onboarding';
import type { UserRole } from '../../../types/auth';
import '../../../styles/CreateRequest.css';

type Props = {
  role: UserRole;
  onCreated: () => void;
  isFormVisible: boolean;
  setIsFormVisible: (value: boolean) => void;
  showNotification: (
    type: 'success' | 'error',
    message: string
  ) => void;
};

const initialFormData: CreateOnboardingRequest = {
  employeeName: '',
  employeeRole: '',
  startDate: '',
  hardwareTier: 'STANDARD',
  jobDescription: '',
};

function CreateRequest({ onCreated, isFormVisible, setIsFormVisible, showNotification }: Props) {
  const [formData, setFormData] = useState<CreateOnboardingRequest>(initialFormData);

  const [message, setMessage] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  if (!isFormVisible) {
    return null;
  }

  const resetForm = () => {
    setFormData(initialFormData);
    setMessage('');
  };

  const handleCancel = () => {
    resetForm();
    setIsFormVisible(false);
  };

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      await onboardingApi.create({
        ...formData,
        hardwareTier: formData.hardwareTier as HardwareTier,
      });

      showNotification(
        'success',
        'Onboarding request created successfully and sent to Manager Review.'
      );

      resetForm();
      setIsFormVisible(false);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        showNotification(
          'error',
          error.response?.data?.message ?? 'Failed to create request.'
        );
      } else {
        showNotification('error', 'Unexpected error occurred.');
      }

      return;
    }

    try {
      await onCreated();
    } catch {
      showNotification(
        'error',
        'Request was created, but the dashboard could not be refreshed.'
      );
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card create-request-modal-card">
        <div className="create-request-header">
          <h2>Create Onboarding Request</h2>
          <p>
            Fill in the employee details and submit the request to Manager Review.
          </p>
        </div>

        {message && (
          <p className={`create-message create-message-${messageType}`}>
            {message}
          </p>
        )}

        <form onSubmit={handleSubmit} className="create-request-form">
          <div className="create-form-group">
            <label>Employee Name</label>
            <input
              name="employeeName"
              value={formData.employeeName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="create-form-group">
            <label>Employee Role</label>
            <input
              name="employeeRole"
              value={formData.employeeRole}
              onChange={handleChange}
              required
            />
          </div>

          <div className="create-form-group">
            <label>Start Date</label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="create-form-group">
            <label>Hardware Tier</label>
            <select
              name="hardwareTier"
              value={formData.hardwareTier}
              onChange={handleChange}
            >
              <option value="STANDARD">STANDARD</option>
              <option value="PREMIUM">PREMIUM</option>
            </select>
          </div>

          <div className="create-form-group">
            <label>Job Description</label>
            <textarea
              name="jobDescription"
              value={formData.jobDescription}
              onChange={handleChange}
              required
            />
          </div>

          <div className="create-form-actions">
            <button type="submit" className="primary-button">
              Submit Request
            </button>

            <button type="button" className="secondary-button" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateRequest;