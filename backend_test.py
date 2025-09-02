import requests
import sys
from datetime import datetime

class KioskAPITester:
    def __init__(self, base_url="https://kiosk-validator.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.session_id = None

    def run_test(self, name, method, endpoint, expected_status, data=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return True, response.json()
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    print(f"   Response: {response.text[:200]}")
                except:
                    pass

            return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_root_endpoint(self):
        """Test root API endpoint"""
        success, response = self.run_test(
            "Root API Endpoint",
            "GET",
            "",
            200
        )
        if success and response.get('message') == "Kiosk API ready":
            print("   ✅ Correct message returned")
            return True
        elif success:
            print(f"   ⚠️  Unexpected message: {response.get('message')}")
            return False
        return False

    def test_airlines_config(self):
        """Test airlines configuration"""
        success, response = self.run_test(
            "Airlines Config",
            "GET",
            "config/airlines",
            200
        )
        if success and isinstance(response, list):
            print(f"   ✅ Found {len(response)} airlines")
            return True
        return False

    def test_create_session(self):
        """Test session creation"""
        success, response = self.run_test(
            "Create Session",
            "POST",
            "sessions",
            200,
            data={"airline_code": "JSM", "language": "es"}
        )
        if success and 'id' in response:
            self.session_id = response['id']
            print(f"   ✅ Session created with ID: {self.session_id}")
            return True
        return False

    def test_setup_save(self):
        """Test setup save"""
        setup_data = {
            "operator_name": "Test Operator",
            "gate": "A1",
            "flight_number": "JS123",
            "destination": "Santiago",
            "is_international": False
        }
        success, response = self.run_test(
            "Save Setup",
            "POST",
            "setup",
            200,
            data=setup_data
        )
        if success and 'id' in response:
            print(f"   ✅ Setup saved with ID: {response['id']}")
            return True
        return False

    def test_get_setup(self):
        """Test get active setup"""
        success, response = self.run_test(
            "Get Active Setup",
            "GET",
            "setup",
            200
        )
        if success and 'operator_name' in response:
            print(f"   ✅ Active setup found: {response['operator_name']}")
            return True
        return False

    def test_scan_simulation(self):
        """Test scan simulation"""
        if not self.session_id:
            print("   ❌ No session ID available for scan test")
            return False
            
        success, response = self.run_test(
            "Scan Simulation",
            "POST",
            "scan",
            200,
            data={"session_id": self.session_id, "weight_kg": 8.5}
        )
        if success and 'dims_cm' in response and 'compliant' in response:
            print(f"   ✅ Scan result: compliant={response['compliant']}")
            print(f"   Dimensions: {response['dims_cm']}")
            print(f"   Weight: {response['weight_kg']} kg")
            if response.get('errors'):
                print(f"   Errors: {response['errors']}")
            return True
        return False

    def test_rules_endpoint(self):
        """Test rules for JSM airline"""
        success, response = self.run_test(
            "Get Rules for JSM",
            "GET",
            "rules/JSM",
            200
        )
        if success and 'max_weight_kg' in response:
            print(f"   ✅ Rules found - Max weight: {response['max_weight_kg']} kg")
            print(f"   Max dimensions: {response['dims_cm']}")
            return True
        return False

    def test_payment_simulation(self):
        """Test payment simulation"""
        if not self.session_id:
            print("   ❌ No session ID available for payment test")
            return False
            
        success, response = self.run_test(
            "Payment Simulation",
            "POST",
            "payments/simulate",
            200,
            data={"session_id": self.session_id, "total": 45.0, "method": "card"}
        )
        if success and 'status' in response:
            print(f"   ✅ Payment result: {response['status']}")
            return True
        return False

def main():
    print("🚀 Starting Kiosk API Backend Tests")
    print("=" * 50)
    
    tester = KioskAPITester()
    
    # Run all tests
    tests = [
        tester.test_root_endpoint,
        tester.test_airlines_config,
        tester.test_rules_endpoint,
        tester.test_create_session,
        tester.test_setup_save,
        tester.test_get_setup,
        tester.test_scan_simulation,
        tester.test_payment_simulation,
    ]
    
    for test in tests:
        test()
    
    # Print results
    print("\n" + "=" * 50)
    print(f"📊 Backend API Test Results: {tester.tests_passed}/{tester.tests_run} passed")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All backend tests passed!")
        return 0
    else:
        print("⚠️  Some backend tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())