"use client";
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axiosInstance from 'apps/seller-ui/src/utils/axiosInstance';
import { BarChart, ChevronRight, Pencil, Plus, Search, Star, Trash } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useMemo, useState } from 'react'
import { useReactTable, getCoreRowModel, getFilteredRowModel, flexRender } from "@tanstack/react-table";
import DeleteConfirmationModal from 'apps/seller-ui/src/shared/components/modals/delete-conformation-modal';
import Loader from 'apps/seller-ui/src/shared/components/loader';

const fetchProducts = async (token: string) => {
  const res = await axiosInstance.get("/product/api/get-shop-products", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data.products;
};

const deleteProduct = async () => {
  const res = await axiosInstance.get("/product/api/delete-product");
  return res.data;
};

const restoreProduct = async () => {
  const res = await axiosInstance.get("/product/api/restore-product");
  return res.data;
};

const AllProducts = () => {
  const [globalFilter, setGlobalFilter] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>();
  const queryClient = useQueryClient();

  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('accessToken');
    setToken(storedToken);
  }, []);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["shop-products", token],
    queryFn: () => fetchProducts(token as string),
    staleTime: 1000 * 60 * 5,
    enabled: !!token,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shop-products"] });
      setShowDeleteModal(false);
    },
  });

  const restoreMutation = useMutation({
    mutationFn: restoreProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shop-products"] });
    },
  });

  const openDeleteModal = (product: any) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "image",
        header: "Image",
        cell: ({ row }: any) => (
          <Image
            src={row.original.images[0]?.file_url}
            alt={row.original.title}
            width={48}
            height={48}
            className="w-12 h-12 rounded-md object-cover"
          />
        ),
      },
      {
        accessorKey: "name",
        header: "Product Name",
        cell: ({ row }: any) => {
          const truncatedTitle =
            row.original.title.length > 25
              ? `${row.original.title.substring(0, 25)}...`
              : row.original.title;

          return (
            <Link
              href={`${process.env.NEXT_PUBLIC_USER_UI_LINK}/product/${row.original.slug}`}
              className="text-blue-500 hover:underline font-medium"
              title={row.original.title}
            >
              {truncatedTitle}
            </Link>
          );
        },
      },
      {
        accessorKey: "price",
        header: "Price",
        cell: ({ row }: any) => <span>${row.original.salePrice}</span>,
      },
      {
        accessorKey: "stock",
        header: "Stock",
        cell: ({ row }: any) => (
          <span
            className={`${row.original.stock < 10 ? "text-red-500" : "text-gray-200"
              }`}
          >
            {row.original.stock} left
          </span>
        ),
      },
      {
        accessorKey: "rating",
        header: "Rating",
        cell: ({ row }: any) => (
          <div className="flex items-center gap-1">
            <Star fill="#fde047" size={16} />
            <span>{row.original.ratings || 5}</span>
          </div>
        ),
      },
      {
        accessorKey: "actions",
        header: "Actions",
        cell: ({ row }: any) => (
          <div className="flex gap-3 items-center">
            <Link href={`/dashboard/edit/${row.original.id}`}>
              <Pencil size={18} className="text-blue-400 hover:text-blue-300" />
            </Link>
            <button className="text-green-400 hover:text-green-300 transition">
              <BarChart size={18} />
            </button>
            <button
              className="text-red-400 hover:text-red-300 transition"
              onClick={() => openDeleteModal(row.original)}
            >
              <Trash size={18} />
            </button>
          </div>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: products,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: "includesString",
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
  });

  return (
    <div className="p-6">

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-100">All Products</h2>
        <Link
          href="/dashboard/create-product"
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg shadow"
        >
          <Plus size={18} />
          Add Product
        </Link>
      </div>


      <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
        <Link href="/dashboard" className="hover:underline">
          Dashboard
        </Link>
        <ChevronRight size={16} />
        <span className="text-gray-300">All Products</span>
      </div>


      <div className="flex items-center bg-gray-800 px-3 py-2 rounded-lg mb-6">
        <Search size={18} className="text-gray-400 mr-2" />
        <input
          type="text"
          placeholder="Search products ..."
          className="w-full bg-transparent text-white outline-none"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-700">
        {isLoading ? (
          <Loader isLoading={isLoading} />
        ) : (
          <table className="min-w-full text-left text-sm text-gray-300">
            <thead className="bg-gray-800 text-gray-400 uppercase text-xs">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="px-4 py-3">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-gray-700">
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-gray-800 transition duration-150"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showDeleteModal && (
        <DeleteConfirmationModal
          product={selectedProduct}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={() => deleteMutation.mutate(selectedProduct?.id)}
          onRestore={() => restoreMutation.mutate(selectedProduct?.id)}
        />
      )}

    </div>
  );
};

export default AllProducts;
