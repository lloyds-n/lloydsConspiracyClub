document.addEventListener("DOMContentLoaded", loadSightings);


async function loadSightings() {
    try {
        const response = await fetch('/api/sightings');
        const data = await response.json();
        const container = document.querySelector(".album .container .row");
        container.innerHTML = "";

        data.forEach(sighting => {
            const card = document.createElement("div");
            card.className = "col-md-4";
            card.innerHTML = `
                <div class="card mb-4 shadow-sm">
                    <img class="bd-placeholder-img card-img-top" width="100%" height="225" src="${sighting.image}" alt="${sighting.title}">
                    <div class="card-body">
                        <p class="card-text">${sighting.title}</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <div class="btn-group">
                                <button type="button" class="btn btn-sm btn-outline-secondary view-btn" data-id="${sighting.id}">View</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });

        attachViewEventListeners();
    } catch (error) {
        console.error("Error fetching sightings:", error);
    }
}

function attachViewEventListeners() {
    document.querySelectorAll(".view-btn").forEach(button => {
        button.addEventListener("click", async function () {
            const sightingId = this.getAttribute("data-id");
            try {
                const response = await fetch(`/api/sightings/${sightingId}`);
                const data = await response.json();
                const container = document.querySelector("main");
                container.innerHTML = "";

                container.innerHTML = `
                    <div class="image-container">
                        <img src="${data.image}" alt="${data.title}" class="img-fluid">
                    </div>
                    <div class="details-container">
                        <h2>${data.title}</h2>
                        <p><strong>Location:</strong> ${data.location}</p>
                        <p><strong>Date:</strong> ${data.date}</p>
                    </div>
                    <div class="comments-container" id="comments-container"></div>
                `;

                renderComments(sightingId, document.getElementById("comments-container"), data.comments);
            } catch (error) {
                console.error("Error fetching sighting details:", error);
            }
        });
    });
}


function renderComments(sightingId, commentsContainer, comments) {
    commentsContainer.innerHTML = `
        <h3>Comments:</h3>
        <ul id="comment-list">
            ${comments.length > 0 ? comments.slice(0, 1).map(comment => `<li>${comment}</li>`).join('') : '<li>No comments yet</li>'}
        </ul>
        ${comments.length > 1 ? `<button id="view-all-comments" class="btn btn-link">View All Comments</button>` : ''}
        <button id="add-comment" class="btn btn-primary">Add Comment</button>
    `;

    document.getElementById("view-all-comments")?.addEventListener("click", function () {
        document.getElementById("comment-list").innerHTML = comments.map(comment => `<li>${comment}</li>`).join('');
        this.style.display = 'none';
    });

    document.getElementById("add-comment").addEventListener("click", function () {
        commentsContainer.innerHTML = `
            <h3>Add a Comment:</h3>
            <form id="add-comment-form">
                <textarea id="new-comment" class="form-control" placeholder="Write your comment..." required></textarea>
                <button type="submit" class="btn btn-primary bg-dark">Submit Comment</button>
            </form>
        `;
        document.getElementById("add-comment-form").addEventListener("submit", async function (event) {
            event.preventDefault();
            const newComment = document.getElementById("new-comment").value.trim();
            if (newComment) {
                try {
                    const response = await fetch(`/api/sightings/${sightingId}/comments`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ comment: newComment }),
                    });
                    const result = await response.json();
                    if (response.ok) {
                        renderComments(sightingId, commentsContainer, result.comments);
                    } else {
                        alert(result.error);
                    }
                } catch (error) {
                    console.error("Error adding comment:", error);
                }
            } else {
                alert("Please write a comment.");
            }
        });
    });
}




document.addEventListener("DOMContentLoaded", function () {
    const addSightingBtn = document.getElementById("addSightingBtn");
    const actionCentre = document.querySelector(".action-centre");

    addSightingBtn.addEventListener("click", function () {
        actionCentre.innerHTML = `
            <div id="sightingFormContainer">
                <h3>Add a Sighting</h3>
                <form id="sighting-form">
                    <label for="title">Title:</label>
                    <input type="text" id="title" name="title" required>
                    <span class="error" id="title-error"></span>
                    <br>
                    <label for="location">Location:</label>
                    <input type="text" id="location" name="location" required>
                    <span class="error" id="location-error"></span>
                    <br>
                    <label for="date">Date:</label>
                    <input type="date" id="date" name="date" required>
                    <span class="error" id="date-error"></span>
                    <br>
                    <label for="image">Upload Image:</label>
                    <input type="file" id="image" name="image" accept="image/*" required>
                    <span class="error" id="image-error"></span>
                    <br>
                    <label for="comments">Comment:</label>
                    <input type="text" id="comments" name="comments" required>
                    <span class="error" id="comments-error"></span>
                    <br>
                    <button type="submit" class="btn btn-primary bg-dark">Submit</button>
                </form>
            </div>
        `;

        document.getElementById("sighting-form").addEventListener("submit", async function (event) {
            event.preventDefault();
            document.querySelectorAll(".error").forEach(el => el.textContent = "");

            const title = document.getElementById("title").value.trim();
            const location = document.getElementById("location").value.trim();
            const date = document.getElementById("date").value.trim();
            const image = document.getElementById("image").files[0];
            const comments = document.getElementById("comments").value.trim();

            let isValid = true;
            if (!title) { document.getElementById("title-error").textContent = "Title is required"; isValid = false; }
            if (!location) { document.getElementById("location-error").textContent = "Location is required"; isValid = false; }
            if (!date) { document.getElementById("date-error").textContent = "Date is required"; isValid = false; }
            if (!image) { document.getElementById("image-error").textContent = "Image is required"; isValid = false; }
            if (!comments) { document.getElementById("comments-error").textContent = "Comment is required"; isValid = false; }

            if (!isValid) return;

            const formData = new FormData();
            formData.append("title", title);
            formData.append("location", location);
            formData.append("date", date);
            formData.append("image", image);
            formData.append("comments", comments);

            try {
                const response = await fetch("/api/add-sighting", {
                    method: "POST",
                    body: formData
                });
                const data = await response.json();

                if (response.ok) {
                    alert("Sighting added successfully!");
                    loadSightings();
                } else {
                    alert("Error: " + data.error);
                }
            } catch (error) {
                console.error("Error:", error);
            }
        });
    });
});

