// --- SAFE LOCALSTORAGE WRAPPER ---
const SafeStorage = {
  getItem(key) {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.warn("localStorage.getItem blocked/inaccessible. Using memory fallback.", e);
      return this._memoryStore[key] || null;
    }
  },
  setItem(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn("localStorage.setItem blocked/inaccessible. Using memory fallback.", e);
      this._memoryStore[key] = String(value);
    }
  },
  _memoryStore: {}
};

// --- APP STATE MANAGER ---
const AppState = {
  data: null,

  init() {
    const localData = SafeStorage.getItem("daffa_portfolio_data");
    if (localData) {
      try {
        this.data = JSON.parse(localData);
      } catch (e) {
        console.error("Error parsing portfolio data, resetting to default:", e);
        this.resetToDefault();
      }
    } else {
      this.resetToDefault();
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

// --- UI TOAST NOTIFICATION ---
function showToast(message) {
  const toast = document.getElementById("toast-notif");
  toast.querySelector("span").innerText = message;
  toast.classList.add("active");
  
  setTimeout(() => {
    toast.classList.remove("active");
  }, 3000);
}

// --- MAIN CONTROLLER ON DOM LOAD ---
document.addEventListener("DOMContentLoaded", () => {
  // Initialize state
  AppState.init();

  // Setup tab switches
  setupTabNavigation();

  // Load and pre-fill data
  loadAdminProfileHeader();
  initProfileForm();
  initSkillsPanel();
  initTimelinePanel();
});

// 1. HEADER PROFILE LOADER
function loadAdminProfileHeader() {
  const data = AppState.getData();
  const profile = data.profile;

  document.getElementById("admin-header-name").innerText = profile.name.split(" ")[0];
  
  const avatar = document.getElementById("admin-avatar");
  if (profile.avatar) {
    avatar.innerHTML = `<img src="${profile.avatar}" alt="Admin" style="width:100%; height:100%; object-fit:cover; border-radius:50%">`;
  } else {
    const initials = profile.name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
    avatar.innerHTML = initials;
  }
}

// 2. TAB NAVIGATION SWITCHER
function setupTabNavigation() {
  const menuButtons = document.querySelectorAll(".menu-item");
  const panels = document.querySelectorAll(".admin-panel");
  const titleText = document.getElementById("panel-title-text");

  const titleMap = {
    "panel-profile": "Kelola Profil Portofolio",
    "panel-skills": "Kelola Keahlian & Tech Stack",
    "panel-timeline": "Kelola Riwayat Hidup (Timeline)"
  };

  menuButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetPanelId = btn.dataset.target;

      menuButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      panels.forEach(panel => {
        panel.classList.remove("active");
        if (panel.getAttribute("id") === targetPanelId) {
          panel.classList.add("active");
        }
      });

      titleText.innerText = titleMap[targetPanelId] || "Dashboard Admin";
    });
  });
}

