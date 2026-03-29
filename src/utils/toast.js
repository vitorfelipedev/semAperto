export function showToast(message, type = 'success') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  const iconId = type === 'success' ? 'icon-check' : 'icon-alert';
  toast.innerHTML = `
    <div class="toast-icon">
      <svg class="icon" style="width: 16px; height: 16px;"><use href="/icons.svg#${iconId}"></use></svg>
    </div>
    <span class="toast-message">${message}</span>
  `;

  container.appendChild(toast);

  // Força o reflow para a animação inicial do CSS funcionar
  void toast.offsetWidth;

  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
    toast.addEventListener('transitionend', () => toast.remove(), {
      once: true,
    });
  }, 3000);
}
