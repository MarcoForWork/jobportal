// Dữ liệu mẫu
let jobs = [
    { id: 1, title: 'Mobile Developer (JavaScript/ React Native)', company: 'DaoukiWoom Innovation', salary: '22.000.000 VNĐ to 45.000.000 VNĐ', location: 'Quận Bình Thạnh, Hồ Chí Minh', deadline: '2024-06-30' },
    { id: 2, title: 'Trưởng nhóm Kiểm thử', company: 'MSB', salary: 'Từ 5 triệu', location: 'Quận 1, Hồ Chí Minh', deadline: '2024-06-25' },
    { id: 3, title: 'Front-End Developer', company: 'Lala', salary: '12.000.000 VNĐ to 25.000.000 VNĐ', location: 'Quận 3, Hồ Chí Minh', deadline: '2024-07-10' }
];

let applicants = {
    1: [
        { name: 'Nguyễn Văn A', email: 'a@gmail.com', cv: 'CV-A.pdf', status: 'Chờ duyệt' },
        { name: 'Trần Thị B', email: 'b@gmail.com', cv: 'CV-B.pdf', status: 'Đã phỏng vấn' }
    ],
    2: [
        { name: 'Lê Văn C', email: 'c@gmail.com', cv: 'CV-C.pdf', status: 'Đã nhận' },
        { name: 'Phạm Thị D', email: 'd@gmail.com', cv: 'CV-D.pdf', status: 'Đã loại' }
    ],
    3: [
        { name: 'Bùi Quốc E', email: 'e@gmail.com', cv: 'CV-E.pdf', status: 'Chờ duyệt' }
    ]
};

const statusList = ['Chờ duyệt', 'Đã phỏng vấn', 'Đã loại', 'Đã nhận'];

function renderJobs() {
    const tbody = document.getElementById('jobListBody');
    tbody.innerHTML = '';
    jobs.forEach(job => {
        const tr = document.createElement('tr');
        tr.onclick = () => selectJob(job.id);
        tr.innerHTML = `
            <td>${job.title}</td>
            <td>${job.company}</td>
            <td>${job.salary}</td>
            <td>${job.location}</td>
            <td>${job.deadline}</td>
            <td style="text-align:center;">${(applicants[job.id] || []).length}</td>
        `;
        tr.setAttribute('data-jobid', job.id);
        tbody.appendChild(tr);
    });
}

function selectJob(jobId) {
    // Highlight row
    document.querySelectorAll('#jobListBody tr').forEach(tr => {
        tr.classList.toggle('selected-row', tr.getAttribute('data-jobid') == jobId);
    });

    // Hiện applicant section
    document.getElementById('applicantSection').style.display = '';
    const job = jobs.find(j => j.id == jobId);
    document.getElementById('currentJobTitle').textContent = job.title;

    // Hiện danh sách ứng viên
    renderApplicants(jobId);
}

function renderApplicants(jobId) {
    const tbody = document.getElementById('applicantList');
    const list = applicants[jobId] || [];
    if (!list.length) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:#888;">Chưa có ứng viên nào</td></tr>`;
        return;
    }
    tbody.innerHTML = list.map((a, idx) => `
        <tr>
            <td>${a.name}</td>
            <td>${a.email}</td>
            <td><a href="#">${a.cv}</a></td>
            <td>
                <select class="status-select" data-status="${a.status}" data-jobid="${jobId}" data-idx="${idx}">
                    ${statusList.map(st => `<option value="${st}" ${st === a.status ? 'selected' : ''}>${st}</option>`).join('')}
                </select>
            </td>
        </tr>
    `).join('');
    // Thêm sự kiện đổi trạng thái
    document.querySelectorAll('.status-select').forEach(select => {
        select.onchange = function () {
            const jobId = +this.getAttribute('data-jobid');
            const idx = +this.getAttribute('data-idx');
            applicants[jobId][idx].status = this.value;
            this.setAttribute('data-status', this.value);
        };
    });
}

renderJobs();

document.querySelector('.menu-toggle').onclick = function (e) {
    document.querySelector('.user-menu').classList.toggle('active');
    e.stopPropagation();
};
document.body.onclick = function (e) {
    if (!e.target.closest('.user-menu')) {
        document.querySelector('.user-menu').classList.remove('active');
    }
}
