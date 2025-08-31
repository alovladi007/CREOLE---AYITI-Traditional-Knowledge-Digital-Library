#!/bin/bash

echo "🚀 GitHub Repository Setup for CREOLE"
echo "===================================="
echo ""
echo "Please enter your GitHub repository URL"
echo "Format: https://github.com/USERNAME/REPOSITORY.git"
echo "Example: https://github.com/johndoe/creole.git"
echo ""
read -p "GitHub URL: " REPO_URL

if [ -z "$REPO_URL" ]; then
    echo "❌ No URL provided. Exiting."
    exit 1
fi

echo ""
echo "Setting up repository: $REPO_URL"
echo ""

# Remove existing remote and add new one
git remote remove origin 2>/dev/null || true
git remote add origin "$REPO_URL"

echo "Attempting to fetch from repository..."
if git fetch --all 2>&1 | grep -q "Repository not found\|fatal"; then
    echo ""
    echo "❌ Could not access repository. Please check:"
    echo "   1. The URL is correct"
    echo "   2. The repository exists"
    echo "   3. You have access permissions"
    echo ""
    echo "If this is a private repository, you may need to:"
    echo "   - Use a personal access token"
    echo "   - Set up SSH keys"
    echo "   - Login with: gh auth login (if using GitHub CLI)"
    exit 1
fi

echo "✅ Successfully connected to repository!"
echo ""

# Now run the merge and cleanup
./merge-and-cleanup.sh "$REPO_URL"