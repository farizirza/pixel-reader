/**
 * Edge Detection Utility
 * Provides edge detection operations using various kernels (Sobel, Prewitt, etc.)
 */
export class EdgeDetectionAnalyzer {
  /**
   * Sobel Kernels for X and Y direction
   */
  static SOBEL_X = [
    [-1, 0, 1],
    [-2, 0, 2],
    [-1, 0, 1],
  ];

  static SOBEL_Y = [
    [-1, -2, -1],
    [0, 0, 0],
    [1, 2, 1],
  ];

  /**
   * Prewitt Kernels for X and Y direction
   */
  static PREWITT_X = [
    [-1, 0, 1],
    [-1, 0, 1],
    [-1, 0, 1],
  ];

  static PREWITT_Y = [
    [-1, -1, -1],
    [0, 0, 0],
    [1, 1, 1],
  ];

  /**
   * Roberts Kernels for X and Y direction
   */
  static ROBERTS_X = [
    [1, 0],
    [0, -1],
  ];

  static ROBERTS_Y = [
    [0, 1],
    [-1, 0],
  ];

  /**
   * Laplacian Kernel (single kernel for both directions)
   */
  static LAPLACIAN = [
    [0, -1, 0],
    [-1, 4, -1],
    [0, -1, 0],
  ];

  /**
   * Get kernel by name
   * @param {string} kernelName - Name of the kernel (sobel, prewitt, roberts, laplacian)
   * @returns {object} Object with kernelX and kernelY properties
   */
  static getKernel(kernelName = "sobel") {
    switch (kernelName.toLowerCase()) {
      case "prewitt":
        return { kernelX: this.PREWITT_X, kernelY: this.PREWITT_Y };
      case "roberts":
        return { kernelX: this.ROBERTS_X, kernelY: this.ROBERTS_Y };
      case "laplacian":
        return { kernelX: this.LAPLACIAN, kernelY: null };
      case "sobel":
      default:
        return { kernelX: this.SOBEL_X, kernelY: this.SOBEL_Y };
    }
  }

  /**
   * Apply convolution to a single channel (grayscale)
   * @param {Uint8ClampedArray} data - Image data array
   * @param {number} width - Image width
   * @param {number} height - Image height
   * @param {number[][]} kernel - Convolution kernel
   * @param {boolean} captureConvolution - Capture convolution matrices
   * @returns {object} Result with output data and convolution matrices
   */
  static applyConvolution(
    data,
    width,
    height,
    kernel,
    captureConvolution = false
  ) {
    const outputData = new Uint8ClampedArray(data.length);
    const kernelSize = kernel.length;
    const offset = Math.floor(kernelSize / 2);
    const convolutionMatrices = [];

    // Convert to grayscale array if not already
    const grayData = new Uint8ClampedArray(width * height);
    for (let i = 0; i < data.length; i += 4) {
      const gray = Math.round(
        0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
      );
      grayData[Math.floor(i / 4)] = gray;
    }

    for (let y = offset; y < height - offset; y++) {
      for (let x = offset; x < width - offset; x++) {
        let sum = 0;
        const inputMatrix = [];

        for (let ky = 0; ky < kernelSize; ky++) {
          const inputRow = [];
          for (let kx = 0; kx < kernelSize; kx++) {
            const px = x + kx - offset;
            const py = y + ky - offset;
            const value = grayData[py * width + px];
            inputRow.push(value);
            sum += value * kernel[ky][kx];
          }
          inputMatrix.push(inputRow);
        }

        // Capture convolution matrices for display
        if (captureConvolution) {
          convolutionMatrices.push({
            x,
            y,
            inputMatrix,
            kernel,
            result: sum,
          });
        }

        // Clamp value between 0 and 255
        const clampedValue = Math.max(0, Math.min(255, sum));

        // Write to RGBA output (repeat for all 4 channels)
        const idx = (y * width + x) * 4;
        outputData[idx] = clampedValue; // R
        outputData[idx + 1] = clampedValue; // G
        outputData[idx + 2] = clampedValue; // B
        outputData[idx + 3] = 255; // A
      }
    }

    return {
      data: outputData,
      convolutionMatrices:
        convolutionMatrices.length > 0 ? convolutionMatrices : null,
    };
  }

