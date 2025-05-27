#!/usr/bin/env python3
"""
Comprehensive test runner for microservices communication example.
Orchestrates different types of tests in the correct order.
"""

import os
import sys
import time
import subprocess
import argparse
from pathlib import Path

class TestRunner:
    """Orchestrates different types of tests for the microservices system."""
    
    def __init__(self, base_dir):
        self.base_dir = Path(base_dir)
        self.test_dir = self.base_dir / "tests"
        self.venv_dir = self.base_dir / "venv"
        
    def setup_test_environment(self):
        """Set up Python virtual environment and install dependencies."""
        print("🔧 Setting up test environment...")
        
        # Create virtual environment if it doesn't exist
        if not self.venv_dir.exists():
            print("Creating Python virtual environment...")
            subprocess.run([sys.executable, "-m", "venv", str(self.venv_dir)], check=True)
        
        # Install test dependencies
        pip_executable = self.venv_dir / "bin" / "pip"
        if not pip_executable.exists():
            pip_executable = self.venv_dir / "Scripts" / "pip.exe"  # Windows
        
        print("Installing test dependencies...")
        subprocess.run([
            str(pip_executable), "install", "-r", 
            str(self.test_dir / "requirements.txt")
        ], check=True)
        
        print("✅ Test environment ready")
    
    def wait_for_services(self, timeout=120):
        """Wait for all services to be healthy before running tests."""
        print("⏳ Waiting for services to be ready...")
        
        services = [
            ("http://localhost:3002/health", "User Service"),
            ("http://localhost:3001/health", "Order Service"),
            ("http://localhost:3003/health", "Payment Service")
        ]
        
        start_time = time.time()
        while time.time() - start_time < timeout:
            all_ready = True
            for url, name in services:
                try:
                    import requests
                    response = requests.get(url, timeout=5)
                    if response.status_code != 200:
                        all_ready = False
                        break
                except:
                    all_ready = False
                    break
            
            if all_ready:
                print("✅ All services are ready")
                return True
            
            print(".", end="", flush=True)
            time.sleep(2)
        
        print(f"\n❌ Services did not become ready within {timeout} seconds")
        return False
    
    def run_unit_tests(self):
        """Run unit tests for individual services."""
        print("\n🧪 Running unit tests...")
        
        success = True
        services = ["user-service", "order-service", "payment-service", "notification-service"]
        
        for service in services:
            service_dir = self.base_dir / "services" / service
            if not service_dir.exists():
                continue
                
            print(f"\n📝 Testing {service}...")
            
            if service.endswith("-service") and (service_dir / "requirements.txt").exists():
                # Python service
                test_dir = service_dir / "tests"
                if test_dir.exists():
                    try:
                        result = subprocess.run([
                            str(self.venv_dir / "bin" / "python"), "-m", "pytest",
                            str(test_dir), "-v", "--tb=short"
                        ], cwd=service_dir, capture_output=True, text=True)
                        
                        if result.returncode == 0:
                            print(f"✅ {service} unit tests passed")
                        else:
                            print(f"❌ {service} unit tests failed:")
                            print(result.stdout)
                            print(result.stderr)
                            success = False
                    except Exception as e:
                        print(f"❌ Error running {service} tests: {e}")
                        success = False
            
            elif service == "order-service":
                # Node.js service
                package_json = service_dir / "package.json"
                if package_json.exists():
                    try:
                        result = subprocess.run(
                            ["npm", "test"], cwd=service_dir, 
                            capture_output=True, text=True
                        )
                        
                        if result.returncode == 0:
                            print(f"✅ {service} unit tests passed")
                        else:
                            print(f"❌ {service} unit tests failed:")
                            print(result.stdout)
                            print(result.stderr)
                            success = False
                    except Exception as e:
                        print(f"❌ Error running {service} tests: {e}")
                        success = False
            
            elif service == "payment-service":
                # Go service
                go_mod = service_dir / "go.mod"
                if go_mod.exists():
                    try:
                        result = subprocess.run(
                            ["go", "test", "./...", "-v"], cwd=service_dir,
                            capture_output=True, text=True
                        )
                        
                        if result.returncode == 0:
                            print(f"✅ {service} unit tests passed")
                        else:
                            print(f"❌ {service} unit tests failed:")
                            print(result.stdout)
                            print(result.stderr)
                            success = False
                    except Exception as e:
                        print(f"❌ Error running {service} tests: {e}")
                        success = False
        
        return success
    
    def run_integration_tests(self):
        """Run integration tests."""
        print("\n🔗 Running integration tests...")
        
        if not self.wait_for_services():
            return False
        
        python_executable = self.venv_dir / "bin" / "python"
        if not python_executable.exists():
            python_executable = self.venv_dir / "Scripts" / "python.exe"  # Windows
        
        try:
            result = subprocess.run([
                str(python_executable), 
                str(self.test_dir / "integration" / "test_microservices_flow.py")
            ], capture_output=True, text=True)
            
            print(result.stdout)
            if result.stderr:
                print(result.stderr)
            
            if result.returncode == 0:
                print("✅ Integration tests passed")
                return True
            else:
                print("❌ Integration tests failed")
                return False
                
        except Exception as e:
            print(f"❌ Error running integration tests: {e}")
            return False
    
    def run_load_tests(self, users=10, duration=30):
        """Run load tests."""
        print(f"\n⚡ Running load tests ({users} users, {duration}s)...")
        
        if not self.wait_for_services():
            return False
        
        python_executable = self.venv_dir / "bin" / "python"
        if not python_executable.exists():
            python_executable = self.venv_dir / "Scripts" / "python.exe"  # Windows
        
        try:
            result = subprocess.run([
                str(python_executable),
                str(self.test_dir / "load" / "load_test.py"),
                "--users", str(users),
                "--duration", str(duration)
            ], capture_output=True, text=True)
            
            print(result.stdout)
            if result.stderr:
                print(result.stderr)
            
            if result.returncode == 0:
                print("✅ Load tests completed")
                return True
            else:
                print("❌ Load tests failed")
                return False
                
        except Exception as e:
            print(f"❌ Error running load tests: {e}")
            return False
    
    def run_smoke_tests(self):
        """Run basic smoke tests to verify system is working."""
        print("\n💨 Running smoke tests...")
        
        tests = [
            ("User Service Health", "http://localhost:3002/health"),
            ("Order Service Health", "http://localhost:3001/health"),
            ("Payment Service Health", "http://localhost:3003/health"),
            ("Prometheus Metrics", "http://localhost:9090/-/healthy"),
            ("Grafana Health", "http://localhost:3000/api/health"),
            ("RabbitMQ Management", "http://localhost:15672"),
            ("Redis Info", "redis://localhost:6379")
        ]
        
        success = True
        for test_name, endpoint in tests:
            try:
                if endpoint.startswith("http"):
                    import requests
                    response = requests.get(endpoint, timeout=5)
                    if response.status_code == 200:
                        print(f"✅ {test_name}")
                    else:
                        print(f"❌ {test_name} (Status: {response.status_code})")
                        success = False
                elif endpoint.startswith("redis"):
                    import redis
                    r = redis.from_url(endpoint)
                    r.ping()
                    print(f"✅ {test_name}")
                    
            except Exception as e:
                print(f"❌ {test_name} ({str(e)})")
                success = False
        
        return success
    
    def generate_test_report(self, results):
        """Generate a test report."""
        print("\n" + "="*60)
        print("📊 TEST REPORT")
        print("="*60)
        
        total_tests = len(results)
        passed_tests = sum(1 for result in results.values() if result)
        
        print(f"Total Test Suites: {total_tests}")
        print(f"Passed: {passed_tests}")
        print(f"Failed: {total_tests - passed_tests}")
        print(f"Success Rate: {(passed_tests / total_tests) * 100:.1f}%")
        
        print("\nDetailed Results:")
        for test_name, result in results.items():
            status = "✅ PASS" if result else "❌ FAIL"
            print(f"  {status} {test_name}")
        
        print("="*60)
        
        return passed_tests == total_tests

