/**
 * Steganography Feature
 * Handles UI and interactions for LSB text steganography
 */
import { SteganographyAnalyzer } from "../utils/steganographyAnalyzer.js";

export class SteganographyFeature {
  constructor(imageProcessor) {
    this.imageProcessor = imageProcessor;
    this.originalImageData = null;
    this.encodedImageData = null;
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.updateCapacityInfo();
  }

  setupEventListeners() {
    // Encode button
    document
      .getElementById("encodeSteganoButton")
      ?.addEventListener("click", () => this.encodeMessage());

    // Decode button
    document
      .getElementById("decodeSteganoButton")
      ?.addEventListener("click", () => this.decodeMessage());

    // Reset button
    document
      .getElementById("resetSteganoButton")
      ?.addEventListener("click", () => this.resetSteganography());

    // Download encoded image button
    document
      .getElementById("downloadSteganoButton")
      ?.addEventListener("click", () => this.downloadEncodedImage());

    // Text input for character count
    document
      .getElementById("steganoTextInput")
      ?.addEventListener("input", (e) =>
        this.updateCharacterCount(e.target.value)
      );

    // Upload stegano image for decode
    document
      .getElementById("steganoImageInput")
      ?.addEventListener("change", (e) => this.handleSteganoImageUpload(e));
  }

  updateCapacityInfo() {
    const capacityInfo = document.getElementById("steganoCapacity");
    if (!capacityInfo || !this.imageProcessor) return;

    const imageData = this.imageProcessor.getImageData();
    const capacity = SteganographyAnalyzer.calculateCapacity(
      imageData.width,
      imageData.height
    );

    capacityInfo.textContent = `Kapasitas: ${capacity.toLocaleString()} karakter`;
  }

  updateCharacterCount(text) {
    const charCount = document.getElementById("steganoCharCount");
    const capacityInfo = document.getElementById("steganoCapacity");

    if (!charCount) return;

    const length = text.length;
    charCount.textContent = `${length} karakter`;

    if (this.imageProcessor) {
      const imageData = this.imageProcessor.getImageData();
      const capacity = SteganographyAnalyzer.calculateCapacity(
        imageData.width,
        imageData.height
      );

      if (length > capacity) {
        charCount.classList.add("error");
        charCount.textContent = `${length} / ${capacity} karakter (melebihi kapasitas!)`;
      } else {
        charCount.classList.remove("error");
        charCount.textContent = `${length} / ${capacity} karakter`;
      }
    }
  }

  encodeMessage() {
    if (!this.imageProcessor) {
      alert("Upload gambar terlebih dahulu!");
      return;
    }

    const textInput = document.getElementById("steganoTextInput");
    const text = textInput?.value || "";

    if (!text.trim()) {
      alert("Masukkan teks yang ingin disembunyikan!");
      return;
    }

    // Get original image data
    this.originalImageData = this.imageProcessor.getImageData();

    // Encode message
    const result = SteganographyAnalyzer.encode(this.originalImageData, text);

    if (!result.success) {
      alert(result.error);
      return;
    }

    this.encodedImageData = result.imageData;

    // Display results
    this.displayEncodeResults(result);
  }

  displayEncodeResults(result) {
    // Draw original image
    const originalCanvas = document.getElementById("steganoOriginalCanvas");
    if (originalCanvas) {
      this.imageProcessor.drawToCanvas(this.originalImageData, originalCanvas);
    }

    // Draw encoded image
    const encodedCanvas = document.getElementById("steganoEncodedCanvas");
    if (encodedCanvas) {
      this.imageProcessor.drawToCanvas(result.imageData, encodedCanvas);
    }

    // Draw difference image (amplified)
    const diffCanvas = document.getElementById("steganoDiffCanvas");
    if (diffCanvas && this.originalImageData) {
      const diffImageData = SteganographyAnalyzer.getDifferenceImage(
        this.originalImageData,
        result.imageData
      );
      this.imageProcessor.drawToCanvas(diffImageData, diffCanvas);
    }

    // Display encode info
    const infoDiv = document.getElementById("steganoEncodeInfo");
    if (infoDiv) {
      infoDiv.innerHTML = `
        <div class="stegano-info-card success">
          <h4>✅ Pesan berhasil disembunyikan!</h4>
          <ul>
            <li><strong>Panjang pesan:</strong> ${
              result.messageLength
            } karakter</li>
            <li><strong>Bits digunakan:</strong> ${result.bitsUsed.toLocaleString()} / ${result.bitsAvailable.toLocaleString()}</li>
            <li><strong>Kapasitas terpakai:</strong> ${
              result.capacityUsed
            }%</li>
            <li><strong>Ukuran gambar:</strong> ${
              result.originalSize.width
            } x ${result.originalSize.height}</li>
          </ul>
        </div>
      `;
    }

    // Show download button
    const downloadBtn = document.getElementById("downloadSteganoButton");
    if (downloadBtn) {
      downloadBtn.style.display = "inline-block";
    }

    // Show results section
    const resultsSection = document.getElementById("steganoResults");
    if (resultsSection) {
      resultsSection.style.display = "block";
    }
  }

  handleSteganoImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Create canvas and get image data
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, img.width, img.height);

        // Display the uploaded stegano image
        const decodeCanvas = document.getElementById("steganoDecodeCanvas");
        if (decodeCanvas) {
          decodeCanvas.width = img.width;
          decodeCanvas.height = img.height;
          const decodeCtx = decodeCanvas.getContext("2d");
          decodeCtx.drawImage(img, 0, 0);
        }

        // Store for decoding
        this.steganoImageData = imageData;

        // Update status
        const status = document.getElementById("steganoImageStatus");
        if (status) {
          status.textContent = `✅ Gambar dimuat (${img.width}x${img.height})`;
          status.className = "status-text success";
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  decodeMessage() {
    let imageDataToDecode = this.steganoImageData;

    // If no separate image uploaded, try to decode from encoded image
    if (!imageDataToDecode && this.encodedImageData) {
      imageDataToDecode = this.encodedImageData;
    }

    // If still no image, try original processor
    if (!imageDataToDecode && this.imageProcessor) {
      imageDataToDecode = this.imageProcessor.getImageData();
    }

    if (!imageDataToDecode) {
      alert("Upload gambar steganografi terlebih dahulu!");
      return;
    }

    // Decode message
    const result = SteganographyAnalyzer.decode(imageDataToDecode);

    // Display decode results
    this.displayDecodeResults(result);
  }

  displayDecodeResults(result) {
    const resultDiv = document.getElementById("steganoDecodeResult");
    if (!resultDiv) return;

    if (result.success) {
      resultDiv.innerHTML = `
        <div class="stegano-info-card success">
          <h4>✅ Pesan ditemukan!</h4>
          ${
            result.warning
              ? `<p class="warning-text">⚠️ ${result.warning}</p>`
              : ""
          }
          <div class="stegano-text-result">
            <label>Teks tersembunyi:</label>
            <textarea readonly class="decoded-text">${this.escapeHtml(
              result.text
            )}</textarea>
          </div>
          <ul>
            <li><strong>Panjang pesan:</strong> ${
              result.messageLength
            } karakter</li>
            <li><strong>Bits dibaca:</strong> ${result.bitsRead.toLocaleString()}</li>
            <li><strong>Ukuran gambar:</strong> ${result.imageSize.width} x ${
        result.imageSize.height
      }</li>
          </ul>
        </div>
      `;
    } else {
      resultDiv.innerHTML = `
        <div class="stegano-info-card error">
          <h4>❌ ${result.error}</h4>
          <p>Pastikan gambar yang diupload adalah gambar yang telah disisipi pesan dengan metode LSB steganography.</p>
        </div>
      `;
    }
  }

  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  downloadEncodedImage() {
    if (!this.encodedImageData) {
      alert("Tidak ada gambar yang di-encode!");
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = this.encodedImageData.width;
    canvas.height = this.encodedImageData.height;
    const ctx = canvas.getContext("2d");
    ctx.putImageData(this.encodedImageData, 0, 0);

    // Create download link (PNG to preserve LSB data)
    const link = document.createElement("a");
    link.download = "steganography_encoded.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  resetSteganography() {
    // Clear text input
    const textInput = document.getElementById("steganoTextInput");
    if (textInput) textInput.value = "";

    // Clear character count
    const charCount = document.getElementById("steganoCharCount");
    if (charCount) {
      charCount.textContent = "0 karakter";
      charCount.classList.remove("error");
    }

    // Clear canvases
    const canvases = [
      "steganoOriginalCanvas",
      "steganoEncodedCanvas",
      "steganoDiffCanvas",
      "steganoDecodeCanvas",
    ];
    canvases.forEach((id) => {
      const canvas = document.getElementById(id);
      if (canvas) {
        canvas.width = 0;
        canvas.height = 0;
      }
    });

    // Clear info divs
    const infoDiv = document.getElementById("steganoEncodeInfo");
    if (infoDiv) infoDiv.innerHTML = "";

    const resultDiv = document.getElementById("steganoDecodeResult");
    if (resultDiv) resultDiv.innerHTML = "";

    // Hide download button
    const downloadBtn = document.getElementById("downloadSteganoButton");
    if (downloadBtn) downloadBtn.style.display = "none";

    // Hide results section
    const resultsSection = document.getElementById("steganoResults");
    if (resultsSection) resultsSection.style.display = "none";

    // Clear status
    const status = document.getElementById("steganoImageStatus");
    if (status) {
      status.textContent = "";
      status.className = "status-text";
    }

    // Reset stored data
    this.originalImageData = null;
    this.encodedImageData = null;
    this.steganoImageData = null;

    // Update capacity info
    this.updateCapacityInfo();
  }
}
