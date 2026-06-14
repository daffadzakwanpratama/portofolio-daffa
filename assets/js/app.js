// --- SAFE LOCALSTORAGE WRAPPER ---
const SafeStorage = {
  getItem(key) {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.warn("localStorage.getItem blocked or inaccessible. Using memory fallback.", e);
      return this._memoryStore[key] || null;
    }
  },
  setItem(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn("localStorage.setItem blocked or inaccessible. Using memory fallback.", e);
      this._memoryStore[key] = String(value);
    }
  },
  _memoryStore: {}
};

// APP STATE MANAGER
const AppState = {
  data: null,

  init() {
    // 1. Check if data exists in SafeStorage, otherwise clone from default data
    const localData = SafeStorage.getItem("daffa_portfolio_data");
    if (localData) {
      try {
        this.data = JSON.parse(localData);
        // Otomatis reset ke data default baru jika masih tersimpan nama lama
        if (this.data && this.data.profile && this.data.profile.name === "Daffa Ardiansyah") {
          this.resetToDefault();
        }
        // Auto-merge new properties from default portfolio data (like web3formsKey and experienceYears)
        if (this.data && this.data.profile && window.defaultPortfolioData && window.defaultPortfolioData.profile) {
          let updated = false;
          if (this.data.profile.web3formsKey === undefined) {
            this.data.profile.web3formsKey = window.defaultPortfolioData.profile.web3formsKey;
            updated = true;
          }
          if (this.data.profile.experienceYears === undefined) {
            this.data.profile.experienceYears = window.defaultPortfolioData.profile.experienceYears;
            updated = true;
          }
          if (this.data.projectCategories === undefined) {
            this.data.projectCategories = window.defaultPortfolioData.projectCategories || ["Frontend", "Backend", "Fullstack"];
            updated = true;
          }
          if (updated) {
            this.save();
          }
        }
      } catch (e) {
        console.error("Error parsing portfolio data, resetting to default:", e);
        this.resetToDefault();
      }
    } else {
      this.resetToDefault();
    }

    // Ensure contact messages array exists in SafeStorage
    if (!SafeStorage.getItem("daffa_portfolio_messages")) {
      SafeStorage.setItem("daffa_portfolio_messages", JSON.stringify([]));
    }
  },

  resetToDefault() {
    if (window.defaultPortfolioData) {
      this.data = JSON.parse(JSON.stringify(window.defaultPortfolioData)); // deep clone
      this.save();
    } else {
      console.error("Default portfolio data not found!");
    }
  },

  save() {
    SafeStorage.setItem("daffa_portfolio_data", JSON.stringify(this.data));
  },

  getData() {
    return this.data;
  }
};

// --- CORE FRONTEND CONTROLLER ---
document.addEventListener("DOMContentLoaded", () => {
  // Initialize App State
  AppState.init();

  // Render Sections
  renderProfile();
  renderSkills();
  renderProjectFilters();
  renderProjects("All");
  renderTimeline();

  // Setup Interactions
  setupHeaderScroll();
  setupMobileNav();
  setupScrollSpy();
  setupProjectFilters();
  setupContactForm();
  setupModalClose();
  setupSkillsAnimation();
  setupScrollProgress();
  setupScrollReveal();
  setupInteractiveBackground();
  setupCustomCursor();
  setupProjectCard3DTilt();
  setupMagneticButtons();
  setupThemeToggle();
  setupLightbox();
});

// 1. RENDER PROFILE (Hero & About Me)
function renderProfile() {
  const data = AppState.getData();
  const profile = data.profile;

  // Set title & name in Hero safely
  const heroNameEl = document.getElementById("hero-name");
  if (heroNameEl) heroNameEl.innerHTML = `Halo, Saya <span>${profile.name}</span>`;

  const heroTitleEl = document.getElementById("hero-title");
  if (heroTitleEl) {
    runTypewriter(heroTitleEl, profile.title);
  }

  const heroDescEl = document.getElementById("hero-desc") || document.getElementById("hero-bio");
  if (heroDescEl) heroDescEl.innerText = profile.bio;

  // Set About Me details safely
  const aboutNameEl = document.getElementById("about-name");
  if (aboutNameEl) aboutNameEl.innerText = profile.name;

  const aboutTitleEl = document.getElementById("about-title");
  if (aboutTitleEl) aboutTitleEl.innerText = profile.title;

  const aboutBioEl = document.getElementById("about-bio");
  if (aboutBioEl) aboutBioEl.innerText = profile.bio;

  const emailEl = document.getElementById("detail-email");
  if (emailEl) emailEl.innerText = profile.email;

  const locationEl = document.getElementById("detail-location");
  if (locationEl) locationEl.innerText = profile.location;

  const projectCountEl = document.getElementById("stat-projects-count");
  if (projectCountEl) {
    projectCountEl.innerText = data.projects ? data.projects.length : 0;
  }

  const experienceYearsEl = document.getElementById("stat-experience-years");
  if (experienceYearsEl) {
    experienceYearsEl.innerText = profile.experienceYears || "1+";
  }

  // Set Social Links
  const socialContainers = document.querySelectorAll(".social-links-target");
  socialContainers.forEach(container => {
    container.innerHTML = `
      <a href="${profile.github}" target="_blank" class="social-link" aria-label="GitHub">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path><path d="M9 18c-4.51 2-5-2-7-2"></path></svg>
      </a>
      <a href="${profile.linkedin}" target="_blank" class="social-link" aria-label="LinkedIn">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
      </a>
      <a href="${profile.instagram}" target="_blank" class="social-link" aria-label="Instagram">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
      </a>
      <a href="${profile.twitter}" target="_blank" class="social-link" aria-label="Twitter">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
      </a>
    `;
  });

  // Set CV download button
  const downloadBtns = document.querySelectorAll(".download-cv-btn");
  downloadBtns.forEach(btn => {
    btn.href = profile.resumeUrl;
    if (profile.resumeUrl === "#") {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        alert("CV belum diunggah oleh pemilik. Anda dapat mengunggahnya nanti melalui dashboard admin!");
      });
    }
  });

  // Render Avatar Visual
  const avatarVisual = document.getElementById("avatar-visual");
  if (profile.avatar) {
    avatarVisual.innerHTML = `<img src="${profile.avatar}" alt="${profile.name}" class="avatar-image">`;
  } else {
    // Generate Initial Avatar
    const initials = profile.name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
    avatarVisual.innerHTML = `<div class="avatar-placeholder">${initials}</div>`;
  }
}

