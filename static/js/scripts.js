// Base API URL
const apiBase = "http://127.0.0.1:5000/api";
let currentCampaignId = null;
let currentShortCode = null;

// Initialize Bootstrap tooltips
document.addEventListener('DOMContentLoaded', function () {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.forEach(function (tooltipTriggerEl) {
        new bootstrap.Tooltip(tooltipTriggerEl);
    });
});

// DOM Elements
const menuSection = document.getElementById("menuSection");
const campaignListSection = document.getElementById("campaignListSection");
const campaignCreationSection = document.getElementById("campaignCreationSection");
const campaignEditSection = document.getElementById("campaignEditSection");
const editCampaignForm = document.getElementById("editCampaignForm");
const backToCampaignsFromEdit = document.getElementById("backToCampaignsFromEdit");
const feedbackCreationSection = document.getElementById("feedbackCreationSection");
const thankYouSection = document.getElementById("thankYouSection");
const feedbackListSection = document.getElementById("feedbackListSection");
const campaignTableBody = document.querySelector("#campaignTable tbody");
const createCampaignForm = document.getElementById("createCampaignForm");
const submitFeedbackBtn = document.getElementById("submitFeedbackBtn");
const feedbackMessage = document.getElementById("feedbackMessage");
const feedbackCards = document.getElementById("feedbackCards");
const returnToCampaignsBtn = document.getElementById("returnToCampaigns");
const backToCampaignsBtn = document.getElementById("backToCampaigns");
const viewCampaignsBtn = document.getElementById("viewCampaignsBtn");
const backToMenuFromList = document.getElementById("backToMenuFromList");
const backToCampaignsFromCreate = document.getElementById("backToCampaignsFromCreate");
const unlimitedAnswersCheckbox = document.getElementById("unlimitedAnswers");
const maxAnswersInput = document.getElementById("maxAnswers");
const editUnlimitedAnswersCheckbox = document.getElementById("editUnlimitedAnswers");
const editMaxAnswersInput = document.getElementById("editMaxAnswers");
const viewDashboardsBtn = document.getElementById("manageDashboardsBtn");
const dashboardListSection = document.getElementById("dashboardListSection");
const dashboardTableBody = document.querySelector("#dashboardTable tbody");
const addNewDashboardBtn = document.getElementById("addNewDashboardBtn");
const backToMenuFromDashboards = document.getElementById("backToMenuFromDashboards");
const dashboardCreationSection = document.getElementById("dashboardCreationSection");
const addDashboardForm = document.getElementById("addDashboardForm");
const newDashboardCampaignIds = document.getElementById("newDashboardCampaignIds");
const componentsContainer = document.getElementById("componentsContainer");
const addComponentBtn = document.getElementById("addComponentBtn");
const cancelAddDashboard = document.getElementById("cancelAddDashboard");
const dashboardEditSection = document.getElementById("dashboardEditSection");
const editDashboardForm = document.getElementById("editDashboardForm");
const editDashboardId = document.getElementById("editDashboardId");
const editDashboardName = document.getElementById("editDashboardName");
const editDashboardDescription = document.getElementById("editDashboardDescription");
const editDashboardCampaignIds = document.getElementById("editDashboardCampaignIds");
const editComponentsContainer = document.getElementById("editComponentsContainer");
const addEditComponentBtn = document.getElementById("addEditComponentBtn");
const cancelEditDashboard = document.getElementById("cancelEditDashboard");
const renderDashboardsSection = document.getElementById("renderDashboardsSection");
const analyzePendingFeedbacksOnFeedbacks = document.getElementById("analyzePendingFeedbacksOnFeedbacks");
const analyzePendingFeedbacksOnDashboard = document.getElementById("analyzePendingFeedbacksOnDashboard");

const loadingOverlay = document.getElementById("loadingOverlay");

// Show loading overlay
function showLoading() {
    loadingOverlay.classList.remove("hidden");
}

// Hide loading overlay
function hideLoading() {
    loadingOverlay.classList.add("hidden");
}

// Initialize dropdown hover behavior
document.addEventListener('DOMContentLoaded', function () {
    const dropdowns = document.querySelectorAll('.navbar .dropdown');

    dropdowns.forEach(dropdown => {
        dropdown.addEventListener('mouseover', function () {
            const dropdownMenu = this.querySelector('.dropdown-menu');
            if (dropdownMenu) {
                dropdown.classList.add('show');
                dropdownMenu.classList.add('show');
            }
        });

        dropdown.addEventListener('mouseout', function () {
            const dropdownMenu = this.querySelector('.dropdown-menu');
            if (dropdownMenu) {
                dropdown.classList.remove('show');
                dropdownMenu.classList.remove('show');
            }
        });
    });
});

// Handle unlimited answers checkbox behavior
unlimitedAnswersCheckbox.addEventListener("change", () => {
    if (unlimitedAnswersCheckbox.checked) {
        maxAnswersInput.value = "";
        maxAnswersInput.placeholder = "There will be no limit to responses";
        maxAnswersInput.setAttribute("disabled", "true");
    } else {
        maxAnswersInput.placeholder = maxAnswersInput.getAttribute("data-original-placeholder") || "";
        maxAnswersInput.removeAttribute("disabled");
    }
});

// Handle edit unlimited answers checkbox behavior
editUnlimitedAnswersCheckbox.addEventListener("change", () => {
    if (editUnlimitedAnswersCheckbox.checked) {
        editMaxAnswersInput.value = "";
        editMaxAnswersInput.placeholder = "There will be no limit to responses";
        editMaxAnswersInput.setAttribute("disabled", "true");
    } else {
        editMaxAnswersInput.placeholder = editMaxAnswersInput.getAttribute("data-original-placeholder") || "";
        editMaxAnswersInput.removeAttribute("disabled");
    }
});

// Override fetch to show/hide loading overlay
const originalFetch = window.fetch;
window.fetch = async function (...args) {
    showLoading();
    try {
        const response = await originalFetch(...args);
        return response;
    } catch (error) {
        throw error;
    } finally {
        hideLoading();
    }
};

// Initialize Switchery instances
const editSwitches = Array.prototype.slice.call(document.querySelectorAll('.switchery'));
let editSwitcheryInstances = [];
editSwitches.forEach(function (html) {
    editSwitcheryInstances.push(new Switchery(html));
});

