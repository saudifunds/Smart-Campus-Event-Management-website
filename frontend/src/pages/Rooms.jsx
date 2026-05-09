import React, { useState, useEffect, useCallback } from "react";
import { Layout, Modal, Button } from "../components";
import { useApi, useNotification, useAuth } from "../hooks";
import { ROLES } from "../utils/constants";

export default function RoomsPage() {
  const { user } = useAuth();
  const { request: callApi, loading } = useApi();
  const { showSuccess, showError } = useNotification();
  const [rooms, setRooms] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    capacity: "",
    type: "Classroom",
    status: "Available"
  });

  const canManage = [ROLES.ADMIN, ROLES.STAFF].includes(user?.role);
  const canDelete = user?.role === ROLES.ADMIN;

  const fetchRooms = useCallback(async () => {
    try {
      const data = await callApi({ url: "/rooms" });
      setRooms(data || []);
    } catch (err) {
      showError("Failed to fetch rooms");
    }
  }, [callApi, showError]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const handleOpenModal = (room = null) => {
    if (room) {
      setEditingRoom(room);
      setFormData({
        name: room.name,
        capacity: room.capacity,
        type: room.type,
        status: room.status
      });
    } else {
      setEditingRoom(null);
      setFormData({
        name: "",
        capacity: "",
        type: "Classroom",
        status: "Available"
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRoom(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRoom) {
        await callApi({
          url: `/rooms/${editingRoom.id}`,
          method: "PUT",
          data: formData
        });
        showSuccess("Room updated successfully");
      } else {
        await callApi({
          url: "/rooms",
          method: "POST",
          data: formData
        });
        showSuccess("Room added successfully");
      }
      handleCloseModal();
      fetchRooms();
    } catch (err) {
      showError(err.response?.data?.message || "Failed to save room");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this room?")) return;
    try {
      await callApi({
        url: `/rooms/${id}`,
        method: "DELETE"
      });
      showSuccess("Room deleted successfully");
      fetchRooms();
    } catch (err) {
      showError("Failed to delete room");
    }
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Rooms</h1>
          <p className="text-gray-600">Manage campus facilities and venues</p>
        </div>
        {canManage && (
          <Button onClick={() => handleOpenModal()} variant="primary">
            + Add Room
          </Button>
        )}
      </div>

      {loading && rooms.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-sm uppercase font-semibold">
                  <th className="px-6 py-4">Room Name</th>
                  <th className="px-6 py-4">Capacity</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rooms.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                      No rooms found.
                    </td>
                  </tr>
                ) : (
                  rooms.map((room) => (
                    <tr key={room.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-800">{room.name}</td>
                      <td className="px-6 py-4 text-gray-600">{room.capacity} seats</td>
                      <td className="px-6 py-4 text-gray-600">{room.type}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                          room.status === 'Available' ? 'bg-green-100 text-green-800' :
                          room.status === 'Occupied' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {room.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {canManage ? (
                            <>
                              <button 
                                onClick={() => handleOpenModal(room)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Edit"
                              >
                                ✏️
                              </button>
                              {canDelete && (
                                <button 
                                  onClick={() => handleDelete(room.id)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Delete"
                                >
                                  🗑️
                                </button>
                              )}
                            </>
                          ) : (
                            <span className="text-gray-400 text-sm">View Only</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Room Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal}
        title={editingRoom ? "Edit Room" : "Add New Room"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Room Name</label>
            <input
              type="text"
              name="name"
              required
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
              value={formData.name}
              onChange={handleInputChange}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
              <input
                type="number"
                name="capacity"
                required
                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                value={formData.capacity}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                name="type"
                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                value={formData.type}
                onChange={handleInputChange}
              >
                <option value="Classroom">Classroom</option>
                <option value="Auditorium">Auditorium</option>
                <option value="Lab">Lab</option>
                <option value="Conference Room">Conference Room</option>
                <option value="Outdoor">Outdoor</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              name="status"
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
              value={formData.status}
              onChange={handleInputChange}
            >
              <option value="Available">Available</option>
              <option value="Occupied">Occupied</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="button" onClick={handleCloseModal} variant="ghost" className="flex-1">
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="flex-1">
              {editingRoom ? "Update Room" : "Add Room"}
            </Button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
}