// 2. RENDER SKILLS GROUPED BY CATEGORY
function renderSkills() {
  const data = AppState.getData();
  const skills = data.skills;
  const container = document.getElementById("skills-target");
  container.innerHTML = "";

  if (!skills || skills.length === 0) {
    container.innerHTML = "<p style='grid-column: 1/-1; text-align: center;'>Belum ada keahlian ditambahkan.</p>";
    return;
  }

  // Group skills by category
  const categories = {};
  skills.forEach(skill => {
    if (!categories[skill.category]) {
      categories[skill.category] = [];
    }
    categories[skill.category].push(skill);
  });

  // Icon mapping helper for categories
  const categoryIcons = {
    Frontend: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>`,
    Backend: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M3 5v6c0 1.66 4 3 9 3s9-1.34 9-3V5"></path><path d="M3 11v6c0 1.66 4 3 9 3s9-1.34 9-3v-6"></path></svg>`,
    Database: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>`,
    DevOps: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0z"></path><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path><path d="M2 12h20"></path></svg>`,
  };

  // Render each category block
  Object.keys(categories).forEach((cat, idx) => {
    const catSkills = categories[cat];
    const icon = categoryIcons[cat] || `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;

    const card = document.createElement("div");
    card.className = `skills-card scroll-reveal stagger-${(idx % 3) + 1}`;

    let skillsHTML = "";
    catSkills.forEach(skill => {
      skillsHTML += `
        <div class="skill-item">
          <div class="skill-info">
            <span class="skill-name">${skill.name}</span>
            <span class="skill-percentage">${skill.level}%</span>
          </div>
          <div class="skill-bar-bg">
            <div class="skill-bar-fill" data-level="${skill.level}"></div>
          </div>
        </div>
      `;
    });

    card.innerHTML = `
      <h3 class="skills-category-title">
        <span>${icon}</span>
        ${cat}
      </h3>
      <div class="skill-list">
        ${skillsHTML}
      </div>
    `;
    container.appendChild(card);
  });
}

// 3. RENDER PROJECTS WITH DYNAMIC FILTERS
function renderProjects(filterCategory = "All") {
  const data = AppState.getData();
  const projects = data.projects;
  const grid = document.getElementById("projects-grid-target");
  grid.innerHTML = "";

  if (!projects || projects.length === 0) {
    grid.innerHTML = "<p style='grid-column: 1/-1; text-align: center; padding: 3rem;'>Belum ada proyek.</p>";
    return;
  }

  // Filter projects by category
  const filteredProjects = filterCategory === "All"
    ? projects
    : projects.filter(p => p.category.toLowerCase() === filterCategory.toLowerCase());

  if (filteredProjects.length === 0) {
    grid.innerHTML = "<p style='grid-column: 1/-1; text-align: center; padding: 3rem;'>Tidak ada proyek dalam kategori ini.</p>";
    return;
  }

  // Sort projects: featured projects first
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    return 0;
  });

  sortedProjects.forEach((proj, idx) => {
    const card = document.createElement("div");
    card.className = `project-card scroll-reveal stagger-${(idx % 3) + 1}`;
    card.dataset.id = proj.id;

    // Thumbnail display
    let thumbnailHTML = "";
    if (proj.thumbnail) {
      thumbnailHTML = `<img src="${proj.thumbnail}" alt="${proj.title}" style="width: 100%; height: 100%; object-fit: cover;">`;
    } else {
      // Premium placeholder gradient using HSL based on project title
      const isDark = document.documentElement.classList.contains("dark-mode");
      const hue = proj.title.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % 360;
      const bg = isDark
        ? `linear-gradient(135deg, hsl(${hue}, 40%, 15%) 0%, hsl(${(hue + 40) % 360}, 45%, 10%) 100%)`
        : `linear-gradient(135deg, hsl(${hue}, 70%, 94%) 0%, hsl(${(hue + 40) % 360}, 75%, 85%) 100%)`;
      const strokeColor = isDark ? `hsl(${hue}, 50%, 65%)` : `hsl(${hue}, 60%, 45%)`;
      const textColor = isDark ? `hsl(${hue}, 55%, 75%)` : `hsl(${hue}, 60%, 40%)`;

      thumbnailHTML = `
        <div class="project-thumb-placeholder" style="background: ${bg}">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color: ${strokeColor}"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
          <span style="font-size: 0.8rem; font-weight: 700; color: ${textColor}; text-transform: uppercase; letter-spacing: 0.05em;">${proj.category}</span>
        </div>
      `;
    }

    // Technology Tags
    const tagsHTML = proj.technologies.slice(0, 3).map(tech => `<span class="tech-tag">${tech}</span>`).join("");
    const remainingCount = proj.technologies.length - 3;
    const remainingHTML = remainingCount > 0 ? `<span class="tech-tag">+${remainingCount}</span>` : "";

    // Featured badge
    const featuredHTML = proj.featured
      ? `<div class="project-featured-badge">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
          Unggulan
         </div>`
      : "";

    // Determine status badge details
    const statusLower = (proj.status || "").toLowerCase();
    let statusLabel = proj.status || "Completed";
    let statusClass = "status-completed";
    
    if (statusLower.includes("complete") || statusLower.includes("selesai")) {
      statusLabel = "Selesai";
      statusClass = "status-completed";
    } else if (statusLower.includes("progress") || statusLower.includes("berlangsung") || statusLower.includes("ongoing") || statusLower.includes("dikerjakan")) {
      statusLabel = "Dalam Pengerjaan";
      statusClass = "status-ongoing";
    }

    card.innerHTML = `
      <div class="project-thumb">
        ${thumbnailHTML}
        ${featuredHTML}
      </div>
      <div class="project-body">
        <div class="project-meta-top" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem; width: 100%;">
          <span class="project-category" style="margin-bottom: 0;">${proj.category}</span>
          <span class="project-status-badge ${statusClass}">${statusLabel}</span>
        </div>
        <h3 class="project-card-title">${proj.title}</h3>
        <p class="project-excerpt">${proj.description}</p>
        <div class="project-tech">
          ${tagsHTML}
          ${remainingHTML}
        </div>
      </div>
    `;

    // Click handler to open details modal
    card.addEventListener("click", () => {
      openProjectModal(proj.id);
    });

    grid.appendChild(card);
  });
}

// 4. RENDER EXPERIENCES & EDUCATION TIMELINES
function renderTimeline() {
  const data = AppState.getData();

  // Render Experience
  const expTarget = document.getElementById("experience-target");
  if (expTarget) {
    expTarget.innerHTML = "";
    const experiences = data.experiences;

    if (!experiences || experiences.length === 0) {
      expTarget.innerHTML = "<p>Belum ada riwayat pengalaman.</p>";
    } else {
      experiences.forEach((exp, idx) => {
        const item = document.createElement("div");
        item.className = `timeline-item scroll-reveal stagger-${(idx % 3) + 1}`;

        const descList = exp.description.map(desc => `<li>${desc}</li>`).join("");

        item.innerHTML = `
          <div class="timeline-period">${exp.period}</div>
          <h3 class="timeline-title">${exp.role}</h3>
          <div class="timeline-subtitle">${exp.company} &bull; ${exp.type}</div>
          <div class="timeline-desc">
            <ul>${descList}</ul>
          </div>
        `;
        expTarget.appendChild(item);
      });
    }
  }

  // Render Education
  const eduTarget = document.getElementById("education-target");
  if (eduTarget) {
    eduTarget.innerHTML = "";
    const educations = data.educations;

    if (!educations || educations.length === 0) {
      eduTarget.innerHTML = "<p>Belum ada riwayat pendidikan.</p>";
    } else {
      educations.forEach((edu, idx) => {
        const item = document.createElement("div");
        item.className = `timeline-item scroll-reveal stagger-${(idx % 3) + 1}`;

        item.innerHTML = `
          <div class="timeline-period">${edu.period}</div>
          <h3 class="timeline-title">${edu.degree}</h3>
          <div class="timeline-subtitle">${edu.institution}</div>
          <div class="timeline-desc">
            <p>${edu.description}</p>
          </div>
        `;
        eduTarget.appendChild(item);
      });
    }
  }
}

// --- SETUP UTILITY INTERACTIONS ---

// 1. Header background scroll color & shadow transition
function setupHeaderScroll() {
  const header = document.getElementById("header");
  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  });
}

// 2. Mobile navbar toggle drawer open/close
function setupMobileNav() {
  const navToggle = document.getElementById("nav-toggle");
  const navMenu = document.getElementById("nav-menu");
  const navLinks = document.querySelectorAll(".nav-link");

  navToggle.addEventListener("click", () => {
    navToggle.classList.toggle("active");
    navMenu.classList.toggle("active");
  });

  navLinks.forEach(link => {
    link.addEventListener("click", () => {
      navToggle.classList.remove("active");
      navMenu.classList.remove("active");
    });
  });
}

// 3. ScrollSpy: Highlight active navigation link based on scrolled section view
function setupScrollSpy() {
  const sections = document.querySelectorAll("section");
  const navLinks = document.querySelectorAll(".nav-link");
  const headerHeight = varToNum("--header-height") || 80;
  let lastClickTime = 0;
  let currentActiveId = "hero";

  console.log("ScrollSpy initialized with", sections.length, "sections.");

  // Add click listener to instantly highlight clicked link
  navLinks.forEach(link => {
    link.addEventListener("click", () => {
      const targetId = link.getAttribute("href").substring(1);
      console.log("Nav link clicked:", targetId);
      
      lastClickTime = Date.now();
      currentActiveId = targetId;
      
      navLinks.forEach(l => l.classList.remove("active"));
      link.classList.add("active");
    });
  });

  window.addEventListener("scroll", () => {
    // If recently clicked, do not let scroll listener override immediate highlight
    if (Date.now() - lastClickTime < 800) {
      return;
    }

    const scrollPosition = window.scrollY || document.documentElement.scrollTop;
    let current = "";

    sections.forEach(section => {
      const sectionTop = section.getBoundingClientRect().top + scrollPosition;
      // Highlight the section when its top edge is scrolled past the header (with a 120px threshold for better UX)
      if (scrollPosition >= sectionTop - headerHeight - 120) {
        current = section.getAttribute("id");
      }
    });

    // Check if scrolled to the absolute bottom of the page
    const isAtBottom = (window.innerHeight + scrollPosition) >= document.documentElement.scrollHeight - 15;
    if (isAtBottom && sections.length > 0) {
      current = sections[sections.length - 1].getAttribute("id");
    }

    if (current && current !== currentActiveId) {
      console.log("ScrollSpy changed section to:", current);
      currentActiveId = current;
      
      navLinks.forEach(link => {
        link.classList.remove("active");
        if (link.getAttribute("href").substring(1) === current) {
          link.classList.add("active");
        }
      });
    }
  });

  function varToNum(cssVar) {
    const val = getComputedStyle(document.documentElement).getPropertyValue(cssVar);
    const parsed = parseInt(val);
    return isNaN(parsed) ? 80 : parsed;
  }
}

// Render Projects Category Filter Tabs dynamically
function renderProjectFilters() {
  const container = document.getElementById("project-filters-container");
  if (!container) return;

  const data = AppState.getData();
  const categories = data.projectCategories || ["Frontend", "Backend", "Fullstack"];

  let html = `<button class="filter-btn active" data-filter="All" id="filter-all">Semua</button>`;
  categories.forEach(cat => {
    const id = `filter-${cat.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;
    html += `<button class="filter-btn" data-filter="${cat}" id="${id}">${cat}</button>`;
  });

  container.innerHTML = html;
}

// 4. Projects Category Filter click logic
function setupProjectFilters() {
  const filterButtons = document.querySelectorAll(".filter-btn");
  filterButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      // Remove active from all and set on clicked
      filterButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const filter = btn.dataset.filter;

      // Animate grid change
      const grid = document.getElementById("projects-grid-target");
      grid.style.opacity = 0;
      setTimeout(() => {
        renderProjects(filter);
        grid.style.opacity = 1;
        setupScrollReveal(); // Re-observe new elements
      }, 150);
    });
  });
}

