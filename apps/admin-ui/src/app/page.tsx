"use client";
import { useEffect, useRef, useState } from "react";
import { Pencil } from "lucide-react";
import useAdmin from "../hooks/useAdmin";
import axiosInstance from "../utils/axiosInstance";
import Loader from "../shared/components/Loader";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Index() {
  const router = useRouter();
  const { admin, isLoading, refetch } = useAdmin();
  const [followers, setFollowers] = useState(1200);
  const [isEditing, setIsEditing] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  useEffect(() => {
    if (admin) {
      setFormData({
        name: admin.name || "",
        email: admin.email || "",
      });
    }
  }, [admin]);

  useEffect(() => {
    const storedToken = localStorage.getItem('accessToken');

    setToken(storedToken);
  }, []);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleAvatarChange = () => {

    fileInputRef.current?.click();
  };

  const convertFileToBase64 = (file: File) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    })
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {

    const selectedFile = e.target.files?.[0];

    if (!selectedFile || !token) {
      return;
    }

    const dataUrl = (await convertFileToBase64(selectedFile)) as string;

    try {
      const response = await axiosInstance.put(
        "/admin/api/update-avatar",
        { fileName: dataUrl },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data?.file_url) {

        await refetch();
      }

    } catch (error) {
      console.error("Error updating avatar", error);
      alert("Error updating avatar");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    try {
      const response = await axiosInstance.put('/admin/api/update-user-details', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        await refetch();
      }

    } catch (error) {
      console.error(error);
    } finally {
      setIsEditing(false);
    }
  };

  useEffect(() => {
    if (!isLoading && !admin) {
      router.push("/login");
    }
  }, [isLoading, admin, router]);

  if (isLoading) {
    return <Loader isLoading={isLoading} />
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Link href="/dashboard">
        <h1 className="text-blue-700 bg-black p-4 hover:text-blue-900 ">Back To Dashboard </h1>
      </Link>
      <div className="h-96 bg-black flex items-center justify-center p-8">
        <div className="text-center text-white">
          <h1 className="text-4xl font-bold">Welcome Back, {admin?.name}</h1>
          <p className="mt-4 text-gray-300">
            Manage your shop and update your profile details below.
          </p>
        </div>
      </div>

      <div className="h-96 relative p-8 bg-gray-100">
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/4 w-full max-w-md bg-purple-700 rounded-3xl shadow-xl p-8 flex flex-col items-center">

          <div className="relative group">
            <img
              src={
                Array.isArray(admin?.avatar) && admin?.avatar.length > 0
                  ? admin?.avatar[0].file_url
                  : "https://ik.imagekit.io/m3hqvlyteo/products/sellerprofile.webp"
              }
              alt={admin?.name || "Admin"}
              className="w-32 h-32 rounded-full border-4 border-white object-cover shadow-lg"
            />
            <div
              onClick={handleAvatarChange}
              className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-black bg-opacity-60 flex items-center justify-center text-white cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
              title="Update Avatar"
            >
              <Pencil className="w-5 h-5" />
            </div>

            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>

          <h1 className="text-3xl font-bold text-white mt-4">{admin?.name || admin?.name}</h1>
          <p className="text-gray-200 mt-1">{admin?.email || "No Admin Email"}</p>
          <div className="flex gap-4 mt-3 text-sm text-gray-300">

            <p>👥 {followers} Followers</p>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="mt-6 px-6 py-2 bg-black text-purple-400 font-semibold rounded-lg shadow-md hover:bg-purple-600 hover:text-white transition-colors duration-200"
          >
            {isEditing ? "Cancel" : "Update Details"}
          </button>

          {isEditing && (
            <div className="mt-6 w-full bg-black bg-opacity-50 p-6 rounded-xl flex flex-col gap-4">
              <div>
                <label className="block text-gray-300 text-sm">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-2 rounded-lg bg-gray-800 border border-purple-500 text-white focus:outline-none focus:border-purple-300"
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-2 rounded-lg bg-gray-800 border border-purple-500 text-white focus:outline-none focus:border-purple-300"
                />
              </div>
              <button
                onClick={handleUpdate}
                className="mt-4 px-6 py-2 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-500 transition-colors duration-200"
              >
                Save Changes
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
