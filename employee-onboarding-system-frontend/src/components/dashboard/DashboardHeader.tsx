import type { UserRole } from '../../types/auth';

type Props = {
    role: UserRole;
    onCreateRequest?: () => void;
    onExportExcel: () => void;
};

function DashboardHeader({ role, onCreateRequest, onExportExcel }: Props) {
    return (
        <div className="dashboard-header">
            <h1>Employee Onboarding Dashboard</h1>

            <div className="dashboard-header-actions">
                {role === 'HR' && onCreateRequest && (
                    <button className="primary-button" onClick={onCreateRequest}>
                        Create Request
                    </button>
                )}

                {role !== 'VIEWER' && (
                    <button className="secondary-button" onClick={onExportExcel}>
                        Export Excel
                    </button>
                )}
            </div>
        </div>
    );
}

export default DashboardHeader;