// 5. Skills dynamic level progress bar animation trigger on IntersectionObserver
function setupSkillsAnimation() {
  const skillsSection = document.getElementById("skills");

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Find all skill bars inside the section and fill them
        const fillBars = document.querySelectorAll(".skill-bar-fill");
        fillBars.forEach(bar => {
          const level = bar.dataset.level;
          bar.style.width = `${level}%`;
        });
        // Once animated, unobserve the section
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  if (skillsSection) {
    observer.observe(skillsSection);
  }
}

// 6. Project detail modal popup render & visibility
function openProjectModal(projectId) {
  const data = AppState.getData();
  const project = data.projects.find(p => p.id === projectId);

  if (!project) return;

  const modal = document.getElementById("project-modal");
  const modalBody = document.getElementById("modal-body-target");

  // --- CONSTRUCT GALLERY LIST ---
  const galleryList = [];

  // Helper function to return markup representing the item
  function getGalleryItemHTML(item, isMain = false) {
    if (item.type === 'image') {
      const mainStyle = isMain ? 'width: 100%; height: 100%; object-fit: cover;' : '';
      return `<img src="${item.src}" alt="${item.label || 'Project Image'}" style="${mainStyle}">`;
    } else {
      const mainStyle = isMain ? 'width: 100%; height: 100%;' : '';
      const svgSize = isMain ? 60 : 20;
      const labelSize = isMain ? 'font-size: 0.95rem;' : 'font-size: 0.55rem;';
      return `
        <div class="project-thumb-placeholder" style="background: ${item.bg}; ${mainStyle} display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 0.5rem; text-align: center; border-radius: var(--radius-sm);">
          <svg xmlns="http://www.w3.org/2000/svg" width="${svgSize}" height="${svgSize}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color: ${item.strokeColor}"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
          <span style="${labelSize} font-weight: 700; color: ${item.strokeColor}; text-transform: uppercase; letter-spacing: 0.05em;">${item.label}</span>
        </div>
      `;
    }
  }

  // 1. Add thumbnail as the primary image
  if (project.thumbnail) {
    galleryList.push({
      type: 'image',
      src: project.thumbnail,
      label: 'Main Screen'
    });
  } else {
    const isDark = document.documentElement.classList.contains("dark-mode");
    const hue = project.title.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % 360;
    const bg = isDark
      ? `linear-gradient(135deg, hsl(${hue}, 40%, 15%) 0%, hsl(${(hue + 40) % 360}, 45%, 10%) 100%)`
      : `linear-gradient(135deg, hsl(${hue}, 70%, 94%) 0%, hsl(${(hue + 40) % 360}, 75%, 85%) 100%)`;
    const strokeColor = isDark ? `hsl(${hue}, 50%, 65%)` : `hsl(${hue}, 60%, 45%)`;

    galleryList.push({
      type: 'placeholder',
      bg: bg,
      strokeColor: strokeColor,
      label: 'Main Screen',
      title: project.title,
      category: project.category
    });
  }

  // 2. Add custom gallery images if they exist, or mock screen fallbacks
  if (project.images && project.images.length > 0) {
    project.images.forEach((img, idx) => {
      galleryList.push({
        type: 'image',
        src: img,
        label: `Screen ${idx + 2}`
      });
    });
  } else {
    // Generate beautiful alternative mock gradient screens for interactive demo
    const isDark = document.documentElement.classList.contains("dark-mode");
    const hue = project.title.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % 360;

    const hue2 = (hue + 60) % 360;
    const bg2 = isDark
      ? `linear-gradient(135deg, hsl(${hue2}, 40%, 15%) 0%, hsl(${(hue2 + 40) % 360}, 45%, 10%) 100%)`
      : `linear-gradient(135deg, hsl(${hue2}, 70%, 94%) 0%, hsl(${(hue2 + 40) % 360}, 75%, 85%) 100%)`;
    const strokeColor2 = isDark ? `hsl(${hue2}, 50%, 65%)` : `hsl(${hue2}, 60%, 45%)`;

    const hue3 = (hue + 120) % 360;
    const bg3 = isDark
      ? `linear-gradient(135deg, hsl(${hue3}, 40%, 15%) 0%, hsl(${(hue3 + 40) % 360}, 45%, 10%) 100%)`
      : `linear-gradient(135deg, hsl(${hue3}, 70%, 94%) 0%, hsl(${(hue3 + 40) % 360}, 75%, 85%) 100%)`;
    const strokeColor3 = isDark ? `hsl(${hue3}, 50%, 65%)` : `hsl(${hue3}, 60%, 45%)`;

    galleryList.push({
      type: 'placeholder',
      bg: bg2,
      strokeColor: strokeColor2,
      label: 'Dashboard view',
      title: project.title,
      category: project.category
    });

    galleryList.push({
      type: 'placeholder',
      bg: bg3,
      strokeColor: strokeColor3,
      label: 'Analytics / Settings',
      title: project.title,
      category: project.category
    });
  }

  // Tech list
  const techHTML = project.technologies.map(tech => `<span class="tech-tag" style="background-color: var(--accent-light); color: var(--accent); font-weight: 700;">${tech}</span>`).join("");

  // Determine status badge details
  const statusLower = (project.status || "").toLowerCase();
  let statusLabel = project.status || "Completed";
  let statusClass = "status-completed";
  
  if (statusLower.includes("complete") || statusLower.includes("selesai")) {
    statusLabel = "Selesai";
    statusClass = "status-completed";
  } else if (statusLower.includes("progress") || statusLower.includes("berlangsung") || statusLower.includes("ongoing") || statusLower.includes("dikerjakan")) {
    statusLabel = "Dalam Pengerjaan";
    statusClass = "status-ongoing";
  }

  // Generate thumbnail buttons HTML
  let thumbsHTML = "";
  galleryList.forEach((item, index) => {
    const activeClass = index === 0 ? "active" : "";
    thumbsHTML += `
      <div class="modal-gallery-thumb-item ${activeClass}" data-index="${index}">
        ${getGalleryItemHTML(item, false)}
      </div>
    `;
  });

  modalBody.innerHTML = `
    <div class="modal-gallery">
      <div class="modal-gallery-main" id="modal-gallery-main-container">
        ${getGalleryItemHTML(galleryList[0], true)}
      </div>
      <div class="modal-gallery-thumbs">
        ${thumbsHTML}
      </div>
    </div>
    <div class="modal-meta-top" style="display: flex; align-items: center; justify-content: space-between; margin-top: 1.25rem; width: 100%;">
      <span class="project-category" style="font-size: 0.85rem; margin-bottom: 0;">${project.category}</span>
      <span class="project-status-badge ${statusClass}">${statusLabel}</span>
    </div>
    <h2 style="font-size: 2rem; margin-top: 0.5rem; letter-spacing: -0.02em;">${project.title}</h2>
    <div class="modal-tech">
      ${techHTML}
    </div>
    <div class="modal-desc">
      ${project.description}
    </div>
    <div class="modal-btns">
      <a href="${project.demoUrl}" target="_blank" class="btn btn-primary">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
        Live Demo
      </a>
      <a href="${project.githubUrl}" target="_blank" class="btn btn-secondary">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path><path d="M9 18c-4.51 2-5-2-7-2"></path></svg>
        GitHub Code
      </a>
    </div>
  `;

  // Bind Switch Thumbnail Click Handlers
  const thumbItems = modalBody.querySelectorAll(".modal-gallery-thumb-item");
  const mainContainer = modalBody.querySelector("#modal-gallery-main-container");

  thumbItems.forEach(thumb => {
    thumb.addEventListener("click", () => {
      thumbItems.forEach(t => t.classList.remove("active"));
      thumb.classList.add("active");

      const index = parseInt(thumb.dataset.index);
      mainContainer.innerHTML = getGalleryItemHTML(galleryList[index], true);
    });
  });

  // Bind Main Image click to Open Fullscreen Lightbox zoom
  mainContainer.addEventListener("click", () => {
    const activeThumb = modalBody.querySelector(".modal-gallery-thumb-item.active");
    if (!activeThumb) return;
    const index = parseInt(activeThumb.dataset.index);
    openLightbox(galleryList[index]);
  });

  // Trigger modal visibility
  modal.classList.add("active");
  document.body.style.overflow = "hidden"; // Prevent scrolling behind modal
}

