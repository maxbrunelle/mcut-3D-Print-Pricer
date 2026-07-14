# UI and Animation Rules

- Every popup or modal window must include the motion/react popup/modal effect.
- Wrap modals in `<AnimatePresence>` and `<motion.div>` with appropriate enter/exit animations.
- Ensure the animation respects the `state.animationsEnabled?.popups` preference.