// Show/Hide sections
function showSection(section) {
    // Change page title based on section
    document.title = `${section.getAttribute("data-title")} — WAVE`;
    [menuSection, campaignListSection, campaignCreationSection, campaignEditSection, feedbackCreationSection, thankYouSection, feedbackListSection, dashboardListSection, dashboardCreationSection, dashboardEditSection, renderDashboardsSection]
        .forEach(s => s.classList.add("hidden"));
    section.classList.remove("hidden");
    if (section === menuSection) {
        loadDashboardMetrics();
    }
}

// Load campaigns on initial load
async function loadCampaigns() {
    campaignTableBody.innerHTML = "";
    const res = await fetch(`${apiBase}/campaigns?offset=0&limit=10`);
    const data = await res.json();
    await loadCampaignsTable(data.items, data.total);
}

// Populate campaigns table
async function loadCampaignsTable(campaigns, total) {
    campaigns.forEach(campaign => {
        const row = document.createElement("tr");
        row.classList.add("align-middle");
        row.innerHTML = `
        <td>${campaign.name}</td>
        <td>${campaign.description || ""}</td>
        <td class="text-center">
            ${campaign.active
                ? '<span class="badge bg-success cursor-help" data-bs-toggle="tooltip" title="This campaign is active and can receive responses."><i class="fas fa-check-circle"></i> Active</span>'
                : '<span class="badge bg-danger cursor-help" data-bs-toggle="tooltip" title="This campaign is inactive and cannot receive responses."><i class="fas fa-times-circle"></i> Inactive</span>'}
        </td>
        <td class="text-center">
            ${campaign.multiple_answers_from_user
                ? '<span class="badge bg-success cursor-help" data-bs-toggle="tooltip" title="Multiple answers are allowed without verifying identity."><i class="fas fa-user-check"></i> Allowed</span>'
                : '<span class="badge bg-danger cursor-help" data-bs-toggle="tooltip" title="Restricts to one answer per user by verifying identity using IP."><i class="fas fa-user-shield"></i> Restricted</span>'}
        </td>
        <td class="text-center">
            ${campaign.max_answers
                ? campaign.max_answers
                : '<span class="badge bg-success">Unlimited</span>'}
        </td>
        <td class="text-center"><button class="btn btn-sm btn-primary" data-action="show_feedbacks" data-id="${campaign.id}"><i class="fas fa-comments fa-fw"></i> ${campaign.feedback_count}</button></td>
        <td class="text-center">
            <div class="btn-group" role="group" aria-label="Campaign Actions">
                <button class="btn btn-sm btn-success me-1" data-action="copy_shortcode" data-shortcode="${campaign.short_code}"><i class="fas fa-link fa-fw"></i> Link</button>
                <button class="btn btn-sm btn-warning me-1" data-action="edit_campaign" data-id="${campaign.id}"><i class="fas fa-edit fa-fw"></i> Edit</button>
                <button class="btn btn-sm btn-danger" data-action="delete_campaign" data-id="${campaign.id}"><i class="fas fa-trash fa-fw"></i> Delete</button>
            </div>
        </td>`;
        campaignTableBody.appendChild(row);

        const tooltipTriggerList = [].slice.call(row.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.forEach(function (tooltipTriggerEl) {
            new bootstrap.Tooltip(tooltipTriggerEl);
        });

        // Copy campaign URL to clipboard
        row.querySelector("[data-action=copy_shortcode]").addEventListener("click", (e) => {
            const button = e.currentTarget; // Ensure we get the button element
            const shortCode = button.getAttribute("data-shortcode");
            if (shortCode) {
            const origin = window.location.href.split('/').slice(0, -1).join('/') + '/' + 'index.html';
            navigator.clipboard.writeText(`${origin}?s=${shortCode}`);
            Swal.fire({
                iconHtml: '<i class="fas fa-link text-success"></i>',
                title: 'Campaign URL Copied',
                text: 'The campaign URL has been copied to your clipboard.',
                showCancelButton: true,
                confirmButtonText: 'Go to Campaign',
                cancelButtonText: 'Back',
                customClass: {
                confirmButton: 'btn btn-primary mx-2',
                cancelButton: 'btn btn-secondary mx-2'
                },
                buttonsStyling: false
            }).then((result) => {
                if (result.isConfirmed) {
                verifyShortCode(shortCode);
                }
            });
            } else {
            Swal.fire({
                iconHtml: '<i class="fas fa-exclamation-triangle text-warning"></i>',
                title: 'Shortcode Error',
                text: 'Shortcode is missing or invalid.',
                showConfirmButton: true
            });
            }
        });

        // View feedbacks button
        row.querySelector("[data-action=show_feedbacks]").addEventListener("click", () => {
            currentCampaignId = campaign.id;
            showFeedbackList(campaign.id);
        });

        // Edit button
        row.querySelector("[data-action=edit_campaign]").addEventListener("click", () => {
            editCampaign(campaign.id);
        });

        // Delete button
        row.querySelector("[data-action=delete_campaign]").addEventListener("click", function () {
            const campaignId = campaign.id;
            Swal.fire({
                iconHtml: '<i class="fas fa-trash text-danger"></i>',
                title: 'Delete Campaign',
                html: `<b>Name: ${campaign.name}</b><br><br>This action cannot be undone!`,
                showCancelButton: true,
                confirmButtonText: 'Yes, Delete',
                cancelButtonText: 'Cancel',
                focusConfirm: false,
                customClass: {
                    icon: 'no-icon',
                    confirmButton: 'btn btn-danger mx-2',
                    cancelButton: 'btn btn-secondary mx-2'
                },
                buttonsStyling: false
            }).then((result) => {
                if (result.isConfirmed) {
                    deleteCampaign(campaignId);
                }
            });
        });
    });
}

// Create new campaign
createCampaignForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const bodyObj = {
        name: document.getElementById("campaignName").value,
        description: document.getElementById("campaignDescription").value,
        active: document.getElementById("campaignActive").checked,
        multiple_answers_from_user: document.getElementById("multipleAnswers").checked,
        max_answers: document.getElementById("unlimitedAnswers").checked ? 0 : parseInt(document.getElementById("maxAnswers").value) || 0
    };
    await fetch(`${apiBase}/campaign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyObj)
    });
    createCampaignForm.reset();
    loadCampaigns();
    showSection(campaignListSection);
});
// Handle edit campaign form submission
editCampaignForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    Swal.fire({
        iconHtml: '<i class="fas fa-save text-warning"></i>',
        title: 'Update Campaign',
        text: 'Are you sure you want to update this campaign?',
        showCancelButton: true,
        confirmButtonText: 'Yes, Update',
        cancelButtonText: 'Cancel',
        focusConfirm: false,
        customClass: {
            icon: 'no-icon',
            confirmButton: 'btn btn-warning mx-2',
            cancelButton: 'btn btn-secondary mx-2'
        },
        buttonsStyling: false
    }).then((result) => {
        if (result.isConfirmed) {
            editCampaignSubmit();
        }
    });
});

// Submit the edited campaign data
async function editCampaignSubmit() {
    const campaignId = document.getElementById('editCampaignId').value;
    const name = document.getElementById('editCampaignName').value;
    const maxAnswers = document.getElementById('editUnlimitedAnswers').checked ? 0 : parseInt(document.getElementById('editMaxAnswers').value) || 0;

    // Validate campaign name
    if (name.length < 3 || name.length > 255) {
        document.getElementById('editCampaignName').classList.add('is-invalid');
        return;
    } else {
        document.getElementById('editCampaignName').classList.remove('is-invalid');
    }

    // Validate max answers
    try {
        const res = await fetch(`${apiBase}/campaign/${campaignId}`);
        const currentCampaign = await res.json();

        if (maxAnswers !== 0 && maxAnswers < currentCampaign.feedback_count) {
            document.getElementById('editMaxAnswers').classList.add('is-invalid');
            return;
        } else {
            document.getElementById('editMaxAnswers').classList.remove('is-invalid');
        }

        // If all validations pass, update the campaign
        const bodyObj = {
            name: name,
            description: document.getElementById('editCampaignDescription').value,
            active: document.getElementById('editCampaignActive').checked,
            multiple_answers_from_user: document.getElementById('editMultipleAnswers').checked,
            max_answers: maxAnswers
        };

        const response = await fetch(`${apiBase}/campaign/${campaignId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bodyObj)
        });

        if (response.ok) {
            loadCampaigns();
            showSection(campaignListSection);
        }
    } catch (error) {
        console.error('Error updating campaign:', error);
        Swal.fire('Error', 'Failed to update campaign', 'error');
    }
}

