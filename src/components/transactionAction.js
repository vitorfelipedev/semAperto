import { deleteTransaction } from '../api/storage.js';
import { showToast } from '../utils/toast.js';
import { applyFilters, updateCategories } from './filter.js';

export function initTransactionAction() {
  const tabel = document.getElementById('tabela-transacoes');
  const modalBackdrop = document.getElementById('modal-backdrop');
  const modalConfirmar = document.getElementById('modal-confirmar');
  const btnCancelar = document.getElementById('modal-cancelar');
  const btnFechar = document.getElementById('modal-fechar');
  const btnConfirmar = document.getElementById('modal-confirmar-btn');

  let currentTransactionId = null;

  function closeModal() {
    if (modalBackdrop) modalBackdrop.classList.remove('active');
    if (modalConfirmar) modalConfirmar.classList.remove('active');
    currentTransactionId = null;
  }

  function openModal(id) {
    currentTransactionId = id;
    if (modalBackdrop) modalBackdrop.classList.add('active');
    if (modalConfirmar) modalConfirmar.classList.add('active');
  }

  // Fechar o modal nos botões ou clicando fora
  if (btnCancelar) btnCancelar.addEventListener('click', closeModal);
  if (btnFechar) btnFechar.addEventListener('click', closeModal);
  if (modalBackdrop) modalBackdrop.addEventListener('click', closeModal);

  // Botão vermelho de confirmação final
  if (btnConfirmar) {
    btnConfirmar.addEventListener('click', () => {
      if (currentTransactionId) {
        try {
          deleteTransaction(currentTransactionId);
          showToast('Transação excluída com sucesso!', 'success');
          updateCategories();
          applyFilters();
        } catch {
          showToast('Não foi possível excluir a transação.', 'error');
        }
        closeModal();
      }
    });
  }

  // Clique na lixeira de remover na tabela
  tabel.addEventListener('click', (event) => {
    const deleteButton = event.target.closest('.btn-danger');
    if (deleteButton) {
      const idTransaction = deleteButton.dataset.id;
      openModal(idTransaction);
    }
  });
}
