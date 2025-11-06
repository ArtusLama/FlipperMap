import { useStorage } from "@vueuse/core"
import { z } from "zod"

const CoordinateSchema = z.object({
    id: z.string(),
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
    name: z.string().optional(),
    color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid hex color"),
    createdAt: z.number(),
})

export type Coordinate = z.infer<typeof CoordinateSchema>

const STORAGE_KEY = "flippermap_coordinates"

export default function useCoordinates() {
    const coordinates = useStorage<Coordinate[]>(STORAGE_KEY, [])

    // Add a new coordinate
    const addCoordinate = (lat: number, lng: number, name?: string, color?: string) => {
        const newCoordinate = CoordinateSchema.parse({
            id: `coord_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            lat,
            lng,
            name: name || `Location ${coordinates.value.length + 1}`,
            color: color || "#3B82F6",
            createdAt: Date.now(),
        })

        coordinates.value.push(newCoordinate)
        return newCoordinate
    }

    // Remove a coordinate by id
    const removeCoordinate = (id: string) => {
        const index = coordinates.value.findIndex(c => c.id === id)
        if (index !== -1) {
            coordinates.value.splice(index, 1)
        }
    }

    // Clear all coordinates
    const clearAll = () => {
        coordinates.value = []
    }

    // Get all coordinates
    const getAll = () => coordinates.value

    // Update a coordinate
    const updateCoordinate = (id: string, updates: Partial<Omit<Coordinate, "id" | "createdAt">>) => {
        const coordinate = coordinates.value.find(c => c.id === id)
        if (coordinate) {
            const updated = CoordinateSchema.parse({
                ...coordinate,
                ...(updates.lat !== undefined && { lat: updates.lat }),
                ...(updates.lng !== undefined && { lng: updates.lng }),
                ...(updates.name !== undefined && { name: updates.name }),
                ...(updates.color !== undefined && { color: updates.color }),
            })
            Object.assign(coordinate, updated)
        }
    }

    return {
        coordinates,
        addCoordinate,
        removeCoordinate,
        clearAll,
        getAll,
        updateCoordinate,
    }
}
