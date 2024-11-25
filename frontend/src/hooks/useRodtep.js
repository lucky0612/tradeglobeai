import { useQuery, useMutation, useQueryClient } from 'react-query';
import { rodtepService } from '../services/rodtep';

export const useRodtepClaims = (filters) => {
    return useQuery(['rodtep-claims', filters], () => rodtepService.listClaims(filters));
};

export const useRodtepClaim = (id) => {
    return useQuery(['rodtep-claim', id], () => rodtepService.getClaimById(id), {
        enabled: !!id
    });
};

export const useSubmitRodtepClaim = () => {
    const queryClient = useQueryClient();

    return useMutation(
        (claimData) => rodtepService.submitClaim(claimData),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('rodtep-claims');
            }
        }
    );
};

export const useGenerateRodtepScrip = () => {
    const queryClient = useQueryClient();

    return useMutation(
        (id) => rodtepService.generateScrip(id),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('rodtep-claims');
            }
        }
    );
};
