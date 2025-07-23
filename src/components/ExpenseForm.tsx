import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus } from "lucide-react";
import { Person, Expense } from "@/types/expense";

interface ExpenseFormProps {
  people: Person[];
  onAddExpense: (expense: Omit<Expense, "id">) => void;
}

const categories = [
  "Jedzenie",
  "Transport",
  "Zakwaterowanie", 
  "Rozrywka",
  "Zakupy",
  "Inne"
];

export function ExpenseForm({ people, onAddExpense }: ExpenseFormProps) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [splitBetween, setSplitBetween] = useState<string[]>([]);
  const [category, setCategory] = useState("");
  const [currency, setCurrency] = useState<"JPY" | "PLN">("JPY");
  
  // Kurs wymiany PLN -> JPY: 1000 JPY = 26 PLN
  const exchangeRate = 38.46; // 1 PLN ≈ 38.46 JPY

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !paidBy || splitBetween.length === 0) return;

    const finalAmount = currency === "PLN" ? parseFloat(amount) * exchangeRate : parseFloat(amount);

    onAddExpense({
      description: currency === "PLN" ? `${description} (${amount} PLN)` : description,
      amount: finalAmount,
      paidBy,
      splitBetween,
      date: new Date().toISOString(),
      category
    });

    setDescription("");
    setAmount("");
    setPaidBy("");
    setSplitBetween([]);
    setCategory("");
    setCurrency("JPY");
  };

  const handleSplitChange = (personId: string, checked: boolean) => {
    if (checked) {
      setSplitBetween([...splitBetween, personId]);
    } else {
      setSplitBetween(splitBetween.filter(id => id !== personId));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Dodaj wydatek
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="description">Opis wydatku</Label>
              <Textarea
                id="description"
                placeholder="np. Kolacja w Shibuya"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Kwota</Label>
              <div className="flex gap-2">
                <Select value={currency} onValueChange={(value: "JPY" | "PLN") => setCurrency(value)}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="JPY">¥</SelectItem>
                    <SelectItem value="PLN">zł</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  className="flex-1"
                />
              </div>
              {currency === "PLN" && amount && (
                <p className="text-xs text-muted-foreground">
                  ≈ {(parseFloat(amount || "0") * exchangeRate).toLocaleString('pl-PL')} ¥
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Kto płacił?</Label>
              <Select value={paidBy} onValueChange={setPaidBy} required>
                <SelectTrigger>
                  <SelectValue placeholder="Wybierz osobę" />
                </SelectTrigger>
                <SelectContent>
                  {people.map((person) => (
                    <SelectItem key={person.id} value={person.id}>
                      {person.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Kategoria</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Wybierz kategorię" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Podział między (zaznacz wszystkich, którzy powinni płacić):</Label>
            <div className="grid grid-cols-2 gap-2">
              {people.map((person) => (
                <div key={person.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`split-${person.id}`}
                    checked={splitBetween.includes(person.id)}
                    onCheckedChange={(checked) => 
                      handleSplitChange(person.id, checked as boolean)
                    }
                  />
                  <Label 
                    htmlFor={`split-${person.id}`}
                    className="text-sm font-normal flex items-center gap-2"
                  >
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: person.color }}
                    />
                    {person.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={() => setSplitBetween(people.map(p => p.id))}
              className="flex-1"
            >
              Wszyscy
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setSplitBetween([])}
              className="flex-1"
            >
              Wyczyść
            </Button>
          </div>

          <Button type="submit" className="w-full">
            Dodaj wydatek
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}