#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}  OpenCode Webhook Server${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Creating from .env.example...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✅ Created .env file. Please edit it with your tokens.${NC}"
    echo ""
    read -p "Press Enter to continue or Ctrl+C to exit and edit .env first..."
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${YELLOW}❌ Docker is not running. Please start Docker first.${NC}"
    exit 1
fi

echo -e "${GREEN}🚀 Starting services...${NC}"
echo ""

# Start services
docker-compose -f docker-compose.dev.yml up -d

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Services started successfully!${NC}"
    echo ""
    echo -e "${BLUE}📍 Service URLs:${NC}"
    echo -e "   - OpenCode Server: ${GREEN}http://localhost:4096${NC}"
    echo -e "   - Webhook Server:  ${GREEN}http://localhost:8080${NC}"
    echo ""
    echo -e "${BLUE}📋 Useful commands:${NC}"
    echo -e "   - View logs:        ${YELLOW}make logs${NC}"
    echo -e "   - Stop services:    ${YELLOW}make down${NC}"
    echo -e "   - Restart services: ${YELLOW}make restart${NC}"
    echo -e "   - View status:      ${YELLOW}make status${NC}"
    echo ""
    echo -e "${BLUE}💡 Tip: Run 'make help' to see all available commands${NC}"
    echo ""
    
    # Ask if user wants to view logs
    read -p "Do you want to view logs? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker-compose -f docker-compose.dev.yml logs -f
    fi
else
    echo -e "${YELLOW}❌ Failed to start services. Check the error messages above.${NC}"
    exit 1
fi
