import { FILTER_FORMATTING, CATEGORY_COLORS, TAG_COLORS } from "./constants.js";
import { VERSION_GROUPS, VERSION_ADDED } from "./versions.js";

let goals = [];
let filteredGoals = [];
const state = {
    search: "",
    minDifficulty: 0,
    maxDifficulty: 25,
    categoryFilter: new Set(),
    tagFilter: new Set(),
    versionFilter: new Set(),
    sort: "AZ",
    view: "grid"
};

document.addEventListener('DOMContentLoaded', async () => {
    const data = await fetch("assets/goals.json").then(r => r.json());
    goals = Object.entries(data).map(([key, value]) => ({ key, ...value }));
    filteredGoals = goals;
    document.getElementById("total-count").textContent = goals.length;
    document.getElementById("filtered-count").textContent = filteredGoals.length;
    console.log("Loaded " + goals.length + " goals");

    loadFilters();
    setupEvents();
    loadURLFilters();
    renderGoals();
});

function loadFilters() {
    const categories = new Set();
    const tags = new Set();

    goals.forEach(goal => {
        if(goal.category) {
            categories.add(goal.category);
        }
        if(goal.tags) {
            goal.tags.forEach(tag => tags.add(tag));
        }
    });

    console.log("Loaded " + categories.size + " categories");
    console.log("Loaded " + tags.size + " tags");
    renderFilterSelectors("category-filter", categories);
    renderFilterSelectors("tag-filter", tags);
    renderFilterSelectors("version-filter", Object.keys(VERSION_GROUPS));
}

function renderFilterSelectors(containerId, values) {
    const container = document.getElementById(containerId);

    values = [...values].sort((a, b) => {
        const nameA = formatFilterName(a);
        const nameB = formatFilterName(b);

        if(nameA === "Miscellaneous") return 1;
        if(nameB === "Miscellaneous") return -1;
        return nameA.localeCompare(nameB);
    });
    values.forEach(value => {
        const button = tagButton("filter-button", value);
        button.addEventListener("click", () => {
            button.classList.toggle("active");
            
            const set = containerId === "category-filter" ? state.categoryFilter : containerId === "tag-filter" ? state.tagFilter : state.versionFilter;
            if(button.classList.contains("active")) set.add(value);
            else set.delete(value);

            update();
        });

        container.appendChild(button);
    });
}

function setupEvents() {
    document.getElementById("goal-search").addEventListener("input", event => {
        state.search = event.target.value.toLowerCase();
        update();
    });

    document.getElementById("reset-filters").addEventListener("click", () => {
        state.minDifficulty = 0;
        state.maxDifficulty = 25;
        state.categoryFilter.clear();
        state.tagFilter.clear();
        state.versionFilter.clear();
        updateFilterFromStates(true);
        update();
    });

    const minDiff = document.getElementById("min-diff-slider");
    const maxDiff = document.getElementById("max-diff-slider");
    minDiff.addEventListener("input", event => {
        const min = Number(minDiff.value);
        const max = Number(maxDiff.value);
        if(max - min <= 0) minDiff.value = max;

        document.getElementById("min-diff-label").textContent = minDiff.value;
        minDiff.style.zIndex = 2;
        maxDiff.style.zIndex = 1;
        state.minDifficulty = Number(minDiff.value);
        update();
    });
    maxDiff.addEventListener("input", event => {
        const min = Number(minDiff.value);
        const max = Number(maxDiff.value);
        if(max - min <= 0) maxDiff.value = min;

        document.getElementById("max-diff-label").textContent = maxDiff.value;
        maxDiff.style.zIndex = 2;
        minDiff.style.zIndex = 1;
        state.maxDifficulty = Number(maxDiff.value);
        update();
    });
    
    document.getElementById("sort-select").addEventListener("change", event => {
        state.sort = event.target.value;
        update();
    });

    document.querySelectorAll(".goal-view-buttons button").forEach(button => {
        button.addEventListener("click", () => {
            document.querySelectorAll(".goal-view-buttons button").forEach(b => b.classList.remove("active"));
            button.classList.add("active");

            state.view = button.dataset.view;
            const container = document.getElementById("goal-list");
            container.classList.toggle("list", state.view === "list");
            container.classList.toggle("icon", state.view === "icon");
            update();
        });
    });
}