function setupModalClose() {
  const modal = document.getElementById("project-modal");
  const closeBtn = document.getElementById("modal-close");

  const closeModal = () => {
    modal.classList.remove("active");
    document.body.style.overflow = ""; // Re-enable scrolling
  };

  closeBtn.addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  // Close with Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("active")) {
      closeModal();
    }
  });
}

// 7. CONTACT FORM SUBMISSION TO LOCALSTORAGE & WEB3FORMS API
function setupContactForm() {
  const form = document.getElementById("contact-form");
  const alertBox = document.getElementById("form-alert");
  const submitBtn = document.getElementById("btn-submit-message");

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Get form inputs
    const name = document.getElementById("form-name").value.trim();
    const email = document.getElementById("form-email").value.trim();
    const subject = document.getElementById("form-subject").value.trim();
    const message = document.getElementById("form-message").value.trim();

    // Validation
    if (!name || !email || !subject || !message) {
      alert("Harap isi semua kolom formulir.");
      return;
    }

    const data = AppState.getData();
    const profile = data ? data.profile : null;
    const web3formsKey = profile ? profile.web3formsKey : "";

    // Check if Web3Forms is configured
    const isWeb3FormsConfigured = web3formsKey && 
                                  web3formsKey !== "YOUR_WEB3FORMS_ACCESS_KEY" && 
                                  web3formsKey.trim() !== "";

    if (isWeb3FormsConfigured) {
      // Use Web3Forms API
      const originalBtnHTML = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerText = "Mengirim...";

      try {
        const response = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify({
            access_key: web3formsKey,
            name: name,
            email: email,
            subject: subject,
            message: message,
            from_name: name + " (Melalui Portofolio)"
          })
        });

        const result = await response.json();

        if (response.ok && result.success) {
          // Show success alert
          alertBox.className = "form-alert success";
          alertBox.innerText = `Terima kasih, ${name}! Pesan Anda telah berhasil dikirim ke email saya.`;
          alertBox.style.display = "block";
          form.reset();
        } else {
          // API error response
          alertBox.className = "form-alert error";
          alertBox.innerText = `Gagal mengirim pesan: ${result.message || "Kesalahan pada server Web3Forms."}`;
          alertBox.style.display = "block";
        }
      } catch (error) {
        // Network error
        console.error("Error submitting to Web3Forms:", error);
        alertBox.className = "form-alert error";
        alertBox.innerText = "Terjadi kesalahan jaringan. Silakan periksa koneksi Anda dan coba lagi.";
        alertBox.style.display = "block";
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHTML;
        
        // Hide alert after 8 seconds
        setTimeout(() => {
          alertBox.style.display = "none";
        }, 8000);
      }
    } else {
      // LocalStorage Fallback (For local testing / missing key)
      console.warn("Web3Forms Access Key is not configured. Falling back to local storage saving.");

      // Create new message object
      const newMessage = {
        id: "msg_" + Date.now(),
        name,
        email,
        subject,
        message,
        date: new Date().toISOString(),
        read: false
      };

      // Get existing messages and append
      const messages = JSON.parse(SafeStorage.getItem("daffa_portfolio_messages")) || [];
      messages.push(newMessage);
      SafeStorage.setItem("daffa_portfolio_messages", JSON.stringify(messages));

      // Show success alert indicating local fallback
      alertBox.className = "form-alert success";
      alertBox.innerText = `[Uji Coba Lokal] Terima kasih, ${name}! Pesan Anda disimpan secara lokal karena Web3Forms Access Key belum dikonfigurasi.`;
      alertBox.style.display = "block";

      // Reset form fields
      form.reset();

      // Hide alert after 8 seconds
      setTimeout(() => {
        alertBox.style.display = "none";
      }, 8000);
    }
  });
}

