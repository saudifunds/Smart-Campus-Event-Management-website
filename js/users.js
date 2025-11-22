const userTable = document.querySelector("#userTable tbody");
const userModal = document.getElementById("userModal");
const openUserModal = document.getElementById("openUserModal");
const closeUserModal = document.getElementById("closeUserModal");
const userForm = document.getElementById("userForm");
const editUserIndex = document.getElementById("editUserIndex");

let users = JSON.parse(localStorage.getItem("users")) || [
  { name: "Evander Dzidzor", email: "evander@central.edu", role: "Admin" },
  { name: "Martha Nimo", email: "martha@central.edu", role: "Staff" },
  { name: "Kwame Boateng", email: "kwame@central.edu", role: "Student" },
];

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
      <td>
        <button onclick="editUser(${index})">Edit</button>
        <button class="delete" onclick="deleteUser(${index})">Delete</button>
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

userForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("userName").value;
  const email = document.getElementById("userEmail").value;
  const role = document.getElementById("userRole").value;
  const index = editUserIndex.value;

  const newUser = { name, email, role };

  if (index === "") {
    users.push(newUser);
  } else {
    users[index] = newUser;
  }

  localStorage.setItem("users", JSON.stringify(users));
  renderUsers();
  userModal.style.display = "none";
});

window.editUser = function (index) {
  const user = users[index];
  document.getElementById("userName").value = user.name;
  document.getElementById("userEmail").value = user.email;
  document.getElementById("userRole").value = user.role;
  editUserIndex.value = index;
  userModal.style.display = "flex";
};

window.deleteUser = function (index) {
  if (confirm("Delete this user?")) {
    users.splice(index, 1);
    localStorage.setItem("users", JSON.stringify(users));
    renderUsers();
  }
};

renderUsers();
