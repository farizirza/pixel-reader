/**
 * Statistical Feature Module
 * Manages UI and logic for statistical analysis
 */
import { StatisticalAnalyzer } from "../utils/statisticalAnalyzer.js";

export class StatisticalFeature {
  constructor(processor) {
    this.processor = processor;
    this.firstImageAnalyzer = null;
    this.firstImageStats = null;
    this.secondImageData = null;
    this.comparisonResults = null;

    this.initEventListeners();
  }

  initEventListeners() {
    // Upload second image for comparison
    const secondImageInput = document.getElementById(
      "statisticalSecondImageInput"
    );
    if (secondImageInput) {
      secondImageInput.addEventListener("change", (e) =>
        this.handleSecondImageUpload(e)
      );
    }

    // Calculate first image statistics
    const calculateBtn = document.getElementById("calculateStatistics");
    if (calculateBtn) {
      calculateBtn.addEventListener("click", () => this.calculateFirstImage());
    }

    // Compare with second image
    const compareBtn = document.getElementById("compareImages");
    if (compareBtn) {
      compareBtn.addEventListener("click", () => this.compareImages());
    }
  }

  /**
   * Format number with appropriate decimal places
   * @param {number} value - Value to format
   * @param {number} decimals - Number of decimal places
   * @returns {string} Formatted value
   */
  formatNumber(value, decimals = 4) {
    if (typeof value !== "number") return "N/A";
    return Number.isFinite(value) ? value.toFixed(decimals) : "N/A";
  }

  /**
   * Calculate and display statistics for first image
   */
  calculateFirstImage() {
    if (!this.processor) {
      alert("Upload gambar terlebih dahulu!");
      return;
    }

    // Get image data from processor
    const imageData = this.processor.getImageData();

    // Create analyzer and calculate statistics
    this.firstImageAnalyzer = new StatisticalAnalyzer(imageData);
    this.firstImageStats = this.firstImageAnalyzer.calculateAllStatistics();

    // Display results
    this.displayFirstImageStats();

    // Show comparison section
    const comparisonSection = document.getElementById(
      "statisticalComparisonSection"
    );
    if (comparisonSection) {
      comparisonSection.style.display = "block";
    }
  }

  /**
   * Display first image statistics
   */
  displayFirstImageStats() {
    if (!this.firstImageStats) return;

    const { r, g, b } = this.firstImageAnalyzer.extractPixelValues();
    const stats = this.firstImageStats;

    // Display Pearson Correlation
    document.getElementById("statsImage1PearsonRG").textContent =
      this.formatNumber(stats.pearsonCorrelation.RG);
    document.getElementById("statsImage1PearsonRB").textContent =
      this.formatNumber(stats.pearsonCorrelation.RB);
    document.getElementById("statsImage1PearsonGB").textContent =
      this.formatNumber(stats.pearsonCorrelation.GB);

    // Display Skewness
    document.getElementById("statsImage1SkewnessR").textContent =
      this.formatNumber(stats.skewness.R);
    document.getElementById("statsImage1SkewnessG").textContent =
      this.formatNumber(stats.skewness.G);
    document.getElementById("statsImage1SkewnessB").textContent =
      this.formatNumber(stats.skewness.B);

    // Display Kurtosis
    document.getElementById("statsImage1KurtosisR").textContent =
      this.formatNumber(stats.kurtosis.R);
    document.getElementById("statsImage1KurtosisG").textContent =
      this.formatNumber(stats.kurtosis.G);
    document.getElementById("statsImage1KurtosisB").textContent =
      this.formatNumber(stats.kurtosis.B);

    // Display Entropy
    document.getElementById("statsImage1EntropyR").textContent =
      this.formatNumber(stats.entropy.R);
    document.getElementById("statsImage1EntropyG").textContent =
      this.formatNumber(stats.entropy.G);
    document.getElementById("statsImage1EntropyB").textContent =
      this.formatNumber(stats.entropy.B);

    // Display Chi-Square
    document.getElementById("statsImage1ChiSquareR").textContent =
      this.formatNumber(stats.chiSquare.R, 2);
    document.getElementById("statsImage1ChiSquareG").textContent =
      this.formatNumber(stats.chiSquare.G, 2);
    document.getElementById("statsImage1ChiSquareB").textContent =
      this.formatNumber(stats.chiSquare.B, 2);

    // Show first image results
    const firstImageResults = document.getElementById(
      "statisticalFirstImageResults"
    );
    if (firstImageResults) {
      firstImageResults.style.display = "block";
    }
  }

  /**
   * Handle second image upload
   */
  handleSecondImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const statusText = document.getElementById("statisticalImageStatus");

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        this.secondImageData = ctx.getImageData(0, 0, img.width, img.height);

        const sizeText = `${img.width}x${img.height}`;

