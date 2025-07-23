import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, DollarSign, ArrowRight } from "lucide-react";
import { Person, Expense, Balance, Settlement } from "@/types/expense";

interface BalanceSheetProps {
  expenses: Expense[];
  people: Person[];
}

export function BalanceSheet({ expenses, people }: BalanceSheetProps) {
  const calculateBalances = (): Balance[] => {
    const balances: { [key: string]: number } = {};
    
    // Initialize balances
    people.forEach(person => {
      balances[person.id] = 0;
    });

    // Calculate what each person paid and owes
    expenses.forEach(expense => {
      const sharePerPerson = expense.amount / expense.splitBetween.length;
      
      // Person who paid gets credit
      balances[expense.paidBy] += expense.amount;
      
      // Each person in split owes their share
      expense.splitBetween.forEach(personId => {
        balances[personId] -= sharePerPerson;
      });
    });

    return Object.entries(balances).map(([personId, balance]) => ({
      personId,
      balance: Math.round(balance * 100) / 100
    }));
  };

  const calculateSettlements = (balances: Balance[]): Settlement[] => {
    const debtors = balances.filter(b => b.balance > 0).sort((a, b) => b.balance - a.balance);
    const creditors = balances.filter(b => b.balance < 0).sort((a, b) => a.balance - b.balance);
    
    const settlements: Settlement[] = [];
    
    let i = 0, j = 0;
    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i];
      const creditor = creditors[j];
      
      const amount = Math.min(debtor.balance, Math.abs(creditor.balance));
      
      if (amount > 0.01) { // Ignore very small amounts
        settlements.push({
          from: debtor.personId,
          to: creditor.personId,
          amount: Math.round(amount * 100) / 100
        });
      }
      
      debtor.balance -= amount;
      creditor.balance += amount;
      
      if (debtor.balance < 0.01) i++;
      if (Math.abs(creditor.balance) < 0.01) j++;
    }
    
    return settlements;
  };

  const balances = calculateBalances();
  const settlements = calculateSettlements([...balances]);
  
  const getPersonName = (id: string) => {
    return people.find(p => p.id === id)?.name || "Nieznany";
  };

  const getPersonColor = (id: string) => {
    return people.find(p => p.id === id)?.color || "#666";
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: 'JPY',
      minimumFractionDigits: 0
    }).format(Math.abs(amount));
  };

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Podsumowanie wyjazdu
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold">{formatCurrency(totalExpenses)}</div>
              <div className="text-sm text-muted-foreground">Łączne wydatki</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold">{formatCurrency(totalExpenses / people.length)}</div>
              <div className="text-sm text-muted-foreground">Na osobę</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold">{expenses.length}</div>
              <div className="text-sm text-muted-foreground">Transakcji</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual Balances */}
      <Card>
        <CardHeader>
          <CardTitle>Bilans indywidualny</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {balances.map((balance) => {
              const person = people.find(p => p.id === balance.personId);
              if (!person) return null;
              
              const isOwed = balance.balance < 0;
              const amount = Math.abs(balance.balance);
              
              return (
                <div
                  key={balance.personId}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: person.color }}
                    />
                    <span className="font-medium">{person.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {amount < 0.01 ? (
                      <Badge variant="secondary">Rozliczony</Badge>
                    ) : isOwed ? (
                      <>
                        <TrendingDown className="h-4 w-4 text-success" />
                        <span className="font-bold text-success">
                          +{formatCurrency(amount)}
                        </span>
                        <Badge variant="secondary" className="bg-success/10 text-success">
                          Do otrzymania
                        </Badge>
                      </>
                    ) : (
                      <>
                        <TrendingUp className="h-4 w-4 text-expense" />
                        <span className="font-bold text-expense">
                          -{formatCurrency(amount)}
                        </span>
                        <Badge variant="secondary" className="bg-expense/10 text-expense">
                          Do zapłaty
                        </Badge>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Settlements */}
      {settlements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>💰 Plan rozliczeń</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {settlements.map((settlement, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border rounded-lg bg-primary/5"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: getPersonColor(settlement.from) }}
                      />
                      <span className="font-medium">{getPersonName(settlement.from)}</span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: getPersonColor(settlement.to) }}
                      />
                      <span className="font-medium">{getPersonName(settlement.to)}</span>
                    </div>
                  </div>
                  <div className="font-bold text-lg">
                    {formatCurrency(settlement.amount)}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                💡 <strong>Wskazówka:</strong> Wykonaj powyższe przelewy, aby rozliczyć wszystkie wydatki. 
                Kwoty są zoptymalizowane - minimalna liczba transakcji!
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}