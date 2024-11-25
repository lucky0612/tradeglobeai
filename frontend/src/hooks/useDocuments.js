import { useQuery, useMutation, useQueryClient } from 'react-query';
import { documentService } from '../services/document';

export const useDocuments = (filters) => {
    return useQuery(['documents', filters], () => documentService.list(filters));
};

export const useDocument = (id) => {
    return useQuery(['document', id], () => documentService.getById(id), {
        enabled: !!id
    });
};

export const useUploadDocument = () => {
    const queryClient = useQueryClient();

    return useMutation(
        ({ file, type }) => documentService.upload(file, type),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('documents');
            }
        }
    );
};

export const useProcessDocument = () => {
    const queryClient = useQueryClient();

    return useMutation(
        (id) => documentService.process(id),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('documents');
            }
        }
    );
};
