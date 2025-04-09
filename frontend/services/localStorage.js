/**
* @name: Assignment 2: Utilizing External API Services
* @Course Code: SODV1201
* @class: Software Development Diploma program.
* @author: Dondon Herrera
*/

class LocalStorageHelperService {

    // save to local Storage
    saveToLocalStorage(objectName, data, isJSON = false) {
        if (isJSON) {
            localStorage.setItem(objectName, JSON.stringify(data));
        } else {
            localStorage.setItem(objectName, data);
        }
    }

    // GET one data from local storage
    getOne(objectName) {
        try {
            // ensure it defaults to null
            const data = JSON.parse(localStorage.getItem(objectName)) || null;
            return data;
        } catch (error) {
            console.error(`Error: GET ${objectName} - JSON parse: `, error);
            return null;
        }
    }
}

// export the service
export const LocalStorageService = new LocalStorageHelperService();