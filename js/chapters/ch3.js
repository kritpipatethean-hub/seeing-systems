// ========================================
// Chapter 3: SD for Economics
// 1. Goodwin Growth Cycle — predator-prey dynamics
// 2. Minsky Debt Cycle — financial instability
// 3. Sectoral Balances & Credit Accelerator
// ========================================

document.addEventListener('DOMContentLoaded', () => {
  initGoodwin();
  initMinsky();
  initSectoral();
});

// =============================================
// 1. Goodwin Growth Cycle (Lotka-Volterra)
// =============================================
function initGoodwin() {
  const container = document.getElementById('goodwin-sim');
  if (!container) return;

  const canvas = document.createElement('canvas');
  canvas.width = 580;
  canvas.height = 420;
  canvas.style.width = '100%';
  canvas.style.maxWidth = '520px';
  canvas.style.height = 'auto';
  canvas.style.display = 'block';
  canvas.style.margin = '0 auto';

  const vizArea = container.querySelector('.viz-area') || container;
  vizArea.innerHTML = '';
  vizArea.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  // DOM references
  const wageSlider = document.getElementById('goodwin-wage-sensitivity');
  const prodSlider = document.getElementById('goodwin-productivity');
  const wageVal = document.getElementById('goodwin-wage-val');
  const prodVal = document.getElementById('goodwin-prod-val');
  const runBtn = document.getElementById('goodwin-run');
  const resetBtn = document.getElementById('goodwin-reset');
  const resultPanel = document.getElementById('goodwin-result');

  // Default values
  const DEFAULTS = { wage: '1.5', prod: '2' };

  let simData = null;
  let animFrame = 0;
  let isRunning = false;
  let rafId = null;

  // Slider listeners
  wageSlider?.addEventListener('input', () => {
    if (wageVal) wageVal.textContent = wageSlider.value;
  });
  prodSlider?.addEventListener('input', () => {
    if (prodVal) prodVal.textContent = prodSlider.value;
  });

  // Run simulation
  runBtn?.addEventListener('click', () => {
    if (rafId) cancelAnimationFrame(rafId);
    simData = runGoodwinSim();
    animFrame = 0;
    isRunning = true;
    if (resultPanel) { resultPanel.innerHTML = ''; resultPanel.style.display = 'none'; }
    animate();
  });

  // Reset — restore sliders to defaults + clear canvas
  resetBtn?.addEventListener('click', () => {
    if (rafId) cancelAnimationFrame(rafId);
    simData = null;
    animFrame = 0;
    isRunning = false;
    if (wageSlider) { wageSlider.value = DEFAULTS.wage; if (wageVal) wageVal.textContent = DEFAULTS.wage; }
    if (prodSlider) { prodSlider.value = DEFAULTS.prod; if (prodVal) prodVal.textContent = DEFAULTS.prod; }
    if (resultPanel) { resultPanel.innerHTML = ''; resultPanel.style.display = 'none'; }
    draw();
  });

  // ---- MODEL ----
  // Pure Lotka-Volterra Goodwin model — guaranteed closed orbits
  // dλ/dt = λ * (a - b*ω - α)       employment rate
  // dω/dt = ω * (-c + d*λ - α)      wage share
  // Equilibrium: λ* = (c+α)/d, ω* = (a-α)/b
  function runGoodwinSim() {
    const wageSens = parseFloat(wageSlider?.value || 1.5);
    const alpha = parseFloat(prodSlider?.value || 2) / 100;
    const dt = 0.02;
    const totalYears = 40;
    const steps = Math.floor(totalYears / dt);

    // Base parameters → equilibrium at λ*≈0.73, ω*≈0.64 when α=0.02
    // Larger values = faster oscillation (~12 yr period at default)
    const a = 0.50;     // base growth potential
    const b = 0.75;     // profit-squeeze coefficient
    const c0 = 0.35;    // base wage decline rate
    const d0 = 0.50;    // employment-to-wage boost

    // wageSens scales the wage response speed (c and d together, preserving λ*)
    const c = c0 * wageSens;
    const d = d0 * wageSens;

    // Equilibrium with current α
    const lambdaStar = (c + alpha) / d;
    const omegaStar = (a - alpha) / b;

    // Start displaced from equilibrium to produce visible orbit
    let lambda = Math.min(0.95, lambdaStar + 0.10);
    let omega = Math.max(0.10, omegaStar - 0.06);

    const time = [], lambdaHist = [], omegaHist = [];

    for (let i = 0; i <= steps; i++) {
      time.push(i * dt);
      lambdaHist.push(lambda);
      omegaHist.push(omega);

      // Lotka-Volterra ODEs
      const dLambda = lambda * (a - b * omega - alpha) * dt;
      const dOmega  = omega * (-c + d * lambda - alpha) * dt;

      lambda = Math.max(0.02, Math.min(0.99, lambda + dLambda));
      omega  = Math.max(0.02, Math.min(0.99, omega + dOmega));
    }

    return {
      time, lambdaHist, omegaHist,
      lambdaStar, omegaStar,
      totalFrames: time.length,
      wageSens, alpha
    };
  }

  function animate() {
    if (!simData || !isRunning) return;
    animFrame += 8;
    if (animFrame >= simData.totalFrames) {
      animFrame = simData.totalFrames - 1;
      isRunning = false;
      showGoodwinResult();
    }
    draw();
    if (isRunning) {
      rafId = requestAnimationFrame(animate);
    }
  }

  function showGoodwinResult() {
    if (!resultPanel || !simData) return;
    resultPanel.style.display = 'block';
    const isTH = typeof i18n !== 'undefined' && i18n.currentLang === 'th';
    const lambdas = simData.lambdaHist;
    const omegas = simData.omegaHist;
    const maxL = Math.max(...lambdas), minL = Math.min(...lambdas);
    const maxO = Math.max(...omegas), minO = Math.min(...omegas);
    const ampL = ((maxL - minL) * 100).toFixed(0);
    const ampO = ((maxO - minO) * 100).toFixed(0);

    // Find peaks for cycle period (smaller gap for faster cycles)
    const peaks = [];
    for (let i = 15; i < lambdas.length - 15; i++) {
      if (lambdas[i] > lambdas[i - 8] && lambdas[i] > lambdas[i + 8] &&
          lambdas[i] >= lambdas[i - 1] && lambdas[i] >= lambdas[i + 1]) {
        if (peaks.length === 0 || i - peaks[peaks.length - 1] > 30) peaks.push(i);
      }
    }

    const diverging = maxL > 0.97 || minL < 0.05 || maxO > 0.97 || minO < 0.05;
    const ws = simData.wageSens;

    let statsLine, narrativeLine;
    if (diverging) {
      statsLine = isTH
        ? '⚠️ <strong style="color:#e94560;">ระบบไม่เสถียร</strong> — วงจรแกว่งแรงจนชนขอบ'
        : '⚠️ <strong style="color:#e94560;">Unstable</strong> — oscillation hits boundary';
      narrativeLine = isTH
        ? 'ค่าจ้างตอบสนองไวเกินไป ทำให้วงจรขยายตัวจนระบบพัง ลองลดความไวของค่าจ้างลง'
        : 'Wages respond too aggressively, amplifying the cycle until it breaks. Try reducing wage sensitivity.';
    } else if (peaks.length >= 2) {
      const period = ((peaks[peaks.length - 1] - peaks[0]) / (peaks.length - 1) * 0.02).toFixed(1);
      statsLine = isTH
        ? `✅ <strong style="color:#06d6a0;">วงจรเสถียร</strong> — คาบ ~<strong>${period} ปี</strong> | จ้างงานแกว่ง ${ampL}% | ค่าจ้างแกว่ง ${ampO}%`
        : `✅ <strong style="color:#06d6a0;">Stable cycle</strong> — Period ~<strong>${period} years</strong> | Employment swings ${ampL}% | Wages swing ${ampO}%`;
      if (ws >= 2.0) {
        narrativeLine = isTH
          ? '💡 ค่าจ้างไวมาก → วงจรหมุนเร็ว คาบสั้นลง เศรษฐกิจผันผวนรุนแรง'
          : '💡 High wage sensitivity → faster cycle, shorter period, more volatile economy';
      } else if (ws <= 0.8) {
        narrativeLine = isTH
          ? '💡 ค่าจ้างตอบสนองช้า → วงจรยาว เศรษฐกิจค่อนข้างนิ่ง'
          : '💡 Low wage sensitivity → slow cycle, relatively calm economy';
      } else {
        narrativeLine = isTH
          ? '💡 เศรษฐกิจแกว่งตัวตามธรรมชาติ — จ้างงานสูง→ค่าจ้างขึ้น→กำไรหด→ลงทุนลด→จ้างงานตก→แล้ววนรอบ'
          : '💡 The economy oscillates naturally — high employment → wages rise → profits shrink → investment falls → employment drops → cycle repeats';
      }
    } else {
      statsLine = isTH
        ? `วงจรยังไม่ครบรอบ | จ้างงานแกว่ง ${ampL}%`
        : `Cycle not yet complete | Employment range ${ampL}%`;
      narrativeLine = isTH
        ? '💡 ลอง Run นานขึ้น หรือเพิ่มความไวค่าจ้างเพื่อให้วงจรชัดขึ้น'
        : '💡 Try increasing wage sensitivity for a clearer cycle';
    }

    resultPanel.innerHTML = `
      <div style="padding:12px 14px;border-left:4px solid ${diverging ? '#e94560' : '#06d6a0'};background:rgba(22,33,62,0.7);border-radius:6px;">
        <div style="font-size:0.95rem;margin-bottom:6px;">${statsLine}</div>
        <div style="font-size:0.85rem;color:#a0aec0;">${narrativeLine}</div>
      </div>`;
  }

  // ---- DRAWING ----
  function draw() {
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#16213e';
    ctx.fillRect(0, 0, w, h);

    const isTH = typeof i18n !== 'undefined' && i18n.currentLang === 'th';

    // Title bar
    ctx.fillStyle = '#ffd166';
    ctx.font = 'bold 15px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(isTH ? 'วัฏจักรกูดวิน' : 'GOODWIN GROWTH CYCLE', w / 2, 20);

    const halfW = Math.floor(w / 2);
    drawPhasePortrait(ctx, 0, 30, halfW, h - 30, isTH);

    // Divider
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(halfW, 30); ctx.lineTo(halfW, h); ctx.stroke();

    drawTimeSeries(ctx, halfW, 30, halfW, h - 30, isTH);
  }

  function drawPhasePortrait(ctx, ox, oy, pw, ph, isTH) {
    const pad = { top: 28, bottom: 45, left: 55, right: 15 };
    const plotW = pw - pad.left - pad.right;
    const plotH = ph - pad.top - pad.bottom;
    const px = ox + pad.left;
    const py = oy + pad.top;

    // Auto-scale based on data, or use defaults
    let lMin = 0.55, lMax = 0.95, oMin = 0.45, oMax = 0.80;
    if (simData) {
      const lArr = simData.lambdaHist, oArr = simData.omegaHist;
      const dataLMin = Math.min(...lArr), dataLMax = Math.max(...lArr);
      const dataOMin = Math.min(...oArr), dataOMax = Math.max(...oArr);
      const lRange = Math.max(0.08, dataLMax - dataLMin);
      const oRange = Math.max(0.08, dataOMax - dataOMin);
      lMin = Math.max(0, dataLMin - lRange * 0.2);
      lMax = Math.min(1, dataLMax + lRange * 0.2);
      oMin = Math.max(0, dataOMin - oRange * 0.2);
      oMax = Math.min(1, dataOMax + oRange * 0.2);
    }

    // Subtitle
    ctx.fillStyle = '#ccc';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(isTH ? 'ภาพเฟส (วงโคจร)' : 'Phase Portrait', ox + pw / 2, oy + 14);

    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.07)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 4; i++) {
      const x = px + (i / 4) * plotW;
      const y = py + (i / 4) * plotH;
      ctx.beginPath(); ctx.moveTo(x, py); ctx.lineTo(x, py + plotH); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(px, y); ctx.lineTo(px + plotW, y); ctx.stroke();
    }

    // Tick labels
    ctx.fillStyle = '#999';
    ctx.font = '11px Arial';
    ctx.textAlign = 'center';
    for (let i = 0; i <= 4; i++) {
      ctx.fillText((lMin + (i / 4) * (lMax - lMin)).toFixed(2), px + (i / 4) * plotW, py + plotH + 16);
    }
    ctx.textAlign = 'right';
    for (let i = 0; i <= 4; i++) {
      ctx.fillText((oMax - (i / 4) * (oMax - oMin)).toFixed(2), px - 6, py + (i / 4) * plotH + 5);
    }

    // Axis titles
    ctx.fillStyle = '#00b4d8';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(isTH ? 'อัตราจ้างงาน (λ)' : 'Employment Rate (λ)', ox + pw / 2, oy + ph - 4);

    ctx.save();
    ctx.translate(ox + 13, oy + pad.top + plotH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = '#ffd166';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(isTH ? 'สัดส่วนค่าจ้าง (ω)' : 'Wage Share (ω)', 0, 0);
    ctx.restore();

    // Border
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1;
    ctx.strokeRect(px, py, plotW, plotH);

    // Equilibrium crosshair
    if (simData) {
      const eqX = px + ((simData.lambdaStar - lMin) / (lMax - lMin)) * plotW;
      const eqY = py + ((oMax - simData.omegaStar) / (oMax - oMin)) * plotH;
      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(eqX, py); ctx.lineTo(eqX, py + plotH); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(px, eqY); ctx.lineTo(px + plotW, eqY); ctx.stroke();
      ctx.setLineDash([]);
      // Label
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.font = '10px Arial';
      ctx.textAlign = 'left';
      ctx.fillText('eq', eqX + 3, eqY - 4);
    }

    // Placeholder
    if (!simData) {
      ctx.fillStyle = 'rgba(255,255,255,0.25)';
      ctx.font = '13px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(isTH ? 'กด "เริ่มจำลอง"' : 'Press "Run"', ox + pw / 2, oy + ph / 2);
      return;
    }

    const n = Math.min(animFrame + 1, simData.totalFrames);
    const mapX = (v) => px + Math.max(0, Math.min(plotW, ((v - lMin) / (lMax - lMin)) * plotW));
    const mapY = (v) => py + Math.max(0, Math.min(plotH, ((oMax - v) / (oMax - oMin)) * plotH));

    // Starting point marker
    ctx.beginPath();
    ctx.arc(mapX(simData.lambdaHist[0]), mapY(simData.omegaHist[0]), 5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.fill();
    ctx.fillStyle = '#aaa';
    ctx.font = '10px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(isTH ? 'เริ่ม' : 'Start', mapX(simData.lambdaHist[0]) + 7, mapY(simData.omegaHist[0]) + 4);

    // Orbit trail with gradient opacity
    ctx.lineWidth = 2.5;
    for (let i = 1; i < n; i++) {
      const progress = i / simData.totalFrames;
      ctx.beginPath();
      ctx.strokeStyle = `rgba(0, 180, 216, ${0.12 + 0.65 * progress})`;
      ctx.moveTo(mapX(simData.lambdaHist[i - 1]), mapY(simData.omegaHist[i - 1]));
      ctx.lineTo(mapX(simData.lambdaHist[i]), mapY(simData.omegaHist[i]));
      ctx.stroke();
    }

    // Moving dot
    if (n > 0) {
      const cx = mapX(simData.lambdaHist[n - 1]);
      const cy = mapY(simData.omegaHist[n - 1]);
      ctx.beginPath(); ctx.arc(cx, cy, 10, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 209, 102, 0.15)'; ctx.fill();
      ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffd166'; ctx.fill();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke();
    }

    // Direction arrow
    if (n > 80) {
      const i2 = n - 1, i1 = n - 30;
      const ax = mapX(simData.lambdaHist[i2]) - mapX(simData.lambdaHist[i1]);
      const ay = mapY(simData.omegaHist[i2]) - mapY(simData.omegaHist[i1]);
      const angle = Math.atan2(ay, ax);
      ctx.save();
      ctx.translate(mapX(simData.lambdaHist[i2]), mapY(simData.omegaHist[i2]));
      ctx.rotate(angle);
      ctx.fillStyle = '#ffd166';
      ctx.beginPath(); ctx.moveTo(8, 0); ctx.lineTo(-5, -5); ctx.lineTo(-5, 5); ctx.closePath(); ctx.fill();
      ctx.restore();
    }
  }

  function drawTimeSeries(ctx, ox, oy, pw, ph, isTH) {
    const pad = { top: 28, bottom: 45, left: 48, right: 14 };
    const plotW = pw - pad.left - pad.right;
    const plotH = ph - pad.top - pad.bottom;
    const px = ox + pad.left;
    const py = oy + pad.top;

    // Y-axis range: auto-fit or default
    let yMin = 0.3, yMax = 1.0;
    if (simData) {
      const allVals = [...simData.lambdaHist, ...simData.omegaHist];
      const dMin = Math.min(...allVals), dMax = Math.max(...allVals);
      const range = Math.max(0.10, dMax - dMin);
      yMin = Math.max(0, Math.floor((dMin - range * 0.15) * 10) / 10);
      yMax = Math.min(1, Math.ceil((dMax + range * 0.15) * 10) / 10);
    }

    // Subtitle
    ctx.fillStyle = '#ccc';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(isTH ? 'อนุกรมเวลา' : 'Time Series', ox + pw / 2, oy + 14);

    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.07)';
    ctx.lineWidth = 0.5;
    const nTicksX = 5;
    for (let i = 0; i <= nTicksX; i++) {
      const x = px + (i / nTicksX) * plotW;
      ctx.beginPath(); ctx.moveTo(x, py); ctx.lineTo(x, py + plotH); ctx.stroke();
    }
    const nTicksY = 4;
    for (let i = 0; i <= nTicksY; i++) {
      const y = py + (i / nTicksY) * plotH;
      ctx.beginPath(); ctx.moveTo(px, y); ctx.lineTo(px + plotW, y); ctx.stroke();
    }

    // Tick labels
    ctx.fillStyle = '#999';
    ctx.font = '11px Arial';
    ctx.textAlign = 'center';
    for (let i = 0; i <= nTicksX; i++) {
      ctx.fillText((i * 8).toString(), px + (i / nTicksX) * plotW, py + plotH + 16);
    }
    ctx.textAlign = 'right';
    for (let i = 0; i <= nTicksY; i++) {
      const val = yMax - (i / nTicksY) * (yMax - yMin);
      ctx.fillText(val.toFixed(2), px - 6, py + (i / nTicksY) * plotH + 5);
    }

    // Axis title
    ctx.fillStyle = '#999';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(isTH ? 'เวลา (ปี)' : 'Time (years)', ox + pw / 2, oy + ph - 4);

    // Border
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1;
    ctx.strokeRect(px, py, plotW, plotH);

    // Placeholder
    if (!simData) {
      ctx.fillStyle = 'rgba(255,255,255,0.25)';
      ctx.font = '13px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(isTH ? 'กด "เริ่มจำลอง"' : 'Press "Run"', ox + pw / 2, oy + ph / 2 - 10);
      return;
    }

    const n = Math.min(animFrame + 1, simData.totalFrames);
    const totalT = 40;
    const mapX = (t) => px + (t / totalT) * plotW;
    const mapY = (v) => py + ((yMax - v) / (yMax - yMin)) * plotH;

    // Employment line (cyan)
    ctx.beginPath();
    ctx.strokeStyle = '#00b4d8';
    ctx.lineWidth = 2.5;
    for (let i = 0; i < n; i++) {
      const x = mapX(simData.time[i]);
      const y = mapY(simData.lambdaHist[i]);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Wage share line (gold)
    ctx.beginPath();
    ctx.strokeStyle = '#ffd166';
    ctx.lineWidth = 2.5;
    for (let i = 0; i < n; i++) {
      const x = mapX(simData.time[i]);
      const y = mapY(simData.omegaHist[i]);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Current values overlay
    if (n > 0) {
      const lastL = simData.lambdaHist[n - 1];
      const lastO = simData.omegaHist[n - 1];
      const curX = mapX(simData.time[n - 1]);

      // Vertical cursor
      ctx.strokeStyle = 'rgba(255,255,255,0.12)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.moveTo(curX, py); ctx.lineTo(curX, py + plotH); ctx.stroke();
      ctx.setLineDash([]);

      // Value labels
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'left';
      const lblX = Math.min(curX + 5, px + plotW - 60);
      ctx.fillStyle = '#00b4d8';
      ctx.fillText(`λ = ${(lastL * 100).toFixed(0)}%`, lblX, mapY(lastL) - 6);
      ctx.fillStyle = '#ffd166';
      ctx.fillText(`ω = ${(lastO * 100).toFixed(0)}%`, lblX, mapY(lastO) + 16);
    }

    // Legend
    const lx = px + plotW - 110;
    const ly = py + 8;
    ctx.fillStyle = 'rgba(22,33,62,0.85)';
    ctx.fillRect(lx, ly, 105, 40);
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1;
    ctx.strokeRect(lx, ly, 105, 40);

    ctx.font = '11px Arial';
    ctx.textAlign = 'left';
    ctx.strokeStyle = '#00b4d8'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(lx + 6, ly + 13); ctx.lineTo(lx + 22, ly + 13); ctx.stroke();
    ctx.fillStyle = '#00b4d8';
    ctx.fillText(isTH ? 'จ้างงาน (λ)' : 'Employment (λ)', lx + 26, ly + 17);

    ctx.strokeStyle = '#ffd166'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(lx + 6, ly + 28); ctx.lineTo(lx + 22, ly + 28); ctx.stroke();
    ctx.fillStyle = '#ffd166';
    ctx.fillText(isTH ? 'ค่าจ้าง (ω)' : 'Wage Share (ω)', lx + 26, ly + 32);
  }

  // Initial draw
  draw();
}


// =============================================
// 2. Minsky Debt Cycle
// =============================================
function initMinsky() {
  const container = document.getElementById('minsky-sim');
  if (!container) return;

  const canvas = document.createElement('canvas');
  canvas.width = 520;
  canvas.height = 400;
  canvas.style.width = '100%';
  canvas.style.maxWidth = '520px';
  canvas.style.height = 'auto';
  canvas.style.display = 'block';
  canvas.style.margin = '0 auto';

  const vizArea = container.querySelector('.viz-area') || container;
  vizArea.innerHTML = '';
  vizArea.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  // DOM references
  const spiritsSlider = document.getElementById('minsky-animal-spirits');
  const interestSlider = document.getElementById('minsky-interest');
  const spiritsVal = document.getElementById('minsky-spirits-val');
  const interestVal = document.getElementById('minsky-interest-val');
  const runBtn = document.getElementById('minsky-run');
  const resetBtn = document.getElementById('minsky-reset');
  const resultPanel = document.getElementById('minsky-result');

  let simData = null;
  let animFrame = 0;
  let isRunning = false;
  let rafId = null;

  // Slider listeners
  spiritsSlider?.addEventListener('input', () => {
    if (spiritsVal) spiritsVal.textContent = spiritsSlider.value;
  });
  interestSlider?.addEventListener('input', () => {
    if (interestVal) interestVal.textContent = interestSlider.value;
  });

  // Run
  runBtn?.addEventListener('click', () => {
    if (rafId) cancelAnimationFrame(rafId);
    simData = runMinskySim();
    animFrame = 0;
    isRunning = true;
    if (resultPanel) { resultPanel.innerHTML = ''; resultPanel.style.display = 'none'; }
    animate();
  });

  // Reset
  resetBtn?.addEventListener('click', () => {
    if (rafId) cancelAnimationFrame(rafId);
    simData = null;
    animFrame = 0;
    isRunning = false;
    if (resultPanel) { resultPanel.innerHTML = ''; resultPanel.style.display = 'none'; }
    draw();
  });

  function runMinskySim() {
    const animalSpirits = parseFloat(spiritsSlider?.value || 1.0);
    const interestRate = parseFloat(interestSlider?.value || 3);
    const v = 3.0;
    const dt = 0.5;
    const totalYears = 50;
    const steps = Math.floor(totalYears / dt);

    let Y = 100;  // GDP
    let D = 30;   // Debt
    let omega = 0.6; // Wage share

    const time = [];
    const gdpGrowth = [];
    const debtToGDP = [];
    const phases = [];
    const gdpLevels = [];

    for (let i = 0; i <= steps; i++) {
      const t = i * dt;

      // Compute metrics
      const profits = (1 - omega) * Y;
      const profitRate = profits / (v * Y);

      // Investment depends on profit rate and animal spirits
      const investRate = 0.05 + animalSpirits * 0.1 * Math.tanh(5 * (profitRate - 0.04));
      const investment = investRate * Y;

      // Debt accumulates
      const interestPayment = (interestRate / 100) * D;
      const borrowing = Math.max(0, investment - profits) + interestPayment * 0.3;
      const repayment = 0.05 * D;
      const dD = borrowing - repayment;

      // GDP growth
      const g = investment / (v * Y) - 0.03; // minus depreciation
      const dtgGrowth = g * 100; // as percentage

      // Debt-to-GDP ratio
      const ratio = (D / Math.max(Y, 1)) * 100;

      // Phase classification
      let phase;
      if (profits > interestPayment + repayment) {
        phase = 'hedge';
      } else if (profits > interestPayment) {
        phase = 'speculative';
      } else {
        phase = 'ponzi';
      }

      time.push(t);
      gdpGrowth.push(dtgGrowth);
      debtToGDP.push(ratio);
      phases.push(phase);
      gdpLevels.push(Y);

      // Update state
      D = Math.max(0, D + dD * dt);
      Y = Math.max(1, Y * (1 + g * dt));
      omega += 0.01 * (0.6 - omega) * dt; // mean-reverting
      omega = Math.max(0.1, Math.min(0.9, omega));

      // Safety clamps
      if (!isFinite(D)) D = 1000;
      if (!isFinite(Y)) Y = 1;
      D = Math.min(D, 100000);
      Y = Math.min(Y, 100000);
    }

    return { time, gdpGrowth, debtToGDP, phases, totalFrames: time.length };
  }

  function animate() {
    if (!simData || !isRunning) return;
    animFrame += 2;
    if (animFrame >= simData.totalFrames) {
      animFrame = simData.totalFrames - 1;
      isRunning = false;
      showMinskyResult();
    }
    draw();
    if (isRunning) {
      rafId = requestAnimationFrame(animate);
    }
  }

  function showMinskyResult() {
    if (!resultPanel || !simData) return;
    resultPanel.style.display = 'block';
    const isTH = typeof i18n !== 'undefined' && i18n.currentLang === 'th';

    const maxDebt = Math.max(...simData.debtToGDP);
    // Find minsky moment: first time debt-to-GDP crosses 200
    let crisisYear = -1;
    for (let i = 0; i < simData.debtToGDP.length; i++) {
      if (simData.debtToGDP[i] > 200) {
        crisisYear = simData.time[i];
        break;
      }
    }

    let html, color;
    if (crisisYear >= 0) {
      color = '#e94560';
      html = isTH
        ? `วิกฤต! Minsky Moment ปีที่ ${crisisYear.toFixed(0)} — หนี้พุ่งถึง ${maxDebt.toFixed(0)}%`
        : `Crisis! Minsky Moment at year ${crisisYear.toFixed(0)} — debt hit ${maxDebt.toFixed(0)}%`;
    } else if (maxDebt > 120) {
      color = '#ffd166';
      html = isTH
        ? `เตือน — หนี้แตะ ${maxDebt.toFixed(0)}% ของ GDP`
        : `Warning — debt reached ${maxDebt.toFixed(0)}% of GDP`;
    } else {
      color = '#06d6a0';
      html = isTH
        ? 'เศรษฐกิจเสถียร — หนี้อยู่ในระดับที่จัดการได้'
        : 'Economy stable — debt remained manageable';
    }

    resultPanel.innerHTML = `<div style="padding:8px;border-left:3px solid ${color};background:rgba(22,33,62,0.6);border-radius:4px;color:${color};font-weight:bold;">${html}</div>`;
  }

  function draw() {
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#16213e';
    ctx.fillRect(0, 0, w, h);

    const isTH = typeof i18n !== 'undefined' && i18n.currentLang === 'th';
    const pad = { top: 40, bottom: 40, left: 55, right: 55 };
    const plotW = w - pad.left - pad.right;
    const plotH = h - pad.top - pad.bottom;
    const px = pad.left;
    const py = pad.top;

    if (!simData) {
      // Placeholder
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(isTH ? 'กด "เริ่ม" เพื่อจำลองวัฏจักรหนี้ Minsky' : 'Press "Run" to simulate the Minsky Debt Cycle', w / 2, h / 2);

      // Draw axes placeholder
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.lineWidth = 1;
      ctx.strokeRect(px, py, plotW, plotH);
      return;
    }

    const n = Math.min(animFrame + 1, simData.totalFrames);
    const totalT = 50;

    // Y-axis ranges
    const gdpMin = -10, gdpMax = 15;
    const debtMin = 0, debtMax = 300;

    const mapX = (t) => px + (t / totalT) * plotW;
    const mapYgdp = (v) => py + ((gdpMax - v) / (gdpMax - gdpMin)) * plotH;
    const mapYdebt = (v) => py + ((debtMax - v) / (debtMax - debtMin)) * plotH;

    // Draw phase background shading
    for (let i = 0; i < n - 1; i++) {
      const x1 = mapX(simData.time[i]);
      const x2 = mapX(simData.time[Math.min(i + 1, simData.totalFrames - 1)]);
      let bgColor;
      switch (simData.phases[i]) {
        case 'hedge': bgColor = 'rgba(6,214,160,0.06)'; break;
        case 'speculative': bgColor = 'rgba(255,209,102,0.06)'; break;
        case 'ponzi': bgColor = 'rgba(233,69,96,0.08)'; break;
      }
      ctx.fillStyle = bgColor;
      ctx.fillRect(x1, py, x2 - x1 + 1, plotH);
    }

    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 5; i++) {
      const x = px + (i / 5) * plotW;
      ctx.beginPath(); ctx.moveTo(x, py); ctx.lineTo(x, py + plotH); ctx.stroke();
    }
    for (let i = 0; i <= 5; i++) {
      const y = py + (i / 5) * plotH;
      ctx.beginPath(); ctx.moveTo(px, y); ctx.lineTo(px + plotW, y); ctx.stroke();
    }

    // Danger zone line at 150% debt-to-GDP
    const dangerY = mapYdebt(150);
    ctx.strokeStyle = 'rgba(233,69,96,0.5)';
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(px, dangerY);
    ctx.lineTo(px + plotW, dangerY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(233,69,96,0.7)';
    ctx.font = '9px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(isTH ? 'เขตอันตราย 150%' : 'Danger 150%', px + 4, dangerY - 4);

    // Zero line for GDP growth
    const zeroY = mapYgdp(0);
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(px, zeroY);
    ctx.lineTo(px + plotW, zeroY);
    ctx.stroke();

    // GDP Growth line (green/red)
    ctx.lineWidth = 2;
    for (let i = 1; i < n; i++) {
      const x0 = mapX(simData.time[i - 1]);
      const y0 = mapYgdp(simData.gdpGrowth[i - 1]);
      const x1 = mapX(simData.time[i]);
      const y1 = mapYgdp(simData.gdpGrowth[i]);
      ctx.strokeStyle = simData.gdpGrowth[i] >= 0 ? '#06d6a0' : '#e94560';
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.stroke();
    }

    // Debt-to-GDP line (gold, thick)
    ctx.beginPath();
    ctx.strokeStyle = '#ffd166';
    ctx.lineWidth = 2.5;
    for (let i = 0; i < n; i++) {
      const x = mapX(simData.time[i]);
      const y = mapYdebt(simData.debtToGDP[i]);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Phase indicator bar at bottom
    const barH = 6;
    const barY = py + plotH - barH;
    for (let i = 0; i < n - 1; i++) {
      const x1 = mapX(simData.time[i]);
      const x2 = mapX(simData.time[Math.min(i + 1, simData.totalFrames - 1)]);
      switch (simData.phases[i]) {
        case 'hedge': ctx.fillStyle = '#06d6a0'; break;
        case 'speculative': ctx.fillStyle = '#ffd166'; break;
        case 'ponzi': ctx.fillStyle = '#e94560'; break;
      }
      ctx.fillRect(x1, barY, x2 - x1 + 1, barH);
    }

    // Plot boundary
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 1;
    ctx.strokeRect(px, py, plotW, plotH);

    // Left Y-axis labels (GDP Growth %)
    ctx.fillStyle = '#06d6a0';
    ctx.font = '9px Arial';
    ctx.textAlign = 'right';
    const gdpTicks = [-10, -5, 0, 5, 10, 15];
    for (const val of gdpTicks) {
      const y = mapYgdp(val);
      if (y >= py && y <= py + plotH) {
        ctx.fillText(val + '%', px - 5, y + 3);
      }
    }

    // Right Y-axis labels (Debt-to-GDP %)
    ctx.fillStyle = '#ffd166';
    ctx.textAlign = 'left';
    const debtTicks = [0, 50, 100, 150, 200, 250, 300];
    for (const val of debtTicks) {
      const y = mapYdebt(val);
      if (y >= py && y <= py + plotH) {
        ctx.fillText(val + '%', px + plotW + 5, y + 3);
      }
    }

    // X-axis labels
    ctx.fillStyle = '#aaa';
    ctx.textAlign = 'center';
    for (let i = 0; i <= 5; i++) {
      ctx.fillText((i * 10).toString(), px + (i / 5) * plotW, py + plotH + 15);
    }
    ctx.fillText(isTH ? 'เวลา (ปี)' : 'Time (years)', w / 2, py + plotH + 30);

    // Y-axis titles
    ctx.save();
    ctx.translate(12, h / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = '#06d6a0';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(isTH ? 'การเติบโต GDP (%)' : 'GDP Growth (%)', 0, 0);
    ctx.restore();

    ctx.save();
    ctx.translate(w - 8, h / 2);
    ctx.rotate(Math.PI / 2);
    ctx.fillStyle = '#ffd166';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(isTH ? 'หนี้/GDP (%)' : 'Debt/GDP (%)', 0, 0);
    ctx.restore();

    // Legend
    const lx = px + 8;
    const ly = py + 8;
    ctx.fillStyle = 'rgba(22,33,62,0.85)';
    ctx.fillRect(lx, ly, 140, 60);
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1;
    ctx.strokeRect(lx, ly, 140, 60);

    ctx.font = '9px Arial';
    ctx.textAlign = 'left';

    // GDP Growth
    ctx.strokeStyle = '#06d6a0';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(lx + 5, ly + 12); ctx.lineTo(lx + 20, ly + 12); ctx.stroke();
    ctx.fillStyle = '#06d6a0';
    ctx.fillText(isTH ? 'การเติบโต GDP' : 'GDP Growth', lx + 25, ly + 15);

    // Debt/GDP
    ctx.strokeStyle = '#ffd166';
    ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(lx + 5, ly + 26); ctx.lineTo(lx + 20, ly + 26); ctx.stroke();
    ctx.fillStyle = '#ffd166';
    ctx.fillText(isTH ? 'หนี้/GDP' : 'Debt/GDP', lx + 25, ly + 29);

    // Phase legend
    const phaseColors = { hedge: '#06d6a0', speculative: '#ffd166', ponzi: '#e94560' };
    const phaseLabels = isTH
      ? { hedge: 'Hedge', speculative: 'Speculative', ponzi: 'Ponzi' }
      : { hedge: 'Hedge', speculative: 'Speculative', ponzi: 'Ponzi' };
    let phx = lx + 5;
    const phy = ly + 42;
    for (const [key, color] of Object.entries(phaseColors)) {
      ctx.fillStyle = color;
      ctx.fillRect(phx, phy - 4, 8, 8);
      ctx.fillText(phaseLabels[key], phx + 12, phy + 4);
      phx += 44;
    }
  }

  // Initial draw
  draw();
}


// =============================================
// 3. Sectoral Balances & Credit Accelerator
// =============================================
function initSectoral() {
  const container = document.getElementById('sectoral-sim');
  if (!container) return;

  const canvas = document.createElement('canvas');
  canvas.width = 520;
  canvas.height = 400;
  canvas.style.width = '100%';
  canvas.style.maxWidth = '520px';
  canvas.style.height = 'auto';
  canvas.style.display = 'block';
  canvas.style.margin = '0 auto';

  const vizArea = container.querySelector('.viz-area') || container;
  vizArea.innerHTML = '';
  vizArea.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  // DOM references
  const govtSlider = document.getElementById('sectoral-govt');
  const creditSlider = document.getElementById('sectoral-credit');
  const govtVal = document.getElementById('sectoral-govt-val');
  const creditVal = document.getElementById('sectoral-credit-val');
  const runBtn = document.getElementById('sectoral-run');
  const resetBtn = document.getElementById('sectoral-reset');
  const resultPanel = document.getElementById('sectoral-result');

  let simData = null;
  let animFrame = 0;
  let isRunning = false;
  let rafId = null;

  // Slider listeners
  govtSlider?.addEventListener('input', () => {
    if (govtVal) govtVal.textContent = govtSlider.value;
  });
  creditSlider?.addEventListener('input', () => {
    if (creditVal) creditVal.textContent = creditSlider.value;
  });

  // Run
  runBtn?.addEventListener('click', () => {
    if (rafId) cancelAnimationFrame(rafId);
    simData = runSectoralSim();
    animFrame = 0;
    isRunning = true;
    if (resultPanel) { resultPanel.innerHTML = ''; resultPanel.style.display = 'none'; }
    animate();
  });

  // Reset
  resetBtn?.addEventListener('click', () => {
    if (rafId) cancelAnimationFrame(rafId);
    simData = null;
    animFrame = 0;
    isRunning = false;
    if (resultPanel) { resultPanel.innerHTML = ''; resultPanel.style.display = 'none'; }
    draw();
  });

  function runSectoralSim() {
    const govtSpending = parseFloat(govtSlider?.value || 2);
    const creditGrowthRate = parseFloat(creditSlider?.value || 3);
    const dt = 1; // 1 year
    const totalYears = 30;

    let debt = 50;
    let prevCreditFlow = creditGrowthRate / 100 * debt;

    const time = [];
    const govtBal = [];
    const privateBal = [];
    const tradeBal = [];
    const creditAccelArr = [];
    const employmentArr = [];
    const assetPriceArr = [];

    for (let t = 0; t <= totalYears; t++) {
      // Sectoral balances (% of GDP)
      const G = -(govtSpending); // govt deficit = negative for govt, positive for private
      const trade = -1 + 0.5 * Math.sin(t * 0.3); // slowly oscillating
      const priv = -G - trade; // MUST sum to zero: G + priv + trade = 0

      // Credit dynamics
      const creditRate = creditGrowthRate / 100;
      const creditFlow = creditRate * debt;
      const creditAccel = creditFlow - prevCreditFlow;

      // Employment and asset prices track credit acceleration
      const employment = 95 + 3 * Math.tanh(creditAccel * 0.5);
      const assetPrice = 100 + 15 * Math.tanh(creditAccel * 0.3);

      time.push(t);
      govtBal.push(G);
      privateBal.push(priv);
      tradeBal.push(trade);
      creditAccelArr.push(creditAccel);
      employmentArr.push(employment);
      assetPriceArr.push(assetPrice);

      // Update debt stock
      prevCreditFlow = creditFlow;
      debt += creditRate * debt * dt;
      debt = Math.max(0.1, Math.min(debt, 100000)); // safety clamp
      if (!isFinite(debt)) debt = 50;
    }

    return {
      time, govtBal, privateBal, tradeBal,
      creditAccel: creditAccelArr, employment: employmentArr, assetPrice: assetPriceArr,
      totalFrames: time.length
    };
  }

  function animate() {
    if (!simData || !isRunning) return;
    animFrame += 1;
    if (animFrame >= simData.totalFrames) {
      animFrame = simData.totalFrames - 1;
      isRunning = false;
      showSectoralResult();
    }
    draw();
    if (isRunning) {
      rafId = requestAnimationFrame(animate);
    }
  }

  function showSectoralResult() {
    if (!resultPanel || !simData) return;
    resultPanel.style.display = 'block';
    const isTH = typeof i18n !== 'undefined' && i18n.currentLang === 'th';

    // Average private balance
    const avgPriv = simData.privateBal.reduce((a, b) => a + b, 0) / simData.privateBal.length;
    const privColor = avgPriv >= 0 ? '#06d6a0' : '#e94560';
    const privSign = avgPriv >= 0 ? '+' : '';

    // Credit acceleration correlation with employment
    // Simple: check if credit accel direction matches employment direction
    let matchCount = 0;
    for (let i = 1; i < simData.creditAccel.length; i++) {
      const accelDir = simData.creditAccel[i] - simData.creditAccel[i - 1];
      const empDir = simData.employment[i] - simData.employment[i - 1];
      if ((accelDir >= 0 && empDir >= 0) || (accelDir < 0 && empDir < 0)) matchCount++;
    }
    const corrRatio = matchCount / Math.max(1, simData.creditAccel.length - 1);
    let corrLabel;
    if (corrRatio > 0.7) corrLabel = isTH ? 'แข็งแกร่ง' : 'strong';
    else if (corrRatio > 0.4) corrLabel = isTH ? 'ปานกลาง' : 'moderate';
    else corrLabel = isTH ? 'อ่อน' : 'weak';

    const line1 = isTH
      ? `ดุลภาคเอกชนเฉลี่ย: <span style="color:${privColor}">${privSign}${avgPriv.toFixed(1)}%</span>`
      : `Private sector balance: <span style="color:${privColor}">${privSign}${avgPriv.toFixed(1)}%</span>`;
    const line2 = isTH
      ? `ความสัมพันธ์ Credit Acceleration กับการจ้างงาน: <strong>${corrLabel}</strong>`
      : `Credit acceleration correlation with employment: <strong>${corrLabel}</strong>`;

    resultPanel.innerHTML = `<div style="padding:8px;border-left:3px solid ${privColor};background:rgba(22,33,62,0.6);border-radius:4px;">${line1}<br>${line2}</div>`;
  }

  function draw() {
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#16213e';
    ctx.fillRect(0, 0, w, h);

    const isTH = typeof i18n !== 'undefined' && i18n.currentLang === 'th';

    // Split into TOP (credit accelerator) and BOTTOM (sectoral balances)
    const topH = 220;
    const botH = h - topH;

    drawCreditAccelerator(ctx, 0, 0, w, topH, isTH);

    // Divider
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, topH);
    ctx.lineTo(w, topH);
    ctx.stroke();

    drawSectoralBars(ctx, 0, topH, w, botH, isTH);
  }

  function drawCreditAccelerator(ctx, ox, oy, cw, ch, isTH) {
    const pad = { top: 30, bottom: 25, left: 50, right: 15 };
    const plotW = cw - pad.left - pad.right;
    const plotH = ch - pad.top - pad.bottom;
    const px = ox + pad.left;
    const py = oy + pad.top;

    // Title
    ctx.fillStyle = '#e0e0e0';
    ctx.font = 'bold 11px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(isTH ? 'ตัวเร่งสินเชื่อ & ตัวชี้วัดเศรษฐกิจ' : 'Credit Accelerator & Economic Indicators', ox + cw / 2, oy + 15);

    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 6; i++) {
      const x = px + (i / 6) * plotW;
      ctx.beginPath(); ctx.moveTo(x, py); ctx.lineTo(x, py + plotH); ctx.stroke();
    }
    for (let i = 0; i <= 4; i++) {
      const y = py + (i / 4) * plotH;
      ctx.beginPath(); ctx.moveTo(px, y); ctx.lineTo(px + plotW, y); ctx.stroke();
    }

    // Plot boundary
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1;
    ctx.strokeRect(px, py, plotW, plotH);

    if (!simData) {
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(isTH ? 'กด "เริ่ม" เพื่อจำลอง' : 'Press "Run" to simulate', ox + cw / 2, oy + ch / 2);
      return;
    }

    const n = Math.min(animFrame + 1, simData.totalFrames);
    const totalT = 30;

    // Determine Y range for credit acceleration dynamically
    const accelSlice = simData.creditAccel.slice(0, n);
    const empSlice = simData.employment.slice(0, n);
    const assetSlice = simData.assetPrice.slice(0, n);

    // Normalize all three to a common visual range
    // Credit accel: use raw values
    // Employment: around 92-98
    // Asset price: around 85-115
    // We'll normalize each to [0, 1] for plotting

    const allAccel = simData.creditAccel;
    const allEmp = simData.employment;
    const allAsset = simData.assetPrice;

    const accelMin = Math.min(...allAccel) - 1;
    const accelMax = Math.max(...allAccel) + 1;
    const empMin = 90;
    const empMax = 100;
    const assetMin = 80;
    const assetMax = 120;

    const mapX = (t) => px + (t / totalT) * plotW;
    const normToY = (val, vmin, vmax) => py + plotH - ((val - vmin) / (vmax - vmin)) * plotH;

    // X-axis labels
    ctx.fillStyle = '#aaa';
    ctx.font = '9px Arial';
    ctx.textAlign = 'center';
    for (let i = 0; i <= 6; i++) {
      ctx.fillText((i * 5).toString(), px + (i / 6) * plotW, py + plotH + 14);
    }
    ctx.fillText(isTH ? 'ปี' : 'Years', ox + cw / 2, py + plotH + 24);

    // Credit Acceleration line (gold)
    ctx.beginPath();
    ctx.strokeStyle = '#ffd166';
    ctx.lineWidth = 2;
    for (let i = 0; i < n; i++) {
      const x = mapX(simData.time[i]);
      const y = normToY(simData.creditAccel[i], accelMin, accelMax);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Employment Index line (cyan)
    ctx.beginPath();
    ctx.strokeStyle = '#00b4d8';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < n; i++) {
      const x = mapX(simData.time[i]);
      const y = normToY(simData.employment[i], empMin, empMax);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Asset Prices line (pink)
    ctx.beginPath();
    ctx.strokeStyle = '#e94560';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < n; i++) {
      const x = mapX(simData.time[i]);
      const y = normToY(simData.assetPrice[i], assetMin, assetMax);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Legend (top-right)
    const lx = px + plotW - 155;
    const ly = py + 5;
    ctx.fillStyle = 'rgba(22,33,62,0.85)';
    ctx.fillRect(lx, ly, 150, 46);
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1;
    ctx.strokeRect(lx, ly, 150, 46);

    ctx.font = '9px Arial';
    ctx.textAlign = 'left';

    ctx.strokeStyle = '#ffd166'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(lx + 5, ly + 11); ctx.lineTo(lx + 20, ly + 11); ctx.stroke();
    ctx.fillStyle = '#ffd166';
    ctx.fillText(isTH ? 'Credit Acceleration' : 'Credit Acceleration', lx + 24, ly + 14);

    ctx.strokeStyle = '#00b4d8'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(lx + 5, ly + 24); ctx.lineTo(lx + 20, ly + 24); ctx.stroke();
    ctx.fillStyle = '#00b4d8';
    ctx.fillText(isTH ? 'ดัชนีการจ้างงาน' : 'Employment Index', lx + 24, ly + 27);

    ctx.strokeStyle = '#e94560'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(lx + 5, ly + 37); ctx.lineTo(lx + 20, ly + 37); ctx.stroke();
    ctx.fillStyle = '#e94560';
    ctx.fillText(isTH ? 'ราคาสินทรัพย์' : 'Asset Prices', lx + 24, ly + 40);
  }

  function drawSectoralBars(ctx, ox, oy, cw, ch, isTH) {
    const pad = { top: 20, bottom: 25, left: 50, right: 15 };
    const plotW = cw - pad.left - pad.right;
    const plotH = ch - pad.top - pad.bottom;
    const px = ox + pad.left;
    const py = oy + pad.top;

    // Title
    ctx.fillStyle = '#e0e0e0';
    ctx.font = 'bold 11px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(isTH ? 'ดุลรายภาค (ผลรวม = 0 เสมอ)' : 'Sectoral Balances (always sum to zero)', ox + cw / 2, oy + 13);

    // Plot boundary
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1;
    ctx.strokeRect(px, py, plotW, plotH);

    // Y range: -8 to +8 (% of GDP)
    const yMin = -8, yMax = 8;
    const mapY = (v) => py + ((yMax - v) / (yMax - yMin)) * plotH;
    const zeroY = mapY(0);

    // Zero line
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(px, zeroY);
    ctx.lineTo(px + plotW, zeroY);
    ctx.stroke();

    // Y-axis labels
    ctx.fillStyle = '#aaa';
    ctx.font = '9px Arial';
    ctx.textAlign = 'right';
    for (let v = -6; v <= 6; v += 3) {
      const y = mapY(v);
      if (y >= py && y <= py + plotH) {
        ctx.fillText(v + '%', px - 5, y + 3);
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        ctx.lineWidth = 0.5;
        ctx.beginPath(); ctx.moveTo(px, y); ctx.lineTo(px + plotW, y); ctx.stroke();
      }
    }

    if (!simData) return;

    const n = Math.min(animFrame + 1, simData.totalFrames);
    const totalBars = simData.totalFrames;
    const groupWidth = plotW / totalBars;
    const barWidth = Math.max(2, (groupWidth - 2) / 3);

    // Colors
    const govtColor = '#e94560';   // red for government
    const privColor = '#00b4d8';   // cyan for private
    const tradeColor = '#ff8c00';  // orange for foreign

    for (let i = 0; i < n; i++) {
      const groupX = px + i * groupWidth;

      // Government bar
      drawBar(ctx, groupX + 1, zeroY, barWidth, simData.govtBal[i], yMax - yMin, plotH, govtColor);
      // Private bar
      drawBar(ctx, groupX + 1 + barWidth, zeroY, barWidth, simData.privateBal[i], yMax - yMin, plotH, privColor);
      // Trade bar
      drawBar(ctx, groupX + 1 + barWidth * 2, zeroY, barWidth, simData.tradeBal[i], yMax - yMin, plotH, tradeColor);
    }

    // X-axis labels (every 5 years)
    ctx.fillStyle = '#aaa';
    ctx.font = '9px Arial';
    ctx.textAlign = 'center';
    for (let t = 0; t <= 30; t += 5) {
      const x = px + (t / 30) * plotW;
      ctx.fillText(t.toString(), x, py + plotH + 14);
    }
    ctx.fillText(isTH ? 'ปี' : 'Years', ox + cw / 2, py + plotH + 24);

    // Mini legend
    const lx = px + plotW - 150;
    const ly = py + 3;
    ctx.fillStyle = 'rgba(22,33,62,0.85)';
    ctx.fillRect(lx, ly, 147, 16);
    ctx.font = '8px Arial';
    ctx.textAlign = 'left';

    ctx.fillStyle = govtColor;
    ctx.fillRect(lx + 3, ly + 4, 8, 8);
    ctx.fillText(isTH ? 'รัฐบาล' : 'Govt', lx + 14, ly + 12);

    ctx.fillStyle = privColor;
    ctx.fillRect(lx + 52, ly + 4, 8, 8);
    ctx.fillText(isTH ? 'เอกชน' : 'Private', lx + 63, ly + 12);

    ctx.fillStyle = tradeColor;
    ctx.fillRect(lx + 108, ly + 4, 8, 8);
    ctx.fillText(isTH ? 'ต่างประเทศ' : 'Foreign', lx + 119, ly + 12);
  }

  function drawBar(ctx, x, zeroY, width, value, range, plotH, color) {
    // Draw a bar from zero line up or down
    const barH = (value / range) * plotH; // positive = up from zero
    const barTop = value >= 0 ? zeroY - barH : zeroY;
    const barHeight = Math.abs(barH);

    ctx.fillStyle = color;
    ctx.globalAlpha = 0.75;
    ctx.fillRect(x, barTop, width, barHeight);
    ctx.globalAlpha = 1.0;

    // Thin border
    ctx.strokeStyle = color;
    ctx.lineWidth = 0.5;
    ctx.strokeRect(x, barTop, width, barHeight);
  }

  // Initial draw
  draw();
}
