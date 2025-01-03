import React from "react";

const DeleteModal = ({ closeModal, handleDelete }: any) => {
  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex pl:92 justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-[400px]">
        {/* Modal Title */}
        <h2 className="text-xl font-semibold mb-4">Delete</h2>

        {/* Confirmation Text */}
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete this avatar?
        </p>

        {/* Buttons */}
        <div className="flex justify-end space-x-4">
          {/* Cancel Button */}
          <button
            onClick={closeModal}
            className="border-2 border-[#b913e2] text-[#b913e2] font-medium py-2 px-4 rounded-[10px] hover:bg-purple-50 transition"
          >
            Cancel
          </button>

          {/* Delete Button */}
          <button
            onClick={handleDelete}
            className="bg-[#b913e2] text-white font-medium py-1 px-4 rounded-[10px] hover:bg-white hover:text-black hover:border-[#b913e2] hover:border-2 transition"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
