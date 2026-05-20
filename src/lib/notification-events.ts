type Listener = () => void;

const listeners = new Set<Listener>();

export const notificationEvents = {
    subscribe(callback: Listener) {
        listeners.add(callback);
        return () => listeners.delete(callback);
    },
    notify() {
        listeners.forEach((callback) => callback());
    },
};
