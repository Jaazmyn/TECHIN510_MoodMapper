import React, { useState, useRef } from 'react';
import { FaDownload, FaTimes, FaPlay } from 'react-icons/fa';
import './SummaryButton.css';

const SummaryButton = ({ planets, journeyPhotos }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [summaryImage, setSummaryImage] = useState(null);
  const canvasRef = useRef(null);

  const generateSummary = async () => {
    setIsGenerating(true);
    
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      
      const canvasWidth = 800;
      const canvasHeight = 600;
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      // Define layout dimensions
      const separatorX = canvasWidth * 0.6; // 60% for left, 40% for right
      const leftSectionWidth = separatorX;
      const rightSectionWidth = canvasWidth - separatorX;
      const padding = 40; // Horizontal padding

      // Draw background
      await drawBackground(ctx, canvasWidth, canvasHeight);

      // --- Left Section: Title + Orbit + Planets ---

      // Draw title with different font sizes
      ctx.fillStyle = 'white';
      ctx.textAlign = 'left';

      // Main title text
      ctx.font = 'bold 36px "Ledger", serif';
      const titleLines = ["Travel", "Around", "2025"];
      const lineHeight = 40;
      const startY = 80;
      titleLines.forEach((line, index) => {
        ctx.fillText(line, padding, startY + index * lineHeight);
      });

      // User name with smaller and thinner font
      ctx.font = '300 20px "Ledger", serif'; // Reduced size and made thinner
      ctx.fillText('User Name', padding, startY + 3 * lineHeight);

      // Draw tilted elliptical orbit and planets
      // Orbit parameters - adjusted for top-right to bottom-left orientation
      const orbitCenterX = leftSectionWidth / 2;
      const orbitCenterY = canvasHeight * 0.6;
      const orbitRadiusX = 200;
      const orbitRadiusY = 120;
      const orbitTiltAngle = -Math.PI / 4; // -45 degrees for top-right to bottom-left

      // Add ambient glow around orbit
      ctx.beginPath();
      ctx.ellipse(orbitCenterX, orbitCenterY, orbitRadiusX, orbitRadiusY, orbitTiltAngle, 0, 2 * Math.PI);
      ctx.strokeStyle = 'rgba(120, 180, 255, 0.15)';
      ctx.lineWidth = 4;
      ctx.stroke();
      
      // Draw main orbit line
      ctx.beginPath();
      ctx.ellipse(orbitCenterX, orbitCenterY, orbitRadiusX, orbitRadiusY, orbitTiltAngle, 0, 2 * Math.PI);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Draw planets on orbit with varied size and asymmetry
      const planetsToDraw = planets.slice(0, 8);
      planetsToDraw.forEach((planet, index) => {
        let angle;
        if (planetsToDraw.length <= 1) {
          angle = Math.PI / 2;
        } else {
          const baseAngle = (index / planetsToDraw.length) * Math.PI * 2;
          const asymmetryFactor = Math.sin(baseAngle * 2) * 0.2;
          angle = baseAngle + asymmetryFactor;
        }

        const x = orbitCenterX + orbitRadiusX * Math.cos(angle) * Math.cos(orbitTiltAngle) - orbitRadiusY * Math.sin(angle) * Math.sin(orbitTiltAngle);
        const y = orbitCenterY + orbitRadiusX * Math.cos(angle) * Math.sin(orbitTiltAngle) + orbitRadiusY * Math.sin(angle) * Math.cos(orbitTiltAngle);

        const size = 20 + Math.sin(angle * 2) * 10 + (index % 2) * 5;
        drawPlanet(ctx, x, y, size, planet.color);
      });

      // --- Right Section: Featured Journeys ---

      // Draw vertical separator line
      const firstPhotoY = 60;
      const tripHeight = 180;
      const separatorTop = firstPhotoY;
      const separatorBottom = firstPhotoY + 3 * tripHeight - (tripHeight - 100) + 25;

      ctx.beginPath();
      ctx.moveTo(separatorX, separatorTop);
      ctx.lineTo(separatorX, separatorBottom);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Draw three trips on the right with adjusted photo dimensions
      const featuredTrips = planets.slice(0, 3);
      const startX = separatorX + padding; // Using the same padding as left section
      const startYTrips = firstPhotoY;
      const tripSpacingY = tripHeight;
      const photoWidth = 200;
      const photoHeight = 127;

      for (let i = 0; i < featuredTrips.length; i++) {
        const trip = featuredTrips[i];
        const y = startYTrips + i * tripSpacingY;

        // Draw photo with new dimensions
        const photo = journeyPhotos[planets.indexOf(trip)];
        if (photo) {
          const img = new Image();
          img.src = typeof photo === 'string' ? photo : URL.createObjectURL(photo);
          await new Promise((resolve, reject) => {
            img.onload = () => {
              // Calculate dimensions to maintain aspect ratio
              const aspectRatio = img.width / img.height;
              let drawWidth = photoWidth;
              let drawHeight = photoHeight;
              
              if (aspectRatio > photoWidth / photoHeight) {
                // Image is wider than target ratio
                drawHeight = photoWidth / aspectRatio;
              } else {
                // Image is taller than target ratio
                drawWidth = photoHeight * aspectRatio;
              }
              
              // Center the image in the target area
              const xOffset = startX + (photoWidth - drawWidth) / 2;
              const yOffset = y + (photoHeight - drawHeight) / 2;
              
              ctx.drawImage(img, xOffset, yOffset, drawWidth, drawHeight);
              resolve();
            };
            img.onerror = reject;
          });
        } else {
          // Draw gray placeholder box
          ctx.fillStyle = '#e0e0e0';
          ctx.fillRect(startX, y, photoWidth, photoHeight);
        }

        // Draw title below photo with smaller font
        ctx.fillStyle = 'white';
        ctx.font = '16px "Ledger", serif';
        ctx.textAlign = 'left';
        ctx.fillText(trip.title, startX, y + photoHeight + 25);
      }

      const imageUrl = canvas.toDataURL('image/png');
      setSummaryImage(imageUrl);
    } catch (error) {
      console.error('Error generating summary:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const drawBackground = async (ctx, width, height) => {
    // Draw radial gradient with more natural color stops
    const radialGradient = ctx.createRadialGradient(
      width * 0.6, height * 0.4, 0,
      width * 0.6, height * 0.4, Math.max(width, height) * 0.8
    );
    radialGradient.addColorStop(0, 'rgba(255, 140, 60, 0.15)');
    radialGradient.addColorStop(0.2, 'rgba(40, 80, 180, 0.12)');
    radialGradient.addColorStop(0.4, 'rgba(0, 30, 60, 0.5)');
    radialGradient.addColorStop(0.7, '#0a0a2a');
    radialGradient.addColorStop(1, '#000');
    
    ctx.fillStyle = radialGradient;
    ctx.fillRect(0, 0, width, height);

    // Add a subtle linear gradient overlay
    const linearGradient = ctx.createLinearGradient(0, 0, width, height);
    linearGradient.addColorStop(0, 'rgba(10, 10, 42, 0.8)');
    linearGradient.addColorStop(0.4, 'rgba(26, 34, 63, 0.6)');
    linearGradient.addColorStop(0.7, 'rgba(46, 46, 56, 0.7)');
    linearGradient.addColorStop(1, 'rgba(10, 10, 42, 0.8)');
    
    ctx.fillStyle = linearGradient;
    ctx.globalCompositeOperation = 'soft-light';
    ctx.fillRect(0, 0, width, height);
    ctx.globalCompositeOperation = 'source-over';

    // Add stars with varying sizes - reduced count and smaller size
    const starCount = 700; // Reduced from 2000 to about 1/3
    for (let i = 0; i < starCount; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      // Create a distribution of star sizes - all sizes reduced
      const size = Math.random() < 0.1 ? Math.random() * 1 + 0.5 : // 10% chance of larger stars
                  Math.random() < 0.3 ? Math.random() * 0.5 + 0.3 : // 30% chance of medium stars
                  Math.random() * 0.3; // 60% chance of small stars
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'; // More transparent stars
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const drawPlanet = (ctx, x, y, size, planetClass) => {
    const gradient = ctx.createRadialGradient(
      x - size/3, y - size/3, 0,
      x, y, size
    );
    
    const colors = getPlanetGradient(planetClass);
    colors.forEach((color, i) => {
      gradient.addColorStop(i / (colors.length - 1), color);
    });
    
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Add glow
    ctx.shadowColor = 'rgba(120, 180, 255, 0.4)'; // Adjusted glow color
    ctx.shadowBlur = size * 0.8; // Adjusted glow blur
    ctx.fill(); // Apply shadow
    ctx.shadowBlur = 0; // Reset shadow
  };

  const getPlanetGradient = (planetClass) => {
    const gradients = {
      'planet-1': ['#a5d8ff', '#74c0fc', '#339af0'],
      'planet-2': ['#b2f2bb', '#8ce99a', '#69db7c'],
      'planet-3': ['#ffd8a8', '#ffd43b', '#fcc419'],
      'planet-4': ['#d0ebff', '#a5d8ff', '#74c0fc'],
      'planet-5': ['#c3fae8', '#96f2d7', '#63e6be'],
      'planet-6': ['#eebefa', '#da77f2', '#cc5de8'],
      'planet-7': ['#ffd8a8', '#ffd43b', '#fcc419', '#fab005', '#f59f00'],
      'planet-8': ['#a5d8ff', '#74c0fc', '#4dabf7', '#339af0', '#228be6', '#1c7ed6']
    };
    if (typeof planetClass === 'number') {
         return gradients[`planet-${(planetClass % 8) + 1}`] || gradients['planet-1'];
    }
    return gradients[planetClass] || ['#ffffff', '#cccccc', '#999999'];
  };

  const downloadSummary = () => {
    if (!summaryImage) return;
    
    const link = document.createElement('a');
    link.download = 'journey-summary.png';
    link.href = summaryImage;
    link.click();
  };

  const closeSummary = () => {
    setSummaryImage(null);
  };

  return (
    <div className="summary-container">
      <button 
        className="summary-btn"
        onClick={generateSummary}
        disabled={isGenerating}
      >
        <FaPlay className="summary-play-icon" />
      </button>
      
      {summaryImage && (
        <div className="summary-overlay">
          <div className="summary-content">
            <img src={summaryImage} alt="Journey Summary" />
            <div className="summary-actions">
              <button onClick={downloadSummary}>
                <FaDownload /> Download
              </button>
              <button onClick={closeSummary}>
                <FaTimes /> Close
              </button>
            </div>
          </div>
        </div>
      )}
      <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
    </div>
  );
};

export default SummaryButton; 