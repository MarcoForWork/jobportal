// Biến toàn cục để lưu trữ thông tin
let currentUser = null;
let userHasResume = false;
let selectedJobForDetail = null;
let userAppliedJobIds = new Set();
let allJobsCache = [];

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

<<<<<<< HEAD
=======
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
  if (!jsonString) return "<li>N/A</li>";
  try {
    // Nếu là JSON array
    const items = JSON.parse(jsonString);
    if (Array.isArray(items) && items.length > 0) {
      return items.map((item) => `<li>${item}</li>`).join("");
    }
    // Nếu là chuỗi, tách theo dòng
    if (typeof items === "string") {
      return items.split(/\r?\n/).filter(line => line.trim() !== "").map(line => `<li>${line}</li>`).join("");
    }
    return "<li>N/A</li>";
  } catch (e) {
    // Nếu không phải JSON hợp lệ, tách theo dòng
    return jsonString.split(/\r?\n/).filter(line => line.trim() !== "").map(line => `<li>${line}</li>`).join("");
  }
}

// =================================================================
// ==================== LOGIC QUẢN LÝ VIỆC LÀM =====================
// =================================================================

function renderJobCards(jobs) {
  const container = document.getElementById("jobListings");
  if (!jobs || jobs.length === 0) {
    container.innerHTML = `<p style="text-align:center;color:#888;">Không có việc làm nào được tìm thấy.</p>`;
    return;
  }
  container.innerHTML = jobs
    .map(
      (job) => `
      <div class="job-card" onclick="showJobDetail(${job.jobId})">
        <h3>${job.jobTitle}</h3>
        <p class="company-name">${job.companyName ? job.companyName : "N/A"}</p>
        <p class="location"><i class="fas fa-map-marker-alt"></i> ${
          job.location
        }</p>
        <p class="salary"><i class="fas fa-money-bill-wave"></i> ${
          job.salaryNegotiable
            ? "Thỏa thuận"
            : job.jobPostingDetail
            ? job.jobPostingDetail.salaryDescription
            : "N/A"
        }</p>
        <p class="posted-date">Đăng ngày: ${new Date(
          job.postedDate
        ).toLocaleDateString("vi-VN")}</p>
      </div>
    `
    )
    .join("");
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
    document.getElementById("jobDetailTitle").textContent = jobData.jobTitle || "N/A";
    document.getElementById("jobDetailCompany").textContent = jobData.companyName || "N/A";
    document.getElementById("jobDetailLocation").textContent = jobData.location || "N/A";
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
      document.getElementById("jobDetailSalaryDescription").textContent = detailData.salaryDescription || (jobData.salaryNegotiable ? "Thỏa thuận" : "N/A");
      document.getElementById("jobDetailJobLevel").textContent = detailData.jobLevel || "N/A";
      document.getElementById("jobDetailWorkFormat").textContent = detailData.workFormat || "N/A";
      document.getElementById("jobDetailContractType").textContent = detailData.contractType || "N/A";
      document.getElementById("jobDetailResponsibilities").innerHTML = formatJsonToList(detailData.responsibilities);
      document.getElementById("jobDetailSkills").innerHTML = formatJsonToList(detailData.requiredSkills);
      document.getElementById("jobDetailBenefits").innerHTML = formatJsonToList(detailData.benefits);
    } else {
      document.getElementById("jobDetailSalaryDescription").textContent = jobData.salaryNegotiable ? "Thỏa thuận" : "N/A";
      document.getElementById("jobDetailJobLevel").textContent = "N/A";
      document.getElementById("jobDetailWorkFormat").textContent = "N/A";
      document.getElementById("jobDetailContractType").textContent = "N/A";
      document.getElementById("jobDetailResponsibilities").innerHTML = "";
      document.getElementById("jobDetailSkills").innerHTML = "";
      document.getElementById("jobDetailBenefits").innerHTML = "";
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
    allJobsCache = jobsToDisplay; // Lưu cache để search
    // Thêm log kiểm tra dữ liệu
    console.log("allJobsCache", allJobsCache);
    allJobsCache.forEach((job, idx) => {
      console.log(`Job ${idx} - jobPostingDetail:`, job.jobPostingDetail);
    });
    renderJobCards(jobsToDisplay);
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

>>>>>>> 7bcc88a94783bb2d1fd44eb4ef11a720f9f28c74
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

  const firstTab = document.querySelector('.tab-link[onclick*="Jobs"]');
  if (firstTab) {
    openCandidateTab({ currentTarget: firstTab }, "Jobs");
  }

<<<<<<< HEAD
  // Chạy các hàm tải dữ liệu tuần tự
  await checkUserResume();
  await loadUserJobApplications();
  await loadAllJobPostings();
  await loadNotifications();
=======
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
>>>>>>> 7bcc88a94783bb2d1fd44eb4ef11a720f9f28c74
}

