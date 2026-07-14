const fs = require('fs');
let code = fs.readFileSync('src/components/Calculator.tsx', 'utf8');

code = code.replace(
  "const [showExtraItemsModal, setShowExtraItemsModal] = useState(false);",
  "const [showExtraItemsModal, setShowExtraItemsModal] = useState(false);\n  const [showClearConfirm, setShowClearConfirm] = useState(false);"
);

const handleClearFormOld = `  const handleClearForm = () => {
    if (window.confirm("Are you sure you want to clear the form? All unsaved changes will be lost.")) {
      const newPartId = Math.random().toString();
      updateState({
        editingInvoiceId: null,
        projectName: '',
        parts: [
          {
            id: newPartId,
            name: '',
            isMultiMaterial: false,
            materials: [
              { id: Math.random().toString(), name: 'PLA', costPerKg: 25, weight: 0 }
            ],
            printTimeHrs: 0,
            printTimeMin: 0,
            quantity: 1,
          }
        ],
        selectedCustomerId: null,
        extraItems: [],
        postProcessingTasks: [],
        laborTimeMin: 0,
        hardwareCost: 0,
        packagingCost: 0,
        shippingCost: 0,
        discountType: 'percentage',
        discountValue: 0
      });
      setExpandedPartId(newPartId);
    }
  };`;

const handleClearFormNew = `  const handleClearForm = () => {
    setShowClearConfirm(true);
  };

  const executeClearForm = () => {
    const newPartId = Math.random().toString();
    updateState({
      editingInvoiceId: null,
      projectName: '',
      parts: [
        {
          id: newPartId,
          name: '',
          isMultiMaterial: false,
          materials: [
            { id: Math.random().toString(), name: 'PLA', costPerKg: 25, weight: 0 }
          ],
          printTimeHrs: 0,
          printTimeMin: 0,
          quantity: 1,
        }
      ],
      selectedCustomerId: null,
      extraItems: [],
      postProcessingTasks: [],
      laborTimeMin: 0,
      hardwareCost: 0,
      packagingCost: 0,
      shippingCost: 0,
      discountType: 'percentage',
      discountValue: 0,
      applyTaxes: true
    });
    setExpandedPartId(newPartId);
    setShowClearConfirm(false);
  };`;

code = code.replace(handleClearFormOld, handleClearFormNew);

const clearConfirmModal = `      <AnimatePresence>
        {showClearConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700 p-6 max-w-md w-full"
            >
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">Clear Form</h3>
              <p className="text-slate-600 dark:text-slate-300 mb-6">
                Are you sure you want to clear the form? All unsaved changes will be lost.
              </p>
              <div className="flex gap-4 justify-end">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="px-6 py-3 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={executeClearForm}
                  className="px-6 py-3 rounded-xl font-bold bg-red-500 hover:bg-red-600 text-white transition-colors"
                >
                  Clear Form
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>`;

// Insert the modal at the end of the return statement before the final </div>
code = code.replace(/(<\/\s*div>\s*)$/, clearConfirmModal + '\n$1');

fs.writeFileSync('src/components/Calculator.tsx', code);
