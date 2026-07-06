const releases = {
    "3.1": "June 24, 2026",
    "3.0.1": "June 8, 2026",
    "3.0": "May 22, 2026",
    "2.1.1": "October 19, 2025",
    "2.1": "October 12, 2025",
    "2.0": "May 12, 2025",
    "1.0": "May 31, 2024"
}
const sidebarLinks = new Map();

document.addEventListener("DOMContentLoaded", async () => {
    createSidebar();
    await generateReleaseNotes();
});

function createSidebar() {
    const sidebar = document.getElementById("release-list");
    for(const [version, date] of Object.entries(releases)) {
        const list = document.createElement("li");
        const link = document.createElement("a");
        link.href = `#v${version}`;
        link.textContent = version;
        link.addEventListener("click", event => {
            event.preventDefault();
            document.getElementById(`v${version}`).scrollIntoView({ behavior: "smooth" });
            history.replaceState(null, "", `#v${version}`);
        });

        list.appendChild(link);
        sidebar.appendChild(list);
        sidebarLinks.set(version, list);
    }
}

async function generateReleaseNotes() {
    const container = document.getElementById("release-notes");
    let first = true;
    for(const [version, date] of Object.entries(releases)) {
        const title = document.createElement("h1");
        title.textContent = `Lockout Bingo ${version}`;

        const releaseDate = document.createElement("small");
        releaseDate.textContent = `Released on ${date}`;

        const release = await fetch(`releases/${version}.md`).then(r => r.text());
        const content = document.createElement("div");
        content.className = "release-content";
        content.innerHTML = marked.parse(release);

        const article = document.createElement("article");
        article.className = "release";
        article.id = `v${version}`;

        if(first) {
            const badge = document.createElement("span");
            badge.className = "latest-release-badge";
            badge.textContent = "Latest";
            badge.ariaLabel = "Latest"
            article.append(title, releaseDate, badge, content);
            first = false;
        } else {
            article.append(title, releaseDate, content);
        }
        container.appendChild(article);
    }

    if(location.hash) {
        await waitForImages(container);
        document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior: "instant" });
    }

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            const version = entry.target.id.substring(1);            
            if(entry.isIntersecting) {
                sidebarLinks.forEach(link => link.classList.remove("active"));
                sidebarLinks.get(version)?.classList.add("active");
            }
        });
    }, {
        root: document.querySelector("main"),
        threshold: 0,
        rootMargin: "-100px 0px -80% 0px"
    });

    document.querySelectorAll(".release").forEach(article => {
        observer.observe(article);
    });
}

async function waitForImages(container) {
    const images = [...container.querySelectorAll("img")];

    await Promise.all(images.map(img => {
        if(img.complete) return Promise.resolve();

        return new Promise(resolve => {
            img.addEventListener("load", resolve, { once: true });
            img.addEventListener("error", resolve, { once: true });
        });
    }));
}