function update(url = true) {
    filteredGoals = goals.filter(goal => {
        const matchesSearch = !state.search || goal.key.includes(state.search) || goal.name.toLowerCase().includes(state.search);
        const withinDifficultyRange = goal.difficulty >= state.minDifficulty && goal.difficulty <= state.maxDifficulty;
        const matchesCategory = state.categoryFilter.size === 0 || state.categoryFilter.has(goal.category) || (state.categoryFilter.has("opponent") && goal.opponent === true);
        const matchesTag = state.tagFilter.size === 0 || (goal.tags && goal.tags.some(tag => state.tagFilter.has(tag)));
        const matchesVersion = state.versionFilter.size === 0 || state.versionFilter.has(VERSION_ADDED[goal.key] ?? "1.0");

        return matchesSearch && withinDifficultyRange && matchesCategory && matchesTag && matchesVersion;
    });

    sortGoals();
    if(state.view === "icon") renderIconView();
    else renderGoals();
    document.getElementById("filtered-count").textContent = filteredGoals.length;

    if(url) updateURL();
}

function sortGoals() {
    if(state.sort === "az") {
        filteredGoals.sort((a, b) => {
            return a.name.localeCompare(b.name);
        });
    } else if(state.sort === "za") {
        filteredGoals.sort((a, b) => {
            return b.name.localeCompare(a.name);
        });
    } else if(state.sort === "diff-inc") {
        filteredGoals.sort((a, b) => {
            if(a.difficulty === b.difficulty) return a.name.localeCompare(b.name);
            return a.difficulty - b.difficulty;
        });
    } else if(state.sort === "diff-dec") {
        filteredGoals.sort((a, b) => {
            if(a.difficulty === b.difficulty) return a.name.localeCompare(b.name);
            return b.difficulty - a.difficulty;
        });
    }
}

const preview = document.createElement("div");
preview.className = "goal-preview";
document.body.appendChild(preview);

function renderIconView() {
    const container = document.getElementById("goal-list");
    container.innerHTML = "";

    filteredGoals.forEach(goal => {
        const header = document.createElement("div");
        header.className = "goal-icon-card";

        const icon = createGoalIcon(goal);

        header.addEventListener("mouseenter", event => {
            preview.innerHTML = "";
            const card = createGoalCard(goal);
            preview.appendChild(card);
            preview.style.display = "block";
            moveGoalPreview(event);
        });

        header.addEventListener("mousemove", event => {
            moveGoalPreview(event);
        });

        header.addEventListener("mouseleave", () => {
            preview.style.display = "none";
        });

        header.appendChild(icon);
        container.appendChild(header);
    });
}

function moveGoalPreview(event) {
    const goalList = document.getElementById("goal-list");
    const listRect = goalList.getBoundingClientRect();
    const rightHalf = event.clientX > listRect.left + listRect.width / 2;

    if(rightHalf) preview.style.left = `${event.clientX - preview.offsetWidth - 6}px`;
    else preview.style.left = `${event.clientX + 16}px`;
    preview.style.top = `${event.clientY + 10}px`;
}

function renderGoals() {
    const container = document.getElementById("goal-list");
    container.innerHTML = "";
    filteredGoals.forEach(goal => {
        container.appendChild(createGoalCard(goal));
    })
}

function createGoalCard(goal) {
    const card = document.createElement("div");
    card.className = "goal-card";

    const header = document.createElement("div");
    header.className = "goal-header";

    const icon = createGoalIcon(goal);
    const content = document.createElement("div");
    content.className = "goal-info";

    const title = document.createElement("h3");
    title.textContent = goal.name;

    const difficulty = document.createElement("small");
    difficulty.textContent = `Difficulty: ${goal.difficulty}`;
    difficulty.style.opacity = "60%";

    content.append(title, difficulty);
    const version = VERSION_ADDED[goal.key];
    if(version) {
        const versionAdded = document.createElement("small");
        versionAdded.textContent = `Version added: ${version}`;
        versionAdded.style.opacity = "35%";
        content.appendChild(versionAdded);
    }

    const tags = document.createElement("div");
    tags.className = "goal-tags";
    tags.appendChild(tagButton("goal-tag-display", goal.category));
    if(goal.category !== "opponent" && goal.opponent) tags.appendChild(tagButton("goal-tag-display", "opponent"));
    if(goal.tags) {
        goal.tags.forEach(tag => {
            const button = tagButton("goal-tag-display", tag);
            tags.appendChild(button);
        });
    }

    header.append(icon, content);
    card.append(header, tags);
    return card;
}

