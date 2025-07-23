import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Users, Share2 } from 'lucide-react';
import { useExpenseGroup } from '@/hooks/useExpenseGroup';
import { useToast } from '@/hooks/use-toast';

interface GroupSelectorProps {
  onGroupSelected: (groupId: string) => void;
}

const defaultColors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', 
  '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
];

export function GroupSelector({ onGroupSelected }: GroupSelectorProps) {
  const { createGroup, joinGroupByCode } = useExpenseGroup();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Stan dla tworzenia grupy
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');

  // Stan dla dołączania do grupy
  const [shareCode, setShareCode] = useState('');
  const [memberName, setMemberName] = useState('');
  const [memberColor, setMemberColor] = useState(defaultColors[0]);

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) {
      toast({
        title: 'Błąd',
        description: 'Nazwa grupy jest wymagana',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const group = await createGroup(newGroupName, newGroupDescription);
      toast({
        title: 'Grupa utworzona!',
        description: `Grupa "${group.name}" została pomyślnie utworzona`,
      });
      onGroupSelected(group.id);
      setIsOpen(false);
      setNewGroupName('');
      setNewGroupDescription('');
    } catch (error) {
      console.error('Błąd tworzenia grupy:', error);
      toast({
        title: 'Błąd',
        description: 'Nie udało się utworzyć grupy',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async () => {
    if (!shareCode.trim() || !memberName.trim()) {
      toast({
        title: 'Błąd',
        description: 'Kod grupy i imię są wymagane',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const { group } = await joinGroupByCode(shareCode, memberName, memberColor);
      toast({
        title: 'Dołączono do grupy!',
        description: `Pomyślnie dołączono do grupy "${group.name}"`,
      });
      onGroupSelected(group.id);
      setIsOpen(false);
      setShareCode('');
      setMemberName('');
      setMemberColor(defaultColors[0]);
    } catch (error) {
      console.error('Błąd dołączania do grupy:', error);
      toast({
        title: 'Błąd',
        description: 'Nie udało się dołączyć do grupy. Sprawdź kod.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl flex items-center justify-center gap-2">
            <Users className="h-6 w-6" />
            Wybierz grupę
          </CardTitle>
          <p className="text-muted-foreground">
            Utwórz nową grupę lub dołącz do istniejącej
          </p>
        </CardHeader>
        <CardContent>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="w-full" size="lg">
                <Plus className="h-4 w-4 mr-2" />
                Rozpocznij rozliczanie
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Rozliczanie wydatków</DialogTitle>
              </DialogHeader>
              
              <Tabs defaultValue="create" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="create">Utwórz grupę</TabsTrigger>
                  <TabsTrigger value="join">Dołącz do grupy</TabsTrigger>
                </TabsList>
                
                <TabsContent value="create" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="groupName">Nazwa grupy</Label>
                    <Input
                      id="groupName"
                      placeholder="np. Wyjazd do Japonii"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="groupDescription">Opis (opcjonalny)</Label>
                    <Input
                      id="groupDescription"
                      placeholder="np. Rozliczenie z wakacji"
                      value={newGroupDescription}
                      onChange={(e) => setNewGroupDescription(e.target.value)}
                    />
                  </div>
                  <Button 
                    onClick={handleCreateGroup} 
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? 'Tworzenie...' : 'Utwórz grupę'}
                  </Button>
                </TabsContent>
                
                <TabsContent value="join" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="shareCode">Kod grupy</Label>
                    <Input
                      id="shareCode"
                      placeholder="Wklej kod otrzymany od znajomego"
                      value={shareCode}
                      onChange={(e) => setShareCode(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="memberName">Twoje imię</Label>
                    <Input
                      id="memberName"
                      placeholder="np. Anna"
                      value={memberName}
                      onChange={(e) => setMemberName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Twój kolor</Label>
                    <div className="flex gap-2 flex-wrap">
                      {defaultColors.map((color) => (
                        <button
                          key={color}
                          className={`w-8 h-8 rounded-full border-2 ${
                            memberColor === color ? 'border-primary' : 'border-muted'
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() => setMemberColor(color)}
                        />
                      ))}
                    </div>
                  </div>
                  <Button 
                    onClick={handleJoinGroup} 
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? 'Dołączanie...' : 'Dołącz do grupy'}
                  </Button>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}