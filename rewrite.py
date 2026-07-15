import os
import re

files = [
  'src/components/Dashboard.tsx',
  'src/components/InvoiceHistory.tsx',
  'src/components/JobScheduler.tsx',
  'src/components/SpoolInventory.tsx',
  'src/components/ExtraItemInventory.tsx',
  'src/components/PrinterManagement.tsx'
]

for file in files:
    with open(file, 'r') as f:
        content = f.read()

    # 1. Remove createPortal and AnimatePresence imports
    content = re.sub(r"import \{ createPortal \} from 'react-dom';\n?", "", content)
    content = re.sub(r"import \{ motion, AnimatePresence \} from 'motion/react';\n?", "import { motion } from 'motion/react';\n", content)
    
    # 2. Extract everything inside <motion.div className="bg-white/90 ..."> ... </motion.div>
    # We can match from `<motion.div` that has `className="bg-white/9` or `bg-white/95` to the matching closing tag.
    # Actually, simpler: replace the start of `return (` up to `<div className="flex justify-between items-center p-6 border-b...`
    # or `<div className="flex justify-between items-center mb-6">`
    
    # Alternatively, just look for the innermost container that holds the content:
    # Usually it's `className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl ... w-full max-w-6xl max-h-[90vh] flex flex-col"`
    
    # Let's just find the inner content and replace the return block.
    
    # Using regex to find the `return (` block
    return_start = content.find('  return (')
    
    if return_start != -1:
        # We want to replace everything from `return (` to the end of the file
        # with just a div containing the content. But we need to parse JSX.
        pass

