const passwordInput = document.getElementById("password");
const togglePassword = document.getElementById("toggle-password");
const usernameInput = document.getElementById("username");

togglePassword.addEventListener("click", () => {
  const type = passwordInput.getAttribute("type");
  passwordInput.setAttribute("type", type === "password" ? "text" : "password");
});

/**
 * Hàm giải mã chuỗi JWT để lấy payload.
 * Lưu ý: Hàm này không xác minh chữ ký, chỉ giải mã.
 * Việc xác minh phải được thực hiện ở backend.
 * @param {string} token - Chuỗi JWT.
 * @returns {object|null} - Payload của JWT hoặc null nếu có lỗi.
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

async function handleLogin(event) {
  event.preventDefault();

  const username = usernameInput.value.trim();
  const password = passwordInput.value;

  if (!username || !password) {
    alert("Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.");
    return false;
  }

  const API_URL = "http://localhost:8080/jobportal/user/auths";

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    const apiResponse = await response.json();

    // --- BẮT ĐẦU PHẦN GỠ LỖI ---
    console.log("1. DỮ LIỆU NHẬN ĐƯỢC TỪ BACKEND:", apiResponse);

    if (
      apiResponse.code === 1000 &&
      apiResponse.result &&
      apiResponse.result.token
    ) {
      const token = apiResponse.result.token;
      console.log("2. LẤY ĐƯỢC TOKEN:", token);

      localStorage.setItem("authToken", token);

      const decodedToken = decodeJwt(token);
      console.log("3. ĐÃ GIẢI MÃ TOKEN THÀNH PAYLOAD:", decodedToken);

      // Dòng debugger sẽ tạm dừng script tại đây nếu Developer Tools đang mở
      debugger;

      if (!decodedToken || !decodedToken.role) {
        alert(
          "Vai trò người dùng không xác định. (Lỗi tại bước kiểm tra role)"
        );
        console.error(
          "Lỗi: decodedToken không hợp lệ hoặc không có thuộc tính 'role'.",
          decodedToken
        );
        return;
      }

      // Thêm .trim() để loại bỏ các khoảng trắng vô hình nếu có
      const userRole = decodedToken.role.trim().toLowerCase();
      console.log("4. VAI TRÒ NGƯỜI DÙNG CUỐI CÙNG:", userRole);

      if (userRole === "admin") {
        window.location.href = "admin.html";
      } else if (userRole === "recruiter") {
        window.location.href = "quanly.html";
      } else if (userRole === "candidate") {
        window.location.href = "candidate.html";
      } else {
        alert("Vai trò người dùng không xác định.");
      }
    } else {
      console.error("Backend không trả về token hoặc có lỗi:", apiResponse);
      alert("Đăng nhập thất bại: " + apiResponse.message);
    }
  } catch (error) {
    console.error("Lỗi đăng nhập:", error);
    alert("Đã xảy ra lỗi trong quá trình đăng nhập. Vui lòng thử lại.");
  }

  return false;
}
