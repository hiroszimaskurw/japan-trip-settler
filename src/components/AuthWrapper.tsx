import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Plane } from 'lucide-react';

interface AuthWrapperProps {
  children: React.ReactNode;
}

export function AuthWrapper({ children }: AuthWrapperProps) {
  const { user, loading, signInAnonymously } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Ładowanie...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Plane className="h-8 w-8 text-primary" />
              <CardTitle className="text-2xl">Rozliczenie Japonii 🇯🇵</CardTitle>
            </div>
            <p className="text-muted-foreground">
              Zaloguj się, aby rozpocząć rozliczanie wydatków z przyjaciółmi
            </p>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={signInAnonymously} 
              className="w-full"
              size="lg"
            >
              Rozpocznij rozliczanie
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-4">
              Nie wymagamy rejestracji - możesz zacząć od razu!
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}