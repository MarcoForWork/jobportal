// Biến toàn cục để lưu trữ thông tin
let currentUser = null;
let userHasResume = false; // Thêm biến để kiểm tra trạng thái CV
let selectedJobForDetail = null; // Biến để lưu trữ chi tiết công việc đang xem
let userAppliedJobIds = new Set(); // Thêm Set để lưu trữ jobId của các công việc đã ứng tuyển

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
}

function logout(message = "Bạn đã đăng xuất.") {
  localStorage.removeItem("authToken");
  alert(message);
  window.location.href = "login.html";
}

function closeJobDetailModal() {
  document.getElementById("jobDetailModal").style.display = "none";
  selectedJobForDetail = null; // Clear selected job
}

function formatJsonToList(jsonString) {
  if (!jsonString) return "<li>N/A</li>";
  try {
    const items = JSON.parse(jsonString);
    if (Array.isArray(items) && items.length > 0) {
      return items.map((item) => `<li>${item}</li>`).join("");
    }
    return "<li>N/A</li>";
  } catch (e) {
    console.error("Error parsing JSON string:", e);
    return `<li>${jsonString}</li>`; // Return as-is if not valid JSON
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
    const response = await fetch(`${API_BASE_URL}/jobpostings/${jobId}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-cache",
    });
    if (!response.ok) throw new Error("Không thể tải chi tiết việc làm.");
    selectedJobForDetail = await response.json(); // Lưu chi tiết công việc
    console.log("Job Detail:", selectedJobForDetail);

    document.getElementById("jobDetailTitle").textContent =
      selectedJobForDetail.jobTitle;
    document.getElementById("jobDetailCompany").textContent =
      selectedJobForDetail.company
        ? selectedJobForDetail.company.companyName
        : "N/A";
    document.getElementById("jobDetailLocation").textContent =
      selectedJobForDetail.location;

    // Load JobPostingDetail if available
    if (selectedJobForDetail.jobPostingDetail) {
      const detail = selectedJobForDetail.jobPostingDetail;
      document.getElementById("jobDetailSalaryDescription").textContent =
        detail.salaryDescription || "Thỏa thuận";
      document.getElementById("jobDetailJobLevel").textContent =
        detail.jobLevel || "N/A";
      document.getElementById("jobDetailWorkFormat").textContent =
        detail.workFormat || "N/A";
      document.getElementById("jobDetailContractType").textContent =
        detail.contractType || "N/A";
      document.getElementById("jobDetailDescription").textContent =
        detail.jobDescription || "N/A";

      // Responsibilities, Skills, Benefits are JSON strings in JobPostingDetail
      document.getElementById("jobDetailResponsibilities").innerHTML =
        formatJsonToList(detail.responsibilities);
      document.getElementById("jobDetailSkills").innerHTML = formatJsonToList(
        detail.requiredSkills
      );
      document.getElementById("jobDetailBenefits").innerHTML = formatJsonToList(
        detail.benefits
      );
    } else {
      // Clear or set to N/A if no detail
      document.getElementById("jobDetailSalaryDescription").textContent =
        "Thỏa thuận (chưa có chi tiết)";
      document.getElementById("jobDetailJobLevel").textContent = "N/A";
      document.getElementById("jobDetailWorkFormat").textContent = "N/A";
      document.getElementById("jobDetailContractType").textContent = "N/A";
      document.getElementById("jobDetailDescription").textContent =
        "Chưa có mô tả chi tiết.";
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
    alert("Lỗi: Không có thông tin người dùng hoặc công việc.");
    return;
  }

  // (1) Kiểm tra user đã có CV chưa
  if (!userHasResume) {
    alert(
      "Bạn cần tải CV lên trước khi ứng tuyển. Vui lòng chuyển đến tab 'CV của tôi'."
    );
    closeJobDetailModal(); // Đóng modal chi tiết công việc
    openCandidateTab(null, "MyResume"); // Chuyển hướng đến trang upload CV
    const myResumeTabButton = document.querySelector(
      '.tab-link[onclick*="MyResume"]'
    );
    if (myResumeTabButton) myResumeTabButton.classList.add("active");
    return;
  }

  const confirmApply = confirm(
    `Bạn có chắc chắn muốn ứng tuyển vào vị trí "${selectedJobForDetail.jobTitle}" không?`
  );
  if (!confirmApply) return;

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
      alert("Bạn đã ứng tuyển thành công!");
      closeJobDetailModal(); // Đóng modal
      await loadUserJobApplications(); // Tải lại danh sách đơn ứng tuyển để cập nhật userAppliedJobIds
      await loadAllJobPostings(); // Tải lại danh sách việc làm để ẩn các công việc đã ứng tuyển
      openCandidateTab(null, "MyApplications"); // Chuyển sang tab đơn ứng tuyển
      const myApplicationsTabButton = document.querySelector(
        '.tab-link[onclick*="MyApplications"]'
      );
      if (myApplicationsTabButton)
        myApplicationsTabButton.classList.add("active");
    } else if (response.status === 409) {
      // Conflict, already applied
      alert("Bạn đã ứng tuyển vào công việc này rồi.");
    } else {
      throw new Error(
        (await response.text()) || "Lỗi không xác định khi ứng tuyển."
      );
    }
  } catch (error) {
    alert("Không thể ứng tuyển: " + error.message);
    console.error("Lỗi ứng tuyển:", error);
  }
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
        <td>${app.jobPosting ? app.jobPosting.jobTitle : "N/A"}</td>
        <td>${
          app.jobPosting && app.jobPosting.company
            ? app.jobPosting.company.companyName
            : "N/A"
        }</td>
        <td>${new Date(app.applyDate).toLocaleDateString("vi-VN")}</td>
        <td><span class="status-${app.state.toLowerCase()}">${
        app.state
      }</span></td>
        <td>
          <button class="btn delete-btn" onclick="removeJobApplication(${
            app.id
          })">
            <i class="fas fa-trash"></i> Xóa
          </button>
        </td>
      </tr>
    `
    )
    .join("");
}

async function loadUserJobApplications() {
  if (!currentUser) return;
  const token = localStorage.getItem("authToken");
  const tbody = document.getElementById("applicationList");
  tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:#888;">Đang tải đơn ứng tuyển...</td></tr>`;
  userAppliedJobIds.clear(); // Xóa các jobId đã lưu trước đó

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

    // Lưu trữ các jobId mà người dùng đã ứng tuyển vào Set
    applications.forEach((app) => {
      // CORRECTION HERE (as identified in previous turn): Use app.jobId directly
      if (app.jobId) {
        userAppliedJobIds.add(app.jobId);
      }
    });

    renderApplications(applications);
  } catch (error) {
    console.error("Lỗi tải đơn ứng tuyển:", error);
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:red;">Lỗi tải dữ liệu: ${error.message}</td></tr>`;
  }
}

