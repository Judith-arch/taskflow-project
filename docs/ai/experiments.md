# Experiments

**Objective:** Register tests comparing solutions built with and without AI assistance.

---

**Content:**

## Experiment 1: Green Flash Notification

- **What was tested:** Showing a brief success message when a task is added — once without AI, once with AI assistance.
- **Result:** Without AI, the solution used inline styles written one by one and a raw `setTimeout` to remove the element — functional but with no animation and not reusable. With AI, the logic was extracted into a `showFlash(message)` function using `Object.assign` for styles, `requestAnimationFrame` to trigger a slide-in animation, and `transitionend` to clean up after a smooth fade-out.
- **Conclusion:** AI saved time and added meaningful visual polish (animation, reusability) without changing how the problem was understood. The core logic was the same — AI improved the execution.

---

## Experiment 2: Pinned Task

- **What was tested:** Letting users pin a task to the top of the list — once without AI, once with AI assistance.
- **Result:** Without AI, the pin button used a simple `.active { color: gold }` state with no feedback on the task itself. With AI, the button defaulted to dimmed (grayscale + low opacity) to reduce visual noise, had a hover state, and pinned tasks received an accent-colored left border and subtle shadow using CSS variables.
- **Conclusion:** AI improved UX micro-decisions — idle state, hover feedback, and task-level highlight — without changing the underlying toggle logic. Most of the gain was in styling, not problem-solving.

---

## Experiment 3: Inline Title Edit

- **What was tested:** Double-clicking a task title to edit it in place — once without AI, once with AI assistance.
- **Result:** Without AI, the solution covered the happy path: replace a `<strong>` with an `<input>`, save on blur or Enter, fall back to the original on empty input. With AI, the version added a guard against re-triggering, an input styled to match the app theme, a red border on empty instead of a silent fallback, Escape to cancel, and `input.select()` to pre-select the text.
- **Conclusion:** The manual version solved the problem correctly. AI surfaced edge cases that were easy to overlook (double-trigger, empty validation UX, cancel flow) and added styling that made the interaction feel native to the app.