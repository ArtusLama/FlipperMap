<template>
    <div class="h-full flex gap-4 p-4">
        <!-- Left Panel: Inputs and List -->
        <div class="w-80 flex flex-col gap-16 overflow-y-auto">
            <CoordinateInput />
            <CoordinatesList />
        </div>

        <!-- Right Panel: Map -->
        <div class="flex-1">
            <MapWrapper class="h-250 w-full" />
        </div>
    </div>
</template>
