/**
 * Edge Detection Feature
 * Detects edges in images using various kernels (Sobel, Prewitt, Roberts, Laplacian)
 */
import { EdgeDetectionAnalyzer } from "../utils/edgeDetectionAnalyzer.js";

export class EdgeDetectionFeature {
  constructor(imageProcessor) {
    this.imageProcessor = imageProcessor;
    this.detectionResults = null;
    this.init();
  }

  init() {
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Edge Detection kernel selector
    document
      .getElementById("edgeKernelSelect")
      ?.addEventListener("change", (e) => {
        this.updateKernelDisplay(e.target.value);
      });

    // Threshold slider
    document.getElementById("edgeThreshold")?.addEventListener("input", (e) => {
      document.getElementById("edgeThresholdValue").textContent =
        e.target.value;
      if (this.detectionResults) this.updateEdgeDetection();
    });

    // Detect button
    document
      .getElementById("detectEdgesButton")
      ?.addEventListener("click", () => this.detectEdges());

    // Reset button
    document
      .getElementById("resetEdgesButton")
      ?.addEventListener("click", () => this.resetEdgeDetection());
  }

  updateKernelDisplay(kernelName) {
    const kernelDisplay = document.getElementById("kernelDisplay");
    if (!kernelDisplay) return;

    const kernelHTML = EdgeDetectionAnalyzer.getKernelHTML(kernelName);
    kernelDisplay.innerHTML = kernelHTML;

    if (this.detectionResults) this.updateEdgeDetection();
  }

  detectEdges() {
    if (!this.imageProcessor) {
      alert("Upload gambar terlebih dahulu!");
      return;
    }

    const kernelName =
      document.getElementById("edgeKernelSelect").value || "sobel";
    const threshold = parseInt(document.getElementById("edgeThreshold").value);

    // Get original image data
    const originalImageData = this.imageProcessor.getImageData();

    // Perform edge detection
    const result = EdgeDetectionAnalyzer.detectEdges(
      originalImageData,
      kernelName,
      threshold,
      true // Capture convolution matrices
    );

    this.detectionResults = result;

    // Draw results
    this.drawResults();
    this.displayConvolutionMatrices();
    this.displayKernelInfo();
  }

  updateEdgeDetection() {
    if (!this.detectionResults) return;

    const kernelName =
      document.getElementById("edgeKernelSelect").value || "sobel";
    const threshold = parseInt(document.getElementById("edgeThreshold").value);

    // Get original image data
    const originalImageData = this.imageProcessor.getImageData();

    // Re-detect with new parameters
    const result = EdgeDetectionAnalyzer.detectEdges(
      originalImageData,
      kernelName,
      threshold,
      true
    );

    this.detectionResults = result;

    // Update display
    this.drawResults();
    this.displayConvolutionMatrices();
  }

  drawResults() {
    if (!this.detectionResults) return;

    const edgeCanvas = document.getElementById("edgeDetectionCanvas");
    if (edgeCanvas) {
      this.imageProcessor.drawToCanvas(
        this.detectionResults.imageData,
        edgeCanvas
      );
    }
  }

  displayKernelInfo() {
    const kernelInfoDiv = document.getElementById("edgeKernelInfo");
    if (!kernelInfoDiv) return;

    const kernelName = this.detectionResults.kernelName;
    let html = `<h4>${kernelName.toUpperCase()} Kernels:</h4>`;

    if (this.detectionResults.kernelY) {
      html += `<div class="kernel-display-section">
        <div class="kernel-box">
          <h5>Kernel X (Horizontal Edges)</h5>
          ${this.matrixToTable(this.detectionResults.kernelX)}
        </div>
        <div class="kernel-box">
          <h5>Kernel Y (Vertical Edges)</h5>
          ${this.matrixToTable(this.detectionResults.kernelY)}
        </div>
      </div>`;
    } else {
      html += `<div class="kernel-display-section">
        <div class="kernel-box">
          <h5>Kernel Matrix</h5>
          ${this.matrixToTable(this.detectionResults.kernelX)}
        </div>
      </div>`;
    }

    kernelInfoDiv.innerHTML = html;
  }

  displayConvolutionMatrices() {
    const convolutionDiv = document.getElementById("convolutionMatrices");
    if (!convolutionDiv || !this.detectionResults.convolutionMatrices) {
      if (convolutionDiv) {
        convolutionDiv.innerHTML =
          '<p style="color: #64748b; font-style: italic;">Matriks konvolusi tidak tersedia</p>';
      }
      return;
    }

    const matrices = this.detectionResults.convolutionMatrices;
    const totalCount = matrices.length;
    const maxDisplay = 100;
    const step = Math.max(1, Math.floor(totalCount / maxDisplay));
    const samplesToDisplay =
      step === 1 ? matrices : matrices.filter((_, i) => i % step === 0);

    let html = `<h4>📊 Semua Matriks Konvolusi (Total ${totalCount} posisi, menampilkan ${samplesToDisplay.length}):</h4><div class="convolution-samples">`;

    for (const conv of samplesToDisplay) {
      html += `<div class="convolution-sample">
        <h5>Posisi (${conv.x}, ${conv.y})</h5>
        
        <div class="conv-step">
          <h6>Input Matrix:</h6>
          ${this.matrixToTable(conv.inputMatrix)}
        </div>
        
        <div class="conv-step">
          <h6>Kernel:</h6>
          ${this.matrixToTable(conv.kernel, true)}
        </div>
      </div>`;
    }

    html += "</div>";
    convolutionDiv.innerHTML = html;
  }

  matrixToTable(matrix, isKernel = false) {
    let html =
      '<table class="matrix-table' + (isKernel ? " kernel-table" : "") + '">';
    for (let i = 0; i < matrix.length; i++) {
      html += "<tr>";
      for (let j = 0; j < matrix[i].length; j++) {
        const value = matrix[i][j];
        let className = "";
        if (isKernel) {
          className = value > 0 ? "positive" : value < 0 ? "negative" : "zero";
        }
        html += `<td class="${className}">${value}</td>`;
      }
      html += "</tr>";
    }
    html += "</table>";
    return html;
  }

  generateCalculation(inputMatrix, kernel, result) {
    let terms = [];
    for (let i = 0; i < inputMatrix.length; i++) {
      for (let j = 0; j < inputMatrix[i].length; j++) {
        const inputVal = inputMatrix[i][j];
        const kernelVal = kernel[i][j];
        terms.push(`${inputVal}×${kernelVal}`);
      }
    }

    let calculation = terms.join(" + ");
    calculation = calculation.replace(/\+ -/g, "- ");

    return `<div class="calculation">
      <div class="formula">${calculation}</div>
      <div class="result">=<span class="result-value"> ${result}</span></div>
    </div>`;
  }

  resetEdgeDetection() {
    // Reset threshold
    document.getElementById("edgeThreshold").value = 50;
    document.getElementById("edgeThresholdValue").textContent = "50";

    // Clear kernel select
    document.getElementById("edgeKernelSelect").value = "sobel";

    // Clear display
    document.getElementById("edgeDetectionCanvas").width = 0;
    document.getElementById("kernelDisplay").innerHTML = "";
    document.getElementById("edgeKernelInfo").innerHTML = "";
    document.getElementById("convolutionMatrices").innerHTML = "";

    this.detectionResults = null;
  }
}
