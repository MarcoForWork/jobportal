document.addEventListener('DOMContentLoaded', () => {
    // --- Configuration ---
    const API_BASE_URL = 'http://localhost:8080/jobportal';

    // --- DOM Elements ---
    const tableBody = document.getElementById('postings-table-body');
    const loadingIndicator = document.getElementById('loading-indicator');
    const emptyState = document.getElementById('empty-state');
    const modal = document.getElementById('detail-modal');
    const modalBody = document.getElementById('modal-body-content');
    const closeModalButton = document.getElementById('close-modal-button');
    const approveButton = document.getElementById('approve-button');
    const rejectButton = document.getElementById('reject-button');

    // Dropdown elements
    const userMenu = document.getElementById('user-menu');
    const menuToggle = userMenu.querySelector('.menu-toggle');
    const logoutButton = document.getElementById('logout-button');

    let currentPostingId = null;

    // --- Authorization ---
    function decodeJwt(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
            );
            return JSON.parse(jsonPayload);
        } catch (e) {
            console.error("Error decoding JWT:", e);
            return null;
        }
    }

    function authorizeAdmin() {
        const token = localStorage.getItem('authToken');
        if (!token) {
            alert('Bạn chưa đăng nhập. Đang chuyển hướng...');
            window.location.href = 'login.html'; // THAY ĐỔI TÊN FILE LOGIN CỦA BẠN
            return false;
        }

        const decodedToken = decodeJwt(token);
        const username = decodedToken ? decodedToken.sub : 'Admin';
        document.getElementById('username-display').textContent = username;

        if (!decodedToken || !decodedToken.role || decodedToken.role.trim().toLowerCase() !== 'admin') {
            alert('Tài khoản không có quyền truy cập trang quản trị.');
            window.location.href = 'login.html'; // THAY ĐỔI TÊN FILE LOGIN CỦA BẠN
            return false;
        }
        return true;
    }

    /**
     * Fetches and renders pending job postings.
     */
    async function fetchPendingPostings() {
        loadingIndicator.style.display = 'block';
        emptyState.style.display = 'none';
        tableBody.innerHTML = '';

        try {
            const response = await fetch(`${API_BASE_URL}/api/jobpostings`);
            if (!response.ok) throw new Error(`Network Error: ${response.statusText}`);

            const allPostings = await response.json();
            const pendingPostings = allPostings.filter(p => p.status === 'PENDING');

            renderTable(pendingPostings);
        } catch (error) {
            console.error("Failed to fetch postings:", error);
            loadingIndicator.innerHTML = `<span style="color:var(--danger-color)">Lỗi khi tải dữ liệu. Vui lòng kiểm tra backend.</span>`;
        }
    }

    /**
     * Renders job postings into the table with correct data mapping.
     */
    function renderTable(postings) {
        loadingIndicator.style.display = 'none';
        if (!postings || postings.length === 0) {
            emptyState.style.display = 'block';
            tableBody.innerHTML = '';
            return;
        }
        emptyState.style.display = 'none';

        // Sử dụng đúng tên thuộc tính từ API (jobTitle, companyName, updatedAt, jobId)
        tableBody.innerHTML = postings.map(posting => {
            const dateString = posting.updatedAt || posting.createdAt;
            const displayDate = dateString ? new Date(dateString).toLocaleDateString('vi-VN') : 'N/A';

            return `
                <tr>
                    <td>${posting.jobTitle || 'N/A'}</td>
                    <td>${posting.companyName || 'N/A'}</td>
                    <td>${displayDate}</td>
                    <td>
                        <button class="view-button" data-id="${posting.jobId}">Xem & Duyệt</button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    /**
     * Opens the modal to show posting details.
     */
    async function openModal(postingId) {
        if (isNaN(postingId)) {
            console.error("Invalid posting ID provided:", postingId);
            alert("Lỗi: ID tin tuyển dụng không hợp lệ.");
            return;
        }

        currentPostingId = postingId;
        modal.classList.add('visible');
        modalBody.innerHTML = '<div class="state-indicator">Đang tải chi tiết...</div>';

        try {
            const [mainInfoRes, detailRes] = await Promise.all([
                fetch(`${API_BASE_URL}/api/jobpostings/${postingId}`),
                fetch(`${API_BASE_URL}/api/jobpostings/${postingId}/details`)
            ]);

            if (!mainInfoRes.ok) throw new Error(`Could not fetch main info`);

            const mainInfo = await mainInfoRes.json();
            const details = detailRes.ok ? await detailRes.json() : {};

            renderModalContent(mainInfo, details);
        } catch (error) {
            console.error(`Failed to fetch details for posting ${postingId}:`, error);
            modalBody.innerHTML = `<div class="state-indicator" style="color:var(--danger-color)">Lỗi khi tải chi tiết.</div>`;
        }
    }

    function renderModalContent(mainInfo, details) {
        const responsibilities = (details.responsibilities || "Chưa cập nhật.").split('\n').map(item => `<li>${item}</li>`).join('');
        const requiredSkills = (details.requiredSkills || "Chưa cập nhật.").split('\n').map(item => `<li>${item}</li>`).join('');

        const summary = {
            "Mức lương": details.salaryDescription || (mainInfo.salaryNegotiable ? "Thỏa thuận" : "Cố định"),
            "Cấp bậc": details.jobLevel || "Chưa cập nhật",
            "Hình thức": details.workFormat || "Chưa cập nhật",
            "Hợp đồng": details.contractType || "Chưa cập nhật"
        };

        modalBody.innerHTML = `
            <div class="detail-view">
                <div>
                    <p class="company-name">${mainInfo.companyName}</p>
                    <h1 class="job-title">${mainInfo.jobTitle}</h1>
                    <p class="location"><i class="fas fa-map-marker-alt"></i> ${mainInfo.location || 'Chưa cập nhật'}</p>
                </div>
                <div class="summary">
                     ${Object.entries(summary).map(([key, value]) => `
                        <div class="summary-item"><div class="label">${key}</div><div>${value}</div></div>`).join('')}
                </div>
                <div>
                    <h4 class="section-title"><i class="fas fa-tasks"></i> Trách nhiệm công việc</h4>
                    <ul>${responsibilities}</ul>
                </div>
                <div>
                    <h4 class="section-title"><i class="fas fa-laptop-code"></i> Kỹ năng & Chuyên môn</h4>
                    <ul>${requiredSkills}</ul>
                </div>
            </div>`;
    }

    function closeModal() {
        modal.classList.remove('visible');
        currentPostingId = null;
    }

    async function handleUpdateStatus(newStatus) {
        if (!currentPostingId) return;

        const button = newStatus === 'APPROVED' ? approveButton : rejectButton;
        const originalText = button.textContent;

        approveButton.disabled = true;
        rejectButton.disabled = true;
        button.textContent = 'Đang xử lý...';

        try {
            const response = await fetch(`${API_BASE_URL}/api/jobpostings/${currentPostingId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: `Lỗi ${response.status}` }));
                throw new Error(errorData.message);
            }

            await fetchPendingPostings();
            closeModal();

        } catch (error) {
            console.error(`Failed to update status for posting ${currentPostingId}:`, error);
            alert(`Lỗi khi cập nhật trạng thái: ${error.message}`);
        } finally {
            approveButton.disabled = false;
            rejectButton.disabled = false;
            button.textContent = originalText;
        }
    }

    function handleLogout() {
        localStorage.removeItem('authToken');
        alert('Bạn đã đăng xuất thành công.');
        window.location.href = 'login.html'; // THAY ĐỔI TÊN FILE LOGIN CỦA BẠN
    }

    // --- Event Listeners ---
    tableBody.addEventListener('click', (event) => {
        const viewButton = event.target.closest('.view-button');
        if (viewButton) {
            openModal(parseInt(viewButton.dataset.id, 10));
        }
    });

    closeModalButton.addEventListener('click', closeModal);
    modal.addEventListener('click', (event) => { if (event.target === modal) closeModal(); });
    approveButton.addEventListener('click', () => handleUpdateStatus('APPROVED'));
    rejectButton.addEventListener('click', () => handleUpdateStatus('REJECTED'));

    // Dropdown Logic (from quanly.js)
    menuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        userMenu.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
        if (!userMenu.contains(e.target)) {
            userMenu.classList.remove('active');
        }
    });

    logoutButton.addEventListener('click', handleLogout);

    // --- Initial Load ---
    if (authorizeAdmin()) {
        fetchPendingPostings();
    }
});
