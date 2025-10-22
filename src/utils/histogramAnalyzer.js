/**
 * HistogramAnalyzer Utility
 * Provides histogram calculation and analysis functions
 */
export class HistogramAnalyzer {
  constructor(imageData) {
    this.imageData = imageData;
    this.data = imageData.data;
  }

  /**
   * Calculate RGB histogram
   * @returns {Object} Object containing r, g, b histogram arrays
   */
  calculateRGBHistogram() {
    const histR = new Array(256).fill(0);
    const histG = new Array(256).fill(0);
    const histB = new Array(256).fill(0);

    for (let i = 0; i < this.data.length; i += 4) {
      histR[this.data[i]]++;
      histG[this.data[i + 1]]++;
      histB[this.data[i + 2]]++;
    }

    return { r: histR, g: histG, b: histB };
  }

  /**
   * Calculate Grayscale histogram using luminance formula
   * @returns {Array} Histogram array of 256 intensity levels
   */
  calculateGrayscaleHistogram() {
    const hist = new Array(256).fill(0);

    for (let i = 0; i < this.data.length; i += 4) {
      const gray = Math.round(
        0.299 * this.data[i] +
          0.587 * this.data[i + 1] +
          0.114 * this.data[i + 2]
      );
      hist[gray]++;
    }

    return hist;
  }

  /**
   * Calculate mean and standard deviation from histogram
   * @param {Array} histogram - Histogram array
   * @returns {Object} Object containing mean and stdDev
   */
  calculateStats(histogram) {
    let sum = 0;
    let count = 0;

    for (let i = 0; i < histogram.length; i++) {
      sum += i * histogram[i];
      count += histogram[i];
    }

    const mean = sum / count;

    let variance = 0;
    for (let i = 0; i < histogram.length; i++) {
      variance += histogram[i] * Math.pow(i - mean, 2);
    }
    variance /= count;

    const stdDev = Math.sqrt(variance);

    return { mean: mean.toFixed(2), stdDev: stdDev.toFixed(2) };
  }

  /**
   * Detect two peaks in histogram for automatic threshold
   * @param {Array} histogram - Histogram array
   * @returns {Object} Object containing peak1, peak2, and threshold
   */
  detectTwoPeaks(histogram) {
    // Smooth histogram untuk mengurangi noise
    const smoothed = this.smoothHistogram(histogram);

    // Cari semua local maxima
    const peaks = [];
    for (let i = 1; i < smoothed.length - 1; i++) {
      if (smoothed[i] > smoothed[i - 1] && smoothed[i] > smoothed[i + 1]) {
        peaks.push({ intensity: i, value: smoothed[i] });
      }
    }

    // Sort berdasarkan value (descending)
    peaks.sort((a, b) => b.value - a.value);

    // Ambil dua puncak tertinggi
    if (peaks.length < 2) {
      // Jika tidak ada dua puncak, gunakan min dan max
      const peak1 = { intensity: 0, value: histogram[0] };
      const peak2 = { intensity: 255, value: histogram[255] };
      const threshold = Math.round((peak1.intensity + peak2.intensity) / 2);
      return { peak1, peak2, threshold };
    }

    const peak1 = peaks[0];
    const peak2 = peaks[1];

    // Threshold adalah nilai tengah antara dua puncak
    const threshold = Math.round((peak1.intensity + peak2.intensity) / 2);

    return { peak1, peak2, threshold };
  }

  /**
   * Smooth histogram using moving average
   * @param {Array} histogram - Histogram array
   * @param {number} windowSize - Size of smoothing window
   * @returns {Array} Smoothed histogram
   */
  smoothHistogram(histogram, windowSize = 5) {
    const smoothed = new Array(256).fill(0);
    const halfWindow = Math.floor(windowSize / 2);

    for (let i = 0; i < histogram.length; i++) {
      let sum = 0;
      let count = 0;

      for (let j = -halfWindow; j <= halfWindow; j++) {
        const idx = i + j;
        if (idx >= 0 && idx < histogram.length) {
          sum += histogram[idx];
          count++;
        }
      }

      smoothed[i] = sum / count;
    }

    return smoothed;
  }

  /**
   * Apply Histogram Equalization to image
   * @returns {ImageData} Equalized image data
   */
  equalizeHistogram() {
    const grayHist = this.calculateGrayscaleHistogram();
    const totalPixels = this.imageData.width * this.imageData.height;

    // Hitung CDF (Cumulative Distribution Function)
    const cdf = new Array(256).fill(0);
    cdf[0] = grayHist[0];
    for (let i = 1; i < 256; i++) {
      cdf[i] = cdf[i - 1] + grayHist[i];
    }

    // Normalisasi CDF untuk mendapatkan lookup table
    const cdfMin = cdf.find((val) => val > 0);
    const lookupTable = new Array(256);
    for (let i = 0; i < 256; i++) {
      lookupTable[i] = Math.round(
        ((cdf[i] - cdfMin) / (totalPixels - cdfMin)) * 255
      );
    }

    // Terapkan lookup table ke image
    const newData = new Uint8ClampedArray(this.data.length);
    for (let i = 0; i < this.data.length; i += 4) {
      const gray = Math.round(
        0.299 * this.data[i] +
          0.587 * this.data[i + 1] +
          0.114 * this.data[i + 2]
      );
      const newGray = lookupTable[gray];

      newData[i] = newGray;
      newData[i + 1] = newGray;
      newData[i + 2] = newGray;
      newData[i + 3] = this.data[i + 3]; // Alpha
    }

    return new ImageData(newData, this.imageData.width, this.imageData.height);
  }
}
