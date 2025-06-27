// Biến toàn cục để lưu trữ tất cả các bài đăng việc làm đã tải xuống để lọc phía client
let allJobPostings = [];

// Search
function searchJobs() {
  const searchInput = document.getElementById("mainSearchInput");
  const query = searchInput.value.trim().toLowerCase(); // Get query and convert to lowercase for case-insensitive search

  let filteredJobs = [];

  if (query) {
    console.log(`Searching for: "${query}"`);
    // Filter jobs dựa trên title, company name, or tags
    filteredJobs = allJobPostings.filter((job) => {
      const title = (job.title || "").toLowerCase();
      const companyName = (job.companyName || "").toLowerCase();
      const tags = (job.tags || []).map((tag) => tag.toLowerCase()).join(" "); // Join tags into a single string

      return (
        title.includes(query) ||
        companyName.includes(query) ||
        tags.includes(query)
      );
    });

    if (filteredJobs.length === 0) {
      // If no results, show a message in both sections
      renderJobsToContainer(
        document.getElementById("hotJobsGrid"),
        [],
        "No jobs found matching your search criteria."
      );
      renderJobsToContainer(
        document.getElementById("popularCompaniesGrid"),
        [],
        "No jobs found matching your search criteria."
      );
    } else {
      renderJobsToContainer(
        document.getElementById("hotJobsGrid"),
        filteredJobs,
        null,
        true
      ); // Keep hot badge for filtered results in hot section
      renderJobsToContainer(
        document.getElementById("popularCompaniesGrid"),
        filteredJobs
      );
    }
  } else {
    splitAndRenderJobs(allJobPostings);
  }
}

async function fetchAndRenderJobPostings() {
  const hotJobsGrid = document.getElementById("hotJobsGrid");
  const popularCompaniesGrid = document.getElementById("popularCompaniesGrid");
  const hotJobsLoading = document.getElementById("hotJobsLoading");
  const popularCompaniesLoading = document.getElementById(
    "popularCompaniesLoading"
  );

  if (hotJobsLoading) hotJobsLoading.style.display = "block";
  if (popularCompaniesLoading) popularCompaniesLoading.style.display = "block";

  hotJobsGrid.innerHTML = "";
  popularCompaniesGrid.innerHTML = "";

  const API_URL = "http://localhost:8080/jobportal/api/jobpostings";

  try {
    const response = await fetch(API_URL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `HTTP error! Status: ${response.status}, Message: ${errorData.message || "Unknown error"
        }`
      );
    }

    const jobPostings = await response.json();
    console.log("Fetched Job Postings:", jobPostings);

    allJobPostings = jobPostings;

    splitAndRenderJobs(allJobPostings);
  } catch (error) {
    console.error("Error fetching job postings:", error);
    hotJobsGrid.innerHTML = `<p class="loading-message error-message">Failed to load jobs: ${error.message}. Please try again later.</p>`;
    popularCompaniesGrid.innerHTML = `<p class="loading-message error-message">Failed to load companies: ${error.message}. Please try again later.</p>`;
  } finally {
    if (hotJobsLoading) hotJobsLoading.style.display = "none";
    if (popularCompaniesLoading) popularCompaniesLoading.style.display = "none";
  }
}

/**
 * Splits the jobs into 'hot' and 'popular' categories and renders them.
 * @param {Array<object>} allJobs - The complete list of job posting objects.
 */
function splitAndRenderJobs(allJobs) {
  const hotJobsGrid = document.getElementById("hotJobsGrid");
  const popularCompaniesGrid = document.getElementById("popularCompaniesGrid");

  hotJobsGrid.innerHTML = "";
  popularCompaniesGrid.innerHTML = "";

  const HOT_JOBS_COUNT = 3;

  const hotJobs = allJobs.slice(0, HOT_JOBS_COUNT);
  const popularJobs = allJobs.slice(HOT_JOBS_COUNT);

  if (allJobs.length === 0) {
    const message = "No jobs available at the moment.";
    hotJobsGrid.innerHTML = `<p class="loading-message">${message}</p>`;
    popularCompaniesGrid.innerHTML = `<p class="loading-message">${message}</p>`;
    return;
  }

  if (hotJobs.length > 0) {
    renderJobsToContainer(hotJobsGrid, hotJobs, null, true); // Pass true for isHot
  } else {
    hotJobsGrid.innerHTML =
      '<p class="loading-message">No super hot jobs available right now.</p>';
  }

  if (popularJobs.length > 0) {
    renderJobsToContainer(popularCompaniesGrid, popularJobs);
  } else if (allJobs.length > 0 && hotJobs.length === allJobs.length) {
    popularCompaniesGrid.innerHTML =
      '<p class="loading-message">All available jobs are currently listed as hot jobs.</p>';
  } else {
    popularCompaniesGrid.innerHTML =
      '<p class="loading-message">No popular companies to display at the moment.</p>';
  }
}

/**
 * @param {HTMLElement} containerElement
 * @param {Array<object>} jobsToRender
 * @param {string} [noResultsMessage]
 * @param {boolean} [isHotSection=false]
 */
function renderJobsToContainer(
  containerElement,
  jobsToRender,
  noResultsMessage = "",
  isHotSection = false
) {
  containerElement.innerHTML = "";

  if (jobsToRender.length === 0) {
    const message = noResultsMessage || "No jobs available.";
    containerElement.innerHTML = `<p class="loading-message">${message}</p>`;
    return;
  }

  jobsToRender.forEach((job) => {
    const jobCard = createJobCard(job, isHotSection);
    containerElement.appendChild(jobCard);
  });
}

/**
 * @param {object} job
 * @param {boolean} isHot
 * @returns {HTMLElement}
 */
function createJobCard(job, isHot = false) {
  const card = document.createElement("div");
  card.classList.add("company-card");

  const companyLogoUrl = `https://placehold.co/40x40/e0e0e0/333333?text=${job.companyName ? job.companyName.charAt(0).toUpperCase() : "?"
    }`;

  card.innerHTML = `
        <div class="card-header">
            <img src="${companyLogoUrl}" alt="${job.companyName || "Company"
    } Logo" class="company-logo">
            ${isHot ? '<span class="hot-badge">HOT!</span>' : ""
    } <!-- Conditional HOT! badge -->
            <i class="far fa-bookmark bookmark-icon"></i>
        </div>
        <div class="card-body">
            <h3 class="job-title">${job.title || "Job Title Not Available"}</h3>
            <p class="company-name">${job.companyName || "Company Name Not Available"
    }</p>
            <p class="salary">${job.salary ? `${job.salary} VNĐ` : "Negotiable"
    }</p>
            <p class="location"><i class="fas fa-map-marker-alt" style="margin-right: 5px;"></i>${job.location || "Location Not Available"
    }</p>
            <div class="tags">
                ${job.tags && job.tags.length > 0
      ? job.tags
        .map((tag) => `<span class="tag">${tag}</span>`)
        .join("")
      : '<span class="tag">No Tags</span>'
    }
            </div>
        </div>
    `;
  return card;
}

document.addEventListener("DOMContentLoaded", fetchAndRenderJobPostings);