// 8. SCROLL REVEAL INITIALIZATION (INTERSECTION OBSERVER)
let revealObserver = null;
function setupScrollReveal() {
  if (revealObserver) {
    revealObserver.disconnect();
  }

  const revealElements = document.querySelectorAll(".scroll-reveal");

  revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("active");
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: "0px 0px -40px 0px"
  });

  revealElements.forEach(el => {
    if (!el.classList.contains("active")) {
      revealObserver.observe(el);
    }
  });
}

// 9. SCROLL PROGRESS BAR INDICATOR
// 9. SCROLL PROGRESS BAR INDICATOR (BORDER WRAP AROUND NAVBAR)
function setupScrollProgress() {
  const rect = document.getElementById("header-border-rect");
  if (!rect) return;

  const updateProgress = () => {
    const totalLength = rect.getTotalLength();
    rect.style.strokeDasharray = totalLength;

    const windowScroll = window.scrollY || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - window.innerHeight;
    const scrolled = height > 0 ? windowScroll / height : 0;

    // Draw the progress border
    rect.style.strokeDashoffset = totalLength - (totalLength * scrolled);
  };

  // Run on scroll
  window.addEventListener("scroll", updateProgress);

  // Run on resize to recalculate path length (since it is responsive)
  window.addEventListener("resize", updateProgress);

  // Initial call (with a brief delay to ensure layout has rendered)
  setTimeout(updateProgress, 100);
}

