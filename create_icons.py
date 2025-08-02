import base64
import struct

def create_simple_png(width, height, color):
    """Create a simple solid color PNG"""
    # PNG signature
    png_signature = b'\x89PNG\r\n\x1a\n'
    
    # IHDR chunk
    ihdr_data = struct.pack('>2I5B', width, height, 8, 2, 0, 0, 0)
    ihdr_crc = 0x7ED55D3A  # Precalculated CRC for this type of IHDR
    
    # Convert hex color to RGB
    r = int(color[1:3], 16)
    g = int(color[3:5], 16) 
    b = int(color[5:7], 16)
    
    # Create pixel data (very simple - one color)
    pixel_data = bytes([r, g, b] * width * height)
    
    # Create a minimal PNG
    # This is simplified - real PNG would need proper compression
    return png_signature + b'placeholder'

# Simple approach: Create base64 encoded minimal PNG data
base64_16 = "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAdgAAAHYBTnsmCAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAAvSURBVDiNY/z//z8DJQAggFiIUY+BZgCxAAMjI/+/fz8wAAAAAElFTkSuQmCC"

# Create icon files with actual PNG data
import base64

for size in [16, 32, 48, 128]:
    # Use a simple blue square - this is a minimal valid PNG
    png_data = base64.b64decode("iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAdgAAAHYBTnsmCAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAAhSURBVDiNY2RgYPgPBAwjHgzCgBFEDUQ9w6hGRjpqZAQAGJ0BDfvrQpoAAAAASUVORK5CYII=")
    
    with open(f'public/icons/icon{size}.png', 'wb') as f:
        f.write(png_data)
    print(f'Created icon{size}.png')
