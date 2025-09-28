import { Plus } from "lucide-react";
import { useState } from "react";
import { Controller } from "react-hook-form";

export const defaultColors = [
  "#000000",
  "#FFFFFF",
  "#FF0000",
  "#0000FF",
  "#008000",
  "#FFFF00",
  "#800080",
];

const ColorSelector = ({ control, errors }: any) => {
  const [customColors, setCustomColors] = useState<string[]>([]);
  const [newColor, setNewColor] = useState("#ffffff");
  const [showColorPicker, setShowColorPicker] = useState(false);

  return (
    <div className="mt-2">
      <label className="block font-semibold text-gray-100 mb-2">Colors</label>
      <Controller
        name="colors"
        control={control}
        render={({ field }) => (
          <div className="flex flex-wrap gap-3">

            {[...defaultColors, ...customColors].map((color) => {
              const isSelected = (field.value || []).includes(color);
              const isLightColor = ["#FFFFFF", "#FFFF00"].includes(
                color.toUpperCase()
              );

              return (
                <button
                  type="button"
                  key={color}
                  onClick={() =>
                    field.onChange(
                      isSelected
                        ? field.value.filter((c: string) => c !== color)
                        : [...(field.value || []), color]
                    )
                  }
                  className={`w-8 h-8 rounded-md flex items-center justify-center border transition-transform ${isSelected ? "scale-110 border-gray-900" : "border-gray-300"
                    }`}
                  style={{ backgroundColor: color }}
                >
                  {isSelected && (
                    <Plus
                      size={16}
                      color={isLightColor ? "black" : "white"}
                      strokeWidth={3}
                    />
                  )}
                </button>
              );
            })}

            {!showColorPicker ? (
              <button
                type="button"
                onClick={() => setShowColorPicker(true)}
                className="w-8 h-8 rounded-md border border-dashed border-gray-400 flex items-center justify-center hover:bg-gray-100"
              >
                <Plus size={18} className="text-gray-600" />
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  className="w-10 h-10 cursor-pointer border rounded"
                />
                <button
                  type="button"
                  onClick={() => {
                    setCustomColors((prev) => [...prev, newColor]);
                    setShowColorPicker(false);
                  }}
                  className="px-3 py-1 bg-[#096D48] text-white rounded-md text-sm"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setShowColorPicker(false)}
                  className="px-3 py-1 bg-gray-300 text-gray-800 rounded-md text-sm"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}
      />
      {errors?.colors && (
        <p className="text-xs text-red-500 mt-1">{errors.colors.message}</p>
      )}
    </div>
  );
};

export default ColorSelector;
