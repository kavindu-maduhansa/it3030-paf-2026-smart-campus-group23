import os
import shutil

backend_dir = r'C:\Users\USER\Desktop\Smart-Campus\backend'

# Files to remove
files_to_remove = [
    'Dockerfile',
    'docker-compose.yml',
    'compose-up.ps1',
    'github-workflow.yml',
    'mvnw',
    'mvnw.cmd',
    '.env.example',
    '.gitattributes'
]

# Directories to remove
dirs_to_remove = ['.mvn', 'target']

print("🗑️  Starting cleanup...")
print()

# Remove files
for file in files_to_remove:
    file_path = os.path.join(backend_dir, file)
    if os.path.exists(file_path):
        os.remove(file_path)
        print(f"✅ Removed: {file}")
    else:
        print(f"⏭️  Not found: {file}")

# Remove directories
for dir_name in dirs_to_remove:
    dir_path = os.path.join(backend_dir, dir_name)
    if os.path.exists(dir_path):
        shutil.rmtree(dir_path)
        print(f"✅ Removed folder: {dir_name}")
    else:
        print(f"⏭️  Not found: {dir_name}")

print()
print("🎉 Cleanup complete!")
print()
print("📁 Remaining files:")
for item in sorted(os.listdir(backend_dir)):
    if os.path.isfile(os.path.join(backend_dir, item)):
        print(f"   - {item}")
