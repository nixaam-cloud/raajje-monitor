'use client';

import React, { useEffect, useRef } from 'react';
import { CCTVFeed } from '@/data/cctvFeeds';

interface CCTVCanvasFeedProps {
  feed: CCTVFeed;
  nightVision?: boolean;
  digitalZoom?: number;
  showBoundingBoxes?: boolean;
  className?: string;
}

export default function CCTVCanvasFeed({
  feed,
  nightVision = false,
  digitalZoom = 1,
  showBoundingBoxes = true,
  className = '',
}: CCTVCanvasFeedProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let frame = 0;

    // Fixed internal resolution for consistent tactical CCTV rendering
    const width = 640;
    const height = 360;
    canvas.width = width;
    canvas.height = height;

    const render = () => {
      frame++;
      const t = frame * 0.03;

      ctx.save();
      ctx.clearRect(0, 0, width, height);

      // Apply digital zoom centered
      if (digitalZoom > 1) {
        ctx.translate(width / 2, height / 2);
        ctx.scale(digitalZoom, digitalZoom);
        ctx.translate(-width / 2, -height / 2);
      }

      // --- SCENE RENDERING BASED ON CATEGORY ---
      if (feed.category === 'TRAFFIC') {
        renderTrafficScene(ctx, width, height, t, feed, showBoundingBoxes);
      } else if (feed.category === 'AIRPORT') {
        renderAirportScene(ctx, width, height, t, feed, showBoundingBoxes);
      } else if (feed.category === 'PORT') {
        renderPortScene(ctx, width, height, t, feed, showBoundingBoxes);
      } else if (feed.category === 'METRO') {
        renderMetroScene(ctx, width, height, t, feed, showBoundingBoxes);
      } else {
        // COASTAL & REEF (Meeru, Cokes, Hanifaru, Kuredu, Veligandu)
        renderOceanReefScene(ctx, width, height, t, feed, showBoundingBoxes);
      }

      // --- SENSOR NOISE & SCANLINES ---
      renderSensorNoise(ctx, width, height, t, nightVision);

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [feed, digitalZoom, showBoundingBoxes, nightVision]);

  return (
    <canvas
      ref={canvasRef}
      className={`w-full h-full object-cover select-none pointer-events-none ${
        nightVision
          ? 'brightness-125 contrast-175 hue-rotate-[90deg] saturate-200'
          : ''
      } ${className}`}
    />
  );
}

