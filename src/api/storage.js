const KEY_STORAGE = '@SemAperto:transacoes';
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