// Analyze all feedbacks for a specific campaign
analyzePendingFeedbacksOnFeedbacks.addEventListener("click", async () => {
    const res = await fetch(`${apiBase}/feedback/analyze-all`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaign_ids: [currentCampaignId] })
    });

    if (res.ok) {
        const data = await res.json();
        Swal.fire({
            title: 'Analysis Started',
            text: `${data.message}`,
            icon: 'success',
            showConfirmButton: false,
            timer: 2000
        });

        // Show progress
        const progressInterval = setInterval(async () => {
            const progressRes = await fetch(`${apiBase}/feedback/progress`);
            if (progressRes.ok) {
                const progressData = await progressRes.json();
                const queueSize = progressData.queue_size;
                const processing = progressData.processing;

                if (queueSize === 0 && processing === 0) {
                    clearInterval(progressInterval);
                    Swal.fire('Completed', 'All feedbacks have been analyzed.', 'success');
                } else {
                    Swal.update({
                        title: 'Analyzing Feedbacks',
                        html: `Feedbacks in queue: ${queueSize}<br>Currently processing: ${processing}`,
                        icon: 'info',
                        showConfirmButton: false
                    });
                }
            } else {
                clearInterval(progressInterval);
                Swal.fire('Error', 'Failed to fetch progress.', 'error');
            }
        }, 2000);
    } else {
        const errorData = await res.json();
        Swal.fire('Error', errorData.message || 'Failed to analyze feedbacks.', 'error');
    }
});

// Analyze all feedbacks for campaigns in a dashboard
analyzePendingFeedbacksOnDashboard.addEventListener("click", async () => {
    const campaignIds = document.getElementById("renderedDashboardCampaignIds").textContent.split(", ").map(Number);
    const dashboardId = document.getElementById("renderedDashboardId").textContent;

    const res = await fetch(`${apiBase}/feedback/analyze-all`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaign_ids: campaignIds })
    });

    if (res.ok) {
        const data = await res.json();
        Swal.fire({
            title: 'Analysis Started',
            text: `${data.message}`,
            icon: 'success',
            showConfirmButton: false,
            timer: 2000
        });

        // Show progress
        const progressInterval = setInterval(async () => {
            const progressRes = await fetch(`${apiBase}/feedback/progress`);
            if (progressRes.ok) {
                const progressData = await progressRes.json();
                const queueSize = progressData.queue_size;
                const processing = progressData.processing;

                if (queueSize === 0 && processing === 0) {
                    clearInterval(progressInterval);
                    Swal.fire({
                        title: 'Analysis Completed',
                        text: 'All feedbacks have been analyzed successfully.',
                        icon: 'success',
                        confirmButtonText: 'Reload Dashboard'
                    }).then(() => {
                        accessDashboard(dashboardId);
                    });
                } else {
                    Swal.update({
                        title: 'Analyzing Feedbacks',
                        html: `Feedbacks in queue: ${queueSize}<br>Currently processing: ${processing}`,
                        icon: 'info',
                        showConfirmButton: false
                    });
                }
            } else {
                clearInterval(progressInterval);
                Swal.fire('Error', 'Failed to fetch progress.', 'error');
            }
        }, 2000);
    } else {
        const errorData = await res.json();
        Swal.fire('Error', errorData.message || 'Failed to analyze feedbacks.', 'error');
    }
});

