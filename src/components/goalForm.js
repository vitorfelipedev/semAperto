import { addNewGoal, deleteGoal, getGoals } from '../api/storage.js';
import { updateGoalUI } from './goalUI.js';
import { showToast } from '../utils/toast.js';

export function initGoalForm() {
  const btnSave = document.getElementById('btn-salvar-meta');

  btnSave.addEventListener('click', () => {
    const titleInput = document.getElementById('meta-nome').value;
    const valueInput = Number(document.getElementById('meta-valor').value);
    const dateInput = document.getElementById('meta-mes').value;

    // Validação básica
    if (!titleInput || valueInput <= 0 || !dateInput) {
      showToast('Por favor, preencha todos os campos da meta corretamente.', 'error');
      return;
    }

    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    const [inputYear, inputMonth] = dateInput.split('-').map(Number);

    if (inputYear < currentYear || (inputYear === currentYear && inputMonth < currentMonth)) {
      showToast('Não é possível criar metas com data no passado.', 'error');
      return;
    }

    // Salva a nova meta
    addNewGoal({
      title: titleInput,
      targetValue: valueInput,
      currentValue: 0,
      deadline: dateInput,
    });

    document.getElementById('meta-nome').value = '';
    document.getElementById('meta-valor').value = '';
    document.getElementById('meta-mes').value = '';

    updateGoalUI();
    showToast('Meta criada com sucesso!', 'success');
  });
}
