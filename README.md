# Pixel Reader - Image Processing Application

A web-based image processing application built with Vite for reading and analyzing RGB pixel values with multiple image processing operations.

## Features

### Core Features

- **RGB Pixel Reader**: Upload and analyze RGB values from any image
- **Real-time Hover Info**: View pixel RGB values by hovering over the image
- **Coordinate Search**: Search and locate specific pixel coordinates in all matrices
- **Matrix Visualization**: Display 100x100 pixel matrix with RGB color representation

### Image Processing Operations

1. **Grayscale Conversion**

   - Automatic conversion using luminance formula: 0.299R + 0.587G + 0.114B
   - Real-time preview

2. **Binary Threshold**

   - Adjustable threshold slider (0-255)
   - Real-time conversion as you adjust the slider

3. **Brightness Adjustment**

   - Range: -255 to +255
   - Real-time brightness control with slider

4. **Arithmetic Operations**

   - Operations: Addition, Subtraction, Multiplication
   - Modes: Constant value or second image
   - Support for different image resolutions (auto-resize)

5. **Boolean Operations**

   - Operations: AND, OR, XOR
   - Dual image preview
   - Support for different image resolutions (auto-resize)

6. **Geometric Transformations**
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
│   │   ├── TabManager           # Tab navigation handler
│   │   ├── ImageProcessor       # Image processing algorithms
│   │   └── PixelReader          # Main app class
│   └── style.css                # Styling and layout
├── .github/
│   └── copilot-instructions.md  # AI coding guidelines
├── package.json
└── README.md
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

- Image analysis and color extraction
- Computer vision learning projects
- Image processing education
- Pixel art analysis
- Color palette generation
- Research and experimentation

## Notes

- Coordinate system starts at (0,0) in top-left corner
- RGB format: Red (0-255), Green (0-255), Blue (0-255)
- Alpha channel is read but not displayed in matrices
- Aspect ratio is not preserved during resize

## License

MIT License - Feel free to use and modify

---

Built with Vite