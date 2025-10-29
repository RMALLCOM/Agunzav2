#!/usr/bin/env python3
"""
Backend API Tests for JetSMART Kiosk
Tests all backend endpoints according to the review request specifications.
"""

import requests
import json
import os
import tempfile
import random
from pathlib import Path

# Use the production URL from frontend/.env
BASE_URL = "https://jetsmart-check.preview.emergentagent.com/api"

def test_health_endpoint():
    """Test GET /api/health returns {status: 'ok'}"""
    print("🔍 Testing GET /api/health...")
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=10)
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   Response: {data}")
            if data.get("status") == "ok":
                print("   ✅ Health endpoint working correctly")
                return True
            else:
                print(f"   ❌ Expected status='ok', got: {data}")
                return False
        else:
            print(f"   ❌ Expected 200, got {response.status_code}")
            return False
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False

def test_rules_endpoint():
    """Test GET /api/rules returns L=55,W=35,H=25,KG=10"""
    print("\n🔍 Testing GET /api/rules...")
    try:
        response = requests.get(f"{BASE_URL}/rules", timeout=10)
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   Response: {data}")
            expected = {"L": 55, "W": 35, "H": 25, "KG": 10}
            if data == expected:
                print("   ✅ Rules endpoint working correctly")
                return True
            else:
                print(f"   ❌ Expected {expected}, got: {data}")
                return False
        else:
            print(f"   ❌ Expected 200, got {response.status_code}")
            return False
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False

def test_config_endpoints():
    """Test config endpoints: GET 404 initially, POST then GET returns same"""
    print("\n🔍 Testing config endpoints...")
    
    # Test initial GET should return 404
    print("   Testing initial GET /api/config (should be 404)...")
    try:
        response = requests.get(f"{BASE_URL}/config", timeout=10)
        print(f"   Status Code: {response.status_code}")
        if response.status_code == 404:
            print("   ✅ Initial config GET correctly returns 404")
        else:
            print(f"   ⚠️  Expected 404, got {response.status_code}")
    except Exception as e:
        print(f"   ❌ Error on initial GET: {e}")
        return False
    
    # Test POST config
    print("   Testing POST /api/config...")
    sample_config = {
        "operator": "JetSMART",
        "gate": "A12",
        "flight": "JA801",
        "destination": "Santiago",
        "international": True
    }
    
    try:
        response = requests.post(f"{BASE_URL}/config", 
                               json=sample_config, 
                               headers={"Content-Type": "application/json"},
                               timeout=10)
        print(f"   POST Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   POST Response: {data}")
            if data.get("ok") == True:
                print("   ✅ Config POST successful")
            else:
                print(f"   ❌ Expected ok=True, got: {data}")
                return False
        else:
            print(f"   ❌ Expected 200, got {response.status_code}")
            return False
    except Exception as e:
        print(f"   ❌ Error on POST: {e}")
        return False
    
    # Test GET config after POST
    print("   Testing GET /api/config after POST...")
    try:
        response = requests.get(f"{BASE_URL}/config", timeout=10)
        print(f"   GET Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   GET Response: {data}")
            if data == sample_config:
                print("   ✅ Config GET returns same data as POST")
                return True
            else:
                print(f"   ❌ Expected {sample_config}, got: {data}")
                return False
        else:
            print(f"   ❌ Expected 200, got {response.status_code}")
            return False
    except Exception as e:
        print(f"   ❌ Error on GET: {e}")
        return False

