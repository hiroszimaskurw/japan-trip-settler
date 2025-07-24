import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PasswordAuthProps {
  onAuthenticated: () => void;
}

export function PasswordAuth({ onAuthenticated }: PasswordAuthProps) {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (password === 'koloniaspecjalna') {
      localStorage.setItem('japanTripAuth', 'true');
      onAuthenticated();
    } else {
      toast({
        title: 'Błędne hasło',
        description: 'Spróbuj ponownie',
        variant: 'destructive',
      });
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="text-3xl">🇯🇵</span>
            <CardTitle className="text-2xl">Rozliczenia Japońskie</CardTitle>
          </div>
          <p className="text-muted-foreground">
            Wprowadź hasło, aby uzyskać dostęp do rozliczeń
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Hasło
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Wprowadź hasło..."
                className="w-full"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full"
              size="lg"
              disabled={isLoading}
            >
              <Lock className="h-4 w-4 mr-2" />
              {isLoading ? 'Sprawdzanie...' : 'Zaloguj się'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}