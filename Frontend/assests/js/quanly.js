// Biến toàn cục để lưu trữ thông tin
let userCompany = null;
let currentUser = null;
let selectedJobId = null;

// API Base URL
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
        const response = await fetch(`${API_BASE_URL}/companies`, { cache: 'no-cache' });
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
// ============== HIỂN THỊ GIAO DIỆN VÀ QUẢN LÝ CÔNG TY =============
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

function renderCompanyInfo() {
    if (!userCompany) return;
    document.getElementById('editCompanyName').value = userCompany.companyName;
    document.getElementById('editCompanyIndustry').value = userCompany.industry;
    document.getElementById('editCompanyWebsite').value = userCompany.website;
}

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
// ==================== QUẢN LÝ TIN TUYỂN DỤNG (TAB 1) ===============
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

function renderJobs(jobs) {
    const tbody = document.getElementById('jobList');
    if (!tbody) return;
    if (!jobs || jobs.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:#888">Chưa có tin tuyển dụng nào</td></tr>`;
        return;
    }
    const statusMap = { APPROVED: { text: 'Đã duyệt', className: 'approved' }, PENDING: { text: 'Chờ duyệt', className: 'pending' }, REJECTED: { text: 'Bị từ chối', className: 'rejected' } };
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
              <a href="chitiet.html?id=${job.jobId}" target="_blank" class="action-btn view" title="Xem tin trên trang"><i class="fas fa-eye"></i></a>
              <button class="action-btn edit" title="Sửa thông tin cơ bản" onclick="editJob(${job.jobId})"><i class="fas fa-pen"></i></button>
              <button class="action-btn detail" title="Sửa chi tiết công việc" onclick="openJobDetailForm(${job.jobId})"><i class="fas fa-file-alt"></i></button>
              <button class="action-btn delete" title="Xoá" onclick="deleteJob(${job.jobId})"><i class="fas fa-trash-alt"></i></button>
            </td>
          </tr>`;
    }).join('');
}

// Các hàm cho modal và form (openJobForm, deleteJob, v.v...) giữ nguyên không đổi
function openJobForm(job = null) {/*... giữ nguyên ...*/
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
function closeJobForm() { document.getElementById('jobModal').style.display = 'none'; }
async function submitJobForm(e) {/*... giữ nguyên ...*/
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
async function editJob(jobId) {/*... giữ nguyên ...*/
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
async function deleteJob(jobId) {/*... giữ nguyên ...*/
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
async function openJobDetailForm(jobId) {/*... giữ nguyên ...*/
    const token = localStorage.getItem('authToken');
    const modal = document.getElementById('jobDetailModal');
    const form = document.getElementById('jobDetailForm');
    form.reset();
    document.getElementById('detailJobId').value = jobId;

    try {
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
            console.log("No existing details found. Opening a blank form.");
        } else {
            throw new Error(`Lỗi tải chi tiết: ${response.statusText}`);
        }
    } catch (error) {
        alert("Không thể tải chi tiết công việc. Vui lòng thử lại.");
        return;
    }
    modal.style.display = 'flex';
}
function closeJobDetailForm() { document.getElementById('jobDetailModal').style.display = 'none'; }
async function submitJobDetailForm(event) {/*... giữ nguyên ...*/
    event.preventDefault();
    const token = localStorage.getItem('authToken');
    const jobId = document.getElementById('detailJobId').value;
    if (!jobId) {
        alert("Lỗi: Không tìm thấy ID của tin tuyển dụng.");
        return;
    }

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
// ============== HÀM HELPER ĐỂ HIỂN THỊ DANH SÁCH TIN ==============
// =================================================================

// Hàm helper để tái sử dụng code, hiển thị danh sách tin đã duyệt ra cột trái
async function _renderApprovedJobsList(listElementId, onJobClick) {
    const listEl = document.getElementById(listElementId);
    if (!listEl) return;
    listEl.innerHTML = '<li>Đang tải...</li>';

    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/jobpostings/company/${userCompany.companyId}`, {
            headers: { 'Authorization': `Bearer ${token}` }, cache: 'no-cache'
        });
        if (!response.ok) throw new Error('Không thể tải danh sách tin tuyển dụng.');

        const allJobs = await response.json();
        const approvedJobs = allJobs.filter(job => job.status === 'APPROVED');

        if (approvedJobs.length === 0) {
            listEl.innerHTML = '<li>Không có tin tuyển dụng nào được duyệt.</li>';
            return;
        }

        listEl.innerHTML = approvedJobs.map(job => `
            <li id="job-item-${job.jobId}-${listElementId}" onclick="${onJobClick}(${job.jobId}, this)">
                <strong>${job.jobTitle}</strong>
                <div class="job-info-btn-container">
                    <button class="action-btn info" onclick="showJobInfo(event, ${job.jobId})" title="Xem thông tin">
                        <i class="fas fa-info-circle"></i>
                    </button>
                </div>
            </li>
        `).join('');
    } catch (error) {
        listEl.innerHTML = `<li><span style="color:red;">Lỗi tải dữ liệu.</span></li>`;
    }
}

