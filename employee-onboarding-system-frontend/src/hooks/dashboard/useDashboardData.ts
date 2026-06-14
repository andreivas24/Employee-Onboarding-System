import { useCallback, useEffect, useState } from 'react';
import { onboardingApi } from '../../api/onboardingApi';
import type { DashboardStats, OnboardingRequest } from '../../types/onboarding';

export function useDashboardData() {
    const [requests, setRequests] = useState<OnboardingRequest[]>([]);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const loadRequests = useCallback(async () => {
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
    }, []);

    useEffect(() => {
        loadRequests();
    }, [loadRequests]);

    return {
        requests,
        stats,
        loading,
        error,
        loadRequests,
    };
}