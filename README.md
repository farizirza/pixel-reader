# Pixel Reader - Image Processing Application

A web-based image processing application built with Vite for reading and analyzing RGB pixel values with multiple image processing operations.

## Features

### Core Features

- **RGB Pixel Reader**: Upload and analyze RGB values from any image
- **Real-time Hover Info**: View pixel RGB values by hovering over the image
- **Coordinate Search**: Search and locate specific pixel coordinates in all matrices
- **Matrix Visualization**: Display 100x100 pixel matrix with RGB color representation

### Image Processing Operations

1. **📉 Statistical Analysis** ✨ NEW

   - **Pearson Correlation**: Measure linear relationship between RGB channels (RG, RB, GB)
   - **Skewness**: Measure asymmetry of pixel distribution
   - **Kurtosis**: Measure peakedness of pixel distribution
   - **Entropy**: Measure randomness/disorder in image (0-8 bits)
   - **Chi-Square**: Measure deviation from uniform distribution
   - **Image Comparison**: Calculate statistical differences between two images
   - **Matching Metrics**: Determine similarity between images

2. **🌿 Green Detection** ✨ NEW

   - HSV color space-based vegetation detection
   - Adjustable Hue, Saturation, Value parameters
   - Binary mask and colored visualization
   - Statistical analysis (pixel counts, percentages)
   - Donut chart distribution visualization

3. **🔍 Edge Detection** ✨ NEW

   - **Kernel Options**: Sobel, Prewitt, Roberts, Laplacian
   - **Kernel Visualization**: Display kernel matrices
   - **Convolution Matrices**: Show detailed convolution process
   - **Threshold Control**: Adjustable edge detection sensitivity
   - **Complete Process Display**: Input matrix, kernel, and calculation results

4. **Grayscale Conversion**

   - Automatic conversion using luminance formula: 0.299R + 0.587G + 0.114B
   - Real-time preview

5. **Binary Threshold**

   - Adjustable threshold slider (0-255)
   - Real-time conversion as you adjust the slider

6. **Brightness Adjustment**

   - Range: -255 to +255
   - Real-time brightness control with slider

7. **Arithmetic Operations**

   - Operations: Addition, Subtraction, Multiplication
   - Modes: Constant value or second image
   - Support for different image resolutions (auto-resize)

8. **Boolean Operations**

   - Operations: AND, OR, XOR
   - Dual image preview
   - Support for different image resolutions (auto-resize)

9. **Geometric Transformations**
   - Rotation: 90°, 180°, 270°
   - Flip: Horizontal and Vertical

## Installation

```bash
npm install
```

## Usage

### Development Mode

```bash
npm run dev
```

Application will run at `http://localhost:5173/`

### Production Build

```bash
npm run build
```

## How to Use

### Basic Workflow

1. Upload an image using the file input
2. Navigate between tabs to access different processing features
3. Use the coordinate search to find specific pixels
4. Apply operations and view results in real-time

### Coordinate Search

- Enter X and Y coordinates in the search boxes
- Click "Cari" to locate the pixel
- Found pixels will be highlighted and scrolled into view
- Search results show RGB values

### Two-Image Operations (Arithmetic & Boolean)

- Upload a second image (any resolution supported)
- If resolutions differ, the second image will be auto-resized
- Status indicators show original size and target resize dimensions
- Preview canvases show both images before processing

## Project Structure

```
pixel-reader/
├── index.html                    # Main HTML with tab navigation
├── src/
│   ├── main.js                   # Core application logic
│   ├── style.css                 # Styling and layout
│   ├── components/
│   │   └── tabManager.js         # Tab navigation handler
│   ├── utils/
│   │   ├── imageProcessor.js     # Image processing algorithms
│   │   ├── histogramAnalyzer.js  # Histogram calculation
│   │   ├── statisticalAnalyzer.js# Statistical analysis ✨
│   │   ├── hsvAnalyzer.js        # HSV color space & green detection ✨
│   │   └── edgeDetectionAnalyzer.js # Edge detection algorithms ✨ NEW
│   └── features/
│       ├── pixelReader.js        # Main app class
│       ├── histogramFeature.js   # Histogram feature
│       ├── statisticalFeature.js # Statistical analysis feature ✨
│       ├── greenDetectionFeature.js # Green detection feature ✨
│       └── edgeDetectionFeature.js # Edge detection feature ✨ NEW
├── package.json
├── README.md
├── PANDUAN_STATISTIK.md          # User guide (Indonesian) ✨
├── STATISTICAL_FEATURE_DOCS.md   # Technical documentation ✨
└── CHANGES_SUMMARY.md            # Implementation details ✨
```

## Technical Details

### Canvas API

- Uses HTML5 Canvas with `willReadFrequently: true` for optimal performance
- Multiple canvas strategy for independent operations
- ImageData manipulation for pixel-level processing

### Image Resize

- Automatic resize for different resolutions
- Browser-based interpolation (bicubic/bilinear)
- Original images preserved, resize only for processing

### Architecture

- Tab-based SPA without router
- Class-based vanilla JavaScript
- Pure functions for image processing
- Separation of concerns (UI, Processing, Navigation)

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Performance Considerations

- Matrix display limited to 100x100 pixels
- Real-time operations optimized for responsive UI
- Large images may experience slight delay during resize

## Status Indicators

### Color Coding

- **Green**: Success, same resolution, operation complete
- **Orange**: Warning, will be resized, aspect ratio differs
- **Red**: Error, invalid input, operation failed

## Documentation

- `PANDUAN_STATISTIK.md` - Complete user guide in Indonesian for statistical analysis feature
- `STATISTICAL_FEATURE_DOCS.md` - Technical documentation with formulas and use cases
- `CHANGES_SUMMARY.md` - Detailed implementation summary
- `DIFFERENT_RESOLUTION_SUPPORT.md` - Details on auto-resize feature
- `UPDATE_SUMMARY.md` - Implementation changelog
- `QUICK_START_RESIZE.md` - Quick guide for different resolutions
- `.github/copilot-instructions.md` - Development guidelines

## Technologies

- **Vite** - Build tool and dev server
- **Vanilla JavaScript** - ES6+ without frameworks
- **HTML5 Canvas API** - Pixel manipulation
- **CSS3** - Modern styling with Flexbox and Grid

## Use Cases

- **Image analysis and color extraction**
- **Computer vision learning projects**
- **Image processing education**
- **Pixel art analysis**
- **Color palette generation**
- **Research and experimentation**
- **Image quality assessment** ✨ (via Entropy and Chi-Square)
- **Image similarity detection** ✨ (via statistical comparison)
- **Color characterization** ✨ (via Pearson Correlation)
- **Texture analysis** ✨ (via Skewness, Kurtosis, Entropy)
- **Anomaly detection** ✨ (via statistical deviation)
- **Vegetation monitoring** ✨ (via Green Detection with HSV)
- **Edge detection and contour analysis** ✨ NEW (via Sobel, Prewitt, Roberts, Laplacian kernels)
- **Feature extraction for object detection** ✨ NEW
- **Boundary detection in images** ✨ NEW
- **Image preprocessing for computer vision pipelines** ✨ NEW

## Notes

- Coordinate system starts at (0,0) in top-left corner
- RGB format: Red (0-255), Green (0-255), Blue (0-255)
- Alpha channel is read but not displayed in matrices
- Aspect ratio is not preserved during resize

## License

MIT License - Feel free to use and modify

---

Built with Vite