// Show feedback list for a specific campaign
async function showFeedbackList(campaignId, page = 1) {
    feedbackCards.innerHTML = "";
    const offset = (page - 1) * 12;
    const resFeedbacks = await fetch(`${apiBase}/feedbacks?offset=${offset}&limit=12`);
    const feedbackData = await resFeedbacks.json();
    const filtered = feedbackData.items.filter(f => f.campaign_id === campaignId);

    if (filtered.length === 0) {
        feedbackCards.innerHTML = "<p>No feedbacks found.</p>";
        showSection(feedbackListSection);
        return;
    }

    const sentimentColors = {
        positive: "#28a745",
        neutral: "#ffc107",
        negative: "#dc3545"
    };

    const languageNames = {
        pt: "Portuguese",
        en: "English",
        es: "Spanish",
        fr: "French",
        de: "German"
    };

    filtered.forEach(fdbk => {
        const col = document.createElement("div");
        col.className = "col";
        const card = document.createElement("div");
        card.className = "card h-100";
        card.innerHTML = `
          <div class="card-body d-flex flex-column">
            <p class="card-text flex-grow-1">${fdbk.message}</p>
            <hr>
            <button class="btn btn-sm btn-info mb-2"><i class="fas fa-chart-line"></i> Analyze</button>
            <div class="analysis-result"></div>
          </div>`;
        col.appendChild(card);
        feedbackCards.appendChild(col);

        const analyzeBtn = card.querySelector("button");
        const resultDiv = card.querySelector(".analysis-result");
        analyzeBtn.addEventListener("click", async () => {
            const analyzeRes = await fetch(`${apiBase}/feedback/analyze`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ feedback_id: fdbk.id })
            });
            const analyzeData = await analyzeRes.json();
            if (analyzeRes.status === 201 || analyzeRes.status === 200) {
                const sentimentColor = analyzeData.sentiment > 0 ? sentimentColors.positive :
                    analyzeData.sentiment < 0 ? sentimentColors.negative : sentimentColors.neutral;
                const languageName = languageNames[analyzeData.detected_language] || analyzeData.detected_language;

                resultDiv.innerHTML = `
              <hr>
              <p class="text-capitalize d-flex justify-content-between">
                <span style="color: ${sentimentColor};">${analyzeData.sentiment_category}</span>
                <span>${'<i class="fas fa-star text-warning"></i>'.repeat(analyzeData.star_rating)}</span>
              </p>
              <p><i class="fas fa-language"></i> Language: ${languageName}</p>
              <div id="sentimentRadialChart${fdbk.id}" style="height: 300px;"></div>
            `;

                // Create a radial bar chart for sentiment analysis
                const options = {
                    chart: {
                        type: 'radialBar',
                        height: 300
                    },
                    series: [Math.abs(analyzeData.sentiment) * 100],
                    labels: ['Sentiment'],
                    colors: [sentimentColor],
                    plotOptions: {
                        radialBar: {
                            dataLabels: {
                                name: {
                                    fontSize: '16px'
                                },
                                value: {
                                    fontSize: '14px',
                                    formatter: val => `${val.toFixed(2)}%`
                                }
                            },
                            hollow: {
                                size: '50%'
                            }
                        }
                    }
                };

                const chart = new ApexCharts(document.querySelector(`#sentimentRadialChart${fdbk.id}`), options);
                chart.render();
            } else {
                resultDiv.innerHTML = "<p><i class='fas fa-exclamation-triangle'></i> Error analyzing feedback.</p>";
            }
        });
    });

    // Remove existing pagination controls if present
    const existingPaginationControls = document.querySelector(".pagination-controls");
    if (existingPaginationControls) {
        existingPaginationControls.remove();
    }

    // Add pagination controls
    const paginationControls = document.createElement("div");
    paginationControls.className = "pagination-controls mt-3";
    paginationControls.innerHTML = `
        <button class="btn btn-sm btn-secondary me-2" ${page === 1 ? "disabled" : ""} id="prevPage">Previous</button>
        <button class="btn btn-sm btn-secondary" ${filtered.length < 12 ? "disabled" : ""} id="nextPage">Next</button>
    `;
    feedbackCards.insertAdjacentElement("afterend", paginationControls);

    document.getElementById("prevPage").addEventListener("click", () => showFeedbackList(campaignId, page - 1));
    document.getElementById("nextPage").addEventListener("click", () => showFeedbackList(campaignId, page + 1));

    showSection(feedbackListSection);
}
// Edit campaign
async function editCampaign(campaignId) {
    try {
        const res = await fetch(`${apiBase}/campaign/${campaignId}`);
        const campaign = await res.json();

        // Fill the form
        document.getElementById('editCampaignId').value = campaignId;
        document.getElementById('editCampaignName').value = campaign.name;
        document.getElementById('editCampaignDescription').value = campaign.description;
        document.getElementById('editCampaignActive').checked = campaign.active;
        document.getElementById('editMultipleAnswers').checked = campaign.multiple_answers_from_user;
        document.getElementById('editUnlimitedAnswers').checked = campaign.max_answers === 0;

        // Set max answers input value
        if (campaign.max_answers !== 0) {
            document.getElementById('editMaxAnswers').value = campaign.max_answers;
        } else {
            document.getElementById('editMaxAnswers').value = "";
        }

        // Update Switchery instances
        editSwitcheryInstances.forEach(switchery => {
            switchery.setPosition();
            switchery.handleOnchange(true);
        });

        showSection(campaignEditSection);
    } catch (error) {
        console.error('Error loading campaign:', error);
    }
}

// Delete campaign
async function deleteCampaign(campaignId) {
    await fetch(`${apiBase}/campaign/${campaignId}`, {
        method: "DELETE"
    });
    loadCampaigns();
}

// Handle short_code in URL
function checkShortCode() {
    const params = new URLSearchParams(window.location.search);
    const sc = params.get("s");
    if (sc) {
        currentShortCode = sc;
        verifyShortCode(sc);
    }
}

// Verify short_code and show feedback creation
async function verifyShortCode(sc) {
    // Fetch the campaign that matches the short_code
    const res = await fetch(`${apiBase}/campaign/short_code/${sc}`);

    if (res.ok) {
        const data = await res.json();
        currentCampaignId = data.id;
        document.getElementById("campaignTitle").textContent = data.name;
        document.getElementById("campaignDescription").textContent = data.description;
        showSection(feedbackCreationSection);
    } else {
        Swal.fire('Error', 'Failed to verify short code', 'error');
    }
}

