const calculateBtn = document.getElementById('calculateBtn');
const resultSection = document.getElementById('resultSection');
const totalFootprint = document.getElementById('totalFootprint');
const tipsContainer = document.getElementById('tipsContainer');
const setGoalBtn = document.getElementById('setGoalBtn');
const progressText = document.getElementById('progressText');
const progressBar = document.getElementById('progressBar');
const toggleDarkMode = document.getElementById('toggleDarkMode');

let footprintData = { transport: 0, food: 0, energy: 0 };
let currentFootprint = 0;
let goal = parseFloat(localStorage.getItem('goal')) || 100;
let chart;


const ecoTips = [
  { title: 'Reduce Car Usage', description: 'Use public transit, bike, or walk to cut transport emissions.' },
  { title: 'Eat Plant-Based', description: 'Reduce meat consumption to lower your food footprint.' },
  { title: 'Save Energy', description: 'Switch to LED bulbs and unplug devices when not in use.' },
  { title: 'Carpool', description: 'Share rides to reduce per-person emissions.' },
];

// Initialize
renderTips();
updateProgress();
toggleDarkMode.addEventListener('click', toggleMode);
calculateBtn.addEventListener('click', calculateFootprint);
setGoalBtn.addEventListener('click', setGoal);

// Toggle dark mode
function toggleMode() {
  document.body.classList.toggle('dark-mode');
  if (chart) {
    chart.options.plugins.legend.labels.color = document.body.classList.contains('dark-mode') ? '#e5e7eb' : '#374151';
    chart.options.plugins.title.color = document.body.classList.contains('dark-mode') ? '#e5e7eb' : '#374151';
    chart.update();
  }
}

// Calculate carbon footprint
function calculateFootprint() {
  calculateBtn.disabled = true;
  calculateBtn.classList.add('loading');
  calculateBtn.textContent = 'Calculating...';

  const milesDriven = parseFloat(document.getElementById('milesDriven').value) || 0;
  const transitMiles = parseFloat(document.getElementById('transitMiles').value) || 0;
  const meatMeals = parseFloat(document.getElementById('meatMeals').value) || 0;
  const electricity = parseFloat(document.getElementById('electricity').value) || 0;

  // CO2 calculations (kg CO2 per week)
  const carEmissions = milesDriven * 0.404; // 0.404 kg CO2 per mile
  const transitEmissions = transitMiles * 0.1; // 0.1 kg CO2 per mile
  const foodEmissions = meatMeals * 5; // 5 kg CO2 per meat meal
  const energyEmissions = (electricity / 4) * 0.5; // 0.5 kg CO2 per kWh, monthly to weekly

  footprintData = {
    transport: carEmissions + transitEmissions,
    food: foodEmissions,
    energy: energyEmissions,
  };

  currentFootprint = footprintData.transport + footprintData.food + footprintData.energy + footprintData.electricity;
  localStorage.setItem('currentFootprint', currentFootprint);

  totalFootprint.textContent = `Your weekly carbon footprint is ${currentFootprint.toFixed(2)} kg CO2.`;
  resultSection.classList.remove('hidden');

  drawChart();
  updateProgress();
  animateSections();

  calculateBtn.disabled = false;
  calculateBtn.classList.remove('loading');
  calculateBtn.textContent = 'Calculate Footprint';
}

// Render pie chart
function drawChart() {
  const ctx = document.getElementById('footprintChart').getContext('2d');
  if (chart) chart.destroy();
  chart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['Transport', 'Food', 'Energy','electricity'],
      datasets: [{
        data: [footprintData.transport, footprintData.food, footprintData.energy,footprintData.electricity],
        backgroundColor: ['#2ecc71', '#e74c3c', '#f1c40f','blue'],
        borderWidth: 1,
        borderColor: '#ffffff',
      }],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            font: { size: 14 },
            color: document.body.classList.contains('dark-mode') ? '#e5e7eb' : '#374151',
          },
        },
        title: {
          display: true,
          text: 'Footprint Breakdown',
          font: { size: 16, weight: 'bold' },
          color: document.body.classList.contains('dark-mode') ? '#e5e7eb' : '#374151',
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const value = context.raw;
              const total = footprintData.transport + footprintData.food + footprintData.energy;
              const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
              return `${context.label}: ${value.toFixed(2)} kg CO2 (${percentage}%)`;
            },
          },
        },
      },
    },
  });
}

// Render eco-tips
function renderTips() {
  tipsContainer.innerHTML = ecoTips
    .map(
      (tip) => `
        <div class="tip-card bg-white p-4 rounded-lg shadow-md cursor-pointer">
          <h3 class="text-lg font-semibold text-green-800">${tip.title}</h3>
          <p class="text-gray-600">${tip.description}</p>
        </div>
      `
    )
    .join('');
}

// Set reduction goal
function setGoal() {
  goal = parseFloat(document.getElementById('goalInput').value) || 100;
  localStorage.setItem('goal', goal);
  updateProgress();
}

// Update progress
function updateProgress() {
  const reduction = Math.max(goal - currentFootprint, 0);
  const progress = (reduction / goal) * 100;
  progressText.textContent = `Progress: ${reduction.toFixed(2)} kg CO2 reduced of ${goal} kg goal.`;
  progressBar.style.width = `${Math.min(progress, 100)}%`;
}

// Animate sections
function animateSections() {
  anime({
    targets: '#resultSection, #tipsSection, #progressSection',
    translateY: [50, 0],
    opacity: [0, 1],
    duration: 1000,
    easing: 'easeOutQuad',
    delay: anime.stagger(200),
  });
}
