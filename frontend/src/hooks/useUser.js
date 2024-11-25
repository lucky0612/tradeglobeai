import { useQuery, useMutation, useQueryClient } from 'react-query';
import { userService } from '../services/User';

export const useCurrentUser = () => {
    return useQuery('current-user', userService.getCurrentUser);
};

export const useUpdateProfile = () => {
    const queryClient = useQueryClient();

    return useMutation(
        (profileData) => userService.updateProfile(profileData),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('current-user');
            }
        }
    );
};

export const useUpdatePassword = () => {
    return useMutation((passwordData) => userService.updatePassword(passwordData));
};

export const useApiKeys = () => {
    return useQuery('api-keys', userService.getApiKeys);
};

export const useGenerateApiKey = () => {
    const queryClient = useQueryClient();

    return useMutation(
        (description) => userService.generateApiKey(description),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('api-keys');
            }
        }
    );
};

export const useRevokeApiKey = () => {
    const queryClient = useQueryClient();

    return useMutation(
        (keyId) => userService.revokeApiKey(keyId),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('api-keys');
            }
        }
    );
};