// 10. TYPEWRITER EFFECT (ROBUST & COMMAS MULTI-PHRASE CYCLE)
function runTypewriter(element, textString) {
  if (!element || element.dataset.typewriterInit === "true") return;
  element.dataset.typewriterInit = "true";

  // Split by comma to support cycling multiple titles if desired
  const phrases = textString.split(",").map(p => p.trim()).filter(p => p.length > 0);
  if (phrases.length === 0) return;

  let phraseIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  const cursorHTML = '<span class="typewriter-cursor">|</span>';
  element.innerHTML = cursorHTML;

  function tick() {
    const currentPhrase = phrases[phraseIndex];

    if (isDeleting) {
      element.innerHTML = currentPhrase.substring(0, charIndex - 1) + cursorHTML;
      charIndex--;
    } else {
      element.innerHTML = currentPhrase.substring(0, charIndex + 1) + cursorHTML;
      charIndex++;
    }

    // Organic speed variance (typing speeds between 60ms and 110ms)
    let delta = 90 - Math.random() * 40;

    if (isDeleting) {
      delta /= 2.5; // Deleting is much faster than typing
    } else {
      // Humanized pause rhythm on specific characters
      const lastChar = currentPhrase.charAt(charIndex - 1);
      if (lastChar === ' ') {
        delta += 140; // Pause slightly on word spacing
      } else if (lastChar === ',' || lastChar === '&') {
        delta += 240; // Pause longer on punctuation/commas
      }
    }

    if (!isDeleting && charIndex === currentPhrase.length) {
      // Fully typed: render final text + cursor
      element.innerHTML = currentPhrase + cursorHTML;
      
      // If we have more than one phrase, cycle it. Otherwise, STOP ticking to let cursor blink forever!
      if (phrases.length > 1) {
        isDeleting = true;
        setTimeout(tick, 2500); // 2.5 seconds pause
      }
      return;
    } else if (isDeleting && charIndex === 0) {
      // Fully deleted: switch to next phrase
      element.innerHTML = cursorHTML;
      isDeleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      setTimeout(tick, 650); // 0.65s pause before typing next word
      return;
    }

    setTimeout(tick, delta);
  }

  tick();
}

