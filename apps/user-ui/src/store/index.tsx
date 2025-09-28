import { create } from "zustand"
import { persist } from "zustand/middleware";
import { sendKafkaEvent } from "../actions/track-user";
// import { sendKafkaEvent } from "../actions/track-user";

type Product = {
    id: string;
    title: string;
    price: number;
    image: string;
    quantity?: number;
    shopId: string;
}

type Store = {
    cart: Product[];
    wishList: Product[];
    addToCart: (
        product: Product,
        user: any,
        location: any,
        deviceInfo: string
    ) => void;
    removeFromCart: (
        id: string,
        user: any,
        location: any,
        deviceInfo: string
    ) => void;
    addToWishList: (
        product: Product,
        user: any,
        location: any,
        deviceInfo: string
    ) => void;
    removeFromWishList: (
        id: string,
        user: any,
        location: any,
        deviceInfo: string
    ) => void;
}

export const useStore = create<Store>()(
    persist(
        (set, get) => ({
            cart: [],
            wishList: [],
            addToCart: (product, user, location, deviceInfo) => {
    

                set((state) => {
                    if (state.cart.find((item: any) => item.id === product.id))
                        return state;
                    return { cart: [...state.cart, product] }
                })

                if (user?.id && location && deviceInfo) {
              
                    sendKafkaEvent({
                        userId: user?.id,
                        productId: product?.id,

                        shopId: product.shopId,
                        action: "add_to_cart",
                        country: location?.country || "Unknown",
                        city: location?.city || "Unknown",
                        device: deviceInfo || "Unknown Device"
                    })
                } else {
                   
                }
            },
            removeFromCart: (id, user, location, deviceInfo) => {
            
                const removeProduct = get().cart.find((item: any) => item.id === id)
              
                set((state) => ({
                    cart: state.cart?.filter((item: any) => item.id !== id)
                }))

                if (user?.id && location && deviceInfo) {
              
                    sendKafkaEvent({
                        userId: user?.id,
                        productId: removeProduct?.id,
                        shopId: removeProduct?.shopId,
                        action: "remove_from_cart",
                        country: location?.country || "Unknown",
                        city: location?.city || "Unknown",
                        device: deviceInfo || "Unknown Device"
                    })
                }
            },
            addToWishList: (product, user, location, deviceInfo) => {
                set((state) => {
                    if (state.wishList.find((item: any) => item.id === product.id))
                        return state;
                    return { wishList: [...state.wishList, product] }
                })
         

                if (user?.id && location && deviceInfo) {
               
                    sendKafkaEvent({
                        userId: user?.id,
                        productId: product?.id,
                        shopId: product?.shopId,
                        action: "add_to_wishlist",
                        country: location?.country || "Unknown",
                        city: location?.city || "Unknown",
                        device: deviceInfo || "Unknown Device"
                    })
                } else {
       
                }
            },
            removeFromWishList: async (id, user, location, deviceInfo) => {
          
                const state = get();
                const removeProduct = state.wishList.find((item: any) => item.id === id);

                set({
                    wishList: state.wishList.filter((item: any) => item.id !== id),
                });

                if (user?.id && location && deviceInfo) {

                    await sendKafkaEvent({
                        userId: user?.id,
                        productId: removeProduct?.id,
                        shopId: removeProduct?.shopId,
                        action: "remove_from_wishlist",
                        country: location?.country || "Unknown",
                        city: location?.city || "Unknown",
                        device: deviceInfo || "Unknown Device"
                    })
                } else {
           
                }
            }
        }),
        { name: "store-storage" }
    )
)

