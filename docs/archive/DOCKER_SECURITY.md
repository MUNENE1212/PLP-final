# Docker Security Guide

## ⚠️ CRITICAL: Before Using Docker Compose

**NEVER run `docker-compose up` without creating a `.env` file first!**

### Quick Start (Secure Setup)

1. **Copy the example environment file:**
   ```bash
   cp .env.docker.example .env
   ```

2. **Generate strong secrets:**
   ```bash
   # Generate JWT secrets (run twice for two different secrets)
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

3. **Edit `.env` and fill in ALL required values:**
   - Set strong MongoDB credentials (minimum 20 characters)
   - Add the generated JWT secrets
   - Configure other services as needed

4. **Verify `.env` is in `.gitignore`:**
   ```bash
   grep -E "^\.env$|^\.env\*" .gitignore
   ```
   If not found, add it immediately!

5. **Now you can start Docker:**
   ```bash
   docker-compose up -d
   ```

## 🔒 Security Best Practices

### 1. Environment Variables

**DO:**
- ✅ Always use environment variables for sensitive data
- ✅ Use strong, randomly generated passwords (20+ characters)
- ✅ Generate unique secrets for JWT_SECRET and JWT_REFRESH_SECRET
- ✅ Keep `.env` file in `.gitignore`
- ✅ Use different credentials for development and production
- ✅ Store production credentials in a secure password manager

**DON'T:**
- ❌ Never commit `.env` files to version control
- ❌ Never use default/example passwords in production
- ❌ Never reuse passwords across services
- ❌ Never share credentials in plaintext (Slack, email, etc.)
- ❌ Never use weak passwords like "password123"

### 2. Docker Image Security

**Protecting Sensitive Files:**

The following files are excluded from Docker images via `.dockerignore`:
- `.env` and all `.env*` variants
- `google-credentials.json` and all `*credentials.json` files
- Service account keys (`service-account*.json`)
- Firebase credentials
- Private keys (`.pem`, `.key` files)

**IMPORTANT:** Even though these files are excluded, never commit them to git!

### 3. Credential Files (Google Drive, Firebase, etc.)

**For Local Development:**
- Store credential files in project root (they're in `.dockerignore` and `.gitignore`)
- Never commit these files to version control

**For Docker:**
- **Option 1 (Recommended):** Use environment variables
  ```bash
  # In .env file
  GOOGLE_CREDENTIALS_JSON='{"type":"service_account","project_id":"..."}'
  ```

- **Option 2:** Mount as a volume (for local development only)
  ```yaml
  volumes:
    - ./google-credentials.json:/app/google-credentials.json:ro
  ```
  **WARNING:** Only use volumes for local development, never in production!

**For Production (Render, AWS, etc.):**
- Use environment variables or secrets management
- See `backend/RENDER_DEPLOYMENT_GUIDE.md` for cloud deployment

### 4. MongoDB Security

**Docker Compose:**
- Always set strong `MONGO_ROOT_USERNAME` and `MONGO_ROOT_PASSWORD`
- Don't expose port 27017 to the internet (only to Docker network)
- Use authentication (enabled by default in our setup)

**Production:**
- Use MongoDB Atlas or managed MongoDB service
- Enable IP whitelisting
- Use connection strings with authentication
- Enable SSL/TLS connections
- Regularly backup your database

### 5. Redis Security

**Docker Compose:**
- Redis has no authentication by default (local development only)
- Don't expose port 6379 to the internet

**Production:**
- Use Redis Cloud or managed Redis service
- Enable password authentication
- Use SSL/TLS connections
- Restrict network access

### 6. Network Security

**Docker Networks:**
- Services communicate via internal `ementech-network`
- Only necessary ports are exposed to host machine
- Database ports should never be exposed in production

**Port Exposure:**
- Development: Ports exposed for testing (27017, 6379, 5000, 3000)
- Production: Only expose application ports (5000, 80/443)

### 7. Checking for Exposed Secrets

**Before committing:**
```bash
# Check for accidentally staged credential files
git status | grep -E "\.env|credentials\.json|service-account"

# Check for secrets in files
git diff --cached | grep -iE "password|secret|key|token"

# Scan for common secret patterns
git diff --cached | grep -E "mongodb://|postgres://|mysql://|redis://"
```

**After commit (if you find secrets):**
```bash
# If secrets were committed but NOT pushed
git reset HEAD~1  # Undo last commit
# Remove the secrets from files
# Re-commit without secrets

# If secrets were pushed to remote
# 1. Immediately rotate all exposed credentials
# 2. Remove from git history (advanced - see GitHub docs)
# 3. Force push (be careful!)
```

## 🔍 Security Checklist

Before deploying or committing:

- [ ] `.env` file created with strong credentials
- [ ] `.env` is in `.gitignore`
- [ ] No default passwords used
- [ ] JWT secrets are randomly generated (64+ characters)
- [ ] MongoDB credentials are strong (20+ characters)
- [ ] No credential files committed (`google-credentials.json`, etc.)
- [ ] No hardcoded API keys in code
- [ ] `.dockerignore` includes all sensitive files
- [ ] Production uses different credentials than development
- [ ] Credentials stored securely (password manager)
- [ ] `git status` shows no sensitive files

## 📚 Additional Resources

- [OWASP Docker Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Docker_Security_Cheat_Sheet.html)
- [MongoDB Security Checklist](https://docs.mongodb.com/manual/administration/security-checklist/)
- [Docker Secrets Management](https://docs.docker.com/engine/swarm/secrets/)
- [Environment Variables Best Practices](https://12factor.net/config)

## 🆘 What to Do If Secrets Are Exposed

1. **Immediately rotate all exposed credentials:**
   - Generate new JWT secrets
   - Change database passwords
   - Revoke and recreate API keys
   - Delete and recreate service account keys

2. **Remove from git history:**
   - Use `git filter-branch` or `BFG Repo-Cleaner`
   - Force push to remote (coordinate with team)
   - See: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository

3. **Update all deployment environments:**
   - Update production environment variables
   - Restart all services
   - Verify new credentials work

4. **Monitor for unauthorized access:**
   - Check database logs
   - Check API access logs
   - Monitor for unusual activity

5. **Learn and improve:**
   - Review what went wrong
   - Update security procedures
   - Consider using secrets management tools
