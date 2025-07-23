import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Receipt } from "lucide-react";
import { Person, Expense } from "@/types/expense";
import { format } from "date-fns";
import { pl } from "date-fns/locale";

interface ExpenseListProps {
  expenses: Expense[];
  people: Person[];
  onDeleteExpense: (id: string) => void;
}

export function ExpenseList({ expenses, people, onDeleteExpense }: ExpenseListProps) {
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
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="h-5 w-5" />
          Lista wydatków
        </CardTitle>
      </CardHeader>
      <CardContent>
        {expenses.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            Brak wydatków. Dodaj pierwszy wydatek powyżej.
          </p>
        ) : (
          <div className="space-y-3">
            {expenses.map((expense) => (
              <div
                key={expense.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{expense.description}</h4>
                    {expense.category && (
                      <Badge variant="secondary" className="text-xs">
                        {expense.category}
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <div className="flex items-center gap-2 mb-1">
                      <span>Płacił:</span>
                      <div className="flex items-center gap-1">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: getPersonColor(expense.paidBy) }}
                        />
                        <span className="font-medium">{getPersonName(expense.paidBy)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>Podział:</span>
                      <div className="flex items-center gap-1 flex-wrap">
                        {expense.splitBetween.map((personId) => (
                          <div key={personId} className="flex items-center gap-1">
                            <div 
                              className="w-2 h-2 rounded-full" 
                              style={{ backgroundColor: getPersonColor(personId) }}
                            />
                            <span className="text-xs">{getPersonName(personId)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {format(new Date(expense.date), "dd MMM yyyy, HH:mm", { locale: pl })}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="font-bold text-lg">
                      {formatCurrency(expense.amount)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatCurrency(expense.amount / expense.splitBetween.length)} / osoba
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDeleteExpense(expense.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}