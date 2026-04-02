import { getTransactions } from '../api/storage.js';
import { formatDate } from '../utils/formatter.js';
import { showToast } from '../utils/toast.js';

export function initExportCSV() {
  const btnExport = document.getElementById('btn-exportar-csv');

  if (!btnExport) return;
  btnExport.addEventListener('click', exportCSV);
}

function exportCSV() {
  const transactions = getTransactions();
  if (transactions.length === 0) {
    showToast('Não há transações a serem exportadas', 'error');
    return;
  }
  const header = ['ID', 'description', 'value', 'type', 'category', 'date'];
  const rows = transactions.map((transaction) => {
    return [
      transaction.id,
      `"${transaction.description}"`,
      transaction.value.toString().replace('.', ','),
      transaction.type,
      transaction.category,
      transaction.date,
    ].join(';');
  });
  const csvContent = [header.join(';'), ...rows].join('\n');
  const blob = new Blob(['\uFEFF' + csvContent], {
    type: 'text/csv;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const today = new Date().toISOString().split('T')[0];
  a.download = `sem_aperto_transacoes_${today}.csv`;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