// Submit feedback
submitFeedbackBtn.addEventListener("click", async () => {
    const bodyObj = {
        campaign_id: currentCampaignId,
        message: feedbackMessage.value
    };
    const res = await fetch(`${apiBase}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyObj)
    });
    if (res.status === 201) {
        feedbackMessage.value = "";
        showSection(thankYouSection);
    }
});

// Load Dashboards
async function loadDashboards() {
    dashboardTableBody.innerHTML = "";
    const res = await fetch(`${apiBase}/dashboards?offset=0&limit=10`);
    const data = await res.json();
    data.items.forEach(dashboard => {
        const row = document.createElement("tr");
        row.classList.add("align-middle");
        row.innerHTML = `
        <td>${dashboard.name}</td>
        <td>${dashboard.description || ""}</td>
        <td class="text-center">
            <div class="btn-group" role="group" aria-label="Dashboard Actions">
                <button class="btn btn-sm btn-primary me-1" data-action="access_dashboard" data-id="${dashboard.id}">
                    <i class="fas fa-eye fa-fw"></i> Access
                </button>
                <button class="btn btn-sm btn-warning me-1" data-action="edit_dashboard" data-id="${dashboard.id}">
                    <i class="fas fa-edit fa-fw"></i> Edit
                </button>
                <button class="btn btn-sm btn-danger" data-action="delete_dashboard" data-id="${dashboard.id}">
                    <i class="fas fa-trash fa-fw"></i> Delete
                </button>
            </div>
        </td>`;
        dashboardTableBody.appendChild(row);

        // Access Dashboard
        row.querySelector("[data-action=access_dashboard]").addEventListener("click", () => {
            accessDashboard(dashboard.id);
        });

        // Edit Dashboard
        row.querySelector("[data-action=edit_dashboard]").addEventListener("click", () => {
            editDashboard(dashboard.id);
        });

        // Delete Dashboard
        row.querySelector("[data-action=delete_dashboard]").addEventListener("click", () => {
            deleteDashboard(dashboard.id, dashboard.name);
        });
    });
}

// Render word cloud using D3.js
function renderD3Cloud(words, containerId) {
    const container = document.getElementById(containerId);
    container.classList.add("wordcloud-container");

    const layout = d3.layout.cloud()
        .size([500, 300])
        .words(words.map(([text, size]) => ({ text, size: size * 10 })))
        .padding(5)
        .rotate(() => ~~(Math.random() * 2) * 90)
        .fontSize(d => d.size)
        .on("end", draw);

    layout.start();

    function draw(words) {
        d3.select(`#${containerId}`)
            .append("svg")
            .attr("width", layout.size()[0])
            .attr("height", layout.size()[1])
            .append("g")
            .attr("transform", "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 + ")")
            .selectAll("text")
            .data(words)
            .enter().append("text")
            .style("font-size", d => d.size + "px")
            .style("fill", () => "#" + ((1 << 24) * Math.random() | 0).toString(16))
            .attr("text-anchor", "middle")
            .attr("transform", d => "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")")
            .text(d => d.text);
    }
}

// Fetch dashboard data
async function fetchDashboardData(dashboardId) {
    try {
        const response = await fetch(`${apiBase}/dashboard/${dashboardId}`);
        if (!response.ok) {
            throw new Error("Failed to fetch dashboard data");
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching dashboard data:", error);
        Swal.fire("Error", "Failed to load dashboard data.", "error");
        return null;
    }
}

// Fetch component data
async function fetchComponentData(dashboardId, componentId) {
    try {
        const response = await fetch(`${apiBase}/dashboard/${dashboardId}/component/${componentId}/data`);
        if (!response.ok) {
            throw new Error("Failed to fetch component data");
        }
        return await response.json();
    } catch (error) {
        console.error(`Error fetching data for component ${componentId}:`, error);
        return null;
    }
}

// Access Dashboard
async function accessDashboard(dashboardId) {
    try {
        const dashboard = await fetchDashboardData(dashboardId);
        if (!dashboard) return;

        document.getElementById("renderedDashboardId").textContent = dashboardId;
        document.getElementById("renderedDashboardCampaignIds").textContent = dashboard.campaigns.join(", ");

        // Clear and prepare renderDashboardsSection
        const renderedDashboards = document.getElementById("renderedDashboards");
        renderedDashboards.innerHTML = "";

        // Create placeholders for components
        dashboard.components.sort((a, b) => a.id - b.id).forEach(component => {
            const container = document.createElement("div");
            container.classList.add("col-lg-4", "col-md-6", "col-12", "mb-4", "d-flex");
            container.id = `component-${component.id}`;
            container.innerHTML = `
                <div class="card shadow-sm flex-grow-1">
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title">${component.name}</h5>
                        <div class="loading-spinner mx-auto my-3"></div>
                    </div>
                </div>
            `;
            renderedDashboards.appendChild(container);
        });

        // Fetch and render each component's data
        dashboard.components.forEach(async component => {
            const componentData = await fetchComponentData(dashboardId, component.id);
            if (componentData) {
                renderComponent(componentData);
            }
        });

        // Update renderDashboardsSection title and show it
        document.querySelector("#renderDashboardsSection h2").textContent = dashboard.name;
        renderDashboardsSection.setAttribute("data-title", dashboard.name);
        showSection(renderDashboardsSection);
    } catch (error) {
        console.error("Error accessing dashboard:", error);
        Swal.fire("Error", "Failed to load dashboard data.", "error");
    }
}
// Render a single component
function renderComponent(component) {
    const container = document.getElementById(`component-${component.id}`);
    if (!container) return;

    const cardBody = container.querySelector(".card-body");
    cardBody.innerHTML = `<h5 class="card-title">${component.name}</h5>`;

    if (component.type === "bar_chart" || component.type === "line_chart" || component.type === "pie_chart") {
        const canvasContainer = document.createElement("div");
        canvasContainer.classList.add("d-flex", "justify-content-center", "h-100", "align-items-center");
        const canvas = document.createElement("canvas");
        canvas.id = `chart-${component.id}`;
        canvas.style.maxHeight = "300px"; // Limit the height of the chart
        canvasContainer.appendChild(canvas);
        cardBody.appendChild(canvasContainer);

        const friendlyAxisNames = {
            word_count: "Word Count",
            feedback_length: "Feedback Length",
            sentiment: "Sentiment",
            star_rating: "Star Rating"
        };

        // Sort data by X values in ascending order
        const sortedData = component.data.labels.map((label, index) => ({
            label: label,
            value: component.data.values[index]
        })).sort((a, b) => a.label - b.label);

        const sortedLabels = sortedData.map(item => item.label);
        const sortedValues = sortedData.map(item => item.value);

        new Chart(canvas.getContext("2d"), {
            type: component.type === "bar_chart" ? "bar" : component.type === "line_chart" ? "line" : "pie",
            data: {
                labels: sortedLabels,
                datasets: [{
                    label: component.type === "pie_chart"
                        ? `Distribution of ${friendlyAxisNames[component.settings.x_axis] || component.settings.x_axis}`
                        : `${friendlyAxisNames[component.settings.x_axis] || component.settings.x_axis} vs ${friendlyAxisNames[component.settings.y_axis] || component.settings.y_axis}`,
                    data: sortedValues,
                    backgroundColor: component.type === "pie_chart"
                        ? sortedLabels.map((_, index) => `hsl(${index * 360 / sortedLabels.length}, 70%, 50%)`)
                        : component.settings.color,
                    borderColor: component.settings.color,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false, // Prevent indefinite growth
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                return `${label}: ${value}`;
                            }
                        }
                    }
                },
                scales: component.type === "pie_chart" ? {} : {
                    x: { beginAtZero: true, title: { display: true, text: friendlyAxisNames[component.settings.x_axis] || component.settings.x_axis } },
                    y: { beginAtZero: true, title: { display: true, text: friendlyAxisNames[component.settings.y_axis] || component.settings.y_axis } }
                }
            }
        });
    } else if (component.type === "word_cloud") {
        const containerId = `wordcloud-container-${component.id}`;
        const wordCloudContainer = document.createElement("div");
        wordCloudContainer.id = containerId;
        cardBody.appendChild(wordCloudContainer);

        renderD3Cloud(component.data.words, containerId);
    } else if (component.type === "sentiment_analysis") {
        const containerId = `sentiment-chart-${component.id}`;
        const sentimentContainer = document.createElement("div");
        sentimentContainer.id = containerId;
        cardBody.appendChild(sentimentContainer);

        const options = {
            chart: {
                type: 'radialBar',
                height: 350
            },
            series: [Math.round((component.data.sentiment || 0) * 100)],
            labels: ['Sentiment'],
            colors: [component.data.sentiment > 0 ? '#28a745' : component.data.sentiment < 0 ? '#dc3545' : '#ffc107'],
            plotOptions: {
                radialBar: {
                    dataLabels: {
                        name: { fontSize: '22px' },
                        value: {
                            fontSize: '16px',
                            formatter: val => `${val}%`
                        }
                    }
                }
            }
        };

        const chart = new ApexCharts(document.querySelector(`#${containerId}`), options);
        chart.render();

        const tableHtml = `
            <table class="table table-sm mt-3">
                <thead>
                    <tr>
                        <th>Metric</th>
                        <th>Value</th>
                    </tr>
                </thead>
                <tbody>
                    <tr><td>Positive Score</td><td>${((component.data.positive_score || 0) * 100).toFixed(2)}%</td></tr>
                    <tr><td>Neutral Score</td><td>${((component.data.neutral_score || 0) * 100).toFixed(2)}%</td></tr>
                    <tr><td>Negative Score</td><td>${((component.data.negative_score || 0) * 100).toFixed(2)}%</td></tr>
                </tbody>
            </table>
        `;
        cardBody.insertAdjacentHTML('beforeend', tableHtml);
    } else if (component.type === "trend_analysis") {
        const containerId = `trend-chart-${component.id}`;
        const trendContainer = document.createElement("div");
        trendContainer.id = containerId;
        cardBody.appendChild(trendContainer);

        const options = {
            chart: { type: 'line', height: 350 },
            series: [{ name: component.name, data: component.data.values.map(value => parseFloat(value.toFixed(2))) }],
            xaxis: { categories: component.data.labels },
            colors: ['#007bff'],
            stroke: { curve: 'smooth' },
            title: { text: component.name, align: 'center' }
        };

        const chart = new ApexCharts(document.querySelector(`#${containerId}`), options);
        chart.render();
        trendContainer.classList.add("trend-chart-container");
    } else {
        cardBody.innerHTML += `<p class="text-muted">Unsupported component type: ${component.type}</p>`;
    }
}

