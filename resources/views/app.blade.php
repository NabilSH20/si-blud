<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title inertia>{{ config('app.name', 'Laravel') }}</title>

        <!-- Favicon / Brand Icon -->
        <link rel="icon" type="image/x-icon" href="{{ asset('favicon.ico') }}">
        <link rel="icon" type="image/png" sizes="32x32" href="{{ asset('favicon-32x32.png') }}">
        <link rel="icon" type="image/png" sizes="16x16" href="{{ asset('favicon-16x16.png') }}">
        <link rel="apple-touch-icon" sizes="180x180" href="{{ asset('apple-touch-icon.png') }}">

        <!-- Local Fonts Preload -->
        <link rel="preload" href="/fonts/Poppins-Regular.ttf" as="font" type="font/ttf" crossorigin>
        <link rel="preload" href="/fonts/Poppins-SemiBold.ttf" as="font" type="font/ttf" crossorigin>
        <link rel="preload" href="/fonts/Poppins-Bold.ttf" as="font" type="font/ttf" crossorigin>
        <link rel="preload" href="/fonts/Barlow-Regular.ttf" as="font" type="font/ttf" crossorigin>

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased bg-gradient-to-br from-slate-100 via-slate-50 to-emerald-50/50 bg-fixed text-slate-800 min-h-screen">
        @inertia
    </body>
</html>
