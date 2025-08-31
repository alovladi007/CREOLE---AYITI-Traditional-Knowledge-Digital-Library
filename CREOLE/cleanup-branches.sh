#!/bin/bash

# Script to clean up extra branches and keep only main

echo "🧹 Cleaning up branches - keeping only 'main'"
echo "============================================"

# Check if remote is configured
if ! git remote | grep -q origin; then
    echo "❌ No remote 'origin' configured."
    echo "Please add your GitHub repository:"
    echo "  git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git"
    exit 1
fi

echo "📍 Current local branches:"
git branch

echo ""
echo "📡 Fetching remote branches..."
git fetch --all

echo ""
echo "🌐 Remote branches:"
git branch -r

echo ""
echo "🗑️  Deleting remote branch: cursor/build-creole-traditional-knowledge-platform-0ac3"
git push origin --delete cursor/build-creole-traditional-knowledge-platform-0ac3 2>/dev/null || echo "Branch may already be deleted or doesn't exist"

echo ""
echo "📤 Ensuring main branch is pushed and set as upstream..."
git push -u origin main

echo ""
echo "✅ Done! You should now have only the 'main' branch."
echo ""
echo "Final branch status:"
echo "Local branches:"
git branch
echo ""
echo "Remote branches:"
git branch -r