// Delete Dashboard
function deleteDashboard(dashboardId, dashboardName) {
    Swal.fire({
        iconHtml: '<i class="fas fa-trash text-danger"></i>',
        title: 'Delete Dashboard',
        html: `<b>Name: ${dashboardName}</b><br><br>This action cannot be undone!`,
        showCancelButton: true,
        confirmButtonText: 'Yes, Delete',
        cancelButtonText: 'Cancel',
        focusConfirm: false,
        customClass: {
            icon: 'no-icon',
            confirmButton: 'btn btn-danger mx-2',
            cancelButton: 'btn btn-secondary mx-2'
        },
        buttonsStyling: false
    }).then((result) => {
        if (result.isConfirmed) {
            fetch(`${apiBase}/dashboard/${dashboardId}`, {
                method: "DELETE"
            }).then(() => {
                loadDashboards();
            });
        }
    });
}

let newDashboardChoices;

addNewDashboardBtn.addEventListener("click", async () => {
    // Fetch campaigns
    const res = await fetch(`${apiBase}/campaigns`);
    const campaigns = await res.json();

    // Populate the dropdown
    newDashboardCampaignIds.innerHTML = campaigns.items
        .map(campaign => `<option value="${campaign.id}">${campaign.name}</option>`)
        .join("");

    // Initialize or refresh Choices.js
    if (newDashboardChoices) {
        newDashboardChoices.destroy(); // Destroy previous instance if it exists
    }
    newDashboardChoices = new Choices(newDashboardCampaignIds, {
        removeItemButton: true, // Allow removing selected items
        searchPlaceholderValue: "Search campaigns...", // Placeholder for search
    });

    // Clear all form fields
    addDashboardForm.reset();
    componentsContainer.innerHTML = ""; // Clear existing components

    // Show the add dashboard section
    showSection(dashboardCreationSection);
});

// Add Component Field
addComponentBtn.addEventListener("click", () => {
    const componentField = createComponentField();
    componentsContainer.appendChild(componentField);
});

// Handle Form Submission
addDashboardForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Get form values
    const name = document.getElementById("newDashboardName").value;
    const description = document.getElementById("newDashboardDescription").value;
    const campaignIds = Array.from(newDashboardCampaignIds.selectedOptions).map(option => parseInt(option.value));
    const components = Array.from(componentsContainer.children).map(componentField => {
        const inputs = componentField.querySelectorAll("input, select");
        const type = inputs[2].value;
        const settingsContainer = componentField.querySelector(".settings-container");

        let settings = {};
        if (type === "bar_chart" || type === "line_chart" || type === "pie_chart") {
            settings = {
                x_axis: settingsContainer.querySelector("#xAxis").value,
                y_axis: settingsContainer.querySelector("#yAxis").value,
                color: settingsContainer.querySelector("#chartColor").value
            };
        } else if (type === "word_cloud") {
            settings = {
                text_metric: settingsContainer.querySelector("#textMetric").value
            };
        } else if (type === "sentiment_analysis" || type === "trend_analysis") {
            settings = {
                metric: settingsContainer.querySelector("#analysisMetric").value
            };
        }

        return {
            name: inputs[0].value,
            description: inputs[1].value,
            type: type,
            settings: settings
        };
    });

    if (components.length === 0) {
        Swal.fire("Error", "Please add at least one component.", "error");
        return;
    }

    // Send data to the API
    try {
        await fetch(`${apiBase}/dashboard`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, description, campaign_ids: campaignIds, components })
        });
        loadDashboards();
        showSection(dashboardListSection);
    } catch (error) {
        console.error("Error creating dashboard:", error);
        Swal.fire("Error", "Failed to create dashboard. Please check your input.", "error");
    }
});

