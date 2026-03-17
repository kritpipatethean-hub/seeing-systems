// ========================================
// Chapter 1: Interactive Simulations
// 1. Population Simulation (Counterintuitive Behavior)
// 2. Reinforcing Loop Diagram (R)
// 3. Balancing Loop Diagram (B)
// ========================================

document.addEventListener('DOMContentLoaded', () => {
  initPopulationSim();
  initReinforcingLoop();
  initBalancingLoop();
});

// =============================================
// 1. Population / City Simulation
// Simplified: one slider (housing), clearer output
// =============================================
function initPopulationSim() {
  const container = document.getElementById('population-sim');
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
  const housingSlider = document.getElementById('housing-slider');
  const housingVal = document.getElementById('housing-val');
  const runBtn = document.getElementById('sim-run');
  const resetBtn = document.getElementById('sim-reset');
  const resultPanel = document.getElementById('sim-result');

  let simData = null;
  let animFrame = 0;
  let isRunning = false;

  housingSlider?.addEventListener('input', () => {
    housingVal.textContent = housingSlider.value + '%';
  });

  function runSimulation() {
    const housingPolicy = parseInt(housingSlider.value) / 100;

    const dt = 0.5;
    const steps = 60;
    const data = { time: [], population: [], quality: [] };

    let pop = 100000;
    let housing = 100000;
    let quality = 0.7;

    for (let i = 0; i <= steps; i++) {
      const t = i * dt;
      data.time.push(t);
      data.population.push(pop / 1000); // in thousands
      data.quality.push(quality);

      const housingRatio = Math.min(housing / pop, 1.5);
      // Policy "announcement effect": high investment attracts people directly
      const policySignal = housingPolicy * 0.4;
      const attractiveness = housingRatio * 0.2 + quality * 0.3 + policySignal;
      const migration = pop * (attractiveness - 0.45) * 0.08;
      const births = pop * 0.012;
      const deaths = pop * 0.008;
      // Housing construction has diminishing returns as city grows
      const buildCapacity = 1 / (1 + pop / 150000);
      const newHousing = pop * housingPolicy * 0.025 * buildCapacity;
      const housingDecay = housing * 0.015;

      pop = Math.max(pop + (births - deaths + migration) * dt, 10000);
      housing = Math.max(housing + (newHousing - housingDecay) * dt, 10000);
      const crowding = pop / housing;
      quality = Math.max(0.1, Math.min(1, quality + (0.7 - crowding) * 0.02 * dt));
    }

    simData = data;
    animFrame = 0;
    isRunning = true;

    // Show result text
    const finalPop = data.population[data.population.length - 1];
    const finalQ = data.quality[data.quality.length - 1];
    const startPop = data.population[0];
    const popChange = ((finalPop - startPop) / startPop * 100).toFixed(0);
    const qChange = ((finalQ - 0.7) / 0.7 * 100).toFixed(0);

    if (resultPanel) {
      const isTH = i18n.currentLang === 'th';
      resultPanel.innerHTML = isTH
        ? `<strong>ผลลัพธ์ (30 ปี):</strong> ประชากร ${popChange > 0 ? '+' : ''}${popChange}% | คุณภาพชีวิต ${qChange > 0 ? '+' : ''}${qChange}%`
        : `<strong>Result (30 years):</strong> Population ${popChange > 0 ? '+' : ''}${popChange}% | Quality of life ${qChange > 0 ? '+' : ''}${qChange}%`;
      resultPanel.style.display = 'block';
      resultPanel.style.borderLeftColor = parseInt(qChange) < 0 ? '#e94560' : '#06d6a0';
    }

    animatePlot();
  }

  function animatePlot() {
    if (!isRunning || !simData) return;
    animFrame = Math.min(animFrame + 2, simData.time.length);
    drawPlot(animFrame);
    if (animFrame < simData.time.length) {
      requestAnimationFrame(animatePlot);
    }
  }

  function drawPlot(frameCount) {
    const w = canvas.width;
    const h = canvas.height;
    const pad = { top: 40, right: 20, bottom: 45, left: 55 };

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#16213e';
    ctx.fillRect(0, 0, w, h);

    if (!simData || frameCount === 0) {
      ctx.fillStyle = '#a0aec0';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      const msg = i18n.currentLang === 'th' ? 'กด "เริ่มจำลอง" เพื่อดูผลลัพธ์' : 'Press "Run Simulation" to see results';
      ctx.fillText(msg, w / 2, h / 2);
      return;
    }

    const n = Math.min(frameCount, simData.time.length);
    const maxTime = simData.time[simData.time.length - 1];
    const allPop = simData.population;
    const minPop = Math.min(...allPop) * 0.9;
    const maxPop = Math.max(...allPop) * 1.1;

    const plotW = w - pad.left - pad.right;
    const plotH = h - pad.top - pad.bottom;

    // Grid lines
    ctx.strokeStyle = 'rgba(74,85,104,0.3)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 4; i++) {
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

    // X-axis label
    ctx.fillStyle = '#a0aec0';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(i18n.currentLang === 'th' ? 'เวลา (ปี)' : 'Time (years)', pad.left + plotW / 2, h - 5);

    // Y-axis label
    ctx.save();
    ctx.translate(12, pad.top + plotH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(i18n.currentLang === 'th' ? 'ประชากร (พัน)' : 'Population (thousands)', 0, 0);
    ctx.restore();

    // X ticks
    for (let t = 0; t <= maxTime; t += 5) {
      const x = pad.left + (t / maxTime) * plotW;
      ctx.fillStyle = '#4a5568';
      ctx.fillText(t.toString(), x, h - pad.bottom + 15);
    }

    // Y ticks
    for (let i = 0; i <= 4; i++) {
      const val = minPop + (maxPop - minPop) * (1 - i / 4);
      const y = pad.top + (i / 4) * plotH;
      ctx.fillStyle = '#4a5568';
      ctx.textAlign = 'right';
      ctx.fillText(val.toFixed(0), pad.left - 8, y + 4);
    }

    // Population line
    ctx.strokeStyle = '#00b4d8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const x = pad.left + (simData.time[i] / maxTime) * plotW;
      const y = pad.top + ((maxPop - simData.population[i]) / (maxPop - minPop)) * plotH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Quality line (scaled to same chart)
    const minQ = 0, maxQ = 1;
    ctx.strokeStyle = '#e94560';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 3]);
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const x = pad.left + (simData.time[i] / maxTime) * plotW;
      const scaledQ = minPop + simData.quality[i] * (maxPop - minPop);
      const y = pad.top + ((maxPop - scaledQ) / (maxPop - minPop)) * plotH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Legend
    ctx.textAlign = 'left';
    const popLabel = i18n.currentLang === 'th' ? 'ประชากร' : 'Population';
    const qLabel = i18n.currentLang === 'th' ? 'คุณภาพชีวิต' : 'Quality of Life';

    // Population legend
    ctx.strokeStyle = '#00b4d8';
    ctx.lineWidth = 3;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(pad.left + 10, pad.top - 20);
    ctx.lineTo(pad.left + 30, pad.top - 20);
    ctx.stroke();
    ctx.fillStyle = '#edf2f7';
    ctx.font = '11px sans-serif';
    ctx.fillText(popLabel, pad.left + 35, pad.top - 16);

    // Quality legend
    ctx.strokeStyle = '#e94560';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 3]);
    ctx.beginPath();
    ctx.moveTo(pad.left + 120, pad.top - 20);
    ctx.lineTo(pad.left + 140, pad.top - 20);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillText(qLabel, pad.left + 145, pad.top - 16);
  }

  drawPlot(0);

  runBtn?.addEventListener('click', runSimulation);
  resetBtn?.addEventListener('click', () => {
    simData = null;
    isRunning = false;
    animFrame = 0;
    housingSlider.value = 50;
    housingVal.textContent = '50%';
    if (resultPanel) resultPanel.style.display = 'none';
    drawPlot(0);
  });
}


