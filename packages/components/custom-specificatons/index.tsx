import { Controller, useFieldArray } from "react-hook-form"
import Input from "../input"
import { PlusCircle, Trash2 } from "lucide-react"

export const CustomSpecifications = ({ control, errors }: any) => {
    // const [properties, setProperties] = useState<{ label: string; value: string[] }[]>([]);
    // const [newLabel, setNewLabel] = useState("");
    // const [newValue, setNewValue] = useState("");

    const { fields, append, remove } = useFieldArray({
        control,
        name: "customSpecifications"
    })

    return (
        <div>
            <label className="block font-semibold text-gray-900 mb-1">Custom Specifications</label>
            <div className="flex flex-col gap-3">
                {fields?.map((item, index) => (
                    <div key={index} className="flex gap-2 items-center">
                        <Controller
                            name={`customSpecifications.${index}.name`}
                            control={control}
                            rules={{ required: "specification name is required" }}
                            render={({ field }) => (
                                <Input
                                    label="Specification name"
                                    placeholder="e.g., Battery Life, weight , Material"
                                    {...field}
                                />
                            )}
                        />
                        <Controller
                            name={`customSpecifications.${index}.value`}
                            control={control}
                            rules={{ required: " value is required" }}
                            render={({ field }) => (
                                <Input
                                    label="value"
                                    placeholder="e.g., 4000mAh, 1.5kg, Plastic"
                                    {...field}
                                />
                            )}
                        />
                        <button
                            type="button"
                            className="text-red-500 hover:text-red-700 "
                            onClick={() => remove(index)}
                        >
                            <Trash2 size={20} />
                        </button>

                    </div>
                ))}
                <button

                    className="text-blue-500 hover:text-blue-700 flex items-center gap-2 cursor-pointer"
                    onClick={() => append({ name: "", value: "" })}
                >
                    <PlusCircle size={20} /> Add Specification
                </button>
                {
                    errors?.customSpecifications && (
                        <p className='text-red-500 text-xs mt-1'>
                            {errors.customSpecifications.message as string}
                        </p>
                    )
                }
            </div>
        </div>
    )
}
