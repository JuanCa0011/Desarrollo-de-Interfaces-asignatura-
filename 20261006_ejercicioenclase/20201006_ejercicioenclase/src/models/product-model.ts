export interface Product {
id: number;
title: string;
description: string;
category: string;
price: number;
discountPercentage: number;
rating: number;
stock: number;
brand: string;
thumbnail: string;
}
export interface ProductsResponse {
products: Product[];
total: number;
skip: number;
limit: number;
}

export interface StoreProduct {
  userId: number;
  id: number;
  title: string;
  body: string;
}
