import { useMutation } from '@tanstack/react-query';
import { shopCategories } from 'apps/seller-ui/src/utils/categories';
import axios from 'axios';
import { useForm } from 'react-hook-form';

const CreateShop = ({
  sellerId,
  setCurrentStep,
}: {
  sellerId: string;
  setCurrentStep: (step: number) => void;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const shopCreateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URI}/api/create-shop`,
        data
      );

      return response.data;
    },
    onSuccess: () => {
      setCurrentStep(3);
    },
  });

  const onSubmit = (data: any) => {
    const shopData = { ...data, sellerId };
    shopCreateMutation.mutate(shopData);
  };

  const countWords = (text: string) => text.trim().split(/\s+/).length;

  return (
    <div className="bg-white  p-8 w-full max-w-md">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
        Setup new shop
      </h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name *
          </label>
          <input
            type="text"
            {...register('name', { required: 'Name is required' })}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#345635]"
            placeholder="Enter your name"
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">
              {errors.name.message as string}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bio (Max 100 Words)*
          </label>
          <input
            type="text"
            {...register('bio', {
              required: 'bio is required',
              validate: (value: string) =>
                countWords(value) <= 100 || "Bio can't be exceed 100 words",
            })}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Enter your shop bio"
          />
          {errors.bio && (
            <p className="text-red-500 text-sm mt-1">
              {errors.bio.message as string}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address *
          </label>
          <input
            type="text"
            {...register('address', { required: 'address is required' })}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="shop location"
          />
          {errors.address && (
            <p className="text-red-500 text-sm mt-1">
              {errors.address.message as string}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Opening Hours *
          </label>
          <input
            type="text"
            {...register('opening_hours', {
              required: 'opening_hours is required',
            })}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="e.g., MON-FRI 9AM-6PM"
          />
          {errors.opening_hours && (
            <p className="text-red-500 text-sm mt-1">
              {errors.opening_hours.message as string}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Website
          </label>
          <input
            type="url"
            {...register('website', {
              pattern: {
                value: /^(https?:\/\/)?([\w\d-]+\.)+\w{2,}(\/.*)?/,
                message: 'Enter a valid website url',
              },
            })}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="http://example.com"
          />
          {errors.website && (
            <p className="text-red-500 text-sm mt-1">
              {errors.website.message as string}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category *
          </label>
          <select
            defaultValue=""
            {...register('category', {
              required: 'category is required',
            })}
            className="w-full border border-gray-300 outline-0 rounded-lg px-4 py-2 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#345635] focus:border-[#345635] transition"
          >
            <option value="" disabled>
              Select Your category
            </option>
            {shopCategories.map((category, index) => (
              <option key={index} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="text-red-500 text-sm mt-1">
              {errors.category.message as string}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={shopCreateMutation.isPending}
          className="w-full bg-[#345635] text-white font-semibold py-2 px-4 rounded-lg hover:bg-[#2b462b] transition"
        >
          {shopCreateMutation.isPending ? 'creating...' : 'Create Shop'}
        </button>
      </form>
    </div>
  );
};

export default CreateShop;
