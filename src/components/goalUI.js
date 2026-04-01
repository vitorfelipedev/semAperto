import {
  getGoals,
  getTransactions,
  deleteGoal,
  updateGoal,
  addNewTransaction,
} from '../api/storage.js';
import { showToast } from '../utils/toast.js';

const formatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

function getMonthName(dateString) {
  if (!dateString) return '';
  const [year, month] = dateString.split('-');
  const monthNames = [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
  ];
  return `${monthNames[Number(month) - 1]} ${year}`;
}

export function initGoalsModal() {
  const backdrop = document.getElementById('modal-backdrop');

  const modal = document.getElementById('modal-confirmar');
  const btnCancel = document.getElementById('modal-cancelar');
  const btnClose = document.getElementById('modal-fechar');
  const btnConfirm = document.getElementById('modal-confirmar-btn');

  const modalTrans = document.getElementById('modal-transacao-meta');
  const btnTransCancel = document.getElementById('modal-transacao-cancelar');
  const btnTransClose = document.getElementById('modal-transacao-fechar');
  const btnTransConfirm = document.getElementById('modal-transacao-confirmar');

  const modalAlvo = document.getElementById('modal-alvo-menor');
  const btnAlvoCancel = document.getElementById('modal-alvo-cancelar');
  const btnAlvoClose = document.getElementById('modal-alvo-fechar');
  const btnAlvoConfirm = document.getElementById('modal-alvo-confirmar');

  const closeModal = () => {
    if (modal) modal.classList.remove('active');
    if (backdrop) backdrop.classList.remove('active');
    window.goalToDelete = null;
  };

  const closeTransModal = () => {
    if (modalTrans) modalTrans.classList.remove('active');
    if (backdrop) backdrop.classList.remove('active');
    window.goalToComplete = null;
  };

  const closeAlvoModal = () => {
    if (modalAlvo) modalAlvo.classList.remove('active');
    if (backdrop) backdrop.classList.remove('active');
    window.pendingCompleteId = null;
  };

  if (btnCancel) btnCancel.addEventListener('click', closeModal);
  if (btnClose) btnClose.addEventListener('click', closeModal);
  
  if (btnTransCancel) btnTransCancel.addEventListener('click', closeTransModal);
  if (btnTransClose) btnTransClose.addEventListener('click', closeTransModal);

  if (btnAlvoCancel) btnAlvoCancel.addEventListener('click', closeAlvoModal);
  if (btnAlvoClose) btnAlvoClose.addEventListener('click', closeAlvoModal);

  if (backdrop) {
    backdrop.addEventListener('click', () => {
      closeModal();
      closeTransModal();
      closeAlvoModal();
    });
  }

  if (btnConfirm) {
    btnConfirm.addEventListener('click', () => {
      if (window.goalToDelete) {
        deleteGoal(window.goalToDelete);
        updateGoalUI();
        closeModal();
        showToast('Meta excluída com sucesso.', 'success');
      }
    });
  }

  if (btnAlvoConfirm) {
    btnAlvoConfirm.addEventListener('click', () => {
      if (window.pendingCompleteId) {
        const idToComplete = window.pendingCompleteId;
        closeAlvoModal();
        window.openTransModal(idToComplete);
      }
    });
  }

  if (btnTransConfirm) {
    btnTransConfirm.addEventListener('click', () => {
      const form = document.getElementById('form-transacao-meta');
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      
      if (window.goalToComplete) {
        const desc = document.getElementById('tm-descricao').value;
        const val = Number(document.getElementById('tm-valor').value);
        const cat = document.getElementById('tm-categoria').value;
        const date = document.getElementById('tm-data').value;
        
        addNewTransaction({
          description: desc,
          value: val,
          type: 'saida',
          category: cat,
          date: date
        });

        updateGoal(window.goalToComplete, { status: 'completed', currentValue: val });
        
        updateGoalUI();
        closeTransModal();
        showToast('Parabéns! Meta concluída e registrada.', 'success');
      }
    });
  }
}

