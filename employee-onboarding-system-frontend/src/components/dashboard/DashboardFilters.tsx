type Props = {
    searchTerm: string;
    statusFilter: string;
    hardwareFilter: string;
    onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onStatusFilterChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
    onHardwareFilterChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
};

function DashboardFilters({
    searchTerm,
    statusFilter,
    hardwareFilter,
    onSearchChange,
    onStatusFilterChange,
    onHardwareFilterChange,
}: Props) {
    return (
        <div className="dashboard-filters">
            <div className="filter-group">
                <label>Search</label>
                <input
                    type="text"
                    placeholder="Search by employee, role or description"
                    value={searchTerm}
                    onChange={onSearchChange}
                />
            </div>

            <div className="filter-group">
                <label>Status</label>
                <select value={statusFilter} onChange={onStatusFilterChange}>
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
                <select value={hardwareFilter} onChange={onHardwareFilterChange}>
                    <option value="ALL">All hardware</option>
                    <option value="STANDARD">Standard</option>
                    <option value="PREMIUM">Premium</option>
                </select>
            </div>
        </div>
    );
}

export default DashboardFilters;