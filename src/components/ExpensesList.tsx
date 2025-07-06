import { Doc } from "../../convex/_generated/dataModel";

interface ExpensesListProps {
  expenses: Doc<"expenses">[] | undefined;
}

export default function ExpensesList({ expenses }: ExpensesListProps) {
  if (expenses === undefined) {
    return <div className="text-center text-gray-400">Loading expenses...</div>;
  }

  if (expenses.length === 0) {
    return (
      <div className="text-center text-gray-400 py-8">
        <p className="text-lg">🙌 You haven’t added any expenses yet.</p>
        <p className="text-sm mt-2">Tap the <span className="font-semibold">“Add Expense”</span> button to create your first one!</p>
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      {expenses.map((expense) => (
        <li key={expense._id} className="bg-gray-700 p-4 rounded-lg shadow-md">
          <div className="flex justify-between items-center">
            <div className="flex-grow">
              <h3 className="text-lg font-semibold text-white">{expense.title}</h3>
              <p className="text-sm text-gray-400">{expense.categories?.join(', ')}</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-green-400">${expense.amount.toFixed(2)}</p>
              <p className="text-xs text-gray-500">{new Date(expense.date).toLocaleDateString()}</p>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
