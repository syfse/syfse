export type NotificationType = "success" | "error" | "info";

export interface NotifyInput {
	message: string;
	title?: string;
	type?: NotificationType;
}

type NotificationListener = (notification: NotifyInput) => void;

class NotificationService {
	private listeners = new Set<NotificationListener>();

	subscribe(listener: NotificationListener) {
		this.listeners.add(listener);

		return () => {
			this.listeners.delete(listener);
		};
	}

	notify(input: NotifyInput) {
		for (const listener of this.listeners) {
			listener(input);
		}
	}

	success(message: string, title?: string) {
		this.notify({ type: "success", message, title });
	}

	error(message: string, title?: string) {
		this.notify({ type: "error", message, title });
	}

	info(message: string, title?: string) {
		this.notify({ type: "info", message, title });
	}
}

export const notificationService = new NotificationService();
