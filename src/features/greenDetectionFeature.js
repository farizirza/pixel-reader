/**
 * Green Detection Feature
 * Detects green vegetation/trees from satellite images using HSV color space
 */
import { HSVAnalyzer } from "../utils/hsvAnalyzer.js";
import { ChartHelper } from "../utils/chartHelper.js";
import {
  Chart,
  DoughnutController,
  ArcElement,
  Tooltip,
  Legend,
  Title,
} from "chart.js";

// Register Chart.js components for doughnut chart
Chart.register(DoughnutController, ArcElement, Tooltip, Legend, Title);

export class GreenDetectionFeature {
  constructor(imageProcessor) {
    this.imageProcessor = imageProcessor;
    this.detectionResults = null;
    this.chart = null;
    this.init();
  }

  init() {
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Green Detection buttons
    document
      .getElementById("detectGreenButton")
      ?.addEventListener("click", () => this.detectGreen());

    document
      .getElementById("resetGreenButton")
      ?.addEventListener("click", () => this.resetGreenDetection());

    // Slider controls for HSV ranges
    document.getElementById("greenHueMin")?.addEventListener("input", (e) => {
      document.getElementById("greenHueMinValue").textContent = e.target.value;
      if (this.detectionResults) this.updateGreenDetection();
    });

    document.getElementById("greenHueMax")?.addEventListener("input", (e) => {
      document.getElementById("greenHueMaxValue").textContent = e.target.value;
      if (this.detectionResults) this.updateGreenDetection();
    });

    document.getElementById("greenSatMin")?.addEventListener("input", (e) => {
      document.getElementById("greenSatMinValue").textContent = e.target.value;
      if (this.detectionResults) this.updateGreenDetection();
    });

    document.getElementById("greenValueMin")?.addEventListener("input", (e) => {
      document.getElementById("greenValueMinValue").textContent =
        e.target.value;
      if (this.detectionResults) this.updateGreenDetection();
    });
  }

  detectGreen() {
    if (!this.imageProcessor) {
      alert("Upload gambar terlebih dahulu!");
      return;
    }

    // Get HSV parameters from UI
    const options = {
      hueMin: parseInt(document.getElementById("greenHueMin").value),
      hueMax: parseInt(document.getElementById("greenHueMax").value),
      saturationMin: parseInt(document.getElementById("greenSatMin").value),
      valueMin: parseInt(document.getElementById("greenValueMin").value),
      colorOutput: true,
    };

    // Get original image data
    const originalImageData = this.imageProcessor.getImageData();

    // Detect green pixels
    const binaryResult = HSVAnalyzer.detectGreen(originalImageData, {
      ...options,
      colorOutput: false,
    });

    const colorResult = HSVAnalyzer.detectGreen(originalImageData, {
      ...options,
      colorOutput: true,
    });

    // Analyze statistics
    const statistics = HSVAnalyzer.analyzeGreenStatistics(
      originalImageData,
      options
    );

    this.detectionResults = {
      originalImageData,
      binaryResult,
      colorResult,
      statistics,
      options,
    };

    // Draw results
    this.drawResults();
    this.displayStatistics();
    this.generateChart();
  }

  updateGreenDetection() {
    if (!this.detectionResults) return;

    // Update options
    this.detectionResults.options = {
      hueMin: parseInt(document.getElementById("greenHueMin").value),
      hueMax: parseInt(document.getElementById("greenHueMax").value),
      saturationMin: parseInt(document.getElementById("greenSatMin").value),
      valueMin: parseInt(document.getElementById("greenValueMin").value),
      colorOutput: true,
    };

    // Re-detect with new parameters
    const binaryResult = HSVAnalyzer.detectGreen(
      this.detectionResults.originalImageData,
      {
        ...this.detectionResults.options,
        colorOutput: false,
      }
    );

    const colorResult = HSVAnalyzer.detectGreen(
      this.detectionResults.originalImageData,
      {
        ...this.detectionResults.options,
        colorOutput: true,
      }
    );

    // Update statistics
    const statistics = HSVAnalyzer.analyzeGreenStatistics(
      this.detectionResults.originalImageData,
      this.detectionResults.options
    );

    this.detectionResults.binaryResult = binaryResult;
    this.detectionResults.colorResult = colorResult;
    this.detectionResults.statistics = statistics;

    // Update display
    this.drawResults();
    this.displayStatistics();
    this.generateChart();
  }

