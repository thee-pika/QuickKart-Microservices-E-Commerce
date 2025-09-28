"use client";
import { useQuery } from '@tanstack/react-query';
import Loader from '../shared/components/Loader';
import SectionTitle from '../shared/components/section/section-title';
import Hero from '../shared/modules/hero';
import axiosInstance from '../utils/axiosInstance';
import ProductCard from '../shared/components/cards/product-card';
import ShopCard from '../shared/components/cards/shop-card';
import { useEffect, useState } from 'react';
import useUser from '../hooks/useUser';

const Page = () => {
  const [token, setToken] = useState<string | null>(null);
  const { user, isLoading } = useUser();
  useEffect(() => {
    const storedToken = localStorage.getItem("accessToken");
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const { data: products, isError: isSuggestedProductsError, isLoading: isSuggestedProductsLoading } = useQuery({
    queryKey: ["suggested-products", token],
    queryFn: async () => {
      const res = await axiosInstance.get("/recommendation/api/get-recommendation-products", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return res.data.recommendations
    },
    staleTime: 1000 * 60 * 2,
    enabled: !!token
  });

  const { data: latestProducts, isError, isLoading: isLatestProductsLoading } = useQuery({
    queryKey: ["latest-products"],
    queryFn: async () => {
      const res = await axiosInstance.get("/product/api/get-all-products?page=1&limit=10&type=latest");
      return res.data.products
    },
    staleTime: 1000 * 60 * 2
  });

  const { data: shops, isLoading: isShopsLoading } = useQuery({
    queryKey: ["shops"],
    queryFn: async () => {
      const res = await axiosInstance.get("/product/api/top-shops/");
      return res.data.shops
    },
    staleTime: 1000 * 60 * 2
  })

  const { data: offers, isLoading: isOffersLoading } = useQuery({
    queryKey: ["offers"],
    queryFn: async () => {
      const res = await axiosInstance.get("/product/api/get-all-events?page=1&limit=10");
      return res.data.events
    },
    staleTime: 1000 * 60 * 2
  })

  return (
    <div>
      <Hero />
      <div>
        <div>
          {
            user && !isLoading && (
              <>
                <div>
                  <SectionTitle title={"Suggested Products"} />
                </div>
                {
                  isSuggestedProductsLoading && <Loader />
                }

                {
                  !isSuggestedProductsLoading && !isSuggestedProductsError && (
                    <div className='grid grid-cols-1 sm:grid-cols-3 gap-2 md:grid-cols-5'>
                      {
                        products?.map((product: any) => (
                          <ProductCard key={product.id} product={product} />
                        ))
                      }
                    </div>
                  )
                }
              </>
            )
          }
        </div>

        {products?.length === 0 && <p>No Products available yet!</p>}

        <div>
          <SectionTitle title={"Latest Products"} />
        </div>
        {
          isLatestProductsLoading && <Loader />
        }

        {
          !isLatestProductsLoading && !isError && (
            <div className='grid grid-cols-1 sm:grid-cols-3 gap-2 md:grid-cols-5 m-6'>
              {
                latestProducts?.map((product: any) => (
                  <ProductCard key={product.id} product={product} />
                ))
              }
            </div>
          )
        }

        {latestProducts?.length === 0 && <p>No Products available yet!</p>}

        <div className='mt-8 mb-20'>
          <SectionTitle title={"Top Shops"} />
        </div>
        {
          isShopsLoading && <Loader />
        }
        {
          !isShopsLoading && (
            <div className='grid grid-cols-1 sm:grid-cols-3 gap-2 md:grid-cols-5 m-6'>
              {
                shops?.map((shop: any) => (
                  <ShopCard key={shop.id} shop={shop} />
                ))
              }
            </div>
          )
        }

        {shops?.length === 0 && <p>No shops available yet!</p>}

        <div >
          <SectionTitle title={"Top Offers"} />
        </div>
        {
          isOffersLoading && <Loader />
        }
        {
          !isOffersLoading && (
            <div className='grid grid-cols-1 sm:grid-cols-3 gap-2 md:grid-cols-5 m-6'>
              {
                offers?.map((offer: any) => (
                  <ProductCard key={offer.id} product={offer} />
                ))
              }
            </div>
          )
        }

        {offers?.length === 0 && <p>No offers available yet!</p>}
      </div>
    </div>
  )
}

export default Page;

