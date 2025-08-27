// Utility to get a random integer in [min, max]
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate a random line and point
function generateProblem() {
  // m: slope, b: y-intercept
  let m = randInt(-5, 5);
  while (m === 0) m = randInt(-5, 5); // avoid horizontal
  let b = randInt(-8, 8);

  // Decide if point is on the line (50% chance)
  const onLine = Math.random() < 0.5;
  let x, y;
  if (onLine) {
    let attempts = 0;
    do {
      x = randInt(-9, 9);
      y = m * x + b;
      attempts++;
    } while ((y < -10 || y > 10) && attempts < 10);
    // Clamp y to [-10, 10] if all attempts fail
    if (y < -10) y = -10;
    if (y > 10) y = 10;
  } else {
    let attempts = 0;
    do {
      x = randInt(-9, 9);
      y = m * x + b + randInt(1, 4) * (Math.random() < 0.5 ? 1 : -1); // offset
      attempts++;
    } while ((y < -10 || y > 10) && attempts < 10);
    // Clamp y to [-10, 10] if all attempts fail
    if (y < -10) y = -10;
    if (y > 10) y = 10;
  }
  // Clamp x to [-10, 10]
  if (x < -10) x = -10;
  if (x > 10) x = 10;
  return { m, b, x, y, onLine };
}

// Draw the graph
function drawGraph(ctx) {
  ctx.clearRect(0, 0, 440, 440);
  ctx.save();
  // Center so that -10 to 10 fits perfectly
  // Each unit is 20px, so 21 units = 420px, leaving 10px padding on each side
  ctx.translate(220, 220); // keep center unchanged
  const pxPerUnit = 20;
  // Draw grid lines
  ctx.lineWidth = 1.1;
  ctx.strokeStyle = '#3a7bd5'; // match axis color
  for (let i = -10; i <= 10; i++) {
    // vertical grid
    ctx.beginPath();
    ctx.moveTo(i * pxPerUnit, -200);
    ctx.lineTo(i * pxPerUnit, 200);
    ctx.stroke();
    // horizontal grid
    ctx.beginPath();
    ctx.moveTo(-200, i * pxPerUnit);
    ctx.lineTo(200, i * pxPerUnit);
    ctx.stroke();
  }
  // Draw axes (thicker)
  ctx.lineWidth = 5;
  ctx.strokeStyle = '#3a7bd5';
  ctx.beginPath();
  ctx.moveTo(-200, 0); ctx.lineTo(200, 0); // x-axis
  ctx.moveTo(0, -200); ctx.lineTo(0, 200); // y-axis
  ctx.stroke();
  // Draw ticks and numbers
  ctx.lineWidth = 2;
  ctx.font = '18px Segoe UI, Frutiger, Arial, sans-serif';
  ctx.fillStyle = '#1a3557';
  for (let i = -10; i <= 10; i++) {
    if (i === 0) continue;
    // x ticks
    ctx.beginPath();
    ctx.moveTo(i * pxPerUnit, -8); ctx.lineTo(i * pxPerUnit, 8);
    ctx.stroke();
    // x numbers
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    if (i % 2 === 0) {
      ctx.fillText(i, i * pxPerUnit, 14);
    } else {
      ctx.globalAlpha = 0;
      ctx.fillText(i, i * pxPerUnit, 14);
      ctx.globalAlpha = 1;
    }
    ctx.restore();
    // y ticks
    ctx.beginPath();
    ctx.moveTo(-8, -i * pxPerUnit); ctx.lineTo(8, -i * pxPerUnit);
    ctx.stroke();
    // y numbers
    ctx.save();
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    if (i % 2 === 0) {
      ctx.fillText(i.toString(), -16, -i * pxPerUnit);
    } else {
      ctx.globalAlpha = 0;
      ctx.fillText(i.toString(), -16, -i * pxPerUnit);
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  }
  // Draw 10 labels outside border
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText('10', 200, 14);
  ctx.fillText('-10', -200, 14);
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  ctx.fillText('10', -16, -200);
  ctx.fillText('-10', -16, 200);
  ctx.restore();
  ctx.restore();
}

// Draw the line and point
function drawLineAndPoint(ctx, m, b, x, y) {
  ctx.save();
  ctx.translate(220, 220);
  // Draw line
  ctx.strokeStyle = '#1976d2';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  // y = m*x + b, for x in [-10, 10]
  let x1 = -10, x2 = 10;
  let y1 = m * x1 + b, y2 = m * x2 + b;
  ctx.moveTo(x1 * 20, -y1 * 20);
  ctx.lineTo(x2 * 20, -y2 * 20);
  ctx.stroke();
  // Draw Bubble image at the plot point
  if (!window._bubbleImg) {
    window._bubbleImg = new window.Image();
  window._bubbleImg.src = 'https://images.vexels.com/media/users/3/299170/isolated/preview/e6b778086e5fa0a622852975737b29c7-green-earth-globe-icon.png';
    window._bubbleImg.onload = function() {
      updateDisplay();
    };
  }
  if (window._bubbleImg.complete && window._bubbleImg.naturalWidth > 0) {
    ctx.drawImage(window._bubbleImg, x * 20 - 14, -y * 20 - 14, 28, 28);
  } else {
    // Fallback to red dot if image not loaded yet
    ctx.fillStyle = '#d32f2f';
    ctx.beginPath();
    ctx.arc(x * 20, -y * 20, 7, 0, 2 * Math.PI);
    ctx.fill();
  }
  ctx.restore();
}

// State
let problems = [];
let currentIdx = 0;
let showing = false;

function newProblem() {
  problems.push(generateProblem());
  currentIdx = problems.length - 1;
  showing = false;
  updateDisplay();
}

function updateDisplay() {
  const { m, b, x, y } = problems[currentIdx];
  document.getElementById('equation').textContent = `Y = ${m}X + ${b}`;
  document.getElementById('point').textContent = `(${x}, ${y})`;
  document.getElementById('result').textContent = '';
  const ctx = document.getElementById('graph').getContext('2d');
  drawGraph(ctx);
  if (showing) {
    drawLineAndPoint(ctx, m, b, x, y);
    // Show result
    const onLine = Math.abs(y - (m * x + b)) < 1e-6;
    const resultElem = document.getElementById('result');
    if (onLine) {
      resultElem.textContent = 'The point is on the line!';
      resultElem.style.color = '#18e783ff'; // blue-green
    } else {
      resultElem.textContent = 'The point is NOT on the line.';
      resultElem.style.color = '#c399fdff'; // light purple
    }
  }
}

// Navigation
function goTo(idx) {
  if (idx < 0 || idx >= problems.length) return;
  currentIdx = idx;
  showing = false;
  updateDisplay();
}

// Event listeners
window.onload = function() {
  if (problems.length === 0) newProblem();
  document.getElementById('show-btn').onclick = function() {
    showing = true;
    updateDisplay();
  };
  document.getElementById('arrow-left').onclick = function() {
    if (currentIdx > 0) goTo(currentIdx - 1);
  };
  document.getElementById('arrow-right').onclick = function() {
    if (currentIdx === problems.length - 1) newProblem();
    else goTo(currentIdx + 1);
  };
};
