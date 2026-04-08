# Prompt Engineering — TaskFlow

**Objective:** Document useful prompts used during the development of TaskFlow, 
explaining why each one works well.

---

## 1. Web Upgrades (Claude)

**Context:** After having the basic functionalities working, I wanted to explore 
possible improvements.

**Prompt:**
> "Haz de desarrollador senior: ¿qué mejoras o nuevas funcionalidades se le puede 
> añadir a la web?"

**Why it works:**
Asking Claude to adopt a specific role ("senior developer") frames the response 
with professional criteria. It produces prioritized suggestions with complexity 
and time estimates instead of a generic list.

**Result:** ~9 possible new features with complexity and time approximations.

---

## 2. Improvement Analysis on app.js (Cursor Agent)

**Context:** Wanting to improve the quality of the JavaScript before adding more 
features.

**Prompt:**
> "@app.js:1-383 how can I improve it?"

**Why it works:**
Referencing the exact file and line range gives the agent full context. Asking 
for improvements (not "fix bugs") opens the response to structural, readability 
and reliability suggestions beyond just errors.

**Result:** 10 improvements found covering reliability, security, maintainability, 
structure and UX.

---

## 3. Applying Improvements on app.js (Cursor Agent)

**Context:** After reviewing the suggested improvements, applying them efficiently.

**Prompt:**
> "Apply them."

**Why it works:**
Short, direct follow-up prompts work well in agentic contexts when the previous 
turn already established full context. The agent has the file and the list of 
changes — no repetition needed.

**Result:** All changes shown with clear diffs, easy to review and accept one by one.

---

## 4. Improved Logic for Critical Tasks (Cursor Agent)

**Context:** The critical tasks panel had no limit and showed too many items.

**Prompt:**
> "As it can be seen in the image, there is no limit to the number of critical 
> tasks that are shown. Do this:
> - Make the maximum number shown be 4
> - If there are more than 4 tasks that can be considered critical, the oldest 
>   ones are the ones shown
> - Add a message like: 'These are the oldest critical tasks, there are X in 
>   total. Make sure to keep up ;)'
> - Add the message where you think is best"

**Why it works:**
Combining an image with a structured bullet list of requirements is one of the 
most effective prompt formats. The image gives visual context, the bullets give 
precise requirements, and giving the agent freedom on placement ("where you think 
is best") produces better results than over-specifying everything.

**Result:** Direct changes to review, accept and verify in browser.

---

## 5. Statistics Remodeling (Cursor Agent)

**Context:** The statistics section lacked visual clarity and the numbers were 
not communicating progress effectively.

**Prompt:**
> "Right now it looks like this — the statistics part. Make it better: make the 
> red dot of the circumference go away, align everything, make the blocks on the 
> right part less long, change 'cancelled' by 'other' (that will be: cancelled 
> and reviewed). For the archived tasks make them be automatically marked as done. 
> For both deleting a task and archiving, add a confirmation message warning that 
> archiving will mark it as done."

**Why it works:**
Combining visual reference (screenshot) with a list of specific changes and 
behavior requirements in one prompt avoids back-and-forth. Explaining the 
*meaning* of "other" (cancelled + reviewed) prevents ambiguity.

**Result:** Direct changes to review, all in one pass.

---

## 6. Fast Sidebar Removal (Cursor Agent)

**Context:** The sidebar was not being used and was better removed for now, 
keeping the code ready for future use.

**Prompt:**
> "Quita el sidebar (dejando las partes que le corresponden documentadas para 
> futuro uso)"

**Why it works:**
Specifying *how* to remove something (comment it out, keep it documented) is as 
important as *what* to remove. Without that instruction the agent would delete 
the code entirely. The phrase "for future use" signals intent clearly.

**Result:** Sidebar removed with commented code preserved for future features.

---

## 7. Statistics Layout and Responsiveness (Cursor Agent)

**Context:** The statistics section needed visual restructuring and better use of 
space.

**Prompt:**
> "Dale el estilo de letra de los textos to-do, done... de statistics al texto 
> Project Name que se encuentra arriba. Mejora todo lo que puedas la reactividad 
> de la web. Aprovecha mejor el espacio de statistics, añade algo de texto extra 
> si lo ves necesario y ponlo bien organizado para que se vea claramente el 
> progreso."

**Why it works:**
Referencing an existing element ("the same style as to-do, done...") as a visual 
anchor is more precise than describing a font style from scratch. Combining 
visual consistency, responsiveness and layout in one prompt works well when the 
changes are related — the agent sees the full picture.

**Result:** Fast restructure with improved layout and responsiveness.

---

## 8. Defining the Task Object Structure (Claude)

**Context:** Starting the JavaScript implementation and needing to define the 
data model.

**Prompt:**
> "Define la estructura de una tarea como un objeto JavaScript con los campos 
> necesarios para una app de gestión de tareas que incluya: título, deadline, 
> status (to-do / doing / done), responsable, prioridad, notas y archivada."

**Why it works:**
Listing the specific fields upfront instead of asking generically ("how should I 
model a task?") produces a concrete, usable object rather than a discussion. 
Specifying the possible values for status avoids having to iterate.

**Result:** A complete task object with all fields, used as the base for the 
entire app.

---

## 9. Layout Design Guidance (Claude)

**Context:** Deciding the visual layout before starting HTML and CSS.

**Prompt:**
> "Tengo un wireframe así [imagen]. Quiero que la lista de tareas esté 
> directamente al lado del formulario, y abajo las estadísticas, tareas críticas 
> y un calendario. El panel de detalle se abre como slide-in desde la derecha al 
> clicar una tarea."

**Why it works:**
Sharing a wireframe image alongside a written description of the interaction 
model (slide-in panel) gives the assistant both spatial and behavioral context. 
This produces layout suggestions that match the actual vision instead of generic 
templates.

**Result:** CSS grid layout with the three-section structure implemented correctly.

---

## 10. Dark Mode as Default (Claude)

**Context:** Wanting dark mode to be the default experience instead of something 
the user has to activate.

**Prompt:**
> "Para que el modo base sea dark, ¿cómo cambio la lógica de carga en el JS?"

**Why it works:**
Short, precise technical questions with clear scope ("logic in JS", "on load") 
get direct answers. Asking *where* to change something (JS vs CSS) avoids 
getting a solution in the wrong layer.

**Result:** One-line change to the localStorage check, defaulting to dark mode 
unless the user has explicitly set light mode.

---

## Key Takeaways

| Pattern | Why it works |
|---|---|
| Role assignment ("act as senior dev") | Frames the quality and perspective of the response |
| Image + bullet list | Combines visual context with precise requirements |
| File reference + line range | Gives agent full context without copy-pasting |
| Short follow-up ("apply them") | Works when context is already established |
| Specify *how* to change, not just *what* | Prevents unintended side effects |
| Reference existing elements as anchors | More precise than describing from scratch |
| One combined prompt for related changes | Agent sees the full picture at once |