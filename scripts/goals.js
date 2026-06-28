let goals = [];
let filteredGoals = [];
const state = {
    search: ""
};

document.addEventListener('DOMContentLoaded', async () => {
    const data = await fetch("assets/goals.json").then(r => r.json());
    goals = Object.entries(data).map(([key, value]) => ({ key, ...value }));
    filteredGoals = goals;
    document.getElementById("total-count").textContent = goals.length;
    console.log("Loaded " + goals.length + " goals");

    loadFilters();
    setupEvents();
    render();
});

function loadFilters() {
    const categories = new Set();
    const tags = new Set();

    goals.forEach(goal => {
        if(goal.category) {
            categories.add(goal.category);
        }
        if(goal.tags) {
            Object.values(goal.tags).flat().forEach(tag => tags.add(tag));
        }
    });

    console.log("Loaded " + categories.size + " categories");
    console.log("Loaded " + tags.size + " tags");
    renderFilter("category-filter", categories);
    renderFilter("tag-filter", tags);
}

function renderFilter(containerId, values) {
    const container = document.getElementById(containerId);

    values.forEach(value => {
        const option = document.createElement("option");
        option.innerHTML = `
            <input type="checkbox" id="${value}" name="${value}" value="${value}">
            <label for="${value}">${value}</label>
        `;
        container.appendChild(option);
    });
}

function setupEvents() {
    document.getElementById("goal-search").addEventListener("input", e => {
        state.search = e.target.value.toLowerCase();
        update();
    });
}

function update() {
    filteredGoals = goals.filter(goal => {
        const matchesSearch = !state.search || goal.key.includes(state.search) || goal.name.toLowerCase().includes(state.search);
        return matchesSearch;
    });

    sortGoals();
    render();
}

function sortGoals() {
    filteredGoals.sort((a, b) => {
        return a.name.localeCompare(b.name);
    });
}

function render() {
    const container = document.getElementById("goal-list");
    container.innerHTML = "";

    filteredGoals.forEach(goal => {
        const card = document.createElement("div");
        card.className = "goal-card";
        card.innerHTML = `
            <h3>${goal.name}</h3>
            <small>
                Difficulty: ${goal.difficulty}
            </small>
        `;
        container.appendChild(card);
    });

    document.getElementById("filtered-count").textContent = filteredGoals.length;
    document.getElementById("goal-result-count").textContent = filteredGoals.length;
}
