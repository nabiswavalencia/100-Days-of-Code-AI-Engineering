let chartInstance = null;

function setStatus(elementId, message, isError = false) {
  const el = document.getElementById(elementId);
  el.textContent = message;
  el.classList.toggle('error', isError);
}

async function loadStats() {
  const loadBtn = document.getElementById('loadStatsBtn');
  loadBtn.disabled = true;
  setStatus('statsStatus', 'Querying the database...');

  try {
    const res = await fetch('/api/overview');
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Could not load the overview.');

    renderStatCards(data);
    renderChart(data);
    const survivalRate = ((data.survived / data.total) * 100).toFixed(1);
    setStatus('statsStatus', `${data.total} passengers on record — ${survivalRate}% survived.`);
  } catch (err) {
    setStatus('statsStatus', err.message, true);
  } finally {
    loadBtn.disabled = false;
  }
}

function renderStatCards(data) {
  const grid = document.getElementById('statGrid');
  grid.innerHTML = '';

  const cards = [
    { label: 'Total passengers', value: data.total },
    { label: 'Survived', value: data.survived },
    { label: 'Did not survive', value: data.died },
    { label: 'Children (under 18)', value: data.children },
    { label: 'Adults', value: data.adults },
    { label: 'Unknown age', value: data.unknown_age },
    { label: 'Average age', value: data.avg_age },
    { label: 'Average fare (£)', value: data.avg_fare },
  ];

  cards.forEach(card => {
    const cardEl = document.createElement('div');
    cardEl.classList.add('stat-card');

    const valueEl = document.createElement('div');
    valueEl.classList.add('value');
    valueEl.textContent = card.value;

    const labelEl = document.createElement('div');
    labelEl.classList.add('label');
    labelEl.textContent = card.label;

    cardEl.appendChild(valueEl);
    cardEl.appendChild(labelEl);
    grid.appendChild(cardEl);
  });

  grid.hidden = false;
}

function renderChart(data) {
  document.getElementById('chartBox').hidden = false;
  const ctx = document.getElementById('survivalChart').getContext('2d');
  if (chartInstance) {
    chartInstance.destroy();
  }

  const labels = data.by_class.map(row => `Class ${row.pclass}`);
  const survived = data.by_class.map(row => row.survived);
  const died = data.by_class.map(row => row.total - row.survived);

  chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        { label: 'Survived', data: survived, backgroundColor: '#16a34a' },
        { label: 'Did not survive', data: died, backgroundColor: '#dc2626' }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { title: { display: true, text: 'Survival by passenger class' } },
      scales: { x: { stacked: true }, y: { stacked: true, title: { display: true, text: 'Passengers' } } }
    }
  });
}

async function searchPassengers() {
  const searchBtn = document.getElementById('searchBtn');
  const pclass = document.getElementById('filterClass').value;
  const sex = document.getElementById('filterSex').value;
  const survived = document.getElementById('filterSurvived').value;

  const params = new URLSearchParams();
  if (pclass) params.set('pclass', pclass);
  if (sex) params.set('sex', sex);
  if (survived) params.set('survived', survived);

  searchBtn.disabled = true;
  setStatus('explorerStatus', 'Querying the database...');

  try {
    const res = await fetch(`/api/passengers?${params.toString()}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Could not load passengers.');

    renderPassengerTable(data.passengers);
    setStatus('explorerStatus', `Showing ${data.count} passenger(s).`);
  } catch (err) {
    setStatus('explorerStatus', err.message, true);
  } finally {
    searchBtn.disabled = false;
  }
}

function renderPassengerTable(passengers) {
  const body = document.getElementById('passengerTableBody');
  body.innerHTML = '';

  passengers.forEach(p => {
    const row = document.createElement('tr');

    const nameCell = document.createElement('td');
    nameCell.textContent = p.name;

    const sexCell = document.createElement('td');
    sexCell.textContent = p.sex;

    const ageCell = document.createElement('td');
    ageCell.textContent = p.age ?? 'Unknown';

    const classCell = document.createElement('td');
    classCell.textContent = p.pclass;

    const fareCell = document.createElement('td');
    fareCell.textContent = `£${p.fare.toFixed(2)}`;

    const outcomeCell = document.createElement('td');
    const badge = document.createElement('span');
    badge.classList.add('badge', p.survived ? 'survived' : 'died');
    badge.textContent = p.survived ? 'Survived' : 'Did not survive';
    outcomeCell.appendChild(badge);

    row.appendChild(nameCell);
    row.appendChild(sexCell);
    row.appendChild(ageCell);
    row.appendChild(classCell);
    row.appendChild(fareCell);
    row.appendChild(outcomeCell);
    body.appendChild(row);
  });

  document.getElementById('passengerTable').hidden = false;
}

document.getElementById('loadStatsBtn').addEventListener('click', loadStats);
document.getElementById('searchBtn').addEventListener('click', searchPassengers);
