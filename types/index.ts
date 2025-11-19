export type LocationType = "Pflegeheim" | "Krankenhaus" | "Rettungswache" | "Arztpraxis"

export interface Coordinate {
    id: string
    lat: number
    lng: number
    color: string
    name?: string
    locationType?: LocationType
    notes?: string
    images?: string[]
    createdAt: number
}