async function removeJobApplication(applicationId) {
  if (!currentUser) {
    alert("Lỗi: Không có thông tin người dùng.");
    return;
  }

  const confirmDelete = confirm(
    "Bạn có chắc chắn muốn xóa đơn ứng tuyển này không?"
  );
  if (!confirmDelete) return;

  const token = localStorage.getItem("authToken");
  try {
    const response = await fetch(
      `${API_BASE_URL}/job-applications/${currentUser.id}/${applicationId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.ok) {
      alert("Đơn ứng tuyển đã được xóa thành công.");
      await loadUserJobApplications(); // Tải lại danh sách đơn ứng tuyển để cập nhật userAppliedJobIds
      await loadAllJobPostings(); // Tải lại danh sách việc làm để hiển thị lại công việc nếu cần
    } else {
      throw new Error(
        (await response.text()) || "Lỗi không xác định khi xóa đơn ứng tuyển."
      );
    }
  } catch (error) {
    alert("Không thể xóa đơn ứng tuyển: " + error.message);
    console.error("Lỗi xóa đơn ứng tuyển:", error);
  }
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
      const isActiveValue = job.isActive;
      // Chỉ hiển thị nếu công việc active VÀ người dùng chưa ứng tuyển
      return (
        (isActiveValue === true || isActiveValue === 1) &&
        !userAppliedJobIds.has(job.jobId)
      );
    });

    renderJobCards(jobsToDisplay);
  } catch (error) {
    console.error("Lỗi tải danh sách việc làm:", error);
    document.getElementById(
      "jobListings"
    ).innerHTML = `<p style="text-align:center;color:red;">Lỗi tải dữ liệu: ${error.message}</p>`;
  }
}

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

  // Mở tab "Jobs" mặc định khi tải trang
  const firstTab = document.querySelector('.tab-link[onclick*="Jobs"]');
  if (firstTab) {
    openCandidateTab(null, "Jobs");
    firstTab.classList.add("active");
  }

  await checkUserResume(); // Kiểm tra CV ngay khi khởi tạo
  await loadUserJobApplications(); // Tải đơn ứng tuyển trước để có danh sách các jobId đã ứng tuyển
  await loadAllJobPostings(); // Tải danh sách công việc
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
