// Biến toàn cục để lưu trữ thông tin
let currentUser = null;
let userHasResume = false; // Thêm biến để kiểm tra trạng thái CV
let selectedJobForDetail = null; // Biến để lưu trữ chi tiết công việc đang xem
let userAppliedJobIds = new Set(); // Thêm Set để lưu trữ jobId của các công việc đã ứng tuyển
let allJobsCache = [];

// Đổi tên biến để dễ sử dụng hơn
const API_BASE_URL = "http://localhost:8080/jobportal/api";

/**
 * Hàm giải mã JWT để lấy payload.
 */
function decodeJwt(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Error decoding JWT:", e);
    return null;
  }
}

// =================================================================
// ============== LOGIC HIỂN THỊ GIAO DIỆN CHÍNH ===================
// =================================================================

function openCandidateTab(evt, tabName) {
  let i, tabcontent, tablinks;
  tabcontent = document.getElementsByClassName("tab-content");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  tablinks = document.getElementsByClassName("tab-link");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }
  document.getElementById(tabName).style.display = "block";
  if (evt) {
    evt.currentTarget.className += " active";
  }
  // Reset Jobs tab view if switching to Jobs
  if (tabName === 'Jobs') {
    // Show Hot Jobs title
    const hotJobsSection = document.querySelector('.hot-jobs-section h2');
    if (hotJobsSection) hotJobsSection.style.display = '';
    // Show popular companies section
    const popSec = document.querySelector('.popular-companies-section');
    if (popSec) popSec.style.display = '';
    // Hide back button
    const backBtn = document.getElementById('backToHotPopularBtn');
    if (backBtn) backBtn.style.display = 'none';
    // Render hot jobs and popular companies again
    renderHotJobs(allJobsCache);
    renderPopularCompanies(allJobsCache);
  }
}

function logout(message = "Bạn đã đăng xuất.") {
  localStorage.removeItem("authToken");
  window.location.href = "login.html";
}

function closeJobDetailModal() {
  document.getElementById("jobDetailModal").style.display = "none";
  selectedJobForDetail = null; // Clear selected job
}

function formatJsonToList(jsonString) {
  if (!jsonString) return "<li>Chưa cập nhật</li>";
  try {
    // Nếu là JSON array
    const items = JSON.parse(jsonString);
    if (Array.isArray(items) && items.length > 0) {
      return items.map((item) => `<li>${item}</li>`).join("");
    }
    // Nếu là chuỗi, tách theo dòng
    if (typeof items === "string") {
      const lines = items.split(/\r?\n/).filter(line => line.trim() !== "");
      if (lines.length > 0) {
        return lines.map(line => `<li>${line}</li>`).join("");
      } else {
        return "<li>Chưa cập nhật</li>";
      }
    }
    return "<li>Chưa cập nhật</li>";
  } catch (e) {
    // Nếu không phải JSON hợp lệ, tách theo dòng
    const lines = jsonString.split(/\r?\n/).filter(line => line.trim() !== "");
    if (lines.length > 0) {
      return lines.map(line => `<li>${line}</li>`).join("");
    } else {
      return "<li>Chưa cập nhật</li>";
    }
  }
}

// =================================================================
// ==================== LOGIC QUẢN LÝ VIỆC LÀM =====================
// =================================================================

