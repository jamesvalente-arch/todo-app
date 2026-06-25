// Get HTML elements
const taskInput = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const taskList = document.getElementById('taskList');
const emptyMessage = document.getElementById('emptyMessage');

// Load tasks from browser storage when page opens
loadTasks();

// Add task when user clicks the Add button
addBtn.addEventListener('click', addTask);

// Add task when user presses Enter key
taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTask();
    }
});

function addTask() {
    const taskText = taskInput.value.trim();

    // Don't add empty tasks
    if (taskText === '') {
        alert('Please enter a task!');
        return;
    }

    // Create a new task object
    const task = {
        id: Date.now(),
        text: taskText,
        completed: false
    };

    // Add task to the list
    renderTask(task);

    // Save all tasks to browser storage
    saveTasks();

    // Clear the input field and focus it
    taskInput.value = '';
    taskInput.focus();
}

function renderTask(task) {
    // Create task item HTML
    const li = document.createElement('li');
    li.className = `task-item ${task.completed ? 'completed' : ''}`;
    li.dataset.id = task.id;

    li.innerHTML = `
        <input 
            type="checkbox" 
            ${task.completed ? 'checked' : ''}
            class="task-checkbox"
        >
        <span class="task-text">${escapeHtml(task.text)}</span>
        <button class="delete-btn">Delete</button>
    `;

    // Handle checkbox (mark as complete/incomplete)
    const checkbox = li.querySelector('.task-checkbox');
    checkbox.addEventListener('change', (e) => {
        li.classList.toggle('completed');
        saveTasks();
    });

    // Handle delete button
    const deleteBtn = li.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', () => {
        li.remove();
        saveTasks();
    });

    // Add task to the list
    taskList.appendChild(li);
    updateEmptyMessage();
}

function saveTasks() {
    const tasks = [];
    
    // Get all task items from the page
    document.querySelectorAll('.task-item').forEach((item) => {
        const checkbox = item.querySelector('.task-checkbox');
        const taskText = item.querySelector('.task-text');
        
        tasks.push({
            id: item.dataset.id,
            text: taskText.textContent,
            completed: checkbox.checked
        });
    });

    // Save to browser storage
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function loadTasks() {
    // Get tasks from browser storage
    const saved = localStorage.getItem('tasks');
    
    if (saved) {
        const tasks = JSON.parse(saved);
        
        // Display each saved task
        tasks.forEach((task) => {
            renderTask(task);
        });
    }

    updateEmptyMessage();
}

function updateEmptyMessage() {
    // Show/hide the "no tasks" message
    if (taskList.children.length === 0) {
        emptyMessage.classList.remove('hidden');
    } else {
        emptyMessage.classList.add('hidden');
    }
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
}