function tagButton(className, text) {
    const button = document.createElement("button");
    button.className = className;
    button.id = text;
    button.textContent = formatFilterName(text);

    const color = stringToColor(text);
    button.style.setProperty("--button-bg-base", `rgb(${color.background} / 0.25)`);
    button.style.setProperty("--button-bg-hover", `rgb(${color.background} / 0.45)`);
    button.style.setProperty("--button-bg-active", `rgb(${color.background} / 1)`);
    button.style.borderColor = `rgb(${color.background})`;
    button.style.color = `rgb(${color.text})`;

    return button;
}

function formatFilterName(name) {
    return FILTER_FORMATTING[name] ?? name.split("_").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
}

function stringToColor(str) {
    if(str in CATEGORY_COLORS) return CATEGORY_COLORS[str];
    if(str in TAG_COLORS) return TAG_COLORS[str];
    return {
        background: "64 61 57",
        text: "242 233 228"
    }
}

function createGoalIcon(goal) {
    const icon = document.createElement("img");
    icon.className = "goal-icon";

    const [namespace, name] = goal.icons[0].split(":")
    icon.src = `assets/icons/${namespace}/${name}.png`
    icon.alt = goal.name;
    icon.onerror = () => {
        icon.src = "assets/images/not_found.png";
        icon.onerror = null;
    }
    
    return icon;
}

function loadURLFilters() {
    const params = new URLSearchParams(window.location.search);
    if(params.has("d")) {
        const diff = params.get("d");
        if(diff.includes("-")) {
            const [min, max] = diff.split("-");
            state.minDifficulty = min === "" ? 0 : Number(min);
            state.maxDifficulty = max === "" ? 25 : Number(max);
        } else {
            const d = Number(diff);
            state.minDifficulty = d;
            state.maxDifficulty = d;
        }
    }
    if(params.has("c")) {
        state.categoryFilter = new Set(params.get("c").split(","));
    }
    if(params.has("t")) {
        state.tagFilter = new Set(params.get("t").split(","));
    }
    if(params.has("v")) {
        state.versionFilter = new Set(params.get("v").split(","));
    }

    updateFilterFromStates();
    update(false);
}

function updateFilterFromStates(reset = false) {
    const minDiff = document.getElementById("min-diff-slider");
    const maxDiff = document.getElementById("max-diff-slider");

    minDiff.value = state.minDifficulty;
    maxDiff.value = state.maxDifficulty;
    if(state.minDifficulty === 25) minDiff.style.zIndex = 2;
    else if(state.maxDifficulty === 0) maxDiff.style.zIndex = 2;
    document.getElementById("min-diff-label").textContent = state.minDifficulty;
    document.getElementById("max-diff-label").textContent = state.maxDifficulty;
    
    document.getElementById("category-filter").querySelectorAll(".filter-button").forEach(button => {
        if(state.categoryFilter.has(button.id)) {
            button.classList.add("active");
        } else if(reset) {
            button.classList.remove("active");
        }
    });
    
    document.getElementById("tag-filter").querySelectorAll(".filter-button").forEach(button => {
        if(state.tagFilter.has(button.id)) {
            button.classList.add("active");
        } else if(reset) {
            button.classList.remove("active");
        }
    });
    
    document.getElementById("version-filter").querySelectorAll(".filter-button").forEach(button => {
        if(state.versionFilter.has(button.id)) {
            button.classList.add("active");
        } else if(reset) {
            button.classList.remove("active");
        }
    });
}

function updateURL() {
    const params = new URLSearchParams();

    let diff = "";
    if(state.minDifficulty > 0) diff = `${state.minDifficulty}-`;
    if(state.maxDifficulty < 25) diff += (diff ? "" : "-") + state.maxDifficulty;
    if(state.minDifficulty === state.maxDifficulty) diff = state.minDifficulty;
    if(diff) params.set("d", diff);

    if(state.categoryFilter.size > 0) params.set("c", [...state.categoryFilter].join(","));
    if(state.tagFilter.size > 0) params.set("t", [...state.tagFilter].join(","));
    if(state.versionFilter.size > 0) params.set("v", [...state.versionFilter].join(","));

    history.replaceState({}, "", params.size ? `?${params.toString()}` : window.location.pathname);
}
