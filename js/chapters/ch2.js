// ========================================
// Chapter 2: SD — The Language of Feedback
// 1. Bathtub Model (Stocks & Flows) — smooth animation
// 2. Behavior Patterns Gallery — animated line drawing
// 3. Tragedy of the Commons (Fishing) — clear scale
// 4. Escalation (Arms Race) — new trap interactive
// ========================================

document.addEventListener('DOMContentLoaded', () => {
  initBathtub();
  initBehaviorPatterns();
  initFishingSim();
  initEscalation();
  initWealthSim();
});

// =============================================
// 1. Bathtub Model — Smooth real-time
// =============================================
function initBathtub() {
  const container = document.getElementById('bathtub-sim');
  if (!container) return;

  const canvas = document.createElement('canvas');
  canvas.width = 500;
  canvas.height = 340;
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

  let waterLevel = 50;
  let displayLevel = 50; // for smooth rendering
  const history = [];
  const maxHistory = 200;
  let waveOffset = 0;

  inflowSlider?.addEventListener('input', () => inflowVal.textContent = inflowSlider.value);
  outflowSlider?.addEventListener('input', () => outflowVal.textContent = outflowSlider.value);

  function update() {
    const inflow = parseInt(inflowSlider.value);
    const outflow = parseInt(outflowSlider.value);

    // Smooth stock change — slower to show gradual nature of stocks
    const net = (inflow - outflow) * 0.01;
    waterLevel = Math.max(0, Math.min(100, waterLevel + net));

    // Smooth visual interpolation — lower = smoother
    displayLevel += (waterLevel - displayLevel) * 0.04;

    history.push(waterLevel);
    if (history.length > maxHistory) history.shift();

    waveOffset += 0.05;

    // Status
    if (statusPanel) {
      const isTH = i18n.currentLang === 'th';
      let status, color;
      if (Math.abs(inflow - outflow) < 3) {
        status = isTH ? 'กระแสเข้า ≈ กระแสออก → ดุลยภาพเชิงพลวัต' : 'Inflow ≈ Outflow → Dynamic Equilibrium';
        color = '#ffd166';
      } else if (inflow > outflow) {
        status = isTH ? `กระแสเข้า > กระแสออก → ระดับน้ำเพิ่มขึ้น (+${(inflow - outflow)}/s)` : `Inflow > Outflow → Rising (+${(inflow - outflow)}/s)`;
        color = '#06d6a0';
      } else {
        status = isTH ? `กระแสออก > กระแสเข้า → ระดับน้ำลดลง (${(inflow - outflow)}/s)` : `Outflow > Inflow → Falling (${(inflow - outflow)}/s)`;
        color = '#e94560';
      }
      statusPanel.innerHTML = `<strong>${(isTH ? 'ระดับน้ำ' : 'Water Level')}: ${displayLevel.toFixed(1)}%</strong><br>${status}`;
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

    const inflow = parseInt(inflowSlider.value);
    const outflow = parseInt(outflowSlider.value);

    // --- Bathtub visualization ---
    const tubX = 30, tubY = 40, tubW = 180, tubH = 240;

    // Tub walls
    ctx.strokeStyle = '#4a5568';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(tubX, tubY);
    ctx.lineTo(tubX, tubY + tubH);
    ctx.lineTo(tubX + tubW, tubY + tubH);
    ctx.lineTo(tubX + tubW, tubY);
    ctx.stroke();

    // Water with wave effect
    const waterH = (displayLevel / 100) * tubH;
    const waterY = tubY + tubH - waterH;

    if (waterH > 2) {
      const gradient = ctx.createLinearGradient(0, waterY, 0, tubY + tubH);
      gradient.addColorStop(0, 'rgba(0,180,216,0.5)');
      gradient.addColorStop(1, 'rgba(0,80,160,0.8)');
      ctx.fillStyle = gradient;

      // Wavy top surface
      ctx.beginPath();
      ctx.moveTo(tubX + 2, tubY + tubH);
      ctx.lineTo(tubX + 2, waterY);
      for (let x = 0; x <= tubW - 4; x += 2) {
        const wave = Math.sin((x * 0.05) + waveOffset) * 3;
        ctx.lineTo(tubX + 2 + x, waterY + wave);
      }
      ctx.lineTo(tubX + tubW - 2, tubY + tubH);
      ctx.closePath();
      ctx.fill();
    }

    // Inflow arrow + stream
    const inflowX = tubX + tubW * 0.3;
    if (inflow > 0) {
      const streamW = Math.max(3, inflow / 8);
      ctx.fillStyle = `rgba(6,214,160,${0.3 + inflow / 150})`;
      // Stream with animated particles
      const streamTop = tubY - 30;
      const streamBot = Math.max(streamTop + 5, waterY);
      ctx.fillRect(inflowX - streamW / 2, streamTop, streamW, streamBot - streamTop);
      // Droplet particles falling
      for (let d = 0; d < 4; d++) {
        const speed = 0.08 + (inflow / 500);
        const dropY = streamTop + ((Date.now() * speed + d * 50) % (streamBot - streamTop));
        const dropX = inflowX + Math.sin(Date.now() * 0.003 + d) * 3;
        ctx.beginPath();
        ctx.arc(dropX, dropY, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
      // Arrow head pointing down
      ctx.beginPath();
      ctx.moveTo(inflowX - 8, streamTop + 2);
      ctx.lineTo(inflowX, streamTop + 14);
      ctx.lineTo(inflowX + 8, streamTop + 2);
      ctx.fillStyle = '#06d6a0';
      ctx.fill();
    }

    // Outflow arrow + stream
    const outflowX = tubX + tubW * 0.7;
    if (outflow > 0 && displayLevel > 0) {
      const streamW = Math.max(3, outflow / 8);
      ctx.fillStyle = `rgba(233,69,96,${0.3 + outflow / 150})`;
      ctx.fillRect(outflowX - streamW / 2, tubY + tubH, streamW, 25);
      // Arrow head pointing down
      ctx.beginPath();
      ctx.moveTo(outflowX - 8, tubY + tubH + 15);
      ctx.lineTo(outflowX, tubY + tubH + 27);
      ctx.lineTo(outflowX + 8, tubY + tubH + 15);
      ctx.fillStyle = '#e94560';
      ctx.fill();
    }

    // Labels with clear arrows
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#06d6a0';
    ctx.fillText(`▼ ${i18n.currentLang === 'th' ? 'เข้า' : 'Inflow'}: ${inflow}`, inflowX, tubY - 35);
    ctx.fillStyle = '#e94560';
    ctx.fillText(`▼ ${i18n.currentLang === 'th' ? 'ออก' : 'Outflow'}: ${outflow}`, outflowX, tubY + tubH + 45);

    // Stock label
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(`${displayLevel.toFixed(0)}%`, tubX + tubW / 2, tubY + tubH / 2);
    ctx.font = '11px sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fillText(i18n.currentLang === 'th' ? 'สต็อก' : 'Stock', tubX + tubW / 2, tubY + tubH / 2 + 16);

    // --- History chart (right side) ---
    const chartX = 240, chartY = 40, chartW = 240, chartH = 240;

    // Background area
    ctx.fillStyle = 'rgba(15,52,96,0.3)';
    ctx.fillRect(chartX, chartY, chartW, chartH);

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

    // Axes
    ctx.strokeStyle = '#4a5568';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(chartX, chartY);
    ctx.lineTo(chartX, chartY + chartH);
    ctx.lineTo(chartX + chartW, chartY + chartH);
    ctx.stroke();

    // Y labels
    ctx.fillStyle = '#4a5568';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('100', chartX - 5, chartY + 4);
    ctx.fillText('50', chartX - 5, chartY + chartH / 2 + 4);
    ctx.fillText('0', chartX - 5, chartY + chartH + 4);

    // History line with gradient
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

      // Fill under curve
      ctx.lineTo(chartX + ((history.length - 1) / maxHistory) * chartW, chartY + chartH);
      ctx.lineTo(chartX, chartY + chartH);
      ctx.closePath();
      ctx.fillStyle = 'rgba(0,180,216,0.1)';
      ctx.fill();
    }

    // Chart label
    ctx.fillStyle = '#a0aec0';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(i18n.currentLang === 'th' ? 'ระดับน้ำตามเวลา' : 'Water Level Over Time', chartX + chartW / 2, chartY + chartH + 20);
  }

  draw();
  requestAnimationFrame(update);
}


// =============================================
// 2. Behavior Patterns — Animated line drawing
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

  let currentAnim = null;

  const patterns = {
    'exponential': {
      title: { en: 'Exponential Growth', th: 'การเติบโตแบบทวีคูณ' },
      color: '#06d6a0',
      desc: {
        en: '<p>Driven by a <strong>reinforcing loop</strong>. The more there is, the more is added. Growth accelerates over time.</p><p><strong>Structure:</strong> R loop dominant, no limits.</p><p><strong>Rule of 70:</strong> Doubling time ≈ 70 ÷ growth rate (%)<br>Example: $100 at 7% interest doubles in ~10 years.</p><p><strong>Examples:</strong> Compound interest, viral spread, population growth.</p>',
        th: '<p>ขับเคลื่อนโดย<strong>วงจรเสริมแรง</strong> ยิ่งมีมากยิ่งเพิ่มมาก การเติบโตเร่งตัวขึ้นตามเวลา</p><p><strong>โครงสร้าง:</strong> วงจร R ครอบงำ ไม่มีขีดจำกัด</p><p><strong>กฎ 70:</strong> เวลาเพิ่มเท่าตัว ≈ 70 ÷ อัตราเติบโต (%)<br>ตัวอย่าง: 100 บาท ที่ดอกเบี้ย 7% เพิ่มเท่าตัวใน ~10 ปี</p><p><strong>ตัวอย่าง:</strong> ดอกเบี้ยทบต้น การแพร่ระบาดของไวรัส การเติบโตของประชากร</p>'
      },
      generate: (n) => { const d = []; for (let i = 0; i < n; i++) d.push(Math.exp(i * 0.04)); return d; },
      refLines: []
    },
    'goal-seeking': {
      title: { en: 'Goal-Seeking', th: 'แสวงหาเป้าหมาย' },
      color: '#00b4d8',
      desc: {
        en: '<p>Driven by a <strong>balancing loop</strong>. The system approaches a goal — fast at first, then slowing as the gap closes.</p><p><strong>Structure:</strong> B loop with target. Gap shrinks exponentially.</p><p><strong>Analogy:</strong> Hot coffee cooling to room temperature — bigger gap = faster change.</p><p><strong>Examples:</strong> Thermostat, inventory reorder, drug concentration in blood.</p>',
        th: '<p>ขับเคลื่อนโดย<strong>วงจรสมดุล</strong> ระบบเข้าใกล้เป้าหมาย — เร็วตอนแรก แล้วช้าลงเมื่อช่องว่างปิด</p><p><strong>โครงสร้าง:</strong> วงจร B ที่มีเป้าหมาย ช่องว่างหดลงแบบเลขชี้กำลัง</p><p><strong>เปรียบเทียบ:</strong> กาแฟร้อนเย็นลงสู่อุณหภูมิห้อง — ต่างมาก = เปลี่ยนเร็ว</p><p><strong>ตัวอย่าง:</strong> เทอร์โมสตัท การสั่งสินค้าคงคลัง ความเข้มข้นยาในเลือด</p>'
      },
      generate: (n) => { const d = []; let v = 10; for (let i = 0; i < n; i++) { d.push(v); v += (80 - v) * 0.05; } return d; },
      refLines: [{ value: 80, color: '#ffd166', label: { en: 'Goal', th: 'เป้าหมาย' } }]
    },
    'oscillation': {
      title: { en: 'Oscillation', th: 'การแกว่ง' },
      color: '#a78bfa',
      desc: {
        en: '<p>Driven by a <strong>balancing loop with delays</strong>. The system overshoots, then over-corrects, creating cycles.</p><p><strong>Structure:</strong> B loop + time delay → correction arrives too late.</p><p><strong>Analogy:</strong> Adjusting a shower — turn hot, wait, too hot, turn cold, wait, too cold...</p><p><strong>Examples:</strong> Inventory cycles, commodity prices, boom-bust economics.</p>',
        th: '<p>ขับเคลื่อนโดย<strong>วงจรสมดุลที่มีความล่าช้า</strong> ระบบเกินเป้า จากนั้นแก้ไขเกิน สร้างวัฏจักร</p><p><strong>โครงสร้าง:</strong> วงจร B + ความล่าช้า → การแก้ไขมาถึงช้าเกินไป</p><p><strong>เปรียบเทียบ:</strong> ปรับฝักบัว — เปิดร้อน รอ ร้อนเกิน เปิดเย็น รอ เย็นเกิน...</p><p><strong>ตัวอย่าง:</strong> วัฏจักรสินค้าคงคลัง ราคาสินค้าโภคภัณฑ์ เศรษฐกิจขึ้น-ลง</p>'
      },
      generate: (n) => { const d = []; let v = 20, vel = 0; for (let i = 0; i < n; i++) { d.push(v); vel = vel * 0.95 + (50 - v) * 0.02; v += vel; } return d; },
      refLines: [{ value: 50, color: '#ffd166', label: { en: 'Goal', th: 'เป้าหมาย' } }]
    },
    's-shaped': {
      title: { en: 'S-Shaped Growth', th: 'การเติบโตแบบ S' },
      color: '#ffd166',
      desc: {
        en: '<p>Starts like exponential growth (R loop dominates), then slows as limits kick in (B loop takes over).</p><p><strong>Structure:</strong> R + B loop with carrying capacity. Early fast → approaching limit slow.</p><p><strong>Analogy:</strong> New product adoption — early adopters grow fast, then market saturates.</p><p><strong>Examples:</strong> Population in limited environment, market penetration, learning curves.</p>',
        th: '<p>เริ่มเหมือนเติบโตทวีคูณ (วงจร R ครอบงำ) จากนั้นช้าลงเมื่อถึงขีดจำกัด (วงจร B เข้าครอบงำ)</p><p><strong>โครงสร้าง:</strong> วงจร R + B ที่มีขีดจำกัดรองรับ ต้นเร็ว → ใกล้ขีดจำกัดช้า</p><p><strong>เปรียบเทียบ:</strong> การรับผลิตภัณฑ์ใหม่ — กลุ่มแรกรับเร็ว จากนั้นตลาดอิ่มตัว</p><p><strong>ตัวอย่าง:</strong> ประชากรในสิ่งแวดล้อมจำกัด การเจาะตลาด เส้นการเรียนรู้</p>'
      },
      generate: (n) => { const d = []; let v = 2; for (let i = 0; i < n; i++) { d.push(v); v += v * 0.05 * (1 - v / 90); } return d; },
      refLines: [{ value: 90, color: '#e94560', label: { en: 'Carrying Capacity', th: 'ขีดจำกัดรองรับ' } }]
    }
  };

  function showPattern(key) {
    const p = patterns[key];
    if (!p) return;

    document.querySelectorAll('.pattern-btn').forEach(b => b.classList.remove('active'));
    document.querySelector(`.pattern-btn[data-pattern="${key}"]`)?.classList.add('active');
    if (descPanel) descPanel.innerHTML = p.desc[i18n.currentLang] || p.desc.en;
    if (titleEl) titleEl.textContent = p.title[i18n.currentLang] || p.title.en;

    const data = p.generate(120);
    animatePattern(ctx, canvas, data, p.color, p.refLines);
  }

  function animatePattern(ctx, canvas, data, color, refLines) {
    if (currentAnim) cancelAnimationFrame(currentAnim);
    let frame = 0;
    const totalFrames = data.length;

    function step() {
      frame = Math.min(frame + 1, totalFrames);  // slower: +1 instead of +2
      drawPatternFrame(ctx, canvas, data, frame, color, refLines);
      if (frame < totalFrames) {
        currentAnim = requestAnimationFrame(step);
      }
    }
    step();
  }

  document.querySelectorAll('.pattern-btn').forEach(btn => {
    btn.addEventListener('click', () => showPattern(btn.dataset.pattern));
  });

  showPattern('exponential');
}

function drawPatternFrame(ctx, canvas, data, frameCount, color, refLines) {
  const w = canvas.width, h = canvas.height;
  const pad = { top: 30, right: 20, bottom: 40, left: 50 };

  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#16213e';
  ctx.fillRect(0, 0, w, h);

  const plotW = w - pad.left - pad.right;
  const plotH = h - pad.top - pad.bottom;
  const maxVal = Math.max(...data) * 1.1;
  const minVal = Math.min(0, Math.min(...data) * 0.9);
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

  ctx.fillStyle = '#a0aec0';
  ctx.font = '11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(i18n.currentLang === 'th' ? 'เวลา' : 'Time', pad.left + plotW / 2, h - 5);

  // Y-axis label
  ctx.save();
  ctx.translate(12, pad.top + plotH / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillStyle = '#a0aec0';
  ctx.textAlign = 'center';
  ctx.fillText(i18n.currentLang === 'th' ? 'ค่า' : 'Value', 0, 0);
  ctx.restore();

  // Reference lines
  (refLines || []).forEach(ref => {
    const y = pad.top + plotH - ((ref.value - minVal) / range) * plotH;
    ctx.strokeStyle = ref.color + '66';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(w - pad.right, y);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = ref.color;
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(ref.label[i18n.currentLang] || ref.label.en, w - pad.right - 5, y - 5);
  });

  // Animated data line
  const n = Math.min(frameCount, data.length);
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let i = 0; i < n; i++) {
    const x = pad.left + (i / (data.length - 1)) * plotW;
    const y = pad.top + plotH - ((data[i] - minVal) / range) * plotH;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  // Glow on tip
  if (n > 0 && n < data.length) {
    const tipX = pad.left + ((n - 1) / (data.length - 1)) * plotW;
    const tipY = pad.top + plotH - ((data[n - 1] - minVal) / range) * plotH;
    ctx.beginPath();
    ctx.arc(tipX, tipY, 4, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(tipX, tipY, 8, 0, Math.PI * 2);
    ctx.fillStyle = color + '33';
    ctx.fill();
  }
}


// =============================================
// 3. Fishing Simulation — Clearer scale
// =============================================
function initFishingSim() {
  const container = document.getElementById('fish-sim');
  if (!container) return;

  const canvas = document.createElement('canvas');
  canvas.width = 500;
  canvas.height = 340;
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

  boatsSlider?.addEventListener('input', () => boatsVal.textContent = boatsSlider.value);

  function runSim() {
    const boats = parseInt(boatsSlider.value);
    const dt = 0.5;
    const steps = 100;
    const data = { time: [], fish: [], harvest: [] };

    let fishPop = 1000;
    const K = 1200;
    const r = 0.12;
    const catchPerBoat = 1.2;  // higher catch rate = collapse more visible at lower boat counts

    for (let i = 0; i <= steps; i++) {
      const t = i * dt;
      data.time.push(t);
      data.fish.push(fishPop);

      const growth = r * fishPop * (1 - fishPop / K);
      const catchability = Math.max(0, fishPop / K);
      const totalHarvest = boats * catchPerBoat * catchability;
      data.harvest.push(totalHarvest);

      fishPop = Math.max(0, fishPop + (growth - totalHarvest) * dt);
    }

    simData = data;
    animFrame = 0;
    isRunning = true;

    // Result
    const finalFish = data.fish[data.fish.length - 1];
    const minFish = Math.min(...data.fish);
    if (resultPanel) {
      const isTH = i18n.currentLang === 'th';
      let verdict, color;
      if (finalFish > 600) {
        verdict = isTH ? '✓ ยั่งยืน — ประชากรปลาคงที่' : '✓ Sustainable — fish population stable';
        color = '#06d6a0';
      } else if (finalFish > 200) {
        verdict = isTH ? '⚠ เกินขีดจำกัด — ประชากรปลาลดลงมาก' : '⚠ Overshoot — fish population declining';
        color = '#ffd166';
      } else {
        verdict = isTH ? '✗ ล่มสลาย! — ปลาใกล้สูญพันธุ์' : '✗ Collapse! — fish near extinction';
        color = '#e94560';
      }
      resultPanel.innerHTML = `<strong>${isTH ? 'ปลาเหลือ' : 'Fish remaining'}: ${finalFish.toFixed(0)}/1,000</strong> (${isTH ? 'ต่ำสุด' : 'min'}: ${minFish.toFixed(0)})<br>${verdict}`;
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
    const pad = { top: 40, right: 20, bottom: 45, left: 55 };

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
    const maxFish = 1300;

    // Danger zone background (below 200)
    const dangerY = pad.top + plotH - (200 / maxFish) * plotH;
    ctx.fillStyle = 'rgba(233,69,96,0.08)';
    ctx.fillRect(pad.left, dangerY, plotW, pad.top + plotH - dangerY);

    // Danger line
    ctx.strokeStyle = 'rgba(233,69,96,0.4)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(pad.left, dangerY);
    ctx.lineTo(w - pad.right, dangerY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#e94560';
    ctx.font = '9px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(i18n.currentLang === 'th' ? 'เขตอันตราย' : 'Danger Zone', pad.left + 5, dangerY - 3);

    // Sustainable zone line (600)
    const sustainY = pad.top + plotH - (600 / maxFish) * plotH;
    ctx.strokeStyle = 'rgba(6,214,160,0.3)';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(pad.left, sustainY);
    ctx.lineTo(w - pad.right, sustainY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#06d6a0';
    ctx.fillText(i18n.currentLang === 'th' ? 'ระดับยั่งยืน' : 'Sustainable', pad.left + 5, sustainY - 3);

    // Grid
    ctx.strokeStyle = 'rgba(74,85,104,0.2)';
    ctx.lineWidth = 0.5;
    for (let v = 0; v <= maxFish; v += 200) {
      const y = pad.top + plotH - (v / maxFish) * plotH;
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

    // Y ticks
    ctx.textAlign = 'right';
    ctx.fillStyle = '#4a5568';
    ctx.font = '10px sans-serif';
    for (let v = 0; v <= maxFish; v += 200) {
      const y = pad.top + plotH - (v / maxFish) * plotH;
      ctx.fillText(v.toString(), pad.left - 8, y + 4);
    }

    // Fish population line (main)
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

    // Fill under fish
    if (n > 1) {
      const lastX = pad.left + (simData.time[n - 1] / maxTime) * plotW;
      ctx.lineTo(lastX, pad.top + plotH);
      ctx.lineTo(pad.left + (simData.time[0] / maxTime) * plotW, pad.top + plotH);
      ctx.closePath();
      ctx.fillStyle = 'rgba(0,180,216,0.08)';
      ctx.fill();
    }

    // Harvest line
    ctx.strokeStyle = '#e94560';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 3]);
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const x = pad.left + (simData.time[i] / maxTime) * plotW;
      const y = pad.top + plotH - (simData.harvest[i] / maxFish * 10) * plotH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Legend
    ctx.textAlign = 'left';
    ctx.font = '11px sans-serif';
    const fishLabel = i18n.currentLang === 'th' ? 'ประชากรปลา' : 'Fish Population';
    const harvestLabel = i18n.currentLang === 'th' ? 'ปริมาณจับ (×10)' : 'Harvest (×10)';

    ctx.strokeStyle = '#00b4d8'; ctx.lineWidth = 3; ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(pad.left + 10, pad.top - 18); ctx.lineTo(pad.left + 30, pad.top - 18); ctx.stroke();
    ctx.fillStyle = '#edf2f7'; ctx.fillText(fishLabel, pad.left + 35, pad.top - 14);

    ctx.strokeStyle = '#e94560'; ctx.lineWidth = 2; ctx.setLineDash([6, 3]);
    ctx.beginPath(); ctx.moveTo(pad.left + 170, pad.top - 18); ctx.lineTo(pad.left + 190, pad.top - 18); ctx.stroke();
    ctx.setLineDash([]); ctx.fillText(harvestLabel, pad.left + 195, pad.top - 14);
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


// =============================================
// 4. Escalation — Arms Race Interactive
// =============================================
function initEscalation() {
  const container = document.getElementById('escalation-sim');
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

  const aggrSlider = document.getElementById('aggr-slider');
  const aggrVal = document.getElementById('aggr-val');
  const escRunBtn = document.getElementById('esc-run');
  const escResetBtn = document.getElementById('esc-reset');
  const escResult = document.getElementById('esc-result');

  let simData = null;
  let animFrame = 0;
  let isRunning = false;

  aggrSlider?.addEventListener('input', () => aggrVal.textContent = aggrSlider.value + '%');

  function runSim() {
    const aggr = parseInt(aggrSlider.value) / 100;
    const steps = 80;
    const data = { time: [], a: [], b: [] };

    let spendA = 10, spendB = 10;

    for (let i = 0; i <= steps; i++) {
      data.time.push(i);
      data.a.push(spendA);
      data.b.push(spendB);

      // Each side tries to stay ahead by aggression factor
      const targetA = spendB * (1 + aggr * 0.5);
      const targetB = spendA * (1 + aggr * 0.3);
      spendA += (targetA - spendA) * 0.15;
      spendB += (targetB - spendB) * 0.12;
    }

    simData = data;
    animFrame = 0;
    isRunning = true;

    if (escResult) {
      const isTH = i18n.currentLang === 'th';
      const finalA = data.a[data.a.length - 1];
      const ratio = (finalA / 10).toFixed(0);
      let verdict, color;
      if (finalA < 30) {
        verdict = isTH ? '✓ เสถียร — การแข่งขันต่ำ' : '✓ Stable — low competition';
        color = '#06d6a0';
      } else if (finalA < 100) {
        verdict = isTH ? '⚠ ยกระดับ — ค่าใช้จ่ายเพิ่มขึ้น ' + ratio + ' เท่า' : '⚠ Escalating — spending grew ' + ratio + 'x';
        color = '#ffd166';
      } else {
        verdict = isTH ? '✗ สงครามเต็มรูปแบบ! — ค่าใช้จ่ายเพิ่ม ' + ratio + ' เท่า!' : '✗ Full arms race! — spending grew ' + ratio + 'x!';
        color = '#e94560';
      }
      escResult.innerHTML = `<strong>${verdict}</strong>`;
      escResult.style.display = 'block';
      escResult.style.borderLeftColor = color;
      escResult.style.background = `${color}15`;
    }

    animateEsc();
  }

  function animateEsc() {
    if (!isRunning || !simData) return;
    animFrame = Math.min(animFrame + 2, simData.time.length);
    drawEsc(animFrame);
    if (animFrame < simData.time.length) requestAnimationFrame(animateEsc);
  }

  function drawEsc(frameCount) {
    const w = canvas.width, h = canvas.height;
    const pad = { top: 35, right: 20, bottom: 40, left: 50 };

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
    const plotW = w - pad.left - pad.right;
    const plotH = h - pad.top - pad.bottom;
    const maxVal = Math.max(Math.max(...simData.a), Math.max(...simData.b)) * 1.1;
    const maxTime = simData.time[simData.time.length - 1];

    // Grid
    ctx.strokeStyle = 'rgba(74,85,104,0.3)';
    ctx.lineWidth = 0.5;
    for (let i = 1; i < 4; i++) {
      const y = pad.top + (i / 4) * plotH;
      ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(w - pad.right, y); ctx.stroke();
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
    ctx.fillText(i18n.currentLang === 'th' ? 'เวลา' : 'Time', pad.left + plotW / 2, h - 5);

    // Country A
    ctx.strokeStyle = '#00b4d8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const x = pad.left + (simData.time[i] / maxTime) * plotW;
      const y = pad.top + plotH - (simData.a[i] / maxVal) * plotH;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Country B
    ctx.strokeStyle = '#e94560';
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const x = pad.left + (simData.time[i] / maxTime) * plotW;
      const y = pad.top + plotH - (simData.b[i] / maxVal) * plotH;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Legend
    ctx.textAlign = 'left';
    ctx.font = '11px sans-serif';
    const labelA = i18n.currentLang === 'th' ? 'ประเทศ A' : 'Country A';
    const labelB = i18n.currentLang === 'th' ? 'ประเทศ B' : 'Country B';

    ctx.strokeStyle = '#00b4d8'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(pad.left + 10, pad.top - 15); ctx.lineTo(pad.left + 30, pad.top - 15); ctx.stroke();
    ctx.fillStyle = '#edf2f7'; ctx.fillText(labelA, pad.left + 35, pad.top - 11);

    ctx.strokeStyle = '#e94560';
    ctx.beginPath(); ctx.moveTo(pad.left + 120, pad.top - 15); ctx.lineTo(pad.left + 140, pad.top - 15); ctx.stroke();
    ctx.fillText(labelB, pad.left + 145, pad.top - 11);

    ctx.save();
    ctx.translate(12, pad.top + plotH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = '#a0aec0';
    ctx.textAlign = 'center';
    ctx.fillText(i18n.currentLang === 'th' ? 'ค่าใช้จ่ายทหาร' : 'Military Spending', 0, 0);
    ctx.restore();
  }

  drawEsc(0);

  escRunBtn?.addEventListener('click', runSim);
  escResetBtn?.addEventListener('click', () => {
    simData = null;
    isRunning = false;
    animFrame = 0;
    aggrSlider.value = 50;
    aggrVal.textContent = '50%';
    if (escResult) escResult.style.display = 'none';
    drawEsc(0);
  });
}


// =============================================
// 5. Success to the Successful — Wealth Sim
// =============================================
function initWealthSim() {
  const container = document.getElementById('wealth-sim');
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

  const biasSlider = document.getElementById('wealth-bias-slider');
  const biasVal = document.getElementById('wealth-bias-val');
  const runBtn = document.getElementById('wealth-run');
  const resetBtn = document.getElementById('wealth-reset');
  const resultPanel = document.getElementById('wealth-result');

  let simData = null;
  let animFrame = 0;
  let isRunning = false;

  biasSlider?.addEventListener('input', () => biasVal.textContent = biasSlider.value + '%');

  function runSim() {
    const bias = parseInt(biasSlider.value) / 100;
    const rounds = 80;
    const data = { round: [], a: [], b: [] };

    let wA = 50, wB = 50;

    for (let i = 0; i <= rounds; i++) {
      data.round.push(i);
      data.a.push(wA);
      data.b.push(wB);

      const total = wA + wB || 1;
      // Richer player gets a bias-weighted higher probability
      const probA = 0.5 + bias * 0.4 * ((wA - wB) / total);
      const stake = 2 + (wA + wB) * 0.02;

      if (Math.random() < probA) {
        wA += stake;
        wB = Math.max(0.5, wB - stake);
      } else {
        wB += stake;
        wA = Math.max(0.5, wA - stake);
      }
    }

    simData = data;
    animFrame = 0;
    isRunning = true;

    if (resultPanel) {
      const isTH = i18n.currentLang === 'th';
      const finalA = data.a[data.a.length - 1];
      const finalB = data.b[data.b.length - 1];
      const ratio = Math.max(finalA, finalB) / Math.max(0.1, Math.min(finalA, finalB));
      let verdict, color;
      if (ratio < 2) {
        verdict = isTH ? '✓ ค่อนข้างเท่าเทียม — อัตราส่วน ' + ratio.toFixed(1) + ':1' : '✓ Roughly equal — ratio ' + ratio.toFixed(1) + ':1';
        color = '#06d6a0';
      } else if (ratio < 5) {
        verdict = isTH ? '⚠ ไม่เท่าเทียม — อัตราส่วน ' + ratio.toFixed(1) + ':1' : '⚠ Unequal — ratio ' + ratio.toFixed(1) + ':1';
        color = '#ffd166';
      } else {
        verdict = isTH ? '✗ ผูกขาด! — อัตราส่วน ' + ratio.toFixed(0) + ':1' : '✗ Monopoly! — ratio ' + ratio.toFixed(0) + ':1';
        color = '#e94560';
      }
      resultPanel.innerHTML = `<strong>${verdict}</strong>`;
      resultPanel.style.display = 'block';
      resultPanel.style.borderLeftColor = color;
      resultPanel.style.background = `${color}15`;
    }

    animateWealth();
  }

  function animateWealth() {
    if (!isRunning || !simData) return;
    animFrame = Math.min(animFrame + 1, simData.round.length);
    drawWealth(animFrame);
    if (animFrame < simData.round.length) requestAnimationFrame(animateWealth);
  }

  function drawWealth(frameCount) {
    const w = canvas.width, h = canvas.height;
    const pad = { top: 35, right: 20, bottom: 40, left: 50 };

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

    const n = Math.min(frameCount, simData.round.length);
    const plotW = w - pad.left - pad.right;
    const plotH = h - pad.top - pad.bottom;
    const maxVal = Math.max(Math.max(...simData.a), Math.max(...simData.b)) * 1.1;
    const maxRound = simData.round[simData.round.length - 1];

    // Equal line (starting point)
    const equalY = pad.top + plotH - (50 / maxVal) * plotH;
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(pad.left, equalY);
    ctx.lineTo(w - pad.right, equalY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = '9px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(i18n.currentLang === 'th' ? 'เท่ากัน' : 'Equal', pad.left + 5, equalY - 3);

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
    ctx.fillText(i18n.currentLang === 'th' ? 'รอบ' : 'Round', pad.left + plotW / 2, h - 5);

    // Player A line
    ctx.strokeStyle = '#00b4d8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const x = pad.left + (simData.round[i] / maxRound) * plotW;
      const y = pad.top + plotH - (simData.a[i] / maxVal) * plotH;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Player B line
    ctx.strokeStyle = '#e94560';
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const x = pad.left + (simData.round[i] / maxRound) * plotW;
      const y = pad.top + plotH - (simData.b[i] / maxVal) * plotH;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Legend
    ctx.textAlign = 'left';
    ctx.font = '11px sans-serif';
    const labelA = i18n.currentLang === 'th' ? 'ผู้เล่น A' : 'Player A';
    const labelB = i18n.currentLang === 'th' ? 'ผู้เล่น B' : 'Player B';

    ctx.strokeStyle = '#00b4d8'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(pad.left + 10, pad.top - 15); ctx.lineTo(pad.left + 30, pad.top - 15); ctx.stroke();
    ctx.fillStyle = '#edf2f7'; ctx.fillText(labelA, pad.left + 35, pad.top - 11);

    ctx.strokeStyle = '#e94560';
    ctx.beginPath(); ctx.moveTo(pad.left + 120, pad.top - 15); ctx.lineTo(pad.left + 140, pad.top - 15); ctx.stroke();
    ctx.fillText(labelB, pad.left + 145, pad.top - 11);

    // Y-axis label
    ctx.save();
    ctx.translate(12, pad.top + plotH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = '#a0aec0';
    ctx.textAlign = 'center';
    ctx.fillText(i18n.currentLang === 'th' ? 'ทรัพย์สิน' : 'Wealth', 0, 0);
    ctx.restore();
  }

  drawWealth(0);

  runBtn?.addEventListener('click', runSim);
  resetBtn?.addEventListener('click', () => {
    simData = null;
    isRunning = false;
    animFrame = 0;
    biasSlider.value = 40;
    biasVal.textContent = '40%';
    if (resultPanel) resultPanel.style.display = 'none';
    drawWealth(0);
  });
}