// 3. PROFILE PANEL CONTROLLER
function initProfileForm() {
  const form = document.getElementById("form-profile");
  const btnReset = document.getElementById("btn-reset-profile");
  
  const fileInput = document.getElementById("profile-avatar-file");
  const chooseBtn = document.getElementById("btn-choose-profile");
  const deleteBtn = document.getElementById("btn-delete-avatar");
  const hiddenInput = document.getElementById("profile-avatar");
  const nameInput = document.getElementById("profile-name");

  // Helper function to update avatar preview box
  const updateAvatarPreview = (avatarUrl) => {
    const previewBox = document.getElementById("profile-avatar-preview");
    if (!previewBox) return;

    if (avatarUrl) {
      previewBox.innerHTML = `<img src="${avatarUrl}" alt="Avatar Preview">`;
      if (deleteBtn) deleteBtn.style.display = "inline-flex";
    } else {
      const name = nameInput ? nameInput.value.trim() : "D";
      const initials = name ? name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase() : "D";
      previewBox.innerHTML = initials;
      if (deleteBtn) deleteBtn.style.display = "none";
    }
  };

  // Trigger file input on click
  if (chooseBtn && fileInput) {
    chooseBtn.addEventListener("click", () => {
      fileInput.click();
    });
  }

  // Handle file picker selection
  if (fileInput) {
    fileInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        if (file.size > 1.5 * 1024 * 1024) {
          alert("Ukuran file terlalu besar! Maksimal ukuran adalah 1.5MB.");
          fileInput.value = "";
          return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
          const base64String = event.target.result;
          if (hiddenInput) hiddenInput.value = base64String;
          updateAvatarPreview(base64String);
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Handle deleting profile photo
  if (deleteBtn) {
    deleteBtn.addEventListener("click", () => {
      if (hiddenInput) hiddenInput.value = "";
      if (fileInput) fileInput.value = "";
      updateAvatarPreview("");
    });
  }

  // Handle live initials update on name change
  if (nameInput) {
    nameInput.addEventListener("input", () => {
      if (hiddenInput && !hiddenInput.value) {
        updateAvatarPreview("");
      }
    });
  }
  
  const fillForm = () => {
    const data = AppState.getData();
    const profile = data.profile;

    if (nameInput) nameInput.value = profile.name || "";
    document.getElementById("profile-title").value = profile.title || "";
    document.getElementById("profile-bio").value = profile.bio || "";
    document.getElementById("profile-location").value = profile.location || "";
    document.getElementById("profile-email").value = profile.email || "";
    if (hiddenInput) hiddenInput.value = profile.avatar || "";
    document.getElementById("profile-resume").value = profile.resumeUrl === "#" ? "" : profile.resumeUrl;

    document.getElementById("profile-github").value = profile.github || "";
    document.getElementById("profile-linkedin").value = profile.linkedin || "";
    document.getElementById("profile-instagram").value = profile.instagram || "";
    document.getElementById("profile-twitter").value = profile.twitter || "";

    // Clear file input value just in case
    if (fileInput) fileInput.value = "";
    
    // Update live preview
    updateAvatarPreview(profile.avatar || "");
  };

  fillForm();

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = AppState.getData();
    
    data.profile.name = nameInput ? nameInput.value.trim() : "";
    data.profile.title = document.getElementById("profile-title").value.trim();
    data.profile.bio = document.getElementById("profile-bio").value.trim();
    data.profile.location = document.getElementById("profile-location").value.trim();
    data.profile.email = document.getElementById("profile-email").value.trim();
    data.profile.avatar = hiddenInput ? hiddenInput.value.trim() : "";
    data.profile.resumeUrl = document.getElementById("profile-resume").value.trim() || "#";

    data.profile.github = document.getElementById("profile-github").value.trim();
    data.profile.linkedin = document.getElementById("profile-linkedin").value.trim();
    data.profile.instagram = document.getElementById("profile-instagram").value.trim();
    data.profile.twitter = document.getElementById("profile-twitter").value.trim();

    AppState.save();
    loadAdminProfileHeader();
    showToast("Profil Anda berhasil disimpan!");
  });

  btnReset.addEventListener("click", () => {
    if (confirm("Apakah Anda yakin ingin mereset profil ke data default? Seluruh perubahan profil kustom akan ditimpa.")) {
      AppState.resetToDefault();
      fillForm();
      loadAdminProfileHeader();
      showToast("Profil dikembalikan ke data default!");
    }
  });
}

