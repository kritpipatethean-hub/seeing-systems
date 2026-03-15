// ========================================
// Chapter 1: Interactive Simulations
// 1. Population Simulation (Counterintuitive Behavior)
// 2. Causal Loop Diagram (Interactive)
// ========================================

document.addEventListener('DOMContentLoaded', () => {
  initPopulationSim();
  initCausalLoop();
});

// =============================================
// 1. Population / City Simulation
// Demonstrates counterintuitive behavior:
// More housing → more attractiveness → more migration → overcrowding → worse quality of life
// =============================================
function initPopulationSim() {
  const container = document.getElementById('population-sim');
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

  // Get slider elements
  const housingSlider = document.getElementById('housing-slider');
  const jobsSlider = document.getElementById('jobs-slider');
  const housingVal = document.getElementById('housing-val');
  const jobsVal = document.getElementById('jobs-val');
  const runBtn = document.getElementById('sim-run');
  const resetBtn = document.getElementById('sim-reset');

  let simData = null;
  let animFrame = 0;
  let isRunning = false;

  housingSlider?.addEventListener('input', () => {
    housingVal.textContent = housingSlider.value + '%';
  });
  jobsSlider?.addEventListener('input', () => {
    jobsVal.textContent = jobsSlider.value + '%';
  });

  function runSimulation() {
    const housingPolicy = parseInt(housingSlider.value) / 100;
    const jobsPolicy = parseInt(jobsSlider.value) / 100;

    // Simple SD model
    const dt = 0.5;
    const steps = 60; // 30 years
    const data = {
      time: [],
      population: [],
      attractiveness: [],
      quality: []
    };

    let pop = 100000;
    let housing = 100000;
    let jobs = 80000;
    let quality = 0.7;

    for (let i = 0; i <= steps; i++) {
      const t = i * dt;
      data.time.push(t);
      data.population.push(pop);

      // Attractiveness = f(housing ratio, jobs ratio, quality)
      const housingRatio = Math.min(housing / pop, 1.5);
      const jobsRatio = Math.min(jobs / pop, 1.0);
      const attractiveness = (housingRatio * 0.3 + jobsRatio * 0.4 + quality * 0.3);
      data.attractiveness.push(attractiveness);
      data.quality.push(quality);

      // Migration = function of attractiveness
      const migration = pop * (attractiveness - 0.5) * 0.05;
      const births = pop * 0.012;
      const deaths = pop * 0.008;

      // Policy effects
      const newHousing = pop * housingPolicy * 0.03;
      const newJobs = pop * jobsPolicy * 0.025;
      const housingDecay = housing * 0.02;

      // Update
      pop = Math.max(pop + (births - deaths + migration) * dt, 10000);
      housing = Math.max(housing + (newHousing - housingDecay) * dt, 10000);
      jobs = Math.max(jobs + (newJobs - jobs * 0.015) * dt, 10000);

      // Quality degrades with overcrowding
      const crowding = pop / housing;
      quality = Math.max(0.1, Math.min(1, quality + (0.7 - crowding) * 0.02 * dt));
    }

    simData = data;
    animFrame = 0;
    isRunning = true;
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
    const pad = { top: 30, right: 20, bottom: 40, left: 60 };

    ctx.clearRect(0, 0, w, h);

    // Background
    ctx.fillStyle = '#16213e';
    ctx.fillRect(0, 0, w, h);

    if (!simData || frameCount === 0) {
      ctx.fillStyle = '#a0aec0';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      const msg = i18n.currentLang === 'th' ? 'กดปุ่ม "เริ่มจำลอง" เพื่อดูผลลัพธ์' : 'Press "Run Simulation" to see results';
      ctx.fillText(msg, w / 2, h / 2);
      return;
    }

    const n = Math.min(frameCount, simData.time.length);
    const maxTime = simData.time[simData.time.length - 1];
    const maxPop = Math.max(...simData.population) * 1.1;

    const plotW = w - pad.left - pad.right;
    const plotH = h - pad.top - pad.bottom;

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
    const timeLabel = i18n.t('interactive.time');
    ctx.fillText(timeLabel, pad.left + plotW / 2, h - 5);

    ctx.save();
    ctx.translate(15, pad.top + plotH / 2);
    ctx.rotate(-Math.PI / 2);
    const popLabel = i18n.t('interactive.population.label');
    ctx.fillText(popLabel, 0, 0);
    ctx.restore();

    // Tick marks
    for (let t = 0; t <= maxTime; t += 5) {
      const x = pad.left + (t / maxTime) * plotW;
      ctx.fillStyle = '#4a5568';
      ctx.fillText(t.toString(), x, h - pad.bottom + 15);
    }

    // Draw population line
    ctx.strokeStyle = '#00b4d8';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const x = pad.left + (simData.time[i] / maxTime) * plotW;
      const y = h - pad.bottom - (simData.population[i] / maxPop) * plotH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Draw attractiveness line (scaled)
    ctx.strokeStyle = '#06d6a0';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 3]);
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const x = pad.left + (simData.time[i] / maxTime) * plotW;
      const y = h - pad.bottom - simData.attractiveness[i] * plotH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw quality line (scaled)
    ctx.strokeStyle = '#e94560';
    ctx.lineWidth = 2;
    ctx.setLineDash([2, 3]);
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const x = pad.left + (simData.time[i] / maxTime) * plotW;
      const y = h - pad.bottom - simData.quality[i] * plotH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Legend
    const legends = [
      { color: '#00b4d8', label: i18n.t('interactive.population.label'), dash: false },
      { color: '#06d6a0', label: i18n.t('interactive.attractiveness'), dash: true },
      { color: '#e94560', label: 'Quality', dash: true }
    ];

    let lx = pad.left + 10;
    let ly = pad.top + 10;
    legends.forEach(leg => {
      ctx.strokeStyle = leg.color;
      ctx.lineWidth = 2;
      if (leg.dash) ctx.setLineDash([4, 2]);
      else ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(lx, ly);
      ctx.lineTo(lx + 20, ly);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#edf2f7';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(leg.label, lx + 25, ly + 4);
      ly += 16;
    });
  }

  // Initial empty plot
  drawPlot(0);

  runBtn?.addEventListener('click', runSimulation);
  resetBtn?.addEventListener('click', () => {
    simData = null;
    isRunning = false;
    animFrame = 0;
    housingSlider.value = 50;
    jobsSlider.value = 50;
    housingVal.textContent = '50%';
    jobsVal.textContent = '50%';
    drawPlot(0);
  });
}