// Cancel Button
cancelAddDashboard.addEventListener("click", () => {
    loadDashboards();
    showSection(dashboardListSection);
});

// Create settings fields for components
function createSettingsFields(type, container, settings) {
    container.innerHTML = "";

    if (type === "bar_chart" || type === "line_chart" || type === "pie_chart") {
        container.innerHTML = `
    <div class="d-flex align-items-center justify-content-between">
        <div class="col-md-5 d-flex align-items-center p-1">
            <label for="xAxis" class="me-1 flex-grow-1 text-end">X:</label>
            <select id="xAxis" class="form-select">
                <option value="word_count">Word Count</option>
                <option value="feedback_length">Feedback Length</option>
                <option value="sentiment">Sentiment</option>
                <option value="star_rating">Star Rating</option>
            </select>
        </div>
        <div class="col-md-5 d-flex align-items-center p-1">
            <label for="yAxis" class="me-1 flex-grow-1 text-end">Y:</label>
            <select id="yAxis" class="form-select">
                <option value="word_count">Word Count</option>
                <option value="feedback_length">Feedback Length</option>
                <option value="sentiment">Sentiment</option>
                <option value="star_rating">Star Rating</option>
            </select>
        </div>
        <div class="col-md-2 d-flex align-items-center p-1">
            <label for="chartColor" class="me-1 flex-grow-1 text-end">Color:</label>
            <input type="color" id="chartColor" class="form-control" value="#3498db">
        </div>
    </div>
    `;

        container.querySelector("#xAxis").value = settings.x_axis || "word_count";
        container.querySelector("#yAxis").value = settings.y_axis || "feedback_length";
        container.querySelector("#chartColor").value = settings.color || "#3498db";

    } else if (type === "word_cloud") {
        container.innerHTML = `
    <div class="col-md-12 d-flex align-items-center">
        <label for="textMetric" class="me-1 flex-grow-1 text-end">Metric:</label>
        <select id="textMetric" class="form-select">
            <option value="feedback_answer">Feedback Answer</option>
        </select>
    </div>
    `;
        container.querySelector("#textMetric").value = settings.text_metric || "feedback_answer";

    } else if (type === "sentiment_analysis" || type === "trend_analysis") {
        container.innerHTML = `
    <div class="col-md-12 d-flex align-items-center">
        <label for="analysisMetric" class="me-1 flex-grow-1 text-end">Metric:</label>
        <select id="analysisMetric" class="form-select">
            <option value="sentiment">Sentiment</option>
            <option value="star_rating">Star Rating</option>
            <option value="word_count">Word Count</option>
            <option value="feedback_length">Feedback Length</option>
        </select>
    </div>
    `;
        container.querySelector("#analysisMetric").value = settings.metric || "sentiment";
    }
}

// Observe dynamically added components
document.addEventListener("DOMContentLoaded", () => {
    const observeDynamicComponents = () => {
        const componentTypeSelects = document.querySelectorAll(".component-type-select");
        componentTypeSelects.forEach(select => {
            if (!select.dataset.listenerAdded) {
                select.addEventListener("change", (e) => {
                    const container = e.target.parentElement.closest(".row").querySelector(".settings-container");
                    createSettingsFields(e.target.value, container);
                });
                select.dataset.listenerAdded = true;
            }
        });
    };

    const observer = new MutationObserver(() => {
        observeDynamicComponents();
    });

    observer.observe(document.getElementById("componentsContainer"), { childList: true, subtree: true });

    observeDynamicComponents();
});

let editDashboardChoices;

// Edit dashboard
async function editDashboard(dashboardId) {
    try {
        // Fetch dashboard data
        const res = await fetch(`${apiBase}/dashboard/${dashboardId}`);
        const dashboard = await res.json();

        // Fill form fields
        editDashboardId.value = dashboard.id;
        editDashboardName.value = dashboard.name;
        editDashboardDescription.value = dashboard.description;

        // Fetch campaigns and populate the dropdown
        const campaignsRes = await fetch(`${apiBase}/campaigns`);
        const campaigns = await campaignsRes.json();
        editDashboardCampaignIds.innerHTML = campaigns.items
            .map(campaign => `<option value="${campaign.id}" ${dashboard.campaigns.includes(campaign.id) ? "selected" : ""}>${campaign.name}</option>`)
            .join("");

        // Initialize or refresh Choices.js
        if (editDashboardChoices) {
            editDashboardChoices.destroy();
        }
        editDashboardChoices = new Choices(editDashboardCampaignIds, {
            removeItemButton: true,
            searchPlaceholderValue: "Search campaigns...",
        });

        // Populate components
        editComponentsContainer.innerHTML = "";
        dashboard.components.forEach(component => {
            const componentField = createComponentField(component);
            editComponentsContainer.appendChild(componentField);
        });

        // Show the edit dashboard section
        showSection(dashboardEditSection);
    } catch (error) {
        console.error("Error loading dashboard:", error);
        Swal.fire("Error", "Failed to load dashboard data.", "error");
    }
}

