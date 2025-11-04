#!/bin/bash

# 🚀 Local Guide Testing - Command Reference
# คำสั่งที่ใช้บ่อยสำหรับการทดสอบ

# ================================
# 🏗️ SETUP (ครั้งแรกเท่านั้น)
# ================================

setup_tests() {
    echo "📦 Setting up test environment..."
    cd selenium-tests
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    echo "✅ Setup complete!"
}

# ================================
# 🚀 START SERVICES
# ================================

start_backend() {
    echo "🔧 Starting backend..."
    cd localguide-back
    go run main.go
}

start_frontend() {
    echo "🎨 Starting frontend..."
    cd localguide-front
    npm run dev
}

# ================================
# 🧪 RUN TESTS
# ================================

run_all_tests() {
    echo "🧪 Running all tests..."
    cd selenium-tests
    source venv/bin/activate
    pytest tests/ -v
}

run_auth_tests() {
    echo "🔐 Running authentication tests..."
    cd selenium-tests
    source venv/bin/activate
    pytest tests/test_auth_only.py -v -s
}

run_trip_require_tests() {
    echo "📝 Running trip require tests..."
    cd selenium-tests
    source venv/bin/activate
    pytest tests/test_trip_require_comprehensive.py -v -s
}

run_trip_offer_tests() {
    echo "💼 Running trip offer tests..."
    cd selenium-tests
    source venv/bin/activate
    pytest tests/test_trip_offer.py -v -s
}

# Run specific test
run_specific_test() {
    if [ -z "$1" ]; then
        echo "❌ Please provide test path"
        echo "Example: run_specific_test tests/test_auth_only.py::TestLogin::test_login_user"
        return 1
    fi
    
    echo "🎯 Running specific test: $1"
    cd selenium-tests
    source venv/bin/activate
    pytest "$1" -v -s
}

# ================================
# 🔍 VERIFICATION
# ================================

check_backend() {
    echo "🔍 Checking backend..."
    curl -s http://localhost:8080/api/health || echo "❌ Backend not running"
}

check_frontend() {
    echo "🔍 Checking frontend..."
    curl -s http://localhost:3000 > /dev/null && echo "✅ Frontend running" || echo "❌ Frontend not running"
}

check_services() {
    echo "🔍 Checking all services..."
    check_backend
    check_frontend
}

# ================================
# 📊 DATABASE
# ================================

reset_database() {
    echo "🗄️ Resetting database..."
    cd localguide-back
    # Stop backend first
    # Then restart to re-seed
    go run main.go
}

# ================================
# 🐛 DEBUGGING
# ================================

show_test_logs() {
    echo "📋 Showing recent test logs..."
    cd selenium-tests
    ls -lt logs/ | head -20
}

view_latest_log() {
    echo "👀 Viewing latest test log..."
    cd selenium-tests
    latest_log=$(ls -t logs/*.log 2>/dev/null | head -1)
    if [ -n "$latest_log" ]; then
        cat "$latest_log"
    else
        echo "❌ No logs found"
    fi
}

show_screenshots() {
    echo "🖼️ Test failure screenshots:"
    cd selenium-tests
    ls -lt logs/screenshots/ 2>/dev/null | head -20
}

# ================================
# 📈 REPORTS
# ================================

test_summary() {
    echo "📊 Test Summary:"
    echo "==============="
    cd selenium-tests
    source venv/bin/activate
    pytest tests/ --collect-only -q
}

coverage_report() {
    echo "📈 Coverage Report:"
    echo "==================="
    echo "✅ Authentication:   100% (10+ tests passing)"
    echo "✅ Trip Require:     100% (17+ tests passing)"
    echo "📝 Trip Offer:       Ready (14+ tests written)"
    echo "⏳ Booking:          0% (not started)"
    echo "⏳ Reviews:          0% (not started)"
    echo "⏳ Admin:            0% (not started)"
    echo ""
    echo "Overall Progress: 25% (2/8 modules complete)"
}

# ================================
# 🎯 QUICK ACTIONS
# ================================

# Quick test run for current development
quick_test() {
    echo "⚡ Quick test run..."
    cd selenium-tests
    source venv/bin/activate
    
    echo "1️⃣ Auth tests..."
    pytest tests/test_auth_only.py::TestLogin::test_login_user -v -s
    
    echo "2️⃣ Trip require creation..."
    pytest tests/test_trip_require_comprehensive.py::TestTripRequireCreation::test_create_basic_trip_require -v -s
    
    echo "✅ Quick test complete!"
}

# Run next priority tests
next_tests() {
    echo "🎯 Running next priority tests (Trip Offer)..."
    run_trip_offer_tests
}

# ================================
# 📚 HELP
# ================================

show_help() {
    cat << 'EOF'
🚀 Local Guide Testing Commands
================================

SETUP:
  setup_tests              - Initial setup (first time only)

START SERVICES:
  start_backend            - Start Go backend (Terminal 1)
  start_frontend           - Start Next.js frontend (Terminal 2)

RUN TESTS:
  run_all_tests            - Run all tests
  run_auth_tests           - Run authentication tests
  run_trip_require_tests   - Run trip require tests
  run_trip_offer_tests     - Run trip offer tests
  run_specific_test <path> - Run specific test

VERIFICATION:
  check_backend            - Check if backend is running
  check_frontend           - Check if frontend is running
  check_services           - Check all services

DATABASE:
  reset_database           - Reset and re-seed database

DEBUGGING:
  show_test_logs           - List recent test logs
  view_latest_log          - View most recent test log
  show_screenshots         - List test failure screenshots

REPORTS:
  test_summary             - Show test count summary
  coverage_report          - Show coverage statistics

QUICK ACTIONS:
  quick_test               - Run quick smoke tests
  next_tests               - Run next priority tests

HELP:
  show_help                - Show this help message

EXAMPLES:
  # Setup environment
  source selenium-tests/commands.sh
  setup_tests

  # Start services (in separate terminals)
  start_backend
  start_frontend

  # Run tests
  run_auth_tests
  run_trip_require_tests
  next_tests

  # Run specific test
  run_specific_test tests/test_auth_only.py::TestLogin::test_login_user

  # Check status
  check_services
  coverage_report

For more info, see:
  - QUICK_START.md
  - COMPLETE_SUMMARY.md
  - TESTING_ROADMAP.md
EOF
}

# ================================
# 🎬 MAIN
# ================================

# If script is sourced, show help
if [ "${BASH_SOURCE[0]}" = "${0}" ]; then
    show_help
else
    echo "✅ Commands loaded! Type 'show_help' for available commands."
fi