// 4. SKILLS PANEL CONTROLLER (CRUD)
function initSkillsPanel() {
  const form = document.getElementById("form-skill");
  const levelInput = document.getElementById("skill-level");
  const levelVal = document.getElementById("skill-level-val");
  const btnCancel = document.getElementById("btn-cancel-skill");
  const formTitle = document.getElementById("skill-form-title");
  const btnSave = document.getElementById("btn-save-skill");

  // Sync skill range level display
  levelInput.addEventListener("input", (e) => {
    levelVal.innerText = `${e.target.value}%`;
  });

  // Render skills list
  const renderSkillsList = () => {
    const data = AppState.getData();
    const container = document.getElementById("skills-manager-target");
    container.innerHTML = "";

    if (!data.skills || data.skills.length === 0) {
      container.innerHTML = "<p style='text-align:center; padding: 2rem; color:var(--text-muted);'>Belum ada keahlian ditambahkan.</p>";
      return;
    }

    data.skills.forEach(skill => {
      const item = document.createElement("div");
      item.className = "skill-manager-item";
      
      item.innerHTML = `
        <div class="skill-manager-info">
          <span class="skill-manager-name">${skill.name}</span>
          <span class="skill-manager-cat">${skill.category}</span>
        </div>
        <div class="skill-manager-bar-container">
          <div class="skill-manager-bar">
            <div class="skill-manager-fill" style="width: ${skill.level}%"></div>
          </div>
          <span class="skill-manager-percent">${skill.level}%</span>
        </div>
        <div class="skill-manager-actions">
          <button class="btn btn-edit edit-skill-btn" data-id="${skill.id}">Edit</button>
          <button class="btn btn-danger delete-skill-btn" data-id="${skill.id}">Hapus</button>
        </div>
      `;
      container.appendChild(item);
    });

    // Add listeners to edit/delete buttons
    container.querySelectorAll(".delete-skill-btn").forEach(btn => {
      btn.addEventListener("click", () => deleteSkill(btn.dataset.id));
    });
    container.querySelectorAll(".edit-skill-btn").forEach(btn => {
      btn.addEventListener("click", () => editSkill(btn.dataset.id));
    });
  };

  renderSkillsList();

  // Reset/Cancel Form
  const resetSkillForm = () => {
    form.reset();
    document.getElementById("skill-id-hidden").value = "";
    levelVal.innerText = "80%";
    formTitle.innerText = "Tambah Keahlian Baru";
    btnSave.innerText = "Tambah Keahlian";
    btnCancel.style.display = "none";
  };

  btnCancel.addEventListener("click", resetSkillForm);

  // Add / Edit skill submission
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = AppState.getData();
    
    const id = document.getElementById("skill-id-hidden").value;
    const name = document.getElementById("skill-name").value.trim();
    const category = document.getElementById("skill-category").value;
    const level = parseInt(levelInput.value);

    if (id) {
      // Edit existing
      const skill = data.skills.find(s => s.id === id);
      if (skill) {
        skill.name = name;
        skill.category = category;
        skill.level = level;
        showToast(`Keahlian "${name}" diperbarui!`);
      }
    } else {
      // Create new
      const newSkill = {
        id: "skill_" + Date.now(),
        name,
        category,
        level
      };
      data.skills.push(newSkill);
      showToast(`Keahlian "${name}" berhasil ditambahkan!`);
    }

    AppState.save();
    renderSkillsList();
    resetSkillForm();
  });

  // Delete skill
  const deleteSkill = (skillId) => {
    const data = AppState.getData();
    const skill = data.skills.find(s => s.id === skillId);
    
    if (skill && confirm(`Apakah Anda yakin ingin menghapus keahlian "${skill.name}"?`)) {
      data.skills = data.skills.filter(s => s.id !== skillId);
      AppState.save();
      renderSkillsList();
      showToast(`Keahlian "${skill.name}" berhasil dihapus.`);
    }
  };

  // Edit skill trigger
  const editSkill = (skillId) => {
    const data = AppState.getData();
    const skill = data.skills.find(s => s.id === skillId);

    if (skill) {
      document.getElementById("skill-id-hidden").value = skill.id;
      document.getElementById("skill-name").value = skill.name;
      document.getElementById("skill-category").value = skill.category;
      levelInput.value = skill.level;
      levelVal.innerText = `${skill.level}%`;

      formTitle.innerText = "Edit Keahlian";
      btnSave.innerText = "Simpan Perubahan";
      btnCancel.style.display = "inline-flex";

      // Scroll to form smoothly
      form.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };
}

