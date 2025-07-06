//  Base API endpoint for backend Flask server
const API_URL = "http://127.0.0.1:5000/todos";

//  Default filter (used to show all/completed/incomplete todos)
let currentFilter = "all";

//  Load and render todos from backend
async function loadTodos() {
    // 1. Fetch all todos from the backend API
  const res = await fetch(API_URL);
  const todos = await res.json();


  // 2. Filter todos based on the current filter
  const filteredTodos = todos.filter(todo => {
    if (currentFilter === "completed") return todo.completed;
    if (currentFilter === "incomplete") return !todo.completed;
    return true;
  });

  // 3. Update progress bar
  updateProgress(todos);

  // 4. Get the container where todos will be displayed
  const list = document.getElementById("todoList");
  list.innerHTML = "";// Clear existing content

    // 5. Loop through each filtered todo and render it
  filteredTodos.forEach(todo => {
    const li = document.createElement("li");
    li.className = `flex justify-between items-center px-3 py-2 rounded 
      ${todo.completed ? 'bg-green-100' : 'bg-gray-200'}`;// Change color if completed


    // Group: checkbox + title + due date  
    const leftGroup = document.createElement("div");
    leftGroup.className = "flex items-center gap-2 flex-grow";

    // Checkbox to mark task as complete/incomplete
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = todo.completed;
    checkbox.onchange = () => updateTodo(todo.id, todo.title, checkbox.checked, todo.due_date);


    // Read-only input to show/edit title
    const input = document.createElement("input");
    input.value = todo.title;
    input.disabled = true;
    input.className = `flex-grow bg-transparent outline-none 
      ${todo.completed ? 'line-through text-gray-500' : ''}`;

    leftGroup.appendChild(checkbox);
    leftGroup.appendChild(input);

    // Show due date if available
    if (todo.due_date) {
      const due = new Date(todo.due_date);
      const now = new Date();
      const dueText = document.createElement("p");
      dueText.textContent = `Due: ${due.toLocaleDateString()}`;
       // Highlight overdue tasks in red
      dueText.className = "text-sm " + (due < now && !todo.completed ? "text-red-500" : "text-gray-500");
      leftGroup.appendChild(dueText);
    }

    li.appendChild(leftGroup);


    // Group: Edit / Save / Delete button
    const buttonGroup = document.createElement("div");
    buttonGroup.className = "flex items-center gap-2";

    // Edit button to enable editing
    const editBtn = document.createElement("button");
    editBtn.textContent = "✏️";
    editBtn.className = "hover:text-blue-600";

    // Save button (hidden by default)
    const saveBtn = document.createElement("button");
    saveBtn.textContent = "💾";
    saveBtn.className = "hover:text-green-600 hidden";

    // When edit is clicked: enable input and show save
    editBtn.onclick = () => {
      input.disabled = false;
      input.focus();
      editBtn.classList.add("hidden");
      saveBtn.classList.remove("hidden");
    };

    // When save is clicked: update the todo in the backend
    saveBtn.onclick = async () => {
      input.disabled = true;
      await updateTodo(todo.id, input.value, checkbox.checked, todo.due_date);
    };


    // 🗑 Delete button to remove todo
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "🗑";
    deleteBtn.className = "text-red-500 hover:text-red-700";
    deleteBtn.onclick = () => deleteTodo(todo.id);

    buttonGroup.appendChild(editBtn);
    buttonGroup.appendChild(saveBtn);
    buttonGroup.appendChild(deleteBtn);
    li.appendChild(buttonGroup);

    list.appendChild(li);
  });
}

// Add new todo to the database
async function addTodo() {
  const input = document.getElementById("todoInput");
  const dateInput = document.getElementById("dateInput");
  const title = input.value.trim();
  const dueDate = dateInput.value;

  // Prevent adding empty titles
  if (!title) return;


  // Send POST request to backend
  await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, due_date: dueDate || null })
  });

  // Clear input and reload todos
  input.value = "";
  dateInput.value = "";
  loadTodos();
}

//  Update a todo (title, status, due date)
async function updateTodo(id, newTitle, completed, dueDate) {
  await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: newTitle, completed, due_date: dueDate || null })
  });

  loadTodos();
}

// Delete a todo
async function deleteTodo(id) {
  await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  loadTodos();
}


// Handle filter selection (all/completed/incomplete)
function setFilter(filter) {
  currentFilter = filter;
  highlightActiveFilter();// Visually mark active filter
  loadTodos();// Refresh UI
}

//  Highlight the active filter button
function highlightActiveFilter() {
  const filters = ['all', 'completed', 'incomplete'];
  filters.forEach(f => {
    const btn = document.getElementById(`filter-${f}`);
    if (f === currentFilter) {
      btn.classList.replace("bg-gray-300", "bg-blue-500");
      btn.classList.replace("text-gray-800", "text-white");
    } else {
      btn.classList.replace("bg-blue-500", "bg-gray-300");
      btn.classList.replace("text-white", "text-gray-800");
    }
  });
}

// Update the progress bar (completion %)
function updateProgress(todos) {
  const total = todos.length;
  const completed = todos.filter(t => t.completed).length;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  const text = `${completed} of ${total} tasks completed (${percent}%)`;
  const progressText = document.getElementById("progressText");
  const progressBar = document.getElementById("progressBar");

  progressText.textContent = text;
  progressBar.style.transition = "width 0.3s ease";
  progressBar.style.width = percent + "%";
}

// Load todos on page load
loadTodos();
