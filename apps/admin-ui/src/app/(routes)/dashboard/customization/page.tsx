'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Pencil } from 'lucide-react';
import axiosInstance from 'apps/admin-ui/src/utils/axiosInstance';

interface CustomizationT {
  id: string
  logoUrl?: string;
  userId: string;
  logoFileId?: string;
  bannerUrl?: string;
  brandName?: string;
  bannerFileId?: string;
}

const Page = () => {
  const [logo, setLogo] = useState('/logo.png');
  const [banner, setBanner] = useState('/logo.png');
  const [brandName, setBrandName] = useState('UserPanel');
  const [editing, setEditing] = useState<'brand' | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [customization, setCustomization] = useState<CustomizationT | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('accessToken');

    setToken(storedToken);
    getCustomization(storedToken as string);
  }, []);

  useEffect(() => {
    if (customization) {
      setLogo(customization.logoUrl || '/logo.png');
      setBanner(customization.bannerUrl || '/logo.png');
      setBrandName(customization.brandName || 'UserPanel');
    }
  }, [customization]);

  const getCustomization = async (token: string) => {
    const response = await axiosInstance.get(
      "/admin/api/get-all-customizations",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    setCustomization(response.data.customization);
  }

  const convertFileToBase64 = (file: File) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    })
  }

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'logo' | 'banner'
  ) => {
    const file = e.target.files?.[0];

    if (!file || !token) {

      return;
    }

    const dataUrl = (await convertFileToBase64(file)) as string;
    const response = await axiosInstance.put(
      "/admin/api/update-logo-or-banner",
      { fileName: dataUrl, field },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (field === "logo") {
      setLogo(response.data.customization.logoUrl);
    } else {
      setBanner(response.data.customization.bannerUrl);
    }

  };

  const handleBrandSave = async (value: string) => {
    const response = await axiosInstance.put(
      "/admin/api/update-brand",
      { value },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    setBrandName(response.data.customization.brandName);
    setEditing(null);
  };

  return (
    <div className="bg-black text-purple-400 flex items-center justify-center min-h-screen font-bold">
      <div className="bg-gray-900 rounded-2xl p-6 w-[420px] shadow-2xl space-y-6">
     
        <h2 className="text-2xl text-center mb-6 text-purple-300">
          Customization Panel
        </h2>

        <div className="bg-gray-800 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={logo} alt="logo" className="w-16 h-16 rounded-lg border border-gray-600" />
            <span className="text-lg">Logo</span>
          </div>
          <button
            className="hover:text-purple-300"
            onClick={() => logoInputRef.current?.click()}
          >
            <Pencil className="w-5 h-5" />
          </button>
          <input
            ref={logoInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileChange(e, 'logo')}
          />
        </div>

        <div className="bg-gray-800 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={banner} alt="banner" className="w-24 h-16 rounded-lg border border-gray-600" />
            <span className="text-lg">Banner</span>
          </div>
          <button
            className="hover:text-purple-300"
            onClick={() => imageInputRef.current?.click()}
          >
            <Pencil className="w-5 h-5" />
          </button>
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileChange(e, 'banner')}
          />
        </div>

        <div className="bg-gray-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-lg">{brandName}</span>
            <button
              className="hover:text-purple-300"
              onClick={() => setEditing(editing === 'brand' ? null : 'brand')}
            >
              <Pencil className="w-5 h-5" />
            </button>
          </div>

          {editing === 'brand' && (
            <div className="mt-3 space-y-2">
              <input
                className="w-full rounded p-2 bg-gray-700 text-white focus:outline-none focus:ring focus:ring-purple-400"
                type="text"
                defaultValue={brandName}
                onKeyDown={(e) =>
                  e.key === 'Enter' &&
                  handleBrandSave((e.target as HTMLInputElement).value)
                }
              />
              <button
                className="w-full bg-purple-500 hover:bg-purple-600 px-3 py-2 rounded text-white font-semibold"
                onClick={() =>
                  handleBrandSave(
                    document.querySelector<HTMLInputElement>('input')?.value ||
                    brandName
                  )
                }
              >
                Save
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Page;