// =============================================
// 2. Reinforcing Loop (R) — Simple 3-node loop
// Population → Births → More Population
// =============================================
function initReinforcingLoop() {
  const container = document.getElementById('r-loop-diagram');
  if (!container) return;

  const nodes = [
    {
      id: 'population', x: 200, y: 60,
      label: { en: 'Population', th: 'ประชากร' },
      info: {
        en: 'The total number of people. More people means more births.',
        th: 'จำนวนคนทั้งหมดในระบบ ยิ่งคนเยอะ ยิ่งเกิดมาก'
      }
    },
    {
      id: 'births', x: 350, y: 250,
      label: { en: 'Births', th: 'การเกิด' },
      info: {
        en: 'The number of new babies born each year. Proportional to population size.',
        th: 'จำนวนเด็กที่เกิดในแต่ละปี เพิ่มขึ้นตามจำนวนประชากร'
      }
    },
    {
      id: 'growth', x: 50, y: 250,
      label: { en: 'Growth\nRate', th: 'อัตรา\nการเติบโต' },
      info: {
        en: 'More births increase the growth rate, which further increases population.',
        th: 'ยิ่งเกิดมาก อัตราเติบโตยิ่งสูง แล้วก็วนกลับไปเพิ่มประชากรอีก'
      }
    }
  ];

  const edges = [
    { from: 'population', to: 'births', sign: '+' },
    { from: 'births', to: 'growth', sign: '+' },
    { from: 'growth', to: 'population', sign: '+' }
  ];

  drawCLD(container, nodes, edges, 'R', '#06d6a0', 'r-loop-info');
}


