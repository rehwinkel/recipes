interface Recipe {
    id: string,
    title: string,
    description: string,
    rating: number,
    image?: string,
    time?: number,
    cost?: number,
    ingredients: string[]
}

export type {Recipe};