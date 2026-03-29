import { getTransactions } from '../api/storage.js';
import { formatDate, formatValue } from '../utils/formatter.js';

export function initTransactionTable() {
  const listElement = document.getElementById('tabela-transacoes');
  const emptyElement = document.getElementById('empty-transacoes');
  const trasactions = getTransactions();
  listElement.innerHTML = '';
  if (trasactions.length === 0) {
    emptyElement.style.display = 'flex';
    return;
  }
  emptyElement.style.display = 'none';
  const fragment = document.createDocumentFragment();
  trasactions.forEach((transaction) => {
    const itemTransaction = document.createElement('tr');

    const itemDate = document.createElement('td');
    itemDate.textContent = formatDate(transaction.date);

    const itemDescription = document.createElement('td');
    itemDescription.textContent = transaction.description;

    const itemCategory = document.createElement('td');
    itemCategory.textContent = transaction.category;
    itemCategory.classList.add('td-hide-mobile');

    const itemValue = document.createElement('td');
    itemValue.textContent = formatValue(transaction.value);
    itemValue.classList.add('td-value');
    if (transaction.type === 'entrada') {
      itemValue.classList.add('income');
    } else {
      itemValue.classList.add('expense');
    }

    const itemDelete = document.createElement('td');
    const itemButton = document.createElement('button');
    itemButton.textContent = 'Excluir';
    itemButton.dataset.id = transaction.id;
    itemButton.classList.add('btn-danger');
    itemDelete.appendChild(itemButton);

    itemTransaction.appendChild(itemDate);
    itemTransaction.appendChild(itemDescription);
    itemTransaction.appendChild(itemCategory);
    itemTransaction.appendChild(itemValue);
    itemTransaction.appendChild(itemDelete);
    fragment.appendChild(itemTransaction);
  });
  listElement.appendChild(fragment);
}
