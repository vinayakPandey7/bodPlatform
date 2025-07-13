#!/bin/bash

echo "🔍 Testing Employer Registration API"
echo "=============================================="

# Test the exact endpoint with the structure the controller expects
curl -X POST http://localhost:5000/api/auth/register/employer \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "ownerName": "John Doe",
    "companyName": "Test Company",
    "phoneNumber": "1234567890",
    "address": "123 Test St",
    "city": "Test City",
    "state": "CA", 
    "zipCode": "90210",
    "country": "United States",
    "locationDetected": false
  }' \
  -w "\n\nResponse Code: %{http_code}\n" \
  -v

echo "=============================================="
echo "✅ Test completed"
