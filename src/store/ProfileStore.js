import { create } from 'zustand';
import callApi from "../util/apiCaller";

const useProfileStore = create((set) => ({
    data: { user: { profile: {} } }, 
    errors: [],

    getProfileRequest: () => {
        callApi(``).then(res => {
            set({data: res})
        })
    }
}))

export default useProfileStore;