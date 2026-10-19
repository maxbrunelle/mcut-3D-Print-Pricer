const fs = require('fs');
let code = fs.readFileSync('src/components/Calculator.tsx', 'utf8');

code = code.replace('import { Calendar } from "lucide-react";', 'import { Calendar, Plus, Trash2, PenTool } from "lucide-react";');

fs.writeFileSync('src/components/Calculator.tsx', code);
console.log("Fixed Calculator.tsx");
