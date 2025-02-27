import { useState, useEffect } from "react";
import { DatasetItem } from "@/types";

/**
 * Custom hook for persisting dataset in localStorage without imageUrl
 * This prevents exceeding localStorage size limits with large base64 images
 * @param key The localStorage key
 * @param initialValue The initial value if nothing exists in localStorage
 * @returns A stateful value and a function to update it
 */
export function useDatasetStorage(
    key: string,
    initialValue: DatasetItem[]
): [DatasetItem[], (value: DatasetItem[] | ((val: DatasetItem[]) => DatasetItem[])) => void] {
    // State to store our value
    const [storedValue, setStoredValue] = useState<DatasetItem[]>(initialValue);

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
    // persists the new value to localStorage without imageUrl
    const setValue = (value: DatasetItem[] | ((val: DatasetItem[]) => DatasetItem[])) => {
        try {
            // Allow value to be a function so we have the same API as useState
            const valueToStore =
                value instanceof Function ? value(storedValue) : value;

            // Save state with full data including imageUrl
            setStoredValue(valueToStore);

            // Save to localStorage without imageUrl
            localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            console.error(`Error setting localStorage key "${key}":`, error);
        }
    };

    return [storedValue, setValue];
}