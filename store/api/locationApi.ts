import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

// Define types for location requests and responses
interface Location {
  _id: string
  name: string
  type: 'country' | 'province' | 'city' | 'landmark'
  parent?: string | null
  shippingPrice?: number
  path?: string
  children?: Location[]
}

interface LocationTreeResponse {
  locations: Location[]
}

interface LocationsByParentResponse {
  locations: Location[]
}

interface LocationsByTypeQuery {
  type: 'country' | 'province' | 'city' | 'landmark'
  parent?: string
}

interface CreateLocationRequest {
  name: string
  type: 'country' | 'province' | 'city' | 'landmark'
  parent?: string
  shippingPrice?: number
}

interface UpdateLocationRequest {
  name?: string
  shippingPrice?: number
}

const locationApi = createApi({
  reducerPath: 'locationApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/',
    prepareHeaders: (headers) => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }
      headers.set('content-type', 'application/json')
      return headers
    },
  }),
  tagTypes: ['Location'],
  endpoints: (builder) => ({
    // Get complete location tree (hierarchical structure)
    getLocationTree: builder.query<Location[], void>({
      query: () => 'admin/locations/tree',
      providesTags: ['Location'],
    }),

    // Get locations by parent ID (for cascading dropdowns)
    getLocationsByParent: builder.query<Location[], string | null>({
      query: (parentId) => ({
        url: 'locations',
        params: { parent: parentId || '' },
      }),
      transformResponse: (response: { locations: Location[] }) => response.locations,
      providesTags: ['Location'],
    }),

    // Get locations by type (countries, provinces, cities, landmarks)
    getLocationsByType: builder.query<Location[], LocationsByTypeQuery>({
      query: ({ type, parent }) => ({
        url: 'locations/by-type',
        params: { type, parent },
      }),
      providesTags: ['Location'],
    }),

    // Get all countries
    getCountries: builder.query<Location[], void>({
      query: () => 'locations/countries',
      providesTags: ['Location'],
    }),

    // Get provinces by country
    getProvincesByCountry: builder.query<Location[], string>({
      query: (countryId) => `locations/provinces/${countryId}`,
      providesTags: ['Location'],
    }),

    // Get cities by province
    getCitiesByProvince: builder.query<Location[], string>({
      query: (provinceId) => `locations/cities/${provinceId}`,
      providesTags: ['Location'],
    }),

    // Get landmarks by city
    getLandmarksByCity: builder.query<Location[], string>({
      query: (cityId) => `locations/landmarks/${cityId}`,
      providesTags: ['Location'],
    }),

    // Get location by ID
    getLocationById: builder.query<Location, string>({
      query: (id) => `locations/${id}`,
      providesTags: (result, error, id) => [{ type: 'Location', id }],
    }),

    // Create new location (admin only)
    createLocation: builder.mutation<{ message: string; locationId: string }, CreateLocationRequest>({
      query: (locationData) => ({
        url: 'admin/locations',
        method: 'POST',
        body: locationData,
      }),
      invalidatesTags: ['Location'],
    }),

    // Update location (admin only)
    updateLocation: builder.mutation<{ message: string }, { id: string; data: UpdateLocationRequest }>({
      query: ({ id, data }) => ({
        url: `admin/locations/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Location'],
    }),

    // Delete location (admin only)
    deleteLocation: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `admin/locations/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Location'],
    }),

    // Export locations to Excel (admin only)
    exportLocations: builder.mutation<Blob, void>({
      query: () => ({
        url: 'admin/locations/export',
        method: 'GET',
        responseHandler: (response) => response.blob(),
      }),
    }),

    // Import locations from Excel (admin only)
    importLocations: builder.mutation<{ message: string; imported: number }, FormData>({
      query: (formData) => ({
        url: 'admin/locations/import',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Location'],
    }),
  }),
})

// Export the API slice
export { locationApi }

// Export hooks for usage in functional components
export const {
  useGetLocationTreeQuery,
  useGetLocationsByParentQuery,
  useGetLocationsByTypeQuery,
  useGetCountriesQuery,
  useGetProvincesByCountryQuery,
  useGetCitiesByProvinceQuery,
  useGetLandmarksByCityQuery,
  useGetLocationByIdQuery,
  useCreateLocationMutation,
  useUpdateLocationMutation,
  useDeleteLocationMutation,
  useExportLocationsMutation,
  useImportLocationsMutation,
} = locationApi

// Export types
export type {
  Location,
  LocationTreeResponse,
  LocationsByParentResponse,
  LocationsByTypeQuery,
  CreateLocationRequest,
  UpdateLocationRequest,
}