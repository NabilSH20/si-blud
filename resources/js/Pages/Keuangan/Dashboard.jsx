import { Link } from '@inertiajs/react';

export default function Dashboard() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gray-100">
            <h1 className="text-2xl font-semibold text-gray-900">
                Welcome Keuangan
            </h1>
            <Link
                href={route('logout')}
                method="post"
                as="button"
                className="inline-flex items-center rounded-md border border-transparent bg-gray-800 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
                Logout
            </Link>
        </div>
    );
}