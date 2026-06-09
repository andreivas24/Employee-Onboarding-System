import { useState } from 'react';
import axios from 'axios';
import { onboardingApi } from '../api/onboardingApi';
import type { CreateOnboardingRequest, HardwareTier } from '../types/onboarding';
import type { UserRole } from '../types/auth';
import '../styles/CreateRequest.css';

type Props = {
    role: UserRole;
    onCreated: () => void;
    isFormVisible: boolean;
    setIsFormVisible: (value: boolean) => void;
};

function CreateRequest({ onCreated, isFormVisible, setIsFormVisible }: Props) {
    const [formData, setFormData] = useState<CreateOnboardingRequest>({
    employeeName: '',
    employeeRole: '',
    startDate: '',
    hardwareTier: 'STANDARD',
    jobDescription: '',
    });

    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState<'success' | 'error'>('success');

    const handleCancel = () => {
        setIsFormVisible(false);
        setMessage('');
        setFormData({
            employeeName: '',
            employeeRole: '',
            startDate: '',
            hardwareTier: 'STANDARD',
            jobDescription: '',
        });
    };

    const handleChange = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
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

            setMessage('Request created successfully.');
            setMessageType('success');

            setFormData({
                employeeName: '',
                employeeRole: '',
                startDate: '',
                hardwareTier: 'STANDARD',
                jobDescription: '',
            });

            setIsFormVisible(false);
            onCreated();
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                setMessage(
                error.response?.data?.message ?? 'Failed to create request'
                );
            } else {
                setMessage('Unexpected error occurred.');
            }

            setMessageType('error');
        }
    };

  return (
    <section className="create-request-section">
      {message && (
        <p className={`create-message create-message-${messageType}`}>
            {message}
        </p>
        )
      }

      {isFormVisible && (
        <div className="create-request-card">
          <div className="create-request-header">
            <h2>Create Onboarding Request</h2>
            <p>Fill in the employee details and submit the request to Manager Review.</p>
          </div>

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
              <button type="submit" className="create-submit-button">
                Submit Request
              </button>

              <button type="button" className="create-cancel-button" onClick={handleCancel}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}

export default CreateRequest;