let goals = [];
let filteredGoals = [];

const state = {
    search: "",
    minDifficulty: 0,
    maxDifficulty: 25,
    categoryFilter: new Set(),
    tagFilter: new Set(),
    sort: "AZ",
    view: "grid"
};
const FILTER_FORMATTING = {
    "obtain64": "Obtain 64",
    "obtainMore": "Obtain More",
    "standOn": "Stand On",
    "sound": "Use Block",
    "killedBy": "Killed By",
    "xp": "Experience"
}
const CATEGORY_COLORS = {
    "advancement": {
        background: "237 182 38",
        text: "255 232 171"
    },
    "biome": {
        background: "106 153 78",
        text: "218 255 196"
    },
    "breed": {
        background: "204 51 66",
        text: "255 163 179"
    },
    "brew": {
        background: "114 61 70",
        text: "255 148 182"
    },
    "destroy": {
        background: "2 44 80",
        text: "127 204 235"
    },
    "die": {
        background: "232 149 132",
        text: "255 187 173"
    },
    "eat": {
        background: "188 108 37",
        text: "255 185 122"
    },
    "effect": {
        background: "102 155 188",
        text: "189 230 255"
    },
    "interact": {
        background: "0 75 35",
        text: "141 235 185"
    },
    "kill": {
        background: "79 0 11",
        text: "207 122 134"
    },
    "killedBy": {
        background: "116 103 97",
        text: "255 208 186"
    },
    "mine": {
        background: "164 170 222",
        text: "235 236 255"
    },
    "obtain": {
        background: "127 79 36",
        text: "255 190 133"
    },
    "obtain64": {
        background: "176 165 128",
        text: "255 241 194"
    },
    "obtainMore": {
        background: "101 109 74",
        text: "232 255 156"
    },
    "opponent": {
        background: "214 34 34",
        text: "255 115 115"
    },
    "sound": {
        background: "34 51 59",
        text: "167 211 232"
    },
    "standOn": {
        background: "58 90 64",
        text: "149 252 168"
    },
    "statistic": {
        background: "54 38 56",
        text: "214 151 222"
    },
    "structure": {
        background: "60 110 113",
        text: "140 239 245"
    },
    "tame": {
        background: "178 98 44",
        text: "255 173 117"
    },
    "wear": {
        background: "214 96 139",
        text: "255 175 204"
    }
}
const TAG_COLORS = {
    "collect_all": {
        background: "224 122 95",
        text: "255 199 184"
    },
    "end": {
        background: "201 173 167",
        text: "242 233 228"
    },
    "nether": {
        background: "200 68 68",
        text: "252 165 165"
    },
    "ocean": {
        background: "0 180 216",
        text: "145 237 255"
    },
    "silktouch": {
        background: "114 9 183",
        text: "209 140 255"
    },
    "unique": {
        background: "74 78 105",
        text: "161 173 255"
    },
    "xp": {
        background: "88 129 87",
        text: "190 255 189"
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

    values = [...values].sort((a, b) => {
        if(a === "miscellaneous") return 1;
        if(b === "miscellaneous") return -1;
        return a.localeCompare(b);
    });
    values.forEach(value => {
        const button = tagButton("filter-button", value);
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

function setupEvents() {
    document.getElementById("goal-search").addEventListener("input", event => {
        state.search = event.target.value.toLowerCase();
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

function update() {
    filteredGoals = goals.filter(goal => {
        const matchesSearch = !state.search || goal.key.includes(state.search) || goal.name.toLowerCase().includes(state.search);
        const matchesCategory = state.categoryFilter.size === 0 || state.categoryFilter.has(goal.category) || (state.categoryFilter.has("opponent") && goal.opponent === true);
        const matchesTag = state.tagFilter.size === 0 || (goal.tags && Object.values(goal.tags).flat().some(tag => state.tagFilter.has(tag)));

        return matchesSearch && matchesCategory && matchesTag;
    });

    sortGoals();
    if(state.view === "icon") renderIconView();
    else renderGoals();
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

        const icon = document.createElement("img");
        icon.className = "goal-icon";
        icon.src = getIconPath(goal.icons[0]);
        icon.alt = goal.name;

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

    document.getElementById("filtered-count").textContent = filteredGoals.length;
    document.getElementById("goal-result-count").textContent = filteredGoals.length;
}

function createGoalCard(goal) {
    const card = document.createElement("div");
    card.className = "goal-card";

    const header = document.createElement("div");
    header.className = "goal-header";

    const icon = document.createElement("img");
    icon.className = "goal-icon";
    icon.src = getIconPath(goal.icons[0]);
    icon.alt = goal.name;

    const content = document.createElement("div");
    content.className = "goal-info";

    const title = document.createElement("h3");
    title.textContent = goal.name;

    const difficulty = document.createElement("small");
    difficulty.textContent = `Difficulty: ${goal.difficulty}`;

    const tags = document.createElement("div");
    tags.className = "goal-tags";
    tags.appendChild(tagButton("goal-tag-display", goal.category));
    if(goal.category !== "opponent" && goal.opponent) tags.appendChild(tagButton("goal-tag-display", "opponent"));
    if(goal.tags) {
        Object.values(goal.tags).flat().forEach(tag => {
            if(!tag.startsWith("locate")) {
                const button = tagButton("goal-tag-display", tag);
                tags.appendChild(button);
            }
        });
    }

    content.append(title, difficulty);
    header.append(icon, content);
    card.append(header, tags);
    return card;
}

function tagButton(name, tag) {
    const button = document.createElement("button");
    button.className = name;
    if(FILTER_FORMATTING[tag]) button.textContent = FILTER_FORMATTING[tag];
    else button.textContent = tag.split("_").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
    
    const color = stringToColor(tag);
    button.style.setProperty("--button-bg-base", `rgb(${color.background} / 0.25)`);
    button.style.setProperty("--button-bg-hover", `rgb(${color.background} / 0.45)`);
    button.style.setProperty("--button-bg-active", `rgb(${color.background} / 1)`);
    button.style.borderColor = `rgb(${color.background})`;
    button.style.color = `rgb(${color.text})`;

    return button;
}

function stringToColor(str) {
    if(str in CATEGORY_COLORS) return CATEGORY_COLORS[str];
    if(str in TAG_COLORS) return TAG_COLORS[str];
    return {
        background: "64 61 57",
        text: "242 233 228"
    }
}

function getIconPath(icon) {
    const [namespace, name] = icon.split(":")
    switch(namespace) {
        case "lockoutbingo":
            return `assets/icons/lockoutbingo/${name}.png`;
        case "minecraft":
            return `assets/images/not_found.png`;
        default:
            return "assets/images/not_found.png";
    }
}
