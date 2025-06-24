// Biến toàn cục để lưu trữ thông tin
let userCompany = null;
let currentUser = null;

// Đổi tên biến để dễ sử dụng hơn
const API_BASE_URL = 'http://localhost:8080/jobportal/api';

/**
 * Hàm giải mã JWT để lấy payload.
 */
function decodeJwtQuanly(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error("Error decoding JWT:", e);
        return null;
    }
}

/**
 * Hàm khởi tạo chính, được gọi khi trang tải xong.
 */
async function initializeApp() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    const decodedToken = decodeJwtQuanly(token);
    if (!decodedToken || !decodedToken.sub || !decodedToken.userId) {
        logout('Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.');
        return;
    }

    currentUser = { id: decodedToken.userId, username: decodedToken.sub };
    document.getElementById('usernameDisplay').textContent = currentUser.username;

    try {
        const response = await fetch(`${API_BASE_URL}/companies`, {
            cache: 'no-cache'
        });
        if (!response.ok) throw new Error(`Không thể tải danh sách công ty (Lỗi: ${response.status})`);

        const companies = await response.json();
        userCompany = companies.find(c => c.ownerUserId === currentUser.id);

        if (userCompany) {
            showCompanyDashboard();
        } else {
            showCreateCompanyView();
        }
    } catch (error) {
        console.error('Lỗi khởi tạo:', error);
        alert('Đã có lỗi xảy ra khi tải dữ liệu. ' + error.message);
    }
}

// =================================================================
// ============== LOGIC HIỂN THỊ GIAO DIỆN CHÍNH =====================
// =================================================================

function showCreateCompanyView() {
    document.getElementById('createCompanySection').style.display = 'block';
    document.getElementById('companyDashboardSection').style.display = 'none';
}

function showCompanyDashboard() {
    document.getElementById('createCompanySection').style.display = 'none';
    const dashboardSection = document.getElementById('companyDashboardSection');
    dashboardSection.style.display = 'block';
    const firstTab = document.querySelector('.tab-link');
    if (firstTab) openTab(null, 'JobManagement', firstTab);
    renderCompanyInfo();
}

// =================================================================
// ==================== LOGIC QUẢN LÝ CÔNG TY =======================
// (Giữ nguyên)
// =================================================================

async function handleCreateCompany(event) {
    event.preventDefault();
    const token = localStorage.getItem('authToken');
    const companyRequest = {
        ownerUserId: currentUser.id,
        companyName: document.getElementById('companyName').value.trim(),
        industry: document.getElementById('companyIndustry').value.trim(),
        website: document.getElementById('companyWebsite').value.trim()
    };
    try {
        const response = await fetch(`${API_BASE_URL}/companies`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(companyRequest)
        });
        if (response.status === 201) {
            alert('Tạo công ty thành công!');
            await initializeApp();
        } else {
            throw new Error(await response.text() || "Lỗi không xác định");
        }
    } catch (error) {
        alert('Không thể tạo công ty: ' + error.message);
    }
}

function renderCompanyInfo() {
    if (!userCompany) return;
    document.getElementById('editCompanyName').value = userCompany.companyName;
    document.getElementById('editCompanyIndustry').value = userCompany.industry;
    document.getElementById('editCompanyWebsite').value = userCompany.website;
}