// =================================================================
// ==================== QUẢN LÝ ĐƠN ỨNG TUYỂN (TAB 2) ===============
// =================================================================

function loadApplications() {
    _renderApprovedJobsList('application-job-list', 'selectJobForApplications');
    document.getElementById('candidate-list-placeholder').style.display = 'flex';
    const table = document.querySelector('#ApplicationManagement table');
    if (table) table.style.display = 'none';
}

function selectJobForApplications(jobId, element) {
    if (selectedJobId === jobId && document.querySelector('#ApplicationManagement').style.display === 'block') return;
    selectedJobId = jobId;

    document.querySelectorAll('#application-job-list li').forEach(li => li.classList.remove('selected'));
    element.classList.add('selected');

    document.getElementById('candidate-list-placeholder').style.display = 'none';
    document.querySelector('#ApplicationManagement table').style.display = 'table';
    loadApplicationsForJob(jobId);
}

async function loadApplicationsForJob(jobId) {
    const tbody = document.getElementById('applicationList');
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;">Đang tải...</td></tr>`;
    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/job-applications/jobs/${jobId}/candidates`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (!response.ok) throw new Error(`Lỗi ${response.status}`);

        const applications = await response.json();
        const applicationsToShow = applications.filter(app => app.state !== 'Accepted');
        renderJobApplications(applicationsToShow);
    } catch (error) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:red;">${error.message}</td></tr>`;
    }
}

function renderJobApplications(applications) {
    const tbody = document.getElementById('applicationList');
    if (!applications || applications.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:#888;">Chưa có đơn ứng tuyển (chưa được duyệt) nào.</td></tr>`;
        return;
    }
    const stateMap = { Pending: { text: 'Chờ duyệt', className: 'pending' }, Rejected: { text: 'Đã từ chối', className: 'rejected' } };
    tbody.innerHTML = applications.map(app => {
        const stateInfo = stateMap[app.state] || { text: app.state, className: 'inactive' };
        const candidateName = (app.lastName || app.firstName) ? `${app.lastName || ''} ${app.firstName || ''}`.trim() : 'Ứng viên ẩn danh';
        let actionsHtml = (app.state === 'Pending') ?
            `<button class="action-btn accept" title="Chấp nhận" onclick="updateApplicationState(${app.id}, 'Accepted')"><i class="fas fa-check-circle"></i></button>
             <button class="action-btn reject" title="Từ chối" onclick="updateApplicationState(${app.id}, 'Rejected')"><i class="fas fa-times-circle"></i></button>`
            : 'Đã xử lý';
        return `
          <tr>
            <td>${candidateName}</td>
            <td>${new Date(app.applyDate).toLocaleDateString('vi-VN')}</td>
            <td><span class="status-${stateInfo.className}">${stateInfo.text}</span></td>
            <td>${actionsHtml}</td>
          </tr>`;
    }).join('');
}

async function updateApplicationState(applicationId, newState) {
    const actionText = newState === 'Accepted' ? 'chấp nhận' : 'từ chối';
    if (!confirm(`Bạn có chắc muốn ${actionText} đơn ứng tuyển này?`)) return;

    try {
        const token = localStorage.getItem('authToken');
        const formData = new URLSearchParams();
        formData.append('state', newState);

        const response = await fetch(`${API_BASE_URL}/job-applications/${applicationId}/state`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
            body: formData
        });

        if (!response.ok) throw new Error(await response.text() || `Lỗi khi ${actionText}`);

        alert(`Đã ${actionText} đơn ứng tuyển thành công!`);
        if (selectedJobId) loadApplicationsForJob(selectedJobId);

    } catch (error) {
        alert('Đã xảy ra lỗi: ' + error.message);
    }
}

// =================================================================
// ==================== QUẢN LÝ ỨNG VIÊN (TAB 3) =====================
// =================================================================

