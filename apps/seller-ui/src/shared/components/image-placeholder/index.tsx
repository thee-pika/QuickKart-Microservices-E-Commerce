import { Pencil, WandSparkles, X } from 'lucide-react';
import Image from 'next/image';
import React, { useState } from 'react'

const ImagePlaceHolder = ({
    size, small, onImageChange, onRemove, defaultImage = null, index = null, images, setOpenImageModal, setSelectedImage, pictureUploadingLoader
}: {
    size: string;
    small?: boolean;
    images: any[];
    pictureUploadingLoader: boolean;
    setSelectedImage: (e: string) => void;
    onImageChange: (file: File | null, index: number) => void;
    onRemove?: (index: number) => void;
    setOpenImageModal: (openImageModal: boolean) => void;
    defaultImage?: string | null;
    index?: any;
}) => {
    const [imagePreview, setImagePreview] = useState<string | null>(defaultImage);
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setImagePreview(URL.createObjectURL(file));
            onImageChange(file, index!);
        }
    }

    return (
        <div className={`relative ${small ? "h-[180px] w-[180px]" : "h-[350px] w-[350px]"} cursor-pointer bg-[#1e1e1e] border border-gray-600 rounded-lg flex items-center justify-center flex-col`}>
            <input
                type="file"
                accept="image/*"
                className="hidden"
                id={`image-upload-${index}`}
                onChange={handleFileChange}
            />
            {
                imagePreview ? (
                    <>
                        <button
                            type='button'
                            disabled={pictureUploadingLoader}
                            onClick={() => onRemove?.(index!)}
                            className='absolute top-3 right-3 p-2 !rounded bg-red-600 shadow-lg'
                        >
                            <X size={16} />
                        </button>
                        <button
                            disabled={pictureUploadingLoader}
                            className='absolute top-3 right-12 p-2 rounded-md bg-blue-500 shadow-lg'
                            onClick={() => {
                                setOpenImageModal(true);
                                setSelectedImage(images[index].file_url)
                            }}
                        >
                            <WandSparkles size={16} />
                        </button>
                    </>
                ) : (
                    <label
                        htmlFor={`image-upload-${index}`}
                        className='absolute top-3 right-3 p-2 rounded! bg-slate-700 shadow-lg cursor-pointer'
                    >
                        <Pencil size={16} />
                    </label>
                )}
            {
                imagePreview ? (
                    <Image
                        src={imagePreview}
                        width={400}
                        height={400}
                        alt='uploaded'
                        className='w-full h-full object-cover rounded-md'
                    />
                ) : (
                    <>
                        <p className={`text-gray-400 ${small ? "text-xl" : "text-4xl"}`}>
                            {size}
                        </p>
                        <p className={`text-gray-500 ${small ? "text-sm" : "text-lg"} pt-2 text-center`}>
                            Please choose an image <br />
                            according to the expected ratio
                        </p>
                    </>
                )
            }
        </div>
    )
}

export default ImagePlaceHolder;
