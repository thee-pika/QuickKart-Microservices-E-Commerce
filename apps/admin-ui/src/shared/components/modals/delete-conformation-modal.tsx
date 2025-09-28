import React from "react";

const DeleteConfirmationModal = ({
  product,
  onClose,
  onConfirm,
  onRestore,
}: any) => {

  if (!product) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white rounded-2xl shadow-lg p-6 w-[350px]">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">
          {product.isDeleted ? "Restore Product" : "Delete Product"}
        </h2>

        <p className="text-sm text-gray-600 mb-6">
          {product.isDeleted
            ? `Are you sure you want to restore "${product.title}"?`
            : `Are you sure you want to delete "${product.title}"? This action can be undone.`}
        </p>

        <div className="flex justify-end gap-3">

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </button>

          {product.isDeleted ? (
            <button
              onClick={() => onRestore(product.id)}
              className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
            >
              Restore
            </button>
          ) : (
            <button
              onClick={() => onConfirm(product.id)}
              className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
