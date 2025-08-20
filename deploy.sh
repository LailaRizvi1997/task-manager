#!/bin/bash

echo "🚀 Task Manager Deployment Script"
echo "================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command_exists git; then
    echo -e "${RED}❌ Git is not installed${NC}"
    exit 1
fi

if ! command_exists node; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    exit 1
fi

if ! command_exists npm; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ All prerequisites met${NC}\n"

# Deployment options
echo "Choose your deployment option:"
echo "1) Local Production Build"
echo "2) Prepare for Vercel + Render"
echo "3) Prepare for Railway"
echo "4) Docker Build"
echo "5) Create GitHub Repository"
echo ""
read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        echo -e "\n${YELLOW}Building for local production...${NC}"
        
        # Build frontend
        echo "Building frontend..."
        cd client
        npm run build
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Frontend built successfully${NC}"
            echo "Frontend will be available at: http://localhost:3001"
            echo ""
            echo "To run locally:"
            echo "1. Install serve: npm install -g serve"
            echo "2. Run frontend: serve -s client/dist -l 3001"
            echo "3. Run backend: cd server && NODE_ENV=production npm start"
        else
            echo -e "${RED}❌ Frontend build failed${NC}"
            exit 1
        fi
        ;;
        
    2)
        echo -e "\n${YELLOW}Preparing for Vercel + Render deployment...${NC}"
        
        # Update Prisma for PostgreSQL
        echo "Updating Prisma schema for PostgreSQL..."
        sed -i.bak 's/provider = "sqlite"/provider = "postgresql"/' server/prisma/schema.prisma
        sed -i.bak 's|url      = "file:./dev.db"|url      = env("DATABASE_URL")|' server/prisma/schema.prisma
        
        echo "Installing PostgreSQL dependencies..."
        cd server
        npm install pg
        cd ..
        
        # Create production env example
        cat > .env.production.example << EOF
# Backend (Render)
DATABASE_URL=postgresql://user:password@host:5432/dbname
JWT_SECRET=generate-a-secure-random-string
JWT_REFRESH_SECRET=generate-another-secure-random-string
NODE_ENV=production
CLIENT_URL=https://your-app.vercel.app

# Frontend (Vercel)
VITE_API_URL=https://your-api.onrender.com
EOF
        
        echo -e "${GREEN}✅ Ready for Vercel + Render deployment${NC}"
        echo ""
        echo "Next steps:"
        echo "1. Push to GitHub: git push origin main"
        echo "2. Deploy backend to Render.com"
        echo "3. Deploy frontend to Vercel.com"
        echo "4. Update environment variables on both platforms"
        ;;
        
    3)
        echo -e "\n${YELLOW}Preparing for Railway deployment...${NC}"
        
        # Create Railway configuration
        cat > railway.json << EOF
{
  "build": {
    "builder": "nixpacks"
  },
  "deploy": {
    "numReplicas": 1,
    "restartPolicyType": "on-failure",
    "restartPolicyMaxRetries": 10
  }
}
EOF
        
        # Create Procfile for Railway
        cat > Procfile << EOF
web: cd server && npm start
release: cd server && npx prisma migrate deploy
EOF
        
        echo -e "${GREEN}✅ Ready for Railway deployment${NC}"
        echo ""
        echo "Next steps:"
        echo "1. Push to GitHub: git push origin main"
        echo "2. Go to railway.app and create new project"
        echo "3. Connect your GitHub repository"
        echo "4. Railway will auto-deploy your app"
        ;;
        
    4)
        echo -e "\n${YELLOW}Building Docker containers...${NC}"
        
        # Check if Docker is installed
        if ! command_exists docker; then
            echo -e "${RED}❌ Docker is not installed${NC}"
            echo "Please install Docker Desktop from https://docker.com"
            exit 1
        fi
        
        # Build containers
        echo "Building containers..."
        docker-compose build
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Docker build successful${NC}"
            echo ""
            echo "To run: docker-compose up -d"
            echo "To stop: docker-compose down"
        else
            echo -e "${RED}❌ Docker build failed${NC}"
            exit 1
        fi
        ;;
        
    5)
        echo -e "\n${YELLOW}Creating GitHub repository...${NC}"
        
        # Check if gh CLI is installed
        if ! command_exists gh; then
            echo -e "${YELLOW}GitHub CLI not installed. Installing...${NC}"
            echo "Please install from: https://cli.github.com"
            exit 1
        fi
        
        read -p "Enter repository name (default: task-manager): " repo_name
        repo_name=${repo_name:-task-manager}
        
        # Create repository
        gh repo create "$repo_name" --public --source=. --remote=origin --push
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Repository created and pushed successfully${NC}"
            echo "Repository URL: https://github.com/$(gh api user --jq .login)/$repo_name"
        else
            echo -e "${RED}❌ Failed to create repository${NC}"
            exit 1
        fi
        ;;
        
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}🎉 Deployment preparation complete!${NC}"