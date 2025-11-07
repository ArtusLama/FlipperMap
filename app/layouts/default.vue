<template>
    <UiSidebarProvider>
        <div class="min-h-screen flex flex-col w-full">
            <NavigationBar />
            <main class="flex-1 px-16 py-16 mt-16 h-[calc(100vh-4rem)]">
                <slot />
            </main>
        </div>
    </UiSidebarProvider>
</template>
