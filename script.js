const GITHUB_USER = "dorianPhilippart";

const escapeHtml = (value = "") => String(value).replace(/[&<>'"]/g, character => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
}[character]));

async function loadGithubProfile() {
  const grid = document.querySelector("#project-grid");
  try {
    const [profileResponse, repositoriesResponse] = await Promise.all([
      fetch(`https://api.github.com/users/${GITHUB_USER}`),
      fetch(`https://api.github.com/users/${GITHUB_USER}/repos?sort=updated&per_page=100`)
    ]);
    if (!profileResponse.ok || !repositoriesResponse.ok) throw new Error("GitHub API unavailable");

    const profile = await profileResponse.json();
    const repositories = await repositoriesResponse.json();
    const projects = repositories
      .filter(repository => !repository.fork && repository.name.toLowerCase() !== `${GITHUB_USER}.github.io`.toLowerCase())
      .slice(0, 3);

    document.querySelector("#profile-name").textContent = profile.name || "Dorian Philippart";
    document.querySelector("#profile-location").textContent = profile.location || "BUT Informatique";
    document.querySelector("#profile-avatar").src = profile.avatar_url;

    if (!projects.length) {
      grid.innerHTML = `<p class="projects-empty">Mes projets publics arriveront bientôt. Retrouvez déjà mon activité sur GitHub.</p>`;
      return;
    }

    grid.innerHTML = projects.map(project => `
      <a class="project-card" href="${project.html_url}" target="_blank" rel="noreferrer">
        <div class="project-info">
          <h3>${escapeHtml(project.name.replace(/-/g, " "))}</h3>
          <p>${escapeHtml(project.description || "Un projet à découvrir sur GitHub.")}</p>
          <div class="project-tags">
            ${project.language ? `<span>${escapeHtml(project.language)}</span>` : ""}
            ${project.stargazers_count ? `<span>${project.stargazers_count} étoile${project.stargazers_count > 1 ? "s" : ""}</span>` : ""}
          </div>
        </div>
      </a>`).join("");
  } catch (error) {
    grid.innerHTML = `<p class="projects-empty">Les dépôts publics ne peuvent pas être chargés pour le moment. Ils restent accessibles sur mon profil GitHub.</p>`;
  }
}

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll(".reveal").forEach(element => observer.observe(element));
document.querySelector("#year").textContent = new Date().getFullYear();
loadGithubProfile();
