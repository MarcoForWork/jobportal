document.addEventListener("DOMContentLoaded", function () {
    // ===============================================
    // Job Search & Display (phần bạn đã có)
    // ===============================================
    const jobs = [
        {
            title: "Frontend Developer",
            company: "Tech Solutions",
            location: "Hà Nội",
            salary: "$1000 - $1500"
        },
        {
            title: "Backend Developer",
            company: "Soft Vina",
            location: "TP.HCM",
            salary: "$1200 - $1800"
        },
        {
            title: "ReactJS Developer",
            company: "FastCode",
            location: "Remote",
            salary: "$1300+"
        }
    ];

    const jobListContainer = document.getElementById("jobList"); // Đổi tên biến để tránh nhầm lẫn
    const headerSearchInput = document.getElementById("headerSearchInput"); // ID của search input mới

    function displayJobs(filter = "") {
        // Ẩn các phần khác nếu có tìm kiếm
        if (filter.trim() !== "") {
            document.querySelector('.hot-jobs-section').style.display = 'none';
            document.querySelector('.popular-companies-section').style.display = 'none';
            jobListContainer.style.display = 'grid'; // Hiển thị jobList
        } else {
            document.querySelector('.hot-jobs-section').style.display = 'block';
            document.querySelector('.popular-companies-section').style.display = 'block';
            jobListContainer.style.display = 'none'; // Ẩn jobList khi không tìm kiếm
        }

        jobListContainer.innerHTML = "";

        const filteredJobs = jobs.filter(job =>
            job.title.toLowerCase().includes(filter.toLowerCase()) ||
            job.company.toLowerCase().includes(filter.toLowerCase()) ||
            job.location.toLowerCase().includes(filter.toLowerCase())
        );

        if (filteredJobs.length === 0) {
            jobListContainer.innerHTML = "<p style='text-align: center; color: #777;'>No jobs found.</p>";
            return;
        }

        filteredJobs.forEach(job => {
            const jobCard = document.createElement("div");
            jobCard.className = "job-card";
            jobCard.innerHTML = `
                <h3>${job.title}</h3>
                <p><strong>Company:</strong> ${job.company}</p>
                <p><strong>Location:</strong> ${job.location}</p>
                <p><strong>Salary:</strong> ${job.salary}</p>
            `;
            jobListContainer.appendChild(jobCard);
        });
    }

    // Gắn sự kiện tìm kiếm vào input mới
    headerSearchInput.addEventListener("input", () => {
        displayJobs(headerSearchInput.value);
    });

    displayJobs(""); // Load ban đầu không có filter, hiển thị các section chính

    // ===============================================
    // Bookmark Icons (phần bạn đã có)
    // ===============================================
    const bookmarkIcons = document.querySelectorAll('.bookmark-icon');
    bookmarkIcons.forEach(icon => {
        icon.addEventListener('click', () => {
            icon.classList.toggle('far');
            icon.classList.toggle('fas');
            // CSS sẽ tự động điều chỉnh màu sắc
        });
    });

    // ===============================================
    // Popular Companies Pagination (phần bạn đã có)
    // ===============================================
    const popularCompaniesDots = document.querySelectorAll('.pagination .dot');
    popularCompaniesDots.forEach(dot => {
        dot.addEventListener('click', () => {
            popularCompaniesDots.forEach(d => d.classList.remove('active'));
            dot.classList.add('active');
            // Chức năng chuyển trang thực tế sẽ cần thêm code ở đây
            console.log("Popular Companies Pagination dot clicked.");
        });
    });

    // ===============================================
    // Logout (phần bạn đã sửa)
    // ===============================================
    const logoutButton = document.getElementById("logout");
    if (logoutButton) {
        logoutButton.addEventListener("click", function (e) {
            e.preventDefault();
            console.log("Chuyển đến login.html");
            window.location.href = "login.html";
        });
    }

    // ===============================================
    // Hot Jobs Carousel (Cần thêm logic slide)
    // ===============================================
    const hotJobsCarousel = document.querySelector('.hot-jobs-carousel');
    const hotJobsGrid = document.querySelector('.hot-jobs-grid');
    const hotJobsDots = document.querySelectorAll('.carousel-dot');

    let currentIndex = 0;
    const cardsPerPage = 3; // Số thẻ hiển thị trên mỗi "trang" của carousel

    function updateCarousel() {
        const offset = -currentIndex * (hotJobsGrid.offsetWidth / cardsPerPage);
        hotJobsGrid.style.transform = `translateX(${offset}px)`;

        hotJobsDots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentIndex);
        });
    }

    hotJobsDots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            currentIndex = index;
            updateCarousel();
        });
    });

    // Initial update
    // updateCarousel(); // Bỏ comment nếu muốn carousel hoạt động ngay từ đầu

    // Simple forward arrow for hot jobs carousel (cần thêm arrow icon trong HTML)
    // const hotJobsArrow = document.querySelector('.hot-jobs-section .arrow-icon');
    // if (hotJobsArrow) {
    //     hotJobsArrow.addEventListener('click', () => {
    //         currentIndex = (currentIndex + 1) % hotJobsDots.length;
    //         updateCarousel();
    //     });
    // }
    //user_menu
    const toggle = document.querySelector(".menu-toggle");
    const dropdown = document.querySelector(".dropdown-menu");

    if (toggle && dropdown) {
        toggle.addEventListener("click", function (e) {
            e.stopPropagation();
            dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
        });

        document.addEventListener("click", function () {
            dropdown.style.display = "none";
        });
    }

});