// 11. INTERACTIVE CANVAS PARTICLE BACKGROUND
function setupInteractiveBackground() {
  const canvas = document.getElementById("interactive-bg");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let particles = [];
  let mouse = { x: null, y: null, radius: 180 };

  // Set canvas size
  const resizeCanvas = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  // Track mouse position
  window.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener("mouseleave", () => {
    mouse.x = null;
    mouse.y = null;
  });

  // Particle Class
  class Particle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * 0.45; // slightly faster drift
      this.vy = (Math.random() - 0.5) * 0.45;
      this.radius = Math.random() * 3 + 1.5; // larger size: 1.5px to 4.5px
      this.baseRadius = this.radius;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(99, 102, 241, 0.35)"; // Premium visible indigo blue
      ctx.fill();
    }

    update() {
      // Move particle
      this.x += this.vx;
      this.y += this.vy;

      // Wrap around screen edges
      if (this.x < 0) this.x = canvas.width;
      if (this.x > canvas.width) this.x = 0;
      if (this.y < 0) this.y = canvas.height;
      if (this.y > canvas.height) this.y = 0;

      // Mouse interaction (repulsion)
      if (mouse.x !== null && mouse.y !== null) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.hypot(dx, dy);

        if (distance < mouse.radius) {
          // Push away from mouse
          const force = (mouse.radius - distance) / mouse.radius;
          const angle = Math.atan2(dy, dx);
          
          // Move opposite to mouse direction
          this.x -= Math.cos(angle) * force * 1.5;
          this.y -= Math.sin(angle) * force * 1.5;
          
          // Slightly grow the dot when near mouse for micro-interaction
          this.radius = this.baseRadius + force * 2.5;
        } else {
          // Smoothly return to base size
          if (this.radius > this.baseRadius) {
            this.radius -= 0.1;
          }
        }
      } else {
        // Smoothly return to base size
        if (this.radius > this.baseRadius) {
          this.radius -= 0.1;
        }
      }

      this.draw();
    }
  }

  // Initialize particles
  const initParticles = () => {
    particles = [];
    const density = (canvas.width * canvas.height) / 18000; // responsive count
    const count = Math.min(Math.max(density, 40), 120); // bounds
    for (let i = 0; i < count; i++) {
      particles.push(new Particle());
    }
  };
  initParticles();
  window.addEventListener("resize", initParticles);

  // Draw lines connecting close particles
  const drawLines = () => {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const distance = Math.hypot(dx, dy);

        if (distance < 110) {
          // Draw line with opacity proportional to proximity
          const opacity = (110 - distance) / 110 * 0.18; // stronger lines
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(99, 102, 241, ${opacity})`; // indigo lines
          ctx.lineWidth = 0.9;
          ctx.stroke();
        }
      }

      // Draw connection to mouse
      if (mouse.x !== null && mouse.y !== null) {
        const dx = particles[i].x - mouse.x;
        const dy = particles[i].y - mouse.y;
        const distance = Math.hypot(dx, dy);

        if (distance < mouse.radius) {
          const opacity = (mouse.radius - distance) / mouse.radius * 0.32; // stronger attraction lines
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(99, 102, 241, ${opacity})`; // visible indigo connection to cursor
          ctx.lineWidth = 1.2;
          ctx.stroke();
        }
      }
    }
  };

  // Animation Loop
  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Update and draw particles
    particles.forEach(p => p.update());
    
    // Draw connections
    drawLines();
    
    requestAnimationFrame(animate);
  };
  animate();
}

// 12. INTERACTIVE CUSTOM CURSOR
function setupCustomCursor() {
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  if (isTouchDevice || window.innerWidth <= 768) return;

  const dot = document.getElementById("custom-cursor-dot");
  const outline = document.getElementById("custom-cursor-outline");

  if (!dot || !outline) return;

  let mouseX = 0, mouseY = 0;
  let outlineX = 0, outlineY = 0;

  window.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    dot.style.opacity = 1;
    outline.style.opacity = 1;

    dot.style.left = mouseX + "px";
    dot.style.top = mouseY + "px";
  });

  const animateOutline = () => {
    outlineX += (mouseX - outlineX) * 0.16;
    outlineY += (mouseY - outlineY) * 0.16;

    outline.style.left = outlineX + "px";
    outline.style.top = outlineY + "px";

    requestAnimationFrame(animateOutline);
  };
  animateOutline();

  document.addEventListener("mouseleave", () => {
    dot.style.opacity = 0;
    outline.style.opacity = 0;
  });

  document.addEventListener("mouseenter", () => {
    dot.style.opacity = 1;
    outline.style.opacity = 1;
  });

  document.addEventListener("mouseover", (e) => {
    const hoverTarget = e.target.closest("a, button, .filter-btn, .social-link, .modal-close");
    if (hoverTarget) {
      outline.classList.add("cursor-hover");
    }

    const projectTarget = e.target.closest(".project-card");
    if (projectTarget) {
      outline.classList.add("cursor-project");
    }
  });

  document.addEventListener("mouseout", (e) => {
    const hoverTarget = e.target.closest("a, button, .filter-btn, .social-link, .modal-close");
    if (hoverTarget) {
      outline.classList.remove("cursor-hover");
    }

    const projectTarget = e.target.closest(".project-card");
    if (projectTarget) {
      outline.classList.remove("cursor-project");
    }
  });
}

