document.addEventListener("DOMContentLoaded", function () {

    let currentUser = null;

    try {
        // Luôn kiểm tra xem localStorage có gì trước khi parse
        const storedUser = localStorage.getItem('currentUser');
        console.log("Giá trị đọc từ localStorage trên trang CV:", storedUser);

        if (storedUser) {
            currentUser = JSON.parse(storedUser);
        }
    } catch (error) {
        console.error("Lỗi khi parse dữ liệu người dùng:", error);
        localStorage.removeItem('currentUser'); // Xóa dữ liệu bị lỗi
    }

    if (!currentUser || !currentUser.id) { // Kiểm tra cả currentUser và currentUser.id
        alert("Please log in to manage your CV.");
        window.location.href = 'login.html';
        return;
    }

    const CANDIDATE_ID = currentUser.id;

    // ... phần code còn lại của file cv.js giữ nguyên ...
});
// Lấy các element trên trang HTML
const candidateNameEl = document.getElementById("candidateName");
const candidateEmailEl = document.getElementById("candidateEmail");
const cvDetailsEl = document.getElementById("cv-details");
const fileInput = document.getElementById("cvFile");
const uploadBtn = document.getElementById("uploadBtn");

// --- PHẦN 2: CÁC HÀM TƯƠNG TÁC VỚI API ---

/**
 * Tải và hiển thị thông tin ứng viên và CV của họ
 */
async function loadCandidateInfo() {
    try {
        const response = await fetch(`http://localhost:8081/job_portal/api/candidates/${CANDIDATE_ID}`);
        if (!response.ok) {
            throw new Error("Không thể tải thông tin ứng viên từ server.");
        }
        const candidate = await response.json();

        // Hiển thị thông tin cá nhân
        candidateNameEl.textContent = candidate.name || 'Chưa có thông tin';
        candidateEmailEl.textContent = candidate.email || 'Chưa có thông tin';

        // Hiển thị thông tin CV
        if (candidate.cvFilePath) {
            cvDetailsEl.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 20px;">
                        <p style="margin:0;"><strong>Tên file:</strong> ${candidate.cvFilePath}</p>
                        <div>
                            <button class="action-btn" onclick="downloadCV()"><i class="fas fa-download"></i> Tải xuống</button>
                            <button class="action-btn" onclick="deleteCV()"><i class="fas fa-trash-alt"></i> Xóa</button>
                        </div>
                    </div>
                `;
        } else {
            cvDetailsEl.innerHTML = `<p style="color: #888;">Bạn chưa tải lên CV nào.</p>`;
        }
    } catch (error) {
        console.error("Lỗi tải thông tin:", error);
        document.querySelector("main.container").innerHTML = `<p style="color:red; text-align:center;">${error.message}</p>`;
    }
}

/**
 * Tải xuống CV hiện tại
 */
window.downloadCV = function () {
    // API này không cần tên file vì backend đã biết file nào của candidateId
    window.location.href = `http://localhost:8081/job_portal/api/candidates/${CANDIDATE_ID}/download-cv`;
}

/**
 * Xóa CV hiện tại
 */
window.deleteCV = async function () {
    if (!confirm("Bạn có chắc chắn muốn xóa CV này không?")) {
        return;
    }
    try {
        const response = await fetch(`http://localhost:8081/job_portal/api/candidates/${CANDIDATE_ID}/cv`, {
            method: 'DELETE',
        });
        if (response.ok) {
            alert("Đã xóa CV thành công.");
            await loadCandidateInfo(); // Tải lại thông tin để cập nhật giao diện
        } else {
            throw new Error("Xóa CV thất bại.");
        }
    } catch (error) {
        alert("Đã xảy ra lỗi: " + error.message);
    }
}

// Gắn sự kiện cho nút tải lên
uploadBtn.onclick = () => {
    fileInput.click();
};

// Xử lý khi người dùng đã chọn xong file
fileInput.onchange = async () => {
    if (!fileInput.files.length) return;
    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append("file", file);

    try {
        uploadBtn.disabled = true;
        uploadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang tải lên...';
        const response = await fetch(`http://localhost:8081/job_portal/api/candidates/${CANDIDATE_ID}/upload-cv`, {
            method: "POST",
            body: formData,
        });
        if (response.ok) {
            alert("Tải lên CV thành công!");
            await loadCandidateInfo();
        } else {
            throw new Error(await response.text());
        }
    } catch (error) {
        alert("Lỗi tải lên: " + error.message);
    } finally {
        uploadBtn.disabled = false;
        uploadBtn.innerHTML = '<i class="fas fa-upload"></i> Tải lên hoặc thay thế CV';
        fileInput.value = "";
    }
};

// Xử lý nút logout
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
    logoutBtn.onclick = function (e) {
        e.preventDefault();
        localStorage.removeItem('currentUser'); // Xóa thông tin người dùng
        alert('Bạn đã đăng xuất.');
        window.location.href = 'login.html';
    }
}

// --- PHẦN 3: GỌI HÀM ĐỂ BẮT ĐẦU ---
loadCandidateInfo(); // Chạy hàm này ngay khi trang tải xong và người dùng đã đăng nhập

});