async function handleUpdateCompany(event) {
    event.preventDefault();
    if (!userCompany) return;
    const token = localStorage.getItem('authToken');
    const companyRequest = {
        ownerUserId: currentUser.id,
        companyName: document.getElementById('editCompanyName').value.trim(),
        industry: document.getElementById('editCompanyIndustry').value.trim(),
        website: document.getElementById('editCompanyWebsite').value.trim()
    };
    try {
        const response = await fetch(`${API_BASE_URL}/companies/${userCompany.companyId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(companyRequest)
        });
        if (response.ok) {
            alert('Cập nhật thông tin công ty thành công!');
            userCompany = await response.json();
            renderCompanyInfo();
        } else {
            throw new Error(await response.text() || "Lỗi không xác định");
        }
    } catch (error) {
        alert('Không thể cập nhật công ty: ' + error.message);
    }
}


// =================================================================
// ==================== LOGIC QUẢN LÝ TIN TUYỂN DỤNG =================
// =================================================================

async function loadJobs() {
    if (!userCompany) return;
    const token = localStorage.getItem('authToken');
    try {
        const response = await fetch(`${API_BASE_URL}/jobpostings/company/${userCompany.companyId}`, {
            headers: { 'Authorization': `Bearer ${token}` },
            cache: 'no-cache'
        });
        if (!response.ok) throw new Error('Không thể tải tin tuyển dụng.');
        renderJobs(await response.json());
    } catch (error) {
        document.getElementById('jobList').innerHTML = `<tr><td colspan="6" style="text-align:center;color:red;">Lỗi tải dữ liệu.</td></tr>`;
    }
}

/**
 * === CẬP NHẬT QUAN TRỌNG ===
 * Thêm nút "Sửa chi tiết" (hình file) vào cột Hành động
 */
function renderJobs(jobs) {
    const tbody = document.getElementById('jobList');
    if (!tbody) return;
    if (!jobs || jobs.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:#888">Chưa có tin tuyển dụng nào</td></tr>`;
        return;
    }

    const statusMap = {
        APPROVED: { text: 'Đã duyệt', className: 'approved' },
        PENDING: { text: 'Chờ duyệt', className: 'pending' },
        REJECTED: { text: 'Bị từ chối', className: 'rejected' }
    };

    tbody.innerHTML = jobs.map(job => {
        const statusInfo = statusMap[job.status] || { text: job.status, className: 'inactive' };

        return `
          <tr>
            <td>${job.jobTitle}</td>
            <td>${job.salaryNegotiable ? 'Thoả thuận' : 'Cố định'}</td>
            <td>${job.location}</td>
            <td>${new Date(job.updatedAt).toLocaleDateString('vi-VN')}</td>
            <td><span class="status-${statusInfo.className}">${statusInfo.text}</span></td>
            <td>
              <button class="action-btn edit" title="Sửa thông tin cơ bản" onclick="editJob(${job.jobId})"><i class="fas fa-pen"></i></button>
              
              <!-- NÚT MỚI: Sửa chi tiết -->
              <button class="action-btn detail" title="Sửa chi tiết công việc" onclick="openJobDetailForm(${job.jobId})"><i class="fas fa-file-alt"></i></button>
              
              <button class="action-btn delete" title="Xoá" onclick="deleteJob(${job.jobId})"><i class="fas fa-trash-alt"></i></button>
            </td>
          </tr>`;
    }).join('');
}

// ---- LOGIC QUẢN LÝ TIN CƠ BẢN (FORM CŨ) ----

function openJobForm(job = null) {
    const modal = document.getElementById('jobModal');
    modal.style.display = 'flex';
    document.getElementById('jobForm').reset();
    document.getElementById('jobId').value = '';
    if (job) {
        document.getElementById('modalTitle').textContent = 'Sửa tin tuyển dụng';
        document.getElementById('jobId').value = job.jobId;
        document.getElementById('jobTitle').value = job.jobTitle;
        document.getElementById('jobLocation').value = job.location;
        document.getElementById('jobSalaryNegotiable').checked = job.salaryNegotiable;
        document.getElementById('jobSkills').value = job.skills || '';
    } else {
        document.getElementById('modalTitle').textContent = 'Đăng tin tuyển dụng';
    }
}

function closeJobForm() {
    document.getElementById('jobModal').style.display = 'none';
}

async function submitJobForm(e) {
    e.preventDefault();
    const token = localStorage.getItem('authToken');
    const jobId = document.getElementById('jobId').value;
    const skillsInput = document.getElementById('jobSkills').value.trim();
    const skillsJsonString = skillsInput ? JSON.stringify(skillsInput.split(',').map(s => s.trim())) : '[]';

    const jobRequest = {
        companyId: userCompany.companyId,
        jobTitle: document.getElementById('jobTitle').value,
        location: document.getElementById('jobLocation').value,
        salaryNegotiable: document.getElementById('jobSalaryNegotiable').checked,
        skills: skillsJsonString,
    };

    const method = jobId ? 'PUT' : 'POST';
    const url = jobId ? `${API_BASE_URL}/jobpostings/${jobId}` : `${API_BASE_URL}/jobpostings`;

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(jobRequest)
        });
        if (!response.ok) throw new Error(await response.text());
        closeJobForm();
        loadJobs();
    } catch (error) {
        alert('Không thể lưu tin. ' + error.message);
    }
}