def main():
    """Main test runner function."""
    parser = argparse.ArgumentParser(description="Microservices Test Runner")
    parser.add_argument("--type", choices=["unit", "integration", "load", "smoke", "all"], 
                       default="all", help="Type of tests to run")
    parser.add_argument("--users", type=int, default=10, help="Number of users for load testing")
    parser.add_argument("--duration", type=int, default=30, help="Duration for load testing (seconds)")
    parser.add_argument("--no-setup", action="store_true", help="Skip test environment setup")
    
    args = parser.parse_args()
    
    # Initialize test runner
    base_dir = Path(__file__).parent.parent
    runner = TestRunner(base_dir)
    
    print("🚀 Microservices Test Runner")
    print("="*60)
    
    # Setup test environment
    if not args.no_setup:
        try:
            runner.setup_test_environment()
        except Exception as e:
            print(f"❌ Failed to setup test environment: {e}")
            return 1
    
    # Run tests based on type
    results = {}
    
    if args.type in ["unit", "all"]:
        results["Unit Tests"] = runner.run_unit_tests()
    
    if args.type in ["smoke", "all"]:
        results["Smoke Tests"] = runner.run_smoke_tests()
    
    if args.type in ["integration", "all"]:
        results["Integration Tests"] = runner.run_integration_tests()
    
    if args.type in ["load", "all"]:
        results["Load Tests"] = runner.run_load_tests(args.users, args.duration)
    
    # Generate report
    all_passed = runner.generate_test_report(results)
    
    return 0 if all_passed else 1

if __name__ == "__main__":
    sys.exit(main())
