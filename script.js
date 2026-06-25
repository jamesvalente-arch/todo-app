// Get HTML elements
const taskInput = document.getElementById('taskInput');
const categorySelect = document.getElementById('categorySelect');
const addBtn = document.getElementById('addBtn');
const completedHeader = document.getElementById('completedHeader');
const completedList = document.getElementById('completedList');

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

// Toggle completed folder visibility
completedHeader.addEventListener('click', toggleCompletedFolder);

function addTask() {
    const taskText = taskInput.value.trim();
    const category = categorySelect.value;

    // Don't add empty tasks
    if (taskText === '') {
        alert('Please enter a task!');
        return;
    }

    // Create a new task object
    const task = {
        id: Date.now(),
        text: taskText,
        category: category,
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
    // Determine which list to add the task to
    let listId;
    if (task.completed) {
        listId = 'completedList';
    } else {
        listId = task.category + 'List';
    }

    const taskList = document.getElementById(listId);

    // Remove empty message if present
    const emptyMessage = taskList.querySelector('.empty-message');
    if (emptyMessage) {
        emptyMessage.remove();
    }

    // Create task item HTML
    const li = document.createElement('li');
    li.className = `task-item ${task.completed ? 'completed' : ''}`;
    li.dataset.id = task.id;
    li.dataset.category = task.category;

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
        task.completed = e.target.checked;
        saveTasks();
        // Move task to correct list
        li.remove();
        renderTask(task);
        updateTaskCounts();
    });

    // Handle delete button
    const deleteBtn = li.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', () => {
        li.remove();
        saveTasks();
        updateTaskCounts();
        checkEmptyLists();
    });

    // Add task to the appropriate list
    taskList.appendChild(li);
    updateTaskCounts();
}

function saveTasks() {
    const tasks = [];

    // Get all tasks from all lists
    document.querySelectorAll('.task-item').forEach((item) => {
        const checkbox = item.querySelector('.task-checkbox');
        const taskText = item.querySelector('.task-text');
        const category = item.dataset.category;

        tasks.push({
            id: item.dataset.id,
            text: taskText.textContent,
            category: category,
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

    updateTaskCounts();
    checkEmptyLists();
}

function updateTaskCounts() {
    // Count tasks in each category
    const shortCount = document.querySelectorAll('#shortList .task-item').length;
    const mediumCount = document.querySelectorAll('#mediumList .task-item').length;
    const longCount = document.querySelectorAll('#longList .task-item').length;
    const completedCount = document.querySelectorAll('#completedList .task-item').length;

    document.getElementById('shortCount').textContent = `(${shortCount})`;
    document.getElementById('mediumCount').textContent = `(${mediumCount})`;
    document.getElementById('longCount').textContent = `(${longCount})`;
    document.getElementById('completedCount').textContent = `(${completedCount})`;
}

function checkEmptyLists() {
    // Check each list and show empty message if needed
    const lists = ['shortList', 'mediumList', 'longList', 'completedList'];

    lists.forEach((listId) => {
        const list = document.getElementById(listId);
        const hasItems = list.querySelectorAll('.task-item').length > 0;

        // Remove existing empty message
        const existingMessage = list.querySelector('.empty-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        // Add empty message if no items
        if (!hasItems) {
            const emptyMsg = document.createElement('p');
            emptyMsg.className = 'empty-message';

            if (listId === 'shortList') emptyMsg.textContent = 'No short term tasks yet';
            if (listId === 'mediumList') emptyMsg.textContent = 'No medium term tasks yet';
            if (listId === 'longList') emptyMsg.textContent = 'No long term tasks yet';
            if (listId === 'completedList') emptyMsg.textContent = 'No completed tasks yet';

            list.appendChild(emptyMsg);
        }
    });
}

function toggleCompletedFolder() {
    const arrow = completedHeader.querySelector('.toggle-arrow');
    completedList.classList.toggle('hidden');
    arrow.classList.toggle('open');
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
