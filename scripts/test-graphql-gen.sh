#!/bin/bash
set -e

echo "🧪 Testing GraphQL generation..."

# Test if API is reachable
if [ -n "$PUBLIC_SALEOR_API_URL" ]; then
    echo "📡 Testing connection to $PUBLIC_SALEOR_API_URL"
    
    # Try to reach the API with timeout
    if timeout 10 curl -f -s "$PUBLIC_SALEOR_API_URL" > /dev/null 2>&1; then
        echo "✅ API is reachable"
        
        # Try GraphQL generation
        echo "🔄 Running GraphQL codegen..."
        if [ -f "pnpm-lock.yaml" ] && command -v pnpm > /dev/null 2>&1; then
            CMD="pnpm run generate"
        else
            CMD="npm run generate"
        fi
        
        if timeout 30 $CMD; then
            echo "✅ GraphQL types generated successfully"
            
            # Check if files were created
            if [ -f "src/gql/graphql.ts" ]; then
                echo "✅ graphql.ts file created"
                echo "📄 Generated files:"
                ls -la src/gql/
            else
                echo "❌ graphql.ts file not found"
                exit 1
            fi
        else
            echo "❌ GraphQL codegen failed or timed out"
            exit 1
        fi
    else
        echo "❌ Cannot reach API at $PUBLIC_SALEOR_API_URL"
        echo "   Check your internet connection and API URL"
        exit 1
    fi
else
    echo "❌ PUBLIC_SALEOR_API_URL not set"
    echo "   Please set this environment variable"
    exit 1
fi

echo "🎉 GraphQL generation test completed successfully!"
