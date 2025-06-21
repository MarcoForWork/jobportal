const passwordInput = document.getElementById("password");
const togglePassword = document.getElementById("toggle-password");
const usernameInput = document.getElementById("username");

togglePassword.addEventListener("click", () => {
    const type = passwordInput.getAttribute("type");
    passwordInput.setAttribute("type", type === "password" ? "text" : "password");
});

async function handleLogin(event) {
    event.preventDefault();

    const username = usernameInput.value;
    const password = passwordInput.value;

    if (!username || password.length == 0) {
        alert("Please enter valid credentials (password != 0 characters).");
        return false;
    }

    try {
        const response = await fetch("http://localhost:8080/jobportal/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, password })
        });

        if (response.ok) {
            window.location.href = "index.html";
        } else {
            const text = await response.text();
            alert("Login failed: " + text);
        }
    } catch (error) {
        console.error("Login error:", error);
        alert("An error occurred. Please try again.");
    }

    return false;
}
// ... (phần code đầu file giữ nguyên)

async function handleLogin(event) {
    event.preventDefault();
    const username = usernameInput.value;
    const password = passwordInput.value;

    if (!username || !password) {
        alert("Please enter both username and password.");
        return false;
    }

    try {
        const response = await fetch("http://localhost:8080/jobportal/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        if (response.ok) {
            const userData = await response.json();

            // --- BẮT ĐẦU PHẦN GỠ LỖI ---
            console.log("1. Dữ liệu nhận được từ backend:", userData);

            // Kiểm tra xem userData có hợp lệ không
            if (!userData || !userData.id) {
                alert("Lỗi: Dữ liệu người dùng từ server không hợp lệ!");
                console.error("Dữ liệu không hợp lệ:", userData);
                return;
            }

            // Lưu vào localStorage
            localStorage.setItem('currentUser', JSON.stringify(userData));

            console.log("2. Đã lưu vào localStorage. Kiểm tra tab Application -> Local Storage.");

            // Dòng debugger sẽ tạm dừng script, cho phép bạn kiểm tra
            debugger;

            // --- KẾT THÚC PHẦN GỠ LỖI ---

            alert("Login successful! Chuẩn bị chuyển trang...");

            const hasRecruiterRole = userData.roles.some(role => role.authority === 'RECRUITER');
            if (hasRecruiterRole) {
                window.location.href = "quanly.html";
            } else {
                window.location.href = "index.html";
            }
        } else {
            const text = await response.text();
            alert("Login failed: " + text);
        }
    } catch (error) {
        console.error("Login error:", error);
        alert("An error occurred. Please try again.");
    }
    return false;
}