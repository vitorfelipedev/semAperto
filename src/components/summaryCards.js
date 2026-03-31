import { getTransactions } from '../api/storage.js';
import { formatValue } from '../utils/formatter.js';

export function initSummaryCards() {
  const incomeElement = document.getElementById('total-receitas');
  const expenseElement = document.getElementById('total-despesas');
  const balanceElement = document.getElementById('saldo-atual');
  const transactions = getTransactions();
  const totals = transactions.reduce(
    (acc, transaction) => {
      const value = Number(transaction.value);
      if (transaction.type === 'entrada') {
        acc.income += value;
      } else if (transaction.type === 'saida') {
        acc.expense += value;
      }
      return acc;
    },
    { income: 0, expense: 0 },
  );

  const balance = totals.income - totals.expense;
  incomeElement.textContent = formatValue(totals.income);
  expenseElement.textContent = formatValue(totals.expense);
  balanceElement.textContent = formatValue(balance);
  const balanceCard = balanceElement.closest('.card');

  balanceElement.classList.remove('text-income', 'text-expense');
  if (balanceCard) balanceCard.classList.remove('is-positive', 'is-negative');

  if (balance > 0) {
    balanceElement.classList.add('text-income');
    if (balanceCard) balanceCard.classList.add('is-positive');
  } else if (balance < 0) {
    balanceElement.classList.add('text-expense');
    if (balanceCard) balanceCard.classList.add('is-negative');
  }
}
