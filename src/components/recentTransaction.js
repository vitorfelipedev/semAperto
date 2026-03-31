import { getTransactions } from '../api/storage.js';
import { formatDate, formatValue } from '../utils/formatter.js';

export function initRecentTransaction() {
  const transactions = getTransactions();
  const recentTrasactions = [...transactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);
  const listRecentElement = document.getElementById('lista-recentes');

  if (recentTrasactions.length > 0) {
    listRecentElement.innerHTML = '';
    const fragment = document.createDocumentFragment();

    recentTrasactions.forEach((transaction) => {
      const typeClass = transaction.type === 'entrada' ? 'income' : 'expense';
      const iconName =
        transaction.type === 'entrada' ? 'icon-arrow-up' : 'icon-arrow-down';
      const valuePrefix = transaction.type === 'saida' ? '- ' : '';
      const item = document.createElement('li');
      item.className = 'transaction-item';
      item.innerHTML = `
        <div class="transaction-item-icon ${typeClass}">
          <svg class="icon">
            <use href="/icons.svg#${iconName}"></use>
          </svg>
        </div>
        <div class="transaction-item-info">
          <p class="transaction-item-desc">${transaction.description}</p>
          <small class="transaction-item-date">${transaction.category} • ${formatDate(transaction.date)}</small>
        </div>
        <div class="transaction-item-value ${typeClass}">
          ${valuePrefix}${formatValue(Number(transaction.value))}
        </div>
      `;
      fragment.appendChild(item);
    });
    listRecentElement.appendChild(fragment);
  } else {
    listRecentElement.innerHTML = `
      <li class="empty-state">
        <svg class="icon">
          <use href="/icons.svg#icon-list"></use>
        </svg>
        <h3>Nenhuma movimentação</h3>
        <p>Adicione sua primeira transação para começar a acompanhar.</p>
      </li>
    `;
  }
}
