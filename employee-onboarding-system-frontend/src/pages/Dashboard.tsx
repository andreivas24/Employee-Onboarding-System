/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from 'react';
import { onboardingApi } from '../api/onboardingApi';
import type { FinanceApprovalRequest, ITProvisioningRequest, OnboardingRequest, UpdateOnboardingRequest, OnboardingHistory, DashboardStats } from '../types/onboarding';
import type { UserRole } from '../types/auth';
import '../styles/Dashboard.css';

type Props = {
  role: UserRole;
  onCreateRequest?: () => void;
};

function Dashboard({ role, onCreateRequest }: Props) {
    const [requests, setRequests] = useState<OnboardingRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [stats, setStats] = useState<DashboardStats | null>(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [hardwareFilter, setHardwareFilter] = useState('ALL');
    const [currentPage, setCurrentPage] = useState(1);

    const pageSize = 10;

    const [selectedEditRequest, setSelectedEditRequest] = useState<OnboardingRequest | null>(null);
    const [editForm, setEditForm] = useState<UpdateOnboardingRequest>({
        employeeName: '',
        employeeRole: '',
        startDate: '',
        hardwareTier: 'STANDARD',
        jobDescription: '',
    });

    const [selectedHistoryRequest, setSelectedHistoryRequest] = useState<OnboardingRequest | null>(null);
    const [historyItems, setHistoryItems] = useState<OnboardingHistory[]>([]);
    const [historyLoading, setHistoryLoading] = useState(false);

    const [selectedFinanceRequest, setSelectedFinanceRequest] = useState<OnboardingRequest | null>(null);
    const [financeForm, setFinanceForm] = useState<FinanceApprovalRequest>({
        approvedBudget: 0,
        financeNotes: '',
    });

    const [selectedItRequest, setSelectedItRequest] = useState<OnboardingRequest | null>(null);
        const [itForm, setItForm] = useState<ITProvisioningRequest>({
        companyEmail: '',
        laptopConfiguration: '',
    });

    const [notification, setNotification] = useState<{
        type: 'success' | 'error';
        message: string;
    } | null>(null);

    const showNotification = (type: 'success' | 'error', message: string) => {
        setNotification({ type, message });
        setTimeout(() => {
            setNotification(null);
        }, 3500);
    };

    const filteredRequests = requests.filter((request) => {
        const matchesSearch =
            request.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            request.employeeRole.toLowerCase().includes(searchTerm.toLowerCase()) ||
            request.jobDescription.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'ALL' || request.status === statusFilter;
        const matchesHardware = hardwareFilter === 'ALL' || request.hardwareTier === hardwareFilter;

        return matchesSearch && matchesStatus && matchesHardware;
    });

    const totalPages = Math.ceil(filteredRequests.length / pageSize);

    const paginatedRequests = filteredRequests.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    const goToPreviousPage = () => {
        setCurrentPage((prev) => Math.max(prev - 1, 1));
    };

    const goToNextPage = () => {
        setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    };

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
        setCurrentPage(1);
    };

    const handleStatusFilterChange = (
        event: React.ChangeEvent<HTMLSelectElement>
    ) => {
        setStatusFilter(event.target.value);
        setCurrentPage(1);
    };

    const handleHardwareFilterChange = (
        event: React.ChangeEvent<HTMLSelectElement>
    ) => {
        setHardwareFilter(event.target.value);
        setCurrentPage(1);
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

    const loadRequests = async () => {
        try {
            setLoading(true);

            const [requestsData, statsData] = await Promise.all([
                onboardingApi.getAll(),
                onboardingApi.getStats(),
            ]);

            setRequests(requestsData);
            setStats(statsData);
            setError('');
        } catch {
            setError('Failed to load onboarding requests.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRequests();
    }, []);

    const handleApprove = async (request: OnboardingRequest) => {
        try {
            await onboardingApi.approve(role, request.id);
            showNotification(
                'success',
                request.hardwareTier === 'PREMIUM'
                    ? 'Request approved by Manager and sent to Finance for budget approval.'
                    : 'Request approved by Manager and sent to IT Provisioning.'
            );
            await loadRequests();
        } catch {
            alert('Failed to approve request.');
        }
    };

    const handleReject = async (request: OnboardingRequest) => {
        const reason = window.prompt('Enter rejection reason:');

        if (!reason) {
            return;
        }

        try {
            await onboardingApi.reject(role, request.id, {
                rejectionReason: reason,
            });
            showNotification(
                'success',
                'Request rejected and sent back to HR for rework.'
            );
            await loadRequests();
        } catch {
            alert('Failed to reject request.');
        }
    };

    const handleResubmit = async (request: OnboardingRequest) => {
        const confirmWithoutChanges = window.confirm(
            'Do you want to resubmit this request without making any changes?'
        );

        if (confirmWithoutChanges) {
            try {
                await onboardingApi.resubmit(role, request.id);
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
        setEditForm({
            employeeName: '',
            employeeRole: '',
            startDate: '',
            hardwareTier: 'STANDARD',
            jobDescription: '',
        });
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
            await onboardingApi.update(role, selectedEditRequest.id, editForm);
            await onboardingApi.resubmit(role, selectedEditRequest.id);

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

    const openItProvisioningForm = (request: OnboardingRequest) => {
        setSelectedItRequest(request);
        setItForm({
            companyEmail: request.companyEmail ?? '',
            laptopConfiguration: request.laptopConfiguration ?? '',
        });
    };

    const closeItProvisioningForm = () => {
        setSelectedItRequest(null);
        setItForm({
            companyEmail: '',
            laptopConfiguration: '',
        });
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
            alert('Please complete both IT provisioning fields.');
            return;
        }

        try {
            await onboardingApi.approve(role, selectedItRequest.id, itForm);
            showNotification(
                'success',
                'IT provisioning completed. Onboarding request is now completed.'
            );
            closeItProvisioningForm();
            await loadRequests();
        } catch {
            alert('Failed to complete IT provisioning.');
        }
    };

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

    const openFinanceForm = (request: OnboardingRequest) => {
        setSelectedFinanceRequest(request);
        setFinanceForm({
            approvedBudget: request.approvedBudget ?? 0,
            financeNotes: request.financeNotes ?? '',
        });
    };

    const closeFinanceForm = () => {
        setSelectedFinanceRequest(null);
        setFinanceForm({
            approvedBudget: 0,
            financeNotes: '',
        });
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
            alert('Please enter a valid approved budget.');
            return;
        }

        try {
            await onboardingApi.financeApprove(
                role,
                selectedFinanceRequest.id,
                financeForm
            );

            showNotification(
                'success',
                'Budget approved by Finance. Request sent to IT Provisioning.'
            );

            closeFinanceForm();
            await loadRequests();
        } catch {
            alert('Failed to approve finance budget.');
        }
    };

  return (
    <section className="dashboard-container">
        {notification && (
            <div className={`toast toast-${notification.type}`}>
                {notification.message}
            </div>
        )}

        <div className="dashboard-header">
            <h1>Employee Onboarding Dashboard</h1>

            {role === 'HR' && onCreateRequest && (
                <button className="primary-button" onClick={onCreateRequest}>
                Create Request
                </button>
            )}
        </div>

        {stats && (
            <div className="stats-grid">
                <div className="stat-card">
                    <span>Total Requests</span>
                    <strong>{stats.totalRequests}</strong>
                </div>

                <div className="stat-card">
                    <span>Manager Review</span>
                    <strong>{stats.managerReviewCount}</strong>
                </div>

                <div className="stat-card">
                    <span>Finance Approval</span>
                    <strong>{stats.financeApprovalCount}</strong>
                </div>

                <div className="stat-card">
                    <span>IT Provisioning</span>
                    <strong>{stats.itProvisioningCount}</strong>
                </div>

                <div className="stat-card">
                    <span>Needs Rework</span>
                    <strong>{stats.needsReworkCount}</strong>
                </div>

                <div className="stat-card">
                    <span>Completed</span>
                    <strong>{stats.completedCount}</strong>
                </div>
            </div>
        )}

        <div className="dashboard-filters">
            <div className="filter-group">
                <label>Search</label>
                <input
                    type="text"
                    placeholder="Search by employee, role or description"
                    value={searchTerm}
                    onChange={handleSearchChange}
                />
            </div>

            <div className="filter-group">
                <label>Status</label>
                <select value={statusFilter} onChange={handleStatusFilterChange}>
                    <option value="ALL">All statuses</option>
                    <option value="MANAGER_REVIEW">Manager Review</option>
                    <option value="FINANCE_APPROVAL">Finance Approval</option>
                    <option value="IT_PROVISIONING">IT Provisioning</option>
                    <option value="NEEDS_REWORK">Needs Rework</option>
                    <option value="COMPLETED">Completed</option>
                </select>
            </div>

            <div className="filter-group">
                <label>Hardware</label>
                <select value={hardwareFilter} onChange={handleHardwareFilterChange}>
                    <option value="ALL">All hardware</option>
                    <option value="STANDARD">Standard</option>
                    <option value="PREMIUM">Premium</option>
                </select>
            </div>
        </div>

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
                </tr>
            </thead>

            <tbody>
                {paginatedRequests.map((request) => (
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
                                    <button
                                        className="primary-button"
                                        onClick={() => handleApprove(request)}
                                    >
                                        Approve
                                    </button>

                                    <button
                                        className="danger-button"
                                        onClick={() => handleReject(request)}
                                    >
                                        Reject
                                    </button>
                                </>
                            )}

                            {role === 'FINANCE' && request.status === 'FINANCE_APPROVAL' && (
                                <>
                                    <button
                                        className="primary-button"
                                        onClick={() => openFinanceForm(request)}
                                    >
                                        Approve Budget
                                    </button>

                                    <button
                                        className="danger-button"
                                        onClick={() => handleReject(request)}
                                    >
                                        Reject
                                    </button>
                                </>
                            )}

                            {canCompleteItProvisioning(request) && (
                                <>
                                <button
                                    className="primary-button"
                                    onClick={() => openItProvisioningForm(request)}
                                >
                                    Complete IT
                                </button>

                                <button
                                    className="danger-button"
                                    onClick={() => handleReject(request)}
                                >
                                    Reject
                                </button>
                                </>
                            )}

                            {canResubmit(request) && (
                                <button
                                    className="secondary-button"
                                    onClick={() => handleResubmit(request)}
                                >
                                    Resubmit
                                </button>
                            )}

                            {request.status === 'COMPLETED' && (
                                <span className="completed-label">Completed</span>
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
                            <button
                                className="history-button"
                                onClick={() => openHistoryModal(request)}
                            >
                                View History
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>

        {selectedHistoryRequest && (
            <div className="modal-overlay">
                <div className="modal-card history-modal-card">
                <h2>Workflow History</h2>
                <p>
                    Audit trail for <strong>{selectedHistoryRequest.employeeName}</strong>
                </p>

                {historyLoading && <p className="dashboard-message">Loading history...</p>}

                {!historyLoading && historyItems.length === 0 && (
                    <p className="no-actions-label">No history available.</p>
                )}

                {!historyLoading && historyItems.length > 0 && (
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
                    <button className="secondary-button" onClick={closeHistoryModal}>
                    Close
                    </button>
                </div>
                </div>
            </div>
        )}

        {filteredRequests.length > 0 && (
            <div className="pagination">
                <button
                    className="secondary-button"
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                >
                    Previous
                </button>

                <span>
                    Page {currentPage} of {totalPages}
                </span>

                <button
                    className="secondary-button"
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                >
                    Next
                </button>
            </div>
        )}

        {selectedEditRequest && (
        <div className="edit-request-card">
            <div className="edit-request-header">
            <h2>Edit Onboarding Request</h2>
            <p>
                Update the request details for{' '}
                <strong>{selectedEditRequest.employeeName}</strong> before resubmitting.
            </p>
            </div>

            <div className="edit-request-form">
            <div className="edit-form-group">
                <label>Employee Name</label>
                <input
                name="employeeName"
                value={editForm.employeeName}
                onChange={handleEditFormChange}
                />
            </div>

            <div className="edit-form-group">
                <label>Employee Role</label>
                <input
                name="employeeRole"
                value={editForm.employeeRole}
                onChange={handleEditFormChange}
                />
            </div>

            <div className="edit-form-group">
                <label>Start Date</label>
                <input
                type="date"
                name="startDate"
                value={editForm.startDate}
                onChange={handleEditFormChange}
                />
            </div>

            <div className="edit-form-group">
                <label>Hardware Tier</label>
                <select
                name="hardwareTier"
                value={editForm.hardwareTier}
                onChange={handleEditFormChange}
                >
                <option value="STANDARD">STANDARD</option>
                <option value="PREMIUM">PREMIUM</option>
                </select>
            </div>

            <div className="edit-form-group">
                <label>Job Description</label>
                <textarea
                name="jobDescription"
                value={editForm.jobDescription}
                onChange={handleEditFormChange}
                />
            </div>

            <div className="edit-form-actions">
                <button className="edit-submit-button" onClick={handleUpdateAndResubmit}>
                Update & Resubmit
                </button>

                <button className="edit-cancel-button" onClick={closeEditForm}>
                Cancel
                </button>
            </div>
            </div>
        </div>
        )}

        {selectedItRequest && (
            <div className="modal-overlay">
                <div className="modal-card">
                    <h2>Complete IT Provisioning</h2>
                    <p>
                        Add company account details and laptop configuration for{' '}
                            <strong>{selectedItRequest.employeeName}</strong>.
                    </p>

                    <div className="modal-form-group">
                        <label>Company Email</label>
                        <input
                            name="companyEmail"
                            type="email"
                            placeholder="employee@company.com"
                            value={itForm.companyEmail}
                            onChange={handleItFormChange}
                        />
                    </div>

                    <div className="modal-form-group">
                        <label>Laptop Configuration</label>
                        <textarea
                            name="laptopConfiguration"
                            placeholder="Example: Dell Latitude, 16GB RAM, 512GB SSD"
                            value={itForm.laptopConfiguration}
                            onChange={handleItFormChange}
                        />
                    </div>

                    <div className="modal-actions">
                        <button className="primary-button" onClick={handleCompleteItProvisioning}>
                            Save
                        </button>

                        <button className="secondary-button" onClick={closeItProvisioningForm}>
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        )}

        {selectedFinanceRequest && (
            <div className="modal-overlay">
                <div className="modal-card">
                <h2>Approve Hardware Budget</h2>
                <p>
                    Add approved budget details for{' '}
                    <strong>{selectedFinanceRequest.employeeName}</strong>.
                </p>

                <div className="modal-form-group">
                    <label>Approved Budget</label>
                    <input
                    name="approvedBudget"
                    type="number"
                    placeholder="Approved budget"
                    value={financeForm.approvedBudget}
                    onChange={handleFinanceFormChange}
                    />
                </div>

                <div className="modal-form-group">
                    <label>Finance Notes</label>
                    <textarea
                    name="financeNotes"
                    placeholder="Finance notes"
                    value={financeForm.financeNotes}
                    onChange={handleFinanceFormChange}
                    />
                </div>

                <div className="modal-actions">
                    <button className="primary-button" onClick={handleFinanceApprove}>
                    Save Budget
                    </button>

                    <button className="secondary-button" onClick={closeFinanceForm}>
                    Cancel
                    </button>
                </div>
                </div>
            </div>
        )}

        {filteredRequests.length === 0 && (
            <p className="dashboard-message">No onboarding requests found.</p>
        )}
    </section>
  );
}

export default Dashboard;