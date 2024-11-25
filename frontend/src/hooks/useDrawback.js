import { useQuery, useMutation, useQueryClient } from 'react-query';
import { drawbackService } from '../services/drawback';

export const useDrawbackClaims = (filters) => {
    return useQuery(['drawback-claims', filters], () => drawbackService.listClaims(filters));
};

export const useDrawbackClaim = (id) => {
    return useQuery(['drawback-claim', id], () => drawbackService.getClaimById(id), {
        enabled: !!id
    });
};

export const useSubmitDrawbackClaim = () => {
    const queryClient = useQueryClient();

    return useMutation(
        (claimData) => drawbackService.submitClaim(claimData),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('drawback-claims');
            }
        }
    );
};

export const useUpdateDrawbackClaim = () => {
    const queryClient = useQueryClient();

    return useMutation(
        ({ id, data }) => drawbackService.updateClaim(id, data),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('drawback-claims');
            }
        }
    );
};
