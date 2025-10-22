/**
 * HistogramFeature
 * Handles histogram visualization and analysis
 */
import { HistogramAnalyzer } from "../utils/histogramAnalyzer.js";
import { ChartHelper } from "../utils/chartHelper.js";

export class HistogramFeature {
  constructor(processor) {
    this.processor = processor;
    this.charts = {
      rgbHist: null,
      grayHist: null,
      beforeEqHist: null,
      afterEqHist: null,
    };
    this.rgbHistData = null;
    this.grayHistData = null;
    this.initEventListeners();
  }

  initEventListeners() {
    document
      .getElementById("toggleRGBData")
      .addEventListener("click", () => this.toggleHistogramData("RGB"));
    document
      .getElementById("toggleGrayData")
      .addEventListener("click", () => this.toggleHistogramData("Gray"));
    document
      .getElementById("detectThreshold")
      .addEventListener("click", () => this.detectAndApplyThreshold());
    document
      .getElementById("applyEqualization")
      .addEventListener("click", () => this.applyHistogramEqualization());
  }

  /**
   * Generate all histograms
   */
  generateHistograms() {
    if (!this.processor) {
      alert("Upload gambar terlebih dahulu!");
      return;
    }

    const imageData = this.processor.getImageData();
    const analyzer = new HistogramAnalyzer(imageData);

    // Generate RGB Histogram
    const rgbHist = analyzer.calculateRGBHistogram();
    this.displayRGBHistogram(rgbHist);

    // Calculate and display RGB stats
    const statsR = analyzer.calculateStats(rgbHist.r);
    const statsG = analyzer.calculateStats(rgbHist.g);
    const statsB = analyzer.calculateStats(rgbHist.b);

    document.getElementById("meanR").textContent = statsR.mean;
    document.getElementById("stdR").textContent = statsR.stdDev;
    document.getElementById("meanG").textContent = statsG.mean;
    document.getElementById("stdG").textContent = statsG.stdDev;
    document.getElementById("meanB").textContent = statsB.mean;
    document.getElementById("stdB").textContent = statsB.stdDev;

    this.rgbHistData = rgbHist;

    // Generate Grayscale Histogram
    const grayHist = analyzer.calculateGrayscaleHistogram();
    this.displayGrayscaleHistogram(grayHist);

    // Calculate and display grayscale stats
    const statsGray = analyzer.calculateStats(grayHist);
    document.getElementById("meanGray").textContent = statsGray.mean;
    document.getElementById("stdGray").textContent = statsGray.stdDev;

    this.grayHistData = grayHist;
  }

  /**
   * Display RGB histogram chart
   */
  displayRGBHistogram(rgbHist) {
    const canvas = document.getElementById("histogramRGB");
    ChartHelper.destroyChart(this.charts.rgbHist);
    this.charts.rgbHist = ChartHelper.createRGBHistogramChart(canvas, rgbHist);
  }

  /**
   * Display grayscale histogram chart
   */
  displayGrayscaleHistogram(grayHist) {
    const canvas = document.getElementById("histogramGray");
    ChartHelper.destroyChart(this.charts.grayHist);
    this.charts.grayHist = ChartHelper.createGrayscaleHistogramChart(
      canvas,
      grayHist
    );
  }

  /**
   * Toggle histogram data table visibility
   */
  toggleHistogramData(type) {
    if (type === "RGB") {
      const dataDiv = document.getElementById("histogramRGBData");
      const button = document.getElementById("toggleRGBData");

      if (dataDiv.classList.contains("hidden")) {
        this.displayHistogramDataTable(
          this.rgbHistData,
          "histogramRGBData",
          "RGB"
        );
        dataDiv.classList.remove("hidden");
        button.textContent = "🔼 Sembunyikan Data Histogram RGB";
      } else {
        dataDiv.classList.add("hidden");
        button.textContent = "📊 Tampilkan Data Histogram RGB";
      }
    } else if (type === "Gray") {
      const dataDiv = document.getElementById("histogramGrayData");
      const button = document.getElementById("toggleGrayData");

      if (dataDiv.classList.contains("hidden")) {
        this.displayHistogramDataTable(
          { gray: this.grayHistData },
          "histogramGrayData",
          "Grayscale"
        );
        dataDiv.classList.remove("hidden");
        button.textContent = "🔼 Sembunyikan Data Histogram Grayscale";
      } else {
        dataDiv.classList.add("hidden");
        button.textContent = "📊 Tampilkan Data Histogram Grayscale";
      }
    }
  }

