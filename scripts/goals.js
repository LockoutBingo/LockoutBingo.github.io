let goals = [];
let filteredGoals = [];

const state = {
    search: "",
    minDifficulty: 0,
    maxDifficulty: 25,
    categoryFilter: new Set(),
    tagFilter: new Set(),
    sort: "AZ"
};
const FILTER_FORMATTING = {
    "obtain64": "Obtain 64",
    "obtainMore": "Obtain More",
    "standOn": "Stand On",
    "killedBy": "Killed By",
    "xp": "Experience"
}
const CATEGORY_COLORS = {
    "obtain": {
        background: "2, 36, 78",
        text: "147, 197, 253"
    },
    "obtain64": {
        background: "46, 6, 140",
        text: "203, 181, 255"
    },
    "biome": {
        background: "43, 100, 10",
        text: "186, 255, 82"
    },
    "advancement": {
        background: "115, 70, 3",
        text: "255, 206, 133"
    }
}
const TAG_COLORS = {
    "nether": {
        background: "200, 68, 68",
        text: "252, 165, 165"
    },
    "end": {
        background: "44, 36, 115",
        text: "161, 150, 255"
    }
}

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
            Object.values(goal.tags).flat().forEach(tag => {
                if(!tag.startsWith("locate")) tags.add(tag);
            });
        }
    });

    console.log("Loaded " + categories.size + " categories");
    console.log("Loaded " + tags.size + " tags");
    renderFilterSelectors("category-filter", categories);
    renderFilterSelectors("tag-filter", tags);
}

function renderFilterSelectors(containerId, values) {
    const container = document.getElementById(containerId);

    values = [...values].sort((a, b) => a.localeCompare(b));
    values.forEach(value => {
        const button = document.createElement("button");
        button.className = "filter-button";
        if(FILTER_FORMATTING[value]) {
            button.textContent = FILTER_FORMATTING[value];
        } else {
            button.textContent = value.split("_").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
        }

        const color = stringToColor(value);
        button.style.setProperty("--button-bg-base", `rgba(${color.background}, 0.25)`);
        button.style.setProperty("--button-bg-hover", `rgba(${color.background}, 0.45)`);
        button.style.setProperty("--button-bg-active", `rgba(${color.background}, 1)`);
        button.style.borderColor = `rgba(${color.background}, 0.6)`;
        button.style.color = `rgb(${color.text})`;

        button.addEventListener("click", () => {
            button.classList.toggle("active");
            
            const set = containerId === "category-filter" ? state.categoryFilter : state.tagFilter;
            if(button.classList.contains("active")) {
                set.add(value);
            } else {
                set.delete(value);
            }

            update();
        });

        container.appendChild(button);
    });
}

function stringToColor(str) {
    if(CATEGORY_COLORS[str]) {
        return CATEGORY_COLORS[str];
    }
    if(TAG_COLORS[str]) {
        return TAG_COLORS[str];
    }

    let hash = 0;
    for(let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash |= 0;
    }
    const hue = Math.abs(hash) % 360;
    const background = hslToRgb(hue, 55, 20);
    const text = hslToRgb(hue, 70, 75);

    return {
        background: `${background.r}, ${background.g}, ${background.b}`,
        text: `${text.r}, ${text.g}, ${text.b}`
    };
}

function hslToRgb(h, s, l) {
    s /= 100;
    l /= 100;

    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;

    let r = 0, g = 0, b = 0;

    if (h < 60) {
        r = c; g = x;
    } else if (h < 120) {
        r = x; g = c;
    } else if (h < 180) {
        g = c; b = x;
    } else if (h < 240) {
        g = x; b = c;
    } else if (h < 300) {
        r = x; b = c;
    } else {
        r = c; b = x;
    }

    return {
        r: Math.round((r + m) * 255),
        g: Math.round((g + m) * 255),
        b: Math.round((b + m) * 255)
    };
}

function setupEvents() {
    document.getElementById("goal-search").addEventListener("input", event => {
        state.search = event.target.value.toLowerCase();
        update();
    });
    
    document.getElementById("sort-select").addEventListener("change", event => {
        state.sort = event.target.value;
        update();
    });
}

function update() {
    filteredGoals = goals.filter(goal => {
        const matchesSearch = !state.search || goal.key.includes(state.search) || goal.name.toLowerCase().includes(state.search);
        const matchesCategory = state.categoryFilter.size === 0 || state.categoryFilter.has(goal.category);
        const matchesTag = state.tagFilter.size === 0 || (goal.tags && Object.values(goal.tags).flat().some(tag => state.tagFilter.has(tag)));

        return matchesSearch && matchesCategory && matchesTag;
    });

    sortGoals();
    render();
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