async function editJob(jobId) {
    const token = localStorage.getItem('authToken');
    try {
        const response = await fetch(`${API_BASE_URL}/jobpostings/${jobId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Không tìm thấy tin tuyển dụng.');
        openJobForm(await response.json());
    } catch (error) {
        alert(error.message);
    }
}

async function deleteJob(jobId) {
    if (confirm('Bạn chắc chắn muốn xoá tin này?')) {
        const token = localStorage.getItem('authToken');
        try {
            const response = await fetch(`${API_BASE_URL}/jobpostings/${jobId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.status !== 204) throw new Error('Lỗi khi xoá tin.');
            loadJobs();
        } catch (error) {
            alert(error.message);
        }
    }
}

// =================================================================
// ========= LOGIC QUẢN LÝ CHI TIẾT TIN TUYỂN DỤNG (MỚI) ===========
// =================================================================

/**
 * Mở form để chỉnh sửa thông tin chi tiết.
 * @param {number} jobId - ID của tin tuyển dụng cần sửa.
 */
async function openJobDetailForm(jobId) {
    const token = localStorage.getItem('authToken');
    const modal = document.getElementById('jobDetailModal');
    const form = document.getElementById('jobDetailForm');
    form.reset(); // Xóa dữ liệu cũ
    document.getElementById('detailJobId').value = jobId; // Gán ID vào form

    try {
        // API này lấy đầy đủ thông tin chi tiết (giả định endpoint đã có)
        const response = await fetch(`${API_BASE_URL}/jobpostings/${jobId}/details`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const details = await response.json();
            document.getElementById('jobSalaryDescription').value = details.salaryDescription || '';
            document.getElementById('jobLevel').value = details.jobLevel || '';
            document.getElementById('jobWorkFormat').value = details.workFormat || '';
            document.getElementById('jobContractType').value = details.contractType || '';
            document.getElementById('jobResponsibilities').value = details.responsibilities || '';
            document.getElementById('jobRequiredSkills').value = details.requiredSkills || '';
            document.getElementById('jobBenefits').value = details.benefits || '';
        } else if (response.status === 404) {
            // Nếu không có dữ liệu (lần đầu chỉnh sửa), form sẽ trống
            console.log("No existing details found. Opening a blank form.");
        } else {
            throw new Error(`Lỗi tải chi tiết: ${response.statusText}`);
        }

    } catch (error) {
        alert("Không thể tải chi tiết công việc. Vui lòng thử lại.");
        return; // Không mở modal nếu có lỗi
    }

    modal.style.display = 'flex'; // Hiển thị modal
}

/**
 * Đóng form chi tiết.
 */
function closeJobDetailForm() {
    document.getElementById('jobDetailModal').style.display = 'none';
}

/**
 * Gửi dữ liệu chi tiết lên server.
 * @param {Event} event - Sự kiện submit form.
 */