def test_upload_flow():
    """Test complete upload flow: start -> chunks -> finish"""
    print("\n🔍 Testing upload flow...")
    
    # Step 1: POST /api/scan/start
    print("   Step 1: POST /api/scan/start...")
    start_payload = {
        "file_name": "test.jpg",
        "mime": "image/jpeg", 
        "total_size": 204800
    }
    
    try:
        response = requests.post(f"{BASE_URL}/scan/start",
                               json=start_payload,
                               headers={"Content-Type": "application/json"},
                               timeout=10)
        print(f"   Start Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print(f"   ❌ Start failed with {response.status_code}")
            return False
            
        start_data = response.json()
        print(f"   Start Response: {start_data}")
        upload_id = start_data.get("upload_id")
        
        if not upload_id:
            print("   ❌ No upload_id in response")
            return False
            
        print(f"   ✅ Upload started with ID: {upload_id}")
        
    except Exception as e:
        print(f"   ❌ Error on start: {e}")
        return False
    
    # Step 2: POST /api/scan/chunk (send 2 chunks of 102400 bytes each)
    print("   Step 2: Sending chunks...")
    chunk_size = 102400
    
    for chunk_index in range(2):
        print(f"   Sending chunk {chunk_index + 1}/2...")
        
        # Create dummy random bytes
        chunk_data = bytes([random.randint(0, 255) for _ in range(chunk_size)])
        
        # Create temporary file for the chunk
        with tempfile.NamedTemporaryFile(delete=False) as temp_file:
            temp_file.write(chunk_data)
            temp_file_path = temp_file.name
        
        try:
            with open(temp_file_path, 'rb') as f:
                files = {'chunk': ('chunk.bin', f, 'application/octet-stream')}
                data = {
                    'upload_id': upload_id,
                    'chunk_index': chunk_index,
                    'total_chunks': 2
                }
                
                response = requests.post(f"{BASE_URL}/scan/chunk",
                                       files=files,
                                       data=data,
                                       timeout=30)
                
                print(f"   Chunk {chunk_index + 1} Status Code: {response.status_code}")
                
                if response.status_code == 200:
                    chunk_response = response.json()
                    print(f"   Chunk {chunk_index + 1} Response: {chunk_response}")
                    received = chunk_response.get("received", 0)
                    if received == chunk_size:
                        print(f"   ✅ Chunk {chunk_index + 1} uploaded successfully")
                    else:
                        print(f"   ⚠️  Expected {chunk_size} bytes, server received {received}")
                else:
                    print(f"   ❌ Chunk {chunk_index + 1} failed with {response.status_code}")
                    return False
                    
        except Exception as e:
            print(f"   ❌ Error uploading chunk {chunk_index + 1}: {e}")
            return False
        finally:
            # Clean up temp file
            try:
                os.unlink(temp_file_path)
            except:
                pass
    
    # Step 3: POST /api/scan/finish
    print("   Step 3: POST /api/scan/finish...")
    finish_payload = {"upload_id": upload_id}
    
    try:
        response = requests.post(f"{BASE_URL}/scan/finish",
                               json=finish_payload,
                               headers={"Content-Type": "application/json"},
                               timeout=10)
        print(f"   Finish Status Code: {response.status_code}")
        
        if response.status_code == 200:
            finish_data = response.json()
            print(f"   Finish Response: {finish_data}")
            
            # Validate response structure
            saved_path = finish_data.get("saved_path")
            file_name = finish_data.get("file_name")
            results = finish_data.get("results")
            
            if not saved_path:
                print("   ❌ No saved_path in response")
                return False
                
            if not file_name or not file_name.startswith("equipaje_"):
                print(f"   ❌ file_name should start with 'equipaje_', got: {file_name}")
                return False
                
            if not results or not isinstance(results, dict):
                print("   ❌ No results object in response")
                return False
                
            # Check required fields in results
            required_fields = ["L", "W", "H", "KG", "calibrationOk", "reasons", "complies", "overages"]
            missing_fields = [field for field in required_fields if field not in results]
            
            if missing_fields:
                print(f"   ❌ Missing required fields in results: {missing_fields}")
                return False
                
            print(f"   ✅ Upload completed successfully")
            print(f"   📁 Saved to: {saved_path}")
            print(f"   📄 File name: {file_name}")
            
            # Try to verify directory exists (this might not work in containerized environment)
            try:
                saved_dir = str(Path(saved_path).parent)
                print(f"   📂 Directory: {saved_dir}")
                if "imagenes_ia" in saved_dir:
                    print("   ✅ File saved to imagenes_ia directory as expected")
                else:
                    print(f"   ⚠️  Expected imagenes_ia in path, got: {saved_dir}")
            except Exception as e:
                print(f"   ⚠️  Could not verify directory: {e}")
            
            return True
            
        else:
            print(f"   ❌ Finish failed with {response.status_code}")
            try:
                error_data = response.json()
                print(f"   Error details: {error_data}")
            except:
                print(f"   Error text: {response.text}")
            return False
            
    except Exception as e:
        print(f"   ❌ Error on finish: {e}")
        return False

def test_invalid_upload_id():
    """Test edge case: invalid upload_id should return 404"""
    print("\n🔍 Testing edge case: invalid upload_id...")
    
    fake_upload_id = "invalid-upload-id-12345"
    
    # Test invalid upload_id on chunk endpoint
    print("   Testing /api/scan/chunk with invalid upload_id...")
    try:
        chunk_data = b"dummy data"
        with tempfile.NamedTemporaryFile(delete=False) as temp_file:
            temp_file.write(chunk_data)
            temp_file_path = temp_file.name
        
        try:
            with open(temp_file_path, 'rb') as f:
                files = {'chunk': ('chunk.bin', f, 'application/octet-stream')}
                data = {
                    'upload_id': fake_upload_id,
                    'chunk_index': 0,
                    'total_chunks': 1
                }
                
                response = requests.post(f"{BASE_URL}/scan/chunk",
                                       files=files,
                                       data=data,
                                       timeout=10)
                
                print(f"   Status Code: {response.status_code}")
                
                if response.status_code == 404:
                    print("   ✅ Invalid upload_id correctly returns 404")
                    return True
                else:
                    print(f"   ❌ Expected 404, got {response.status_code}")
                    return False
                    
        finally:
            try:
                os.unlink(temp_file_path)
            except:
                pass
                
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False

def main():
    """Run all backend tests"""
    print("🚀 Starting JetSMART Kiosk Backend API Tests")
    print(f"🌐 Testing against: {BASE_URL}")
    print("=" * 60)
    
    results = {}
    
    # Run all tests
    results["health"] = test_health_endpoint()
    results["rules"] = test_rules_endpoint()
    results["config"] = test_config_endpoints()
    results["upload_flow"] = test_upload_flow()
    results["invalid_upload"] = test_invalid_upload_id()
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 TEST SUMMARY")
    print("=" * 60)
    
    passed = sum(1 for result in results.values() if result)
    total = len(results)
    
    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"   {test_name.upper()}: {status}")
    
    print(f"\n🎯 Overall: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed!")
        return True
    else:
        print("⚠️  Some tests failed - check logs above")
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)