        if (statusText) {
          if (
            this.processor &&
            this.processor.sourceCanvas &&
            (img.width !== this.processor.sourceCanvas.width ||
              img.height !== this.processor.sourceCanvas.height)
          ) {
            statusText.textContent = `✅ ${sizeText} (akan di-resize)`;
            statusText.className = "status-text warning";
          } else {
            statusText.textContent = `✅ ${sizeText}`;
            statusText.className = "status-text success";
          }
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  /**
   * Resize image data to target dimensions
   */
  resizeImageData(imageData, targetWidth, targetHeight) {
    const srcCanvas = document.createElement("canvas");
    srcCanvas.width = imageData.width;
    srcCanvas.height = imageData.height;
    const srcCtx = srcCanvas.getContext("2d");
    srcCtx.putImageData(imageData, 0, 0);

    const dstCanvas = document.createElement("canvas");
    dstCanvas.width = targetWidth;
    dstCanvas.height = targetHeight;
    const dstCtx = dstCanvas.getContext("2d");
    dstCtx.drawImage(srcCanvas, 0, 0, targetWidth, targetHeight);

    return dstCtx.getImageData(0, 0, targetWidth, targetHeight);
  }

  /**
   * Compare two images
   */
  compareImages() {
    if (!this.firstImageAnalyzer) {
      alert("Hitung statistik gambar pertama terlebih dahulu!");
      return;
    }

    if (!this.secondImageData) {
      alert("Upload gambar kedua terlebih dahulu!");
      return;
    }

    // Handle different image sizes
    let processedSecondImage = this.secondImageData;
    if (
      this.processor &&
      this.processor.sourceCanvas &&
      (this.secondImageData.width !== this.processor.sourceCanvas.width ||
        this.secondImageData.height !== this.processor.sourceCanvas.height)
    ) {
      processedSecondImage = this.resizeImageData(
        this.secondImageData,
        this.processor.sourceCanvas.width,
        this.processor.sourceCanvas.height
      );
    }

    // Compare images
    this.comparisonResults =
      this.firstImageAnalyzer.compareWithImage(processedSecondImage);

    // Display comparison results
    this.displayComparisonResults();
  }

  /**
   * Display comparison results
   */
  displayComparisonResults() {
    if (!this.comparisonResults || this.comparisonResults.error) {
      alert(this.comparisonResults?.error || "Error in comparison");
      return;
    }

    const results = this.comparisonResults;
    const stats2 = results.image2Stats;

    // Display second image stats
    document.getElementById("statsImage2PearsonRG").textContent =
      this.formatNumber(stats2.pearsonCorrelation.RG);
    document.getElementById("statsImage2PearsonRB").textContent =
      this.formatNumber(stats2.pearsonCorrelation.RB);
    document.getElementById("statsImage2PearsonGB").textContent =
      this.formatNumber(stats2.pearsonCorrelation.GB);

    document.getElementById("statsImage2SkewnessR").textContent =
      this.formatNumber(stats2.skewness.R);
    document.getElementById("statsImage2SkewnessG").textContent =
      this.formatNumber(stats2.skewness.G);
    document.getElementById("statsImage2SkewnessB").textContent =
      this.formatNumber(stats2.skewness.B);

    document.getElementById("statsImage2KurtosisR").textContent =
      this.formatNumber(stats2.kurtosis.R);
    document.getElementById("statsImage2KurtosisG").textContent =
      this.formatNumber(stats2.kurtosis.G);
    document.getElementById("statsImage2KurtosisB").textContent =
      this.formatNumber(stats2.kurtosis.B);

    document.getElementById("statsImage2EntropyR").textContent =
      this.formatNumber(stats2.entropy.R);
    document.getElementById("statsImage2EntropyG").textContent =
      this.formatNumber(stats2.entropy.G);
    document.getElementById("statsImage2EntropyB").textContent =
      this.formatNumber(stats2.entropy.B);

    document.getElementById("statsImage2ChiSquareR").textContent =
      this.formatNumber(stats2.chiSquare.R, 2);
    document.getElementById("statsImage2ChiSquareG").textContent =
      this.formatNumber(stats2.chiSquare.G, 2);
    document.getElementById("statsImage2ChiSquareB").textContent =
      this.formatNumber(stats2.chiSquare.B, 2);

    // Display differences
    document.getElementById("statsDiffPearsonRG").textContent =
      this.formatNumber(results.pearsonCorrelationDiff.RG);
    document.getElementById("statsDiffPearsonRB").textContent =
      this.formatNumber(results.pearsonCorrelationDiff.RB);
    document.getElementById("statsDiffPearsonGB").textContent =
      this.formatNumber(results.pearsonCorrelationDiff.GB);

    document.getElementById("statsDiffSkewnessR").textContent =
      this.formatNumber(results.skewnessDiff.R);
    document.getElementById("statsDiffSkewnessG").textContent =
      this.formatNumber(results.skewnessDiff.G);
    document.getElementById("statsDiffSkewnessB").textContent =
      this.formatNumber(results.skewnessDiff.B);

    document.getElementById("statsDiffKurtosisR").textContent =
      this.formatNumber(results.kurtosisDiff.R);
    document.getElementById("statsDiffKurtosisG").textContent =
      this.formatNumber(results.kurtosisDiff.G);
    document.getElementById("statsDiffKurtosisB").textContent =
      this.formatNumber(results.kurtosisDiff.B);

    document.getElementById("statsDiffEntropyR").textContent =
      this.formatNumber(results.entropyDiff.R);
    document.getElementById("statsDiffEntropyG").textContent =
      this.formatNumber(results.entropyDiff.G);
    document.getElementById("statsDiffEntropyB").textContent =
      this.formatNumber(results.entropyDiff.B);

    document.getElementById("statsDiffChiSquareR").textContent =
      this.formatNumber(results.chiSquareDiff.R, 2);
    document.getElementById("statsDiffChiSquareG").textContent =
      this.formatNumber(results.chiSquareDiff.G, 2);
    document.getElementById("statsDiffChiSquareB").textContent =
      this.formatNumber(results.chiSquareDiff.B, 2);

    // Show comparison results
    const comparisonResults = document.getElementById(
      "statisticalComparisonResults"
    );
    if (comparisonResults) {
      comparisonResults.style.display = "block";
    }
  }
}