  /**
   * Display histogram data as table
   */
  displayHistogramDataTable(histData, targetId, type) {
    const targetDiv = document.getElementById(targetId);
    let html = "<table><thead><tr><th>Intensity</th>";

    if (type === "RGB") {
      html += "<th>Red</th><th>Green</th><th>Blue</th>";
    } else {
      html += "<th>Frequency</th>";
    }

    html += "</tr></thead><tbody>";

    for (let i = 0; i < 256; i++) {
      html += `<tr><td>${i}</td>`;

      if (type === "RGB") {
        html += `<td>${histData.r[i]}</td><td>${histData.g[i]}</td><td>${histData.b[i]}</td>`;
      } else {
        html += `<td>${histData.gray[i]}</td>`;
      }

      html += "</tr>";
    }

    html += "</tbody></table>";
    targetDiv.innerHTML = html;
  }

  /**
   * Detect threshold and apply binary conversion
   */
  detectAndApplyThreshold() {
    if (!this.grayHistData) {
      alert("Generate histogram terlebih dahulu!");
      return;
    }

    const imageData = this.processor.getImageData();
    const analyzer = new HistogramAnalyzer(imageData);

    const result = analyzer.detectTwoPeaks(this.grayHistData);

    // Display hasil deteksi
    document.getElementById("peak1Value").textContent =
      result.peak1.value.toFixed(0);
    document.getElementById("peak1Intensity").textContent =
      result.peak1.intensity;
    document.getElementById("peak2Value").textContent =
      result.peak2.value.toFixed(0);
    document.getElementById("peak2Intensity").textContent =
      result.peak2.intensity;
    document.getElementById("optimalThreshold").textContent = result.threshold;

    document.getElementById("thresholdResult").style.display = "block";

    // Apply binary dengan threshold otomatis
    const binaryData = this.processor.toBinary(result.threshold);
    const canvas = document.getElementById("binaryAutoCanvas");
    this.processor.drawToCanvas(binaryData, canvas);

    console.log(
      `✅ Threshold otomatis terdeteksi: ${result.threshold} (Peak1: ${result.peak1.intensity}, Peak2: ${result.peak2.intensity})`
    );
  }

  /**
   * Apply histogram equalization
   */
  applyHistogramEqualization() {
    if (!this.processor) {
      alert("Upload gambar terlebih dahulu!");
      return;
    }

    const imageData = this.processor.getImageData();
    const analyzer = new HistogramAnalyzer(imageData);

    // Before equalization
    const beforeCanvas = document.getElementById("beforeEqCanvas");
    beforeCanvas.width = imageData.width;
    beforeCanvas.height = imageData.height;
    const beforeCtx = beforeCanvas.getContext("2d");

    // Convert to grayscale first
    const grayImageData = this.processor.toGrayscale();
    beforeCtx.putImageData(grayImageData, 0, 0);

    const beforeAnalyzer = new HistogramAnalyzer(grayImageData);
    const beforeHist = beforeAnalyzer.calculateGrayscaleHistogram();
    const beforeStats = beforeAnalyzer.calculateStats(beforeHist);

    document.getElementById("beforeMean").textContent = beforeStats.mean;
    document.getElementById("beforeStd").textContent = beforeStats.stdDev;

    // Display before histogram
    ChartHelper.destroyChart(this.charts.beforeEqHist);
    this.charts.beforeEqHist = ChartHelper.createSimpleHistogramChart(
      document.getElementById("beforeEqHist"),
      beforeHist,
      "Before Equalization"
    );

    // After equalization
    const afterImageData = beforeAnalyzer.equalizeHistogram();
    const afterCanvas = document.getElementById("afterEqCanvas");
    afterCanvas.width = afterImageData.width;
    afterCanvas.height = afterImageData.height;
    const afterCtx = afterCanvas.getContext("2d");
    afterCtx.putImageData(afterImageData, 0, 0);

    const afterAnalyzer = new HistogramAnalyzer(afterImageData);
    const afterHist = afterAnalyzer.calculateGrayscaleHistogram();
    const afterStats = afterAnalyzer.calculateStats(afterHist);

    document.getElementById("afterMean").textContent = afterStats.mean;
    document.getElementById("afterStd").textContent = afterStats.stdDev;

    // Display after histogram
    ChartHelper.destroyChart(this.charts.afterEqHist);
    this.charts.afterEqHist = ChartHelper.createSimpleHistogramChart(
      document.getElementById("afterEqHist"),
      afterHist,
      "After Equalization"
    );

    console.log("✅ Histogram Equalization berhasil diterapkan!");
    console.log(
      `Before - Mean: ${beforeStats.mean}, Std: ${beforeStats.stdDev}`
    );
    console.log(`After - Mean: ${afterStats.mean}, Std: ${afterStats.stdDev}`);
  }
}
