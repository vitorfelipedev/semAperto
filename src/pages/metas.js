import { initCategoryBars } from '../components/categoryChartBar.js';
import { initEvolutionChart } from '../components/evolutionChart.js';
import { initExportCSV } from '../components/exportCSV.js';
import { initGoalForm } from '../components/goalForm.js';
import { updateGoalUI, initGoalsModal } from '../components/goalUI.js';
import { initGoogleSync } from '../components/integrationSheets.js';
import { initNavbar } from '../components/navbar.js';

initGoalsModal();
initGoalForm();
updateGoalUI();
initNavbar();
initEvolutionChart();
initCategoryBars();
initExportCSV();
initGoogleSync();
