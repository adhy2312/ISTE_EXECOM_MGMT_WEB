import os
import re

def remove_unused_import(file_path, unused_vars):
    if not os.path.exists(file_path): return
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    for var in unused_vars:
        content = re.sub(r',\s*\b' + var + r'\b', '', content)
        content = re.sub(r'\b' + var + r'\b\s*,', '', content)
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

def comment_out_unused_assignment(file_path, unused_vars):
    if not os.path.exists(file_path): return
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    for var in unused_vars:
        for i, line in enumerate(lines):
            if var in line and ('const ' + var in line or 'let ' + var in line or 'function ' + var in line or 'useState' in line):
                lines[i] = '// ' + line
                
    with open(file_path, 'w', encoding='utf-8') as f:
        f.writelines(lines)

remove_unused_import('src/app/evaluation/page.tsx', ['UserRole'])
remove_unused_import('src/app/page.tsx', ['EnergyPointStatus', 'UserRole'])
remove_unused_import('src/app/points/page.tsx', ['UserRole'])
remove_unused_import('src/app/tasks/page.tsx', ['UserRole', 'ROOT_ADMINS'])
remove_unused_import('src/app/observatory/page.tsx', ['Loader2'])
remove_unused_import('src/app/hub/page.tsx', ['Box'])

comment_out_unused_assignment('src/app/evaluation/page.tsx', ['ROOT_ADMIN'])
comment_out_unused_assignment('src/components/Navigation.tsx', ['ROOT_ADMIN'])
comment_out_unused_assignment('src/app/executive/page.tsx', ['newMemberForm', 'setNewMemberForm', 'addError', 'addLoading', 'handleAddUser', 'labelSt'])
comment_out_unused_assignment('src/app/settings/page.tsx', ['emptyWhitelistForm'])
remove_unused_import('src/store/members.ts', ['addDoc', 'deleteDoc'])

def replace_any(file_path):
    if not os.path.exists(file_path): return
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    content = content.replace(': any', ': unknown')
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

replace_any('src/app/hub/vault/page.tsx')
replace_any('src/store/auth.ts')

print("Done fixing lints.")
