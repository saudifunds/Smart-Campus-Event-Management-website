// ===== Smart Campus Room Management (Role-based) =====

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
  let rooms = JSON.parse(localStorage.getItem("rooms")) || [];
  let editingIndex = null;

  // ===== Hide Add Button for Students =====
  if (!canAdd) {
    addRoomBtn.style.display = "none";
  }

  // ===== Render Room Table =====
  function renderRooms() {
    roomTable.innerHTML = "";

    if (rooms.length === 0) {
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
      editingIndex = null;
      roomForm.reset();
      roomModal.style.display = "flex";
    });
  }

  // ===== Close Modal =====
  closeRoomModal.addEventListener("click", () => {
    roomModal.style.display = "none";
  });

  // ===== Save or Update Room =====
  roomForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const newRoom = {
      name: document.getElementById("roomName").value,
      capacity: document.getElementById("roomCapacity").value,
      type: document.getElementById("roomType").value,
      status: document.getElementById("roomStatus").value,
    };

    if (editingIndex !== null) {
      rooms[editingIndex] = newRoom;
    } else {
      rooms.push(newRoom);
    }

    localStorage.setItem("rooms", JSON.stringify(rooms));
    renderRooms();
    roomModal.style.display = "none";
  });

  // ===== Edit Room =====
  window.editRoom = function (index) {
    if (!canEdit) return alert("You don’t have permission to edit rooms.");

    const room = rooms[index];
    document.getElementById("roomName").value = room.name;
    document.getElementById("roomCapacity").value = room.capacity;
    document.getElementById("roomType").value = room.type;
    document.getElementById("roomStatus").value = room.status;
    modalTitle.textContent = "Edit Room";
    editingIndex = index;
    roomModal.style.display = "flex";
  };

  // ===== Delete Room (Admin only) =====
  window.deleteRoom = function (index) {
    if (role !== "Admin") {
      alert("Only admins can delete rooms.");
      return;
    }

    if (confirm("Delete this room?")) {
      rooms.splice(index, 1);
      localStorage.setItem("rooms", JSON.stringify(rooms));
      renderRooms();
    }
  };

  // ===== Initial Render =====
  renderRooms();
});
