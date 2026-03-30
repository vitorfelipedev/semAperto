import { getTransactions } from '../api/storage.js';
import { initTransactionTable } from './transactionTable.js';

export function updateCategories() {
  const filterCategory = document.getElementById('filtro-categoria');
  const transactions = getTransactions();
  const currentSelection = filterCategory.value;
  const categories = transactions.map((transaction) => transaction.category);
  const uniqueCategories = new Set(categories);
  filterCategory.innerHTML =
    '<option value="todas">Todas as categorias</option>';
  const fragment = document.createDocumentFragment();
  uniqueCategories.forEach((category) => {
    const item = document.createElement('option');
    item.value = category;
    item.textContent = category;
    fragment.appendChild(item);
  });
  filterCategory.appendChild(fragment);
  if (uniqueCategories.has(currentSelection)) {
    filterCategory.value = currentSelection;
  }
}

export function applyFilters() {
  const filterMonth = document.getElementById('filtro-mes');
  const filterCategory = document.getElementById('filtro-categoria');
  const filterSearch = document.getElementById('filtro-busca');
  const allTransactions = getTransactions();
  const filterTransactions = allTransactions.filter((transaction) => {
    const dateFilterCont = filterMonth.value.trim();
    const dateFilter = transaction.date.startsWith(dateFilterCont);

    const categoryFilterCont = filterCategory.value;
    let categoryFilter =
      categoryFilterCont === 'todas' ||
      categoryFilterCont === transaction.category;

    const descriptionFilterCont = filterSearch.value.trim().toLowerCase();
    const descriptionFilter = transaction.description
      .toLowerCase()
      .includes(descriptionFilterCont);

    return dateFilter && categoryFilter && descriptionFilter;
  });
  initTransactionTable(filterTransactions);
}

export function initFilters() {
  const filterMonth = document.getElementById('filtro-mes');
  const filterCategory = document.getElementById('filtro-categoria');
  const filterSearch = document.getElementById('filtro-busca');

  filterMonth.addEventListener('change', applyFilters);
  filterCategory.addEventListener('change', applyFilters);
  filterSearch.addEventListener('input', applyFilters);

  updateCategories();
  applyFilters();
}
