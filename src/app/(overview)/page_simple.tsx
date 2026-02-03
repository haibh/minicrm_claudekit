import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export default async function DashboardPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        return <div>No session</div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600 mt-2">
                    Welcome back, {session.user.name}!
                </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
                <p>Dashboard is working!</p>
            </div>
        </div>
    );
}
