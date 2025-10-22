/**
 * Main Entry Point
 * Clean Code Architecture - Modular Design
 *
 * Project Structure:
 * - components/ : Reusable UI components (TabManager)
 * - utils/      : Utility classes (ImageProcessor, HistogramAnalyzer, ChartHelper)
 * - features/   : Feature modules (PixelReader, HistogramFeature)
 *
 * This modular architecture follows SOLID principles:
 * - Single Responsibility: Each class has one clear purpose
 * - Open/Closed: Easy to extend with new features
 * - Dependency Inversion: Features depend on abstractions (utils)
 */

import "./style.css";
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend
);

// Import Components
import { TabManager } from "./components/tabManager.js";

// Import Features
import { PixelReader } from "./features/pixelReader.js";

// Initialize the application
console.log("🎨 Image Processing App - Clean Code Architecture");
console.log("📁 Modular structure loaded:");
console.log("  ✓ Components: TabManager");
console.log("  ✓ Utils: ImageProcessor, HistogramAnalyzer, ChartHelper");
console.log("  ✓ Features: PixelReader, HistogramFeature");

// Initialize Tab Manager
new TabManager();

// Initialize Main Application
const app = new PixelReader();

// Make app globally accessible for onclick handlers
window.app = app;

console.log("✅ Application initialized successfully!");
console.log(
  "Features: Pixel Data, Histogram, Grayscale, Binary, Brightness, Arithmetic, Boolean, Geometry"
);