  /**
   * Detect edges using Sobel, Prewitt, Roberts, or Laplacian
   * @param {ImageData} imageData - Image data to process
   * @param {string} kernelName - Name of the kernel to use
   * @param {number} threshold - Threshold value (0-255)
   * @param {boolean} captureConvolution - Capture convolution matrices
   * @returns {object} Result with edge detection data and matrices
   */
  static detectEdges(
    imageData,
    kernelName = "sobel",
    threshold = 50,
    captureConvolution = false
  ) {
    const width = imageData.width;
    const height = imageData.height;
    const data = imageData.data;
    const outputData = new Uint8ClampedArray(data.length);

    const kernels = this.getKernel(kernelName);
    const isLaplacian = kernelName.toLowerCase() === "laplacian";

    let convolutionMatrices = [];

    if (isLaplacian) {
      // Laplacian uses single kernel
      const result = this.applyConvolution(
        data,
        width,
        height,
        kernels.kernelX,
        captureConvolution
      );
      const tempData = result.data;
      convolutionMatrices = result.convolutionMatrices || [];

      // Apply threshold and create binary image
      for (let i = 0; i < tempData.length; i += 4) {
        const value = Math.abs(tempData[i]);
        const binary = value > threshold ? 255 : 0;
        outputData[i] = binary;
        outputData[i + 1] = binary;
        outputData[i + 2] = binary;
        outputData[i + 3] = 255;
      }
    } else {
      // Sobel, Prewitt, Roberts use X and Y kernels
      const resultX = this.applyConvolution(
        data,
        width,
        height,
        kernels.kernelX,
        captureConvolution
      );
      const resultY = this.applyConvolution(
        data,
        width,
        height,
        kernels.kernelY,
        false
      );

      const dataX = resultX.data;
      const dataY = resultY.data;
      convolutionMatrices = resultX.convolutionMatrices || [];

      // Combine X and Y gradients
      for (let i = 0; i < dataX.length; i += 4) {
        const gx = dataX[i];
        const gy = dataY[i];
        const magnitude = Math.sqrt(gx * gx + gy * gy);
        const binary = magnitude > threshold ? 255 : 0;

        outputData[i] = binary;
        outputData[i + 1] = binary;
        outputData[i + 2] = binary;
        outputData[i + 3] = 255;
      }
    }

    const result = new ImageData(outputData, width, height);

    return {
      imageData: result,
      kernelName,
      kernelX: kernels.kernelX,
      kernelY: kernels.kernelY,
      threshold,
      convolutionMatrices,
    };
  }

  /**
   * Create visual representation of kernel
   * @param {number[][]} kernel - The kernel matrix
   * @returns {string} HTML table representation
   */
  static kernelToTable(kernel) {
    let html = '<table class="kernel-table">';
    for (let i = 0; i < kernel.length; i++) {
      html += "<tr>";
      for (let j = 0; j < kernel[i].length; j++) {
        const value = kernel[i][j];
        const className =
          value > 0 ? "positive" : value < 0 ? "negative" : "zero";
        html += `<td class="${className}">${value}</td>`;
      }
      html += "</tr>";
    }
    html += "</table>";
    return html;
  }

  /**
   * Create visual representation of convolution matrix
   * @param {object} convolution - Convolution object with inputMatrix, kernel, result
   * @returns {string} HTML representation
   */
  static convolutionToHTML(convolution) {
    const { inputMatrix, kernel, result, x, y } = convolution;

    let html = `<div class="convolution-step">`;
    html += `<h4>Position (${x}, ${y})</h4>`;

    // Input Matrix
    html += `<div class="convolution-part">
      <h5>Input Matrix:</h5>
      <table class="matrix-table">`;
    for (let i = 0; i < inputMatrix.length; i++) {
      html += "<tr>";
      for (let j = 0; j < inputMatrix[i].length; j++) {
        html += `<td>${inputMatrix[i][j]}</td>`;
      }
      html += "</tr>";
    }
    html += `</table></div>`;

    // Kernel
    html += `<div class="convolution-part">
      <h5>Kernel:</h5>
      <table class="kernel-table">`;
    for (let i = 0; i < kernel.length; i++) {
      html += "<tr>";
      for (let j = 0; j < kernel[i].length; j++) {
        const value = kernel[i][j];
        const className =
          value > 0 ? "positive" : value < 0 ? "negative" : "zero";
        html += `<td class="${className}">${value}</td>`;
      }
      html += "</tr>";
    }
    html += `</table></div>`;

    // Calculation
    html += `<div class="convolution-part">
      <h5>Calculation:</h5>
      <div class="calculation">`;

    let calculation = [];
    for (let i = 0; i < inputMatrix.length; i++) {
      for (let j = 0; j < inputMatrix[i].length; j++) {
        const val = inputMatrix[i][j];
        const kernelVal = kernel[i][j];
        const sign = kernelVal >= 0 ? "+" : "";
        calculation.push(`${val} × ${kernelVal}`);
      }
    }
    html += calculation.join(" + ");
    html += ` = <strong>${result}</strong></div></div>`;

    html += `</div>`;
    return html;
  }

  /**
   * Get kernel as HTML table
   * @param {string} kernelName - Name of the kernel
   * @returns {string} HTML representation
   */
  static getKernelHTML(kernelName) {
    const kernels = this.getKernel(kernelName);
    let html = "";

    if (kernels.kernelY) {
      html += `<div class="kernel-display">
        <div class="kernel-item">
          <h5>Kernel X (Horizontal Edges):</h5>
          ${this.kernelToTable(kernels.kernelX)}
        </div>
        <div class="kernel-item">
          <h5>Kernel Y (Vertical Edges):</h5>
          ${this.kernelToTable(kernels.kernelY)}
        </div>
      </div>`;
    } else {
      html += `<div class="kernel-display">
        <div class="kernel-item">
          <h5>Kernel:</h5>
          ${this.kernelToTable(kernels.kernelX)}
        </div>
      </div>`;
    }

    return html;
  }
}
