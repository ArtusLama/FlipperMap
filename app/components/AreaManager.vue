<template>
    <!-- Area polygons rendered on the map -->
    <!-- Each area is a closed polygon with outline only -->
    <LPolygon
        v-for="area in areas"
        :key="area.id"
        :lat-lngs="(area.vertices as any)"
        :fill="false"
        :color="'#ffffff'"
        :weight="2"
        :opacity="0.8"
        :interactive="false"
    />
</template>

<script setup lang="ts">
import { LatLng } from "leaflet"

// Area polygons - subdividing the main region into 4 areas
// Each area has 8 vertices forming a rounded shape

// Northeast area (circular with 8 points)
const areaOne: LatLng[] = [
    new LatLng(50.83, 13.565),
    new LatLng(50.835, 13.60),
    new LatLng(50.83, 13.635),
    new LatLng(50.795, 13.64),
    new LatLng(50.76, 13.635),
    new LatLng(50.755, 13.60),
    new LatLng(50.76, 13.565),
    new LatLng(50.795, 13.56),
    new LatLng(50.83, 13.565),
]

// Northwest area (circular with 8 points)
const areaTwo: LatLng[] = [
    new LatLng(50.83, 13.46),
    new LatLng(50.835, 13.495),
    new LatLng(50.83, 13.53),
    new LatLng(50.795, 13.54),
    new LatLng(50.76, 13.53),
    new LatLng(50.755, 13.495),
    new LatLng(50.76, 13.46),
    new LatLng(50.795, 13.45),
    new LatLng(50.83, 13.46),
]

// Southeast area (circular with 8 points)
const areaThree: LatLng[] = [
    new LatLng(50.725, 13.565),
    new LatLng(50.73, 13.60),
    new LatLng(50.725, 13.635),
    new LatLng(50.69, 13.64),
    new LatLng(50.655, 13.635),
    new LatLng(50.65, 13.60),
    new LatLng(50.655, 13.565),
    new LatLng(50.69, 13.56),
    new LatLng(50.725, 13.565),
]

// Southwest area (circular with 8 points)
const areaFour: LatLng[] = [
    new LatLng(50.725, 13.46),
    new LatLng(50.73, 13.495),
    new LatLng(50.725, 13.53),
    new LatLng(50.69, 13.54),
    new LatLng(50.655, 13.53),
    new LatLng(50.65, 13.495),
    new LatLng(50.655, 13.46),
    new LatLng(50.69, 13.45),
    new LatLng(50.725, 13.46),
]

// Area metadata for management
const areas = [
    { id: 1, name: "Northeast", vertices: areaOne },
    { id: 2, name: "Northwest", vertices: areaTwo },
    { id: 3, name: "Southeast", vertices: areaThree },
    { id: 4, name: "Southwest", vertices: areaFour },
]
</script>
