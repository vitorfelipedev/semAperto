import { addNewTransaction } from '../api/storage.js';
import { showToast } from '../utils/toast.js';
import { applyFilters, updateCategories } from './filter.js';
import { initTransactionTable } from './transactionTable.js';

export function initTransactionForm() {
  const form = document.getElementById('form-transacao');
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const description = formData
      .get('description')
      .replace(/[^a-zA-Z0-9\s.,\-_\/()"'À-ÿ]/g, '')
      .trim();
    const value = formData
      .get('value')
      .replace(/[^\d.,-]/g, '')
      .replace(',', '.');
    const type = formData.get('type');
    const category = formData
      .get('category')
      .replace(/[^a-zA-Z0-9\s.,\-_\/()"'À-ÿ]/g, '')
      .trim();
    const date = formData.get('date');
    try {
      const ret = addNewTransaction({
        description,
        value,
        type,
        category,
        date,
      });
      if (ret) {
        form.reset();
        showToast('Transação salva com sucesso!', 'success');
        document.getElementById('descricao').focus();
        updateCategories();
        applyFilters();
      }
    } catch {
      showToast('Erro ao salvar a transação. Tente novamente.', 'error');
      console.error(error);
    }
  });
}