// =============================================
// 3. Balancing Loop (B) — City overcrowding
// Population → Crowding → Quality ↓ → People Leave
// =============================================
function initBalancingLoop() {
  const container = document.getElementById('b-loop-diagram');
  if (!container) return;

  // Nodes arranged as pentagon — clockwise causal chain: Pop→Crowding→Quality→Attract→Migration→Pop
  const nodes = [
    {
      id: 'population', x: 210, y: 45,
      label: { en: 'Population', th: 'ประชากร' },
      info: {
        en: 'As more people move in, the city becomes crowded.',
        th: 'เมื่อคนย้ายเข้ามามากขึ้น เมืองก็แออัดขึ้น'
      }
    },
    {
      id: 'crowding', x: 375, y: 165,
      label: { en: 'Crowding', th: 'ความแออัด' },
      info: {
        en: 'More people relative to housing creates overcrowding.',
        th: 'คนเยอะแต่ที่อยู่มีจำกัด ก็เกิดความแออัด'
      }
    },
    {
      id: 'quality', x: 310, y: 340,
      label: { en: 'Quality\nof Life', th: 'คุณภาพ\nชีวิต' },
      info: {
        en: 'Overcrowding reduces quality of life — congestion, pollution, resource strain.',
        th: 'ความแออัดลดคุณภาพชีวิต — รถติด มลพิษ ทรัพยากรตึงตัว'
      }
    },
    {
      id: 'attract', x: 110, y: 340,
      label: { en: 'City\nAttract.', th: 'ความน่าอยู่\nของเมือง' },
      info: {
        en: 'When quality of life is high, the city is attractive and draws people in.',
        th: 'เมื่อคุณภาพชีวิตดี เมืองก็น่าอยู่ ดึงดูดคนให้ย้ายเข้ามา'
      }
    },
    {
      id: 'migration', x: 45, y: 165,
      label: { en: 'In-\nmigration', th: 'การย้าย\nเข้า' },
      info: {
        en: 'When the city is attractive, more people move in — increasing population.',
        th: 'เมื่อเมืองน่าอยู่ คนก็อยากย้ายเข้ามา — ทำให้ประชากรเพิ่ม'
      }
    }
  ];

  const edges = [
    { from: 'population', to: 'crowding', sign: '+' },
    { from: 'crowding', to: 'quality', sign: '-' },
    { from: 'quality', to: 'attract', sign: '+' },
    { from: 'attract', to: 'migration', sign: '+' },
    { from: 'migration', to: 'population', sign: '+' }
  ];

  drawCLD(container, nodes, edges, 'B', '#e94560', 'b-loop-info');
}


