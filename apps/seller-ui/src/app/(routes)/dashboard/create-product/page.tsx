"use client";
import { useQuery } from '@tanstack/react-query';
import ImagePlaceHolder from 'apps/seller-ui/src/shared/components/image-placeholder';
import { enhancements } from 'apps/seller-ui/src/utils/AIEnhanceMents';
import axiosInstance from 'apps/seller-ui/src/utils/axiosInstance';
import { Plus, SquarePlus, Wand, X } from 'lucide-react';
import Image from 'next/image';
import ColorSelector from 'packages/components/color-selector';
import CustomProperties from 'packages/components/custom-properties';
import { CustomSpecifications } from 'packages/components/custom-specificatons';
import Input from 'packages/components/input';
import RichTextEditor from 'packages/components/rich-text-editor';
import SizeSelector from 'packages/components/size-selector';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

interface UploadedImage {
    fileId: string;
    file_url: string;
}

const CreateProduct = () => {
    const {
        register, control, watch, setValue, handleSubmit, formState: { errors }
    } = useForm();
    const [openImageModal, setOpenImageModal] = useState(false);
    const [pictureUploadingLoader, setPictureUploadingLoader] = useState(false);
    const [isChanged, setIsChanged] = useState(false);
    const [selectedImage, setSelectedImage] = useState("");
    const [images, setImages] = useState<(UploadedImage | null)[]>([null]);
    const [loading, setLoading] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [activeEffect, setActiveEffect] = useState<string | null>(null);
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        const storedToken = localStorage.getItem('accessToken');
        setToken(storedToken);
    }, []);

    const applyTransformation = (transformation: string) => {
        if (!selectedImage || processing) return;
        setProcessing(true);
        setActiveEffect(transformation);

        try {

            const transformationUrl = `${selectedImage}?tr=${transformation}`;
            setSelectedImage(transformationUrl);
        } catch (error) {
            console.log(error)
        } finally {
            setProcessing(false);
        }
    }

    const { data, isLoading, isError } = useQuery({
        queryKey: ["categories"],
        queryFn: async () => {
            try {
                const res = await axiosInstance.get("/product/api/get-categories");
                return res.data;
            } catch (error) {
                console.log(error);
            }
        },
        staleTime: 1000 * 60 * 5,
        retry: 2
    })

    const { data: discountCodes = [], isLoading: discountLoading } = useQuery({
        queryKey: ["shop-discounts", token],
        queryFn: async () => {
            const res = await axiosInstance.get("/product/api/get-discount-code", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            return res?.data?.discount_Codes || [];
        },
        enabled: !!token,
    })

    const categories = data?.categories || [];
    const subCategoriesData = data?.subCategories || {};

    const convertFileToBase64 = (file: File) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        })
    }

    const selectedCategory = watch("category");
    const regularPrice = watch("regular_price");

    const subCategories = useMemo(() => {
        return selectedCategory ? subCategoriesData[selectedCategory] || [] : [];
    }, [selectedCategory, subCategoriesData]);

    const onSubmit = async (data: any) => {

        setLoading(true);

        try {

            await axiosInstance.post("/product/api/create-product", data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
        } catch (error) {
            console.log("error", error);
        } finally {
            setLoading(false);
        }
    }

    const handleImageChange = async (file: File | null, index: number) => {
        if (!file) return;
        setPictureUploadingLoader(true);
        try {

            const dataUrl = (await convertFileToBase64(file)) as string;


            const response = await axiosInstance.post("/product/api/upload-product-image", { fileName: dataUrl }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const updatedImages = [...images];
            const uploadedImage = {
                fileId: response.data.fileId,
                file_url: response.data.file_url,
            }

            updatedImages[index] = uploadedImage;

            if (index === images.length - 1 && updatedImages.length < 8) {
                updatedImages.push(null);
            }

            setImages(updatedImages);
            setValue("images", updatedImages);
        } catch (error) {
            console.log("error", error);
        } finally {
            setPictureUploadingLoader(false)
        }
    }

    const handleRemoveImage = async (index: number) => {
        try {
            const updatedImages = [...images];

            const imageToDelete = updatedImages[index];
            if (imageToDelete && typeof imageToDelete === "object") {
                await axiosInstance.delete("/product/api/delete-product-image", {
                    data: {
                        fileId: imageToDelete.fileId!
                    }
                })
            }

            updatedImages.splice(index, 1);

            if (!updatedImages.includes(null) && updatedImages.length < 8) {
                updatedImages.push(null);
            }

            setImages(updatedImages);
            setValue("images", updatedImages);
        } catch (error) {
            console.log("error", error);
        }
    }

    const handleSaveDraft = () => {
        setIsChanged(true);
    }

    return (
        <>
            <form className='bg-black min-h-screen' onSubmit={handleSubmit(onSubmit)}>
                <div className='py-6 w-full flex gap-6'>
                    <div className='md:w-[30%] flex justify-center'>
                        {
                            images?.length > 0 && (
                                <ImagePlaceHolder
                                    index={0}
                                    size="745x850"
                                    small={false}
                                    images={images}
                                    pictureUploadingLoader={pictureUploadingLoader}
                                    onImageChange={handleImageChange}
                                    setSelectedImage={setSelectedImage}
                                    setOpenImageModal={setOpenImageModal}
                                    onRemove={handleRemoveImage}
                                />
                            )
                        }

                        <div className='grid grid-cols-2 gap-3 mt-4'>
                            {
                                images.slice(1).map((_, index) => (
                                    <ImagePlaceHolder
                                        size="765x850"
                                        small={false}
                                        images={images}
                                        onImageChange={handleImageChange}
                                        setSelectedImage={setSelectedImage}
                                        pictureUploadingLoader={pictureUploadingLoader}
                                        key={index}
                                        index={index + 1}
                                        setOpenImageModal={setOpenImageModal}
                                        onRemove={handleRemoveImage}
                                    />
                                ))
                            }
                        </div>
                    </div>

                    <div className='md:w-[65%]'>
                        <div className='w-full flex gap-6'>
                            <div className='w-2/4 flex flex-col justify-evenly'>
                                <Input
                                    label='Product Title *'
                                    placeholder='Enter Product Title'
                                    {...register("title", { required: "Title is required" })}
                                />
                                {
                                    errors.title && (
                                        <p className='text-red-500 text-xs mt-1'>
                                            {errors.title.message as string}
                                        </p>
                                    )
                                }

                                <div className='mt-2 '>
                                    <Input
                                        label="Short Description * (Max 150 words)"
                                        type="textarea"
                                        rows={7}
                                        cols={10}
                                        placeholder="Enter a short description for quick view"
                                        {...register("shortDescription", {
                                            required: "Short description is required",
                                            validate: (value) => {
                                                const wordCount = value.trim().split(/\s+/).length;
                                                return (
                                                    wordCount <= 150 || `Description cannot exceed 150 words`
                                                )
                                            }
                                        })}
                                        error={errors.shortDescription?.message as string}
                                    />
                                    {
                                        errors.description && (
                                            <p className='text-red-500 text-xs mt-1'>
                                                {errors.description.message as string}
                                            </p>
                                        )
                                    }
                                </div>
                                <div className='mt-2 '>
                                    <Input
                                        label="Tags *"

                                        placeholder="apple, flagship"
                                        {...register("tags", {
                                            required: "Seperated related products tags with a coma,",
                                        })}
                                    />
                                    {
                                        errors.tags && (
                                            <p className='text-red-500 text-xs mt-1'>
                                                {errors.tags.message as string}
                                            </p>
                                        )
                                    }
                                </div>
                                <div className='mt-2 '>
                                    <Input
                                        label="Warranty *"

                                        placeholder="e.g., 6 months, 1 year, No warranty"
                                        {...register("warranty", {
                                            required: "Please provide warranty information",
                                        })}
                                    />
                                    {errors.warranty && (
                                        <p className='text-red-500 text-xs mt-1'>
                                            {errors.warranty.message as string}
                                        </p>
                                    )}
                                </div>

                                <div className='mt-2 '>
                                    <Input
                                        label="Product Slug *"
                                        placeholder="product_slug"
                                        {...register("slug", {
                                            required: "Product slug is required",
                                            pattern: {
                                                value: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                                                message: "Slug can only contain lowercase letters, numbers, and hyphens",
                                            },
                                            minLength: {
                                                value: 2,
                                                message: "Slug must be at least 3 characters long"
                                            },
                                            maxLength: {
                                                value: 50,
                                                message: "Slug cannot be longer than 50 characters"
                                            }
                                        })}
                                    />
                                    {errors.slug && (
                                        <p className='text-red-500 text-xs mt-1'>
                                            {errors.slug.message as string}
                                        </p>
                                    )}
                                </div>

                                <div className='mt-2 '>
                                    <Input
                                        label="Brand *"

                                        placeholder="e.g., Apple, Samsung"
                                        {...register("brand", {
                                            required: "Brand is required",
                                            minLength: {
                                                value: 2,
                                                message: "Brand name must be at least 2 characters",
                                            },
                                        })}
                                    />
                                    {errors.brand && (
                                        <p className='text-red-500 text-xs mt-1'>
                                            {errors.brand.message as string}
                                        </p>
                                    )}
                                </div>

                                <div className='mt-2'>
                                    <ColorSelector control={control} errors={errors} />
                                </div>
                                <div className='mt-2'>
                                    <CustomSpecifications control={control} errors={errors} />
                                </div>

                                <div className='mt-2'>
                                    <CustomProperties control={control} errors={errors} />
                                </div>

                                <div className='mt-2 '>
                                    <label className='text-gray-100'>
                                        Delivery Option
                                    </label>
                                    <select
                                        {
                                        ...register("cashOnDelivery", {
                                            required: "Cash On Delivery is required",
                                        })}
                                        defaultValue="yes"
                                        className='w-full border outline-none border-gray-700 text-gray-100 bg-transparent py-2'
                                    >
                                        <option value="yes" className='bg-gray-900 text-white'>Yes</option>
                                        <option value="no" className='bg-gray-900 text-white'>No</option>
                                    </select>
                                    {errors.cashOnDelivery && (
                                        <p className='text-red-500 text-xs mt-1'>
                                            {errors.cashOnDelivery.message as string}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className='w-2/4 flex flex-col justify-evenly mb-8'>
                                <label className="block font-semibold text-gray-100 text-sm tracking-wide">
                                    Category <span className="text-red-500">*</span>
                                </label>

                                {isLoading ? (
                                    <p className="text-gray-400 text-sm animate-pulse">Loading categories...</p>
                                ) : isError ? (
                                    <p className="text-red-400 text-sm">⚠️ Failed to load categories</p>
                                ) : (
                                    <Controller
                                        name="category"
                                        control={control}
                                        rules={{ required: "Category is required" }}
                                        render={({ field }) => (
                                            <select
                                                {...field}
                                                className="w-full rounded-lg border border-gray-600 bg-gray-50 px-3 py-2 text-black text-sm focus:ring-2 focus:ring-green-500 focus:outline-none transition"
                                            >
                                                <option value="" className="bg-gray-900 text-white">
                                                    Select a category
                                                </option>
                                                {categories?.map((category: string) => (
                                                    <option
                                                        value={category}
                                                        key={category}
                                                        className="bg-gray-900 text-gray-200"
                                                    >
                                                        {category}
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                    />
                                )}
                                {errors?.category && (
                                    <p className="text-red-500 text-xs mt-1">{errors.category.message as string}</p>
                                )}

                                <div className="mt-2">
                                    {selectedCategory && subCategories.length > 0 && (
                                        <div className="w-full">
                                            <label className="block font-semibold text-black text-sm tracking-wide">
                                                SubCategory <span className="text-red-500">*</span>
                                            </label>

                                            <Controller
                                                name="subCategory"
                                                control={control}
                                                rules={{ required: "SubCategory is required" }}
                                                render={({ field }) => (
                                                    <select
                                                        {...field}
                                                        className="w-full rounded-xl border border-gray-600 bg-gray-100/50 px-3 py-2 text-black text-sm focus:ring-2 focus:ring-green-500 focus:outline-none transition"
                                                    >
                                                        <option value="" className="bg-gray-900 text-gray-200">
                                                            Select subcategory
                                                        </option>
                                                        {subCategories.map((subCategory: string) => (
                                                            <option
                                                                value={subCategory}
                                                                key={subCategory}
                                                                className="bg-gray-900 text-gray-200"
                                                            >
                                                                {subCategory}
                                                            </option>
                                                        ))}
                                                    </select>
                                                )}
                                            />

                                            {errors?.subCategory && (
                                                <p className="text-red-500 text-xs mt-1">
                                                    {errors.subCategory.message as string}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="w-full">
                                    <label className='block font-semibold text-gray-100 mb-1'>Detailed Description*(Min 100 words)</label>
                                    <Controller
                                        name="detailedDescription"
                                        control={control}
                                        defaultValue=""
                                        rules={{
                                            required: "Detailed description is required!",
                                            // validate: (value) => {
                                            //     // Remove all HTML tags
                                            //     const textOnly = value.replace(/<[^>]+>/g, "").trim();
                                            //     const wordCount = textOnly.split(/\s+/).filter(Boolean).length;

                                            //     return wordCount >= 100 || "Description must be at least 100 words!";
                                            // },
                                        }}
                                        render={({ field }) => (
                                            <div className="w-full">
                                                <RichTextEditor
                                                    value={field.value || ""}
                                                    onChange={(val) => field.onChange(val)}
                                                />
                                                {errors?.detailedDescription && (
                                                    <p className="text-red-500 text-xs mt-1">
                                                        {errors.detailedDescription.message as string}
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    />
                                </div>

                                <div className="w-full mt-2">
                                    <Input
                                        label="Video URL"

                                        placeholder="https://www.youtube.com/embed/xty678"
                                        {...register("videoUrl", {
                                            pattern: {
                                                value: /^https:\/\/(www\.)?.youtube\.com\/embed\/[a-zA-Z0-9_-]+$/,
                                                message: "Invalid Youtube embed URL! Use format: https://www.youtube.com"
                                            }
                                        })}
                                    />
                                    {errors?.videoUrl && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors.videoUrl.message as string}
                                        </p>
                                    )}
                                </div>

                                <div className="w-full mt-2">
                                    <Input
                                        label="Regular Price"
                                        placeholder="20$"
                                        {...register("regularPrice", {
                                            valueAsNumber: true,
                                            min: { value: 1, message: "Price must be atleast 1" },
                                            validate: (value) =>
                                                !isNaN(value) || "Only numbers are allowed"
                                        })}
                                    />
                                    {errors?.regularPrice && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors.regularPrice.message as string}
                                        </p>
                                    )}
                                </div>

                                <div className="w-full mt-2">
                                    <Input
                                        label="Sale Price *"
                                        placeholder="15$"
                                        {...register("salePrice", {
                                            required: "Sale Price is required",
                                            valueAsNumber: true,
                                            min: { value: 1, message: "Sale Price must be atleast 1" },
                                            validate: (value) => {
                                                if (isNaN(value)) return "Only numbers are allowed";
                                                if (regularPrice && value >= regularPrice) {
                                                    return "Sale Price must be less than Regular Price";
                                                }
                                                return true;
                                            }
                                        })}
                                    />
                                    {errors?.salePrice && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors.salePrice.message as string}
                                        </p>
                                    )}
                                </div>

                                <div className="w-full mt-2">
                                    <Input
                                        label="Stock *"
                                        placeholder="100"
                                        {...register("stock", {
                                            required: "Stock is required",
                                            valueAsNumber: true,
                                            min: { value: 1, message: "Stock must be atleast 1" },
                                            max: { value: 1000, message: "Stock cannot exceed 1000" },
                                            validate: (value) => {
                                                if (isNaN(value)) return "Only numbers are allowed";
                                                if (regularPrice && value >= regularPrice) {
                                                    return "Stock must be a whole number!";
                                                }
                                                return true;
                                            }
                                        })}
                                    />
                                    {errors?.sale_price && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors.sale_price.message as string}
                                        </p>
                                    )}
                                </div>

                                <div className="w-full">
                                    <SizeSelector control={control} errors={errors} />
                                </div>

                                <div className="w-full mt-4 mb-2">
                                    <label className='text-gray-100'>Select Discount Codes (optional)</label>
                                    {
                                        discountLoading ? (
                                            <p>Loading Discount codes..</p>
                                        ) : (
                                            <div>
                                                {
                                                    discountCodes?.map((code: any) => (
                                                        <button key={code.id}
                                                            type='button'
                                                            className={`px-3 py-1 rounded-md text-sm font-semibold border ${watch("discountCodes")?.includes(code.id)
                                                                ? " bg-blue-700 text-white border-blue-700" : "bg-gray-800 text-gray-300 border-gray-600"
                                                                }`}
                                                            onClick={() => {
                                                                const currentSelection = watch("discountCodes") || [];
                                                                const updatedSelection = currentSelection?.includes(code.id) ? currentSelection.filter((id: string) => id !== code.id) : [...currentSelection, code.id];
                                                                setValue("discountCodes", updatedSelection);
                                                            }}
                                                        >
                                                            {code?.public_name}
                                                            ({code.discountValue} {code.discountType === "percentage" ? "%" : "$"})
                                                        </button>
                                                    ))
                                                }
                                            </div>
                                        )
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {openImageModal && (
                    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-[90%] max-w-3xl p-6 relative">

                            <div className="flex justify-between items-center border-b pb-3">
                                <h2 className="text-xl font-semibold text-gray-200 dark:text-gray-200">
                                    Enhance Product Image
                                </h2>
                                <X
                                    size={22}
                                    className="cursor-pointer text-gray-500 hover:text-gray-800 dark:hover:text-gray-300"
                                    onClick={() => setOpenImageModal(false)}
                                />
                            </div>

                            <div className="mt-4 relative w-full h-72 rounded-lg overflow-hidden border">
                                <Image
                                    src={selectedImage}
                                    alt="preview"
                                    fill
                                    unoptimized
                                />
                            </div>

                            {selectedImage && (
                                <div className="mt-6">
                                    <h3 className="text-lg font-medium text-gray-200 dark:text-gray-300 mb-3">
                                        AI Enhancements
                                    </h3>
                                    <div className="flex flex-wrap gap-3">
                                        {enhancements?.map(({ label, effect }) => (
                                            <button
                                                key={effect}
                                                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200 
                ${activeEffect === effect
                                                        ? "bg-blue-600 text-white"
                                                        : "bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200"
                                                    }`}
                                                onClick={() => applyTransformation(effect)}
                                                disabled={processing}
                                            >
                                                <Wand size={18} />
                                                {label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <div className="mt-6 flex justify-center gap-3">
                    {
                        isChanged && (
                            <button
                                type='button'
                                onClick={handleSaveDraft}
                                className=''
                            >
                                Save Draft
                            </button>

                        )
                    }

                    <button
                        type='submit'
                        disabled={loading}
                        className='px-12 py-4 bg-purple-700 text-white hover:bg-purple-800 rounded-md ml-4 mb-8 flex gap-2'
                    >
                        {loading ? "Creating ..." : <> Create <Plus /></>}
                    </button>

                </div>
            </form>
        </>
    )
}

export default CreateProduct;
