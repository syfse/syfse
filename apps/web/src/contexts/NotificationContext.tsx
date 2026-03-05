import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import { notificationService } from "../lib/notificationService";

export type NotificationType = "success" | "error" | "info";

export interface NotificationItem {
	id: string;
	type: NotificationType;
	title?: string;
	message: string;
	createdAt: number;
}

export interface NotifyInput {
	message: string;
	title?: string;
	type?: NotificationType;
}

export interface NotificationContextValue {
	notifications: NotificationItem[];
	notify: (input: NotifyInput) => string;
	success: (message: string, title?: string) => string;
	error: (message: string, title?: string) => string;
	info: (message: string, title?: string) => string;
	remove: (id: string) => void;
	clear: () => void;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(
	undefined,
);

function createNotificationId() {
	if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
		return crypto.randomUUID();
	}

	return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function NotificationProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const [notifications, setNotifications] = useState<NotificationItem[]>([]);

	const remove = useCallback((id: string) => {
		setNotifications((current) => current.filter((item) => item.id !== id));
	}, []);

	const clear = useCallback(() => {
		setNotifications([]);
	}, []);

	const notify = useCallback((input: NotifyInput) => {
		const id = createNotificationId();
		const nextNotification: NotificationItem = {
			id,
			type: input.type ?? "info",
			title: input.title,
			message: input.message,
			createdAt: Date.now(),
		};

		setNotifications((current) => [nextNotification, ...current]);
		return id;
	}, []);

	useEffect(() => {
		const unsubscribe = notificationService.subscribe((input) => {
			notify(input);
		});

		return unsubscribe;
	}, [notify]);

	const success = useCallback(
		(message: string, title?: string) => notify({ type: "success", message, title }),
		[notify],
	);

	const error = useCallback(
		(message: string, title?: string) => notify({ type: "error", message, title }),
		[notify],
	);

	const info = useCallback(
		(message: string, title?: string) => notify({ type: "info", message, title }),
		[notify],
	);

	const value: NotificationContextValue = useMemo(
		() => ({
			notifications,
			notify,
			success,
			error,
			info,
			remove,
			clear,
		}),
		[notifications, notify, success, error, info, remove, clear],
	);

	return (
		<NotificationContext.Provider value={value}>
			{children}
		</NotificationContext.Provider>
	);
}

// eslint-disable-next-line react-refresh/only-export-components
export function useNotification(): NotificationContextValue {
	const context = useContext(NotificationContext);
	if (context === undefined) {
		throw new Error("useNotification must be used within a NotificationProvider");
	}

	return context;
}
