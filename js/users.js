const userTable = document.querySelector("#userTable tbody");
const userModal = document.getElementById("userModal");
const openUserModal = document.getElementById("openUserModal");
const closeUserModal = document.getElementById("closeUserModal");
const userForm = document.getElementById("userForm");
const editUserIndex = document.getElementById("editUserIndex");

let users = [];

async function loadUsers() {
  try {
    users = await apiRequest("/users", { method: "GET" });
    renderUsers();
  } catch (err) {
    console.error(err);
    userTable.innerHTML =
      "<tr><td colspan='4'>Unable to load users from server (Admin only).</td></tr>";
  }
}

function renderUsers() {
  userTable.innerHTML = "";
  if (users.length === 0) {
    userTable.innerHTML = "<tr><td colspan='4'>No users found.</td></tr>";
    return;
  }

  users.forEach((user, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${user.name}</td>
      <td>${user.email}</td>
      <td><span class="role ${user.role}">${user.role}</span></td>
      <td>${user.position || '-'}</td>
      <td>
        <button onclick="editEvent(${index})">Edit</button>
        <button class="delete" onclick="deleteEvent(${index})">Delete</button>
      </td>
    `;
    userTable.appendChild(row);
  });
}

openUserModal.addEventListener("click", () => {
  userModal.style.display = "flex";
  userForm.reset();
  editUserIndex.value = "";
});

closeUserModal.addEventListener("click", () => {
  userModal.style.display = "none";
});

userForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("userName").value;
  const email = document.getElementById("userEmail").value;
  const role = document.getElementById("userRole").value;
  const position = document.getElementById("userPosition").value;
  const index = editUserIndex.value;

  const target = index === "" ? null : users[index];
  const userId = target?.id;

  try {
    if (!userId) {
      // Creating via this UI requires also creating a password; for now, direct creation is disabled.
      alert("Creating users from this page is not yet supported. Use Sign Up instead.");
      return;
    } else {
      await apiRequest(`/users/${userId}`, {
        method: "PUT",
        body: JSON.stringify({ name, email, role, position }),
      });
    }

    userModal.style.display = "none";
    await loadUsers();
  } catch (err) {
    alert(err.message || "Unable to save user.");
  }
});

window.editEvent = function (index) {
  const user = users[index];
  document.getElementById("userName").value = user.name;
  document.getElementById("userEmail").value = user.email;
  document.getElementById("userRole").value = user.role;
  document.getElementById("userPosition").value = user.position || "";
  editUserIndex.value = index;
  userModal.style.display = "flex";
};

window.deleteEvent = async function (index) {
  const user = users[index];
  if (!user || !user.id) return;

  if (!confirm("Delete this user?")) return;

  try {
    await apiRequest(`/users/${user.id}`, { method: "DELETE" });
    await loadUsers();
  } catch (err) {
    alert(err.message || "Unable to delete user.");
  }
};

loadUsers();
