import { useMemo, useState } from 'react';
import type { OnboardingRequest } from '../../types/onboarding';

const PAGE_SIZE = 10;

export function useDashboardFilters(requests: OnboardingRequest[]) {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [hardwareFilter, setHardwareFilter] = useState('ALL');
    const [currentPage, setCurrentPage] = useState(1);

    const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
        const searchValue = searchTerm.toLowerCase();

        const matchesSearch =
        request.employeeName.toLowerCase().includes(searchValue) ||
        request.employeeRole.toLowerCase().includes(searchValue) ||
        request.jobDescription.toLowerCase().includes(searchValue);

        const matchesStatus = statusFilter === 'ALL' || request.status === statusFilter;

        const matchesHardware = hardwareFilter === 'ALL' || request.hardwareTier === hardwareFilter;

        return matchesSearch && matchesStatus && matchesHardware;
    });
    }, [requests, searchTerm, statusFilter, hardwareFilter]);

    const totalPages = Math.max(1, Math.ceil(filteredRequests.length / PAGE_SIZE));

    const paginatedRequests = filteredRequests.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE
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

    return {
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
    };
}