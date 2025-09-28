import { Controller } from "react-hook-form";

const sizes = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];

const SizeSelector = ({ control, errors }: any) => {
    return (
        <div className="mt-4">
            <label className="block text-sm font-medium text-gray-100 mb-2">
                Sizes
            </label>
            <Controller
                name="sizes"
                control={control}
                render={({ field }) => (
                    <div className="flex gap-3 flex-wrap">
                        {sizes.map((size) => {
                            const isSelected = (field.value || []).includes(size);

                            return (
                                <button
                                    type="button"
                                    key={size}
                                    onClick={() =>
                                        field.onChange(
                                            isSelected
                                                ? field.value.filter((s: string) => s !== size)
                                                : [...(field.value || []), size]
                                        )
                                    }
                                    className={`px-4 py-2 rounded-lg border transition 
                                        ${isSelected
                                            ? "bg-blue-600 text-white border-blue-600 shadow-md"
                                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                                        }`}
                                >
                                    {size}
                                </button>
                            );
                        })}
                    </div>
                )}
            />
            {errors?.sizes && (
                <p className="text-red-500 text-sm mt-2">{errors.sizes.message}</p>
            )}
        </div>
    );
};

export default SizeSelector;
