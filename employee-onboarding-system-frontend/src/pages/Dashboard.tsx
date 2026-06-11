import { useEffect, useState } from 'react';
import { onboardingApi } from '../api/onboardingApi';
import { commentApi } from '../api/commentApi';

import type { AuthUser, UserRole } from '../types/auth';
import type { OnboardingComment } from '../types/comment';
import type {
  DashboardStats,
  FinanceApprovalRequest,
  ITProvisioningRequest,
  OnboardingHistory,
  OnboardingRequest,
  UpdateOnboardingRequest,
} from '../types/onboarding';

import DashboardStatsCards from '../components/dashboard/DashboardStatsCards';
import DashboardFilters from '../components/dashboard/DashboardFilters';
import DashboardPagination from '../components/dashboard/DashboardPagination';
import DashboardTable from '../components/dashboard/DashboardTable';
import ToastMessage from '../components/dashboard/ToastMessage';

import HistoryModal from '../components/dashboard/modals/HistoryModal';
import CommentsModal from '../components/dashboard/modals/CommentsModal';
import ITProvisioningModal from '../components/dashboard/modals/ITProvisioningModal';
import FinanceApprovalModal from '../components/dashboard/modals/FinanceApprovalModal';
import EditRequestForm from '../components/dashboard/modals/EditRequestForm';

import '../styles/Dashboard.css';

