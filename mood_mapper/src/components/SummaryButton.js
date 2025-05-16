import React, { useState } from 'react';
import { FaPlay, FaDownload, FaTimes } from 'react-icons/fa';
import './SummaryButton.css';

const SummaryButton = ({ planets, journeyPhotos }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [summaryImage, setSummaryImage] = useState(null);

  const generateSummary = async () => {
    console.log('Starting summary generation...');
    console.log('Planets:', planets);
    console.log('Journey Photos:', journeyPhotos);
    
    setIsGenerating(true);
    
    try {
      // Create a canvas for the summary image
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Set canvas size to match screen dimensions
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      // Draw background mosaic
      await drawBackgroundMosaic(ctx, canvas.width, canvas.height, journeyPhotos);
      
      // Add dark overlay
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw planets and titles
      drawPlanets(ctx, planets, canvas.width, canvas.height);
      
      // Add title
      const currentYear = new Date().getFullYear();
      ctx.fillStyle = 'white';
      const title = `${currentYear} Journey Rewind`;
      
      // Calculate title size to fit
      let fontSize = 32;
      const maxWidth = canvas.width - 160; // Leave 80px margin on each side
      const maxHeight = 100; // Maximum height for title area
      
      // Measure text and adjust font size if needed
      ctx.font = `bold ${fontSize}px Arial`;
      let titleWidth = ctx.measureText(title).width;
      
      // Reduce font size if title is too wide
      while (titleWidth > maxWidth && fontSize > 20) {
        fontSize -= 2;
        ctx.font = `bold ${fontSize}px Arial`;
        titleWidth = ctx.measureText(title).width;
      }
      
      // Center the title horizontally
      const titleX = (canvas.width - titleWidth) / 2;
      
      // Center the title vertically in the top portion of the image
      const titleY = Math.max(fontSize + 20, 60); // Keep it in the top portion but centered
      
      // Draw title with shadow for better visibility
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      ctx.fillText(title, titleX, titleY);
      
      // Reset shadow
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      
      // Convert canvas to image
      const imageUrl = canvas.toDataURL('image/png');
      setSummaryImage(imageUrl);
    } catch (error) {
      console.error('Error generating summary:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const drawBackgroundMosaic = async (ctx, width, height, photos) => {
    if (!photos || photos.length === 0) {
      console.log('No photos to draw');
      return;
    }
    
    const gridSize = 4; // 4x4 grid
    const cellWidth = width / gridSize;
    const cellHeight = height / gridSize;
    
    // If we have fewer photos than grid cells, repeat them
    const totalCells = gridSize * gridSize;
    const repeatedPhotos = [];
    for (let i = 0; i < totalCells; i++) {
      repeatedPhotos.push(photos[i % photos.length]);
    }
    
    console.log('Drawing mosaic with photos:', repeatedPhotos);
    
    // Create a temporary canvas for blur effect
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = width;
    tempCanvas.height = height;
    
    // Draw photos to temporary canvas
    for (let i = 0; i < repeatedPhotos.length; i++) {
      const row = Math.floor(i / gridSize);
      const col = i % gridSize;
      
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      // Handle both File objects and URLs
      const photoSrc = repeatedPhotos[i];
      img.src = typeof photoSrc === 'string' ? photoSrc : URL.createObjectURL(photoSrc);
      
      try {
        await new Promise((resolve, reject) => {
          img.onload = () => {
            tempCtx.drawImage(img, col * cellWidth, row * cellHeight, cellWidth, cellHeight);
            resolve();
          };
          img.onerror = (error) => {
            console.error('Error loading image:', error);
            reject(error);
          };
        });
      } catch (error) {
        console.error('Error drawing image:', error);
      }
    }
    
    // Apply blur effect
    ctx.filter = 'blur(8px)';
    ctx.drawImage(tempCanvas, 0, 0);
    ctx.filter = 'none';
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
    return gradients[planetClass] || ['#ffffff', '#cccccc', '#999999'];
  };

  const drawPlanets = (ctx, planets, canvasWidth, canvasHeight) => {
    console.log('Drawing planets:', planets);
    
    // Calculate spacing based on number of planets
    const totalWidth = canvasWidth - 200; // Leave margins
    const spacing = totalWidth / (planets.length + 1);
    
    planets.forEach((planet, index) => {
      const x = 100 + spacing * (index + 1);
      const y = canvasHeight * 0.4; // Position planets at 40% of canvas height
      const size = 40 + (index % 3) * 10; // Vary planet sizes
      
      // Create gradient for planet
      const gradient = ctx.createRadialGradient(
        x - size/3, y - size/3, 0,
        x, y, size
      );
      
      const colors = getPlanetGradient(planet.color);
      colors.forEach((color, i) => {
        gradient.addColorStop(i / (colors.length - 1), color);
      });
      
      // Draw planet with gradient
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
      
      // Add inner shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = -5;
      ctx.shadowOffsetY = -5;
      ctx.fill();
      
      // Add outer glow
      ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
      ctx.shadowBlur = 20;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      ctx.fill();
      
      // Reset shadow
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      
      // Draw title with wrapping
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      
      // Calculate font size based on title length
      let fontSize = 16;
      ctx.font = `${fontSize}px Arial`;
      let titleWidth = ctx.measureText(planet.title).width;
      
      // Reduce font size if title is too wide
      while (titleWidth > spacing - 20 && fontSize > 12) {
        fontSize -= 1;
        ctx.font = `${fontSize}px Arial`;
        titleWidth = ctx.measureText(planet.title).width;
      }
      
      // Split title into multiple lines if needed
      const maxWidth = spacing - 20;
      const words = planet.title.split(' ');
      let line = '';
      let lines = [];
      
      for (let word of words) {
        const testLine = line + word + ' ';
        const metrics = ctx.measureText(testLine);
        
        if (metrics.width > maxWidth && line !== '') {
          lines.push(line);
          line = word + ' ';
        } else {
          line = testLine;
        }
      }
      lines.push(line);
      
      // Draw each line
      lines.forEach((line, i) => {
        ctx.fillText(line.trim(), x, y + size + 20 + (i * (fontSize + 4)));
      });
    });
  };

  const downloadSummary = () => {
    if (!summaryImage) return;
    
    const link = document.createElement('a');
    link.download = `journey-rewind-${new Date().getFullYear()}.png`;
    link.href = summaryImage;
    link.click();
  };

  const closeSummary = () => {
    setSummaryImage(null);
  };

  return (
    <>
      <button 
        className="summary-fab"
        onClick={generateSummary}
        disabled={isGenerating}
      >
        <FaPlay />
      </button>
      
      {summaryImage && (
        <div className="summary-modal">
          <div className="summary-content">
            <div className="summary-header">
              <h2 className="summary-title">{new Date().getFullYear()} Journey Rewind</h2>
              <div className="summary-actions">
                <button className="icon-button download-icon" onClick={downloadSummary}>
                  <FaDownload />
                </button>
                <button className="icon-button close-icon" onClick={closeSummary}>
                  <FaTimes />
                </button>
              </div>
            </div>
            <img src={summaryImage} alt="Journey Summary" />
          </div>
        </div>
      )}
    </>
  );
};

export default SummaryButton; 