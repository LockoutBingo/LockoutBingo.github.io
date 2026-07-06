const releases = {
    "3.1": "June 24, 2026",
    "3.0.1": "June 8, 2026",
    "3.0": "May 22, 2026",
    "2.1.1": "October 19, 2025",
    "2.1": "October 12, 2025",
    "2.0": "May 12, 2025",
    "1.0": "May 31, 2024"
}

document.addEventListener("DOMContentLoaded", async () => {
    createSidebar();
    await generateReleaseNotes();
});

function createSidebar() {
    const sidebar = document.getElementById("release-list");
    for(const [version, date] of Object.entries(releases)) {
        const link = document.createElement("li");
        link.href = `#v${version}`;
        link.textContent = version;
        link.addEventListener("click", event => {
            event.preventDefault();
            document.getElementById(`v${version}`).scrollIntoView({ behavior: "smooth" });
            history.pushState(null, "", `#v${version}`);
        });

        sidebar.appendChild(link);
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
        document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior: "smooth" });
    }
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