function normalizeSkills(skills) {
  let arr = [];
  if (!skills) return arr;
  if (Array.isArray(skills)) {
    arr = skills;
  } else if (typeof skills === 'string') {
    let s = skills.trim();
    // Try to parse JSON array
    if (s.startsWith('[') && s.endsWith(']')) {
      try {
        arr = JSON.parse(s);
      } catch {
        // fallback below
      }
    }
    if (arr.length === 0) {
      // Remove brackets/quotes, split by comma
      s = s.replace(/\[|\]|"|'/g, '');
      arr = s.split(',').map(x => x.trim()).filter(x => x);
    }
  }
  // Remove any remaining quotes/brackets from each skill
  return arr.map(skill => String(skill).replace(/\[|\]|"|'/g, '').trim()).filter(x => x);
}

function renderJobCards(jobs) {
  const container = document.getElementById("jobListings");
  if (!jobs || jobs.length === 0) {
    container.innerHTML = `<p class="loading-message">Không có việc làm nào được tìm thấy.</p>`;
    return;
  }
  container.innerHTML = jobs.map(job => `
    <div class="company-card">
      <div class="card-header">
        <h3 class="job-title">${job.jobTitle || 'Chưa cập nhật'}</h3>
        <span class="company-name">${job.companyName || 'Chưa cập nhật'}</span>
      </div>
      <div class="location"><i class="fas fa-map-marker-alt"></i> ${job.location || 'Chưa cập nhật'}</div>
      <div class="salary"><i class="fas fa-money-bill-wave"></i> ${job.salaryNegotiable ? "Thỏa thuận" : (job.jobPostingDetail && job.jobPostingDetail.salaryDescription ? job.jobPostingDetail.salaryDescription : 'Chưa cập nhật')}</div>
      <div class="tags">
        ${(Array.isArray(job.skills) ? job.skills : (job.skills ? JSON.parse(job.skills) : [])).map(skill => `<span class="tag">${skill}</span>`).join("")}
      </div>
      <button class="btn main-btn" onclick="showJobDetail(${job.jobId})">Xem chi tiết</button>
    </div>
  `).join("");
}

async function showJobDetail(jobId) {
  const token = localStorage.getItem("authToken");
  try {
    // Gọi song song cả hai API
    const [jobRes, detailRes] = await Promise.all([
      fetch(`${API_BASE_URL}/jobpostings/${jobId}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-cache",
      }),
      fetch(`${API_BASE_URL}/jobpostings/${jobId}/details`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-cache",
      })
    ]);
    if (!jobRes.ok) throw new Error("Không thể tải chi tiết việc làm.");
    const jobData = await jobRes.json();
    let detailData = null;
    if (detailRes.ok) {
      detailData = await detailRes.json();
    }
    selectedJobForDetail = jobData; // Lưu chi tiết công việc
    // Hiển thị các trường từ jobData
    document.getElementById("jobDetailTitle").textContent = jobData.jobTitle || "Chưa cập nhật";
    document.getElementById("jobDetailCompany").textContent = jobData.companyName || "Chưa cập nhật";
    document.getElementById("jobDetailLocation").textContent = jobData.location || "Chưa cập nhật";
    // Hiển thị tag kỹ năng
    const tagContainer = document.getElementById("jobDetailTags");
    tagContainer.innerHTML = "";
    let skillsArr = [];
    if (jobData.skills) {
      try {
        skillsArr = Array.isArray(jobData.skills) ? jobData.skills : JSON.parse(jobData.skills);
      } catch (e) {
        // Nếu không phải JSON hợp lệ thì bỏ qua
      }
    }
    if (skillsArr && Array.isArray(skillsArr) && skillsArr.length > 0) {
      tagContainer.innerHTML = skillsArr.map(skill => `<span style='display:inline-block;background:#eee;border-radius:16px;padding:4px 12px;margin:2px 4px 2px 0;font-size:13px;'>${skill}</span>`).join("");
    }
    // Ưu tiên lấy detail nếu có, fallback sang jobData nếu không
    if (detailData) {
      document.getElementById("jobDetailSalaryDescription").textContent = detailData.salaryDescription || (jobData.salaryNegotiable ? "Thỏa thuận" : "Chưa cập nhật");
      document.getElementById("jobDetailJobLevel").textContent = detailData.jobLevel || "Chưa cập nhật";
      document.getElementById("jobDetailWorkFormat").textContent = detailData.workFormat || "Chưa cập nhật";
      document.getElementById("jobDetailContractType").textContent = detailData.contractType || "Chưa cập nhật";
      document.getElementById("jobDetailResponsibilities").innerHTML = formatJsonToList(detailData.responsibilities);
      document.getElementById("jobDetailSkills").innerHTML = formatJsonToList(detailData.requiredSkills);
      document.getElementById("jobDetailBenefits").innerHTML = formatJsonToList(detailData.benefits);
    } else {
      document.getElementById("jobDetailSalaryDescription").textContent = jobData.salaryNegotiable ? "Thỏa thuận" : "Chưa cập nhật";
      document.getElementById("jobDetailJobLevel").textContent = "Chưa cập nhật";
      document.getElementById("jobDetailWorkFormat").textContent = "Chưa cập nhật";
      document.getElementById("jobDetailContractType").textContent = "Chưa cập nhật";
      document.getElementById("jobDetailResponsibilities").innerHTML = "<li>Chưa cập nhật</li>";
      document.getElementById("jobDetailSkills").innerHTML = "<li>Chưa cập nhật</li>";
      document.getElementById("jobDetailBenefits").innerHTML = "<li>Chưa cập nhật</li>";
    }
    document.getElementById("jobDetailModal").style.display = "block"; // Show the modal
  } catch (error) {
    alert("Không thể hiển thị chi tiết việc làm: " + error.message);
    console.error("Lỗi chi tiết việc làm:", error);
  }
}

async function applyToJob() {
  if (!currentUser || !selectedJobForDetail) {
    return;
  }
  if (!userHasResume) {
    closeJobDetailModal();
    openCandidateTab(null, "MyResume");
    const myResumeTabButton = document.querySelector(
      '.tab-link[onclick*="MyResume"]'
    );
    if (myResumeTabButton) myResumeTabButton.classList.add("active");
    return;
  }
  const token = localStorage.getItem("authToken");
  try {
    const response = await fetch(
      `${API_BASE_URL}/job-applications/apply/${currentUser.id}/${selectedJobForDetail.jobId}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    if (response.ok) {
      closeJobDetailModal();
      await loadUserJobApplications();
      await loadAllJobPostings();
      openCandidateTab(null, "MyApplications");
      const myApplicationsTabButton = document.querySelector(
        '.tab-link[onclick*="MyApplications"]'
      );
      if (myApplicationsTabButton)
        myApplicationsTabButton.classList.add("active");
    }
  } catch (error) {}
}

// =================================================================
// ==================== LOGIC QUẢN LÝ CV ===========================
// =================================================================

async function checkUserResume() {
  if (!currentUser) return;
  const token = localStorage.getItem("authToken");
  const resumeStatusElement = document.getElementById("resumeStatus");
  const uploadedResumeDisplayElement = document.getElementById(
    "uploadedResumeDisplay"
  );

  try {
    const response = await fetch(`${API_BASE_URL}/files/${currentUser.id}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-cache",
    });

    if (response.ok) {
      const fileData = await response.json();
      userHasResume = true;
      resumeStatusElement.textContent = `Bạn đã tải lên CV: ${fileData.fileName}`;

      uploadedResumeDisplayElement.innerHTML = `
        <p>CV của bạn đã được tải lên.</p>
        <button id="downloadResumeBtn" class="btn">
          <i class="fas fa-download"></i> Tải xuống CV
        </button>
        <button id="viewResumeBtn" class="btn" style="margin-left: 10px;">
          <i class="fas fa-eye"></i> Xem CV
        </button>
        <div id="resumeViewer" style="margin-top: 20px; display: none; text-align: center;"></div>
      `;

      // Thêm sự kiện cho nút tải xuống CV qua API
      setTimeout(() => {
        const downloadBtn = document.getElementById("downloadResumeBtn");
        if (downloadBtn) {
          downloadBtn.onclick = async function () {
            const token = localStorage.getItem("authToken");
            try {
              const res = await fetch(`${API_BASE_URL}/files/download/${currentUser.id}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              if (!res.ok) throw new Error("Không thể tải file");
              const blob = await res.blob();
              // Lấy tên file từ header
              let fileName = "cv.pdf";
              const disposition = res.headers.get("Content-Disposition");
              if (disposition && disposition.indexOf("filename=") !== -1) {
                fileName = disposition.split("filename=")[1].replace(/['\"]/g, "").trim();
              }
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = fileName;
              document.body.appendChild(a);
              a.click();
              setTimeout(() => {
                window.URL.revokeObjectURL(url);
                a.remove();
              }, 100);
            } catch (err) {
              alert("Lỗi tải file: " + err.message);
            }
          };
        }
      }, 0);

      // Thêm sự kiện cho nút Xem CV
      setTimeout(() => {
        const viewBtn = document.getElementById("viewResumeBtn");
        const viewer = document.getElementById("resumeViewer");
        if (viewBtn && viewer) {
          viewBtn.onclick = function () {
            if (viewer.style.display === "none") {
              viewer.innerHTML = `<div style='display:inline-block;'><iframe src='${API_BASE_URL}/files/download/${currentUser.id}' width='800px' height='600px' style='border:1px solid #ccc; display:block; margin:auto;'></iframe></div>`;
              viewer.style.display = "block";
              viewBtn.innerHTML = '<i class="fas fa-eye-slash"></i> Ẩn CV';
            } else {
              viewer.innerHTML = "";
              viewer.style.display = "none";
              viewBtn.innerHTML = '<i class="fas fa-eye"></i> Xem CV';
            }
          };
        }
      }, 0);
    } else if (response.status === 500) {
      userHasResume = false;
      resumeStatusElement.textContent =
        "Bạn chưa tải CV nào lên. Vui lòng tải lên CV của bạn.";
      uploadedResumeDisplayElement.innerHTML = "";
    } else {
      throw new Error(`Lỗi kiểm tra CV: ${response.statusText}`);
    }
  } catch (error) {
    userHasResume = false;
    resumeStatusElement.textContent = `Lỗi tải trạng thái CV: ${error.message}`;
    uploadedResumeDisplayElement.innerHTML = "";
    console.error("Lỗi kiểm tra CV:", error);
  }
}

// =================================================================
// ==================== LOGIC QUẢN LÝ ĐƠN ỨNG TUYỂN ================
// =================================================================

function renderApplications(applications) {
  const tbody = document.getElementById("applicationList");
  if (!applications || applications.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:#888;">Bạn chưa có đơn ứng tuyển nào.</td></tr>`;
    return;
  }
  tbody.innerHTML = applications
    .map(
      (app) => `
      <tr>
        <td>${app.jobTitle ? app.jobTitle : (app.jobPosting ? app.jobPosting.jobTitle : "N/A")}</td>
        <td>${
          app.companyName ? app.companyName : (app.jobPosting && app.jobPosting.company ? app.jobPosting.company.companyName : "N/A")
        }</td>
        <td>${new Date(app.applyDate).toLocaleDateString("vi-VN")}</td>
        <td><span class="status-${app.state.toLowerCase()}">${
        app.state
      }</span></td>
        <td>
          <button class="btn delete-btn" onclick="removeJobApplication(${app.id})">
            <i class="fas fa-trash"></i> Xóa
          </button>
        </td>
      </tr>
    `
    )
    .join("");
}

// 1. Lưu lại danh sách đơn ứng tuyển đã fetch
let allUserApplications = [];

// 2. Sửa loadUserJobApplications để lưu lại allUserApplications và render theo filter
async function loadUserJobApplications() {
  if (!currentUser) return;
  const token = localStorage.getItem("authToken");
  const tbody = document.getElementById("applicationList");
  tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:#888;">Đang tải đơn ứng tuyển...</td></tr>`;
  userAppliedJobIds.clear();
  try {
    const response = await fetch(
      `${API_BASE_URL}/job-applications/${currentUser.id}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-cache",
      }
    );
    if (!response.ok) throw new Error("Không thể tải đơn ứng tuyển.");
    const applications = await response.json();
    allUserApplications = applications;
    applications.forEach((app) => {
      if (app.jobId) userAppliedJobIds.add(app.jobId);
    });
    filterApplicationsByState();
  } catch (error) {
    console.error("Lỗi tải đơn ứng tuyển:", error);
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:red;">Lỗi tải dữ liệu: ${error.message}</td></tr>`;
  }
}

// 3. Hàm filter và render lại theo trạng thái
function filterApplicationsByState(state) {
  if (!state) {
    // Nếu không truyền thì lấy nút đang active
    const activeBtn = document.querySelector('.state-filter-btn.active');
    state = activeBtn ? activeBtn.getAttribute('data-state') : 'ALL';
  }
  let filtered = allUserApplications;
  if (state !== "ALL") {
    filtered = allUserApplications.filter(app => (app.state === state || app.state === state.toUpperCase()));
  }
  renderApplications(filtered);
}

async function removeJobApplication(applicationId) {
  const token = localStorage.getItem("authToken");
  try {
    const response = await fetch(
      `${API_BASE_URL}/job-applications/${currentUser.id}/${applicationId}`,
      { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
    );
    if (response.ok) {
      await loadUserJobApplications();
      await loadAllJobPostings();
    }
  } catch (error) {}
}

// Render Hot Jobs (top 5 highest salary jobs)
function renderHotJobs(jobs) {
  const grid = document.getElementById('hotJobsGrid');
  if (!grid) return;
  if (!jobs || jobs.length === 0) {
    grid.innerHTML = `<p class="loading-message">Không có hot job nào.</p>`;
    return;
  }
  // Sắp xếp theo lương (ưu tiên salaryDescription nếu có, loại bỏ lương thỏa thuận)
  const sorted = [...jobs].filter(job => {
    // Loại bỏ job lương thỏa thuận
    if (job.salaryNegotiable) return false;
    // Chỉ lấy job có lương cụ thể
    if (job.jobPostingDetail && job.jobPostingDetail.salaryDescription) {
      const match = job.jobPostingDetail.salaryDescription.match(/\d+/g);
      return match && parseInt(match[0]) > 0;
    }
    return false;
  }).sort((a, b) => {
    const getSalary = job => {
      if (job.jobPostingDetail && job.jobPostingDetail.salaryDescription) {
        const match = job.jobPostingDetail.salaryDescription.match(/\d+/g);
        return match ? parseInt(match[0]) : 0;
      }
      return 0;
    };
    return getSalary(b) - getSalary(a);
  });
  // Lấy tối đa 3 job có lương cao nhất (không thỏa thuận)
  let top3 = sorted.slice(0, 3);
  // Nếu không có job nào đủ điều kiện, fallback lấy 3 job đầu tiên không thỏa thuận
  if (top3.length === 0) {
    top3 = jobs.filter(job => !job.salaryNegotiable).slice(0, 3);
  }
  // Nếu vẫn không có, fallback lấy 3 job đầu tiên bất kỳ
  if (top3.length === 0) top3 = jobs.slice(0, 3);
  grid.innerHTML = top3.map(job => {
    const skillsArr = normalizeSkills(job.skills);
    let tagsHtml = '';
    if (skillsArr.length > 0) {
      tagsHtml = skillsArr.slice(0, 3).map(skill => `<span class='tag'>${skill}</span>`).join("");
      if (skillsArr.length > 3) {
        tagsHtml += `<span class='tag'>+${skillsArr.length - 3} more</span>`;
      }
    }
    return `
      <div class=\"company-card\">\n        <div class=\"card-header\">\n          <h3 class=\"job-title\">${job.jobTitle || 'Chưa cập nhật'}</h3>\n          <span class=\"company-name\">${job.companyName || 'Chưa cập nhật'}</span>\n        </div>\n        <div class=\"location\"><i class=\"fas fa-map-marker-alt\"></i> ${job.location || 'Chưa cập nhật'}</div>\n        <div class=\"salary\"><i class=\"fas fa-money-bill-wave\"></i> ${job.salaryNegotiable ? 'Thỏa thuận' : (job.jobPostingDetail && job.jobPostingDetail.salaryDescription ? job.jobPostingDetail.salaryDescription : 'Chưa cập nhật')}</div>\n        <div class=\"tags\">${tagsHtml}</div>\n        <button class=\"btn main-btn\" onclick=\"showJobDetail(${job.jobId})\">Xem chi tiết</button>\n      </div>\n    `;
  }).join("");
}

// Render Popular Companies (top 5 companies with most jobs)
function renderPopularCompanies(jobs) {
  const grid = document.getElementById('popularCompaniesGrid');
  if (!grid) return;
  if (!jobs || jobs.length === 0) {
    grid.innerHTML = `<p class="loading-message">Không có công ty nổi bật.</p>`;
    return;
  }
  // Đếm số job theo companyName
  const companyMap = {};
  jobs.forEach(job => {
    if (!job.companyName) return;
    if (!companyMap[job.companyName]) companyMap[job.companyName] = [];
    companyMap[job.companyName].push(job);
  });
  // Sắp xếp theo số lượng job giảm dần
  const sortedCompanies = Object.entries(companyMap).sort((a, b) => b[1].length - a[1].length).slice(0, 5);
  grid.innerHTML = sortedCompanies.map(([companyName, jobsArr]) => `
    <div class="company-card popular-company-card" data-company="${companyName}">
      <div class="card-header">
        <span class="company-name">${companyName}</span>
        <span style="font-size:0.95em;color:#888;">${jobsArr.length} jobs</span>
      </div>
      <div class="tags">
        ${jobsArr.slice(0, 3).map(job => `<span class="tag">${job.jobTitle}</span>`).join("")}
        ${jobsArr.length > 3 ? `<span class="tag">+${jobsArr.length - 3} more</span>` : ""}
      </div>
    </div>
  `).join("");
}

// Show all jobs for a company in hotJobsGrid, add back button
function showJobsByCompany(companyName) {
  const grid = document.getElementById('hotJobsGrid');
  if (!grid) return;
  // Hide Hot Jobs title
  const hotJobsSection = document.querySelector('.hot-jobs-section h2');
  if (hotJobsSection) hotJobsSection.style.display = 'none';
  const jobs = allJobsCache.filter(job => job.companyName === companyName);
  if (jobs.length === 0) {
    grid.innerHTML = `<p class="loading-message">Không có việc làm nào cho công ty này.</p>`;
  } else {
    grid.innerHTML = `<h3 style='color:#1976d2;margin-bottom:10px;'>Tất cả việc làm tại <span style='color:#d32f2f;'>${companyName}</span></h3>` +
      jobs.map(job => {
        const skillsArr = normalizeSkills(job.skills);
        let tagsHtml = '';
        if (skillsArr.length > 0) {
          tagsHtml = skillsArr.slice(0, 3).map(skill => `<span class='tag'>${skill}</span>`).join("");
          if (skillsArr.length > 3) {
            tagsHtml += `<span class='tag'>+${skillsArr.length - 3} more</span>`;
          }
        }
        return `
          <div class="company-card">
            <div class="card-header">
              <h3 class="job-title">${job.jobTitle || 'Chưa cập nhật'}</h3>
              <span class="company-name">${job.companyName || 'Chưa cập nhật'}</span>
            </div>
            <div class="location"><i class="fas fa-map-marker-alt"></i> ${job.location || 'Chưa cập nhật'}</div>
            <div class="salary"><i class="fas fa-money-bill-wave"></i> ${job.salaryNegotiable ? "Thỏa thuận" : (job.jobPostingDetail && job.jobPostingDetail.salaryDescription ? job.jobPostingDetail.salaryDescription : 'Chưa cập nhật')}</div>
            <div class="tags">${tagsHtml}</div>
            <button class="btn main-btn" onclick="showJobDetail(${job.jobId})">Xem chi tiết</button>
          </div>
        `;
      }).join("");
  }
  // Hide popular companies section
  const popSec = document.querySelector('.popular-companies-section');
  if (popSec) popSec.style.display = 'none';
  // Show back button
  let backBtn = document.getElementById('backToHotPopularBtn');
  if (!backBtn) {
    backBtn = document.createElement('button');
    backBtn.id = 'backToHotPopularBtn';
    backBtn.className = 'btn main-btn';
    backBtn.style = 'margin: 16px 0 8px 0; display: block;';
    backBtn.innerHTML = '<i class="fas fa-arrow-left"></i> Quay lại';
    backBtn.onclick = function() {
      renderHotJobs(allJobsCache);
      const popSec = document.querySelector('.popular-companies-section');
      if (popSec) popSec.style.display = '';
      // Show Hot Jobs title again
      const hotJobsSection = document.querySelector('.hot-jobs-section h2');
      if (hotJobsSection) hotJobsSection.style.display = '';
      backBtn.style.display = 'none';
    };
    grid.parentNode.insertBefore(backBtn, grid);
  } else {
    backBtn.innerHTML = '<i class="fas fa-arrow-left"></i> Quay lại';
    backBtn.style.display = 'block';
  }
}

// Remove renderJobCards and searchJobs logic from loadAllJobPostings
async function loadAllJobPostings() {
  const token = localStorage.getItem("authToken");
  try {
    const response = await fetch(`${API_BASE_URL}/jobpostings`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-cache",
    });
    if (!response.ok) throw new Error("Không thể tải danh sách việc làm.");
    const jobs = await response.json();
    // Lọc các công việc đã được apply và các công việc không active
    const jobsToDisplay = jobs.filter((job) => {
      return job.status === "APPROVED" && !userAppliedJobIds.has(job.jobId);
    });
    // Lấy detail cho từng job (song song)
    const detailPromises = jobsToDisplay.map(job =>
      fetch(`${API_BASE_URL}/jobpostings/${job.jobId}/details`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-cache",
      })
      .then(res => res.ok ? res.json() : null)
      .catch(() => null)
    );
    const details = await Promise.all(detailPromises);
    jobsToDisplay.forEach((job, idx) => {
      job.jobPostingDetail = details[idx];
    });
    allJobsCache = jobsToDisplay; // Lưu cache để search/filter by company
    renderHotJobs(jobsToDisplay);
    renderPopularCompanies(jobsToDisplay);
    // Hide back button if visible
    const backBtn = document.getElementById('backToHotPopularBtn');
    if (backBtn) backBtn.style.display = 'none';
  } catch (error) {
    console.error("Lỗi tải danh sách việc làm:", error);
    document.getElementById(
      "jobListings"
    ).innerHTML = `<p style=\"text-align:center;color:red;\">Lỗi tải dữ liệu: ${error.message}</p>`;
  }
}

// Thêm hàm search
function searchJobs() {
  const keyword = document.getElementById("jobSearchInput").value.trim().toLowerCase();
  if (!keyword) {
    renderJobCards(allJobsCache);
    return;
  }
  const filtered = allJobsCache.filter(job => {
    // Các trường cơ bản
    const fields = [
      job.jobTitle,
      job.location,
      job.companyName,
      
      Array.isArray(job.skills) ? job.skills.join(" ") : (job.skills || ""),
    ];
    // Các trường chi tiết nếu có
    if (job.jobPostingDetail) {
      fields.push(
        job.jobPostingDetail.salaryDescription,
        job.jobPostingDetail.jobLevel,
        job.jobPostingDetail.workFormat,
        job.jobPostingDetail.contractType,
        job.jobPostingDetail.responsibilities,
        job.jobPostingDetail.requiredSkills,
        job.jobPostingDetail.benefits
      );
    }
    return fields.some(f => (f || "").toLowerCase().includes(keyword));
  });
  renderJobCards(filtered);
}

// Thêm event cho search box
setTimeout(() => {
  const searchBtn = document.getElementById("jobSearchBtn");
  const searchInput = document.getElementById("jobSearchInput");
  if (searchBtn) searchBtn.onclick = searchJobs;
  if (searchInput) {
    searchInput.oninput = searchJobs;
  }
}, 500);

/**
 * Hàm khởi tạo chính, được gọi khi trang tải xong.
 */
async function initializeApp() {
  const token = localStorage.getItem("authToken");
  if (!token) {
    window.location.href = "login.html";
    return;
  }

  const decodedToken = decodeJwt(token);
  if (!decodedToken || !decodedToken.sub || !decodedToken.userId) {
    logout("Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.");
    return;
  }

  currentUser = { id: decodedToken.userId, username: decodedToken.sub };
  document.getElementById("usernameDisplay").textContent = currentUser.username;
  setUserAvatar(currentUser.username);

  // Mở tab "Jobs" mặc định khi tải trang
  const firstTab = document.querySelector('.tab-link[onclick*="Jobs"]');
  if (firstTab) {
    openCandidateTab(null, "Jobs");
    firstTab.classList.add("active");
  }

  await checkUserResume(); // Kiểm tra CV ngay khi khởi tạo
  await loadUserJobApplications(); // Tải đơn ứng tuyển trước để có danh sách các jobId đã ứng tuyển
  await loadAllJobPostings(); // Tải danh sách công việc

  // Thêm dropdown filter vào trước bảng đơn ứng tuyển
  const appList = document.getElementById("applicationList");
  if (appList && !document.getElementById("applicationStateBtnFilter")) {
    const filterDiv = document.createElement("div");
    filterDiv.id = "applicationStateBtnFilter";
    filterDiv.style = "margin-bottom:18px;display:flex;align-items:center;gap:14px;justify-content:flex-start;flex-wrap:wrap;";
    filterDiv.innerHTML = `
      <span style='font-weight:600;font-size:1.08rem;display:flex;align-items:center;gap:6px;'>
        <i class='fas fa-filter' style='color:#1976d2;font-size:1.15em;'></i> Trạng thái:
      </span>
      <button type='button' class='state-filter-btn active' data-state='ALL'>Tất cả</button>
      <button type='button' class='state-filter-btn' data-state='Pending'>Chờ duyệt</button>
      <button type='button' class='state-filter-btn' data-state='Accepted'>Đã nhận</button>
      <button type='button' class='state-filter-btn' data-state='Rejected'>Đã từ chối</button>
    `;
    const filterBox = document.getElementById("applicationFilterBox");
    if (filterBox) {
      filterBox.innerHTML = "";
      filterBox.appendChild(filterDiv);
    } else {
      appList.parentElement.insertBefore(filterDiv, appList);
    }
    // Gán sự kiện cho các nút
    filterDiv.querySelectorAll('.state-filter-btn').forEach(btn => {
      btn.onclick = function() {
        filterDiv.querySelectorAll('.state-filter-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        filterApplicationsByState(this.getAttribute('data-state'));
      };
    });
  }

  // Add event delegation for popularCompaniesGrid with debug logs
  const popGrid = document.getElementById('popularCompaniesGrid');
  if (popGrid) {
    console.log('[DEBUG] popularCompaniesGrid event delegation attached');
    popGrid.addEventListener('click', function(e) {
      let card = e.target.closest('.popular-company-card');
      console.log('[DEBUG] Clicked element:', e.target, 'Card:', card);
      if (card && card.dataset.company) {
        console.log('[DEBUG] Clicked company:', card.dataset.company);
        showJobsByCompany(card.dataset.company);
      }
    });
  } else {
    console.log('[DEBUG] popularCompaniesGrid not found on DOMContentLoaded');
  }

  // Add hover effect for clickable company cards
  const style = document.createElement('style');
  style.innerHTML = `.popular-company-card { cursor: pointer; transition: box-shadow 0.2s; } .popular-company-card:hover { box-shadow: 0 2px 12px #1976d233; background: #f7faff; }`;
  document.head.appendChild(style);
}

// Khởi tạo ứng dụng khi DOM đã sẵn sàng
document.addEventListener("DOMContentLoaded", initializeApp);

// Xử lý đóng modal khi click ra ngoài
window.onclick = function (event) {
  const modal = document.getElementById("jobDetailModal");
  if (event.target == modal) {
    modal.style.display = "none";
  }
};

// Xử lý Dropdown menu người dùng
document.addEventListener("DOMContentLoaded", function () {
  const userMenuToggle = document.querySelector(".menu-toggle");
  if (userMenuToggle) {
    userMenuToggle.addEventListener("click", function () {
      this.closest(".user-menu").classList.toggle("active");
    });
  }

  // Close dropdown if clicked outside
  window.addEventListener("click", function (e) {
    const userMenu = document.querySelector(".user-menu");
    if (userMenu && !userMenu.contains(e.target)) {
      userMenu.classList.remove("active");
    }
  });
});

// Thêm event listener cho form upload CV

document.addEventListener("DOMContentLoaded", function () {
  const resumeUploadForm = document.getElementById("resumeUploadForm");
  if (resumeUploadForm) {
    resumeUploadForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      const fileInput = document.getElementById("resumeFile");
      if (!fileInput.files || fileInput.files.length === 0) {
        alert("Vui lòng chọn file PDF để tải lên.");
        return;
      }
      const file = fileInput.files[0];
      if (file.type !== "application/pdf") {
        alert("Chỉ chấp nhận file PDF!");
        return;
      }
      const formData = new FormData();
      formData.append("file", file);
      const token = localStorage.getItem("authToken");
      try {
        const response = await fetch(
          `${API_BASE_URL}/files/upload/${currentUser.id}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`
            },
            body: formData,
          }
        );
        if (response.ok) {
          alert("Tải CV thành công!");
          await checkUserResume();
        } else {
          const errorText = await response.text();
          alert("Lỗi khi tải CV: " + errorText);
        }
      } catch (error) {
        alert("Lỗi khi tải CV: " + error.message);
      }
    });
  }
});

