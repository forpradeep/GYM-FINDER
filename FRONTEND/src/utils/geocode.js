const OPENCAGE_API_KEY = import.meta.env.VITE_OPENCAGE_API_KEY

export const geocodeAddress = async (address) => {
    try {
        const response = await fetch(
            `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(address)}&key=${OPENCAGE_API_KEY}&limit=1&countrycode=in`
        )
        const data = await response.json()
        if (data.results.length === 0) throw new Error('Address not found')
        const { lat, lng } = data.results[0].geometry
        return { lat, lng }
    } catch (err) {
        throw new Error('Failed to geocode address')
    }
}

export const getAddressSuggestions = async (query) => {
    try {
        const response = await fetch(
            `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(query)}&key=${OPENCAGE_API_KEY}&limit=5&countrycode=in`
        )
        const data = await response.json()
        return data.results.map(r => ({
            label: r.formatted,
            lat: r.geometry.lat,
            lng: r.geometry.lng
        }))
    } catch (err) {
        return []
    }
}