export function updateGoalUI() {
  const goals = getGoals();
  const transactions = getTransactions();

  const totalBalance = transactions.reduce((acc, t) => {
    const val = Number(t.value);
    return t.type === 'entrada' ? acc + val : acc - val;
  }, 0);

  const activeGoals = goals.filter((g) => g.status === 'active' || !g.status);
  const totalAllocated = activeGoals.reduce((acc, g) => acc + (Number(g.currentValue) || 0), 0);

  const availableBalance = (totalBalance - totalAllocated) > 0 ? (totalBalance - totalAllocated) : 0;
  
  const displaySaldo = document.getElementById('saldo-disponivel');
  if (displaySaldo) displaySaldo.textContent = formatter.format(availableBalance);

  const listContainer = document.getElementById('goals-list');
  if (!listContainer) return;

  listContainer.innerHTML = '';

  if (goals.length === 0) {
    listContainer.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1; padding: var(--space-8); text-align: center; color: var(--color-text-muted);">
        <svg class="icon" style="width:48px;height:48px; margin-bottom: var(--space-4); margin-inline: auto;">
          <use href="/icons.svg#icon-target"></use>
        </svg>
        <p>Você ainda não possui nenhuma meta definida.</p>
      </div>`;
    return;
  }

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;

  goals.forEach((goal) => {
    const isCompleted = goal.status === 'completed';
    const percentage = isCompleted ? 100 : ((goal.currentValue / goal.targetValue) * 100);
    const barWidth = Math.min(percentage || 0, 100);
    
    let isDelayed = false;
    if (!isCompleted && goal.deadline) {
      const [goalYear, goalMonth] = goal.deadline.split('-').map(Number);
      if (goalYear < currentYear || (goalYear === currentYear && goalMonth < currentMonth)) {
        isDelayed = true;
      }
    }

    const card = document.createElement('div');
    card.className = 'goal-card animate-fade-in-up';
    if (isCompleted) card.style.opacity = '0.7';

    // Core Colors
    let colorStatus = '#3B82F6'; // default
    let iconStatus = 'target';
    let textStatus = 'Em andamento';
    
    if (isCompleted) {
      colorStatus = '#10B981';
      iconStatus = 'check';
      textStatus = 'Meta concluída!';
    } else if (isDelayed) {
      colorStatus = '#ef4444';
      iconStatus = 'alert';
      textStatus = 'Atrasada';
    }

    let cardHTML = `
      <div class="goal-card-header">
        <div class="goal-values" style="flex-direction: column; align-items: flex-start; gap: var(--space-1);">
          <span class="goal-current" style="font-size: var(--font-size-lg); font-weight: bold;">${goal.title}</span>
          <span class="goal-target">Alvo: <strong>${formatter.format(goal.targetValue)}</strong> até ${getMonthName(goal.deadline)}</span>
          <span class="goal-target" style="color: var(--color-primary-500); margin-top: 4px;">Alocado: <strong>${formatter.format(goal.currentValue)}</strong></span>
        </div>
        <span class="badge">${barWidth.toFixed(1)}%</span>
      </div>

      <div class="progress-wrapper">
        <div class="progress-bar-container">
          <div class="progress-bar" style="width: ${barWidth}%; background-color: ${colorStatus};"></div>
        </div>
      </div>

      <div class="status-alert" style="margin-top: var(--space-4); color: ${colorStatus};">
        <svg class="icon">
          <use href="/icons.svg#icon-${iconStatus}"></use>
        </svg>
        ${textStatus}
      </div>
    `;

    if (!isCompleted) {
      cardHTML += `
      <div class="goal-actions">
        <div class="goal-allocate-form">
          <input type="number" id="alloc-val-${goal.id}" placeholder="Valor (R$)" step="0.01" style="flex:1;" />
          <button class="btn-primary" onclick="window.handleAllocateGoal('${goal.id}')" style="padding: 0 var(--space-3);">Alocar</button>
        </div>
        <div class="goal-actions-buttons">
          <button class="btn-secondary" onclick="window.handleCompleteGoal('${goal.id}')">Concluir</button>
          <button class="btn-secondary" onclick="window.handleDeleteGoal('${goal.id}')" style="color: #ef4444; border-color: rgba(239, 68, 68, 0.3);">Excluir</button>
        </div>
      </div>
      `;
    } else {
      cardHTML += `
      <div class="goal-actions" style="border-top: none;">
        <div class="goal-actions-buttons" style="justify-content: flex-end;">
          <button class="btn-secondary" onclick="window.handleDeleteGoal('${goal.id}')" style="color: #ef4444; border-color: rgba(239, 68, 68, 0.3);">Excluir</button>
        </div>
      </div>
      `;
    }

    card.innerHTML = cardHTML;
    listContainer.appendChild(card);
  });
}

window.handleAllocateGoal = (id) => {
  const goals = getGoals();
  const goal = goals.find((g) => g.id === id);
  if (!goal) return;

  const inputEl = document.getElementById(`alloc-val-${id}`);
  const amount = Number(inputEl.value);

  if (!amount || amount <= 0) {
    showToast('Informe um valor válido maior que zero.', 'error');
    return;
  }

  const transactions = getTransactions();
  const totalBalance = transactions.reduce((acc, t) => {
    return t.type === 'entrada' ? acc + Number(t.value) : acc - Number(t.value);
  }, 0);
  
  const activeGoals = goals.filter((g) => g.status === 'active' || !g.status);
  const totalAllocated = activeGoals.reduce((acc, g) => acc + (Number(g.currentValue) || 0), 0);
  const availableBalance = totalBalance - totalAllocated;

  if (amount > availableBalance) {
    showToast(`Saldo insuficiente! Você tem ${formatter.format(availableBalance)} livre.`, 'error');
    return;
  }

  updateGoal(id, { currentValue: Number(goal.currentValue) + amount });
  updateGoalUI();
  showToast('Valor alocado com sucesso!', 'success');
};

window.openTransModal = (id) => {
  const goals = getGoals();
  const goal = goals.find((g) => g.id === id);
  if (!goal) return;

  const modalTrans = document.getElementById('modal-transacao-meta');
  const backdrop = document.getElementById('modal-backdrop');
  
  if (modalTrans && backdrop) {
    window.goalToComplete = id;
    
    document.getElementById('tm-descricao').value = 'Meta Atingida: ' + goal.title;
    document.getElementById('tm-valor').value = goal.currentValue.toFixed(2);
    document.getElementById('tm-categoria').value = 'Metas';
    document.getElementById('tm-data').value = new Date().toISOString().split('T')[0];

    modalTrans.classList.add('active');
    backdrop.classList.add('active');
  } else {
    // Fallback se n carregou o ID
    addNewTransaction({
      description: 'Meta Atingida: ' + goal.title,
      value: goal.currentValue,
      type: 'saida',
      category: 'Metas',
      date: new Date().toISOString().split('T')[0],
    });
    updateGoal(id, { status: 'completed' });
    updateGoalUI();
    showToast('Parabéns! Meta concluída e debitada do saldo.', 'success');
  }
};

window.handleCompleteGoal = (id) => {
  const goals = getGoals();
  const goal = goals.find((g) => g.id === id);
  if (!goal) return;

  if (goal.currentValue < goal.targetValue) {
    const difference = goal.targetValue - goal.currentValue;
    const msg = `O valor alocado é menor que o alvo. Faltam ${formatter.format(difference)}. Abrir formulário de conclusão mesmo assim?`;
    
    const modalAlvo = document.getElementById('modal-alvo-menor');
    const backdrop = document.getElementById('modal-backdrop');
    const msgEl = document.getElementById('modal-alvo-mensagem');
    
    if (modalAlvo && backdrop) {
      if (msgEl) msgEl.textContent = msg;
      window.pendingCompleteId = id;
      modalAlvo.classList.add('active');
      backdrop.classList.add('active');
      return; // Trava aqui até ele confirmar
    }
  }

  // Se atingiu o alvo, já abre direto o form transação
  window.openTransModal(id);
};

window.handleDeleteGoal = (id) => {
  const modal = document.getElementById('modal-confirmar');
  const backdrop = document.getElementById('modal-backdrop');
  if (modal && backdrop) {
    window.goalToDelete = id;
    modal.classList.add('active');
    backdrop.classList.add('active');
  } else {
    if (confirm('Tem certeza que deseja excluir esta meta?')) {
      deleteGoal(id);
      updateGoalUI();
      showToast('Meta excluída com sucesso.', 'success');
    }
  }
};
