/**
 * ChartHelper Utility
 * Provides Chart.js configuration and helper functions
 */
import { Chart } from "chart.js";

export class ChartHelper {
  /**
   * Create RGB histogram chart
   * @param {HTMLCanvasElement} canvas - Canvas element
   * @param {Object} rgbHist - RGB histogram data
   * @returns {Chart} Chart instance
   */
  static createRGBHistogramChart(canvas, rgbHist) {
    const ctx = canvas.getContext("2d");
    const labels = Array.from({ length: 256 }, (_, i) => i);

    return new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Red",
            data: rgbHist.r,
            borderColor: "rgba(239, 68, 68, 0.8)",
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            borderWidth: 1,
            pointRadius: 0,
            fill: true,
          },
          {
            label: "Green",
            data: rgbHist.g,
            borderColor: "rgba(34, 197, 94, 0.8)",
            backgroundColor: "rgba(34, 197, 94, 0.1)",
            borderWidth: 1,
            pointRadius: 0,
            fill: true,
          },
          {
            label: "Blue",
            data: rgbHist.b,
            borderColor: "rgba(59, 130, 246, 0.8)",
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            borderWidth: 1,
            pointRadius: 0,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 2.5,
        plugins: {
          title: {
            display: true,
            text: "RGB Histogram",
            font: { size: 16, weight: "bold" },
          },
          legend: {
            display: true,
            position: "top",
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: "Intensity (0-255)",
            },
          },
          y: {
            title: {
              display: true,
              text: "Frequency",
            },
          },
        },
      },
    });
  }

  /**
   * Create grayscale histogram chart
   * @param {HTMLCanvasElement} canvas - Canvas element
   * @param {Array} grayHist - Grayscale histogram data
   * @returns {Chart} Chart instance
   */
  static createGrayscaleHistogramChart(canvas, grayHist) {
    const ctx = canvas.getContext("2d");
    const labels = Array.from({ length: 256 }, (_, i) => i);

    return new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Grayscale",
            data: grayHist,
            borderColor: "rgba(100, 116, 139, 0.8)",
            backgroundColor: "rgba(100, 116, 139, 0.3)",
            borderWidth: 2,
            pointRadius: 0,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 2.5,
        plugins: {
          title: {
            display: true,
            text: "Grayscale Histogram",
            font: { size: 16, weight: "bold" },
          },
          legend: {
            display: false,
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: "Intensity (0-255)",
            },
          },
          y: {
            title: {
              display: true,
              text: "Frequency",
            },
          },
        },
      },
    });
  }

  /**
   * Create simple histogram chart
   * @param {HTMLCanvasElement} canvas - Canvas element
   * @param {Array} histData - Histogram data
   * @param {string} title - Chart title
   * @returns {Chart} Chart instance
   */
  static createSimpleHistogramChart(canvas, histData, title) {
    const ctx = canvas.getContext("2d");
    const labels = Array.from({ length: 256 }, (_, i) => i);

    return new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Frequency",
            data: histData,
            borderColor: "rgba(100, 116, 139, 0.8)",
            backgroundColor: "rgba(100, 116, 139, 0.3)",
            borderWidth: 2,
            pointRadius: 0,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 2,
        plugins: {
          title: {
            display: true,
            text: title,
            font: { size: 14, weight: "bold" },
          },
          legend: {
            display: false,
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: "Intensity",
              font: { size: 11 },
            },
          },
          y: {
            title: {
              display: true,
              text: "Frequency",
              font: { size: 11 },
            },
          },
        },
      },
    });
  }

  /**
   * Destroy chart if exists
   * @param {Chart} chart - Chart instance to destroy
   */
  static destroyChart(chart) {
    if (chart) {
      chart.destroy();
    }
  }
}
