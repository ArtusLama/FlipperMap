/* eslint-disable @typescript-eslint/no-explicit-any */
import { LatLng } from "leaflet"
import { useCoordinatesStore } from "~/stores/coordinates"
import { useSubAreasStore } from "~/stores/subAreas"

export type ImportMode = "replace" | "add"

function serializePoint(p: LatLng) {
    return { lat: p.lat, lng: p.lng }
}

function deserializePoint(o: { lat: number, lng: number }) {
    return new LatLng(o.lat, o.lng)
}

type SerializedPoint = { lat: number, lng: number }
type SerializedMainArea = { areaPoints: SerializedPoint[] }
type SerializedSubArea = { id: string, name: string, color?: string, isEditing?: boolean, points?: SerializedPoint[] }

export function useDataManager() {
    const coordinates = useCoordinatesStore()
    const subAreas = useSubAreasStore()
    const mainArea = useAreaEditorStore()

    const exportAll = () => {
        const mainPoints = mainArea.areaPoints || []
        const main = {
            areaPoints: mainPoints.map((p: LatLng) => serializePoint(p)),
        }

        const areas = (subAreas.areas || []).map((a: any) => ({
            id: a.id,
            name: a.name,
            color: a.color,
            isEditing: !!a.isEditing,
            points: (a.points || []).map((p: LatLng) => serializePoint(p)),
        }))

        const locs = coordinates.coordinates || []

        return JSON.stringify({ mainArea: main, subAreas: areas, locations: locs }, null, 2)
    }

    const downloadJson = (json: string, filename = "flipper-map-all-backup.json") => {
        const blob = new Blob([json], { type: "application/json" })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
    }

    const importAll = (jsonData: string, mode: ImportMode = "replace") => {
        try {
            const parsed = JSON.parse(jsonData) as { mainArea?: SerializedMainArea, subAreas?: SerializedSubArea[], locations?: unknown }

            // Main area
            if (parsed.mainArea?.areaPoints) {
                const points = parsed.mainArea.areaPoints.map((p: SerializedPoint) => deserializePoint(p))
                if (mode === "replace") {
                    mainArea.areaPoints = points
                } else {
                    mainArea.areaPoints = [...(mainArea.areaPoints || []), ...points]
                }
            }

            // Sub areas
            if (Array.isArray(parsed.subAreas)) {
                const areas = parsed.subAreas.map((a: SerializedSubArea) => ({
                    id: a.id,
                    name: a.name,
                    color: a.color ?? "#3B82F6",
                    isEditing: !!a.isEditing,
                    points: (a.points || []).map((p: SerializedPoint) => deserializePoint(p)),
                }))

                if (mode === "replace") {
                    subAreas.areas = areas
                } else {
                    subAreas.areas = [...(subAreas.areas || []), ...areas]
                }
            }

            // Locations - reuse coordinates store importer
            if (parsed.locations) {
                const payload = JSON.stringify(parsed.locations)
                const locMode: "replace" | "add" = mode === "replace" ? "replace" : "add"
                const result = coordinates.importCoordinates(payload, locMode)
                return { success: result.success, imported: result.count }
            }

            return { success: true }
        } catch (err: any) {
            return { success: false, error: err?.message || String(err) }
        }
    }

    return {
        exportAll,
        downloadJson,
        importAll,
    }
}

export default useDataManager
