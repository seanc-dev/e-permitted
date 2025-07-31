# Security Policy

## Environment Files and Sensitive Data

### Critical Security Rules

1. **NEVER commit `.env` files or any files containing API keys, passwords, or other sensitive data**
2. **ALWAYS use `.env.example` files for templates**
3. **Manual intervention required for any `.env` file operations**

### Environment File Management

#### Before Working with Environment Files
- **STOP** and request manual intervention before touching any `.env` file
- Verify the file is properly listed in `.gitignore`
- Check git history to ensure no sensitive data has been committed

#### Proper Environment File Setup
1. Create `.env.example` files with placeholder values
2. Add all `.env*` patterns to `.gitignore`
3. Document required environment variables in README
4. Use environment-specific files (`.env.development`, `.env.test`, etc.)

#### If Sensitive Data is Accidentally Committed
1. **IMMEDIATELY** revoke and rotate any exposed credentials
2. Use `git filter-repo` to completely remove the file from history
3. Force push the cleaned history
4. Update `.gitignore` to prevent future issues
5. Document the incident and lessons learned

### API Key Security

#### OpenAI API Keys
- Store in environment variables only
- Use different keys for development, testing, and production
- Rotate keys regularly
- Monitor usage for unusual activity

#### Database Credentials
- Use environment variables for all database connections
- Never hardcode credentials in source code
- Use connection pooling in production

### Code Review Security Checklist

Before merging any PR:
- [ ] No `.env` files in the diff
- [ ] No hardcoded credentials
- [ ] No API keys in comments or documentation
- [ ] `.gitignore` properly configured
- [ ] Environment variables documented

### Emergency Response

If sensitive data is exposed:
1. **Immediate Actions:**
   - Revoke all exposed credentials
   - Generate new credentials
   - Remove sensitive data from git history
   - Force push cleaned history

2. **Documentation:**
   - Document the incident
   - Update security procedures
   - Review and improve `.gitignore`
   - Add additional safeguards

### Development Workflow

#### Safe Environment Setup
```bash
# Copy example file
cp .env.example .env

# Edit with your actual values
# NEVER commit the .env file
```

#### Before Committing
```bash
# Check what files will be committed
git status

# Verify no .env files are included
git diff --cached --name-only | grep -E "\.env"
```

### Tools and Commands

#### Check for Sensitive Files in History
```bash
git log --all --name-only --pretty=format: | grep -E "\.env" | sort | uniq
```

#### Remove File from History (Emergency Only)
```bash
git filter-repo --path .env.backup --invert-paths --force
git push --force origin <branch-name>
```

#### Verify .gitignore is Working
```bash
git check-ignore .env
git check-ignore backend/.env
```

### Contact

For security issues or questions:
- Create a private issue in the repository
- Use secure communication channels
- Follow incident response procedures

---

**Remember: When in doubt, ask for manual intervention before touching any environment files.** 