// =============================================
// Shared CLD Drawing Function
// =============================================
function drawCLD(container, nodes, edges, loopType, loopColor, infoPanelId) {
  const svgNS = 'http://www.w3.org/2000/svg';
  const w = 430, h = 400;

  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
  svg.style.width = '100%';
  svg.style.maxWidth = '430px';
  svg.style.display = 'block';
  svg.style.margin = '0 auto';

  // Arrow markers
  const defs = document.createElementNS(svgNS, 'defs');

  ['positive', 'negative'].forEach(type => {
    const marker = document.createElementNS(svgNS, 'marker');
    marker.setAttribute('id', `arrow-${type}-${loopType}`);
    marker.setAttribute('viewBox', '0 0 10 10');
    marker.setAttribute('refX', '9');
    marker.setAttribute('refY', '5');
    marker.setAttribute('markerWidth', '9');
    marker.setAttribute('markerHeight', '9');
    marker.setAttribute('orient', 'auto');
    const arrowPath = document.createElementNS(svgNS, 'path');
    arrowPath.setAttribute('d', 'M 0 1 L 10 5 L 0 9 z');
    arrowPath.setAttribute('fill', type === 'positive' ? '#06d6a0' : '#e94560');
    marker.appendChild(arrowPath);
    defs.appendChild(marker);
  });
  svg.appendChild(defs);

  const infoPanel = document.getElementById(infoPanelId);

  // Calculate center of all nodes (for curve direction)
  const centerX = nodes.reduce((s, n) => s + n.x, 0) / nodes.length;
  const centerY = nodes.reduce((s, n) => s + n.y, 0) / nodes.length;

  // Draw edges as curved arrows
  edges.forEach(edge => {
    const fromNode = nodes.find(n => n.id === edge.from);
    const toNode = nodes.find(n => n.id === edge.to);
    const color = edge.sign === '+' ? '#06d6a0' : '#e94560';
    const markerId = edge.sign === '+' ? `arrow-positive-${loopType}` : `arrow-negative-${loopType}`;

    // Direction vector
    const dx = toNode.x - fromNode.x;
    const dy = toNode.y - fromNode.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const r = 34; // node radius for offset

    // Start/end points offset from circle edge
    const startX = fromNode.x + (dx / dist) * r;
    const startY = fromNode.y + (dy / dist) * r;
    const endX = toNode.x - (dx / dist) * r;
    const endY = toNode.y - (dy / dist) * r;

    // Midpoint of the straight line
    const midX = (startX + endX) / 2;
    const midY = (startY + endY) / 2;

    // Perpendicular direction — curve AWAY from center (outward arc)
    const perpX = -(endY - startY) / dist;
    const perpY = (endX - startX) / dist;

    // Determine which side of the line the center is on
    const toCenterX = centerX - midX;
    const toCenterY = centerY - midY;
    const dot = perpX * toCenterX + perpY * toCenterY;
    const curveDir = dot > 0 ? -1 : 1; // curve away from center

    const curveAmount = 30;
    const ctrlX = midX + perpX * curveAmount * curveDir;
    const ctrlY = midY + perpY * curveAmount * curveDir;

    const path = document.createElementNS(svgNS, 'path');
    path.setAttribute('d', `M ${startX} ${startY} Q ${ctrlX} ${ctrlY} ${endX} ${endY}`);
    path.setAttribute('stroke', color);
    path.setAttribute('stroke-width', '2.5');
    path.setAttribute('fill', 'none');
    path.setAttribute('marker-end', `url(#${markerId})`);
    path.setAttribute('opacity', '0.8');
    svg.appendChild(path);

    // Sign label — positioned at curve midpoint (on the Bezier)
    const signX = 0.25 * startX + 0.5 * ctrlX + 0.25 * endX;
    const signY = 0.25 * startY + 0.5 * ctrlY + 0.25 * endY;

    // Background circle behind sign for readability
    const signBg = document.createElementNS(svgNS, 'circle');
    signBg.setAttribute('cx', signX);
    signBg.setAttribute('cy', signY);
    signBg.setAttribute('r', '11');
    signBg.setAttribute('fill', '#16213e');
    signBg.setAttribute('opacity', '0.9');
    svg.appendChild(signBg);

    const signText = document.createElementNS(svgNS, 'text');
    signText.setAttribute('x', signX);
    signText.setAttribute('y', signY);
    signText.setAttribute('fill', color);
    signText.setAttribute('font-size', '20');
    signText.setAttribute('font-weight', 'bold');
    signText.setAttribute('text-anchor', 'middle');
    signText.setAttribute('dominant-baseline', 'central');
    signText.textContent = edge.sign;
    svg.appendChild(signText);
  });

  // Draw nodes
  nodes.forEach(node => {
    const g = document.createElementNS(svgNS, 'g');
    g.style.cursor = 'pointer';

    const circle = document.createElementNS(svgNS, 'circle');
    circle.setAttribute('cx', node.x);
    circle.setAttribute('cy', node.y);
    circle.setAttribute('r', '34');
    circle.setAttribute('fill', '#0f3460');
    circle.setAttribute('stroke', loopColor);
    circle.setAttribute('stroke-width', '2');
    g.appendChild(circle);

    const lines = (node.label[i18n.currentLang] || node.label.en).split('\n');
    lines.forEach((line, idx) => {
      const text = document.createElementNS(svgNS, 'text');
      text.setAttribute('x', node.x);
      text.setAttribute('y', node.y + (idx - (lines.length - 1) / 2) * 14);
      text.setAttribute('fill', '#edf2f7');
      text.setAttribute('font-size', '12');
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('dominant-baseline', 'central');
      text.textContent = line;
      g.appendChild(text);
    });

    g.addEventListener('click', () => {
      if (infoPanel) {
        const info = node.info[i18n.currentLang] || node.info.en;
        const title = (node.label[i18n.currentLang] || node.label.en).replace('\n', ' ');
        infoPanel.innerHTML = `<strong>${title}</strong><br>${info}`;
        infoPanel.style.display = 'block';
      }
      svg.querySelectorAll('circle').forEach(c => {
        c.setAttribute('stroke', loopColor);
        c.setAttribute('stroke-width', '2');
      });
      circle.setAttribute('stroke', '#ffd166');
      circle.setAttribute('stroke-width', '3');
    });

    g.addEventListener('mouseenter', () => circle.setAttribute('r', '37'));
    g.addEventListener('mouseleave', () => circle.setAttribute('r', '34'));

    svg.appendChild(g);
  });

  // Center loop label with flow direction
  const loopLabel = document.createElementNS(svgNS, 'text');
  loopLabel.setAttribute('x', centerX);
  loopLabel.setAttribute('y', centerY - 10);
  loopLabel.setAttribute('fill', loopColor);
  loopLabel.setAttribute('font-size', '26');
  loopLabel.setAttribute('text-anchor', 'middle');
  loopLabel.setAttribute('font-weight', 'bold');
  loopLabel.textContent = loopType;
  svg.appendChild(loopLabel);

  // Clockwise arrow indicator
  const flowArrow = document.createElementNS(svgNS, 'text');
  flowArrow.setAttribute('x', centerX);
  flowArrow.setAttribute('y', centerY + 16);
  flowArrow.setAttribute('fill', loopColor);
  flowArrow.setAttribute('font-size', '18');
  flowArrow.setAttribute('text-anchor', 'middle');
  flowArrow.setAttribute('opacity', '0.6');
  flowArrow.textContent = '↻';
  svg.appendChild(flowArrow);

  const loopDesc = document.createElementNS(svgNS, 'text');
  loopDesc.setAttribute('x', centerX);
  loopDesc.setAttribute('y', centerY + 34);
  loopDesc.setAttribute('fill', '#a0aec0');
  loopDesc.setAttribute('font-size', '12');
  loopDesc.setAttribute('text-anchor', 'middle');
  const descEN = loopType === 'R' ? 'Reinforcing' : 'Balancing';
  const descTH = loopType === 'R' ? 'เสริมแรง' : 'สมดุล';
  loopDesc.textContent = i18n.currentLang === 'th' ? descTH : descEN;
  svg.appendChild(loopDesc);

  const vizArea = container.querySelector('.viz-area');
  if (vizArea) {
    vizArea.innerHTML = '';
    vizArea.appendChild(svg);
  }
}
