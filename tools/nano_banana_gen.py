#!/usr/bin/env python3
import os
import sys
import argparse
import json
from google import genai
from google.genai import types

def main():
    """
    Nano Banana Image Generation Tool
    Invokes the Google Nano Banana (Gemini) API to generate images from text prompts.
    Uses the official google-genai SDK.
    """
    parser = argparse.ArgumentParser(
        description="Invoke the Nano Banana (Gemini) Image Generation API.",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter
    )
    
    # Core parameters
    parser.add_argument("prompt", help="Text prompt describing the image to generate.")
    
    # Model selection (Nano Banana 2 vs Pro)
    parser.add_argument("--model", default="gemini-3.1-flash-image-preview", 
                        help="The Nano Banana model ID (e.g., gemini-3.1-flash-image-preview, gemini-3-pro-image-preview)")
    
    # Nano Banana configuration arguments
    parser.add_argument("--output", "-o", default="generated_image.png", help="Path to save the generated image.")
    parser.add_argument("--aspect_ratio", "-ar", choices=["1:1", "16:9", "4:3", "9:16"], default="1:1", 
                        help="Aspect ratio of the generated image.")
    parser.add_argument("--image_size", "-s", choices=["1K", "2K", "4K"], default="1K",
                        help="Output image size (e.g., 1K, 2K, 4K).")
    
    args = parser.parse_args()

    # Get API Key from environment variable
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("Error: GEMINI_API_KEY environment variable is not set.")
        print("Please export it: export GEMINI_API_KEY='your-api-key'")
        sys.exit(1)

    # Initialize Gemini Client
    client = genai.Client(api_key=api_key, http_options={'api_version': 'v1alpha'})
    
    print(f"--- Nano Banana Generation Session ---")
    print(f"Model  : {args.model}")
    print(f"Prompt : {args.prompt}")
    print(f"Config : {args.aspect_ratio}, {args.image_size} size")
    print(f"---------------------------------------")
    
    try:
        # Construct generation configuration
        config = types.GenerateContentConfig(
            response_modalities=["IMAGE"],
            image_config=types.ImageConfig(
                aspect_ratio=args.aspect_ratio
            )
        )

        response = client.models.generate_content(
            model=args.model,
            contents=[args.prompt],
            config=config
        )
        
        # Filter parts for images
        images_parts = [part for part in response.parts if part.inline_data]
        
        if not images_parts:
            print("No images were returned by the API.")
            # Check for text in response (could be error or safety block)
            for part in response.parts:
                if part.text:
                    print(f"Response Text: {part.text}")
            sys.exit(1)
            
        print(f"Successfully generated {len(images_parts)} image(s).")
        
        for idx, part in enumerate(images_parts):
            # Save to file
            out_file = args.output
            if len(images_parts) > 1:
                base, ext = os.path.splitext(args.output)
                out_file = f"{base}_{idx}{ext}"
            
            # Use the part.as_image() helper if available, or manual save
            try:
                img = part.as_image()
                img.save(out_file)
            except AttributeError:
                # Fallback to manual byte writing if as_image is not available
                with open(out_file, "wb") as f:
                    f.write(part.inline_data.data)
                
            print(f"Image saved to: {out_file}")
            
    except Exception as e:
        print(f"An error occurred: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