// -------------------------------------------------------------
// 1. OCEAN & REEF SCENE (Meeru Island, Cokes Surf Break, Hanifaru)
// -------------------------------------------------------------
function renderOceanReefScene(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  feed: CCTVFeed,
  showBoundingBoxes: boolean
) {
  // Sky Gradient (tropical sunset/dusk or bright blue)
  const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.45);
  skyGrad.addColorStop(0, '#0c2340');
  skyGrad.addColorStop(0.7, '#143c68');
  skyGrad.addColorStop(1, '#1b5b88');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, w, h * 0.45);

  // Distant Atoll Islands & Coral Rim
  ctx.fillStyle = '#0a2334';
  ctx.beginPath();
  ctx.moveTo(0, h * 0.44);
  for (let x = 0; x <= w; x += 30) {
    const islandH = Math.sin(x * 0.015) * 6 + Math.cos(x * 0.03) * 4;
    ctx.lineTo(x, h * 0.44 - Math.max(0, islandH));
  }
  ctx.lineTo(w, h * 0.45);
  ctx.lineTo(0, h * 0.45);
  ctx.fill();

  // Distant Palm silhouettes
  ctx.fillStyle = '#061622';
  for (let px = 60; px < w; px += 140) {
    ctx.fillRect(px, h * 0.41, 2, 10);
    ctx.beginPath();
    ctx.arc(px + 1, h * 0.40, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Deep Ocean & Lagoon Gradient
  const seaGrad = ctx.createLinearGradient(0, h * 0.45, 0, h);
  seaGrad.addColorStop(0, '#08324a');
  seaGrad.addColorStop(0.35, '#0b526d');
  seaGrad.addColorStop(0.7, '#088395');
  seaGrad.addColorStop(1, '#0a9a9b');
  ctx.fillStyle = seaGrad;
  ctx.fillRect(0, h * 0.45, w, h * 0.55);

  // Animated Rolling Swell / Ocean Waves
  for (let layer = 0; layer < 4; layer++) {
    const yBase = h * (0.50 + layer * 0.12);
    const speed = (layer + 1) * 0.8;
    const waveAmp = 4 + layer * 3;

    ctx.beginPath();
    ctx.moveTo(0, yBase);
    for (let x = 0; x <= w; x += 15) {
      const y = yBase + Math.sin(x * 0.02 + t * speed + layer) * waveAmp;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.fillStyle = `rgba(10, 140, 160, ${0.15 + layer * 0.08})`;
    ctx.fill();

    // Wave Foam Crest
    ctx.strokeStyle = `rgba(220, 255, 255, ${0.35 + layer * 0.12})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let x = 0; x <= w; x += 15) {
      const y = yBase + Math.sin(x * 0.02 + t * speed + layer) * waveAmp;
      if (Math.sin(x * 0.02 + t * speed + layer) > 0.4) {
        ctx.lineTo(x, y);
      } else {
        ctx.moveTo(x, y);
      }
    }
    ctx.stroke();
  }

  // Moving Maldivian Dhoni / Speedboat
  const boatX = ((t * 22) % (w + 160)) - 80;
  const boatY = h * 0.62 + Math.sin(t * 1.5) * 3;
  renderBoat(ctx, boatX, boatY, t);

  // AIS / Radar Target Bounding Box
  if (showBoundingBoxes && boatX > 20 && boatX < w - 60) {
    renderTargetBox(
      ctx,
      boatX - 12,
      boatY - 18,
      50,
      28,
      'DHONI #412',
      '11.8 KTS',
      '#06b6d4'
    );
  }

  // Reef Marker / Buoy
  const buoyX = w * 0.75;
  const buoyY = h * 0.54 + Math.sin(t * 2 + 1) * 2.5;
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.arc(buoyX, buoyY, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(buoyX - 1, buoyY - 8, 2, 8);

  if (showBoundingBoxes) {
    renderTargetBox(ctx, buoyX - 8, buoyY - 12, 16, 20, 'NAVAID-03', 'ANCHORED', '#eab308');
  }
}

// -------------------------------------------------------------
// 2. TRAFFIC SCENE (Sinamalé Bridge & Hulhumalé Highway)
// -------------------------------------------------------------
function renderTrafficScene(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  feed: CCTVFeed,
  showBoundingBoxes: boolean
) {
  // Deep Night Sky & Ocean Chokepoint
  ctx.fillStyle = '#060d17';
  ctx.fillRect(0, 0, w, h);

  // Distant Malé City Skyline lights
  ctx.fillStyle = '#0f172a';
  for (let bx = 20; bx < w; bx += 35) {
    const bh = 20 + Math.sin(bx * 0.05) * 15;
    ctx.fillRect(bx, h * 0.35 - bh, 25, bh);
    // Window lights
    ctx.fillStyle = 'rgba(253, 224, 71, 0.4)';
    if (Math.sin(bx) > 0) {
      ctx.fillRect(bx + 4, h * 0.35 - bh + 5, 3, 3);
      ctx.fillRect(bx + 12, h * 0.35 - bh + 12, 3, 3);
    }
    ctx.fillStyle = '#0f172a';
  }

  // Bridge Road Deck (Perspective from Camera)
  const vanishX = w * 0.48;
  const vanishY = h * 0.32;

  // Ocean below bridge
  ctx.fillStyle = '#091e30';
  ctx.fillRect(0, vanishY, w, h - vanishY);

  // Asphalt Deck
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.moveTo(vanishX - 25, vanishY);
  ctx.lineTo(vanishX + 25, vanishY);
  ctx.lineTo(w + 40, h);
  ctx.lineTo(-40, h);
  ctx.closePath();
  ctx.fill();

  // Bridge Guardrails & Pillars
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(vanishX - 25, vanishY);
  ctx.lineTo(-40, h);
  ctx.moveTo(vanishX + 25, vanishY);
  ctx.lineTo(w + 40, h);
  ctx.stroke();

  // Illuminated Suspension Cables / Arches (Sinamalé Bridge structure)
  ctx.strokeStyle = 'rgba(14, 165, 233, 0.3)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(vanishX, vanishY - 40);
  ctx.lineTo(-20, h * 0.85);
  ctx.moveTo(vanishX, vanishY - 40);
  ctx.lineTo(w + 20, h * 0.85);
  ctx.stroke();

  // Center Lane Dashes moving down in perspective
  ctx.strokeStyle = '#facc15';
  ctx.lineWidth = 2;
  const laneDashOffset = (t * 60) % 50;
  for (let d = 0; d < h - vanishY; d += 40) {
    const yPos = vanishY + ((d + laneDashOffset) % (h - vanishY));
    const factor = (yPos - vanishY) / (h - vanishY);
    const xPos = vanishX;
    const len = 8 + factor * 16;
    ctx.beginPath();
    ctx.moveTo(xPos, yPos);
    ctx.lineTo(xPos, yPos + len);
    ctx.stroke();
  }

  // Vehicles (Commuters & Motorbikes)
  renderVehicle(ctx, w * 0.38, h * 0.65, t, 'car', showBoundingBoxes, 'VEH-MLE-104', '48 KM/H');
  renderVehicle(ctx, w * 0.58, h * 0.50, t * 1.3, 'moto', showBoundingBoxes, 'MOTO-892', '52 KM/H');
  renderVehicle(ctx, w * 0.44, h * 0.85, t * 0.9, 'car', showBoundingBoxes, 'BUS-EXP-02', '38 KM/H');
}

// -------------------------------------------------------------
// 3. AIRPORT SCENE (Velana International Runway 18R/36L)
// -------------------------------------------------------------
function renderAirportScene(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  feed: CCTVFeed,
  showBoundingBoxes: boolean
) {
  // Runway Tarmac Perspective
  ctx.fillStyle = '#050c18';
  ctx.fillRect(0, 0, w, h);

  // Sea border (Runway is surrounded by Indian Ocean)
  ctx.fillStyle = '#08253a';
  ctx.fillRect(0, h * 0.40, w, h * 0.60);

  const rx = w * 0.5;
  const ry = h * 0.38;

  // Runway Surface
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.moveTo(rx - 30, ry);
  ctx.lineTo(rx + 30, ry);
  ctx.lineTo(w * 0.85, h);
  ctx.lineTo(w * 0.15, h);
  ctx.closePath();
  ctx.fill();

  // Runway Centerline Lights (White pulsing)
  ctx.fillStyle = '#ffffff';
  for (let ly = ry; ly < h; ly += 25) {
    const p = (ly - ry) / (h - ry);
    const sz = 1.5 + p * 3;
    ctx.fillRect(rx - sz / 2, ly, sz, sz * 1.8);
  }

  // Runway Edge Lights (Green threshold / White edge)
  ctx.fillStyle = '#22c55e';
  for (let ey = ry; ey < h; ey += 30) {
    const p = (ey - ry) / (h - ry);
    const leftX = rx - 30 - p * (w * 0.35 - 30);
    const rightX = rx + 30 + p * (w * 0.35 - 30);
    ctx.beginPath();
    ctx.arc(leftX, ey, 2 + p * 2, 0, Math.PI * 2);
    ctx.arc(rightX, ey, 2 + p * 2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Taxiing Aircraft (Seaplane / Airbus)
  const planeX = w * 0.42 + Math.sin(t * 0.5) * 30;
  const planeY = h * 0.60;
  renderAircraft(ctx, planeX, planeY, t);

  if (showBoundingBoxes) {
    renderTargetBox(
      ctx,
      planeX - 25,
      planeY - 20,
      60,
      35,
      'TMA DHC-6 [8Q-RAI]',
      'TAXIING // 12 KTS',
      '#10b981'
    );
  }
}

// -------------------------------------------------------------
// 4. PORT SCENE (Malé Commercial Port & Addu Regional Port)
// -------------------------------------------------------------
function renderPortScene(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  feed: CCTVFeed,
  showBoundingBoxes: boolean
) {
  ctx.fillStyle = '#07111c';
  ctx.fillRect(0, 0, w, h);

  // Harbor Basin Water
  ctx.fillStyle = '#082f49';
  ctx.fillRect(0, h * 0.42, w, h * 0.58);

  // Quayside Dock Pier
  ctx.fillStyle = '#334155';
  ctx.fillRect(0, h * 0.65, w * 0.45, h * 0.35);

  // High Gantry Container Crane
  ctx.strokeStyle = '#f97316';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(w * 0.12, h * 0.65);
  ctx.lineTo(w * 0.15, h * 0.15);
  ctx.lineTo(w * 0.28, h * 0.15);
  ctx.lineTo(w * 0.32, h * 0.65);
  ctx.stroke();

  // Crane Boom extending over water
  ctx.beginPath();
  ctx.moveTo(w * 0.08, h * 0.20);
  ctx.lineTo(w * 0.52, h * 0.20);
  ctx.stroke();

  // Cargo Freighter / Container Ship Hull in berth
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.moveTo(w * 0.42, h * 0.52);
  ctx.lineTo(w * 0.88, h * 0.52);
  ctx.lineTo(w * 0.82, h * 0.68);
  ctx.lineTo(w * 0.45, h * 0.68);
  ctx.closePath();
  ctx.fill();

  // Containers stacked on ship
  const colors = ['#dc2626', '#2563eb', '#16a34a', '#d97706'];
  for (let ci = 0; ci < 6; ci++) {
    ctx.fillStyle = colors[ci % colors.length];
    ctx.fillRect(w * 0.48 + ci * 24, h * 0.44, 20, 10);
    ctx.fillRect(w * 0.50 + ci * 24, h * 0.35, 20, 10);
  }

  if (showBoundingBoxes) {
    renderTargetBox(
      ctx,
      w * 0.42,
      h * 0.32,
      w * 0.46,
      h * 0.38,
      'VESSEL: MSC MALDIVES',
      'BERTH 01 // MOORED',
      '#f97316'
    );
  }
}

// -------------------------------------------------------------
// 5. METRO SCENE (Hulhumalé Smart City)
// -------------------------------------------------------------
function renderMetroScene(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  feed: CCTVFeed,
  showBoundingBoxes: boolean
) {
  ctx.fillStyle = '#090e17';
  ctx.fillRect(0, 0, w, h);

  // Boulevard & Trees
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, h * 0.55, w, h * 0.45);

  // Modern smart buildings
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(w * 0.1, h * 0.2, 80, h * 0.35);
  ctx.fillRect(w * 0.3, h * 0.15, 110, h * 0.40);
  ctx.fillRect(w * 0.6, h * 0.25, 90, h * 0.30);

  // Window grid
  ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
  for (let wx = w * 0.32; wx < w * 0.46; wx += 16) {
    for (let wy = h * 0.2; wy < h * 0.5; wy += 14) {
      ctx.fillRect(wx, wy, 8, 6);
    }
  }

  // Pedestrian & vehicle detection
  renderVehicle(ctx, w * 0.45, h * 0.72, t, 'car', showBoundingBoxes, 'SMART-TRANSIT #08', '35 KM/H');
}

// -------------------------------------------------------------
// HELPER DRAWING UTILITIES
// -------------------------------------------------------------

function renderBoat(ctx: CanvasRenderingContext2D, x: number, y: number, t: number) {
  ctx.save();
  ctx.translate(x, y);

  // Hull
  ctx.fillStyle = '#f8fafc';
  ctx.beginPath();
  ctx.moveTo(0, 4);
  ctx.lineTo(28, 4);
  ctx.lineTo(24, 12);
  ctx.lineTo(4, 12);
  ctx.closePath();
  ctx.fill();

  // Blue waterline stripe
  ctx.fillStyle = '#0284c7';
  ctx.fillRect(3, 10, 22, 2);

  // Cabin
  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(8, -4, 14, 8);

  // Navigation light (green starboard)
  ctx.fillStyle = '#22c55e';
  ctx.beginPath();
  ctx.arc(26, 4, 1.5, 0, Math.PI * 2);
  ctx.fill();

  // Water Wake
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-5, 10);
  ctx.lineTo(-25, 14);
  ctx.moveTo(-5, 12);
  ctx.lineTo(-22, 8);
  ctx.stroke();

  ctx.restore();
}

function renderVehicle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  t: number,
  type: 'car' | 'moto',
  showBox: boolean,
  tag: string,
  speed: string
) {
  ctx.save();
  ctx.translate(x, y);

  if (type === 'car') {
    // Car body
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(-12, -8, 24, 14);
    // Windshield
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-8, -6, 16, 5);
    // Headlights
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(-10, 5, 4, 3);
    ctx.fillRect(6, 5, 4, 3);
  } else {
    // Motorbike
    ctx.fillStyle = '#f43f5e';
    ctx.fillRect(-3, -6, 6, 12);
    // Headlight
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(-2, 4, 4, 2);
  }

  ctx.restore();

  if (showBox) {
    const boxW = type === 'car' ? 32 : 18;
    const boxH = type === 'car' ? 24 : 20;
    renderTargetBox(ctx, x - boxW / 2, y - boxH / 2, boxW, boxH, tag, speed, '#38bdf8');
  }
}

function renderAircraft(ctx: CanvasRenderingContext2D, x: number, y: number, t: number) {
  ctx.save();
  ctx.translate(x, y);

  // Fuselage
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(-20, -3, 40, 6);

  // Wings
  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(-4, -18, 8, 36);

  // Tail
  ctx.fillStyle = '#dc2626';
  ctx.fillRect(-18, -8, 6, 16);

  // Strobe beacon (pulsing red/white)
  if (Math.floor(t * 4) % 2 === 0) {
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(0, 0, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function renderTargetBox(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  title: string,
  data: string,
  color: string
) {
  const bracket = 5;

  ctx.strokeStyle = color;
  ctx.lineWidth = 1.2;

  // Corner brackets
  ctx.beginPath();
  // Top-left
  ctx.moveTo(x, y + bracket);
  ctx.lineTo(x, y);
  ctx.lineTo(x + bracket, y);
  // Top-right
  ctx.moveTo(x + w - bracket, y);
  ctx.lineTo(x + w, y);
  ctx.lineTo(x + w, y + bracket);
  // Bottom-left
  ctx.moveTo(x, y + h - bracket);
  ctx.lineTo(x, y + h);
  ctx.lineTo(x + bracket, y + h);
  // Bottom-right
  ctx.moveTo(x + w - bracket, y + h);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x + w, y + h - bracket);
  ctx.stroke();

  // AI Classification Tag
  ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
  ctx.fillRect(x, y - 11, Math.max(w, 75), 10);

  ctx.fillStyle = color;
  ctx.font = 'bold 7px monospace';
  ctx.fillText(title, x + 2, y - 3);

  if (data) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.font = '6px monospace';
    ctx.fillText(data, x + 2, y + h + 8);
  }
}

function renderSensorNoise(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  nightVision: boolean
) {
  // CCTV Raster Scanlines
  ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
  for (let y = 0; y < h; y += 3) {
    ctx.fillRect(0, y, w, 1);
  }

  // Rolling CRT scan bar
  const scanY = (t * 40) % h;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
  ctx.fillRect(0, scanY, w, 8);

  // Subtle digital sensor grain
  const imgData = ctx.getImageData(0, 0, w, h);
  const data = imgData.data;
  const grainAmount = nightVision ? 18 : 6;

  for (let i = 0; i < data.length; i += 4 * 7) {
    const noise = (Math.random() - 0.5) * grainAmount;
    data[i] = Math.min(255, Math.max(0, data[i] + noise));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
  }
  ctx.putImageData(imgData, 0, 0);
}
