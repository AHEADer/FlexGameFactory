import os
import json
import re

docs_dir = '/Users/junda/Documents/Projects/FlexGameFactory/docs'
output_file = '/Users/junda/Documents/Projects/FlexGameFactory/docs_structure.json'

data = []

# Mappings based on category directories
prefix_to_category = {
    "STR": "1 Game Structure",
    "TRN": "2 Turn Order and Structure",
    "ACT": "3 Actions",
    "RES": "4 Resolution",
    "VIC": "5 Game End and Victory",
    "UNC": "6 Uncertainty",
    "ECO": "7 Economics",
    "AUC": "8 Auctions",
    "WPL": "9 Worker Placement",
    "MOV": "10 Movement",
    "ARC": "11 Area Control",
    "SET": "12 Set Collection",
    "CAR": "13 Card Mechanisms",
}

for root, dirs, files in os.walk(docs_dir):
    if root == docs_dir:
        continue
    
    dir_name = os.path.basename(root)
    md_file = os.path.join(root, f"{dir_name}.md")
    
    if os.path.exists(md_file):
        with open(md_file, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Try to extract Description
        description = ""
        desc_match = re.search(r'###\s*Description\s*(.*?)(?=\n##|\Z)', content, re.DOTALL | re.IGNORECASE)
        if desc_match:
            description = desc_match.group(1).strip()
        else:
            # For category files or files without "### Description", get some initial text
            lines = content.split('\n')
            for line in lines:
                line = line.strip()
                if line and not line.startswith('#') and not line.startswith('!['):
                    description += line + "\n"
                    if len(description) > 300:
                        break
        
        # Check if it's a category (e.g., "1 Game Structure")
        is_category = bool(re.match(r'^\d+\s+', dir_name)) or dir_name == "Terminology"
        
        # Determine Prefix (e.g., ACT, STR, etc.)
        prefix = ""
        category_name = None
        prefix_match = re.match(r'^([A-Z]+)-\d+', dir_name)
        if prefix_match:
            prefix = prefix_match.group(1)
            category_name = prefix_to_category.get(prefix)
            
        entry = {
            "directory": dir_name,
            "title": dir_name,
            "is_category": is_category,
            "prefix": prefix,
            "category_name": category_name if category_name else dir_name if is_category else None,
            "description": description.strip(),
        }
        # Removing "content" as requested to keep JSON lightweight
        data.append(entry)

structured_data = {
    "categories": [],
    "mechanisms": []
}

for item in data:
    if item["is_category"]:
        structured_data["categories"].append(item)
    else:
        structured_data["mechanisms"].append(item)

# Sort them alphabetically
structured_data["categories"].sort(key=lambda x: x["directory"])
structured_data["mechanisms"].sort(key=lambda x: x["directory"])

with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(structured_data, f, indent=4, ensure_ascii=False)

print(f"Generated JSON with {len(data)} entries at {output_file}")