function setUserAvatar(username) {
  const avatarEl = document.querySelector('.user-avatar');
  if (avatarEl) {
    avatarEl.textContent = username ? username.charAt(0).toUpperCase() : '?';
    avatarEl.style.background = '#1976d2';
    avatarEl.style.color = '#fff';
    avatarEl.style.display = 'flex';
    avatarEl.style.alignItems = 'center';
    avatarEl.style.justifyContent = 'center';
    avatarEl.style.fontWeight = 'bold';
    avatarEl.style.fontSize = '1.15em';
    avatarEl.style.width = '32px';
    avatarEl.style.height = '32px';
    avatarEl.style.borderRadius = '50%';
    avatarEl.style.userSelect = 'none';
  }
}

function renderSearchResults(jobs) {
  const section = document.getElementById('searchResultsSection');
  const grid = document.getElementById('searchResultsGrid');
  if (!section || !grid) return;
  if (!jobs || jobs.length === 0) {
    grid.innerHTML = `<p class='loading-message'>Không tìm thấy công việc phù hợp.</p>`;
  } else {
    grid.innerHTML = jobs.map(job => {
      const skillsArr = normalizeSkills(job.skills);
      let tagsHtml = '';
      if (skillsArr.length > 0) {
        tagsHtml = skillsArr.slice(0, 3).map(skill => `<span class='tag'>${skill}</span>`).join("");
        if (skillsArr.length > 3) {
          tagsHtml += `<span class='tag'>+${skillsArr.length - 3} more</span>`;
        }
      }
      return `
        <div class='company-card'>
          <div class='card-header'>
            <h3 class='job-title'>${job.jobTitle || 'Chưa cập nhật'}</h3>
            <span class='company-name'>${job.companyName || 'Chưa cập nhật'}</span>
          </div>
          <div class='location'><i class='fas fa-map-marker-alt'></i> ${job.location || 'Chưa cập nhật'}</div>
          <div class='salary'><i class='fas fa-money-bill-wave'></i> ${job.salaryNegotiable ? 'Thỏa thuận' : (job.jobPostingDetail && job.jobPostingDetail.salaryDescription ? job.jobPostingDetail.salaryDescription : 'Chưa cập nhật')}</div>
          <div class='tags'>${tagsHtml}</div>
          <button class='btn main-btn' onclick='showJobDetail(${job.jobId})'>Xem chi tiết</button>
        </div>
      `;
    }).join("");
  }
  section.style.display = '';
}

