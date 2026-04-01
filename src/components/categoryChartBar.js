import { getTransactions } from '../api/storage.js';
import { formatValue } from '../utils/formatter.js';

export function initCategoryBars() {
  const container = document.getElementById('category-bars');
  if (!container) return;
  const transactions = getTransactions();
  const expenses = transactions.filter((t) => t.type === 'saida');
  if (expenses.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="padding: 1.5rem; text-align: center;">
        <svg class="icon" style="width:40px;height:40px; color: #9CA3AF; margin-bottom: 8px;">
          <use href="/icons.svg#icon-chart"></use>
        </svg>
        <p style="color: #6B7280;">Sem dados para exibir</p>
      </div>
    `;
    return;
  }
  const expensesByCategory = expenses.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + Number(t.value);
    return acc;
  }, {});
  const totalExpenses = Object.values(expensesByCategory).reduce(
    (acc, val) => acc + val,
    0,
  );
  const sortedEntries = Object.entries(expensesByCategory).sort(
    (a, b) => b[1] - a[1],
  );

  const groupedCategories = [];
  let othersValue = 0;

  sortedEntries.forEach(([name, value], index) => {
    if (index < 5) {
      groupedCategories.push({ name, value });
    } else {
      othersValue += value;
    }
  });

  if (othersValue > 0) {
    groupedCategories.push({ name: 'Outros', value: othersValue });
  }
  container.innerHTML = '';
  const fragment = document.createDocumentFragment();
  const colors = ['#EF4444', '#F59E0B', '#3B82F6', '#10B981', '#8B5CF6'];
  groupedCategories.forEach((cat, index) => {
    const percentage = (cat.value / totalExpenses) * 100;
    const color = colors[index % colors.length];
    const itemDiv = document.createElement('div');
    itemDiv.className = 'category-bar-item';
    itemDiv.style.marginBottom = '1.25rem';
    itemDiv.style.width = '100%';
    itemDiv.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; font-size: 0.875rem; width: 100%;">
        <span style="font-weight: 500; color: #374151;">${cat.name}</span>
        <span style="font-weight: 600; color: #111827;">
          ${formatValue(cat.value)} <span style="color: #6B7280; font-weight: 400; font-size: 0.75rem; margin-left: 4px;">(${percentage.toFixed(1)}%)</span>
        </span>
      </div>
      <div style="width: 100%; height: 8px; background-color: #E5E7EB; border-radius: 999px; overflow: hidden;">
        <div style="width: ${percentage}%; background-color: ${color}; height: 100%; border-radius: 999px; transition: width 1s ease-in-out;"></div>
      </div>
    `;

    fragment.appendChild(itemDiv);
  });

  container.appendChild(fragment);
}
