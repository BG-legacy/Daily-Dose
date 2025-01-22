import { api } from '@/services/api';

// Example usage in a component
const handleAddThought = async (thought) => {
    try {
        const response = await api.journal.add(thought);
        // Handle success
    } catch (error) {
        // Handle error
    }
}; 