function hideSearchResults() {
  const section = document.getElementById('searchResultsSection');
  if (section) section.style.display = 'none';
}

document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.getElementById('jobSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', function() {
      const keyword = this.value.trim().toLowerCase();
      const hotJobsSection = document.querySelector('.hot-jobs-section');
      const popSec = document.querySelector('.popular-companies-section');
      const backBtn = document.getElementById('backToHotPopularBtn');
      if (keyword) {
        // Hide hot jobs, popular companies, back button
        if (hotJobsSection) hotJobsSection.style.display = 'none';
        if (popSec) popSec.style.display = 'none';
        if (backBtn) backBtn.style.display = 'none';
        // Filter jobs
        const filtered = allJobsCache.filter(job => {
          const fields = [
            job.jobTitle,
            job.location,
            job.companyName,
            Array.isArray(job.skills) ? job.skills.join(' ') : (job.skills || ''),
          ];
          if (job.jobPostingDetail) {
            fields.push(
              job.jobPostingDetail.salaryDescription,
              job.jobPostingDetail.jobLevel,
              job.jobPostingDetail.workFormat,
              job.jobPostingDetail.contractType,
              job.jobPostingDetail.responsibilities,
              job.jobPostingDetail.requiredSkills,
              job.jobPostingDetail.benefits
            );
          }
          return fields.some(f => (f || '').toLowerCase().includes(keyword));
        });
        renderSearchResults(filtered);
      } else {
        // Show hot jobs, popular companies, hide search results
        if (hotJobsSection) hotJobsSection.style.display = '';
        if (popSec) popSec.style.display = '';
        if (backBtn) backBtn.style.display = 'none';
        hideSearchResults();
        renderHotJobs(allJobsCache);
        renderPopularCompanies(allJobsCache);
      }
    });
  }
});
