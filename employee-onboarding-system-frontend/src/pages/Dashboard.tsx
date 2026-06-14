import { useState } from 'react';
import type { AuthUser, UserRole } from '../types/auth';

import DashboardHeader from '../components/dashboard/DashboardHeader';
import DashboardStatsCards from '../components/dashboard/DashboardStatsCards';
import DashboardFilters from '../components/dashboard/DashboardFilters';
import DashboardPagination from '../components/dashboard/DashboardPagination';
import DashboardTable from '../components/dashboard/DashboardTable';
import ToastMessage from '../components/dashboard/ToastMessage';
import DashboardModals from '../components/dashboard/DashboardModals';
import CreateRequestModal from '../components/dashboard/modals/CreateRequestModal';

import { useNotification } from '../hooks/dashboard/useNotification';
import { useDashboardData } from '../hooks/dashboard/useDashboardData';
import { useDashboardFilters } from '../hooks/dashboard/useDashboardFilters';
import { useDashboardModals } from '../hooks/dashboard/useDashboardModals';
import { useDashboardActions } from '../hooks/dashboard/useDashboardActions';

import '../styles/Dashboard.css';

type Props = {
  role: UserRole;
  user: AuthUser;
};

function Dashboard({ role }: Props) {
  const [isCreateFormVisible, setIsCreateFormVisible] = useState(false);

  const { notification, showNotification } = useNotification();

  const { requests, stats, loading, error, loadRequests } = useDashboardData();

  const {
    searchTerm,
    statusFilter,
    hardwareFilter,
    currentPage,
    totalPages,
    filteredRequests,
    paginatedRequests,
    handleSearchChange,
    handleStatusFilterChange,
    handleHardwareFilterChange,
    goToPreviousPage,
    goToNextPage,
  } = useDashboardFilters(requests);

  const modals = useDashboardModals(loadRequests, showNotification);

  const {
    canApproveOrReject,
    canCompleteItProvisioning,
    canResubmit,
    handleApprove,
    handleReject,
    handleResubmit,
    handleDelete,
    handleExportExcel,
  } = useDashboardActions(
    role,
    loadRequests,
    showNotification,
    modals.openEditForm
  );

  return (
    <section className="dashboard-container">
      {notification && (
        <ToastMessage type={notification.type} message={notification.message} />
      )}

      <DashboardHeader
        role={role}
        onCreateRequest={() => setIsCreateFormVisible(true)}
        onExportExcel={handleExportExcel}
      />

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
            onDelete={handleDelete}
            onOpenFinanceForm={modals.openFinanceForm}
            onOpenItForm={modals.openItProvisioningForm}
            onOpenHistory={modals.openHistoryModal}
            onOpenComments={modals.openCommentsModal}
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

      <CreateRequestModal
        role={role}
        isFormVisible={isCreateFormVisible}
        setIsFormVisible={setIsCreateFormVisible}
        onCreated={loadRequests}
        showNotification={showNotification}
      />

      <DashboardModals
        selectedHistoryRequest={modals.selectedHistoryRequest}
        historyItems={modals.historyItems}
        historyLoading={modals.historyLoading}
        onCloseHistoryModal={modals.closeHistoryModal}
        selectedCommentsRequest={modals.selectedCommentsRequest}
        comments={modals.comments}
        commentText={modals.commentText}
        commentsLoading={modals.commentsLoading}
        onCommentTextChange={modals.setCommentText}
        onAddComment={modals.handleAddComment}
        onCloseCommentsModal={modals.closeCommentsModal}
        selectedEditRequest={modals.selectedEditRequest}
        editForm={modals.editForm}
        onEditFormChange={modals.handleEditFormChange}
        onUpdateAndResubmit={modals.handleUpdateAndResubmit}
        onCloseEditForm={modals.closeEditForm}
        selectedItRequest={modals.selectedItRequest}
        itForm={modals.itForm}
        onItFormChange={modals.handleItFormChange}
        onCompleteItProvisioning={modals.handleCompleteItProvisioning}
        onCloseItProvisioningForm={modals.closeItProvisioningForm}
        selectedFinanceRequest={modals.selectedFinanceRequest}
        financeForm={modals.financeForm}
        onFinanceFormChange={modals.handleFinanceFormChange}
        onFinanceApprove={modals.handleFinanceApprove}
        onCloseFinanceForm={modals.closeFinanceForm}
      />
    </section>
  );
}

export default Dashboard;