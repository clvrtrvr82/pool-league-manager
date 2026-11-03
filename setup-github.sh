#!/bin/bash
# ==============================================================================
# Helper Script: Publish Pool League Manager to GitHub
# ==============================================================================

set -e

echo ""
echo "🎱 Pool League Manager - Publish to GitHub"
echo "=========================================="
echo ""

# Ensure git is initialized
if [ ! -d ".git" ]; then
  echo "📦 Initializing local Git repository (main branch)..."
  git init -b main
else
  echo "✅ Git repository already initialized."
fi

# Add all files
echo "➕ Staging files..."
git add .

# Check if there is anything to commit
if git diff --staged --quiet; then
  echo "ℹ️ No changes to commit."
else
  echo "💾 Creating commit..."
  git commit -m "Deploy Pool League Manager with Railway and PostgreSQL support"
fi

# Ask user for their GitHub repo URL if remote origin doesn't exist
EXISTING_REMOTE=$(git remote get-url origin 2>/dev/null || true)

if [ -n "$EXISTING_REMOTE" ]; then
  echo "🔗 Existing remote origin found: $EXISTING_REMOTE"
  REMOTE_URL="$EXISTING_REMOTE"
else
  echo ""
  echo "👉 Enter your GitHub Repository URL:"
  echo "   (Example: https://github.com/your-username/pool-league-manager.git)"
  read -r -p "GitHub URL: " REMOTE_URL

  if [ -z "$REMOTE_URL" ]; then
    echo "❌ No URL provided. You can run 'git remote add origin <URL>' and 'git push -u origin main' manually."
    exit 1
  fi

  git remote add origin "$REMOTE_URL"
  echo "✅ Remote origin added: $REMOTE_URL"
fi

echo ""
echo "🚀 Pushing to GitHub (main branch)..."
git branch -M main
git push -u origin main

echo ""
echo "🎉 SUCCESS! Your code is now published to GitHub at:"
echo "   $REMOTE_URL"
echo ""
echo "Next steps on Railway:"
echo "1. Go to https://railway.app/new"
echo "2. Click 'Deploy from GitHub repo' and pick your repository"
echo "3. Click '+ New -> Database -> Add PostgreSQL'"
echo "4. Railway will automatically wire DATABASE_URL and launch your full-stack app!"
echo ""
