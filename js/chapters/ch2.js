// ========================================
// Chapter 2: SD — The Language of Feedback
// 1. Bathtub Model (Stocks & Flows)
// 2. Behavior Patterns Gallery
// 3. Tragedy of the Commons (Fishing)
// ========================================

document.addEventListener('DOMContentLoaded', () => {
  initBathtub();
  initBehaviorPatterns();
  initFishingSim();
});

// =============================================
// 1. Bathtub Model — Real-time stock-flow
// =============================================
function initBathtub() {
  const container = document.getElementById('bathtub-sim');
  if (!container) return;

  const canvas = document.createElement('canvas');
  canvas.width = 500;
  canvas.height = 320;
  canvas.style.width = '100%';
  canvas.style.maxWidth = '500px';
  canvas.style.height = 'auto';
  canvas.style.display = 'block';
  canvas.style.margin = '0 auto';

  const vizArea = container.querySelector('.viz-area') || container;
  vizArea.innerHTML = '';
  vizArea.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  const inflowSlider = document.getElementById('bathtub-inflow');
  const outflowSlider = document.getElementById('bathtub-outflow');
  const inflowVal = document.getElementById('bathtub-inflow-val');
  const outflowVal = document.getElementById('bathtub-outflow-val');
  const statusPanel = document.getElementById('bathtub-status');

  let waterLevel = 50; // 0-100
  const history = [];
  const maxHistory = 200;
  let running = true;

  inflowSlider?.addEventListener('input', () => {
    inflowVal.textContent = inflowSlider.value;
  });
  outflowSlider?.addEventListener('input', () => {
    outflowVal.textContent = outflowSlider.value;
  });

  function update() {
    if (!running) return;

    const inflow = parseInt(inflowSlider.value);
    const outflow = parseInt(outflowSlider.value);
    const net = (inflow - outflow) * 0.02;
    waterLevel = Math.max(0, Math.min(100, waterLevel + net));

    history.push(waterLevel);
    if (history.length > maxHistory) history.shift();

    // Update status
    if (statusPanel) {
      const isTH = i18n.currentLang === 'th';
      let status, color;
      if (inflow > outflow) {
        status = isTH ? 'กระแสเข้า > กระแสออก → ระดับน้ำเพิ่มขึ้น' : 'Inflow > Outflow → Water level rising';
        color = '#06d6a0';
      } else if (inflow < outflow) {
        status = isTH ? 'กระแสออก > กระแสเข้า → ระดับน้ำลดลง' : 'Outflow > Inflow → Water level falling';
        color = '#e94560';
      } else {
        status = isTH ? 'กระแสเข้า = กระแสออก → ดุลยภาพเชิงพลวัต' : 'Inflow = Outflow → Dynamic Equilibrium';
        color = '#ffd166';
      }
      statusPanel.innerHTML = `<strong>${(isTH ? 'ระดับน้ำ' : 'Water Level')}: ${waterLevel.toFixed(1)}%</strong><br>${status}`;
      statusPanel.style.borderLeftColor = color;
    }

    draw();
    requestAnimationFrame(update);
  }

  function draw() {
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#16213e';
    ctx.fillRect(0, 0, w, h);

    // Draw bathtub container
    const tubX = 30, tubY = 30, tubW = 180, tubH = 250;
    ctx.strokeStyle = '#4a5568';
    ctx.lineWidth = 2;
    ctx.strokeRect(tubX, tubY, tubW, tubH);

    // Water fill
    const waterH = (waterLevel / 100) * tubH;
    const waterY = tubY + tubH - waterH;
    const gradient = ctx.createLinearGradient(0, waterY, 0, tubY + tubH);
    gradient.addColorStop(0, 'rgba(0,180,216,0.6)');
    gradient.addColorStop(1, 'rgba(0,100,180,0.8)');
    ctx.fillStyle = gradient;
    ctx.fillRect(tubX + 1, waterY, tubW - 2, waterH);

    // Inflow arrow (top)
    const inflow = parseInt(inflowSlider.value);
    if (inflow > 0) {
      ctx.strokeStyle = '#06d6a0';
      ctx.lineWidth = Math.max(1, inflow / 15);
      ctx.beginPath();
      ctx.moveTo(tubX + tubW / 2, tubY - 15);
      ctx.lineTo(tubX + tubW / 2, tubY + 10);
      ctx.stroke();
      ctx.fillStyle = '#06d6a0';
      ctx.beginPath();
      ctx.moveTo(tubX + tubW / 2 - 8, tubY + 5);
      ctx.lineTo(tubX + tubW / 2 + 8, tubY + 5);
      ctx.lineTo(tubX + tubW / 2, tubY + 15);
      ctx.fill();
    }

    // Outflow arrow (bottom)
    const outflow = parseInt(outflowSlider.value);
    if (outflow > 0) {
      ctx.strokeStyle = '#e94560';
      ctx.lineWidth = Math.max(1, outflow / 15);
      ctx.beginPath();
      ctx.moveTo(tubX + tubW / 2, tubY + tubH + 5);
      ctx.lineTo(tubX + tubW / 2, tubY + tubH + 25);
      ctx.stroke();
      ctx.fillStyle = '#e94560';
      ctx.beginPath();
      ctx.moveTo(tubX + tubW / 2 - 8, tubY + tubH + 20);
      ctx.lineTo(tubX + tubW / 2 + 8, tubY + tubH + 20);
      ctx.lineTo(tubX + tubW / 2, tubY + tubH + 30);
      ctx.fill();
    }

    // Labels
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#06d6a0';
    ctx.fillText(i18n.currentLang === 'th' ? 'กระแสเข้า' : 'Inflow', tubX + tubW / 2, tubY - 20);
    ctx.fillStyle = '#e94560';
    ctx.fillText(i18n.currentLang === 'th' ? 'กระแสออก' : 'Outflow', tubX + tubW / 2, tubY + tubH + 45);

    // Stock label inside tub
    ctx.fillStyle = '#edf2f7';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText(i18n.currentLang === 'th' ? 'สต็อก' : 'Stock', tubX + tubW / 2, tubY + tubH / 2);
    ctx.font = '12px sans-serif';
    ctx.fillText(waterLevel.toFixed(1) + '%', tubX + tubW / 2, tubY + tubH / 2 + 18);

    // History chart (right side)
    const chartX = 240, chartY = 40, chartW = 240, chartH = 230;

    // Chart background
    ctx.strokeStyle = '#4a5568';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(chartX, chartY);
    ctx.lineTo(chartX, chartY + chartH);
    ctx.lineTo(chartX + chartW, chartY + chartH);
    ctx.stroke();

    // Grid
    ctx.strokeStyle = 'rgba(74,85,104,0.3)';
    ctx.lineWidth = 0.5;
    for (let i = 1; i < 4; i++) {
      const y = chartY + (i / 4) * chartH;
      ctx.beginPath();
      ctx.moveTo(chartX, y);
      ctx.lineTo(chartX + chartW, y);
      ctx.stroke();
    }

    // Y-axis labels
    ctx.fillStyle = '#4a5568';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('100', chartX - 5, chartY + 4);
    ctx.fillText('50', chartX - 5, chartY + chartH / 2 + 4);
    ctx.fillText('0', chartX - 5, chartY + chartH + 4);

    // Draw history line
    if (history.length > 1) {
      ctx.strokeStyle = '#00b4d8';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let i = 0; i < history.length; i++) {
        const x = chartX + (i / maxHistory) * chartW;
        const y = chartY + chartH - (history[i] / 100) * chartH;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // Chart title
    ctx.fillStyle = '#a0aec0';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(i18n.currentLang === 'th' ? 'ระดับน้ำตามเวลา' : 'Water Level Over Time', chartX + chartW / 2, chartY + chartH + 20);
  }

  draw();
  requestAnimationFrame(update);
}


// =============================================
// 2. Behavior Patterns Gallery
// =============================================
function initBehaviorPatterns() {
  const container = document.getElementById('pattern-chart');
  if (!container) return;

  const canvas = document.createElement('canvas');
  canvas.width = 500;
  canvas.height = 300;
  canvas.style.width = '100%';
  canvas.style.maxWidth = '500px';
  canvas.style.height = 'auto';
  canvas.style.display = 'block';
  canvas.style.margin = '0 auto';

  const vizArea = container.querySelector('.viz-area') || container;
  vizArea.innerHTML = '';
  vizArea.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  const descPanel = document.getElementById('pattern-description');
  const titleEl = document.getElementById('pattern-chart-title');

  const patterns = {
    'exponential': {
      title: { en: 'Exponential Growth', th: 'การเติบโตแบบทวีคูณ' },
      desc: {
        en: '<p>Driven by a <strong>reinforcing loop</strong>. The more there is, the more is added. Growth accelerates over time.</p><p><strong>Structure:</strong> R loop dominant, no limits.</p><p><strong>Rule of 70:</strong> Doubling time ≈ 70 ÷ growth rate (%)<br>Example: $100 at 7% interest doubles in ~10 years.</p><p><strong>Examples:</strong> Compound interest, viral spread, population growth (early stage).</p>',
        th: '<p>ขับเคลื่อนโดย<strong>วงจรเสริมแรง</strong> ยิ่งมีมากยิ่งเพิ่มมาก การเติบโตเร่งตัวขึ้นตามเวลา</p><p><strong>โครงสร้าง:</strong> วงจร R ครอบงำ ไม่มีขีดจำกัด</p><p><strong>กฎ 70:</strong> เวลาเพิ่มเท่าตัว ≈ 70 ÷ อัตราเติบโต (%)<br>ตัวอย่าง: $100 ที่ดอกเบี้ย 7% เพิ่มเท่าตัวใน ~10 ปี</p><p><strong>ตัวอย่าง:</strong> ดอกเบี้ยทบต้น การแพร่ระบาดของไวรัส การเติบโตของประชากร (ระยะแรก)</p>'
      },
      generate: (n) => {
        const data = [];
        for (let i = 0; i < n; i++) data.push(Math.exp(i * 0.04));
        return data;
      }
    },
    'goal-seeking': {
      title: { en: 'Goal-Seeking', th: 'แสวงหาเป้าหมาย' },
      desc: {
        en: '<p>Driven by a <strong>balancing loop</strong>. The system moves toward a goal, fast at first, then slowing as it gets closer.</p><p><strong>Structure:</strong> B loop with a target. The gap between actual and desired shrinks over time.</p><p><strong>Analogy:</strong> A hot cup of coffee cooling to room temperature — the bigger the gap, the faster the change.</p><p><strong>Examples:</strong> Thermostat, inventory reorder, drug concentration in blood.</p>',
        th: '<p>ขับเคลื่อนโดย<strong>วงจรสมดุล</strong> ระบบเคลื่อนไปสู่เป้าหมาย เร็วตอนแรก แล้วช้าลงเมื่อใกล้ถึง</p><p><strong>โครงสร้าง:</strong> วงจร B ที่มีเป้าหมาย ช่องว่างระหว่างจริงกับที่ต้องการหดลงตามเวลา</p><p><strong>เปรียบเทียบ:</strong> กาแฟร้อนเย็นลงสู่อุณหภูมิห้อง — ยิ่งต่างมากยิ่งเปลี่ยนเร็ว</p><p><strong>ตัวอย่าง:</strong> เทอร์โมสตัท การสั่งสินค้าคงคลัง ความเข้มข้นยาในเลือด</p>'
      },
      generate: (n) => {
        const data = [];
        const goal = 80;
        let val = 10;
        for (let i = 0; i < n; i++) {
          data.push(val);
          val += (goal - val) * 0.05;
        }
        return data;
      }
    },
    'oscillation': {
      title: { en: 'Oscillation', th: 'การแกว่ง' },
      desc: {
        en: '<p>Driven by a <strong>balancing loop with delays</strong>. The system overshoots its goal, then over-corrects, creating cycles.</p><p><strong>Structure:</strong> B loop + time delay. The correction arrives too late, causing oscillation around the target.</p><p><strong>Analogy:</strong> Adjusting a shower — you turn it hot, wait, it\'s too hot, turn it cold, wait, too cold...</p><p><strong>Examples:</strong> Business inventory cycles, commodity prices, boom-bust economic cycles.</p>',
        th: '<p>ขับเคลื่อนโดย<strong>วงจรสมดุลที่มีความล่าช้า</strong> ระบบเกินเป้าหมาย จากนั้นแก้ไขเกิน สร้างวัฏจักร</p><p><strong>โครงสร้าง:</strong> วงจร B + ความล่าช้า การแก้ไขมาถึงช้าเกินไป ทำให้แกว่งรอบเป้าหมาย</p><p><strong>เปรียบเทียบ:</strong> ปรับฝักบัว — เปิดร้อน รอ ร้อนเกินไป เปิดเย็น รอ เย็นเกินไป...</p><p><strong>ตัวอย่าง:</strong> วัฏจักรสินค้าคงคลัง ราคาสินค้าโภคภัณฑ์ วัฏจักรเศรษฐกิจขึ้น-ลง</p>'
      },
      generate: (n) => {
        const data = [];
        const goal = 50;
        let val = 20, vel = 0;
        for (let i = 0; i < n; i++) {
          data.push(val);
          const force = (goal - val) * 0.02;
          vel = vel * 0.95 + force;
          val += vel;
        }
        return data;
      }
    },
    's-shaped': {
      title: { en: 'S-Shaped Growth', th: 'การเติบโตแบบ S' },
      desc: {
        en: '<p>Starts like exponential growth (R loop dominates), then slows as limits kick in (B loop takes over).</p><p><strong>Structure:</strong> R loop + B loop with a carrying capacity. Early growth is fast; as the stock approaches the limit, growth slows to zero.</p><p><strong>Analogy:</strong> A new product adoption — early adopters grow fast, then market saturates.</p><p><strong>Examples:</strong> Population in limited environment, market penetration, learning curves.</p>',
        th: '<p>เริ่มเหมือนการเติบโตทวีคูณ (วงจร R ครอบงำ) จากนั้นช้าลงเมื่อถึงขีดจำกัด (วงจร B เข้าครอบงำ)</p><p><strong>โครงสร้าง:</strong> วงจร R + วงจร B ที่มีขีดจำกัดรองรับ การเติบโตต้นเร็ว เมื่อสต็อกใกล้ขีดจำกัด การเติบโตช้าลงเป็นศูนย์</p><p><strong>เปรียบเทียบ:</strong> การรับผลิตภัณฑ์ใหม่ — กลุ่มแรกรับเร็ว จากนั้นตลาดอิ่มตัว</p><p><strong>ตัวอย่าง:</strong> ประชากรในสิ่งแวดล้อมจำกัด การเจาะตลาด เส้นการเรียนรู้</p>'
      },
      generate: (n) => {
        const data = [];
        const K = 90; // carrying capacity
        let val = 2;
        for (let i = 0; i < n; i++) {
          data.push(val);
          val += val * 0.05 * (1 - val / K);
        }
        return data;
      }
    }
  };

  function showPattern(key) {
    const pattern = patterns[key];
    if (!pattern) return;

    // Update buttons
    document.querySelectorAll('.pattern-btn').forEach(b => b.classList.remove('active'));
    document.querySelector(`.pattern-btn[data-pattern="${key}"]`)?.classList.add('active');

    // Update description
    if (descPanel) {
      descPanel.innerHTML = pattern.desc[i18n.currentLang] || pattern.desc.en;
    }
    if (titleEl) {
      titleEl.textContent = pattern.title[i18n.currentLang] || pattern.title.en;
    }

    // Generate and draw
    const data = pattern.generate(100);
    drawPatternChart(ctx, canvas, data, key);
  }

  // Button handlers
  document.querySelectorAll('.pattern-btn').forEach(btn => {
    btn.addEventListener('click', () => showPattern(btn.dataset.pattern));
  });

  showPattern('exponential');
}

function drawPatternChart(ctx, canvas, data, patternKey) {
  const w = canvas.width, h = canvas.height;
  const pad = { top: 30, right: 20, bottom: 40, left: 50 };

  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#16213e';
  ctx.fillRect(0, 0, w, h);

  const plotW = w - pad.left - pad.right;
  const plotH = h - pad.top - pad.bottom;
  const maxVal = Math.max(...data) * 1.1;
  const minVal = Math.min(...data) * 0.9;
  const range = maxVal - minVal || 1;

  // Grid
  ctx.strokeStyle = 'rgba(74,85,104,0.3)';
  ctx.lineWidth = 0.5;
  for (let i = 1; i < 4; i++) {
    const y = pad.top + (i / 4) * plotH;
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(w - pad.right, y);
    ctx.stroke();
  }

  // Axes
  ctx.strokeStyle = '#4a5568';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(pad.left, pad.top);
  ctx.lineTo(pad.left, h - pad.bottom);
  ctx.lineTo(w - pad.right, h - pad.bottom);
  ctx.stroke();

  // Axis labels
  ctx.fillStyle = '#a0aec0';
  ctx.font = '11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(i18n.currentLang === 'th' ? 'เวลา' : 'Time', pad.left + plotW / 2, h - 5);

  ctx.save();
  ctx.translate(12, pad.top + plotH / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText(i18n.currentLang === 'th' ? 'ค่า' : 'Value', 0, 0);
  ctx.restore();

  // Goal line for goal-seeking and oscillation
  if (patternKey === 'goal-seeking' || patternKey === 'oscillation') {
    const goalY = pad.top + plotH - ((50 - minVal) / range) * plotH;
    const adjustedGoalY = patternKey === 'goal-seeking'
      ? pad.top + plotH - ((80 - minVal) / range) * plotH
      : pad.top + plotH - ((50 - minVal) / range) * plotH;

    ctx.strokeStyle = 'rgba(255,209,102,0.5)';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(pad.left, adjustedGoalY);
    ctx.lineTo(w - pad.right, adjustedGoalY);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#ffd166';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(i18n.currentLang === 'th' ? 'เป้าหมาย' : 'Goal', w - pad.right - 40, adjustedGoalY - 5);
  }

  // Carrying capacity line for S-shaped
  if (patternKey === 's-shaped') {
    const capY = pad.top + plotH - ((90 - minVal) / range) * plotH;
    ctx.strokeStyle = 'rgba(233,69,96,0.5)';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(pad.left, capY);
    ctx.lineTo(w - pad.right, capY);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#e94560';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(i18n.currentLang === 'th' ? 'ขีดจำกัด' : 'Carrying Capacity', w - pad.right - 100, capY - 5);
  }

  // Data line with animation
  const colors = {
    'exponential': '#06d6a0',
    'goal-seeking': '#00b4d8',
    'oscillation': '#a78bfa',
    's-shaped': '#ffd166'
  };

  ctx.strokeStyle = colors[patternKey] || '#00b4d8';
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let i = 0; i < data.length; i++) {
    const x = pad.left + (i / (data.length - 1)) * plotW;
    const y = pad.top + plotH - ((data[i] - minVal) / range) * plotH;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
}


// =============================================
// 3. Tragedy of the Commons — Fishing
// =============================================
function initFishingSim() {
  const container = document.getElementById('fish-sim');
  if (!container) return;

  const canvas = document.createElement('canvas');
  canvas.width = 500;
  canvas.height = 320;
  canvas.style.width = '100%';
  canvas.style.maxWidth = '500px';
  canvas.style.height = 'auto';
  canvas.style.display = 'block';
  canvas.style.margin = '0 auto';

  const vizArea = container.querySelector('.viz-area') || container;
  vizArea.innerHTML = '';
  vizArea.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  const boatsSlider = document.getElementById('boats-slider');
  const boatsVal = document.getElementById('boats-val');
  const runBtn = document.getElementById('fish-run');
  const resetBtn = document.getElementById('fish-reset');
  const resultPanel = document.getElementById('fish-result');

  let simData = null;
  let animFrame = 0;
  let isRunning = false;

  boatsSlider?.addEventListener('input', () => {
    boatsVal.textContent = boatsSlider.value;
  });

  function runSim() {
    const boats = parseInt(boatsSlider.value);
    const dt = 0.5;
    const steps = 80;
    const data = { time: [], fish: [], harvest: [] };

    let fishPop = 1000; // fish stock
    const K = 1200; // carrying capacity
    const r = 0.15; // natural growth rate
    const catchPerBoat = 0.8;

    for (let i = 0; i <= steps; i++) {
      const t = i * dt;
      data.time.push(t);
      data.fish.push(fishPop);

      // Logistic growth
      const growth = r * fishPop * (1 - fishPop / K);
      // Harvest depends on fish available (can't catch what's not there)
      const catchability = fishPop / K;
      const totalHarvest = boats * catchPerBoat * catchability;
      data.harvest.push(totalHarvest);

      fishPop = Math.max(0, fishPop + (growth - totalHarvest) * dt);
    }

    simData = data;
    animFrame = 0;
    isRunning = true;

    // Result
    const finalFish = data.fish[data.fish.length - 1];
    const avgHarvest = data.harvest.reduce((a, b) => a + b, 0) / data.harvest.length;
    if (resultPanel) {
      const isTH = i18n.currentLang === 'th';
      let verdict, color;
      if (finalFish > 600) {
        verdict = isTH ? 'ยั่งยืน — ประชากรปลาคงที่' : 'Sustainable — fish population stable';
        color = '#06d6a0';
      } else if (finalFish > 100) {
        verdict = isTH ? 'เกินขีดจำกัด — ประชากรปลาลดลงอย่างมาก' : 'Overshoot — fish population declining significantly';
        color = '#ffd166';
      } else {
        verdict = isTH ? 'ล่มสลาย! — ประชากรปลาใกล้สูญพันธุ์' : 'Collapse! — fish population near extinction';
        color = '#e94560';
      }
      resultPanel.innerHTML = `<strong>${isTH ? 'ปลาเหลือ' : 'Fish remaining'}: ${finalFish.toFixed(0)}/1000</strong><br>${verdict}`;
      resultPanel.style.display = 'block';
      resultPanel.style.borderLeftColor = color;
      resultPanel.style.background = `${color}15`;
    }

    animateFish();
  }

  function animateFish() {
    if (!isRunning || !simData) return;
    animFrame = Math.min(animFrame + 2, simData.time.length);
    drawFish(animFrame);
    if (animFrame < simData.time.length) {
      requestAnimationFrame(animateFish);
    }
  }

  function drawFish(frameCount) {
    const w = canvas.width, h = canvas.height;
    const pad = { top: 35, right: 20, bottom: 45, left: 55 };

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#16213e';
    ctx.fillRect(0, 0, w, h);

    if (!simData || frameCount === 0) {
      ctx.fillStyle = '#a0aec0';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(i18n.currentLang === 'th' ? 'กดปุ่ม "เริ่มจำลอง"' : 'Press "Run Simulation"', w / 2, h / 2);
      return;
    }

    const n = Math.min(frameCount, simData.time.length);
    const maxTime = simData.time[simData.time.length - 1];
    const plotW = w - pad.left - pad.right;
    const plotH = h - pad.top - pad.bottom;

    // Grid
    ctx.strokeStyle = 'rgba(74,85,104,0.3)';
    ctx.lineWidth = 0.5;
    for (let i = 1; i < 4; i++) {
      const y = pad.top + (i / 4) * plotH;
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(w - pad.right, y);
      ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = '#4a5568';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad.left, pad.top);
    ctx.lineTo(pad.left, h - pad.bottom);
    ctx.lineTo(w - pad.right, h - pad.bottom);
    ctx.stroke();

    ctx.fillStyle = '#a0aec0';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(i18n.currentLang === 'th' ? 'เวลา (ปี)' : 'Time (years)', pad.left + plotW / 2, h - 5);

    // Y-axis ticks
    const maxFish = 1200;
    ctx.textAlign = 'right';
    ctx.fillStyle = '#4a5568';
    for (let v = 0; v <= maxFish; v += 300) {
      const y = pad.top + plotH - (v / maxFish) * plotH;
      ctx.fillText(v.toString(), pad.left - 8, y + 4);
    }

    // Fish population line
    ctx.strokeStyle = '#00b4d8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const x = pad.left + (simData.time[i] / maxTime) * plotW;
      const y = pad.top + plotH - (simData.fish[i] / maxFish) * plotH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Harvest line (scaled)
    const maxH = Math.max(...simData.harvest) * 1.2 || 1;
    ctx.strokeStyle = '#e94560';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 3]);
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const x = pad.left + (simData.time[i] / maxTime) * plotW;
      const y = pad.top + plotH - (simData.harvest[i] / maxH) * plotH * 0.5;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Legend
    ctx.textAlign = 'left';
    ctx.font = '11px sans-serif';

    ctx.strokeStyle = '#00b4d8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(pad.left + 10, pad.top - 15);
    ctx.lineTo(pad.left + 30, pad.top - 15);
    ctx.stroke();
    ctx.fillStyle = '#edf2f7';
    ctx.fillText(i18n.currentLang === 'th' ? 'ประชากรปลา' : 'Fish Population', pad.left + 35, pad.top - 11);

    ctx.strokeStyle = '#e94560';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 3]);
    ctx.beginPath();
    ctx.moveTo(pad.left + 160, pad.top - 15);
    ctx.lineTo(pad.left + 180, pad.top - 15);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillText(i18n.currentLang === 'th' ? 'ปริมาณจับ' : 'Harvest', pad.left + 185, pad.top - 11);
  }

  drawFish(0);

  runBtn?.addEventListener('click', runSim);
  resetBtn?.addEventListener('click', () => {
    simData = null;
    isRunning = false;
    animFrame = 0;
    boatsSlider.value = 20;
    boatsVal.textContent = '20';
    if (resultPanel) resultPanel.style.display = 'none';
    drawFish(0);
  });
}