async function submitJobDetailForm(event) {
    event.preventDefault();
    const token = localStorage.getItem('authToken');
    const jobId = document.getElementById('detailJobId').value;

    if (!jobId) {
        alert("Lỗi: Không tìm thấy ID của tin tuyển dụng.");
        return;
    }

    // Thu thập dữ liệu từ form chi tiết
    const detailRequest = {
        salaryDescription: document.getElementById('jobSalaryDescription').value.trim(),
        jobLevel: document.getElementById('jobLevel').value.trim(),
        workFormat: document.getElementById('jobWorkFormat').value.trim(),
        contractType: document.getElementById('jobContractType').value.trim(),
        responsibilities: document.getElementById('jobResponsibilities').value.trim(),
        requiredSkills: document.getElementById('jobRequiredSkills').value.trim(),
        benefits: document.getElementById('jobBenefits').value.trim(),
    };

    try {
        const response = await fetch(`${API_BASE_URL}/jobpostings/${jobId}/details`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(detailRequest)
        });

        if (!response.ok) throw new Error(await response.text());

        alert("Lưu chi tiết thành công!");
        closeJobDetailForm();

    } catch (error) {
        alert("Không thể lưu chi tiết. " + error.message);
    }
}

// =================================================================
// ==================== HÀM TIỆN ÍCH KHÁC ===========================
// =================================================================

function openTab(evt, tabName, element) {
    document.querySelectorAll(".tab-content").forEach(tc => tc.style.display = "none");
    document.querySelectorAll(".tab-link").forEach(tl => tl.classList.remove("active"));

    document.getElementById(tabName).style.display = "block";
    const target = evt ? evt.currentTarget : element;
    if (target) target.classList.add("active");

    if (tabName === 'JobManagement') loadJobs();
    if (tabName === 'ApplicationManagement') loadApplications();
}

function logout(message = '') {
    if (message) alert(message);
    localStorage.removeItem('authToken');
    window.location.href = 'login.html';
}

// Bắt đầu ứng dụng khi trang được tải
document.addEventListener('DOMContentLoaded', initializeApp);

// Logic cho dropdown menu
document.querySelector('.menu-toggle').onclick = (e) => {
    document.querySelector('.user-menu').classList.toggle('active');
    e.stopPropagation();
};

document.body.onclick = (e) => {
    const menu = document.querySelector('.user-menu');
    if (menu && !e.target.closest('.user-menu')) {
        menu.classList.remove('active');
    }
};

// Logic quản lý đơn ứng tuyển (dữ liệu giả)
async function loadApplications() {
    const tbody = document.getElementById('applicationList');
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">Đang tải...</td></tr>`;
    const mockApplications = [
        { id: 101, candidateName: 'Nguyễn Văn An', jobTitle: 'Mobile Developer', applyDate: '2025-06-22T10:00:00Z', status: 'Pending' },
        { id: 102, candidateName: 'Trần Thị Bình', jobTitle: 'Trưởng nhóm Kiểm thử', applyDate: '2025-06-23T14:30:00Z', status: 'Accepted' }
    ];
    renderApplications(mockApplications);
}

function renderApplications(applications) {
    const tbody = document.getElementById('applicationList');
    if (!applications || applications.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:#888;">Chưa có đơn ứng tuyển nào</td></tr>`;
        return;
    }
    tbody.innerHTML = applications.map(app => `
      <tr>
        <td>${app.candidateName}</td>
        <td>${app.jobTitle}</td>
        <td>${new Date(app.applyDate).toLocaleDateString('vi-VN')}</td>
        <td><span class="status-${app.status.toLowerCase()}">${app.status}</span></td>
        <td>
          ${app.status === 'Pending' ?
            `<button class="action-btn accept" title="Chấp nhận"><i class="fas fa-check-circle"></i></button>
             <button class="action-btn reject" title="Từ chối"><i class="fas fa-times-circle"></i></button>`
            : 'Đã xử lý'}
        </td>
      </tr>`).join('');
}
