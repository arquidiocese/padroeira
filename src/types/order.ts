export interface DefaultIngredient {
  id: number;
  ingredient_name: string;
}

export interface ItemType {
  id: number;
  name: string;
  station_id: number | null;
  default_ingredients: DefaultIngredient[];
}

export interface IngredientModification {
  ingredientName: string;
  modificationType: 'included' | 'added' | 'removed';
}

export interface OrderItem {
  uid: string; // unique client-side identifier
  itemTypeId: number;
  itemTypeName: string;
  modifications: IngredientModification[];
}

export interface CreateOrderPayload {
  items: {
    itemTypeId: number;
    modifications: {
      ingredientName: string;
      modificationType: string;
    }[];
  }[];
}

export interface OrderResponse {
  id: number;
  order_number: number;
  status: string;
  created_at: string;
  printErrors?: string[];
}
