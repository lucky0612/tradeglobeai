import { useQuery } from 'react-query';
import { analyticsService } from '../services/analytics';

export const useDashboardMetrics = (timeframe) => {
    return useQuery(
        ['dashboard-metrics', timeframe],
        () => analyticsService.getDashboardMetrics(timeframe)
    );
};

export const useProcessingMetrics = (filters) => {
    return useQuery(
        ['processing-metrics', filters],
        () => analyticsService.getProcessingMetrics(filters)
    );
};

export const useFinancialMetrics = (filters) => {
    return useQuery(
        ['financial-metrics', filters],
        () => analyticsService.getFinancialMetrics(filters)
    );
};

export const useComplianceMetrics = (filters) => {
    return useQuery(
        ['compliance-metrics', filters],
        () => analyticsService.getComplianceMetrics(filters)
    );
};