// 5. TIMELINE PANEL CONTROLLER (CRUD)
function initTimelinePanel() {
  const form = document.getElementById("form-timeline");
  const formTitle = document.getElementById("timeline-form-title");
  const btnSave = document.getElementById("btn-save-timeline");
  const btnCancel = document.getElementById("btn-cancel-timeline");
  const fieldsTarget = document.getElementById("timeline-fields-target");
  const listTitle = document.getElementById("timeline-list-title");

  // Interior tabs
  const tabBtnExp = document.getElementById("tab-btn-exp");
  const tabBtnEdu = document.getElementById("tab-btn-edu");
  const typeHidden = document.getElementById("timeline-type-hidden");

  let currentTabType = "experience"; // Default

  const renderTimelineFields = (type) => {
    fieldsTarget.innerHTML = "";

    if (type === "experience") {
      fieldsTarget.innerHTML = `
        <div class="form-group">
          <label for="timeline-role" class="form-label">Jabatan (Role)</label>
          <input type="text" id="timeline-role" class="form-input" placeholder="Contoh: Junior Full Stack Developer" required>
        </div>
        <div class="form-group">
          <label for="timeline-company" class="form-label">Perusahaan / Instansi</label>
          <input type="text" id="timeline-company" class="form-input" placeholder="Contoh: Tech Solution Indonesia" required>
        </div>
        <div class="form-grid" style="margin-top: 1rem;">
          <div class="form-group">
            <label for="timeline-type" class="form-label">Tipe Kontrak</label>
            <select id="timeline-type" class="form-input" required>
              <option value="Internship">Internship</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Freelance">Freelance</option>
              <option value="Contract">Contract</option>
            </select>
          </div>
          <div class="form-group">
            <label for="timeline-period" class="form-label">Periode Waktu</label>
            <input type="text" id="timeline-period" class="form-input" placeholder="Contoh: Des 2025 - Mar 2026" required>
          </div>
        </div>
        <div class="form-group form-fullwidth" style="margin-top: 1rem;">
          <label class="form-label">Rincian Pekerjaan (Deskripsi Kerja)</label>
          <div class="description-list-builder" id="timeline-desc-list-target">
            <!-- Dynamic rows of description bullet points -->
          </div>
          <button type="button" class="btn btn-secondary btn-add-desc" id="btn-add-desc-row">
            + Tambah Baris Deskripsi
          </button>
        </div>
      `;

      // Set up click action to add bullet point rows
      document.getElementById("btn-add-desc-row").addEventListener("click", () => addDescInputRow(""));
      addDescInputRow(""); // Add first blank row by default
    } else {
      // Education
      fieldsTarget.innerHTML = `
        <div class="form-group">
          <label for="timeline-degree" class="form-label">Gelar / Bidang Pendidikan / Sertifikasi</label>
          <input type="text" id="timeline-degree" class="form-input" placeholder="Contoh: Sarjana Komputer, Teknik Informatika" required>
        </div>
        <div class="form-group">
          <label for="timeline-institution" class="form-label">Lembaga / Universitas</label>
          <input type="text" id="timeline-institution" class="form-input" placeholder="Contoh: Universitas Indonesia" required>
        </div>
        <div class="form-group">
          <label for="timeline-period" class="form-label">Periode / Tahun Lulus</label>
          <input type="text" id="timeline-period" class="form-input" placeholder="Contoh: 2022 - 2026 atau 2024" required>
        </div>
        <div class="form-group form-fullwidth" style="margin-top: 1rem;">
          <label for="timeline-description" class="form-label">Deskripsi Tambahan / Info Pendukung</label>
          <textarea id="timeline-description" class="form-input form-textarea" placeholder="Tulis rincian konsentrasi studi, nilai IPK, atau materi sertifikasi..."></textarea>
        </div>
      `;
    }
  };

  // Helper dynamic description row inputs for Experience
  const addDescInputRow = (valueText = "") => {
    const container = document.getElementById("timeline-desc-list-target");
    if (!container) return;

    const row = document.createElement("div");
    row.className = "desc-input-row";

    row.innerHTML = `
      <input type="text" class="form-input timeline-desc-point" value="${valueText}" placeholder="Tulis satu butir rincian tugas..." required>
      <button type="button" class="btn-icon-danger btn-remove-desc-row" aria-label="Hapus">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>
    `;

    row.querySelector(".btn-remove-desc-row").addEventListener("click", () => {
      row.remove();
      // Ensure there's always at least one row
      if (container.querySelectorAll(".desc-input-row").length === 0) {
        addDescInputRow("");
      }
    });

    container.appendChild(row);
  };

  // Render lists of items
  const renderTimelineList = () => {
    const data = AppState.getData();
    const container = document.getElementById("timeline-manager-target");
    container.innerHTML = "";

    const items = currentTabType === "experience" ? data.experiences : data.educations;
    listTitle.innerText = currentTabType === "experience" ? "Daftar Pengalaman Aktif" : "Daftar Pendidikan Aktif";

    if (!items || items.length === 0) {
      container.innerHTML = `<p style='text-align:center; padding: 2rem; color:var(--text-muted);'>Belum ada riwayat ${currentTabType === "experience" ? "pengalaman" : "pendidikan"} ditambahkan.</p>`;
      return;
    }

    items.forEach(item => {
      const card = document.createElement("div");
      card.className = "timeline-manager-item";

      const headingTitle = currentTabType === "experience" ? item.role : item.degree;
      const subtitle = currentTabType === "experience" ? `${item.company} &bull; ${item.type}` : item.institution;

      card.innerHTML = `
        <div class="timeline-manager-header">
          <div>
            <h3 class="timeline-manager-title">${headingTitle}</h3>
            <div class="timeline-manager-subtitle">${subtitle}</div>
          </div>
          <span class="timeline-manager-period">${item.period}</span>
        </div>
        <div class="timeline-manager-actions">
          <button class="btn btn-edit edit-timeline-btn" data-id="${item.id}">Edit</button>
          <button class="btn btn-danger delete-timeline-btn" data-id="${item.id}">Hapus</button>
        </div>
      `;
      container.appendChild(card);
    });

    // Add click triggers
    container.querySelectorAll(".delete-timeline-btn").forEach(btn => {
      btn.addEventListener("click", () => deleteTimelineItem(btn.dataset.id));
    });
    container.querySelectorAll(".edit-timeline-btn").forEach(btn => {
      btn.addEventListener("click", () => editTimelineItem(btn.dataset.id));
    });
  };

  // Reset form
  const resetTimelineForm = () => {
    form.reset();
    document.getElementById("timeline-id-hidden").value = "";
    
    // Refresh fields builder
    renderTimelineFields(currentTabType);

    formTitle.innerText = currentTabType === "experience" ? "Tambah Pengalaman Baru" : "Tambah Pendidikan Baru";
    btnSave.innerText = "Simpan Riwayat";
    btnCancel.style.display = "none";
  };

  btnCancel.addEventListener("click", resetTimelineForm);

  // Tab switching click listeners
  tabBtnExp.addEventListener("click", () => {
    if (currentTabType === "experience") return;
    currentTabType = "experience";
    typeHidden.value = "experience";

    tabBtnExp.classList.add("active");
    tabBtnEdu.classList.remove("active");

    resetTimelineForm();
    renderTimelineList();
  });

  tabBtnEdu.addEventListener("click", () => {
    if (currentTabType === "education") return;
    currentTabType = "education";
    typeHidden.value = "education";

    tabBtnEdu.classList.add("active");
    tabBtnExp.classList.remove("active");

    resetTimelineForm();
    renderTimelineList();
  });

  // Initialize view
  renderTimelineFields("experience");
  renderTimelineList();

  // Submit Experience / Education
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = AppState.getData();
    const id = document.getElementById("timeline-id-hidden").value;
    const period = document.getElementById("timeline-period").value.trim();

    if (currentTabType === "experience") {
      const role = document.getElementById("timeline-role").value.trim();
      const company = document.getElementById("timeline-company").value.trim();
      const type = document.getElementById("timeline-type").value;
      
      // Get dynamic bullet descriptions
      const descElements = document.querySelectorAll(".timeline-desc-point");
      const description = [];
      descElements.forEach(el => {
        const val = el.value.trim();
        if (val) description.push(val);
      });

      if (description.length === 0) {
        alert("Harap masukkan setidaknya satu rincian pekerjaan.");
        return;
      }

      if (id) {
        // Edit
        const exp = data.experiences.find(e => e.id === id);
        if (exp) {
          exp.role = role;
          exp.company = company;
          exp.type = type;
          exp.period = period;
          exp.description = description;
          showToast(`Pengalaman di "${company}" diperbarui!`);
        }
      } else {
        // Add
        const newExp = {
          id: "exp_" + Date.now(),
          role,
          company,
          type,
          period,
          description
        };
        data.experiences.push(newExp);
        showToast(`Pengalaman kerja di "${company}" berhasil ditambahkan!`);
      }
    } else {
      // Education
      const degree = document.getElementById("timeline-degree").value.trim();
      const institution = document.getElementById("timeline-institution").value.trim();
      const description = document.getElementById("timeline-description").value.trim();

      if (id) {
        const edu = data.educations.find(e => e.id === id);
        if (edu) {
          edu.degree = degree;
          edu.institution = institution;
          edu.period = period;
          edu.description = description;
          showToast(`Riwayat pendidikan di "${institution}" diperbarui!`);
        }
      } else {
        const newEdu = {
          id: "edu_" + Date.now(),
          degree,
          institution,
          period,
          description
        };
        data.educations.push(newEdu);
        showToast(`Riwayat pendidikan di "${institution}" berhasil ditambahkan!`);
      }
    }

    AppState.save();
    renderTimelineList();
    resetTimelineForm();
  });

  // Delete timeline item
  const deleteTimelineItem = (itemId) => {
    const data = AppState.getData();
    let name = "";

    if (currentTabType === "experience") {
      const exp = data.experiences.find(e => e.id === itemId);
      if (exp) {
        name = exp.role;
        if (confirm(`Apakah Anda yakin ingin menghapus riwayat pengalaman "${name}"?`)) {
          data.experiences = data.experiences.filter(e => e.id !== itemId);
          AppState.save();
          renderTimelineList();
          showToast(`Riwayat "${name}" berhasil dihapus.`);
        }
      }
    } else {
      const edu = data.educations.find(e => e.id === itemId);
      if (edu) {
        name = edu.degree;
        if (confirm(`Apakah Anda yakin ingin menghapus riwayat pendidikan "${name}"?`)) {
          data.educations = data.educations.filter(e => e.id !== itemId);
          AppState.save();
          renderTimelineList();
          showToast(`Riwayat "${name}" berhasil dihapus.`);
        }
      }
    }
  };

  // Edit timeline item trigger
  const editTimelineItem = (itemId) => {
    const data = AppState.getData();

    if (currentTabType === "experience") {
      const exp = data.experiences.find(e => e.id === itemId);
      if (exp) {
        document.getElementById("timeline-id-hidden").value = exp.id;
        renderTimelineFields("experience"); // Refresh field HTML to exp template

        document.getElementById("timeline-role").value = exp.role;
        document.getElementById("timeline-company").value = exp.company;
        document.getElementById("timeline-type").value = exp.type;
        document.getElementById("timeline-period").value = exp.period;

        // Clear dynamic descriptions and load exp points
        const descContainer = document.getElementById("timeline-desc-list-target");
        descContainer.innerHTML = "";
        exp.description.forEach(desc => {
          addDescInputRow(desc);
        });

        formTitle.innerText = "Edit Pengalaman Kerja";
        btnSave.innerText = "Simpan Perubahan";
        btnCancel.style.display = "inline-flex";
        form.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    } else {
      const edu = data.educations.find(e => e.id === itemId);
      if (edu) {
        document.getElementById("timeline-id-hidden").value = edu.id;
        document.getElementById("timeline-degree").value = edu.degree;
        document.getElementById("timeline-institution").value = edu.institution;
        document.getElementById("timeline-period").value = edu.period;
        document.getElementById("timeline-description").value = edu.description || "";

        formTitle.innerText = "Edit Riwayat Pendidikan";
        btnSave.innerText = "Simpan Perubahan";
        btnCancel.style.display = "inline-flex";
        form.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };
}
