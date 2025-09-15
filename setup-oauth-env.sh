#!/bin/bash

# Google OAuth 2.0 Environment Setup Script
# This script helps you set up environment variables for Google OAuth

echo "🔐 Google OAuth 2.0 Environment Setup"
echo "======================================"

# Function to validate client ID format
validate_client_id() {
    if [[ $1 =~ ^[0-9]+-[a-zA-Z0-9_]+\.apps\.googleusercontent\.com$ ]]; then
        return 0
    else
        return 1
    fi
}

# Function to set up environment for specific environment
setup_env() {
    local env_name=$1
    local env_file=".env.$env_name"
    
    echo ""
    echo "Setting up $env_name environment..."
    echo "--------------------------------"
    
    # Get Client ID
    while true; do
        read -p "Enter your Google OAuth Client ID for $env_name: " client_id
        if validate_client_id "$client_id"; then
            break
        else
            echo "❌ Invalid Client ID format. Should look like: 123456789-abcdefg.apps.googleusercontent.com"
        fi
    done
    
    # Get Client Secret
    read -s -p "Enter your Google OAuth Client Secret for $env_name: " client_secret
    echo ""
    
    # Get Redirect URI
    if [ "$env_name" = "development" ]; then
        default_uri="http://dns.localhost:3000/auth/google/callback"
    else
        default_uri="https://yourdomain.com/auth/google/callback"
    fi
    
    read -p "Enter your OAuth Redirect URI for $env_name [$default_uri]: " redirect_uri
    redirect_uri=${redirect_uri:-$default_uri}
    
    # Create environment file
    cat > "$env_file" << EOF
# $env_name Environment - Google OAuth 2.0 Credentials
# Generated on $(date)

# Google Cloud OAuth Client ID
GOOGLE_CLIENT_ID=$client_id

# Google Cloud OAuth Client Secret  
GOOGLE_CLIENT_SECRET=$client_secret

# OAuth Redirect URI
GOOGLE_REDIRECT_URI=$redirect_uri

# Environment identifier
NODE_ENV=$env_name
EOF
    
    echo "✅ Environment file created: $env_file"
}

# Main execution
echo "This script will help you set up Google OAuth credentials for different environments."
echo ""

# Ask which environments to set up
echo "Which environments would you like to set up?"
echo "1) Development only"
echo "2) Production only"  
echo "3) Both Development and Production"
read -p "Choose an option (1-3): " choice

case $choice in
    1)
        setup_env "development"
        ;;
    2)
        setup_env "production"
        ;;
    3)
        setup_env "development"
        setup_env "production"
        ;;
    *)
        echo "❌ Invalid choice. Exiting."
        exit 1
        ;;
esac

echo ""
echo "🎉 OAuth environment setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Complete the OAuth client setup in Google Cloud Console"
echo "2. Add the appropriate redirect URIs to your OAuth client"
echo "3. Test your OAuth integration"
echo ""
echo "⚠️  Important: Never commit .env files to version control!"
echo "   Add .env* to your .gitignore file"
