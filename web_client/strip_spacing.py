import os, glob

path = 'e:/iste apps/New folder/web_client/src/app/**/*.tsx'
for file in glob.glob(path, recursive=True):
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if 'letterSpacing: "-0.5px"' in content:
        content = content.replace(', letterSpacing: "-0.5px"', '')
        content = content.replace('letterSpacing: "-0.5px", ', '')
        content = content.replace('letterSpacing: "-0.5px"', '')
        
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'Updated {file}')
