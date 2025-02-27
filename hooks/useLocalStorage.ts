import { useState, useEffect } from "react";

/**
 * Custom hook for persisting state in localStorage
 * @param key The localStorage key
 * @param initialValue The initial value if nothing exists in localStorage
 * @returns A stateful value and a function to update it
 */
export function useLocalStorage<T>(
    key: string,
    initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
    // State to store our value
    const [storedValue, setStoredValue] = useState<T>(initialValue);

    // Initialize state on first render
    useEffect(() => {
        try {
            const item = localStorage.getItem(key);
            if (item) {
                setStoredValue(JSON.parse(item));
            }
        } catch (error) {
            console.error(`Error reading localStorage key "${key}":`, error);
        }
    }, [key]);

    // Return a wrapped version of useState's setter function that
    // persists the new value to localStorage
    const setValue = (value: T | ((val: T) => T)) => {
        try {
            // Allow value to be a function so we have the same API as useState
            const valueToStore =
                value instanceof Function ? value(storedValue) : value;

            // Save state
            setStoredValue(valueToStore);

            // Save to localStorage
            localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            console.error(`Error setting localStorage key "${key}":`, error);
        }
    };

    return [storedValue, setValue];
}
