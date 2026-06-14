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

// --- MOBILE SIDEBAR TOGGLE ---
function initMobileSidebar() {
  const toggle = document.getElementById("mobile-menu-toggle");
  const overlay = document.getElementById("sidebar-overlay");
  const sidebar = document.querySelector(".sidebar");

  function isMobile() {
    return window.innerWidth <= 768;
  }

  function showToggle() {
    if (toggle) toggle.style.display = isMobile() ? "flex" : "none";
  }

  function openSidebar() {
    sidebar && sidebar.classList.add("mobile-open");
    overlay && overlay.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeSidebar() {
    sidebar && sidebar.classList.remove("mobile-open");
    overlay && overlay.classList.remove("active");
    document.body.style.overflow = "";
  }

  if (toggle) {
    toggle.addEventListener("click", () => {
      if (sidebar && sidebar.classList.contains("mobile-open")) {
        closeSidebar();
      } else {
        openSidebar();
      }
    });
  }

  if (overlay) {
    overlay.addEventListener("click", closeSidebar);
  }

  // Close sidebar when a menu item is clicked on mobile
  document.querySelectorAll(".menu-item").forEach(item => {
    item.addEventListener("click", () => {
      if (isMobile()) closeSidebar();
    });
  });

  showToggle();
  window.addEventListener("resize", showToggle);
}

// --- MAIN CONTROLLER ON DOM LOAD ---
document.addEventListener("DOMContentLoaded", () => {
  // Initialize state
  AppState.init();

  // Setup mobile sidebar
  initMobileSidebar();

  // Setup tab switches
  setupTabNavigation();

  // Load and pre-fill data
  loadAdminProfileHeader();
  initProfileForm();
  initSkillsPanel();
  initTimelinePanel();
  initProjectsPanel();
});

// 1. HEADER PROFILE LOADER
function loadAdminProfileHeader() {
  const data = AppState.getData();
  const profile = data.profile;

  const headerNameEl = document.getElementById("admin-header-name");
  if (headerNameEl) {
    headerNameEl.innerText = profile.name.split(" ")[0];
  }
  
  const avatar = document.getElementById("admin-avatar");
  if (avatar) {
    if (profile.avatar) {
      avatar.innerHTML = `<img src="${profile.avatar}" alt="Admin" style="width:100%; height:100%; object-fit:cover; border-radius:50%">`;
    } else {
      const initials = profile.name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
      avatar.innerHTML = initials;
    }
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
    "panel-timeline": "Kelola Riwayat Hidup (Timeline)",
    "panel-projects": "Kelola Proyek & Kategori"
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

  // --- PROFILE AVATAR CROPPER SYSTEM ---
  const cropModal = document.getElementById("crop-modal");
  const cropModalClose = document.getElementById("crop-modal-close");
  const btnCropCancel = document.getElementById("btn-crop-cancel");
  const btnCropSave = document.getElementById("btn-crop-save");
  
  const cropViewport = document.getElementById("crop-viewport");
  const cropImage = document.getElementById("crop-image");
  const cropZoom = document.getElementById("crop-zoom");
  
  const btnZoomIn = document.getElementById("btn-zoom-in");
  const btnZoomOut = document.getElementById("btn-zoom-out");
  const btnCenterPhoto = document.getElementById("btn-center-photo");
  const btnToggleGrid = document.getElementById("btn-toggle-grid");
  const cropGridOverlay = document.getElementById("crop-grid-overlay");

  let cropState = {
    imgObj: null,
    imgW: 0,
    imgH: 0,
    imgX: 0,
    imgY: 0,
    zoom: 1.0,
    offsetX: 0,
    offsetY: 0,
    isDragging: false,
    startX: 0,
    startY: 0,
    gridOn: true
  };

  const openCropModal = (dataUrl) => {
    cropState.imgObj = new Image();
    cropState.imgObj.src = dataUrl;
    cropState.imgObj.onload = () => {
      cropImage.src = dataUrl;
      
      const W_i = cropState.imgObj.naturalWidth;
      const H_i = cropState.imgObj.naturalHeight;
      const V = 280;
      
      // Calculate initial dimensions to cover viewport
      if (W_i > H_i) {
        cropState.imgH = V;
        cropState.imgW = V * (W_i / H_i);
        cropState.imgX = (V - cropState.imgW) / 2;
        cropState.imgY = 0;
      } else {
        cropState.imgW = V;
        cropState.imgH = V * (H_i / W_i);
        cropState.imgX = 0;
        cropState.imgY = (V - cropState.imgH) / 2;
      }
      
      // Reset coordinates and zoom
      cropState.zoom = 1.0;
      cropState.offsetX = 0;
      cropState.offsetY = 0;
      
      // Update element layout sizes
      cropImage.style.width = `${cropState.imgW}px`;
      cropImage.style.height = `${cropState.imgH}px`;
      cropImage.style.left = `${cropState.imgX}px`;
      cropImage.style.top = `${cropState.imgY}px`;
      
      cropZoom.value = "1.0";
      
      updateImageTransform();
      
      // Show modal
      cropModal.classList.add("active");
      cropModal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    };
  };

  const updateImageTransform = () => {
    cropImage.style.transform = `translate3d(${cropState.offsetX}px, ${cropState.offsetY}px, 0) scale(${cropState.zoom})`;
  };

  const limitDragOffsets = () => {
    const zoom = cropState.zoom;
    const imgW = cropState.imgW;
    const imgH = cropState.imgH;
    const imgX = cropState.imgX;
    const imgY = cropState.imgY;
    const V = 280;
    
    // Bounds boundaries math
    const maxOffsetX = -imgX - (imgW / 2) * (1 - zoom);
    const minOffsetX = V - imgX - (imgW / 2) * (1 - zoom) - imgW * zoom;
    
    const maxOffsetY = -imgY - (imgH / 2) * (1 - zoom);
    const minOffsetY = V - imgY - (imgH / 2) * (1 - zoom) - imgH * zoom;
    
    if (cropState.offsetX > maxOffsetX) cropState.offsetX = maxOffsetX;
    if (cropState.offsetX < minOffsetX) cropState.offsetX = minOffsetX;
    if (cropState.offsetY > maxOffsetY) cropState.offsetY = maxOffsetY;
    if (cropState.offsetY < minOffsetY) cropState.offsetY = minOffsetY;
  };

  const startDrag = (clientX, clientY) => {
    cropState.isDragging = true;
    cropState.startX = clientX - cropState.offsetX;
    cropState.startY = clientY - cropState.offsetY;
  };

  const moveDrag = (clientX, clientY) => {
    if (!cropState.isDragging) return;
    cropState.offsetX = clientX - cropState.startX;
    cropState.offsetY = clientY - cropState.startY;
    
    limitDragOffsets();
    updateImageTransform();
  };

  const endDrag = () => {
    cropState.isDragging = false;
  };

  // Viewport Dragging Mouse Listeners
  cropViewport.addEventListener("mousedown", (e) => {
    e.preventDefault();
    startDrag(e.clientX, e.clientY);
  });

  window.addEventListener("mousemove", (e) => {
    if (!cropState.isDragging) return;
    moveDrag(e.clientX, e.clientY);
  });

  window.addEventListener("mouseup", endDrag);

  // Viewport Dragging Touch Listeners
  cropViewport.addEventListener("touchstart", (e) => {
    if (e.touches.length === 1) {
      e.preventDefault();
      startDrag(e.touches[0].clientX, e.touches[0].clientY);
    }
  });

  window.addEventListener("touchmove", (e) => {
    if (!cropState.isDragging) return;
    if (e.touches.length === 1) {
      moveDrag(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: false });

  window.addEventListener("touchend", endDrag);

  // Zoom Controls
  cropZoom.addEventListener("input", (e) => {
    cropState.zoom = parseFloat(e.target.value);
    limitDragOffsets();
    updateImageTransform();
  });

  btnZoomIn.addEventListener("click", () => {
    let z = cropState.zoom + 0.1;
    if (z > 4.0) z = 4.0;
    cropState.zoom = z;
    cropZoom.value = z.toString();
    limitDragOffsets();
    updateImageTransform();
  });

  btnZoomOut.addEventListener("click", () => {
    let z = cropState.zoom - 0.1;
    if (z < 1.0) z = 1.0;
    cropState.zoom = z;
    cropZoom.value = z.toString();
    limitDragOffsets();
    updateImageTransform();
  });

  // Center & Grid controls
  btnCenterPhoto.addEventListener("click", () => {
    cropState.offsetX = 0;
    cropState.offsetY = 0;
    cropState.zoom = 1.0;
    cropZoom.value = "1.0";
    updateImageTransform();
  });

  btnToggleGrid.addEventListener("click", () => {
    cropState.gridOn = !cropState.gridOn;
    if (cropState.gridOn) {
      cropGridOverlay.classList.remove("hidden");
      btnToggleGrid.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line><line x1="15" y1="3" x2="15" y2="21"></line><line x1="3" y1="9" x2="21" y2="9"></line><line x1="3" y1="15" x2="21" y2="15"></line></svg>
        Grid: ON
      `;
    } else {
      cropGridOverlay.classList.add("hidden");
      btnToggleGrid.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line><line x1="15" y1="3" x2="15" y2="21"></line><line x1="3" y1="9" x2="21" y2="9"></line><line x1="3" y1="15" x2="21" y2="15"></line></svg>
        Grid: OFF
      `;
    }
  });

  // Modal Cancel & Close
  const closeCropModal = () => {
    cropModal.classList.remove("active");
    cropModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    fileInput.value = "";
  };

  cropModalClose.addEventListener("click", closeCropModal);
  btnCropCancel.addEventListener("click", closeCropModal);

  // Modal Save Changes (Render base64 avatar via Canvas)
  btnCropSave.addEventListener("click", () => {
    const canvas = document.createElement("canvas");
    canvas.width = 500;
    canvas.height = 500;
    const ctx = canvas.getContext("2d");
    
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    
    const V = 280;
    const C = 500;
    const r = C / V;
    
    const zoom = cropState.zoom;
    const leftScaled = cropState.imgX + (cropState.imgW / 2) * (1 - zoom) + cropState.offsetX;
    const topScaled = cropState.imgY + (cropState.imgH / 2) * (1 - zoom) + cropState.offsetY;
    const wScaled = cropState.imgW * zoom;
    const hScaled = cropState.imgH * zoom;
    
    ctx.drawImage(
      cropState.imgObj, 
      leftScaled * r, 
      topScaled * r, 
      wScaled * r, 
      hScaled * r
    );
    
    const croppedBase64 = canvas.toDataURL("image/jpeg", 0.9);
    
    if (hiddenInput) hiddenInput.value = croppedBase64;
    updateAvatarPreview(croppedBase64);
    closeCropModal();
    showToast("Foto profil telah disesuaikan!");
  });

  // Handle file picker selection and open cropper modal
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
          openCropModal(event.target.result);
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
    document.getElementById("profile-web3forms").value = profile.web3formsKey || "";
    document.getElementById("profile-experience-years").value = profile.experienceYears || "";

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
    data.profile.web3formsKey = document.getElementById("profile-web3forms").value.trim() || "";
    data.profile.experienceYears = document.getElementById("profile-experience-years").value.trim() || "";

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

// Image compression helper using HTML5 Canvas
function compressImage(file, maxWidth, maxHeight, quality, callback) {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = (event) => {
    const img = new Image();
    img.src = event.target.result;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);

      // Compress to JPEG
      const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
      callback(compressedDataUrl);
    };
  };
}

// 6. PROJECTS & CATEGORIES PANEL CONTROLLER
function initProjectsPanel() {
  const tabBtnList = document.getElementById("tab-btn-project-list");
  const tabBtnCats = document.getElementById("tab-btn-project-categories");
  const viewList = document.getElementById("project-tab-list-view");
  const viewCats = document.getElementById("project-tab-categories-view");

  let currentSubTab = "list"; // or "categories"

  // Switch Sub-Tabs
  if (tabBtnList && tabBtnCats) {
    tabBtnList.addEventListener("click", () => {
      if (currentSubTab === "list") return;
      currentSubTab = "list";
      tabBtnList.classList.add("active");
      tabBtnCats.classList.remove("active");
      viewList.style.display = "block";
      viewCats.style.display = "none";
      resetProjectForm();
      renderProjectsList();
    });

    tabBtnCats.addEventListener("click", () => {
      if (currentSubTab === "categories") return;
      currentSubTab = "categories";
      tabBtnCats.classList.add("active");
      tabBtnList.classList.remove("active");
      viewCats.style.display = "block";
      viewList.style.display = "none";
      resetCategoryForm();
      renderCategoriesList();
    });
  }

  // --- PROJECT THUMBNAIL UPLOADER ---
  const fileInput = document.getElementById("project-thumb-file");
  const chooseBtn = document.getElementById("btn-choose-project-thumb");
  const deleteBtn = document.getElementById("btn-delete-project-thumb");
  const hiddenInput = document.getElementById("project-thumbnail");

  const updateProjectThumbPreview = (thumbUrl) => {
    const previewBox = document.getElementById("project-thumb-preview");
    if (!previewBox) return;

    if (thumbUrl) {
      previewBox.innerHTML = `<img src="${thumbUrl}" alt="Project Thumbnail Preview">`;
      if (deleteBtn) deleteBtn.style.display = "inline-flex";
    } else {
      previewBox.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--text-light);"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
      `;
      if (deleteBtn) deleteBtn.style.display = "none";
    }
  };

  if (chooseBtn && fileInput) {
    chooseBtn.addEventListener("click", () => fileInput.click());
  }

  if (fileInput) {
    fileInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        // Compress thumbnail to keep localStorage usage small
        compressImage(file, 800, 500, 0.7, (compressedBase64) => {
          if (hiddenInput) hiddenInput.value = compressedBase64;
          updateProjectThumbPreview(compressedBase64);
        });
      }
    });
  }

  if (deleteBtn) {
    deleteBtn.addEventListener("click", () => {
      if (hiddenInput) hiddenInput.value = "";
      if (fileInput) fileInput.value = "";
      updateProjectThumbPreview("");
    });
  }

  // --- PROJECT CRUD LOGIC ---
  const projectForm = document.getElementById("form-project");
  const projectFormTitle = document.getElementById("project-form-title");
  const btnSaveProject = document.getElementById("btn-save-project");
  const btnCancelProject = document.getElementById("btn-cancel-project");
  const projectCategorySelect = document.getElementById("project-category-select");

  const populateCategorySelect = () => {
    if (!projectCategorySelect) return;
    const data = AppState.getData();
    const categories = data.projectCategories || ["Frontend", "Backend", "Fullstack"];
    
    projectCategorySelect.innerHTML = categories.map(cat => `<option value="${cat}">${cat}</option>`).join("");
  };

  const renderProjectsList = () => {
    const data = AppState.getData();
    const container = document.getElementById("projects-manager-target");
    if (!container) return;
    container.innerHTML = "";

    const projects = data.projects || [];
    if (projects.length === 0) {
      container.innerHTML = `<div class="project-manager-empty">Belum ada proyek. Tambahkan proyek pertama Anda!</div>`;
      return;
    }

    projects.forEach(proj => {
      const item = document.createElement("div");
      item.className = "project-manager-item";

      const thumbHTML = proj.thumbnail
        ? `<img src="${proj.thumbnail}" alt="Thumbnail">`
        : `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>`;

      // Determine status chip colour class
      const statusLower = (proj.status || "").toLowerCase();
      let statusClass = "";
      if (statusLower.includes("complete") || statusLower.includes("selesai")) {
        statusClass = "meta-status-completed";
      } else if (statusLower.includes("progress") || statusLower.includes("berlangsung")) {
        statusClass = "meta-status-progress";
      }

      const featuredBadge = proj.featured
        ? `<span class="project-manager-meta-item project-manager-meta-featured">⭐ Unggulan</span>`
        : "";

      item.innerHTML = `
        <div class="project-manager-thumb">${thumbHTML}</div>
        <div class="project-manager-info">
          <span class="project-manager-title" title="${proj.title}">${proj.title}</span>
          <div class="project-manager-meta">
            <span class="project-manager-meta-item">${proj.category || "—"}</span>
            <span class="project-manager-meta-item ${statusClass}">${proj.status || "—"}</span>
            ${featuredBadge}
          </div>
        </div>
        <div class="project-manager-actions">
          <button class="btn btn-edit edit-project-btn" data-id="${proj.id}">Edit</button>
          <button class="btn btn-danger delete-project-btn" data-id="${proj.id}">Hapus</button>
        </div>
      `;
      container.appendChild(item);
    });

    container.querySelectorAll(".delete-project-btn").forEach(btn => {
      btn.addEventListener("click", () => deleteProject(btn.dataset.id));
    });
    container.querySelectorAll(".edit-project-btn").forEach(btn => {
      btn.addEventListener("click", () => editProject(btn.dataset.id));
    });
  };

  const resetProjectForm = () => {
    if (projectForm) projectForm.reset();
    document.getElementById("project-id-hidden").value = "";
    if (hiddenInput) hiddenInput.value = "";
    if (fileInput) fileInput.value = "";
    updateProjectThumbPreview("");
    if (projectFormTitle) projectFormTitle.innerText = "Tambah Proyek Baru";
    if (btnSaveProject) btnSaveProject.innerText = "Simpan Proyek";
    if (btnCancelProject) btnCancelProject.style.display = "none";
    populateCategorySelect();
  };

  if (btnCancelProject) {
    btnCancelProject.addEventListener("click", resetProjectForm);
  }

  if (projectForm) {
    projectForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = AppState.getData();
      if (!data.projects) data.projects = [];

      const id = document.getElementById("project-id-hidden").value;
      const title = document.getElementById("project-title-input").value.trim();
      const category = projectCategorySelect.value;
      const status = document.getElementById("project-status-select").value;
      const thumbnail = hiddenInput ? hiddenInput.value : "";
      const description = document.getElementById("project-description-input").value.trim();
      const techString = document.getElementById("project-technologies-input").value.trim();
      const technologies = techString.split(",").map(t => t.trim()).filter(t => t.length > 0);
      const demoUrl = document.getElementById("project-demo-url-input").value.trim() || "#";
      const githubUrl = document.getElementById("project-github-url-input").value.trim() || "#";
      const featured = document.getElementById("project-featured-input").checked;

      if (id) {
        // Edit existing project
        const proj = data.projects.find(p => p.id === id);
        if (proj) {
          proj.title = title;
          proj.category = category;
          proj.status = status;
          proj.thumbnail = thumbnail;
          proj.description = description;
          proj.technologies = technologies;
          proj.demoUrl = demoUrl;
          proj.githubUrl = githubUrl;
          proj.featured = featured;
          showToast(`Proyek "${title}" berhasil diperbarui!`);
        }
      } else {
        // Create new project
        const newProj = {
          id: "proj_" + Date.now(),
          title,
          category,
          status,
          thumbnail,
          description,
          technologies,
          demoUrl,
          githubUrl,
          featured
        };
        data.projects.push(newProj);
        showToast(`Proyek "${title}" berhasil ditambahkan!`);
      }

      AppState.save();
      renderProjectsList();
      resetProjectForm();
    });
  }

  const editProject = (projId) => {
    const data = AppState.getData();
    const proj = data.projects.find(p => p.id === projId);
    if (!proj) return;

    document.getElementById("project-id-hidden").value = proj.id;
    document.getElementById("project-title-input").value = proj.title;
    
    // Ensure select dropdown has option, populate first
    populateCategorySelect();
    projectCategorySelect.value = proj.category;

    document.getElementById("project-status-select").value = proj.status || "Completed";
    if (hiddenInput) hiddenInput.value = proj.thumbnail || "";
    updateProjectThumbPreview(proj.thumbnail || "");
    document.getElementById("project-description-input").value = proj.description || "";
    document.getElementById("project-technologies-input").value = (proj.technologies || []).join(", ");
    document.getElementById("project-demo-url-input").value = proj.demoUrl === "#" ? "" : proj.demoUrl;
    document.getElementById("project-github-url-input").value = proj.githubUrl === "#" ? "" : proj.githubUrl;
    document.getElementById("project-featured-input").checked = !!proj.featured;

    if (projectFormTitle) projectFormTitle.innerText = "Edit Proyek";
    if (btnSaveProject) btnSaveProject.innerText = "Simpan Perubahan";
    if (btnCancelProject) btnCancelProject.style.display = "inline-flex";

    if (projectForm) {
      projectForm.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const deleteProject = (projId) => {
    const data = AppState.getData();
    const proj = data.projects.find(p => p.id === projId);
    if (proj && confirm(`Apakah Anda yakin ingin menghapus proyek "${proj.title}"?`)) {
      data.projects = data.projects.filter(p => p.id !== projId);
      AppState.save();
      renderProjectsList();
      showToast(`Proyek "${proj.title}" berhasil dihapus.`);
    }
  };

  // --- CATEGORY CRUD LOGIC ---
  const categoryForm = document.getElementById("form-category");
  const categoryFormTitle = document.getElementById("category-form-title");
  const btnSaveCategory = document.getElementById("btn-save-category");
  const btnCancelCategory = document.getElementById("btn-cancel-category");

  const renderCategoriesList = () => {
    const data = AppState.getData();
    const container = document.getElementById("categories-manager-target");
    if (!container) return;
    container.innerHTML = "";

    const categories = data.projectCategories || ["Frontend", "Backend", "Fullstack"];

    if (categories.length === 0) {
      container.innerHTML = `<div class="project-manager-empty">Belum ada kategori. Tambahkan kategori pertama!</div>`;
      return;
    }

    // Cycle through a palette of dot colours for visual variety
    const dotColors = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#3b82f6", "#8b5cf6"];

    categories.forEach((cat, idx) => {
      const item = document.createElement("div");
      item.className = "category-manager-item";
      const dotColor = dotColors[idx % dotColors.length];

      item.innerHTML = `
        <div class="category-manager-name-wrap">
          <span class="category-manager-dot" style="background-color: ${dotColor};"></span>
          <span class="category-manager-name">${cat}</span>
        </div>
        <div class="category-manager-actions">
          <button class="btn btn-edit edit-category-btn" data-index="${idx}">Edit</button>
          <button class="btn btn-danger delete-category-btn" data-index="${idx}">Hapus</button>
        </div>
      `;
      container.appendChild(item);
    });

    container.querySelectorAll(".delete-category-btn").forEach(btn => {
      btn.addEventListener("click", () => deleteCategory(parseInt(btn.dataset.index)));
    });
    container.querySelectorAll(".edit-category-btn").forEach(btn => {
      btn.addEventListener("click", () => editCategory(parseInt(btn.dataset.index)));
    });
  };

  const resetCategoryForm = () => {
    if (categoryForm) categoryForm.reset();
    document.getElementById("category-index-hidden").value = "";
    if (categoryFormTitle) categoryFormTitle.innerText = "Tambah Kategori Baru";
    if (btnSaveCategory) btnSaveCategory.innerText = "Simpan Kategori";
    if (btnCancelCategory) btnCancelCategory.style.display = "none";
  };

  if (btnCancelCategory) {
    btnCancelCategory.addEventListener("click", resetCategoryForm);
  }

  if (categoryForm) {
    categoryForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = AppState.getData();
      if (!data.projectCategories) data.projectCategories = ["Frontend", "Backend", "Fullstack"];

      const indexStr = document.getElementById("category-index-hidden").value;
      const name = document.getElementById("category-name-input").value.trim();

      if (indexStr !== "") {
        // Edit existing
        const idx = parseInt(indexStr);
        const oldName = data.projectCategories[idx];
        
        // Prevent duplicate
        const isDuplicate = data.projectCategories.some((cat, i) => cat.toLowerCase() === name.toLowerCase() && i !== idx);
        if (isDuplicate) {
          alert(`Kategori "${name}" sudah ada!`);
          return;
        }

        data.projectCategories[idx] = name;

        // Automatically update category string on all projects that use the old name
        if (data.projects) {
          data.projects.forEach(p => {
            if (p.category === oldName) {
              p.category = name;
            }
          });
        }

        showToast(`Kategori "${oldName}" diperbarui menjadi "${name}"!`);
      } else {
        // Add new
        const isDuplicate = data.projectCategories.some(cat => cat.toLowerCase() === name.toLowerCase());
        if (isDuplicate) {
          alert(`Kategori "${name}" sudah ada!`);
          return;
        }

        data.projectCategories.push(name);
        showToast(`Kategori "${name}" berhasil ditambahkan!`);
      }

      AppState.save();
      renderCategoriesList();
      resetCategoryForm();
      populateCategorySelect(); // Refresh project select
    });
  }

  const editCategory = (idx) => {
    const data = AppState.getData();
    const cat = data.projectCategories[idx];
    if (!cat) return;

    document.getElementById("category-index-hidden").value = idx;
    document.getElementById("category-name-input").value = cat;

    if (categoryFormTitle) categoryFormTitle.innerText = "Edit Kategori";
    if (btnSaveCategory) btnSaveCategory.innerText = "Simpan Perubahan";
    if (btnCancelCategory) btnCancelCategory.style.display = "inline-flex";

    if (categoryForm) {
      categoryForm.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const deleteCategory = (idx) => {
    const data = AppState.getData();
    const catName = data.projectCategories[idx];

    if (catName && confirm(`Apakah Anda yakin ingin menghapus kategori "${catName}"?`)) {
      data.projectCategories = data.projectCategories.filter((_, i) => i !== idx);

      // Re-assign affected projects to another category or "Uncategorized"
      const defaultCategory = data.projectCategories.length > 0 ? data.projectCategories[0] : "Uncategorized";
      if (data.projects) {
        data.projects.forEach(p => {
          if (p.category === catName) {
            p.category = defaultCategory;
          }
        });
      }

      AppState.save();
      renderCategoriesList();
      showToast(`Kategori "${catName}" berhasil dihapus.`);
      populateCategorySelect(); // Refresh project select
    }
  };

  // --- INITIALIZE VIEWS ---
  populateCategorySelect();
  renderProjectsList();
  renderCategoriesList();
}
