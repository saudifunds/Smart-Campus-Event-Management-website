// ===== Smart Campus Room Management (Role-based, Backend-powered) =====

// Wait until DOM is ready
window.addEventListener("DOMContentLoaded", () => {
  const roomTable = document.querySelector("#roomTable tbody");
  const addRoomBtn = document.getElementById("addRoomBtn");
  const roomModal = document.getElementById("roomModal");
  const closeRoomModal = document.getElementById("closeRoomModal");
  const roomForm = document.getElementById("roomForm");
  const modalTitle = document.getElementById("modalTitle");

  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  const role = user.role;
  const canAdd = role === "Admin" || role === "Staff";
  const canEdit = role === "Admin" || role === "Staff";
  let rooms = [];
  let editingRoomId = null;

  // ===== Hide Add Button for Students =====
  if (!canAdd) {
    addRoomBtn.style.display = "none";
  }

  async function loadRooms() {
    try {
      rooms = await apiRequest("/rooms", { method: "GET" });
      renderRooms();
    } catch (err) {
      console.error(err);
      roomTable.innerHTML =
        "<tr><td colspan='5'>Unable to load rooms from server.</td></tr>";
    }
  }

  // ===== Render Room Table =====
  function renderRooms() {
    roomTable.innerHTML = "";

    if (!rooms.length) {
      roomTable.innerHTML = "<tr><td colspan='5'>No rooms available.</td></tr>";
      return;
    }

    rooms.forEach((room, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${room.name}</td>
        <td>${room.capacity}</td>
        <td>${room.type}</td>
        <td><span class="role ${room.status}">${room.status}</span></td>
        <td>
          ${
            canEdit
              ? `
                <button onclick="editRoom(${index})">Edit</button>
                ${
                  role === "Admin"
                    ? `<button class="delete" onclick="deleteRoom(${index})">Delete</button>`
                    : ""
                }
              `
              : `<span style="color:#999;">View Only</span>`
          }
        </td>
      `;
      roomTable.appendChild(row);
    });
  }

  // ===== Open Modal =====
  if (canAdd) {
    addRoomBtn.addEventListener("click", () => {
      modalTitle.textContent = "Add Room";
      editingRoomId = null;
      roomForm.reset();
      roomModal.style.display = "flex";
    });
  }

  // ===== Close Modal =====
  closeRoomModal.addEventListener("click", () => {
    roomModal.style.display = "none";
  });

  // ===== Save or Update Room =====
  roomForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const roomPayload = {
      name: document.getElementById("roomName").value,
      capacity: document.getElementById("roomCapacity").value,
      type: document.getElementById("roomType").value,
      status: document.getElementById("roomStatus").value,
    };

    try {
      if (editingRoomId) {
        await apiRequest(`/rooms/${editingRoomId}`, {
          method: "PUT",
          body: JSON.stringify(roomPayload),
        });
      } else {
        await apiRequest("/rooms", {
          method: "POST",
          body: JSON.stringify(roomPayload),
        });
      }

      roomModal.style.display = "none";
      await loadRooms();
    } catch (err) {
      alert(err.message || "Unable to save room.");
    }
  });

  // ===== Edit Room =====
  window.editRoom = async function (index) {
    if (!canEdit) return alert("You don’t have permission to edit rooms.");

    const room = rooms[index];
    if (!room) return;

    document.getElementById("roomName").value = room.name;
    document.getElementById("roomCapacity").value = room.capacity;
    document.getElementById("roomType").value = room.type;
    document.getElementById("roomStatus").value = room.status;
    modalTitle.textContent = "Edit Room";
    editingRoomId = room.id;
    roomModal.style.display = "flex";
  };

  // ===== Delete Room (Admin only) =====
  window.deleteRoom = async function (index) {
    if (role !== "Admin") {
      alert("Only admins can delete rooms.");
      return;
    }

    const room = rooms[index];
    if (!room || !room.id) return;

    if (!confirm("Delete this room?")) return;

    try {
      await apiRequest(`/rooms/${room.id}`, { method: "DELETE" });
      await loadRooms();
    } catch (err) {
      alert(err.message || "Unable to delete room.");
    }
  };

  // ===== Initial Render =====
  loadRooms();
});