// =================================================================
// ============== LOGIC GIAO DIỆN CHUNG ============================
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
  if (evt && evt.currentTarget) {
    evt.currentTarget.className += " active";
  }
}

function logout(message = "Bạn đã đăng xuất.") {
  localStorage.removeItem("authToken");
  alert(message);
  window.location.href = "login.html";
}

function closeJobDetailModal() {
  document.getElementById("jobDetailModal").style.display = "none";
  selectedJobForDetail = null;
}

function formatJsonToList(jsonString) {
  if (!jsonString) return "<li>N/A</li>";
  try {
    const items = JSON.parse(jsonString);
    if (Array.isArray(items) && items.length > 0) {
      return items.map((item) => `<li>${item}</li>`).join("");
    }
    if (typeof items === "string") {
      return items.split(/\r?\n/).filter(line => line.trim() !== "").map(line => `<li>${line}</li>`).join("");
    }
    return "<li>N/A</li>";
  } catch (e) {
    return jsonString.split(/\r?\n/).filter(line => line.trim() !== "").map(line => `<li>${line}</li>`).join("");
  }
}

// =================================================================
// ==================== QUẢN LÝ THÔNG BÁO ==========================
// =================================================================

async function loadNotifications() {
  if (!currentUser) return;
  const token = localStorage.getItem('authToken');
  try {
    const response = await fetch(`${API_BASE_URL}/notifications/user/${currentUser.id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) {
      console.error("Không thể tải thông báo. Status: " + response.status);
      return;
    }
    const notifications = await response.json();
    renderNotifications(notifications);
  } catch (error) {
    console.error("Lỗi khi tải thông báo:", error);
  }
}

function renderNotifications(notifications) {
  const listEl = document.getElementById('notificationList');
  const badgeEl = document.querySelector('.notification-badge');
  if (!listEl || !badgeEl) return;

  if (!notifications || notifications.length === 0) {
    listEl.innerHTML = '<li>Không có thông báo mới.</li>';
    badgeEl.style.display = 'none';
    return;
  }
  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (unreadCount > 0) {
    badgeEl.textContent = unreadCount;
    badgeEl.style.display = 'block';
  } else {
    badgeEl.style.display = 'none';
  }

  listEl.innerHTML = notifications.map(n => `
        <li id="notification-${n.id}" class="${n.isRead ? 'is-read' : ''}" 
            onclick="handleNotificationClick(${n.id}, this)">
            <p style="margin:0; font-weight: ${n.isRead ? '400' : '600'}; cursor: pointer;">${n.message}</p>
            <small>${new Date(n.createdAt).toLocaleString('vi-VN')}</small>
        </li>
    `).join('');
}

async function handleNotificationClick(notificationId, element) {
  const token = localStorage.getItem('authToken');
  try {
    if (element && !element.classList.contains('is-read')) {
      element.classList.add('is-read');
      const pTag = element.querySelector('p');
      if (pTag) pTag.style.fontWeight = '400';

      const badgeEl = document.querySelector('.notification-badge');
      let currentCount = parseInt(badgeEl.textContent, 10) - 1;
      if (currentCount > 0) {
        badgeEl.textContent = currentCount;
      } else {
        badgeEl.style.display = 'none';
      }

      await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    }

    const myApplicationsTab = document.querySelector('.tab-link[onclick*="MyApplications"]');
    if (myApplicationsTab) {
      openCandidateTab({ currentTarget: myApplicationsTab }, "MyApplications");
    }

    const notificationBell = document.querySelector(".notification-bell");
    if (notificationBell) {
      notificationBell.classList.remove('active');
    }
  } catch (error) {
    console.error('Lỗi khi đánh dấu đã đọc:', error);
    // Ngay cả khi API lỗi, vẫn điều hướng
    const myApplicationsTab = document.querySelector('.tab-link[onclick*="MyApplications"]');
    if (myApplicationsTab) {
      openCandidateTab({ currentTarget: myApplicationsTab }, "MyApplications");
    }
  }
}

// =================================================================
// ==================== LOGIC QUẢN LÝ VIỆC LÀM =====================
// =================================================================
function renderJobCards(jobs) {/*...Nội dung giữ nguyên...*/
  const container = document.getElementById("jobListings");
  if (!jobs || jobs.length === 0) {
    container.innerHTML = `<p style="text-align:center;color:#888;">Không có việc làm nào được tìm thấy.</p>`;
    return;
  }
  container.innerHTML = jobs.map(job => `
        <div class="job-card" onclick="showJobDetail(${job.jobId})">
            <h3>${job.jobTitle}</h3>
            <p class="company-name">${job.companyName || "N/A"}</p>
            <p class="location"><i class="fas fa-map-marker-alt"></i> ${job.location}</p>
            <p class="salary"><i class="fas fa-money-bill-wave"></i> ${job.salaryNegotiable ? "Thỏa thuận" : (job.jobPostingDetail ? job.jobPostingDetail.salaryDescription : "N/A")}</p>
            <p class="posted-date">Đăng ngày: ${new Date(job.postedDate).toLocaleDateString("vi-VN")}</p>
        </div>`
  ).join("");
}
async function showJobDetail(jobId) {/*...Nội dung giữ nguyên...*/
  const token = localStorage.getItem("authToken");
  try {
    const [jobRes, detailRes] = await Promise.all([
      fetch(`${API_BASE_URL}/jobpostings/${jobId}`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-cache" }),
      fetch(`${API_BASE_URL}/jobpostings/${jobId}/details`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-cache" })
    ]);
    if (!jobRes.ok) throw new Error("Không thể tải chi tiết việc làm.");
    const jobData = await jobRes.json();
    let detailData = detailRes.ok ? await detailRes.json() : null;

    selectedJobForDetail = jobData;
    document.getElementById("jobDetailTitle").textContent = jobData.jobTitle || "N/A";
    document.getElementById("jobDetailCompany").textContent = jobData.companyName || "N/A";
    document.getElementById("jobDetailLocation").textContent = jobData.location || "N/A";

    const tagContainer = document.getElementById("jobDetailTags");
    let skillsArr = [];
    try {
      if (jobData.skills) skillsArr = Array.isArray(jobData.skills) ? jobData.skills : JSON.parse(jobData.skills);
    } catch (e) { }
    tagContainer.innerHTML = skillsArr.length > 0 ? skillsArr.map(skill => `<span style='display:inline-block;background:#eee;border-radius:16px;padding:4px 12px;margin:2px 4px 2px 0;font-size:13px;'>${skill}</span>`).join("") : "";

    if (detailData) {
      document.getElementById("jobDetailSalaryDescription").textContent = detailData.salaryDescription || (jobData.salaryNegotiable ? "Thỏa thuận" : "N/A");
      document.getElementById("jobDetailJobLevel").textContent = detailData.jobLevel || "N/A";
      document.getElementById("jobDetailWorkFormat").textContent = detailData.workFormat || "N/A";
      document.getElementById("jobDetailContractType").textContent = detailData.contractType || "N/A";
      document.getElementById("jobDetailResponsibilities").innerHTML = formatJsonToList(detailData.responsibilities);
      document.getElementById("jobDetailSkills").innerHTML = formatJsonToList(detailData.requiredSkills);
      document.getElementById("jobDetailBenefits").innerHTML = formatJsonToList(detailData.benefits);
    } else {
      ["jobDetailSalaryDescription", "jobDetailJobLevel", "jobDetailWorkFormat", "jobDetailContractType"].forEach(id => document.getElementById(id).textContent = "N/A");
      ["jobDetailResponsibilities", "jobDetailSkills", "jobDetailBenefits"].forEach(id => document.getElementById(id).innerHTML = "<li>N/A</li>");
      if (jobData.salaryNegotiable) document.getElementById("jobDetailSalaryDescription").textContent = "Thỏa thuận";
    }
    document.getElementById("jobDetailModal").style.display = "block";
  } catch (error) {
    alert("Không thể hiển thị chi tiết việc làm: " + error.message);
  }
}
async function applyToJob() {/*...Nội dung giữ nguyên...*/
  if (!currentUser || !selectedJobForDetail) {
    alert("Lỗi: Không có thông tin người dùng hoặc công việc.");
    return;
  }
  if (!userHasResume) {
    alert("Bạn cần tải CV lên trước khi ứng tuyển. Vui lòng chuyển đến tab 'CV của tôi'.");
    closeJobDetailModal();
    const myResumeTab = document.querySelector('.tab-link[onclick*="MyResume"]');
    openCandidateTab({ currentTarget: myResumeTab }, "MyResume");
    return;
  }
  if (!confirm(`Bạn có chắc chắn muốn ứng tuyển vào vị trí "${selectedJobForDetail.jobTitle}" không?`)) return;

  const token = localStorage.getItem("authToken");
  try {
    const response = await fetch(`${API_BASE_URL}/job-applications/apply/${currentUser.id}/${selectedJobForDetail.jobId}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }
    });
    if (response.ok) {
      alert("Bạn đã ứng tuyển thành công!");
      closeJobDetailModal();
      await loadUserJobApplications();
      await loadAllJobPostings();
      const myApplicationsTab = document.querySelector('.tab-link[onclick*="MyApplications"]');
      openCandidateTab({ currentTarget: myApplicationsTab }, "MyApplications");
    } else if (response.status === 409) {
      alert("Bạn đã ứng tuyển vào công việc này rồi.");
    } else {
      throw new Error((await response.text()) || "Lỗi không xác định.");
    }
  } catch (error) {
    alert("Không thể ứng tuyển: " + error.message);
  }
}

