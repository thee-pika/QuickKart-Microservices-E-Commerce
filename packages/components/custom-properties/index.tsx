import { Plus, X } from "lucide-react"
import { useEffect, useState } from "react"
import { Controller } from "react-hook-form"
import Input from "../input"

const CustomProperties = ({ control, errors }: any) => {
    const [properties, setProperties] = useState<{ label: string; values: string[] }[]>([]);
    const [newLabel, setNewLabel] = useState("");
    const [newValue, setNewValue] = useState("");

    return (
        <div>
            <Controller
                name="customProperties"
                control={control}
                rules={{ required: "Specifications name is required" }}
                render={({ field }) => {
                    useEffect(() => {
                        field.onChange(properties);
                    }, [properties]);

                    const addProperty = () => {
                        if (!newLabel.trim()) return;
                        setProperties([...properties, { label: newLabel, values: [] }]);
                        setNewLabel("");
                    };

                    const addValue = (index: number) => {
                        if (!newValue.trim()) return;
                        const updated = [...properties];
                        updated[index].values.push(newValue);
                        setProperties(updated);
                        setNewValue("");
                    };

                    const removeProperty = (index: number) => {
                        setProperties(properties.filter((_, i) => i !== index));
                    };

                    return (
                        <div className="mt-4">
                            <label className="block font-semibold text-gray-200 mb-2">
                                Custom Properties
                            </label>

                            <div className="space-y-4">
                                {properties.map((property, index) => (
                                    <div
                                        key={index}
                                        className="border border-gray-700 rounded-xl p-3 shadow-sm bg-gray-800"
                                    >
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-medium text-gray-100">{property.label}</span>
                                            <button type="button" onClick={() => removeProperty(index)}>
                                                <X size={18} className="text-red-400 hover:text-red-600" />
                                            </button>
                                        </div>

                                        <div className="flex gap-2 mb-3">
                                            <input
                                                type="text"
                                                className="flex-1 border border-gray-600 bg-gray-900 text-gray-100 px-3 py-1 rounded-md text-sm outline-none"
                                                placeholder="Enter value..."
                                                value={newValue}
                                                onChange={(e) => setNewValue(e.target.value)}
                                            />
                                            <button
                                                type="button"
                                                className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 flex items-center gap-1"
                                                onClick={() => addValue(index)}
                                            >
                                                <Plus size={14} /> Add
                                            </button>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            {property.values.map((value, i) => (
                                                <span
                                                    key={i}
                                                    className="px-2 py-1 bg-gray-700 text-gray-200 rounded-lg text-xs"
                                                >
                                                    {value}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}


                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Enter property label (e.g., Material, Warranty)"
                                        value={newLabel}
                                        onChange={(e: any) => setNewLabel(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-1"
                                        onClick={addProperty}
                                    >
                                        <Plus size={16} /> Add
                                    </button>
                                </div>
                            </div>

                            {errors?.customProperties && (
                                <p className="text-red-500 text-xs mt-2">
                                    {errors.customProperties.message as string}
                                </p>
                            )}
                        </div>
                    );
                }}
            />
        </div>
    );
};

export default CustomProperties;
