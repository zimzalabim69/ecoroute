#!/usr/bin/env python3
"""Generate all required icon sizes from logo-source.png"""
import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("Installing Pillow...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "Pillow", "-q"])
    from PIL import Image

PROJECT = Path(__file__).parent.parent
PUBLIC = PROJECT / "public"
SOURCE = PUBLIC / "logo-source.png"

if not SOURCE.exists():
    print(f"ERROR: Place your logo at {SOURCE}")
    print("Then run this script again.")
    sys.exit(1)

img = Image.open(SOURCE).convert("RGBA")

# Remove any existing background by making white/black areas transparent
# This is a simple approach - for perfect results, use remove.bg first
data = img.getdata()
new_data = []
for item in data:
    r, g, b, a = item
    # Make near-white and near-black pixels transparent (removes common backgrounds)
    if (r > 240 and g > 240 and b > 240) or (r < 15 and g < 15 and b < 15):
        new_data.append((r, g, b, 0))
    else:
        new_data.append(item)
img.putdata(new_data)

sizes = {
    "icon-192x192.png": (192, 192),
    "icon-512x512.png": (512, 512),
    "apple-touch-icon.png": (180, 180),
    "logo-navbar.png": (32, 32),
}

for filename, size in sizes.items():
    resized = img.resize(size, Image.Resampling.LANCZOS)
    out = PUBLIC / filename
    resized.save(out, "PNG")
    print(f"Generated: {filename} ({size[0]}x{size[1]})")

# Generate favicon.ico with multiple sizes
ico_sizes = [(16, 16), (32, 32), (48, 48)]
ico_images = [img.resize(s, Image.Resampling.LANCZOS) for s in ico_sizes]
img.save(PUBLIC / "favicon.ico", format="ICO", sizes=[(i.width, i.height) for i in ico_images])
print("Generated: favicon.ico (16x16, 32x32, 48x48)")

# Also generate a maskable icon (padding for safe zone)
padding = 64  # safe zone padding for 512
maskable = Image.new("RGBA", (512, 512), (0, 0, 0, 0))
resized_for_mask = img.resize((512 - padding * 2, 512 - padding * 2), Image.Resampling.LANCZOS)
maskable.paste(resized_for_mask, (padding, padding), resized_for_mask)
maskable.save(PUBLIC / "maskable-icon.png", "PNG")
print("Generated: maskable-icon.png (512x512 with safe zone)")

print("\nDone! All icons generated in public/")
