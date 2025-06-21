document.addEventListener("DOMContentLoaded", function () {
  let currentUser = null;

  try {
    const storedUser = localStorage.getItem("currentUser");
    console.log("Giá trị đọc từ localStorage:", storedUser);

    if (storedUser) {
      currentUser = JSON.parse(storedUser);
    }
  } catch (error) {
    console.error("Lỗi khi parse dữ liệu người dùng:", error);
    localStorage.removeItem("currentUser");
  }

  if (!currentUser || !currentUser.id) {
    alert("Please log in first.");
    window.location.href = "login.html";
    return;
  }

  const CANDIDATE_ID = currentUser.id;

  const candidateNameEl = document.getElementById("candidateName");
  const candidateEmailEl = document.getElementById("candidateEmail");
  const cvDetailsEl = document.getElementById("cv-details");
  const fileInput = document.getElementById("cvFile");
  const uploadBtn = document.getElementById("uploadBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  async function loadCandidateInfo() {
    try {
      const response = await fetch(
        `http://localhost:8080/jobportal/api/candidates/${CANDIDATE_ID}`
      );
      if (!response.ok) {
        throw new Error("Không thể tải thông tin ứng viên.");
      }

      const candidate = await response.json();

      candidateNameEl.textContent = candidate.name || "Chưa có thông tin";
      candidateEmailEl.textContent = candidate.email || "Chưa có thông tin";

      if (candidate.cvFilePath) {
        cvDetailsEl.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <p style="margin: 0;"><strong>File:</strong> ${candidate.cvFilePath}</p>
                        <div>
                            <button class="action-btn" onclick="downloadCV()"><i class="fas fa-download"></i> Tải xuống</button>
                            <button class="action-btn" onclick="deleteCV()"><i class="fas fa-trash-alt"></i> Xóa</button>
                        </div>
                    </div>
                `;
      } else {
        cvDetailsEl.innerHTML = `<p style="color: gray;">Bạn chưa upload CV nào.</p>`;
      }
    } catch (error) {
      console.error("Lỗi:", error);
      document.querySelector(
        "main.container"
      ).innerHTML = `<p style="color:red; text-align:center;">${error.message}</p>`;
    }
  }

  window.downloadCV = function () {
    window.location.href = `http://localhost:8080/api/files/download/candidate/${CANDIDATE_ID}`;
  };

  window.deleteCV = async function () {
    if (!confirm("Bạn có chắc muốn xóa CV này không?")) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8080/api/files/candidate/${CANDIDATE_ID}/cv`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        alert("Xóa CV thành công.");
        await loadCandidateInfo();
      } else {
        throw new Error(await response.text());
      }
    } catch (error) {
      alert("Lỗi khi xóa CV: " + error.message);
    }
  };

  uploadBtn.onclick = () => {
    fileInput.click();
  };

  fileInput.onchange = async () => {
    if (!fileInput.files.length) return;

    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append("file", file);

    try {
      uploadBtn.disabled = true;
      uploadBtn.innerHTML =
        '<i class="fas fa-spinner fa-spin"></i> Đang tải lên...';

      const response = await fetch(
        `http://localhost:8080/api/files/upload/candidate/${CANDIDATE_ID}`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        alert("Tải lên CV thành công!");
        await loadCandidateInfo();
      } else {
        throw new Error(await response.text());
      }
    } catch (error) {
      alert("Lỗi khi upload CV: " + error.message);
    } finally {
      uploadBtn.disabled = false;
      uploadBtn.innerHTML =
        '<i class="fas fa-upload"></i> Upload or Replace CV';
      fileInput.value = "";
    }
  };

  if (logoutBtn) {
    logoutBtn.onclick = function (e) {
      e.preventDefault();
      localStorage.removeItem("currentUser");
      alert("Đăng xuất thành công.");
      window.location.href = "login.html";
    };
  }

  // Initial load
  loadCandidateInfo();
});
