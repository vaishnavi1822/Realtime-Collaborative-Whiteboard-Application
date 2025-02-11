const canvas = document.getElementById('whiteboard');
const ctx = canvas.getContext('2d');

let drawing = false;
let lastX = 0;
let lastY = 0;
let currentColor = 'black';  // Default color
let currentThickness = 2;    // Default thickness

const socket = io();

// Pen color buttons
document.querySelectorAll('.pen-color').forEach(button => {
  button.addEventListener('click', () => {
    currentColor = button.id;
    button.style.border = "2px solid #000";  // Highlight the selected button
  });
});

// Pen thickness selector
document.getElementById('thickness').addEventListener('change', (e) => {
  currentThickness = parseInt(e.target.value, 10);
});

// Clear canvas button
document.getElementById('clear-canvas').addEventListener('click', () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);  // Clear the whiteboard
  socket.emit('clear');  // Inform other users to clear the canvas
});

// Mouse events to draw
canvas.addEventListener('mousedown', (e) => {
  drawing = true;
  lastX = e.offsetX;
  lastY = e.offsetY;
  socket.emit('down', { x: lastX, y: lastY });
});

canvas.addEventListener('mouseup', () => {
  drawing = false;
});

canvas.addEventListener('mousemove', (e) => {
  if (!drawing) return;

  const x = e.offsetX;
  const y = e.offsetY;

  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  ctx.lineTo(x, y);
  ctx.strokeStyle = currentColor;
  ctx.lineWidth = currentThickness;
  ctx.lineCap = 'round';
  ctx.stroke();
  ctx.closePath();

  socket.emit('draw', { 
    x, 
    y, 
    lastX, 
    lastY, 
    currentColor, 
    currentThickness 
  });

  lastX = x;
  lastY = y;
});

// Listen for drawing data from other users
socket.on('ondraw', (data) => {
  ctx.beginPath();
  ctx.moveTo(data.lastX, data.lastY);
  ctx.lineTo(data.x, data.y);
  ctx.strokeStyle = data.currentColor;
  ctx.lineWidth = data.currentThickness;
  ctx.lineCap = 'round';
  ctx.stroke();
  ctx.closePath();
});

// Listen for mouse down events from other users
socket.on('ondown', (data) => {
  ctx.moveTo(data.x, data.y);
});

// Listen for clear command from other users
socket.on('clear', () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});
