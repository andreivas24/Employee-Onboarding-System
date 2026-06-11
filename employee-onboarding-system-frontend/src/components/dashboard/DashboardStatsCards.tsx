import type { DashboardStats } from '../../types/onboarding';

type Props = {
    stats: DashboardStats | null;
};

function DashboardStatsCards({ stats }: Props) {
    if (!stats) {
        return null;
    }

    return (
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
    );
}

export default DashboardStatsCards;