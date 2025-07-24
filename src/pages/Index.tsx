import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plane, Users, Calculator, Settings } from "lucide-react";
import { ExpenseForm } from "@/components/ExpenseForm";
import { ExpenseList } from "@/components/ExpenseList";
import { BalanceSheet } from "@/components/BalanceSheet";
import { PasswordAuth } from "@/components/PasswordAuth";
import { Person, Expense } from "@/types/expense";
import { useJapanTripData } from "@/hooks/useJapanTripData";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast } = useToast();
  const { people, expenses, loading, addExpense, deleteExpense } = useJapanTripData();

  // Check authentication on mount
  useEffect(() => {
    const authStatus = localStorage.getItem('japanTripAuth');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleAuthenticated = () => {
    setIsAuthenticated(true);
  };

  const handleAddExpense = (expenseData: Omit<Expense, "id">) => {
    addExpense(expenseData);
  };

  const handleDeleteExpense = (id: string) => {
    deleteExpense(id);
  };

  const exportToJSON = () => {
    const data = {
      group: "Rozliczenia Japońskie",
      people,
      expenses,
      exportDate: new Date().toISOString(),
    };
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rozliczenia-japonskie-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Dane wyeksportowane!",
      description: "Plik JSON został pobrany na Twoje urządzenie",
    });
  };

  const exportToCSV = () => {
    const csvHeader = "Data,Opis,Kwota (JPY),Kto płacił,Uczestnicy,Kategoria\n";
    const csvData = expenses.map(expense => {
      const payer = people.find(p => p.id === expense.paidBy)?.name || '';
      const participants = expense.splitBetween.map(id => 
        people.find(p => p.id === id)?.name || ''
      ).join('; ');
      const date = new Date(expense.date).toLocaleDateString('pl-PL');
      
      return `"${date}","${expense.description}","${expense.amount}","${payer}","${participants}","${expense.category || ''}"`;
    }).join('\n');
    
    const csvContent = csvHeader + csvData;
    const csvBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(csvBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rozliczenia-japonskie-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "CSV wyeksportowany!",
      description: "Plik CSV został pobrany na Twoje urządzenie",
    });
  };

  if (!isAuthenticated) {
    return <PasswordAuth onAuthenticated={handleAuthenticated} />;
  }

  return (
    <MainApp 
      people={people}
      expenses={expenses}
      loading={loading}
      onAddExpense={handleAddExpense}
      onDeleteExpense={handleDeleteExpense}
      onExportJSON={exportToJSON}
      onExportCSV={exportToCSV}
    />
  );
};

interface MainAppProps {
  people: Person[];
  expenses: Expense[];
  loading: boolean;
  onAddExpense: (expense: Omit<Expense, "id">) => void;
  onDeleteExpense: (id: string) => void;
  onExportJSON: () => void;
  onExportCSV: () => void;
}

function MainApp({ 
  people, 
  expenses, 
  loading, 
  onAddExpense, 
  onDeleteExpense, 
  onExportJSON, 
  onExportCSV
}: MainAppProps) {
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Ładowanie danych...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="text-4xl">🇯🇵</span>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Rozliczenia Japońskie
            </h1>
          </div>
          <p className="text-xl text-muted-foreground">
            Inteligentny kalkulator wydatków dla wyjazdu do Japonii
          </p>
        </div>

        {/* People Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Uczestnicy wyjazdu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {people.map((person) => (
                <div
                  key={person.id}
                  className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                >
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: person.color }}
                  />
                  <span className="font-medium">{person.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main Tabs */}
        <Tabs defaultValue="add-expense" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="add-expense" className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Dodaj wydatek
            </TabsTrigger>
            <TabsTrigger value="expenses" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Lista wydatków
            </TabsTrigger>
            <TabsTrigger value="balance" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Rozliczenia
            </TabsTrigger>
          </TabsList>

          <TabsContent value="add-expense">
            <ExpenseForm people={people} onAddExpense={onAddExpense} />
          </TabsContent>

          <TabsContent value="expenses">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Wszystkie wydatki</h2>
                <div className="flex gap-2">
                  <Button onClick={onExportCSV} variant="outline">
                    Eksportuj CSV
                  </Button>
                  <Button onClick={onExportJSON} variant="outline">
                    Eksportuj JSON
                  </Button>
                </div>
              </div>
              <ExpenseList 
                expenses={expenses} 
                people={people} 
                onDeleteExpense={onDeleteExpense} 
              />
            </div>
          </TabsContent>

          <TabsContent value="balance">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Rozliczenia i bilans</h2>
              <BalanceSheet expenses={expenses} people={people} />
            </div>
          </TabsContent>
        </Tabs>

        {/* Quick Stats */}
        {expenses.length > 0 && (
          <Card className="mt-8">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">
                    {expenses.reduce((sum, expense) => sum + expense.amount, 0).toLocaleString('pl-PL')} ¥
                  </div>
                  <div className="text-sm text-muted-foreground">Łączne wydatki</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">
                    {Math.round(expenses.reduce((sum, expense) => sum + expense.amount, 0) / people.length).toLocaleString('pl-PL')} ¥
                  </div>
                  <div className="text-sm text-muted-foreground">Średnio na osobę</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">{expenses.length}</div>
                  <div className="text-sm text-muted-foreground">Transakcji</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default Index;