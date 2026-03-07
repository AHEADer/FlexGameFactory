---
name: generate_nano_banana_image
description: Generates high-quality images using the Google Nano Banana (Gemini) API via a Python tool. Supports various aspect ratios and image sizes.
---

# Generate Nano Banana Image

This skill provides the capability to generate images using the project's direct integration with Google's Nano Banana (Gemini) image generation model.

## Usage

Use the `python3 tools/nano_banana_gen.py` script to invoke the API. 

### Requirements
- `GEMINI_API_KEY`: Must be set in the environment.
- `google-genai`: Python SDK must be installed (`pip3 install google-genai`).

### Command Structure
```bash
python3 tools/nano_banana_gen.py "<PROMPT>" [OPTIONS]
```

### Supported Options
- `--output`, `-o`: The filename for the generated image (default: `generated_image.png`).
- `--aspect_ratio`, `-ar`: The shape of the image. Choices: `1:1`, `16:9`, `4:3`, `9:16` (default: `1:1`).
- `--image_size`, `-s`: The resolution/quality. Choices: `1K`, `2K`, `4K` (default: `1K`).
- `--model`: The specific model ID (default: `gemini-3.1-flash-image-preview`).

## Examples

### 1. Basic Square Image
```bash
python3 tools/nano_banana_gen.py "A futuristic city in the style of Van Gogh"
```

### 2. High Resolution Cinematic Landscape
```bash
python3 tools/nano_banana_gen.py "A space explorer discovering a crystal cavern on Mars" --aspect_ratio 16:9 --image_size 2K --output mars_exploration.png
```

### 3. Vertical Mobile Wallpaper
```bash
python3 tools/nano_banana_gen.py "Abstract neon flow, vertical orientation" --aspect_ratio 9:16 --output neon_wallpaper.png
```

## Best Practices
- **Prompting**: Be descriptive. Include keywords like "cinematic", "photorealistic", "digital art", or specific artist styles for better results.
- **Quota Management**: If you receive a `429 RESOURCE_EXHAUSTED` error, wait at least 60 seconds before retrying, as image generation has strict rate limits on free tiers.
- **Model Check**: `gemini-3.1-flash-image-preview` is optimized for speed, while `gemini-3-pro-image-preview` is better for complex instructions and high-fidelity text.
