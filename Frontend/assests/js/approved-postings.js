document.addEventListener('DOMContentLoaded', () => {
    // --- Configuration ---
    const API_BASE_URL = 'http://localhost:8080/jobportal';

    // --- DOM Elements ---
    const tableBody = document.getElementById('processed-postings-body');
    const loadingIndicator = document.getElementById('loading-indicator');
    const emptyState = document.getElementById('empty-state');
    const userMenu = document.getElementById('user-menu');
    const menuToggle = userMenu.querySelector('.menu-toggle');
    const logoutButton = document.getElementById('logout-button');

    // --- JWT & Authorization ---
    function decodeJwt(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
            return JSON.parse(jsonPayload);
        } catch (e) {
            console.error("Error decoding JWT:", e);
            return null;
        }
    }

    function authorizeAdmin() {
        const token = localStorage.getItem('authToken');
        if (!token) {
            logout('Vui lòng đăng nhập.');
            return false;
        }

        const decodedToken = decodeJwt(token);
        const username = decodedToken ? decodedToken.sub : 'Admin';
        document.getElementById('username-display').textContent = username;

        if (!decodedToken || !decodedToken.role || decodedToken.role.trim().toLowerCase() !== 'admin') {
            logout('Tài khoản không có quyền truy cập trang này.');
            return false;
        }
        return true;
    }

    /**
     * Fetches and renders approved and rejected job postings.
     */
    async function fetchProcessedPostings() {
        loadingIndicator.style.display = 'block';
        emptyState.style.display = 'none';
        tableBody.innerHTML = '';

        try {
            const response = await fetch(`${API_BASE_URL}/api/jobpostings`);
            if (!response.ok) throw new Error(`Network Error: ${response.statusText}`);

            const allPostings = await response.json();
            // Filter for postings that are either APPROVED or REJECTED
            const processedPostings = allPostings.filter(p => p.status === 'APPROVED' || p.status === 'REJECTED');

            renderTable(processedPostings);
        } catch (error) {
            console.error("Failed to fetch postings:", error);
            loadingIndicator.innerHTML = `<span style="color:var(--danger-color)">Lỗi khi tải dữ liệu.</span>`;
        }
    }

    function renderTable(postings) {
        loadingIndicator.style.display = 'none';
        if (!postings || postings.length === 0) {
            emptyState.style.display = 'block';
            return;
        }
        emptyState.style.display = 'none';

        tableBody.innerHTML = postings.map(posting => {
            const dateString = posting.updatedAt || posting.createdAt;
            const displayDate = dateString ? new Date(dateString).toLocaleDateString('vi-VN') : 'N/A';
            const statusClass = posting.status === 'APPROVED' ? 'status-approved' : 'status-rejected';
            const statusText = posting.status === 'APPROVED' ? 'Đã Duyệt' : 'Đã Từ Chối';

            return `
                <tr id="history-row-${posting.jobId}">
                    <td>${posting.jobTitle || 'N/A'}</td>
                    <td>${posting.companyName || 'N/A'}</td>
                    <td>${displayDate}</td>
                    <td><span class="status ${statusClass}">${statusText}</span></td>
                    <td>
                        <button class="remove-btn" data-id="${posting.jobId}" title="Ẩn khỏi danh sách này">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    /**
     * Handles the removal of a posting from the list purely on the frontend.
     * @param {number} postingId The ID of the posting to remove.
     */
    function handleRemove(postingId) {
        // Cập nhật lại thông báo để làm rõ hành động
        if (!confirm('Bạn chắc chắn muốn ẩn tin này khỏi danh sách lịch sử? Hành động này chỉ ảnh hưởng đến giao diện của bạn.')) {
            return;
        }

        // Bỏ đi lời gọi API DELETE, chỉ xử lý ở giao diện
        const row = document.getElementById(`history-row-${postingId}`);
        if (row) {
            row.remove();
        }

        // Kiểm tra nếu bảng không còn dòng nào thì hiển thị thông báo
        if (tableBody.children.length === 0) {
            emptyState.style.display = 'block';
        }
    }

    function logout(message = '') {
        if (message) alert(message);
        localStorage.removeItem('authToken');
        window.location.href = 'login.html'; // CHANGE TO YOUR LOGIN PAGE
    }

    // --- Event Listeners ---
    tableBody.addEventListener('click', (event) => {
        const removeButton = event.target.closest('.remove-btn');
        if (removeButton) {
            const postingId = parseInt(removeButton.dataset.id, 10);
            handleRemove(postingId);
        }
    });

    // Dropdown Logic
    menuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        userMenu.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
        if (!userMenu.contains(e.target)) {
            userMenu.classList.remove('active');
        }
    });

    logoutButton.addEventListener('click', () => logout('Bạn đã đăng xuất.'));

    // --- Initial Load ---
    if (authorizeAdmin()) {
        fetchProcessedPostings();
    }
});
