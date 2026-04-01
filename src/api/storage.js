const KEY_STORAGE = '@SemAperto:transacoes';
const KEY_GOALS = '@SemAperto:goals';
import { uuidv7 } from 'uuidv7';

export function getTransactions() {
  const transactions = localStorage.getItem(KEY_STORAGE);
  if (transactions === null) return [];
  try {
    return JSON.parse(transactions);
  } catch {
    return [];
  }
}

export function saveTransactions(transactions) {
  localStorage.setItem(KEY_STORAGE, JSON.stringify(transactions));
}

export function addNewTransaction({
  description,
  value,
  type,
  category,
  date,
}) {
  const transactions = getTransactions();
  const newTransaction = {
    id: uuidv7(),
    description: description.trim(),
    value: Number(value),
    type: type.toLowerCase().trim(),
    category: category.trim(),
    date: date,
  };
  transactions.push(newTransaction);
  saveTransactions(transactions);
  return newTransaction;
}

export function deleteTransaction(id) {
  const transactions = getTransactions();
  const newTransactions = transactions.filter(
    (transaction) => transaction.id !== id,
  );
  saveTransactions(newTransactions);
}

export function getGoals() {
  const goals = localStorage.getItem(KEY_GOALS);
  if (goals === null) return [];
  try {
    return JSON.parse(goals);
  } catch {
    return [];
  }
}

export function saveGoals(goals) {
  localStorage.setItem(KEY_GOALS, JSON.stringify(goals));
}

export function addNewGoal({ title, targetValue, currentValue, deadline }) {
  const goals = getGoals();
  const newGoal = {
    id: uuidv7(),
    title: title.trim(),
    targetValue: Number(targetValue),
    currentValue: Number(currentValue),
    deadline,
  };
  goals.push(newGoal);
  saveGoals(goals);
  return newGoal;
}

export function deleteGoal(id) {
  const goals = getGoals();
  const newGoals = goals.filter((goal) => goal.id !== id);
  saveGoals(newGoals);
}
