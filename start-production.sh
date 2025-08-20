#!/bin/bash

echo "🚀 Starting Task Manager in Production Mode"
echo "==========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Build frontend if needed
if [ ! -d "client/dist" ]; then
    echo -e "${YELLOW}Building frontend...${NC}"
    cd client
    npm run build
    cd ..
    echo -e "${GREEN}✅ Frontend built${NC}\n"
fi

# Check if serve is installed
if ! command -v serve >/dev/null 2>&1; then
    echo -e "${YELLOW}Installing serve...${NC}"
    npm install -g serve
fi

# Start backend in background
echo -e "${BLUE}Starting backend server...${NC}"
cd server
NODE_ENV=production npm start &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 3

# Start frontend
echo -e "${BLUE}Starting frontend server...${NC}"
cd client
serve -s dist -l 3001 &
FRONTEND_PID=$!
cd ..

echo ""
echo -e "${GREEN}✅ Task Manager is running!${NC}"
echo ""
echo "📱 Access your app at:"
echo -e "${BLUE}   http://localhost:3001${NC}"
echo ""
echo "📊 API endpoint:"
echo -e "${BLUE}   http://localhost:3000${NC}"
echo ""
echo "🔐 Demo credentials:"
echo "   Email: demo@taskmanager.com"
echo "   Password: Demo123!"
echo ""
echo "Press Ctrl+C to stop all servers"

# Function to cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}Stopping servers...${NC}"
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo -e "${GREEN}✅ Servers stopped${NC}"
    exit 0
}

# Set trap to cleanup on Ctrl+C
trap cleanup INT

# Wait indefinitely
while true; do
    sleep 1
done