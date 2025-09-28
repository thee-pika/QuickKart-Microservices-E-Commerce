import React from "react";

const DeleteDiscountCodeModal = ({
    discount,
    onClose,
    onConfirm,
}: {
    discount: any;
    onClose: (e: boolean) => void;
    onConfirm?: () => void;
}) => {
    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">

            <div
                className="absolute inset-0 bg-black/40"
                onClick={() => onClose(false)}
            />

            <div className="relative bg-white rounded-xl shadow-lg w-full max-w-md p-6 z-10">
                <h2 className="text-lg font-semibold text-gray-800 mb-3">
                    Delete Discount Code
                </h2>
                <p className="text-gray-600">
                    Are you sure you want to delete{" "}
                    <span className="font-medium text-gray-900">
                        {discount?.title || "this discount"}
                    </span>
                    ? This action cannot be undone.
                </p>

                <div className="flex justify-end gap-3 mt-6">
                    <button
                        onClick={() => onClose(false)}
                        className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
                    >
                        Yes, Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteDiscountCodeModal;
