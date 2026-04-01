import { Chart } from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { getTransactions } from '../api/storage.js';
import { getCurrentMonth } from '../utils/formatter';

let chartInstance = null;
let customThemeObserver = null;

export function initCategoryChart() {
  const canvasElement = document.getElementById('grafico-categorias');
  if (!canvasElement) return;
  const allTransactions = getTransactions();
  const currentMonth = getCurrentMonth();

  const expensesByCategory = allTransactions
    .filter((t) => t.date.startsWith(currentMonth))
    .filter((t) => t.type === 'saida')
    .reduce((acc, transaction) => {
      const category = transaction.category;
      const value = Number(transaction.value);
      acc[category] = (acc[category] || 0) + value;
      return acc;
    }, {});
  const labels = Object.keys(expensesByCategory);
  const data = Object.values(expensesByCategory);
  if (chartInstance) {
    chartInstance.destroy();
  }

  if (labels.length === 0) {
    return;
  }

  const getTextColor = () => {
    return (
      getComputedStyle(document.documentElement)
        .getPropertyValue('--color-text')
        .trim() || '#1a3a2a'
    );
  };

  chartInstance = new Chart(canvasElement, {
    type: 'pie',
    plugins: [ChartDataLabels],
    data: {
      labels: labels,
      datasets: [
        {
          data: data,
          backgroundColor: [
            '#3b82f6',
            '#f59e0b',
            '#10b981',
            '#ef4444',
            '#8b5cf6',
            '#06b6d4',
            '#f43f5e',
            '#64748b',
          ],
          borderWidth: 0,
          hoverOffset: 6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '50%',
      plugins: {
        datalabels: {
          color: '#ffffff',
          font: {
            weight: 'bold',
            family: "'Inter', sans-serif",
            size: 14,
          },
          formatter: (value, context) => {
            const chart = context.chart;
            const dataArray = context.chart.data.datasets[0].data;
            let total = 0;
            dataArray.forEach((dataValue, index) => {
              if (chart.getDataVisibility(index)) {
                total += dataValue;
              }
            });

            // Evita divisão por zero caso todas as categorias sejam ocultadas
            if (total === 0) return null;

            const percentage = ((value * 100) / total).toFixed(1);

            if (percentage < 5) {
              return null;
            }

            return percentage + '%';
          },
        },
        legend: {
          position: 'right',
          labels: {
            color: getTextColor(),
            font: {
              family: "'Inter', sans-serif",
              size: 13,
            },
            usePointStyle: true,
            padding: 20,
          },
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              let label = context.label || '';
              if (label) {
                label += ': ';
              }
              if (context.parsed !== null) {
                label += new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(context.parsed);
              }
              return label;
            },
          },
        },
      },
    },
  });

  if (customThemeObserver) {
    customThemeObserver.disconnect();
  }

  customThemeObserver = new MutationObserver(() => {
    if (chartInstance) {
      chartInstance.options.plugins.legend.labels.color = getTextColor();
      chartInstance.update();
    }
  });

  customThemeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  });
}
