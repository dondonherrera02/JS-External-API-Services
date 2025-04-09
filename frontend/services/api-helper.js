/**
* @name: Assignment 2: Utilizing External API Services
* @Course Code: SODV1201
* @class: Software Development Diploma program.
* @author: Dondon Herrera
*/

// This API Service is a reusable component to handle GET requests.
class APIHelperService {
    // GET
    async get(url) {
        try {
            const response = await fetch(url, {
                method: 'GET'
            });
    
            if (!response.ok) {
                const errorBody = await response.json();
                const errorMessage = errorBody.message || "Unknown error";
                console.error("Response Error Message:", errorMessage);
                throw errorMessage;
            }
    
            return await response.json();
        } catch (error) {
            console.error("API request error:", error);
            throw error;
        }
    }
};

// export the service
export const APIService = new APIHelperService();