// Create Component Field
function createComponentField(component = {}) {
    const componentId = `component-${Date.now()}`;
    const componentField = document.createElement("div");
    componentField.classList.add("mb-3");
    componentField.innerHTML = `
    <div class="row g-2 align-items-center">
        <div class="col-md-2 d-flex align-items-center">
        <label class="me-2 flex-grow-1 text-end">Name:</label>
        <input type="text" class="form-control" placeholder="Name" value="${component.name || ""}" required>
        </div>
        <div class="col-md-2 d-flex align-items-center">
        <label class="me-2 flex-grow-1 text-end">Description:</label>
        <input type="text" class="form-control" placeholder="Description" value="${component.description || ""}">
        </div>
        <div class="col-md-2 d-flex align-items-center">
        <label class="me-2 flex-grow-1 text-end">Type:</label>
        <select class="form-select component-type-select" required>
        <option value="bar_chart" ${component.type === "bar_chart" ? "selected" : ""}>Bar Chart</option>
        <option value="line_chart" ${component.type === "line_chart" ? "selected" : ""}>Line Chart</option>
        <option value="pie_chart" ${component.type === "pie_chart" ? "selected" : ""}>Pie Chart</option>
        <option value="word_cloud" ${component.type === "word_cloud" ? "selected" : ""}>Word Cloud</option>
        <option value="sentiment_analysis" ${component.type === "sentiment_analysis" ? "selected" : ""}>Sentiment Analysis</option>
        <option value="trend_analysis" ${component.type === "trend_analysis" ? "selected" : ""}>Trend Analysis</option>
        </select>
        </div>
        <div class="col-md-5 d-flex align-items-center">
        <div class="settings-container w-100"></div>
        </div>
        <div class="col-md-1 d-flex align-items-center justify-content-center">
        <button type="button" class="btn btn-danger btn-sm remove-component-btn">
        <i class="fas fa-trash"></i>
        </button>
        </div>
    </div>
    `;

    const componentTypeSelect = componentField.querySelector(".component-type-select");
    const settingsContainer = componentField.querySelector(".settings-container");

    createSettingsFields(componentTypeSelect.value, settingsContainer, component.settings || {});

    componentTypeSelect.addEventListener("change", (e) => {
        createSettingsFields(e.target.value, settingsContainer, component.settings || {});
    });

    componentField.querySelector(".remove-component-btn").addEventListener("click", () => {
        componentField.remove();
    });

    return componentField;
}

// Add New Component Field
addEditComponentBtn.addEventListener("click", () => {
    const componentField = createComponentField();
    editComponentsContainer.appendChild(componentField);
});

// Handle Form Submission
editDashboardForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    Swal.fire({
        iconHtml: '<i class="fas fa-save text-warning"></i>',
        title: 'Update Dashboard',
        text: 'Are you sure you want to update this dashboard?',
        showCancelButton: true,
        confirmButtonText: 'Yes, Update',
        cancelButtonText: 'Cancel',
        focusConfirm: false,
        customClass: {
            icon: 'no-icon',
            confirmButton: 'btn btn-warning mx-2',
            cancelButton: 'btn btn-secondary mx-2'
        },
        buttonsStyling: false
    }).then(async (result) => {
        if (result.isConfirmed) {
            // Get form values
            const dashboardId = editDashboardId.value;
            const name = editDashboardName.value;
            const description = editDashboardDescription.value;
            const campaignIds = Array.from(editDashboardCampaignIds.selectedOptions).map(option => parseInt(option.value));
            const components = Array.from(editComponentsContainer.children).map(componentField => {
                const inputs = componentField.querySelectorAll("input, select");
                const type = inputs[2].value;
                const settingsContainer = componentField.querySelector(".settings-container");

                let settings = {};
                if (type === "bar_chart" || type === "line_chart" || type === "pie_chart") {
                    settings = {
                        x_axis: settingsContainer.querySelector("#xAxis").value,
                        y_axis: settingsContainer.querySelector("#yAxis").value,
                        color: settingsContainer.querySelector("#chartColor").value
                    };
                } else if (type === "word_cloud") {
                    settings = {
                        text_metric: settingsContainer.querySelector("#textMetric").value
                    };
                } else if (type === "sentiment_analysis" || type === "trend_analysis") {
                    settings = {
                        metric: settingsContainer.querySelector("#analysisMetric").value
                    };
                }

                return {
                    name: inputs[0].value,
                    description: inputs[1].value,
                    type: type,
                    settings: settings
                };
            });

            if (components.length === 0) {
                Swal.fire("Error", "Please add at least one component.", "error");
                return;
            }

            // Send data to the API
            try {
                await fetch(`${apiBase}/dashboard/${dashboardId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name, description, campaign_ids: campaignIds, components })
                });
                loadDashboards();
                showSection(dashboardListSection);
            } catch (error) {
                console.error("Error updating dashboard:", error);
                Swal.fire("Error", "Failed to update dashboard. Please check your input.", "error");
            }
        }
    });
});

// Cancel Button
cancelEditDashboard.addEventListener("click", () => {
    loadDashboards();
    showSection(dashboardListSection);
});

// Back to Menu
backToMenuFromDashboards.addEventListener("click", () => {
    showSection(menuSection);
});

// Show Dashboards Section
function showDashboards() {
    loadDashboards();
    showSection(dashboardListSection);
}

// Return to campaigns or back to campaigns
returnToCampaignsBtn.addEventListener("click", () => {
    window.location.search = "";
    showSection(campaignListSection);
    loadCampaigns();
});
backToCampaignsBtn.addEventListener("click", () => {
    showSection(campaignListSection);
    loadCampaigns();
});

// Menu buttons
viewCampaignsBtn.addEventListener("click", () => {
    loadCampaigns();
    showSection(campaignListSection);
});
viewDashboardsBtn.addEventListener("click", () => {
    showDashboards();
});
backToMenuFromList.addEventListener("click", () => {
    showSection(menuSection);
});
backToCampaignsFromCreate.addEventListener("click", () => {
    loadCampaigns();
    showSection(campaignListSection);
});
backToCampaignsFromEdit.addEventListener('click', () => {
    loadCampaigns();
    showSection(campaignListSection);
});

// Load dashboard metrics
async function loadDashboardMetrics() {
    try {
        const res = await fetch(`${apiBase}/dashboard-system-metrics`);

        if (!res.ok)
            document.getElementById("connectWithBackendToLoadDashboard").removeAttribute("hidden");

        const data = await res.json();
        document.getElementById("dashboardMetrics").innerHTML = `
            <div class="col-md-4">
                <h6>Total Campaigns</h6>
                <p id="totalCampaigns" class="display-6 text-primary">${data.total_campaigns || 0}</p>
            </div>
            <div class="col-md-4">
                <h6>Total Feedbacks</h6>
                <p id="totalFeedbacks" class="display-6 text-success">${data.total_feedbacks || 0}</p>
            </div>
            <div class="col-md-4">
                <h6>Active Campaigns</h6>
                <p id="activeCampaigns" class="display-6 text-warning">${data.active_campaigns || 0}</p>
            </div>
            `;
    } catch (error) {
        document.getElementById("connectWithBackendToLoadDashboard").removeAttribute("hidden");
    }
}

// On load
checkShortCode();
if (!currentShortCode) {
    showSection(menuSection);
}