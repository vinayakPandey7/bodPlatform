#!/bin/bash

# Interactive Employer Signup and Location Testing Script
echo "🚀 BOD Platform - Employer Signup & Location Testing"
echo "=================================================="
echo ""

API_BASE="http://localhost:5000/api"

# Check if server is running
echo "🔍 Checking if server is running..."
if curl -s $API_BASE > /dev/null; then
    echo "✅ Server is running on port 5000"
else
    echo "❌ Server is not running. Please start the server first:"
    echo "   cd /Users/vinayakpandey/Desktop/bodPlatform/server"
    echo "   npm run dev"
    exit 1
fi

echo ""
echo "📋 Choose an option:"
echo "1. 🏢 Sign up as a new employer"
echo "2. 🔍 Test location-based job search"
echo "3. 🧪 Run validation tests"
echo "4. 📊 View all tests at once"
echo ""

read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        echo ""
        echo "🏢 EMPLOYER SIGNUP FORM"
        echo "======================"
        
        read -p "👤 Owner Name: " owner_name
        read -p "📧 Email: " email
        read -p "🔒 Password: " password
        read -p "🏢 Company Name: " company_name
        read -p "📞 Phone Number: " phone_number
        read -p "🏠 Address: " address
        read -p "🌆 City: " city
        read -p "🗺️  State (e.g., CA, NY, TX): " state
        read -p "📮 Zip Code: " zip_code
        
        echo ""
        echo "📤 Submitting employer registration..."
        
        curl -X POST $API_BASE/auth/register/employer \
        -H "Content-Type: application/json" \
        -d "{
            \"ownerName\": \"$owner_name\",
            \"email\": \"$email\",
            \"password\": \"$password\",
            \"companyName\": \"$company_name\",
            \"phoneNumber\": \"$phone_number\",
            \"address\": \"$address\",
            \"city\": \"$city\",
            \"state\": \"$state\",
            \"zipCode\": \"$zip_code\",
            \"country\": \"United States\",
            \"locationDetected\": false
        }" | jq .
        ;;
        
    2)
        echo ""
        echo "🔍 LOCATION-BASED JOB SEARCH"
        echo "============================"
        
        read -p "📮 Enter zip code to search jobs nearby: " search_zip
        read -p "📄 Number of jobs to show (default: 5): " limit
        limit=${limit:-5}
        
        echo ""
        echo "🔍 Searching for jobs within 5 miles of $search_zip..."
        
        curl -X GET "$API_BASE/jobs/candidates/nearby?zipCode=$search_zip&page=1&limit=$limit" | jq .
        ;;
        
    3)
        echo ""
        echo "🧪 VALIDATION TESTS"
        echo "=================="
        
        echo "🚫 Test 1: Missing Zip Code"
        curl -X POST $API_BASE/auth/register/employer \
        -H "Content-Type: application/json" \
        -d '{
            "ownerName": "Test User",
            "email": "test@example.com",
            "password": "Password123!",
            "companyName": "Test Company",
            "phoneNumber": "555-123-4567",
            "address": "123 Test St",
            "city": "Test City",
            "state": "CA",
            "country": "United States",
            "locationDetected": false
        }' | jq .
        
        echo ""
        echo "🚫 Test 2: Non-US Country"
        curl -X POST $API_BASE/auth/register/employer \
        -H "Content-Type: application/json" \
        -d '{
            "ownerName": "International User",
            "email": "intl@example.com",
            "password": "Password123!",
            "companyName": "International Company",
            "phoneNumber": "555-123-4567",
            "address": "123 International St",
            "city": "Toronto",
            "state": "ON",
            "zipCode": "M5V 1A1",
            "country": "Canada",
            "locationDetected": false
        }' | jq .
        ;;
        
    4)
        echo ""
        echo "📊 RUNNING ALL TESTS"
        echo "==================="
        
        node employer-signup-demo.js
        ;;
        
    *)
        echo "❌ Invalid choice. Please run the script again and choose 1-4."
        ;;
esac

echo ""
echo "✨ Test completed! You can run this script again to test more scenarios."