type Props = {
  role: UserRole;
  user: AuthUser;
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

  const [selectedCommentsRequest, setSelectedCommentsRequest] =
    useState<OnboardingRequest | null>(null);
  const [comments, setComments] = useState<OnboardingComment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [commentsLoading, setCommentsLoading] = useState(false);

  const [selectedEditRequest, setSelectedEditRequest] =
    useState<OnboardingRequest | null>(null);
  const [editForm, setEditForm] = useState<UpdateOnboardingRequest>({
    employeeName: '',
    employeeRole: '',
    startDate: '',
    hardwareTier: 'STANDARD',
    jobDescription: '',
  });

  const [selectedHistoryRequest, setSelectedHistoryRequest] =
    useState<OnboardingRequest | null>(null);
  const [historyItems, setHistoryItems] = useState<OnboardingHistory[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [selectedFinanceRequest, setSelectedFinanceRequest] =
    useState<OnboardingRequest | null>(null);
  const [financeForm, setFinanceForm] = useState<FinanceApprovalRequest>({
    approvedBudget: 0,
    financeNotes: '',
  });

  const [selectedItRequest, setSelectedItRequest] =
    useState<OnboardingRequest | null>(null);
  const [itForm, setItForm] = useState<ITProvisioningRequest>({
    companyEmail: '',
    laptopConfiguration: '',
  });

  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const pageSize = 10;

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });

    setTimeout(() => {
      setNotification(null);
    }, 3500);
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

  const filteredRequests = requests.filter((request) => {
    const searchValue = searchTerm.toLowerCase();

    const matchesSearch =
      request.employeeName.toLowerCase().includes(searchValue) ||
      request.employeeRole.toLowerCase().includes(searchValue) ||
      request.jobDescription.toLowerCase().includes(searchValue);

    const matchesStatus =
      statusFilter === 'ALL' || request.status === statusFilter;

    const matchesHardware =
      hardwareFilter === 'ALL' || request.hardwareTier === hardwareFilter;

    return matchesSearch && matchesStatus && matchesHardware;
  });

  const totalPages = Math.max(1, Math.ceil(filteredRequests.length / pageSize));

  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

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

  const goToPreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
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

  const handleApprove = async (request: OnboardingRequest) => {
    try {
      await onboardingApi.approve(request.id);

      showNotification(
        'success',
        request.hardwareTier === 'PREMIUM'
          ? 'Request approved by Manager and sent to Finance for budget approval.'
          : 'Request approved by Manager and sent to IT Provisioning.'
      );

      await loadRequests();
    } catch {
      showNotification('error', 'Failed to approve request.');
    }
  };

  const handleReject = async (request: OnboardingRequest) => {
    const reason = window.prompt('Enter rejection reason:');

    if (!reason) {
      return;
    }

    try {
      await onboardingApi.reject(request.id, {
        rejectionReason: reason,
      });

      showNotification(
        'success',
        'Request rejected and sent back to HR for rework.'
      );

      await loadRequests();
    } catch {
      showNotification('error', 'Failed to reject request.');
    }
  };

  const handleResubmit = async (request: OnboardingRequest) => {
    const confirmWithoutChanges = window.confirm(
      'Do you want to resubmit this request without making any changes?'
    );

    if (confirmWithoutChanges) {
      try {
        await onboardingApi.resubmit(request.id);

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
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
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

  const handleExportExcel = async () => {
    try {
      await onboardingApi.exportExcel();
      showNotification('success', 'Excel file exported successfully.');
    } catch {
      showNotification('error', 'Failed to export Excel file.');
    }
  };

  return (
    <section className="dashboard-container">
      {notification && (
        <ToastMessage type={notification.type} message={notification.message} />
      )}

      <div className="dashboard-header">
        <h1>Employee Onboarding Dashboard</h1>

        <div className="dashboard-header-actions">
          {role === 'HR' && onCreateRequest && (
            <button className="primary-button" onClick={onCreateRequest}>
              Create Request
            </button>
          )}

          {role !== 'VIEWER' && (
            <button className="secondary-button" onClick={handleExportExcel}>
                Export Excel
            </button>
          )}
        </div>
      </div>

      <DashboardStatsCards stats={stats} />

      <DashboardFilters
        searchTerm={searchTerm}
        statusFilter={statusFilter}
        hardwareFilter={hardwareFilter}
        onSearchChange={handleSearchChange}
        onStatusFilterChange={handleStatusFilterChange}
        onHardwareFilterChange={handleHardwareFilterChange}
      />

      {loading && <p className="dashboard-message">Loading requests...</p>}

      {error && <p className="dashboard-message dashboard-error">{error}</p>}

      {!loading && !error && (
        <>
          <DashboardTable
            requests={paginatedRequests}
            role={role}
            canApproveOrReject={canApproveOrReject}
            canCompleteItProvisioning={canCompleteItProvisioning}
            canResubmit={canResubmit}
            onApprove={handleApprove}
            onReject={handleReject}
            onResubmit={handleResubmit}
            onOpenFinanceForm={openFinanceForm}
            onOpenItForm={openItProvisioningForm}
            onOpenHistory={openHistoryModal}
            onOpenComments={openCommentsModal}
          />

          {filteredRequests.length === 0 && (
            <p className="dashboard-message">No onboarding requests found.</p>
          )}

          <DashboardPagination
            currentPage={currentPage}
            totalPages={totalPages}
            hasItems={filteredRequests.length > 0}
            onPrevious={goToPreviousPage}
            onNext={goToNextPage}
          />
        </>
      )}

      {selectedHistoryRequest && (
        <HistoryModal
          request={selectedHistoryRequest}
          historyItems={historyItems}
          loading={historyLoading}
          onClose={closeHistoryModal}
        />
      )}

      {selectedCommentsRequest && (
        <CommentsModal
          request={selectedCommentsRequest}
          comments={comments}
          commentText={commentText}
          loading={commentsLoading}
          onCommentTextChange={setCommentText}
          onAddComment={handleAddComment}
          onClose={closeCommentsModal}
        />
      )}

      {selectedEditRequest && (
        <EditRequestForm
          request={selectedEditRequest}
          form={editForm}
          onChange={handleEditFormChange}
          onSubmit={handleUpdateAndResubmit}
          onCancel={closeEditForm}
        />
      )}

      {selectedItRequest && (
        <ITProvisioningModal
          request={selectedItRequest}
          form={itForm}
          onChange={handleItFormChange}
          onSave={handleCompleteItProvisioning}
          onClose={closeItProvisioningForm}
        />
      )}

      {selectedFinanceRequest && (
        <FinanceApprovalModal
          request={selectedFinanceRequest}
          form={financeForm}
          onChange={handleFinanceFormChange}
          onSave={handleFinanceApprove}
          onClose={closeFinanceForm}
        />
      )}
    </section>
  );
}

export default Dashboard;