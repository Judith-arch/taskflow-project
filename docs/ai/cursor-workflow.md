# 📘 Documentación – Mejoras realizadas con Cursor

## 🧠 Introducción

Durante el desarrollo de la aplicación **TaskFlow**, se utilizó Cursor como asistente para mejorar la calidad del código, la experiencia de usuario y la robustez general del sistema.

A continuación se documentan **dos ejemplos concretos** donde Cursor aportó mejoras significativas.

---

# ✅ Ejemplo 1 — Mejora de fiabilidad y estructura en `app.js`

## 🔍 Problema inicial

El archivo `app.js` presentaba varios problemas estructurales:

* Dependencia del objeto global `event`
* Código duplicado al guardar en `localStorage`
* Falta de control de errores en `JSON.parse`
* Comportamiento inconsistente en la carga inicial
* Código innecesario (variables no usadas)

---

## ⚙️ Mejoras aplicadas

### 1. Eliminación de dependencia global de `event`

Antes:

```js
function filterTasks(filter) {
    event.target.classList.add("active");
}
```

Después:

```js
function filterTasks(filter, ev) {
    const target = ev?.currentTarget || ev?.target;
    if (target) target.classList.add("active");
}
```

✔ Mejora:

* Compatible con modo estricto
* Más robusto y reutilizable

---

### 2. Centralización de persistencia (`saveTasks()`)

Antes:

```js
localStorage.setItem("tasks", JSON.stringify(tasks));
```

Después:

```js
function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}
```

✔ Mejora:

* Evita duplicación
* Facilita mantenimiento futuro (API, validaciones, etc.)

---

### 3. Manejo seguro de `localStorage`

Antes:

```js
const tasks = JSON.parse(localStorage.getItem("tasks"));
```

Después:

```js
let tasks = [];

try {
    const saved = JSON.parse(localStorage.getItem("tasks"));
    if (Array.isArray(saved)) tasks = saved;
} catch {
    tasks = [];
}
```

✔ Mejora:

* Evita errores si los datos están corruptos
* Mejora la estabilidad de la app

---

### 4. Corrección del flujo inicial

Antes:

* Solo se renderizaba el calendario en primera carga

Después:

```js
renderTasks();
updateStats();
updateCriticalTasks();
```

✔ Mejora:

* Estado consistente desde el inicio
* No depende de que el usuario cree tareas

---

### 5. Limpieza de código muerto

Eliminación de variables no utilizadas (`today`, `setHours`).

✔ Mejora:

* Código más limpio
* Menor confusión futura

---

## 🎯 Resultado

* Código más mantenible
* Menos errores en ejecución
* Mejor base para escalar el proyecto

---

# ✅ Ejemplo 2 — Mejora de UX y lógica de tareas críticas

## 🔍 Problema inicial

* Número ilimitado de tareas críticas
* Mala separación visual entre tareas
* Falta de información contextual para el usuario

---

## ⚙️ Mejoras aplicadas

### 1. Límite de tareas críticas

```js
const CRITICAL_TASKS_MAX = 4;

const visibleTasks = criticalTasks
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    .slice(0, CRITICAL_TASKS_MAX);
```

✔ Mejora:

* Interfaz más limpia
* Evita sobrecarga visual

---

### 2. Mensaje informativo dinámico

```js
criticalSummary.textContent =
    `These are your oldest critical tasks — ${criticalTasks.length} in total. Make sure to keep up ;)`;
```

✔ Mejora:

* Feedback claro al usuario
* Mejora la percepción de control

---

### 3. Mejora visual del listado

```css
#criticalList {
    display: flex;
    flex-direction: column;
    gap: 10px;
}
```

✔ Mejora:

* Separación clara entre elementos
* Mejor legibilidad

---

### 4. Estilización del mensaje

```css
.critical-summary {
    background: var(--accent-dim);
    border-left: 3px solid var(--accent);
}
```

✔ Mejora:

* Se percibe como alerta importante
* Mejor jerarquía visual

---

## 🎯 Resultado

* Interfaz más clara y usable
* Mejor experiencia de usuario
* Información priorizada correctamente

---

# 🧩 Conclusión

Cursor permitió:

* Detectar errores estructurales importantes
* Mejorar la organización del código
* Aumentar la robustez de la aplicación
* Elevar significativamente la calidad de la experiencia de usuario

Estas mejoras han hecho que la aplicación pase de ser funcional a ser **más profesional, mantenible y escalable**.

---

# Shortcuts
Most used shortcuts:
- Tab (accept suggestion)
- Ctrl + K (comands tab in terminal)
- Ctrl + Shit + V (readme layout)
- Ctrl + S (save manualy)
- Ctrl + Z (go back 1 change)
- Ctrl + Y (go foward 1 change)
- Ctrl + V (paste)