// =============================================
// 2. Interactive Causal Loop Diagram
// =============================================
function initCausalLoop() {
  const container = document.getElementById('causal-loop');
  if (!container) return;

  const svgNS = 'http://www.w3.org/2000/svg';
  const w = 500, h = 400;

  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
  svg.style.width = '100%';
  svg.style.maxWidth = '500px';
  svg.style.display = 'block';
  svg.style.margin = '0 auto';

  // Arrow marker
  const defs = document.createElementNS(svgNS, 'defs');
  const marker = document.createElementNS(svgNS, 'marker');
  marker.setAttribute('id', 'arrow');
  marker.setAttribute('viewBox', '0 0 10 10');
  marker.setAttribute('refX', '10');
  marker.setAttribute('refY', '5');
  marker.setAttribute('markerWidth', '8');
  marker.setAttribute('markerHeight', '8');
  marker.setAttribute('orient', 'auto');
  const arrowPath = document.createElementNS(svgNS, 'path');
  arrowPath.setAttribute('d', 'M 0 0 L 10 5 L 0 10 z');
  arrowPath.setAttribute('fill', '#a0aec0');
  marker.appendChild(arrowPath);
  defs.appendChild(marker);
  svg.appendChild(defs);

  // Nodes
  const nodes = [
    {
      id: 'population', x: 250, y: 60, label: { en: 'Population', th: 'ประชากร' },
      info: {
        en: 'The total number of people living in the city. Affected by births, deaths, and migration.',
        th: 'จำนวนคนทั้งหมดที่อาศัยอยู่ในเมือง ได้รับผลจากการเกิด การตาย และการอพยพ'
      }
    },
    {
      id: 'housing', x: 430, y: 200, label: { en: 'Housing\nDemand', th: 'ความต้องการ\nที่อยู่อาศัย' },
      info: {
        en: 'As population grows, housing demand increases, driving up prices and reducing availability.',
        th: 'เมื่อประชากรเพิ่ม ความต้องการที่อยู่อาศัยเพิ่มขึ้น ทำให้ราคาสูงขึ้นและมีที่อยู่น้อยลง'
      }
    },
    {
      id: 'quality', x: 350, y: 350, label: { en: 'Quality\nof Life', th: 'คุณภาพ\nชีวิต' },
      info: {
        en: 'Overcrowding and resource strain reduce quality of life, which eventually reduces attractiveness.',
        th: 'ความแออัดและทรัพยากรตึงตัวลดคุณภาพชีวิต ซึ่งในที่สุดลดความน่าสนใจ'
      }
    },
    {
      id: 'attract', x: 100, y: 320, label: { en: 'City\nAttractiveness', th: 'ความน่าสนใจ\nของเมือง' },
      info: {
        en: 'How attractive the city is determines migration. High attractiveness draws more people in.',
        th: 'ความน่าสนใจของเมืองกำหนดการอพยพ ความน่าสนใจสูงดึงดูดคนเข้ามามากขึ้น'
      }
    },
    {
      id: 'migration', x: 70, y: 160, label: { en: 'Net\nMigration', th: 'การอพยพ\nสุทธิ' },
      info: {
        en: 'The net flow of people moving in and out of the city, driven by attractiveness.',
        th: 'กระแสสุทธิของคนที่ย้ายเข้าและออกจากเมือง ขับเคลื่อนโดยความน่าสนใจ'
      }
    }
  ];

  // Edges: from → to, sign (+/-), label
  const edges = [
    { from: 'population', to: 'housing', sign: '+', color: '#00b4d8' },
    { from: 'housing', to: 'quality', sign: '-', color: '#e94560' },
    { from: 'quality', to: 'attract', sign: '+', color: '#06d6a0' },
    { from: 'attract', to: 'migration', sign: '+', color: '#06d6a0' },
    { from: 'migration', to: 'population', sign: '+', color: '#00b4d8' }
  ];

  // Info panel
  const infoPanel = document.getElementById('causal-info');

  // Draw edges
  edges.forEach(edge => {
    const fromNode = nodes.find(n => n.id === edge.from);
    const toNode = nodes.find(n => n.id === edge.to);

    const line = document.createElementNS(svgNS, 'line');
    line.setAttribute('x1', fromNode.x);
    line.setAttribute('y1', fromNode.y);
    line.setAttribute('x2', toNode.x);
    line.setAttribute('y2', toNode.y);
    line.setAttribute('stroke', edge.color);
    line.setAttribute('stroke-width', '2');
    line.setAttribute('marker-end', 'url(#arrow)');
    line.setAttribute('opacity', '0.6');
    svg.appendChild(line);

    // Sign label on edge
    const midX = (fromNode.x + toNode.x) / 2;
    const midY = (fromNode.y + toNode.y) / 2;
    const signText = document.createElementNS(svgNS, 'text');
    signText.setAttribute('x', midX + 10);
    signText.setAttribute('y', midY - 5);
    signText.setAttribute('fill', edge.sign === '+' ? '#06d6a0' : '#e94560');
    signText.setAttribute('font-size', '18');
    signText.setAttribute('font-weight', 'bold');
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
    circle.setAttribute('r', '35');
    circle.setAttribute('fill', '#0f3460');
    circle.setAttribute('stroke', '#00b4d8');
    circle.setAttribute('stroke-width', '2');
    g.appendChild(circle);

    // Multi-line text
    const lines = (node.label[i18n.currentLang] || node.label.en).split('\n');
    lines.forEach((line, idx) => {
      const text = document.createElementNS(svgNS, 'text');
      text.setAttribute('x', node.x);
      text.setAttribute('y', node.y + (idx - (lines.length - 1) / 2) * 14);
      text.setAttribute('fill', '#edf2f7');
      text.setAttribute('font-size', '11');
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('dominant-baseline', 'middle');
      text.textContent = line;
      text.classList.add('cld-label-' + node.id);
      g.appendChild(text);
    });

    // Click handler
    g.addEventListener('click', () => {
      if (infoPanel) {
        const info = node.info[i18n.currentLang] || node.info.en;
        const title = (node.label[i18n.currentLang] || node.label.en).replace('\n', ' ');
        infoPanel.innerHTML = `<strong>${title}</strong><br>${info}`;
        infoPanel.style.display = 'block';
      }
      // Highlight
      svg.querySelectorAll('circle').forEach(c => {
        c.setAttribute('stroke', '#00b4d8');
        c.setAttribute('stroke-width', '2');
      });
      circle.setAttribute('stroke', '#ffd166');
      circle.setAttribute('stroke-width', '3');
    });

    // Hover effect
    g.addEventListener('mouseenter', () => {
      circle.setAttribute('r', '38');
    });
    g.addEventListener('mouseleave', () => {
      circle.setAttribute('r', '35');
    });

    svg.appendChild(g);
  });

  // Loop label in center
  const loopLabel = document.createElementNS(svgNS, 'text');
  loopLabel.setAttribute('x', w / 2);
  loopLabel.setAttribute('y', h / 2 + 10);
  loopLabel.setAttribute('fill', '#a78bfa');
  loopLabel.setAttribute('font-size', '16');
  loopLabel.setAttribute('text-anchor', 'middle');
  loopLabel.setAttribute('font-weight', 'bold');
  loopLabel.textContent = 'B';
  svg.appendChild(loopLabel);

  const loopDesc = document.createElementNS(svgNS, 'text');
  loopDesc.setAttribute('x', w / 2);
  loopDesc.setAttribute('y', h / 2 + 28);
  loopDesc.setAttribute('fill', '#a0aec0');
  loopDesc.setAttribute('font-size', '11');
  loopDesc.setAttribute('text-anchor', 'middle');
  loopDesc.textContent = i18n.currentLang === 'th' ? 'วงจรสมดุล' : 'Balancing Loop';
  svg.appendChild(loopDesc);

  container.querySelector('.viz-area')?.appendChild(svg) || container.appendChild(svg);
}
