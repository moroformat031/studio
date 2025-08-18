
"use client";

import { useState, useEffect } from 'react';
import { User } from '@/types/ehr';
import { useAuth } from './AuthContext';
import { useToast } from './use-toast';

export function useProviders() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [providers, setProviders] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProviders = async () => {
            if (!user?.clinicId) {
                setProviders([]);
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const res = await fetch(`/api/users?clinicId=${user.clinicId}`);
                if (!res.ok) {
                    throw new Error("Failed to fetch providers");
                }
                const allUsers: User[] = await res.json();
                // Filter for Medico and Admin roles
                const providerUsers = allUsers.filter(u => u.plan === 'Medico' || u.plan === 'Admin');
                setProviders(providerUsers);
            } catch (error) {
                console.error(error);
                toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: 'No se pudieron cargar los proveedores.'
                });
            } finally {
                setLoading(false);
            }
        };

        fetchProviders();
    }, [user, toast]);

    return { providers, loading };
}