  drawResults() {
    if (!this.detectionResults) return;

    const binaryCanvas = document.getElementById("greenBinaryCanvas");
    const colorCanvas = document.getElementById("greenColorCanvas");

    if (binaryCanvas) {
      this.imageProcessor.drawToCanvas(
        this.detectionResults.binaryResult,
        binaryCanvas
      );
    }

    if (colorCanvas) {
      this.imageProcessor.drawToCanvas(
        this.detectionResults.colorResult,
        colorCanvas
      );
    }
  }

  displayStatistics() {
    if (!this.detectionResults) return;

    const stats = this.detectionResults.statistics;

    // Update statistics display
    document.getElementById("greenPixelsCount").textContent =
      stats.greenPixels.toLocaleString();
    document.getElementById("totalPixelsCount").textContent =
      stats.totalPixels.toLocaleString();
    document.getElementById("greenPercentage").textContent =
      stats.greenPercentage + "%";
    document.getElementById("nonGreenPercentage").textContent =
      (100 - parseFloat(stats.greenPercentage)).toFixed(2) + "%";

    document.getElementById("avgHueGreen").textContent = stats.avgHue + "°";
    document.getElementById("avgSaturationGreen").textContent =
      stats.avgSaturation + "%";
    document.getElementById("avgValueGreen").textContent = stats.avgValue + "%";

    // Update slider descriptions
    const hueMin = this.detectionResults.options.hueMin;
    const hueMax = this.detectionResults.options.hueMax;
    const satMin = this.detectionResults.options.saturationMin;
    const valMin = this.detectionResults.options.valueMin;

    document.getElementById(
      "hueRangeDesc"
    ).textContent = `Hue: ${hueMin}° - ${hueMax}°`;
    document.getElementById(
      "saturationDesc"
    ).textContent = `Saturation: >${satMin}%`;
    document.getElementById("valueDesc").textContent = `Value: >${valMin}%`;
  }

  generateChart() {
    if (!this.detectionResults) return;

    const stats = this.detectionResults.statistics;
    const chartData = HSVAnalyzer.createGreenDistributionData(stats);

    const chartContainer = document.getElementById("greenDistributionChart");
    if (!chartContainer) return;

    // Destroy existing chart
    if (this.chart) {
      this.chart.destroy();
    }

    const ctx = chartContainer.getContext("2d");
    this.chart = new Chart(ctx, {
      type: "doughnut",
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              padding: 20,
              font: {
                size: 14,
                weight: "bold",
              },
            },
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                const label = context.label || "";
                const value = context.parsed || 0;
                return label + ": " + value.toFixed(2) + "%";
              },
            },
          },
        },
      },
    });
  }

  resetGreenDetection() {
    // Reset sliders
    document.getElementById("greenHueMin").value = 90;
    document.getElementById("greenHueMinValue").textContent = "90";
    document.getElementById("greenHueMax").value = 180;
    document.getElementById("greenHueMaxValue").textContent = "180";
    document.getElementById("greenSatMin").value = 20;
    document.getElementById("greenSatMinValue").textContent = "20";
    document.getElementById("greenValueMin").value = 10;
    document.getElementById("greenValueMinValue").textContent = "10";

    // Clear canvases
    document.getElementById("greenBinaryCanvas").width = 0;
    document.getElementById("greenColorCanvas").width = 0;

    // Clear statistics
    document.getElementById("greenPixelsCount").textContent = "-";
    document.getElementById("totalPixelsCount").textContent = "-";
    document.getElementById("greenPercentage").textContent = "-";
    document.getElementById("nonGreenPercentage").textContent = "-";
    document.getElementById("avgHueGreen").textContent = "-";
    document.getElementById("avgSaturationGreen").textContent = "-";
    document.getElementById("avgValueGreen").textContent = "-";

    // Destroy chart
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }

    this.detectionResults = null;
  }
}