function loadAcceptedCandidatesTab() {
    _renderApprovedJobsList('candidate-manager-job-list', 'selectJobForAcceptedCandidates');
    document.getElementById('accepted-candidate-list-placeholder').style.display = 'flex';
    const table = document.querySelector('#CandidateManagement table');
    if (table) table.style.display = 'none';
}

function selectJobForAcceptedCandidates(jobId, element) {
    if (selectedJobId === jobId && document.querySelector('#CandidateManagement').style.display === 'block') return;
    selectedJobId = jobId;

    document.querySelectorAll('#candidate-manager-job-list li').forEach(li => li.classList.remove('selected'));
    element.classList.add('selected');

    document.getElementById('accepted-candidate-list-placeholder').style.display = 'none';
    document.querySelector('#CandidateManagement table').style.display = 'table';
    loadAcceptedCandidatesForJob(jobId);
}

async function loadAcceptedCandidatesForJob(jobId) {
    const tbody = document.getElementById('acceptedCandidateList');
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;">Đang tải...</td></tr>`;
    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/job-applications/jobs/${jobId}/candidates`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (!response.ok) throw new Error(`Lỗi ${response.status}`);

        const applications = await response.json();
        const acceptedCandidates = applications.filter(app => app.state === 'Accepted');
        renderAcceptedCandidates(acceptedCandidates);
    } catch (error) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:red;">${error.message}</td></tr>`;
    }
}

function renderAcceptedCandidates(candidates) {
    const tbody = document.getElementById('acceptedCandidateList');
    if (!candidates || candidates.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:#888;">Chưa có ứng viên nào trúng tuyển cho tin này.</td></tr>`;
        return;
    }
    tbody.innerHTML = candidates.map(app => {
        const candidateName = (app.lastName || app.firstName) ? `${app.lastName || ''} ${app.firstName || ''}`.trim() : 'N/A';
        const userEmail = app.userEmail || 'N/A'; // Giả sử API trả về email
        return `
          <tr>
            <td>${candidateName}</td>
            <td>${new Date(app.applyDate).toLocaleDateString('vi-VN')}</td>
            <td>${userEmail}</td>
            <td><button class="btn" onclick="alert('Chức năng đang phát triển')">Liên hệ</button></td>
          </tr>`;
    }).join('');
}


// =================================================================
// ============== CÁC HÀM MODAL VÀ TIỆN ÍCH KHÁC ====================
// =================================================================

function closeJobInfoModal() {
    document.getElementById('jobInfoModal').style.display = 'none';
}

async function showJobInfo(event, jobId) {
    event.stopPropagation();
    const modal = document.getElementById('jobInfoModal');
    const modalBody = document.getElementById('infoModalBody');
    modalBody.innerHTML = '<p>Đang tải...</p>';
    modal.style.display = 'flex';
    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/jobpostings/${jobId}`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (!response.ok) throw new Error('Không thể tải thông tin.');
        const job = await response.json();
        modalBody.innerHTML = `
            <p><strong>Vị trí:</strong> ${job.jobTitle}</p>
            <p><strong>Địa điểm:</strong> ${job.location}</p>
            <p><strong>Lương:</strong> ${job.salaryNegotiable ? 'Thoả thuận' : 'Cố định'}</p>
            <p><strong>Kỹ năng:</strong> ${job.skills && JSON.parse(job.skills).length > 0 ? JSON.parse(job.skills).join(', ') : 'Không yêu cầu'}</p>
            <p><strong>Ngày cập nhật:</strong> ${new Date(job.updatedAt).toLocaleDateString('vi-VN')}</p>`;
    } catch (error) {
        modalBody.innerHTML = `<p style="color: red;">${error.message}</p>`;
    }
}

function openTab(evt, tabName, element) {
    document.querySelectorAll(".tab-content").forEach(tc => tc.style.display = "none");
    document.querySelectorAll(".tab-link").forEach(tl => tl.classList.remove("active"));
    document.getElementById(tabName).style.display = "block";
    const target = evt ? evt.currentTarget : element;
    if (target) target.classList.add("active");

    selectedJobId = null; // Reset ID tin đang chọn khi chuyển tab

    if (tabName === 'JobManagement') loadJobs();
    if (tabName === 'ApplicationManagement') loadApplications();
    if (tabName === 'CandidateManagement') loadAcceptedCandidatesTab();
}

function logout(message = '') {
    if (message) alert(message);
    localStorage.removeItem('authToken');
    window.location.href = 'login.html';
}

document.addEventListener('DOMContentLoaded', initializeApp);

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