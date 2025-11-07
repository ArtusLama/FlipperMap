import { defineStore } from "pinia"
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

export const useCoordinatesStore = defineStore("coordinates", () => {
    const coordinates = useStorage<Coordinate[]>("flippermap_coordinates", [])

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

    // Export coordinates as JSON
    const exportCoordinates = () => {
        return JSON.stringify(coordinates.value, null, 2)
    }

    // Import coordinates
    const importCoordinates = (jsonData: string, mode: "replace" | "add" = "replace") => {
        try {
            const parsed = JSON.parse(jsonData)
            const data = Array.isArray(parsed) ? parsed : [parsed]

            // Validate each coordinate
            const validated = data.map(item => CoordinateSchema.parse(item))

            if (mode === "replace") {
                coordinates.value = validated
            } else if (mode === "add") {
                coordinates.value.push(...validated)
            }

            return { success: true, count: validated.length }
        } catch (error) {
            let message = "Unknown error"
            if (error instanceof z.ZodError) {
                message = `Validation error: ${error.issues.map((e: z.ZodIssue) => `${e.path.join(".")} - ${e.message}`).join(", ")}`
            } else if (error instanceof SyntaxError) {
                message = "Invalid JSON format"
            }
            return { success: false, error: message }
        }
    }

    return {
        coordinates,
        addCoordinate,
        removeCoordinate,
        clearAll,
        updateCoordinate,
        exportCoordinates,
        importCoordinates,
    }
})
