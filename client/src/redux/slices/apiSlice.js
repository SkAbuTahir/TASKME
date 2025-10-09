import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseUrl = 'http://localhost:8800/api';

const baseQuery = fetchBaseQuery({
  baseUrl,
  credentials: 'include',
  prepareHeaders: (headers, { endpoint, extra }) => {
    // Always set Content-Type for all requests
    if (!headers.get('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
    
    // Set default Accept header
    headers.set('Accept', 'application/json');
    
    // Set cache control for GET requests
    if (endpoint && endpoint.method === 'GET') {
      headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      headers.set('Pragma', 'no-cache');
      headers.set('Expires', '0');
    }
    
    return headers;
  },
});

// Enhanced error handling for API requests
const baseQueryWithReauth = async (args, api, extraOptions) => {
  console.log('API Request:', { url: args.url, method: args.method, body: args.body });
  
  let result;
  try {
    result = await baseQuery(args, api, extraOptions);
    
    if (result.meta?.response) {
      console.log('API Response:', { 
        url: args.url, 
        status: result.meta.response.status,
        statusText: result.meta.response.statusText
      });
    }
    
    if (result?.error) {
      console.error('API Error:', {
        status: result.error.status,
        data: result.error.data,
        message: result.error.data?.message || 'An error occurred'
      });
      
      // Handle 401 Unauthorized
      if (result.error.status === 401) {
        console.error('Authentication error - please log in again');
      }
    }
    
    return result;
  } catch (error) {
    console.error('API Request Failed:', {
      url: args.url,
      error: error,
      message: error.message
    });
    return {
      error: {
        status: 'FETCH_ERROR',
        data: error,
        message: error.message
      }
    };
  }
};

// Create the API slice
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['User', 'Task'],
  endpoints: (builder) => ({
    // Dummy endpoint to prevent the inject.endpoints error
    getDummy: builder.query({
      query: () => '/dummy',
    }),
  }),
  refetchOnReconnect: true,
  refetchOnFocus: false,
});

export const { useGetDummyQuery } = apiSlice;