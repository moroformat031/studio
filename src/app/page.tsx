
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { NotasMedApp } from '@/components/notasmed/NotasMedApp';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
        <div className="flex flex-col min-h-screen bg-background">
            <header className="sticky top-0 z-50 w-full border-b bg-card shadow-sm">
                <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 md:px-8">
                    <Skeleton className="h-8 w-32" />
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-10 w-10 rounded-full" />
                    </div>
                </div>
            </header>
            <main className="flex-1 container mx-auto p-4 sm:p-6 md:p-8">
                <div className="grid gap-8 md:grid-cols-2">
                    <Skeleton className="h-[450px] w-full" />
                    <Skeleton className="h-[450px] w-full" />
                </div>
            </main>
        </div>
    );
  }

  return <NotasMedApp />;
}
