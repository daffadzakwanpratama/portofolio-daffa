// Default portfolio data for Junior Full Stack Developer
const defaultPortfolioData = {
  profile: {
    name: "Daffa",
    title: "Junior Full Stack Developer",
    bio: "Saya adalah seorang Junior Full Stack Developer yang berdedikasi tinggi untuk membangun aplikasi web yang cepat, interaktif, dan mudah digunakan. Menguasai ekosistem JavaScript modern baik di sisi frontend maupun backend. Selalu bersemangat untuk memecahkan masalah kompleks dan berkolaborasi menciptakan solusi digital yang berdampak nyata.",
    avatar: "", // Kosong berarti akan merender inisial nama secara otomatis dengan gradasi premium
    resumeUrl: "#", // Dapat diunggah file PDF nantinya
    location: "Jakarta, Indonesia",
    email: "daffa@example.com",
    github: "https://github.com",
    linkedin: "https://linkedin.com",
    instagram: "https://instagram.com",
    twitter: "https://twitter.com",
    web3formsKey: "59d79ac1-5395-4856-8f15-6f15f8f522c7"
  },
  skills: [
    // Frontend
    { id: "s1", name: "HTML5 & CSS3", level: 90, category: "Frontend" },
    { id: "s2", name: "JavaScript (ES6+)", level: 85, category: "Frontend" },
    { id: "s3", name: "React.js", level: 80, category: "Frontend" },
    { id: "s4", name: "Tailwind CSS", level: 85, category: "Frontend" },
    
    // Backend
    { id: "s5", name: "Node.js", level: 78, category: "Backend" },
    { id: "s6", name: "Express.js", level: 80, category: "Backend" },
    { id: "s7", name: "RESTful API", level: 85, category: "Backend" },
    
    // Database & DevOps
    { id: "s8", name: "PostgreSQL", level: 75, category: "Database" },
    { id: "s9", name: "MongoDB", level: 70, category: "Database" },
    { id: "s10", name: "Git & GitHub", level: 85, category: "DevOps" }
  ],
  projects: [
    {
      id: "p1",
      title: "QR Code Food Ordering System",
      category: "Fullstack",
      status: "Completed",
      thumbnail: "", // Digenerate otomatis dengan placeholder SVG/CSS gradient premium jika kosong
      description: "Sistem pemesanan makanan berbasis QR Code untuk restoran. Memungkinkan pelanggan memindai kode QR meja, melihat menu, membuat pesanan secara langsung, dan melacak status pesanan secara real-time. Dilengkapi dashboard admin untuk mengelola menu, pesanan, dan laporan penjualan bulanan.",
      githubUrl: "https://github.com",
      demoUrl: "https://example.com",
      featured: true,
      technologies: ["Node.js", "Express", "PostgreSQL", "JavaScript", "CSS Grid"]
    },
    {
      id: "p2",
      title: "Personal Finance Tracker Dashboard",
      category: "Frontend",
      status: "Completed",
      thumbnail: "",
      description: "Aplikasi dashboard interaktif untuk melacak keuangan pribadi, pengeluaran bulanan, dan tabungan. Dilengkapi visualisasi grafik interaktif untuk analisis pengeluaran serta kalkulator target finansial jangka panjang.",
      githubUrl: "https://github.com",
      demoUrl: "https://example.com",
      featured: true,
      technologies: ["React.js", "Chart.js", "Tailwind CSS", "LocalStorage"]
    },
    {
      id: "p3",
      title: "Task Management REST API",
      category: "Backend",
      status: "Completed",
      thumbnail: "",
      description: "API tangguh untuk aplikasi manajemen tugas tim. Menyediakan fitur otentikasi JWT, enkripsi password bcrypt, pembuatan ruang kerja bersama, penugasan tugas ke anggota tim, dan pengiriman notifikasi status tugas.",
      githubUrl: "https://github.com",
      demoUrl: "https://example.com",
      featured: false,
      technologies: ["Node.js", "Express.js", "MongoDB", "Mongoose", "JWT"]
    }
  ],
  experiences: [
    {
      id: "e1",
      role: "Full Stack Developer Intern",
      company: "Tech Solution Indonesia",
      type: "Internship",
      period: "Des 2025 - Mar 2026",
      description: [
        "Membantu pengembangan fitur frontend admin panel untuk sistem e-commerce menggunakan React.",
        "Membangun REST API baru yang efisien untuk integrasi gateway pembayaran pihak ketiga.",
        "Melakukan optimasi performa query database PostgreSQL, mengurangi waktu respons API sebesar 20%."
      ]
    },
    {
      id: "e2",
      role: "Freelance Frontend Developer",
      company: "Proyek Independen",
      type: "Freelance",
      period: "Agt 2025 - Nov 2025",
      description: [
        "Mengembangkan website portofolio interaktif dan modern untuk 5+ klien korporasi dan individu.",
        "Mengimplementasikan desain responsif yang adaptif penuh di semua platform perangkat mobile dan desktop.",
        "Menerapkan SEO best practices pada kode HTML untuk meningkatkan keterbacaan mesin pencari."
      ]
    }
  ],
  educations: [
    {
      id: "edu1",
      institution: "Universitas Bina Nusantara",
      degree: "Sarjana Komputer (S.Kom), Teknik Informatika",
      period: "2022 - 2026",
      description: "Fokus pada Rekayasa Perangkat Lunak, Struktur Data, Algoritma Kompleks, dan Sistem Basis Data. Lulus dengan predikat sangat memuaskan."
    },
    {
      id: "edu2",
      institution: "Dicoding Academy Indonesia",
      degree: "Sertifikasi Kurikulum Menjadi Fullstack Developer",
      period: "2024",
      description: "Menyelesaikan kelas Menjadi Front-End Web Developer Expert, Belajar Fundamental Aplikasi Web dengan React, dan Belajar Membuat Aplikasi Back-End untuk Pemula."
    }
  ]
};

// Export to window object for access in frontend apps
window.defaultPortfolioData = defaultPortfolioData;
