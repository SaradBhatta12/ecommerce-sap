# Google Cloud OAuth 2.0 Setup Guide (Multi-Tenant)

This guide walks you through setting up Google OAuth 2.0 credentials for a multi-tenant application.

## Prerequisites

- Google Cloud Platform account
- Access to Google Cloud Console
- Project with billing enabled (if required)

## Step 1: Create OAuth 2.0 Client in Google Cloud Console

### 1.1 Navigate to Google Cloud Console
1. Go to https://console.cloud.google.com
2. Select your project or create a new one

### 1.2 Enable Required APIs
1. Go to **APIs & Services** → **Library**
2. Search for and enable:
   - Google+ API (for basic profile info)
   - Google OAuth2 API (if available)

### 1.3 Create OAuth 2.0 Client
1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth 2.0 Client ID**
3. Configure the OAuth consent screen if prompted:
   - Choose **External** for multi-tenant applications
   - Fill in required fields (App name, User support email, etc.)
   - Add your domain to **Authorized domains**
4. Select **Web application** as the application type
5. Give it a descriptive name (e.g., "Multi-tenant OAuth Client")

## Step 2: Configure Redirect URIs

### 2.1 Understanding Multi-Tenant Redirect URIs

⚠️ **Important**: Google Cloud Console doesn't support wildcard subdomains (`*.yourdomain.com`) directly. You have several options:

#### Option A: Add Each Subdomain Explicitly
Add each tenant subdomain manually:
- `https://tenant1.yourdomain.com/auth/google/callback`
- `https://tenant2.yourdomain.com/auth/google/callback`
- `https://tenant3.yourdomain.com/auth/google/callback`

#### Option B: Use a Central Auth Service (Recommended)
Create a central authentication service:
- `https://auth.yourdomain.com/google/callback`
- After authentication, redirect to the appropriate tenant subdomain

#### Option C: Use Path-Based Tenancy
Instead of subdomains, use paths:
- `https://yourdomain.com/tenant1/auth/google/callback`
- `https://yourdomain.com/tenant2/auth/google/callback`

### 2.2 Add Development URIs
For local development, add:
- `http://localhost:3000/auth/google/callback`
- `http://dns.localhost:3000/auth/google/callback`
- `http://127.0.0.1:3000/auth/google/callback`

### 2.3 Configure in Google Cloud Console
1. In your OAuth 2.0 Client configuration
2. Under **Authorized redirect URIs**, click **Add URI**
3. Add each URI from your chosen approach above
4. Click **Save**

## Step 3: Set Up Environment Variables

### 3.1 Automated Setup (Recommended)
Run the provided setup script:
```bash
./setup-oauth-env.sh
```

### 3.2 Manual Setup
1. Copy the appropriate template file:
   ```bash
   cp .env.development.template .env.development
   cp .env.production.template .env.production
   ```

2. Edit the files with your actual credentials:
   - `GOOGLE_CLIENT_ID`: Your OAuth 2.0 Client ID
   - `GOOGLE_CLIENT_SECRET`: Your OAuth 2.0 Client Secret
   - `GOOGLE_REDIRECT_URI`: Your redirect URI

### 3.3 Environment-Specific Configuration

#### Development Environment
```bash
GOOGLE_CLIENT_ID=your_dev_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_dev_client_secret
GOOGLE_REDIRECT_URI=http://dns.localhost:3000/auth/google/callback
```

#### Production Environment
```bash
GOOGLE_CLIENT_ID=your_prod_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_prod_client_secret
GOOGLE_REDIRECT_URI=https://yourdomain.com/auth/google/callback
```

## Step 4: Security Best Practices

### 4.1 Environment Variables
- ✅ Use separate OAuth clients for dev/staging/production
- ✅ Store credentials as environment variables
- ✅ Never commit `.env` files to version control
- ✅ Use secure environment variable management in production

### 4.2 OAuth Configuration
- ✅ Use HTTPS in production
- ✅ Implement proper CSRF protection
- ✅ Validate redirect URIs server-side
- ✅ Use short-lived access tokens

### 4.3 Multi-Tenant Considerations
- ✅ Validate tenant context in callbacks
- ✅ Implement proper tenant isolation
- ✅ Log OAuth events for security monitoring

## Step 5: Testing Your Setup

### 5.1 Verify Environment Variables
```bash
# Check if variables are loaded (don't print secrets)
echo "Client ID configured: ${GOOGLE_CLIENT_ID:+Yes}"
echo "Client Secret configured: ${GOOGLE_CLIENT_SECRET:+Yes}"
echo "Redirect URI: $GOOGLE_REDIRECT_URI"
```

### 5.2 Test OAuth Flow
1. Start your application
2. Navigate to the login page
3. Initiate Google OAuth flow
4. Verify successful authentication and redirect

## Troubleshooting

### Common Issues

1. **Invalid Redirect URI**
   - Ensure the redirect URI exactly matches what's configured in Google Cloud Console
   - Check for trailing slashes, HTTP vs HTTPS, port numbers

2. **Client ID/Secret Mismatch**
   - Verify you're using the correct credentials for your environment
   - Check for copy-paste errors or extra spaces

3. **Consent Screen Issues**
   - Ensure your OAuth consent screen is properly configured
   - For external apps, you may need to go through verification process

4. **Multi-Tenant Redirect Problems**
   - Consider using a central auth service approach
   - Validate tenant context in your application logic

## Files Created

- `.env.template` - Template for environment variables
- `.env.development.template` - Development environment template
- `.env.production.template` - Production environment template
- `setup-oauth-env.sh` - Interactive setup script
- `GOOGLE_OAUTH_SETUP.md` - This guide

## Next Steps

1. ✅ Complete OAuth client setup in Google Cloud Console
2. ✅ Add appropriate redirect URIs
3. ✅ Set up environment variables
4. ⬜ Implement OAuth flow in your application
5. ⬜ Test authentication across different tenants
6. ⬜ Set up production environment variables securely

---

**Security Note**: Keep your OAuth credentials secure and never expose them in client-side code or commit them to version control.
