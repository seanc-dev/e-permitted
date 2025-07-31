#!/bin/bash

# Security check script to prevent committing sensitive files
# Run this before committing: ./scripts/security-check.sh

set -e

echo "🔒 Running security checks..."

# Check for .env files in staging area
if git diff --cached --name-only | grep -E "\.env"; then
    echo "❌ ERROR: .env files detected in staging area!"
    echo "Please remove .env files before committing."
    echo "Files found:"
    git diff --cached --name-only | grep -E "\.env"
    exit 1
fi

# Check for .env files in working directory that might be accidentally added
if git status --porcelain | grep -E "\.env"; then
    echo "⚠️  WARNING: .env files detected in working directory"
    echo "These files should not be committed:"
    git status --porcelain | grep -E "\.env"
    echo ""
    echo "Please ensure these files are in .gitignore"
fi

# Check for common sensitive patterns in staged files
if git diff --cached | grep -i -E "(api_key|password|secret|token)"; then
    echo "⚠️  WARNING: Potential sensitive data detected in staged files"
    echo "Please review before committing."
fi

# Verify .gitignore contains necessary patterns
if ! grep -q "\.env" .gitignore; then
    echo "❌ ERROR: .env pattern not found in .gitignore"
    exit 1
fi

if ! grep -q "backend/\.env" .gitignore; then
    echo "❌ ERROR: backend/.env pattern not found in .gitignore"
    exit 1
fi

echo "✅ Security checks passed!"
echo "Safe to commit." 