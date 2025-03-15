#!/bin/bash

# Navigate to the client/src/components/ui directory
cd /AudioSpectrumVisualizer\ 2/client/src/components/ui

# Find all TypeScript and TSX files and replace @/lib/utils with ../../lib/utils
find . -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|import { cn } from "@/lib/utils"|import { cn } from "../../lib/utils"|g'

# Replace other common imports
find . -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|import .* from "@/components/ui/|import .* from "../|g'
find . -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|import .* from "@/hooks/|import .* from "../../hooks/|g'

# Navigate to the client/src/pages directory
cd /AudioSpectrumVisualizer\ 2/client/src/pages

# Replace imports in page files
find . -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|import .* from "@/components/|import .* from "../components/|g'

echo "Import paths fixed!"