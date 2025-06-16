let jobs = [
    { id: 1, title: 'Mobile Developer (JavaScript/ React Native)', company: 'DaoukiWoom Innovation', salary: '22.000.000 VNĐ to 45.000.000 VNĐ', location: 'Quận Bình Thạnh, Hồ Chí Minh', deadline: '2024-06-30', desc: 'Phát triển mobile app...' },
    { id: 2, title: 'Trưởng nhóm Kiểm thử', company: 'MSB', salary: 'Từ 5 triệu', location: 'Quận 1, Hồ Chí Minh', deadline: '2024-06-25', desc: 'Kiểm thử hệ thống ngân hàng...' }
];

let applicants = {
    1: [
        { name: 'Nguyễn Văn A', email: 'a@gmail.com', cv: 'CV-A.pdf' },
        { name: 'Trần Thị B', email: 'b@gmail.com', cv: 'CV-B.pdf' }
    ],
    2: [
        { name: 'Lê Văn C', email: 'c@gmail.com', cv: 'CV-C.pdf' }
    ]
};

function renderJobs() {
    const tbody = document.getElementById('jobList');
    if (jobs.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:#888">Chưa có tin tuyển dụng nào</td></tr>`;
        return;
    }
    tbody.innerHTML = jobs.map(job => `
      <tr>
        <td>${job.title}</td>
        <td>${job.company}</td>
        <td>${job.salary}</td>
        <td>${job.location}</td>
        <td>${job.deadline}</td>
        <td>
          <button class="action-btn edit" title="Sửa" onclick="editJob(${job.id})"><i class="fas fa-pen"></i></button>
          <button class="action-btn delete" title="Xoá" onclick="deleteJob(${job.id})"><i class="fas fa-trash-alt"></i></button>
          <button class="action-btn applicants" title="Xem ứng viên" onclick="showApplicants(${job.id})"><i class="fas fa-users"></i></button>
        </td>
      </tr>
    `).join('');
}

function openJobForm(isEdit = false, job = null) {
    document.getElementById('jobModal').style.display = 'flex';
    document.getElementById('modalTitle').textContent = isEdit ? 'Sửa tin tuyển dụng' : 'Đăng tin tuyển dụng';
    document.getElementById('jobForm').reset();
    document.getElementById('jobId').value = '';
    if (isEdit && job) {
        document.getElementById('jobId').value = job.id;
        document.getElementById('jobTitle').value = job.title;
        document.getElementById('jobCompany').value = job.company;
        document.getElementById('jobSalary').value = job.salary;
        document.getElementById('jobLocation').value = job.location;
        document.getElementById('jobDeadline').value = job.deadline;
        document.getElementById('jobDesc').value = job.desc;
    }
}
function closeJobForm() {
    document.getElementById('jobModal').style.display = 'none';
}
function submitJobForm(e) {
    e.preventDefault();
    const id = document.getElementById('jobId').value;
    const job = {
        id: id ? +id : Date.now(),
        title: document.getElementById('jobTitle').value,
        company: document.getElementById('jobCompany').value,
        salary: document.getElementById('jobSalary').value,
        location: document.getElementById('jobLocation').value,
        deadline: document.getElementById('jobDeadline').value,
        desc: document.getElementById('jobDesc').value
    };
    if (id) {
        jobs = jobs.map(j => j.id === +id ? job : j);
    } else {
        jobs.push(job);
    }
    closeJobForm();
    renderJobs();
}
function editJob(id) {
    const job = jobs.find(j => j.id === id);
    if (job) openJobForm(true, job);
}
function deleteJob(id) {
    if (confirm('Bạn chắc chắn muốn xoá tin này?')) {
        jobs = jobs.filter(j => j.id !== id);
        renderJobs();
    }
}
function showApplicants(jobId) {
    const list = applicants[jobId] || [];
    const tbody = document.getElementById('applicantList');
    if (!list.length) {
        tbody.innerHTML = `<tr><td colspan="3" style="color:#888;text-align:center;">Chưa có ứng viên nào</td></tr>`;
    } else {
        tbody.innerHTML = list.map(a => `
        <tr>
          <td>${a.name}</td>
          <td>${a.email}</td>
          <td><a href="#">${a.cv}</a></td>
        </tr>
      `).join('');
    }
    document.getElementById('applicantsModal').style.display = 'flex';
}
function closeApplicantsModal() {
    document.getElementById('applicantsModal').style.display = 'none';
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

