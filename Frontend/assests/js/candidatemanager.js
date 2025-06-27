// Biến toàn cục để lưu trữ thông tin
let userCompany = null;
let currentUser = null;
let selectedJobId = null;

const API_BASE_URL = 'http://localhost:8080/jobportal/api';

/**
 * Hàm giải mã JWT để lấy payload.
 */
function decodeJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
}

/**
 * Hàm logout
 */
function logout() {
    localStorage.removeItem('authToken');
    window.location.href = 'login.html';
}

/**
 * Hàm khởi tạo chính của trang.
 */
async function initializeCandidateManager() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    const decodedToken = decodeJwt(token);
    if (!decodedToken || !decodedToken.sub || !decodedToken.userId) {
        logout();
        return;
    }

    currentUser = { id: decodedToken.userId, username: decodedToken.sub };
    document.getElementById('usernameDisplay').textContent = currentUser.username;

    try {
        const companyResponse = await fetch(`${API_BASE_URL}/companies`, { cache: 'no-cache' });
        if (!companyResponse.ok) throw new Error('Không thể tải thông tin công ty.');

        const companies = await companyResponse.json();
        userCompany = companies.find(c => c.ownerUserId === currentUser.id);

        if (userCompany) {
            loadApprovedJobsList();
        } else {
            document.querySelector('.dashboard-card').innerHTML = '<h2>Lỗi: Không tìm thấy công ty của bạn.</h2>';
        }
    } catch (error) {
        alert('Đã xảy ra lỗi khi tải dữ liệu trang: ' + error.message);
    }
}

/**
 * Tải danh sách các tin tuyển dụng đã được duyệt vào cột bên trái.
 */
async function loadApprovedJobsList() {
    if (!userCompany) return;

    const jobListEl = document.getElementById('candidate-manager-job-list');
    jobListEl.innerHTML = '<li>Đang tải...</li>';

    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/jobpostings/company/${userCompany.companyId}`, {
            headers: { 'Authorization': `Bearer ${token}` },
            cache: 'no-cache'
        });
        if (!response.ok) throw new Error('Không thể tải danh sách tin tuyển dụng.');

        const allJobs = await response.json();
        const approvedJobs = allJobs.filter(job => job.status === 'APPROVED');

        if (approvedJobs.length === 0) {
            jobListEl.innerHTML = '<li>Không có tin tuyển dụng nào được duyệt.</li>';
            return;
        }

        // <<< THAY ĐỔI Ở ĐÂY >>>: Thêm nút xem thông tin nhanh cho mỗi tin
        jobListEl.innerHTML = approvedJobs.map(job => `
            <li id="job-item-${job.jobId}" onclick="selectJobForCandidates(${job.jobId}, this)">
                <strong>${job.jobTitle}</strong>
                <div class="job-info-btn-container">
                    <button class="action-btn info" onclick="showJobInfo(event, ${job.jobId})" title="Xem thông tin">
                        <i class="fas fa-info-circle"></i>
                    </button>
                </div>
            </li>
        `).join('');
    } catch (error) {
        jobListEl.innerHTML = `<li><span style="color:red;">Lỗi tải dữ liệu.</span></li>`;
    }
}

/**
 * Xử lý khi chọn một tin tuyển dụng.
 */
function selectJobForCandidates(jobId, element) {
    if (selectedJobId === jobId) return;
    selectedJobId = jobId;

    document.querySelectorAll('#candidate-manager-job-list li').forEach(li => li.classList.remove('selected'));
    element.classList.add('selected');

    document.getElementById('accepted-candidate-list-placeholder').style.display = 'none';
    document.querySelector('.candidate-list-view table').style.display = 'table';

    loadAcceptedCandidatesForJob(jobId);
}

/**
 * Tải danh sách ứng viên đã trúng tuyển cho một công việc.
 */
async function loadAcceptedCandidatesForJob(jobId) {
    const tbody = document.getElementById('acceptedCandidateList');
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;">Đang tải...</td></tr>`;

    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/job-applications/jobs/${jobId}/candidates`, {
            headers: { 'Authorization': `Bearer ${token}` },
            cache: 'no-cache'
        });
        if (!response.ok) throw new Error('Không thể tải danh sách ứng viên.');

        const applications = await response.json();
        const acceptedCandidates = applications.filter(app => app.state === 'Accepted');

        renderAcceptedCandidates(acceptedCandidates);
    } catch (error) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:red;">${error.message}</td></tr>`;
    }
}

/**
 * Hiển thị các ứng viên đã trúng tuyển ra bảng.
 */
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
            <td>${app.jobTitle || 'N/A'}</td>
          </tr>`;
    }).join('');
}


// <<< HÀM MỚI ĐƯỢC THÊM VÀO >>>
/**
 * Đóng modal xem thông tin nhanh.
 */
function closeJobInfoModal() {
    document.getElementById('jobInfoModal').style.display = 'none';
}

/**
 * Hiển thị modal với thông tin cơ bản của tin tuyển dụng.
 */
async function showJobInfo(event, jobId) {
    event.stopPropagation(); // Ngăn không cho sự kiện click vào thẻ li chạy

    const modal = document.getElementById('jobInfoModal');
    const modalBody = document.getElementById('infoModalBody');
    modalBody.innerHTML = '<p>Đang tải dữ liệu...</p>';
    modal.style.display = 'flex';

    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/jobpostings/${jobId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error('Không thể tải thông tin tin tuyển dụng.');
        }

        const job = await response.json();

        modalBody.innerHTML = `
            <p><strong>Vị trí:</strong> ${job.jobTitle}</p>
            <p><strong>Địa điểm:</strong> ${job.location}</p>
            <p><strong>Lương:</strong> ${job.salaryNegotiable ? 'Thoả thuận' : 'Cố định'}</p>
            <p><strong>Kỹ năng:</strong> ${job.skills && JSON.parse(job.skills).length > 0 ? JSON.parse(job.skills).join(', ') : 'Không yêu cầu'}</p>
            <p><strong>Ngày cập nhật:</strong> ${new Date(job.updatedAt).toLocaleDateString('vi-VN')}</p>
        `;

    } catch (error) {
        modalBody.innerHTML = `<p style="color: red;">${error.message}</p>`;
    }
}

// Bắt đầu ứng dụng khi trang được tải
document.addEventListener('DOMContentLoaded', initializeCandidateManager);

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