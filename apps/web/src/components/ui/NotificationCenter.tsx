import { useEffect } from "react";
import { X } from 'lucide-react'
import { useNotification } from "../../hooks/useNotification";
import type { NotificationItem } from "../../hooks/useNotification";

interface NotificationToastProps {
	notification: NotificationItem;
	onRemove: (id: string) => void;
}

function notificationClasses(type: NotificationItem["type"]) {
	if (type === "success") {
		return "border-green-300 bg-green-50 text-green-900";
	}

	if (type === "error") {
		return "border-red-300 bg-red-50 text-red-900";
	}

	return "border-blue-300 bg-blue-50 text-blue-900";
}

function NotificationToast({ notification, onRemove }: NotificationToastProps) {
	useEffect(() => {
		const timeout = window.setTimeout(() => {
			onRemove(notification.id);
		}, 4500);

		return () => window.clearTimeout(timeout);
	}, [notification.id, onRemove]);

	return (
		<div
			className={`w-full rounded border px-4 py-3 ${notificationClasses(notification.type)}`}
			role="status"
		>
			<div className="flex items-start justify-between gap-3">
				<div>
					{notification.title ? (
						<p className="text-sm font-semibold">{notification.title}</p>
					) : null}
					<p className="text-sm">{notification.message}</p>
				</div>
				<button
					type="button"
					onClick={() => onRemove(notification.id)}
					className="text-xs font-medium opacity-80 hover:opacity-100"
				>
					<X />
				</button>
			</div>
		</div>
	);
}

export function NotificationCenter() {
	const { notifications, remove } = useNotification();

	if (notifications.length === 0) {
		return null;
	}

	return (
		<div className="pointer-events-none fixed right-4 bottom-4 z-50 flex w-full max-w-sm flex-col gap-2">
			{notifications.map((notification) => (
				<div key={notification.id} className="pointer-events-auto">
					<NotificationToast notification={notification} onRemove={remove} />
				</div>
			))}
		</div>
	);
}
