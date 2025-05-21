#!/bin/bash

# Exit on error
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

NAMESPACE="cofrap"

# Function to update namespace in stack.yml
update_stack_yml() {
    local dir=$1
    local stack_file="$dir/stack.yml"
    
    if [ -f "$stack_file" ]; then
        echo -e "${YELLOW}Updating $stack_file with namespace $NAMESPACE${NC}"
        
        # Check if namespace line exists
        if grep -q "^\s*namespace:\s*" "$stack_file"; then
            # Update existing namespace
            sed -i "s/^\s*namespace:.*/  namespace: $NAMESPACE/" "$stack_file"
        else
            # Add namespace under provider
            sed -i "/^provider:/a \  namespace: $NAMESPACE" "$stack_file"
        fi
        
        echo -e "${GREEN}Updated $stack_file${NC}"
    fi
}

# Update all stack.yml files in functions directory
for dir in functions/*/; do
    if [ -d "$dir" ]; then
        update_stack_yml "$dir"
    fi
done

echo -e "${GREEN}All stack.yml files have been updated with namespace: $NAMESPACE${NC}"