// 13. 3D TILT EFFECT ON PROJECT CARDS
function setupProjectCard3DTilt() {
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  if (isTouchDevice || window.innerWidth <= 768) return;

  let activeCard = null;

  document.addEventListener("mousemove", (e) => {
    const card = e.target.closest(".project-card");

    if (card) {
      if (activeCard && activeCard !== card) {
        resetCardTilt(activeCard);
      }
      activeCard = card;
      applyCardTilt(e, card);
    } else {
      if (activeCard) {
        resetCardTilt(activeCard);
        activeCard = null;
      }
    }
  });

  function applyCardTilt(e, card) {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const xc = rect.width / 2;
    const yc = rect.height / 2;

    const maxTilt = 8; // 8 degrees max tilt
    const rotateX = ((yc - y) / yc) * maxTilt;
    const rotateY = ((x - xc) / xc) * maxTilt;

    card.style.transition = "transform 0.08s ease-out"; // very fast response
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
  }

  function resetCardTilt(card) {
    card.style.transition = "transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)";
    card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
  }
}

// 14. MAGNETIC BUTTONS EFFECT
function setupMagneticButtons() {
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  if (isTouchDevice || window.innerWidth <= 768) return;

  let activeBtn = null;
  let cachedCenterX = 0;
  let cachedCenterY = 0;

  document.addEventListener("mousemove", (e) => {
    const mx = e.clientX;
    const my = e.clientY;

    if (activeBtn) {
      // Calculate distance from cached center coordinates
      const distX = mx - cachedCenterX;
      const distY = my - cachedCenterY;
      const distance = Math.hypot(distX, distY);
      const threshold = 60; // 60px proximity boundary

      if (distance < threshold) {
        // Apply smooth magnetic translation (35% pull strength)
        const pullX = distX * 0.35;
        const pullY = distY * 0.35;
        activeBtn.style.transition = "transform 0.08s ease-out";
        activeBtn.style.transform = `translate3d(${pullX}px, ${pullY}px, 0) scale(1.02)`;
      } else {
        // Exited proximity threshold: reset button smoothly
        resetBtn(activeBtn);
        activeBtn = null;
      }
    } else {
      // Find visible button in proximity
      const buttons = document.querySelectorAll(".btn");
      for (const btn of buttons) {
        // Quick visibility check (prevent tracking hidden elements)
        if (btn.offsetWidth === 0 || btn.offsetHeight === 0) continue;

        const rect = btn.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const distX = mx - cx;
        const distY = my - cy;
        const distance = Math.hypot(distX, distY);
        const threshold = 60;

        if (distance < threshold) {
          activeBtn = btn;
          cachedCenterX = cx;
          cachedCenterY = cy;

          // Apply immediate magnetic translation
          const pullX = distX * 0.35;
          const pullY = distY * 0.35;
          btn.style.transition = "transform 0.08s ease-out";
          btn.style.transform = `translate3d(${pullX}px, ${pullY}px, 0) scale(1.02)`;
          break;
        }
      }
    }
  });

  // Reset tracking on scroll to prevent button stickiness
  window.addEventListener("scroll", () => {
    if (activeBtn) {
      resetBtn(activeBtn);
      activeBtn = null;
    }
  });

  function resetBtn(btn) {
    btn.style.transition = "transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)";
    btn.style.transform = "translate3d(0, 0, 0) scale(1)";
  }
}

// 15. LIGHT/DARK THEME TOGGLE
function setupThemeToggle() {
  const toggleBtn = document.getElementById("theme-toggle");
  if (!toggleBtn) return;

  const syncTheme = (isDark) => {
    document.documentElement.classList.toggle("dark-mode", isDark);
    document.body.classList.toggle("dark-mode", isDark);
    SafeStorage.setItem("daffa_portfolio_theme", isDark ? "dark" : "light");
  };

  syncTheme(document.documentElement.classList.contains("dark-mode"));

  let switchTimer;

  toggleBtn.addEventListener("click", () => {
    const targetThemeDark = !document.documentElement.classList.contains("dark-mode");

    window.clearTimeout(switchTimer);
    document.documentElement.classList.add("theme-switching");

    requestAnimationFrame(() => {
      syncTheme(targetThemeDark);
    });

    switchTimer = window.setTimeout(() => {
      document.documentElement.classList.remove("theme-switching");
    }, 320);
  });
}

// 16. FULLSCREEN IMAGE LIGHTBOX OVERLAY
function openLightbox(item) {
  const lightbox = document.getElementById("image-lightbox");
  const lightboxImgContainer = lightbox.querySelector(".lightbox-content");

  if (!lightbox || !lightboxImgContainer) return;

  if (item.type === 'image') {
    lightboxImgContainer.innerHTML = `<img id="lightbox-img" src="${item.src}" alt="Zoomed Image">`;
  } else {
    lightboxImgContainer.innerHTML = `
      <div class="project-thumb-placeholder" style="background: ${item.bg}; width: 85vw; height: 70vh; display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 1.5rem; text-align: center; border-radius: var(--radius-md); box-shadow: 0 25px 60px rgba(0, 0, 0, 0.5); border: 1px solid rgba(255, 255, 255, 0.08);">
        <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" style="color: ${item.strokeColor}"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
        <span style="font-size: 1.5rem; font-weight: 700; color: ${item.strokeColor}; text-transform: uppercase; letter-spacing: 0.05em;">${item.label}</span>
        <span style="font-size: 1rem; color: ${item.strokeColor}; opacity: 0.8; max-width: 80%;">${item.title}</span>
      </div>
    `;
  }

  lightbox.classList.add("active");
  lightbox.setAttribute("aria-hidden", "false");
}

function setupLightbox() {
  const lightbox = document.getElementById("image-lightbox");
  const closeBtn = document.getElementById("lightbox-close");

  if (!lightbox) return;

  const closeLightbox = () => {
    lightbox.classList.remove("active");
    lightbox.setAttribute("aria-hidden", "true");
  };

  if (closeBtn) closeBtn.addEventListener("click", closeLightbox);

  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox || e.target.classList.contains("lightbox-content")) {
      closeLightbox();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && lightbox.classList.contains("active")) {
      closeLightbox();
    }
  });
}
