import { Chart } from 'chart.js/auto';
import { getTransactions } from '../api/storage.js';

let evolucaoChartInstance = null;

export function initEvolutionChart() {
  const canvasElement = document.getElementById('grafico-evolucao');
  if (!canvasElement) return;

  const transactions = getTransactions();

  const monthlyData = transactions.reduce((acc, transaction) => {
    const monthKey = transaction.date.substring(0, 7);
    const value = Number(transaction.value);

    if (!acc[monthKey]) {
      acc[monthKey] = { income: 0, expense: 0 };
    }

    if (transaction.type === 'entrada') {
      acc[monthKey].income += value;
    } else if (transaction.type === 'saida') {
      acc[monthKey].expense += value;
    }

    return acc;
  }, {});

  const sortedMonths = Object.keys(monthlyData).sort();

  if (sortedMonths.length === 0) {
    return;
  }

  const labels = sortedMonths.map((monthString) => {
    const [year, month] = monthString.split('-');
    const monthNames = [
      'Jan',
      'Fev',
      'Mar',
      'Abr',
      'Mai',
      'Jun',
      'Jul',
      'Ago',
      'Set',
      'Out',
      'Nov',
      'Dez',
    ];
    return `${monthNames[Number(month) - 1]} ${year}`;
  });

  const incomeData = sortedMonths.map((m) => monthlyData[m].income);
  const expenseData = sortedMonths.map((m) => monthlyData[m].expense);

  if (evolucaoChartInstance) {
    evolucaoChartInstance.destroy();
  }

  evolucaoChartInstance = new Chart(canvasElement, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Receitas',
          data: incomeData,
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
        },
        {
          label: 'Despesas',
          data: expenseData,
          borderColor: '#EF4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            usePointStyle: true,
            font: { family: "'Inter', sans-serif" },
          },
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          callbacks: {
            label: function (context) {
              let label = context.dataset.label || '';
              if (label) label += ': ';
              if (context.parsed.y !== null) {
                label += new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(context.parsed.y);
              }
              return label;
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function (value) {
              return 'R$ ' + (value >= 1000 ? value / 1000 + 'k' : value);
            },
          },
        },
      },
    },
  });
}