// =================================================================
// ==================== LOGIC QUẢN LÝ CV ===========================
// =================================================================
async function checkUserResume() {/*...Nội dung giữ nguyên...*/
  if (!currentUser) return;
  const token = localStorage.getItem("authToken");
  const resumeStatusElement = document.getElementById("resumeStatus");
  const uploadedResumeDisplayElement = document.getElementById("uploadedResumeDisplay");

  try {
    const response = await fetch(`${API_BASE_URL}/files/${currentUser.id}`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-cache" });
    if (response.ok) {
      const fileData = await response.json();
      userHasResume = true;
      resumeStatusElement.textContent = `Bạn đã tải lên CV: ${fileData.fileName}`;
      uploadedResumeDisplayElement.innerHTML = `
        <p>CV của bạn đã được tải lên.</p>
        <button id="downloadResumeBtn" class="btn"><i class="fas fa-download"></i> Tải xuống CV</button>
        <button id="viewResumeBtn" class="btn" style="margin-left: 10px;"><i class="fas fa-eye"></i> Xem CV</button>
        <div id="resumeViewer" style="margin-top: 20px; display: none; text-align: center;"></div>`;

      document.getElementById("downloadResumeBtn").onclick = async function () {
        const token = localStorage.getItem("authToken");
        const res = await fetch(`${API_BASE_URL}/files/download/${currentUser.id}`, { headers: { Authorization: `Bearer ${token}` } });
        const blob = await res.blob();
        let fileName = "cv.pdf";
        const disposition = res.headers.get("Content-Disposition");
        if (disposition && disposition.includes("filename=")) {
          fileName = disposition.split("filename=")[1].replace(/['\"]/g, "").trim();
        }
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = fileName; document.body.appendChild(a); a.click(); a.remove();
        window.URL.revokeObjectURL(url);
      };

      const viewBtn = document.getElementById("viewResumeBtn");
      const viewer = document.getElementById("resumeViewer");
      viewBtn.onclick = function () {
        if (viewer.style.display === "none") {
          viewer.innerHTML = `<iframe src='${API_BASE_URL}/files/download/${currentUser.id}' width='800px' height='600px' style='border:1px solid #ccc;'></iframe>`;
          viewer.style.display = "block";
          viewBtn.innerHTML = '<i class="fas fa-eye-slash"></i> Ẩn CV';
        } else {
          viewer.innerHTML = "";
          viewer.style.display = "none";
          viewBtn.innerHTML = '<i class="fas fa-eye"></i> Xem CV';
        }
      };
    } else {
      userHasResume = false;
      resumeStatusElement.textContent = "Bạn chưa tải CV nào lên. Vui lòng tải lên CV của bạn.";
      uploadedResumeDisplayElement.innerHTML = "";
    }
  } catch (error) {
    console.error("Lỗi kiểm tra CV:", error);
  }
}

// =================================================================
// ==================== LOGIC QUẢN LÝ ĐƠN ỨNG TUYỂN ================
// =================================================================
function renderApplications(applications) {/*...Nội dung giữ nguyên...*/
  const tbody = document.getElementById("applicationList");
  if (!applications || applications.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:#888;">Bạn chưa có đơn ứng tuyển nào.</td></tr>`;
    return;
  }
  tbody.innerHTML = applications.map((app) => `
      <tr>
        <td>${app.jobTitle || 'N/A'}</td>
        <td>${app.companyName || 'N/A'}</td>
        <td>${new Date(app.applyDate).toLocaleDateString("vi-VN")}</td>
        <td><span class="status-${app.state.toLowerCase()}">${app.state}</span></td>
        <td><button class="btn delete-btn" onclick="removeJobApplication(${app.id})"><i class="fas fa-trash"></i> Xóa</button></td>
      </tr>`).join("");
}
async function loadUserJobApplications() {/*...Nội dung giữ nguyên...*/
  if (!currentUser) return;
  const token = localStorage.getItem("authToken");
  const tbody = document.getElementById("applicationList");
  tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">Đang tải...</td></tr>`;
  userAppliedJobIds.clear();

  try {
    const response = await fetch(`${API_BASE_URL}/job-applications/${currentUser.id}`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-cache" });
    if (!response.ok) throw new Error("Không thể tải đơn ứng tuyển.");
    const applications = await response.json();
    applications.forEach(app => {
      if (app.jobId) {
        userAppliedJobIds.add(app.jobId);
      }
    });
    renderApplications(applications);
  } catch (error) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:red;">Lỗi: ${error.message}</td></tr>`;
  }
}
async function removeJobApplication(applicationId) {/*...Nội dung giữ nguyên...*/
  if (!currentUser) return;
  if (!confirm("Bạn có chắc chắn muốn xóa đơn ứng tuyển này không?")) return;

  const token = localStorage.getItem("authToken");
  try {
    const response = await fetch(`${API_BASE_URL}/job-applications/${currentUser.id}/${applicationId}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    if (response.ok) {
      alert("Đã xóa đơn ứng tuyển.");
      await loadUserJobApplications();
      await loadAllJobPostings();
    } else {
      throw new Error((await response.text()) || "Lỗi không xác định.");
    }
  } catch (error) {
    alert("Không thể xóa: " + error.message);
  }
}
async function loadAllJobPostings() {/*...Nội dung giữ nguyên...*/
  const token = localStorage.getItem("authToken");
  try {
    const response = await fetch(`${API_BASE_URL}/jobpostings`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-cache" });
    if (!response.ok) throw new Error("Không thể tải danh sách việc làm.");
    const jobs = await response.json();
    const jobsToDisplay = jobs.filter(job => job.status === "APPROVED" && !userAppliedJobIds.has(job.jobId));

    const detailPromises = jobsToDisplay.map(job =>
      fetch(`${API_BASE_URL}/jobpostings/${job.jobId}/details`, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.ok ? res.json() : null)
    );
    const details = await Promise.all(detailPromises);
    jobsToDisplay.forEach((job, idx) => { job.jobPostingDetail = details[idx]; });

    allJobsCache = jobsToDisplay;
    renderJobCards(jobsToDisplay);
  } catch (error) {
    document.getElementById("jobListings").innerHTML = `<p style="text-align:center;color:red;">Lỗi: ${error.message}</p>`;
  }
}
function searchJobs() {/*...Nội dung giữ nguyên...*/
  const keyword = document.getElementById("jobSearchInput").value.trim().toLowerCase();
  if (!keyword) {
    renderJobCards(allJobsCache);
    return;
  }
  const filtered = allJobsCache.filter(job => {
    const fields = [job.jobTitle, job.location, job.companyName, Array.isArray(job.skills) ? job.skills.join(" ") : (job.skills || "")];
    if (job.jobPostingDetail) {
      fields.push(
        job.jobPostingDetail.salaryDescription, job.jobPostingDetail.jobLevel, job.jobPostingDetail.workFormat,
        job.jobPostingDetail.contractType, job.jobPostingDetail.responsibilities,
        job.jobPostingDetail.requiredSkills, job.jobPostingDetail.benefits
      );
    }
    return fields.some(f => (f || "").toLowerCase().includes(keyword));
  });
  renderJobCards(filtered);
}

// =================================================================
// ==================== KHỞI TẠO VÀ SỰ KIỆN ========================
// =================================================================

document.addEventListener("DOMContentLoaded", function () {
  initializeApp();

  const searchBtn = document.getElementById("jobSearchBtn");
  const searchInput = document.getElementById("jobSearchInput");
  if (searchBtn) searchBtn.onclick = searchJobs;
  if (searchInput) searchInput.oninput = searchJobs;

  const resumeUploadForm = document.getElementById("resumeUploadForm");
  if (resumeUploadForm) {
    resumeUploadForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      const fileInput = document.getElementById("resumeFile");
      if (!fileInput.files.length) return alert("Vui lòng chọn file.");
      if (fileInput.files[0].type !== "application/pdf") return alert("Chỉ chấp nhận file PDF.");

      const formData = new FormData();
      formData.append("file", fileInput.files[0]);
      const token = localStorage.getItem("authToken");
      try {
        const response = await fetch(`${API_BASE_URL}/files/upload/${currentUser.id}`, { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: formData });
        if (response.ok) {
          alert("Tải CV thành công!");
          await checkUserResume();
        } else {
          throw new Error(await response.text());
        }
      } catch (error) {
        alert("Lỗi khi tải CV: " + error.message);
      }
    });
  }
<<<<<<< HEAD

  const userMenuToggle = document.querySelector(".menu-toggle");
  if (userMenuToggle) {
    userMenuToggle.addEventListener("click", function (e) {
      e.stopPropagation();
      this.closest(".user-menu").classList.toggle("active");
    });
  }

  const notificationBell = document.querySelector(".notification-bell");
  if (notificationBell) {
    notificationBell.addEventListener("click", function (e) {
      e.stopPropagation();
      this.classList.toggle("active");
    });
  }

  window.addEventListener("click", function (e) {
    const userMenu = document.querySelector(".user-menu.active");
    if (userMenu && !userMenu.contains(e.target)) {
      userMenu.classList.remove("active");
    }
    const notificationContainer = document.querySelector(".notification-bell.active");
    if (notificationContainer && !notificationContainer.contains(e.target)) {
      notificationContainer.classList.remove("active");
    }
  });

  window.onclick = function (event) {
    const modal = document.getElementById("jobDetailModal");
    if (event.target == modal) {
      closeJobDetailModal();
    }
  };
});
=======
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
>>>>>>> 7bcc88a94783bb2d1fd44eb4ef11a720f9f28c74
