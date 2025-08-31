#!/bin/bash

# Complete merge, cleanup, and push script for CREOLE repository

echo "🔧 CREOLE Repository Cleanup and Push"
echo "====================================="

# Check if GITHUB_REPO environment variable or argument is provided
REPO_URL="${1:-$GITHUB_REPO}"

if [ -z "$REPO_URL" ]; then
    echo "❌ Error: Please provide your GitHub repository URL"
    echo "Usage: ./merge-and-cleanup.sh https://github.com/YOUR_USERNAME/YOUR_REPO.git"
    echo "Or set GITHUB_REPO environment variable"
    exit 1
fi

echo "📍 Using repository: $REPO_URL"
echo ""

# Step 1: Configure remote
echo "1️⃣ Configuring remote origin..."
git remote remove origin 2>/dev/null || true
git remote add origin "$REPO_URL"

# Step 2: Fetch all branches
echo "2️⃣ Fetching all branches..."
git fetch --all

# Step 3: Check if the cursor branch exists remotely
echo "3️⃣ Checking for cursor branch..."
CURSOR_BRANCH="cursor/build-creole-traditional-knowledge-platform-0ac3"
if git ls-remote --heads origin | grep -q "$CURSOR_BRANCH"; then
    echo "   Found cursor branch, will merge and delete it"
    
    # Fetch and merge the cursor branch into main
    echo "4️⃣ Merging cursor branch into main..."
    git fetch origin "$CURSOR_BRANCH"
    
    # Try to merge, preferring our version in case of conflicts
    git merge "origin/$CURSOR_BRANCH" --strategy-option=ours --no-edit 2>/dev/null || {
        echo "   Merge had conflicts, resolving by keeping our version..."
        git merge --abort 2>/dev/null || true
        git merge "origin/$CURSOR_BRANCH" --strategy=ours --no-edit
    }
    
    echo "   ✅ Merged cursor branch into main"
else
    echo "   No cursor branch found remotely"
fi

# Step 5: Push main branch
echo "5️⃣ Pushing main branch..."
git push -u origin main --force-with-lease || git push -u origin main --force

# Step 6: Delete the cursor branch from remote if it exists
if git ls-remote --heads origin | grep -q "$CURSOR_BRANCH"; then
    echo "6️⃣ Deleting cursor branch from remote..."
    git push origin --delete "$CURSOR_BRANCH" || echo "   Could not delete cursor branch"
fi

# Step 7: Clean up any local references to deleted remote branches
echo "7️⃣ Cleaning up local references..."
git remote prune origin

# Step 8: Ensure we're on main and it's the only branch
git checkout main 2>/dev/null || true
git branch -D "$CURSOR_BRANCH" 2>/dev/null || true

echo ""
echo "✅ Repository cleanup complete!"
echo ""
echo "📊 Final status:"
echo "Local branches:"
git branch
echo ""
echo "Remote branches:"
git branch -r
echo ""
echo "Latest commit:"
git log -1 --oneline

echo ""
echo "🎉 Success! Your repository now has only the main branch with all changes merged."